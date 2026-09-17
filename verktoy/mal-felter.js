/* ──────────────────────────────────────────────────────────────────
   Måler hvor skjemafeltene ligger, og hva de heter.

   Kjøres av lag-utfyllbar-pdf.py i en hodeløs nettleser. Resultatet
   legges i elementet pre#felter-json og plukkes ut av DOM-en, så
   feltkartet er målt på samme layout som PDF-en skrives ut fra og ikke
   kan bli utdatert.

   Koordinatene er i millimeter fra øvre venstre hjørne av hver .page.
   ────────────────────────────────────────────────────────────────── */
(function () {
  const ren = t => String(t || '').replace(/\s+/g, ' ').trim();
  const sider = [...document.querySelectorAll('.page')];
  if (!sider.length) return;
  const pxmm = sider[0].getBoundingClientRect().width / 210;

  /* Spørsmålet feltet hører under, og seksjonen over det. Skjermlesere
     leser bare feltets egen beskrivelse, så konteksten må inn i den. */
  const sporsmal = el => {
    const q = el.closest('fieldset.q, .q');
    const l = q && q.querySelector('legend.q-label, .q-label');
    return l ? ren(l.textContent) : '';
  };
  const seksjon = el => {
    const s = el.closest('.section');
    const h = s && s.querySelector('.section-header h2');
    return h ? ren(h.textContent) : '';
  };
  const forLab = el => {
    if (!el.id) return '';
    const l = document.querySelector('label[for="' + el.id + '"]');
    return l ? ren(l.textContent) : '';
  };
  /* Første tekstnode i svaret, ikke hjelpeteksten under det */
  const svarLab = el => {
    const b = el.parentElement.querySelector('.opt-body');
    if (!b) return '';
    return ren((b.childNodes[0] && b.childNodes[0].textContent) || b.textContent);
  };

  const felter = [];
  sider.forEach((side, i) => {
    const sr = side.getBoundingClientRect();
    const boks = el => {
      const r = el.getBoundingClientRect();
      return {
        x: +((r.left - sr.left) / pxmm).toFixed(2),
        y: +((r.top - sr.top) / pxmm).toFixed(2),
        w: +(r.width / pxmm).toFixed(2),
        h: +(r.height / pxmm).toFixed(2)
      };
    };
    const legg = (kontekst, o) => felter.push({
      s: i, sp: sporsmal(kontekst), sek: seksjon(kontekst), ...o
    });

    side.querySelectorAll('input.field-input, input.input-line').forEach(el => {
      if (el.closest('.digit-group')) return;
      legg(el, { t: 'text', n: el.name || el.id, lab: forLab(el), ...boks(el) });
    });

    side.querySelectorAll('.digit-group').forEach(g => {
      const navn = g.dataset.name;
      const lg = g.closest('fieldset') && g.closest('fieldset').querySelector('legend');
      [...g.querySelectorAll('input')].forEach((el, j) => legg(g, {
        t: 'siffer', n: navn + '_' + (j + 1),
        lab: ren(el.getAttribute('aria-label')
                 || (lg ? ren(lg.textContent) : '') + ', siffer ' + (j + 1)),
        ...boks(el)
      }));
    });

    side.querySelectorAll('textarea').forEach(el => legg(el, {
      t: 'omrade', n: el.name || el.id,
      lab: ren(el.getAttribute('aria-label') || forLab(el)), ...boks(el)
    }));

    /* Selve inputen er skjult, så merket er det som skal treffes */
    side.querySelectorAll('.opt input[type=checkbox]').forEach(el => legg(el, {
      t: 'kryss', n: el.name, lab: svarLab(el),
      ...boks(el.parentElement.querySelector('.mark'))
    }));
    side.querySelectorAll('.opt input[type=radio]').forEach(el => legg(el, {
      t: 'radio', n: el.name, v: el.value, lab: svarLab(el),
      ...boks(el.parentElement.querySelector('.mark'))
    }));

    side.querySelectorAll('.sig-line[contenteditable]').forEach(el => {
      const l = document.getElementById(el.getAttribute('aria-labelledby'));
      legg(el, { t: 'text', n: el.dataset.name, lab: l ? ren(l.textContent) : '', ...boks(el) });
    });
  });

  const pre = document.createElement('pre');
  pre.id = 'felter-json';
  pre.textContent = JSON.stringify(felter);
  document.body.appendChild(pre);
})();
