export function galactic(l,b,r){if(![l,b,r].every(Number.isFinite)||Math.abs(b)>90||r<0)throw Error('Use finite longitude, latitude −90…90, and nonnegative distance.');l*=Math.PI/180;b*=Math.PI/180;return[r*Math.cos(b)*Math.cos(l),r*Math.cos(b)*Math.sin(l),r*Math.sin(b)];}
export function index(g,x,y,z){return(x*g.shape[1]+y)*g.shape[2]+z;}
export function position(g,x,y,z){return[x,y,z].map((v,j)=>g.origin[j]+v*g.spacing);}
export function sample(g,p){let f=p.map((v,j)=>(v-g.origin[j])/g.spacing),a=f.map(Math.floor);if(a.some((v,j)=>v<0||v>=g.shape[j]-1))return null;let out=[0,0,0,0];for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<2;k++){let q=index(g,a[0]+i,a[1]+j,a[2]+k);if(!g.valid[q])return null;let w=(i?f[0]-a[0]:1-f[0]+a[0])*(j?f[1]-a[1]:1-f[1]+a[1])*(k?f[2]-a[2]:1-f[2]+a[2]);out[0]+=w*g.density[q];for(let d=0;d<3;d++)out[d+1]+=w*g.velocity[d][q];}return out;}
export function streamline(g,start,step=2,steps=90,sign=1){let p=start.slice(),line=[];function unit(q){let v=sample(g,q);if(!v)return null;let n=Math.hypot(...v.slice(1));return n<1e-8?null:v.slice(1).map(x=>sign*x/n);}for(let i=0;i<steps;i++){let v=unit(p);if(!v)break;let mid=p.map((x,j)=>x+step*v[j]/2),v2=unit(mid);if(!v2)break;let next=p.map((x,j)=>x+step*v2[j]);if(!sample(g,next))break;line.push(...p,...next);p=next;}return line;}
export function isoSurface(g,level,inside=()=>true){const vertices=[],offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];for(let x=0;x<g.shape[0]-1;x++)for(let y=0;y<g.shape[1]-1;y++)for(let z=0;z<g.shape[2]-1;z++){const nodes=offsets.map(o=>[x+o[0],y+o[1],z+o[2]]),ids=nodes.map(q=>index(g,...q));if(ids.some(i=>!g.valid[i]))continue;const d=ids.map(i=>g.density[i]);if(Math.min(...d)>level||Math.max(...d)<level)continue;const p=nodes.map(q=>position(g,...q));if(!p.every(inside))continue;const edge=(a,b)=>{const f=(level-d[a])/(d[b]-d[a]);return p[a].map((v,j)=>v+f*(p[b][j]-v));};for(const t of tetra){const pos=t.filter(i=>d[i]>level),neg=t.filter(i=>d[i]<=level);if(!pos.length||!neg.length)continue;if(pos.length===1||neg.length===1){const a=pos.length===1?pos[0]:neg[0],other=pos.length===1?neg:pos;for(const b of other)vertices.push(...edge(a,b));}else{const [a,b]=pos,[c,d]=neg;const ac=edge(a,c),ad=edge(a,d),bc=edge(b,c),bd=edge(b,d);vertices.push(...ac,...ad,...bc,...ad,...bd,...bc);}}}return vertices;}

// Glyph length is a display convention, not distance traveled.
export function arrowSegments(p,velocity,spacing,scale=1){
 if(![...p,...velocity,spacing,scale].every(Number.isFinite)||spacing<=0||scale<=0)return [];
 const speed=Math.hypot(...velocity);if(speed<1e-9)return [];
 const u=velocity.map(x=>x/speed),length=speed/500*spacing*1.7*scale;
 const end=p.map((x,j)=>x+length*u[j]);
 // Choose the least aligned axis to avoid a degenerate arrowhead near poles.
 const axis=u.map(Math.abs).indexOf(Math.min(...u.map(Math.abs)));
 const a=[0,0,0];a[axis]=1;
 let side=[a[1]*u[2]-a[2]*u[1],a[2]*u[0]-a[0]*u[2],a[0]*u[1]-a[1]*u[0]];
 const n=Math.hypot(...side);side=side.map(x=>x/n);
 const back=end.map((x,j)=>x-length*.28*u[j]);
 return [...p,...end,...end,...back.map((x,j)=>x+side[j]*length*.12),...end,...back.map((x,j)=>x-side[j]*length*.12)];
}
