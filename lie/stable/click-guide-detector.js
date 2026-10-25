(() => {
  'use strict';
  const M400_POSE_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'))&&window.__M400_CLICK_POSE_EXT===true;
  const M400_NARROW_ENABLED=M400_POSE_ENABLED&&window.__M400_CLICK_NARROW_EXT===true;
  const SMALL_RISING_SCALE_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.smallRisingScaleFallback === true;
  const ADAPTIVE_ANCHOR_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.adaptiveAnchorBeforeCutoff === true;
  const adaptiveAnchorStats={calls:0,coarseCandidates:0,eligibleCandidates:0,anchorFeatureExtractions:0,additionalAnchorFeatureExtractions:0,retainedCandidates:0,promotedCandidates:0,anchorElapsedMs:0,maxAnchorElapsedMs:0};
  const NATIVE_ALIGNMENT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.nativeAlignmentFallback === true;
  // Local research only. Capture once so reference caches and current frames use one feature contract.
  const VALID_ROOT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickValidRootFeatures === true;
  // Coupled local research: E must already be enabled. Capture once before references are cached.
  const BALANCED_NATIVE_RESEARCH_ENABLED = VALID_ROOT_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickBalancedNativeSupport === true;
  const nativeValidReferenceMasks=new WeakMap();
  function nativeValidSupport(rgba){const width=64,height=56,mask=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){let valid=true;for(let dy=-2;dy<=2&&valid;dy++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)===2&&Math.abs(dy)===2)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height||rgba[(yy*width+xx)*4+3]!==255){valid=false;break;}}mask[y*width+x]=valid?1:0;}return mask;}

  const W=64,H=56,scriptBase=document.currentScript?.src||document.baseURI;
  const ids=['a','b'].flatMap(f=>[-6,0,6].map(a=>`click-lines-${f}-${a}`));
  let references=null,loading=null,featureCanvas=null,featureContext=null,featureRowSums=null;
  // Only captureSearchCanvas's immutable canvas pair is cacheable. A live
  // video, arbitrary canvas or another native surface always recomputes.
  const phaseFrames=new WeakMap(),MAX_FRAME_PHASES=16;
  function cacheOptions(options){
    try{return JSON.stringify(options,(_key,value)=>{
      if(typeof value==='function'||typeof value==='symbol'||typeof value==='bigint')throw Error('dynamic options');
      return value;
    });}catch{return null;}
  }
  function capturedIdentity(search,native){
    if(typeof HTMLCanvasElement==='undefined'||!(search instanceof HTMLCanvasElement)||!(native instanceof HTMLCanvasElement))return null;
    const marker=search.auditFrameMarker,other=native.auditFrameMarker;
    if(marker?.kind!=='frame-count'||!Number.isFinite(marker.value)||(native!==search&&native!==search.nativeSource)||
       other?.kind!==marker.kind||other.value!==marker.value)return null;
    const generation=window.MAlertContourWorker?.getStatus?.().generation;
    if(!Number.isInteger(generation))return null;
    return [marker.kind,marker.value,search.width,search.height,native.width,native.height,generation].join(':');
  }
  function memoPhase(phase,search,native,options,operation){
    const identity=capturedIdentity(search,native),encoded=cacheOptions(options);
    if(identity===null||encoded===null)return operation();
    let natives=phaseFrames.get(search);if(!natives){natives=new WeakMap();phaseFrames.set(search,natives);}
    let entry=natives.get(native);if(!entry||entry.identity!==identity){entry={identity,phases:new Map()};natives.set(native,entry);}
    const key=phase+':'+encoded;
    let pending=entry.phases.get(key);
    if(!pending){
      if(entry.phases.size>=MAX_FRAME_PHASES)return operation();
      // Store a private copy; each caller receives another independent copy.
      pending=Promise.resolve().then(()=>{
        if(capturedIdentity(search,native)!==identity)throw new DOMException('Contour scan cancelled','AbortError');
        return operation();
      }).then(result=>{
        if(capturedIdentity(search,native)!==identity)throw new DOMException('Contour scan cancelled','AbortError');
        return structuredClone(result);
      }).catch(error=>{if(entry.phases.get(key)===pending)entry.phases.delete(key);throw error;});
      entry.phases.set(key,pending);
    }
    return pending.then(result=>{
      if(capturedIdentity(search,native)!==identity)throw new DOMException('Contour scan cancelled','AbortError');
      return structuredClone(result);
    });
  }
  function targeted(source,options){
    return memoPhase('coarse-targeted',source,source,options,()=>window.MAlertTextContourMatcher.analyzeTargeted(source,options));
  }
  // RGB local contrast magnitude preserves letter strokes across changing text hues.
  function features(source,r,validSupportReference=false){
    // Synchronous extraction returns independent arrays. Reusing only this
    // small scratch surface avoids hundreds of backing-store allocations.
    // Clear it before drawing so transparent template corners never retain
    // pixels from the previous source or another reference.
    if(!featureCanvas){featureCanvas=document.createElement('canvas');featureCanvas.width=W;featureCanvas.height=H;featureContext=featureCanvas.getContext('2d',{willReadFrequently:true});featureRowSums=new Uint16Array(W*H*3);}
    const ctx=featureContext;ctx.clearRect(0,0,W,H);ctx.drawImage(source,r.x,r.y,r.w,r.h,0,0,W,H);
    const d=ctx.getImageData(0,0,W,H).data,values=new Float32Array(W*H);
    // These are sums of three bytes (0..765), so Uint16 retains the exact
    // integers. Three row sums equal the former nine additions exactly; the
    // division and all subsequent floating-point operations are unchanged.
    const rows=featureRowSums;
    for(let y=0;y<H;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x,p=i*4,q=i*3;
      for(let ch=0;ch<3;ch++)rows[q+ch]=d[p-4+ch]+d[p+ch]+d[p+4+ch];
    }
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x;let magnitude=0;
      for(let ch=0;ch<3;ch++){
        const q=i*3+ch,mean=rows[q-W*3]+rows[q]+rows[q+W*3];
        const delta=d[i*4+ch]-mean/9;magnitude+=delta*delta;
      }
      values[i]=Math.sqrt(magnitude);
    }
    const smooth=new Float32Array(values.length);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;smooth[i]=(values[i]*4+values[i-1]+values[i+1]+values[i-W]+values[i+W])/8;}
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(smooth,nativeValidSupport(d));
    return smooth;
  }
  function rootMagnitude(values){if(SINGLE_PASS_ROOT_MAGNITUDE_ENABLED){let ss=0,sum=0;for(let i=0;i<values.length;i++){const v=values[i];ss+=v*v;sum+=v;}const gain=sum>0?Math.sqrt(ss/sum):1,result=new Float32Array(values.length);for(let i=0;i<values.length;i++)result[i]=Math.sqrt(Math.max(0,values[i]))*gain;return result;}const ss=values.reduce((s,v)=>s+v*v,0),sum=values.reduce((s,v)=>s+v,0),gain=sum>0?Math.sqrt(ss/sum):1;return Float32Array.from(values,v=>Math.sqrt(Math.max(0,v))*gain);}
  function largeClickFeatures(source,r,validSupportReference=false){
    const values=features(source,r,validSupportReference),returned=VALID_ROOT_RESEARCH_ENABLED?rootMagnitude(values):values;
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(returned,nativeValidReferenceMasks.get(values));
    return returned;
  }

  // Local research, captured once. Existing native scores/thresholds remain intact.
  const M7_ROW_DETAIL_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LARGE_ROW_DETAIL_EXPERIMENT===true;
  const m7RowPairs=new WeakMap(),m7RowStats={evaluations:0,passed:0,rejected:0,elapsedMs:0,last:null};
  function m7Remember(value,reference,feature){if(M7_ROW_DETAIL_ENABLED)m7RowPairs.set(value,{reference,feature});return value;}
  function m7RowPass(value,largeFeatureMode){
    if(!M7_ROW_DETAIL_ENABLED||!largeFeatureMode)return true;
    if(value?.rowDetailEvidence)return value.rowDetailEvidence.passed===true;
    const pair=m7RowPairs.get(value);if(!pair)return false;
    const started=performance.now(),mask=nativeValidReferenceMasks.get(pair.reference);let aa=0,bb=0,ab=0,n=0;
    // Remove each row's constant component, retaining horizontal letter detail.
    // Reuse this current alignment's existing reference and native feature vectors.
    for(let y=2;y<54;y++){
      let count=0,sa=0,sb=0;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;count++;sa+=pair.reference[i];sb+=pair.feature[i];}
      if(count<2)continue;const ma=sa/count,mb=sb/count;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;const u=pair.reference[i]-ma,v=pair.feature[i]-mb;aa+=u*u;bb+=v*v;ab+=u*v;n++;}
    }
    const correlation=aa>n*.01&&bb>n*.01?ab/Math.sqrt(aa*bb):-1,passed=Number.isFinite(correlation)&&correlation>=.35;
    value.rowDetailEvidence={correlation,threshold:.35,passed,source:'CURRENT_NATIVE_EXISTING_REFERENCE_FEATURES_WITHIN_ROW',cells:n};
    m7RowStats.evaluations++;m7RowStats[passed?'passed':'rejected']++;m7RowStats.elapsedMs+=performance.now()-started;m7RowStats.last={...value.rowDetailEvidence,rect:{...value.rect}};return passed;
  }

  function correlation(a,b,y1,y2){
    const validSupport=BALANCED_NATIVE_RESEARCH_ENABLED?nativeValidReferenceMasks.get(a):null;
    let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;
    for(let y=y1;y<y2;y++)for(let x=5;x<W-5;x++){const i=y*W+x;if(validSupport&&!validSupport[i])continue;const u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}
    const va=aa-sa*sa/n,vb=bb-sb*sb/n;
    return va>n*.01&&vb>n*.01?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;
  }
  async function init(){
    if(references)return references;
    if(!loading)loading=(async()=>{const map=new Map();for(const family of ['a','b']){
      const img=new Image();img.src=new URL(`../assets/local-templates/click-lines-${family}.png`,scriptBase).href;await img.decode();
      for(const angle of [-6,0,6]){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(img,-c.width/2,-c.height/2);map.set(`click-lines-${family}-${angle}`,features(c,{x:0,y:0,w:c.width,h:c.height}));}
    }references=map;return map;})().catch(e=>{loading=null;throw e;});
    return loading;
  }
  async function verify(source,candidate,reference,gridFeatures=null,acceptAlignment=null,largeFeatureMode=false,featureProject=null){
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    let best=null,position=0;
    for(const scale of [.96,1,1.04])for(const dx of [-.04,-.02,0,.02,.04])for(const dy of [-.04,-.02,0,.02,.04]){
      const featureIndex=position++;
      await checkpoint();
      const r=candidate.rect,rect={x:r.x+r.w*dx-r.w*(scale-1)/2,y:r.y+r.h*dy-r.h*(scale-1)/2,w:r.w*scale,h:r.h*scale};
      if(rect.x<0||rect.y<0||rect.x+rect.w>source.width||rect.y+rect.h>source.height)continue;
      // gridFeatures belongs only to this immutable source/candidate call.
      // References share geometry, never scores or evidence from another frame.
      const cached=gridFeatures?.[featureIndex];
      if(gridFeatures?.currentFrameGridCache)currentFrameGridCacheStats[cached?'hits':'misses']++;
      const f=cached||(()=>{const original=largeFeatureMode?largeClickFeatures(source,rect):features(source,rect);return featureProject?featureProject(original):original;})();
      if(gridFeatures?.currentFrameGridCache)rememberCurrentFrameGrid(gridFeatures,featureIndex,f);else if(gridFeatures)gridFeatures[featureIndex]=f;
      const bands=[correlation(reference,f,2,17),correlation(reference,f,19,36),correlation(reference,f,38,54)];
      const whole=correlation(reference,f,2,54),score=bands.reduce((a,b)=>a+b,0)/3;
      if(featureProject?.onEvaluation)featureProject.onEvaluation();
      const current={score,whole,bands,rect};
      if(largeFeatureMode)m7Remember(current,reference,f);
      if(!best||score>best.score)best=current;
      // A stronger mean with a failed sentence must not hide a valid alignment.
      if(acceptedForLarge(current,acceptAlignment,largeFeatureMode))return withRawBest(current,best);
    }
    return best;
  }
  function withRawBest(selected,raw){
    let highest=raw;
    for(const value of [selected?.rawBest,raw?.rawBest])if(value&&(!highest||value.score>highest.score))highest=value;
    return highest&&highest!==selected&&highest.score>selected.score
      ? {...selected,rawBest:{score:highest.score,whole:highest.whole,bands:[...highest.bands],rect:{...highest.rect}}}
      : selected;
  }
  function accepted(v){return Boolean(v&&v.whole>=.60&&v.score>=.65&&v.bands.every(s=>s>=.52)&&v.bands.filter(s=>s>=.65).length>=2);}
  // Additional app acceptance is optional and synchronous. It cannot replace
  // the native glyph guard, and false must continue the current-frame search.
  function acceptedForLarge(value,acceptAlignment=null,largeFeatureMode=false){
    const nativePassed=accepted(value)||(largeFeatureMode&&BALANCED_NATIVE_RESEARCH_ENABLED&&Boolean(value&&value.whole>=.60&&value.score>=.65&&value.bands.length===3&&value.bands.every(v=>v>=.60)));
    return nativePassed&&m7RowPass(value,largeFeatureMode)&&(!acceptAlignment||acceptAlignment(value)===true);
  }
  function asLargeSearchResult(value,id,search,ratio,rising=false){
    const rect={x:value.rect.x/ratio,y:value.rect.y/ratio,w:value.rect.w/ratio,h:value.rect.h/ratio};
    return rising
      ? {...value,id,matched:acceptedForLarge(value,null,true),poseRect:rect,poseAngle:risingAngle,rect:originalRect(rect,search)}
      : {...value,id,matched:acceptedForLarge(value,null,true),rect};
  }
  async function analyze(search,native=search,options={}){
    await init();
    const result=await targeted(search,{ids,maxCandidates:4});
    const candidates=result.candidates.filter(c=>c.score>=(options.quickCandidatesOnly ? .70 : .46)).sort((a,b)=>b.score-a.score);
    const ratio=native.width/search.width,verified=[];
    for(const c of candidates.slice(0,options.quickCandidatesOnly?1:12)){
      const candidate={...c,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
      const v=await verify(native,candidate,references.get(c.id));if(!v)continue;
      const entry={...v,id:c.id,coarseScore:c.score,matched:accepted(v),rect:{x:v.rect.x/ratio,y:v.rect.y/ratio,w:v.rect.w/ratio,h:v.rect.h/ratio}};
      verified.push(entry);
      if(entry.matched)return {...entry,threshold:.65,candidates:verified};
    }
    return {matched:false,candidates:verified};
  }

  const largeIds=['tilted','flat'].flatMap(f=>(f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6]).map(a=>'large-click-'+f+'-'+a)).concat(M400_NARROW_ENABLED?['large-click-flat-narrow--12']:[]);
  const risingId='large-click-rising-0',risingAngle=30;
  const RISING_SEED_SIDECAR_ENABLED=((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)))&&window.__MALERT_RESEARCH_CONFIG?.retainRisingSeedSidecar===true;
  const risingSeedSidecarStats={operations:0,originalCandidates:0,sidecarCandidates:0,extraVerified:0,extraAccepted:0,extraRejected:0,last:null};
  const RISING_SEED_ANCHOR_ENABLED=RISING_SEED_SIDECAR_ENABLED&&((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)))&&window.__MALERT_RESEARCH_CONFIG?.largeClickSeedAnchor===true;
  const risingSeedAnchorStats={calls:0,anchors:0,elapsedMs:0,selectedChanges:0,fallbacks:0,last:null};
  async function rankRisingSeedAnchor(native,context,unique){
    const started=performance.now(),original=unique[0];
    const record={candidateCount:unique.length,maximumAnchors:window.__MALERT_M39_SEED_COVERAGE_EXPERIMENT===true?231:7,rows:[],selectedOriginalRank:1,selectionChanged:false,fallbackReason:null,elapsedMs:0};
    risingSeedAnchorStats.calls++;
    let selected=original;
    try{
      if(!PRECISION_FALLBACK_RESEARCH_ENABLED)record.fallbackReason='PRECISION_FEATURE_CONTRACT_INACTIVE';
      else if(!context.pixels)record.fallbackReason='NO_CURRENT_DESKEW_PIXELS';
      else if(unique.length>(window.__MALERT_M39_SEED_COVERAGE_EXPERIMENT===true?231:7))record.fallbackReason='EXISTING_SEVEN_CANDIDATE_BOUND_EXCEEDED';
      else{
        const ratio=native.width/context.searchWidth;
        if(!Number.isFinite(ratio)||ratio<=0)throw Error('Invalid current search/native ratio');
        let best=null;
        for(let i=0;i<unique.length;i++){
          const c=unique[i],r=c.rect,candidate={id:c.id,rect:{x:r.x*ratio,y:r.y*ratio,w:r.w*ratio,h:r.h*ratio}};
          const anchor=await largeNativePrecisionFallback.scoreSeedAnchor(context.pixels,candidate);
          risingSeedAnchorStats.anchors++;
          record.rows.push({originalRank:i+1,coarseScore:c.score,searchRect:{...r},nativeSeed:{...candidate.rect},...anchor});
          if(anchor.valid&&(!best||anchor.best.score>best.score)){
            best=anchor.best;selected=c;record.selectedOriginalRank=i+1;
          }
        }
        if(!best)record.fallbackReason='NO_VALID_EXISTING_REFERENCE_ANCHOR';
      }
    }catch(error){selected=original;record.selectedOriginalRank=1;record.fallbackReason='ANCHOR_EXCEPTION';record.error=String(error?.message||error);}
    if(record.fallbackReason){selected=original;record.selectedOriginalRank=1;risingSeedAnchorStats.fallbacks++;}
    record.selectionChanged=selected!==original;
    if(record.selectionChanged)risingSeedAnchorStats.selectedChanges++;
    record.elapsedMs=performance.now()-started;risingSeedAnchorStats.elapsedMs+=record.elapsedMs;
    risingSeedAnchorStats.last=record;return selected;
  }
  function newRisingSidecarContext(){return RISING_SEED_SIDECAR_ENABLED?{originals:[],sidecars:[],pixels:null}:null;}
  function retainRisingSidecars(context,result){
    if(!context)return;
    context.originals.push(...result.candidates);
    context.sidecars.push(...(result.sidecars||[]));
  }
  async function originalRisingCoarse(input,context){
    const result=await targeted(input,{ids:[risingId],maxCandidates:2,...(context?{retainRisingSeedSidecar:true}:{})});
    retainRisingSidecars(context,result);
    return result.candidates.filter(c=>c.score>=.40).sort((a,b)=>b.score-a.score).slice(0,2);
  }
  async function tryRisingSeedSidecar(search,native,options,context,existing){
    if(!context||existing.matched)return existing;
    risingSeedSidecarStats.operations++;
    risingSeedSidecarStats.originalCandidates+=context.originals.length;
    risingSeedSidecarStats.sidecarCandidates+=context.sidecars.length;
    const key=c=>[c.id,c.rect.x,c.rect.y,c.rect.w,c.rect.h].join('|');
    const used=new Set(context.originals.map(key)),unique=[];
    for(const c of context.sidecars){
      if(c.id!==risingId||!Number.isFinite(c.score)||!c.rect||![c.rect.x,c.rect.y,c.rect.w,c.rect.h].every(Number.isFinite))continue;
      const k=key(c);if(used.has(k))continue;used.add(k);unique.push(c);
    }
    // One supplemental seed across the whole completed rising search, never
    // replacing the original candidate order or its acceptance thresholds.
    let c=unique.sort((a,b)=>b.score-a.score)[0];
    if(c&&RISING_SEED_ANCHOR_ENABLED)c=await rankRisingSeedAnchor(native,{...context,searchWidth:search.width},unique);
    if(!c||!context.pixels)return existing;
    const ratio=native.width/search.width,pixels=context.pixels;
    const candidate={id:risingId,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
    if(candidate.rect.w<=0||candidate.rect.h<=0||candidate.rect.x<0||candidate.rect.y<0||candidate.rect.x+candidate.rect.w>pixels.width||candidate.rect.y+candidate.rect.h>pixels.height)return existing;
    const acceptCandidate=typeof options.acceptCandidate==='function'?options.acceptCandidate:null;
    const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,risingId,search,ratio,true))===true:null;
    const started=performance.now();risingSeedSidecarStats.extraVerified++;
    const best=await verifyLargeCandidate(pixels,candidate,acceptAlignment);
    const matched=!!best&&acceptedForLarge(best,acceptAlignment,true);
    risingSeedSidecarStats[matched?'extraAccepted':'extraRejected']++;
    risingSeedSidecarStats.last={coarseScore:c.score,searchRect:{...c.rect},nativeSeed:{...candidate.rect},
      availableSupplemental:unique.length,verifiedSupplemental:1,matched,elapsedMs:performance.now()-started,
      seedProvenance:{source:c.retrievalSource||null,seed:c.sidecarSeed||null,featureRect:c.featureRect||null,analysisWidth:c.analysisWidth||null,scaleBack:c.scaleBack||null},final:best?{whole:best.whole,score:best.score,bands:[...best.bands],rect:{...best.rect},nativeAcceptedEvidence:best.nativeAcceptedEvidence||null}:null};
    if(!best)return existing;
    const poseRect={x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio};
    const item={...best,id:risingId,coarseScore:c.score,matched,rejection:guideRejection(best),poseRect,poseAngle:risingAngle,
      rect:originalRect(poseRect,search),researchRisingSeedSidecar:true,retrievalSeed:{...candidate.rect},templateScale:c.templateScale};
    const candidates=[...existing.candidates,item];
    return matched?{...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)}:{...existing,candidates};
  }
  let largeReferences=null,largeLoading=null;
  async function initLarge(){
    if(largeReferences)return largeReferences;
    if(!largeLoading)largeLoading=(async()=>{
      const map=new Map();for(const f of ['tilted','flat','rising']){
        const img=new Image();img.src=new URL('../assets/local-templates/oct-click-'+f+(f==='rising'?'-fixed':'')+'.png',scriptBase).href;await img.decode();
        for(const angle of (f==='rising'?[0]:f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6])){
          const refs=[];for(const fine of [-2,0,2]){
            const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
            const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate((angle+fine)*Math.PI/180);ctx.drawImage(img,-c.width/2,-c.height/2);
            refs.push(largeClickFeatures(c,{x:0,y:0,w:c.width,h:c.height},true));
          }map.set('large-click-'+f+'-'+angle,refs);
        }
      }if(M400_NARROW_ENABLED)map.set('large-click-flat-narrow--12',map.get('large-click-flat--12'));return largeReferences=map;
    })().catch(e=>{largeLoading=null;throw e;});return largeLoading;
  }
  // Share the exact existing native-pixel verification and refinement grid
  // between full localization and a later frame's bounded location hint.
  // One bounded current-pixel alignment fallback, local and disabled by default.
  const nativeAlignmentStats={calls:0,featureExtractions:0,nativeEvaluations:0,elapsedMs:0,passed:0,failed:0,last:null};
  async function nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment){
    const started=performance.now(),seed=candidate.rect;
    const stats={featureExtractions:0,nativeEvaluations:0,skippedOutOfBounds:0,phase:'coarse-cell',passed:false,
      frameMarker:native.auditFrameMarker?{kind:native.auditFrameMarker.kind,value:native.auditFrameMarker.value}:null,
      seedRect:{...seed},referenceVariants:order.length};
    const inside=r=>r.x>=0&&r.y>=0&&r.x+r.w<=native.width&&r.y+r.h<=native.height;
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    // Features are shared across references only inside this current invocation.
    const featuresByPosition=[],visited=new Set();
    const key=(index,r)=>index+':'+[r.x,r.y,r.w,r.h].map(v=>v.toPrecision(15)).join(':');
    const evaluate=(ref,index,rect,feature)=>{
      const bands=[correlation(ref,feature,2,17),correlation(ref,feature,19,36),correlation(ref,feature,38,54)];
      stats.nativeEvaluations++;
      return m7Remember({score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,feature,2,54),bands,rect,referenceIndex:index},ref,feature);
    };
    let best=null;
    try{
      // Existing fine-grid spacing, now centered on the original current coarse
      // cell rather than only the previous 75-grid winner. At most 27*3 checks.
      for(const {ref,index} of order){
        let position=0;
        for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
          const ordinal=position++;await checkpoint();
          const rect={x:seed.x+seed.w*dx-seed.w*(scale-1)/2,y:seed.y+seed.h*dy-seed.h*(scale-1)/2,w:seed.w*scale,h:seed.h*scale};
          if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
          let feature=featuresByPosition[ordinal];
          if(!feature){
            feature=scale===1&&dx===0&&dy===0?anchorFeatures:largeClickFeatures(native,rect);
            if(!(scale===1&&dx===0&&dy===0))stats.featureExtractions++;
            featuresByPosition[ordinal]=feature;
          }
          visited.add(key(index,rect));
          const value=evaluate(ref,index,rect,feature);
          if(!best||value.score>best.score)best=value;
          if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};stats.referenceIndex=index;return withRawBest({...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'coarse-cell'},best);}
        }
      }
      if(!best)return null;
      // A quarter native pixel, capped at one eighth of a 64x56 feature cell.
      // The same rule is applied to every current candidate; no known answer,
      // saved score, media name, frame time or fixed screen position is used.
      const center=best.rect,ref=order.find(e=>e.index===best.referenceIndex)?.ref;
      if(!ref)return null;
      const stepX=Math.min(.25,center.w/(W*8)),stepY=Math.min(.25,center.h/(H*8));
      stats.phase='subpixel';stats.center={...center};stats.stepX=stepX;stats.stepY=stepY;stats.referenceIndex=best.referenceIndex;
      const referenceIndex=best.referenceIndex;
      for(const ix of [-2,-1,0,1,2])for(const iy of [-2,-1,0,1,2]){
        if(ix===0&&iy===0)continue;await checkpoint();
        const rect={...center,x:center.x+ix*stepX,y:center.y+iy*stepY};
        if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
        if(visited.has(key(referenceIndex,rect)))continue;visited.add(key(referenceIndex,rect));
        const feature=largeClickFeatures(native,rect);stats.featureExtractions++;
        const value=evaluate(ref,referenceIndex,rect,feature);
        if(value.score>best.score)best=value;
        if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};return withRawBest({...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'subpixel'},best);}
      }
      return null;
    }finally{
      stats.elapsedMs=performance.now()-started;
      nativeAlignmentStats.calls++;nativeAlignmentStats.featureExtractions+=stats.featureExtractions;
      nativeAlignmentStats.nativeEvaluations+=stats.nativeEvaluations;nativeAlignmentStats.elapsedMs+=stats.elapsedMs;
      nativeAlignmentStats[stats.passed?'passed':'failed']++;nativeAlignmentStats.last=stats;
    }
  }
  const PRECISION_FALLBACK_RESEARCH_ENABLED = VALID_ROOT_RESEARCH_ENABLED && BALANCED_NATIVE_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickPrecisionFallback === true && window.__MALERT_RESEARCH_CONFIG?.largeClickMedianContrast === true && window.__MALERT_RESEARCH_CONFIG?.largeClickReferenceSupportFallback === true;
  const SINGLE_PASS_ROOT_MAGNITUDE_ENABLED=((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)))&&window.__MALERT_RESEARCH_CONFIG?.singlePassRootMagnitude===true;
  const affineNativeSources=new WeakMap();
  const AFFINE_NATIVE_RESEARCH_ENABLED=((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)))&&window.__MALERT_RESEARCH_CONFIG?.largeClickSingleAffine===true;
  const EXACT_MEDIAN9_NATIVE_ENABLED=((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)))&&window.__MALERT_RESEARCH_CONFIG?.exactMedian9Native===true;
  function median9(a,b,c,d,e,f,g,h,i){
 let t;
 if(b>c){t=b;b=c;c=t;} if(e>f){t=e;e=f;f=t;} if(h>i){t=h;h=i;i=t;}
 if(a>b){t=a;a=b;b=t;} if(d>e){t=d;d=e;e=t;} if(g>h){t=g;g=h;h=t;}
 if(b>c){t=b;b=c;c=t;} if(e>f){t=e;e=f;f=t;} if(h>i){t=h;h=i;i=t;}
 if(a>d){t=a;a=d;d=t;} if(f>i){t=f;f=i;i=t;} if(e>h){t=e;e=h;h=t;}
 if(d>g){t=d;d=g;g=t;} if(b>e){t=b;b=e;e=t;} if(c>f){t=c;c=f;f=t;}
 if(e>h){t=e;e=h;h=t;} if(e>c){t=e;e=c;c=t;} if(g>e){t=g;g=e;e=t;}
 if(e>c){t=e;e=c;c=t;}
 return e;
}

  // Local default-off: representation and ROI search change, original numeric floors do not.
  const M8B_SECOND_ROOT=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_SECOND_ROOT_NATIVE_EXPERIMENT===true;
  const M8B_ASPECT=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_ASPECT_NATIVE_EXPERIMENT===true;
  const ASPECT_CENTER_FIRST_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_ASPECT_CENTER_FIRST_EXPERIMENT===true;
  const CURRENT_FRAME_GRID_CACHE_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_CURRENT_FRAME_GRID_CACHE_EXPERIMENT===true;
  const currentFrameGridCacheStats={calls:0,hits:0,misses:0,stores:0,liveBytes:0,peakBytes:0,releasedCalls:0};
  function currentFrameGridArray(cache,aspect){
    if(!cache)return null;
    let array=cache.get(aspect);
    if(!array){array=new Array(75);array.currentFrameGridCache={bytes:0};cache.set(aspect,array);}
    return array;
  }
  function rememberCurrentFrameGrid(array,index,feature){
    if(!array)return;
    if(!array[index]){currentFrameGridCacheStats.stores++;array.currentFrameGridCache.bytes+=feature.byteLength;currentFrameGridCacheStats.liveBytes+=feature.byteLength;currentFrameGridCacheStats.peakBytes=Math.max(currentFrameGridCacheStats.peakBytes,currentFrameGridCacheStats.liveBytes);}
    array[index]=feature;
  }
  function releaseCurrentFrameGrid(cache){if(!cache)return;for(const array of cache.values())currentFrameGridCacheStats.liveBytes-=array.currentFrameGridCache.bytes;cache.clear();currentFrameGridCacheStats.releasedCalls++;}
  const aspectCenterStats={calls:0,points:0,referenceEvaluations:0,passed:0,failed:0,incomplete:0,aborts:0,elapsedWallMs:0,addedFailureWallMs:0,last:null};
  function aspectCenterPoint(r,dx,dy){
    const scale=1;
    return {x:r.x+r.w*dx-r.w*(scale-1)/2,y:r.y+r.h*dy-r.h*(scale-1)/2,w:r.w*scale,h:r.h*scale};
  }
  async function tryExistingAspectCenters(native,candidate,refs,variants,project,acceptAlignment,currentFrameGridCache=null){
    const start=performance.now(),checkpoint=window.MAlertContourWorker.makeYieldPoint();
    const audit={startedAt:start,currentSource:'CURRENT_NATIVE_EXISTING_GRID_POINTS',sourceMarker:native.auditFrameMarker?{...native.auditFrameMarker}:null,
      candidateId:candidate.id,seed:{...candidate.rect},points:0,referenceEvaluations:0,passed:false,rows:[],rowsDropped:0,fullOriginalLoopFollowsOnFailure:true};
    aspectCenterStats.calls++;aspectCenterStats.last=audit;
    try{
      for(const aspect of variants){
        const r=candidate.rect,w=r.w*aspect.w,h=r.h*aspect.h,rect={x:r.x+(r.w-w)/2,y:r.y+(r.h-h)/2,w,h};
        if(rect.x<0||rect.y<0||rect.x+w>native.width||rect.y+h>native.height)continue;
        const cachedGrid=currentFrameGridArray(currentFrameGridCache,aspect);let centerOrdinal=0;
        for(const dx of [-.04,-.02,0,.02,.04])for(const dy of [-.04,-.02,0,.02,.04]){
          const featureIndex=25+centerOrdinal++;
          await checkpoint();
          const point=aspectCenterPoint(rect,dx,dy);
          if(point.x<0||point.y<0||point.x+point.w>native.width||point.y+point.h>native.height)continue;
          const current=project(largeClickFeatures(native,point));
          if(cachedGrid){currentFrameGridCacheStats.misses++;rememberCurrentFrameGrid(cachedGrid,featureIndex,current);}
          audit.points++;aspectCenterStats.points++;
          // One current feature for this exact point, independent score per reference.
          for(let index=0;index<refs.length;index++){
            const ref=m8bReference(refs[index]),bands=[correlation(ref,current,2,17),correlation(ref,current,19,36),correlation(ref,current,38,54)];
            const value={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,current,2,54),bands,rect:{...point},referenceIndex:index};
            project.onEvaluation();audit.referenceEvaluations++;aspectCenterStats.referenceEvaluations++;m7Remember(value,ref,current);
            const passed=acceptedForLarge(value,acceptAlignment,true);
            const row={aspect:{...aspect},dx,dy,scale:1,rect:{...point},referenceIndex:index,score:value.score,whole:value.whole,bands:[...bands],passed,
              privatePairEstablished:!!m7RowPairs.get(value),rowDetailEvidence:value.rowDetailEvidence?{...value.rowDetailEvidence}:null,at:performance.now()};
            if(audit.rows.length<128)audit.rows.push(row);else audit.rowsDropped++;
            if(passed){audit.passed=true;audit.selected=row;aspectCenterStats.passed++;return {value,aspect};}
          }
        }
      }
      return null;
    }catch(error){audit.error={name:error?.name,message:String(error?.message||error)};audit.fullOriginalLoopFollowsOnFailure=false;if(error?.name==='AbortError'||error?.code==='ABORT_ERR')aspectCenterStats.aborts++;throw error;}
    finally{audit.endedAt=performance.now();audit.elapsedWallMs=audit.endedAt-start;aspectCenterStats.elapsedWallMs+=audit.elapsedWallMs;if(!audit.passed){if(audit.error)aspectCenterStats.incomplete++;else{aspectCenterStats.failed++;aspectCenterStats.addedFailureWallMs+=audit.elapsedWallMs;}}}
  }

  const m8bReferenceRoots=new WeakMap();
  const m8bNativeStats={calls:0,eligible:0,rowGateRejected:0,featureExtractions:0,referenceEvaluations:0,variants:0,accepted:0,failed:0,elapsedMs:0,last:null};
  function m8bReference(ref){
    if(!M8B_SECOND_ROOT)return ref;
    let projected=m8bReferenceRoots.get(ref);if(!projected){projected=rootMagnitude(ref);const mask=nativeValidReferenceMasks.get(ref);if(mask)nativeValidReferenceMasks.set(projected,mask);m8bReferenceRoots.set(ref,projected);}return projected;
  }
  async function m8bNativeFallback(native,candidate,original,acceptAlignment){
    if(!M8B_SECOND_ROOT&&!M8B_ASPECT)return null;
    m8bNativeStats.calls++;
    if(!original||!(original.score>.50))return null;
    // Direct use of the existing mean object's private current feature/reference pair.
    // No missing-pair substitute or fabricated row evidence is allowed.
    if(!m7RowPass(original,true)){m8bNativeStats.rowGateRejected++;return null;}
    const refs=largeReferences.get(candidate.id)||[];if(refs.length!==3)return null;
    const started=performance.now(),before={features:m8bNativeStats.featureExtractions,evaluations:m8bNativeStats.referenceEvaluations,variants:m8bNativeStats.variants};
    m8bNativeStats.eligible++;let selected=null;
    const currentFrameGridCache=CURRENT_FRAME_GRID_CACHE_ENABLED&&ASPECT_CENTER_FIRST_ENABLED?new Map():null;
    if(currentFrameGridCache)currentFrameGridCacheStats.calls++;
    const project=feature=>{m8bNativeStats.featureExtractions++;return M8B_SECOND_ROOT?rootMagnitude(feature):feature;};
    project.onEvaluation=()=>{m8bNativeStats.referenceEvaluations++;};
    const finish=(value,phase,aspect)=>{
      if(!value)return null;
      const evidence={path:'M8B_NATIVE_RASTER_AFTER_MEAN_MEDIAN_REFERENCE_SUPPORT_FAILURE',phase,secondRoot:M8B_SECOND_ROOT,aspectEnabled:M8B_ASPECT,aspect,rect:{...value.rect},referenceId:candidate.id,referenceIndex:value.referenceIndex,currentFrameMarker:native.auditFrameMarker?{...native.auditFrameMarker}:null,currentNativePixels:true,numericFloorsUnchanged:true,representationChanged:M8B_SECOND_ROOT,roiSearchChanged:M8B_ASPECT};
      return {...value,researchNativeRasterFallback:true,nativeRasterEvidence:evidence};
    };
    try{
      // First inspect the returned original mean rectangle without moving it.
      const current=project(largeClickFeatures(native,original.rect));
      for(let index=0;index<refs.length;index++){
        const ref=m8bReference(refs[index]),bands=[correlation(ref,current,2,17),correlation(ref,current,19,36),correlation(ref,current,38,54)];
        const value={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,current,2,54),bands,rect:{...original.rect},referenceIndex:index};
        m8bNativeStats.referenceEvaluations++;m7Remember(value,ref,current);
        if(acceptedForLarge(value,acceptAlignment,true)){selected=finish(value,'original-mean-returned-anchor',{w:1,h:1});return selected;}
      }
      const variants=[{w:1,h:1}];
      if(M8B_ASPECT){const extra=[];for(const w of [.95,1,1.05,1.1,1.15])for(const h of [.95,1,1.05])if(w!==1||h!==1)extra.push({w,h});extra.sort((a,b)=>(Math.abs(a.w-1)+Math.abs(a.h-1))-(Math.abs(b.w-1)+Math.abs(b.h-1)));variants.push(...extra);}
      if(ASPECT_CENTER_FIRST_ENABLED){
        const early=await tryExistingAspectCenters(native,candidate,refs,variants,project,acceptAlignment,currentFrameGridCache);
        if(early){selected=finish(early.value,'existing-grid-scale-one-first',early.aspect);return selected;}
      }
      for(const aspect of variants){
        const r=candidate.rect,w=r.w*aspect.w,h=r.h*aspect.h,rect={x:r.x+(r.w-w)/2,y:r.y+(r.h-h)/2,w,h};
        if(rect.x<0||rect.y<0||rect.x+w>native.width||rect.y+h>native.height)continue;
        m8bNativeStats.variants++;
        const localCandidate={...candidate,rect},gridFeatures=currentFrameGridArray(currentFrameGridCache,aspect)||[];
        // Cache belongs to this one current-canvas, one adjusted-ROI call only.
        for(let index=0;index<refs.length;index++){
          const ref=m8bReference(refs[index]),value=await verify(native,localCandidate,ref,gridFeatures,acceptAlignment,true,project);
          if(value){value.referenceIndex=index;if(acceptedForLarge(value,acceptAlignment,true)){selected=finish(value,aspect.w===1&&aspect.h===1?'original-candidate-grid':'aspect-candidate-grid',aspect);return selected;}}
        }
        if(currentFrameGridCache){currentFrameGridCacheStats.liveBytes-=gridFeatures.currentFrameGridCache.bytes;currentFrameGridCache.delete(aspect);gridFeatures.length=0;}
      }
      return null;
    }finally{
      releaseCurrentFrameGrid(currentFrameGridCache);
      const elapsedMs=performance.now()-started;m8bNativeStats.elapsedMs+=elapsedMs;m8bNativeStats[selected?'accepted':'failed']++;
      m8bNativeStats.last={candidateId:candidate.id,seed:{...candidate.rect},originalMeanRect:{...original.rect},secondRoot:M8B_SECOND_ROOT,aspect:M8B_ASPECT,featureExtractions:m8bNativeStats.featureExtractions-before.features,referenceEvaluations:m8bNativeStats.referenceEvaluations-before.evaluations,variants:m8bNativeStats.variants-before.variants,elapsedMs,accepted:!!selected,evidence:selected?.nativeRasterEvidence||null};
    }
  }

  const largeNativePrecisionFallback=(()=>{
  const NATIVE_ALIGNMENT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.nativeAlignmentFallback === true;
  // Local research only. Capture once so reference caches and current frames use one feature contract.
  const VALID_ROOT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickValidRootFeatures === true;
  // Coupled local research: E must already be enabled. Capture once before references are cached.
  const BALANCED_NATIVE_RESEARCH_ENABLED = VALID_ROOT_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickBalancedNativeSupport === true;
  const MEDIAN_NATIVE_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickMedianContrast === true;
  const REFERENCE_SUPPORT_RESEARCH_ENABLED = BALANCED_NATIVE_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickReferenceSupportFallback === true;
  const nativeMeanReferenceFeatures=new WeakMap(),nativeReferenceOnlyMasks=new WeakMap(),nativeSupportPairs=new WeakMap();
  const nativeValidReferenceMasks=new WeakMap();
  function nativeValidSupport(rgba){const width=64,height=56,mask=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){let valid=true;for(let dy=-2;dy<=2&&valid;dy++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)===2&&Math.abs(dy)===2)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height||rgba[(yy*width+xx)*4+3]!==255){valid=false;break;}}mask[y*width+x]=valid?1:0;}return mask;}


  const W=64,H=56,scriptBase=document.currentScript?.src||document.baseURI;
  let featureCanvas=null,featureContext=null,featureRowSums=null;

  function features(source,r,validSupportReference=false,useMedian=false){
    // Synchronous extraction returns independent arrays. Reusing only this
    // small scratch surface avoids hundreds of backing-store allocations.
    // Clear it before drawing so transparent template corners never retain
    // pixels from the previous source or another reference.
    if(!featureCanvas){featureCanvas=document.createElement('canvas');featureCanvas.width=W;featureCanvas.height=H;featureContext=featureCanvas.getContext('2d',{willReadFrequently:true});featureRowSums=new Uint16Array(W*H*3);}
    const ctx=featureContext;ctx.clearRect(0,0,W,H);const actual=AFFINE_NATIVE_RESEARCH_ENABLED?affineNativeSources.get(source):null;
    if(actual){const cx=actual.width/2,cy=actual.height/2;ctx.save();ctx.scale(W/r.w,H/r.h);ctx.translate(-r.x,-r.y);ctx.translate(cx,cy);ctx.rotate(Math.PI/6);ctx.drawImage(actual,-cx,-cy);ctx.restore();}
    else ctx.drawImage(source,r.x,r.y,r.w,r.h,0,0,W,H);
    const d=ctx.getImageData(0,0,W,H).data,values=new Float32Array(W*H);
    // These are sums of three bytes (0..765), so Uint16 retains the exact
    // integers. Three row sums equal the former nine additions exactly; the
    // division and all subsequent floating-point operations are unchanged.
    const rows=featureRowSums;
    for(let y=0;y<H;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x,p=i*4,q=i*3;
      for(let ch=0;ch<3;ch++)rows[q+ch]=d[p-4+ch]+d[p+ch]+d[p+4+ch];
    }
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x;let magnitude=0;
      for(let ch=0;ch<3;ch++){
        const q=i*3+ch,mean=rows[q-W*3]+rows[q]+rows[q+W*3];
        let center=mean/9;
        if(useMedian){if(EXACT_MEDIAN9_NATIVE_ENABLED){const p=i*4+ch,s=W*4;center=median9(d[p-s-4],d[p-s],d[p-s+4],d[p-4],d[p],d[p+4],d[p+s-4],d[p+s],d[p+s+4]);}else{const nine=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)nine.push(d[((y+dy)*W+x+dx)*4+ch]);nine.sort((a,b)=>a-b);center=nine[4];}}
        const delta=d[i*4+ch]-center;magnitude+=delta*delta;
      }
      values[i]=Math.sqrt(magnitude);
    }
    const smooth=new Float32Array(values.length);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;smooth[i]=(values[i]*4+values[i-1]+values[i+1]+values[i-W]+values[i+W])/8;}
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(smooth,nativeValidSupport(d));
    return smooth;
  }
  function rootMagnitude(values){if(SINGLE_PASS_ROOT_MAGNITUDE_ENABLED){let ss=0,sum=0;for(let i=0;i<values.length;i++){const v=values[i];ss+=v*v;sum+=v;}const gain=sum>0?Math.sqrt(ss/sum):1,result=new Float32Array(values.length);for(let i=0;i<values.length;i++)result[i]=Math.sqrt(Math.max(0,values[i]))*gain;return result;}const ss=values.reduce((s,v)=>s+v*v,0),sum=values.reduce((s,v)=>s+v,0),gain=sum>0?Math.sqrt(ss/sum):1;return Float32Array.from(values,v=>Math.sqrt(Math.max(0,v))*gain);}
  function largeClickFeatures(source,r,validSupportReference=false){
    const values=features(source,r,validSupportReference,MEDIAN_NATIVE_RESEARCH_ENABLED),returned=VALID_ROOT_RESEARCH_ENABLED?rootMagnitude(values):values;
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(returned,nativeValidReferenceMasks.get(values));
    if(REFERENCE_SUPPORT_RESEARCH_ENABLED&&validSupportReference){
      const meanValues=MEDIAN_NATIVE_RESEARCH_ENABLED?features(source,r,true,false):values;
      const meanReturned=MEDIAN_NATIVE_RESEARCH_ENABLED?(VALID_ROOT_RESEARCH_ENABLED?rootMagnitude(meanValues):meanValues):returned;
      nativeValidReferenceMasks.set(meanReturned,nativeValidReferenceMasks.get(meanValues));
      nativeMeanReferenceFeatures.set(returned,meanReturned);
      nativeReferenceOnlyMasks.set(returned,makeReferenceOnlySupport(meanReturned,nativeValidReferenceMasks.get(meanReturned)));
    }
    return returned;
  }

  // Local research, captured once. Existing native scores/thresholds remain intact.
  const M7_ROW_DETAIL_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LARGE_ROW_DETAIL_EXPERIMENT===true;
  const m7RowPairs=new WeakMap(),m7RowStats={evaluations:0,passed:0,rejected:0,elapsedMs:0,last:null};
  function m7Remember(value,reference,feature){if(M7_ROW_DETAIL_ENABLED)m7RowPairs.set(value,{reference,feature});return value;}
  function m7RowPass(value,largeFeatureMode){
    if(!M7_ROW_DETAIL_ENABLED||!largeFeatureMode)return true;
    if(value?.rowDetailEvidence)return value.rowDetailEvidence.passed===true;
    const pair=m7RowPairs.get(value);if(!pair)return false;
    const started=performance.now(),mask=nativeValidReferenceMasks.get(pair.reference);let aa=0,bb=0,ab=0,n=0;
    // Remove each row's constant component, retaining horizontal letter detail.
    // Reuse this current alignment's existing reference and native feature vectors.
    for(let y=2;y<54;y++){
      let count=0,sa=0,sb=0;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;count++;sa+=pair.reference[i];sb+=pair.feature[i];}
      if(count<2)continue;const ma=sa/count,mb=sb/count;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;const u=pair.reference[i]-ma,v=pair.feature[i]-mb;aa+=u*u;bb+=v*v;ab+=u*v;n++;}
    }
    const correlation=aa>n*.01&&bb>n*.01?ab/Math.sqrt(aa*bb):-1,passed=Number.isFinite(correlation)&&correlation>=.35;
    value.rowDetailEvidence={correlation,threshold:.35,passed,source:'CURRENT_NATIVE_EXISTING_REFERENCE_FEATURES_WITHIN_ROW',cells:n};
    m7RowStats.evaluations++;m7RowStats[passed?'passed':'rejected']++;m7RowStats.elapsedMs+=performance.now()-started;m7RowStats.last={...value.rowDetailEvidence,rect:{...value.rect}};return passed;
  }

  function correlation(a,b,y1,y2){
    const validSupport=BALANCED_NATIVE_RESEARCH_ENABLED?nativeValidReferenceMasks.get(a):null;
    let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;
    for(let y=y1;y<y2;y++)for(let x=5;x<W-5;x++){const i=y*W+x;if(validSupport&&!validSupport[i])continue;const u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}
    const va=aa-sa*sa/n,vb=bb-sb*sb/n;
    return va>n*.01&&vb>n*.01?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;
  }
  function makeReferenceOnlySupport(meanReference,valid){
    const domain=new Uint8Array(W*H),seed=new Uint8Array(W*H),mask=new Uint8Array(W*H);let n=0,sum=0;
    for(let y=2;y<54;y++)for(let x=5;x<59;x++){const i=y*W+x;if(valid&&valid[i]){domain[i]=1;n++;sum+=meanReference[i];}}
    const mean=n?sum/n:Infinity;
    for(let i=0;i<seed.length;i++)if(domain[i]&&meanReference[i]>mean)seed[i]=1;
    for(let y=2;y<54;y++)for(let x=5;x<59;x++){const i=y*W+x;if(!domain[i])continue;for(let dy=-1;dy<=1&&!mask[i];dy++)for(let dx=-1;dx<=1;dx++)if(seed[(y+dy)*W+x+dx]){mask[i]=1;break;}}
    return mask;
  }
  function correlationOnReferenceSupport(a,b,y1,y2,validSupport){
    let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;
    for(let y=y1;y<y2;y++)for(let x=5;x<W-5;x++){const i=y*W+x;if(validSupport&&!validSupport[i])continue;const u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}
    const va=aa-sa*sa/n,vb=bb-sb*sb/n;
    return va>n*.01&&vb>n*.01?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;
  }
  function rememberNativePair(value,reference,feature){
    if(REFERENCE_SUPPORT_RESEARCH_ENABLED)nativeSupportPairs.set(value,{reference,feature,evaluated:false,evidence:null});return value;
  }
  function copyNativePair(from,to){const pair=REFERENCE_SUPPORT_RESEARCH_ENABLED?nativeSupportPairs.get(from):null;if(pair)nativeSupportPairs.set(to,pair);return to;}
  function referenceSupportEvidence(value){
    const pair=nativeSupportPairs.get(value);if(!pair)return null;if(pair.evaluated)return pair.evidence;pair.evaluated=true;
    const mask=nativeReferenceOnlyMasks.get(pair.reference);if(!mask)return null;
    const bands=[correlationOnReferenceSupport(pair.reference,pair.feature,2,17,mask),correlationOnReferenceSupport(pair.reference,pair.feature,19,36,mask),correlationOnReferenceSupport(pair.reference,pair.feature,38,54,mask)];
    const metrics={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlationOnReferenceSupport(pair.reference,pair.feature,2,54,mask),bands,rect:{...value.rect}};
    pair.evidence={metrics,nativePassed:originalLargeNativePassed(metrics,true),maskCells:mask.reduce((n,v)=>n+v,0),source:'CURRENT_FEATURE_AND_FIXED_ORIGINAL_MEAN_REFERENCE_SUPPORT'};return pair.evidence;
  }

  async function verify(source,candidate,reference,gridFeatures=null,acceptAlignment=null,largeFeatureMode=false){
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    let best=null,position=0;
    for(const scale of [.96,1,1.04])for(const dx of [-.04,-.02,0,.02,.04])for(const dy of [-.04,-.02,0,.02,.04]){
      const featureIndex=position++;
      await checkpoint();
      const r=candidate.rect,rect={x:r.x+r.w*dx-r.w*(scale-1)/2,y:r.y+r.h*dy-r.h*(scale-1)/2,w:r.w*scale,h:r.h*scale};
      if(rect.x<0||rect.y<0||rect.x+rect.w>source.width||rect.y+rect.h>source.height)continue;
      // gridFeatures belongs only to this immutable source/candidate call.
      // References share geometry, never scores or evidence from another frame.
      const f=gridFeatures?.[featureIndex]||(largeFeatureMode?largeClickFeatures(source,rect):features(source,rect));
      if(gridFeatures)gridFeatures[featureIndex]=f;
      const bands=[correlation(reference,f,2,17),correlation(reference,f,19,36),correlation(reference,f,38,54)];
      const whole=correlation(reference,f,2,54),score=bands.reduce((a,b)=>a+b,0)/3;
      const current={score,whole,bands,rect};
      if(largeFeatureMode)m7Remember(current,reference,f);
      if(largeFeatureMode)rememberNativePair(current,reference,f);
      if(!best||score>best.score)best=current;
      // A stronger mean with a failed sentence must not hide a valid alignment.
      if(acceptedForLarge(current,acceptAlignment,largeFeatureMode))return withRawBest(current,best);
    }
    return best;
  }
  function withRawBest(selected,raw){
    let highest=raw;
    for(const value of [selected?.rawBest,raw?.rawBest])if(value&&(!highest||value.score>highest.score))highest=value;
    return highest&&highest!==selected&&highest.score>selected.score
      ? copyNativePair(selected,{...selected,rawBest:{score:highest.score,whole:highest.whole,bands:[...highest.bands],rect:{...highest.rect}}})
      : selected;
  }
  function accepted(v){return Boolean(v&&v.whole>=.60&&v.score>=.65&&v.bands.every(s=>s>=.52)&&v.bands.filter(s=>s>=.65).length>=2);}
  // Additional app acceptance is optional and synchronous. It cannot replace
  // the native glyph guard, and false must continue the current-frame search.
  function originalLargeNativePassed(value,largeFeatureMode=false){return accepted(value)||(largeFeatureMode&&BALANCED_NATIVE_RESEARCH_ENABLED&&Boolean(value&&value.whole>=.60&&value.score>=.65&&value.bands.length===3&&value.bands.every(v=>v>=.60)));}
  function acceptedForLarge(value,acceptAlignment=null,largeFeatureMode=false){
    const alphaPassed=originalLargeNativePassed(value,largeFeatureMode);
    const support=!alphaPassed&&largeFeatureMode&&REFERENCE_SUPPORT_RESEARCH_ENABLED?referenceSupportEvidence(value):null;
    const nativePassed=alphaPassed||support?.nativePassed===true;
    return nativePassed&&m7RowPass(value,largeFeatureMode)&&(!acceptAlignment||acceptAlignment(acceptedNativeView(value))===true);
  }

  const largeIds=['tilted','flat'].flatMap(f=>(f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6]).map(a=>'large-click-'+f+'-'+a)).concat(M400_NARROW_ENABLED?['large-click-flat-narrow--12']:[]);
  const risingId='large-click-rising-0',risingAngle=30;
  let largeReferences=null,largeLoading=null;
  async function initLarge(){
    if(largeReferences)return largeReferences;
    if(!largeLoading)largeLoading=(async()=>{
      const map=new Map();for(const f of ['tilted','flat','rising']){
        const img=new Image();img.src=new URL('../assets/local-templates/oct-click-'+f+(f==='rising'?'-fixed':'')+'.png',scriptBase).href;await img.decode();
        for(const angle of (f==='rising'?[0]:f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6])){
          const refs=[];for(const fine of [-2,0,2]){
            const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
            const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate((angle+fine)*Math.PI/180);ctx.drawImage(img,-c.width/2,-c.height/2);
            refs.push(largeClickFeatures(c,{x:0,y:0,w:c.width,h:c.height},true));
          }map.set('large-click-'+f+'-'+angle,refs);
        }
      }if(M400_NARROW_ENABLED)map.set('large-click-flat-narrow--12',map.get('large-click-flat--12'));return largeReferences=map;
    })().catch(e=>{largeLoading=null;throw e;});return largeLoading;
  }
  // Share the exact existing native-pixel verification and refinement grid
  // between full localization and a later frame's bounded location hint.
  // One bounded current-pixel alignment fallback, local and disabled by default.
  const nativeAlignmentStats={calls:0,featureExtractions:0,nativeEvaluations:0,elapsedMs:0,passed:0,failed:0,last:null};
  async function nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment){
    const started=performance.now(),seed=candidate.rect;
    const stats={featureExtractions:0,nativeEvaluations:0,skippedOutOfBounds:0,phase:'coarse-cell',passed:false,
      frameMarker:native.auditFrameMarker?{kind:native.auditFrameMarker.kind,value:native.auditFrameMarker.value}:null,
      seedRect:{...seed},referenceVariants:order.length};
    const inside=r=>r.x>=0&&r.y>=0&&r.x+r.w<=native.width&&r.y+r.h<=native.height;
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    // Features are shared across references only inside this current invocation.
    const featuresByPosition=[],visited=new Set();
    const key=(index,r)=>index+':'+[r.x,r.y,r.w,r.h].map(v=>v.toPrecision(15)).join(':');
    const evaluate=(ref,index,rect,feature)=>{
      const bands=[correlation(ref,feature,2,17),correlation(ref,feature,19,36),correlation(ref,feature,38,54)];
      stats.nativeEvaluations++;
      return m7Remember(rememberNativePair({score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,feature,2,54),bands,rect,referenceIndex:index},ref,feature),ref,feature);
    };
    let best=null;
    try{
      // Existing fine-grid spacing, now centered on the original current coarse
      // cell rather than only the previous 75-grid winner. At most 27*3 checks.
      for(const {ref,index} of order){
        let position=0;
        for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
          const ordinal=position++;await checkpoint();
          const rect={x:seed.x+seed.w*dx-seed.w*(scale-1)/2,y:seed.y+seed.h*dy-seed.h*(scale-1)/2,w:seed.w*scale,h:seed.h*scale};
          if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
          let feature=featuresByPosition[ordinal];
          if(!feature){
            feature=scale===1&&dx===0&&dy===0?anchorFeatures:largeClickFeatures(native,rect);
            if(!(scale===1&&dx===0&&dy===0))stats.featureExtractions++;
            featuresByPosition[ordinal]=feature;
          }
          visited.add(key(index,rect));
          const value=evaluate(ref,index,rect,feature);
          if(!best||value.score>best.score)best=value;
          if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};stats.referenceIndex=index;return withRawBest(copyNativePair(value,{...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'coarse-cell'}),best);}
        }
      }
      if(!best)return null;
      // A quarter native pixel, capped at one eighth of a 64x56 feature cell.
      // The same rule is applied to every current candidate; no known answer,
      // saved score, media name, frame time or fixed screen position is used.
      const center=best.rect,ref=order.find(e=>e.index===best.referenceIndex)?.ref;
      if(!ref)return null;
      const stepX=Math.min(.25,center.w/(W*8)),stepY=Math.min(.25,center.h/(H*8));
      stats.phase='subpixel';stats.center={...center};stats.stepX=stepX;stats.stepY=stepY;stats.referenceIndex=best.referenceIndex;
      const referenceIndex=best.referenceIndex;
      for(const ix of [-2,-1,0,1,2])for(const iy of [-2,-1,0,1,2]){
        if(ix===0&&iy===0)continue;await checkpoint();
        const rect={...center,x:center.x+ix*stepX,y:center.y+iy*stepY};
        if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
        if(visited.has(key(referenceIndex,rect)))continue;visited.add(key(referenceIndex,rect));
        const feature=largeClickFeatures(native,rect);stats.featureExtractions++;
        const value=evaluate(ref,referenceIndex,rect,feature);
        if(value.score>best.score)best=value;
        if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};return withRawBest(copyNativePair(value,{...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'subpixel'}),best);}
      }
      return null;
    }finally{
      stats.elapsedMs=performance.now()-started;
      nativeAlignmentStats.calls++;nativeAlignmentStats.featureExtractions+=stats.featureExtractions;
      nativeAlignmentStats.nativeEvaluations+=stats.nativeEvaluations;nativeAlignmentStats.elapsedMs+=stats.elapsedMs;
      nativeAlignmentStats[stats.passed?'passed':'failed']++;nativeAlignmentStats.last=stats;
    }
  }
  async function verifyLargeCandidate(native,candidate,acceptAlignment=null){
      const refs=largeReferences.get(candidate.id)||[],order=refs.map((ref,index)=>({ref,index}));
      if(Number.isInteger(candidate.referenceIndex))order.sort((a,b)=>(b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex));
      // Every confirmation reads fresh pixels. An exact previous position is
      // tried before any neighborhood search; it still passes all four gates.
      const anchorFeatures=largeClickFeatures(native,candidate.rect);
      for(const entry of order){
        const {ref,index}=entry;
        const bands=[correlation(ref,anchorFeatures,2,17),correlation(ref,anchorFeatures,19,36),correlation(ref,anchorFeatures,38,54)];
        const exact={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,anchorFeatures,2,54),bands,rect:{...candidate.rect},referenceIndex:index};
        m7Remember(exact,ref,anchorFeatures);
        rememberNativePair(exact,ref,anchorFeatures);
        entry.anchorScore=exact.score;
        if(acceptedForLarge(exact,acceptAlignment,true))return exact;
      }
      // Ordering only: all variants remain available and every refinement
      // reads fresh pixels. Prefer the current anchor's closest text pose.
      order.sort((a,b)=>((b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex))||b.anchorScore-a.anchorScore);
      const gridFeatures=[]; // At most 75 independent feature vectors; released with this candidate.
      let best=null;for(const {ref,index} of order){
        let v=await verify(native,candidate,ref,gridFeatures,acceptAlignment,true);
        if(v){v.referenceIndex=index;if(acceptedForLarge(v,acceptAlignment,true))return v;}
        if(v&&v.score>.50){
          const anchor=v.rect;
          for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
            const rect={x:anchor.x+anchor.w*dx-anchor.w*(scale-1)/2,y:anchor.y+anchor.h*dy-anchor.h*(scale-1)/2,w:anchor.w*scale,h:anchor.h*scale};
            if(rect.x<0||rect.y<0||rect.x+rect.w>native.width||rect.y+rect.h>native.height)continue;
            const f=largeClickFeatures(native,rect),bands=[correlation(ref,f,2,17),correlation(ref,f,19,36),correlation(ref,f,38,54)],score=bands.reduce((a,b)=>a+b,0)/3;
            const current={score,bands,whole:correlation(ref,f,2,54),rect,referenceIndex:index};
            m7Remember(current,ref,f);
            rememberNativePair(current,ref,f);
            if(score>v.score)v=current;
            if(acceptedForLarge(current,acceptAlignment,true))return withRawBest(current,v);
          }
        }
        if(v&&(!best||v.score>best.score))best=v;
      }
      if(NATIVE_ALIGNMENT_RESEARCH_ENABLED && best?.score>.50){
        const aligned=await nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment);
        if(aligned)return aligned;
      }
      return best;
  }

  function acceptedNativeView(value){
    if(!value)return null;
    const pair=nativeSupportPairs.get(value),alphaPassed=originalLargeNativePassed(value,true),support=pair?.evidence;
    if((!alphaPassed&&support?.nativePassed!==true)||!m7RowPass(value,true))return null;
    let referenceId=null,referenceIndex=value.referenceIndex;
    if(pair)for(const [id,refs] of largeReferences){const index=refs.indexOf(pair.reference);if(index>=0){referenceId=id;referenceIndex=index;break;}}
    const alpha={score:value.score,whole:value.whole,bands:[...value.bands],rect:{...value.rect}};
    const metrics=alphaPassed?alpha:support.metrics;
    return {...value,score:metrics.score,whole:metrics.whole,bands:[...metrics.bands],rect:{...value.rect},referenceIndex,
      researchLargeNativePrecisionFallback:true,
      nativeAcceptedEvidence:{path:alphaPassed?'MEDIAN_ALPHA_AFTER_ORIGINAL_MEAN_FAILURE':'MEDIAN_REFERENCE_SUPPORT_AFTER_ORIGINAL_MEAN_AND_MEDIAN_ALPHA_FAILURE',
        score:metrics.score,whole:metrics.whole,bands:[...metrics.bands],rect:{...value.rect},referenceId,referenceIndex,
        originalMedianAlpha:alpha,rawMedianAlphaBest:value.rawBest?structuredClone(value.rawBest):null,
        supportSource:alphaPassed?null:'ORIGINAL_MEAN_REFERENCE_DOMAIN_MEAN_PLUS_ONE_3X3_DILATION',
        currentNativePixels:true,thresholdsUnchanged:true}};
  }
  return Object.freeze({
    async scoreSeedAnchor(native,candidate){
      await initLarge();
      const r=candidate.rect,refs=largeReferences.get(candidate.id)||[];
      if(!r||![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0||r.x<0||r.y<0||r.x+r.w>native.width||r.y+r.h>native.height)return {valid:false,reason:'OUT_OF_BOUNDS_OR_INVALID_RECT',best:null,references:[]};
      const feature=largeClickFeatures(native,r),references=[];let best=null;
      for(let index=0;index<refs.length;index++){
        const ref=refs[index],mask=nativeReferenceOnlyMasks.get(ref);
        if(!mask){references.push({referenceIndex:index,valid:false,reason:'NO_EXISTING_REFERENCE_MASK'});continue;}
        const bands=[correlationOnReferenceSupport(ref,feature,2,17,mask),correlationOnReferenceSupport(ref,feature,19,36,mask),correlationOnReferenceSupport(ref,feature,38,54,mask)];
        const whole=correlationOnReferenceSupport(ref,feature,2,54,mask),score=bands.reduce((a,b)=>a+b,0)/3;
        const valid=[whole,score,...bands].every(Number.isFinite)&&whole!==-1&&bands.every(v=>v!==-1);
        const value={valid,score,whole,bands,rect:{...r},referenceId:candidate.id,referenceIndex:index,maskCells:mask.reduce((n,v)=>n+v,0)};
        references.push(value);if(valid&&(!best||score>best.score))best=value;
      }
      return {valid:!!best,reason:best?null:'NO_VALID_EXISTING_REFERENCE_ANCHOR',best,references,featureExtractions:1,referenceCount:refs.length,acceptanceEvaluated:false};
    },
    async verify(native,candidate,acceptAlignment=null){
      await initLarge();
      let appAccepted=false;
      const callback=acceptAlignment?view=>{const ok=acceptAlignment(view)===true;if(ok)appAccepted=true;return ok;}:null;
      const value=await verifyLargeCandidate(native,candidate,callback),view=acceptedNativeView(value);
      // App-rejected native results must not become success through this interface.
      return view&&(!acceptAlignment||appAccepted)?view:null;
    },
    status:()=>({median:MEDIAN_NATIVE_RESEARCH_ENABLED,referenceSupport:REFERENCE_SUPPORT_RESEARCH_ENABLED,nativeAlignment:structuredClone(nativeAlignmentStats),rowDetail:{enabled:M7_ROW_DETAIL_ENABLED,threshold:.35,...structuredClone(m7RowStats)}})
  });

  })();
  const m39ChannelMaxEnabled=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_M39_CHANNEL_MAX_MEDIAN_EXPERIMENT===true;
  const m39ChannelMaxStats={calls:0,passed:0,failed:0,elapsedMs:0,last:null};
  window.MAlertM39ChannelMax=Object.freeze({enabled:()=>m39ChannelMaxEnabled,status:()=>({enabled:m39ChannelMaxEnabled,defaultEnabled:false,representation:'MAX_ABSOLUTE_RGB_LOCAL_MEDIAN_RESIDUAL',...structuredClone(m39ChannelMaxStats)})});
  const m39ChannelMaxPrecisionFallback=(()=>{
  const NATIVE_ALIGNMENT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.nativeAlignmentFallback === true;
  // Local research only. Capture once so reference caches and current frames use one feature contract.
  const VALID_ROOT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickValidRootFeatures === true;
  // Coupled local research: E must already be enabled. Capture once before references are cached.
  const BALANCED_NATIVE_RESEARCH_ENABLED = VALID_ROOT_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickBalancedNativeSupport === true;
  const MEDIAN_NATIVE_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickMedianContrast === true;
  const REFERENCE_SUPPORT_RESEARCH_ENABLED = BALANCED_NATIVE_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickReferenceSupportFallback === true;
  const nativeMeanReferenceFeatures=new WeakMap(),nativeReferenceOnlyMasks=new WeakMap(),nativeSupportPairs=new WeakMap();
  const nativeValidReferenceMasks=new WeakMap();
  function nativeValidSupport(rgba){const width=64,height=56,mask=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){let valid=true;for(let dy=-2;dy<=2&&valid;dy++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)===2&&Math.abs(dy)===2)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height||rgba[(yy*width+xx)*4+3]!==255){valid=false;break;}}mask[y*width+x]=valid?1:0;}return mask;}


  const W=64,H=56,scriptBase=document.currentScript?.src||document.baseURI;
  let featureCanvas=null,featureContext=null,featureRowSums=null;

  function features(source,r,validSupportReference=false,useMedian=false){
    // Synchronous extraction returns independent arrays. Reusing only this
    // small scratch surface avoids hundreds of backing-store allocations.
    // Clear it before drawing so transparent template corners never retain
    // pixels from the previous source or another reference.
    if(!featureCanvas){featureCanvas=document.createElement('canvas');featureCanvas.width=W;featureCanvas.height=H;featureContext=featureCanvas.getContext('2d',{willReadFrequently:true});featureRowSums=new Uint16Array(W*H*3);}
    const ctx=featureContext;ctx.clearRect(0,0,W,H);const actual=AFFINE_NATIVE_RESEARCH_ENABLED?affineNativeSources.get(source):null;
    if(actual){const cx=actual.width/2,cy=actual.height/2;ctx.save();ctx.scale(W/r.w,H/r.h);ctx.translate(-r.x,-r.y);ctx.translate(cx,cy);ctx.rotate(Math.PI/6);ctx.drawImage(actual,-cx,-cy);ctx.restore();}
    else ctx.drawImage(source,r.x,r.y,r.w,r.h,0,0,W,H);
    const d=ctx.getImageData(0,0,W,H).data,values=new Float32Array(W*H);
    // These are sums of three bytes (0..765), so Uint16 retains the exact
    // integers. Three row sums equal the former nine additions exactly; the
    // division and all subsequent floating-point operations are unchanged.
    const rows=featureRowSums;
    for(let y=0;y<H;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x,p=i*4,q=i*3;
      for(let ch=0;ch<3;ch++)rows[q+ch]=d[p-4+ch]+d[p+ch]+d[p+4+ch];
    }
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const i=y*W+x;let magnitude=0;
      for(let ch=0;ch<3;ch++){
        const q=i*3+ch,mean=rows[q-W*3]+rows[q]+rows[q+W*3];
        let center=mean/9;
        if(useMedian){if(EXACT_MEDIAN9_NATIVE_ENABLED){const p=i*4+ch,s=W*4;center=median9(d[p-s-4],d[p-s],d[p-s+4],d[p-4],d[p],d[p+4],d[p+s-4],d[p+s],d[p+s+4]);}else{const nine=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)nine.push(d[((y+dy)*W+x+dx)*4+ch]);nine.sort((a,b)=>a-b);center=nine[4];}}
        const delta=d[i*4+ch]-center;magnitude=useMedian?Math.max(magnitude,delta*delta):magnitude+delta*delta;
      }
      values[i]=Math.sqrt(magnitude);
    }
    const smooth=new Float32Array(values.length);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;smooth[i]=(values[i]*4+values[i-1]+values[i+1]+values[i-W]+values[i+W])/8;}
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(smooth,nativeValidSupport(d));
    return smooth;
  }
  function rootMagnitude(values){if(SINGLE_PASS_ROOT_MAGNITUDE_ENABLED){let ss=0,sum=0;for(let i=0;i<values.length;i++){const v=values[i];ss+=v*v;sum+=v;}const gain=sum>0?Math.sqrt(ss/sum):1,result=new Float32Array(values.length);for(let i=0;i<values.length;i++)result[i]=Math.sqrt(Math.max(0,values[i]))*gain;return result;}const ss=values.reduce((s,v)=>s+v*v,0),sum=values.reduce((s,v)=>s+v,0),gain=sum>0?Math.sqrt(ss/sum):1;return Float32Array.from(values,v=>Math.sqrt(Math.max(0,v))*gain);}
  function largeClickFeatures(source,r,validSupportReference=false){
    const values=features(source,r,validSupportReference,MEDIAN_NATIVE_RESEARCH_ENABLED),returned=VALID_ROOT_RESEARCH_ENABLED?rootMagnitude(values):values;
    if(BALANCED_NATIVE_RESEARCH_ENABLED&&validSupportReference)nativeValidReferenceMasks.set(returned,nativeValidReferenceMasks.get(values));
    if(REFERENCE_SUPPORT_RESEARCH_ENABLED&&validSupportReference){
      const meanValues=MEDIAN_NATIVE_RESEARCH_ENABLED?features(source,r,true,false):values;
      const meanReturned=MEDIAN_NATIVE_RESEARCH_ENABLED?(VALID_ROOT_RESEARCH_ENABLED?rootMagnitude(meanValues):meanValues):returned;
      nativeValidReferenceMasks.set(meanReturned,nativeValidReferenceMasks.get(meanValues));
      nativeMeanReferenceFeatures.set(returned,meanReturned);
      nativeReferenceOnlyMasks.set(returned,makeReferenceOnlySupport(meanReturned,nativeValidReferenceMasks.get(meanReturned)));
    }
    return returned;
  }

  // Local research, captured once. Existing native scores/thresholds remain intact.
  const M7_ROW_DETAIL_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LARGE_ROW_DETAIL_EXPERIMENT===true;
  const m7RowPairs=new WeakMap(),m7RowStats={evaluations:0,passed:0,rejected:0,elapsedMs:0,last:null};
  function m7Remember(value,reference,feature){if(M7_ROW_DETAIL_ENABLED)m7RowPairs.set(value,{reference,feature});return value;}
  function m7RowPass(value,largeFeatureMode){
    if(!M7_ROW_DETAIL_ENABLED||!largeFeatureMode)return true;
    if(value?.rowDetailEvidence)return value.rowDetailEvidence.passed===true;
    const pair=m7RowPairs.get(value);if(!pair)return false;
    const started=performance.now(),mask=nativeValidReferenceMasks.get(pair.reference);let aa=0,bb=0,ab=0,n=0;
    // Remove each row's constant component, retaining horizontal letter detail.
    // Reuse this current alignment's existing reference and native feature vectors.
    for(let y=2;y<54;y++){
      let count=0,sa=0,sb=0;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;count++;sa+=pair.reference[i];sb+=pair.feature[i];}
      if(count<2)continue;const ma=sa/count,mb=sb/count;
      for(let x=5;x<59;x++){const i=y*64+x;if(mask&&!mask[i])continue;const u=pair.reference[i]-ma,v=pair.feature[i]-mb;aa+=u*u;bb+=v*v;ab+=u*v;n++;}
    }
    const correlation=aa>n*.01&&bb>n*.01?ab/Math.sqrt(aa*bb):-1,passed=Number.isFinite(correlation)&&correlation>=.35;
    value.rowDetailEvidence={correlation,threshold:.35,passed,source:'CURRENT_NATIVE_EXISTING_REFERENCE_FEATURES_WITHIN_ROW',cells:n};
    m7RowStats.evaluations++;m7RowStats[passed?'passed':'rejected']++;m7RowStats.elapsedMs+=performance.now()-started;m7RowStats.last={...value.rowDetailEvidence,rect:{...value.rect}};return passed;
  }

  function correlation(a,b,y1,y2){
    const validSupport=BALANCED_NATIVE_RESEARCH_ENABLED?nativeValidReferenceMasks.get(a):null;
    let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;
    for(let y=y1;y<y2;y++)for(let x=5;x<W-5;x++){const i=y*W+x;if(validSupport&&!validSupport[i])continue;const u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}
    const va=aa-sa*sa/n,vb=bb-sb*sb/n;
    return va>n*.01&&vb>n*.01?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;
  }
  function makeReferenceOnlySupport(meanReference,valid){
    const domain=new Uint8Array(W*H),seed=new Uint8Array(W*H),mask=new Uint8Array(W*H);let n=0,sum=0;
    for(let y=2;y<54;y++)for(let x=5;x<59;x++){const i=y*W+x;if(valid&&valid[i]){domain[i]=1;n++;sum+=meanReference[i];}}
    const mean=n?sum/n:Infinity;
    for(let i=0;i<seed.length;i++)if(domain[i]&&meanReference[i]>mean)seed[i]=1;
    for(let y=2;y<54;y++)for(let x=5;x<59;x++){const i=y*W+x;if(!domain[i])continue;for(let dy=-1;dy<=1&&!mask[i];dy++)for(let dx=-1;dx<=1;dx++)if(seed[(y+dy)*W+x+dx]){mask[i]=1;break;}}
    return mask;
  }
  function correlationOnReferenceSupport(a,b,y1,y2,validSupport){
    let n=0,sa=0,sb=0,aa=0,bb=0,ab=0;
    for(let y=y1;y<y2;y++)for(let x=5;x<W-5;x++){const i=y*W+x;if(validSupport&&!validSupport[i])continue;const u=a[i],v=b[i];n++;sa+=u;sb+=v;aa+=u*u;bb+=v*v;ab+=u*v;}
    const va=aa-sa*sa/n,vb=bb-sb*sb/n;
    return va>n*.01&&vb>n*.01?(ab-sa*sb/n)/Math.sqrt(va*vb):-1;
  }
  function rememberNativePair(value,reference,feature){
    if(REFERENCE_SUPPORT_RESEARCH_ENABLED)nativeSupportPairs.set(value,{reference,feature,evaluated:false,evidence:null});return value;
  }
  function copyNativePair(from,to){const pair=REFERENCE_SUPPORT_RESEARCH_ENABLED?nativeSupportPairs.get(from):null;if(pair)nativeSupportPairs.set(to,pair);return to;}
  function referenceSupportEvidence(value){
    const pair=nativeSupportPairs.get(value);if(!pair)return null;if(pair.evaluated)return pair.evidence;pair.evaluated=true;
    const mask=nativeReferenceOnlyMasks.get(pair.reference);if(!mask)return null;
    const bands=[correlationOnReferenceSupport(pair.reference,pair.feature,2,17,mask),correlationOnReferenceSupport(pair.reference,pair.feature,19,36,mask),correlationOnReferenceSupport(pair.reference,pair.feature,38,54,mask)];
    const metrics={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlationOnReferenceSupport(pair.reference,pair.feature,2,54,mask),bands,rect:{...value.rect}};
    pair.evidence={metrics,nativePassed:originalLargeNativePassed(metrics,true),maskCells:mask.reduce((n,v)=>n+v,0),source:'CURRENT_FEATURE_AND_FIXED_ORIGINAL_MEAN_REFERENCE_SUPPORT'};return pair.evidence;
  }

  async function verify(source,candidate,reference,gridFeatures=null,acceptAlignment=null,largeFeatureMode=false){
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    let best=null,position=0;
    for(const scale of [.96,1,1.04])for(const dx of [-.04,-.02,0,.02,.04])for(const dy of [-.04,-.02,0,.02,.04]){
      const featureIndex=position++;
      await checkpoint();
      const r=candidate.rect,rect={x:r.x+r.w*dx-r.w*(scale-1)/2,y:r.y+r.h*dy-r.h*(scale-1)/2,w:r.w*scale,h:r.h*scale};
      if(rect.x<0||rect.y<0||rect.x+rect.w>source.width||rect.y+rect.h>source.height)continue;
      // gridFeatures belongs only to this immutable source/candidate call.
      // References share geometry, never scores or evidence from another frame.
      const f=gridFeatures?.[featureIndex]||(largeFeatureMode?largeClickFeatures(source,rect):features(source,rect));
      if(gridFeatures)gridFeatures[featureIndex]=f;
      const bands=[correlation(reference,f,2,17),correlation(reference,f,19,36),correlation(reference,f,38,54)];
      const whole=correlation(reference,f,2,54),score=bands.reduce((a,b)=>a+b,0)/3;
      const current={score,whole,bands,rect};
      if(largeFeatureMode)m7Remember(current,reference,f);
      if(largeFeatureMode)rememberNativePair(current,reference,f);
      if(!best||score>best.score)best=current;
      // A stronger mean with a failed sentence must not hide a valid alignment.
      if(acceptedForLarge(current,acceptAlignment,largeFeatureMode))return withRawBest(current,best);
    }
    return best;
  }
  function withRawBest(selected,raw){
    let highest=raw;
    for(const value of [selected?.rawBest,raw?.rawBest])if(value&&(!highest||value.score>highest.score))highest=value;
    return highest&&highest!==selected&&highest.score>selected.score
      ? copyNativePair(selected,{...selected,rawBest:{score:highest.score,whole:highest.whole,bands:[...highest.bands],rect:{...highest.rect}}})
      : selected;
  }
  function accepted(v){return Boolean(v&&v.whole>=.60&&v.score>=.65&&v.bands.every(s=>s>=.52)&&v.bands.filter(s=>s>=.65).length>=2);}
  // Additional app acceptance is optional and synchronous. It cannot replace
  // the native glyph guard, and false must continue the current-frame search.
  function originalLargeNativePassed(value,largeFeatureMode=false){return accepted(value)||(largeFeatureMode&&BALANCED_NATIVE_RESEARCH_ENABLED&&Boolean(value&&value.whole>=.60&&value.score>=.65&&value.bands.length===3&&value.bands.every(v=>v>=.60)));}
  function acceptedForLarge(value,acceptAlignment=null,largeFeatureMode=false){
    const alphaPassed=originalLargeNativePassed(value,largeFeatureMode);
    const support=!alphaPassed&&largeFeatureMode&&REFERENCE_SUPPORT_RESEARCH_ENABLED?referenceSupportEvidence(value):null;
    const nativePassed=alphaPassed||support?.nativePassed===true;
    return nativePassed&&m7RowPass(value,largeFeatureMode)&&(!acceptAlignment||acceptAlignment(acceptedNativeView(value))===true);
  }

  const largeIds=['tilted','flat'].flatMap(f=>(f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6]).map(a=>'large-click-'+f+'-'+a)).concat(M400_NARROW_ENABLED?['large-click-flat-narrow--12']:[]);
  const risingId='large-click-rising-0',risingAngle=30;
  let largeReferences=null,largeLoading=null;
  async function initLarge(){
    if(largeReferences)return largeReferences;
    if(!largeLoading)largeLoading=(async()=>{
      const map=new Map();for(const f of ['tilted','flat','rising']){
        const img=new Image();img.src=new URL('../assets/local-templates/oct-click-'+f+(f==='rising'?'-fixed':'')+'.png',scriptBase).href;await img.decode();
        for(const angle of (f==='rising'?[0]:f==='flat'&&M400_POSE_ENABLED?[-12,-6,0,6]:[-6,0,6])){
          const refs=[];for(const fine of [-2,0,2]){
            const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
            const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate((angle+fine)*Math.PI/180);ctx.drawImage(img,-c.width/2,-c.height/2);
            refs.push(largeClickFeatures(c,{x:0,y:0,w:c.width,h:c.height},true));
          }map.set('large-click-'+f+'-'+angle,refs);
        }
      }if(M400_NARROW_ENABLED)map.set('large-click-flat-narrow--12',map.get('large-click-flat--12'));return largeReferences=map;
    })().catch(e=>{largeLoading=null;throw e;});return largeLoading;
  }
  // Share the exact existing native-pixel verification and refinement grid
  // between full localization and a later frame's bounded location hint.
  // One bounded current-pixel alignment fallback, local and disabled by default.
  const nativeAlignmentStats={calls:0,featureExtractions:0,nativeEvaluations:0,elapsedMs:0,passed:0,failed:0,last:null};
  async function nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment){
    const started=performance.now(),seed=candidate.rect;
    const stats={featureExtractions:0,nativeEvaluations:0,skippedOutOfBounds:0,phase:'coarse-cell',passed:false,
      frameMarker:native.auditFrameMarker?{kind:native.auditFrameMarker.kind,value:native.auditFrameMarker.value}:null,
      seedRect:{...seed},referenceVariants:order.length};
    const inside=r=>r.x>=0&&r.y>=0&&r.x+r.w<=native.width&&r.y+r.h<=native.height;
    const checkpoint=window.MAlertContourWorker.makeYieldPoint();
    // Features are shared across references only inside this current invocation.
    const featuresByPosition=[],visited=new Set();
    const key=(index,r)=>index+':'+[r.x,r.y,r.w,r.h].map(v=>v.toPrecision(15)).join(':');
    const evaluate=(ref,index,rect,feature)=>{
      const bands=[correlation(ref,feature,2,17),correlation(ref,feature,19,36),correlation(ref,feature,38,54)];
      stats.nativeEvaluations++;
      return m7Remember(rememberNativePair({score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,feature,2,54),bands,rect,referenceIndex:index},ref,feature),ref,feature);
    };
    let best=null;
    try{
      // Existing fine-grid spacing, now centered on the original current coarse
      // cell rather than only the previous 75-grid winner. At most 27*3 checks.
      for(const {ref,index} of order){
        let position=0;
        for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
          const ordinal=position++;await checkpoint();
          const rect={x:seed.x+seed.w*dx-seed.w*(scale-1)/2,y:seed.y+seed.h*dy-seed.h*(scale-1)/2,w:seed.w*scale,h:seed.h*scale};
          if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
          let feature=featuresByPosition[ordinal];
          if(!feature){
            feature=scale===1&&dx===0&&dy===0?anchorFeatures:largeClickFeatures(native,rect);
            if(!(scale===1&&dx===0&&dy===0))stats.featureExtractions++;
            featuresByPosition[ordinal]=feature;
          }
          visited.add(key(index,rect));
          const value=evaluate(ref,index,rect,feature);
          if(!best||value.score>best.score)best=value;
          if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};stats.referenceIndex=index;return withRawBest(copyNativePair(value,{...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'coarse-cell'}),best);}
        }
      }
      if(!best)return null;
      // A quarter native pixel, capped at one eighth of a 64x56 feature cell.
      // The same rule is applied to every current candidate; no known answer,
      // saved score, media name, frame time or fixed screen position is used.
      const center=best.rect,ref=order.find(e=>e.index===best.referenceIndex)?.ref;
      if(!ref)return null;
      const stepX=Math.min(.25,center.w/(W*8)),stepY=Math.min(.25,center.h/(H*8));
      stats.phase='subpixel';stats.center={...center};stats.stepX=stepX;stats.stepY=stepY;stats.referenceIndex=best.referenceIndex;
      const referenceIndex=best.referenceIndex;
      for(const ix of [-2,-1,0,1,2])for(const iy of [-2,-1,0,1,2]){
        if(ix===0&&iy===0)continue;await checkpoint();
        const rect={...center,x:center.x+ix*stepX,y:center.y+iy*stepY};
        if(!inside(rect)){stats.skippedOutOfBounds++;continue;}
        if(visited.has(key(referenceIndex,rect)))continue;visited.add(key(referenceIndex,rect));
        const feature=largeClickFeatures(native,rect);stats.featureExtractions++;
        const value=evaluate(ref,referenceIndex,rect,feature);
        if(value.score>best.score)best=value;
        if(acceptedForLarge(value,acceptAlignment,true)){stats.passed=true;stats.selected={...rect};return withRawBest(copyNativePair(value,{...value,researchNativeAlignmentFallback:true,nativeAlignmentPhase:'subpixel'}),best);}
      }
      return null;
    }finally{
      stats.elapsedMs=performance.now()-started;
      nativeAlignmentStats.calls++;nativeAlignmentStats.featureExtractions+=stats.featureExtractions;
      nativeAlignmentStats.nativeEvaluations+=stats.nativeEvaluations;nativeAlignmentStats.elapsedMs+=stats.elapsedMs;
      nativeAlignmentStats[stats.passed?'passed':'failed']++;nativeAlignmentStats.last=stats;
    }
  }
  async function verifyLargeCandidate(native,candidate,acceptAlignment=null){
      const refs=largeReferences.get(candidate.id)||[],order=refs.map((ref,index)=>({ref,index}));
      if(Number.isInteger(candidate.referenceIndex))order.sort((a,b)=>(b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex));
      // Every confirmation reads fresh pixels. An exact previous position is
      // tried before any neighborhood search; it still passes all four gates.
      const anchorFeatures=largeClickFeatures(native,candidate.rect);
      for(const entry of order){
        const {ref,index}=entry;
        const bands=[correlation(ref,anchorFeatures,2,17),correlation(ref,anchorFeatures,19,36),correlation(ref,anchorFeatures,38,54)];
        const exact={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,anchorFeatures,2,54),bands,rect:{...candidate.rect},referenceIndex:index};
        m7Remember(exact,ref,anchorFeatures);
        rememberNativePair(exact,ref,anchorFeatures);
        entry.anchorScore=exact.score;
        if(acceptedForLarge(exact,acceptAlignment,true))return exact;
      }
      // Ordering only: all variants remain available and every refinement
      // reads fresh pixels. Prefer the current anchor's closest text pose.
      order.sort((a,b)=>((b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex))||b.anchorScore-a.anchorScore);
      const gridFeatures=[]; // At most 75 independent feature vectors; released with this candidate.
      let best=null;for(const {ref,index} of order){
        let v=await verify(native,candidate,ref,gridFeatures,acceptAlignment,true);
        if(v){v.referenceIndex=index;if(acceptedForLarge(v,acceptAlignment,true))return v;}
        if(v&&v.score>.50){
          const anchor=v.rect;
          for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
            const rect={x:anchor.x+anchor.w*dx-anchor.w*(scale-1)/2,y:anchor.y+anchor.h*dy-anchor.h*(scale-1)/2,w:anchor.w*scale,h:anchor.h*scale};
            if(rect.x<0||rect.y<0||rect.x+rect.w>native.width||rect.y+rect.h>native.height)continue;
            const f=largeClickFeatures(native,rect),bands=[correlation(ref,f,2,17),correlation(ref,f,19,36),correlation(ref,f,38,54)],score=bands.reduce((a,b)=>a+b,0)/3;
            const current={score,bands,whole:correlation(ref,f,2,54),rect,referenceIndex:index};
            m7Remember(current,ref,f);
            rememberNativePair(current,ref,f);
            if(score>v.score)v=current;
            if(acceptedForLarge(current,acceptAlignment,true))return withRawBest(current,v);
          }
        }
        if(v&&(!best||v.score>best.score))best=v;
      }
      if(NATIVE_ALIGNMENT_RESEARCH_ENABLED && best?.score>.50){
        const aligned=await nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment);
        if(aligned)return aligned;
      }
      return best;
  }

  function acceptedNativeView(value){
    if(!value)return null;
    const pair=nativeSupportPairs.get(value),alphaPassed=originalLargeNativePassed(value,true),support=pair?.evidence;
    if((!alphaPassed&&support?.nativePassed!==true)||!m7RowPass(value,true))return null;
    let referenceId=null,referenceIndex=value.referenceIndex;
    if(pair)for(const [id,refs] of largeReferences){const index=refs.indexOf(pair.reference);if(index>=0){referenceId=id;referenceIndex=index;break;}}
    const alpha={score:value.score,whole:value.whole,bands:[...value.bands],rect:{...value.rect}};
    const metrics=alphaPassed?alpha:support.metrics;
    return {...value,score:metrics.score,whole:metrics.whole,bands:[...metrics.bands],rect:{...value.rect},referenceIndex,
      researchLargeNativePrecisionFallback:true,
      nativeAcceptedEvidence:{path:alphaPassed?'CHANNEL_MAX_MEDIAN_ALPHA_AFTER_ORIGINAL_RGB_FAILURE':'CHANNEL_MAX_MEDIAN_REFERENCE_SUPPORT_AFTER_ORIGINAL_RGB_FAILURE',
        score:metrics.score,whole:metrics.whole,bands:[...metrics.bands],rect:{...value.rect},referenceId,referenceIndex,
        originalMedianAlpha:alpha,rawMedianAlphaBest:value.rawBest?structuredClone(value.rawBest):null,
        supportSource:alphaPassed?null:'ORIGINAL_MEAN_REFERENCE_DOMAIN_MEAN_PLUS_ONE_3X3_DILATION',
        currentNativePixels:true,thresholdsUnchanged:true}};
  }
  return Object.freeze({
    async scoreSeedAnchor(native,candidate){
      await initLarge();
      const r=candidate.rect,refs=largeReferences.get(candidate.id)||[];
      if(!r||![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0||r.x<0||r.y<0||r.x+r.w>native.width||r.y+r.h>native.height)return {valid:false,reason:'OUT_OF_BOUNDS_OR_INVALID_RECT',best:null,references:[]};
      const feature=largeClickFeatures(native,r),references=[];let best=null;
      for(let index=0;index<refs.length;index++){
        const ref=refs[index],mask=nativeReferenceOnlyMasks.get(ref);
        if(!mask){references.push({referenceIndex:index,valid:false,reason:'NO_EXISTING_REFERENCE_MASK'});continue;}
        const bands=[correlationOnReferenceSupport(ref,feature,2,17,mask),correlationOnReferenceSupport(ref,feature,19,36,mask),correlationOnReferenceSupport(ref,feature,38,54,mask)];
        const whole=correlationOnReferenceSupport(ref,feature,2,54,mask),score=bands.reduce((a,b)=>a+b,0)/3;
        const valid=[whole,score,...bands].every(Number.isFinite)&&whole!==-1&&bands.every(v=>v!==-1);
        const value={valid,score,whole,bands,rect:{...r},referenceId:candidate.id,referenceIndex:index,maskCells:mask.reduce((n,v)=>n+v,0)};
        references.push(value);if(valid&&(!best||score>best.score))best=value;
      }
      return {valid:!!best,reason:best?null:'NO_VALID_EXISTING_REFERENCE_ANCHOR',best,references,featureExtractions:1,referenceCount:refs.length,acceptanceEvaluated:false};
    },
    async verify(native,candidate,acceptAlignment=null){
      await initLarge();
      let appAccepted=false;
      const callback=acceptAlignment?view=>{const ok=acceptAlignment(view)===true;if(ok)appAccepted=true;return ok;}:null;
      const value=await verifyLargeCandidate(native,candidate,callback),view=acceptedNativeView(value);
      // App-rejected native results must not become success through this interface.
      return view&&(!acceptAlignment||appAccepted)?view:null;
    },
    status:()=>({median:MEDIAN_NATIVE_RESEARCH_ENABLED,referenceSupport:REFERENCE_SUPPORT_RESEARCH_ENABLED,nativeAlignment:structuredClone(nativeAlignmentStats),rowDetail:{enabled:M7_ROW_DETAIL_ENABLED,threshold:.35,...structuredClone(m7RowStats)}})
  });

  })();
  const RISING_DEFER_NATIVE_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_RISING_DEFER_NATIVE_EXPERIMENT===true;
  const risingDeferStats={eligible:0,deferred:0,resumed:0,baseWins:0,resumeWins:0,allFailed:0,rows:[],dropped:0};
  function risingDeferRecord(row){const record={...row,at:performance.now()};if(risingDeferStats.rows.length<64)risingDeferStats.rows.push(record);else risingDeferStats.dropped++;try{window.__M24_RISING_STAGE?.(structuredClone(record));}catch(_){}}
  window.MAlertRisingDeferredNativeResearch=Object.freeze({enabled:()=>RISING_DEFER_NATIVE_ENABLED,status:()=>({enabled:RISING_DEFER_NATIVE_ENABLED,policy:'Original rising top2 bases first, then their deferred M8B only; selection priority changes',...structuredClone(risingDeferStats)})});
  const precisionFallbackStats={calls:0,originalMeanAccepted:0,originalMeanAppRejected:0,fallbackCalls:0,fallbackAccepted:0,fallbackRejected:0,last:null};
  async function verifyLargeCandidate(native,candidate,acceptAlignment=null){
    return verifyLargeCandidateBase(native,candidate,acceptAlignment);
  }
  async function verifyLargeCandidateBase(native,candidate,acceptAlignment=null,deferred=null){
    if(!PRECISION_FALLBACK_RESEARCH_ENABLED)return verifyLargeCandidateMean(native,candidate,acceptAlignment);
    let meanNativePassedWithCallback=false;
    const meanCallback=acceptAlignment?value=>{meanNativePassedWithCallback=true;return acceptAlignment(value)===true;}:null;
    const original=await verifyLargeCandidateMean(native,candidate,meanCallback);
    precisionFallbackStats.calls++;
    if(acceptedForLarge(original,null,true)){
      precisionFallbackStats.originalMeanAccepted++;return original;
    }
    // If original native text passed but the app rejected it, preserve that failure.
    if(meanNativePassedWithCallback){precisionFallbackStats.originalMeanAppRejected++;return original;}
    precisionFallbackStats.fallbackCalls++;
    const started=performance.now();
    let supplemental=await largeNativePrecisionFallback.verify(native,candidate,acceptAlignment);
    if(!supplemental&&m39ChannelMaxEnabled&&candidate.id===risingId){
      const maxStarted=performance.now();m39ChannelMaxStats.calls++;
      try{supplemental=await m39ChannelMaxPrecisionFallback.verify(native,candidate,acceptAlignment);
        m39ChannelMaxStats[supplemental?'passed':'failed']++;m39ChannelMaxStats.last={candidateId:candidate.id,seed:{...candidate.rect},currentSize:[native.width,native.height],accepted:supplemental?structuredClone(supplemental.nativeAcceptedEvidence):null};
      }finally{m39ChannelMaxStats.elapsedMs+=performance.now()-maxStarted;}
    }
    const passed=!!supplemental;
    precisionFallbackStats[passed?'fallbackAccepted':'fallbackRejected']++;
    precisionFallbackStats.last={candidateId:candidate.id,seed:{...candidate.rect},nativeSize:[native.width,native.height],
      frameMarker:native.auditFrameMarker?{kind:native.auditFrameMarker.kind,value:native.auditFrameMarker.value}:null,
      originalMeanReturned:original?{whole:original.whole,score:original.score,bands:[...original.bands],rect:{...original.rect},referenceIndex:original.referenceIndex}:null,
      acceptedEvidence:passed?structuredClone(supplemental.nativeAcceptedEvidence):null,passed,elapsedMs:performance.now()-started};
    // Preserve every existing precision success before the separate local extension.
    if(supplemental)return supplemental;
    if(!M8B_SECOND_ROOT&&!M8B_ASPECT)return original;
    if(deferred&&original){
      // Private lexical tuple only: keep exact original object and callback alive.
      deferred.enqueue({native,candidate,original,acceptAlignment});return original;
    }
    const raster=await m8bNativeFallback(native,candidate,original,acceptAlignment);
    return raster||original;
  }
  async function verifyLargeCandidateMean(native,candidate,acceptAlignment=null){
      const refs=largeReferences.get(candidate.id)||[],order=refs.map((ref,index)=>({ref,index}));
      if(Number.isInteger(candidate.referenceIndex))order.sort((a,b)=>(b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex));
      // Every confirmation reads fresh pixels. An exact previous position is
      // tried before any neighborhood search; it still passes all four gates.
      const anchorFeatures=largeClickFeatures(native,candidate.rect);
      for(const entry of order){
        const {ref,index}=entry;
        const bands=[correlation(ref,anchorFeatures,2,17),correlation(ref,anchorFeatures,19,36),correlation(ref,anchorFeatures,38,54)];
        const exact={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,anchorFeatures,2,54),bands,rect:{...candidate.rect},referenceIndex:index};
        m7Remember(exact,ref,anchorFeatures);
        entry.anchorScore=exact.score;
        if(acceptedForLarge(exact,acceptAlignment,true))return exact;
      }
      // Ordering only: all variants remain available and every refinement
      // reads fresh pixels. Prefer the current anchor's closest text pose.
      order.sort((a,b)=>((b.index===candidate.referenceIndex)-(a.index===candidate.referenceIndex))||b.anchorScore-a.anchorScore);
      const gridFeatures=[]; // At most 75 independent feature vectors; released with this candidate.
      let best=null;for(const {ref,index} of order){
        let v=await verify(native,candidate,ref,gridFeatures,acceptAlignment,true);
        if(v){v.referenceIndex=index;if(acceptedForLarge(v,acceptAlignment,true))return v;}
        if(v&&v.score>.50){
          const anchor=v.rect;
          for(const scale of [.985,1,1.015])for(const dx of [-.01,0,.01])for(const dy of [-.01,0,.01]){
            const rect={x:anchor.x+anchor.w*dx-anchor.w*(scale-1)/2,y:anchor.y+anchor.h*dy-anchor.h*(scale-1)/2,w:anchor.w*scale,h:anchor.h*scale};
            if(rect.x<0||rect.y<0||rect.x+rect.w>native.width||rect.y+rect.h>native.height)continue;
            const f=largeClickFeatures(native,rect),bands=[correlation(ref,f,2,17),correlation(ref,f,19,36),correlation(ref,f,38,54)],score=bands.reduce((a,b)=>a+b,0)/3;
            const current={score,bands,whole:correlation(ref,f,2,54),rect,referenceIndex:index};
            m7Remember(current,ref,f);
            if(score>v.score)v=current;
            if(acceptedForLarge(current,acceptAlignment,true))return withRawBest(current,v);
          }
        }
        if(v&&(!best||v.score>best.score))best=v;
      }
      if(NATIVE_ALIGNMENT_RESEARCH_ENABLED && best?.score>.50){
        const aligned=await nativeAlignmentFallback(native,candidate,order,anchorFeatures,acceptAlignment);
        if(aligned)return aligned;
      }
      return best;
  }

  // One retrieval-only extra after EVERY original large path has failed.
  // No release activation: explicit loopback switch, frozen at load, default OFF.
  const LARGE_DIVERSE_EXTRA_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LARGE_DIVERSE_EXTRA_EXPERIMENT===true;
  // Retrieval-only local extension; both switches are captured once, default OFF.
  const DIVERSE_EXTRA_OVERLAP_ENABLED=LARGE_DIVERSE_EXTRA_ENABLED&&(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_DIVERSE_EXTRA_OVERLAP_EXPERIMENT===true;
  const DIVERSE_EXTRA_FAMILY_ENABLED=LARGE_DIVERSE_EXTRA_ENABLED&&(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_DIVERSE_EXTRA_FAMILY_EXPERIMENT===true;
  let diverseFamilySelection=null;
  function diverseFixedBasis(id){
    const value=String(id||'');
    return /^large-click-.+-[-+]?\d+(?:\.\d+)?$/.test(value)?value.replace(/-[-+]?\d+(?:\.\d+)?$/,''):null;
  }
  let diverseOverlapSelection=null;
  function diverseSamePoseOverlap(a,b){
    if(a.id!==b.id)return null;
    const x=a.rect,y=b.rect,ratioW=Math.max(x.w/y.w,y.w/x.w),ratioH=Math.max(x.h/y.h,y.h/x.h);
    const intersection=Math.max(0,Math.min(x.x+x.w,y.x+y.w)-Math.max(x.x,y.x))*Math.max(0,Math.min(x.y+x.h,y.y+y.h)-Math.max(x.y,y.y));
    const overlapMinArea=intersection/Math.min(x.w*x.h,y.w*y.h);
    return overlapMinArea>=.5&&ratioW<=1.5&&ratioH<=1.5?{overlapMinArea,ratioW,ratioH}:null;
  }
  const largeDiverseExtraStats={calls:0,checks:0,passed:0,rejected:0,elapsedMs:0,last:null};
  function diverseExtraRectValid(r){return Boolean(r&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.w>0&&r.h>0);}
  function selectDiverseLargeExtra(pool,floor,searchWidth){
    const ranked=pool.filter(c=>c.score>=floor).sort((a,b)=>b.score-a.score);
    const old=ranked.slice(0,5);
    const checkedBases=DIVERSE_EXTRA_FAMILY_ENABLED?new Set(old.map(c=>diverseFixedBasis(c.id)).filter(Boolean)):null;
    let firstEligible=null;
    if(DIVERSE_EXTRA_FAMILY_ENABLED)diverseFamilySelection={selectedRank:null,selectedId:null,selectedBasis:null,checkedBases:[...checkedBases],reason:'no-eligible-extra'};
    const overlapAudit=DIVERSE_EXTRA_OVERLAP_ENABLED?{selectedRank:null,selectedId:null,rejected:[],eligiblePool:ranked.length}:null;
    if(overlapAudit)diverseOverlapSelection=overlapAudit;
    if(old.length!==5||old.some(c=>!diverseExtraRectValid(c.rect)))return null;
    // Same peak suppression as existing coarse worker: rectangular spacing,
    // max(3 feature pixels, .35 * smaller side). Cross-scale minimum is symmetric.
    const scaleBack=searchWidth/384;
    for(let i=5;i<ranked.length;i++){
      const c=ranked[i];if(!diverseExtraRectValid(c.rect))continue;
      if(old.some(a=>{const spacing=Math.max(3*scaleBack,.35*Math.min(c.rect.w,c.rect.h,a.rect.w,a.rect.h));return Math.abs(c.rect.x-a.rect.x)<spacing&&Math.abs(c.rect.y-a.rect.y)<spacing;})){
        if(overlapAudit)overlapAudit.rejected.push({rank:i+1,id:c.id,reason:'original-top-left-proximity'});continue;
      }
      if(DIVERSE_EXTRA_OVERLAP_ENABLED){
        let duplicate=null;for(let index=0;index<old.length;index++){const metrics=diverseSamePoseOverlap(c,old[index]);if(metrics){duplicate={topRank:index+1,...metrics};break;}}
        if(duplicate){overlapAudit.rejected.push({rank:i+1,id:c.id,reason:'same-exact-pose-overlap',...duplicate});continue;}
      }
      if(DIVERSE_EXTRA_FAMILY_ENABLED){
        const selected={candidate:c,rank:i+1},basis=diverseFixedBasis(c.id);
        if(!firstEligible)firstEligible=selected;
        if(!basis||checkedBases.has(basis))continue;
        diverseFamilySelection={selectedRank:i+1,selectedId:c.id,selectedBasis:basis,checkedBases:[...checkedBases],reason:'unexamined-fixed-basis'};
      }
      if(overlapAudit){overlapAudit.selectedRank=i+1;overlapAudit.selectedId=c.id;}
      return {candidate:c,rank:i+1};
    }
    if(DIVERSE_EXTRA_FAMILY_ENABLED&&firstEligible){
      const {candidate:c,rank}=firstEligible;
      diverseFamilySelection={selectedRank:rank,selectedId:c.id,selectedBasis:diverseFixedBasis(c.id),checkedBases:[...checkedBases],reason:'existing-first-eligible-fallback'};
      if(overlapAudit){overlapAudit.selectedRank=rank;overlapAudit.selectedId=c.id;}
      return firstEligible;
    }
    return null;
  }
  async function tryDiverseLargeExtra(search,native,coarse,floor,acceptCandidate,existing){
    if(!LARGE_DIVERSE_EXTRA_ENABLED||existing.matched)return existing;
    largeDiverseExtraStats.calls++;const started=performance.now();
    const selected=selectDiverseLargeExtra(coarse.candidates,floor,search.width);
    largeDiverseExtraStats.last={rank:selected?.rank??null,rect:selected?{...selected.candidate.rect}:null,coarseScore:selected?.candidate.score??null,checked:false,passed:false,elapsedMs:0};
    if(!selected)return existing;
    const c=selected.candidate,ratio=native.width/search.width;
    const candidate={...c,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
    const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,c.id,search,ratio))===true:null;
    largeDiverseExtraStats.checks++;largeDiverseExtraStats.last.checked=true;
    try{
      const best=await verifyLargeCandidate(native,candidate,acceptAlignment);
      if(!best){largeDiverseExtraStats.rejected++;return existing;}
      const item={...best,id:c.id,coarseScore:c.score,matched:acceptedForLarge(best,acceptAlignment,true),rect:{x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio}};
      const candidates=[...existing.candidates,item];
      largeDiverseExtraStats.last.passed=item.matched;
      if(item.matched){largeDiverseExtraStats.passed++;return {...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)};}
      largeDiverseExtraStats.rejected++;return {...existing,candidates};
    }finally{const elapsed=performance.now()-started;largeDiverseExtraStats.elapsedMs+=elapsed;largeDiverseExtraStats.last.elapsedMs=elapsed;}
  }

  async function analyzeLarge(search,native=search,options={}){
    await initLarge();
    const acceptCandidate=typeof options.acceptCandidate==='function'?options.acceptCandidate:null;
    // Inspect the existing rising pose first; its native and app guards are unchanged.
    // Other large families retain their original search when this pose does not match.
    const sidecarContext=newRisingSidecarContext(),risingOptions=sidecarContext?{...options,risingSeedSidecarContext:sidecarContext}:options;
    const rising=await analyzeRising(search,native,null,risingOptions);
    if(rising.matched)return {...rising,candidates:[...rising.candidates]};
    const coarse=await targeted(search,{ids:largeIds,maxCandidates:2});
    const ratio=native.width/search.width,candidates=[];
    // Coarse retrieval is deliberately separate from the unchanged three-band
    // acceptance gate. Texture/color alone can never produce a detection.
    // OPT29 local retrieval research: the final native/app guards are unchanged.
    // Disabled unless explicitly selected by the local test harness.
    const largeCandidateFloor=window.__MALERT_RESEARCH_CONFIG?.lowerLargeRetrievalFloor===true?.32:.34;
    for(const c of coarse.candidates.filter(c=>c.score>=largeCandidateFloor).sort((a,b)=>b.score-a.score).slice(0,5)){
      const candidate={...c,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
      const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,c.id,search,ratio))===true:null;
      const best=await verifyLargeCandidate(native,candidate,acceptAlignment);
      if(!best)continue;
      const item={...best,id:c.id,coarseScore:c.score,matched:acceptedForLarge(best,acceptAlignment,true),rect:{x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio}};
      candidates.push(item);if(item.matched)return {...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)};
    }
    const existingFailure={matched:false,candidates:[...candidates,...rising.candidates]};
    if(!SMALL_RISING_SCALE_RESEARCH_ENABLED){
      if(!LARGE_DIVERSE_EXTRA_ENABLED)return tryRisingSeedSidecar(search,native,options,sidecarContext,existingFailure);
      const originalResult=await tryRisingSeedSidecar(search,native,options,sidecarContext,existingFailure);
      return tryDiverseLargeExtra(search,native,coarse,largeCandidateFloor,acceptCandidate,originalResult);
    }
    // Preserve every old rising/flat/tilted success before extending size coverage.
    const small=await analyzeRising(search,native,null,risingOptions,true);
    const combined={...small,candidates:[...existingFailure.candidates,...small.candidates]};
    if(!LARGE_DIVERSE_EXTRA_ENABLED)return tryRisingSeedSidecar(search,native,options,sidecarContext,combined);
    const originalResult=await tryRisingSeedSidecar(search,native,options,sidecarContext,combined);
    return tryDiverseLargeExtra(search,native,coarse,largeCandidateFloor,acceptCandidate,originalResult);
  }

  function deskew(source){
    const c=document.createElement('canvas');c.width=source.width;c.height=source.height;
    const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(risingAngle*Math.PI/180);
    ctx.drawImage(source,-c.width/2,-c.height/2);if(AFFINE_NATIVE_RESEARCH_ENABLED)affineNativeSources.set(c,source);return c;
  }
  function originalRect(r,source){
    const a=-risingAngle*Math.PI/180,cos=Math.cos(a),sin=Math.sin(a),cx=source.width/2,cy=source.height/2;
    const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]].map(([x,y])=>({x:cx+(x-cx)*cos-(y-cy)*sin,y:cy+(x-cx)*sin+(y-cy)*cos}));
    const x=Math.max(0,Math.min(...points.map(p=>p.x))),y=Math.max(0,Math.min(...points.map(p=>p.y)));
    return {x,y,w:Math.min(source.width,Math.max(...points.map(p=>p.x)))-x,h:Math.min(source.height,Math.max(...points.map(p=>p.y)))-y};
  }
  // One bounded size band below the existing rising scales [.8,.9,1,1.1,1.2].
  // Input density increases only in this fallback; prepared templates/native pixels stay intact.
  // Existing minimum .8 defines one geometric step: 384/.8=480, effective .64/.72.
  const risingBaseAnalysisWidth=384,risingMinimumScale=.8;
  const risingSmallAnalysisWidth=Math.round(risingBaseAnalysisWidth/risingMinimumScale);
  const risingSmallTemplateScales=Object.freeze([.8,.9,1,1.1,1.2].filter(scale=>scale*risingMinimumScale<risingMinimumScale));
  async function smallRisingCoarse(input,context=null){
    const candidates=[];
    for(const templateScale of risingSmallTemplateScales){
      const result=await targeted(input,{ids:[risingId],maxCandidates:2,templateScale,analysisWidth:risingSmallAnalysisWidth,...(context?{retainRisingSeedSidecar:true}:{})});
      retainRisingSidecars(context,result);
      candidates.push(...result.candidates);
    }
    return candidates.filter(c=>c.score>=.40).sort((a,b)=>b.score-a.score).slice(0,2);
  }

  async function analyzeRising(search,native=search,hint=null,options={},smallScale=false){
    const acceptCandidate=typeof options.acceptCandidate==='function'?options.acceptCandidate:null;
    const input=deskew(search),pixels=native===search?input:deskew(native),ratio=native.width/search.width,candidates=[];
    const sidecarContext=RISING_SEED_SIDECAR_ENABLED?options.risingSeedSidecarContext:null;
    if(sidecarContext)sidecarContext.pixels=pixels;
    const coarse=smallScale?await smallRisingCoarse(input,sidecarContext):hint?[{id:risingId,score:1,rect:hint.poseRect}]:await originalRisingCoarse(input,sidecarContext);
    const deferEligible=RISING_DEFER_NATIVE_ENABLED&&!smallScale&&!hint&&coarse.length===2;
    if(!deferEligible){
    for(const c of coarse){
      const candidate={id:risingId,referenceIndex:hint?.referenceIndex,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
      const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,risingId,search,ratio,true))===true:null;
      const best=await verifyLargeCandidate(pixels,candidate,acceptAlignment);if(!best)continue;
      const poseRect={x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio};
      const item={...best,id:risingId,coarseScore:c.score,matched:acceptedForLarge(best,acceptAlignment,true),rejection:guideRejection(best),poseRect,poseAngle:risingAngle,rect:originalRect(poseRect,search),...(smallScale?{researchSmallRisingScale:true,coarseAnalysisWidth:risingSmallAnalysisWidth,templateScale:c.templateScale,effectiveTemplateScale:c.templateScale*risingMinimumScale}:{})};
      candidates.push(item);if(item.matched)return {...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)};
    }
    }else{
      risingDeferStats.eligible++;
      const pending=[],failureSlots=new Map();let rank=0;
      const record=row=>risingDeferRecord({...row,scope:'original-rising-top2',sourceMarker:search.auditFrameMarker?{...search.auditFrameMarker}:null,posePixelMarker:pixels.auditFrameMarker?{...pixels.auditFrameMarker}:null,sourceMarkerMeaning:'Actual original search canvas marker; pose marker separately nullable'});
      // Exact existing item/coordinate/adaptiveHint construction, one candidate at a time.
      const makeItem=(best,c,acceptAlignment)=>{
      const poseRect={x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio};
      const item={...best,id:risingId,coarseScore:c.score,matched:acceptedForLarge(best,acceptAlignment,true),rejection:guideRejection(best),poseRect,poseAngle:risingAngle,rect:originalRect(poseRect,search),...(smallScale?{researchSmallRisingScale:true,coarseAnalysisWidth:risingSmallAnalysisWidth,templateScale:c.templateScale,effectiveTemplateScale:c.templateScale*risingMinimumScale}:{})};
        return item;
      };
      for(const c of coarse){
        const index=rank++,candidate={id:risingId,referenceIndex:hint?.referenceIndex,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
        const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,risingId,search,ratio,true))===true:null;
        const deferred={enqueue:tuple=>{pending.push({index,c,tuple});risingDeferStats.deferred++;}};
        record({scope:'original-rising-top2',stage:'base-start',rank:index+1,seed:{...candidate.rect}});
        let best;try{best=await verifyLargeCandidateBase(pixels,candidate,acceptAlignment,deferred);}catch(error){record({scope:'original-rising-top2',stage:'base-throw',rank:index+1,errorName:error?.name});throw error;}
        record({scope:'original-rising-top2',stage:'base-end',rank:index+1,returned:!!best,score:best?.score??null,deferred:pending.some(p=>p.index===index)});
        if(!best)continue;
        const item=makeItem(best,c,acceptAlignment);failureSlots.set(index,candidates.length);candidates.push(item);
        if(item.matched){risingDeferStats.baseWins++;record({stage:'existing-base',selectedRank:index+1,deferredRanks:pending.map(p=>p.index+1),priorityChanged:pending.some(p=>p.index<index),meaning:'Earlier M8B candidate was deferred, not evaluated; no claim it would pass/fail'});return {...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)};}
      }
      for(const p of pending){
        risingDeferStats.resumed++;
        const {native:current,candidate,original,acceptAlignment}=p.tuple;
        record({scope:'original-rising-top2',stage:'deferred-start',rank:p.index+1,seed:{...candidate.rect}});
        let raster;try{raster=await m8bNativeFallback(current,candidate,original,acceptAlignment);}catch(error){record({scope:'original-rising-top2',stage:'deferred-throw',rank:p.index+1,errorName:error?.name});throw error;}
        if(!raster){record({stage:'deferred-M8B',selectedRank:p.index+1,passed:false});continue;}
        const item=makeItem(raster,p.c,acceptAlignment),slot=failureSlots.get(p.index);
        if(!Number.isInteger(slot))throw new Error("Deferred candidate slot unavailable");candidates[slot]=item;
        record({stage:'deferred-M8B',selectedRank:p.index+1,passed:item.matched,baseBothFailed:true,rect:{...item.rect}});
        if(item.matched){risingDeferStats.resumeWins++;return {...item,threshold:.65,candidates,adaptiveHint:largeHint(item,search,native)};}
      }
      risingDeferStats.allFailed++;
    }
    return {matched:false,candidates};
  }

  const HINT_ANCHOR_FIRST_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_HINT_ANCHOR_FIRST_EXPERIMENT===true;
  const hintAnchorStats={calls:0,meanReferences:0,rootReferences:0,meanPassed:0,rootPassed:0,failed:0,errors:0,elapsedMs:0,last:null};
  function hintAnchorExactValue(ref,feature,rect,index){
    const bands=[correlation(ref,feature,2,17),correlation(ref,feature,19,36),correlation(ref,feature,38,54)];
    const exact={score:bands.reduce((a,b)=>a+b,0)/3,whole:correlation(ref,feature,2,54),bands,rect:{...rect},referenceIndex:index};
    return m7Remember(exact,ref,feature);
  }
  function tryHintAnchorFirst(search,native,hint){
    const start=performance.now(),ratio=native.width/search.width,r=hint.rect,
      rect={x:r.x*ratio,y:r.y*ratio,w:r.w*ratio,h:r.h*ratio},refs=largeReferences.get(hint.id)||[];
    const audit={startedAt:start,anchorCurrentSource:'CURRENT_NATIVE_EXACT_HINT_RECT',sourceMarker:native.auditFrameMarker?{...native.auditFrameMarker}:null,
      hintId:hint.id,rect:{...rect},branch:null,meanScores:[],rootScores:[],privatePairEstablished:false,passed:false,firstFailure:null};
    hintAnchorStats.calls++;hintAnchorStats.last=audit;
    try{
      if(refs.length!==3){audit.firstFailure='reference-count';return null;}
      const feature=largeClickFeatures(native,rect),order=refs.map((ref,index)=>({ref,index}));
      if(Number.isInteger(hint.referenceIndex))order.sort((a,b)=>(b.index===hint.referenceIndex)-(a.index===hint.referenceIndex));
      let meanBest=null,selected=null;
      for(const {ref,index} of order){
        const exact=hintAnchorExactValue(ref,feature,rect,index);hintAnchorStats.meanReferences++;audit.meanScores.push({referenceIndex:index,score:exact.score,whole:exact.whole,bands:[...exact.bands]});
        if(!meanBest||exact.score>meanBest.score)meanBest=exact;
        if(acceptedForLarge(exact,null,true)){selected=exact;audit.branch='existing-mean-exact-anchor';hintAnchorStats.meanPassed++;break;}
      }
      // Preserve the existing M8B entry guards conservatively at this exact anchor.
      // A different full-grid mean could open fallback later; this short path does not invent it.
      if(!selected&&PRECISION_FALLBACK_RESEARCH_ENABLED&&M8B_SECOND_ROOT&&meanBest?.score>.50&&m7RowPass(meanBest,true)){
        const current=rootMagnitude(feature);
        for(let index=0;index<refs.length;index++){
          const ref=m8bReference(refs[index]),value=hintAnchorExactValue(ref,current,rect,index);
          hintAnchorStats.rootReferences++;audit.rootScores.push({referenceIndex:index,score:value.score,whole:value.whole,bands:[...value.bands]});
          if(acceptedForLarge(value,null,true)){
            selected=value;audit.branch='existing-M8B-original-candidate-grid-scale1-dx0-dy0';
            value.researchNativeRasterFallback=true;
            value.nativeRasterEvidence={path:'M10A_EXISTING_M8B_EXACT_GRID_POINT_EARLY',phase:audit.branch,secondRoot:true,aspectEnabled:M8B_ASPECT,aspect:{w:1,h:1},rect:{...rect},referenceId:hint.id,referenceIndex:index,currentFrameMarker:native.auditFrameMarker?{...native.auditFrameMarker}:null,currentNativePixels:true,numericFloorsUnchanged:true,representationChanged:true,roiSearchChanged:false,fullLegacyFallbackNotExecuted:true};
            hintAnchorStats.rootPassed++;break;
          }
        }
      }
      if(!selected){audit.firstFailure='exact-anchor-not-accepted';return null;}
      const pair=m7RowPairs.get(selected);audit.privatePairEstablished=Boolean(pair&&pair.reference&&pair.feature);
      audit.referenceIndex=selected.referenceIndex;audit.score=selected.score;audit.rowDetailEvidence=selected.rowDetailEvidence?{...selected.rowDetailEvidence}:null;
      const result={...asLargeSearchResult(selected,hint.id,search,ratio),threshold:.65,rejection:guideRejection(selected),diagnostics:{mode:'large-hint-exact-anchor-first',totalMs:Math.round(performance.now()-start)}};
      result.adaptiveHint=largeHint(result,search,native);audit.passed=true;return result;
    }catch(error){
      if(error?.name==='AbortError'||error?.code==='ABORT_ERR')throw error;
      hintAnchorStats.errors++;audit.firstFailure='exception';audit.error=String(error?.message||error);return null;
    }finally{audit.endedAt=performance.now();audit.elapsedWallMs=audit.endedAt-start;hintAnchorStats.elapsedMs+=audit.elapsedWallMs;if(!audit.passed)hintAnchorStats.failed++;}
  }

  const CURRENT_HINT_REACQUIRE_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_CURRENT_HINT_REACQUIRE_EXPERIMENT===true;
  const CURRENT_HINT_EXTRA_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_CURRENT_HINT_EXTRA_EXPERIMENT===true;
  const currentHintExtraGuardStats={attempts:0,appPassed:0,appRejected:0,appErrors:0,incomplete:0,rows:[],dropped:0};
  function currentHintExtraAppDecision(result,callback){
    if(result?.matched!==true)return {nativePassed:false,appPassed:null,accepted:false,reason:'native-rejected'};
    if(typeof callback!=='function')return {nativePassed:true,appPassed:null,accepted:false,reason:'extra-app-callback-missing'};
    try{const passed=callback(result)===true;return {nativePassed:true,appPassed:passed,accepted:passed,reason:passed?'extra-app-accepted':'extra-app-rejected'};}
    catch(error){if(error?.name==='AbortError'||error?.code==='ABORT_ERR')throw error;
      return {nativePassed:true,appPassed:false,accepted:false,reason:'extra-app-callback-error',error:String(error?.message||error)};}
  }
  function recordCurrentHintExtraGuard(native,audit,decision){
    currentHintExtraGuardStats.attempts++;
    if(decision.incomplete)currentHintExtraGuardStats.incomplete++;
    else if(decision.appPassed===true)currentHintExtraGuardStats.appPassed++;
    else if(decision.nativePassed){currentHintExtraGuardStats.appRejected++;if(decision.error)currentHintExtraGuardStats.appErrors++;}
    const row={at:performance.now(),marker:native.auditFrameMarker?{...native.auditFrameMarker}:null,index:audit.index,
      id:audit.id,coarseScore:audit.coarseScore,nativeScore:audit.nativeScore,nativeWhole:audit.nativeWhole,nativeBands:audit.nativeBands,
      coarseRect:{...audit.coarseRect},nativeRect:audit.finalRect?{...audit.finalRect}:null,...decision};
    if(currentHintExtraGuardStats.rows.length<64)currentHintExtraGuardStats.rows.push(row);else currentHintExtraGuardStats.dropped++;
  }
  const currentHintExtraStats={calls:0,extraChecks:0,extraPassed:0,extraRejected:0,elapsedWallMs:0};
  function selectCurrentHintExtraCandidates(pool,hint,search,floor){
    const h=hint.rect,hx=h.x+h.w/2,hy=h.y+h.h/2;
    const ranked=pool.filter(c=>largeIds.includes(c.id)&&Number.isFinite(c.score)&&c.score>=floor&&currentHintRectValid(c.rect)&&
      c.rect.x>=0&&c.rect.y>=0&&c.rect.x+c.rect.w<=search.width&&c.rect.y+c.rect.h<=search.height&&
      Math.abs(c.rect.x+c.rect.w/2-hx)<=h.w*.5+search.width*.01&&
      Math.abs(c.rect.y+c.rect.h/2-hy)<=h.h*.5+search.height*.01).sort((a,b)=>b.score-a.score);
    const selected=[];
    for(const c of ranked){if(selected.some(a=>a.id===c.id&&['x','y','w','h'].every(k=>a.rect[k]===c.rect[k])))continue;selected.push(c);if(selected.length===2)break;}
    return selected;
  }
  const currentHintStats={calls:0,coarseCalls:0,nativeChecks:0,passed:0,rejected:0,errors:0,aborts:0,oldFallbacks:0,elapsedMs:0,rows:[],dropped:0};
  function currentHintRectValid(r){return Boolean(r&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.w>0&&r.h>0);}
  function selectCurrentHintCandidate(pool,hint,search,floor){
    const h=hint.rect,hx=h.x+h.w/2,hy=h.y+h.h/2;
    return pool.filter(c=>largeIds.includes(c.id)&&Number.isFinite(c.score)&&c.score>=floor&&currentHintRectValid(c.rect)&&
      c.rect.x>=0&&c.rect.y>=0&&c.rect.x+c.rect.w<=search.width&&c.rect.y+c.rect.h<=search.height&&
      Math.abs(c.rect.x+c.rect.w/2-hx)<=h.w*.5+search.width*.01&&
      Math.abs(c.rect.y+c.rect.h/2-hy)<=h.h*.5+search.height*.01).sort((a,b)=>b.score-a.score)[0]||null;
  }
  async function tryCurrentHintReacquire(search,native,hint,options={}){
    const start=performance.now(),audit={startedAt:start,sourceMarker:search.auditFrameMarker?{...search.auditFrameMarker}:null,
      source:'CURRENT_CAPTURE_COARSE_EXISTING_LARGE_IDS',hintId:hint.id,hintRect:{...hint.rect},
      searchSize:[search.width,search.height],nativeSize:[native.width,native.height],
      floor:window.__MALERT_RESEARCH_CONFIG?.lowerLargeRetrievalFloor===true?.32:.34,
      selectedId:null,currentCoarseRect:null,currentFinalRect:null,firstFailure:null,oldFallback:false,passed:false};
    currentHintStats.calls++;
    if(currentHintStats.rows.length<32)currentHintStats.rows.push(audit);else currentHintStats.dropped++;
    try{
      currentHintStats.coarseCalls++;
      const coarse=await targeted(search,{ids:largeIds,maxCandidates:2});
      const candidates=CURRENT_HINT_EXTRA_ENABLED&&typeof options.acceptExtraCandidate==='function'?selectCurrentHintExtraCandidates(coarse.candidates||[],hint,search,audit.floor):[selectCurrentHintCandidate(coarse.candidates||[],hint,search,audit.floor)].filter(Boolean);
      if(!candidates.length){audit.firstFailure='no-current-bounded-coarse-candidate';currentHintStats.rejected++;return {result:null,audit};}
      audit.candidates=[];if(CURRENT_HINT_EXTRA_ENABLED)currentHintExtraStats.calls++;
      for(let candidateIndex=0;candidateIndex<candidates.length;candidateIndex++){
        const c=candidates[candidateIndex],at=performance.now(),candidateAudit={index:candidateIndex,id:c.id,coarseScore:c.score,coarseRect:{...c.rect},startedAt:at};
        audit.candidates.push(candidateAudit);audit.selectedId=c.id;audit.currentCoarseRect={...c.rect};audit.coarseScore=c.score;
        const ratio=native.width/search.width,candidate={...c,rect:{x:c.rect.x*ratio,y:c.rect.y*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
        currentHintStats.nativeChecks++;if(candidateIndex===1)currentHintExtraStats.extraChecks++;
        const best=await verifyLargeCandidate(native,candidate,null);
        candidateAudit.completedAt=performance.now();candidateAudit.elapsedWallMs=candidateAudit.completedAt-at;
        candidateAudit.nativeScore=best?.score??null;candidateAudit.nativeWhole=best?.whole??null;candidateAudit.nativeBands=best?.bands?[...best.bands]:null;
        if(!best||!acceptedForLarge(best,null,true)){
          candidateAudit.passed=false;candidateAudit.failure=best?guideRejection(best):'no-native-candidate';
          if(candidateIndex===1)recordCurrentHintExtraGuard(native,candidateAudit,{nativePassed:false,appPassed:null,accepted:false,reason:candidateAudit.failure});
          if(!audit.firstFailure)audit.firstFailure=candidateAudit.failure;
          if(candidateIndex===1){currentHintExtraStats.extraRejected++;currentHintExtraStats.elapsedWallMs+=candidateAudit.elapsedWallMs;}
          continue;
        }
        candidateAudit.finalRect={...best.rect};
        const result={...asLargeSearchResult(best,c.id,search,ratio),threshold:.65,rejection:guideRejection(best),
          diagnostics:{mode:'large-hint-current-reacquire',totalMs:Math.round(performance.now()-start)}};
        result.adaptiveHint=largeHint(result,search,native);
        if(candidateIndex===1){
          let decision;
          try{decision=currentHintExtraAppDecision(result,options.acceptExtraCandidate);}
          catch(error){recordCurrentHintExtraGuard(native,candidateAudit,{nativePassed:true,appPassed:null,accepted:false,reason:'AbortError',incomplete:true});throw error;}
          candidateAudit.appDecision=decision;recordCurrentHintExtraGuard(native,candidateAudit,decision);
          if(!decision.accepted){candidateAudit.passed=false;candidateAudit.failure=decision.reason;
            if(!audit.firstFailure)audit.firstFailure=decision.reason;
            currentHintExtraStats.extraRejected++;currentHintExtraStats.elapsedWallMs+=candidateAudit.elapsedWallMs;continue;}
        }
        candidateAudit.passed=true;
        audit.currentFinalRect={...result.rect};audit.referenceIndex=result.referenceIndex;audit.passed=true;currentHintStats.passed++;
        if(candidateIndex===1){currentHintExtraStats.extraPassed++;currentHintExtraStats.elapsedWallMs+=candidateAudit.elapsedWallMs;}
        return {result,audit};
      }
      currentHintStats.rejected++;return {result:null,audit};
    }catch(error){
      if(error?.name==='AbortError'||error?.code==='ABORT_ERR'){audit.firstFailure='AbortError';currentHintStats.aborts++;throw error;}
      audit.firstFailure='exception';audit.error=String(error?.message||error);currentHintStats.errors++;return {result:null,audit};
    }finally{
      audit.endedAt=performance.now();audit.elapsedWallMs=audit.endedAt-start;currentHintStats.elapsedMs+=audit.elapsedWallMs;
      if(!audit.passed&&audit.firstFailure!=='AbortError'){audit.oldFallback=true;currentHintStats.oldFallbacks++;}
    }
  }
  function finishCurrentHintOldFallback(attempt,result){
    if(attempt){attempt.audit.oldFallbackMatched=result?.matched===true;attempt.audit.oldFallbackEndedAt=performance.now();}
    return result;
  }

  async function recheckLarge(search,native=search,hint,options={}){
    const started=performance.now();await initLarge();
    if(!hint||hint.kind!=='large'||(!largeIds.includes(hint.id)&&hint.id!==risingId)||!largeReferences.has(hint.id)||
      hint.searchWidth!==search.width||hint.searchHeight!==search.height||hint.nativeWidth!==native.width||hint.nativeHeight!==native.height)
      return {matched:false,diagnostics:{mode:'large-hint',rejection:'hint-context'}};
    const r=hint.rect,ratio=native.width/search.width;
    if(!r||![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0||r.x<0||r.y<0||r.x+r.w>search.width||r.y+r.h>search.height)
      return {matched:false,diagnostics:{mode:'large-hint',rejection:'hint-rect'}};
    if(hint.id===risingId){
      const p=hint.poseRect;
      if(hint.poseAngle!==risingAngle||!p||![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.w<=0||p.h<=0||p.x<0||p.y<0||p.x+p.w>search.width||p.y+p.h>search.height)
        return {matched:false,diagnostics:{mode:'large-hint',rejection:'hint-pose'}};
      // Reacquire a prior-frame rising hint on the current captured frame.
      // The acceptCandidate caller refines an already located same-frame result.
      const currentFrameHint=typeof options.acceptCandidate==='function'?hint:null;
      const sidecarContext=newRisingSidecarContext(),risingOptions=sidecarContext?{...options,risingSeedSidecarContext:sidecarContext}:options;
      const existing=await analyzeRising(search,native,currentFrameHint,risingOptions);
      if(existing.matched)return existing;
      if(!SMALL_RISING_SCALE_RESEARCH_ENABLED)return tryRisingSeedSidecar(search,native,options,sidecarContext,existing);
      // A hint/context rejection above still returns immediately. After a valid
      // old-path failure, reacquire from current pixels and preserve app callbacks.
      const small=await analyzeRising(search,native,null,risingOptions,true);
      const combined={...small,candidates:[...existing.candidates,...small.candidates]};
      return tryRisingSeedSidecar(search,native,options,sidecarContext,combined);
    }
    if(HINT_ANCHOR_FIRST_ENABLED&&typeof options.acceptCandidate!=='function'){
      const anchored=tryHintAnchorFirst(search,native,hint);if(anchored)return anchored;
    }
    let currentHintAttempt=null;
    // Prior-frame nonrising hints only; same-frame app refinement keeps its original path.
    if(CURRENT_HINT_REACQUIRE_ENABLED&&typeof options.acceptCandidate!=='function'){
      currentHintAttempt=await tryCurrentHintReacquire(search,native,hint,options);
      if(currentHintAttempt.result)return currentHintAttempt.result;
    }
    const candidate={id:hint.id,referenceIndex:hint.referenceIndex,rect:{x:r.x*ratio,y:r.y*ratio,w:r.w*ratio,h:r.h*ratio}};
    const acceptCandidate=typeof options.acceptCandidate==='function'?options.acceptCandidate:null;
    const acceptAlignment=acceptCandidate?value=>acceptCandidate(asLargeSearchResult(value,hint.id,search,ratio))===true:null;
    const best=await verifyLargeCandidate(native,candidate,acceptAlignment);
    if(!best)return finishCurrentHintOldFallback(currentHintAttempt,{matched:false,diagnostics:{mode:'large-hint',rejection:'no-native-candidate'}});
    const result={...best,id:hint.id,threshold:.65,matched:acceptedForLarge(best,acceptAlignment,true),rejection:guideRejection(best),
      rect:{x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio},
      diagnostics:{mode:'large-hint',totalMs:Math.round(performance.now()-started)}};
    if(result.matched)result.adaptiveHint=largeHint(result,search,native);
    return finishCurrentHintOldFallback(currentHintAttempt,result);
  }
  function largeHint(result,search,native){
    return {kind:'large',id:result.id,referenceIndex:result.referenceIndex,rect:{...result.rect},...(result.id===risingId?{poseRect:{...result.poseRect},poseAngle:risingAngle}:{}),searchWidth:search.width,searchHeight:search.height,nativeWidth:native.width,nativeHeight:native.height};
  }

  // Supplementary guide retrieval uses RGB stroke contrast and the guide's
  // own size, then verifies three fixed sentence bands in original pixels.
  // Legacy/OPT8 paths and their acceptance gates remain unchanged.
  const adaptiveFamilies=[
    {id:'a',file:'click-lines-a.png'},
    {id:'b',file:'click-lines-b.png'},
    {id:'yellow',file:'click-lines-yellow.png'},
    {id:'occluded',file:'click-lines-occluded.png'}
  ];
  const adaptiveIds=adaptiveFamilies.map(f=>'adaptive-click-'+f.id);
  let adaptiveReferences=null,adaptiveLoading=null;
  async function initAdaptive(){
    if(adaptiveReferences)return adaptiveReferences;
    if(!adaptiveLoading)adaptiveLoading=(async()=>{
      const map=new Map();
      for(const family of adaptiveFamilies){
        const img=new Image();img.src=new URL('../assets/local-templates/'+family.file,scriptBase).href;await img.decode();
        const refs=[];
        for(const angle of [-3,0,3]){
          const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
          const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(img,-img.width/2,-img.height/2);
          refs.push(features(c,{x:0,y:0,w:c.width,h:c.height}));
        }
        map.set('adaptive-click-'+family.id,refs);
      }
      return adaptiveReferences=map;
    })().catch(error=>{adaptiveLoading=null;throw error;});
    return adaptiveLoading;
  }
  function guideRejection(v){
    if(!v)return 'no-native-candidate';
    if(v.rowDetailEvidence?.passed===false)return 'horizontal-glyph-detail';
    if(v.whole<.60)return 'whole-strokes';
    if(v.score<.65)return 'three-band-mean';
    if(v.bands.some(s=>s<.52))return 'missing-fixed-band';
    if(v.bands.filter(s=>s>=.65).length<2)return 'two-strong-bands';
    return 'accepted';
  }
  function adaptiveHint(result,search,native){
    return {id:result.id,rect:{...result.rect},searchWidth:search.width,searchHeight:search.height,nativeWidth:native.width,nativeHeight:native.height};
  }
  async function recheckAdaptive(search,native=search,hint){
    const started=performance.now();await initAdaptive();
    if(!hint||!adaptiveReferences.has(hint.id)||hint.searchWidth!==search.width||hint.searchHeight!==search.height||hint.nativeWidth!==native.width||hint.nativeHeight!==native.height)return {matched:false,diagnostics:{mode:'adaptive-hint',rejection:'hint-context'}};
    const r=hint.rect,ratio=native.width/search.width;
    if(!r||![r.x,r.y,r.w,r.h].every(Number.isFinite)||r.w<=0||r.h<=0||r.x<0||r.y<0||r.x+r.w>search.width||r.y+r.h>search.height)return {matched:false,diagnostics:{mode:'adaptive-hint',rejection:'hint-rect'}};
    const candidate={id:hint.id,rect:{x:r.x*ratio,y:r.y*ratio,w:r.w*ratio,h:r.h*ratio}};
    const gridFeatures=[];let best=null,bestAccepted=null;
    for(const ref of adaptiveReferences.get(hint.id)){
      const v=await verify(native,candidate,ref,gridFeatures);
      if(v&&(!best||v.score>best.score))best=v;
      if(accepted(v)&&(!bestAccepted||v.score>bestAccepted.score))bestAccepted=v;
    }
    if(bestAccepted)best=withRawBest(bestAccepted,best);
    if(!best)return {matched:false,diagnostics:{mode:'adaptive-hint',rejection:'no-native-candidate'}};
    const result={...best,id:hint.id,threshold:.65,matched:accepted(best),rejection:guideRejection(best),rect:{x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio},diagnostics:{mode:'adaptive-hint',totalMs:Math.round(performance.now()-started)}};
    if(result.matched)result.adaptiveHint=adaptiveHint(result,search,native);
    return result;
  }
  function uniformContentRect(source){
    // Trim a uniform surrounding matte only. A real game viewport with
    // different corner colours keeps the full search frame unchanged.
    const ctx=source.getContext('2d',{willReadFrequently:true}),w=source.width,h=source.height;
    const rgba=ctx.getImageData(0,0,w,h).data,bg=[rgba[0],rgba[1],rgba[2]],same=(x,y)=>{
      const i=(y*w+x)*4;return Math.abs(rgba[i]-bg[0])<=8&&Math.abs(rgba[i+1]-bg[1])<=8&&Math.abs(rgba[i+2]-bg[2])<=8;
    };
    for(const [x,y] of [[0,0],[w-1,0],[0,h-1],[w-1,h-1],[Math.floor(w/2),0],[Math.floor(w/2),h-1],[0,Math.floor(h/2)],[w-1,Math.floor(h/2)]])if(!same(x,y))return null;
    const step=4;let x0=w,y0=h,x1=-1,y1=-1;
    for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step)if(!same(x,y)){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<0)return null;
    x0=Math.max(0,x0-step);y0=Math.max(0,y0-step);x1=Math.min(w,x1+step+1);y1=Math.min(h,y1+step+1);
    const cw=x1-x0,ch=y1-y0;
    if(x0<8||y0<8||w-x1<8||h-y1<8||cw<w*.4||ch<h*.3||cw/ch<1.3||cw/ch>2.2)return null;
    return {x:x0,y:y0,w:cw,h:ch};
  }
  async function analyzeAdaptive(search,native=search,options={}){
    const started=performance.now();await initAdaptive();
    const contentRect=uniformContentRect(search);let input=search;
    if(contentRect){input=document.createElement('canvas');input.width=contentRect.w;input.height=contentRect.h;input.getContext('2d').drawImage(search,contentRect.x,contentRect.y,contentRect.w,contentRect.h,0,0,input.width,input.height);}
    const coarseStarted=performance.now();
    const coarse=await targeted(input,{ids:adaptiveIds,maxCandidates:3});
    const coarseMs=performance.now()-coarseStarted,ratio=native.width/search.width;
    const coarseRanked=coarse.candidates.filter(c=>c.score>=.38).sort((a,b)=>b.score-a.score);
    const anchorStarted=ADAPTIVE_ANCHOR_RESEARCH_ENABLED?performance.now():0;
    const anchorPool=ADAPTIVE_ANCHOR_RESEARCH_ENABLED?coarseRanked:coarseRanked.slice(0,8);
    const candidates=[],retrieved=anchorPool.map(c=>{
      const candidate={...c,rect:{x:(c.rect.x+(contentRect?.x||0))*ratio,y:(c.rect.y+(contentRect?.y||0))*ratio,w:c.rect.w*ratio,h:c.rect.h*ratio}};
      // The original native anchor, reference features and acceptance gates
      // are unchanged. Local research delays the top8 cut until this ordering.
      const f=features(native,candidate.rect);let anchor=-1;
      for(const ref of adaptiveReferences.get(c.id)||[]){const score=[correlation(ref,f,2,17),correlation(ref,f,19,36),correlation(ref,f,38,54)].reduce((a,b)=>a+b,0)/3;anchor=Math.max(anchor,score);}
      return {coarse:c,candidate,anchor};
    }).sort((a,b)=>b.anchor-a.anchor).slice(0,8);
    if(ADAPTIVE_ANCHOR_RESEARCH_ENABLED){
      const elapsed=performance.now()-anchorStarted;
      adaptiveAnchorStats.calls++;
      adaptiveAnchorStats.coarseCandidates+=coarse.candidates.length;
      adaptiveAnchorStats.eligibleCandidates+=coarseRanked.length;
      adaptiveAnchorStats.anchorFeatureExtractions+=anchorPool.length;
      adaptiveAnchorStats.additionalAnchorFeatureExtractions+=Math.max(0,anchorPool.length-8);
      adaptiveAnchorStats.retainedCandidates+=retrieved.length;
      adaptiveAnchorStats.promotedCandidates+=retrieved.filter(entry=>coarseRanked.indexOf(entry.coarse)>=8).length;
      adaptiveAnchorStats.anchorElapsedMs+=elapsed;
      adaptiveAnchorStats.maxAnchorElapsedMs=Math.max(adaptiveAnchorStats.maxAnchorElapsedMs,elapsed);
    }
    // The optional early pass restricts expensive localization to promising
    // native-pixel anchors. The general/scout pass retains every old candidate.
    // Both passes still require the same whole/three-band acceptance below.
    for(const entry of retrieved.filter(entry=>!options.quickCandidatesOnly||entry.anchor>=.60)){
      const c=entry.coarse,candidate=entry.candidate;
      const gridFeatures=[];let best=null,bestAccepted=null;
      for(const ref of adaptiveReferences.get(c.id)||[]){
        const v=await verify(native,candidate,ref,gridFeatures);
        if(v&&(!best||v.score>best.score))best=v;
        if(accepted(v)&&(!bestAccepted||v.score>bestAccepted.score))bestAccepted=v;
      }
      if(bestAccepted)best=withRawBest(bestAccepted,best);
      if(!best)continue;
      const item={...best,id:c.id,coarseScore:c.score,anchorScore:entry.anchor,matched:accepted(best),rejection:guideRejection(best),rect:{x:best.rect.x/ratio,y:best.rect.y/ratio,w:best.rect.w/ratio,h:best.rect.h/ratio}};
      candidates.push(item);
      if(item.matched)return {...item,threshold:.65,candidates,adaptiveHint:adaptiveHint(item,search,native),diagnostics:{mode:'adaptive-rgb-native',coarseMs:Math.round(coarseMs),totalMs:Math.round(performance.now()-started),coarseCount:coarse.candidates.length,nativeWidth:native.width,searchWidth:search.width,contentRect}};
    }
    return {matched:false,candidates,diagnostics:{mode:'adaptive-rgb-native',coarseMs:Math.round(coarseMs),totalMs:Math.round(performance.now()-started),coarseCount:coarse.candidates.length,retrievedCount:retrieved.length,nativeWidth:native.width,searchWidth:search.width,contentRect}};
  }

  window.MAlertClickGuide={
    researchCurrentFrameGridCacheStatus:()=>({enabled:CURRENT_FRAME_GRID_CACHE_ENABLED,defaultOff:true,scope:'One immutable current-native fallback call; identical aspect object; projected features only; no scores/acceptance/history cache',maximumScaleOneFeaturesPerCall:375,maximumCachedFeaturesPerActiveCall:425,float32BytesPerFeature:14336,...structuredClone(currentFrameGridCacheStats)}),
    researchAspectCenterFirstStatus:()=>({enabled:ASPECT_CENTER_FIRST_ENABLED,defaultOff:true,maximumPointsPerVariant:25,maximumReferencesPerPoint:3,policy:'All existing variant grid scale1/dxdy[-.04,-.02,0,.02,.04] first; original full75 grid retained after failure',timeBasis:'wall milliseconds',...structuredClone(aspectCenterStats)}),
    researchNativeRasterStatus:()=>({enabled:M8B_SECOND_ROOT||M8B_ASPECT,secondRoot:M8B_SECOND_ROOT,aspect:M8B_ASPECT,frozenFlags:Object.freeze({secondRoot:M8B_SECOND_ROOT,aspect:M8B_ASPECT}),defaultOff:true,defaultOffMeaning:"Both experimental globals absent or false disables extension; captured flags above report current realm",currentPixelSource:"Fresh current native canvas via existing largeClickFeatures; no historical pixel or reference addition",numericThresholdsUnchanged:true,m7RowThreshold:.35,acceptanceRepresentationChanged:M8B_SECOND_ROOT,roiSearchChanged:M8B_ASPECT,...structuredClone(m8bNativeStats),finalAcceptedEvidence:m8bNativeStats.last?.evidence?structuredClone(m8bNativeStats.last.evidence):null}),
    researchDiverseExtraStatus:()=>({enabled:LARGE_DIVERSE_EXTRA_ENABLED,overlapEnabled:DIVERSE_EXTRA_OVERLAP_ENABLED,overlapDefaultOff:true,familyEnabled:DIVERSE_EXTRA_FAMILY_ENABLED,familyDefaultOff:true,familyPolicy:'Among existing eligible extras, highest-score fixed-reference basis absent from original top5; otherwise original first eligible; at most one native extra',familySelection:diverseFamilySelection?structuredClone(diverseFamilySelection):null,familyLimitation:'An unexamined basis may be background noise; selection provides no acceptance or semantic guarantee',duplicatePolicy:'Original top-left proximity OR exact candidate.id plus intersection/minarea>=.5 and symmetric width/height ratios<=1.5; compare only to preserved original top5',maximumExtraChecksPerAnalyzeLarge:1,featureAnalysisWidth:384,timeBasis:'wall milliseconds',...structuredClone(largeDiverseExtraStats),overlapSelection:diverseOverlapSelection?structuredClone(diverseOverlapSelection):null,overlapLimitation:'Nearby distinct instances of the same pose can be skipped; geometry is retrieval suppression, not proof of target identity'}),
    researchRowDetailStatus:()=>({enabled:M7_ROW_DETAIL_ENABLED,threshold:.35,mean:structuredClone(m7RowStats),fallback:largeNativePrecisionFallback.status()}),
    researchExactMedian9Enabled:()=>EXACT_MEDIAN9_NATIVE_ENABLED,
    analyze:(search,native=search,options={})=>memoPhase('fixed',search,native,options,()=>analyze(search,native,options)),
    researchSinglePassRootMagnitudeEnabled:()=>SINGLE_PASS_ROOT_MAGNITUDE_ENABLED,
    analyzeLarge:(search,native=search,options={})=>memoPhase('large',search,native,options,()=>analyzeLarge(search,native,options)),
    researchHintAnchorFirstStatus:()=>({enabled:HINT_ANCHOR_FIRST_ENABLED,defaultOff:true,maximumAnchorReferencesPerBranch:3,policy:'Existing mean exact hint anchor; then existing second-root exact grid point with original M8B entry guards; else original current coarse/full fallback',timeBasis:'wall milliseconds',...structuredClone(hintAnchorStats)}),
    researchCurrentHintExtraEnabled:()=>CURRENT_HINT_EXTRA_ENABLED,
    researchCurrentHintExtraStatus:()=>({enabled:CURRENT_HINT_EXTRA_ENABLED,defaultOff:true,maximumExtraNativeChecks:1,appCallbackRequired:true,appGuard:structuredClone(currentHintExtraGuardStats),policy:'Unchanged first native candidate; one next bounded candidate requires native+strict current app callback; missing callback skips extra; reject/error retains original fallback',...structuredClone(currentHintExtraStats)}),
    researchCurrentHintReacquireStatus:()=>({enabled:CURRENT_HINT_REACQUIRE_ENABLED,defaultOff:true,maximumCurrentNativeChecks:CURRENT_HINT_EXTRA_ENABLED?2:1,policy:'Current coarse center within half hint size plus1pct search dimensions; original floor/native/M7 guards; old fallback on failure',timeBasis:'wall milliseconds',...structuredClone(currentHintStats)}),
    recheckLarge:(search,native=search,hint,options={})=>memoPhase('large-recheck',search,native,{hint,options},()=>recheckLarge(search,native,hint,options)),
    analyzeAdaptive:(search,native=search,options={})=>memoPhase('adaptive',search,native,options,()=>analyzeAdaptive(search,native,options)),
    recheckAdaptive:(search,native=search,hint,options={})=>memoPhase('adaptive-recheck',search,native,{hint,options},()=>recheckAdaptive(search,native,hint,options)),
    researchNativeAlignmentEnabled:()=>NATIVE_ALIGNMENT_RESEARCH_ENABLED,
    researchNativeAlignmentStatus:()=>structuredClone(nativeAlignmentStats),
    researchAdaptiveAnchorEnabled:()=>ADAPTIVE_ANCHOR_RESEARCH_ENABLED,
    researchAdaptiveAnchorStatus:()=>structuredClone(adaptiveAnchorStats),
    researchSmallRisingScaleEnabled:()=>SMALL_RISING_SCALE_RESEARCH_ENABLED,
    researchPrecisionFallbackEnabled:()=>PRECISION_FALLBACK_RESEARCH_ENABLED,
    researchPrecisionFallbackStatus:()=>({main:structuredClone(precisionFallbackStats),fallback:largeNativePrecisionFallback.status()}),
    researchRisingSeedSidecarEnabled:()=>RISING_SEED_SIDECAR_ENABLED,
    researchRisingSeedSidecarStatus:()=>structuredClone(risingSeedSidecarStats),
    researchRisingSeedAnchorEnabled:()=>RISING_SEED_ANCHOR_ENABLED,
    researchRisingSeedAnchorStatus:()=>structuredClone(risingSeedAnchorStats),
    researchValidRootEnabled:()=>VALID_ROOT_RESEARCH_ENABLED,
    researchBalancedNativeEnabled:()=>BALANCED_NATIVE_RESEARCH_ENABLED,
    init,features,correlation,verify,accepted
  };
})();
