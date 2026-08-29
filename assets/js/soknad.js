/* ──────────────────────────────────────────────────────────────────
   Søknadsflyten — seks steg

   Gjennomgående grep fra brukertestene:
     · Målgruppen er redd for å gjøre feil. Hjelpetekstene sier derfor
       hva som er greit, ikke bare hva som er forbudt.
     · Ingen viktig informasjon gjemmes i trekkspill.
     · «Forrige» går alltid ett steg tilbake, aldri i loop.
     · Ett spørsmål av gangen, store trykkflater, tydelig kvittering.
   ────────────────────────────────────────────────────────────────── */

const TILTAK = [
  { id: 'adkomst', navn: 'Trinnfri adkomst',
    hjelp: 'Fjerne terskler og trinn, lage rampe, eller senke inngangspartiet.' },
  { id: 'bad', navn: 'Bad og toalett',
    hjelp: 'Dusj uten kant, støttehåndtak, mer plass, eller bad på inngangsplanet.' },
  { id: 'trapp', navn: 'Trapp og rekkverk',
    hjelp: 'Rekkverk på begge sider, kontrastmerking av trinn, eller trappeheis.' },
  { id: 'dorer', navn: 'Dører og passasjer',
    hjelp: 'Utvide døråpninger, automatisk døråpner, eller rette opp trange ganger.' },
  { id: 'lys', navn: 'Belysning',
    hjelp: 'Bedre lys i trapp, gang, bad og ute. Lys som slår seg på av seg selv.' },
  { id: 'trygghet', navn: 'Trygghet i boligen',
    hjelp: 'Komfyrvakt, vannlekkasjestopper, sammenkoblede røykvarslere, fallsikring.' }
];

const STEG = [
  { nr: 1, tittel: 'Om deg' },
  { nr: 2, tittel: 'Boligen din' },
  { nr: 3, tittel: 'Hva skal gjøres' },
  { nr: 4, tittel: 'Hva det koster' },
  { nr: 5, tittel: 'Dokumentasjon' },
  { nr: 6, tittel: 'Se over og send' }
];

let D = {};          // søknadsdata
let steg = 1;
let kalkApi = null;  // referanse til kalkulatoren i steg 4

/* ═══ Små byggeklosser ════════════════════════════════════════════ */

const guide = (tekst, navn = 'Bodil') => `
  <div class="hb-guide" style="margin-block:var(--space-5)">
    ${HB_AVATAR}
    <p style="margin:0">${tekst}</p>
  </div>`;

const feil = (id) => `<div class="hb-error" id="${id}" hidden></div>`;

/* ═══ Stegene ═════════════════════════════════════════════════════ */

const SIDER = {

  /* ─── 1. Om deg ────────────────────────────────────────────────── */
  1: {
    h1: 'Om deg',
    ingress: 'Vi har hentet disse opplysningene fra Folkeregisteret. Er noe feil, kan du rette det opp hos Skatteetaten.',
    html: () => `
      ${guide(`Du trenger ikke skrive inn navn, adresse eller fødselsnummer.
               Vi har det allerede. Se bare over at det stemmer.`)}

      <div class="hb-summary" style="margin-bottom:var(--space-5)">
        <div class="hb-summary__group">
          <dl>
            <dt>Navn</dt><dd>${D.navn || 'Bodil Innbygger'}</dd>
            <dt>Fødselsnummer</dt><dd class="hb-num">${D.fnr || '130456 12345'}</dd>
            <dt>Adresse</dt><dd>${D.adresse || 'Bjerkeveien 14 B, 0765 Oslo'}</dd>
          </dl>
        </div>
      </div>

      <fieldset style="border:0;padding:0;margin:0 0 var(--space-4)">
        <legend class="hb-field__label" style="padding:0">Er du over 62 år?</legend>
        <span class="hb-field__help">
          Du kan også søke hvis du bor sammen med noen som er over 62 år.
        </span>
        <label class="hb-choice">
          <input type="radio" name="alder" value="selv" ${D.alder === 'selv' ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Ja, jeg er over 62 år</span>
            <span class="hb-choice__desc">Vi ser at du er født i ${D.fodselsaar || 1956}.</span>
          </span>
        </label>
        <label class="hb-choice">
          <input type="radio" name="alder" value="samboer" ${D.alder === 'samboer' ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Nei, men jeg bor med en som er det</span>
            <span class="hb-choice__desc">Ektefelle, samboer eller annen du deler bolig med.</span>
          </span>
        </label>
        <label class="hb-choice">
          <input type="radio" name="alder" value="nei" ${D.alder === 'nei' ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Nei, ingen i husstanden er over 62</span>
          </span>
        </label>
        ${feil('feil-alder')}
      </fieldset>

      <div id="alder-stopp" hidden>
        <div class="hb-note hb-note--stop">
          ${HB_IKON.varsel}
          <div>
            <strong>Da kan du dessverre ikke få dette tilskuddet.</strong>
            <p class="hb-small" style="margin:4px 0 0">
              Ordningen gjelder husstander der minst én person er over 62 år.
              Kommunen din har andre ordninger som kanskje passer bedre —
              <a href="#">se tilskudd fra kommunen</a>, eller ring oss på
              <a href="tel:${HB_REGLER.telefonRaw}">${HB_REGLER.telefon}</a>.
            </p>
          </div>
        </div>
      </div>

      <div class="hb-field">
        <label class="hb-field__label" for="tlf">Telefonnummeret ditt</label>
        <span class="hb-field__help">
          Vi ringer heller enn å avslå hvis noe mangler i søknaden.
        </span>
        <input class="hb-input hb-num" id="tlf" type="tel" inputmode="tel"
               autocomplete="tel" value="${D.tlf || ''}" placeholder="000 00 000">
        ${feil('feil-tlf')}
      </div>

      <div class="hb-field">
        <label class="hb-field__label" for="epost">E-postadressen din <span class="hb-muted" style="font-weight:400">(valgfritt)</span></label>
        <span class="hb-field__help">
          Kvitteringen kommer uansett på Min side og i posten. E-post er bare i tillegg.
        </span>
        <input class="hb-input" id="epost" type="email" autocomplete="email" value="${D.epost || ''}">
      </div>
    `,
    etter: () => {
      const oppdaterStopp = () => {
        const valgt = document.querySelector('input[name="alder"]:checked');
        document.getElementById('alder-stopp').hidden = !(valgt && valgt.value === 'nei');
      };
      document.querySelectorAll('input[name="alder"]').forEach(r =>
        r.addEventListener('change', oppdaterStopp));
      oppdaterStopp();
    },
    les: () => ({
      alder: (document.querySelector('input[name="alder"]:checked') || {}).value || '',
      tlf: document.getElementById('tlf').value.trim(),
      epost: document.getElementById('epost').value.trim()
    }),
    valider: d => {
      const f = [];
      if (!d.alder) f.push(['feil-alder', 'Velg ett av de tre svarene, så kommer du videre.']);
      else if (d.alder === 'nei') f.push(['feil-alder', 'Med dette svaret kan du ikke søke om denne ordningen. Se boksen over for hva du kan gjøre i stedet.']);
      if (!d.tlf || d.tlf.replace(/\D/g, '').length < 8)
        f.push(['feil-tlf', 'Skriv telefonnummeret ditt med åtte siffer, så vi kan nå deg.']);
      return f;
    }
  },

  /* ─── 2. Boligen ───────────────────────────────────────────────── */
  2: {
    h1: 'Boligen din',
    ingress: 'Tilskuddet gjelder boligen du selv bor i.',
    html: () => `
      ${guide(`Både du som eier og du som leier kan søke. Leier du, trenger vi bare
               en bekreftelse fra den som eier boligen.`)}

      <div class="hb-summary" style="margin-bottom:var(--space-5)">
        <div class="hb-summary__group">
          <div class="hb-summary__head"><h3>Hentet fra Kartverket</h3></div>
          <dl>
            <dt>Adresse</dt><dd>${D.adresse || 'Bjerkeveien 14 B, 0765 Oslo'}</dd>
            <dt>Boligtype</dt><dd>Enebolig</dd>
          </dl>
        </div>
      </div>

      <fieldset style="border:0;padding:0;margin:0 0 var(--space-4)">
        <legend class="hb-field__label" style="padding:0">Eier eller leier du boligen?</legend>
        <label class="hb-choice">
          <input type="radio" name="eier" value="eier" ${D.eierform !== 'leier' ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Jeg eier boligen</span>
            <span class="hb-choice__desc">Alene eller sammen med noen.</span>
          </span>
        </label>
        <label class="hb-choice">
          <input type="radio" name="eier" value="leier" ${D.eierform === 'leier' ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Jeg leier boligen</span>
            <span class="hb-choice__desc">Du må legge ved en bekreftelse fra utleier senere.</span>
          </span>
        </label>
        ${feil('feil-eier')}
      </fieldset>

      <div class="hb-note" id="leie-info" hidden>
        ${HB_IKON.info}
        <div>
          <strong>Du trenger en bekreftelse fra utleier.</strong>
          <p class="hb-small" style="margin:4px 0 0">
            Den trenger ikke være formell. En e-post der utleier skriver hva som skal
            gjøres og at det er greit, holder. Vi minner deg på det i steg 5.
          </p>
        </div>
      </div>

      <fieldset style="border:0;padding:0;margin:var(--space-5) 0 var(--space-4)">
        <legend class="hb-field__label" style="padding:0">Bor du i borettslag eller sameie?</legend>
        <span class="hb-field__help">
          Skal du gjøre noe utvendig, må styret ha sagt ja. Innvendig arbeid trenger
          som regel ingen godkjenning.
        </span>
        <label class="hb-choice">
          <input type="radio" name="borettslag" value="nei" ${D.borettslag !== 'ja' ? 'checked' : ''}>
          <span class="hb-choice__text"><span class="hb-choice__title">Nei</span></span>
        </label>
        <label class="hb-choice">
          <input type="radio" name="borettslag" value="ja" ${D.borettslag === 'ja' ? 'checked' : ''}>
          <span class="hb-choice__text"><span class="hb-choice__title">Ja</span></span>
        </label>
      </fieldset>

      <label class="hb-choice">
        <input type="checkbox" id="bor-her" ${D.borHer !== false ? 'checked' : ''}>
        <span class="hb-choice__text">
          <span class="hb-choice__title">Jeg bor i denne boligen til vanlig</span>
          <span class="hb-choice__desc">Tilskuddet gjelder ikke hytte, utleiebolig eller bolig du ikke bor i.</span>
        </span>
      </label>
      ${feil('feil-bor')}
    `,
    etter: () => {
      const oppdater = () => {
        const v = (document.querySelector('input[name="eier"]:checked') || {}).value;
        document.getElementById('leie-info').hidden = v !== 'leier';
      };
      document.querySelectorAll('input[name="eier"]').forEach(r => r.addEventListener('change', oppdater));
      oppdater();
    },
    les: () => ({
      eierform: (document.querySelector('input[name="eier"]:checked') || {}).value || '',
      borettslag: (document.querySelector('input[name="borettslag"]:checked') || {}).value || 'nei',
      borHer: document.getElementById('bor-her').checked
    }),
    valider: d => {
      const f = [];
      if (!d.eierform) f.push(['feil-eier', 'Velg om du eier eller leier boligen.']);
      if (!d.borHer) f.push(['feil-bor', 'Tilskuddet gjelder bare bolig du bor i selv. Ring oss på ' + HB_REGLER.telefon + ' hvis situasjonen din er spesiell.']);
      return f;
    }
  },

  /* ─── 3. Tiltak ────────────────────────────────────────────────── */
  3: {
    h1: 'Hva skal gjøres i boligen?',
    ingress: 'Huk av alt du skal gjøre. Du må velge minst én ting, og du kan gjerne velge flere.',
    html: () => `
      ${guide(`Velger du flere, legger vi kostnadene sammen. Det er ofte slik folk
               kommer over minstekravet på 80 000 kroner.`)}

      <fieldset style="border:0;padding:0;margin:0">
        <legend class="hb-visually-hidden">Godkjente oppgraderinger</legend>
        ${TILTAK.map(t => `
          <label class="hb-choice">
            <input type="checkbox" name="tiltak" value="${t.id}"
                   ${(D.tiltak || []).includes(t.id) ? 'checked' : ''}>
            <span class="hb-choice__text">
              <span class="hb-choice__title">${t.navn}</span>
              <span class="hb-choice__desc">${t.hjelp}</span>
            </span>
          </label>`).join('')}
        ${feil('feil-tiltak')}
      </fieldset>

      <div class="hb-field" style="margin-top:var(--space-5)">
        <label class="hb-field__label" for="beskrivelse">
          Beskriv kort hva som skal gjøres <span class="hb-muted" style="font-weight:400">(valgfritt)</span>
        </label>
        <span class="hb-field__help">
          Skriv med dine egne ord. To setninger holder. Du kan ikke skrive noe galt her —
          det er bare for at saksbehandleren skal forstå prosjektet.
        </span>
        <textarea class="hb-input" id="beskrivelse" rows="4"
          placeholder="For eksempel: Vi skal bytte badekaret med en dusj uten kant, og sette opp håndtak.">${D.beskrivelse || ''}</textarea>
      </div>

      <div class="hb-note hb-note--warn">
        ${HB_IKON.varsel}
        <div>
          <strong>Arbeidet må gjøres av en fagperson.</strong>
          <p class="hb-small" style="margin:4px 0 0">
            Du kan ikke gjøre jobben selv eller la familie gjøre den gratis. Du trenger
            en regning fra et registrert firma. Det er greit å bruke et lite lokalt
            firma — det trenger ikke være en stor entreprenør.
          </p>
        </div>
      </div>
    `,
    les: () => ({
      tiltak: [...document.querySelectorAll('input[name="tiltak"]:checked')].map(i => i.value),
      beskrivelse: document.getElementById('beskrivelse').value.trim()
    }),
    valider: d => d.tiltak.length ? [] :
      [['feil-tiltak', 'Huk av minst én oppgradering. Er du usikker på hva som passer, ring oss på ' + HB_REGLER.telefon + ' — vi hjelper deg å velge.']]
  },

  /* ─── 4. Kostnad ───────────────────────────────────────────────── */
  4: {
    h1: 'Hva kommer det til å koste?',
    ingress: 'Bruk summen fra tilbudet eller prisoverslaget du har fått.',
    html: () => `
      ${guide(`Her ser du med en gang hva du får. Blir jobben dyrere eller billigere
               enn tilbudet, er det helt greit — vi regner ut på nytt når du sender
               inn den betalte regningen.`)}
      <div id="kalk-soknad"></div>
      ${feil('feil-belop')}

      <div class="hb-note" style="margin-top:var(--space-4)">
        ${HB_IKON.info}
        <div>
          <strong>Hva skal med i summen?</strong>
          <p class="hb-small" style="margin:4px 0 0">
            Ta med både arbeid og materialer, slik det står i tilbudet. Ta med
            merverdiavgift. Ikke ta med møbler, hvitevarer eller ting du kjøper løst.
          </p>
        </div>
      </div>
    `,
    etter: () => {
      document.getElementById('kalk-soknad').innerHTML =
        hbKalkulatorHTML('kalk-4', { start: D.belop || 0, tittel: 'Dette får du' });
      kalkApi = hbKalkulatorInit('kalk-4');
    },
    les: () => ({ belop: kalkApi ? kalkApi.hent() : 0 }),
    valider: d => {
      if (!d.belop) return [['feil-belop', 'Skriv inn hva oppgraderingen kommer til å koste.']];
      if (d.belop < HB_REGLER.minstekostnad) {
        return [['feil-belop',
          `Summen må være minst ${hbKr(HB_REGLER.minstekostnad)} for at du skal kunne søke. ` +
          `Du kan legge til flere oppgraderinger i steg 3, be håndverkeren om et samlet ` +
          `tilbud, eller ringe oss på ${HB_REGLER.telefon} for å høre hva som kan tas med.`]];
      }
      return [];
    }
  },

  /* ─── 5. Dokumentasjon ─────────────────────────────────────────────
     Brukertest: fem av åtte slet med opplasting. Problemet ligger før
     filvelgeren — kjeden e-post → lagre → finne igjen. Derfor: kamera
     som førstevalg, e-post og telefon som likeverdige veier ut, og en
     kvittering som er umulig å overse. 50 MB-varselet er flyttet vekk
     fra utgangstilstanden.
     ──────────────────────────────────────────────────────────────── */
  5: {
    h1: 'Legg ved tilbudet',
    ingress: 'Vi trenger å se hva håndverkeren har gitt deg pris på.',
    html: () => `
      ${guide(`Har du papiret liggende foran deg? Ta bilde av det med mobilen — det er
               den enkleste veien. Du trenger verken skanner eller e-post.`)}

      <h2 style="font-size:var(--text-lg)">Tilbud eller prisoverslag <span class="hb-muted" style="font-weight:400">— må legges ved</span></h2>

      <div class="hb-upload">
        <p class="hb-small" style="margin-top:0">Velg måten som passer deg:</p>
        <div class="hb-upload__actions">
          <label class="hb-btn hb-btn--primary" for="fil-kamera" style="cursor:pointer">
            ${HB_IKON.kamera} Ta bilde av papiret
          </label>
          <label class="hb-btn hb-btn--secondary" for="fil-velg" style="cursor:pointer">
            ${HB_IKON.mappe} Velg fil fra enheten
          </label>
        </div>
        <input id="fil-kamera" type="file" accept="image/*" capture="environment" multiple class="hb-visually-hidden">
        <input id="fil-velg" type="file" accept="image/*,application/pdf" multiple class="hb-visually-hidden">

        <ul class="hb-filelist" id="filliste" aria-live="polite"></ul>
        ${feil('feil-fil')}
      </div>

      <div class="hb-accordion" data-trekkspill style="margin-top:var(--space-4)">
        <button type="button" class="hb-accordion__btn" aria-expanded="false" aria-controls="op1">
          <span class="hb-accordion__title">Får du det ikke til? Her er tre andre måter</span>
          <span class="hb-accordion__state">Vis</span>
          <span class="hb-accordion__icon">${HB_IKON.chevronHvit}</span>
        </button>
        <div class="hb-accordion__panel" id="op1" hidden>
          <p><strong>1. Send på e-post.</strong> Videresend e-posten fra håndverkeren til
             <a href="mailto:vedlegg@husbanken.no">vedlegg@husbanken.no</a> og skriv
             referansenummeret ditt i emnefeltet. Du får referansenummeret på kvitteringen.
             Da trenger du ikke laste ned noe først.</p>
          <p><strong>2. Ring oss.</strong> På <a href="tel:${HB_REGLER.telefonRaw}">${HB_REGLER.telefon}</a>
             kan vi ta imot opplysningene muntlig og hjelpe deg videre.</p>
          <p><strong>3. Send i posten.</strong> Husbanken, Postboks 1404, 8602 Mo i Rana.
             Legg ved referansenummeret.</p>
          <p class="hb-small hb-muted">
             Du kan sende søknaden nå og ettersende vedlegget innen søknadsfristen.
             Søknaden blir ikke avslått fordi vedlegget kommer noen dager senere.
          </p>
        </div>
      </div>

      <div class="hb-accordion" data-trekkspill>
        <button type="button" class="hb-accordion__btn" aria-expanded="false" aria-controls="op2">
          <span class="hb-accordion__title">Hvilke filtyper og størrelser går an?</span>
          <span class="hb-accordion__state">Vis</span>
          <span class="hb-accordion__icon">${HB_IKON.chevronHvit}</span>
        </button>
        <div class="hb-accordion__panel" id="op2" hidden>
          <p>Bilde (JPG eller PNG) eller PDF. Opptil 50 MB per fil — det er mer enn
             nok til et vanlig mobilbilde.</p>
          <p>Har du flere ark, tar du ett bilde av hvert og laster opp alle sammen.</p>
        </div>
      </div>

      <div id="leie-vedlegg" hidden style="margin-top:var(--space-5)">
        <h2 style="font-size:var(--text-lg)">Bekreftelse fra utleier <span class="hb-muted" style="font-weight:400">— må legges ved</span></h2>
        <p class="hb-small">
          Fordi du leier boligen. En e-post fra utleier der det står hva som skal gjøres
          og at det er greit, holder fint.
          <a href="#">Last ned et ferdig skjema du kan sende videre</a>.
        </p>
        <div class="hb-upload">
          <div class="hb-upload__actions">
            <label class="hb-btn hb-btn--secondary" for="fil-utleier" style="cursor:pointer">
              ${HB_IKON.mappe} Velg fil
            </label>
            <label class="hb-btn hb-btn--secondary" for="fil-utleier2" style="cursor:pointer">
              ${HB_IKON.kamera} Ta bilde
            </label>
          </div>
          <input id="fil-utleier" type="file" accept="image/*,application/pdf" multiple class="hb-visually-hidden">
          <input id="fil-utleier2" type="file" accept="image/*" capture="environment" multiple class="hb-visually-hidden">
          <ul class="hb-filelist" id="filliste-utleier" aria-live="polite"></ul>
        </div>
      </div>
    `,
    etter: () => {
      document.getElementById('leie-vedlegg').hidden = D.eierform !== 'leier';

      const tegnListe = (nøkkel, ulId) => {
        const ul = document.getElementById(ulId);
        const filer = D[nøkkel] || [];
        ul.innerHTML = filer.map((f, i) => `
          <li class="hb-file">
            <span class="hb-file__check">${HB_IKON.hake}</span>
            <span class="hb-file__meta">
              <span class="hb-file__name">${f.navn}</span>
              <span class="hb-file__status">Mottatt${f.str ? ' · ' + f.str : ''}</span>
            </span>
            <button type="button" class="hb-file__remove" data-fjern="${nøkkel}" data-i="${i}">Fjern</button>
          </li>`).join('');
        ul.querySelectorAll('[data-fjern]').forEach(b => b.addEventListener('click', () => {
          D[b.dataset.fjern].splice(Number(b.dataset.i), 1);
          hbSkriv(D);
          tegnListe(nøkkel, ulId);
        }));
      };

      const kobleFil = (inputId, nøkkel, ulId) => {
        const inp = document.getElementById(inputId);
        if (!inp) return;
        inp.addEventListener('change', () => {
          D[nøkkel] = D[nøkkel] || [];
          [...inp.files].forEach(f => D[nøkkel].push({
            navn: f.name,
            str: f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB'
                                  : Math.max(1, Math.round(f.size / 1024)) + ' KB'
          }));
          hbSkriv(D);
          tegnListe(nøkkel, ulId);
          inp.value = '';
          document.getElementById('feil-fil').hidden = true;
        });
      };

      kobleFil('fil-kamera', 'filer', 'filliste');
      kobleFil('fil-velg', 'filer', 'filliste');
      kobleFil('fil-utleier', 'filerUtleier', 'filliste-utleier');
      kobleFil('fil-utleier2', 'filerUtleier', 'filliste-utleier');
      tegnListe('filer', 'filliste');
      tegnListe('filerUtleier', 'filliste-utleier');
    },
    les: () => ({}),   /* filene lagres fortløpende */
    valider: () => (D.filer && D.filer.length) ? [] :
      [['feil-fil', 'Legg ved tilbudet, eller åpne «Får du det ikke til?» under for tre andre måter å sende det på.']]
  },

  /* ─── 6. Oppsummering ──────────────────────────────────────────── */
  6: {
    h1: 'Se over og send',
    ingress: 'Sjekk at alt stemmer. Du kan endre alt fram til søknadsfristen.',
    html: () => {
      const b = hbBeregn(D.belop || 0);
      const valgte = (D.tiltak || []).map(id => (TILTAK.find(t => t.id === id) || {}).navn).filter(Boolean);
      const rad = (k, v) => `<dt>${k}</dt><dd>${v || '<span class="hb-muted">Ikke fylt ut</span>'}</dd>`;

      return `
        ${guide(`Du gjør ikke noe galt ved å sende inn. Mangler vi noe, ringer eller
                 skriver vi til deg — vi avslår ikke uten å ha spurt først.`)}

        <div class="hb-panel hb-panel--filled" style="margin-bottom:var(--space-5)">
          <span class="hb-small">Du søker om</span>
          <strong style="display:block;font:600 var(--text-3xl)/var(--lh-3xl) var(--font-display);color:var(--hb-green-800)">
            ${hbKr(b.tilskudd)}
          </strong>
          <p class="hb-small" style="margin:var(--space-2) 0 0">
            ${Math.round(HB_REGLER.sats * 100)} % av ${hbKr(b.grunnlag)}.
            Du betaler ${hbKr(b.egenandel)} selv, og får tilskuddet utbetalt
            etter at arbeidet er ferdig.
          </p>
        </div>

        <div class="hb-summary">
          <div class="hb-summary__group">
            <div class="hb-summary__head">
              <h3>Om deg</h3>
              <button type="button" class="hb-summary__edit" data-endre="1">Endre</button>
            </div>
            <dl>
              ${rad('Navn', D.navn)}
              ${rad('Telefon', hbTlf(D.tlf))}
              ${rad('E-post', D.epost || '<span class="hb-muted">Ikke oppgitt</span>')}
              ${rad('Alder', D.alder === 'selv' ? 'Over 62 år' : 'Bor med noen over 62 år')}
            </dl>
          </div>

          <div class="hb-summary__group">
            <div class="hb-summary__head">
              <h3>Boligen</h3>
              <button type="button" class="hb-summary__edit" data-endre="2">Endre</button>
            </div>
            <dl>
              ${rad('Adresse', D.adresse)}
              ${rad('Eierform', D.eierform === 'leier' ? 'Leier' : 'Eier')}
              ${rad('Borettslag eller sameie', D.borettslag === 'ja' ? 'Ja' : 'Nei')}
            </dl>
          </div>

          <div class="hb-summary__group">
            <div class="hb-summary__head">
              <h3>Dette skal gjøres</h3>
              <button type="button" class="hb-summary__edit" data-endre="3">Endre</button>
            </div>
            <dl>
              ${rad('Oppgraderinger', valgte.join('<br>'))}
              ${rad('Beskrivelse', D.beskrivelse)}
            </dl>
          </div>

          <div class="hb-summary__group">
            <div class="hb-summary__head">
              <h3>Kostnad</h3>
              <button type="button" class="hb-summary__edit" data-endre="4">Endre</button>
            </div>
            <dl>
              ${rad('Oppgraderingen koster', hbKr(D.belop || 0))}
              ${rad('Vi regner tilskudd av', hbKr(b.grunnlag))}
              ${rad('Du søker om', hbKr(b.tilskudd))}
            </dl>
          </div>

          <div class="hb-summary__group">
            <div class="hb-summary__head">
              <h3>Vedlegg</h3>
              <button type="button" class="hb-summary__edit" data-endre="5">Endre</button>
            </div>
            <dl>
              ${rad('Tilbud eller prisoverslag', (D.filer || []).map(f => f.navn).join('<br>'))}
              ${D.eierform === 'leier'
                ? rad('Bekreftelse fra utleier', (D.filerUtleier || []).map(f => f.navn).join('<br>'))
                : ''}
            </dl>
          </div>
        </div>

        <div class="hb-note" style="margin-top:var(--space-5)">
          ${HB_IKON.info}
          <div>
            <strong>Dette skjer etter at du har sendt</strong>
            <ol class="hb-prose hb-small" style="margin:var(--space-2) 0 0">
              <li>Du får en kvittering med referansenummer med en gang.</li>
              <li>Vi svarer innen fire uker etter søknadsfristen ${HB_REGLER.frist}.</li>
              <li>Sier vi ja, kan håndverkeren begynne. Ikke før.</li>
              <li>Du betaler regningen, og ber oss så om utbetaling på Min side.</li>
            </ol>
          </div>
        </div>

        <label class="hb-choice" style="margin-top:var(--space-5)">
          <input type="checkbox" id="bekreft" ${D.bekreft ? 'checked' : ''}>
          <span class="hb-choice__text">
            <span class="hb-choice__title">Opplysningene stemmer så langt jeg vet</span>
            <span class="hb-choice__desc">
              Oppdager du noe feil etterpå, retter du det selv på Min side eller ringer oss.
              Det får ingen konsekvenser.
            </span>
          </span>
        </label>
        ${feil('feil-bekreft')}
      `;
    },
    etter: () => {
      document.querySelectorAll('[data-endre]').forEach(b =>
        b.addEventListener('click', () => gåTil(Number(b.dataset.endre))));
    },
    les: () => ({ bekreft: document.getElementById('bekreft').checked }),
    valider: d => d.bekreft ? [] :
      [['feil-bekreft', 'Huk av boksen over for å sende søknaden.']]
  }
};

/* ═══ Motoren ═════════════════════════════════════════════════════ */

function tegn() {
  const side = SIDER[steg];
  const rot = document.getElementById('soknad');
  const sisteSteg = steg === STEG.length;

  rot.innerHTML = `
    <div class="hb-progress">
      <div class="hb-progress__meta">
        <span><strong>Steg ${steg} av ${STEG.length}</strong> · ${STEG[steg - 1].tittel}</span>
        <span class="hb-muted">${Math.round((steg / STEG.length) * 100)} %</span>
      </div>
      <div class="hb-progress__track" role="progressbar"
           aria-valuenow="${steg}" aria-valuemin="1" aria-valuemax="${STEG.length}"
           aria-label="Framdrift i søknaden">
        <div class="hb-progress__fill" style="width:${(steg / STEG.length) * 100}%"></div>
      </div>
    </div>

    <h1 tabindex="-1" id="stegtittel">${side.h1}</h1>
    ${side.ingress ? `<p class="hb-lead">${side.ingress}</p>` : ''}

    ${side.html()}

    <div class="hb-actions">
      <div class="hb-actions__row">
        <button type="button" class="hb-btn hb-btn--secondary" data-forrige>
          ${steg === 1 ? 'Avbryt' : 'Forrige'}
        </button>
        <button type="button" class="hb-btn hb-btn--primary" data-neste>
          ${sisteSteg ? 'Send søknaden' : 'Neste'}
        </button>
      </div>
      <p class="hb-actions__later">
        <a href="soknad-start.html" data-senere>${HB_IKON.hus} Fortsett senere</a>
      </p>
    </div>

    <div class="hb-help" style="margin-top:var(--space-6)">
      <h3>Står du fast?</h3>
      <p class="hb-small">Ring oss, så tar vi det sammen. Søknaden din er lagret imens.</p>
      <a class="hb-help__phone" href="tel:${HB_REGLER.telefonRaw}">
        ${HB_IKON.telefon}<span>${HB_REGLER.telefon}</span>
      </a>
    </div>
  `;

  if (side.etter) side.etter();
  hbInitTrekkspill(rot);

  rot.querySelector('[data-forrige]').addEventListener('click', forrige);
  rot.querySelector('[data-neste]').addEventListener('click', neste);
  rot.querySelector('[data-senere]').addEventListener('click', lagre);

  /* Flytt fokus til overskriften, ikke til toppen av dokumentet — da
     hører skjermleserbrukere hvilket steg de nå står på. */
  document.getElementById('stegtittel').focus();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function lagre() {
  const side = SIDER[steg];
  if (side.les) D = hbOppdater({ ...side.les(), steg });
}

function visFeil(liste) {
  document.querySelectorAll('.hb-error').forEach(e => { e.hidden = true; e.textContent = ''; });
  liste.forEach(([id, tekst]) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.hidden = false;
    e.innerHTML = HB_IKON.varsel + '<span>' + tekst + '</span>';
  });
  if (liste.length) {
    const først = document.getElementById(liste[0][0]);
    if (først) først.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function neste() {
  const side = SIDER[steg];
  const data = side.les ? side.les() : {};
  D = hbOppdater({ ...data, steg });

  const f = side.valider ? side.valider({ ...D, ...data }) : [];
  if (f.length) { visFeil(f); return; }

  if (steg === STEG.length) {
    D = hbOppdater({ sendt: true, referanse: lagRef(), steg: STEG.length });
    location.href = 'kvittering.html';
    return;
  }
  gåTil(steg + 1);
}

function forrige() {
  lagre();
  if (steg === 1) { location.href = 'soknad-start.html'; return; }
  gåTil(steg - 1);
}

function gåTil(n) {
  steg = Math.max(1, Math.min(STEG.length, n));
  hbOppdater({ steg });
  /* Ett steg = én oppføring i historikken. «Tilbake» i nettleseren
     oppfører seg da likt som «Forrige» — ingen loop. */
  history.replaceState({ steg }, '', '#steg-' + steg);
  tegn();
}

function lagRef() {
  const n = Math.floor(100000 + Math.random() * 899999);
  return 'HB-2026-' + n;
}

/* ═══ Oppstart ════════════════════════════════════════════════════ */

function soknadStart() {
  D = hbLes();

  /* ?demo hopper rett inn i flyten med testdata, og ?steg=5 rett til et
     bestemt steg. Brukes når prototypen skal vises fram. */
  const q = new URLSearchParams(location.search);
  if (q.has('demo')) {
    D = hbOppdater({
      innlogget: true, navn: 'Bodil Innbygger', fnr: '130456 12345',
      fodselsaar: 1956, adresse: 'Bjerkeveien 14 B, 0765 Oslo',
      alder: 'selv', tlf: '90012345', eierform: 'eier', borettslag: 'nei',
      borHer: true, tiltak: ['bad', 'lys'],
      beskrivelse: 'Bytter badekaret med en dusj uten kant, og setter opp bedre lys i gangen.',
      belop: 120000,
      filer: [{ navn: 'Tilbud-Rorlegger-AS.pdf', str: '840 KB' }]
    });
  }

  if (!D.innlogget) { location.href = 'logg-inn.html'; return; }
  if (D.sendt) { hbOppdater({ sendt: false }); }

  const fraQuery = Number(q.get('steg'));
  const fraHash = Number((location.hash.match(/steg-(\d)/) || [])[1]);
  steg = fraQuery || fraHash || D.steg || 1;

  hbMonter({ kontekst: 'Søknad om tilskudd til aldersvennlig oppgradering', bruker: D.navn });
  tegn();

  window.addEventListener('popstate', () => {
    const n = Number((location.hash.match(/steg-(\d)/) || [])[1]) || 1;
    if (n !== steg) { steg = n; tegn(); }
  });
}
