# -*- coding: utf-8 -*-
"""Lager ds-no/husbanken-farger.css: Designsystemets fargevariabler, men med
Husbankens palett.

Metoden er å beholde systemets struktur og bytte kuløren. For hvert av de 16
trinnene leser vi hvor lyst Digdir har lagt det, og finner Husbanken-fargen som
ligger på samme lyshet. Treffer en av Husbankens egne farger, brukes den
uendret. Gjør den ikke det, lager vi en i samme kulør på riktig lyshet.

Da beholder komponentene kontrastforholdene de er tegnet for, samtidig som
fargene på skjermen er Husbankens.

Kjøres ved behov:  python3 verktoy/lag-hb-tema.py
"""
import re, io, math, collections

TEMA = 'ds-no/designsystemet-tema.css'
UT   = 'ds-no/husbanken-farger.css'

# ── Husbankens palett, lest ut av ds/colors_and_type.css ──────────────
def les_palett():
    s = io.open('ds/colors_and_type.css', encoding='utf-8').read()
    p = collections.defaultdict(dict)
    for m in re.finditer(r'--hb-([a-z]+)-(\d+):\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)', s):
        kulor, trinn, r, g, b = m.group(1), int(m.group(2)), *map(int, m.groups()[2:])
        p[kulor][trinn] = (r, g, b)
    return p

# ── farge­matematikk: sRGB <-> OKLab (Ottosson) ────────────────────────
def lin(c):  return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def ulin(c): return c*12.92 if c <= 0.0031308 else 1.055*c**(1/2.4)-0.055

def rgb_oklab(rgb):
    r, g, b = (lin(v/255) for v in rgb)
    l = (0.4122214708*r + 0.5363325363*g + 0.0514459929*b)**(1/3)
    m = (0.2119034982*r + 0.6806995451*g + 0.1073969566*b)**(1/3)
    s = (0.0883024619*r + 0.2817188376*g + 0.6299787005*b)**(1/3)
    return (0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s)

def oklab_rgb(lab):
    L, a, b = lab
    l = (L + 0.3963377774*a + 0.2158037573*b)**3
    m = (L - 0.1055613458*a - 0.0638541728*b)**3
    s = (L - 0.0894841775*a - 1.2914855480*b)**3
    r = +4.0767416621*l - 3.3077115913*m + 0.2309699292*s
    g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s
    bb = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s
    return tuple(max(0, min(255, round(ulin(max(0, min(1, v)))*255))) for v in (r, g, bb))

def lch(rgb):
    L, a, b = rgb_oklab(rgb)
    return L, math.hypot(a, b), math.atan2(b, a)

def fra_lch(L, C, h):
    return oklab_rgb((L, C*math.cos(h), C*math.sin(h)))

hexs  = lambda rgb: '#%02x%02x%02x' % rgb
avhex = lambda s: tuple(int(s[i:i+2], 16) for i in (1, 3, 5)) if len(s) == 7 \
                  else tuple(int(c*2, 16) for c in s[1:4])

# ── hvilken Husbanken-kulør hver familie får ──────────────────────────
# accent styrer knapper, lenker, fokus og valgt tilstand. Blå, som resten
# av prototypen. Grønn er merkefargen og ligger på brand1.
FAMILIE = {
    'accent':  'blue',
    'brand1':  'green',
    'brand2':  'purple',
    'neutral': 'slate',
    'info':    'blue',
    'success': 'green',
    'danger':  'red',
    'warning': None,    # Husbanken har ingen gul. Digdirs beholdes.
}

# Trinn der Husbanken selv har sagt hva fargen skal være. De settes
# uansett hva lyshetssøket ellers ville funnet.
FAST = {
    ('accent',  'base-default'): ('blue',  800),   # --action-primary
    ('accent',  'base-hover'):   ('blue',  500),   # --action-primary-hover
    ('accent',  'text-subtle'):  ('blue',  600),   # --fg-link
    ('accent',  'surface-tinted'): ('blue', 100),
    ('neutral', 'text-default'): ('slate', 700),   # --fg-default
    ('neutral', 'text-subtle'):  ('slate', 500),   # --fg-subtle
    ('neutral', 'background-tinted'): ('slate', 50),   # --bg-subtle
    ('brand1',  'surface-tinted'):    ('green', 100),  # --bg-callout
    ('danger',  'base-default'): ('red',   700),   # --fg-destructive
    ('danger',  'base-hover'):   ('red',   800),
}

TOLERANSE = 0.045   # hvor nær i lyshet en Husbanken-farge må ligge

def bygg():
    palett = les_palett()
    tema = io.open(TEMA, encoding='utf-8').read()
    m = re.search(r':root,\[data-color-scheme=light\]\{([^{}]*)\}', tema)
    par = re.findall(r'--ds-color-([a-z0-9]+)-([a-z-]+):([^;}]+)', m.group(1))

    # samle trinnene per familie først, så fordelingen kan ses under ett
    per_fam = collections.OrderedDict()
    for fam, trinn, verdi in par:
        if fam != 'focus' and FAMILIE.get(fam):
            per_fam.setdefault(fam, []).append((trinn, verdi.strip()))

    grupper, notater = collections.OrderedDict(), []
    for fam, trinnliste in per_fam.items():
        kulor = FAMILIE[fam]
        ramp = palett[kulor]
        satt = {}

        # 1. trinn Husbanken selv har bestemt
        for trinn, _ in trinnliste:
            if (fam, trinn) in FAST:
                k, t = FAST[(fam, trinn)]
                satt[trinn] = (hexs(palett[k][t]), f'hb-{k}-{t}, fast')

        # 2. hvitt er hvitt
        for trinn, verdi in trinnliste:
            if trinn not in satt and verdi in ('#fff', '#ffffff'):
                satt[trinn] = ('#ffffff', 'hvit')

        # 3. hver Husbanken-farge får det ene trinnet den passer best på.
        #    Uten den begrensningen havner samme farge på både hover og
        #    active, og da ser de to tilstandene like ut.
        ledige = [(t, lch(avhex(v))) for t, v in trinnliste if t not in satt]
        brukt = {kilde.split(',')[0].replace(f'hb-{kulor}-', '')
                 for _, kilde in satt.values() if kilde.startswith(f'hb-{kulor}-')}
        for t_hb, rgb in sorted(ramp.items()):
            if str(t_hb) in brukt:
                continue
            L_hb = lch(rgb)[0]
            best, avstand = None, 9
            for trinn, mal in ledige:
                d = abs(L_hb - mal[0])
                if d < avstand:
                    best, avstand = trinn, d
            if best and avstand <= TOLERANSE:
                satt[best] = (hexs(rgb), f'hb-{kulor}-{t_hb}')
                ledige = [x for x in ledige if x[0] != best]

        # 4. resten lages i samme kulør på Digdirs lyshet
        for trinn, mal in ledige:
            naermest = min(ramp, key=lambda t: abs(lch(ramp[t])[0] - mal[0]))
            _, nc, nh = lch(ramp[naermest])
            satt[trinn] = (hexs(fra_lch(mal[0], min(mal[1], nc * 1.15), nh)),
                           f'avledet fra hb-{kulor}-{naermest}')
            notater.append(f'{fam}-{trinn}')

        grupper[fam] = [(t, *satt[t]) for t, _ in trinnliste]

    linjer = ["""/* ──────────────────────────────────────────────────────────────────
   Designsystemet.no i Husbankens farger
   Generert av verktoy/lag-hb-tema.py. Ikke rediger for hånd.

   Designsystemets komponent-CSS inneholder ingen farger. Den leser bare
   --ds-color-*. Denne fila setter de variablene til Husbankens palett,
   og da blir komponentene husbankenfargede uten at noe i Digdirs egne
   filer røres.

   For hvert trinn er Digdirs lyshet beholdt, så kontrastforholdene
   komponentene er tegnet for, fortsatt stemmer. Kommentaren bak hver
   linje sier om fargen er en av Husbankens egne, eller avledet.

   Fila lastes i laget hb.farger, som boligkompasset-stiler.css legger
   etter ds.theme. Da slår den Digdirs egne farger. Bare det lyse temaet
   settes, og det er det eneste prototypen har.
   ────────────────────────────────────────────────────────────────── */

:root {"""]
    etikett = {'accent': 'accent, blå: knapper, lenker, fokus, valgt tilstand',
               'brand1': 'brand1, grønn: merkefargen, kompasset, callouts',
               'brand2': 'brand2, lilla: prototypebanneret',
               'neutral': 'neutral, slate: tekst, rammer, flater',
               'info': 'info, blå', 'success': 'success, grønn',
               'danger': 'danger, rød: feil og destruktive valg'}
    for fam, rader in grupper.items():
        linjer.append(f'\n  /* {etikett.get(fam, fam)} */')
        bredde = max(len(t) for t, _, _ in rader)
        for trinn, verdi, kilde in rader:
            navn = f'--ds-color-{fam}-{trinn}:'
            linjer.append(f'  {navn:{bredde+22}} {verdi};'.ljust(58) + f'/* {kilde} */')

    linjer.append('\n  /* fokusmarkering */')
    linjer.append('  --ds-color-focus-inner:  #ffffff;'.ljust(58) + '/* hvit */')
    linjer.append('  --ds-color-focus-outer:  %s;' % hexs(palett['slate'][700]).ljust(7))
    linjer.append('}\n')
    io.open(UT, 'w', encoding='utf-8').write('\n'.join(linjer))
    return grupper, notater

if __name__ == '__main__':
    g, n = bygg()
    print('skrev', UT)
    print('familier:', ', '.join(g))
    print('avledede trinn:', len(n), '/', sum(len(v) for v in g.values()))
