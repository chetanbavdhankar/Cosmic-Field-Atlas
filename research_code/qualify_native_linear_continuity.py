import json
import numpy as np
from scipy.integrate import solve_ivp
from native_linear_continuity import growth,density_coefficients,density_at
from halo_velocity_basis import modes,predict,gradient
from native_halo_benchmark_common_v2 import ROOT,sha,now,write
def run():
    out=ROOT/'results/native_linear_continuity_qualification_v1.json'
    if out.exists():raise FileExistsError(out)
    for a in [.25,.5,1.]:
        g=growth(a,1.,70.);assert abs(g['growth_rate']-1)<1e-11 and abs(g['unnormalized_growing_mode']-a)<1e-11
    om=.3089;a=.9998868107795715
    def rhs(x,y):
        E2=om/x**3+1-om;dlnE=-1.5*om/(x**4*E2);return [y[1],-(3/x+dlnE)*y[1]+1.5*om*y[0]/(x**5*E2)]
    sol=solve_ivp(rhs,[1e-4,a],[1e-4,1.],rtol=1e-11,atol=1e-13);f_ode=a*sol.y[1,-1]/sol.y[0,-1];g=growth(a);growth_error=abs(f_ode-g['growth_rate']);assert growth_error<1e-8
    n=16;L=400/.6774;axis=np.arange(n)*L/n;x=np.array(np.meshgrid(axis,axis,axis,indexing='ij')).reshape(3,-1).T;k=np.array([1,1,0]);phase=2*np.pi*x@k/L;window=np.prod(np.sinc(k/n)**2);raw=(window*(.1*np.cos(phase)+.03*np.sin(phase))).reshape(n,n,n);c=density_coefficients(raw,L,g['aHf_kms_Mpc']);recovered=density_at(x,L,c['cosine'],c['sine']);density_error=float(np.max(abs(recovered-(.1*np.cos(phase)+.03*np.sin(phase)))));assert density_error<1e-12
    expected=(g['aHf_kms_Mpc']/(2*np.pi*np.linalg.norm(k)/L))*(.03*np.cos(phase)-.1*np.sin(phase))[:,None]*k/np.linalg.norm(k);actual=predict(x,L,9,c['velocity_coefficients']);velocity_error=float(np.max(abs(actual-expected)));assert velocity_error<1e-9
    divergence=np.trace(gradient(x[:100],L,9,c['velocity_coefficients']),axis1=1,axis2=2);continuity_error=float(np.max(abs(divergence+g['aHf_kms_Mpc']*recovered[:100])));assert continuity_error<1e-10
    zero=density_coefficients(np.ones((n,n,n)),L,g['aHf_kms_Mpc']);assert np.max(abs(zero['velocity_coefficients']))==0
    write(out,dict(created_utc=now(),checks_pass=True,module_sha256=sha(ROOT/'native_linear_continuity.py'),qualifier_sha256=sha(__file__),EdS_growth_pass=True,native_growth=g,native_growth_ODE_difference=float(growth_error),CIC_compensated_plane_density_error=density_error,analytic_velocity_sign_units_error=velocity_error,continuity_divergence_error=continuity_error,DC_produces_no_velocity=True,physical_density_source_values_read=False,scientific_acceptance=False))
if __name__=='__main__':run()
