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
| HB 8.S.05, søknad om tilskudd | `papirsoknad-aldersvennlig.html` | 7 |
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
| 5, 8. september 2026 | `...-v5.html` | Iterasjon 3 justert. Linjer i skrivefelt fjernet, ruter midtstilt, personalia inn i seksjon 1. |
| 6, 11. september 2026 | `...-v6.html` | Etter lappene i Miro. Nye kategorier, ny rekkefølge, nye krav. Se under. |
| 7, 11. september 2026 | `...-v7.html` | Etter de 93 kommentarene i Miro. Feil postadresse, e-post som kanal, saksbehandlingstid, betalingsrekkefølge. Se under. |
| 8, 13. september 2026 | `...-v8.html` | Etter Slack-gjennomgangen. Leietakerteksten inn, eget samtykkeark bakerst, fire klarere eierformer. Se under. |
| 9, 14. september 2026 | `...-v9.html` | Språkopprydding, og side 9 bygget om i samme form som resten. Se under. |
| 10, 14. september 2026 | `...-v10.html` | Kravlista fra veilederen inn på forsiden. Se under. |
| 11, 14. september 2026 | `...-v11.html` | Skrevet for postmottaket: bolignummer, aksjenummer og dokumentasjon. Se under. |
| 12, 14. september 2026 | uten suffiks | 3.2 bygget om med «Slik finner du»-boksene fra den digitale søknaden. Se under. |

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

### Iterasjon 6, etter design critics

Kilden er Miro-boardet «Design critics av papirsøknadene», med Figma-flyten
øverst og 28 gule lapper fra teamet. Lappene er hentet ut med Miros SDK og
ligger i sin helhet bak denne iterasjonen.

**Kategoriene er byttet ut.** Boardet har et dokument, «Forslag til tekster i
papirsøknaden», med lappen «Bruk disse i papirsøknaden. Ikke endre på tekstene,
fordi de er godkjent av departementet.» De seks gamle kategoriene er erstattet
med disse, med 22 underpunkter, et undernivå med fire valg under «Justere
terrenget», og et fritekstfelt per kategori fordi postmottaket trenger det for
å registrere søknaden.

**Rekkefølgen følger Figma-flyten:** tilbudet, boligen, hva du skal gjøre,
kostnaden, andre opplysninger, underskrift. Tilbudet flyttet fra nest sist til
seksjon 2.

**Nytt fra lappene:** bolignummer og aksjenummer, som postmottaket trenger for
å registrere søknaden på riktig bolig. Fire eierformer med dokumentasjonskrav
for hver, der bare normaltilfellet slipper. Fullmaktsskjema for verger og
fullmektige. «Ikke skriv opplysninger om din eller andres helse» over hvert av
de sju fritekstfeltene. Egen seksjon for andre opplysninger. Lista over hva
tilskuddet ikke dekker, inkludert egeninnsats. Flere søknadsfrister i året.
Underskriftslinje for den i husstanden som er over 62 år, når det ikke er
søkeren selv. Inntekt er bare opplyst, ikke et felt, fordi den hentes fra
Skatteetaten.

Søknaden gikk fra 6 til 7 sider. Utbetalingsskjemaet er urørt i innhold.

**Minstekravet er samtidig flyttet fra 80 000 til 40 000 kroner**, overalt i
prototypen. Førsteeksemplet i tabellen og på eksempelkortene er derfor 30 000
kroner, siden 75 000 ikke lenger faller under grensa.

**Forbehold:** kategoritekstene er transkribert fra et skjermbilde av boardet,
ikke fra kilden. De er departementsgodkjent tekst, og bør sjekkes ord for ord
mot Figma før skjemaet tas i bruk.

### Iterasjon 7, etter kommentarene

Samme board, men denne gangen kommentarene, ikke lappene. 93 tråder, hentet fra
Activity-panelet i boardet. Selve kommentarene ligger ikke i dette repoet,
fordi det er offentlig og trådene er intern gjennomgang.
Kommentarene kommer uten informasjon om
hvilket element de henger på, så de er koblet til skjemaet ut fra innholdet.
De korteste, som «Finnes ikke» og «firmaet», er tolket, ikke oppslått.

**Postadressen var feil.** Skjemaene sto med Postboks 1404, 8602 Mo i Rana.
Kildeskjemaet HB 7.S.21 har Postboks 1404, 8002 Bodø, og lappen om postmottaket
sier Dokumentsenteret i Bodø. Rettet i begge skjemaene og i den digitale
prototypen. De frosne iterasjonene 1 til 6 er ikke rørt, siden de er et
historisk avtrykk.

**E-post er ikke en innsendingskanal.** «Ikke lov å sende på e-post på grunn
av personvern», og `vedlegg@husbanken.no` finnes ikke. Begge skjemaene sier nå
at søknaden går i posten, og begrunner hvorfor. Kvitteringssiden og steg 5 i
den digitale løsningen viser til Min side i stedet.

**Betalingsrekkefølgen var feil framstilt.** Ikke «du må legge ut for
regningen», men: du betaler hele oppgraderingen selv, og etter at alt er
betalt får du 25 prosent utbetalt som tilskudd.

**Saksbehandlingstiden er 1 til 6 uker etter søknadsfristen**, ikke fire. Endret
i skjemaene, på infosiden, på kvitteringen og i det siste steget.

**Adressen ble spurt om to ganger.** Den er tatt ut av personalia i seksjon 1
og står nå bare i seksjon 3, sammen med resten av opplysningene om boligen.

**Resten:** «fast bosatt i», som er forskriftens ordlyd. «Blokkbokstaver»
skrevet om. Telefonoppfordringene ute av brødteksten, og telefonpanelet
fjernet fra begge skjemaene. Ingen oppfordring til å la spørsmål stå åpne.
Bilde med mobilen tatt ut, siden det ikke gir mening i et papirskjema. Mildere
tone i avsnittet om fagfolk. Hvordan man sjekker at firmaet er registrert.
Fritekstfeltene sier at de bare gjelder når ingen av eksemplene passer.
Utbetalingsskjemaet har fått de samme seks kategoriene som søknaden, Nav-
kategorien inkludert.

**Dette er ikke gjort, fordi det må avklares med fagsiden:** om fødselsnummer
er nødvendig eller om navn og fødselsår holder, om telefonnummeret kan deles
aktivt, den strengere teksten fagsiden vil ha om konsekvensene ved å gi feil
opplysninger, om
løsøre ved bad og kjøkken skal med, og ordlyden opp mot det husbanken.no
lander på. Kommentarene som peker på disse ligger i boardet.

## Regelverket ligger ett sted

Sats, minstekrav og kostnadstak står i `HB_REGLER` øverst i
[`assets/js/hb.js`](assets/js/hb.js). Kalkulatoren, eksempelkortene, teksten på
informasjonssiden og valideringen i søknaden leser alle derfra.

```js
const HB_REGLER = {
  minstekostnad: 40000,   // du må oppgradere for minst dette
  sats: 0.25,             // du får denne andelen
  kostnadstak: 300000,    // vi regner ikke på beløp over dette
  // maks tilskudd = 75 000 kr
};
```

Sats og kostnadstak stemmer med utkastet på husbanken.no per 4. august 2026.
Minstekravet er 40 000 kr.

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
assets/css/hb-papir-v5.css  Pinnet kopi, slik iterasjon 5 så ut
assets/css/hb-papir-v6.css  Pinnet kopi, slik iterasjon 6 så ut
assets/css/hb-papir-v7.css  Pinnet kopi, slik iterasjon 7 så ut
assets/css/hb-papir-v8.css  Pinnet kopi, slik iterasjon 8 så ut
assets/css/hb-papir-v9.css  Pinnet kopi, slik iterasjon 9 så ut
assets/css/hb-papir-v10.css Pinnet kopi, slik iterasjon 10 så ut
assets/css/hb-papir-v11.css Pinnet kopi, slik iterasjon 11 så ut
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

### Iterasjon 8, etter Slack-gjennomgangen

Kilden er tråden «Papirsøknaden» i #team-lta-designere, der v7 og sjekklista ble
lagt fram. Tolv svar, med både avklaringer på det som sto som «venter på
fagsiden» og ni nye rettelser.

**Teksten til leietakere var en reell mangel.** Departementet har bedt om at
teksten fra «Til deg som leier»-steget skal være med i søknaden, også på papir.
V7 hadde én setning der det skulle stå fire punkter. De står nå i seksjon 3,
tilpasset papir: vedlegg i stedet for opplasting, og med svar på hvor
samtykkeskjemaet finnes.

**Samtykket fra husstandsmedlemmet over 62 år har fått sitt eget ark.** Før lå
det som et felt i seksjon 1 og en signaturlinje i seksjon 7. Nå er det siste
side i skjemaet, et vedlegg personen selv fyller ut, skriver under på og legger
i konvolutten. Spørsmål 1.2 viser dit.

**Eierformene er skrevet om.** «Folkeregistrert på adressen» er byttet med «bor
der». Kjøp er blitt sitt eget alternativ, med kjøpekontrakt som dokumentasjon
når man ikke er registrert som eier ennå. Arv er skilt ut fra kjøp. Under står
lista over gyldig dokumentasjon, hentet fra dokumentasjonssteget i den digitale
søknaden.

**Samtykketeksten er fagsidens egen.** Formuleringen om uriktige opplysninger
kom ferdig fra fagsiden og er brukt ordrett i begge skjemaene. Setningen om at
Husbanken kan kontakte firmaet som ga tilbudet er tatt ut av søknaden.

**Resten:** setningen om at postmottaket trenger bolignummeret kan ikke stå, og
er erstattet. Fritekstfeltet i 4.1 gjelder også «Annet område», ikke bare «Andre
forbedringer». Logoen er satt opp fra 6,5 til 8 mm og tittelen fra 19 til 22 pt.

Søknaden gikk fra 7 til 9 sider: seksjon 3 vokste med leietakerteksten og
dokumentasjonslista, og samtykkearket er en side for seg.

**Åpent:** om Husbanken kontakter foretaket ved kontroll av regningen i
utbetalingsskjemaet står fortsatt, fordi det er en annen situasjon enn søknaden.
Størrelsen på logo og tittel er et forslag, ikke en beslutning. Samtykket fra
eier ved leie må avklares med fagsiden, og teksten skal samsvare med det
husbanken.no lander på.

### Iterasjon 9, språk og samtykkeark

Ni konkrete rettelser, plukket ut fra det som sto som «delvis» og «uforankret»
i sjekklista. Tre av dem lukker kommentarer som til nå manglet forankring.

**Ut av skjemaet:** at det «erstatter den digitale søknaden og inneholder de
samme spørsmålene», og forklaringen av at sirkel betyr ett svar og firkant flere.
Begge steder var det den andre setningen som var overflødig, som to av
kommentarene sa. Samtykketeksten i seksjon 7 er kortet ned til fagsidens
formulering alene; setningen om innhenting fra Folkeregisteret, Kartverket og
Skatteetaten står fra før i seksjon 1.

**Boksen om fagfolk er snudd.** Kravet står nå først, og setningen om egeninnsats
og gratis hjelp fra familie er hentet tilbake etter at den ble mildnet bort i
iterasjon 7. Lista over hva som ikke dekkes sier nå «verdien av arbeid du gjør
selv», ikke bare «arbeid du gjør selv».

**Overskriftene:** «fortsatt» er borte overalt. At samme overskrift står på flere
sider er greit, og bedre enn en halv setning i toppen av arket. Seksjon 4 heter
«Hva skal gjøres i boligen».

**Side 9 er bygget om.** Arket hadde egen ramme, egen tittelstørrelse og egne
felt, og skilte seg fra resten uten grunn. Nå er det vanlig seksjonshode, samme
personaliaboks som seksjon 1, og samme signaturrekkefølge som seksjon 7.
Adressefeltet er tatt bort, siden adressen alt står i seksjon 3. Arket omtales
som «side 9» med sidetall der det vises til, både i spørsmål 1.2 og i
innsendingslista, så det er tydelig hva som menes.

**Varselboksen** under vedleggsboksen klistret seg til den. Den har fått 6 mm
luft over seg, fordi den er en egen beskjed og ikke en fotnote til boksen.

Navnefeilen som sto igjen her, «Brønnøysundregisteret» mot «Brønnøysundregistrene»,
er rettet i iterasjon 10.

### Iterasjon 10, kravene på forsiden

**Forsiden har fått kravlista.** Den digitale søknaden har en veileder som sier
hva som skal til for å få tilskudd, og den samme lista står nå øverst på arket:
alder, eierform, minst én godkjent oppgradering, tilbud som vedlegg,
minstebeløpet, og at du må søke før arbeidet settes i gang. Den svarer på «kan
jeg søke i det hele tatt» før skjemaet begynner å spørre om noe.

To av punktene sto fra før i «Slik bruker du dette skjemaet», og er tatt ut der,
så de ikke står to ganger på samme side. Det panelet handler nå bare om selve
utfyllingen: penn, utskrift, og at det er flere frister i året.

**Merk:** skissen boksen er bygget etter sier «oppgrader for minst 80 000
kroner». Minstekravet ble flyttet til 40 000 i iterasjon 6, så arket sier
40 000. Skissen bør oppdateres.

**Kategori 4.6** har fått forklaringen fra forskriften om hva et Nav-vedtak kan
gjelde, ordrett: hjelpemiddel for tilrettelegging av bolig eller tilskudd til
ombygging.

**Resten:** «Brønnøysundregisteret» er rettet til «Brønnøysundregistrene» begge
steder. Fullmaktsskjemaet i 1.3 sier nå at det ligger på husbanken.no, som
samtykkeskjemaet gjør fra før. Tilbudet om å få samtykkeskjemaet tilsendt i
posten er tatt ut. Side 9 sier «dette arket» i stedet for «hele arket».

### Iterasjon 11, det postmottaket trenger

Papirsøknadene skal registreres i det digitale systemet av Dokumentsenteret i
Bodø. Det de trenger for å få søknaden på riktig bolig, er ikke det samme som
det søkeren tenker på, og skjemaet sa det for vagt.

**Bolignummer og aksjenummer er forklart hver for seg.** Før sto de i én setning
med ordet «seksjonert», som ikke er et ord folk bruker om sitt eget hjem. Nå står
det hva slags bolig det gjelder: borettslag, rekkehus, eller et hus med to eller
flere boliger. Nummeret kalles også **bruksenhetsnummer**, står ofte på dørkarmen
eller ved inngangsdøren, og finnes på kartverket.no. Aksjenummeret har fått et
eksempel på formatet, 450–475, og «aksjebolig» er byttet med
«boligaksjeselskap». Begrunnelsen sier nå at vi ikke finner nummeret i
matrikkelen, som er grunnen til at vi må spørre.

**Dokumentasjonsboksen er snudd.** Den listet opp dokumenttyper, og søkeren måtte
selv finne ut hvilken som gjaldt dem. Nå lister den situasjoner:

- i en flytteprosess: kjøpekontrakt, eller tinglyst skjøte eller grunnboksutskrift hvis kjøpet er tinglyst
- i et arveoppgjør: skifteattest
- gjenlevende ektefelle eller samboer som har arvet: uskifteattest
- boligen i et boligaksjeselskap: aksjeeierbok, aksjebrev, bekreftelse fra styret eller utskrift fra VPS

Aksjeboligdokumentene hadde ingen situasjon å høre til før, siden det ikke
finnes et aksjebolig-alternativ i 3.3. Uskifteattest sto som et alternativ ved
siden av skifteattest, uten at det gikk fram hvem det gjaldt.

**Ikke gjort:** fødselsnummeret står fortsatt som tredje felt i personaliaboksen,
etter fornavn og etternavn, ikke først.

### Iterasjon 12, slik finner du nummeret

Iterasjon 11 forklarte bolignummer og aksjenummer i hver sin hjelpetekst under
feltetiketten. Det holdt ikke: forklaringene er ulike nok, og viktige nok, til å
fortjene hvert sitt spørsmål.

**3.2 er to spørsmål nå,** side om side, med teksten fra den digitale søknaden
ordrett: «Hva er bolignummeret til boligen?» og «Hva er aksjenummeret til
boligen?». Under hvert felt står en «Slik finner du»-boks med det samme som den
digitale løsningen sier: at bolignummeret består av én bokstav og fire tall, at
klistremerket sitter på eller ved siden av døra, hvem man spør i borettslag
eller som leietaker, og at kommunen kan hjelpe. For aksjenummeret: at det står i
aksjebrevet, at det ofte er en serie, og at styret kan svare.

Begrunnelsen om matrikkelen og beskjeden om å la feltene stå åpne er tatt ut.

**Forbehold:** spørsmålsformuleringen for bolignummer er utledet av mønsteret fra
aksjenummer-skissen, som er den eneste som viser overskriften. Setningen «kontakt
kommunen og be de hjelpe deg» er brukt ordrett fra skissen; i bokmål skal det
være «be dem hjelpe deg».

Sidene 3 til 6 er fordelt på nytt. Seksjon 3 deler seg nå etter 3.2 i stedet for
etter 3.3, så 3.3 og de to varselboksene står samlet på side 4, og seksjon 4
begynner på side 5.
