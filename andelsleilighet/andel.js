(function(){
const V=document.body.dataset.variant;const REN=document.body.dataset.ren==='1'; // orig | v1 | v2 | v3
const NAV=[['index.html','Oversikt'],['original.html','Original'],['v1.html','Forslag 1'],['v2.html','Forslag 2'],['v3.html','Forslag 3']];
const typer=[['U0101',39,2],['U0102',70,3],['U0103',56,3],['H0101',39,2],['H0102',68,3],['H0103',92,5],['H0104',100,5],['H0201',45,2],['H0202',72,3],['H0203',88,4]];
const rader=[];let n=0;
for(let i=0;i<86;i++){const t=typer[i%typer.length];const etg=Math.floor(i/typer.length)+1;
 rader.push({id:i,adr:'Malerhaugveien 15',bolig:i<10?t[0]:'H'+String(etg).padStart(2,'0')+String(i%10+1).padStart(2,'0'),andel:i+1,areal:t[1],rom:t[2]});}
const sov={};let valgt=null,vis=10,filter='',feilVis=false;
if(V==='orig'){sov[1]='4';sov[2]='4';sov[3]='2';valgt=3;}
const appEl=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mangler=()=>valgt!==null&&!(sov[valgt]>='1'&&/^\d+$/.test(sov[valgt]||''));
function feilBoks(r){return `<span class="a-feil" role="alert">Du må fylle ut antall soverom.</span>`}
function sovInput(r,feil,fokus){return `<input class="sov${feil?' feil':''}" data-sov="${r.id}" inputmode="numeric" value="${esc(sov[r.id]??'')}" aria-label="Antall soverom for ${r.bolig}" ${fokus?'autofocus':''}>`}
function rad(r){
 const er=valgt===r.id;
 let sovTd='';
 if(V==='orig'){const f=r.id===0&&true;sovTd=`<td>${f?`<div class="a-celle har-feil"><div style="display:flex"></div><div>${sovInput(r,true)}${feilBoks()}</div></div>`:sovInput(r,false)}</td>`}
 else if(V==='v1'){sovTd=`<td class="sovcelle">${er?`<div>${sovInput(r,feilVis&&mangler(),true)}${feilVis&&mangler()?feilBoks():''}</div>`:''}</td>`}
 const head=`<th class="e-sr">Velg</th>`;
 let h=`<tr class="rad${er?' valgt':''}" data-id="${r.id}"><td><input type="radio" name="bol" ${er?'checked':''} aria-label="Velg ${r.bolig}"></td><td>${r.adr}</td><td>${r.bolig}</td><td>${r.andel}</td><td class="t">${r.areal} m²</td><td class="t">${r.rom}</td>${sovTd}</tr>`;
 if(V==='v3'&&er){h+=`<tr class="detalj"><td colspan="6"><div style="font-weight:600;margin-bottom:12px">Hvor mange soverom har ${r.bolig}?</div>
  <div class="a-steg"><button class="knapp" data-d="-1" aria-label="Færre soverom">−</button><span class="verdi">${sov[r.id]||'–'}</span><button class="knapp" data-d="1" aria-label="Flere soverom">+</button>
  <div class="a-chips" role="group" aria-label="Velg antall">${[1,2,3,4,5,6].map(k=>`<button data-k="${k}" class="${sov[r.id]==k?'på':''}">${k}${k==6?'+':''}</button>`).join('')}</div></div>
  ${feilVis&&mangler()?feilBoks():''}</td></tr>`}
 return h}
function render(){
 const liste=rader.filter(r=>!filter||[r.adr,r.bolig,r.andel].join(' ').toLowerCase().includes(filter));
 const syn=liste.slice(0,vis);
 const th=`<th class="e-sr">Valg</th>`;
 const sovTh=(V==='orig'||V==='v1')?'<th>Antall soverom</th>':'';
 let panel='';
 if(V==='v2'){const r=rader[valgt];panel=r?`<div class="a-panel"><div><h3>Valgt leilighet</h3><div>${r.adr} 15 · ${r.bolig} · andelsnr. ${r.andel} · ${r.areal} m²</div></div>
  <div><label for="sovp" style="font-weight:600;display:block;margin-bottom:6px">Antall soverom</label><input id="sovp" class="sov" style="width:70px;height:46px;border:${feilVis&&mangler()?'2px solid var(--e-feil-kant)':'1px solid var(--e-ramme-felt)'};border-radius:3px;padding:0 10px;font:inherit" data-sovp inputmode="numeric" value="${esc(sov[valgt]??'')}">${feilVis&&mangler()?feilBoks():''}</div></div>`
  :`<div class="a-panel tom">Velg en leilighet i listen for å oppgi antall soverom.</div>`}
 appEl.innerHTML=`${REN?'':`<nav class="a-nav" aria-label="Versjoner">${NAV.map(([h,t])=>`<a href="${h}" class="${location.pathname.endsWith(h)?'nå':''}">${t}</a>`).join('')}</nav>`}
 ${REN?'':V!=='orig'?`<div class="a-besk">${{v1:'<b>Forslag 1:</b> Ingen bokser i listen. Når du velger en leilighet blir raden grå, og boksen for soverom vises bare der.',v2:'<b>Forslag 2:</b> Listen har bare radioknapper. Soverom fylles ut i et eget panel under listen for den valgte leiligheten.',v3:'<b>Forslag 3:</b> Valgt rad åpner seg med en stor tallvelger (− / +) og hurtigvalg for 1–6 soverom.'}[V]}</div>`:`<div class="a-besk"><b>Original:</b> Gjenskapt fra dagens løsning. En boks for soverom på alle rader.</div>`}
 <div class="a-kort"><p class="a-spm">Hvilken borettslagsleilighet skal kjøpes?</p>
 <div class="a-tittel">Velg leilighet <span class="a-hjelp">?</span></div>
 <label for="sok" style="font-weight:600;display:block;margin-bottom:8px">Søk etter andelsleilighet</label>
 <div class="a-sok"><input id="sok" placeholder="Adresse, bolignummer eller andelsnummer" value="${esc(filter)}"><button type="button">Søk</button></div>
 <p class="a-meta">${liste.length} andelsleiligheter</p>
 <div class="e-tabell-rulle"><table class="a-tab ${V}"><thead><tr>${th}<th>Valg</th><th>Adresse</th><th>Bolignr.</th><th>Andelsnr.</th><th class="t">Bruksareal</th><th class="t">Antall rom</th>${sovTh}</tr></thead><tbody>${syn.map(rad).join('')}</tbody></table></div>
 ${vis<liste.length?'<button class="a-mer" data-mer>Vis flere</button>':''}
 ${panel}
 ${feilVis&&valgt===null?'<p class="a-radfeil" role="alert">Du må velge en leilighet.</p>':''}
 <div class="a-knapper"><button class="e-knapp" type="button">Tilbake</button><button class="e-knapp e-knapp--primar" data-neste type="button">Neste</button></div></div>`;
 // original: fix header duplicate (Valg column header)
}
function fiks(){const t=appEl.querySelector('thead tr');if(t&&t.firstElementChild.classList.contains('e-sr'))t.firstElementChild.remove();}
function draw(fok){const a=document.activeElement&&(document.activeElement.id||document.activeElement.dataset.sov);render();fiks();
 if(fok){const el=appEl.querySelector('[data-sov="'+valgt+'"]')||appEl.querySelector('[data-sovp]');el&&el.focus();}
 else if(a==='sok'){const s=document.getElementById('sok');s.focus();s.setSelectionRange(s.value.length,s.value.length)}}
appEl.addEventListener('click',e=>{
 const tr=e.target.closest('tr.rad');
 if(tr&&!e.target.closest('input.sov')){valgt=+tr.dataset.id;feilVis=false;if(V==='orig')return draw();draw(V!=='v3');return}
 const d=e.target.closest('[data-d]');if(d){const v=Math.min(20,Math.max(1,(+sov[valgt]||0)+ +d.dataset.d));sov[valgt]=String(v);return draw()}
 const k=e.target.closest('[data-k]');if(k){sov[valgt]=k.dataset.k;return draw()}
 if(e.target.closest('[data-mer]')){vis+=10;return draw()}
 if(e.target.closest('[data-neste]')){feilVis=true;draw(valgt!==null&&mangler());}
});
appEl.addEventListener('input',e=>{const t=e.target;
 if(t.id==='sok'){filter=t.value.trim().toLowerCase();vis=10;return draw()}
 if(t.dataset.sov!==undefined){sov[t.dataset.sov]=t.value}
 if(t.dataset.sovp!==undefined){sov[valgt]=t.value}
 if(feilVis&&!mangler()){feilVis=false;const a=t;draw();const el=appEl.querySelector('[data-sov="'+valgt+'"]')||appEl.querySelector('[data-sovp]');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}
});
draw(false);
})();
