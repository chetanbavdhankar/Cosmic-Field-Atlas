"""Frozen native-reference contract; observed-Universe products are untouched."""
from pathlib import Path
import datetime,hashlib,json
ROOT=Path(__file__).resolve().parent
PROFILE=ROOT/'config/native_halo_velocity_execution_v2.json'
def sha(p):
    h=hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda:f.read(4*1024*1024),b''):h.update(b)
    return h.hexdigest()
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def contract():
    c=json.loads(PROFILE.read_text())
    for name,digest in c['source_sha256'].items():assert sha(ROOT/name)==digest,name
    for name,digest in c['qualification_sha256'].items():assert sha(ROOT/name)==digest and json.loads((ROOT/name).read_text())['checks_pass'],name
    return c
def write(path,result):
    if path.exists():raise FileExistsError(path)
    path.write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
def prepared():
    contract();p=ROOT/'results/native_halo_admission_v2.json';r=json.loads(p.read_text());assert r['checks_pass']
    for name,digest in r['payload_sha256'].items():assert sha(ROOT/name)==digest,name
    assert json.loads((ROOT/'results/native_halo_admission_checks_v2.json').read_text())['checks_pass']
    return r
