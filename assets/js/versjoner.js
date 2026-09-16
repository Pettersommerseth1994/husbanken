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
      soknad: 'papirsoknad-aldersvennlig-v2.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v2.html'
    }
  },
  {
    nr: 3,
    navn: 'Universell utforming',
    dato: '8. september 2026',
    endring: 'Rettet etter tilgjengelighetsgjennomgang: arket flyter på små skjermer, innhold blir ikke lenger klippet av økt tekstavstand, spørsmålsgrupper er koblet til svarene sine, signaturlinjene har navn, og kontrasten på fokusring, placeholder og rutetall er hevet over kravet.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v3.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v3.html'
    }
  },
  {
    nr: 4,
    navn: 'Storskrift',
    dato: '8. september 2026',
    endring: 'Skrevet om for lesbarhet på papir, siden de som fyller ut på papir ligger i øvre del av målgruppen. 14 pt brødtekst mot 9,5 før, 19 pt seksjonsoverskrifter, 2 cm marger, større skrivefelt og sort hjelpetekst. Linjelengden falt fra 92 til 69 tegn. Søknaden gikk fra 5 til 10 sider, utbetalingen fra 4 til 8.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v4.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v4.html'
    }
  },
  {
    nr: 5,
    navn: 'Iterasjon 3, justert',
    dato: '8. september 2026',
    endring: 'Bygget på iterasjon 3, ikke 4, fordi 3 ble foretrukket. Linjene i skrivefeltene er fjernet, avkryssingsrutene er midtstilt mot teksten, og personaliaboksen er flyttet inn under seksjon 1 «Om deg». Søknaden gikk fra 5 til 6 sider fordi seksjon 1 nå bærer boksen.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v5.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v5.html'
    }
  },
  {
    nr: 6,
    navn: 'Etter design critics',
    dato: '11. september 2026',
    endring: 'Skrevet om etter lappene i Miro-boardet «Design critics av papirsøknadene». De seks kategoriene er byttet ut med de departementsgodkjente, med underkategorier og fritekstfelt per kategori. Rekkefølgen følger Figma-flyten: tilbudet først, så boligen, så hva du skal gjøre, så kostnaden. Nytt: bolignummer og aksjenummer, dokumentasjonskrav etter eierform, fullmakt, helseadvarsel over hvert fritekstfelt, og en egen seksjon for andre opplysninger. Inntekt opplyses, det er ikke et felt. Søknaden gikk fra 6 til 8 sider.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v6.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v6.html'
    }
  },
  {
    nr: 7,
    navn: 'Etter kommentarene',
    dato: '11. september 2026',
    endring: 'Rettet etter de 93 kommentarene i Miro-boardet. Postadressen var feil og er nå Postboks 1404, 8002 Bodø. E-post er tatt ut som innsendingsmåte, fordi søknaden inneholder personopplysninger, og vedlegg@husbanken.no finnes ikke. Adressen spørres bare én gang, i seksjon 3. Du betaler hele oppgraderingen selv og får 25 prosent utbetalt etterpå. Saksbehandlingstiden er 1 til 6 uker. Telefonoppfordringene er tatt ut, «blokkbokstaver» er skrevet om, og fritekstfeltene sier at de bare gjelder når ingen av eksemplene passer. Utbetalingsskjemaet har fått de samme seks kategoriene som søknaden.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v7.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v7.html'
    }
  },
  {
    nr: 8,
    navn: 'Etter Slack-gjennomgangen',
    dato: '13. september 2026',
    endring: 'Etter gjennomgangen i Slack-tråden «Papirsøknaden». Teksten fra «Til deg som leier»-steget, som departementet har bedt om at skal med, er nå i seksjon 3, tilpasset papir, og sier hvor samtykkeskjemaet finnes. Samtykket fra husstandsmedlemmet over 62 år er flyttet ut av seksjon 1 og 7, og står som et eget ark bakerst som personen fyller ut, skriver under på og legger ved. Eierformene er skrevet om til fire klarere alternativer: «bor der» i stedet for «folkeregistrert på adressen», kjøp som eget alternativ med kjøpekontrakt, og arv skilt ut fra kjøp, med en liste over gyldig dokumentasjon. Samtykketeksten er fagsidens egen formulering om uriktige opplysninger, og setningen om å kontakte firmaet som ga tilbudet er tatt ut. Setningen om postmottaket er borte, fritekstfeltet i 4.1 gjelder også «Annet område», og logo og tittel er satt opp fra 6,5 til 8 mm og fra 19 til 22 pt. Søknaden gikk fra 7 til 9 sider.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v8.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v8.html'
    }
  },
  {
    nr: 9,
    navn: 'Språk og samtykkeark',
    dato: '14. september 2026',
    endring: 'Språkopprydding og ombygd samtykkeark. Setningen om at skjemaet erstatter den digitale søknaden er ute, det samme er forklaringen av sirkler og firkanter. Boksen om fagfolk er skrevet om: kravet om registrert firma står først, og setningen om egeninnsats og gratis hjelp fra familie er hentet tilbake. «Fortsatt» er borte fra overskriftene, seksjon 4 heter nå «Hva skal gjøres i boligen», og samtykketeksten i seksjon 7 er kortet ned til fagsidens formulering alene. Side 9 er bygget om i samme form som resten: vanlig seksjonshode i stedet for egen ramme og stor tittel, samme personaliaboks som seksjon 1, og adressefeltet er tatt bort fordi adressen alt står i seksjon 3. Arket omtales nå som «side 9» overalt. Varselboksen under vedleggsboksen har fått luft over seg.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v9.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v9.html'
    }
  },
  {
    nr: 10,
    navn: 'Kravene på forsiden',
    dato: '14. september 2026',
    endring: 'Forsiden har fått kravlista fra veilederen i den digitale søknaden: alder, eierform, minst én godkjent oppgradering, tilbud som vedlegg, minstebeløp og å søke før arbeidet settes i gang. Punktene som sto både der og i «Slik bruker du dette skjemaet» er tatt ut av det siste. Kategori 4.6 har fått forklaringen fra forskriften om hva et Nav-vedtak kan gjelde. Fullmaktsskjemaet og samtykkeskjemaet står begge på husbanken.no. «Brønnøysundregisteret» er rettet til «Brønnøysundregistrene», tilbudet om å få samtykkeskjemaet i posten er tatt ut, og side 9 sier «dette arket» i stedet for «hele arket».',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v10.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v10.html'
    }
  },
  {
    nr: 11,
    navn: 'Det postmottaket trenger',
    dato: '14. september 2026',
    endring: 'Skrevet for postmottaket, som skal registrere papirsøknadene i det digitale systemet. Bolignummer og aksjenummer er forklart hver for seg: bolignummer heter også bruksenhetsnummer, står ofte ved inngangsdøren og finnes på kartverket.no, og aksjenummer har fått et eksempel på formatet. Begrunnelsen sier nå at nummeret ikke finnes i matrikkelen. Dokumentasjonsboksen er snudd fra en liste over dokumenttyper til en liste over situasjoner: flytteprosess, arveoppgjør, gjenlevende ektefelle, boligaksjeselskap. Uskifteattest er knyttet til hvem det gjelder, i stedet for å stå ved siden av skifteattest.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v11.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v11.html'
    }
  },
  {
    nr: 12,
    navn: 'Slik finner du nummeret',
    dato: '14. september 2026',
    endring: 'Spørsmål 3.2 er bygget om. Begrunnelsen om matrikkelen og beskjeden om å la feltene stå åpne er tatt ut. Bolignummer og aksjenummer har nå hvert sitt spørsmål, side om side, med sin egen «Slik finner du»-boks under feltet, med tekstene fra den digitale søknaden: at bolignummeret består av én bokstav og fire tall, hvor klistremerket sitter, hvem man spør, og at aksjenummeret står i aksjebrevet. Sidene 3 til 6 er fordelt på nytt, så seksjon 3 deler seg etter 3.2 i stedet for etter 3.3.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v12.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v12.html'
    }
  },
  {
    nr: 13,
    navn: 'Finpuss på 3.2',
    dato: '14. september 2026',
    endring: 'Finpuss på 3.2. «Be de hjelpe deg» er rettet til «be dem». Bolignummeret har fått eksempel og tegngrense, likt som aksjenummeret. Spørsmålene inni 3.2 er satt ett trinn ned, fra 10 til 9 pt, så de ikke konkurrerer med seksjonsspørsmålet over. Under 3.2 står det nå når spørsmålet gjelder deg: flere boliger på adressen, eller bolig i et boligaksjeselskap.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v13.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v13.html'
    }
  },
  {
    nr: 14,
    navn: 'Ny illustrasjon og ryddet tekst',
    dato: '15. september 2026',
    endring: 'Ny illustrasjon på forsiden, logoen 30 prosent større, og iterasjonscellene paginert med et vindu rundt den man står på. Kravet på forsiden handler nå om å søke om en varig aldersvennlig oppgradering, ikke om å telle kategorier. Avsnittet om Folkeregisteret og Kontaktregisteret er tatt ut av seksjon 1, og to punkter er tatt ut av innsendingslista. Utbetalingspunktet viser til Lån og tilskudd fra Husbanken i stedet for Min side. Undernivået i 4.1 har fått luft under seg, så det synes hvor det slutter. Side 9 spør nå om den over 62 år bor i boligen eller skal flytte dit.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v14.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v14.html'
    }
  },
  {
    nr: 15,
    navn: 'Riktige skjemanavn',
    dato: '15. september 2026',
    endring: 'Kategori 4.6 heter nå «Gjøre terreng- og/eller bygningsmessige endringer ved vedtak fra Nav», forskriftens ordlyd, og utbetalingsskjemaet har fått samme overskrift. Fullmaktsskjemaet i 1.3 er navngitt: skjema HB 8.S.37, «Fullmakt – Søknad om tilskudd og utbetaling av tilskudd til aldersvennlig oppgradering av bolig».',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v15.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v15.html'
    }
  },
  {
    nr: 16,
    navn: 'To spørsmål i 3.2',
    dato: '15. september 2026',
    endring: 'Spørsmål 3.2 er delt i to spørsmål i stedet for ett med to felter. Den felles overskriften «Bolignummer og aksjenummer» er borte, og hvert nummer står nå som sitt eget spørsmål med sin egen «kun hvis»-linje: flere boliger på adressen for bolignummer, boligaksjeselskap for aksjenummer. Eksempellinjene over feltene er tatt ut, siden eksemplene alt står i «Slik finner du»-boksene under.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v16.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v16.html'
    }
  },
  {
    nr: 17,
    navn: 'Alle spørsmål har nummer',
    dato: '15. september 2026',
    endring: 'Aksjenummerspørsmålet har fått nummer, 3.3, og eierformspørsmålet er flyttet til 3.4. Nå er alle de femten spørsmålene i skjemaet nummererte. Samtykkeskjemaet fra eieren er navngitt som skjema HB 8.S.38, slik fullmaktsskjemaet i 1.3 er HB 8.S.37. Det er to ulike skjemaer.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v17.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v17.html'
    }
  },
  {
    nr: 18,
    navn: 'Fødselsnummer på side 9',
    dato: '16. september 2026',
    endring: 'Personvernteksten i seksjon 7 sier nå at opplysningene slettes ti år etter utbetaling, ikke ti år etter søknaden, som er slutterutinen. Side 9 ber om fullt fødselsnummer i stedet for fødselsår. Personen over 62 år registreres i HiLS på samme måte som søkeren, og trenger de samme opplysningene.',
    filer: {
      soknad: 'papirsoknad-aldersvennlig-v18.html',
      utbetaling: 'papirsoknad-aldersvennlig-utbetaling-v18.html'
    }
  },
  {
    nr: 19,
    navn: 'Skjema-ID-ene på plass',
    dato: '16. september 2026',
    endring: 'Skjema-ID-en er flyttet fra topplinja ned i bunnteksten, etter telefonnummeret, og har fått riktig nummer: HB 8.S.39 for søknaden og HB 8.S.40 for utbetalingen. Tittelen er skjemaets offisielle navn, «Søknad om tilskudd til aldersvennlig oppgradering av egen bolig», og eyebrow-linja over den er tatt bort. «Mobilnummer» heter nå «Telefon». Punktet om utbetaling viser til HB 8.S.40 med full tittel. Utbetalingsskjemaet har fått sitt offisielle navn på samme måte. «husbanken.no» er tatt ut av bunnteksten, så linja holder seg på én linje med skjemanummeret på plass.',
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
     Navn, dato og hva som endret seg står i linja under.

     Fra og med fjorten iterasjoner blir raden for lang til å leses, så
     vi viser et vindu rundt den man står på, med første og siste alltid
     synlig og en ellipse der det er hoppet over. Samme mønster som en
     vanlig paginering. */
  const VINDU = 2;          // hvor mange på hver side av gjeldende
  const nr = HB_VERSJONER.map(v => v.nr);
  const forste = nr[0];
  const sisteNr = nr[nr.length - 1];

  const skalVises = n =>
    n === forste || n === sisteNr || Math.abs(n - naa) <= VINDU;

  const celle = v => {
    const tittel = `Iterasjon ${v.nr}, ${v.navn}, ${v.dato}. ${v.endring}`;
    return v.nr === naa
      ? `<span class="versjoner__celle" aria-current="page" title="${tittel}">${v.nr}</span>`
      : `<a class="versjoner__celle" href="${v.filer[skjema]}" title="${tittel}">${v.nr}</a>`;
  };

  let hoppet = false;
  const celler = HB_VERSJONER.map(v => {
    if (skalVises(v.nr)) {
      hoppet = false;
      return celle(v);
    }
    if (hoppet) return '';
    hoppet = true;
    /* Ellipsen sier hvor mange som er utelatt, og er ikke en knapp.
       Skjermlesere trenger den ikke, tallene rundt forteller det samme. */
    return '<span class="versjoner__hopp" aria-hidden="true">…</span>';
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
      ${eldre ? `<em class="versjoner__eldre">Dette er en eldre iterasjon.</em>
                 <a href="${siste.filer[skjema]}">Gå til den siste</a>.` : ''}
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
    const synlig = window.innerHeight || document.documentElement.clientHeight || 800;
    /* Math.max sørger for at en blokk som er høyere enn vinduet legger seg
       med toppen synlig, i stedet for halvveis over kanten. */
    const midt = boks.top + window.scrollY - Math.max(0, (synlig - boks.height) / 2);
    window.scrollTo(0, Math.max(0, midt));
  });

  let paa = false;
  try { paa = localStorage.getItem(LAGER) === '1'; } catch (e) { /* privat modus */ }
  boks.checked = paa;
  tegn(paa);
})();
