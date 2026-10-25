(() => {
  'use strict';
  const base = document.currentScript?.src || document.baseURI;
  let references, loading;
  const featureCanvases=new Map(),referenceFeatures=new Map();
  const neighborX=[-1,1,0,0],neighborY=[0,0,-1,1];
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function init(){
    if(references)return references;
    if(!loading)loading=Promise.all(['77982.png','text-input-prompt-99116.png'].map(async file=>{
      const i=new Image();i.src=new URL('../assets/local-templates/'+file,base).href;await i.decode();return i;
    })).then(([shape,text])=>references={shape,text}).catch(e=>{loading=null;throw e;});
    return loading;
  }
  function regions(source){
    const w=Math.min(640,source.width),s=w/source.width,h=Math.round(source.height*s),c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(source,0,0,w,h);const d=ctx.getImageData(0,0,w,h).data,mask=new Uint8Array(w*h),seen=new Uint8Array(w*h),queue=new Int32Array(w*h),out=[];
    for(let i=0;i<mask.length;i++){
      const r=d[i*4],g=d[i*4+1],b=d[i*4+2],lo=Math.min(r,g,b),hi=Math.max(r,g,b);
      if(lo>145&&hi-lo<30)mask[i]=1;
      else if(r>45&&b>45&&r>g*1.45&&b>g*1.3)mask[i]=2;
    }
    for(let i=0;i<mask.length;i++){
      if(!mask[i]||seen[i])continue;const kind=mask[i];let head=0,tail=1;queue[0]=i;seen[i]=1;let x1=i%w,x2=x1,y1=(i/w)|0,y2=y1;
      while(head<tail){const p=queue[head++],x=p%w,y=(p/w)|0;x1=Math.min(x1,x);x2=Math.max(x2,x);y1=Math.min(y1,y);y2=Math.max(y2,y);
        for(let k=0;k<4;k++){const xx=x+neighborX[k],yy=y+neighborY[k],n=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!seen[n]&&mask[n]===kind){seen[n]=1;queue[tail++]=n;}}
      }
      const rw=x2-x1+1,rh=y2-y1+1,aspect=rw/rh,fill=tail/(rw*rh);
      if(rw<(kind===1?55:40)||rh<(kind===1?45:35)||aspect<.95||aspect>1.45||fill<(kind===1?.65:.57))continue;
      out.push({kind:kind===1?'shape':'text',rect:{x:x1/s,y:y1/s,w:rw/s,h:rh/s},fill});
    }
    return out.sort((a,b)=>b.fill-a.fill).slice(0,6);
  }
  function feature(source,rect,w,h,mode){
    const key=w+'x'+h;let c=featureCanvases.get(key);
    if(!c){c=canvas(w,h);if(featureCanvases.size>=8)featureCanvases.delete(featureCanvases.keys().next().value);featureCanvases.set(key,c);}
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,w,h);ctx.drawImage(source,rect.x,rect.y,rect.w,rect.h,0,0,w,h);
    const d=ctx.getImageData(0,0,w,h).data,a=new Float32Array(w*h);
    for(let i=0;i<a.length;i++)a[i]=mode==='yellow'?(d[i*4]+d[i*4+1])*.5-d[i*4+2]:mode==='text'?d[i*4+1]-(d[i*4]+d[i*4+2])*.5:(d[i*4]+d[i*4+1]+d[i*4+2])/3;
    return a;
  }
  function ncc(a,b){let sa=0,sb=0,aa=0,bb=0,ab=0;for(let i=0;i<a.length;i++){sa+=a[i];sb+=b[i];aa+=a[i]*a[i];bb+=b[i]*b[i];ab+=a[i]*b[i];}const n=a.length,va=aa-sa*sa/n,vb=bb-sb*sb/n;return va/n>3&&vb/n>3?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;}
  function scoreBand(source,reference,referenceBand,mapped,mode,acceptanceFloor=Infinity){
    const w=Math.round(referenceBand.w),h=Math.round(referenceBand.h),key=mode+':'+JSON.stringify(referenceBand);
    let target=referenceFeatures.get(key);if(!target){target=feature(reference,referenceBand,w,h,mode);referenceFeatures.set(key,target);}
    let best={score:-1};const anchors=[];
    // Search only within the detected panel; the template cannot jump to HUD text.
    for(const scale of [.90,.96,1,1.04,1.10]){let scaleBest={score:-1};for(const dx of [-4,0,4])for(const dy of [-6,-3,0,3,6]){
      const r={x:mapped.x+dx-mapped.w*(scale-1)/2,y:mapped.y+dy-mapped.h*(scale-1)/2,w:mapped.w*scale,h:mapped.h*scale};
      const score=ncc(target,feature(source,r,w,h,mode));if(score>best.score)best={score,rect:r};if(score>scaleBest.score)scaleBest={score,rect:r};
      if(best.score>=acceptanceFloor)return best;
    }if(scaleBest.score>.35)anchors.push(scaleBest.rect);}
    for(const anchor of anchors){
      for(const scale of [.97,1,1.03])for(const dx of [-1.5,0,1.5])for(const dy of [-1.5,0,1.5]){
        const r={x:anchor.x+dx-anchor.w*(scale-1)/2,y:anchor.y+dy-anchor.h*(scale-1)/2,w:anchor.w*scale,h:anchor.h*scale};
        const score=ncc(target,feature(source,r,w,h,mode));if(score>best.score)best={score,rect:r};
        if(best.score>=acceptanceFloor)return best;
      }
    }
    return best;
  }
  const shapeBody={x:13,y:30,w:379,h:311};
  const shapeBands=[{x:13,y:8,w:84,h:13},{x:82,y:152,w:231,h:28},{x:100,y:187,w:199,h:30}];
  function checkShapeBody(source,r){
    const sx=r.w/shapeBody.w,sy=r.h/shapeBody.h,scores=[],evidenceRects=[];
    for(let i=0;i<shapeBands.length;i++){
      const b=shapeBands[i],match=scoreBand(source,references.shape,b,{x:r.x+(b.x-shapeBody.x)*sx,y:r.y+(b.y-shapeBody.y)*sy,w:b.w*sx,h:b.h*sy},i===0?'yellow':'gray',i===2?.65:.72);
      scores.push(match.score);if(match.rect)evidenceRects.push(match.rect);
      if(match.score<(i===2?.65:.72))break;
    }
    const matched=scores.length===3&&scores[0]>=.72&&scores[1]>=.72&&scores[2]>=.65;
    return {matched,scores,evidenceRects,reason:matched?'fixed-title-and-two-instruction-bands':'missing-fixed-'+(scores.length===1?'title':scores.length===2?'first-instructions':'second-instructions')};
  }
  function rectUnion(rects){
    const x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));
    return {x,y,w:Math.max(...rects.map(r=>r.x+r.w))-x,h:Math.max(...rects.map(r=>r.y+r.h))-y};
  }
  async function verifyShapeCandidates(source,candidates){
    const started=performance.now();await init();
    // The original pixels belong to this captured frame; never recapture video here.
    const native=source.nativeSource&&(!source.auditFrameMarker||source.nativeSource.auditFrameMarker===source.auditFrameMarker)?source.nativeSource:source;
    const sx=native.width/source.width,sy=native.height/source.height;
    const bodies=regions(native).filter(item=>item.kind==='shape'),checkedBodies=new Map();
    return candidates.map(candidate=>{
      const r=candidate?.rect;
      if(candidate?.id!=='transparent-shape-77982'||!r||![r.x,r.y,r.w,r.h,sx,sy].every(Number.isFinite)||r.w<=0||r.h<=0)return {matched:false,reason:'invalid-shape-candidate',scores:[],evidenceRects:[],durationMs:performance.now()-started};
      const mapped={x:r.x*sx,y:r.y*sy,w:r.w*sx,h:r.h*sy};
      if(mapped.x<0||mapped.y<0||mapped.x+mapped.w>native.width||mapped.y+mapped.h>native.height)return {matched:false,reason:'shape-candidate-outside-frame',scores:[],evidenceRects:[],durationMs:performance.now()-started};
      const nearby=bodies.filter(item=>{
        const b=item.rect,overlap=Math.max(0,Math.min(b.x+b.w,mapped.x+mapped.w)-Math.max(b.x,mapped.x))*Math.max(0,Math.min(b.y+b.h,mapped.y+mapped.h)-Math.max(b.y,mapped.y));
        return overlap/Math.max(1,b.w*b.h)>=.85&&b.w/mapped.w>=.70&&b.w/mapped.w<=1.12&&b.h/mapped.h>=.60&&b.h/mapped.h<=1.03;
      });
      let best=null;
      for(const item of nearby){
        const key=JSON.stringify(item.rect);let result=checkedBodies.get(key);
        if(!result){result=checkShapeBody(native,item.rect);checkedBodies.set(key,result);}
        if(!best||Number(result.matched)>Number(best.matched)||Math.min(...result.scores)>Math.min(...best.scores))best=result;
      }
      // A localized contour can still provide a panel ROI if the light-body mask
      // is fragmented. Fixed text is checked at the same panel-relative positions.
      if(!best){const ref=references.shape,body={x:mapped.x+shapeBody.x*mapped.w/ref.width,y:mapped.y+shapeBody.y*mapped.h/ref.height,w:shapeBody.w*mapped.w/ref.width,h:shapeBody.h*mapped.h/ref.height};best=checkShapeBody(native,body);}
      const evidenceRects=best.evidenceRects.map(e=>({x:e.x/sx,y:e.y/sy,w:e.w/sx,h:e.h/sy}));
      return {...best,evidenceRects,rect:rectUnion([r,...evidenceRects]),nativePixelsUsed:native!==source,durationMs:performance.now()-started};
    });
  }
  async function verifyShapeCandidate(source,candidate){return (await verifyShapeCandidates(source,[candidate]))[0];}
  async function analyze(source){
    const candidates=regions(source);if(!candidates.length)return {matched:false,candidates};await init();
    for(const item of candidates){
      const r=item.rect;
      if(item.kind==='shape'){
        // Reference light panel body excludes timer, random game objects and border.
        // Share the exact existing title/instruction floors with contour validation.
        Object.assign(item,checkShapeBody(source,r));
      }else{
        // Purple input panel: match only the three fixed instruction lines.
        const mapped={x:r.x+r.w*.205,y:r.y+r.h*.245,w:r.w*.625,h:r.h*.244};
        const ref=references.text;
        const bands=[{x:0,y:12,w:ref.width,h:19},{x:0,y:31,w:ref.width,h:17},{x:0,y:48,w:ref.width,h:17}];
        item.scores=[];
        for(const b of bands){const score=scoreBand(source,ref,b,{x:mapped.x+b.x*mapped.w/ref.width,y:mapped.y+b.y*mapped.h/ref.height,w:b.w*mapped.w/ref.width,h:b.h*mapped.h/ref.height},'text',.72).score;item.scores.push(score);if(score<.72)break;}
        item.matched=item.scores.length===3&&item.scores.every(v=>v>=.72);
      }
    }
    const best=candidates.filter(c=>c.matched).sort((a,b)=>Math.min(...b.scores)-Math.min(...a.scores))[0];
    if(!best)return {matched:false,candidates};
    // Include the title above the light body so monitor-region checks cover all evidence.
    const rects=[best.rect,...(best.evidenceRects||[])],x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));
    const rect={x,y,w:Math.max(...rects.map(r=>r.x+r.w))-x,h:Math.max(...rects.map(r=>r.y+r.h))-y};
    return {matched:true,kind:best.kind,rect,score:best.scores.reduce((a,b)=>a+b,0)/best.scores.length,threshold:best.kind==='shape'?.69:.72,scores:best.scores,candidates,hint:best.kind==='shape'?{kind:'shape',width:source.width,height:source.height,body:{...best.rect},rect:{...rect},bands:best.evidenceRects.map(r=>({...r}))}:null};
  }
  async function recheck(source,hint){
    await init();
    if(hint?.kind!=='shape'||hint.width!==source.width||hint.height!==source.height||hint.bands?.length!==3)return {matched:false};
    const valid=r=>r&&[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0&&r.x>=0&&r.y>=0&&r.x+r.w<=source.width&&r.y+r.h<=source.height;
    if(!valid(hint.body)||!valid(hint.rect)||!hint.bands.every(valid))return {matched:false};
    // A location hint is never evidence: the light panel and all three glyph
    // bands must still exist in these new original pixels at the same location.
    const current=regions(source).some(item=>{
      if(item.kind!=='shape')return false;
      const a=item.rect,b=hint.body,intersection=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
      return intersection/Math.max(1,a.w*a.h+b.w*b.h-intersection)>=.8;
    });
    if(!current)return {matched:false};
    const scores=[];
    for(let i=0;i<3;i++){
      const b=shapeBands[i],mode=i===0?'yellow':'gray',key=mode+':'+JSON.stringify(b);
      let target=referenceFeatures.get(key);
      if(!target){target=feature(references.shape,b,b.w,b.h,mode);referenceFeatures.set(key,target);}
      const score=ncc(target,feature(source,hint.bands[i],b.w,b.h,mode));scores.push(score);
      if(score<(i===2?.65:.72))return {matched:false,scores};
    }
    return {matched:true,kind:'shape',rect:{...hint.rect},score:scores.reduce((a,b)=>a+b,0)/3,threshold:.69,scores,hint:structuredClone(hint)};
  }
  window.MAlertPanelGuide={init,analyze,recheck,regions,verifyShapeCandidate,verifyShapeCandidates};
})();
