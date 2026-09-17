"""
Lager en utfyllbar PDF av papirskjemaet.

Chrome skriver ut HTML-en til A4, og over den legges usynlige skjemafelter
nøyaktig der rutene er tegnet. Posisjonene måles i nettleseren og lagres som
JSON, fordi det er layouten selv som bestemmer hvor feltene havner.
"""
import html as html_module
import json, re, subprocess, sys
from pathlib import Path
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (NameObject, NumberObject, BooleanObject, FloatObject,
                            DictionaryObject, ArrayObject, TextStringObject,
                            DecodedStreamObject)

MM = 72 / 25.4
A4 = (210 * MM, 297 * MM)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def _chrome(*args):
    return subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
                           "--virtual-time-budget=20000", *args],
                          check=True, capture_output=True)


def skriv_ut(kilde, ut):
    """--export-tagged-pdf gir strukturtrerot, språk og overskriftsnivåer,
       som er det skjermlesere navigerer etter."""
    _chrome("--no-pdf-header-footer", "--export-tagged-pdf",
            f"--print-to-pdf={ut}", kilde)


def mal_felter(html_sti):
    """Måler feltene i samme nettleser som skriver ut PDF-en, så kartet
       ikke kan komme i utakt med layouten."""
    html = Path(html_sti)
    skript = (Path(__file__).parent / "mal-felter.js").read_text(encoding="utf-8")
    kopi = html.with_suffix(".maling.html")
    kopi.write_text(html.read_text(encoding="utf-8")
                    + f"\n<script>\n{skript}\n</script>\n", encoding="utf-8")
    try:
        dom = _chrome("--dump-dom", kopi.resolve().as_uri()).stdout.decode("utf-8")
    finally:
        kopi.unlink(missing_ok=True)
    m = re.search(r'<pre id="felter-json">(.*?)</pre>', dom, re.S)
    if not m:
        raise SystemExit("fant ikke feltmålingen i DOM-en")
    return json.loads(html_module.unescape(m.group(1)))


def beskrivelse(f):
    """Teksten skjermleseren sier. Svaralternativer trenger spørsmålet med
       seg, ellers er «Ja» uten mening. Sifferrutene har den fra før."""
    lab, sp, sek = f.get("lab", ""), f.get("sp", ""), f.get("sek", "")
    if f["t"] == "omrade":
        # aria-etiketten gjentar spørsmålet, så den kortes ned
        tekst = f"{sp} — beskriv med dine egne ord" if sp else lab
    elif lab and sp and sp != lab:
        tekst = f"{sp} — {lab}"
    else:
        tekst = lab or sp
    if sek and sek not in tekst:
        tekst = f"{tekst} ({sek})"
    return tekst or f["n"]


def overlegg(felter_pa_siden):
    """Ett gjennomsiktig ark med bare skjemafeltene på."""
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    f = c.acroForm
    for felt in felter_pa_siden:
        x = felt["x"] * MM
        y = A4[1] - (felt["y"] + felt["h"]) * MM
        w, h = felt["w"] * MM, felt["h"] * MM
        t = felt["t"]
        if t == "kryss":
            f.checkbox(name=felt["n"], x=x, y=y, size=h, tooltip=beskrivelse(felt),
                       borderWidth=0, borderColor=None, fillColor=None,
                       buttonStyle="check", textColor=black, forceBorder=False)
        elif t == "radio":
            f.radio(name=felt["n"], value=felt["v"], x=x, y=y, size=h,
                    tooltip=beskrivelse(felt),
                    borderWidth=0, borderColor=None, fillColor=None,
                    buttonStyle="circle", textColor=black, forceBorder=False,
                    selected=False, shape="circle")
        elif t == "omrade":
            f.textfield(name=felt["n"], x=x, y=y, width=w, height=h,
                        borderWidth=0, borderColor=None, fillColor=None,
                        textColor=black, fontName="Helvetica", fontSize=9,
                        maxlen=0, fieldFlags="multiline", forceBorder=False,
                        tooltip=beskrivelse(felt))
        elif t == "siffer":
            f.textfield(name=felt["n"], x=x, y=y, width=w, height=h,
                        borderWidth=0, borderColor=None, fillColor=None,
                        textColor=black, fontName="Helvetica", fontSize=12,
                        maxlen=1, forceBorder=False, tooltip=beskrivelse(felt))
        else:
            f.textfield(name=felt["n"], x=x, y=y, width=w, height=h,
                        borderWidth=0, borderColor=None, fillColor=None,
                        textColor=black, fontName="Helvetica", fontSize=10,
                        maxlen=0, forceBorder=False, tooltip=beskrivelse(felt))
    c.showPage()
    c.save()
    buf.seek(0)
    return PdfReader(buf)


def midtstill(writer, navn_starter_med):
    """Sifferrutene skal ha tallet midt i ruta, ikke klemt mot venstre."""
    n = 0
    for side in writer.pages:
        for a in side.get("/Annots", []):
            o = a.get_object()
            t = o.get("/T")
            if t and any(str(t).startswith(p) for p in navn_starter_med):
                o[NameObject("/Q")] = NumberObject(1)
                n += 1
    return n


BLEKK = "0.173 0.275 0.337"          # --hb-slate-700, samme som teksten ellers


def _xobject(writer, w, h, data):
    o = DecodedStreamObject()
    o.set_data(data.encode("latin-1"))
    o[NameObject("/Type")] = NameObject("/XObject")
    o[NameObject("/Subtype")] = NameObject("/Form")
    o[NameObject("/FormType")] = NumberObject(1)
    o[NameObject("/BBox")] = ArrayObject([NumberObject(0), NumberObject(0),
                                          FloatObject(w), FloatObject(h)])
    o[NameObject("/Resources")] = DictionaryObject()
    return writer._add_object(o)


def _sirkel(cx, cy, r):
    """Fylt sirkel av fire bézier-buer."""
    k = r * 0.5523
    return (f"{cx + r:.3f} {cy:.3f} m "
            f"{cx + r:.3f} {cy + k:.3f} {cx + k:.3f} {cy + r:.3f} {cx:.3f} {cy + r:.3f} c "
            f"{cx - k:.3f} {cy + r:.3f} {cx - r:.3f} {cy + k:.3f} {cx - r:.3f} {cy:.3f} c "
            f"{cx - r:.3f} {cy - k:.3f} {cx - k:.3f} {cy - r:.3f} {cx:.3f} {cy - r:.3f} c "
            f"{cx + k:.3f} {cy - r:.3f} {cx + r:.3f} {cy - k:.3f} {cx + r:.3f} {cy:.3f} c f")


def egne_merker(writer):
    """reportlab tegner radioprikken utenfor midten, og setter Required på
       avkryssingsboksene, som gir rød ramme i Acrobat. Begge deler løses ved
       å skrive utseendet selv: prikk og hake midt i ruta, ingen ramme."""
    n_radio = n_kryss = 0
    for side in writer.pages:
        for a in side.get("/Annots", []):
            o = a.get_object()
            forelder = o.get("/Parent")
            ft = o.get("/FT") or (forelder and forelder.get_object().get("/FT"))
            if ft != "/Btn":
                continue
            r = [float(x) for x in o["/Rect"]]
            w, h = r[2] - r[0], r[3] - r[1]
            ap = o.get("/AP", {}).get("/N", {})
            pa = [k for k in ap if k != "/Off"]
            if not pa:
                continue
            if forelder is not None:                       # radioknapp
                data = f"q {BLEKK} rg {_sirkel(w / 2, h / 2, min(w, h) * 0.30)} Q"
                n_radio += 1
            else:                                          # avkryssingsboks
                lw = max(h * 0.13, 0.7)
                data = (f"q {BLEKK} RG {lw:.2f} w 1 J 1 j "
                        f"{w*0.20:.2f} {h*0.52:.2f} m {w*0.42:.2f} {h*0.28:.2f} l "
                        f"{w*0.81:.2f} {h*0.76:.2f} l S Q")
                # Required gir rød ramme i Acrobat, og boksen er ikke påkrevd
                o[NameObject("/Ff")] = NumberObject(0)
                n_kryss += 1
            o[NameObject("/AP")] = DictionaryObject()
            n = DictionaryObject()
            n[NameObject("/Off")] = _xobject(writer, w, h, "q Q")
            for k in pa:
                n[NameObject(k)] = _xobject(writer, w, h, data)
            o["/AP"][NameObject("/N")] = n
            o[NameObject("/MK")] = DictionaryObject()      # ingen ramme, ingen fyll
    return n_radio, n_kryss


def tabbrekkefolge(writer):
    """Venstre til høyre, så nedover. /R er radrekkefølge, og annots-lista
       sorteres likt for lesere som følger den i stedet."""
    for side in writer.pages:
        side[NameObject("/Tabs")] = NameObject("/R")
        annots = side.get("/Annots")
        if not annots:
            continue
        def nokkel(a):
            r = [float(x) for x in a.get_object()["/Rect"]]
            # y måles nedenfra i PDF, så høy y er øverst. 6 pt slingring
            # gjør at felt på samme linje havner i samme rad.
            return (-round(r[3] / 6), r[0])
        annots.sort(key=nokkel)


def knytt_radioknapper(writer, side, pa_siden):
    """reportlab lager radioknappene som løse widgeter uten felt over seg.
       De må samles under ett felt per gruppe, ellers vet ikke leseren at de
       hører sammen og at bare én kan være valgt."""
    widgets = [a for a in side.get("/Annots", [])
               if a.get_object().get("/Subtype") == "/Widget"]
    ventet = [f for f in pa_siden if f["t"] == "radio"]
    if not ventet:
        return []

    # Widgetene ligger i samme rekkefølge som de ble tegnet
    radioer = [a for a in widgets
               if a.get_object().get("/T") is None
               and a.get_object().get("/FT") == NameObject("/Btn")]
    assert len(radioer) == len(ventet), (len(radioer), len(ventet))

    grupper = {}
    for a, felt in zip(radioer, ventet):
        o = a.get_object()
        states = [k for k in o.get("/AP", {}).get("/N", {}) if k != "/Off"]
        assert states == ["/" + felt["v"]], (states, felt)
        # reportlab dropper tooltip på radiowidgeter, så svaret settes her.
        # Uten den sier skjermleseren spørsmålet, men ikke hvilket svar
        # knappen er, og da går det ikke an å svare uten å se.
        if felt.get("lab"):
            o[NameObject("/TU")] = TextStringObject(felt["lab"])
        grupper.setdefault(felt["n"], []).append(a)

    laget = []
    for navn, kids in grupper.items():
        f = DictionaryObject()
        f[NameObject("/FT")] = NameObject("/Btn")
        f[NameObject("/T")] = TextStringObject(navn)
        f[NameObject("/Ff")] = NumberObject(1 << 15)      # radio
        f[NameObject("/V")] = NameObject("/Off")
        sp = next((x["sp"] for x in ventet if x["n"] == navn and x.get("sp")), "")
        if sp:
            f[NameObject("/TU")] = TextStringObject(sp)
        f[NameObject("/Kids")] = ArrayObject(kids)
        ref = writer._add_object(f)
        for k in kids:
            k.get_object()[NameObject("/Parent")] = ref
        laget.append(ref)
    return laget


def bygg_acroform(writer):
    """merge_page flytter widgetene over på sidene, men katalogen må bygges
       selv. Uten den ser leseren ingen skjemafelter i det hele tatt."""
    felt = []
    sett = set()
    for side in writer.pages:
        for a in side.get("/Annots", []):
            o = a.get_object()
            if o.get("/Subtype") != "/Widget":
                continue
            ref = o.get("/Parent") or a          # radio-knapper henger under et felles felt
            n = id(ref.get_object())
            if n not in sett:
                sett.add(n)
                felt.append(ref)

    dr = DictionaryObject()
    skrifter = DictionaryObject()
    for navn, base in (("Helv", "Helvetica"), ("ZaDb", "ZapfDingbats")):
        f = DictionaryObject()
        f[NameObject("/Type")] = NameObject("/Font")
        f[NameObject("/Subtype")] = NameObject("/Type1")
        f[NameObject("/BaseFont")] = NameObject("/" + base)
        f[NameObject("/Encoding")] = NameObject("/WinAnsiEncoding")
        skrifter[NameObject("/" + navn)] = writer._add_object(f)
    dr[NameObject("/Font")] = skrifter

    acro = DictionaryObject()
    acro[NameObject("/Fields")] = ArrayObject(felt)
    acro[NameObject("/DR")] = dr
    acro[NameObject("/DA")] = TextStringObject("/Helv 0 Tf 0 g")
    # Uten denne viser flere lesere tom tekst til feltet får fokus
    acro[NameObject("/NeedAppearances")] = BooleanObject(True)
    writer._root_object[NameObject("/AcroForm")] = writer._add_object(acro)
    return len(felt)


def dokumentnivaa(writer, tittel):
    rot = writer._root_object
    rot[NameObject("/Lang")] = TextStringObject("nb-NO")
    mi = rot.get("/MarkInfo")
    if mi is None:
        mi = DictionaryObject()
        rot[NameObject("/MarkInfo")] = mi
    mi.get_object()[NameObject("/Marked")] = BooleanObject(True)
    vp = DictionaryObject()
    # Uten denne annonserer leseren filnavnet i stedet for tittelen
    vp[NameObject("/DisplayDocTitle")] = BooleanObject(True)
    rot[NameObject("/ViewerPreferences")] = vp
    writer.add_metadata({"/Title": tittel, "/Language": "nb-NO"})


def lag(html_sti, ut):
    felter = mal_felter(html_sti)
    grunn = ut.replace(".pdf", "-grunn.pdf")
    kilde = Path(html_sti).resolve().as_uri()
    skriv_ut(kilde, grunn)
    leser = PdfReader(grunn)
    # clone_from tar med strukturtreet fra den taggede utskriften
    skriver = PdfWriter(clone_from=grunn)
    for i, side in enumerate(skriver.pages):
        pa_siden = [f for f in felter if f["s"] == i]
        if pa_siden:
            side.merge_page(overlegg(pa_siden).pages[0])
            knytt_radioknapper(skriver, side, pa_siden)
    bygg_acroform(skriver)
    q = midtstill(skriver, ("fnr_", "samboer_fnr_", "konto_"))
    nr, nk = egne_merker(skriver)
    tabbrekkefolge(skriver)
    print(f"  egne merker: {nr} radio, {nk} avkryssing · tabbrekkefølge: rad")
    tittel = re.search(r"<title>(.*?)</title>",
                       Path(html_sti).read_text(encoding="utf-8"), re.S)
    dokumentnivaa(skriver, html_module.unescape(tittel.group(1)).strip()
                  if tittel else Path(html_sti).stem)
    with open(ut, "wb") as fh:
        skriver.write(fh)
    Path(grunn).unlink(missing_ok=True)
    return len(leser.pages), len(felter), q


if __name__ == "__main__":
    html_sti, ut = sys.argv[1], sys.argv[2]
    sider, antall, q = lag(html_sti, ut)
    print(f"{ut}: {sider} sider, {antall} felter, {q} midtstilte")
