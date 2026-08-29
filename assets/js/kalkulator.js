/* ──────────────────────────────────────────────────────────────────
   Kalkulatoren

   Brukertestene pekte på tre konkrete feil vi må designe bort:
     · Tom og Magne trodde 80 000 var beløpet de kunne få.
     · Tom oppdaget aldri 300 000-taket.
     · Ingunn forstod tallene, men glemte 80 000 fordi det stod
       et annet sted enn prosenten, og ba selv om alt i én visning.

   Derfor: én boks som samtidig viser minstekrav, sats, kostnadstak
   og makstilskudd — og en fast skala 0–500 000 slik at de to grensene
   ligger på samme sted uansett hva du taster inn.
   ────────────────────────────────────────────────────────────────── */

function hbKalkulatorHTML(id, opts = {}) {
  const { start = 250000, tittel = 'Regn ut hva du kan få' } = opts;
  const R = HB_REGLER;

  return `
<div class="hb-calc" id="${id}" data-start="${start}">
  <div class="hb-calc__head">
    <h2 style="margin-bottom:var(--space-2)">${tittel}</h2>
    <p class="hb-small" style="margin:0">
      Tilskuddet er <strong>${Math.round(R.sats * 100)} %</strong> av det du oppgraderer for.
      Du må oppgradere for minst <strong>${hbKr(R.minstekostnad)}</strong>, og vi regner
      ikke på beløp over <strong>${hbKr(R.kostnadstak)}</strong>.
      Mest mulig er derfor <strong>${hbKr(R.maksTilskudd)}</strong>.
    </p>
  </div>

  <div class="hb-calc__body">
    <div class="hb-field hb-calc__amount">
      <label class="hb-field__label" for="${id}-belop">Hva kommer oppgraderingen til å koste?</label>
      <span class="hb-field__help" id="${id}-hjelp">
        Bruk summen fra tilbudet eller prisoverslaget ditt. Inkludert arbeid og materialer.
      </span>
      <div class="hb-input-group">
        <input class="hb-input" id="${id}-belop" type="text" inputmode="numeric"
               autocomplete="off" aria-describedby="${id}-hjelp" value="">
        <span class="hb-input-suffix">kroner</span>
      </div>
    </div>

    <div class="hb-slider">
      <label class="hb-field__label" for="${id}-slider">Eller dra i knappen</label>
      <input id="${id}-slider" type="range"
             min="0" max="${R.sliderMaks}" step="${R.sliderSteg}" value="${start}"
             aria-label="Hva oppgraderingen koster, i kroner">
      <div class="hb-slider__scale" aria-hidden="true">
        <span>0 kr</span><span>${hbTall(R.sliderMaks / 2)} kr</span><span>${hbTall(R.sliderMaks)} kr</span>
      </div>
    </div>

    <div class="hb-bar">
      <div class="hb-bar__track" role="img" id="${id}-bar-desc" aria-label="">
        <div class="hb-bar__seg hb-bar__seg--under" style="width:0"></div>
        <div class="hb-bar__seg hb-bar__seg--paid"  style="width:0"></div>
        <div class="hb-bar__seg hb-bar__seg--over"  style="width:0"></div>
      </div>
      <div class="hb-bar__marks" aria-hidden="true">
        <div class="hb-bar__mark" style="left:${(R.minstekostnad / R.sliderMaks) * 100}%">
          <b>${hbTall(R.minstekostnad)} kr</b>minstekrav
        </div>
        <div class="hb-bar__mark" style="left:${(R.kostnadstak / R.sliderMaks) * 100}%">
          <b>${hbTall(R.kostnadstak)} kr</b>tak
        </div>
      </div>
      <div class="hb-legend" aria-hidden="true">
        <span><i style="background:var(--hb-green-600)"></i> Gir tilskudd</span>
        <span><i style="background:var(--hb-slate-300)"></i> Under minstekravet</span>
        <span><i style="background:repeating-linear-gradient(135deg,var(--hb-slate-200) 0 6px,var(--hb-slate-100) 6px 12px);border:1px solid var(--hb-slate-300)"></i> Over taket — gir ikke mer</span>
      </div>
    </div>

    <div class="hb-result">
      <div class="hb-result__hero" data-hero>
        <span class="hb-result__key" data-hero-label>Du får i tilskudd</span>
        <strong class="hb-result__val" data-hero-val aria-live="polite">–</strong>
        <p class="hb-small" style="margin:var(--space-2) 0 0" data-hero-tekst></p>
      </div>

      <div class="hb-result__row">
        <span class="hb-result__key">Du oppgraderer for</span>
        <span class="hb-result__val" data-r-kostnad>–</span>
      </div>
      <div class="hb-result__row">
        <span class="hb-result__key">Vi regner tilskudd av <span class="hb-muted">(maks ${hbTall(HB_REGLER.kostnadstak)} kr)</span></span>
        <span class="hb-result__val" data-r-grunnlag>–</span>
      </div>
      <div class="hb-result__row">
        <span class="hb-result__key">Tilskudd, ${Math.round(HB_REGLER.sats * 100)} % av dette</span>
        <span class="hb-result__val" data-r-tilskudd>–</span>
      </div>
      <div class="hb-result__row">
        <span class="hb-result__key"><strong>Du betaler selv</strong></span>
        <span class="hb-result__val" data-r-egen>–</span>
      </div>
    </div>

    <div class="hb-note hb-note--warn" style="margin-top:var(--space-4)" data-forskudd>
      <span class="hb-note__icon">${HB_IKON.varsel}</span>
      <div>
        <strong>Du må legge ut for hele regningen først.</strong>
        <p class="hb-small" style="margin:4px 0 0" data-forskudd-tekst></p>
      </div>
    </div>
  </div>
</div>`;
}

function hbKalkulatorInit(id, ved = null) {
  const rot = document.getElementById(id);
  if (!rot) return null;

  const R = HB_REGLER;
  const felt   = rot.querySelector(`#${id}-belop`);
  const slider = rot.querySelector(`#${id}-slider`);
  const bar    = rot.querySelector('.hb-bar__track');
  const segU   = rot.querySelector('.hb-bar__seg--under');
  const segP   = rot.querySelector('.hb-bar__seg--paid');
  const segO   = rot.querySelector('.hb-bar__seg--over');
  const hero   = rot.querySelector('[data-hero]');

  const el = s => rot.querySelector(s);
  const pst = v => Math.max(0, Math.min(100, (v / R.sliderMaks) * 100));

  let verdi = Number(rot.dataset.start) || 0;

  function tegn(oppdaterFelt = true) {
    const b = hbBeregn(verdi);

    if (oppdaterFelt && document.activeElement !== felt) felt.value = hbTall(verdi);
    slider.value = Math.min(verdi, R.sliderMaks);

    /* Søylen */
    const under = b.status === 'under' ? pst(b.kostnad) : 0;
    const betalt = b.status === 'under' ? 0 : pst(Math.min(b.kostnad, R.kostnadstak));
    const over = pst(b.overTaket);
    segU.style.width = under + '%';
    segP.style.width = betalt + '%';
    segO.style.width = over + '%';
    bar.setAttribute('aria-label',
      `Du oppgraderer for ${hbKr(b.kostnad)}. Minstekravet er ${hbKr(R.minstekostnad)} og taket for utregning er ${hbKr(R.kostnadstak)}.`);

    /* Tallene */
    el('[data-r-kostnad]').textContent  = hbKr(b.kostnad);
    el('[data-r-grunnlag]').textContent = hbKr(b.grunnlag);
    el('[data-r-tilskudd]').textContent = hbKr(b.tilskudd);
    el('[data-r-egen]').textContent     = hbKr(b.egenandel);

    /* Hovedsvaret, formulert etter hva som faktisk stopper folk */
    const val = el('[data-hero-val]');
    const lab = el('[data-hero-label]');
    const txt = el('[data-hero-tekst]');

    if (b.status === 'under') {
      hero.classList.add('hb-result__hero--zero');
      lab.textContent = 'Du får ikke tilskudd';
      val.textContent = '0 kr';
      txt.innerHTML = `Oppgraderingen må koste minst <strong>${hbKr(R.minstekostnad)}</strong>.
        Du mangler <strong>${hbKr(b.mangler)}</strong>. Du kan gjerne slå sammen flere
        oppgraderinger i én søknad for å komme over kravet.`;
    } else {
      hero.classList.remove('hb-result__hero--zero');
      lab.textContent = 'Du får i tilskudd';
      val.textContent = hbKr(b.tilskudd);
      txt.innerHTML = b.status === 'tak'
        ? `Du er over taket. De <strong>${hbKr(b.overTaket)}</strong> som ligger over
           ${hbKr(R.kostnadstak)} gir ikke mer tilskudd. ${hbKr(R.maksTilskudd)} er mest mulig.`
        : `Dette er ${Math.round(R.sats * 100)} % av ${hbKr(b.grunnlag)}.
           Tilskudd er penger du ikke betaler tilbake.`;
    }

    /* Forskutteringen — sju av åtte pekte på denne som den reelle stopperen.
       Da skal den stå i klartekst her, ikke dukke opp som en overraskelse. */
    const fBoks = el('[data-forskudd]');
    if (b.tilskudd > 0) {
      fBoks.hidden = false;
      el('[data-forskudd-tekst]').innerHTML =
        `Du betaler <strong>${hbKr(b.kostnad)}</strong> til håndverkeren.
         Tilskuddet på <strong>${hbKr(b.tilskudd)}</strong> får du på konto etter at
         arbeidet er ferdig og du har sendt oss kvitteringen.`;
    } else {
      fBoks.hidden = true;
    }

    if (typeof ved === 'function') ved(b);
  }

  function sett(nyVerdi, oppdaterFelt = true) {
    verdi = Math.max(0, Math.min(9999999, Math.round(nyVerdi)));
    tegn(oppdaterFelt);
  }

  felt.addEventListener('input', () => {
    const rå = hbParseTall(felt.value);
    const pos = felt.selectionStart;
    const førLengde = felt.value.length;
    sett(rå, false);
    felt.value = rå ? hbTall(rå) : '';
    /* Behold markøren omtrent der brukeren hadde den, tross mellomrom. */
    const diff = felt.value.length - førLengde;
    try { felt.setSelectionRange(pos + diff, pos + diff); } catch { /* ignorer */ }
  });
  felt.addEventListener('blur', () => { felt.value = hbTall(verdi); });

  slider.addEventListener('input', () => sett(Number(slider.value)));

  sett(verdi);

  return { sett, hent: () => verdi, beregn: () => hbBeregn(verdi) };
}
