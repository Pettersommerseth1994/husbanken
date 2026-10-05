#!/bin/sh
# Lager assets/pdf/boligkompasset-papirutgave.pdf fra boligkompasset-papir.html.
#
# Kjør det etter at spørsmålene i assets/js/hb-kompass-data.js er endret,
# så PDF-en som startsiden lenker til, stemmer med skjermutgaven.
# Krever Google Chrome, og at repoet serveres lokalt, for eksempel med
#   python3 -m http.server 4321 --bind 127.0.0.1
set -e
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ADRESSE="${1:-http://127.0.0.1:4321/boligkompasset-papir.html}"
UT="$(cd "$(dirname "$0")/.." && pwd)/assets/pdf/boligkompasset-papirutgave.pdf"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=5000 --print-to-pdf="$UT" "$ADRESSE"
echo "Skrev $UT"
