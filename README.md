# Tilskudd til aldersvennlig oppgradering, klikkbar prototype

Designflyt for Husbankens nye tilskuddsordning, fra forsiden på husbanken.no,
gjennom BankID-innlogging, til ferdig innsendt søknad og kvittering.

Bygget på Husbankens designsystem (`ds/`). Statiske filer, uten byggesteg,
avhengigheter eller backend. Kjører like godt lokalt som på GitHub Pages.

## Kjør lokalt

```bash
python3 -m http.server 4321
```

Åpne så <http://localhost:4321>. En server trengs fordi sidene laster
skrifter og skript med relative stier.

## Flyten

| Side | Innhold |
| --- | --- |
| `index.html` | Husbankens forside for privatpersoner. Ordningen ligger som eget felt over tjenestekortene. |
| `tilskudd.html` | Informasjonssiden: kalkulator, tre eksempelcase, hvem som kan få, de seks oppgraderingene, steg for steg, spørsmål og svar. |
| `logg-inn.html` | BankID med dummydata, i tre skjermbilder. |
| `soknad-start.html` | Introsiden til søknaden, bygget etter skjermbildet fra Husbanken. |
| `soknad.html` | Søknaden i seks steg. |
| `kvittering.html` | Mottaksbekreftelse, saksbehandlingstid og veien til utbetaling. |
| `designbeslutninger.html` | Hvert designgrep koblet til funnet fra brukertestene. |

## Regelverket ligger ett sted

Sats, minstekrav og kostnadstak står i `HB_REGLER` øverst i
[`assets/js/hb.js`](assets/js/hb.js). Kalkulatoren, eksempelkortene, teksten på
informasjonssiden og valideringen i søknaden leser alle derfra.

```js
const HB_REGLER = {
  minstekostnad: 80000,   // du må oppgradere for minst dette
  sats: 0.25,             // du får denne andelen
  kostnadstak: 300000,    // vi regner ikke på beløp over dette
  // maks tilskudd = 75 000 kr
};
```

Sats og kostnadstak stemmer med utkastet på husbanken.no per 4. august 2026.
Minstekravet på 80 000 kr er hentet fra kriteriene i søknadsutkastet.

## Snarveier når prototypen skal demonstreres

| URL | Gjør |
| --- | --- |
| `tilskudd.html?belop=400000` | Åpner kalkulatoren på et bestemt beløp. |
| `soknad.html?demo` | Hopper inn i søknaden med ferdig utfylte testdata. |
| `soknad.html?demo&steg=5` | Rett til et bestemt steg. |

Svarene lagres i nettleseren (`localStorage`). «Nullstill prototypen» nederst på
kvitteringen tømmer alt.

## Skjermstørrelser

Mobil først. Verifisert uten horisontal skroll på 320, 375, 768 og 1280 px.
Trykkflater er 56–64 px og brødteksten 18 px, fordi målgruppen er 62+ og fordi
to av åtte testdeltakere brukte bare mobil, to nettbrett.

## Publisering på GitHub Pages

`.nojekyll` ligger i rota, så mapper og filnavn serveres som de er.

```bash
git push -u origin main
```

Slå deretter på Pages under **Settings → Pages → Deploy from a branch → main / (root)**.
Siden blir liggende på <https://pettersommerseth1994.github.io/husbanken/>.

## Mappestruktur

```
ds/                  Husbankens designsystem: tokens, skrifter, logo. Urørt.
assets/css/          Komponentlag bygget kun på tokens fra ds/
assets/js/hb.js      Regelverk, ikoner, felles topp og bunn, lagring
assets/js/kalkulator.js  Kalkulatoren, brukt både på infosiden og i steg 4
assets/js/soknad.js  De seks stegene, validering og framdrift
Brukertester/        Rådata fra de åtte testene 25. og 27. august 2026
ref/, uploads/       Referansemateriale fra Husbanken
```

## Forbehold

Klikkbar prototype for designarbeid. Testdata og illustrasjoner. De seks
godkjente oppgraderingene er plausible eksempler, siden forskriften ikke er
publisert. Ingen data sendes noe sted, og ingen del av dette er bindende.
