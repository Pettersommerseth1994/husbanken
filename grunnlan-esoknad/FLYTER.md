# Flyter i e-søknaden

Diagrammene vises som grafikk på GitHub og i de fleste Markdown-visere.

## 1. Hele reisen

```mermaid
flowchart TD
  A[Søknadsoversikt<br/>index.html] -->|Ny søknad| B[Opprett søknad<br/>opprett-soknad.html]
  A -->|Fortsett på uferdig| W
  A -->|Oversikt| O
  B -->|Opprett søknad| W[Veiviseren<br/>soknad.html]
  W --> O[Oppsummering og signering]
  O -->|Send til signering| K[Kvittering<br/>kvittering.html]
  K --> A
  A -->|La alle signere| I[Status: Innsendt<br/>under behandling]
  I -.->|Innvilget| M[Valg på innvilget søknad]
  M --> M1[Igangsettelse]
  M --> M2[Utsette oppstart]
  M --> M3[Endre låntaker]
  M1 & M2 & M3 --> A
  A -->|Slett, trekk, kanseller| A
```

## 2. Opprett søknad, per kundetype

```mermaid
flowchart TD
  S([Opprett søknad]) --> T{Hvem representerer du?}
  T -->|Utbygger, AS| U1[Hva skal dere gjøre?<br/>Oppføring · Oppgradering · Kjøp · Ombygging]
  T -->|Kommune, Oslo Kommune| K1[Hva skal dere gjøre?<br/>Oppføring · Kjøp · Ombygging · Energitiltak · Istandsetting]

  U1 --> UL{Oppføring?}
  UL -->|Ja| UL1[Velg formål<br/>Klimavennlig · Livsløpsstandard]
  UL -->|Nei| UF
  UL1 --> UF{Kjøp?}
  UF -->|Nei| UF1[Salg eller utleie?]
  UF -->|Ja| UA
  UF1 -->|Utleie| UA[Avtale med kommune?<br/>Tilvisning · Tildeling · Ingen avtale]
  UF1 -->|Salg| UB
  UA -->|Tilvisning| UA1[Antall tilvisningsboliger] --> UB
  UA -->|Tildeling eller ingen| UB{Skal søker være låntaker?}
  UB -->|Nei| UB1[Har låntaker org.nr.?] --> UB2[Velg låntaker] --> P
  UB -->|Ja| P

  K1 --> KE{Energitiltak?}
  KE -->|Ja| KE1[Formål<br/>Utleie · Omsorgsboliger · Sykehjem] --> P
  KE -->|Nei| KO{Oppføring?}
  KO -->|Ja| KO1[Velg formål<br/>Klimavennlig · Livsløpsstandard] --> P
  KO -->|Nei| P
  K1 -.- KN[Alltid utleie, ingen avtale,<br/>kommunen er selv låntaker]

  P[Dine finansieringsmuligheter] --> R([Opprett søknad → veiviseren])
```

Finansieringsmulighetene som tilbys:

| Tiltak | Kan søke om |
| --- | --- |
| Oppføring, kjøp, ombygging, oppgradering | Lån, og tilskudd til utleieboliger (utbygger bare ved tildelingsavtale, og ikke ved oppgradering) |
| Energitiltak (kommune) | Tilskudd til energitiltak |
| Istandsetting (kommune) | Tilskudd til istandsetting |

## 3. Stegene i veiviseren, per tiltak

```mermaid
flowchart LR
  subgraph L[Oppføring, kjøp, ombygging, oppgradering]
    direction LR
    L1[Prosjekt] --> L2[Eiendom] --> L3[Bolig] --> L4[Økonomi] --> L5[Vedlegg] --> L6[Kundeopplysninger] --> L7[Oppsummering]
  end
  subgraph E[Energitiltak, kommune]
    direction LR
    E1[Prosjekt] --> E2[Eiendom] --> E3[Bolig] --> E4[Energitiltak] --> E5[Tilskudd og<br/>energibesparelse] --> E6[Kundeopplysninger] --> E7[Oppsummering]
  end
  subgraph I[Istandsetting, kommune]
    direction LR
    I1[Prosjekt] --> I2[Eiendom] --> I3[Bolig] --> I4[Økonomi:<br/>tilskuddsutmåling] --> I5[Vedlegg] --> I6[Kundeopplysninger] --> I7[Oppsummering]
  end
```

Ved energitiltak med formål **sykehjem** og flere enn 0 sykehjemsplasser hoppes Bolig-steget over.

## 4. Innholdet i hvert steg

```mermaid
flowchart TD
  P[Prosjekt] --> P1[Prosjektnavn]
  P1 --> PX{Tiltak}
  PX -->|Oppføring, ombygging, oppgradering| PA[Periode, kjøp eller eier fra før,<br/>sentral godkjenning, nærstående arbeid,<br/>målgrupper hvis utleie til kommune]
  PX -->|Kjøp| PB[Nye eller brukte boliger,<br/>omsatt i åpent marked, nærstående selger]
  PX -->|Energitiltak| PC[Oppstart og ferdigstillelse,<br/>antall sykehjemsplasser,<br/>tidligere tilskudd og saksnummer]
  PX -->|Istandsetting| PD[Planlagt ferdigstilt,<br/>videretildeles til privat aktør,<br/>målgrupper]
  PA & PB & PC & PD --> P2[Kontaktperson]

  P2 --> EI[Eiendom<br/>Kommune, gårds- og bruksnr. → Hent fra Matrikkelen<br/>→ velg bygg og adresser]
  EI --> BO[Bolig<br/>Etasjer og boenheter]
  BO --> BX{Tiltak}
  BX -->|Oppføring, ombygging| BA[Klimagassavtrykk, BTA, kjeller,<br/>boligkvaliteter eller livsløp, husleie eller salgspris]
  BX -->|Oppgradering| BB[Energikarakter før og etter,<br/>boligkvalitet per bolig]
  BX -->|Energitiltak| BC[Boligbetegnelse, areal, rom, husleie]
  BX -->|Istandsetting| BD[Areal, rom, istandsettingskostnad]
```

## 5. Økonomi, vedlegg og innsending

```mermaid
flowchart TD
  OK{Tiltak} -->|Lån, tilskudd utleie| O1[Økonomi<br/>Kostnader, finansieringsplan,<br/>differanse må bli 0, nedbetalingsvilkår]
  OK -->|Energitiltak| O2[Tilskudd og energibesparelse<br/>Beregnet per bygg, tiltak og prosjekt<br/>Tak 5 mill. kr]
  OK -->|Istandsetting| O3[Tilskuddsutmåling<br/>50 % av kostnad, maks 150 000 kr per boenhet]
  O1 --> V[Vedlegg<br/>Kravene følger av svarene]
  O3 --> V
  O2 -.->|Ingen vedlegg| KU
  V --> KU[Kundeopplysninger]
  KU --> KX{Kundeskjema}
  KX -->|Ikke registrert| KR[Registrer og signer<br/>i eget kundeskjema]
  KX -->|Eldre skjema finnes| KB[Bekreft at opplysningene er riktige]
  KR & KB --> OP[Oppsummering]
  OP --> SG[Velg undertegnere,<br/>e-post og adresse riktig]
  SG --> SB{Gyldig kombinasjon etter<br/>signaturbestemmelsen?}
  SB -->|Nei| SG
  SB -->|Ja, og bekreftet| SS[Send til signering] --> KV[Kvittering]
```

## 6. Status på en søknad

```mermaid
stateDiagram-v2
  [*] --> Uferdig
  Uferdig --> Slettet: Slett, eller etter 90 dager
  Uferdig --> SendtTilSignering: Send til signering
  SendtTilSignering --> SigneringKansellert: Kanseller signering
  SigneringKansellert --> Uferdig: Fortsett
  SendtTilSignering --> SigneringAvvist: Avvist
  SigneringAvvist --> Uferdig: Fortsett
  SendtTilSignering --> Innsendt: Alle har signert
  Innsendt --> UnderBehandling
  UnderBehandling --> FeilMangel: Husbanken tar kontakt
  FeilMangel --> UnderBehandling
  UnderBehandling --> Innvilget
  UnderBehandling --> Avslag
  Innsendt --> Trukket: Trekk søknad
  UnderBehandling --> Trukket: Trekk søknad
  Innvilget --> Utbetalt
  Utbetalt --> Avsluttet
```
