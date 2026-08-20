#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
moments=json.loads((ROOT/"data"/"moments.json").read_text())
assert len(moments)>=10
required={1,7,30,90,365}
for m in moments:
    assert m["series"] and len(m["series"])>=1, m["id"]
    lengths={len(s["values"]) for s in m["series"]}
    assert len(lengths)==1 and min(lengths)>=4, (m["id"],lengths)
    n=next(iter(lengths))
    assert 0<=m["cutoffIndex"]<n,(m["id"],m["cutoffIndex"],n)
    dates=[x["date"] for x in m["series"][0]["values"]]
    assert dates==sorted(dates),m["id"]
    for o in m.get("outcomes",[]):
        assert 0<=o["visibleIndex"]<n,(m["id"],o)
        assert o["visibleIndex"]>=m["cutoffIndex"],(m["id"],o)
    # Full production build must expose all five horizons. Seed data is allowed only before build.
    if n>20:
        got={o["days"] for o in m.get("outcomes",[])}
        assert required<=got,(m["id"],got)
print(f"Validated {len(moments)} historical moments")
