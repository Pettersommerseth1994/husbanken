# Utfyllbar PDF

`lag-utfyllbar-pdf.py` lager en PDF med ekte skjemafelter av papirskjemaet.
Chrome skriver ut HTML-en til A4, og over den legges usynlige felter nøyaktig
der rutene er tegnet.

## Kjøre

Skjemaet må være tilgjengelig på en URL, for eksempel via en lokal server.

    python3 -m venv .venv && .venv/bin/pip install pypdf reportlab
    .venv/bin/python verktoy/lag-utfyllbar-pdf.py \
      "http://127.0.0.1:4325/papirsoknad-aldersvennlig.html" \
      "assets/pdf/HB-8.S.39-soknad-utfyllbar.pdf" \
      verktoy/felter-soknad.json

Slett `*-grunn.pdf` etterpå, den er bare mellomlagringen fra Chrome.

## Feltkartene

`felter-soknad.json` og `felter-utbetaling.json` sier hvor hvert felt ligger, i
millimeter fra øvre venstre hjørne av hver side. De må lages på nytt når
layouten endrer seg. Kjør dette i nettleserkonsollen på skjemaet og lagre
resultatet:

```js
const sider=[...document.querySelectorAll('.page')];
const pxmm=sider[0].getBoundingClientRect().width/210;
const ut=[];
sider.forEach((side,i)=>{
  const sr=side.getBoundingClientRect();
  const boks=el=>{const r=el.getBoundingClientRect();return{
    x:+((r.left-sr.left)/pxmm).toFixed(2), y:+((r.top-sr.top)/pxmm).toFixed(2),
    w:+(r.width/pxmm).toFixed(2), h:+(r.height/pxmm).toFixed(2)};};
  // input.field er beløpsfeltene, som ligger inni .input-money
  side.querySelectorAll('input.field-input, input.input-line, input.field').forEach(el=>{
    if(el.closest('.digit-group'))return;
    ut.push({s:i,t:'text',n:el.name||el.id,...boks(el)});});
  side.querySelectorAll('.digit-group').forEach(g=>{const nm=g.dataset.name;
    [...g.querySelectorAll('input')].forEach((el,j)=>
      ut.push({s:i,t:'siffer',n:nm+'_'+(j+1),...boks(el)}));});
  side.querySelectorAll('textarea').forEach(el=>
    ut.push({s:i,t:'omrade',n:el.name||el.id,...boks(el)}));
  side.querySelectorAll('.opt input[type=checkbox]').forEach(el=>
    ut.push({s:i,t:'kryss',n:el.name,...boks(el.parentElement.querySelector('.mark'))}));
  side.querySelectorAll('.opt input[type=radio]').forEach(el=>
    ut.push({s:i,t:'radio',n:el.name,v:el.value,...boks(el.parentElement.querySelector('.mark'))}));
  side.querySelectorAll('.sig-line[contenteditable]').forEach(el=>
    ut.push({s:i,t:'text',n:el.dataset.name,...boks(el)}));
});
JSON.stringify(ut)
```

## Hvorfor utseendet tegnes selv

reportlab plasserer radioprikken utenfor midten av ruta, og setter Required på
avkryssingsboksene, som gir rød ramme i Acrobat. Skriptet skriver derfor sine
egne utseendestrømmer: prikk og hake midt i ruta, i samme blekkfarge som
teksten, uten ramme.

Tabbrekkefølgen settes til `/R`, radrekkefølge, og annots-lista sorteres likt,
slik at tabulator går fra venstre til høyre og så nedover.
