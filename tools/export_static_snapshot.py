"""Refresh the existing seven-product static release from the local viewer."""
from pathlib import Path
import json,hashlib,urllib.request
from urllib.parse import quote
root=Path(__file__).resolve().parents[1]
products=json.loads((root/'provenance/products.json').read_text())
def read(path):
 with urllib.request.urlopen('http://127.0.0.1:8768'+path,timeout=120) as r:return json.load(r)
m=read('/api/field-scenes');ids={p['id'] for p in products};m['scenes']=[s for s in m['scenes'] if s['id'] in ids]
if len(m['scenes'])!=len(ids):raise SystemExit('An included product is missing; keep current release')
pending=[]
for p in products:
 s=read('/api/field-scene?id='+quote(p['id'],safe=''));pending.append((p,s))
for p,s in pending:
 (root/p['file']).write_text(json.dumps(s,ensure_ascii=True,allow_nan=False,separators=(',',':')),encoding='utf-8')
 p.update(revision=s['revision'],shape=s['shape'],density_definition=s['density_definition'],uncertainty=s['uncertainty'],frame=s['frame'])
m['refresh_seconds']=None
(root/'snapshot.js').write_text('window.FIELD_ATLAS_SNAPSHOT='+json.dumps(dict(manifest=m,paths={p['id']:p['file'] for p in products}),ensure_ascii=True,separators=(',',':'))+';\n',encoding='utf-8')
(root/'provenance/products.json').write_text(json.dumps(products,indent=2),encoding='utf-8')
hashes={f.relative_to(root).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(root.rglob('*')) if f.is_file() and f.name!='SHA256SUMS.json' and '__pycache__' not in f.parts}
(root/'SHA256SUMS.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
print('Refreshed',len(products),'field products; verify and upload all changed files together')
