/* ──────────────────────────────────────────────────────────────────
   Husbanken, papirskjema

   Felles oppførsel for de utfyllbare papirskjemaene. Ingen rammeverk,
   ingen byggesteg. Fungerer på file:// og GitHub Pages.

   Skjemaet kan fylles ut i nettleseren og skrives ut derfra, eller
   skrives ut tomt og fylles ut med penn. Begge veier gir samme papir.

   Markering i HTML:
     <form data-papirskjema data-lager="hb-papir-xxx">
     <div class="input-boxes digit-group" data-name="fnr" data-len="11" data-seps="6">
     <div class="q sub-q" data-when="q1_alder:samboer">   ett eller flere
                                                          svar, skilt med |
   ────────────────────────────────────────────────────────────────── */

(function () {
  const form = document.querySelector('form[data-papirskjema]');
  if (!form) return;

  const LAGER = form.dataset.lager || 'hb-papirskjema';
  const indikator = document.getElementById('saved-indicator');

  /* ═══ Sifferruter ═══════════════════════════════════════════════
     Ett siffer per rute, med skilletegn der tallet leses i grupper.
     Fødselsnummer 6+5, kontonummer 4+2+5, slik bankene skriver dem. */

  form.querySelectorAll('.digit-group').forEach(gruppe => {
    const navn = gruppe.dataset.name;
    const antall = parseInt(gruppe.dataset.len, 10);
    const skiller = (gruppe.dataset.seps || '').split(',')
      .filter(Boolean).map(n => parseInt(n, 10));
    let html = '';
    for (let i = 0; i < antall; i++) {
      if (skiller.includes(i)) html += '<span class="sep"></span>';
      html += `<input class="box" type="text" inputmode="numeric" maxlength="1"
                      name="${navn}_${i}" aria-label="${navn} siffer ${i + 1}">`;
    }
    gruppe.innerHTML = html;
  });

  const ruteneI = felt => [...felt.closest('.digit-group').querySelectorAll('input.box')];

  form.addEventListener('input', e => {
    const t = e.target;
    if (t.classList && t.classList.contains('box') && t.value.length === 1) {
      const ruter = ruteneI(t);
      const i = ruter.indexOf(t);
      if (i >= 0 && i < ruter.length - 1) ruter[i + 1].focus();
    }
    lagreSnart();
  });

  form.addEventListener('keydown', e => {
    const t = e.target;
    if (!(t.classList && t.classList.contains('box'))) return;
    const ruter = ruteneI(t);
    const i = ruter.indexOf(t);
    if (e.key === 'Backspace' && !t.value && i > 0) { ruter[i - 1].focus(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' && i > 0) { ruter[i - 1].focus(); e.preventDefault(); }
    if (e.key === 'ArrowRight' && i < ruter.length - 1) { ruter[i + 1].focus(); e.preventDefault(); }
  });

  /* Limer man inn et helt tall, fordeles sifrene utover rutene. */
  form.addEventListener('paste', e => {
    const t = e.target;
    if (!(t.classList && t.classList.contains('box'))) return;
    const limt = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\D/g, '');
    if (!limt) return;
    e.preventDefault();
    const ruter = ruteneI(t);
    const start = ruter.indexOf(t);
    for (let i = 0; i < limt.length && start + i < ruter.length; i++) ruter[start + i].value = limt[i];
    ruter[Math.min(start + limt.length, ruter.length - 1)].focus();
    lagreSnart();
  });

  /* ═══ Beløp ═════════════════════════════════════════════════════
     Grupperes med mellomrom når man går ut av feltet, slik at store
     tall er lette å kontrollere. Ingen omforming mens man skriver. */

  form.querySelectorAll('.input-money input.field').forEach(felt => {
    felt.addEventListener('blur', () => {
      const siffer = felt.value.replace(/\D/g, '');
      if (siffer) felt.value = new Intl.NumberFormat('nb-NO').format(Number(siffer));
    });
  });

  /* ═══ Underspørsmål ═════════════════════════════════════════════
     Feltene blir aldri gjemt eller grået ut. data-when brukes bare til
     å merke hvilket svar de hører til, slik at skjemaet kan si det. */

  function oppdaterUnder() {
    form.querySelectorAll('.sub-q[data-when]').forEach(boks => {
      const [navn, verdier] = boks.dataset.when.split(':');
      const valgt = (form.querySelector(`input[name="${navn}"]:checked`) || {}).value;
      const treff = (verdier || '').split('|').includes(valgt);
      boks.dataset.active = treff ? 'true' : 'false';
    });
  }

  /* ═══ Lagring i nettleseren ═════════════════════════════════════ */

  let klokke = null;
  function lagreSnart() {
    clearTimeout(klokke);
    klokke = setTimeout(lagreNå, 400);
  }

  function lagreNå() {
    const data = {};
    form.querySelectorAll('input, textarea').forEach(el => {
      if (!el.name) return;
      if (el.type === 'radio' || el.type === 'checkbox') {
        if (el.checked) data[el.name + '__' + el.value] = true;
      } else {
        data[el.name] = el.value;
      }
    });
    form.querySelectorAll('[contenteditable="true"][data-name]').forEach(el => {
      data['ce__' + el.dataset.name] = el.innerText;
    });
    try {
      localStorage.setItem(LAGER, JSON.stringify({ data, ts: Date.now() }));
      if (!indikator) return;
      indikator.textContent = 'Lagret';
      indikator.style.color = 'var(--hb-green-700)';
      setTimeout(() => { indikator.textContent = 'Lagrer automatisk'; indikator.style.color = ''; }, 1500);
    } catch (e) { /* full kvote eller privat modus */ }
  }

  function hentFram() {
    try {
      const rå = localStorage.getItem(LAGER);
      if (!rå) return;
      const { data } = JSON.parse(rå);
      Object.entries(data).forEach(([nøkkel, verdi]) => {
        if (nøkkel.startsWith('ce__')) {
          const el = form.querySelector(`[contenteditable="true"][data-name="${nøkkel.slice(4)}"]`);
          if (el) el.innerText = verdi;
          return;
        }
        if (nøkkel.includes('__')) {
          const [navn, verdi2] = nøkkel.split('__');
          const el = form.querySelector(`input[name="${navn}"][value="${verdi2}"]`);
          if (el && verdi) el.checked = true;
          return;
        }
        form.querySelectorAll(`[name="${nøkkel}"]`).forEach(el => {
          if (el.type === 'checkbox') el.checked = !!verdi;
          else el.value = verdi;
        });
      });
    } catch (e) { /* ødelagt lagring, la skjemaet stå tomt */ }
  }

  form.addEventListener('change', () => { oppdaterUnder(); lagreNå(); });
  form.addEventListener('input', lagreSnart);
  form.querySelectorAll('[contenteditable="true"]').forEach(el =>
    el.addEventListener('input', lagreSnart));

  /* ═══ Verktøylinja ══════════════════════════════════════════════ */

  const skrivUt = document.getElementById('btn-print');
  if (skrivUt) skrivUt.addEventListener('click', () => window.print());

  const tøm = document.getElementById('btn-reset');
  if (tøm) tøm.addEventListener('click', () => {
    if (!confirm('Tømme alle felter? Dette kan ikke angres.')) return;
    form.reset();
    form.querySelectorAll('input.box').forEach(b => b.value = '');
    form.querySelectorAll('[contenteditable="true"]').forEach(el => el.innerText = '');
    try { localStorage.removeItem(LAGER); } catch (e) { /* ignorer */ }
    oppdaterUnder();
    if (indikator) {
      indikator.textContent = 'Tømt';
      setTimeout(() => indikator.textContent = 'Lagrer automatisk', 1500);
    }
  });

  hentFram();
  oppdaterUnder();
})();
