/* ──────────────────────────────────────────────────────────────────
   Stegene som bare finnes for kommuner:
   - Energitiltak (energitilskudd) og Tilskudd og energibesparelse (okonomienergi)
   - Økonomi ved istandsetting (okonomiistandsetting)
   Satsene er oppdiktede testverdier, se S.ENERGITILTAK i soknad.js.
   ────────────────────────────────────────────────────────────────── */

const EN = {
  /* Bygg i søknaden, gruppert per eiendom, med indeksene feltene trenger */
  eiendommer: pf => (pf.eiendommer || []).map((e, i) => ({
    e, i, bygg: (e.bygg || []).map((b, j) => ({ b, j })).filter(({ b }) => S.byggMed(b))
  })).filter(g => g.bygg.length),
  adresser: b => S.valgteAdresser(b).map(S.adresseTekst),
  /* Tiltakene som fortsatt kan velges på en rad: de som ikke ligger på de andre radene i bygget */
  valg: (b, rad) => S.ENERGITILTAK.filter(t => t.kode === rad.kode || !S.energiTiltakIBygg(b).some(r => r.kode === t.kode))
    .map(t => ({ v: t.kode, l: t.navn })),
  alleValgt: b => S.ENERGITILTAK.every(t => S.energiTiltakIBygg(b).some(r => r.kode === t.kode)),
  kWh: n => `${eTusen(n)} kWh`
};

STEG.energitilskudd = {
  foer: pf => { S.alleValgteBygg(pf).forEach(({ b }) => { b.energitiltak = b.energitiltak || []; }); },

  tegn: pf => `
    ${EN.eiendommer(pf).map(({ e, i, bygg }) => `
      <h2 class="e-h2">${eEsc(S.eiendomTittel(e))}</h2>
      ${bygg.map(({ b, j }) => {
        const bp = `eiendommer.${i}.bygg.${j}`;
        const adr = EN.adresser(b);
        const tittel = adr.length > 1 ? `${eEsc(adr[0])}, Antall adresser: ${adr.length}` : eEsc(adr[0] || '');
        const rader = b.energitiltak;
        return `<h3 class="e-h3">${eEsc(S.byggNavn(b))}</h3>
          ${F.trekkspill({ nokkel: `energi-${b.id}`, tittel, kropp: `
            ${adr.length > 1 ? `<ul class="e-liten">${adr.map(a => `<li>${eEsc(a)}</li>`).join('')}</ul>` : ''}
            ${rader.map((r, k) => {
    const t = S.energitiltak(r.kode);
    return `<div class="e-energirad">
                ${F.velg({ felt: `${bp}.energitiltak.${k}.kode`, label: 'Velg energitiltak', valg: EN.valg(b, r), bredde: 'l' })}
                ${F.tall({ felt: `${bp}.energitiltak.${k}.verdi`, label: t ? `Mengde i ${t.enhet}` : 'Enhet', bredde: 's' })}
                <div class="e-energirad__slett"><button type="button" class="e-knapp e-knapp--subtil-destruktiv" data-handling="slettTiltak" data-i="${i}" data-j="${j}" data-k="${k}">${E_IKON.soppel}Slett</button></div>
              </div>`;
  }).join('')}
            ${F.gruppefeil(`${bp}-energi`)}
            ${EN.alleValgt(b)
    ? '<p class="e-sekundaer e-mb0" data-e2e-selector="alle-tiltakstyper-valgt">Du har lagt til alle tiltakene</p>'
    : `<p class="e-mb0"><button type="button" class="e-knapp" data-handling="leggTilTiltak" data-i="${i}" data-j="${j}">${E_IKON.pluss}Legg til tiltak</button></p>`}` })}`;
      }).join('')}`).join('')}
    ${EN.eiendommer(pf).length ? '' : eCallout('advarsel', '<p>Du har ikke valgt noen adresser på Eiendom-steget ennå.</p>')}
    ${F.sammendrag()}
    ${W.knapper()}`,

  valider: pf => {
    const f = [];
    EN.eiendommer(pf).forEach(({ i, bygg }) => bygg.forEach(({ b, j }) => {
      const bp = `eiendommer.${i}.bygg.${j}`;
      if (!b.energitiltak.length) f.push({ nokkel: `${bp}-energi`, melding: 'Du må legge inn minst ett energitiltak' });
      b.energitiltak.forEach((r, k) => {
        const p = `${bp}.energitiltak.${k}`;
        if (!r.kode) f.push({ nokkel: `${p}.kode`, melding: 'Du må velge energitiltak' });
        if (V.tom(r.verdi)) f.push({ nokkel: `${p}.verdi`, melding: 'Du må skrive mengde.' });
        else if (!V.heltall(r.verdi)) f.push({ nokkel: `${p}.verdi`, melding: 'Du kan kun angi hele tall.' });
        else if (eNum(r.verdi) < 1) f.push({ nokkel: `${p}.verdi`, melding: 'Mengden må minimum være 1.' });
        else if (eNum(r.verdi) > 9999999) f.push({ nokkel: `${p}.verdi`, melding: 'Mengden kan ikke være større enn 9999999.' });
      });
    }));
    return f;
  },

  handlinger: {
    leggTilTiltak: (d, pf) => { pf.eiendommer[Number(d.i)].bygg[Number(d.j)].energitiltak.push({ id: S.nyId() }); F.visFeil = false; },
    slettTiltak: (d, pf) => { pf.eiendommer[Number(d.i)].bygg[Number(d.j)].energitiltak.splice(Number(d.k), 1); }
  }
};

/* ═══ Tilskudd og energibesparelse ════════════════════════════════ */

const enTabell = (rader, { medAntall = false, sum, tittelKol = 'Energitiltak' } = {}) => `
  <div class="e-tabell-rulle"><table class="e-tabell">
    <thead><tr><th>${tittelKol}</th>${medAntall ? '<th class="e-tall">Antall</th>' : ''}<th class="e-tall">Tilskudd</th><th class="e-tall">Energibesparelse</th></tr></thead>
    <tbody>${rader.join('')}${sum}</tbody></table></div>`;
const enRad = (navn, antall, tilskudd, besparelse) => `<tr><td>${navn}</td>${antall != null ? `<td class="e-tall">${antall}</td>` : ''}<td class="e-tall">${eKr(tilskudd)}</td><td class="e-tall">${EN.kWh(besparelse)}</td></tr>`;
const enSum = (tilskudd, besparelse, medAntall) => `<tr class="e-tabell__sum"><td>Total</td>${medAntall ? '<td></td>' : ''}<td class="e-tall">${eKr(tilskudd)}</td><td class="e-tall">${EN.kWh(besparelse)}</td></tr>`;

STEG.okonomienergi = {
  bred: true,

  tegn: pf => {
    const sum = S.energiSum(pf);
    const perTiltak = S.energiPerTiltak(pf);
    const reduksjon = sum.tilskudd - sum.etterMaks;
    const grupper = EN.eiendommer(pf);
    return `
      ${eCallout('info', `
        <p class="e-fet">Forbehold: De beregnede verdiene er en indikasjon og ikke det saksbehandlede resultatet.</p>
        <p>Husbanken beregner tilskuddet basert på to faktorer:</p>
        <ul><li>Normerte verdier for redusert energikostnad for de enkelte tiltakene</li><li>Kostnad ved å gjennomføre tiltakene, sammenliknet med standard i markedet</li></ul>
        <p class="e-mb0"><a href="https://husbanken.no/kommune/lan-og-tilskudd/tilskudd-energitiltak/" target="_blank" rel="noopener">Mer informasjon om tilskudd til energitiltak ligger på våre nettsider. (åpner i ny fane)</a></p>`)}
      ${eCallout('info', '<p>Tilskuddet kan ikke overstige 50% av tiltakenes faktiske kostnader. Hvis tilskuddet overstiger 50% av kostnadene vil det bli redusert ved utbetaling.</p>')}

      ${eKort({ tittel: 'Totalt for prosjektet', kropp: enTabell(
    perTiltak.map(g => enRad(eEsc(g.tiltak.navn), null, g.tilskudd, g.besparelse)),
    { sum: `${reduksjon > 0 ? `<tr><td data-e2e-selector="maksimalutmaling">Reduksjon grunnet maksimal utmåling per prosjekt ${F.hjelpKnapp('maks-utmaling')}</td><td class="e-tall">- ${eKr(reduksjon)}</td><td></td></tr>` : ''}${enSum(sum.etterMaks, sum.besparelse)}` })
    + F.hjelpTekst('maks-utmaling', 'Maksimal utmåling per prosjekt er 5 millioner kroner.')
    + '<p class="e-liten e-sekundaer e-mb0">Prototype: satsene er oppdiktede testverdier.</p>' })}

      ${grupper.map(({ e, i, bygg }) => {
    const rader = S.energiRader(pf).filter(x => x.e === e);
    const perT = new Map();
    rader.forEach(x => { const g = perT.get(x.tiltak.kode) || { tiltak: x.tiltak, tilskudd: 0, besparelse: 0 }; g.tilskudd += x.tilskudd; g.besparelse += x.besparelse; perT.set(x.tiltak.kode, g); });
    return `
        ${grupper.length > 1 ? `<h3 class="e-h3 e-mt">Total for eiendom ${eEsc(S.eiendomTittel(e))}</h3>
          ${enTabell([...perT.values()].map(g => enRad(eEsc(g.tiltak.navn), null, g.tilskudd, g.besparelse)), { sum: enSum(rader.reduce((s, x) => s + x.tilskudd, 0), rader.reduce((s, x) => s + x.besparelse, 0)) })}` : ''}
        <h4 class="e-h4 e-mt">Beregning per bygg</h4>
        ${bygg.map(({ b }) => {
    const r = rader.filter(x => x.b === b);
    return `<h5 class="e-h5">Beregnet som ${S.ENERGI_TYPE_TEKST[S.energiType(pf, b)]}${grupper.length > 1 || bygg.length > 1 ? ` (${eEsc(S.byggNavn(b))})` : ''}</h5>
          ${enTabell(r.map(x => enRad(eEsc(x.tiltak.navn), `${eTusen(x.rad.verdi)} ${x.tiltak.enhet}`, x.tilskudd, x.besparelse)),
    { medAntall: true, sum: enSum(r.reduce((s, x) => s + x.tilskudd, 0), r.reduce((s, x) => s + x.besparelse, 0), true) })}`;
  }).join('')}`;
  }).join('')}
      ${W.knapper()}`;
  },

  valider: () => []
};

/* ═══ Økonomi ved istandsetting ═══════════════════════════════════ */

STEG.okonomiistandsetting = {
  tegn: pf => {
    const adresser = new Map(S.alleValgteAdresser(pf).map(x => [x.a.id, x.a]));
    const rader = S.aktiveBoenheter(pf).filter(fo => S.istandTilskudd(fo) > 0);
    return `
      <h2 class="e-h2">Tilskuddsutmåling ${F.hjelpKnapp('istand')}</h2>
      ${F.hjelpTekst('istand', 'Tilskuddet er 50% av istandsettingskostnader (maks 150 000) per boenhet. <a href="https://husbanken.no/kommune/lan-og-tilskudd/" target="_blank" rel="noopener">Mer informasjon om tilskudd ligger på våre nettsider. (åpner i ny fane)</a>')}
      <div class="e-regn">
        ${rader.map((fo, i) => regnRad({ tekst: `${eEsc(S.adresseTekst(adresser.get(fo.adresseId) || {}))} (${fo.etasje}${fo.bruksenhetsNr})`, tegn: i ? '+' : '', verdi: regnTall(S.istandTilskudd(fo)) })).join('')}
        ${regnRad({ tekst: 'Totalt tilskudd', tegn: '=', sum: true, verdi: regnTall(S.istandSum(pf)) })}
      </div>
      ${rader.length ? '' : '<p>Ingen boenheter har istandsettingskostnader ennå.</p>'}
      ${W.knapper()}`;
  },

  valider: () => []
};
