#!/usr/bin/env python3
"""
Bygger fasaden/fasaden.css fra Husbankens designsystem Fasaden.

Fasaden er skrevet i SCSS, og pakkene ligger i Husbankens interne
npm-register. Her finnes verken node eller tilgang til registeret, så
skriptet gjør det samme som pakkene gjør, fra kildekoden:

  1. Tokenene i libs/designsystem-tokens/properties/**/*.json skrives ut
     som SCSS-variabler, med samme navn som style-dictionary gir dem
     ($color-green-45, $space-2-xs og så videre).
  2. libs/designsystem-design/src/styles/esoknad.scss kompileres med
     Dart Sass, pakket inn i .fasaden { }.
  3. Resultatet ryddes:
       - html, body og :root inne i .fasaden blir .fasaden selv
       - font-size: 62.5 % på html tas bort
       - rem regnes om fra Fasadens rot på 10 px til nettleserens 16 px

Hvorfor innpakket: Fasaden og det felles skallet i prototypen (hb-app.css)
bruker begge prefikset hb-. .hb-footer, .hb-card, .hb-label og flere finnes
i begge. Med .fasaden rundt treffer Fasaden bare innholdet i Boligkompasset,
og toppen og bunnen som deles med de andre prosjektene, står som før.

Hvorfor rem regnes om: Fasaden setter html til 62,5 % så 1rem blir 10 px.
Det ville gjort alt annet på sida mindre. Omregningen gir de samme
pikselstørrelsene som i Fasaden, uten å røre roten.

Bruk:
  python3 verktoy/bygg-fasaden.py <fasaden-repo> <sass>

  <fasaden-repo>  mappa med Fasaden-repoet (felles-rammeverk-designsystem)
  <sass>          Dart Sass, for eksempel dart-sass/sass fra
                  https://github.com/sass/dart-sass/releases
"""

import glob
import json
import os
import re
import subprocess
import sys
import tempfile

UT = os.path.join(os.path.dirname(__file__), '..', 'fasaden', 'fasaden.css')


def lag_tokens(repo, maal):
    """Tokenene som SCSS-variabler, slik style-dictionary lager dem."""
    tre = {}

    def flett(a, b):
        for k, v in b.items():
            if k in a and isinstance(a[k], dict) and isinstance(v, dict):
                flett(a[k], v)
            else:
                a[k] = v

    for f in sorted(glob.glob(os.path.join(repo, 'libs/designsystem-tokens/properties/**/*.json'), recursive=True)):
        with open(f, encoding='utf-8') as fil:
            flett(tre, json.load(fil))

    flate = []

    def gaa(node, sti):
        if isinstance(node, dict) and 'value' in node and not isinstance(node['value'], dict):
            flate.append((sti, node['value']))
            return
        for k, v in node.items():
            if isinstance(v, dict):
                gaa(v, sti + [k])

    gaa(tre, [])

    def hent(sti):
        n = tre
        for d in sti:
            n = n[d]
        return n

    def los(verdi):
        if not isinstance(verdi, str):
            return str(verdi)

        def bytt(m):
            sti = m.group(1).split('.')
            if sti[-1] == 'value':
                sti = sti[:-1]
            return los(hent(sti)['value'])

        return re.sub(r'\{([^}]+)\}', bytt, verdi)

    def kebab(sti):
        # Samme som lodash kebabCase i style-dictionary: tall og bokstaver skilles
        s = '-'.join(sti)
        s = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', s).lower()
        s = re.sub(r'(\d)([a-z])', r'\1-\2', s)
        s = re.sub(r'([a-z])(\d)', r'\1-\2', s)
        return s

    linjer = [f'${kebab(sti)}: {los(v)} !default;' for sti, v in flate]
    os.makedirs(os.path.join(maal, 'dist', 'scss'))
    with open(os.path.join(maal, 'dist', 'scss', '_variabler.scss'), 'w', encoding='utf-8') as fil:
        fil.write('\n'.join(linjer) + '\n')
    return len(linjer)


def rydd(css):
    css = re.sub(r'\.fasaden (html|body|:root)\b', '.fasaden', css)
    css = re.sub(r'font-size:\s*62\.5%;?', '', css)

    def rem(m):
        tall = float(m.group(1)) * 10 / 16
        return f'{round(tall, 4):g}rem'

    return re.sub(r'(?<![\w.-])(-?\d*\.?\d+)rem\b', rem, css)


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    repo, sass = (os.path.abspath(a) for a in sys.argv[1:])
    stiler = os.path.join(repo, 'libs/designsystem-design/src/styles')
    versjon = json.load(open(os.path.join(repo, 'package.json'), encoding='utf-8'))['version']

    with tempfile.TemporaryDirectory() as tmp:
        pakker = os.path.join(tmp, 'pakker', '@husbanken')
        os.makedirs(pakker)
        tokens = os.path.join(pakker, 'designsystem-tokens')
        antall = lag_tokens(repo, tokens)
        os.symlink(os.path.join(repo, 'libs/designsystem-icons'), os.path.join(pakker, 'designsystem-icons'))
        os.symlink(os.path.join(repo, 'libs/designsystem-fonts'), os.path.join(pakker, 'designsystem-fonts'))

        inngang = os.path.join(tmp, 'fasaden.scss')
        with open(inngang, 'w', encoding='utf-8') as fil:
            fil.write(".fasaden {\n  @import 'esoknad';\n}\n")

        rad = os.path.join(tmp, 'fasaden.css')
        subprocess.run([
            sass, '--no-source-map', '--quiet-deps', '--style=compressed',
            '--silence-deprecation=import,global-builtin,color-functions,slash-div',
            '--load-path=' + os.path.join(tmp, 'pakker'), '--load-path=' + stiler,
            inngang, rad,
        ], check=True)

        with open(rad, encoding='utf-8') as fil:
            css = rydd(fil.read())

    topp = (
        '/* Fasaden, Husbankens designsystem, versjon ' + versjon + '.\n'
        '   Bygget fra esoknad.scss av verktoy/bygg-fasaden.py. Ikke rediger for hånd.\n'
        '   Alt ligger under .fasaden, og rem er regnet om fra 10 px til 16 px rot. */\n'
    )
    os.makedirs(os.path.dirname(UT), exist_ok=True)
    with open(UT, 'w', encoding='utf-8') as fil:
        fil.write(topp + css)
    print(f'{antall} tokens, {len(css) // 1024} kB skrevet til {os.path.normpath(UT)}')


if __name__ == '__main__':
    main()
