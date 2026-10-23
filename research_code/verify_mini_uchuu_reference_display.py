import json
import numpy as np
from verify_native_halo_velocity_fit_v2 import oracle
from native_halo_benchmark_common_v2 import ROOT,sha,now,write
def run():
    out=ROOT/'results/mini_uchuu_reference_display_checks_v1.json'
    if out.exists():raise FileExistsError(out)
    rp=ROOT/'results/mini_uchuu_reference_display_v1.json';r=json.loads(rp.read_text());assert r['checks_pass'] and sha(ROOT/r['data_file'])==r['data_sha256']
    for name,digest in r['input_sha256'].items():assert sha(ROOT/name)==digest
    density=json.loads((ROOT/'results/mini_particle_density_v1.json').read_text());assert density['primary_disagreement_screen_pass'];L=400/.6774
    with np.load(ROOT/r['data_file']) as a,np.load(ROOT/density['files']['2026103101']['file']) as p,np.load(ROOT/density['files']['2026103102']['file']) as q,np.load(ROOT/'results/native_halo_velocity_k09_v2/fit.npz') as f:
        assert a['density'].shape==(64,64,64) and a['velocity'].shape==(3,64,64,64) and np.array_equal(a['density'],(p['delta_n64_R40']+q['delta_n64_R40'])/2) and np.array_equal(a['sampling_half_difference'],(p['delta_n64_R40']-q['delta_n64_R40'])/2)
        axis=np.linspace(0,L,65)[:-1];positions=np.array(np.meshgrid(axis,axis,axis,indexing='ij')).reshape(3,-1).T;v=oracle(positions,f['coefficients'],9).T.reshape(3,64,64,64);error=float(np.max(abs(v-a['velocity'])));assert error<1e-8
    assert r['conventions']['origin_mpc']==[-L/2]*3 and r['conventions']['spacing_mpc']==L/64 and 'not the Milky Way' in r['conventions']['observer_origin'] and not r['scientific_acceptance']
    write(out,dict(created_utc=now(),checks_pass=True,display_report_sha256=sha(rp),data_sha256=r['data_sha256'],maximum_velocity_oracle_error=error,density_and_half_difference_replayed=True,native_frame_and_epoch_retained=True,scientific_acceptance=False))
if __name__=='__main__':run()
