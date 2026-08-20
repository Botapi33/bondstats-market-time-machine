#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, shutil, sys
ROOT=Path(__file__).resolve().parents[1]
moments=json.loads((ROOT/"data"/"moments.json").read_text())
assert len(moments)>=10
app=(ROOT/"js"/"app.js").read_text()
assert "future-mask" not in app, "Old future-mask code remains in app.js"
assert "function draw(){drawChart(" in app
node=shutil.which("node")
if node:
    for f in [ROOT/"js"/"app.js",ROOT/"js"/"components"/"chart.js",ROOT/"js"/"lib"/"format.js"]:
        r=subprocess.run([node,"--check",str(f)],capture_output=True,text=True)
        if r.returncode:
            print(r.stderr)
            sys.exit(r.returncode)
print("Smoke test passed")
