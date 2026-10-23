"""Native-periodic curl-free velocity representation, not matter-density truth."""
import itertools,math
import numpy as np

def modes(cutoff):
    if type(cutoff) is not int or cutoff not in [1,4,9,16]:raise ValueError('Declared squared-integer cutoff required')
    n=math.isqrt(cutoff);return np.array([k for k in itertools.product(range(-n,n+1),repeat=3) if 0<sum(v*v for v in k)<=cutoff and next(v for v in k if v)!=0 and next(v for v in k if v)>0],dtype=int)
def positions(x,L):
    x=np.asarray(x,float)
    if x.ndim!=2 or x.shape[1]!=3 or not len(x) or not np.isfinite(x).all() or not np.isfinite(L) or L<=0:raise ValueError('Nonempty finite Nx3 positions and positive finite side required')
    return x
def design(x,L,cutoff):
    x=positions(x,L);k=modes(cutoff);unit=k/np.sqrt((k*k).sum(axis=1))[:,None];phase=2*np.pi*(x/L)@k.T;P=3+2*len(k);X=np.zeros((len(x),3,P));X[:,0,0]=1;X[:,1,1]=1;X[:,2,2]=1
    for j in range(len(k)):X[:,:,3+2*j]=np.cos(phase[:,j,None])*unit[j];X[:,:,4+2*j]=np.sin(phase[:,j,None])*unit[j]
    return X.reshape(3*len(x),P)
def predict(x,L,cutoff,coefficients,chunk=4096):
    x=positions(x,L);k=modes(cutoff);c=np.asarray(coefficients,float);P=3+2*len(k)
    if c.shape!=(P,) or not np.isfinite(c).all() or type(chunk) is not int or chunk<1:raise ValueError('Aligned finite coefficients and positive chunk required')
    unit=k/np.sqrt((k*k).sum(axis=1))[:,None];result=[]
    for start in range(0,len(x),chunk):
        phase=2*np.pi*(x[start:start+chunk]/L)@k.T;result.append(c[:3]+(np.cos(phase)*c[3::2]+np.sin(phase)*c[4::2])@unit)
    return np.concatenate(result)
def gradient(x,L,cutoff,coefficients):
    x=positions(x,L);k=modes(cutoff);c=np.asarray(coefficients,float)
    if c.shape!=(3+2*len(k),) or not np.isfinite(c).all():raise ValueError('Aligned finite coefficients required')
    unit=k/np.sqrt((k*k).sum(axis=1))[:,None];phase=2*np.pi*(x/L)@k.T;derivative=-np.sin(phase)*c[3::2]+np.cos(phase)*c[4::2]
    return 2*np.pi/L*np.einsum('nm,ma,mb->nab',derivative,unit,k)
def fit(x,v,L,cutoff):
    x=positions(x,L);v=np.asarray(v,float)
    if v.shape!=x.shape or not np.isfinite(v).all():raise ValueError('Finite aligned3Dtraining velocities required')
    X=design(x,L,cutoff);c,residual,rank,singular=np.linalg.lstsq(X,v.ravel(),rcond=None);prediction=(X@c).reshape(v.shape);normal=X.T@(prediction-v).ravel();rhs=X.T@v.ravel();relative=float(np.max(abs(normal))/max(1,np.max(abs(rhs))));difference=float(np.max(abs(prediction-predict(x,L,cutoff,c))));qualified=rank==X.shape[1] and relative<1e-10 and difference<1e-8 and np.isfinite(c).all()
    return dict(coefficients=c,rank=int(rank),parameters=X.shape[1],singular_values=singular,residual_sum_squares=float(np.sum((prediction-v)**2)),relative_normal_equation_residual=relative,matrix_direct_prediction_difference=difference,checks_pass=bool(qualified))
def hash_ids(ids,seed=2026103001):
    a=np.asarray(ids)
    if a.ndim!=1 or a.dtype.kind not in 'iu' or np.any(a<0) or type(seed) is not int or not 0<=seed<2**64:raise ValueError('Exact nonnegative integer IDs and uint64seed required')
    with np.errstate(over='ignore'):
        z=a.astype(np.uint64)+np.uint64(seed)+np.uint64(0x9e3779b97f4a7c15);z=(z^(z>>np.uint64(30)))*np.uint64(0xbf58476d1ce4e5b9);z=(z^(z>>np.uint64(27)))*np.uint64(0x94d049bb133111eb)
    return z^(z>>np.uint64(31))
