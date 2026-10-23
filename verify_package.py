from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
m=json.loads((root/'SHA256SUMS.json').read_text())
for name,digest in m.items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name
print('PASS:',len(m),'bundled file hashes match')
