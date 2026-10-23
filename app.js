import * as THREE from 'three';


import {OrbitControls} from './vendor/OrbitControls.js';


import {galactic,index,position,sample,streamline,isoSurface,arrowSegments} from './math.mjs';


const $=id=>document.getElementById(id),canvas=$('scene'),view=$('viewport');


if(new URL(location.href).searchParams.get('follow')==='0')$('auto').checked=false;

let renderer;


try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(error){$('loading').textContent='WebGL could not start. Enable hardware acceleration or use a WebGL-capable browser.';throw error;}


renderer.setPixelRatio(Math.min(devicePixelRatio,2));


const world=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,10000);camera.up.set(0,0,1);camera.position.set(240,-300,220);


const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=2;controls.maxDistance=4000;


const layers=new THREE.Group();world.add(layers);let data=null,manifest=null,selected=null,busy=false,token=0,points=null,pointIds=[],center=[0,0,0],radius=180;


let needsInitialDisplay=true;


let inspectionRevision=null;


world.add(new THREE.AmbientLight(0xd4efff,1.5));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(100,-160,200);world.add(light);


const originMarker=new THREE.Mesh(new THREE.SphereGeometry(1.9,16,12),new THREE.MeshBasicMaterial({color:0xffd5a0}));world.add(originMarker);


const centerMarker=new THREE.Mesh(new THREE.SphereGeometry(1.3,12,10),new THREE.MeshBasicMaterial({color:0x6bdcd3,wireframe:true}));world.add(centerMarker);


const axes=new THREE.AxesHelper(65);world.add(axes);


function clear(){for(const child of [...layers.children]){layers.remove(child);child.geometry?.dispose();child.material?.dispose();}points=null;pointIds=[];}


function color(d){let t=Math.max(0,Math.min(1,(Math.asinh(d)+.8)/3.2));return new THREE.Color().setHSL(.62-.52*t,.55,.32+.45*t);}


function inside(p){if($('surveyWindow').checked&&data.survey_window){const node=p.map((x,j)=>Math.round((x-data.origin[j])/data.spacing));if(node.some((x,j)=>x<0||x>=data.shape[j])||!data.survey_window.values[index(data,...node)])return false;}return Math.hypot(...p.map((x,j)=>x-center[j]))<=radius&&(!$('slice').checked||Math.abs(p[2]-center[2])<data.spacing*1.5);}


function lines(vertices,colorValue,opacity=1){if(!vertices.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));layers.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:colorValue,transparent:true,opacity})));}


function rebuild(){if(!data)return;if(inspectionRevision!==data.revision){inspectionRevision=data.revision;$('readout').textContent='Drag to orbit · scroll to zoom · right-drag to pan · enable sampling nodes to inspect this revision.';}if(needsInitialDisplay){$('threshold').value=(data.kind==='reference'||data.id.startsWith('published-'))?1.8:Math.max(0,Math.min(.8,Math.floor(data.density_range[1]*.55*10)/10));needsInitialDisplay=false;}clear();radius=+$('radius').value;$('thresholdValue').textContent=(+$('threshold').value).toFixed(1);$('radiusValue').textContent=`${radius} ${data.unit}`;const eligible=[],cloud=[],colors=[],threshold=+$('threshold').value;


if(data.kind==='observed-reconstruction'){$('scope').textContent=data.id.startsWith('published-')?'PUBLISHED EXTERNAL REFERENCE':'OBSERVED RECONSTRUCTION · '+(data.scientifically_eligible?'SOURCE QUALIFIED':'EXPLORATORY');$('notice').textContent=data.uncertainty;$('originLabel').textContent='OBSERVER · FIXED ORIGIN';$('originText').textContent=data.origin_definition+(data.galactic?` · Galactic distance unit ${data.unit}`:' · Galactic re-centering unavailable for this frame');}


for(let x=0;x<data.shape[0];x++)for(let y=0;y<data.shape[1];y++)for(let z=0;z<data.shape[2];z++){const i=index(data,x,y,z);if(!data.valid[i])continue;const p=position(data,x,y,z);if(!inside(p))continue;eligible.push({i,p});}


const dense=eligible.filter(q=>data.density[q.i]>=threshold),skip=Math.max(1,Math.ceil(dense.length/50000));


$('legend').querySelector('b').textContent=$('density').checked?'DENSITY CONTRAST δ':`ISOSURFACE δ = ${threshold.toFixed(1)}`;$('legend').querySelector('.gradient').style.display=$('density').checked?'block':'none';$('legend').querySelector('.legendEnds').style.display=$('density').checked?'flex':'none';


let triangleCount=0;if($('surface').checked){const vertices=isoSurface(data,threshold,inside);triangleCount=vertices.length/9;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();layers.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x398f91,roughness:.65,metalness:.12,side:THREE.DoubleSide,transparent:true,opacity:.72})));}


const metric=$('nodeMetric').value,spread=data.spread?.[metric],displayNodes=spread?eligible:dense;if(metric.startsWith('direction_'))$('spreadNote').textContent='High values mean more consistent posterior directions under this model. This is not observational accuracy or calibrated confidence.';else $('spreadNote').textContent=Object.keys(data.spread||{}).length?'Conditional sample spread is not calibrated coverage; isosurfaces remain mean-density contours.':'No conditional uncertainty layers are registered for this field.';


if($('density').checked){const step=Math.max(1,Math.ceil(displayNodes.length/50000));for(let k=0;k<displayNodes.length;k+=step){const q=displayNodes[k];cloud.push(...q.p);let c;if(spread){const t=Math.max(0,Math.min(1,(spread.values[q.i]-spread.range[0])/(spread.range[1]-spread.range[0]||1)));c=new THREE.Color().setHSL(.65-.5*t,.7,.3+.4*t);}else c=color(data.density[q.i]);colors.push(...c.toArray());pointIds.push(q.i);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(cloud,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));points=new THREE.Points(g,new THREE.PointsMaterial({size:data.spacing*.38,vertexColors:true,transparent:true,opacity:+$('opacity').value,depthWrite:false,blending:THREE.AdditiveBlending}));layers.add(points);}


if(spread&&$('density').checked){$('legend').querySelector('b').textContent=spread.definition;$('legend').querySelector('.gradient').style.background='linear-gradient(90deg,hsl(234,70%,30%),hsl(54,70%,70%))';const ends=$('legend').querySelectorAll('.legendEnds span');ends[0].textContent=spread.range[0].toFixed(3);ends[1].textContent=spread.range[1].toFixed(3)+' '+spread.unit;}else{$('legend').querySelector('.gradient').style.background='';const ends=$('legend').querySelectorAll('.legendEnds span');ends[0].textContent='Low';ends[1].textContent='High';}


if($('arrows').checked){const v=[],count=Math.min(850,eligible.length),scale=+$('arrowScale').value;for(let j=0;j<count;j++){const q=eligible[Math.floor(j*eligible.length/count)];v.push(...arrowSegments(q.p,data.velocity.map(a=>a[q.i]),data.spacing,scale));}lines(v,0x91d9d9,.6);}


$('velocityKey').textContent=`500 km/s → ${(data.spacing*1.7*(+$('arrowScale').value)).toFixed(2)} ${data.unit} glyph length. Display scale only; up to 850 arrows.`;


if($('streams').checked){const streamGrid=$('surveyWindow').checked&&data.survey_window?{...data,valid:data.valid.map((v,i)=>v&&data.survey_window.values[i])}:data;const v=[],count=Math.min(100,eligible.length);for(let j=0;j<count;j++){const q=eligible[Math.floor((j+.5)*eligible.length/count)];for(const sign of [-1,1]){const path=streamline(streamGrid,q.p,Math.min(3,data.spacing*.65),75,sign);for(let k=0;k<path.length;k+=6)if(inside(path.slice(k,k+3))&&inside(path.slice(k+3,k+6)))v.push(...path.slice(k,k+6));}}lines(v,0xedc58c,.6);}


const extent=new THREE.Box3(new THREE.Vector3(...data.origin),new THREE.Vector3(...data.origin.map((x,j)=>x+(data.shape[j]-1)*data.spacing)));layers.add(new THREE.Box3Helper(extent,0x223b51));


$('statistics').textContent=`${triangleCount.toLocaleString()} surface triangles · ${pointIds.length.toLocaleString()} display nodes · grid ${data.shape.join(' × ')}\nVelocity range ${data.velocity_speed_range_kms.map(x=>Math.round(x)).join('–')} km/s`;


}


function fit(){const target=new THREE.Vector3(...center);controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(.95,-1.3,.95).multiplyScalar(radius*1.5));controls.update();}


function setCenter(p){center=p.slice();centerMarker.position.set(...center);controls.target.set(...center);fit();rebuild();const q=sample(data,p),location=`Selected XYZ (${p.map(x=>x.toFixed(2)).join(', ')}) ${data.unit}`;$('readout').textContent=q?`${location} · display-grid interpolation δ ${q[0].toFixed(3)} · v = (${q.slice(1).map(x=>x.toFixed(1)).join(', ')}) km/s · origin fixed.`:`${location} has no valid display-grid interpolation support. Origin remains fixed.`;}


async function get(url){
 if(url==='/api/field-scenes')return window.FIELD_ATLAS_SNAPSHOT.manifest;
 const id=decodeURIComponent(url.split('=')[1]||'');
 const path=window.FIELD_ATLAS_SNAPSHOT.paths[id];
 if(!path)throw Error('Scene not included in this release');
 const response=await fetch(new URL(path,document.baseURI));
 if(!response.ok)throw Error('Bundled scene could not load: '+response.status);
 return response.json();
}


function epochChoices(scene){return scene?.time_point?(manifest?.scenes||[]).filter(s=>s.time_point?.sequence_id===scene.time_point.sequence_id).sort((a,b)=>a.time_point.epoch_index-b.time_point.epoch_index):[];}
function updateEpoch(scene){const choices=epochChoices(scene);$('timeSection').classList.toggle('hidden',choices.length<2);if(choices.length){$('epoch').max=choices.length-1;$('epoch').value=choices.findIndex(s=>s.id===scene.id);$('epochValue').textContent=`z = ${scene.time_point.redshift.toFixed(2)} · a = ${scene.time_point.scale_factor.toFixed(3)}`;}}
$('epoch').addEventListener('change',()=>{const choice=epochChoices(data)[+$('epoch').value];if(choice){$('dataset').value=choice.id;loadScene(choice.id);}});

async function loadScene(id){const request=++token;busy=true;$('loading').classList.remove('hidden');$('loading').textContent='Loading registered density and velocity…';try{const next=await get('/api/field-scene?id='+encodeURIComponent(id));if(request!==token)return;const first=!data;const changedScene=data?.id!==next.id;data=next;selected=id;$('radius').max=next.kind==='simulation-reference'?String(Math.max(350,10*Math.ceil(Math.hypot(...next.shape.map((n,i)=>Math.max(Math.abs(next.origin[i]),Math.abs(next.origin[i]+(n-1)*next.spacing))))/10))):'350';const posteriorLink=$('distanceLink');if(posteriorLink){const followup=next.id==='updates-20261022:joint-distance:fresh2026111001:followup1:density',stress=next.id==='updates-20261022:joint-distance:robust-posterior:density';posteriorLink.href=followup?'/distance-posteriors?case=followup-v1':'/distance-posteriors';posteriorLink.textContent=(followup||stress?'Matching distance posteriors':'Stress-case distance posteriors')+' →';}updateEpoch(next);const sceneURL=new URL(location.href);sceneURL.searchParams.set('scene',id);history.replaceState(null,'',sceneURL);$('surveyWindow').disabled=!next.survey_window;if(!next.survey_window)$('surveyWindow').checked=false;else if(changedScene)$('surveyWindow').checked=Boolean(next.default_window);$('windowNote').textContent=next.survey_window?'Sampling-window mask available. Allowed cells need not contain observations or precise constraints; outside values are extrapolation.':'No declared sampling-window mask supplied for this scene.';for(const option of $('nodeMetric').options)option.disabled=option.value!=='density'&&!next.spread?.[option.value];if($('nodeMetric').selectedOptions[0]?.disabled)$('nodeMetric').value='density';$('spreadNote').textContent=Object.keys(next.spread||{}).length?'Sampling nodes can show conditional sample spread. Isosurfaces remain mean-density contours; spread is not calibrated coverage or speed uncertainty.':'No registered conditional sample spread for this field.';$('scope').textContent=next.kind==='approximate-simulation'?'APPROXIMATE SIMULATED EVOLUTION':next.kind==='simulation-reference'?'SIMULATION REFERENCE · SAMPLED PARTICLES':next.kind==='reference'?'PUBLISHED REFERENCE · INFERRED FIELD':'MOCK RECONSTRUCTION · SIMULATION AXES';$('definition').textContent=next.density_definition;$('quality').textContent=next.quality?.text||'';$('quality').classList.toggle('hidden',!next.quality);$('provenance').textContent=next.frame+' · '+next.origin_definition;$('uncertainty').textContent=next.uncertainty;$('support').textContent=next.support;$('revision').textContent='Revision '+next.revision;$('sceneTitle').textContent=next.label;$('originText').textContent=next.galactic?`Galactic coordinates from the fixed Local Group origin. Native distance unit: ${next.unit}.`:'Simulation scene: Galactic re-centering is disabled because no Galactic-axis identification exists.';$('recenter').disabled=!next.galactic;$('originLabel').textContent=next.galactic?'LOCAL GROUP · FIXED ORIGIN':'SIMULATION OBSERVER · FIXED ORIGIN';$('axisX').textContent=next.galactic?'X · l=0°, b=0°':'Simulation X';$('axisY').textContent=next.galactic?'Y · l=90°, b=0°':'Simulation Y';$('axisZ').textContent=next.galactic?'Z · north Galactic pole':'Simulation Z';$('notice').textContent=next.kind==='approximate-simulation'?'Approximate simulated evolution · not the observed Universe · R20 numerical screen only.':next.kind==='simulation-reference'?'Sampled N-body reference · simulation axes · not the observed Universe · sampling uncertainty not propagated.':next.kind==='reference'?'Published 2M++ prediction · tracer density, not matter density · survey gaps may be model-completed.':'Exploratory mock field · not an observed-Universe reconstruction · uncertainty not calibrated.';$('hLabel').classList.toggle('hidden',next.unit!=='h^-1 Mpc');axes.scale.setScalar(next.unit==='Mpc'?1:1.6);if(first){center=[0,0,0];radius=Math.min(180,(next.shape[0]-1)*next.spacing*.48);$('radius').value=Math.round(radius/5)*5;fit();}centerMarker.position.set(...center);rebuild();$('loading').classList.add('hidden');$('connection').textContent='● Bundled snapshot · '+new Date().toLocaleTimeString();}catch(error){if(request===token){$('loading').textContent='Unable to load field: '+error.message;$('connection').textContent='Snapshot could not load';}}finally{if(request===token)busy=false;}}


async function refresh(){try{const next=await get('/api/field-scenes');const previous=manifest;manifest=next;let choice=$('dataset').value||(!previous?new URL(location.href).searchParams.get('scene'):null)||next.scenes[0]?.id;


if($('auto').checked){const seen=new Set();while(!seen.has(choice)){seen.add(choice);const parent=next.scenes.find(s=>s.id===choice);if(!parent)break;const children=next.scenes.filter(s=>s.parent_id===choice||(s.family===parent.family&&s.parent_stage&&s.parent_stage===parent.stage));if(children.length!==1)break;choice=children[0].id;}}


if(!previous||previous.registry_revision!==next.registry_revision)$('dataset').replaceChildren(...next.scenes.map(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.label;return o;}));


$('dataset').value=next.scenes.some(s=>s.id===choice)?choice:(next.scenes[0]?.id||'');const current=next.scenes.find(s=>s.id===$('dataset').value);if(current&&!busy&&(!data||data.id!==current.id||($('auto').checked&&data.revision!==current.revision)))await loadScene(current.id);else if(!busy)$('connection').textContent='● Bundled snapshot · '+new Date().toLocaleTimeString();if(!current)throw Error('No supported registered density/velocity pairs');}catch(error){$('connection').textContent='Snapshot unavailable · '+error.message;}}


$('dataset').addEventListener('change',()=>{center=[0,0,0];data=null;needsInitialDisplay=true;loadScene($('dataset').value);});$('refresh').onclick=refresh;$('auto').addEventListener('change',()=>{const followURL=new URL(location.href);followURL.searchParams.set('follow',$('auto').checked?'1':'0');history.replaceState(null,'',followURL);if($('auto').checked)refresh();});for(const id of ['surface','density','nodeMetric','surveyWindow','threshold','opacity','arrows','arrowScale','streams','slice','radius'])$(id).addEventListener('input',rebuild);


$('centerForm').onsubmit=e=>{e.preventDefault();try{if(!data?.galactic)throw Error('Choose a Galactic-coordinate reference field first.');let r=+$('distance').value;if($('distanceUnit').value==='Mpc'&&data.unit==='h^-1 Mpc'){const h=+$('hubble').value;if(!Number.isFinite(h)||h<.1||h>2)throw Error('Specify h explicitly before converting Mpc to h⁻¹ Mpc.');r*=h;}const p=galactic(+$('longitude').value,+$('latitude').value,r);if(p.some((x,j)=>x<data.origin[j]||x>data.origin[j]+(data.shape[j]-1)*data.spacing))throw Error('Center is outside this field’s coordinate bounds.');if(!sample(data,p))throw Error('Center has no registered valid field support.');setCenter(p);$('centerError').textContent='';}catch(error){$('centerError').textContent=error.message;}};


$('home').onclick=()=>{setCenter([0,0,0]);$('distance').value=0;$('centerError').textContent='';};$('fit').onclick=fit;


const ray=new THREE.Raycaster();ray.params.Points.threshold=3;let down=[0,0];canvas.onpointerdown=e=>{down=[e.clientX,e.clientY];};canvas.addEventListener('pointerup',e=>{if(!points||Math.hypot(e.clientX-down[0],e.clientY-down[1])>4)return;const rect=canvas.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObject(points)[0];if(!hit)return;const i=pointIds[hit.index],p=new THREE.Vector3().fromBufferAttribute(points.geometry.attributes.position,hit.index),r=p.length(),l=(Math.atan2(p.y,p.x)*180/Math.PI+360)%360,b=r?Math.asin(p.z/r)*180/Math.PI:0;$('readout').textContent=`${data.galactic?`l ${l.toFixed(1)}° · b ${b.toFixed(1)}° · r ${r.toFixed(2)} ${data.unit}`:`Native XYZ ${p.toArray().map(x=>x.toFixed(2)).join(', ')} ${data.unit}`} · ${data.spread?.[$('nodeMetric').value]?data.spread[$('nodeMetric').value].definition+' '+data.spread[$('nodeMetric').value].values[i].toFixed(3)+' '+data.spread[$('nodeMetric').value].unit+' · ':''}δ ${data.density[i].toFixed(3)} · v = (${data.velocity.map(v=>v[i].toFixed(1)).join(', ')}) km/s`;} );


let imageExportSequence=0;


$('screenshot').onclick=async()=>{


 const imageRequest=++imageExportSequence;


 if(!data)return;


 renderer.render(world,camera);


 const metric=data.spread?.[$('nodeMetric').value];


 const quantity=$('density').checked?(metric?`${metric.definition}: ${metric.range.map(x=>x.toFixed(3)).join(' to ')} ${metric.unit}`:`Sampling-node color: density contrast ${data.density_definition}`):'Sampling nodes hidden';


 const captions=[data.label,`${data.frame} | ${data.unit} | ${data.origin_definition}`,quantity,`Density isosurface ${$('surface').checked?'on':'off'}; threshold ${$('threshold').value}. Sampling window ${$('surveyWindow').checked?'restricted':'not restricted'}; slice ${$('slice').checked?'on':'off'}.`, `Peculiar-velocity glyph: 500 km/s = ${(data.spacing*1.7*+$('arrowScale').value).toFixed(2)} ${data.unit}; display scale only.`, `View target XYZ ${controls.target.toArray().map(x=>x.toFixed(1)).join(', ')}; radius ${$('radius').value} ${data.unit}.`, `Revision ${data.revision}`, data.kind==='simulation-reference'?'Sampled N-body reference; not observed Universe. Particle sampling/smoothing uncertainty is not propagated.':data.kind==='mock'?'Synthetic reconstruction; not observed Universe. Posterior consistency/spread is not calibrated observational accuracy.':data.kind==='reference'?'Published tracer-density / predicted-velocity reference; no voxel posterior.':'Reconstruction: consult source qualification and uncertainty.'];
 if(data.quality?.text)captions.push('Development mock diagnostic: '+data.quality.text);


 const image=document.createElement('canvas');image.width=canvas.width;


 const c=image.getContext('2d');c.font='14px sans-serif';


 const lines=[];


 for(const caption of captions){let line='';for(const word of caption.split(/\s+/)){const trial=line?line+' '+word:word;if(line&&c.measureText(trial).width>image.width-30){lines.push(line);line=word;}else line=trial;}if(line)lines.push(line);}


 image.height=canvas.height+20+22*lines.length;c.fillStyle='#0b1422';c.fillRect(0,0,image.width,image.height);c.drawImage(canvas,0,0);c.fillStyle='#e5edf8';c.font='14px sans-serif';lines.forEach((line,i)=>c.fillText(line,15,canvas.height+20+i*22));


 const imageURL=image.toDataURL('image/png');


 $('imagePreview').src=imageURL;


 const exportedScene={id:data.id,revision:data.revision,label:data.label,kind:data.kind};


 $('imageDownload').hidden=true;


 $('imageDownload').removeAttribute('href');


 $('imageDownload').download='field-atlas-'+exportedScene.kind+'.png';


 $('imageExportStatus').textContent=exportedScene.label+' · preparing PNG download…';


 $('imageExport').showModal();


 try{


  const blob=await new Promise(resolve=>image.toBlob(resolve,'image/png'));


  if(!blob)throw Error('PNG could not be prepared');


  const result={url:URL.createObjectURL(blob)};
  if(imageRequest!==imageExportSequence)return;


  $('imageDownload').href=result.url;


  $('imageDownload').hidden=false;


  $('imageExportStatus').textContent=exportedScene.label+' · revision '+exportedScene.revision+'. The PNG includes provenance and display settings.';


  if($('imageExport').open)$('imageDownload').focus();


 }catch(error){if(imageRequest!==imageExportSequence)return;$('imageExportStatus').textContent='The download could not be prepared. Save the preview image, or refresh the field and try again.';}


};


$('closeImageExport').onclick=()=>$('imageExport').close();


const observer=new ResizeObserver(()=>{const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(view);


function label(id,p){const v=new THREE.Vector3(...p).project(camera),el=$(id);el.style.left=((v.x+1)*.5*view.clientWidth)+'px';el.style.top=((-v.y+1)*.5*view.clientHeight)+'px';el.style.display=v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1?'block':'none';}


renderer.setAnimationLoop(()=>{controls.update();renderer.render(world,camera);label('originLabel',[0,0,0]);const length=65*axes.scale.x;label('axisX',[length,0,0]);label('axisY',[0,length,0]);label('axisZ',[0,0,length]);$('viewCenter').textContent='Camera target XYZ: '+controls.target.toArray().map(x=>x.toFixed(1)).join(', ')+(data?' '+data.unit:'');});


refresh();











