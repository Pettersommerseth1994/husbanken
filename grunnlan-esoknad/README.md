# E-søknad om lån og tilskudd for bransje, dagens løsning

Klikkbar gjenskaping av e-søknaden i Husbankens selvbetjeningsløsning
(Grunnlån e-søknad), slik en eiendomsutvikler eller boligutvikler møter den.
Den går fra søknadsoversikten etter innlogging, gjennom «Opprett søknad» og de
sju stegene, til søknaden er sendt til signering. Laget for å teste flyten fra
start til slutt og for å gjøre endringer i den.

- Ingen innlogging. Du er logget inn som en oppdiktet bruker og representerer
  et oppdiktet foretak. Bytt foretak i profilmenyen øverst til høyre.
- Ingen backend. Søknadene lagres bare i nettleseren.
- Oppslagene mot Altinn, Enhetsregisteret, Matrikkelen, kundeskjemaet og
  signeringstjenesten er erstattet med oppdiktede testdata. Knappen
  «Testdata» i stripa øverst viser hva som finnes.
- Ingen kildekode, konfigurasjon eller data er kopiert fra Husbankens repo.
  Tekstene, feltene, vilkårene, beregningene og feilmeldingene er skrevet av
  derfra. Koden og stilene er skrevet på nytt.

## Kjør lokalt

Fra rota av repoet:

```bash
python3 -m http.server 4321
```

Åpne så <http://localhost:4321/grunnlan-esoknad/>.

## Hva som er med

Kundetypen er bransje («Eiendomsutvikler/Boligutvikler»), med alle de fire
tiltakene bransjen kan velge: oppføring, oppgradering, kjøp og ombygging.
Salg og utleie, avtale med kommunen (tilvisning, tildeling eller ingen),
annen låntaker og tilskudd til utleieboliger virker som i dag.

| Side | Innhold |
| --- | --- |
| `index.html` | Søknadsoversikten med status, «Ny søknad», og menyen på hver søknad. |
| `opprett-soknad.html` | «Opprett søknad»: tiltak, formål, avtale, låntaker og finansieringsmuligheter. |
| `soknad.html` | Veiviseren: Prosjekt → Eiendom → Bolig → Økonomi → Vedlegg → Kundeopplysninger → Oppsummering. |
| `kvittering.html` | «Søknaden er sendt til signering». |
| `endre-lantaker.html`, `igangsettelse.html`, `utsett-oppstart.html` | Valgene på en søknad som er innvilget. |

To eksempelsøknader ligger klare første gang: en påbegynt, som også viser
«Utsett sletting», og en innvilget, som viser igangsettelse, utsatt oppstart og
endre låntaker. «Start på nytt» henter dem tilbake.

Ikke med: fylkeskommune, kommunekontrollerte foretak og borettslag, og
rentekompensasjon for skole. Det gjelder også nynorsk, utlogging og automatisk
utlogging etter 28 minutter.

## Kommune

Bytt til **Oslo Kommune** i profilmenyen øverst til høyre. Da får «Hva skal
dere gjøre?» de fem valgene en kommune har: oppføring, kjøp, ombygging,
energitiltak og istandsetting. En kommune bygger, kjøper og istandsetter alltid
for utleie, har ikke avtale med seg selv og er selv låntaker, så de spørsmålene
er borte. Bare energitiltak spør om formål: utleie, omsorgsboliger eller
sykehjem.

- **Energitiltak** har egne steg i stedet for Økonomi og Vedlegg: Prosjekt,
  Eiendom, Bolig, Energitiltak, Tilskudd og energibesparelse, Kundeopplysninger
  og Oppsummering. Ved sykehjem hoppes Bolig over. På Energitiltak legger man
  til tiltak per bygg, og tilskudd og energibesparelse regnes ut per bygg, per
  tiltak og for prosjektet, med tak på 5 millioner kroner.
- **Istandsetting** har Økonomi som en utmåling: 50 % av istandsettingskostnaden
  per boenhet, høyst 150 000 kroner. Kostnaden legges inn på Bolig-steget.
- **Kjøp av borettslagsleilighet** er en forsøksordning for bostedsløse og
  vanskeligstilte barnefamilier, bare for kommuner og bare tilskudd, ikke lån.
  Forsøksordningen forklares på søknadsoversikten og når valget tas. Stegene er
  Prosjekt, Eiendom, Økonomi, Vedlegg, Kundeopplysninger og Oppsummering.
  Eiendom viser borettslaget (org.nr. og navn) og en liste over boligene, der
  kommunen velger én og fyller ut antall soverom. Økonomi har ett felt,
  kjøpskostnad, og viser foreløpig beregnet tilskudd (10 %). Bare kjøpekontrakt
  og salgsoppgave kreves som vedlegg.
- **Oppføring, kjøp og ombygging** bruker samme steg som for en utbygger, med
  tilskudd til utleieboliger.

Satsene for energitiltak er oppdiktede testverdier, ikke Husbankens. Det er
også gjettet at istandsetting krever vedleggene prosjektbeskrivelse og
pristilbud, og at kommunen signerer etter samme signaturbestemmelse som et
foretak.

## Filene

| Fil | Innhold |
| --- | --- |
| `assets/felles.js` | Testdata (foretak, kommuner, Matrikkelen), lagring, header, footer og dialoger. |
| `assets/felt.js` | Skjemamotoren: feltene, feilmeldingene og tegningen av siden. |
| `assets/soknad.js` | Søknaden: regler, beregninger, vedleggskrav og eksempelsøknadene. |
| `assets/sider.js` | Sidene utenfor veiviseren. |
| `assets/wizard.js` | Veiviseren: stepper, knapperad og navigasjon. |
| `assets/steg-*.js` | Ett steg per fil, med innhold, validering og handlinger. |
| `assets/steg-energi.js` | Stegene bare kommunen har: Energitiltak, Tilskudd og energibesparelse, og Økonomi ved istandsetting. |
| `assets/esoknad.css` | Utseendet, bygget på `../ds/colors_and_type.css`. |

## Slik endrer du et steg

Hvert steg i `assets/steg-*.js` er et objekt i `STEG` med `tegn(pf)` som lager
HTML-en, `valider(pf)` som gir feilene, og `handlinger` for knappene. Et felt
sier selv hvor svaret ligger i søknaden:

```js
F.janei({ felt: 'sentralGodkjenning', label: 'Har foretaket sentral godkjenning?' })
```

Feilene vises når brukeren har trykket «Neste steg», og «Neste steg» går
bare videre når steget er uten feil, som i dag.

## Endret fra dagens løsning

Prototypen er ikke lenger en ren kopi. Disse endringene er gjort med vilje:

- **«Velg formål»** på «Opprett søknad» når tiltaket er oppføring: Klimavennlig
  bolig eller Livsløpsstandard. Livsløpsstandard gir livsløpskolonnene i
  boligtabellen, som før fulgte svaret på Bolig-steget.
- **Bolig-steget** spør ikke lenger om kravene til miljøboliger og
  livsløpsboliger. I stedet spør det om totalt BTA for hele prosjektet, antatt
  kg CO₂-ekv./m² BTA med en forklaring under, og om kjelleren vil være
  oppvarmet. Det gjelder oppføring og ombygging uten avtale med kommunen, der
  de gamle spørsmålene sto.
- **Klimabudsjett** er et nytt vedlegg i de samme tilfellene.

## Avvik fra dagens løsning

- Tilskudd til utleieboliger regnes ut med faste testsatser: 4 000 kroner per
  kvadratmeter primærareal, høyst 250 000 kroner per boenhet.
- Kundeskjemaet og signeringstjenesten er egne løsninger i dag. Her later vi
  som kundeskjemaet blir fylt ut og signert, og personene med signaturrett er
  oppdiktet. «La alle signere» på oversikten sender søknaden videre.
- Opplastede filer lagres ikke, bare navnet og størrelsen.
- «Legg til boenhet» gir neste ledige bolignummer. I dag kopieres nummeret på
  raden, som er en kjent feil.
- Tekster som ligger i Husbankens designsystem og ikke i repoet, som knappene
  i bekreftelsesdialogene og noen standard feilmeldinger, er gjettet.

## Åpne punkter i forsøksordningen

- Nøyaktig ordlyd på feltet «Overtakelsesdato/kjøpsdato».
- Søknadsfristen, og om kjøpet må være foretatt innenfor et bestemt tidsvindu.
  Boksen på Prosjekt sier foreløpig bare at det avklares.
- Innloggingen er ikke med i prototypen, så informasjonen «før innlogging» ligger
  på søknadsoversikten og når valget tas.
- Borettslaget og boligene er oppdiktede testdata fra «Matrikkelen».
