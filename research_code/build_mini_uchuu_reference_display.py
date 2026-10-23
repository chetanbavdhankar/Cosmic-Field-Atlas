"""Backend scene package: sampled density plus separately fitted coarse halo velocity."""
import json
import numpy as np
from halo_velocity_basis import predict
from native_halo_benchmark_common_v2 import ROOT,sha,now,write
def run():
    out=ROOT/'results/mini_uchuu_reference_display_v1.json';path=ROOT/'results/mini_uchuu_reference_display_v1.npz'
    if out.exists() or path.exists():raise FileExistsError('Native display package already attempted')
    report=ROOT/'results/mini_particle_density_v1.json';d=json.loads(report.read_text());check=ROOT/'results/mini_particle_density_checks_v1.json';v=json.loads(check.read_text());assert v['checks_pass'] and v['report_sha256']==sha(report) and d['primary_disagreement_screen_pass'],'Density sampling precision screen did not pass; no reference scene promotion'
    fit_report=ROOT/'results/native_halo_velocity_k09_v2/report.json';fit=json.loads(fit_report.read_text());audit=ROOT/'results/native_halo_velocity_k09_checks_v2.json';assert json.loads(audit.read_text())['checks_pass'] and json.loads(audit.read_text())['report_sha256']==sha(fit_report) and sha(ROOT/fit['fit_file'])==fit['fit_sha256']
    with np.load(ROOT/d['files']['2026103101']['file']) as a,np.load(ROOT/d['files']['2026103102']['file']) as b,np.load(ROOT/fit['fit_file']) as f:
        density=(a['delta_n64_R40']+b['delta_n64_R40'])/2;difference=(a['delta_n64_R40']-b['delta_n64_R40'])/2;L=400/.6774;axis=np.arange(64)*L/64;x=np.stack(np.meshgrid(axis,axis,axis,indexing='ij'),axis=-1).reshape(-1,3);velocity=predict(x,L,9,f['coefficients']).reshape(64,64,64,3).transpose(3,0,1,2)
        assert np.isfinite(density).all() and np.isfinite(velocity).all();np.savez_compressed(path,density=density,velocity=velocity,sampling_half_difference=difference)
    result=dict(created_utc=now(),checks_pass=True,data_file=str(path.relative_to(ROOT)),data_sha256=sha(path),input_sha256={str(p.relative_to(ROOT)):sha(p) for p in [report,check,fit_report,audit]},conventions=dict(frame='Mini-Uchuu simulation Cartesian axes; no Galactic transformation',mesh='64 periodic CIC nodes, array axes x,y,z; vector component first',origin_mpc=[-L/2]*3,spacing_mpc=L/64,box_mpc=L,coordinate_unit='comoving Mpc',observer_origin='Arbitrary simulation-box centre; not the Milky Way or Local Group. Native coordinates translated by -L/2 for display only.',periodic=True,epoch_redshift=1/.9998868107795715-1,particle_scale_factor_header=.9998868107795715,halo_scale_factor_catalogue=.99989,physical_time_evolution=False),density_definition='Probability-sampled collisionless particle contrast; Gaussian R=40 comoving Mpc',velocity_definition='Primary cutoff-9 curl-free least-squares fit to 32768 native host-halo velocities; not exact particle velocity',minimum_comoving_velocity_wavelength_mpc=L/3,sampling_half_difference_is_posterior_sd=False,scientific_acceptance=False)
    write(out,result)
if __name__=='__main__':run()
