#!/usr/bin/env python3
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
with open(root/'data'/'moments.json',encoding='utf-8') as f: moments=json.load(f)
errors=[]
ids=set()
for m in moments:
    for key in ('id','year','date','title','snapshot','series','cutoffIndex'):
        if key not in m: errors.append(f"{m.get('id','?')}: missing {key}")
    if m.get('id') in ids: errors.append(f"duplicate id: {m['id']}")
    ids.add(m.get('id'))
    maxlen=max((len(s.get('values',[])) for s in m.get('series',[])),default=0)
    if not (0 <= m.get('cutoffIndex',-1) < maxlen): errors.append(f"{m.get('id')}: invalid cutoffIndex")
    for s in m.get('series',[]):
        dates=[v.get('date') for v in s.get('values',[])]
        if dates!=sorted(dates): errors.append(f"{m.get('id')}/{s.get('label')}: dates not sorted")
    for o in m.get('outcomes',[]):
        if o.get('visibleIndex',-1) >= maxlen: errors.append(f"{m.get('id')}: outcome index out of range")
if errors:
    print('\n'.join(errors));sys.exit(1)
print(f"Validated {len(moments)} historical moments")
