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

   Endringene mellom to iterasjoner merkes i skjemaet med
     data-endret="Hva som er endret her"
   på blokka det gjelder. Bryteren i boksen slår markeringen av og på, og
   nummereringen settes automatisk i dokumentrekkefølge.
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

  /* Blokkene som er endret, nummerert i dokumentrekkefølge */
  const merker = [...document.querySelectorAll('[data-endret]')];
  merker.forEach((el, i) => { el.dataset.nr = i + 1; });

  const punkter = merker.map((el, i) => `
        <li><button type="button" data-gaa-til="${i}" title="${el.dataset.endret}">
          <span class="nr">${i + 1}</span>
          <span class="tekst">${el.dataset.endret}</span>
        </button></li>`).join('');

  const bryter = merker.length
    ? `<label class="versjoner__bryter">
         <input type="checkbox" id="vis-endringer">
         <span class="versjoner__spor"></span>
         <span class="versjoner__bryter-tekst">Vis endringene
           <span class="versjoner__antall">(${merker.length})</span>
         </span>
       </label>
       <ul class="versjoner__liste" hidden>${punkter}</ul>`
    : '';

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
    </p>
    ${bryter}`;

  kropp.insertBefore(rot, kropp.firstChild);

  if (!merker.length) return;

  /* Bryteren. Valget huskes, slik at markeringen står på når man hopper
     mellom iterasjonene. */
  const LAGER = 'hb-viser-endringer';
  const boks = rot.querySelector('#vis-endringer');
  const liste = rot.querySelector('.versjoner__liste');

  function tegn(paa) {
    kropp.classList.toggle('viser-endringer', paa);
    liste.hidden = !paa;
  }

  boks.addEventListener('change', () => {
    tegn(boks.checked);
    try { localStorage.setItem(LAGER, boks.checked ? '1' : '0'); } catch (e) { /* privat modus */ }
  });

  liste.addEventListener('click', e => {
    const knapp = e.target.closest('[data-gaa-til]');
    if (!knapp) return;
    const el = merker[Number(knapp.dataset.gaaTil)];
    merker.forEach(m => m.classList.remove('er-valgt'));
    el.classList.add('er-valgt');

    /* Sidearkene har overflow: hidden, og da stopper scrollIntoView inne i
       arket i stedet for å flytte vinduet. Regner derfor ut posisjonen selv.
       Hopper direkte, uten mykt rull, fordi mykt rull blir ignorert i noen
       visninger og fordi et sprang er raskere når man leter. */
    const boks = el.getBoundingClientRect();
    const midt = boks.top + window.scrollY - (window.innerHeight - boks.height) / 2;
    window.scrollTo(0, Math.max(0, midt));
  });

  let paa = false;
  try { paa = localStorage.getItem(LAGER) === '1'; } catch (e) { /* privat modus */ }
  boks.checked = paa;
  tegn(paa);
})();
