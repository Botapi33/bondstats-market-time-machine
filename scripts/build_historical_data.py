#!/usr/bin/env python3
import csv, io, json, urllib.request
from pathlib import Path
from datetime import date, datetime, timedelta

ROOT=Path(__file__).resolve().parents[1]
META=ROOT/"data"/"moments.meta.json"
OUT=ROOT/"data"/"moments.json"

URLS={
 "DGS2":"https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS2",
 "DGS10":"https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10",
 "VIXCLS":"https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS"
}
COLORS={"DGS10":"#c5a66b","DGS2":"#7694aa"}

def fetch_csv(series,url):
    req=urllib.request.Request(url,headers={"User-Agent":"BondStats-Market-Time-Machine/2.0"})
    with urllib.request.urlopen(req,timeout=45) as r:
        text=r.read().decode("utf-8")
    rd=csv.DictReader(io.StringIO(text))
    fields=rd.fieldnames or []
    value_key=series if series in fields else fields[-1]
    date_key=next((f for f in fields if f!=value_key),fields[0])
    out={}
    for row in rd:
        raw=row.get(value_key)
        if raw in (None,"","."): continue
        try: out[row[date_key]]=float(raw)
        except ValueError: continue
    if len(out)<250: raise RuntimeError(f"{series}: insufficient observations")
    return out

def on_or_before(d, common_dates):
    vals=[x for x in common_dates if x<=d]
    if not vals: raise RuntimeError(f"No observation on/before {d}")
    return vals[-1]

def on_or_after(d, common_dates, max_days=10):
    vals=[x for x in common_dates if x>=d]
    if not vals: return None
    x=vals[0]
    if (date.fromisoformat(x)-date.fromisoformat(d)).days>max_days: return None
    return x

def nearest_value(series, d, direction="before"):
    dates=sorted(series)
    if direction=="before":
        vals=[x for x in dates if x<=d]
        return series[vals[-1]] if vals else None
    vals=[x for x in dates if x>=d]
    return series[vals[0]] if vals else None

meta=json.loads(META.read_text())
raw={k:fetch_csv(k,u) for k,u in URLS.items()}
common=sorted(set(raw["DGS2"]) & set(raw["DGS10"]))
built=[]

for m in meta:
    event=date.fromisoformat(m["date"])
    start=(event-timedelta(days=180)).isoformat()
    end=(event+timedelta(days=380)).isoformat()
    window=[d for d in common if start<=d<=end]
    cutoff_date=on_or_before(m["date"],window)
    cutoff=window.index(cutoff_date)

    s10=[{"date":d,"value":raw["DGS10"][d]} for d in window]
    s2=[{"date":d,"value":raw["DGS2"][d]} for d in window]
    vix_val=nearest_value(raw["VIXCLS"],cutoff_date,"before") if event.year>=1990 else None

    outcomes=[]
    for days in (1,7,30,90,365):
        target=(event+timedelta(days=days)).isoformat()
        od=on_or_after(target,window,10)
        if od is None: continue
        idx=window.index(od)
        vix=nearest_value(raw["VIXCLS"],od,"before") if event.year>=1990 else None
        outcomes.append({
          "days":days,"date":od,"visibleIndex":idx,
          "us2y":raw["DGS2"][od],"us10y":raw["DGS10"][od],"vix":vix
        })

    snapshot={
      "us2y":raw["DGS2"][cutoff_date],
      "us10y":raw["DGS10"][cutoff_date],
      "volatility":vix_val,
      "volatilityLabel":"VIX" if vix_val is not None else "Market state",
      "volatilityNote":"CBOE VIX at cutoff" if vix_val is not None else "Pre-VIX era"
    }

    built.append({
      **m,
      "date":cutoff_date,
      "cutoffIndex":cutoff,
      "snapshot":snapshot,
      "series":[
        {"label":"U.S. 10Y","color":COLORS["DGS10"],"values":s10},
        {"label":"U.S. 2Y","color":COLORS["DGS2"],"values":s2}
      ],
      "outcomes":outcomes
    })

OUT.write_text(json.dumps(built,indent=2)+"\n")
print(f"Built {len(built)} moments with full daily paths")
for m in built:
    print(m["id"],len(m["series"][0]["values"]),[o["days"] for o in m["outcomes"]])
