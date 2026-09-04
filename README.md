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

## Papirskjemaene

Ordningen må også kunne søkes om på papir. To skjemaer dekker de to gangene
søkeren må gjøre noe: selve søknaden, og utbetalingen etterpå. Begge er bygget
på samme mal som det utfyllbare skjemaet for å be om utbetaling av lån
(HB 7.S.21), så skjemafamilien ser like ut på papir.

| Skjema | Fil | Sider |
| --- | --- | --- |
| HB 8.S.05, søknad om tilskudd | `papirsoknad-aldersvennlig.html` | 5 |
| HB 8.S.06, be om utbetaling | `papirsoknad-aldersvennlig-utbetaling.html` | 4 |

Skjemaene kan fylles ut i nettleseren og skrives ut derfra, eller skrives ut
tomme og fylles ut med penn. Svarene lagres i nettleseren mens man skriver.
«Skriv ut / Lagre PDF» i verktøylinja gir A4 uten marger.

Grepene fra brukertestene følger med over på papir: de fire nøkkeltallene og de
tre eksemplene står på side 1, regnestykket kan stå åpent fordi vi regner det ut
selv, forskutteringen står i en gul boks i stedet for å komme som en
overraskelse, telefonnummeret står i en egen boks til slutt og i hver sidebunn,
og utbetalingsskjemaet åpner med å vise hvor i løpet man er, siden det er steget
flest glemmer.

Skjemanumrene 8.S.05 og 8.S.06 er oppdiktet, på samme måte som resten av
prototypen.

### Iterasjonene ligger igjen

Skjemaene endres etter tilbakemeldinger, og hver runde blir liggende. Cellene
øverst til venstre på skjermen lar deg hoppe mellom dem. De vises ikke i
utskriften.

| Iterasjon | Filer | Hva som endret seg |
| --- | --- | --- |
| 1, 3. september 2026 | `...-v1.html` | Første utkast, bygget på malen for HB 7.S.21. Regnestykket var fire linjer søkeren fylte ut selv. |
| 2, 4. september 2026 | uten suffiks | Regnestykket forenklet til ett felt, feltene i 1.2 flyttet opp under svaret de hører til, oppgraderingene tydeliggjort som eksempler, inntekt og prioritering forklart, slagordet fjernet. |

Den siste iterasjonen ligger alltid på filnavnet uten suffiks, så lenker som er
delt ut fortsetter å peke på det som er nyest.

Versjonslista står ett sted, i `HB_VERSJONER` øverst i
[`assets/js/versjoner.js`](assets/js/versjoner.js). Slik legger du til en ny
runde:

1. Kopier skjemaet til `...-vN.html` og `assets/css/hb-papir.css` til
   `assets/css/hb-papir-vN.css`. Kopien skal peke på den pinnede CSS-en, og ha
   sin egen `data-lager`, slik at utfyllingen ikke blandes mellom versjoner.
2. Legg inn en ny oppføring nederst i `HB_VERSJONER`.
3. Sett `data-versjon` på `<body>` i kopien.

CSS-en pinnes fordi komponentlaget endres i takt med skjemaene. Iterasjon 1
bruker for eksempel `.calc`, som ikke lenger finnes i gjeldende CSS.

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
assets/css/hb-app.css    Komponentlag bygget kun på tokens fra ds/
assets/css/hb-papir.css  Samme, for papirskjemaene på A4
assets/css/hb-papir-v1.css  Pinnet kopi, slik iterasjon 1 så ut
assets/css/hb-versjoner.css Cellene for å hoppe mellom iterasjonene
assets/js/hb.js      Regelverk, ikoner, felles topp og bunn, lagring
assets/js/kalkulator.js  Kalkulatoren, brukt både på infosiden og i steg 4
assets/js/soknad.js  De seks stegene, validering og framdrift
assets/js/papirskjema.js  Sifferruter, beløp, lagring og utskrift i papirskjemaene
assets/js/versjoner.js   Versjonslista, og cellene som hopper mellom iterasjonene
Brukertester/        Rådata fra de åtte testene 25. og 27. august 2026
ref/, uploads/       Referansemateriale fra Husbanken
```

## Forbehold

Klikkbar prototype for designarbeid. Testdata og illustrasjoner. De seks
godkjente oppgraderingene er plausible eksempler, siden forskriften ikke er
publisert. Ingen data sendes noe sted, og ingen del av dette er bindende.
