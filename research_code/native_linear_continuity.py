"""Fixed native-cosmology linear continuity operator; no fitted beta or bulk."""
import numpy as np
from scipy.integrate import quad
from halo_velocity_basis import modes
def growth(a,omega_m=.3089,H0=67.74):
    if not np.isfinite([a,omega_m,H0]).all() or not 0<a<=1 or not 0<omega_m<=1 or H0<=0:raise ValueError('Finite flat dust+Lambda parameters required')
    def E(x):return np.sqrt(omega_m/x**3+1-omega_m)
    integral,error=quad(lambda x:0. if x==0 else 1/(x**3*E(x)**3),0,a,epsabs=1e-13,epsrel=1e-12);e=E(a);om_a=omega_m/(a**3*e*e);f=-1.5*om_a+1/(a*a*e**3*integral)
    return dict(a=float(a),omega_m=float(omega_m),H0_kms_Mpc=float(H0),H_kms_Mpc=float(H0*e),growth_rate=float(f),aHf_kms_Mpc=float(a*H0*e*f),unnormalized_growing_mode=float(2.5*omega_m*e*integral),integral_absolute_error=float(error))
def density_coefficients(delta,L,aHf):
    delta=np.asarray(delta,float)
    if delta.ndim!=3 or len(set(delta.shape))!=1 or len(delta)<8 or not np.isfinite(delta).all() or not np.isfinite([L,aHf]).all() or min(L,aHf)<=0:raise ValueError('Finite cubic density, side and aHf required')
    n=len(delta);F=np.fft.fftn(delta)/n**3;k=modes(9);cosine=[];sine=[];velocity=np.zeros(3+2*len(k))
    for j,integer in enumerate(k):
        cic=float(np.prod(np.sinc(integer/n)**2));q=F[tuple(integer%n)]/cic;dc=2*q.real;ds=-2*q.imag;length=2*np.pi*np.linalg.norm(integer)/L;cosine.append(dc);sine.append(ds);velocity[3+2*j]=aHf/length*ds;velocity[4+2*j]=-aHf/length*dc
    return dict(cosine=np.asarray(cosine),sine=np.asarray(sine),velocity_coefficients=velocity)
def density_at(x,L,cosine,sine):
    x=np.asarray(x,float);c=np.asarray(cosine,float);s=np.asarray(sine,float);k=modes(9)
    if x.ndim!=2 or x.shape[1]!=3 or c.shape!=(len(k),) or s.shape!=c.shape or not np.isfinite(x).all() or not np.isfinite(c).all() or not np.isfinite(s).all():raise ValueError('Aligned finite density modes required')
    result=[]
    for start in range(0,len(x),4096):phase=2*np.pi*x[start:start+4096]@k.T/L;result.append(np.cos(phase)@c+np.sin(phase)@s)
    return np.concatenate(result)
