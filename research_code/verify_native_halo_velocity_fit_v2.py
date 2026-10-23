"""Complex-exponential prediction/gradient replay without held velocity truth."""
import argparse,itertools,json,math
import numpy as np
from native_halo_benchmark_common_v2 import ROOT,PROFILE,sha,now,prepared,write
def oracle(x,c,cutoff):
    n=math.isqrt(cutoff);terms=[k for k in itertools.product(range(-n,n+1),repeat=3) if 0<sum(v*v for v in k)<=cutoff and next(v for v in k if v)>0];v=np.broadcast_to(c[:3],x.shape).copy()
    for j,k in enumerate(terms):
        k=np.array(k);v+=np.real((c[3+2*j]-1j*c[4+2*j])*np.exp(2j*np.pi*x@k/(400/.6774)))[:,None]*k/np.linalg.norm(k)
    return v
def run(cutoff):
    prepared();out=ROOT/f'results/native_halo_velocity_k{cutoff:02d}_checks_v2.json'
    if out.exists():raise FileExistsError(out)
    folder=ROOT/f'results/native_halo_velocity_k{cutoff:02d}_v2';rp=folder/'report.json';r=json.loads(rp.read_text());assert r['checks_pass'] and not r['held_truth_read'] and r['profile_sha256']==sha(PROFILE) and sha(ROOT/r['fit_file'])==r['fit_sha256']
    from halo_velocity_basis import design
    with np.load(ROOT/r['fit_file']) as f,np.load(ROOT/'data/staged/native_halo_velocity_v2/training.npz') as a,np.load(ROOT/'data/staged/native_halo_velocity_v2/held_positions.npz') as b:
        c=f['coefficients'];held_error=float(np.max(abs(oracle(b['position_mpc'],c,cutoff)-f['held_prediction_kms'])));assert np.array_equal(b['id'],f['held_id']);assert np.array_equal(a['velocity_kms'].mean(axis=0),f['training_bulk_kms'])
        train_pred=oracle(a['position_mpc'],c,cutoff);res=(train_pred-a['velocity_kms']).ravel();X=design(a['position_mpc'],400/.6774,cutoff);g=X.T@res;relative=float(np.max(abs(g))/max(1,np.max(abs(X.T@a['velocity_kms'].ravel()))));sse=float(res@res);sse_error=abs(sse-r['residual_sum_squares'])/max(1,sse)
        assert held_error<1e-8 and relative<1e-10 and sse_error<1e-12 and r['rank']==len(c) and np.all(f['singular_values']>0)
    write(out,dict(created_utc=now(),checks_pass=True,report_sha256=sha(rp),fit_sha256=r['fit_sha256'],held_complex_oracle_max_error=held_error,relative_normal_equation_residual=relative,relative_training_sse_error=sse_error,held_truth_read=False,scientific_acceptance=False))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('cutoff',type=int,choices=[1,4,9,16]);run(p.parse_args().cutoff)
