/* ──────────────────────────────────────────────────────────────────
   Husbanken, papirskjema, versjonsvelger

   Skjemaene endres etter tilbakemeldinger, og hver iterasjon blir liggende
   som egen fil. Denne fila er lista over dem, og tegner cellene øverst på
   siden slik at man kan hoppe mellom versjonene.

   Slik legger du til en ny iterasjon:
     1. Kopier gjeldende skjema til ...-vN.html, og CSS-en til
        assets/css/hb-papir-vN.css. Pek den nye kopien på den pinnede CSS-en,
        og gi den sin egen data-lager, så utfyllingen ikke blandes.
     2. Legg inn en ny oppføring nederst i HB_VERSJONER, der «gjeldende»
        peker på filene uten suffiks.
     3. Sett data-versjon på <body> i den nye kopien.

   Sidene sier selv hvor de er, med
     <body data-skjema="soknad|utbetaling" data-versjon="2">
   ────────────────────────────────────────────────────────────────── */

const HB_VERSJONER = [
  {
    nr: 1,
    navn: 'Første utkast',
    dato: '3. september 2026',
    endring: 'Bygget på malen for HB 7.S.21, med regnestykket som fire linjer søkeren fyller ut selv.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v1.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v1.html'
    }
  },
  {
    nr: 2,
    navn: 'Etter gjennomgang',
    dato: '4. september 2026',
    endring: 'Regnestykket forenklet til ett felt, feltene i 1.2 flyttet opp under svaret de hører til, oppgraderingene tydeliggjort som eksempler, inntekt og prioritering forklart, slagordet fjernet.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling.html'
    }
  }
];

(function () {
  const kropp = document.body;
  const skjema = kropp.dataset.skjema;          // soknad | utbetaling
  const naa = Number(kropp.dataset.versjon);
  if (!skjema || !naa) return;

  const gjeldende = HB_VERSJONER.find(v => v.nr === naa);
  const siste = HB_VERSJONER[HB_VERSJONER.length - 1];
  if (!gjeldende) return;

  /* Cellene viser bare nummeret, så raden tåler mange iterasjoner.
     Navn, dato og hva som endret seg står i linja under. */
  const celler = HB_VERSJONER.map(v => {
    const tittel = `Iterasjon ${v.nr}, ${v.navn}, ${v.dato}`;
    return v.nr === naa
      ? `<span class="versjoner__celle" aria-current="page" title="${tittel}">${v.nr}</span>`
      : `<a class="versjoner__celle" href="${v.filer[skjema]}" title="${tittel}">${v.nr}</a>`;
  }).join('');

  const eldre = naa !== siste.nr;

  const rot = document.createElement('nav');
  rot.className = 'versjoner';
  rot.setAttribute('aria-label', 'Versjoner av skjemaet');
  rot.innerHTML = `
    <div class="versjoner__rad">
      <span class="versjoner__hint">Iterasjon</span>
      <div class="versjoner__celler">${celler}</div>
    </div>
    <p class="versjoner__endring">
      <b>${gjeldende.nr}. ${gjeldende.navn}, ${gjeldende.dato}</b>
      ${eldre ? '<em class="versjoner__eldre">Dette er en eldre iterasjon.</em> ' : ''}${gjeldende.endring}
      ${eldre ? `<a href="${siste.filer[skjema]}">Gå til den siste</a>.` : ''}
    </p>`;

  kropp.insertBefore(rot, kropp.firstChild);
})();
