# Utfyllbar PDF

`lag-utfyllbar-pdf.py` lager en PDF med ekte skjemafelter av papirskjemaet.
Chrome skriver ut HTML-en til A4, og over den legges usynlige felter nøyaktig
der rutene er tegnet.

## Kjøre

    python3 -m venv .venv && .venv/bin/pip install pypdf reportlab

    .venv/bin/python verktoy/lag-utfyllbar-pdf.py \
      papirsoknad-aldersvennlig.html \
      assets/pdf/HB-8.S.39-soknad-utfyllbar.pdf

    .venv/bin/python verktoy/lag-utfyllbar-pdf.py \
      papirsoknad-aldersvennlig-utbetaling.html \
      assets/pdf/HB-8.S.40-utbetaling-utfyllbar.pdf

**Dette må kjøres på nytt etter hver iterasjon.** PDF-ene ligger som filer i
repoet, og oppdateres ikke av seg selv når skjemaet endres.

## Hvordan feltene finnes

`mal-felter.js` måler hvor hvert felt ligger, i millimeter fra øvre venstre
hjørne av hver side, og henter samtidig etiketten, spørsmålet over den og
seksjonsoverskriften. Skriptet kjøres i samme hodeløse nettleser som skriver ut
PDF-en, og resultatet plukkes ut av DOM-en. Det er ikke noe feltkart på disk som
kan komme i utakt med layouten.

## Universell utforming

Dette er gjort for at noen som ikke ser skjermen skal kunne fylle ut skjemaet:

- **Tagget PDF.** `--export-tagged-pdf` gir strukturtrerot, overskriftsnivåer og
  lesrekkefølge for all brødteksten.
- **Beskrivelse på hvert felt.** `/TU` er teksten skjermleseren sier. Den bygges
  av etiketten, spørsmålet og seksjonen, så «Ja» blir «1.1 Er du over 62 år? —
  Ja, jeg er over 62 år». Uten dette leses feltnavnet, altså `q1_alder`.
- **Radioknappene** har spørsmålet på gruppa og svaret på hver enkelt knapp.
  reportlab dropper tooltip på radiowidgeter, så det settes i skriptet.
- **Tabbrekkefølge.** Sidene har `/Tabs /R`, radrekkefølge, og annots-lista
  sorteres likt, så tabulator går fra venstre til høyre og så nedover.
- **Språk og tittel.** `/Lang` er `nb-NO`, dokumenttittelen hentes fra `<title>`,
  og `/DisplayDocTitle` gjør at leseren annonserer tittelen og ikke filnavnet.

**Ikke gjort:** skjemafeltene er ikke lagt inn i strukturtreet med `/StructParent`.
Skjermlesere leser dem i skjemamodus via `/TU`, som virker, men de kommer ikke i
lesrekkefølgen sammen med brødteksten. Det bør verifiseres med NVDA eller
VoiceOver før skjemaet tas i bruk.

## Hvorfor utseendet tegnes selv

reportlab plasserer radioprikken utenfor midten av ruta, og setter Required på
avkryssingsboksene, som gir rød ramme i Acrobat. Skriptet skriver derfor sine
egne utseendestrømmer: prikk og hake midt i ruta, i samme blekkfarge som
teksten, uten ramme.
