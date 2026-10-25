(() => {
  "use strict";
  function findRegions(source,closePurple=false) {
    const width=Math.min(640,source.width),scale=width/source.width,height=Math.round(source.height*scale);
    const c=document.createElement('canvas');c.width=width;c.height=height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,width,height);
    const data=ctx.getImageData(0,0,width,height).data,mask=new Uint8Array(width*height),green=new Uint8Array(width*height),purple=new Uint8Array(width*height);
    for(let i=0;i<mask.length;i++){const r=data[i*4],g=data[i*4+1],b=data[i*4+2];mask[i]=g>100&&b>135&&r<g*.76&&b>g*.80&&b<g*2.2?1:0;green[i]=g>65&&g>r*1.35&&g>b*1.25?1:0;purple[i]=b>45&&b>g*1.3&&b>r*.95?1:0;}
    if(closePurple){
      // Downsampling may let thin answer strokes split the cyan strip. Only
      // the purple proposal pass joins short horizontal gaps; the original
      // green scan and the fixed-guide acceptance tests remain unchanged.
      for(let y=0;y<height;y++){let previous=-10;for(let x=0;x<width;x++)if(mask[y*width+x]){if(x-previous<=5)for(let xx=previous+1;xx<x;xx++)mask[y*width+xx]=1;previous=x;}}
    }
    const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),regions=[];
    const density=(map,x,y,w,h)=>{let hit=0,total=0;for(let yy=Math.max(0,Math.floor(y));yy<Math.min(height,Math.ceil(y+h));yy++)for(let xx=Math.max(0,Math.floor(x));xx<Math.min(width,Math.ceil(x+w));xx++){hit+=map[yy*width+xx];total++;}return hit/Math.max(1,total);};
    for(let i=0;i<mask.length;i++){
      if(!mask[i]||seen[i])continue;let head=0,tail=1;queue[0]=i;seen[i]=1;let x1=i%width,x2=x1,y1=Math.floor(i/width),y2=y1;
      while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);x1=Math.min(x1,x);x2=Math.max(x2,x);y1=Math.min(y1,y);y2=Math.max(y2,y);
        for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(nx>=0&&nx<width&&ny>=0&&ny<height&&mask[n]&&!seen[n]){seen[n]=1;queue[tail++]=n;}}
      }
      const w=x2-x1+1,h=y2-y1+1,aspect=w/h,fill=tail/(w*h);
      if(w<width*.07||w>width*.28||h<height*.018||h>height*.11||aspect<3||aspect>7||fill<.48)continue;
      const top=density(green,x1-w*.08,y1-h*2.7,w*1.16,h*2.4),left=density(green,x1-w*.11,y1-h*2.6,w*.08,h*4.4),right=density(green,x1+w*.99,y1-h*2.6,w*.05,h*4.4);
      const bottom=density(green,x1-w*.08,y2+h*.15,w*1.16,h*.7);
      const guide={x:(x1+w*.17)/scale,y:(y2-w*.54)/scale,w:w*.66/scale,h:w*.235/scale};
      const purpleTop=density(purple,x1-w*.08,y1-h*2.7,w*1.16,h*2.4),purpleLeft=density(purple,x1-w*.11,y1-h*2.6,w*.08,h*4.4),purpleRight=density(purple,x1+w*.99,y1-h*2.6,w*.05,h*4.4);
      const greenEligible=!closePurple&&top>=.40&&left>=.40&&right>=.40&&bottom>=.40;
      // This is only a geometric proposal. Three fixed text bands must match
      // below before the new purple panel may contribute a detection vote.
      const purpleEligible=purpleTop>=.65&&purpleLeft>=.65&&purpleRight>=.65;
      regions.push({strip:{x:x1/scale,y:y1/scale,w:w/scale,h:h/scale},rect:guide,metrics:{fill,top,left,right,bottom,purpleTop,purpleLeft,purpleRight},eligible:greenEligible||purpleEligible,palette:greenEligible?'green':purpleEligible?'purple':null});
    }
    if(!closePurple){
      for(const extra of findRegions(source,true))if(extra.palette==='purple'&&!regions.some(r=>r.palette==='purple'&&Math.abs(r.strip.x-extra.strip.x)<extra.strip.w*.04&&Math.abs(r.strip.y-extra.strip.y)<extra.strip.h*.15&&Math.abs(r.strip.w-extra.strip.w)<extra.strip.w*.05))regions.push(extra);
    }
    return regions;
  }
  const FEATURE_W=120,FEATURE_H=44;
  let reference=null,loadPromise=null;
  const scriptBase=document.currentScript?.src||document.baseURI;
  function features(source,rect){
    const c=document.createElement('canvas');c.width=FEATURE_W;c.height=FEATURE_H;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,rect.x,rect.y,rect.w,rect.h,0,0,FEATURE_W,FEATURE_H);
    const d=ctx.getImageData(0,0,FEATURE_W,FEATURE_H).data,out=new Float32Array(FEATURE_W*FEATURE_H);
    for(let i=0;i<out.length;i++)out[i]=(d[i*4]+d[i*4+2])*.5-d[i*4+1];
    return out;
  }
  async function init(){
    if(reference)return reference;
    if(!loadPromise)loadPromise=(async()=>{const img=new Image();img.src=new URL('../assets/local-templates/colored-input-guide.png',scriptBase).href;await img.decode();reference=features(img,{x:0,y:0,w:img.width,h:img.height});return reference;})().catch(e=>{loadPromise=null;throw e;});
    return loadPromise;
  }
  function correlation(a,b,x1,y1,x2,y2){let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++){const i=y*FEATURE_W+x,u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}const den=Math.sqrt(Math.max(0,aa-sa*sa/n)*Math.max(0,bb-sb*sb/n));return den>1e-6?(ab-sa*sb/n)/den:-1;}
  function purpleSampler(source,item) {
    // Read one small guide crop once, then refine alignment in CPU memory.
    // Avoid a canvas readback for every shift and avoid copying the full frame.
    const pad=item.strip.w*.12,x0=Math.max(0,Math.floor(item.rect.x-pad)),y0=Math.max(0,Math.floor(item.rect.y-pad));
    const c=document.createElement('canvas');c.width=Math.min(source.width-x0,Math.ceil(item.rect.w+pad*2));c.height=Math.min(source.height-y0,Math.ceil(item.rect.h+pad*2));
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,x0,y0,c.width,c.height,0,0,c.width,c.height);
    const rgba=ctx.getImageData(0,0,c.width,c.height).data,values=new Float32Array(c.width*c.height);
    for(let i=0;i<values.length;i++)values[i]=rgba[i*4+1]-(rgba[i*4]+rgba[i*4+2])*.5;
    return rect=>{
      const out=new Float32Array(FEATURE_W*FEATURE_H),w=c.width,h=c.height;
      for(let y=0;y<FEATURE_H;y++)for(let x=0;x<FEATURE_W;x++){
        const sx=Math.max(0,Math.min(w-1,rect.x-x0+(x+.5)*rect.w/FEATURE_W-.5)),sy=Math.max(0,Math.min(h-1,rect.y-y0+(y+.5)*rect.h/FEATURE_H-.5));
        const ix=Math.floor(sx),iy=Math.floor(sy),jx=Math.min(w-1,ix+1),jy=Math.min(h-1,iy+1),fx=sx-ix,fy=sy-iy;
        out[y*FEATURE_W+x]=(values[iy*w+ix]*(1-fx)+values[iy*w+jx]*fx)*(1-fy)+(values[jy*w+ix]*(1-fx)+values[jy*w+jx]*fx)*fy;
      }
      return out;
    };
  }
  function acceptsGuideMatch(match,palette){
    return Boolean(match&&match.score>=.78&&match.whole>=.70&&
      match.scores.filter(score=>score>=.68).length>=(palette==='purple'?3:2));
  }
  function recordGuideMatch(current,candidate,palette){
    if(!current.best||candidate.score>current.best.score)current.best=candidate;
    if(acceptsGuideMatch(candidate,palette)&&(!current.accepted||candidate.score>current.accepted.score))current.accepted=candidate;
  }
  function orderedRegions(regions,preferredRect,width,height){
    const original=regions.slice(0,3),r=preferredRect;
    if(!r||![r.x,r.y,r.w,r.h,width,height].every(Number.isFinite)||r.x<0||r.y<0||r.w<=0||r.h<=0||
      width<=0||height<=0||r.x+r.w>width||r.y+r.h>height)return original;
    let preferred=null,bestOverlap=-1,bestDistance=Infinity;
    for(const item of regions){
      const q=item.rect,iw=Math.max(0,Math.min(r.x+r.w,q.x+q.w)-Math.max(r.x,q.x));
      const ih=Math.max(0,Math.min(r.y+r.h,q.y+q.h)-Math.max(r.y,q.y));
      const intersection=iw*ih,union=r.w*r.h+q.w*q.h-intersection;
      const overlap=union>0?intersection/union:0;
      const distance=Math.hypot((r.x+r.w/2-q.x-q.w/2)/width,(r.y+r.h/2-q.y-q.h/2)/height);
      if(overlap<.50&&distance>.03)continue;
      if(overlap>bestOverlap||(overlap===bestOverlap&&distance<bestDistance)){
        preferred=item;bestOverlap=overlap;bestDistance=distance;
      }
    }
    // A hint only orders current eligible proposals. Never create a candidate
    // from old pixels or drop any of the original first three proposals.
    return preferred?[preferred,...original.filter(item=>item!==preferred)]:original;
  }
  async function analyze(source,{preferredRect=null}={}){
    const regions=findRegions(source).filter(r=>r.eligible);if(!regions.length)return {matched:false,regions};await init();
    for(const item of orderedRegions(regions,preferredRect,source.width,source.height)){const matches={best:null,accepted:null};
      const isPurple=item.palette==='purple';
      const samplePurple=isPurple?purpleSampler(source,item):null;
      for(const size of (isPurple?[.94,.96,.98,1,1.02,1.04,1.06]:[.94,1,1.06]))for(const dx of (isPurple?[-.02,-.01,0,.01,.02]:[-.025,0,.025]))for(const dy of (isPurple?[-.03,-.02,-.01,0,.01]:[-.05,-.025,0,.025,.05])){
        const r=item.rect,s=item.strip,rect={x:r.x+s.w*dx-r.w*(size-1)/2,y:r.y+s.w*dy,w:r.w*size,h:r.h*size};
        const f=isPurple?samplePurple(rect):features(source,rect),scores=[correlation(reference,f,0,0,120,15),correlation(reference,f,0,15,120,30),correlation(reference,f,0,30,120,44)],whole=correlation(reference,f,0,0,120,44);
        const score=(scores.slice().sort((a,b)=>b-a)[0]+scores.slice().sort((a,b)=>b-a)[1])/2;
        recordGuideMatch(matches,{score,scores,whole,rect,size,dx,dy},item.palette);
      }
      if(isPurple&&matches.best){
        // Retain the original refinement anchor while separately retaining
        // every alignment that already passed the complete acceptance rule.
        const anchor=matches.best;
        for(const ds of [-.01,0,.01])for(const sx of [-.005,0,.005])for(const sy of [-.005,0,.005]){
          const size=anchor.size+ds,dx=anchor.dx+sx,dy=anchor.dy+sy,r=item.rect,s=item.strip;
          const rect={x:r.x+s.w*dx-r.w*(size-1)/2,y:r.y+s.w*dy,w:r.w*size,h:r.h*size},f=samplePurple(rect);
          const scores=[correlation(reference,f,0,0,120,15),correlation(reference,f,0,15,120,30),correlation(reference,f,0,30,120,44)],whole=correlation(reference,f,0,0,120,44);
          const sorted=scores.slice().sort((a,b)=>b-a),score=(sorted[0]+sorted[1])/2;
          recordGuideMatch(matches,{score,scores,whole,rect,size,dx,dy},item.palette);
        }
      }
      item.match=matches.accepted||matches.best;
    }
    const best=regions.filter(r=>acceptsGuideMatch(r.match,r.palette)).sort((a,b)=>b.match.score-a.match.score)[0];
    return best?{matched:true,score:best.match.score,threshold:.78,rect:best.match.rect,strip:best.strip,metrics:best.metrics,bandScores:best.match.scores,palette:best.palette,regions}:{matched:false,regions};
  }
  window.MAlertColoredInput={findRegions,analyze,init};
})();

