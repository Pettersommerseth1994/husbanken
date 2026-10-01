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

Ikke med: kommune, fylkeskommune, kommunekontrollerte foretak og borettslag,
energitiltak, istandsetting og rentekompensasjon for skole. Det gjelder også
nynorsk, utlogging og automatisk utlogging etter 28 minutter.

## Filene

| Fil | Innhold |
| --- | --- |
| `assets/felles.js` | Testdata (foretak, kommuner, Matrikkelen), lagring, header, footer og dialoger. |
| `assets/felt.js` | Skjemamotoren: feltene, feilmeldingene og tegningen av siden. |
| `assets/soknad.js` | Søknaden: regler, beregninger, vedleggskrav og eksempelsøknadene. |
| `assets/sider.js` | Sidene utenfor veiviseren. |
| `assets/wizard.js` | Veiviseren: stepper, knapperad og navigasjon. |
| `assets/steg-*.js` | Ett steg per fil, med innhold, validering og handlinger. |
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
