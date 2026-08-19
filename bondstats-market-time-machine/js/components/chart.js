export function drawChart(canvas, series, visibleThroughIndex){
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width*dpr));
  canvas.height = Math.max(1, Math.floor(rect.height*dpr));
  const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
  const W=rect.width,H=rect.height,p={l:54,r:28,t:28,b:44};
  ctx.clearRect(0,0,W,H); ctx.fillStyle='#070707'; ctx.fillRect(0,0,W,H);
  const pts=series.flatMap(s=>s.values.slice(0,visibleThroughIndex+1).filter(v=>Number.isFinite(v.value)));
  if(!pts.length) return;
  let min=Math.min(...pts.map(v=>v.value)),max=Math.max(...pts.map(v=>v.value));
  const pad=(max-min||1)*.18; min-=pad; max+=pad;
  ctx.strokeStyle='#1f1f1f';ctx.lineWidth=1;ctx.font='10px system-ui';ctx.fillStyle='#73736f';
  for(let i=0;i<5;i++){const y=p.t+(H-p.t-p.b)*i/4;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(W-p.r,y);ctx.stroke();const val=max-(max-min)*i/4;ctx.fillText(val.toFixed(2)+'%',7,y+3)}
  const count=Math.max(...series.map(s=>s.values.length));
  const x=i=>p.l+(W-p.l-p.r)*(count<=1?0:i/(count-1));
  const y=v=>p.t+(H-p.t-p.b)*(max-v)/(max-min);
  series.forEach((s,si)=>{ctx.strokeStyle=s.color;ctx.lineWidth=2.2;ctx.beginPath();let started=false;s.values.slice(0,visibleThroughIndex+1).forEach((d,i)=>{if(!Number.isFinite(d.value))return;const xx=x(i),yy=y(d.value);if(!started){ctx.moveTo(xx,yy);started=true}else ctx.lineTo(xx,yy)});ctx.stroke()});
  const labels=series[0]?.values||[];ctx.fillStyle='#777771';
  [0,Math.floor((Math.min(visibleThroughIndex,labels.length-1))/2),Math.min(visibleThroughIndex,labels.length-1)].filter((v,i,a)=>a.indexOf(v)===i).forEach(i=>{const d=labels[i]; if(!d)return;ctx.fillText(d.date.slice(5),x(i)-18,H-16)});
  const cutoffX=x(Math.min(visibleThroughIndex,count-1));ctx.setLineDash([5,5]);ctx.strokeStyle='#8f7850';ctx.beginPath();ctx.moveTo(cutoffX,p.t);ctx.lineTo(cutoffX,H-p.b);ctx.stroke();ctx.setLineDash([]);
}
