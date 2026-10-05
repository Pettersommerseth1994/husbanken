/* ──────────────────────────────────────────────────────────────────
   Søknaden (pf, «prosjektfinansiering»): oppslag, avledede regler og
   beregninger som flere steg bruker, og eksempelsøknadene som ligger
   på forsiden når prototypen åpnes første gang.
   ────────────────────────────────────────────────────────────────── */

const S = {};

S.TILTAK = {
  OPPFORING: { valg: 'Bygge nye boliger (oppføring)', kort: 'Oppføring', produkt: 'Lån til oppføring' },
  OPPGRADERING: { valg: 'Oppgradere eksisterende boliger', kort: 'Oppgradering', produkt: 'Lån til oppgradering' },
  KJOP: { valg: 'Kjøpe boliger', kort: 'Kjøp', produkt: 'Lån til kjøp' },
  OMBYGGING: { valg: 'Gjøre om bygg til boligformål (ombygging)', kort: 'Ombygging', produkt: 'Lån til ombygging' },
  ENERGITILSKUDD: { valg: 'Energitiltak', kort: 'Energitiltak', produkt: 'Tilskudd til energitiltak' },
  ISTANDSETTING: { valg: 'Istandsette boliger (for utleie)', kort: 'Istandsetting', produkt: 'Tilskudd til istandsetting' }
};
S.LANEFORMAL = { KLIMAVENNLIG: 'Klimavennlig bolig', LIVSLOPSSTANDARD: 'Livsløpsstandard' };
S.PRODUKTNAVN = { OPPFORING: 'Lån til oppføring', KJOP: 'Lån til kjøp', OMBYGGING: 'Lån til ombygging', OPPGRADERING: 'Lån til oppgradering', TILSKUDDUTLEIE: 'Tilskudd til utleieboliger',
  ENERGITILSKUDD: 'Tilskudd til energitiltak', TILSKUDDISTANDSETTING: 'Tilskudd til istandsetting' };
S.VIRKEMIDDEL = { GRUNNLAN: 'Lån', TILSKUDDUTLEIE: 'Tilskudd' };

S.finn = (t, id) => t.soknader.find(s => String(s.id) === String(id));
S.t = null;                       // tilstanden som er lastet på siden
S.nyId = () => eNyId(S.t);

S.tiltak = pf => pf.prosjektTiltakKode;
S.er = (pf, ...koder) => koder.includes(pf.prosjektTiltakKode);
S.harAvtale = pf => ['TILDELING', 'TILVISNING'].includes(pf.kommuneavtaleTypeKode);
S.produkt = (pf, p) => (pf.finansieringsProdukter || []).includes(p);
S.lanProdukt = pf => ['OPPFORING', 'KJOP', 'OMBYGGING', 'OPPGRADERING'].some(p => S.produkt(pf, p));
S.salg = pf => pf.formalKode === 'SALG';
S.utleie = pf => pf.formalKode === 'UTLEIE';
S.oppfOmb = pf => S.er(pf, 'OPPFORING', 'OMBYGGING');
S.kanLeggeTilBoliger = pf => !!pf.prosjektTiltakKode && !S.er(pf, 'KJOP', 'ISTANDSETTING');
S.energi = pf => S.er(pf, 'ENERGITILSKUDD');
S.istand = pf => S.er(pf, 'ISTANDSETTING');
S.kommune = pf => (pf.soker || {}).kundeType === 'KOMMUNE';
S.sykehjem = pf => pf.formalKode === 'SYKEHJEM' && eNum(pf.antallSykehjemplasser) > 0;
/* Husleie spørres om for utleie, men ikke ved istandsetting */
S.husleie = pf => S.utleie(pf) && !S.istand(pf);
/* Kvalitetskrav og boligkonfigurasjoner gjelder ikke når det er avtale med kommunen */
S.visBK = pf => !S.er(pf, 'ENERGITILSKUDD', 'ISTANDSETTING') && (!S.harAvtale(pf) || (S.er(pf, 'OPPFORING') && S.salg(pf)));
S.boligsosialt = pf => S.harAvtale(pf);
/* Totalt BTA, klimagassavtrykk og kjeller spørres om der miljø- og
   livsløpskravene sto før: oppføring og ombygging uten avtale med kommunen. */
S.visKlima = pf => S.oppfOmb(pf) && S.visBK(pf);
S.visPrimaer = pf => S.produkt(pf, 'TILSKUDDUTLEIE');
S.virkemidler = pf => [S.lanProdukt(pf) && 'GRUNNLAN', (S.produkt(pf, 'TILSKUDDUTLEIE') || S.produkt(pf, 'ENERGITILSKUDD') || S.produkt(pf, 'TILSKUDDISTANDSETTING')) && 'TILSKUDDUTLEIE'].filter(Boolean);
S.lantakerOrg = pf => (pf.sokerErLantaker !== false ? pf.soker : pf.lantaker) || null;
S.aktivKunde = pf => (pf.lantaker && pf.lantaker.orgNr ? pf.lantaker : pf.soker);
S.navn = pf => pf.navn || 'Ny søknad';

S.STEG = [
  { path: 'prosjektinformasjon', tittel: 'Prosjekt', ikon: 'personer' },
  { path: 'eiendomsopplysninger', tittel: 'Eiendom', ikon: 'hierarki' },
  { path: 'boligkvaliteter', tittel: 'Bolig', ikon: 'husStor' },
  { path: 'okonomi', tittel: 'Økonomi', ikon: 'kroner' },
  { path: 'vedlegg', tittel: 'Vedlegg', ikon: 'binders' },
  { path: 'kundeopplysninger', tittel: 'Kundeopplysninger', ikon: 'koffert' },
  { path: 'oppsummering', tittel: 'Oppsummering', ikon: 'briller' }
];

/* Stegene i veiviseren avhenger av tiltaket. Energitiltak og istandsetting har egne steg
   i stedet for Økonomi, og energitiltak har ikke Vedlegg. Ved sykehjem hoppes Bolig over. */
S.steg = pf => {
  if (S.energi(pf)) {
    return [
      S.STEG[0], S.STEG[1], ...(S.sykehjem(pf) ? [] : [S.STEG[2]]),
      { path: 'energitilskudd', tittel: 'Energitiltak', ikon: 'energi' },
      { path: 'okonomienergi', tittel: 'Tilskudd og energibesparelse', ikon: 'kroner' },
      S.STEG[5], S.STEG[6]
    ];
  }
  if (S.istand(pf)) return [S.STEG[0], S.STEG[1], S.STEG[2], { path: 'okonomiistandsetting', tittel: 'Økonomi', ikon: 'kroner' }, S.STEG[4], S.STEG[5], S.STEG[6]];
  return S.STEG;
};

/* ═══ Energitiltak ════════════════════════════════════════════════
   Navnene på tiltakene er Husbankens. Satsene er oppdiktede testverdier,
   ikke Husbankens: kroner i tilskudd og kWh i energibesparelse per enhet,
   for småhus, blokk og omsorgsboliger/sykehjem.
   ─────────────────────────────────────────────────────────────────── */

S.ENERGITILTAK = [
  { kode: 'BIOKJEL', navn: 'Biokjel', enhet: 'kW', sats: { SMAHUS: [9400, 2380], BLOKK: [9400, 2380], SYKEHJEM: [9400, 2380] } },
  { kode: 'EISOLKL', navn: 'Etterisolering yttertak / kaldt loft', enhet: 'm²', sats: { SMAHUS: [1800, 25], BLOKK: [900, 22], SYKEHJEM: [1100, 47] } },
  { kode: 'ETTISYT', navn: 'Etterisolering av yttervegger', enhet: 'm²', sats: { SMAHUS: [1850, 36], BLOKK: [1550, 65], SYKEHJEM: [1800, 96] } },
  { kode: 'SOLCELL', navn: 'Solceller', enhet: 'kWp', sats: { SMAHUS: [9500, 790], BLOKK: [9500, 790], SYKEHJEM: [9500, 790] } },
  { kode: 'SOLVKOL', navn: 'Solvarmekollektorer', enhet: 'm²', sats: { SMAHUS: [2500, 400], BLOKK: [2500, 400], SYKEHJEM: [2500, 400] } },
  { kode: 'TERMISO', navn: 'Termisk isolering av rør og deler i energisentral', enhet: 'm', sats: { SMAHUS: [180, 111], BLOKK: [280, 155], SYKEHJEM: [280, 221] } },
  { kode: 'UTSVINV', navn: 'Utskifting vinduer', enhet: 'm²', sats: { SMAHUS: [8000, 40], BLOKK: [8000, 35], SYKEHJEM: [8000, 45] } },
  { kode: 'VARLUVA', navn: 'Varmepumpe luft - vann', enhet: 'kW', sats: { SMAHUS: [6500, 1730], BLOKK: [6500, 1730], SYKEHJEM: [6500, 1730] } },
  { kode: 'VARVAEV', navn: 'Varmepumpe væske - vann', enhet: 'kW', sats: { SMAHUS: [9400, 2380], BLOKK: [9400, 2380], SYKEHJEM: [9400, 2380] } }
];
S.energitiltak = kode => S.ENERGITILTAK.find(t => t.kode === kode);
S.ENERGI_MAKS_TILSKUDD = 5000000;
S.ENERGI_TYPE_TEKST = { SMAHUS: 'småhus', BLOKK: 'blokk', SYKEHJEM: 'sykehjem' };
/* Hvilken bygningstype tiltaket regnes ut som */
S.energiType = (pf, b) => {
  if (['SYKEHJEM', 'OMSORGSYKEHJEM'].includes(pf.formalKode)) return 'SYKEHJEM';
  return S.hbType(pf, b) === 'BLOKK' ? 'BLOKK' : 'SMAHUS';
};
S.energiTiltakIBygg = b => (b.energitiltak || []);
S.energiBeregn = (pf, b, rad) => {
  const t = S.energitiltak(rad.kode);
  if (!t) return { tilskudd: 0, besparelse: 0 };
  const [kr, kwh] = t.sats[S.energiType(pf, b)];
  const v = eNum(rad.verdi);
  return { tilskudd: v * kr, besparelse: v * kwh };
};
/* Alle beregnede rader i prosjektet */
S.energiRader = pf => S.alleValgteBygg(pf).flatMap(({ e, b }) => S.energiTiltakIBygg(b).filter(r => r.kode)
  .map(r => ({ e, b, rad: r, tiltak: S.energitiltak(r.kode), ...S.energiBeregn(pf, b, r) })));
S.energiSum = pf => {
  const r = S.energiRader(pf);
  const tilskudd = r.reduce((s, x) => s + x.tilskudd, 0);
  return { tilskudd, etterMaks: Math.min(tilskudd, S.ENERGI_MAKS_TILSKUDD), besparelse: r.reduce((s, x) => s + x.besparelse, 0) };
};
/* Per tiltak, på tvers av bygg */
S.energiPerTiltak = pf => {
  const m = new Map();
  S.energiRader(pf).forEach(x => {
    const g = m.get(x.tiltak.kode) || { tiltak: x.tiltak, tilskudd: 0, besparelse: 0 };
    g.tilskudd += x.tilskudd; g.besparelse += x.besparelse;
    m.set(x.tiltak.kode, g);
  });
  return [...m.values()].sort((a, b) => a.tiltak.navn.localeCompare(b.tiltak.navn, 'nb'));
};

/* ═══ Istandsetting: 50 % av kostnaden, høyst 150 000 kr per boenhet ═══ */
S.istandTilskudd = fo => Math.min(Math.round(eNum(fo.istandsettingskostnad) * 0.5), 150000);
S.istandSum = pf => S.aktiveBoenheter(pf).reduce((s, fo) => s + S.istandTilskudd(fo), 0);

/* ═══ Eiendom, bygg og adresser ═══════════════════════════════════ */

S.kommuneTekst = e => { const k = eKommune(e.kommuneNr); return k ? `${k.navn} (${k.nr})` : e.kommuneNr || ''; };
S.matrikkelTekst = e => {
  let s = `${e.gaardsNr}/${e.bruksNr}`;
  if (e.festeNr != null && e.festeNr !== '') {
    s += `/${e.festeNr}`;
    if (e.seksjonsNr != null && e.seksjonsNr !== '') s += `/${e.seksjonsNr}`;
  }
  return s;
};
S.eiendomTittel = e => `${S.kommuneTekst(e)} - ${S.matrikkelTekst(e)}`;

S.adresseTekst = a => `${a.veiNavn || ''} ${a.veiNummer ?? ''}${a.veiBokstav || ''}`.trim();
S.bygningstype = kode => E_BYGNINGSTYPER.find(b => b.kode === String(kode));
S.bygningstypeTekst = b => {
  if (!b.fraMatrikkelen) return 'Egendefinert bygg';
  if (String(b.bygningstypeFraMatrikkelen) === '999') return 'Ukjent bygningstype';
  const t = S.bygningstype(b.bygningstypeFraMatrikkelen);
  return t ? t.navn : b.navn;
};
S.kjentType = b => b.fraMatrikkelen && !!S.bygningstype(b.bygningstypeFraMatrikkelen);

/* Alle adresser i et bygg som er med i søknaden */
S.valgteAdresser = b => [...(b.adresserFraMatrikkelen || []).filter(a => a.enabled), ...(b.adresser || [])];
S.byggMed = b => S.valgteAdresser(b).length > 0;
S.alleValgteBygg = pf => (pf.eiendommer || []).flatMap(e => (e.bygg || []).filter(S.byggMed).map(b => ({ e, b })));
S.alleValgteAdresser = pf => S.alleValgteBygg(pf).flatMap(({ e, b }) => S.valgteAdresser(b).map(a => ({ e, b, a })));
S.byggNavn = b => (b.bygningstypeProsjektert && !b.erBygningstypeFraMatrikkelenRiktig ? b.bygningstypeProsjektert : b.navn);

S.boenheter = (pf, adresseId) => (pf.boenheter || []).filter(f => f.adresseId === adresseId);

/* Husbankens bygningstype for et bygg. Rekkehus og lignende regnes som
   blokk når en adresse har flere enn 3 boenheter. */
S.hbType = (pf, b) => {
  let t = null;
  if (b.bygningstypeProsjektert && (!b.erBygningstypeFraMatrikkelenRiktig || !S.kjentType(b))) t = E_BYGNINGSTYPER.find(x => x.navn === b.bygningstypeProsjektert);
  if (!t && b.fraMatrikkelen) t = S.bygningstype(b.bygningstypeFraMatrikkelen);
  if (!t) return 'DUMMY';
  if (t.type === 'SMAHUS*') return S.valgteAdresser(b).some(a => S.boenheter(pf, a.id).length > 3) ? 'BLOKK' : 'SMAHUS';
  return t.type;
};
S.MAKS_BOENHETER = { SMAHUS: 3, ENEBOLIGMEDHYBEL: 2, ENEBOLIG: 1 };
S.maksAreal = (type, bruksenhetsNr) => {
  if (type === 'BLOKK') return 130;
  if (type === 'ENEBOLIG') return 200;
  if (type === 'SMAHUS') return 150;
  if (type === 'ENEBOLIGMEDHYBEL') return Number(bruksenhetsNr) === 1 ? 200 : 80;
  return null;
};
S.arealValideringAv = pf => S.boligsosialt(pf) || S.er(pf, 'OPPGRADERING', 'OPPFORING');

/* Advarsel per boenhet ved oppføring, og om den legges til grunn for utmålingen */
S.utmalingsvarsel = (pf, b, a, fo) => {
  if (!S.er(pf, 'OPPFORING') || S.boligsosialt(pf)) return '';
  const type = S.hbType(pf, b);
  const maks = S.maksAreal(type, fo.bruksenhetsNr);
  const arealOk = !maks || !fo.bruksAreal || eNum(fo.bruksAreal) <= maks;
  const total = S.boenheter(pf, a.id).reduce((s, x) => s + eNum(x.bruksAreal), 0);
  const forStor = type === 'ENEBOLIGMEDHYBEL' && total > 250;
  const ok = !forStor && arealOk;
  const bk = (pf.boligkonfigurasjoner || []).find(k => k.id === fo.bkId);
  if (bk && bk.utenforKvalitetskriterier && !pf.miljoboliger) {
    if (forStor) return 'Boenheten er utenfor våre kvalitetskrav og samlet areal på boligen er over Husbankens grenser – den legges ikke til grunn for utmålingen';
    if (!ok) return 'Boenheten er utenfor våre kvalitetskrav og over våre arealgrenser – den legges ikke til grunn for utmålingen';
    return 'Boenheten er utenfor våre kvalitetskriterier – den legges ikke til grunn for utmålingen';
  }
  if (forStor) return 'Samlet areal på boligen er over Husbankens grenser – den legges ikke til grunn for utmålingen';
  if (!ok) return 'Boenheten er utenfor våre arealgrenser – den legges ikke til grunn for utmålingen';
  return '';
};

S.aktiveBoenheter = pf => {
  const valgte = new Set(S.alleValgteAdresser(pf).map(x => x.a.id));
  return (pf.boenheter || []).filter(f => f.enabled && valgte.has(f.adresseId));
};

/* Etasjekoder: U = underetasje, H = hovedetasje, L = loftsetasje */
S.sorterEtasjer = koder => [...new Set(koder)].sort((x, y) => {
  const r = { U: 0, H: 1, L: 2 };
  if (x[0] !== y[0]) return r[x[0]] - r[y[0]];
  return x[0] === 'U' ? Number(y.slice(1)) - Number(x.slice(1)) : Number(x.slice(1)) - Number(y.slice(1));
});

/* Boenheter fra Matrikkelen for en adresse, to per etasje */
S.lagMatrikkelBoenheter = (pf, a) => {
  if (S.boenheter(pf, a.id).length || !a.antallBoliger) return;
  for (let i = 0; i < a.antallBoliger; i++) {
    pf.boenheter.push({
      id: S.nyId(), adresseId: a.id, etasje: `H${eTo(Math.floor(i / 2) + 1)}`, bruksenhetsNr: eTo((i % 2) + 1),
      enabled: false, fraMatrikkelen: true, bruksAreal: a.bruksareal || undefined, antallRom: a.bruksareal > 90 ? '4' : '3'
    });
  }
};

/* ═══ Økonomi ═════════════════════════════════════════════════════ */

S.okonomi = pf => pf.okonomi || (pf.okonomi = {});
S.sumProsjektkostnader = pf => {
  const o = S.okonomi(pf);
  return ['kjopesum', 'omkostninger', 'utbedringskostnader', 'ombyggingsKostnad', 'oppgraderingsKostnad', 'byggekostnader', 'tomtekostnader']
    .reduce((s, k) => s + eNum(o[k]), 0);
};
S.sumSalgspris = pf => S.aktiveBoenheter(pf).reduce((s, f) => s + eNum(f.salgspris), 0);
/* Tilskudd til utleieboliger. Satsene er oppdiktede testverdier:
   4 000 kr per m² primærareal, høyst 250 000 kr per boenhet. */
S.tilskuddUtleie = pf => (S.produkt(pf, 'TILSKUDDUTLEIE')
  ? S.aktiveBoenheter(pf).reduce((s, f) => s + Math.min(eNum(f.primaerAreal) * 4000, 250000), 0) : 0);
S.sumFinansiering = pf => {
  const o = S.okonomi(pf);
  return S.tilskuddUtleie(pf) + ['grunnlan', 'andrelan', 'egenkapital', 'egenfinansiering', 'andreTilskudd'].reduce((s, k) => s + eNum(o[k]), 0);
};

/* ═══ Vedleggskrav, i samme rekkefølge som i dag ══════════════════ */

S.VEDLEGG = [
  { id: 'BEKREFTELSEAVEGENKAPITAL_VEDLEGG', tittel: 'Bekreftelse av egenkapital', hjelp: 'Skriftlig beskrivelse av egenkapitalens opprinnelse.',
    regel: pf => !S.salg(pf) && eNum(S.okonomi(pf).egenkapital) > 0 },
  { id: 'DRIFTSBUDSJETTFORUTLEIE_VEDLEGG', tittel: 'Driftsbudsjett for utleie', regel: pf => S.husleie(pf) || S.er(pf, 'KJOP') },
  { id: 'DOKUMENTASJONANDRELAN_VEDLEGG', tittel: 'Dokumentasjon på andre lån', hjelp: 'Skriftlig beskrivelse av lån med lånesum, bank, løpetid, restløpetid og rente.',
    regel: pf => !S.salg(pf) && eNum(S.okonomi(pf).andrelan) > 0 },
  { id: 'DOKUMENTASJONTILSKUDDANDRE_VEDLEGG', tittel: 'Dokumentasjon på tilskudd fra andre', hjelp: 'Skriftlig beskrivelse av tilskudd.',
    regel: pf => !S.salg(pf) && eNum(S.okonomi(pf).andreTilskudd) > 0 },
  { id: 'KLIMABUDSJETT_VEDLEGG', tittel: 'Klimabudsjett', hjelp: 'Klimabudsjettet må være laget etter NS 3720:2018.', regel: pf => S.visKlima(pf) },
  { id: 'FASADETEGNINGER_VEDLEGG', tittel: 'Fasadetegninger', hjelp: 'Fasadetegningen må ha angitt målestokk.', regel: pf => S.er(pf, 'OPPFORING', 'OPPGRADERING', 'OMBYGGING') },
  { id: 'FASADETEGNINGERFORTILTAKET_VEDLEGG', tittel: 'Fasadetegninger før tiltaket', hjelp: 'Fasadetegningen må ha angitt målestokk, og skal vise situasjonen før planlagt endring.', regel: pf => S.er(pf, 'OPPGRADERING', 'OMBYGGING') },
  { id: 'FESTEKONTRAKT_VEDLEGG', tittel: 'Festekontrakt', regel: pf => S.alleValgteBygg(pf).some(({ e }) => eNum(e.festeNr) > 0) },
  { id: 'KJOPEKONTRAKT_VEDLEGG', tittel: 'Kjøpekontrakt', regel: pf => S.er(pf, 'KJOP') || S.produkt(pf, 'KJOP') },
  { id: 'PLANTEGNINGER_VEDLEGG', tittel: 'Plantegninger', hjelp: 'Plantegninger må ha angitt målestokk.', regel: pf => S.er(pf, 'OPPFORING', 'OPPGRADERING', 'OMBYGGING') },
  { id: 'PLANTEGNINGERFORTILTAKET_VEDLEGG', tittel: 'Plantegninger før tiltaket', hjelp: 'Plantegninger må ha angitt målestokk, og skal vise situasjonen før planlagt endring.', regel: pf => S.er(pf, 'OPPGRADERING', 'OMBYGGING') },
  { id: 'KONTRAKT_VEDLEGG', tittel: 'Pristilbud/Kontrakt/Prisoverslag på tiltaket', regel: pf => S.er(pf, 'OPPFORING', 'OPPGRADERING', 'OMBYGGING', 'ISTANDSETTING') },
  { id: 'PROSJEKTBESKRIVELSE_VEDLEGG', tittel: 'Prosjektbeskrivelse/Byggbeskrivelse', hjelp: 'Prosjektbeskrivelsen skal inneholde en nærmere spesifisering av prosjektet. Ved oppgradering eller ombygging skal dagens tilstand beskrives.', regel: () => true },
  { id: 'PROSPEKT_VEDLEGG', tittel: 'Prospekt', regel: pf => S.er(pf, 'KJOP') },
  { id: 'SALGSPROSPEKT_VEDLEGG', tittel: 'Salgsprospekt med prisliste', regel: pf => S.salg(pf) },
  { id: 'SAMARBEIDSAVTALE_VEDLEGG', tittel: 'Samarbeidsavtale', hjelp: 'Samarbeidsavtalen mellom kommunen eller det statlige helseforetaket som regulerer det løpende samarbeidet og forvaltningen av boligene.', regel: S.harAvtale },
  { id: 'SKATTEATTEST_VEDLEGG', tittel: 'Skatteattest', regel: pf => pf.sentralGodkjenning === false },
  { id: 'TILDELINGSAVTALE_VEDLEGG', tittel: 'Signert tildelingsavtale', hjelp: 'Mal for tildelingsavtale skal benyttes. <a href="https://www.husbanken.no/" target="_blank" rel="noopener">Last ned mal for tildelingsavtale (PDF, åpner i ny fane)</a>.', regel: pf => pf.kommuneavtaleTypeKode === 'TILDELING' },
  { id: 'TILVISNINGSAVTALE_VEDLEGG', tittel: 'Signert tilvisningsavtale', hjelp: 'Mal for tilvisningsavtale skal benyttes. <a href="https://www.husbanken.no/" target="_blank" rel="noopener">Last ned mal for tilvisningsavtale (PDF, åpner i ny fane)</a>.', regel: pf => pf.kommuneavtaleTypeKode === 'TILVISNING' },
  { id: 'SITUASJONSPLAN_VEDLEGG', tittel: 'Situasjonsplan', hjelp: 'Situasjonsplan må ha angitt målestokk.', regel: pf => S.er(pf, 'OPPFORING', 'OPPGRADERING', 'OMBYGGING') },
  { id: 'SITUASJONSPLANFORTILTAKET_VEDLEGG', tittel: 'Situasjonsplan før tiltaket', hjelp: 'Situasjonsplan må ha angitt målestokk, og skal vise situasjonen før planlagt endring.', regel: pf => S.er(pf, 'OPPGRADERING', 'OMBYGGING') },
  { id: 'TAKST_VEDLEGG', tittel: 'Takst med verdivurdering fra autorisert takstmann', hjelp: 'Gjerne en e-takst. Dersom det ikke er mulig å innhente e-takst, kan det i stedet vedlegges en verditakst eller en annen verdivurdering. Både e-takst, verditakst og andre verdivurderinger må være utarbeidet av en nøytral takstmann eller eiendomsmegler, og bygge både på statistiske data og befaring.', regel: pf => !S.salg(pf) },
  { id: 'ENOVABEREGNING_VEDLEGG', tittel: 'Varmetapsberegning for Enovas krav til oppgradering', hjelp: 'Enten energiattest fra Enovamodulen i Energimerkesystemet eller energiberegning utført av kvalifisert energirådgiver.',
    regel: pf => (pf.boligkonfigurasjoner || []).some(k => (k.koder || []).includes('ENOVAS_OPPGRADERING')) },
  { id: 'UNDERLEVERANDORER_MAKS_TO_LEDD_VEDLEGG', tittel: 'Dokumentasjon av maksimalt to underledd i leverandørkjeden', regel: pf => !S.er(pf, 'KJOP', 'ISTANDSETTING'),
    hjelp: `<p>Når det søkes om lån til finansiering av bygge- og anleggsarbeider, krever Husbanken at hovedleverandøren maksimalt har to ledd under seg i leverandørkjeden. Bestemmelsen gjelder bare selve utførelsen av bygge- og anleggsarbeider og ikke det som knytter seg til planlegging/prosjektering, rådgivning m.m. Bestemmelsen omfatter ikke vareleverandører eller sidestilte underleverandører som har direkte kontrakt med hovedleverandøren.</p>
      <p>I vedlegget skal det fremgå navn, organisasjonsnummer, kontaktperson og kontaktinformasjon til underleverandørene.</p>
      <p>Husbanken kan unntaksvis godta flere ledd i leverandørkjeden. Dette gjelder hvis det er nødvendig med flere ledd for å sikre tilstrekkelig kompetanse og kvalitet. Dette må beskrives i dette vedlegget.</p>
      <p><a href="https://husbanken.no/bransje/" target="_blank" rel="noopener">Les mer om dette i veilederen (åpner i ny fane)</a>.</p>` },
  { id: 'RAMMETILLATELSE', tittel: 'Rammetillatelse', regel: pf => S.alleValgteAdresser(pf).some(({ a }) => !a.fraMatrikkelen) }
];
S.vedleggskrav = pf => S.VEDLEGG.filter(k => k.regel(pf));

/* ═══ Ny søknad ═══════════════════════════════════════════════════ */

S.ny = (t, valg) => {
  const org = eAktivOrg(t);
  const pf = {
    id: eNyId(t), navn: null, status: 'UFERDIG', hilsStatus: 'UKJENT', opprettet: new Date().toISOString(),
    sistEndretDato: new Date().toISOString(), sistEndretAv: E_BRUKER, saksreferanse: null,
    soker: { orgNr: org.orgnr, orgNavn: org.navn, kundeType: org.kundeType },
    eiendommer: [], boenheter: [], boligkonfigurasjoner: [], okonomi: {}, vedlegg: [], besokt: ['prosjektinformasjon'],
    ...valg
  };
  if (pf.prosjektTiltakKode === 'KJOP') pf.formalKode = 'UTLEIE';
  if (S.kommune(pf) && !pf.formalKode) pf.formalKode = 'UTLEIE';   // kommunen bygger, kjøper og istandsetter alltid for utleie
  if (pf.sokerErLantaker !== false) pf.lantaker = { ...pf.soker };
  if (S.oppfOmb(pf)) S.standardKonfigurasjoner(pf, t);
  t.soknader.unshift(pf);
  return pf;
};

/* Boligkonfigurasjonene som lages for oppføring og ombygging */
S.standardKonfigurasjoner = (pf, t) => {
  pf.boligkonfigurasjoner = [
    { id: eNyId(t), navn: 'Ingen boligkvalitet', utenforKvalitetskriterier: true, koder: [] },
    { id: eNyId(t), navn: 'Miljo', utenforKvalitetskriterier: true, koder: [] },
    { id: eNyId(t), navn: 'LIVSLOPSBOLIG_ALLE_KRAV', koder: ['LIVSLOPSBOLIG_ALLE_KRAV'] },
    { id: eNyId(t), navn: 'LIVSLOPSBOLIG_LOEFTEINNRETNING_FORBEREDT', koder: ['LIVSLOPSBOLIG_LOEFTEINNRETNING_FORBEREDT'] }
  ];
};

/* ═══ Eksempelsøknader ════════════════════════════════════════════ */

function eEksempelsoknader(t) {
  const org = E_FORETAK[0];
  const dagerSiden = n => new Date(Date.now() - n * 864e5).toISOString();
  const neste = (m = 0) => { const d = new Date(); d.setMonth(d.getMonth() + m, 1); return `${eTo(d.getMonth() + 1)}.${d.getFullYear()}`; };
  const soker = { orgNr: org.orgnr, orgNavn: org.navn, kundeType: 'UTBYGGER' };
  const id = () => eNyId(t);

  /* 1. Innvilget utleieprosjekt, ferdig utfylt */
  const a1 = id(); const a2 = id();
  const innvilget = {
    id: id(), navn: 'Havnelageret', status: 'INNSENDT', hilsStatus: 'INNVILGET', saksreferanse: '26/01842',
    opprettet: dagerSiden(60), sistEndretDato: dagerSiden(41), sistEndretAv: E_BRUKER, mottattDato: dagerSiden(41),
    prosjektTiltakKode: 'OPPFORING', formalKode: 'UTLEIE', kommuneavtaleTypeKode: 'INGENAVTALE', finansieringsProdukter: ['OPPFORING'],
    soker, sokerErLantaker: true, lantaker: { ...soker },
    oppstart: neste(2), ferdig: neste(20), kjop: false, sentralGodkjenning: true, naerstaendeArbeid: false, forbildeprosjekt: false,
    kontaktinformasjon: { navn: E_BRUKER, epost: 'ola.nordmann@fjordbyen.example', telefonNr: '40000011' },
    eiendommer: [{ id: id(), kommuneNr: '3301', gaardsNr: '112', bruksNr: '9', festeNr: '0', seksjonsNr: '0', fraMatrikkelen: true, bygg: [
      { id: id(), navn: 'Havnelageret', fraMatrikkelen: false, visForValgtTiltak: true, bygningstypeProsjektert: 'Stort frittliggende boligbygg på 3 og 4 etasjer',
        adresserFraMatrikkelen: [], adresser: [{ id: a1, veiNavn: 'Havnegata', veiNummer: '20', veiBokstav: 'A', enabled: true }, { id: a2, veiNavn: 'Havnegata', veiNummer: '20', veiBokstav: 'B', enabled: true }] }] }],
    boenheter: [], boligkonfigurasjoner: [], laneformal: 'KLIMAVENNLIG', miljoboliger: true, livslopsboliger: false,
    klima: { btaTotalt: '1850', co2: '165', oppvarmetKjeller: false },
    okonomi: { byggekostnader: 38500000, tomtekostnader: 4200000, omsetningsverdi: 46000000, gjeld: 0, grunnlan: 36000000, egenkapital: 6700000, lanType: 'ANNUITETSLAN', avdragsfriPeriode: '2', nedbetalingsPeriode: '40' },
    vedlegg: [], kundeskjema: 'ok', besokt: S.STEG.map(s => s.path)
  };
  S.standardKonfigurasjoner(innvilget, t);
  [a1, a2].forEach((adr, ai) => ['H01', 'H02', 'H03'].forEach((et, ei) => ['01', '02'].forEach((nr, ni) => innvilget.boenheter.push({
    id: id(), adresseId: adr, etasje: et, bruksenhetsNr: nr, enabled: true, boligbetegnelse: `${ai ? 'B' : 'A'}${ei + 1}${ni + 1}`,
    bruksAreal: String(58 + ni * 14 + ei * 2), antallRom: String(2 + ni), utleiepris: 14500 + ni * 3500
  }))));
  innvilget.vedlegg = S.vedleggskrav(innvilget).map(k => ({ id: id(), kategori: k.id, tittel: `${k.tittel.toLowerCase().replace(/[^a-zæøå0-9]+/g, '-')}.pdf`, storrelse: 240000 }));

  /* 2. Påbegynt salgsprosjekt som ikke er rørt på lenge */
  const pabegynt = {
    id: id(), navn: 'Solsiden rekkehus', status: 'UFERDIG', hilsStatus: 'UKJENT', opprettet: dagerSiden(90),
    sistEndretDato: dagerSiden(85), sistEndretAv: E_BRUKER,
    prosjektTiltakKode: 'OPPFORING', laneformal: 'LIVSLOPSSTANDARD', livslopsboliger: true, miljoboliger: false, formalKode: 'SALG', finansieringsProdukter: ['OPPFORING'],
    soker, eiendommer: [], boenheter: [], okonomi: {}, vedlegg: [], besokt: ['prosjektinformasjon', 'eiendomsopplysninger'],
    oppstart: neste(3), ferdig: neste(18), kjop: true, omsattApentMarked: true, sentralGodkjenning: false,
    naerstaendeArbeid: false, naerstaendeSelger: false, forbildeprosjekt: false,
    kontaktinformasjon: { navn: E_BRUKER, epost: 'ola.nordmann@fjordbyen.example', telefonNr: '40000011' }, utfyllingssteg: 'eiendomsopplysninger'
  };
  S.standardKonfigurasjoner(pabegynt, t);
  return [pabegynt, innvilget];
}
