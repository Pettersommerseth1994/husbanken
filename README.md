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
| HB 8.S.05, søknad om tilskudd | `papirsoknad-aldersvennlig.html` | 6 |
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
øverst til venstre på skjermen lar deg hoppe mellom dem, og bryteren «Vis
endringene» markerer hva som er endret, rett i skjemaet. Punktene i lista tar
deg til markeringen. Ingenting av dette kommer med i utskriften.

| Iterasjon | Filer | Hva som endret seg |
| --- | --- | --- |
| 1, 3. september 2026 | `...-v1.html` | Første utkast, bygget på malen for HB 7.S.21. Regnestykket var fire linjer søkeren fylte ut selv. |
| 2, 4. september 2026 | `...-v2.html` | Regnestykket forenklet til ett felt, feltene i 1.2 flyttet opp under svaret de hører til, oppgraderingene tydeliggjort som eksempler, inntekt og prioritering forklart, slagordet fjernet. |
| 3, 8. september 2026 | `...-v3.html` | Rettet etter tilgjengelighetsgjennomgang. Se under. |
| 4, 8. september 2026 | `...-v4.html` | Storskrift. 14 pt brødtekst, 2 cm marger, større skrivefelt. Se under. |
| 5, 8. september 2026 | uten suffiks | Iterasjon 3 justert. Linjer i skrivefelt fjernet, ruter midtstilt, personalia inn i seksjon 1. |

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
4. Merk blokkene som er endret med `data-endret="Hva som er endret her"`, i den
   nye kopien og i den forrige. Nummereringen settes automatisk i
   dokumentrekkefølge.

CSS-en pinnes fordi komponentlaget endres i takt med skjemaene. Iterasjon 1
bruker for eksempel `.calc`, som ikke lenger finnes i gjeldende CSS.

### Universell utforming

Kravet for offentlig sektor er WCAG 2.1 nivå AA. Iterasjon 2 ble målt med
axe-core og egne målinger av kontrast, tekstavstand, reflow, tastatur og
semantikk. Den hadde seks brudd, som er rettet i iterasjon 3:

| Krav | Var | Er |
| --- | --- | --- |
| 1.4.10 Reflow | Arket låst til 210 mm, nedskalert til 40 % på 320 px | Arkformatet slippes under 840 px, én kolonne, ingen vannrett rulling |
| 1.4.12 Tekstavstand | 28 til 82 mm per side klippet bort av `overflow: hidden` | `min-height`, så arket strekker seg i stedet. 0 mm tapt |
| 1.3.1 og 3.3.2 | 17 svargrupper uten `fieldset` | Alle grupper har `fieldset` med `legend` |
| 4.1.2 | Signaturlinjene uten rolle og navn | `role="textbox"` og navn fra den synlige etiketten |
| 1.4.11 | Fokusring 2,03:1, understrek 2,99:1 | 5,30:1 og 5,32:1, kravet er 3:1 |
| 1.4.3 | Rutetall 2,73:1, placeholder 2,99:1 | 4,87:1 og 5,32:1, kravet er 4,5:1 |

I tillegg leses sifferrutene nå som «Fødselsnummer, siffer 1 av 11» i stedet
for det interne feltnavnet, beløpsfeltene har enheten koblet til feltet,
vedleggsboksene er grupper med navn, og tabellhodene er merket.

Papiret er uendret. Alle ni sider måler millimeter for millimeter det samme
som i iterasjon 2, fordi hele reflow-regelen ligger i `@media screen` og
`@media print` fortsatt låser arket til 210 × 297 mm.

### Storskrift, iterasjon 4

De som fyller ut på papir er de som ikke fyller ut digitalt, og det utvalget
ligger i øvre del av målgruppen. Nærmere 72 enn 62. Iterasjon 3 var satt i
9,5 pt, en vanlig forvaltningsstørrelse, og iterasjon 4 er skrevet om for
lesbarhet på papir.

| Krav | Iterasjon 3 | Iterasjon 4 |
| --- | --- | --- |
| Brødtekst 14–16 pt | 9,5 pt | **14 pt** |
| Overskrifter 18–20 pt | 13 pt | **19 pt** |
| Linjelengde 60–75 tegn | 92 tegn | **67 tegn** |
| Marger 2–2,5 cm | 1,6 cm | **2,0 cm** |
| Linjeavstand 1,2–1,5 | 1,21–1,47 | 1,21–1,45 |
| Sans-serif | Inter | Inter |
| Venstrejustert | ja | ja |
| Kontrast min. 4,5:1 | 4,85:1 lavest | 4,87:1 lavest |
| Ingen kursiv eller understreking | ingen | ingen |
| Avstand etter avsnitt ≈ fontstørrelse | 0,45 til 0,89 × | 0,84 til 0,91 × |

Linjelengden løste seg av seg selv. Den var 92 tegn fordi skriften var for
liten for en tekstbredde på 178 mm. Med 14 pt og 2 cm marger blir bredden
170 mm og linjen 67 tegn, midt i båndet.

Skrivefeltene vokste med skriften, fordi de samme hendene som trenger større
skrift trenger mer plass å skrive på. Linjer 8 til 11 mm, sifferruter fra
6 × 8 til 8 × 11 mm, underskriftslinjer fra 12 til 17 mm. Hjelpeteksten er
sort i stedet for grå.

Det koster sider. Søknaden gikk fra 5 til 10, utbetalingen fra 4 til 8.
Seksjon 3 ble 350 mm og fikk ikke plass på ett ark, så den er delt med en
fortsettelsesoverskrift. Telefonfeltet er flyttet opp, rett etter
underskriften, fordi det ellers havnet alene på en side som bare var
15 prosent full.

Ett bevisst avvik: hjelpetekst er 12,5 pt, intropanelet 13,5 pt og sidebunnen
11 pt, altså under 14 pt. Alt løper de samme 14 pt hvis det skal være strengt,
men da flater hierarkiet ut og spørsmålet blir like tungt som hjelpen til det.
Brødteksten, spørsmålene og svaralternativene er 14 til 14,5 pt.

### Iterasjon 5

Storskriften i iterasjon 4 er ikke veien videre. Iterasjon 3 ble foretrukket, og
iterasjon 5 er bygget på 3, ikke på 4. Iterasjon 4 blir liggende som en gren man
kan hoppe tilbake til, siden regnestykket for 14 pt står der.

Tre justeringer på toppen av iterasjon 3:

1. Linjene inne i skrivefeltene er fjernet. Feltene er blanke, som resten av
   rutene i skjemaet.
2. Avkryssingsrutene er midtstilt mot første tekstlinje. De satt 0,82 mm for
   lavt, målt fra midten av ruta til midten av linja. `margin-top` gikk fra
   1,2 til 0,35 mm, som er halve linjehøyden minus halve ruta.
3. Personaliaboksen er flyttet inn under seksjon 1, «Om deg», der
   personopplysningene hører hjemme. Boksen lå løs på side 1 uten
   seksjonsnummer.

Flyttingen koster én side. Seksjon 1 bærer nå boksen og blir 176 mm, så den kan
ikke lenger dele side med seksjon 2. Søknaden gikk fra 5 til 6 sider.
Utbetalingsskjemaet har ingen «Om deg», så boksen står der den stod, og skjemaet
er fortsatt på 4 sider.

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
assets/css/hb-papir-v2.css  Pinnet kopi, slik iterasjon 2 så ut
assets/css/hb-papir-v3.css  Pinnet kopi, slik iterasjon 3 så ut
assets/css/hb-papir-v4.css  Pinnet kopi, slik iterasjon 4 så ut
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
