function niceStep(range){
  if(!Number.isFinite(range) || range<=0) return 1;
  const raw=range/5, p=Math.pow(10,Math.floor(Math.log10(raw))), n=raw/p;
  return (n<=1?1:n<=2?2:n<=5?5:10)*p;
}
function fmtDate(iso){
  const d=new Date(iso+"T00:00:00Z");
  return d.toLocaleDateString("en-US",{month:"short",year:"2-digit",timeZone:"UTC"});
}
export function drawChart(canvas, series, visibleThroughIndex, cutoffIndex){
  const dpr=Math.max(1,window.devicePixelRatio||1), rect=canvas.getBoundingClientRect();
  const cssW=Math.max(1,rect.width), cssH=Math.max(1,rect.height);
  canvas.width=Math.round(cssW*dpr); canvas.height=Math.round(cssH*dpr);
  const ctx=canvas.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0);
  const W=cssW,H=cssH,p={l:72,r:28,t:30,b:48};
  ctx.clearRect(0,0,W,H); ctx.fillStyle="#070707";ctx.fillRect(0,0,W,H);

  const count=Math.max(...series.map(s=>s.values.length));
  if(!count) return;
  const finite=series.flatMap(s=>s.values.filter(v=>Number.isFinite(v.value)));
  if(!finite.length) return;
  let min=Math.min(...finite.map(v=>v.value)),max=Math.max(...finite.map(v=>v.value));
  const pad=Math.max(.12,(max-min)*.12);min-=pad;max+=pad;
  const plotW=W-p.l-p.r,plotH=H-p.t-p.b;
  const x=i=>p.l+plotW*(count<=1?0:i/(count-1));
  const y=v=>p.t+plotH*(max-v)/(max-min);

  // Future region begins at the current information boundary, not at a mismatched CSS percentage.
  const boundary=Math.max(0,Math.min(count-1,visibleThroughIndex));
  const bx=x(boundary);
  if(boundary<count-1){
    ctx.fillStyle="#0a0908";ctx.fillRect(bx,p.t,W-p.r-bx,plotH);
    ctx.save();ctx.strokeStyle="#16140f";ctx.lineWidth=1;
    for(let sx=bx-plotH;sx<W;sx+=12){ctx.beginPath();ctx.moveTo(sx,p.t+plotH);ctx.lineTo(sx+plotH,p.t);ctx.stroke()}
    ctx.restore();
  }

  // Horizontal grid / y labels
  const step=niceStep(max-min);
  const start=Math.floor(min/step)*step;
  ctx.font='10px Inter,-apple-system,system-ui,sans-serif';
  ctx.textAlign="right";ctx.textBaseline="middle";
  for(let v=start;v<=max+step;v+=step){
    if(v<min-.0001||v>max+.0001) continue;
    const yy=y(v);ctx.strokeStyle="#1d1d1d";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.l,yy);ctx.lineTo(W-p.r,yy);ctx.stroke();
    ctx.fillStyle="#6b6a66";ctx.fillText(v.toFixed(2)+"%",p.l-10,yy);
  }

  // Series: only observations available through the selected horizon.
  series.forEach(s=>{
    ctx.strokeStyle=s.color;ctx.lineWidth=2.2;ctx.lineJoin="round";ctx.lineCap="round";
    ctx.beginPath();let started=false;
    s.values.forEach((d,i)=>{
      if(i>boundary||!Number.isFinite(d.value)) return;
      const xx=x(i),yy=y(d.value);
      if(!started){ctx.moveTo(xx,yy);started=true}else ctx.lineTo(xx,yy);
    });
    if(started)ctx.stroke();
  });

  // X-axis labels across the whole chart window.
  const labels=series[0]?.values||[];
  const ticks=4;
  ctx.fillStyle="#6b6a66";ctx.font='10px Inter,-apple-system,system-ui,sans-serif';ctx.textAlign="center";ctx.textBaseline="top";
  for(let i=0;i<ticks;i++){
    const idx=Math.round((count-1)*i/(ticks-1));
    if(labels[idx])ctx.fillText(fmtDate(labels[idx].date),x(idx),H-p.b+14);
  }

  // Original event cutoff.
  const cx=x(Math.max(0,Math.min(count-1,cutoffIndex)));
  ctx.setLineDash([4,5]);ctx.strokeStyle="#a78d5b";ctx.beginPath();ctx.moveTo(cx,p.t);ctx.lineTo(cx,H-p.b);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle="#bba16d";ctx.font='9px Inter,-apple-system,system-ui,sans-serif';ctx.textAlign="left";ctx.textBaseline="top";
  ctx.fillText("EVENT CUTOFF",Math.min(cx+8,W-104),p.t+8);

  // Current information boundary after advancing.
  if(boundary>cutoffIndex){
    ctx.strokeStyle="#5c5a54";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,p.t);ctx.lineTo(bx,H-p.b);ctx.stroke();
    ctx.fillStyle="#87847c";ctx.fillText("CURRENT VIEW",Math.min(bx+8,W-95),p.t+22);
  }

  // Future message within the chart itself.
  if(boundary<count-1 && W-bx>120){
    ctx.save();ctx.translate((bx+W-p.r)/2,p.t+plotH/2);ctx.rotate(-Math.PI/2);
    ctx.fillStyle="#57534b";ctx.font='9px Inter,-apple-system,system-ui,sans-serif';ctx.textAlign="center";
    ctx.fillText("INFORMATION NOT YET AVAILABLE",0,0);ctx.restore();
  }
}
