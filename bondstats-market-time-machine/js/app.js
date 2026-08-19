import {drawChart} from './components/chart.js';
import {fmtPct,fmtBp,fmtIndex,prettyDate} from './lib/format.js';

const $=s=>document.querySelector(s);
const state={data:null,moment:null,baseIndex:0,visibleIndex:0};

async function boot(){
  const [moments,sources]=await Promise.all([fetch('./data/moments.json').then(r=>r.json()),fetch('./data/sources.json').then(r=>r.json())]);
  state.data={moments,sources};
  renderMomentRail();
  const id=new URLSearchParams(location.search).get('moment')||moments[4].id;
  selectMoment(id,false);
  $('#sources-toggle').addEventListener('click',toggleSources);
  $('#reset-button').addEventListener('click',()=>setVisibleIndex(state.baseIndex));
  window.addEventListener('resize',()=>draw());
}

function renderMomentRail(){
  $('#moment-list').innerHTML=state.data.moments.map(m=>`<button class="moment-button" data-id="${m.id}" role="listitem"><span class="moment-button__year">${m.year}</span><span class="moment-button__title">${m.title}</span></button>`).join('');
  document.querySelectorAll('.moment-button').forEach(b=>b.addEventListener('click',()=>selectMoment(b.dataset.id,true)));
}

function selectMoment(id,push){
  const m=state.data.moments.find(x=>x.id===id)||state.data.moments[0]; state.moment=m;
  state.baseIndex=m.cutoffIndex;state.visibleIndex=m.cutoffIndex;
  document.querySelectorAll('.moment-button').forEach(b=>b.classList.toggle('is-active',b.dataset.id===m.id));
  if(push){const u=new URL(location.href);u.searchParams.set('moment',m.id);history.replaceState({},'',u)}
  $('#moment-date').textContent=prettyDate(m.date);
  $('#cutoff-date').textContent=prettyDate(m.date);
  $('#moment-title').textContent=m.title;
  $('#moment-kicker').textContent=m.kicker;
  $('#chart-title').textContent=m.chartTitle||'Treasury yields';
  renderSnapshot(m.snapshot);renderKnown(m.known);renderStates(m.states);renderLegend(m.series);renderHorizons();renderSources();
  $('#outcome-panel').hidden=true;draw();
}

function renderSnapshot(s){
  const items=[['U.S. 2Y',s.us2y,fmtPct,'Constant maturity'],['U.S. 10Y',s.us10y,fmtPct,'Constant maturity'],['2s10s',Number.isFinite(s.us2y)&&Number.isFinite(s.us10y)?(s.us10y-s.us2y)*100:null,fmtBp,'Curve spread'],[s.volatilityLabel||'Volatility',s.volatility,s.volatilityLabel==='VIX'?fmtIndex:fmtPct,s.volatilityNote||'At cutoff']];
  $('#snapshot').innerHTML=items.map(([l,v,f,n])=>`<div class="snapshot-item"><div class="snapshot-label">${l}</div><div class="snapshot-value">${f(v)}</div><div class="snapshot-note">${n}</div></div>`).join('');
}
function renderKnown(items){$('#known-list').innerHTML=items.map(x=>`<p>${x}</p>`).join('')}
function renderStates(items){$('#state-list').innerHTML=Object.entries(items).map(([k,v])=>`<div class="state-row"><span>${k}</span><strong class="state-pill">${v}</strong></div>`).join('')}
function renderLegend(series){$('#chart-legend').innerHTML=series.map((s,i)=>`<span class="${i?'blue':''}"><i style="background:${s.color}"></i>${s.label}</span>`).join('')}
function renderHorizons(){const m=state.moment;const horizons=[['1D',1],['7D',7],['30D',30],['90D',90],['1Y',365]];$('#horizon-buttons').innerHTML=horizons.map(([label,days])=>{const h=m.outcomes?.find(o=>o.days===days);return `<button class="horizon-button" data-days="${days}" ${h?'':'disabled'}>${label}</button>`}).join('');document.querySelectorAll('.horizon-button:not(:disabled)').forEach(b=>b.addEventListener('click',()=>advance(Number(b.dataset.days))))}
function advance(days){const o=state.moment.outcomes.find(x=>x.days===days);if(!o)return;setVisibleIndex(o.visibleIndex);$('#outcome-title').textContent=`${days===365?'1 year':days+' days'} later · ${prettyDate(o.date)}`;const base=state.moment.snapshot;const cards=[['U.S. 2Y',Number.isFinite(o.us2y)&&Number.isFinite(base.us2y)?(o.us2y-base.us2y)*100:null,fmtBp],['U.S. 10Y',Number.isFinite(o.us10y)&&Number.isFinite(base.us10y)?(o.us10y-base.us10y)*100:null,fmtBp],['2s10s',Number.isFinite(o.us2y)&&Number.isFinite(o.us10y)&&Number.isFinite(base.us2y)&&Number.isFinite(base.us10y)?((o.us10y-o.us2y)-(base.us10y-base.us2y))*100:null,fmtBp],['VIX',Number.isFinite(o.vix)&&Number.isFinite(base.volatility)?o.vix-base.volatility:null,v=>Number.isFinite(v)?`${v>0?'+':''}${v.toFixed(1)}`:'—']];$('#outcome-grid').innerHTML=cards.map(([l,v,f])=>`<div class="outcome-card"><span>${l}</span><strong>${f(v)}</strong></div>`).join('');$('#outcome-panel').hidden=false;$('#outcome-panel').scrollIntoView({behavior:'smooth',block:'nearest'})}
function setVisibleIndex(i){state.visibleIndex=i;$('#outcome-panel').hidden=i===state.baseIndex;draw()}
function draw(){drawChart($('#market-chart'),state.moment.series,state.visibleIndex);const max=Math.max(...state.moment.series.map(s=>s.values.length))-1;const pct=Math.max(0,100-(state.visibleIndex/max*100));$('#future-mask').style.width=`${Math.max(0,Math.min(70,pct))}%`;$('#future-mask').hidden=state.visibleIndex>=max}
function renderSources(){const ids=state.moment.sources||[];$('#sources-body').innerHTML=ids.map(id=>{const s=state.data.sources[id];return s?`<p><strong>${s.name}</strong> — ${s.note}<br><a href="${s.url}" target="_blank" rel="noreferrer">View source</a></p>`:''}).join('')+`<p>Method: The information boundary is fixed at the selected historical date. Future observations are revealed only when the market is advanced. No AI-generated forecasts are used.</p>`}
function toggleSources(){const b=$('#sources-body'),btn=$('#sources-toggle'),open=b.hidden;b.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.lastElementChild.textContent=open?'−':'+'}

boot().catch(err=>{console.error(err);$('#data-status').textContent='Data load error'});
