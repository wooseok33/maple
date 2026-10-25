(() => {

const m39ReleaseObservationNoop=Object.freeze(function(){});
const m39ReleaseLatencyAudit=Object.freeze({enter:m39ReleaseObservationNoop,exit:m39ReleaseObservationNoop,record:m39ReleaseObservationNoop});
const m39DisabledAlertGate=undefined;
  window.M_ALERT_APP_VERSION = "1.1.52";
  window.M_ALERT_BUILD = "M400-P2-20261021-RELEASE1";
  "use strict";

// Adopted two-input confirmation; frame identity and existing failure policies are retained.
const M35_SINGLE_CONFIRMATION_ENABLED = window.__MALERT_SINGLE_CONFIRMATION_EXPERIMENT === true &&
  window.__MALERT_RESEARCH_CONFIG?.strictThreeActualInputs === true &&
  (['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname || '') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
const DETECTION_CONFIRM_COUNT = M35_SINGLE_CONFIRMATION_ENABLED ? 1 : 2;

function igEmit(lane,value){}
function igRows(rows){return (rows||[]).map(r=>({...r,stream:undefined,observation:r.observation?{...r.observation,stream:undefined}:r.observation}));}
function igBest(r){return r?{id:r.id,label:r.label,matched:r.matched,score:r.score,threshold:r.threshold,rect:r.rect,guideScores:r.guideScores,requiredStreak:r.requiredStreak,confirmationMode:r.confirmationMode,voteIdentity:r.voteIdentity,adaptiveHint:r.adaptiveHint}:null;}
function collectMainClickLocationVote(...args){const r=igCollectMain(...args);igEmit('main-location',{...r,capture:m4Context(args[1]),best:igBest(args[0]),marker:args[2],capturedAt:args[4],scope:{session:args[3].sessionId,revision:args[3].revision}});if(args[0]?.matched)m39ReleaseObservationNoop?.(args[1],'vote-main',igBest(args[0]),{votes:r.votes,records:r.observations});return r;}
function collectLargeGuideScoutVote(result,canvas,marker,scope){const before=state.largeGuideEvidence||[],now=performance.now();const diagnostics=before.map(e=>({marker:e.marker,rect:e.rect,ageMs:now-e.at,sessionMatches:e.sessionId===scope.sessionId,streamMatches:e.stream===scope.stream,revisionMatches:e.revision===scope.revision,identityMatches:e.identity===String(result?.voteIdentity||result?.id||'click-large-lines'),dimensionsMatch:e.width===canvas.width&&e.height===canvas.height,locationMatches:result?.rect? sameTargetedContourLocation(e.rect,result.rect,canvas.width,canvas.height):null,independent:isIndependentTargetedRecheckFrame(e.marker,marker)}));const votes=igCollectLarge(result,canvas,marker,scope);igEmit('large-vote',{capture:m4Context(canvas),votes,matched:result?.matched===true,best:igBest(result),marker,before:igRows(before),after:igRows(state.largeGuideEvidence),diagnostics});if(result?.matched)m39ReleaseObservationNoop?.(canvas,'vote-large',igBest(result),{votes,records:igRows(state.largeGuideEvidence)});return votes;}
async function findClickLineGuide(...args){const at=performance.now();const m4id=++m4CallSerial,m4context=m4Context(args[0]);igEmit('click-check-start',{callId:m4id,capture:m4context,marker:args[0]?.auditFrameMarker,largeOnly:args[1]||false,adaptiveHint:args[2]||null,allowAdaptive:args[3],adaptiveOnly:args[4],quickFixedOnly:args[5]});try{const r=await igFindClick(...args);igEmit('click-check-end',{callId:m4id,capture:m4context,elapsedMs:performance.now()-at,marker:args[0]?.auditFrameMarker,best:igBest(r)});if(r?.matched)m39ReleaseObservationNoop?.(args[0],'matched-click',igBest(r));return r;}catch(e){igEmit('click-check-exception',{elapsedMs:performance.now()-at,marker:args[0]?.auditFrameMarker,name:e?.name,code:e?.code});throw e;}}


const m4Canvases=new WeakMap();let m4CanvasSerial=0,m4CallSerial=0;
function m4CanvasId(c){if(!c||typeof c!=='object')return null;if(!m4Canvases.has(c))m4Canvases.set(c,++m4CanvasSerial);return m4Canvases.get(c);}
const m39PrivateCaptureMeta=c=>{const f=strictThreeFrames.get(c);return {captureId:m4CanvasId(c),owner:f?{...f,stream:undefined}:null,nativeSameOwner:strictThreeFrames.get(c.nativeSource||c)===f};};
function m4Context(c){const f=c?strictThreeFrames.get(c):null;return {captureId:m4CanvasId(c),marker:c?.auditFrameMarker,capturedAt:f?.capturedAt,ageMs:f?performance.now()-f.capturedAt:null,phase:state.analysisPhase,analysisBusy:state.analysisBusy,scoutBusy:state.rainbowScoutBusy,analysisStartedAt:state.analysisStartedAt,streak:state.streak,session:state.captureSessionId,serial:state.rainbowDetectionSerial,lastMainAt:state.lastAnalysisAt,lastScoutAt:state.lastRainbowScoutAt,nextMainDelay:state.nextAnalysisDelayMs,pendingLatest:state.pendingLatestAnalysis};}

// Pure confirmation component. No detector, capture, OCR, timer, or notification.
function createStrictThreeCore(requiredVotes = 3) {
  const frameKeys = ['session', 'stream', 'revision', 'serial', 'width', 'height', 'sourceWidth', 'sourceHeight', 'transform', 'provider'];
  const sameScope = (a,b) => Boolean(a && b && frameKeys.every(k => a[k] === b[k]));
  const usable = f => Boolean(f && f.kind === 'frame-count' && typeof f.provider === 'string' && f.provider &&
    Number.isFinite(f.value) && f.value >= 0 && Number.isFinite(f.capturedAt) &&
    f.width > 0 && f.height > 0 && f.sourceWidth > 0 && f.sourceHeight > 0);
  function recent(previous, batch, {sameTarget = null} = {}) {
    let records = previous.slice(-3), added = false, rejected = [];
    for (const item of batch) {
      if (!item || !usable(item.frame)) {
        // Unknown ownership is a barrier, never a copied successful frame.
        records = [...records, null].slice(-3); rejected.push('METADATA_UNAVAILABLE'); continue;
      }
      const last = records.at(-1);
      if (last?.frame && !sameScope(last.frame,item.frame)) records = [];
      const latest = records.filter(Boolean).at(-1);
      if (latest?.frame && sameScope(latest.frame,item.frame) && item.frame.value <= latest.frame.value) {
        const duplicateIndex=records.findIndex(o=>o?.frame&&sameScope(o.frame,item.frame)&&o.frame.value===item.frame.value);
        const duplicate=records[duplicateIndex];
        if (duplicate &&
            (item.matched !== true || item.identity !== duplicate.identity || item.policy !== duplicate.policy || item.lane !== duplicate.lane ||
             (sameTarget && !sameTarget(duplicate,item)))) {
          // A later nonmatch or conflicting final candidate on this same input
          // invalidates its old success. It still cannot create another vote.
          records[duplicateIndex]={...item,frame:duplicate.frame,matched:false};
          rejected.push('DUPLICATE_CONFLICT_INVALIDATED');continue;
        }
        rejected.push(item.frame.value === latest.frame.value ? 'DUPLICATE_FRAME' : 'OUT_OF_ORDER'); continue;
      }
      records = [...records,item].slice(-3); added = true;
    }
    return {records,added,rejected};
  }
  function gate(records, {sameTarget, alive = () => true, currentFrame = null, originalAllowed = true, newInput = true} = {}) {
    const selected = records.slice(-requiredVotes);
    const decision = (status,count=0) => ({status,votes:count,ready:status==='READY',selected});
    if (!originalAllowed) return decision('ORIGINAL_GATE_REJECTED');
    if (!newInput) return decision('NO_NEW_INPUT');
    if (!selected.length) return decision('PENDING_THIRD');
    if (selected.some(x=>!x || !usable(x.frame))) return decision('METADATA_UNAVAILABLE');
    if (selected.some(x=>x.matched !== true)) return decision('ACTUAL_NONMATCH');
    if (currentFrame && !sameScope(selected.at(-1).frame,currentFrame)) return decision('STALE_SCOPE');
    if (currentFrame && selected.at(-1).frame.value !== currentFrame.value) return decision('NOT_CURRENT_INPUT');
    if (selected.some(x=>!alive(x))) return decision('EXPIRED');
    for(let i=0;i<selected.length;i++) for(let j=i+1;j<selected.length;j++) {
      const a=selected[i],b=selected[j];
      if (!sameScope(a.frame,b.frame)) return decision('STALE_SCOPE');
      if (a.frame.value >= b.frame.value || a.frame.capturedAt > b.frame.capturedAt) return decision('DUPLICATE_OR_OUT_OF_ORDER');
      if (a.lane!==b.lane || a.identity!==b.identity || a.policy!==b.policy || !sameTarget(a,b)) return decision('DIFFERENT_TARGET');
    }
    return decision(selected.length===requiredVotes?'READY':'PENDING_THIRD',selected.length);
  }
  return Object.freeze({sameScope,usable,recent,gate});
}

  // R22 strict-three-only research. Absent/false and public hosts stay off.
  const STRICT_THREE_INPUT_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.strictThreeActualInputs === true &&
    ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname || '') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  const strictThreeCore = createStrictThreeCore(DETECTION_CONFIRM_COUNT);
  const strictThreeFrames = new WeakMap();
  const strictThreeOcrFrames = new WeakMap();
  const strictThreeFailedRechecks = new WeakMap();
  let strictThreeCaptureSequence = 0;
  let strictThreeMainRecords = [];
  let strictThreeMarkerProvider = '';
  let strictThreeLastDecision = null;
  const M36_EXTRA_STRUCTURAL_APP_ENABLED=window.__MALERT_M36_DUAL_SCOPE_EXTRA_EXPERIMENT===true&&M35_SINGLE_CONFIRMATION_ENABLED===true&&DETECTION_CONFIRM_COUNT===1&&(['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname||'') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  window.MAlertM36ExtraStructuralRegion=Object.freeze({enabled:()=>M36_EXTRA_STRUCTURAL_APP_ENABLED,status:()=>({enabled:M36_EXTRA_STRUCTURAL_APP_ENABLED,route:'dual-existing-text-scopes-one-extra-per-ocr-job',ocr:window.MAlertM36ExtraStructuralRegionOcr?.status?.()||null})});

  const m35Stats={acceptedByRoute:{},rejectedOwnership:0,duplicateRejected:0,last:null};
  const m35Last=new Map();
  const m35ProofOwners=new WeakMap();
  function m35Owned(canvas){
    const f=canvas&&strictThreeFrames.get(canvas);
    return Boolean(f&&strictThreeCore.usable(f)&&Object.isFrozen(f)&&semanticThirdScopeCurrent(f)&&
      f.width===canvas.width&&f.height===canvas.height&&
      strictThreeFrames.get(canvas.nativeSource||canvas)===f&&
      f.sourceWidth===Number(canvas.dataset?.sourceWidth)&&f.sourceHeight===Number(canvas.dataset?.sourceHeight)&&
      f.transform===JSON.stringify(['sourceX','sourceY','sourceWidth','sourceHeight','contentX','contentY','contentWidth','contentHeight','screenMode','displayScale'].map(k=>canvas.dataset?.[k]))&&
      !ocrExpiredFrames.has(canvas));
  }
  function m35ProofOwned(observation){
    const canvas=observation&&m35ProofOwners.get(observation);
    return Boolean(canvas&&m35Owned(canvas)&&observation.frame===strictThreeFrames.get(canvas));
  }
  function m35Final(route,result,canvas){
    if(!M35_SINGLE_CONFIRMATION_ENABLED)return true;
    if(result?.matched!==true||result?.incomplete===true||!m35Owned(canvas)||
      !rectInsideSearchMonitorRegion(result.rect,canvas)){m35Stats.rejectedOwnership++;return false;}
    const f=strictThreeFrames.get(canvas),last=m35Last.get(route);
    if(last&&last.session===f.session&&last.stream===f.stream&&last.revision===f.revision&&
      last.provider===f.provider&&last.transform===f.transform&&f.value<=last.value){m35Stats.duplicateRejected++;return false;}
    m35Last.set(route,f);
    m35Stats.acceptedByRoute[route]=(m35Stats.acceptedByRoute[route]||0)+1;
    m35Stats.last={route,frame:f.value,provider:f.provider,captureSequence:f.captureSequence,matched:true};
    return true;
  }
  function m35FirstSemantic(result,canvas,sessionIsCurrent){
    if(!M35_SINGLE_CONFIRMATION_ENABLED)return null;
    if(!sessionIsCurrent()||result?.matched!==true||result?.incomplete===true||
      strictThreeOcrFrames.get(result)!==canvas||!m35Owned(canvas)||
      !rectInsideSearchMonitorRegion(result.rect,canvas))return null;
    const first={...result,m35SingleActualInput:true,
      strictThreeEvidence:[strictThreeOcrObservation(result,canvas,'targeted')]};
    return strictThreeOcrOwner(first,canvas);
  }
  window.MAlertSingleConfirmationResearch=Object.freeze({enabled:()=>M35_SINGLE_CONFIRMATION_ENABLED,
    status:()=>({enabled:M35_SINGLE_CONFIRMATION_ENABLED,confirmationVotes:DETECTION_CONFIRM_COUNT,
      policy:'One actual owned final acceptance; same-frame detector and OCR predicates unchanged',
      ...structuredClone(m35Stats)})});

  // Numeric/rect metadata only. No saved screen, OCR text, or external output.
  window.MAlertStrictThreeResearch = Object.freeze({
    enabled:()=>STRICT_THREE_INPUT_RESEARCH_ENABLED,
    lastDecision:()=>strictThreeLastDecision ? structuredClone(strictThreeLastDecision) : null
  });
  function strictThreeCapture(canvas) {
    if (!STRICT_THREE_INPUT_RESEARCH_ENABLED) return;
    const marker=canvas.auditFrameMarker, d=canvas.dataset;
    const frame=Object.freeze({session:state.captureSessionId,stream:state.stream,revision:state.monitorRegionRevision,serial:state.rainbowDetectionSerial,
      kind:marker?.kind,value:marker?.value,provider:marker?.provider||'',capturedAt:canvas.strictThreeCapturedAt,captureSequence:++strictThreeCaptureSequence,
      width:canvas.width,height:canvas.height,sourceWidth:Number(d.sourceWidth),sourceHeight:Number(d.sourceHeight),
      transform:JSON.stringify([d.sourceX,d.sourceY,d.sourceWidth,d.sourceHeight,d.contentX,d.contentY,d.contentWidth,d.contentHeight,d.screenMode,d.displayScale])});
    strictThreeFrames.set(canvas,frame);
    if(canvas.nativeSource)strictThreeFrames.set(canvas.nativeSource,frame);
  }
  function strictThreeOcrOwner(result,canvas) {
    if (STRICT_THREE_INPUT_RESEARCH_ENABLED && result && typeof result==='object') strictThreeOcrFrames.set(result,canvas);
    return result;
  }
  function strictThreeSemanticIdentity(result) {
    return JSON.stringify([result?.label||'',Boolean(result?.confirmationInlineGuide),Boolean(result?.confirmationInlineContour),
      Boolean(result?.confirmationTextInputOnly),Boolean(result?.confirmationViolettaFixedOnly),Boolean(result?.shapeGuideVerified),
      String(result?.engine||'')]);
  }
  function strictThreeObservation(result,canvas,lane,policy,identity,location='targeted') {
    const rect=result?.rect;
    const observation={frame:strictThreeFrames.get(canvas)||null,matched:result?.matched===true,
      lane,policy,identity,location,rect:rect?{x:rect.x,y:rect.y,w:rect.w,h:rect.h}:null,
      evidenceRecordedAt:performance.now()};
    if(M35_SINGLE_CONFIRMATION_ENABLED&&canvas)m35ProofOwners.set(observation,canvas);
    return observation;
  }
  function strictThreeOcrObservation(result,canvas,location='targeted',identity=null) {
    return strictThreeObservation(result,canvas,'main','semantic-ocr',identity||strictThreeSemanticIdentity(result),location);
  }
  function strictThreeContourObservation(result,canvas) {
    // Called only after the unchanged strong-candidate selector accepted this
    // exact observation; its raw matcher matched property is not that selector's verdict.
    if(result)result={...result,matched:true};
    return strictThreeObservation(result,canvas,'main','contour',JSON.stringify([result?.id||'',Number(result?.templateScale||1),result?.detectionMode||'hybrid']));
  }
  function strictThreeFailedRecheck(firstCanvas,canvas,firstResult,kind,reason) {
    // This journal stores only a fresh recheck that actually ran and rejected.
    // It cannot add a success or turn an unexecuted/duplicate capture into a vote.
    if(!STRICT_THREE_INPUT_RESEARCH_ENABLED)return;
    const observation=kind==='contour'
      ? strictThreeObservation({matched:false,rect:firstResult?.rect},canvas,'main','contour',JSON.stringify([firstResult?.id||'',Number(firstResult?.templateScale||1),firstResult?.detectionMode||'hybrid']))
      : strictThreeOcrObservation({matched:false,rect:firstResult?.rect},canvas,'targeted',strictThreeSemanticIdentity(firstResult));
    observation.rejection=reason;
    const records=strictThreeFailedRechecks.get(firstCanvas)||[];
    records.push(observation);
    strictThreeFailedRechecks.set(firstCanvas,records);
  }
  function strictThreeRectValid(o) {
    return o?.rect && ['x','y','w','h'].every(k=>Number.isFinite(o.rect[k])) && o.rect.w>0 && o.rect.h>0;
  }
  function strictThreeSameTarget(a,b) {
    if(!strictThreeRectValid(a)||!strictThreeRectValid(b))return false;
    const w=a.frame.width,h=a.frame.height;
    const targeted=()=>sameTargetedContourLocation(a.rect,b.rect,w,h);
    const contained=()=>{
      const x=a.rect,y=b.rect;
      const intersection=Math.max(0,Math.min(x.x+x.w,y.x+y.w)-Math.max(x.x,y.x))*Math.max(0,Math.min(x.y+x.h,y.y+y.h)-Math.max(x.y,y.y));
      return intersection/Math.max(1,Math.min(x.w*x.h,y.w*y.h))>=.8;
    };
    const snapshot=()=>Math.hypot((a.rect.x+a.rect.w/2-b.rect.x-b.rect.w/2)/w,(a.rect.y+a.rect.h/2-b.rect.y-b.rect.h/2)/h)<=.12;
    if(a.policy==='semantic-ocr') {
      // Mixed OCR provenance must pass BOTH existing location policies.
      const modes=new Set([a.location,b.location]);
      return (!modes.has('targeted') || contained() || targeted()) && (!modes.has('snapshot') || snapshot());
    }
    if(a.location==='rainbow'&&b.location==='rainbow')return sameRainbowScoutLocation(a,b);
    return targeted();
  }
  function strictThreePublicDecision(decision) {
    return {status:decision.status,votes:decision.votes,ready:decision.ready,
      frames:decision.selected.map(o=>o?{marker:o.frame?{kind:o.frame.kind,value:o.frame.value,provider:o.frame.provider}:null,
        capturedAt:o.frame?.capturedAt,captureSequence:o.frame?.captureSequence,evidenceRecordedAt:o.evidenceRecordedAt,policy:o.policy,identity:o.identity,rect:o.rect,matched:o.matched,rejection:o.rejection||null}:null)};
  }
  function strictThreeMain(best,canvas) {
    const applies=M35_SINGLE_CONFIRMATION_ENABLED || Math.max(2,Number(best.requiredStreak||2))<3;
    let batch=best.strictThreeEvidence;
    if(!applies) {
      // Existing 3-vote routes keep their original rule and cannot contribute to a 2-vote lane.
      batch=[strictThreeObservation({matched:false},canvas,'main','other-three-vote','barrier')];
    } else if(!Array.isArray(batch)||!batch.length) {
      const owner=best.strictThreeOcrResult&&strictThreeOcrFrames.get(best.strictThreeOcrResult);
      if(best.preconfirmed)batch=[strictThreeObservation({matched:false},canvas,'main','missing-proof','barrier')];
      else if(owner)batch=[strictThreeOcrObservation(best.strictThreeOcrResult,owner,'snapshot')];
      else batch=[strictThreeObservation(best,canvas,'main','single-final',JSON.stringify([best.id||'',best.label||'',best.confirmationMode||'']))];
    }
    // Queue results can complete out of capture order. Preserve every actual
    // selected result and rejection in input order; do not choose favourable 3.
    if(M35_SINGLE_CONFIRMATION_ENABLED){
      // Each proof must retain its actual capture owner, even for queued OCR.
      batch=Array.isArray(batch)?batch:[];
      batch=batch.map(o=>o&&m35ProofOwned(o)&&strictThreeRectValid(o)&&strictThreeCore.usable(o.frame)&&semanticThirdScopeCurrent(o.frame)&&
        o.matched===true?o:{...o,matched:false});
      if(!batch.length)batch=[strictThreeObservation({matched:false},canvas,'main','missing-proof','barrier')];
    }
    const failed=strictThreeFailedRechecks.get(canvas)||[];
    batch=[...batch,...failed];
    if(batch.every(o=>Number.isFinite(o?.frame?.captureSequence)))batch.sort((a,b)=>a.frame.captureSequence-b.frame.captureSequence);
    const current=batch.at(-1)?.frame || strictThreeFrames.get(canvas);
    strictThreeFailedRechecks.delete(canvas);
    const update=strictThreeCore.recent(strictThreeMainRecords,batch,{sameTarget:strictThreeSameTarget});
    strictThreeMainRecords=update.records;
    const decision=strictThreeCore.gate(update.records,{sameTarget:strictThreeSameTarget,currentFrame:current,newInput:update.added,originalAllowed:best.matched===true});
    strictThreeLastDecision=strictThreePublicDecision(decision);
    if(applies)best.strictThreeProof=strictThreeLastDecision;
    return decision;
  }
  function strictThreeRainbowProof(result,canvas,lane) {
    const proof=strictThreeObservation(result,canvas,lane,lane,String(result?.id||''),'rainbow');
    proof.rect=normalizeScoutRect(result?.rect,canvas.width,canvas.height);
    return proof;
  }
  function strictThreeGateExisting(records,currentProof,alive=()=>true) {
    const decision=strictThreeCore.gate(records.slice(-3),{sameTarget:strictThreeSameTarget,currentFrame:currentProof?.frame,alive,
      originalAllowed:currentProof?.matched===true,newInput:records.at(-1)===currentProof});
    strictThreeLastDecision=strictThreePublicDecision(decision);
    return decision;
  }


  // R27: an actual accepted text/Violetta pair may request one third fresh OCR.
  // Metadata only is retained locally; the existing final three-input gate decides.
  const SEMANTIC_THIRD_DISPATCH_ENABLED = !M35_SINGLE_CONFIRMATION_ENABLED && STRICT_THREE_INPUT_RESEARCH_ENABLED && window.__MALERT_RESEARCH_CONFIG?.semanticThirdDispatch === true &&
    ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname || '') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  const semanticThirdPairs = new WeakMap();
  const semanticThirdStats = {attempts:0,returnedTriples:0,unavailable:0,rejected:0,errors:0};
  function semanticThirdEligibleLabel(result) {
    return result?.label==='문자 입력형' || result?.label==='비올레타형';
  }
  function semanticThirdOwnedPair(pair,actual,canvas,first,firstCanvas,contour,marker) {
    if(SEMANTIC_THIRD_DISPATCH_ENABLED && semanticThirdEligibleLabel(actual)) {
      strictThreeOcrOwner(pair,canvas);
      semanticThirdPairs.set(pair,{actual,canvas,first,firstCanvas,contour,marker});
    }
    return pair;
  }
  function semanticThirdExactObservation(observation,result,canvas,identity) {
    return Boolean(observation && result?.matched===true && observation.matched===true &&
      observation.frame===strictThreeFrames.get(canvas) && strictThreeCore.usable(observation.frame) &&
      observation.lane==='main' && observation.policy==='semantic-ocr' && observation.location==='targeted' &&
      observation.identity===identity && observation.rect && result.rect &&
      ['x','y','w','h'].every(k=>observation.rect[k]===result.rect[k]));
  }
  function semanticThirdScopeCurrent(frame) {
    return Boolean(frame && !state.paused && frame.session===state.captureSessionId && frame.stream===state.stream &&
      frame.revision===state.monitorRegionRevision && frame.serial===state.rainbowDetectionSerial);
  }
  async function completeThirdSemanticPair(ocr,first,pair,firstCanvas,contour,marker,sessionIsCurrent) {
    if(!SEMANTIC_THIRD_DISPATCH_ENABLED || !semanticThirdEligibleLabel(first))return pair;
    const meta=semanticThirdPairs.get(pair),events=pair?.strictThreeEvidence,identity=strictThreeSemanticIdentity(first);
    if(!meta || meta.first!==first || meta.firstCanvas!==firstCanvas || meta.contour!==contour || meta.marker!==marker ||
      strictThreeOcrFrames.get(first)!==firstCanvas || strictThreeOcrFrames.get(meta.actual)!==meta.canvas || strictThreeOcrFrames.get(pair)!==meta.canvas ||
      !Array.isArray(events) || events.length!==2 || !semanticThirdExactObservation(events[0],first,firstCanvas,identity) ||
      !semanticThirdExactObservation(events[1],meta.actual,meta.canvas,identity) ||
      strictThreeSemanticIdentity(meta.actual)!==identity || strictThreeSemanticIdentity(pair)!==identity ||
      pair.matched!==meta.actual.matched || pair.rect!==meta.actual.rect || pair.score!==meta.actual.score || pair.threshold!==meta.actual.threshold ||
      !rectInsideSearchMonitorRegion(pair.rect,firstCanvas) ||
      (strictThreeFailedRechecks.get(firstCanvas)||[]).length || (strictThreeFailedRechecks.get(meta.canvas)||[]).length) {
      semanticThirdStats.unavailable++;return pair;
    }
    if(!sessionIsCurrent() || !semanticThirdScopeCurrent(events[1].frame))return null;
    // recent() copies its array; this projection never consumes or mutates the journal.
    const projected=strictThreeCore.recent(strictThreeMainRecords,events,{sameTarget:strictThreeSameTarget});
    const gate=strictThreeCore.gate(projected.records,{sameTarget:strictThreeSameTarget,currentFrame:events[1].frame,newInput:projected.added,originalAllowed:pair.matched===true});
    if(gate.status!=='PENDING_THIRD' || gate.votes!==2 || gate.selected.length!==2 || gate.selected[0]!==events[0] || gate.selected[1]!==events[1])return pair;
    const secondMarker=meta.canvas.auditFrameMarker;
    if(!secondMarker || secondMarker.kind!==events[1].frame.kind || secondMarker.value!==events[1].frame.value || secondMarker.provider!==events[1].frame.provider)return pair;
    semanticThirdStats.attempts++;
    try {
      // The original function captures and reads one new input after its unchanged delay.
      const third=await tryTargetedOcrRecheck(ocr,pair,meta.canvas,contour,secondMarker,sessionIsCurrent);
      if(!sessionIsCurrent() || !semanticThirdScopeCurrent(events[1].frame))return null;
      if(!third){semanticThirdStats.unavailable++;return pair;}
      const thirdMeta=semanticThirdPairs.get(third),fresh=third?.strictThreeEvidence?.at(-1);
      if(!thirdMeta || thirdMeta.first!==pair || thirdMeta.firstCanvas!==meta.canvas ||
        strictThreeOcrFrames.get(thirdMeta.actual)!==thirdMeta.canvas || strictThreeOcrFrames.get(third)!==thirdMeta.canvas ||
        !semanticThirdExactObservation(fresh,thirdMeta.actual,thirdMeta.canvas,identity)) {
        // An executed result with missing provenance is a barrier, never the old pair's success.
        const failed=strictThreeObservation({matched:false},null,'main','semantic-ocr',identity,'targeted');
        failed.rejection='THIRD_OCR_PROVENANCE_UNAVAILABLE';
        strictThreeFailedRechecks.set(firstCanvas,[...(strictThreeFailedRechecks.get(firstCanvas)||[]),failed]);
        semanticThirdStats.rejected++;return pair;
      }
      // Preserve the actual third semantic identity. Do not relabel a different result.
      const actualThird=strictThreeOcrObservation(thirdMeta.actual,thirdMeta.canvas,'targeted',strictThreeSemanticIdentity(thirdMeta.actual));
      const triple={...third,strictThreeEvidence:[events[0],events[1],actualThird]};
      strictThreeOcrOwner(triple,thirdMeta.canvas);
      if(!rectInsideSearchMonitorRegion(thirdMeta.actual.rect,thirdMeta.canvas)) {
        strictThreeFailedRecheck(firstCanvas,thirdMeta.canvas,first,'ocr','THIRD_OCR_MONITOR_REGION_REJECTED');
        semanticThirdStats.rejected++;
      }
      semanticThirdStats.returnedTriples++;
      return triple;
    } catch(error) {
      semanticThirdStats.errors++;throw error;
    } finally {
      // The original recheck keys its actual rejection to the second canvas. Finalize
      // reads the original main canvas: merge even on a thrown OCR error, then remove.
      const failures=strictThreeFailedRechecks.get(meta.canvas)||[];
      if(failures.length)strictThreeFailedRechecks.set(firstCanvas,[...(strictThreeFailedRechecks.get(firstCanvas)||[]),...failures]);
      strictThreeFailedRechecks.delete(meta.canvas);
    }
  }

  // R8: only retry the existing split Violetta route after a compact fixed read fails.
  // The switch is immutable, local-only, and absent/false by default.
  const FAST_VIOLETTA_SPLIT_AFTER_FIXED_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.fastViolettaSplitAfterFixed === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));

  // R9: accept only an actual click result from the shared yellow semantic path.
  const EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.earlyYellowAfterFixed === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));

  // R13: a captured, loopback-only route ordering flag; absent is false.
  const PREFER_FIXED_BEFORE_STRUCTURAL_TEXT_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.preferFixedBeforeStructuralText === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R18: only an eligible fresh yellow confirmation requests a readable search canvas.
  const READABLE_YELLOW_TARGETED_CAPTURE_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.readableYellowTargetedCapture === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R19: reuse the existing fixed-instruction OCR on the current fresh yellow recheck frame.
  const FIXED_YELLOW_TARGETED_RECHECK_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.fixedYellowTargetedRecheck === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R20: move one existing current-frame fixed-instruction attempt before broad click scans.
  const PREFER_FIXED_BEFORE_CLICK_SCANS_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.preferFixedBeforeClickScans === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R21: reorder only the two existing eligible yellow recheck routes.
  const PREFER_GENERAL_YELLOW_RECHECK_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.preferGeneralYellowRecheck === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  window.MAlertAppResearch=Object.freeze({researchSemanticThirdDispatchEnabled:()=>SEMANTIC_THIRD_DISPATCH_ENABLED,researchSemanticThirdDispatchStatus:()=>({...semanticThirdStats,scope:"ACTUAL_TEXT_VIOLETTA_PAIR_ONE_THIRD_READ_NOT_FINAL_ACCEPTANCE"}),researchPreferFixedBeforeStructuralTextEnabled:()=>PREFER_FIXED_BEFORE_STRUCTURAL_TEXT_RESEARCH_ENABLED,researchReadableYellowTargetedCaptureEnabled:()=>READABLE_YELLOW_TARGETED_CAPTURE_RESEARCH_ENABLED,researchFixedYellowTargetedRecheckEnabled:()=>FIXED_YELLOW_TARGETED_RECHECK_RESEARCH_ENABLED,researchPreferFixedBeforeClickScansEnabled:()=>PREFER_FIXED_BEFORE_CLICK_SCANS_RESEARCH_ENABLED,researchPreferGeneralYellowRecheckEnabled:()=>PREFER_GENERAL_YELLOW_RECHECK_RESEARCH_ENABLED});

  // Local-only research switch. Absent/false by default and frozen at page load.
  // Changing the caller's object later cannot affect cached frame decisions.
  const LOCAL_CLICK_COLOR_RESEARCH = Object.freeze({
    enabled: ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) &&
      window.__MALERT_RESEARCH_CONFIG?.excludeGenericOccupiedEntropy === true
  });

  // OPT25: local-only, immutable, default-off location connection research.
  const LOCAL_CLICK_LOCATION_RESEARCH = Object.freeze({
    enabled: ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) &&
      window.__MALERT_RESEARCH_CONFIG?.linkMainClickLocation === true
  });

  // Metadata follows the existing recent-record array. Replacing that array
  // on reset/other confirmation paths automatically drops this association.
  // Isolated association research. Absent flags leave original linking intact.
  const LINK_V3=Object.freeze({
    rotation:(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LINK_V3?.rotation===true,
    motion:(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_LINK_V3?.motion===true
  });
  const linkV3Owners=new WeakMap();
  const linkV3Families=new Map(['flat','tilted'].flatMap(f=>[-6,0,6].map(a=>['large:large-click-'+f+'-'+a,f])));
  const linkV3Stats={comparisons:0,rotationRescues:0,motionRescues:0,combinedRescues:0};
  function rememberLinkV3(o,canvas){
    if(o&&(LINK_V3.rotation||LINK_V3.motion)){
      const f=strictThreeFrames.get(canvas),native=canvas.nativeSource||canvas,m=canvas.auditFrameMarker,n=native.auditFrameMarker;
      const owned=Boolean(f&&strictThreeFrames.get(native)===f&&strictThreeCore.usable(f)&&
        m?.kind===f.kind&&m.value===f.value&&m.provider===f.provider&&n?.kind===f.kind&&n.value===f.value&&n.provider===f.provider&&
        f.session===o.sessionId&&f.stream===o.stream&&f.revision===o.revision&&f.width===o.width&&f.height===o.height&&f.sourceWidth===o.sourceWidth&&f.sourceHeight===o.sourceHeight);
      linkV3Owners.set(o,{frame:f,owned});
    }
    return o;
  }

  let m25AuxActive=null;
  function m25AuxTerm(name,value){
    if(m25AuxActive)try{m25AuxActive.evaluated[name]=typeof value==='boolean'?value:Boolean(value);}catch(_){}
    return value;
  }
  function m25AuxCompare(name,left,right,operator){
    let value;
    if(operator==='===')value=left===right;
    else if(operator==='!==')value=left!==right;
    else if(operator==='<')value=left<right;
    else if(operator==='>=')value=left>=right;
    else if(operator==='<=')value=left<=right;
    if(m25AuxActive)try{m25AuxActive.actualValues[name]={left,right,operator};}catch(_){}
    return m25AuxTerm(name,value);
  }
  function m25AuxReturn(value){if(m25AuxActive)m25AuxActive.result=value;return value;}
  function linkV3OwnedPair(a,b){
    const x=linkV3Owners.get(a),y=linkV3Owners.get(b);
    return Boolean(m25AuxTerm("owner-a-owned",(x?.owned))&&m25AuxTerm("owner-b-owned",(y?.owned))&&m25AuxTerm("owner-same-scope",(strictThreeCore.sameScope(x.frame,y.frame)))&&
      m25AuxCompare("owner-forward-marker",(x.frame.value),(y.frame.value),"<")&&m25AuxCompare("owner-forward-capture",(x.frame.capturedAt),(y.frame.capturedAt),"<")&&
      m25AuxCompare("owner-pair-provider",(a.marker?.provider),(b.marker?.provider),"===")&&m25AuxCompare("owner-frame-provider",(a.marker?.provider),(x.frame.provider),"===")&&
      m25AuxCompare("owner-a-marker",(a.marker?.value),(x.frame.value),"===")&&m25AuxCompare("owner-b-marker",(b.marker?.value),(y.frame.value),"===")&&
      m25AuxCompare("owner-a-capture",(a.capturedAt),(x.frame.capturedAt),">=")&&m25AuxCompare("owner-b-capture",(b.capturedAt),(y.frame.capturedAt),">=")&&
      m25AuxCompare("owner-a-completion",(a.completedAt),(a.capturedAt),">=")&&m25AuxCompare("owner-b-completion",(b.completedAt),(b.capturedAt),">=")&&
      m25AuxCompare("owner-within-six-seconds",(y.frame.capturedAt-x.frame.capturedAt),(6000),"<="));
  }
  function linkV3Geometry(x,y){
    const area=r=>r.w*r.h,ix=Math.max(0,Math.min(x.x+x.w,y.x+y.w)-Math.max(x.x,y.x)),iy=Math.max(0,Math.min(x.y+x.h,y.y+y.h)-Math.max(x.y,y.y));
    const intersection=ix*iy,coverageA=intersection/area(x),coverageB=intersection/area(y);
    const cx=x.x+x.w/2,cy=x.y+x.h/2,dx=y.x+y.w/2,dy=y.y+y.h/2;
    const mutualCenters=cx>=y.x&&cx<=y.x+y.w&&cy>=y.y&&cy<=y.y+y.h&&dx>=x.x&&dx<=x.x+x.w&&dy>=x.y&&dy<=x.y+x.h;
    const sizeW=Math.min(x.w,y.w)/Math.max(x.w,y.w),sizeH=Math.min(x.h,y.h)/Math.max(x.h,y.h);
    // Majority of BOTH actual detection boxes must overlap. A grid key,
    // prediction or transitive track identity never supplies a successful vote.
    return {compatible:sizeW>=.8&&sizeH>=.8&&coverageA>=.5&&coverageB>=.5&&mutualCenters,coverageA,coverageB,mutualCenters,sizeW,sizeH};
  }
  window.MAlertLinkContinuityV3=Object.freeze({status:()=>({flags:{...LINK_V3},...linkV3Stats,confirmationVotes:DETECTION_CONFIRM_COUNT,auxiliaryChanged:false})});

  const mainClickLocationWindows = new WeakMap();

  function mainClickLocationObservation(best, canvas, marker, scope, capturedAt, key) {
    const rect = best?.rect, bands = best?.guideScores || [];
    const sourceWidth=Number(canvas?.dataset?.sourceWidth),sourceHeight=Number(canvas?.dataset?.sourceHeight);
    if (!best?.matched || !['click-large-lines','click-fixed-lines'].includes(best.id) ||
        best.confirmationMode !== 'click-lines-3vote' || Number(best.requiredStreak) !== 3 ||
        marker?.kind !== 'frame-count' || !Number.isFinite(marker.value) ||
        !Number.isFinite(capturedAt) || !Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) ||
        sourceWidth<=0 || sourceHeight<=0 || !rect ||
        !['x','y','w','h'].every(k => Number.isFinite(rect[k])) || rect.w <= 0 || rect.h <= 0 ||
        rect.x < 0 || rect.y < 0 || rect.x + rect.w > canvas.width || rect.y + rect.h > canvas.height ||
        !bands.length || !bands.every(Number.isFinite)) return null;
    const hint = best.adaptiveHint;
    const observation={key, identity:String(best.voteIdentity || best.id), id:best.id,
      mode:best.confirmationMode, bands:bands.length,
      family:hint ? String(hint.kind || '') + ':' + String(hint.id || '') : 'no-hint',
      poseAngle:hint?.poseAngle ?? null,
      // referenceIndex selects small rotation variants of the SAME guide.
      // It is diagnostic data, not a physical object identifier.
      referenceIndex:hint?.referenceIndex ?? null,
      rect:{...rect}, marker:{...marker}, capturedAt, completedAt:performance.now(),
      sessionId:scope.sessionId, stream:scope.stream, revision:scope.revision,
      width:canvas.width, height:canvas.height,
      sourceWidth, sourceHeight};
    return rememberLinkV3(observation,canvas);
  }

  function compareMainClickLocations(a, b) {
    const reject = reason => ({compatible:false,reason});
    if (!a || !b) return reject('missing-observation');
    if (a.sessionId !== b.sessionId || a.stream !== b.stream || a.revision !== b.revision ||
        a.width !== b.width || a.height !== b.height ||
        a.sourceWidth !== b.sourceWidth || a.sourceHeight !== b.sourceHeight) return reject('capture-context');
    if (!(b.capturedAt > a.capturedAt) || !(b.completedAt >= a.completedAt) ||
        !isIndependentTargetedRecheckFrame(a.marker,b.marker)) return reject('non-forward-frame-or-time');
    const originalFamily=a.family===b.family;
    const knownFamily=linkV3Families.has(a.family)&&linkV3Families.get(a.family)===linkV3Families.get(b.family);
    const rotationCandidate=LINK_V3.rotation&&!originalFamily&&knownFamily&&a.bands===3&&b.bands===3;
    if (a.identity !== b.identity || a.id !== b.id || a.mode !== b.mode ||
        a.bands !== b.bands || (!originalFamily&&!rotationCandidate) || a.poseAngle !== b.poseAngle) return reject('guide-structure');
    const x=a.rect, y=b.rect;
    const sizeW=Math.min(x.w,y.w)/Math.max(x.w,y.w), sizeH=Math.min(x.h,y.h)/Math.max(x.h,y.h);
    const dx=Math.abs(x.x+x.w/2-y.x-y.w/2)/Math.min(x.w,y.w);
    const dy=Math.abs(x.y+x.h/2-y.y-y.h/2)/Math.min(x.h,y.h);
    const iou=calculateRectIoU(x,y);
    // Predeclared conservative connection guards; not detection/color floors.
    // Scout's center-distance OR alone can join unrelated or resized boxes.
    const compatible=sizeW>=.8 && sizeH>=.8 && dx<=.25 && dy<=.25 &&
      iou>=TARGETED_RECHECK_MIN_IOU && sameTargetedContourLocation(x,y,b.width,b.height);
    if(originalFamily&&compatible)return {compatible:true,reason:'compatible',iou,sizeW,sizeH,dx,dy};
    const needsMotion=!compatible;
    if((!originalFamily||needsMotion)&&!(LINK_V3.rotation||LINK_V3.motion))return {compatible:false,reason:'geometry',iou,sizeW,sizeH,dx,dy};
    if(needsMotion&&!LINK_V3.motion)return {compatible:false,reason:'geometry',iou,sizeW,sizeH,dx,dy};
    if(!knownFamily||a.bands!==3||b.bands!==3||!linkV3OwnedPair(a,b))return {compatible:false,reason:'new-link-context-unavailable',iou,sizeW,sizeH,dx,dy};
    const motion=needsMotion?linkV3Geometry(x,y):null,linked=compatible||motion?.compatible===true;
    linkV3Stats.comparisons++;
    if(linked){if(rotationCandidate&&needsMotion)linkV3Stats.combinedRescues++;else if(rotationCandidate)linkV3Stats.rotationRescues++;else linkV3Stats.motionRescues++;}
    return {compatible:linked,reason:linked?(rotationCandidate?(needsMotion?'v3-rotation-and-majority-overlap':'v3-rotation'):'v3-majority-overlap'):'geometry',iou,sizeW,sizeH,dx,dy,motion};
  }

  function igCollectMain(best, canvas, marker, scope, capturedAt, key) {
    const windowKeys=state.voteWindow;
    let rows=mainClickLocationWindows.get(windowKeys) || [];
    const current=mainClickLocationObservation(best,canvas,marker,scope,capturedAt,key);
    rows=[...rows,{key,observation:current}].slice(-windowKeys.length);
    // No reconstruction of missing history, old successes, or foreign lanes.
    if (rows.length !== windowKeys.length || rows.some((r,i)=>r.key!==windowKeys[i])) {
      rows=windowKeys.map((k,i)=>({key:k,observation:i===windowKeys.length-1?current:null}));
    }
    mainClickLocationWindows.set(windowKeys,rows);
    const eligible=Boolean(best?.matched && ['click-large-lines','click-fixed-lines'].includes(best.id) &&
      best.confirmationMode==='click-lines-3vote' && Number(best.requiredStreak)===3);
    const legacyVotes=key===null?0:windowKeys.filter(k=>k===key).length;
    const observations=rows.map(r=>r.observation ? {...r.observation,stream:undefined} : null);
    if (!current) return {eligible,votes:eligible?1:0,legacyVotes,reason:'unavailable-current-metadata',observations,pairChecks:[]};
    // Failure/non-click records still occupy the original last-three window.
    // Do not choose a favorable subset when two live observations disagree.
    const selectedRows=M35_SINGLE_CONFIRMATION_ENABLED?rows.slice(-1):(DETECTION_CONFIRM_COUNT===2?rows.slice(-2):rows);
    const live=selectedRows.map((r,index)=>({o:r.observation,index})).filter(r=>r.o);
    const pairChecks=[];
    for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
      pairChecks.push({from:live[i].index,to:live[j].index,...compareMainClickLocations(live[i].o,live[j].o)});
    }
    const compatible=pairChecks.every(p=>p.compatible);
    return {eligible,votes:compatible?Math.min(DETECTION_CONFIRM_COUNT,live.length):1,legacyVotes,
      reason:compatible?'all-recent-observations-compatible':'ambiguous-or-incompatible-window',observations,pairChecks};
  }

  const CONFIG_KEY = "mAlert.lieOnly.v1139";
  const LEGACY_CONFIG_KEYS = [
    "mAlert.lieOnly.v1137",
    "mAlert.lieOnly.v1136",
    "mAlert.lieOnly.v1135",
    "mAlert.lieOnly.v1134",
    "mAlert.lieOnly.v1133",
    "mAlert.lieOnly.v1132",
    "mAlert.lieOnly.v1123"
  ];
  // 후보 사각형이 감시 영역 안이라고 인정하는 최소 겹침 비율.
  const MONITOR_REGION_MIN_OVERLAP = 0.6;
  const REFERENCE_WIDTH = 960;
  const SEARCH_WIDTH = 1536;
  const PORTRAIT_DISPLAY_SCALE = 1.5;
  // 확정 후보로 인정할 팝업 템플릿 ID 목록.
  // ocr-engine.js의 POPUP_TEMPLATE_ID_PATTERN과 반드시 동일하게 유지할 것.
  const POPUP_TEMPLATE_ID_PATTERN =
    /^(78001|77983|77984|77986|77987|77988|77997|click-prompt|inline-click-88992|inline-click-88993|inline-click-94425|transparent-click-88946|transparent-shape-77982)$/;
  const INLINE_CLICK_HINT_ID_PATTERN = /^(inline-click-88992|inline-click-88993|inline-click-94425)$/;
  const TEXT_INPUT_HINT_ID_PATTERN = /^text-input-prompt-/;
  const CANDIDATE_MAX_WIDTH = 900;
  const ANALYSIS_INTERVAL_MS = 2500;
  const FAST_RECHECK_INTERVAL_MS = 700;
  // P4-R12: 기존 2표 기준은 유지하되, 첫 강한 윤곽 후보 뒤 두 번째 독립 프레임은
  // 동일 템플릿/배율/모드만 정밀 재검사해 full matcher 재실행 지연을 줄인다.
  const TARGETED_RECHECK_MIN_GAP_MS = FAST_RECHECK_INTERVAL_MS;
  const TARGETED_RECHECK_MIN_IOU = 0.50;
  const TARGETED_RECHECK_MAX_CENTER_DISTANCE = 0.03;
  // 두 번째 프레임에서 full contour가 선택할 수 있는 고신뢰 후보군을 모두 함께 검사한다.
  // 이 후보군에서 첫 템플릿이 그대로 승자일 때만 빠른 2표를 인정해 기존 full recheck보다 느슨해지지 않게 한다.
  const TARGETED_RECHECK_STRONG_IDS = Object.freeze([
    "78001", "77983", "77984", "77986", "77987", "77988", "77997",
    "click-prompt", "transparent-click-88946", "transparent-shape-77982"
  ]);
  const OCR_FRAME_EVIDENCE_INTERVAL_MS = 650;
  const OCR_FRAME_EVIDENCE_MAX = 2;
  const PRIORITY_COLOR_START_AFTER_MS = 1000;
  const PRIORITY_COLOR_INTERVAL_MS = 750;
  const PRIORITY_COLOR_MAX_AGE_MS = 1500;
  const PRIORITY_COLOR_WINDOW_MS = 6000;
  const RAINBOW_SCOUT_INTERVAL_MS = 800;
  const ANALYSIS_SCHEDULER_TICK_MS = 100;
  const RAINBOW_RECOVERY_SCOUT_INTERVAL_MS = 1500;
  const RAINBOW_FOCUS_INTERVAL_MS = 300;
  const RAINBOW_FOCUS_WINDOW_MS = 1800;
  const RAINBOW_EVIDENCE_WINDOW_MS = 1600;
  const RAINBOW_NEAR_MARGIN = 0.04;
  const RAINBOW_STRONG_MARGIN = 0.04;
  const RAINBOW_RECOVERY_EVIDENCE_WINDOW_MS = 2200;
  const RAINBOW_EVIDENCE_WINDOW_MAX_MS = 6500;
  const RAINBOW_RECOVERY_EVIDENCE_WINDOW_MAX_MS = 8000;
  const RAINBOW_RECOVERY_COMPANION_FLOOR = 0.34;
  const RAINBOW_RECOVERY_STRONG_MARGIN = 0.04;
  const RAINBOW_RECOVERY_COMPANION_MARGIN = 0.02;
  const RAINBOW_RECOVERY_REQUIRED_VOTES = 3;
  const RAINBOW_RECOVERY_OCR_VOTES = 2;
  const REQUIRED_STREAK = 2;
  const MISS_RESET_COUNT = 2;
  const NEAR_MATCH_MARGIN = 0.06;
  const RELAXED_MATCH_MARGIN = 0.04;
  const STRONG_SINGLE_MARGIN = 0.14;
  const SHARE_HEALTH_CHECK_INTERVAL_MS = 2000;
  const SHARE_FRAME_STALL_WARNING_MS = 15000;
  const SHARE_TRACK_MUTE_WARNING_MS = 10000;
  const SHARE_ANALYSIS_STALL_WARNING_MS = 35000;
  // P4-R5: R4 단축 timeout은 저사양 worker 재초기화 빈도를 높일 수 있어 R3 기준으로 복원한다.
  const PRIMARY_OCR_TIMEOUT_MS = 12000;
  const RECOVERY_OCR_TIMEOUT_MS = 12000;
  const SHARE_BLACK_CONFIRMATIONS = 6;
  const SHARE_HEALTH_ALERT_COOLDOWN_MS = 60000;

  const DEFAULT_CONFIG = {
    threshold: 0.75,
    voiceText: "거짓말 탐지기가 확인되었습니다.",
    voiceURI: "",
    volume: 0.9,
    rate: 1,
    cooldownSeconds: 30,
    screenMode: "landscape",
    monitorRegion: {
      x: 0,
      y: 0,
      w: 1,
      h: 1
    }
  };

  const ALERT_TYPE_COOLDOWN_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_ALERT_TYPE_COOLDOWN_EXPERIMENT===true;
  const alertTypeLastEmittedAt=new Map();
  function alertCooldownTypeKey(label){
    if(label==='클릭형 거탐'||label==='투명 클릭형')return 'click';
    if(label==='문자 입력형'||label==='투명 문자형')return 'text';
    return null;
  }
  function alertTypeFixtureSync(){if(ALERT_TYPE_COOLDOWN_ENABLED&&state.lastAlertAt===0)alertTypeLastEmittedAt.clear();}
  function alertTypeCooldownAllows(best,now,cooldownMs,lane){
    const lastGlobalAt=state.lastAlertAt,legacyPassed=now-lastGlobalAt>=cooldownMs;
    if(ALERT_TYPE_COOLDOWN_ENABLED)alertTypeFixtureSync();
    const key=best?.matched===true?alertCooldownTypeKey(best.label):null;
    const lastTypeAt=ALERT_TYPE_COOLDOWN_ENABLED&&key?(alertTypeLastEmittedAt.get(key)??0):null;
    const selectedPassed=ALERT_TYPE_COOLDOWN_ENABLED&&key?now-lastTypeAt>=cooldownMs:legacyPassed;
    try{if(typeof m39DisabledAlertGate==='function')m39DisabledAlertGate({
      at:performance.now(),dateNow:now,actualCooldownMs:cooldownMs,lastGlobalAt,key,lastTypeAt,
      legacyPassed,selectedPassed,lane,label:best?.label??null,matched:best?.matched===true,
      active:ALERT_TYPE_COOLDOWN_ENABLED,log:selectedPassed?'ALLOWED': 'COOLDOWN_BLOCKED'});}catch(_){}
    return selectedPassed;
  }
  function recordActualAlertType(typeLabel){
    if(!ALERT_TYPE_COOLDOWN_ENABLED)return;
    alertTypeFixtureSync();
    const key=alertCooldownTypeKey(typeLabel);
    if(key)alertTypeLastEmittedAt.set(key,Date.now());
  }
  window.MAlertAlertTypeCooldownResearch=Object.freeze({status:()=>({
    enabled:ALERT_TYPE_COOLDOWN_ENABLED,active:ALERT_TYPE_COOLDOWN_ENABLED,defaultOff:true,
    policy:'Exact click/text label aliases only; same-type actual emit wall clock; unknown labels retain global cooldown',
    lastEmittedByType:ALERT_TYPE_COOLDOWN_ENABLED?Object.fromEntries(alertTypeLastEmittedAt):{},
    globalZeroFixtureReset:true,globalLastAlertAtPreserved:true})});

  const state = {
    config: loadConfig(),
    stream: null,
    captureSessionId: 0,
    monitorRegionRevision: 0,
    paused: false,
    cvReady: false,
    ocrReady: false,
    ocrLoading: false,
    ocrLoadPromise: null,
    ocrLast: null,
    ocrFrameEvidenceActive: false,
    ocrFrameEvidenceLastAt: 0,
    ocrFrameEvidence: [],
    completedAnalyses: 0,
    model: null,
    templates: new Map(),
    edgeTemplates: new Map(),
    overlayTemplates: new Map(),
    analysisBusy: false,
    analysisPhase: "idle",
    largeGuideFocusIssued: false,
    analysisSchedulerTimer: null,
    busySchedulerSkips: 0,
    consecutiveScoutStarts: 0,
    priorityColorBusy: false,
    priorityColorEpoch: 0,
    priorityColorEvidence: [],
    priorityColorLastFrame: null,
    lastPriorityColorAt: -PRIORITY_COLOR_INTERVAL_MS,
    rainbowScoutBusy: false,
    rainbowScoutScans: 0,
    rainbowLastScoutDurationMs: 0,
    rainbowLastRecoveryDurationMs: 0,
    lastRainbowScoutAt: 0,
    lastRainbowRecoveryScoutAt: -RAINBOW_RECOVERY_SCOUT_INTERVAL_MS,
    rainbowScoutDelayMs: RAINBOW_SCOUT_INTERVAL_MS,
    rainbowFocusUntil: 0,
    rainbowEvidence: [],
    rainbowLastCandidate: null,
    rainbowRecoveryEvidence: [],
    rainbowRecoveryOcrBusy: false,
    rainbowRecoveryLastOcrAt: 0,
    rainbowDetectionSerial: 0,
    lastAnalysisAt: 0,
    nextAnalysisDelayMs: ANALYSIS_INTERVAL_MS,
    streak: 0,
    voteWindow: [],
    inlineFallbackVotes: [],
    misses: 0,
    candidateId: null,
    detected: false,
    lastAlertAt: 0,
    animationFrame: null,
    previewLastAt: 0,
    frameHeartbeatAt: 0,
    lastCandidateRects: [],
    lastBestRect: null,
    lastAnalysisBest: null,
    lastAlertSnapshot: null,
    snapshotBusy: false,
    analysisStartedAt: 0,
    lastAnalysisProgressAt: 0,
    analysisProgressPhase: "idle",
    lastAnalysisCompletedAt: 0,
    lastAnalysisDurationMs: 0,
    pendingLatestAnalysis: false,
    shareHealthTimer: null,
    shareHealthFrameRequest: null,
    shareHealthTrack: null,
    shareHealthLastFrameAt: 0,
    shareHealthLastCurrentTime: -1,
    shareHealthLastFrameCount: -1,
    shareHealthMutedAt: 0,
    shareHealthBlackSamples: 0,
    shareHealthIssue: null,
    shareHealthLastAlertAt: 0,
    shareHealthStartedAt: 0,
    shareHealthLowResolution: false,
    regionSelecting: false,
    regionPointerId: null,
    regionStart: null,
    regionDraft: null
  };

  const $ = (selector) => document.querySelector(selector);
  const video = $("#captureVideo");
  const previewCanvas = $("#previewCanvas");
  const previewContext = previewCanvas.getContext("2d", { alpha: false });
  const shareHealthCanvas = document.createElement("canvas");
  shareHealthCanvas.width = 32;
  shareHealthCanvas.height = 18;
  const shareHealthContext = shareHealthCanvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true
  });

  for (const key of [
    "mAlert.public.firstRunAccepted.v1",
    "mAlert.public.firstRunAccepted.v2",
    "mAlert.public.mobilePreview.v1",
    "mAlert.public.mobilePreview.v2"
  ]) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  document
    .querySelectorAll(".first-run-overlay, #firstRunOverlay")
    .forEach((element) => element.remove());

  // Read-only bridge: optional helpers never write detector state or own capture.
  window.MAlertAssistBridge = Object.freeze({
    video: () => video,
    snapshot: () => ({
      running: !!state.stream, paused: state.paused, session: state.captureSessionId,
      width: video.videoWidth, height: video.videoHeight,
      busy: state.analysisBusy, scoutBusy: state.rainbowScoutBusy || state.priorityColorBusy,
      confirming: state.streak > 0 || hasPendingLargeGuideVotes(performance.now()) || pendingPriorityColorVoteCount() > 0,
      regionSelecting: state.regionSelecting, analysisStartedAt: state.analysisStartedAt,
      critical: !$('#urgentOverlay').hidden, analyses: state.completedAnalyses,
      lastAnalysisDurationMs: state.lastAnalysisDurationMs,
      displaySurface: state.stream?.getVideoTracks?.()[0]?.getSettings?.().displaySurface || null
    }),
    voiceOptions: () => ({ volume: state.config.volume, rate: state.config.rate, voice: selectVoice() }),
    testCriticalVoice: () => speak('거짓말탐지기 우선 알림 테스트입니다. 실제 감지 상황은 아닙니다.')
  });

  // DIAG1-BEGIN: numeric read-only snapshot; no detector writes or image reads.
  window.MAlertDiagnosticsBridge = Object.freeze({snapshot: () => {
    const raw=String(state.candidateId||state.lastAnalysisBest?.id||'');
    const candidate=!raw?'none':/violetta|비올레타/i.test(raw)?'violetta':/sentence|문장/i.test(raw)?'sentence':/shape|도형/i.test(raw)?'shape':/click|클릭/i.test(raw)?'click':/input|text|문자/i.test(raw)?'text':'unknown';
    return {captureSerial:state.captureSessionId,running:!!state.stream,paused:!!state.paused||!!state.regionSelecting,
      width:video.videoWidth,height:video.videoHeight,surface:state.stream?.getVideoTracks?.()[0]?.getSettings?.().displaySurface||'unknown',
      analysisMs:state.analysisBusy&&state.analysisStartedAt>0?Math.max(0,performance.now()-state.analysisStartedAt):state.lastAnalysisDurationMs,
      phase:state.analysisPhase,analyses:state.completedAnalyses,votes:Math.max(state.streak||0,state.largeGuideEvidence?.length||0,state.rainbowEvidence?.length||0,state.rainbowRecoveryEvidence?.length||0,pendingPriorityColorVoteCount()),
      candidate,candidateScore:Number.isFinite(state.lastAnalysisBest?.score)?state.lastAnalysisBest.score:-1,
      analysisBusy:!!state.analysisBusy,cvReady:!!state.cvReady,ocrReady:!!state.ocrReady,cooldownSeconds:state.config.cooldownSeconds,
      detected:!!state.detected,lastAlertAt:state.lastAlertAt};
  }});
  // DIAG1-END

  initialize();

  async function initialize() {
    syncVersionBadge();
    hydrateControls();
    bindEvents();
    populateVoiceSelect();
    await loadModelManifest();
    updateUi();
    scheduleHybridEngineLoad();
  }

  // 버전 표기가 index.html에 하드코딩된 채 뒤처지지 않도록
  // 실제 빌드 버전으로 배지를 덮어쓴다.
  function syncVersionBadge() {
    const badge = $("#appVersionBadge");
    if (badge) {
      badge.textContent = 'M400-P2 · 정식 버전';
    }
  }

  function bindEvents() {
    $("#startCaptureBtn").addEventListener("click", startCapture);
    $("#pauseBtn").addEventListener("click", togglePause);
    $("#stopCaptureBtn").addEventListener("click", stopCapture);
    $("#notificationBtn").addEventListener("click", requestNotificationPermission);
    $("#runAnalysisBtn").addEventListener("click", runImmediateAnalysis);
    $("#selfTestBtn").addEventListener("click", runBuiltInTest);
    $("#saveCurrentSampleBtn").addEventListener(
      "click",
      () => saveCalibrationSample("current")
    );
    $("#saveFalsePositiveBtn").addEventListener(
      "click",
      () => saveCalibrationSample("false-positive")
    );
    $("#saveLastAlertBtn").addEventListener(
      "click",
      saveLastAlertSnapshot
    );
    $("#selectRegionBtn").addEventListener(
      "click",
      beginMonitorRegionSelection
    );
    $("#resetRegionBtn").addEventListener(
      "click",
      resetMonitorRegion
    );
    $("#screenModeLandscapeBtn").addEventListener("click", () => setScreenMode("landscape"));
    $("#screenModePortraitBtn").addEventListener("click", () => setScreenMode("portrait"));

    previewCanvas.addEventListener(
      "pointerdown",
      handleRegionPointerDown
    );
    previewCanvas.addEventListener(
      "pointermove",
      handleRegionPointerMove
    );
    previewCanvas.addEventListener(
      "pointerup",
      handleRegionPointerUp
    );
    previewCanvas.addEventListener(
      "pointercancel",
      cancelMonitorRegionSelection
    );

    $("#testVoiceBtn").addEventListener("click", () => {
      speak(state.config.voiceText);
      addLog("음성 테스트", state.config.voiceText);
    });
    $("#dismissAlertBtn").addEventListener("click", () => {
      $("#urgentOverlay").hidden = true;
    });
    $("#clearLogBtn").addEventListener("click", () => {
      $("#eventLog").innerHTML = '<p class="empty-log">아직 발생한 알림이 없습니다.</p>';
    });

    $("#voiceTextInput").addEventListener("change", (event) => {
      state.config.voiceText = event.target.value.trim() || DEFAULT_CONFIG.voiceText;
      event.target.value = state.config.voiceText;
      saveConfig();
    });

    $("#voiceSelect").addEventListener("change", (event) => {
      state.config.voiceURI = event.target.value;
      saveConfig();
    });

    $("#volumeInput").addEventListener("input", (event) => {
      state.config.volume = Number(event.target.value);
      $("#volumeOutput").textContent = `${Math.round(state.config.volume * 100)}%`;
      saveConfig();
    });

    $("#rateInput").addEventListener("input", (event) => {
      state.config.rate = Number(event.target.value);
      $("#rateOutput").textContent = `${state.config.rate.toFixed(2)}×`;
      saveConfig();
    });

    $("#cooldownInput").addEventListener("change", (event) => {
      state.config.cooldownSeconds = clampNumber(event.target.value, 10, 300, DEFAULT_CONFIG.cooldownSeconds);
      event.target.value = state.config.cooldownSeconds;
      saveConfig();
    });

    window.addEventListener("beforeunload", stopCapture);

    if ("speechSynthesis" in window) {
      // voiceschanged를 한 번만 구독한다. addEventListener와 onvoiceschanged를
      // 동시에 걸면 음성 목록이 갱신될 때 populateVoiceSelect가 두 번 실행된다.
      if (typeof window.speechSynthesis.addEventListener === "function") {
        window.speechSynthesis.addEventListener("voiceschanged", populateVoiceSelect);
      } else {
        window.speechSynthesis.onvoiceschanged = populateVoiceSelect;
      }
    }
  }

  function hydrateControls() {
    $("#voiceTextInput").value = state.config.voiceText;
    $("#volumeInput").value = state.config.volume;
    $("#volumeOutput").textContent = `${Math.round(state.config.volume * 100)}%`;
    $("#rateInput").value = state.config.rate;
    $("#rateOutput").textContent = `${state.config.rate.toFixed(2)}×`;
    $("#cooldownInput").value = state.config.cooldownSeconds;
    updateScreenModeUi();
  }

  function normalizeScreenMode(value) {
    return value === "portrait" ? "portrait" : "landscape";
  }

  function updateScreenModeUi() {
    const mode = normalizeScreenMode(state.config.screenMode);
    const landscapeButton = $("#screenModeLandscapeBtn");
    const portraitButton = $("#screenModePortraitBtn");
    const status = $("#screenModeStatus");
    if (landscapeButton) {
      landscapeButton.classList.toggle("active", mode === "landscape");
      landscapeButton.setAttribute("aria-pressed", String(mode === "landscape"));
    }
    if (portraitButton) {
      portraitButton.classList.toggle("active", mode === "portrait");
      portraitButton.setAttribute("aria-pressed", String(mode === "portrait"));
    }
    if (status) {
      status.textContent = mode === "portrait"
        ? "세로 기준 · Windows 150% 배율 보정"
        : "가로 기준 · M400-P2 감지";
    }
  }

  function setScreenMode(mode) {
    const next = normalizeScreenMode(mode);
    if (state.config.screenMode === next) {
      updateScreenModeUi();
      return;
    }
    state.config.screenMode = next;
    saveConfig();
    // 진행 중인 OCR/투표가 이전 화면 기준으로 완료되어 섞이지 않게 현재 분석 문맥을 폐기한다.
    state.monitorRegionRevision += 1;
    resetDetection();
    updateScreenModeUi();
    addLog(
      "화면 기준",
      next === "portrait"
        ? "세로 기준으로 변경했습니다. 150% 배율 정규화 후 R39 판정기를 사용합니다."
        : "가로 기준으로 변경했습니다. R39 분석 경로를 사용합니다."
    );
  }

  // P4-R7: stable 채널에는 LS2.2 성능 런타임 프로파일이 없다.
  // 채널 간 helper 포팅 누락으로 OCR 전체가 ReferenceError로 중단되지 않도록 정식 R16은 고정 예산을 사용한다.
  // OPT8: recovery shares the original analysis clock, rather than opening
  // another 14 s window after primary OCR. Keep the primary OCR allowance:
  // shortening it indiscriminately regresses readable legacy prompts.
  const ANALYSIS_BUDGET_MS = 14000;
  function remainingAnalysisBudgetMs() {
    return state.analysisStartedAt>0 ? Math.max(0,ANALYSIS_BUDGET_MS-(performance.now()-state.analysisStartedAt)) : ANALYSIS_BUDGET_MS;
  }
  function blueSearchRegionOptions(canvas) {
    if(isFullMonitorRegion() || canvas?.dataset?.screenMode==='portrait')return {};
    const r=normalizeMonitorRegion(state.config.monitorRegion);
    return {allowedSearchRect:{x:r.x*canvas.width,y:r.y*canvas.height,w:r.w*canvas.width,h:r.h*canvas.height}};
  }
  async function budgetedOcr(ocr,canvas,options={}) {
    options=m36ScopedTextOcrOptions(canvas,options);
    assertOcrCanvasSession(canvas);
    assertOcrFrameNotExpired(canvas);
    if(OCR_FRAME_YIELD_ENABLED)options={...options,r3FramePolicy:ocrFramePolicy(canvas,options)};
    // Both discovery and a semantic hit's independent confirmation retain a
    // bounded OCR allowance. The shared deadline limits only queued recovery.
    // The scout may briefly occupy the main thread while the OCR worker posts
    // its result. Keep a bounded 2 s delivery grace for primary reads so that
    // the new parallel check does not turn a legacy result into a timeout.
    const latencyOcrToken=m39ReleaseLatencyAudit.enter('app.budgetedOcr',[canvas,options],{phase:state.analysisPhase,analysisStartedAt:state.analysisStartedAt});
    try{m39ReleaseObservationNoop?.(canvas,{stage:'OCR_REQUEST',options:{confirmationLabel:options.confirmationLabel,confirmationRect:options.confirmationRect,preferredRects:options.preferredRects,blueInputOnly:options.blueInputOnly,textInputOnly:options.textInputOnly,inlineFixedOnly:options.inlineFixedOnly,inlineContourOnly:options.inlineContourOnly,contourBest:options.contourBest,contourCandidates:options.contourCandidates,allowedSearchRect:options.allowedSearchRect,confirmationGuides:options.confirmationGuides},capture:m4Context(canvas)});}catch{}
    const budget=options.confirmationRect?Math.min(getPrimaryOcrTimeoutMs(),12000):getPrimaryOcrTimeoutMs()+2000;
    const result=await withDetectorTimeout(ocr.analyze(canvas,{...options,...blueSearchRegionOptions(canvas),nativeSource:canvas.nativeSource||canvas}),budget);m39ReleaseLatencyAudit.exit(latencyOcrToken,result);
    try{m39ReleaseObservationNoop?.(canvas,{stage:'OCR_RAW_RETURN_BEFORE_CONTEXT_VALIDATION',result,capture:m4Context(canvas)});}catch{}
    assertOcrCanvasSession(canvas);
    if(STRICT_THREE_INPUT_RESEARCH_ENABLED)return strictThreeOcrOwner(await validateShapeOcrResult(result,canvas,options),canvas);
    return validateShapeOcrResult(result,canvas,options);
  }

  async function validateShapeOcrResult(result,canvas,options={}) {
    if(!result?.matched || !(['도형 이동형','투명 도형형'].includes(result.label) || /마우스 이동.*테스트|도형 이동/.test(String(result.reason||''))))return result;
    if(!result.rect||![result.rect.x,result.rect.y,result.rect.w,result.rect.h].every(Number.isFinite)||result.rect.w<=0||result.rect.h<=0)return {...result,matched:false,reason:'도형 OCR 위치 증거 오류'};
    // Mouse-guide OCR alone cannot bypass the panel's fixed title and two bands.
    // A previous frame's contour is only a location hint; verify current pixels.
    const verifier=window.MAlertPanelGuide?.verifyShapeCandidate;
    if(!verifier)return {...result,matched:false,reason:'도형 제목·두 안내문 검증 API 없음'};
    const candidates=[options.contourBest,...(options.contourCandidates||[])].filter(c=>c?.id==='transparent-shape-77982'&&c.rect);
    for(const candidate of candidates){
      try {
        const verified=await verifier(canvas,{...candidate,rect:candidate.contourRect||candidate.rect});
        if(!verified?.matched||!verified.rect||!rectInsideSearchMonitorRegion(verified.rect,canvas)||
          (verified.evidenceRects||[]).some(r=>!rectInsideSearchMonitorRegion(r,canvas)))continue;
        const a=result.rect,b=verified.rect;if(!a)continue;
        const overlap=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
        if(overlap/Math.max(1,Math.min(a.w*a.h,b.w*b.h))<.80)continue;
        return {...result,shapeGuideVerified:true,shapeGuideScores:verified.scores,shapeGuideRect:verified.rect};
      }catch(error){ /* Optional verification fails closed, preserving raw OCR. */ }
    }
    return {...result,matched:false,reason:'도형 OCR 문구만 확인 · 고정 제목과 두 안내문 미충족'};
  }

  function getPrimaryOcrTimeoutMs() {
    return PRIMARY_OCR_TIMEOUT_MS;
  }

  function getRecoveryOcrTimeoutMs() {
    return RECOVERY_OCR_TIMEOUT_MS;
  }

  function getRecoveryOcrTotalBudgetMs() {
    return 14000;
  }

  async function loadModelManifest() {
    const model = {
      modelVersion: "M400-P2",
      updatedAt: "2026.10.21",
      profiles: [
        { label: "투명 문자형" },
        { label: "투명 클릭형" },
        { label: "투명 도형형" },
        { label: "클릭형 거탐" },
        { label: "문자 입력형" },
        { label: "비올레타형" },
        { label: "거짓말 탐지기 팝업" }
      ]
    };
    state.model = model;
    $("#modelVersion").textContent = model.modelVersion;
    $("#modelUpdatedAt").textContent = model.updatedAt;
    $("#profileCount").textContent = `${model.profiles.length}종`;
    $("#candidateCount").textContent = "0개";
    const grid = $("#profileGrid");
    grid.innerHTML = "";
    for (const profile of model.profiles) {
      const item = document.createElement("span");
      item.textContent = profile.label;
      grid.appendChild(item);
    }
    addLog("문구 엔진", "M400-P2 글자 윤곽 패턴과 OCR 프로필을 준비했습니다.");
  }

  function scheduleHybridEngineLoad() {
    const load = () => {
      ensureOcrLoaded().catch((error) => {
        console.warn("문구 엔진 준비 실패:", error);
        setStatusChip($("#cvStatus"), "error", "글자 윤곽/OCR 오류");
        addLog("OCR", `글자 윤곽·OCR 준비 실패: ${error.message || error}`);
      });
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 900 });
    else setTimeout(load, 120);
  }

  function ensureOcrLoaded() {
    if (state.ocrReady && window.MAlertOcr) {
      return Promise.resolve(window.MAlertOcr);
    }

    if (state.ocrLoadPromise) return state.ocrLoadPromise;
    if (!window.MAlertOcr) {
      return Promise.reject(new Error("OCR 엔진 스크립트를 찾을 수 없습니다."));
    }

    state.ocrLoading = true;
    window.MAlertOcr.setStatusCallback((text) => {
      if (!state.analysisBusy) {
        $("#lastAnalysis").textContent = text;
      }
    });

    state.ocrLoadPromise = window.MAlertOcr.init()
      .then(() => {
        state.ocrReady = true;
        state.cvReady = true;
        state.ocrLoading = false;
        setStatusChip($("#cvStatus"), "ready", "글자 윤곽 + OCR 준비");
        addLog("문구 엔진 준비", "팝업 외형 없이 고신뢰 글자 윤곽과 한글/영문 OCR 엔진이 준비되었습니다.");
        return window.MAlertOcr;
      })
      .catch((error) => {
        state.ocrReady = false;
        state.ocrLoading = false;
        state.ocrLoadPromise = null;
        throw error;
      });

    return state.ocrLoadPromise;
  }

  function collectOcrPreferredRects(imageBest, frameWidth, frameHeight) {
    const rects = [];
    const add = (rect) => {
      if (!rect) return;
      const x = Math.max(0, Number(rect.x || 0));
      const y = Math.max(0, Number(rect.y || 0));
      const w = Math.min(frameWidth - x, Math.max(1, Number(rect.w || 0)));
      const h = Math.min(frameHeight - y, Math.max(1, Number(rect.h || 0)));
      if (w <= 1 || h <= 1) return;
      const duplicate = rects.some((item) =>
        Math.abs(item.x - x) < 12 &&
        Math.abs(item.y - y) < 12 &&
        Math.abs(item.w - w) < 18 &&
        Math.abs(item.h - h) < 18
      );
      if (!duplicate) rects.push({ x, y, w, h });
    };

    const candidates = [...(imageBest?.candidates || [])];
    const eligible = POPUP_TEMPLATE_ID_PATTERN;
    candidates
      .filter((candidate) => eligible.test(String(candidate?.id || "")))
      .filter((candidate) => Number(candidate?.score || -1) >= Number(candidate?.threshold || 1) - 0.22)
      .sort((a, b) =>
        (Number(b?.score || -1) - Number(b?.threshold || 1)) -
        (Number(a?.score || -1) - Number(a?.threshold || 1))
      )
      .slice(0, 2)
      .forEach((candidate) => add(candidate.rect));

    if (!TEXT_INPUT_HINT_ID_PATTERN.test(String(imageBest?.id || ""))) add(imageBest?.rect);
    for (const candidate of candidates) {
      if (TEXT_INPUT_HINT_ID_PATTERN.test(String(candidate?.id || ""))) continue;
      if (candidate?.score >= Number(candidate?.threshold || 1) + 0.05) add(candidate.rect);
      if (rects.length >= 4) break;
    }
    return rects;
  }

  function candidateLooksLikeClick(imageBest) {
    const text = `${imageBest?.id || ""} ${imageBest?.label || ""} ${imageBest?.detectionPath || ""}`.toLowerCase();
    if (/click|클릭/.test(text)) return true;
    return (imageBest?.candidates || []).some((candidate) => {
      const candidateText = `${candidate?.id || ""} ${candidate?.label || ""} ${candidate?.detectionPath || ""}`.toLowerCase();
      return /click|클릭/.test(candidateText) && candidate?.score >= Number(candidate?.threshold || 1) - 0.22;
    });
  }


  function calculateRectIoU(a, b) {
    if (!a || !b) return 0;
    const ax = Number(a.x || 0);
    const ay = Number(a.y || 0);
    const aw = Math.max(0, Number(a.w || 0));
    const ah = Math.max(0, Number(a.h || 0));
    const bx = Number(b.x || 0);
    const by = Number(b.y || 0);
    const bw = Math.max(0, Number(b.w || 0));
    const bh = Math.max(0, Number(b.h || 0));
    const left = Math.max(ax, bx);
    const top = Math.max(ay, by);
    const right = Math.min(ax + aw, bx + bw);
    const bottom = Math.min(ay + ah, by + bh);
    const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
    const union = aw * ah + bw * bh - intersection;
    return union > 0 ? intersection / union : 0;
  }

  // 88992·88993은 배경 위에 문구만 표시되는 인라인 클릭형이라,
  // 화려한 전투 이펙트에서 OCR이 일부 누락될 수 있다. OCR이 실패한 경우에만
  // 컬러/회색조 템플릿이 같은 위치에서 동시에 강하게 일치하는 후보를 보조로 사용한다.
  // 보조 후보는 아래 투표 단계에서 반드시 3회 연속 확인한다.
  function selectInlineClickFallbackCandidate(imageBest, frameWidth, frameHeight) {
    const candidates = [...(imageBest?.candidates || [])];
    let best = null;

    for (const id of ["inline-click-88992", "inline-click-88993", "inline-click-94425"]) {
      const colorCandidates = candidates.filter((candidate) =>
        String(candidate?.id || "") === id &&
        String(candidate?.detectionMode || "") !== "gray" &&
        Number(candidate?.score || -1) - Number(candidate?.threshold || 1) >= 0.20
      );
      const grayCandidates = candidates.filter((candidate) =>
        String(candidate?.id || "") === id &&
        String(candidate?.detectionMode || "") === "gray" &&
        Number(candidate?.score || -1) - Number(candidate?.threshold || 1) >= 0.05
      );

      for (const color of colorCandidates) {
        for (const gray of grayCandidates) {
          const overlap = calculateRectIoU(color.rect, gray.rect);
          const area = color?.rect
            ? (Number(color.rect.w || 0) * Number(color.rect.h || 0)) /
              Math.max(1, frameWidth * frameHeight)
            : 1;
          if (overlap < 0.75 || area < 0.012 || area > 0.09) continue;

          const colorMargin = Number(color.score || -1) - Number(color.threshold || 1);
          const grayMargin = Number(gray.score || -1) - Number(gray.threshold || 1);
          const strength = colorMargin + grayMargin + overlap;
          const candidate = {
            ...color,
            id,
            label: color.label || "클릭형 거탐",
            confirmThreshold: Number(color.threshold || 1) + 0.20,
            requiredStreak: 3,
            confirmationMode: "inline-dual-3vote",
            voteIdentity: `inline-fallback-${id}`,
            colorMargin,
            grayScore: Number(gray.score || -1),
            grayThreshold: Number(gray.threshold || 1),
            grayMargin,
            dualIoU: overlap,
            area,
            strength
          };
          if (!best || candidate.strength > best.strength) best = candidate;
        }
      }
    }

    if (best) return best;

    // LS2.2 / 94424 보조: 회색조가 약해 기존 color+gray 이중 경로를 못 타는 표본.
    // 단일 컬러 템플릿만으로는 절대 확정하지 않고, 94425 전용 템플릿과 88992/88993 중
    // 하나가 같은 배율·같은 위치에서 동시에 약하지만 유의미하게 일치할 때만 3표 보조를 연다.
    // OCR이 성공하면 기존 OCR 결과가 우선하고, OCR이 실패했을 때만 아래 3표 경로가 사용된다.
    const anchors = candidates.filter((candidate) =>
      String(candidate?.id || "") === "inline-click-94425" &&
      String(candidate?.detectionMode || "") !== "gray" &&
      Number(candidate?.score || -1) >= 0.57 &&
      Number(candidate?.score || -1) - Number(candidate?.threshold || 1) >= 0.06
    );
    const companions = candidates.filter((candidate) =>
      ["inline-click-88992", "inline-click-88993"].includes(String(candidate?.id || "")) &&
      String(candidate?.detectionMode || "") !== "gray" &&
      Number(candidate?.score || -1) >= 0.55 &&
      Number(candidate?.score || -1) - Number(candidate?.threshold || 1) >= 0.06
    );

    for (const anchor of anchors) {
      for (const companion of companions) {
        if (Math.abs(Number(anchor.templateScale || 1) - Number(companion.templateScale || 1)) > 0.02) continue;
        const overlap = calculateRectIoU(anchor.rect, companion.rect);
        const area = anchor?.rect
          ? (Number(anchor.rect.w || 0) * Number(anchor.rect.h || 0)) / Math.max(1, frameWidth * frameHeight)
          : 1;
        if (overlap < 0.90 || area < 0.012 || area > 0.09) continue;
        const anchorMargin = Number(anchor.score || -1) - Number(anchor.threshold || 1);
        const companionMargin = Number(companion.score || -1) - Number(companion.threshold || 1);
        const candidate = {
          ...anchor,
          id: "inline-click-94425",
          label: anchor.label || "클릭형 거탐",
          confirmThreshold: 0.56,
          requiredStreak: 3,
          confirmationMode: "inline-colorpair-3vote",
          voteIdentity: "inline-colorpair-94424",
          fallbackId: "inline-colorpair-94424",
          colorMargin: anchorMargin,
          companionId: String(companion.id || ""),
          companionScore: Number(companion.score || -1),
          companionMargin,
          dualIoU: overlap,
          area,
          strength: anchorMargin + companionMargin + overlap
        };
        if (!best || candidate.strength > best.strength) best = candidate;
      }
    }
    return best;
  }



  // OCR이 실패하거나 너무 느린 일부 거탐 표본을 위한 보수적 시각 보조 경로.
  // 단일 저임계 템플릿은 사용하지 않고, 알려진 미탐 계열만 강한 조건 + 3회 연속 투표로 제한한다.
  function selectOcrVisualFallbackCandidate(imageBest, frameWidth, frameHeight) {
    const candidates = [imageBest, ...(imageBest?.candidates || [])].filter(Boolean);
    // 매처의 템플릿 크기/배율은 프레임 폭을 기준으로 계산된다. 패널 페어의 크기 검증도
    // 폭 제곱으로 정규화해야 화면 종횡비가 ±20% 매칭 배율을 다시 잘라내지 않는다.
    const frameWidthSquared = Math.max(1, frameWidth * frameWidth);

    // 96281 계열 문자 입력형: 94463 안내문 템플릿이 압도적으로 강한 경우만 3표 보조.
    const textInput = candidates
      .filter((candidate) => String(candidate?.id || "") === "text-input-prompt-94463")
      .filter((candidate) => String(candidate?.detectionMode || "") !== "gray")
      .map((candidate) => {
        const score = Number(candidate?.score || -1);
        const threshold = Number(candidate?.threshold || 1);
        const margin = score - threshold;
        const rect = candidate?.rect || null;
        const area = rect
          ? (Number(rect.w || 0) * Number(rect.h || 0)) / Math.max(1, frameWidth * frameHeight)
          : 1;
        return { candidate, score, threshold, margin, area };
      })
      .filter((item) => item.score >= 0.72 && item.margin >= 0.28 && item.area >= 0.006 && item.area <= 0.035)
      .sort((a, b) => b.margin - a.margin || b.score - a.score)[0];

    if (textInput) {
      return {
        ...textInput.candidate,
        id: "text-input-prompt-94463",
        label: "문자 입력형",
        confirmThreshold: 0.72,
        requiredStreak: 3,
        confirmationMode: "ocr-visual-3vote",
        voteIdentity: "ocr-visual-text-input-94463",
        fallbackKind: "text-input",
        margin: textInput.margin,
        area: textInput.area
      };
    }

    // 94456/77959 계열 도형 미니게임: 패널 템플릿 단독 점수는 오탐에 취약하므로
    // 독립적인 컬러 LIE DETECTOR 제목이 패널 상단에 동시에 있을 때만 3표 보조한다.
    const mousePanels = candidates
      .filter((candidate) => String(candidate?.id || "") === "transparent-shape-77982" && candidate.shapeGuideVerified === true)
      .filter((candidate) => String(candidate?.detectionMode || "") !== "gray")
      .map((candidate) => {
        const score = Number(candidate?.score || -1);
        const threshold = Number(candidate?.threshold || 1);
        const margin = score - threshold;
        const rect = candidate?.rect || null;
        const widthNormalizedArea = rect
          ? (Number(rect.w || 0) * Number(rect.h || 0)) / frameWidthSquared
          : 1;
        return { candidate, score, threshold, margin, widthNormalizedArea };
      })
      .filter((item) => item.score >= 0.63 && item.margin >= 0.01 && item.widthNormalizedArea >= 0.035 && item.widthNormalizedArea <= 0.10);
    const mouseTitles = candidates
      .filter((candidate) => String(candidate?.id || "") === "lie-title")
      .filter((candidate) => String(candidate?.detectionMode || "") !== "gray")
      .map((candidate) => {
        const score = Number(candidate?.score || -1);
        const threshold = Number(candidate?.threshold || 1);
        const margin = score - threshold;
        const rect = candidate?.rect || null;
        const widthNormalizedArea = rect
          ? (Number(rect.w || 0) * Number(rect.h || 0)) / frameWidthSquared
          : 1;
        return { candidate, score, threshold, margin, widthNormalizedArea };
      })
      .filter((item) => item.score >= 0.66 && item.margin >= 0.08 && item.widthNormalizedArea >= 0.002 && item.widthNormalizedArea <= 0.0032);

    let bestMousePanel = null;
    for (const panel of mousePanels) {
      const panelRect = panel.candidate.rect;
      for (const title of mouseTitles) {
        const titleRect = title.candidate.rect;
        const titleCenterX = Number(titleRect.x || 0) + Number(titleRect.w || 0) / 2;
        const titleCenterY = Number(titleRect.y || 0) + Number(titleRect.h || 0) / 2;
        const relativeX = (titleCenterX - Number(panelRect.x || 0)) / Math.max(1, Number(panelRect.w || 0));
        const relativeY = (titleCenterY - Number(panelRect.y || 0)) / Math.max(1, Number(panelRect.h || 0));
        if (relativeX < 0.10 || relativeX > 0.90 || relativeY < -0.04 || relativeY > 0.12) continue;
        const strength = panel.margin + title.margin - Math.abs(relativeY - 0.03) * 0.10;
        if (!bestMousePanel || strength > bestMousePanel.strength) {
          bestMousePanel = { panel, title, relativeX, relativeY, strength };
        }
      }
    }

    if (bestMousePanel) {
      return {
        ...bestMousePanel.panel.candidate,
        id: "transparent-shape-77982",
        label: "도형 이동형",
        confirmThreshold: 0.63,
        requiredStreak: 3,
        confirmationMode: "ocr-visual-3vote",
        voteIdentity: "ocr-visual-transparent-shape-title-pair",
        fallbackKind: "mouse-panel",
        margin: bestMousePanel.panel.margin,
        widthNormalizedArea: bestMousePanel.panel.widthNormalizedArea,
        titleScore: bestMousePanel.title.score,
        titleMargin: bestMousePanel.title.margin,
        titleRelativeX: bestMousePanel.relativeX,
        titleRelativeY: bestMousePanel.relativeY
      };
    }

    // 94423 계열: 컬러 LIE DETECTOR 제목 + 회색조 77985 제목이 같은 위치에서 동시에 강할 때만 보조.
    const colors = candidates.filter((candidate) => {
      if (String(candidate?.id || "") !== "lie-title") return false;
      if (String(candidate?.detectionMode || "") === "gray") return false;
      const score = Number(candidate?.score || -1);
      const threshold = Number(candidate?.threshold || 1);
      const rect = candidate?.rect || null;
      const area = rect
        ? (Number(rect.w || 0) * Number(rect.h || 0)) / Math.max(1, frameWidth * frameHeight)
        : 1;
      return score >= 0.60 && score - threshold >= 0.02 && area >= 0.002 && area <= 0.012;
    });
    const grays = candidates.filter((candidate) =>
      String(candidate?.id || "") === "lie-title-gray-77985" &&
      String(candidate?.detectionMode || "") === "gray" &&
      Number(candidate?.score || -1) >= 0.89
    );

    let bestTitle = null;
    for (const color of colors) {
      const cx = (Number(color.rect?.x || 0) + Number(color.rect?.w || 0) / 2) / Math.max(1, frameWidth);
      const cy = (Number(color.rect?.y || 0) + Number(color.rect?.h || 0) / 2) / Math.max(1, frameHeight);
      for (const gray of grays) {
        const gx = (Number(gray.rect?.x || 0) + Number(gray.rect?.w || 0) / 2) / Math.max(1, frameWidth);
        const gy = (Number(gray.rect?.y || 0) + Number(gray.rect?.h || 0) / 2) / Math.max(1, frameHeight);
        const centerDistance = Math.hypot(cx - gx, cy - gy);
        if (centerDistance > 0.06) continue;
        const strength = (Number(color.score || 0) - 0.60) + (Number(gray.score || 0) - 0.89) - centerDistance;
        if (!bestTitle || strength > bestTitle.strength) {
          bestTitle = { color, gray, centerDistance, strength };
        }
      }
    }

    if (bestTitle) {
      return {
        ...bestTitle.color,
        id: "lie-title",
        label: "거짓말 탐지기 팝업",
        confirmThreshold: 0.60,
        requiredStreak: 3,
        confirmationMode: "ocr-visual-3vote",
        voteIdentity: "ocr-visual-lie-title-94423",
        fallbackKind: "lie-title",
        grayScore: Number(bestTitle.gray.score || 0),
        grayThreshold: Number(bestTitle.gray.threshold || 0.90),
        centerDistance: bestTitle.centerDistance
      };
    }

    return null;
  }

  function sameInlineFallbackCandidate(a, b) {
    if (!a || !b || a.id !== b.id) return false;
    if (calculateRectIoU(a.rect, b.rect) >= 0.50) return true;
    const ax = (Number(a.rect?.x || 0) + Number(a.rect?.w || 0) / 2) / Math.max(1, a.frameWidth);
    const ay = (Number(a.rect?.y || 0) + Number(a.rect?.h || 0) / 2) / Math.max(1, a.frameHeight);
    const bx = (Number(b.rect?.x || 0) + Number(b.rect?.w || 0) / 2) / Math.max(1, b.frameWidth);
    const by = (Number(b.rect?.y || 0) + Number(b.rect?.h || 0) / 2) / Math.max(1, b.frameHeight);
    return Math.hypot(ax - bx, ay - by) <= 0.03;
  }

  function getTargetedRecheckFrameMarker() {
    // P4-R12: currentTime은 MediaStream 새 프레임이 없어도 진행할 수 있으므로
    // 2표의 독립 프레임 증거로 사용하지 않는다. 실제 frame counter가 없으면 기존 full recheck로 fallback한다.
    const frameCount = getPresentedFrameCount();
    if (frameCount >= 0) return { kind: "frame-count", value: frameCount, ...(STRICT_THREE_INPUT_RESEARCH_ENABLED ? {provider:strictThreeMarkerProvider} : {}) };
    return { kind: "unavailable", value: -1 };
  }

  function isIndependentTargetedRecheckFrame(first, second) {
    return Boolean(
      first && second &&
      first.kind === "frame-count" && second.kind === "frame-count" &&
      Number(second.value) > Number(first.value)
    );
  }

  function sameTargetedContourLocation(firstRect, secondRect, frameWidth, frameHeight) {
    if (!firstRect || !secondRect) return false;
    if (calculateRectIoU(firstRect, secondRect) >= TARGETED_RECHECK_MIN_IOU) return true;
    const width = Math.max(1, Number(frameWidth || 1));
    const height = Math.max(1, Number(frameHeight || 1));
    const ax = (Number(firstRect.x || 0) + Number(firstRect.w || 0) / 2) / width;
    const ay = (Number(firstRect.y || 0) + Number(firstRect.h || 0) / 2) / height;
    const bx = (Number(secondRect.x || 0) + Number(secondRect.w || 0) / 2) / width;
    const by = (Number(secondRect.y || 0) + Number(secondRect.h || 0) / 2) / height;
    return Math.hypot(ax - bx, ay - by) <= TARGETED_RECHECK_MAX_CENTER_DISTANCE;
  }

  async function tryTargetedContourRecheck(firstCandidate, firstCanvas, firstFrameMarker, firstCapturedAt, sessionIsCurrent) {
    if (!firstCandidate || !firstCanvas || !firstFrameMarker || firstFrameMarker.kind === "unavailable") return null;
    if (!window.MAlertTextContourMatcher?.analyzeTargeted) return null;
    if (Math.max(2, Number(firstCandidate.requiredStreak || 2)) !== 2) return null;

    const remainingGap = Math.max(0, TARGETED_RECHECK_MIN_GAP_MS - (performance.now() - Number(firstCapturedAt || 0)));
    if (remainingGap > 0) {
      markAnalysisProgress("targeted-recheck-wait");
      await new Promise((resolve) => setTimeout(resolve, remainingGap));
    }
    if (!sessionIsCurrent() || !state.stream || state.paused || !video.videoWidth) return null;

    let strictThreeRecheckCanvas=null,strictThreeRecheckStarted=false;
    try {
      const secondCanvas = captureSearchCanvas();
      strictThreeRecheckCanvas=secondCanvas;
      const secondFrameMarker = STRICT_THREE_INPUT_RESEARCH_ENABLED ? secondCanvas.auditFrameMarker : getTargetedRecheckFrameMarker();
      if (!isIndependentTargetedRecheckFrame(firstFrameMarker, secondFrameMarker)) return null;
      if (secondCanvas.width !== firstCanvas.width || secondCanvas.height !== firstCanvas.height) return null;

      markAnalysisProgress("targeted-recheck-scan");
      const startedAt = performance.now();
      strictThreeRecheckStarted=true;
      let result = await window.MAlertTextContourMatcher.analyzeTargeted(secondCanvas, {
        ids: TARGETED_RECHECK_STRONG_IDS
      });
      if (!sessionIsCurrent()) return null;
      result = applyMonitorRegionToContourResult(result, secondCanvas);
      const candidate = selectStrongContourCandidate(result, secondCanvas.width, secondCanvas.height);
      if (!candidate) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_NO_ACCEPTED_CANDIDATE");
        return null;
      }
      if (String(candidate.id || "") !== String(firstCandidate.id || "")) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_ID");
        return null;
      }
      if (Math.abs(Number(candidate.templateScale || 1) - Number(firstCandidate.templateScale || 1)) > 1e-9) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_SCALE");
        return null;
      }
      if (String(candidate.detectionMode || "hybrid") !== String(firstCandidate.detectionMode || "hybrid")) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_MODE");
        return null;
      }

      const confirmThreshold = Number(firstCandidate.confirmThreshold ?? (Number(firstCandidate.threshold || 1) + 0.04));
      if (Number(candidate.score || -1) < confirmThreshold) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_THRESHOLD");
        return null;
      }
      if (!rectInsideSearchMonitorRegion(candidate.rect, secondCanvas)) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_MONITOR");
        return null;
      }
      if (!sameTargetedContourLocation(firstCandidate.rect, candidate.rect, secondCanvas.width, secondCanvas.height)) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,secondCanvas,firstCandidate,"contour","CONTOUR_RECHECK_LOCATION");
        return null;
      }

      return {
        candidate,
        ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:[strictThreeContourObservation(firstCandidate,firstCanvas),strictThreeContourObservation(candidate,secondCanvas)]}:{}),
        frameMarker: secondFrameMarker,
        durationMs: Math.round(performance.now() - startedAt)
      };
    } catch (error) {
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED&&strictThreeRecheckStarted&&sessionIsCurrent())strictThreeFailedRecheck(firstCanvas,strictThreeRecheckCanvas,firstCandidate,"contour","CONTOUR_RECHECK_ERROR");
      // 표적 재확인은 성능 보조 경로다. 실패 시 첫 표를 잃지 않고 기존 700ms full recheck로 돌아간다.
      console.warn("표적 재확인 실패, 기존 전체 재검사로 복귀:", error);
      return null;
    }
  }

  function selectStrongContourCandidate(imageBest, frameWidth, frameHeight) {
    const eligible = POPUP_TEMPLATE_ID_PATTERN;
    const pool = [imageBest, ...(imageBest?.candidates || [])]
      .filter(Boolean)
      .filter((candidate, index, array) => array.indexOf(candidate) === index)
      .filter((candidate) => eligible.test(String(candidate?.id || "")))
      .filter((candidate) => !INLINE_CLICK_HINT_ID_PATTERN.test(String(candidate?.id || "")))
      .map((candidate) => {
        const id = String(candidate?.id || "");
        const threshold = Number(candidate?.threshold || 1);
        const score = Number(candidate?.score || -1);
        const margin = score - threshold;
        const rect = candidate?.rect || null;
        const area = rect
          ? (Number(rect.w || 0) * Number(rect.h || 0)) / Math.max(1, frameWidth * frameHeight)
          : 1;
        let accepted = false;
        let confirmThreshold = threshold + 0.04;
        let requiredStreak = 2;
        let confirmationMode = "standard";

        if (id === "click-prompt") {
          const normalPrompt = margin >= 0.30 && area > 0.01 && area <= 1.0;
          const compactPrompt = score >= 0.72 && margin >= 0.20 && area > 0.003 && area <= 0.35;
          accepted = normalPrompt || compactPrompt;
          confirmThreshold = normalPrompt ? threshold + 0.30 : 0.72;
          requiredStreak = normalPrompt ? 2 : 3;
          confirmationMode = normalPrompt ? "prompt-strong" : "prompt-compact-3vote";
        } else if (id === "77986") {
          // 77986은 원형/방사형 전투 이펙트와 윤곽이 겹칠 수 있다.
          // 중간 강도 후보는 아래 OCR 경로에서 문구를 반드시 확인하고,
          // OCR 누락에 따른 미탐을 줄이기 위해 압도적으로 강한 윤곽만 3회 연속 확인으로 보조한다.
          const ultraStrong = score >= 0.63 && margin >= 0.23 && area > 0.01 && area <= 0.25;
          accepted = ultraStrong;
          confirmThreshold = 0.63;
          requiredStreak = 3;
          confirmationMode = "77986-ultra-3vote";
        } else {
          accepted = margin >= 0.04 && area > 0.01 && area <= 0.25 &&
            (!id.startsWith("transparent-shape-") || candidate.shapeGuideVerified === true);
        }

        return {
          candidate: {
            ...candidate,
            confirmThreshold,
            requiredStreak,
            confirmationMode
          },
          margin,
          area,
          accepted
        };
      })
      .filter((item) => item.accepted)
      .sort((a, b) => b.margin - a.margin || Number(b.candidate.score || 0) - Number(a.candidate.score || 0));
    return pool[0]?.candidate || null;
  }

  function resolveOcrLabel(ocrResult, imageBest) {
    if (ocrResult?.label && ocrResult.label !== "거짓말 탐지기 문구") return ocrResult.label;
    if (String(ocrResult?.engine || "").startsWith("edge-candidate-ocr")) return ocrResult?.label || "거짓말 탐지기";
    if (/비올레타/.test(`${ocrResult?.reason || ""} ${ocrResult?.text || ""}`)) return "비올레타형";
    if (imageBest?.label && imageBest.label !== "없음") return imageBest.label;
    return "거짓말 탐지기";
  }

  // 세션 동일성은 generation 번호와 state.stream 동일성으로 판단한다.
  // stopCapture()가 두 값을 항상 함께 갱신하므로 이것만으로 이전 세션의 늦은
  // 비동기 결과를 전부 걸러낼 수 있다. video.srcObject까지 비교하면 실제 브라우저
  // 동작은 같으면서 대체 스트림을 쓰는 테스트 하네스에서만 항상 false가 된다.
  function isCaptureSessionCurrent(sessionId, stream) {
    return Boolean(
      stream &&
      state.captureSessionId === sessionId &&
      state.stream === stream
    );
  }

  // 화면공유 세션뿐 아니라 감시 영역 revision까지 같아야 비동기 분석 결과를 반영한다.
  // 영역 지정 시작/저장/초기화 시 revision이 증가하므로 이전 영역에서 시작된 OCR·matcher 결과는 폐기된다.
  function isAnalysisContextCurrent(sessionId, stream, monitorRegionRevision) {
    return Boolean(
      !state.paused && isCaptureSessionCurrent(sessionId, stream) &&
      state.monitorRegionRevision === monitorRegionRevision
    );
  }

  async function configureSharedFrameCadence(stream) {
    const track = stream?.getVideoTracks?.()[0];
    if (!track || track.readyState !== "live" || typeof track.applyConstraints !== "function") return false;
    try {
      // Chrome may deliver only one frame for a static shared photo. Request periodic
      // source frames after permission is granted; getDisplayMedia rejects an initial
      // min constraint. Keep decoded-frame confirmation and detection thresholds intact.
      await track.applyConstraints({
        ...(track.getConstraints?.() || {}),
        frameRate: { min: 4, ideal: 8, max: 10 }
      });
      return true;
    } catch (error) {
      // A source without this optional capability must still be shareable.
      console.warn("정지 공유 화면의 프레임 갱신 주기 요청을 적용하지 못했습니다:", error);
      return false;
    }
  }

  async function startCapture() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert("이 브라우저에서는 화면 공유를 사용할 수 없습니다. PC Chrome을 이용하세요.");
      return;
    }

    const previousStream = state.stream;
    const hadActiveCapture = Boolean(previousStream);
    const startButton = $("#startCaptureBtn");
    startButton.disabled = true;
    startButton.textContent = "공유할 창 선택 중…";
    setStatusChip($("#captureStatus"), "idle", "Chrome 공유창 선택 중");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    let stream = null;
    try {
      const preferredOptions = {
        video: {
          displaySurface: "window",
          frameRate: { ideal: 8, max: 10 }
        },
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
        surfaceSwitching: "exclude",
        monitorTypeSurfaces: "exclude",
        systemAudio: "exclude"
      };

      try {
        stream = await navigator.mediaDevices.getDisplayMedia(preferredOptions);
      } catch (error) {
        if (error?.name !== "TypeError") throw error;
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      }

      await configureSharedFrameCadence(stream);

      stopCapture();
      state.stream = stream;
      video.srcObject = stream;
      await waitForVideoReady(video, 12000);
      await video.play();
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error("공유 영상 크기를 확인할 수 없습니다.");
      }

      unlockSpeech();
      const track = stream.getVideoTracks()[0];

      resizePreview();
      state.paused = false;
      state.lastAnalysisAt = -ANALYSIS_INTERVAL_MS;
      state.nextAnalysisDelayMs = ANALYSIS_INTERVAL_MS;
      state.previewLastAt = 0;
      state.frameHeartbeatAt = 0;
      state.lastAnalysisCompletedAt = performance.now();
      state.lastAnalysisProgressAt = state.lastAnalysisCompletedAt;
      state.analysisProgressPhase = "idle";
      state.pendingLatestAnalysis = false;
      resetDetection();
      startShareHealthMonitor(track);
      setStatusChip($("#captureStatus"), "live", "메이플 창 공유 중");
      $("#previewStatus").textContent = "실시간 감시 중";
      $("#lastAnalysis").textContent = state.cvReady ? "첫 검사 준비" : "분석 엔진 대기";
      $("#emptyPreview").hidden = true;
      updateRegionStatus();
      addLog(
        "화면 공유",
        `메이플 화면 감시를 시작했습니다. ${video.videoWidth}×${video.videoHeight} · ${normalizeScreenMode(state.config.screenMode) === "portrait" ? "세로 기준(150% 보정)" : "가로 기준"}`
      );
      updateUi();
      state.animationFrame =
        requestAnimationFrame(frameLoop);
      startAnalysisScheduler();

      // 화면과 버튼을 먼저 그린 다음 분석 엔진을 불러옵니다.
      scheduleHybridEngineLoad();
    } catch (error) {
      // getDisplayMedia 성공 뒤 video 준비/play 단계에서 실패해도 공유 트랙을 반드시 정리한다.
      if (stream) {
        if (state.stream === stream) {
          stopCapture();
        } else {
          for (const track of stream.getTracks()) {
            try { track.stop(); } catch (_) {}
          }
        }
      }
      // 기존 공유가 살아 있는 상태에서 새 공유 선택창만 취소한 경우에는 기존 세션을 그대로 유지한다.
      if (!stream && hadActiveCapture && state.stream === previousStream) {
        setStatusChip($("#captureStatus"), "live", "메이플 창 공유 중");
        $("#previewStatus").textContent = state.paused ? "감시 일시정지" : "실시간 감시 중";
        addLog("화면 공유", "새 공유 선택이 취소되어 기존 메이플 창 공유를 계속 사용합니다.");
        updateUi();
        return;
      }

      startButton.disabled = false;
      startButton.textContent = "메이플 창 선택하기";
      setStatusChip($("#captureStatus"), "idle", "화면 공유 대기");
      if (error?.name === "NotAllowedError") {
        addLog("화면 공유", "공유 선택이 취소되었거나 권한이 허용되지 않았습니다.");
      } else {
        addLog("오류", `화면 공유 실패: ${error?.message || error}`);
      }
    }
  }

  function stopCapture(options = {}) {
    if(OCR_SESSION_CLEANUP_ENABLED&&(state.stream||state.analysisBusy)){
      ocrSessionStats.stopCancellations++;
      // terminate increments the OCR generation and cancels the current job
      // synchronously before its first await. Queued old generations reject.
      void window.MAlertOcr?.terminate?.().catch(error=>console.warn('OCR stop cleanup:',error));
    }
    window.MAlertContourWorker?.cancelAll("screen-share-stopped");
    state.lastAnalysisDurationMs = 0;
    const preserveHealth = Boolean(options && options.preserveHealth === true);
    // stop과 동시에 세션 generation을 올려 이전 비동기 matcher/OCR 결과를 무효화한다.
    state.captureSessionId += 1;
    state.analysisBusy = false;
    state.analysisPhase = "idle";
    state.analysisStartedAt = 0;
    state.lastAnalysisProgressAt = 0;
    state.analysisProgressPhase = "idle";
    state.pendingLatestAnalysis = false;
    state.rainbowScoutBusy = false;
    state.snapshotBusy = false;
    resetOcrFrameEvidence();
    stopAnalysisScheduler();
    stopShareHealthMonitor();
    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }
    if (state.stream) {
      for (const track of state.stream.getTracks()) track.stop();
    }

    state.stream = null;
    video.srcObject = null;
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    $("#emptyPreview").hidden = false;
    $("#previewStatus").textContent = "공유 화면 없음";
    $("#resolutionLabel").textContent = "—";
    $("#lastAnalysis").textContent = "분석 대기";
    $("#candidateCount").textContent = "0개";
    $("#calibrationCandidate").textContent = "아직 분석 없음";
    $("#calibrationMeta").textContent =
      "화면 공유 후 사용할 수 있습니다.";
    finishRegionSelectionUi();
    state.lastAnalysisBest = null;
    state.lastAlertSnapshot = null;
    state.nextAnalysisDelayMs = ANALYSIS_INTERVAL_MS;
    setStatusChip($("#captureStatus"), "idle", "화면 공유 대기");
    if (!preserveHealth) {
      setShareHealthUi(
        "idle",
        "화면공유 대기",
        "메이플 창을 공유하면 끊김·프레임 정지·검은 화면·분석 지연을 자동 점검합니다.",
        "대기"
      );
    }
    resetDetection();
    updateUi();
  }

  function togglePause() {
    if (!state.stream) return;
    state.paused = !state.paused;
    if (state.paused) {
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeMainRecords=[];
      resetPriorityColorScout();
      // Re-entering after pause must not revive a previously pending result.
      state.monitorRegionRevision += 1;
      state.largeGuideEvidence=[];state.voteWindow=[];state.lastVoteFrameMarker=null;state.inlineFallbackVotes=[];
      state.rainbowEvidence=[];state.rainbowRecoveryEvidence=[];state.streak=0;state.candidateId=null;
      resetOcrFrameEvidence();
      setStatusChip($("#captureStatus"), "paused", "감지 일시정지");
      setRuntime("paused", "일시정지");
      addLog("감지", "화면 분석을 일시정지했습니다.");
    } else {
      setStatusChip($("#captureStatus"), "live", "화면 공유 중");
      setRuntime("monitoring", "감시 중");
      addLog("감지", "화면 분석을 다시 시작했습니다.");
    }
    updateUi();
  }

  function beginMonitorRegionSelection() {
    if (
      !state.stream ||
      !video.videoWidth ||
      !previewCanvas.width
    ) {
      alert("먼저 메이플 창을 공유해 주세요.");
      return;
    }

    if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeMainRecords=[];
    resetPriorityColorScout();
    // 영역 지정이 시작되는 즉시 이전 영역에서 시작된 비동기 결과를 무효화한다.
    state.monitorRegionRevision += 1;
    resetOcrFrameEvidence();
    state.rainbowEvidence = [];
    state.rainbowRecoveryEvidence = [];
    state.regionSelecting = true;
    state.regionPointerId = null;
    state.regionStart = null;
    state.regionDraft = null;

    previewCanvas.classList.add(
      "region-selecting"
    );

    $("#regionStatus").textContent =
      "공유 화면에서 감시할 영역을 드래그하세요.";

    $("#selectRegionBtn").textContent =
      "드래그해서 영역 지정 중";

    setRuntime(
      "paused",
      "감시 영역 지정 중"
    );

    addLog(
      "감시 영역",
      "공유 화면에서 분석할 영역을 드래그해 지정합니다."
    );
  }

  function resetMonitorRegion() {
    state.monitorRegionRevision += 1;
    state.config.monitorRegion = {
      x: 0,
      y: 0,
      w: 1,
      h: 1
    };

    finishRegionSelectionUi();
    saveConfig();
    resetDetection({ preserveAsyncBusy: true });
    updateRegionStatus();
    drawPreview();

    addLog(
      "감시 영역",
      "전체 화면 감시로 복원했습니다."
    );
  }

  function handleRegionPointerDown(event) {
    if (!state.regionSelecting) return;

    const point =
      previewPointerPoint(event);

    state.regionPointerId =
      event.pointerId;
    state.regionStart = point;
    state.regionDraft = {
      x: point.x,
      y: point.y,
      w: 0,
      h: 0
    };

    previewCanvas.setPointerCapture?.(
      event.pointerId
    );

    event.preventDefault();
  }

  function handleRegionPointerMove(event) {
    if (
      !state.regionSelecting ||
      state.regionPointerId !==
        event.pointerId ||
      !state.regionStart
    ) {
      return;
    }

    const point =
      previewPointerPoint(event);

    state.regionDraft =
      rectangleFromPoints(
        state.regionStart,
        point
      );

    drawPreview();
    event.preventDefault();
  }

  function handleRegionPointerUp(event) {
    if (
      !state.regionSelecting ||
      state.regionPointerId !==
        event.pointerId ||
      !state.regionStart
    ) {
      return;
    }

    const point =
      previewPointerPoint(event);

    const draft =
      rectangleFromPoints(
        state.regionStart,
        point
      );

    previewCanvas.releasePointerCapture?.(
      event.pointerId
    );

    const minimumWidth =
      Math.max(
        48,
        previewCanvas.width * 0.12
      );

    const minimumHeight =
      Math.max(
        36,
        previewCanvas.height * 0.12
      );

    if (
      draft.w < minimumWidth ||
      draft.h < minimumHeight
    ) {
      state.regionStart = null;
      state.regionDraft = null;
      state.regionPointerId = null;

      $("#regionStatus").textContent =
        "영역이 너무 작습니다. 조금 더 넓게 드래그하세요.";

      drawPreview();
      event.preventDefault();
      return;
    }

    state.monitorRegionRevision += 1;
    state.config.monitorRegion =
      normalizePreviewRegion(draft);

    saveConfig();
    finishRegionSelectionUi();
    resetDetection({ preserveAsyncBusy: true });
    updateRegionStatus();
    drawPreview();

    const percent =
      Math.round(
        state.config.monitorRegion.w *
        state.config.monitorRegion.h *
        100
      );

    addLog(
      "감시 영역",
      `사용자 지정 영역을 저장했습니다. 화면의 약 ${percent}%를 감지 대상으로 설정했습니다.`
    );

    event.preventDefault();
  }

  function cancelMonitorRegionSelection() {
    if (!state.regionSelecting) return;

    finishRegionSelectionUi();
    updateRegionStatus();
    drawPreview();
  }

  function finishRegionSelectionUi() {
    state.regionSelecting = false;
    state.regionPointerId = null;
    state.regionStart = null;
    state.regionDraft = null;

    previewCanvas.classList.remove(
      "region-selecting"
    );

    $("#selectRegionBtn").textContent =
      "감시 영역 지정";

    updateUi();
  }

  function previewPointerPoint(event) {
    const bounds =
      previewCanvas.getBoundingClientRect();

    const scaleX =
      previewCanvas.width /
      Math.max(1, bounds.width);

    const scaleY =
      previewCanvas.height /
      Math.max(1, bounds.height);

    return {
      x: clampNumber(
        (event.clientX - bounds.left) *
          scaleX,
        0,
        previewCanvas.width,
        0
      ),
      y: clampNumber(
        (event.clientY - bounds.top) *
          scaleY,
        0,
        previewCanvas.height,
        0
      )
    };
  }

  function rectangleFromPoints(
    first,
    second
  ) {
    const left =
      Math.min(first.x, second.x);
    const top =
      Math.min(first.y, second.y);
    const right =
      Math.max(first.x, second.x);
    const bottom =
      Math.max(first.y, second.y);

    return {
      x: left,
      y: top,
      w: right - left,
      h: bottom - top
    };
  }

  function normalizePreviewRegion(rect) {
    return normalizeMonitorRegion({
      x:
        rect.x /
        Math.max(
          1,
          previewCanvas.width
        ),
      y:
        rect.y /
        Math.max(
          1,
          previewCanvas.height
        ),
      w:
        rect.w /
        Math.max(
          1,
          previewCanvas.width
        ),
      h:
        rect.h /
        Math.max(
          1,
          previewCanvas.height
        )
    });
  }

  function normalizeMonitorRegion(region) {
    const source =
      region &&
      typeof region === "object"
        ? region
        : {};

    const x = clampNumber(
      Number(source.x),
      0,
      0.98,
      0
    );

    const y = clampNumber(
      Number(source.y),
      0,
      0.98,
      0
    );

    const w = clampNumber(
      Number(source.w),
      0.02,
      1 - x,
      1 - x
    );

    const h = clampNumber(
      Number(source.h),
      0.02,
      1 - y,
      1 - y
    );

    return {
      x,
      y,
      w,
      h
    };
  }

  function isFullMonitorRegion() {
    const region =
      normalizeMonitorRegion(
        state.config.monitorRegion
      );

    return (
      region.x <= 0.002 &&
      region.y <= 0.002 &&
      region.w >= 0.996 &&
      region.h >= 0.996
    );
  }

  // 감시 영역 밖 후보를 실제로 걸러낸다.
  // 전체 화면(기본값)일 때는 항상 true를 돌려주므로 기존 판정과 회귀 결과가 같다.
  function rectInsideMonitorRegion(rect, frameWidth, frameHeight) {
    if (isFullMonitorRegion()) return true;
    // 사용자 지정 영역에서는 좌표를 확인할 수 없는 후보를 fail-open으로 통과시키지 않는다.
    if (!rect) return false;
    const width = Number(frameWidth || 0);
    const height = Number(frameHeight || 0);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return false;
    }

    const region = normalizeMonitorRegion(state.config.monitorRegion);
    const x = Number(rect.x || 0) / width;
    const y = Number(rect.y || 0) / height;
    const w = Math.max(0, Number(rect.w || 0)) / width;
    const h = Math.max(0, Number(rect.h || 0)) / height;

    const left = Math.max(x, region.x);
    const top = Math.max(y, region.y);
    const right = Math.min(x + w, region.x + region.w);
    const bottom = Math.min(y + h, region.y + region.h);
    const overlap = Math.max(0, right - left) * Math.max(0, bottom - top);
    const area = w * h;

    if (area <= 0) {
      return (
        x >= region.x &&
        x <= region.x + region.w &&
        y >= region.y &&
        y <= region.y + region.h
      );
    }
    return overlap / area >= MONITOR_REGION_MIN_OVERLAP;
  }

  // 윤곽 매칭 결과에서 감시 영역 밖 후보를 제거하고 최상위 후보를 다시 고른다.
  // 매처 자체는 영역 개념이 없으므로 결과 단계에서 한 번만 적용한다.
  function rectInsideSearchMonitorRegion(rect, searchCanvas) {
    const mode = searchCanvas?.dataset?.screenMode || normalizeScreenMode(state.config.screenMode);
    // 가로 기준은 R10의 감시 영역 좌표 판정을 그대로 사용한다.
    // 세로 기준에서만 정규화 캔버스 좌표를 원본 공유 영상 좌표로 역변환한다.
    if (mode !== "portrait") {
      return rectInsideMonitorRegion(rect, searchCanvas?.width, searchCanvas?.height);
    }
    const mapped = mapSearchRectToVideoRect(searchCanvas, rect);
    if (!mapped) return false;
    if (isFullMonitorRegion()) return true;
    return rectInsideMonitorRegion(mapped, video.videoWidth, video.videoHeight);
  }

  function applyMonitorRegionToContourResult(result, searchCanvas) {
    if (!result) return result;
    const portraitNormalized = searchCanvas?.dataset?.screenMode === "portrait";
    if (isFullMonitorRegion() && !portraitNormalized) return result;
    const candidates = (result.candidates || []).filter((candidate) =>
      rectInsideSearchMonitorRegion(candidate?.rect, searchCanvas)
    );
    const best = candidates[0] || {
      id: null, label: "없음", score: -1, threshold: 1, matched: false, rect: null
    };
    return {
      ...best,
      source: best.matched
        ? `로컬 거탐 문구 패턴 · ${best.id}`
        : "감시 영역 안에서 문구 패턴 없음",
      durationMs: Number(result.durationMs || 0),
      candidates
    };
  }

  function getMonitorRegionPixels() {
    const region =
      normalizeMonitorRegion(
        state.config.monitorRegion
      );

    const x = clampNumber(
      Math.round(
        region.x *
        video.videoWidth
      ),
      0,
      Math.max(
        0,
        video.videoWidth - 1
      ),
      0
    );

    const y = clampNumber(
      Math.round(
        region.y *
        video.videoHeight
      ),
      0,
      Math.max(
        0,
        video.videoHeight - 1
      ),
      0
    );

    const w = clampNumber(
      Math.round(
        region.w *
        video.videoWidth
      ),
      1,
      video.videoWidth - x,
      video.videoWidth - x
    );

    const h = clampNumber(
      Math.round(
        region.h *
        video.videoHeight
      ),
      1,
      video.videoHeight - y,
      video.videoHeight - y
    );

    return {
      x,
      y,
      w,
      h
    };
  }

  function getPreviewMonitorRect() {
    if (state.regionDraft) {
      return state.regionDraft;
    }

    const region =
      normalizeMonitorRegion(
        state.config.monitorRegion
      );

    return {
      x:
        region.x *
        previewCanvas.width,
      y:
        region.y *
        previewCanvas.height,
      w:
        region.w *
        previewCanvas.width,
      h:
        region.h *
        previewCanvas.height
    };
  }

  function updateRegionStatus() {
    const element =
      $("#regionStatus");

    if (!element) return;

    if (state.regionSelecting) {
      element.textContent =
        "공유 화면에서 감시할 영역을 드래그하세요.";
      return;
    }

    if (isFullMonitorRegion()) {
      element.textContent =
        "현재 감시 영역: 전체 화면";
      return;
    }

    const region =
      normalizeMonitorRegion(
        state.config.monitorRegion
      );

    element.textContent =
      `현재 감시 영역: X ${Math.round(
        region.x * 100
      )}% · Y ${Math.round(
        region.y * 100
      )}% · 너비 ${Math.round(
        region.w * 100
      )}% · 높이 ${Math.round(
        region.h * 100
      )}%`;
  }

  function drawMonitorRegionOverlay() {
    if (
      !previewCanvas.width ||
      !previewCanvas.height
    ) {
      return;
    }

    const rect =
      getPreviewMonitorRect();

    previewContext.save();

    previewContext.fillStyle =
      "rgba(4, 8, 12, 0.62)";

    previewContext.beginPath();
    previewContext.rect(
      0,
      0,
      previewCanvas.width,
      previewCanvas.height
    );
    previewContext.rect(
      rect.x,
      rect.y,
      rect.w,
      rect.h
    );
    previewContext.fill("evenodd");

    previewContext.strokeStyle =
      state.regionSelecting
        ? "rgba(255, 214, 70, 0.98)"
        : "rgba(71, 214, 154, 0.98)";

    previewContext.lineWidth =
      state.regionSelecting
        ? 3
        : 2;

    previewContext.setLineDash(
      state.regionSelecting
        ? [9, 6]
        : []
    );

    previewContext.strokeRect(
      rect.x,
      rect.y,
      rect.w,
      rect.h
    );

    previewContext.setLineDash([]);

    const label =
      state.regionSelecting
        ? "새 감시 영역"
        : "감시 영역";

    previewContext.font =
      "700 13px sans-serif";
    previewContext.textBaseline =
      "top";

    const labelWidth =
      previewContext.measureText(
        label
      ).width + 14;

    const labelX = clampNumber(
      rect.x,
      0,
      Math.max(
        0,
        previewCanvas.width -
          labelWidth
      ),
      0
    );

    const labelY =
      rect.y >= 25
        ? rect.y - 23
        : rect.y + 5;

    previewContext.fillStyle =
      state.regionSelecting
        ? "rgba(120, 92, 8, 0.92)"
        : "rgba(16, 102, 70, 0.92)";

    previewContext.fillRect(
      labelX,
      labelY,
      labelWidth,
      19
    );

    previewContext.fillStyle =
      "#ffffff";

    previewContext.fillText(
      label,
      labelX + 7,
      labelY + 3
    );

    previewContext.restore();
  }

  function frameLoop(timestamp) {
    if (!state.stream) {
      state.animationFrame = null;
      return;
    }
    state.animationFrame = requestAnimationFrame(frameLoop);

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
      if (timestamp - state.frameHeartbeatAt >= 1000) {
        $("#lastAnalysis").textContent = "공유 영상 프레임 대기";
        state.frameHeartbeatAt = timestamp;
      }
      return;
    }

    if (timestamp - state.previewLastAt >= 100) {
      drawPreview();
      state.previewLastAt = timestamp;
    }

    if (!state.cvReady) {
      if (timestamp - state.frameHeartbeatAt >= 1000) {
        $("#lastAnalysis").textContent =
          state.ocrLoading
            ? "분석 엔진 준비 중"
            : "분석 엔진 시작 대기";
        state.frameHeartbeatAt = timestamp;
      }
      return;
    }

    if (!state.model) {
      if (timestamp - state.frameHeartbeatAt >= 1000) {
        $("#lastAnalysis").textContent = "거탐 모델 준비 대기";
        state.frameHeartbeatAt = timestamp;
      }
      return;
    }


    // P4-R5: 감지 스케줄은 preview requestAnimationFrame과 분리한다.
  }

  function startAnalysisScheduler() {
    stopAnalysisScheduler();
    state.analysisSchedulerTimer = window.setInterval(analysisSchedulerTick, ANALYSIS_SCHEDULER_TICK_MS);
  }

  function stopAnalysisScheduler() {
    if (state.analysisSchedulerTimer) {
      clearInterval(state.analysisSchedulerTimer);
      state.analysisSchedulerTimer = null;
    }
  }

  function analysisSchedulerTick() {
    if(state.analysisBusy&&state.analysisStartedAt>0){
      const elapsed=performance.now()-state.analysisStartedAt;
      const labels={contour:'글자 윤곽',ocr:'문구 읽기',confirm:'다음 프레임 확인'};
      $('#lastAnalysis').textContent=(elapsed>=5000?'분석 지연':'검사 중')+' · '+(elapsed/1000).toFixed(1)+'초 · '+(labels[state.analysisPhase]||'화면 분석');
    }

    if (!state.stream || state.paused || state.regionSelecting || !state.cvReady || !state.model) return;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) return;
    const now = performance.now();

    // A single lightweight colored-guide check can inspect fresh pixels while
    // the main path is still working on an older contour/OCR frame.
    void startPriorityColorScout(now);

    // P4-R6: OCR 시간축 증거 캡처도 preview rAF와 분리한다.
    // 창 오클루전/렌더링 throttling 중에도 scheduler tick에서 최신 video frame을 확보한다.
    if (!state.regionSelecting && state.analysisBusy && state.analysisPhase === "ocr" && state.ocrFrameEvidenceActive) {
      maybeCaptureOcrFrameEvidence(now);
    }
    const rainbowScoutDue =
      (!state.analysisBusy || (state.analysisPhase === "ocr" && now - state.lastAnalysisAt >= 2500)) &&
      !state.rainbowScoutBusy &&
      now - state.lastRainbowScoutAt >= state.rainbowScoutDelayMs;
    const mainAnalysisDue =
      !state.analysisBusy &&
      !state.rainbowScoutBusy &&
      (state.pendingLatestAnalysis || now - state.lastAnalysisAt >= state.nextAnalysisDelayMs);

    if (rainbowScoutDue && state.analysisBusy && state.analysisPhase === "ocr") {
      state.consecutiveScoutStarts += 1;
      startRainbowScout(now);
      return;
    }
    // Finish an accepted guide's independent frame votes even if the OCR
    // finishes between scout passes. Bound priority so the main path runs too.
    const guideVotesPending = hasPendingLargeGuideVotes(now);
    // Waiting for the next decoded frame is part of the bounded burst:
    // do not start a full scan in the 250ms gap between two guide votes.
    if(guideVotesPending&&!state.analysisBusy&&!state.rainbowScoutBusy&&state.consecutiveScoutStarts<3){
      if(rainbowScoutDue){state.consecutiveScoutStarts+=1;startRainbowScout(now);}
      return;
    }
    const maxConsecutiveScouts = guideVotesPending ? 3 : (now < state.rainbowFocusUntil ? 2 : 1);
    if (rainbowScoutDue && (!mainAnalysisDue || state.consecutiveScoutStarts < maxConsecutiveScouts)) {
      state.consecutiveScoutStarts += 1;
      startRainbowScout(now);
      return;
    }
    if (state.analysisBusy || state.rainbowScoutBusy) {
      state.busySchedulerSkips += 1;
      if (state.analysisBusy && now - state.lastAnalysisAt >= state.nextAnalysisDelayMs) state.pendingLatestAnalysis = true;
      return;
    }
    if (mainAnalysisDue) {
      state.pendingLatestAnalysis = false;
      state.consecutiveScoutStarts = 0;
      startAnalysis(now);
      return;
    }
    if (rainbowScoutDue) {
      state.consecutiveScoutStarts += 1;
      startRainbowScout(now);
    }
  }

  function detectionClockNow() {
    return performance.now();
  }

  function markAnalysisProgress(phase = state.analysisPhase || "working") {
    const now = performance.now();
    state.lastAnalysisProgressAt = now;
    state.analysisProgressPhase = String(phase || "working");m39ReleaseLatencyAudit.record({event:"phase",phase:state.analysisProgressPhase,analysisStartedAt:state.analysisStartedAt,session:state.captureSessionId,streak:state.streak});
    return now;
  }

  function resetOcrFrameEvidence() {
    state.ocrFrameEvidenceActive = false;
    state.ocrFrameEvidenceLastAt = 0;
    state.ocrFrameEvidence = [];
  }

  function maybeCaptureOcrFrameEvidence(timestamp = performance.now()) {
    if (!state.analysisBusy || state.analysisPhase !== "ocr" || !state.ocrFrameEvidenceActive || !video.videoWidth) return false;
    if (state.ocrFrameEvidence.length >= OCR_FRAME_EVIDENCE_MAX) return false;
    const now = Number.isFinite(timestamp) ? timestamp : performance.now();
    if (now - state.ocrFrameEvidenceLastAt < OCR_FRAME_EVIDENCE_INTERVAL_MS) return false;
    const canvas = captureSearchCanvas();
    state.ocrFrameEvidence.push({ canvas, capturedAt: detectionClockNow(), wallCapturedAt: performance.now() });
    state.ocrFrameEvidenceLastAt = now;
    markAnalysisProgress("ocr-evidence-captured");
    return true;
  }

  function selectTextInputPromptCandidate(contourResult) {
    return (contourResult?.candidates || [])
      .filter((candidate) => {
        const id = String(candidate?.id || "");
        if (!id.startsWith("text-input-prompt-")) return false;
        if (candidate?.matched === true) return true;
        return id === "text-input-prompt-99116" && (Number(candidate?.score || -1) - Number(candidate?.threshold || 1)) >= -0.04;
      })
      .sort((a, b) => (Number(b.score || -1) - Number(b.threshold || 1)) - (Number(a.score || -1) - Number(a.threshold || 1)))[0] || null;
  }

  function makeOcrEvidence(result, contourResult, canvas, origin) {
    if (!result?.matched || !canvas?.width || !canvas?.height) return null;
    const label = resolveOcrLabel(result, contourResult);
    if (!["문자 입력형", "비올레타형", "클릭형 거탐", "거짓말 탐지기 팝업"].includes(label)) return null;
    const rect = result.rect || null;
    if (!rect) return null;
    const centerX = (Number(rect.x || 0) + Number(rect.w || 0) / 2) / Math.max(1, canvas.width);
    const centerY = (Number(rect.y || 0) + Number(rect.h || 0) / 2) / Math.max(1, canvas.height);
    return {
      result, label, origin, frameMarker:canvas.auditFrameMarker,
      ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:strictThreeOcrObservation(result,canvas,"snapshot")}:{}),
      locationKey: `${label}:${Math.round(centerX * 10)}:${Math.round(centerY * 10)}`,
      centerX, centerY
    };
  }

  function findConfirmedOcrEvidencePair(evidence) {
    if(M35_SINGLE_CONFIRMATION_ENABLED){
      const item=evidence.at(-1);
      if(!item?.result||item.result.matched!==true||item.result.incomplete===true)return null;
      const owner=strictThreeOcrFrames.get(item.result);
      return owner&&m35Owned(owner)?[item]:null;
    }
    for (let i = 0; i < evidence.length; i += 1) {
      for (let j = i + 1; j < evidence.length; j += 1) {
        const a = evidence[i], b = evidence[j];
        if (a.label !== b.label) continue;
        if (!isIndependentTargetedRecheckFrame(a.frameMarker,b.frameMarker)) continue;
        const distance = Math.hypot(Number(a.centerX || 0) - Number(b.centerX || 0), Number(a.centerY || 0) - Number(b.centerY || 0));
        if (distance <= 0.12) return [a, b];
      }
    }
    return null;
  }

  async function collectQueuedOcrEvidence(ocr, primaryResult, primaryCanvas, contourResult, preferredRects, clickLikely, snapshotsOverride = null, perFrameTimeoutMs = 12000, captureSessionIdAtStart = state.captureSessionId, streamAtStart = state.stream, monitorRegionRevisionAtStart = state.monitorRegionRevision, totalBudgetMs = getRecoveryOcrTotalBudgetMs()) {
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
    if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
    const evidence = [];
    const strictThreeEvents=STRICT_THREE_INPUT_RESEARCH_ENABLED&&primaryCanvas?[strictThreeOcrObservation(primaryResult,primaryCanvas,"snapshot")]:[];
    const recoveryStartedAt = performance.now();
    const recoveryBudgetMs = Math.min(Math.max(0,Number(totalBudgetMs)||0),remainingAnalysisBudgetMs());
    const primaryEvidence = makeOcrEvidence(primaryResult, contourResult, primaryCanvas, "primary");
    if (primaryEvidence) evidence.push(primaryEvidence);
    const snapshotSource = Array.isArray(snapshotsOverride) ? snapshotsOverride : state.ocrFrameEvidence;
    // P4-R5: primary 실패를 견딜 수 있도록 최신 증거 최대 2장을 사용한다.
    const snapshots = snapshotSource.slice(-2);
    for (let snapshotIndex = 0; snapshotIndex < snapshots.length; snapshotIndex += 1) {
      const snapshot = snapshots[snapshotIndex];
      if (findConfirmedOcrEvidencePair(evidence)) break;
      const elapsedBeforeFrame = performance.now() - recoveryStartedAt;
      const remainingBudgetBeforeFrame = recoveryBudgetMs - elapsedBeforeFrame;
      if (remainingBudgetBeforeFrame < 1200) break;
      markAnalysisProgress("ocr-recovery-contour");

      let followResult = null;
      let snapshotContour = contourResult;
      let snapshotPreferredRects = preferredRects;
      let snapshotClickLikely = clickLikely;
      try {
        if (window.MAlertTextContourMatcher) {
          snapshotContour = await window.MAlertTextContourMatcher.analyze(snapshot.canvas);
          markAnalysisProgress("ocr-recovery-contour-done");
          if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
          const snapshotPrompt = selectTextInputPromptCandidate(snapshotContour);
          if (!snapshotPrompt) {if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeEvents.push(strictThreeOcrObservation({matched:false},snapshot.canvas,"snapshot"));continue;}
          // 시간축 복구 프레임은 text-input prompt 자체가 다시 확인된 경우만 OCR한다.
          // 원 프레임의 일반 preferred rect/click 힌트는 위치가 이미 달라졌을 수 있어 복구 OCR에서는 사용하지 않는다.
          snapshotPreferredRects = [];
          snapshotClickLikely = false;
        }
        markAnalysisProgress("ocr-recovery-run");
        const elapsedBeforeOcr = performance.now() - recoveryStartedAt;
        const remainingBudget = Math.min(remainingAnalysisBudgetMs(),Math.max(0, recoveryBudgetMs - elapsedBeforeOcr));
        if (remainingBudget < 1200) break;
        // primary가 이미 한 표라면 최신 복구 한 장에 남은 예산을 충분히 배정한다.
        // primary 표가 없으면 남은 프레임들이 총 복구 예산을 나눠 갖는다.
        const framesLeft = Math.max(1, snapshots.length - snapshotIndex);
        const budgetShare = primaryEvidence ? remainingBudget : Math.max(1200, Math.floor(remainingBudget / framesLeft));
        const frameTimeoutMs = Math.max(1200, Math.min(Number(perFrameTimeoutMs || 12000), budgetShare));
        followResult = await withDetectorTimeout(ocr.analyze(snapshot.canvas, {
          preferredRects: snapshotPreferredRects,
          contourCandidates: snapshotContour?.candidates || [],
          contourBest: snapshotContour || null,
          clickLikely: snapshotClickLikely,
          skipOcr: false
        }), frameTimeoutMs);
        if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
        state.ocrLast = followResult;
        markAnalysisProgress("ocr-recovery-done");
      } catch (error) {
        if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
        if (error?.code === "DETECTOR_TIMEOUT") {
          try { await window.MAlertOcr?.terminate?.(); } catch (_) {}
          if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
        }
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeEvents.push(strictThreeOcrObservation({matched:false},snapshot.canvas,"snapshot"));
        continue;
      }
      if (!sessionIsCurrent()) return { evidence: [], confirmed: null, stale: true };
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeEvents.push(strictThreeOcrObservation(followResult,snapshot.canvas,"snapshot"));
      const item = makeOcrEvidence(followResult, snapshotContour, snapshot.canvas, "queued-frame");
      if (item) evidence.push(item);
    }

    const confirmed = findConfirmedOcrEvidencePair(evidence);
    return { evidence, confirmed, ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvents}:{}) };
  }

  function normalizeScoutRect(rect, width, height) {
    if (!rect || !width || !height) return null;
    return {
      x: Number(rect.x || 0) / width,
      y: Number(rect.y || 0) / height,
      w: Number(rect.w || 0) / width,
      h: Number(rect.h || 0) / height
    };
  }

  function sameRainbowScoutLocation(previous, current) {
    if (!previous?.rect || !current?.rect) return false;
    const overlap = rectIoU(previous.rect, current.rect);
    const previousCenterX = previous.rect.x + previous.rect.w / 2;
    const previousCenterY = previous.rect.y + previous.rect.h / 2;
    const currentCenterX = current.rect.x + current.rect.w / 2;
    const currentCenterY = current.rect.y + current.rect.h / 2;
    const distance = Math.hypot(
      previousCenterX - currentCenterX,
      previousCenterY - currentCenterY
    );
    const previousArea = Math.max(1e-6, previous.rect.w * previous.rect.h);
    const currentArea = Math.max(1e-6, current.rect.w * current.rect.h);
    const areaRatio = previousArea / currentArea;
    return overlap >= 0.10 || (
      distance <= 0.16 &&
      areaRatio >= 0.40 &&
      areaRatio <= 2.50
    );
  }

  function pickRainbowScoutCandidate(result, prefix) {
    return [result, ...(result?.candidates || [])]
      .filter(Boolean)
      .filter((candidate, index, array) => array.indexOf(candidate) === index)
      .filter((candidate) => String(candidate?.id || "").startsWith(prefix))
      .sort((a, b) => {
        const matchedOrder = Number(Boolean(b?.matched)) - Number(Boolean(a?.matched));
        if (matchedOrder) return matchedOrder;
        const marginA = Number(a?.score || -1) - Number(a?.threshold || 1);
        const marginB = Number(b?.score || -1) - Number(b?.threshold || 1);
        return marginB - marginA || Number(b?.score || -1) - Number(a?.score || -1);
      })[0] || null;
  }

  function rainbowRecoveryCompanion(recoveryEvidence, allCandidates, searchCanvas) {
    if (!recoveryEvidence?.rect) return null;
    return (allCandidates || [])
      .filter(Boolean)
      .filter((candidate) => String(candidate?.id || "").startsWith("rainbow-prompt-"))
      .filter((candidate) => Number(candidate?.score || -1) >= RAINBOW_RECOVERY_COMPANION_FLOOR)
      .map((candidate) => ({
        candidate,
        evidence: {
          rect: normalizeScoutRect(candidate.rect, searchCanvas.width, searchCanvas.height)
        }
      }))
      .filter((item) => item.evidence.rect && sameRainbowScoutLocation(recoveryEvidence, item.evidence))
      .sort((a, b) => Number(b.candidate.score || -1) - Number(a.candidate.score || -1))[0]?.candidate || null;
  }

  function adaptiveRainbowEvidenceWindowMs(recovery = false) {
    const base = recovery ? RAINBOW_RECOVERY_EVIDENCE_WINDOW_MS : RAINBOW_EVIDENCE_WINDOW_MS;
    const maximum = recovery ? RAINBOW_RECOVERY_EVIDENCE_WINDOW_MAX_MS : RAINBOW_EVIDENCE_WINDOW_MAX_MS;
    const measured = Number(recovery ? state.rainbowLastRecoveryDurationMs : state.rainbowLastScoutDurationMs) || 0;
    // 저사양에서 한 번의 quick scan 자체가 기본 evidence window보다 길어져도 이전 표를 잃지 않게 한다.
    return Math.min(maximum, Math.max(base, Math.round(measured * 2.6 + 700)));
  }

  function rainbowHueSignature(searchCanvas, rect) {
    if (!rect || !searchCanvas?.width || !searchCanvas?.height) return { pass: false, occupied: 0, entropy: 0, saturatedRatio: 0 };
    const x = Math.max(0, Math.floor(Number(rect.x || 0)));
    const y = Math.max(0, Math.floor(Number(rect.y || 0)));
    const w = Math.max(1, Math.min(searchCanvas.width - x, Math.ceil(Number(rect.w || 0))));
    const h = Math.max(1, Math.min(searchCanvas.height - y, Math.ceil(Number(rect.h || 0))));
    if (w < 4 || h < 4) return { pass: false, occupied: 0, entropy: 0, saturatedRatio: 0 };
    const sampleWidth = Math.max(12, Math.min(96, w));
    const sampleHeight = Math.max(12, Math.round(h * sampleWidth / w));
    const sample = document.createElement("canvas");
    sample.width = sampleWidth;
    sample.height = sampleHeight;
    const context = sample.getContext("2d", { alpha: false, willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.drawImage(searchCanvas, x, y, w, h, 0, 0, sampleWidth, sampleHeight);
    const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const bins = new Array(12).fill(0);
    let saturated = 0;
    const total = sampleWidth * sampleHeight;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
      const saturation = max > 0 ? delta / max : 0;
      if (saturation < 0.45 || max < 0.25 || delta <= 1e-6) continue;
      let hue;
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * (((b - r) / delta) + 2);
      else hue = 60 * (((r - g) / delta) + 4);
      if (hue < 0) hue += 360;
      bins[Math.min(11, Math.floor(hue / 30))] += 1;
      saturated += 1;
    }
    let occupied = 0, entropy = 0;
    if (saturated > 0) {
      for (const count of bins) {
        const fraction = count / saturated;
        if (fraction > 0.03) occupied += 1;
        if (fraction > 0) entropy -= fraction * Math.log2(fraction);
      }
    }
    const saturatedRatio = saturated / Math.max(1, total);
    return {
      pass: saturatedRatio >= 0.15 && occupied >= 4 && entropy >= 1.75,
      occupied, entropy, saturatedRatio
    };
  }


  const M37_FP1_ENABLED=window.__MALERT_M37_STATIC_RECOVERY_SEMANTIC_ONLY_EXPERIMENT===true&&M35_SINGLE_CONFIRMATION_ENABLED===true&&DETECTION_CONFIRM_COUNT===1&&(['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname||'') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  let m37Fp1BlockedStaticVisual=0,m37Fp1Last=null;
  window.MAlertM37Fp1Research=Object.freeze({enabled:()=>M37_FP1_ENABLED,status:()=>({enabled:M37_FP1_ENABLED,defaultOff:true,scope:'Only static recovery visual fallback; original independently queued semantic OCR route retained',confirmationVotes:DETECTION_CONFIRM_COUNT,newDetectorCalls:0,newOcrCalls:0,blockedStaticVisual:m37Fp1BlockedStaticVisual,last:m37Fp1Last?structuredClone(m37Fp1Last):null,staticLegitimateRecall:'UNVERIFIED'})});

  async function confirmRainbowRecovery(result, allCandidates, searchCanvas, captureSessionIdAtStart = state.captureSessionId, streamAtStart = state.stream, monitorRegionRevisionAtStart = state.monitorRegionRevision) {
    const captureIsCurrent = () => isCaptureSessionCurrent(captureSessionIdAtStart, streamAtStart);
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
    if (!sessionIsCurrent()) return false;
    const now = detectionClockNow();
    const id = String(result?.id || "");
    const ocrRequired = id.startsWith("rainbow-recovery-static-");
    const score = Number(result?.score || -1);
    const threshold = Number(result?.threshold || 1);
    const normalizedRect = normalizeScoutRect(result?.rect, searchCanvas.width, searchCanvas.height);
    const eligible = id.startsWith("rainbow-recovery-") &&
      Boolean(result?.matched) &&
      normalizedRect &&
      rectInsideSearchMonitorRegion(result?.rect, searchCanvas);

    state.rainbowRecoveryEvidence = state.rainbowRecoveryEvidence.filter(
      (saved) => now - saved.at <= adaptiveRainbowEvidenceWindowMs(true)
    );
    if (!eligible) return false;

    state.rainbowFocusUntil = now + RAINBOW_FOCUS_WINDOW_MS;
    state.rainbowScoutDelayMs = RAINBOW_FOCUS_INTERVAL_MS;

    const evidence = { at: now, id, rect: normalizedRect, score, threshold, ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeProof:strictThreeRainbowProof(result,searchCanvas,"rainbow-recovery")}: {}) };
    const compatible = state.rainbowRecoveryEvidence.filter((saved) =>
      sameRainbowScoutLocation(saved, evidence)
    );
    state.rainbowRecoveryEvidence.push(evidence);
    state.rainbowRecoveryEvidence = state.rainbowRecoveryEvidence.slice(-8);
    const group = [...compatible, evidence];
    const votes = Math.min(RAINBOW_RECOVERY_REQUIRED_VOTES, group.length);
    const strongestScore = M35_SINGLE_CONFIRMATION_ENABLED?score:Math.max(...(STRICT_THREE_INPUT_RESEARCH_ENABLED?state.rainbowRecoveryEvidence.slice(-3):group).map((item) => Number(item.score || -1)));

    $("#candidateCount").textContent = `가림·회전 보조 ${votes}/${RAINBOW_RECOVERY_REQUIRED_VOTES}표`;
    $("#matchScore").textContent = score.toFixed(3);
    $("#detectedType").textContent = `클릭형 거탐 · 가림/회전 보조 후보 · ${votes}/${RAINBOW_RECOVERY_REQUIRED_VOTES}표`;
    setRuntime("monitoring", `가림/회전 거탐 후보 재확인 · ${votes}/${RAINBOW_RECOVERY_REQUIRED_VOTES}표`);

    if (votes >= (M35_SINGLE_CONFIRMATION_ENABLED?1:RAINBOW_RECOVERY_OCR_VOTES) && !state.analysisBusy && !state.rainbowRecoveryOcrBusy && now - state.rainbowRecoveryLastOcrAt >= 650) {
      state.rainbowRecoveryOcrBusy = true;
      state.rainbowRecoveryLastOcrAt = now;
      const recoverySerialAtOcrStart = state.rainbowDetectionSerial;

      // OCR은 보조 확정 경로다. 여기서 await하면 OCR이 느린 환경에서
      // 2표 상태로 스카우트가 멈춰 2.2초 evidence window가 만료될 수 있다.
      // 비동기로 돌려 3표 시각 확정 경로가 OCR과 독립적으로 계속 진행되게 한다.
      void (async () => {
        try {
          const ocr = await ensureOcrLoaded();
          if (!sessionIsCurrent()) return;
          const ocrResult = await withDetectorTimeout(ocr.analyze(searchCanvas, {
            rainbowRecoveryRegions: [result.rect],
            preferredRects: [result.rect],
            contourCandidates: [],
            contourBest: null,
            clickLikely: true,
            skipOcr: false
          }), 13000, "가림/회전 거탐 OCR");
          if (!sessionIsCurrent()) return;
          state.ocrLast = ocrResult;
          if (ocrResult?.matched) {
            // OCR 도중 3표 시각 경로 등 다른 레인보우 확정이 먼저 끝났으면 중복 확정 금지.
            if (state.rainbowDetectionSerial !== recoverySerialAtOcrStart) return;
            if(STRICT_THREE_INPUT_RESEARCH_ENABLED){
              if(!state.rainbowRecoveryEvidence.includes(evidence))return;
              const frameOwner=strictThreeFrames.get(searchCanvas);
              const proof={...evidence.strictThreeProof,policy:'rainbow-recovery-ocr',identity:strictThreeSemanticIdentity(ocrResult),
                frame:frameOwner,matched:ocrResult.matched===true,evidenceRecordedAt:performance.now()};
              evidence.strictThreeOcrProof=proof;
              const decision=strictThreeGateExisting(state.rainbowRecoveryEvidence.map(e=>e.strictThreeOcrProof),proof,
                p=>state.rainbowRecoveryEvidence.some(e=>e.strictThreeOcrProof===p&&detectionClockNow()-e.at<=adaptiveRainbowEvidenceWindowMs(true)));
              if(!decision.ready)return;
            }
            if(!m35Final('rainbow-recovery-ocr',ocrResult,searchCanvas))return;
            const detectedLabel = resolveOcrLabel(ocrResult, result) || "클릭형 거탐";
            const best = {
              id: `rainbow-recovery-ocr-${id}`,
              label: detectedLabel === "문자 입력형" || detectedLabel === "비올레타형" ? detectedLabel : "클릭형 거탐",
              score: Number(ocrResult.score || score),
              threshold: Number(ocrResult.threshold || threshold),
              matched: true,
              quickRecheck: true,
              rect: result.rect || null,
              source: `가림/회전 레인보우 보조 + OCR 문구 확인 · ${id} · ${votes}표`,
              requiredStreak: M35_SINGLE_CONFIRMATION_ENABLED?1:(STRICT_THREE_INPUT_RESEARCH_ENABLED?3:2),
              confirmationMode: "rainbow-occlusion-ocr-recovery",
              ocrText: ocrResult.text || ocrResult.rawText || "",
              ocrDurationMs: Number(ocrResult.durationMs || 0)
            };
            state.lastAnalysisBest = {
              ...best, analyzedAt: new Date().toISOString(), sharedWidth: video.videoWidth, sharedHeight: video.videoHeight,
              analysisCount: state.completedAnalyses, scoutCount: state.rainbowScoutScans
            };
            state.lastBestRect = mapSearchRectToVideoRect(searchCanvas, result.rect);
            state.candidateId = best.label;
            state.streak = M35_SINGLE_CONFIRMATION_ENABLED?1:(STRICT_THREE_INPUT_RESEARCH_ENABLED?3:2);
            state.misses = 0;
            state.detected = true;
            state.rainbowDetectionSerial += 1;
            state.rainbowEvidence = [];
            state.rainbowRecoveryEvidence = [];
            state.rainbowFocusUntil = 0;
            state.rainbowScoutDelayMs = RAINBOW_SCOUT_INTERVAL_MS;
            $("#detectedType").textContent = `${best.label} · ${best.source}`;
            setRuntime("detected", `${best.label} 감지`);
            const alertNow = Date.now();
            const cooldownMs = state.config.cooldownSeconds * 1000;
            if (alertTypeCooldownAllows(best,alertNow,cooldownMs,'rainbow-recovery-ocr')) {
              state.lastAlertAt = alertNow;
              cacheLastAlertSnapshot(best).catch((error) => console.warn("알림 화면 저장 실패:", error));
              emitAlert(best.label, best.score);
            }
          }
        } catch (error) {
          if (sessionIsCurrent()) console.warn("가림/회전 레인보우 OCR 보조 실패:", error);
        } finally {
          // 영역 revision이 바뀌어 결과는 폐기되더라도 같은 공유 세션의 busy 플래그는 해제한다.
          if (captureIsCurrent()) state.rainbowRecoveryOcrBusy = false;
        }
      })();
    }

    const companion = rainbowRecoveryCompanion(evidence, allCandidates, searchCanvas);
    const visualMargin = strongestScore - threshold;
    const timerlessHue = ocrRequired ? rainbowHueSignature(searchCanvas, result.rect) : null;
    if (ocrRequired) {
      // 숫자 무시 템플릿은 전역 탐색하지 않고 기존 템플릿이 근접 후보를 만든 경우에만 진입한다.
      // OCR이 실패하는 회전/가림 화면은 동일 위치 3표 + 다색 레인보우 구조로만 보조 확정한다.
      if (votes < DETECTION_CONFIRM_COUNT || visualMargin < 0.02 || !timerlessHue?.pass) return false;
      if(M37_FP1_ENABLED){
        m37Fp1BlockedStaticVisual++;
        m37Fp1Last={id,score,threshold,rect:result.rect?{...result.rect}:null,votes,visualMargin,timerlessHue:timerlessHue?{...timerlessHue}:null,reason:'STATIC_VISUAL_REQUIRES_EXISTING_SEMANTIC_OCR_ROUTE'};
        if(typeof m37FpObserve==='function')m37FpObserve('fp1-static-semantic-required',result,searchCanvas,{...m37Fp1Last,firstReject:'fp1-static-semantic-required',candidateBlocked:true});
        return false;
      }

    }
    const strongVisual = visualMargin >= RAINBOW_RECOVERY_STRONG_MARGIN;
    const companionVisual = visualMargin >= RAINBOW_RECOVERY_COMPANION_MARGIN && Boolean(companion);
    if (!ocrRequired && (votes < DETECTION_CONFIRM_COUNT || (!strongVisual && !companionVisual))) return false;

    if(STRICT_THREE_INPUT_RESEARCH_ENABLED){
      const decision=strictThreeGateExisting(state.rainbowRecoveryEvidence.map(e=>e.strictThreeProof),evidence.strictThreeProof);
      if(!decision.ready)return false;
    }
    if(!m35Final('rainbow-recovery-visual',result,searchCanvas))return false;
    const best = {
      id: `text-contour-${id}`,
      label: "클릭형 거탐",
      score: strongestScore,
      threshold,
      matched: true,
      quickRecheck: true,
      rect: result.rect || null,
      source: ocrRequired
        ? `카운트다운 무시 보조 ${votes}표 + 레인보우 색상 확인(${timerlessHue.occupied}색/엔트로피 ${timerlessHue.entropy.toFixed(2)})`
        : (companionVisual ? `가림/회전 레인보우 보조 ${votes}표 + 기존 레인보우 동반 ${String(companion?.id || "")}` : `가림/회전 레인보우 강일치 ${votes}표`),
      requiredStreak: RAINBOW_RECOVERY_REQUIRED_VOTES,
      confirmationMode: "rainbow-occlusion-3vote-recovery",
      ocrText: "",
      ocrDurationMs: 0
    };
    state.lastAnalysisBest = {
      ...best, analyzedAt: new Date().toISOString(), sharedWidth: video.videoWidth, sharedHeight: video.videoHeight,
      analysisCount: state.completedAnalyses, scoutCount: state.rainbowScoutScans
    };
    state.lastBestRect = mapSearchRectToVideoRect(searchCanvas, result.rect);
    state.candidateId = best.label;
    state.streak = DETECTION_CONFIRM_COUNT;
    state.misses = 0;
    state.detected = true;
    state.rainbowDetectionSerial += 1;
    state.rainbowEvidence = [];
    state.rainbowRecoveryEvidence = [];
    state.rainbowFocusUntil = 0;
    state.rainbowScoutDelayMs = RAINBOW_SCOUT_INTERVAL_MS;
    $("#detectedType").textContent = `${best.label} · ${best.source}`;
    setRuntime("detected", `${best.label} 감지`);
    const alertNow = Date.now();
    const cooldownMs = state.config.cooldownSeconds * 1000;
    if (alertTypeCooldownAllows(best,alertNow,cooldownMs,'rainbow-recovery')) {
      state.lastAlertAt = alertNow;
      cacheLastAlertSnapshot(best).catch((error) => console.warn("알림 화면 저장 실패:", error));
      emitAlert(best.label, best.score);
    }
    return true;
  }

  function confirmRainbowScout(result, searchCanvas) {
    const now = detectionClockNow();
    const threshold = Number(result?.threshold || 1);
    const score = Number(result?.score || -1);
    const margin = score - threshold;
    const normalizedRect = normalizeScoutRect(
      result?.rect,
      searchCanvas.width,
      searchCanvas.height
    );
    const insideMonitorRegion = rectInsideSearchMonitorRegion(
      result?.rect,
      searchCanvas
    );
    const isRainbowCandidate =
      String(result?.id || "").startsWith("rainbow-prompt-") &&
      Boolean(result?.matched) &&
      normalizedRect &&
      insideMonitorRegion;
    const nearCandidate =
      String(result?.id || "").startsWith("rainbow-prompt-") &&
      normalizedRect &&
      insideMonitorRegion &&
      margin >= -RAINBOW_NEAR_MARGIN;

    state.rainbowEvidence = state.rainbowEvidence.filter(
      (evidence) => now - evidence.at <= adaptiveRainbowEvidenceWindowMs(false)
    );

    if (nearCandidate) {
      state.rainbowFocusUntil = now + RAINBOW_FOCUS_WINDOW_MS;
      state.rainbowScoutDelayMs = RAINBOW_FOCUS_INTERVAL_MS;
    } else if (now >= state.rainbowFocusUntil) {
      state.rainbowScoutDelayMs = RAINBOW_SCOUT_INTERVAL_MS;
      state.rainbowEvidence = [];
      state.rainbowLastCandidate = null;
    }

    if (!isRainbowCandidate) return false;

    const evidence = {
      at: now,
      id: String(result.id),
      rect: normalizedRect,
      score,
      threshold,
      margin,
      ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeProof:strictThreeRainbowProof(result,searchCanvas,"rainbow-scout")}:{})
    };
    const compatible = state.rainbowEvidence.filter((saved) =>
      sameRainbowScoutLocation(saved, evidence)
    );
    state.rainbowEvidence.push(evidence);
    state.rainbowEvidence = state.rainbowEvidence.slice(-6);
    state.rainbowLastCandidate = evidence;

    const evidenceGroup = [...compatible, evidence];
    const strictThreeDecision=STRICT_THREE_INPUT_RESEARCH_ENABLED?strictThreeGateExisting(state.rainbowEvidence.map(e=>e.strictThreeProof),evidence.strictThreeProof):null;
    const strictThreeRequired=M35_SINGLE_CONFIRMATION_ENABLED?1:(STRICT_THREE_INPUT_RESEARCH_ENABLED?DETECTION_CONFIRM_COUNT:2);
    const votes = STRICT_THREE_INPUT_RESEARCH_ENABLED?strictThreeDecision.votes:Math.min(2, evidenceGroup.length);
    const strongestMargin = M35_SINGLE_CONFIRMATION_ENABLED?margin:Math.max(...(STRICT_THREE_INPUT_RESEARCH_ENABLED?state.rainbowEvidence.slice(-3):evidenceGroup).map((item) => item.margin));
    $("#candidateCount").textContent = `애니메이션형 ${votes}/${strictThreeRequired}표`;
    $("#matchScore").textContent = score.toFixed(3);
    $("#detectedType").textContent =
      `클릭형 거탐 · 전체 화면 경량 탐색 · ${votes}/${strictThreeRequired}표`;
    setRuntime("monitoring", `애니메이션형 거탐 반복 확인 · ${votes}/${strictThreeRequired}표`);

    if (votes < strictThreeRequired || strongestMargin < RAINBOW_STRONG_MARGIN) return false;
    if(!m35Final('rainbow-scout',result,searchCanvas))return false;

    const best = {
      id: `text-contour-${result.id}`,
      label: "클릭형 거탐",
      score,
      threshold,
      matched: true,
      quickRecheck: true,
      rect: result.rect || null,
      source: `전체 화면 애니메이션형 안내 · ${result.id} · ${votes}/${strictThreeRequired}표`,
      requiredStreak: strictThreeRequired,
      confirmationMode: "adaptive-rainbow-scout",
      ocrText: "",
      ocrDurationMs: Number(result.durationMs || 0)
    };
    state.lastAnalysisBest = {
      ...best,
      analyzedAt: new Date().toISOString(),
      sharedWidth: video.videoWidth,
      sharedHeight: video.videoHeight,
      analysisCount: state.completedAnalyses,
      scoutCount: state.rainbowScoutScans
    };
    state.lastBestRect = mapSearchRectToVideoRect(searchCanvas, result.rect);
    state.candidateId = best.label;
    state.streak = strictThreeRequired;
    state.misses = 0;
    state.detected = true;
    state.rainbowDetectionSerial += 1;
    state.rainbowEvidence = [];
    state.rainbowFocusUntil = 0;
    state.rainbowScoutDelayMs = RAINBOW_SCOUT_INTERVAL_MS;
    $("#detectedType").textContent = `${best.label} · ${best.source}`;
    setRuntime("detected", `${best.label} 감지`);

    const alertNow = Date.now();
    const cooldownMs = state.config.cooldownSeconds * 1000;
    if (alertTypeCooldownAllows(best,alertNow,cooldownMs,'rainbow-scout')) {
      state.lastAlertAt = alertNow;
      cacheLastAlertSnapshot(best).catch((error) =>
        console.warn("알림 화면 저장 실패:", error)
      );
      emitAlert(best.label, best.score);
    }
    return true;
  }

  const RAINBOW_TIMERLESS_TRIGGER_MARGIN = 0.10;

  function timerlessRecoveryIdFor(candidateId) {
    const id = String(candidateId || "");
    if (id.startsWith("rainbow-prompt-recent-")) return `rainbow-recovery-static-${id.slice("rainbow-prompt-".length)}`;
    if (id.startsWith("rainbow-prompt-zud-")) return `rainbow-recovery-static-${id.slice("rainbow-prompt-".length)}`;
    if (id.startsWith("rainbow-recovery-") && !id.startsWith("rainbow-recovery-static-")) {
      return `rainbow-recovery-static-${id.slice("rainbow-recovery-".length)}`;
    }
    return "";
  }

  async function runTimerlessFallback(
    candidate, companionCandidates = [], searchCanvas,
    captureSessionIdAtStart = state.captureSessionId, streamAtStart = state.stream,
    monitorRegionRevisionAtStart = state.monitorRegionRevision
  ) {
    if (!candidate?.rect || !searchCanvas) return false;
    const detectionSerialAtStart = state.rainbowDetectionSerial;
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart) &&
      state.rainbowDetectionSerial === detectionSerialAtStart;
    const margin = Number(candidate?.score || -1) - Number(candidate?.threshold || 1);
    if (margin < -RAINBOW_TIMERLESS_TRIGGER_MARGIN) return false;
    const staticId = timerlessRecoveryIdFor(candidate.id);
    if (!staticId) return false;
    const staticResult = await window.MAlertTextContourMatcher.analyzeQuick(searchCanvas, { ids: [staticId] });
    if (!sessionIsCurrent()) return false;
    state.rainbowLastRecoveryDurationMs = Number(staticResult?.durationMs || 0);
    const staticCandidate = pickRainbowScoutCandidate(staticResult, "rainbow-recovery-static-");
    if (!staticCandidate?.matched) return false;
    await confirmRainbowRecovery(staticCandidate, companionCandidates, searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
    return true;
  }


  function pendingPriorityColorVoteCount(timestamp = performance.now()) {
    if (!state.stream || state.paused || state.regionSelecting) return 0;
    return state.priorityColorEvidence.filter(e =>
      e.sessionId === state.captureSessionId && e.stream === state.stream &&
      e.revision === state.monitorRegionRevision && e.epoch === state.priorityColorEpoch &&
      e.sourceWidth === video.videoWidth && e.sourceHeight === video.videoHeight &&
      timestamp >= e.capturedAt && timestamp - e.capturedAt <= PRIORITY_COLOR_WINDOW_MS).length;
  }

  function resetPriorityColorScout() {
    state.priorityColorEpoch += 1;
    state.priorityColorEvidence = [];
    state.priorityColorLastFrame = null;
    state.lastPriorityColorAt = -PRIORITY_COLOR_INTERVAL_MS;
    // An invalidated operation still owns its busy lock until its real promise
    // settles. Reset/pause/stop must not launch a second copy of that operation.
  }

  function collectPriorityColorVote(result, canvas, marker, scope, capturedAt) {
    const now = performance.now();
    if (!result?.matched || result.id !== 'text-input-colored-guide' || !result.rect ||
        marker?.kind !== 'frame-count' || !Number.isFinite(marker.value) ||
        !Number.isFinite(capturedAt) || now < capturedAt || now - capturedAt > PRIORITY_COLOR_MAX_AGE_MS) {
      state.priorityColorEvidence = [];
      return 0;
    }
    const group = state.priorityColorEvidence.filter(e =>
      e.sessionId === scope.sessionId && e.stream === scope.stream && e.revision === scope.revision && e.epoch === scope.epoch &&
      e.identity === result.id && e.width === canvas.width && e.height === canvas.height &&
      e.sourceWidth === scope.sourceWidth && e.sourceHeight === scope.sourceHeight &&
      now >= e.capturedAt && now - e.capturedAt <= PRIORITY_COLOR_WINDOW_MS &&
      sameTargetedContourLocation(e.rect, result.rect, canvas.width, canvas.height));
    if (group.length && !isIndependentTargetedRecheckFrame(group[group.length - 1].marker, marker)) {
      state.priorityColorEvidence = group;
      return group.length;
    }
    group.push({...scope, identity: result.id, capturedAt, marker: {...marker}, rect: {...result.rect}, width: canvas.width, height: canvas.height});
    state.priorityColorEvidence = group.slice(-3);
    return Math.min(DETECTION_CONFIRM_COUNT, group.length);
  }

  function startPriorityColorScout(timestamp = performance.now()) {
    if (!state.stream || state.paused || state.regionSelecting || !state.cvReady || !state.model ||
        !state.analysisBusy || !['contour', 'ocr'].includes(state.analysisPhase) ||
        timestamp - state.analysisStartedAt < PRIORITY_COLOR_START_AFTER_MS ||
        state.priorityColorBusy || timestamp - state.lastPriorityColorAt < PRIORITY_COLOR_INTERVAL_MS ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) return Promise.resolve(false);
    const currentMarker = getTargetedRecheckFrameMarker();
    if (currentMarker?.kind !== 'frame-count' || !Number.isFinite(currentMarker.value) ||
        (state.priorityColorLastFrame && !isIndependentTargetedRecheckFrame(state.priorityColorLastFrame, currentMarker))) return Promise.resolve(false);
    const scope = {sessionId: state.captureSessionId, stream: state.stream, revision: state.monitorRegionRevision,
      epoch: state.priorityColorEpoch, sourceWidth: video.videoWidth, sourceHeight: video.videoHeight};
    const sessionIsCurrent = () => isAnalysisContextCurrent(scope.sessionId, scope.stream, scope.revision) &&
      !state.regionSelecting && state.priorityColorEpoch === scope.epoch &&
      video.videoWidth === scope.sourceWidth && video.videoHeight === scope.sourceHeight;
    const detectionSerialAtStart = state.rainbowDetectionSerial;
    state.priorityColorBusy = true;
    state.lastPriorityColorAt = timestamp;
    state.priorityColorLastFrame = {...currentMarker};
    return (async () => {
      const capturedAt = performance.now(), canvas = captureSearchCanvas();
      const marker = canvas.auditFrameMarker;
      const result = await findColoredInputGuide(canvas);
      if (!sessionIsCurrent()) return false;
      if (state.rainbowDetectionSerial !== detectionSerialAtStart) {
        state.priorityColorEvidence = [];
        return false;
      }
      const votes = collectPriorityColorVote(result, canvas, marker, scope, capturedAt);
      if (!result?.matched || votes < DETECTION_CONFIRM_COUNT) return false;
      if(!m35Final('priority-color',result,canvas))return false;
      // These are this lane's three independent fresh frames, never main-path
      // streaks or scout votes. Supersede late results from the older main frame.
      const best = {...result, preconfirmed: true, requiredStreak: 3, confirmationMode: 'colored-priority-3vote',
        source: '장시간 분석 중 최신 문자 안내문 · 독립 프레임 2회 확인'};
      state.rainbowDetectionSerial += 1;
      state.priorityColorEvidence = [];
      state.lastAnalysisBest = {...best, analyzedAt: new Date().toISOString(), sharedWidth: video.videoWidth,
        sharedHeight: video.videoHeight, analysisCount: state.completedAnalyses};
      state.lastBestRect = mapSearchRectToVideoRect(canvas, best.rect);
      state.candidateId = best.label; state.streak = DETECTION_CONFIRM_COUNT; state.misses = 0; state.detected = true;
      state.voteWindow = []; state.inlineFallbackVotes = []; state.lastVoteFrameMarker = {...marker};
      $('#matchScore').textContent = best.score.toFixed(3);
      $('#candidateCount').textContent = '최신 문자 안내문 2/2표';
      $('#detectedType').textContent = best.label + ' · ' + best.source;
      setRuntime('detected', best.label + ' 감지');
      const alertNow = Date.now();
      if (alertTypeCooldownAllows(best,alertNow,state.config.cooldownSeconds * 1000,'priority-color-scout')) {
        state.lastAlertAt = alertNow;
        cacheLastAlertSnapshot(best).catch(error => console.warn('알림 화면 저장 실패:', error));
        emitAlert(best.label, best.score);
      }
      return true;
    })().catch(error => {
      if (sessionIsCurrent()) {
        state.priorityColorEvidence = [];
        console.warn('최신 문자 안내문 확인 실패:', error);
      }
      return false;
    }).finally(() => { state.priorityColorBusy = false; });
  }

  // The main OCR can be waiting on a worker when a new guide appears. Use
  // the existing scout lane to inspect that new frame without cancelling OCR.
  // Local default-off P: auxiliary-only association, on the M main-link arm.
  const AUX_MOTION_P=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&
    window.__MALERT_AUX_MOTION_EXPERIMENT===true&&LINK_V3.motion&&!LINK_V3.rotation;
  // Known fixed-reference variants share the same fixed instruction basis.
  // This changes only this auxiliary fallback's reference identity comparison.
  const AUX_FIXED_REFERENCE_GROUP=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&
    window.__MALERT_AUX_REFERENCE_GROUP_EXPERIMENT===true&&AUX_MOTION_P;
  // Local fixed-instruction pose association only; original native observations remain required.
  const AUX_FIXED_POSE_GROUP=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&
    window.__MALERT_AUX_FIXED_POSE_GROUP_EXPERIMENT===true&&AUX_FIXED_REFERENCE_GROUP&&AUX_MOTION_P;
  const auxMotionObservations=new WeakMap();
  const auxMotionStats={comparisons:0,rescues:0,referenceGroupRescues:0,crossFixedPoseRescues:0,crossFixedPoseLast:null};
  function auxMotionObservation(result,canvas,marker,scope,now){
    if(!AUX_MOTION_P||!result?.matched||!['click-large-lines','click-fixed-lines'].includes(result.id)||
      result.confirmationMode!=='click-lines-3vote'||Number(result.requiredStreak)!==3||
      result.guideScores?.length!==3||!result.guideScores.every(Number.isFinite))return null;
    const f=strictThreeFrames.get(canvas),r=result.rect,h=result.adaptiveHint;
    const family=String(h?.kind||'')+':'+String(h?.id||'');
    if(!f||!strictThreeCore.usable(f)||!Object.isFrozen(f)||!linkV3Families.has(family)||
      !Number.isInteger(h?.referenceIndex)||h.referenceIndex<0||h.referenceIndex>=3||
      marker?.kind!=='frame-count'||marker.value!==f.value||marker.provider!==f.provider||
      !r||!['x','y','w','h'].every(k=>Number.isFinite(r[k]))||r.w<=0||r.h<=0||
      r.x<0||r.y<0||r.x+r.w>canvas.width||r.y+r.h>canvas.height||
      !Number.isFinite(now)||now<f.capturedAt)return null;
    const o=Object.freeze({identity:String(result.voteIdentity||result.id),id:result.id,
      mode:result.confirmationMode,bands:3,family,poseAngle:h?.poseAngle??null,referenceIndex:h?.referenceIndex??null,
      rect:Object.freeze({...r}),marker:Object.freeze({...marker}),capturedAt:f.capturedAt,completedAt:now,
      sessionId:scope.sessionId,stream:scope.stream,revision:scope.revision,width:canvas.width,height:canvas.height,
      sourceWidth:Number(canvas.dataset.sourceWidth),sourceHeight:Number(canvas.dataset.sourceHeight)});
    return rememberLinkV3(o,canvas);
  }
  function auxMotionPair(previous,current){const a=auxMotionObservations.get(previous),passed=igAuxMotionPair(previous,current);igEmit('aux-motion-pair',{passed,previous:a?{...a,stream:undefined}:null,current:current?{...current,stream:undefined}:null});return passed;}
  function igAuxMotionPair(previous,current){
    const m25AuxPrevious=m25AuxActive;
    let m25AuxHook=null;
    try{if(typeof window.__M25_AUX_PAIR==='function')m25AuxHook=window.__M25_AUX_PAIR;}catch(_){}
    const m25AuxRecord=m25AuxHook?{schema:'M25_AUX_PAIR_STAGE_OBSERVER_V1',evaluated:{},actualValues:{},previous:null,current:null,groups:null,geometry:null,result:null,thrown:false,sourceCanvasOwnershipEvidence:'UNKNOWN_NO_CANVAS_IN_PAIR_FUNCTION'}:null;
    m25AuxActive=m25AuxRecord;
    try{

    if(m25AuxTerm("disabled-or-missing",(!AUX_MOTION_P||!previous||!current)))return m25AuxReturn(false);
    const a=auxMotionObservations.get(previous),b=current;
    if(m25AuxActive)try{
      const summary=o=>o?{
        marker:o.marker?{kind:o.marker.kind,value:o.marker.value,provider:o.marker.provider}:null,
        capturedAt:o.capturedAt,completedAt:o.completedAt,sessionId:o.sessionId,revision:o.revision,
        width:o.width,height:o.height,sourceWidth:o.sourceWidth,sourceHeight:o.sourceHeight,
        rect:o.rect?{x:o.rect.x,y:o.rect.y,w:o.rect.w,h:o.rect.h}:null,
        identity:o.identity,family:o.family,referenceIndex:o.referenceIndex,poseAngle:o.poseAngle,
        bands:o.bands,id:o.id,mode:o.mode
      }:null;
      m25AuxActive.previous=summary(a);m25AuxActive.current=summary(b);
    }catch(_){}

    const exactReference=Boolean(a&&a.family===b.family&&a.referenceIndex===b.referenceIndex&&a.poseAngle===b.poseAngle);
    const sameFixedBasis=Boolean(AUX_FIXED_REFERENCE_GROUP&&a&&linkV3Families.has(a.family)&&linkV3Families.has(b.family)&&
      linkV3Families.get(a.family)===linkV3Families.get(b.family));
    const crossFixedPoseGroup=Boolean(AUX_FIXED_POSE_GROUP&&a&&linkV3Families.has(a.family)&&linkV3Families.has(b.family)&&
      linkV3Families.get(a.family)!==linkV3Families.get(b.family)&&
      ['click-large-lines','click-fixed-lines'].includes(a.id)&&a.mode==='click-lines-3vote');
    if(m25AuxActive)try{m25AuxActive.groups={exactReference,sameFixedBasis,crossFixedPoseGroup};}catch(_){}
    if(m25AuxTerm("missing-observation",(!a))||m25AuxCompare("identity",(a.identity),(b.identity),"!==")||m25AuxCompare("id",(a.id),(b.id),"!==")||m25AuxCompare("mode",(a.mode),(b.mode),"!==")||m25AuxCompare("previous-bands",(a.bands),(3),"!==")||m25AuxCompare("current-bands",(b.bands),(3),"!==")||m25AuxCompare("pose",(a.poseAngle),(b.poseAngle),"!==")||
      m25AuxTerm("reference-group",(!(exactReference||sameFixedBasis||crossFixedPoseGroup)))||m25AuxTerm("unknown-family",(!linkV3Families.has(a.family)))||!m25AuxTerm("owned-pair",(linkV3OwnedPair(a,b))))return m25AuxReturn(false);
    auxMotionStats.comparisons++;
    const g=linkV3Geometry(a.rect,b.rect);if(m25AuxActive)try{m25AuxActive.geometry={...g};}catch(_){}if(g.compatible){
      auxMotionStats.rescues++;
      if(crossFixedPoseGroup){
        auxMotionStats.crossFixedPoseRescues++;
        const summary=o=>({identity:o.identity,id:o.id,mode:o.mode,bands:o.bands,family:o.family,referenceIndex:o.referenceIndex,poseAngle:o.poseAngle,
          marker:{...o.marker},rect:{...o.rect},capturedAt:o.capturedAt,completedAt:o.completedAt,sessionId:o.sessionId,revision:o.revision});
        auxMotionStats.crossFixedPoseLast={previous:summary(a),current:summary(b),geometry:{...g}};
      }else if(!exactReference)auxMotionStats.referenceGroupRescues++;
    }
    return m25AuxReturn(g.compatible);
    }catch(m25AuxError){if(m25AuxRecord)m25AuxRecord.thrown=true;throw m25AuxError;}
    finally{
      m25AuxActive=m25AuxPrevious;
      if(m25AuxHook)try{
        const r=m25AuxRecord;
        r.conditions=Object.fromEntries(["disabled-or-missing","missing-observation","identity","id","mode","previous-bands","current-bands","pose","reference-group","unknown-family","owned-pair","owner-a-owned","owner-b-owned","owner-same-scope","owner-forward-marker","owner-forward-capture","owner-pair-provider","owner-frame-provider","owner-a-marker","owner-b-marker","owner-a-capture","owner-b-capture","owner-a-completion","owner-b-completion","owner-within-six-seconds"].map(k=>[k,Object.prototype.hasOwnProperty.call(r.evaluated,k)?{executed:true,value:r.evaluated[k]}:{executed:false,status:'NOT_EXECUTED'}]));
        const rejection=["missing-observation","identity","id","mode","previous-bands","current-bands","pose","reference-group","unknown-family"].find(k=>r.evaluated[k]===true);
        const ownerReject=["owner-a-owned","owner-b-owned","owner-same-scope","owner-forward-marker","owner-forward-capture","owner-pair-provider","owner-frame-provider","owner-a-marker","owner-b-marker","owner-a-capture","owner-b-capture","owner-a-completion","owner-b-completion","owner-within-six-seconds"].find(k=>r.evaluated[k]===false);
        r.firstFailure=r.thrown?'ORIGINAL_THROW':r.evaluated['disabled-or-missing']?'disabled-or-missing':rejection||ownerReject||(r.geometry&&!r.geometry.compatible?'geometry':r.result===true?null:'UNKNOWN');
        r.scopeComparisonsOnly=true;r.privateFrameOrStreamIncluded=false;
        m25AuxHook(r);
      }catch(_){}
    }

  }
  window.MAlertAuxMotionP=Object.freeze({status:()=>({enabled:AUX_MOTION_P,...auxMotionStats,
    confirmationVotes:DETECTION_CONFIRM_COUNT,mainAuxCombined:false,rotation:false,fixedReferenceGroup:AUX_FIXED_REFERENCE_GROUP,fixedPoseGroup:AUX_FIXED_POSE_GROUP,fixedPoseDefaultOff:true})});

  function igCollectLarge(result, canvas, marker, scope) {
    const now=performance.now();
    if(!result?.matched||!result.rect||marker?.kind!=='frame-count'){
      state.largeGuideEvidence=[];return 0;
    }
    const currentMotion=auxMotionObservation(result,canvas,marker,scope,now);
    // Restrict only eligible motion observations to the immediate predecessor.
    // Sentence/non-target observations keep the complete original evidence path.
    // Keep storage at the original last three; selection limits the new path.
    const activeMotion=AUX_MOTION_P&&Boolean(currentMotion);
    const previous=activeMotion?(state.largeGuideEvidence||[]).slice(-1):(state.largeGuideEvidence||[]);
    const group=previous.filter(e=>
      e.sessionId===scope.sessionId&&e.stream===scope.stream&&e.revision===scope.revision&&
      e.identity===String(result.voteIdentity||result.id||'click-large-lines')&&e.width===canvas.width&&e.height===canvas.height&&now-e.at>=0&&now-e.at<=6000&&
      (sameTargetedContourLocation(e.rect,result.rect,canvas.width,canvas.height)||auxMotionPair(e,currentMotion)));
    if(group.length&&!isIndependentTargetedRecheckFrame(group[group.length-1].marker,marker)){
      state.largeGuideEvidence=group;return group.length;
    }
    const currentRecord={...scope,adaptiveHint:result.adaptiveHint?structuredClone(result.adaptiveHint):null,identity:String(result.voteIdentity||result.id||'click-large-lines'),at:now,marker:{...marker},rect:{...result.rect},width:canvas.width,height:canvas.height};
    // Only a current, already final-matched auxiliary observation is registered.
    if(currentMotion)auxMotionObservations.set(currentRecord,currentMotion);
    group.push(currentRecord);
    state.largeGuideEvidence=group.slice(-3);return Math.min(DETECTION_CONFIRM_COUNT,group.length);
  }

  function getLargeGuideScoutHint(canvas, marker, scope) {
    const latest=(state.largeGuideEvidence||[]).at(-1),now=performance.now();
    const native=canvas.nativeSource||canvas;
    if(!latest?.adaptiveHint||latest.sessionId!==scope.sessionId||latest.stream!==scope.stream||latest.revision!==scope.revision||
      latest.width!==canvas.width||latest.height!==canvas.height||now-latest.at<0||now-latest.at>6000||
      !isIndependentTargetedRecheckFrame(latest.marker,marker))return null;
    const hint=latest.adaptiveHint;
    if(hint.searchWidth!==canvas.width||hint.searchHeight!==canvas.height||hint.nativeWidth!==native.width||hint.nativeHeight!==native.height)return null;
    // This is only a localization hint. The caller must verify the current
    // original pixels, existing band thresholds, hue and monitor region.
    return structuredClone(hint);
  }

  function hasPendingLargeGuideVotes(now = performance.now()) {
    const latest=(state.largeGuideEvidence||[]).at(-1);
    return Boolean(latest&&latest.sessionId===state.captureSessionId&&latest.stream===state.stream&&
      latest.revision===state.monitorRegionRevision&&now-latest.at>=0&&now-latest.at<=6000);
  }

  // M395: reuse the existing full fixed-panel decision in the already-running
  // OCR scout. No new timer, OCR, score floor or stored success is introduced.
  const M395_SHAPE_SCOUT_ENABLED=window.__MALERT_M395_SHAPE_SCOUT===true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'));
  async function scoutLargeClickGuide(searchCanvas, sessionId, stream, revision) {
    const detectionSerialAtStart=state.rainbowDetectionSerial;
    const marker=searchCanvas.auditFrameMarker||getTargetedRecheckFrameMarker();
    const scope={sessionId,stream,revision};
    const hint=getLargeGuideScoutHint(searchCanvas,marker,scope);m39ReleaseObservationNoop?.(searchCanvas,'aux-capture');
    // Keep this lane bounded: a weak adaptive candidate must not hold an
    // old frame for seconds. The complete adaptive scan remains in the main
    // detector. Every accepted result still needs original pixels and 3 votes.
    igEmit('typed-scout-start',{marker});
    const currentPanel=M395_SHAPE_SCOUT_ENABLED?await findPanelGuide(searchCanvas):null;
    const currentShapePanel=currentPanel?.id==='panel-guide-shape'?currentPanel:null;
    if(M395_SHAPE_SCOUT_ENABLED)igEmit('shape-scout-check',{marker,capture:m4Context(searchCanvas),best:igBest(currentShapePanel),scores:currentShapePanel?.panelGuideScores||null});
    const result=currentShapePanel || (await findSentenceGuide(searchCanvas)) ||
      (await findClickLineGuide(searchCanvas,true,hint,false)) ||
      (await findClickLineGuide(searchCanvas,false,null,false,false,true)) ||
      (await findClickLineGuide(searchCanvas,true,null,false,true));
    if(!isAnalysisContextCurrent(sessionId,stream,revision)||state.regionSelecting||state.rainbowDetectionSerial!==detectionSerialAtStart)return false;
    igEmit('typed-scout-end',{marker,best:igBest(result)});const votes=collectLargeGuideScoutVote(result,searchCanvas,marker,{sessionId,stream,revision});
    if(!result)return false;
    // One bounded guide-confirmation burst per main analysis. Earlier failed
    // scouts must not consume it; repeated near-misses cannot renew it forever.
    if(!state.largeGuideFocusIssued){state.largeGuideFocusIssued=true;state.consecutiveScoutStarts=0;}
    state.rainbowScoutDelayMs=250;
    $('#candidateCount').textContent=(result.id==='panel-guide-shape'?'OCR 중 도형 안내문 ':result.id==='sentence-fixed-guide'?'OCR 중 문장 선택 안내문 ':'OCR 중 클릭 안내문 ')+votes+'/2표';
    if(votes<DETECTION_CONFIRM_COUNT)return true;
    if(!m35Final('large-guide-scout',result,searchCanvas))return false;
    const best={...result,preconfirmed:true,confirmationMode:'large-click-scout-3vote',source:result.id==='panel-guide-shape'?'OCR 처리 중 기존 도형 안내창 고정 문구 세 구간 최종 확인':result.id==='sentence-fixed-guide'?'OCR 처리 중 별도 탐색 · 문장 선택 패널 + 고정 안내문 · 독립 프레임 2표':'OCR 처리 중 별도 탐색 · 고정 글자 세 구간 · 독립 프레임 2표'};
    state.lastAnalysisBest={...best,analyzedAt:new Date().toISOString(),sharedWidth:video.videoWidth,sharedHeight:video.videoHeight,analysisCount:state.completedAnalyses};
    state.lastBestRect=mapSearchRectToVideoRect(searchCanvas,result.rect);
    state.candidateId=best.label;state.streak=DETECTION_CONFIRM_COUNT;state.misses=0;state.detected=true;
    state.rainbowDetectionSerial+=1;state.largeGuideEvidence=[];
    $('#matchScore').textContent=best.score.toFixed(3);
    $('#detectedType').textContent=best.label+' · '+best.source;
    setRuntime('detected',best.label+' 감지');
    const alertNow=Date.now();
    if(alertTypeCooldownAllows(best,alertNow,state.config.cooldownSeconds*1000,'large-guide-scout')){
      state.lastAlertAt=alertNow;
      cacheLastAlertSnapshot(best).catch(error=>console.warn('알림 화면 저장 실패:',error));
      emitAlert(best.label,best.score);
    }
    return true;
  }

  function startRainbowScout(timestamp = performance.now()) {
    if (
      !state.stream ||
      state.paused ||
      state.regionSelecting ||
      (state.analysisBusy && state.analysisPhase !== "ocr") ||
      state.rainbowScoutBusy ||
      !state.cvReady ||
      !state.model ||
      !video.videoWidth ||
      !window.MAlertTextContourMatcher?.analyzeQuick
    ) {
      return Promise.resolve(false);
    }

    const captureSessionIdAtStart = state.captureSessionId;
    const streamAtStart = state.stream;
    const monitorRegionRevisionAtStart = state.monitorRegionRevision;
    const captureIsCurrent = () => isCaptureSessionCurrent(captureSessionIdAtStart, streamAtStart);
    const detectionSerialAtStart = state.rainbowDetectionSerial;
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart) &&
      state.rainbowDetectionSerial === detectionSerialAtStart;
    state.rainbowScoutBusy = true;
    const searchCanvas = captureSearchCanvas();

    const recoveryDelayMs = state.rainbowRecoveryEvidence.length
      ? RAINBOW_FOCUS_INTERVAL_MS
      : RAINBOW_RECOVERY_SCOUT_INTERVAL_MS;
    const recoveryDue =
      timestamp - state.lastRainbowRecoveryScoutAt >= recoveryDelayMs;
    const focusedRecoveryId = String(
      state.rainbowRecoveryEvidence[state.rainbowRecoveryEvidence.length - 1]?.id || ""
    );
    const remainingRecoveryIds = [
      "rainbow-recovery-94496",
      "rainbow-recovery-94497",
      "rainbow-recovery-96116",
      "rainbow-recovery-96117"
    ];

    const runStandardScout = async () => {
      const standardResult = await window.MAlertTextContourMatcher
        .analyzeQuick(searchCanvas, { prefix: "rainbow-prompt-" });
      if (!sessionIsCurrent()) return { standardResult: null, detected: false, stale: true };
      state.rainbowScoutScans += 1;
      state.rainbowLastScoutDurationMs = Number(standardResult?.durationMs || 0);
      const standard = pickRainbowScoutCandidate(standardResult, "rainbow-prompt-");
      const standardMargin = Number(standard?.score || -1) - Number(standard?.threshold || 1);
      return {
        standardResult,
        standard,
        near: Boolean(standard?.rect) && standardMargin >= -RAINBOW_NEAR_MARGIN,
        detected: confirmRainbowScout(standard, searchCanvas)
      };
    };

    // 96118은 정적 점수가 충분한데도 실화면에서 3표 확정이 끊기는 사례가 있었다.
    // 96118 증거가 잡힌 뒤에는 전체 recovery 묶음을 다시 훑지 않고 96118만 재검사한다.
    // 강일치면 표준 레인보우 스캔도 생략해 3표 시간축을 OCR/다른 템플릿 비용과 분리한다.
    return (async () => {
      if(hasPendingLargeGuideVotes(timestamp)||(state.analysisBusy&&state.analysisPhase==='ocr'&&!(focusedRecoveryId&&timestamp<state.rainbowFocusUntil))){
        const found=await scoutLargeClickGuide(searchCanvas,captureSessionIdAtStart,streamAtStart,monitorRegionRevisionAtStart);
        if(found)return true;
        if(!sessionIsCurrent())return false;
      }
      if (recoveryDue && focusedRecoveryId) {
        state.lastRainbowRecoveryScoutAt = timestamp;
        const focusedResult = await window.MAlertTextContourMatcher
          .analyzeQuick(searchCanvas, { ids: [focusedRecoveryId] });
        if (!sessionIsCurrent()) return false;
        state.rainbowLastRecoveryDurationMs = Number(focusedResult?.durationMs || 0);
        const recovery = pickRainbowScoutCandidate(focusedResult, "rainbow-recovery-");
        const recoveryMargin = Number(recovery?.score || -1) - Number(recovery?.threshold || 1);
        const strongFocusedRecovery = Boolean(recovery?.matched) &&
          recoveryMargin >= RAINBOW_RECOVERY_STRONG_MARGIN;

        if (strongFocusedRecovery) {
          state.rainbowScoutScans += 1;
          await confirmRainbowRecovery(recovery, [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
          return true;
        }
        if (!String(focusedRecoveryId).startsWith("rainbow-recovery-static-") &&
            await runTimerlessFallback(recovery, [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart)) return true;

        const { standardResult, detected, stale } = await runStandardScout();
        if (detected) return true;
        if (stale || !sessionIsCurrent()) return false;
        await confirmRainbowRecovery(
          recovery,
          standardResult?.candidates || [],
          searchCanvas,
          captureSessionIdAtStart,
          streamAtStart,
          monitorRegionRevisionAtStart
        );
        return true;
      }

      // 표준 레인보우 6종은 0.8초 주기로 우선 검사한다.
      const { standardResult, standard, detected, near, stale } = await runStandardScout();
      if (detected) return true;
      if (stale || !sessionIsCurrent()) return false;
      // 정상 템플릿이 임계값은 넘었지만 강일치 여유값이 부족하면 기존 2표만 계속 쌓여도
      // 확정되지 않을 수 있다. 이 경우에도 같은 템플릿의 카운트다운 무시판을 1개만
      // 재검사해 숫자 변화/부분 가림 때문에 생기는 경계 미탐을 보완한다.
      if (standard?.matched) {
        if (await runTimerlessFallback(standard, standardResult?.candidates || [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart)) return true;
        return true;
      }
      // 숫자/스킬 가림 때문에 임계값 바로 아래라면 같은 템플릿의 카운트다운 무시판만 1개 재검사한다.
      if (near && await runTimerlessFallback(standard, standardResult?.candidates || [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart)) return true;
      if (near) return true;
      if (!recoveryDue) return true;

      state.lastRainbowRecoveryScoutAt = timestamp;

      // 신규 미탐 96118은 높은 임계값(0.70)을 그대로 유지한 채 먼저 단독 스캔한다.
      // 잡히면 즉시 focus 모드로 넘어가 다음 2표는 96118만 재검사한다.
      const priority96118Result = await window.MAlertTextContourMatcher
        .analyzeQuick(searchCanvas, { ids: ["rainbow-recovery-96118"] });
      if (!sessionIsCurrent()) return false;
      state.rainbowLastRecoveryDurationMs = Number(priority96118Result?.durationMs || 0);
      const priority96118 = pickRainbowScoutCandidate(
        priority96118Result,
        "rainbow-recovery-"
      );
      if (priority96118?.matched) {
        await confirmRainbowRecovery(
          priority96118,
          standardResult?.candidates || [],
          searchCanvas,
          captureSessionIdAtStart,
          streamAtStart,
          monitorRegionRevisionAtStart
        );
        return true;
      }
      if (await runTimerlessFallback(priority96118, standardResult?.candidates || [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart)) return true;

      // 나머지 recovery는 기존 임계값/스케일을 그대로 유지한다.
      const recoveryResult = await window.MAlertTextContourMatcher
        .analyzeQuick(searchCanvas, { ids: remainingRecoveryIds });
      if (!sessionIsCurrent()) return false;
      state.rainbowLastRecoveryDurationMs = Number(recoveryResult?.durationMs || 0);
      const recovery = pickRainbowScoutCandidate(recoveryResult, "rainbow-recovery-");
      await confirmRainbowRecovery(
        recovery,
        standardResult?.candidates || [],
        searchCanvas,
        captureSessionIdAtStart,
        streamAtStart,
        monitorRegionRevisionAtStart
      );
      if (!recovery?.matched) await runTimerlessFallback(recovery, standardResult?.candidates || [], searchCanvas, captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
      return true;
    })()
      .catch((error) => {
        if (sessionIsCurrent()) console.warn("경량 전체 화면 탐색 실패:", error);
        return false;
      })
      .finally(() => {
        if (captureIsCurrent()) {
          state.rainbowScoutBusy = false;
          state.lastRainbowScoutAt = performance.now();
          if(state.analysisBusy&&state.analysisPhase==='ocr')state.rainbowScoutDelayMs=Math.min(state.rainbowScoutDelayMs,250);
        }
      });
  }

  function startAnalysis(timestamp = performance.now()) {
    if (!state.stream || state.paused || state.regionSelecting || state.analysisBusy || !state.cvReady || !state.model || !video.videoWidth) {
      return Promise.resolve(false);
    }

    const captureSessionIdAtStart = state.captureSessionId;
    const streamAtStart = state.stream;
    const monitorRegionRevisionAtStart = state.monitorRegionRevision;
    const captureIsCurrent = () => isCaptureSessionCurrent(captureSessionIdAtStart, streamAtStart);
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);

    state.analysisBusy = true;
    state.largeGuideFocusIssued = false;
    state.analysisPhase = "contour";
    state.lastAnalysisAt = timestamp;
    state.analysisStartedAt = performance.now();
    state.pendingLatestAnalysis = false;
    markAnalysisProgress("analysis-start");
    const startedAt = state.analysisStartedAt;
    $("#lastAnalysis").textContent = "검사 중…";

    let workerDuration = null;

    return analyzeLieDetector(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart)
      .then((duration) => {
        if (!sessionIsCurrent()) return false;
        workerDuration = Number.isFinite(duration) ? duration : null;
        return true;
      })
      .catch((error) => {
        if (!sessionIsCurrent()) return false;
        console.error(error);
        $("#lastAnalysis").textContent = "분석 오류";
        addLog("오류", `화면 분석 오류: ${error.message || error}`);
        return false;
      })
      .finally(() => {
        // 영역 revision이 바뀐 경우 결과/UI는 폐기하되, 같은 공유 세션의 busy 상태는 반드시 해제한다.
        if (!captureIsCurrent()) return;
        state.analysisBusy = false;
        state.analysisPhase = "idle";
        state.analysisStartedAt = 0;
        state.lastAnalysisCompletedAt = performance.now();
        markAnalysisProgress("analysis-complete");
        if (!sessionIsCurrent()) return;
        const duration = workerDuration ?? Math.round(performance.now() - startedAt);
        state.lastAnalysisDurationMs = duration;
        $("#lastAnalysis").textContent = `${new Date().toLocaleTimeString("ko-KR", { hour12: false })} · 분석 #${state.completedAnalyses} · ${duration}ms`;

        // 분석 중 새 분석 시점이 지나갔다면 오래된 프레임 큐 대신 현재 video 최신 프레임을 즉시 분석한다.
        // P4-R5 pending handled by scheduler
      });
  }

  async function runImmediateAnalysis() {
    if (!state.stream) {
      alert("먼저 메이플 창을 공유해 주세요.");
      return;
    }
    if (!state.cvReady) {
      addLog(
        "즉시 검사",
        "분석 엔진을 먼저 준비합니다."
      );
      await ensureOcrLoaded();
    }
    if (state.analysisBusy) {
      addLog("즉시 검사", "이미 화면을 분석하고 있습니다.");
      return;
    }
    addLog("즉시 검사", "현재 공유 화면을 바로 검사합니다.");
    await startAnalysis(performance.now());
  }

  async function runBuiltInTest() {
    const button=$("#selfTestBtn"),originalText=button.textContent;button.disabled=true;button.textContent="내장 문구 분석 중…";
    try{
      const ocr=await ensureOcrLoaded();const response=await fetch("./test-click.webp?v=1149r16",{cache:"force-cache"});if(!response.ok)throw new Error(`내장 이미지 로드 실패: ${response.status}`);
      const bitmap=await createImageBitmap(await response.blob()),canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext("2d",{alpha:false}).drawImage(bitmap,0,0);bitmap.close?.();
      const contour=window.MAlertTextContourMatcher?await window.MAlertTextContourMatcher.analyze(canvas):null;
      const strong=selectStrongContourCandidate(contour,canvas.width,canvas.height);
      const result=strong?{matched:true,label:strong.label||"클릭형 거탐",score:Number(strong.score||0),threshold:Number(strong.threshold||1)+.04,reason:`내장 클릭 문구 윤곽 · ${strong.id}`,engine:"text-contour-multiscale"}:await ocr.analyze(canvas,{preferredRects:collectOcrPreferredRects(contour,canvas.width,canvas.height),contourCandidates:contour?.candidates||[],contourBest:contour,clickLikely:candidateLooksLikeClick(contour),skipOcr:false});$("#matchScore").textContent=Number(result.score||0).toFixed(3);$("#detectedType").textContent=result.matched?`${result.label||"거짓말 탐지기"} · 내장 문구 테스트`:"내장 테스트 미감지";$("#candidateCount").textContent=strong?"다중 배율 윤곽":(result.engine === "edge-candidate-ocr-v9"?"윤곽 후보 OCR":"글자 OCR");
      addLog("내장 문구 테스트",result.matched?`${result.label||"거짓말 탐지기"} 감지 성공 · ${result.reason}`:`감지 실패 · ${result.reason}`);if(result.matched)emitAlert(`${result.label||"거짓말 탐지기"} 내장 테스트`,Number(result.score||0));
    }catch(error){console.error(error);addLog("내장 문구 테스트 오류",String(error?.message||error));alert(`내장 테스트 실패: ${error?.message||error}`);}finally{button.disabled=false;button.textContent=originalText;}
  }


  async function saveCalibrationSample(kind) {
    if (!state.stream || !video.videoWidth) {
      alert("먼저 메이플 창을 공유해 주세요.");
      return;
    }

    const selectedLabel =
      $("#sampleLabelSelect").value || "normal";

    const best =
      state.lastAnalysisBest || {
        id: "none",
        label: "없음",
        score: -1,
        threshold: 1,
        source: "분석 전 저장"
      };

    const canvas = captureFullResolutionCanvas();
    const metadata = buildCalibrationMetadata(
      kind,
      selectedLabel,
      best
    );

    await downloadCalibrationPng(
      canvas,
      metadata
    );

    addLog(
      "캘리브레이션 저장",
      `${metadata.kindLabel} · 실제 유형 ${metadata.actualLabel} · 분석 ${metadata.detectedLabel} ${formatScore(metadata.score)}`
    );
  }

  async function cacheLastAlertSnapshot(best) {
    if (
      !state.stream ||
      !video.videoWidth ||
      state.snapshotBusy
    ) {
      return;
    }

    const captureSessionIdAtStart = state.captureSessionId;
    const streamAtStart = state.stream;
    const monitorRegionRevisionAtStart = state.monitorRegionRevision;
    const captureIsCurrent = () => isCaptureSessionCurrent(captureSessionIdAtStart, streamAtStart);
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
    state.snapshotBusy = true;

    try {
      const canvas = captureFullResolutionCanvas();
      const blob = await canvasToPngBlob(canvas);
      if (!sessionIsCurrent()) return;

      state.lastAlertSnapshot = {
        blob,
        metadata:
          buildCalibrationMetadata(
            "alert",
            normalizeDetectorId(best.id),
            best
          )
      };

      $("#saveLastAlertBtn").disabled = false;
      $("#calibrationMeta").textContent =
        "마지막 알림 순간이 임시 저장되었습니다.";
    } finally {
      // 이전 세션의 늦은 blob 변환이 새 세션의 snapshotBusy를 해제하지 못하게 한다.
      if (captureIsCurrent()) state.snapshotBusy = false;
    }
  }

  function saveLastAlertSnapshot() {
    const snapshot =
      state.lastAlertSnapshot;

    if (!snapshot) {
      alert("저장된 알림 순간이 없습니다.");
      return;
    }

    downloadBlob(
      snapshot.blob,
      buildCalibrationFilename(
        snapshot.metadata
      )
    );

    addLog(
      "캘리브레이션 저장",
      `마지막 알림 순간 · ${snapshot.metadata.detectedLabel} ${formatScore(snapshot.metadata.score)}`
    );
  }

  function captureFullResolutionCanvas() {
    const canvas =
      document.createElement("canvas");

    canvas.width =
      Math.max(1, video.videoWidth);
    canvas.height =
      Math.max(1, video.videoHeight);

    const context =
      canvas.getContext(
        "2d",
        { alpha: false }
      );

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas;
  }

  function buildCalibrationMetadata(
    kind,
    selectedLabel,
    best
  ) {
    const labels = {
      normal: "정상 화면",
      "text-input": "문자 입력형",
      click: "클릭형 거탐",
      sentence: "올바른 문장 선택형",
      "transparent-shape": "투명 도형형",
      violetta: "비올레타형"
    };

    const kindLabels = {
      current: "현재 화면",
      "false-positive": "오탐 화면",
      alert: "알림 순간"
    };

    return {
      version: window.M_ALERT_APP_VERSION || "1.1.52",
      kind,
      kindLabel:
        kindLabels[kind] || kind,
      actualId: selectedLabel,
      actualLabel:
        labels[selectedLabel] ||
        selectedLabel,
      detectedId:
        best?.id || "none",
      detectedLabel:
        best?.label || "없음",
      score:
        Number(best?.score ?? -1),
      threshold:
        Number(best?.threshold ?? 1),
      matched:
        Boolean(best?.matched),
      source:
        best?.source || "",
      analysisCount:
        Number(
          state.completedAnalyses || 0
        ),
      sharedWidth:
        Number(video.videoWidth || 0),
      sharedHeight:
        Number(video.videoHeight || 0),
      monitorRegion:
        normalizeMonitorRegion(
          state.config.monitorRegion
        ),
      capturedAt:
        new Date().toISOString()
    };
  }

  async function downloadCalibrationPng(
    canvas,
    metadata
  ) {
    const blob =
      await canvasToPngBlob(canvas);

    downloadBlob(
      blob,
      buildCalibrationFilename(
        metadata
      )
    );
  }

  function canvasToPngBlob(canvas) {
    return new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(
              new Error(
                "PNG 이미지를 만들지 못했습니다."
              )
            );
          },
          "image/png"
        );
      }
    );
  }

  function downloadBlob(blob, filename) {
    const url =
      URL.createObjectURL(blob);
    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1500
    );
  }

  function buildCalibrationFilename(
    metadata
  ) {
    const time =
      metadata.capturedAt
        .replace(/[:.]/g, "-");

    const actual =
      safeFilenamePart(
        metadata.actualId
      );

    const detected =
      safeFilenamePart(
        metadata.detectedId
      );

    const score =
      metadata.score >= 0
        ? metadata.score.toFixed(3)
        : "none";

    const threshold =
      metadata.threshold >= 0
        ? metadata.threshold.toFixed(3)
        : "none";

    return [
      "m-alert",
      safeFilenamePart(metadata.kind),
      `actual-${actual}`,
      `detected-${detected}`,
      `score-${score}`,
      `threshold-${threshold}`,
      `${metadata.sharedWidth}x${metadata.sharedHeight}`,
      time
    ].join("_") + ".png";
  }

  function safeFilenamePart(value) {
    return String(value || "none")
      .toLowerCase()
      .replace(
        /[^a-z0-9가-힣-]+/g,
        "-"
      )
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "none";
  }

  function normalizeDetectorId(id) {
    const value =
      String(id || "").toLowerCase();

    if (value.includes("click")) {
      return "click";
    }
    if (value.includes("violetta")) {
      return "violetta";
    }
    if (
      value.includes("transparent") ||
      value.includes("shape")
    ) {
      return "transparent-shape";
    }
    if (
      value.includes("sentence")
    ) {
      return "sentence";
    }
    if (
      value.includes("text-input")
    ) {
      return "text-input";
    }

    return "normal";
  }

  function formatScore(value) {
    return Number(value) >= 0
      ? Number(value).toFixed(3)
      : "—";
  }

  function waitForVideoReady(targetVideo, timeoutMs) {
    if (targetVideo.readyState >= HTMLMediaElement.HAVE_METADATA && targetVideo.videoWidth && targetVideo.videoHeight) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        targetVideo.removeEventListener("loadedmetadata", check);
        targetVideo.removeEventListener("loadeddata", check);
        targetVideo.removeEventListener("resize", check);
        resolve();
      };
      const check = () => {
        if (targetVideo.videoWidth && targetVideo.videoHeight) finish();
      };
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        targetVideo.removeEventListener("loadedmetadata", check);
        targetVideo.removeEventListener("loadeddata", check);
        targetVideo.removeEventListener("resize", check);
        reject(new Error("공유 영상 준비 시간이 초과되었습니다."));
      }, timeoutMs);
      targetVideo.addEventListener("loadedmetadata", check);
      targetVideo.addEventListener("loadeddata", check);
      targetVideo.addEventListener("resize", check);
      check();
    });
  }

  function resizePreview() {
    if (!video.videoWidth || !video.videoHeight) return;
    const maxWidth = 960;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    previewCanvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    previewCanvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    previewCanvas.dataset.sourceSize = `${video.videoWidth}×${video.videoHeight}`;
    $("#resolutionLabel").textContent = previewCanvas.dataset.sourceSize;
  }

  function drawPreview() {
    if (!video.videoWidth) return;
    if (!previewCanvas.width || !previewCanvas.height || previewCanvas.dataset.sourceSize !== `${video.videoWidth}×${video.videoHeight}`) resizePreview();

    previewContext.drawImage(
      video,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height
    );

    drawMonitorRegionOverlay();

    const scaleX =
      previewCanvas.width /
      video.videoWidth;
    const scaleY = previewCanvas.height / video.videoHeight;

    for (const rect of state.lastCandidateRects) {
      previewContext.strokeStyle = "rgba(49, 193, 140, 0.95)";
      previewContext.lineWidth = 2;
      previewContext.strokeRect(rect.x * scaleX, rect.y * scaleY, rect.w * scaleX, rect.h * scaleY);
    }

    if (state.lastBestRect) {
      previewContext.strokeStyle = "rgba(234, 74, 81, 0.98)";
      previewContext.lineWidth = 3;
      previewContext.strokeRect(
        state.lastBestRect.x * scaleX,
        state.lastBestRect.y * scaleY,
        state.lastBestRect.w * scaleX,
        state.lastBestRect.h * scaleY
      );
    }
  }

  async function withDetectorTimeout(task, timeoutMs = 12000) {
    let timer = null;
    try {
      return await Promise.race([
        task,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            const error = new Error(`문구 분석 ${Math.round(timeoutMs / 1000)}초 제한 초과`);
            error.code = "DETECTOR_TIMEOUT";
            reject(error);
          }, timeoutMs);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function tryTargetedOcrRecheck(ocr, firstResult, firstCanvas, contourResult, firstMarker, sessionIsCurrent) {
    if(!firstResult?.matched||!firstResult.rect||firstMarker?.kind!=="frame-count")return null;
    if(M35_SINGLE_CONFIRMATION_ENABLED)return m35FirstSemantic(firstResult,firstCanvas,sessionIsCurrent);
    // Contours localize the next OCR read; only fresh OCR semantics confirm it.
    state.analysisPhase="confirm";
    await new Promise(resolve=>setTimeout(resolve,300));
    if(!sessionIsCurrent())return null;
    const readableYellowConfirmation = READABLE_YELLOW_TARGETED_CAPTURE_RESEARCH_ENABLED &&
      EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED && ocr?.researchEarlyYellowAfterFixedEnabled?.()===true &&
      firstResult.label==="클릭형 거탐" && firstResult.researchYellowAfterFixed?.version===1 &&
      firstResult.researchYellowAfterFixed.route==="existing-yellow-semantic-click";
    const canvas=readableYellowConfirmation?captureSearchCanvas({readCurrentYellowConfirmation:true}):captureSearchCanvas(),marker=canvas.auditFrameMarker||getTargetedRecheckFrameMarker();
    if(!isIndependentTargetedRecheckFrame(firstMarker,marker)||canvas.width!==firstCanvas.width||canvas.height!==firstCanvas.height)return null;
    // Each attempt below reads the SAME current canvas. Its branch failures
    // are not independent inputs and cannot invalidate a later accepted
    // fallback on that canvas. Only final rejection contributes a barrier.
    const strictThreeR21Attempts=STRICT_THREE_INPUT_RESEARCH_ENABLED?[]:null;
    if(strictThreeR21Attempts)firstCanvas.strictThreeR21RecheckAttempts=strictThreeR21Attempts;
    const generalYellowFirst=PREFER_GENERAL_YELLOW_RECHECK_RESEARCH_ENABLED && FIXED_YELLOW_TARGETED_RECHECK_RESEARCH_ENABLED && readableYellowConfirmation;
    if(generalYellowFirst){
      let generalFirstResult;
      try {generalFirstResult=await budgetedOcr(ocr,canvas,{
        blueInputOnly:String(firstResult.engine||'').startsWith('edge-candidate-ocr-v12'),preferredRects:[firstResult.rect],contourCandidates:contourResult?.candidates||[],
        contourBest:contourResult,clickLikely:firstResult.label==="클릭형 거탐",confirmationLabel:firstResult.label,confirmationRect:firstResult.rect,confirmationInlineGuide:firstResult.confirmationInlineGuide,
        inlineFixedOnly:Boolean(firstResult.confirmationInlineGuide),inlineContourOnly:Boolean(firstResult.confirmationInlineContour),confirmationInlineContour:firstResult.confirmationInlineContour,
        textInputOnly:Boolean(firstResult.confirmationTextInputOnly),
        violettaFixedOnly:Boolean(firstResult.confirmationViolettaFixedOnly),confirmationGuides:(firstResult.attempts||[]).filter(a=>a.violettaStructureScore&&a.region&&a.signals)
      });} catch(error) {
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'GENERAL_FIRST',status:'ERROR',frameMarker:marker});
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED&&sessionIsCurrent())strictThreeFailedRecheck(firstCanvas,canvas,firstResult,'ocr','OCR_RECHECK_R21_GENERAL_FIRST_ERROR');
        throw error;
      }
      if(!sessionIsCurrent()){
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'GENERAL_FIRST',status:'STALE_SESSION',frameMarker:marker});
        return null;
      }
      if(generalFirstResult?.matched&&generalFirstResult.label===firstResult.label&&generalFirstResult.rect){
        const a=firstResult.rect,b=generalFirstResult.rect;
        const intersection=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
        const containment=intersection/Math.max(1,Math.min(a.w*a.h,b.w*b.h));
        if(!(containment<.8&&!sameTargetedContourLocation(a,b,canvas.width,canvas.height))){
          if(STRICT_THREE_INPUT_RESEARCH_ENABLED){
            strictThreeR21Attempts.push({route:'GENERAL_FIRST',status:'ACCEPTED',frameMarker:marker,rect:{...generalFirstResult.rect}});
            const identity=strictThreeSemanticIdentity(firstResult);
            return semanticThirdOwnedPair({...generalFirstResult,strictThreeEvidence:[strictThreeOcrObservation(firstResult,firstCanvas,'targeted',identity),strictThreeOcrObservation(generalFirstResult,canvas,'targeted',identity)]},generalFirstResult,canvas,firstResult,firstCanvas,contourResult,firstMarker);
          }
          return generalFirstResult;
        }
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'GENERAL_FIRST',status:'LOCATION_REJECTED',frameMarker:marker,rect:{...generalFirstResult.rect}});
      }else if(strictThreeR21Attempts){
        strictThreeR21Attempts.push({route:'GENERAL_FIRST',status:'RESULT_REJECTED',frameMarker:marker,matched:generalFirstResult?.matched===true,labelMatches:generalFirstResult?.label===firstResult.label,hasRect:Boolean(generalFirstResult?.rect)});
      }
      // Only an explicit non-acceptance reaches the existing fixed route; exceptions propagate.
    }
    if(FIXED_YELLOW_TARGETED_RECHECK_RESEARCH_ENABLED && readableYellowConfirmation){
      let fixedResult;
      try {fixedResult=await budgetedOcr(ocr,canvas,{
      blueInputOnly:String(firstResult.engine||'').startsWith('edge-candidate-ocr-v12'),preferredRects:[firstResult.rect],contourCandidates:contourResult?.candidates||[],
      contourBest:contourResult,clickLikely:firstResult.label==="클릭형 거탐",confirmationLabel:firstResult.label,confirmationRect:firstResult.rect,confirmationInlineGuide:firstResult.confirmationInlineGuide,
      inlineFixedOnly:true,inlineContourOnly:Boolean(firstResult.confirmationInlineContour),confirmationInlineContour:firstResult.confirmationInlineContour,
      textInputOnly:Boolean(firstResult.confirmationTextInputOnly),
      violettaFixedOnly:Boolean(firstResult.confirmationViolettaFixedOnly),confirmationGuides:(firstResult.attempts||[]).filter(a=>a.violettaStructureScore&&a.region&&a.signals)
      });} catch(error) {
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'FIXED',status:'ERROR',frameMarker:marker});
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED&&sessionIsCurrent())strictThreeFailedRecheck(firstCanvas,canvas,firstResult,'ocr','OCR_RECHECK_R21_FIXED_ERROR');
        throw error;
      }
      if(!sessionIsCurrent()){
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'FIXED',status:'STALE_SESSION',frameMarker:marker});
        return null;
      }
      if(fixedResult?.matched&&fixedResult.label===firstResult.label&&fixedResult.rect){
        const a=firstResult.rect,b=fixedResult.rect;
        const intersection=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
        const containment=intersection/Math.max(1,Math.min(a.w*a.h,b.w*b.h));
        if(!(containment<.8&&!sameTargetedContourLocation(a,b,canvas.width,canvas.height))){
          if(STRICT_THREE_INPUT_RESEARCH_ENABLED){
            strictThreeR21Attempts.push({route:'FIXED',status:'ACCEPTED',frameMarker:marker,rect:{...fixedResult.rect}});
            const identity=strictThreeSemanticIdentity(firstResult);
            return semanticThirdOwnedPair({...fixedResult,strictThreeEvidence:[strictThreeOcrObservation(firstResult,firstCanvas,'targeted',identity),strictThreeOcrObservation(fixedResult,canvas,'targeted',identity)]},fixedResult,canvas,firstResult,firstCanvas,contourResult,firstMarker);
          }
          return fixedResult;
        }
        if(strictThreeR21Attempts)strictThreeR21Attempts.push({route:'FIXED',status:'LOCATION_REJECTED',frameMarker:marker,rect:{...fixedResult.rect}});
      }else if(strictThreeR21Attempts){
        strictThreeR21Attempts.push({route:'FIXED',status:'RESULT_REJECTED',frameMarker:marker,matched:fixedResult?.matched===true,labelMatches:fixedResult?.label===firstResult.label,hasRect:Boolean(fixedResult?.rect)});
      }
      // Failed or different fixed targets use the unchanged general recheck on this same current canvas.
    }
    // The same current frame has already received its general recheck.
    if(generalYellowFirst){
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,canvas,firstResult,'ocr','OCR_RECHECK_R21_ALL_PATHS_REJECTED');
      return null;
    }
    let result;
    try {result=await budgetedOcr(ocr,canvas,{
      blueInputOnly:String(firstResult.engine||'').startsWith('edge-candidate-ocr-v12'),preferredRects:[firstResult.rect],contourCandidates:contourResult?.candidates||[],
      contourBest:contourResult,clickLikely:firstResult.label==="클릭형 거탐",confirmationLabel:firstResult.label,confirmationRect:firstResult.rect,confirmationInlineGuide:firstResult.confirmationInlineGuide,
      inlineFixedOnly:Boolean(firstResult.confirmationInlineGuide),inlineContourOnly:Boolean(firstResult.confirmationInlineContour),confirmationInlineContour:firstResult.confirmationInlineContour,
      textInputOnly:Boolean(firstResult.confirmationTextInputOnly),
      violettaFixedOnly:Boolean(firstResult.confirmationViolettaFixedOnly),confirmationGuides:(firstResult.attempts||[]).filter(a=>a.violettaStructureScore&&a.region&&a.signals)
    });} catch(error) {
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED&&sessionIsCurrent())strictThreeFailedRecheck(firstCanvas,canvas,firstResult,"ocr","OCR_RECHECK_ERROR");
      throw error;
    }
    if(!sessionIsCurrent())return null;
    if(!result?.matched||result.label!==firstResult.label||!result.rect){
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,canvas,firstResult,"ocr","OCR_RECHECK_RESULT_REJECTED");
      return null;
    }
    const a=firstResult.rect,b=result.rect;
    const intersection=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const containment=intersection/Math.max(1,Math.min(a.w*a.h,b.w*b.h));
    // OCR may return a word box within the original full prompt box.
    if(containment<.8&&!sameTargetedContourLocation(a,b,canvas.width,canvas.height)){
      if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeFailedRecheck(firstCanvas,canvas,firstResult,"ocr","OCR_RECHECK_LOCATION_REJECTED");
      return null;
    }
    if(STRICT_THREE_INPUT_RESEARCH_ENABLED){
      const identity=strictThreeSemanticIdentity(firstResult);
      return semanticThirdOwnedPair({...result,strictThreeEvidence:[strictThreeOcrObservation(firstResult,firstCanvas,'targeted',identity),strictThreeOcrObservation(result,canvas,'targeted',identity)]},result,canvas,firstResult,firstCanvas,contourResult,firstMarker);
    }
    return result;
  }



  function selectFixedRainbowPair(result, searchCanvas) {
    const list=result?.candidates||[];
    const upper=list.filter(c=>c.id==="fixed-rainbow-top"&&c.score>=.62);
    const lower=list.filter(c=>c.id==="fixed-rainbow-bottom"&&c.score>=.62);
    for(const a of upper)for(const b of lower){
      if(a.templateScale!==b.templateScale)continue;
      const dx=(b.rect.x-a.rect.x)/a.rect.w,dy=(b.rect.y-a.rect.y)/a.rect.w;
      const ratio=b.rect.w/a.rect.w,score=(a.score+b.score)/2;
      if(dx<-.43||dx>-.17||dy<.31||dy>.56||ratio<1.1||ratio>1.35||score<.67)continue;
      const x=Math.min(a.rect.x,b.rect.x),y=Math.min(a.rect.y,b.rect.y);
      const rect={x,y,w:Math.max(a.rect.x+a.rect.w,b.rect.x+b.rect.w)-x,h:Math.max(a.rect.y+a.rect.h,b.rect.y+b.rect.h)-y};
      if(!rectInsideSearchMonitorRegion(rect,searchCanvas)||!rainbowHueSignature(searchCanvas,rect).pass)continue;
      return {id:"fixed-guide-rainbow",label:"클릭형 거탐",matched:true,score,threshold:.67,rect,
        requiredStreak:3,quickRecheck:true,confirmationMode:"fixed-guide-pair-3vote",voteIdentity:"fixed-guide-rainbow",
        source:"가림·회전 안내문 두 구간 + 색상 배치 확인",guideScores:[a.score,b.score]};
    }
    return null;
  }
  const capturedGuideResults = new WeakMap();
  function memoCapturedGuide(canvas, key, operation) {
    // External callers without a captured-frame identity cannot reuse results.
    if (!canvas.auditFrameMarker) return operation();
    let entries = capturedGuideResults.get(canvas);
    if (!entries) { entries = new Map(); capturedGuideResults.set(canvas, entries); }
    if (!entries.has(key)) entries.set(key, Promise.resolve().then(operation));
    return entries.get(key);
  }

  async function findFixedRainbowGuide(searchCanvas) {
    return memoCapturedGuide(searchCanvas,'fixed-rainbow',()=>findFixedRainbowGuideUncached(searchCanvas));
  }

  async function findFixedRainbowGuideUncached(searchCanvas) {
    const matcher=window.MAlertTextContourMatcher;
    if(!matcher)return null;
    const result=await matcher.analyzeTargeted(searchCanvas,{ids:["fixed-rainbow-top","fixed-rainbow-bottom"], analysisWidth:Math.min(640,Math.max(320,Math.round(video.videoWidth/4)))});
    return selectFixedRainbowPair(result,searchCanvas);
  }


  const M36_EARLY_HINT_ONLY_ENABLED=window.__MALERT_M36_DUAL_SCOPE_EXTRA_EXPERIMENT===true&&
    M35_SINGLE_CONFIRMATION_ENABLED===true&&DETECTION_CONFIRM_COUNT===1&&
    (['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname||'') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const m36EarlyHintCanvases=new WeakSet();
  const m36EarlyHintStats={calls:0,deferred:0,rows:[],dropped:0};
  function m36CompletedHintFalse(result){
    return result?.matched===false&&!result.error&&!result.code&&!result.incomplete&&!result.cancelled&&!result.canceled&&!result.timedOut&&!result.timeout;
  }
  function m36RecordHintDeferral(canvas,hint,result,startedAt){
    try{
    const frame=strictThreeFrames.get(canvas),at=performance.now();
    const row={at,startedAt,elapsedMs:at-startedAt,marker:canvas.auditFrameMarker?{...canvas.auditFrameMarker}:null,captureSequence:frame?.captureSequence,capturedAt:frame?.capturedAt,
      hintId:hint?.id,hintKind:hint?.kind,rect:hint?.rect?{...hint.rect}:null,reason:result.rejection||result.diagnostics?.rejection||'completed-current-hint-nonmatch',
      route:'main-initial-hint-only-broad-fallback-deferred',fullFallbackStillAvailable:true};
    m36EarlyHintStats.deferred++;if(m36EarlyHintStats.rows.length<64)m36EarlyHintStats.rows.push(row);else m36EarlyHintStats.dropped++;
    if(window.__M36_DIAGNOSTIC_ACTIVE===true)m39ReleaseObservationNoop?.({stage:'early-hint-broad-deferred',...row},canvas);
    }catch(_){m36EarlyHintStats.dropped++;}
  }
  async function m36EarlyClickRecheck(canvas,largeOnly,hint){
    const detector=window.MAlertClickGuide;
    const supported=hint&&(hint.kind==='large'?largeOnly&&typeof detector?.recheckLarge==='function':typeof detector?.recheckAdaptive==='function');
    if(!M36_EARLY_HINT_ONLY_ENABLED||!supported)return findClickLineGuide(canvas,largeOnly,hint);
    m36EarlyHintStats.calls++;m36EarlyHintCanvases.add(canvas);
    try{return await findClickLineGuide(canvas,largeOnly,hint);}finally{m36EarlyHintCanvases.delete(canvas);}
  }

  async function igFindClick(searchCanvas, largeOnly = false, adaptiveHint = null, allowAdaptive = true, adaptiveOnly = false, quickFixedOnly=false) {
    const m36Early=M36_EARLY_HINT_ONLY_ENABLED&&m36EarlyHintCanvases.has(searchCanvas);
    const key=(m36Early?'click-initial-hint-only:':'click:')+JSON.stringify([largeOnly,adaptiveHint,allowAdaptive,adaptiveOnly,quickFixedOnly]);
    return memoCapturedGuide(searchCanvas,key,()=>findClickLineGuideUncached(searchCanvas,largeOnly,adaptiveHint,allowAdaptive,adaptiveOnly,quickFixedOnly,m36Early));
  }

  function clickGuideAcceptance(searchCanvas,result,largeOnly) {
    if(!result?.rect||!rectInsideSearchMonitorRegion(result.rect,searchCanvas))return {passed:false,hue:null};
    const hue=rainbowHueSignature(searchCanvas,result.rect);
    // A white skill overlay can desaturate the background while all three
    // fixed text bands remain legible. This exception is restricted to the new
    // large-guide glyph match; legacy color/shape paths keep their old gate.
    const glyphBands=result.bands||[];
    const strongThreeBands=Number(result.whole)>=.60&&glyphBands.length===3&&glyphBands.every(v=>v>=.50)&&glyphBands.filter(v=>v>=.65).length>=2&&Number(result.score)>=.65;
    // Rounded entropy alone must not discard an independently verified three-line
    // glyph. Keep five hue buckets, saturation, native glyphs and fresh 3 votes.
    const translucentGuide=largeOnly&&strongThreeBands&&hue.saturatedRatio>=.05&&hue.occupied>=5&&hue.entropy>=1.9;
    // This pale rising-pose family has a narrower palette. It must exceed
    // the generic glyph floors in every band before its own color gate applies.
    const risingGuide=largeOnly&&result.id==='large-click-rising-0'&&Number(result.whole)>=.70&&Number(result.score)>=.70&&glyphBands.length===3&&glyphBands.every(v=>v>=.65)&&hue.saturatedRatio>=.15&&hue.occupied>=4&&hue.entropy>=1.6;
    // Only the generic branch's occupied/entropy rejection is excluded.
    // Keep the original hue values/pass and every other supplement unchanged.
    // OPT30 local research: retain every glyph and supplement guard; only the generic saturation comparison changes when explicitly enabled.
    const genericPass=LOCAL_CLICK_COLOR_RESEARCH.enabled ? hue.saturatedRatio>=(window.__MALERT_RESEARCH_CONFIG?.lowerGenericSaturation===true?.10:.15) : hue.pass;
    return {passed:Boolean(genericPass||translucentGuide||risingGuide),hue};
  }

  async function findClickLineGuideUncached(searchCanvas, largeOnly = false, adaptiveHint = null, allowAdaptive = true, adaptiveOnly = false, quickFixedOnly=false, m36Early=false) {
    const detector=window.MAlertClickGuide;if(!detector)return null;
    let native=searchCanvas.nativeSource||searchCanvas;
    if(native===searchCanvas&&video.videoWidth>searchCanvas.width&&video.videoWidth<=4096&&state.config.screenMode==='landscape'){
      native=document.createElement('canvas');native.width=video.videoWidth;native.height=video.videoHeight;
      native.getContext('2d',{alpha:false}).drawImage(video,0,0);
    }
    // A hint only narrows localization. Every fresh frame still verifies the
    // original whole glyph and all three bands before the existing vote gate.
    let result=null,m36HintActuallyRead=false;const m36HintStartedAt=m36Early?performance.now():0;
    if(adaptiveHint?.kind==='large'&&largeOnly&&detector.recheckLarge){
      if(detector.researchCurrentHintExtraEnabled?.()===true)result=await detector.recheckLarge(searchCanvas,native,adaptiveHint,{acceptExtraCandidate:c=>c?.matched===true&&clickGuideAcceptance(searchCanvas,c,true).passed});
      else result=await detector.recheckLarge(searchCanvas,native,adaptiveHint);
      m36HintActuallyRead=true;
    }
    else if(adaptiveHint&&adaptiveHint.kind!=='large'&&detector.recheckAdaptive){result=await detector.recheckAdaptive(searchCanvas,native,adaptiveHint);m36HintActuallyRead=true;}
    if(m36Early&&m36HintActuallyRead&&m36CompletedHintFalse(result)){m36RecordHintDeferral(searchCanvas,adaptiveHint,result,m36HintStartedAt);return null;}
    if(!result?.matched)result=await (adaptiveOnly?detector.analyzeAdaptive(searchCanvas,native,{quickCandidatesOnly:true}):(largeOnly?detector.analyzeLarge(searchCanvas,native):detector.analyze(searchCanvas,native,{quickCandidatesOnly:quickFixedOnly})));
    if(!result?.matched&&!adaptiveOnly&&allowAdaptive&&detector.analyzeAdaptive)result=await detector.analyzeAdaptive(searchCanvas,native);
    if(!result.matched||!rectInsideSearchMonitorRegion(result.rect,searchCanvas))return null;
    let acceptance=clickGuideAcceptance(searchCanvas,result,largeOnly);
    // Only refine a rising glyph already inside the existing palette gate.
    // A generic alignment may stop before another alignment passes the stricter
    // rising whole/band floors. Never relax those floors or search other poses.
    const h=acceptance.hue;
    if(!acceptance.passed&&largeOnly&&result.id==='large-click-rising-0'&&result.adaptiveHint&&
       h?.saturatedRatio>=.15&&h.occupied>=4&&h.entropy>=1.6&&detector.recheckLarge){
      const refined=await detector.recheckLarge(searchCanvas,native,result.adaptiveHint,{
        acceptCandidate:candidate=>clickGuideAcceptance(searchCanvas,candidate,true).passed
      });
      if(refined?.matched){result=refined;acceptance=clickGuideAcceptance(searchCanvas,result,true);}
    }
    result.hueDiagnostics=acceptance.hue;
    if(!acceptance.passed)return null;
    igEmit('native-guide-selected',{marker:searchCanvas.auditFrameMarker,capture:m4Context(searchCanvas),largeOnly,result:{id:result.id,rect:result.rect,score:result.score,whole:result.whole,bands:result.bands,referenceIndex:result.referenceIndex,nativeRasterEvidence:result.nativeRasterEvidence||null,rowDetailEvidence:result.rowDetailEvidence||null,coarseScore:result.coarseScore},hue:acceptance.hue});
    return {id:largeOnly?'click-large-lines':'click-fixed-lines',label:'클릭형 거탐',matched:true,score:result.score,threshold:result.threshold,rect:result.rect,
      requiredStreak:3,quickRecheck:true,confirmationMode:'click-lines-3vote',voteIdentity:largeOnly?'click-large-lines':'click-fixed-lines',
      source:'안내문 다중 후보 + 원본 글자 세 구간 확인',guideScores:result.bands,adaptiveHint:result.adaptiveHint||null};
  }

  async function findSentenceGuide(searchCanvas) {
    return memoCapturedGuide(searchCanvas,'sentence',()=>findSentenceGuideUncached(searchCanvas));
  }

  async function findSentenceGuideUncached(searchCanvas) {
    const detector=window.MAlertSentenceGuide;
    if(!detector)return null;
    const result=await detector.analyze(searchCanvas,searchCanvas.nativeSource||searchCanvas);
    if(!result?.matched||!rectInsideSearchMonitorRegion(result.rect,searchCanvas))return null;
    return {id:'sentence-fixed-guide',label:'문장 선택형',matched:true,score:result.score,threshold:result.threshold,
      rect:result.rect,requiredStreak:3,quickRecheck:true,confirmationMode:'sentence-guide-3vote',voteIdentity:'sentence-fixed-guide',
      source:'선택 패널의 정렬된 다섯 행 + 상단 고정 안내문 확인',guideScores:result.scores};
  }

  async function findPanelGuide(searchCanvas) {
    return memoCapturedGuide(searchCanvas,'panel',()=>findPanelGuideUncached(searchCanvas));
  }

  async function findPanelGuideUncached(searchCanvas) {
    const detector=window.MAlertPanelGuide;
    if(!detector)return null;
    let input=searchCanvas.nativeSource||searchCanvas;
    if(input===searchCanvas&&state.config.screenMode==='landscape'&&video.videoWidth>searchCanvas.width&&video.videoWidth<=4096){
      input=document.createElement('canvas');input.width=video.videoWidth;input.height=video.videoHeight;
      input.getContext('2d',{alpha:false}).drawImage(video,0,0);
    }
    const previous=state.streak>0&&state.lastAnalysisBest?.id==='panel-guide-shape'?state.lastAnalysisBest.panelGuideHint:null;
    let result=previous&&detector.recheck?await detector.recheck(input,previous):null;
    if(!result?.matched)result=await detector.analyze(input);
    if(!result.matched)return null;
    if(input!==searchCanvas){const sx=searchCanvas.width/input.width,sy=searchCanvas.height/input.height;result.rect={x:result.rect.x*sx,y:result.rect.y*sy,w:result.rect.w*sx,h:result.rect.h*sy};}
    if(!rectInsideSearchMonitorRegion(result.rect,searchCanvas))return null;
    return {id:'panel-guide-'+result.kind,label:result.kind==='shape'?'도형 이동형':'문자 입력형',
      matched:true,score:result.score,threshold:result.threshold,rect:result.rect,
      requiredStreak:3,quickRecheck:true,confirmationMode:'panel-guide-3vote',voteIdentity:'panel-guide-'+result.kind,
      source:'안내창 내부 고정 문구 세 구간 확인',panelGuideScores:result.scores,panelGuideHint:result.hint||null};
  }

  function getColoredGuideHint(searchCanvas, input, now = performance.now()) {
    // Localization priority only: never reuse an old score, pixels or vote.
    const previous = state.priorityColorEvidence.at(-1);
    const marker = searchCanvas.auditFrameMarker;
    if (!previous || previous.sessionId !== state.captureSessionId || previous.stream !== state.stream ||
        previous.revision !== state.monitorRegionRevision || previous.epoch !== state.priorityColorEpoch ||
        previous.width !== searchCanvas.width || previous.height !== searchCanvas.height ||
        previous.sourceWidth !== video.videoWidth || previous.sourceHeight !== video.videoHeight ||
        !Number.isFinite(previous.capturedAt) || now < previous.capturedAt || now - previous.capturedAt > PRIORITY_COLOR_WINDOW_MS ||
        !isIndependentTargetedRecheckFrame(previous.marker, marker)) return null;
    const r = previous.rect;
    if (!r || ![r.x,r.y,r.w,r.h].every(Number.isFinite) || r.w <= 0 || r.h <= 0 ||
        r.x < 0 || r.y < 0 || r.x + r.w > searchCanvas.width || r.y + r.h > searchCanvas.height) return null;
    const sx=input.width/searchCanvas.width, sy=input.height/searchCanvas.height;
    return {x:r.x*sx,y:r.y*sy,w:r.w*sx,h:r.h*sy};
  }

  async function findColoredInputGuide(searchCanvas) {
    return memoCapturedGuide(searchCanvas,'colored',()=>findColoredInputGuideUncached(searchCanvas));
  }

  async function findColoredInputGuideUncached(searchCanvas) {
    const detector = window.MAlertColoredInput;
    if (!detector) return null;
    // Read the fixed guide from original capture pixels when the search image
    // was downscaled. Coordinates are mapped back before region/vote checks.
    let input=searchCanvas.nativeSource||searchCanvas;
    if(input===searchCanvas && video.videoWidth>searchCanvas.width && video.videoWidth<=4096){
      input=document.createElement("canvas");input.width=video.videoWidth;input.height=video.videoHeight;
      input.getContext("2d",{alpha:false}).drawImage(video,0,0);
    }
    const result = await detector.analyze(input, {preferredRect:getColoredGuideHint(searchCanvas,input)});
    if(result?.rect && input!==searchCanvas){
      const sx=searchCanvas.width/input.width,sy=searchCanvas.height/input.height;
      result.rect={x:result.rect.x*sx,y:result.rect.y*sy,w:result.rect.w*sx,h:result.rect.h*sy};
    }
    if (!result?.matched || !rectInsideSearchMonitorRegion(result.rect, searchCanvas)) return null;
    return {
      id: "text-input-colored-guide", label: "문자 입력형",
      score: result.score, threshold: result.threshold, matched: true,
      rect: result.rect, quickRecheck: true, requiredStreak: 3,
      confirmationMode: "colored-guide-3vote", voteIdentity: "text-input-colored-guide",
      source: result.palette==='purple'?"보라색 입력창 배치 + 고정 안내문 세 줄 확인":"색상 안내판·입력칸 배치 + 고정 안내문 무늬 2구간 확인",
      coloredGuideScores: result.bandScores, coloredPanelMetrics: result.metrics
    };
  }

  async function tryFastBlueInput(searchCanvas,frameMarker,sessionIsCurrent) {
    const ocr=window.MAlertOcr;
    const hints=ocr?.detectBlueInputGuideRegions?.(searchCanvas,blueSearchRegionOptions(searchCanvas))||[];
    if(!hints.some(h=>rectInsideSearchMonitorRegion(h.rect,searchCanvas)))return null;
    const previousPhase=state.analysisPhase;
    state.analysisPhase='confirm';
    try {
      const first=await budgetedOcr(ocr,searchCanvas,{blueInputOnly:true});
      if(!sessionIsCurrent()||!first?.matched||first.label!=='문자 입력형'||!rectInsideSearchMonitorRegion(first.rect,searchCanvas))return null;
      const second=await tryTargetedOcrRecheck(ocr,first,searchCanvas,null,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      return {id:'text-input-blue-fixed',label:second.label,score:second.score,threshold:second.threshold,matched:true,
        quickRecheck:true,rect:second.rect,source:'파란 문자 입력 패널 + 독립 프레임 고정 안내 OCR',requiredStreak:2,
        confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?'ocr-single-final':'ocr-targeted-2vote'),preconfirmed:true,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:second.strictThreeEvidence}:{}),ocrText:second.text||'',ocrDurationMs:second.durationMs};
    } finally {
      if(sessionIsCurrent())state.analysisPhase=previousPhase;
    }
  }

  async function tryFastVioletta(searchCanvas, frameMarker, sessionIsCurrent,earlyProbe=null) {
    const ocr=window.MAlertOcr;
    if(earlyProbe?.attempted)return null;
    const hints=(ocr?.detectViolettaPopupRegions?.(searchCanvas)||[])
      .filter(h=>Number(h.score||0)>=.93 && rectInsideSearchMonitorRegion(h.rect,searchCanvas));
    if(!hints.length)return null;
    if(earlyProbe?.onlyStrong){
      const compact=searchCanvas.width<640&&searchCanvas.height>=searchCanvas.width*.9;
      if(!compact&&!hints.some(h=>Number(h.score)>=.96&&Number(h.diagnostics?.aboveDark)>=.5&&Number(h.diagnostics?.aboveNavy)>=.5))return null;
    }
    const previousPhase=state.analysisPhase;
    state.analysisPhase="confirm";
    try {
      if(earlyProbe)earlyProbe.attempted=true;
      let first=await budgetedOcr(ocr,searchCanvas,{confirmationLabel:"비올레타형",violettaFixedOnly:true,preferredRects:hints.map(h=>h.rect),confirmationGuides:hints});
      // M399: after the existing strong, current-frame fixed read misses,
      // schedule only its already-existing general COLOR region. This is one
      // bounded OCR dispatch; a miss retains all original fallback work.
      if(window.__MALERT_M399_VIOLET_BOUNDED_VARIANTS===true&&(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'))&&
          M35_SINGLE_CONFIRMATION_ENABLED&&earlyProbe?.onlyStrong===true&&sessionIsCurrent()&&first?.matched===false&&first.incomplete!==true&&
          Number(hints[0]?.score)>=.96&&Number(hints[0]?.diagnostics?.aboveDark)>=.5&&Number(hints[0]?.diagnostics?.aboveNavy)>=.5){
        const general=await budgetedOcr(ocr,searchCanvas,{violettaFixedOnly:true,m399BoundedGeneralOnly:true,confirmationLabel:'비올레타형',preferredRects:hints.map(h=>h.rect)});
        if(general?.matched===true&&general.label==='비올레타형')first=general;
      }
      if(FAST_VIOLETTA_SPLIT_AFTER_FIXED_RESEARCH_ENABLED &&
          searchCanvas.width<640 && searchCanvas.height>=searchCanvas.width*.9 &&
          sessionIsCurrent() && first?.matched===false &&
          ocr.researchFastViolettaSplitAfterFixedEnabled?.()===true){
        // Preserve the general route's candidate order, OCR plans and return flags.
        // A miss continues to every existing fallback; confirmation remains unchanged.
        first=await budgetedOcr(ocr,searchCanvas,{violettaGeneralOnly:true});
      }
      if(!sessionIsCurrent()||!first?.matched||first.label!=="비올레타형"||!rectInsideSearchMonitorRegion(first.rect,searchCanvas))return null;
      let second=await tryTargetedOcrRecheck(ocr,first,searchCanvas,null,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      if(SEMANTIC_THIRD_DISPATCH_ENABLED)second=await completeThirdSemanticPair(ocr,first,second,searchCanvas,null,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      return {id:"text-violetta",label:second.label,score:second.score,threshold:second.threshold,matched:true,quickRecheck:true,rect:second.rect,source:"비올레타 구조 + 독립 프레임 OCR · "+second.reason,requiredStreak:2,confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?"ocr-single-final":"ocr-targeted-2vote"),preconfirmed:true,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:second.strictThreeEvidence}:{}),ocrText:second.text||"",ocrDurationMs:second.durationMs};
    } finally {
      if(sessionIsCurrent())state.analysisPhase=previousPhase;
    }
  }


  const M36_CURRENT_TEXT_N1_ENABLED=window.__MALERT_M36_DUAL_SCOPE_EXTRA_EXPERIMENT===true&&
    M35_SINGLE_CONFIRMATION_ENABLED===true&&DETECTION_CONFIRM_COUNT===1&&
    (['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname||'') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));

  const m36ScopedTextOcrOwners=new WeakSet();
  const m36ScopedTextOcrRoutes=new WeakMap();
  function m36ScopedTextOcrOptions(canvas,options){
    if(!M36_CURRENT_TEXT_N1_ENABLED||!m36ScopedTextOcrOwners.has(canvas)||options.textInputOnly!==true||!m35Owned(canvas))return options;
    const owner=strictThreeFrames.get(canvas),route=m36ScopedTextOcrRoutes.get(canvas);
    if(!owner||!['main-existing-preLargeText','fresh-existing-semantic-probe'].includes(route))return options;
    return {...options,m36ScopedTextExtra:true,m36ScopedTextRoute:route,m36ScopedTextOwner:{kind:owner.kind,value:owner.value,provider:owner.provider,captureSequence:owner.captureSequence,capturedAt:owner.capturedAt,session:owner.session}};
  }

  const m36CurrentTextStats={calls:0,attempted:0,passed:0,noAcceptedResult:0,incomplete:0,refused:0,rows:[],dropped:0,passedRows:[],passedDropped:0};
  function m36CurrentTextScope(a,b){return Boolean(a&&b&&a.kind==='frame-count'&&b.kind===a.kind&&a.provider===b.provider&&
    a.session===b.session&&a.stream===b.stream&&a.revision===b.revision&&a.serial===b.serial&&
    a.width===b.width&&a.height===b.height&&a.sourceWidth===b.sourceWidth&&a.sourceHeight===b.sourceHeight&&a.transform===b.transform&&
    a.session===state.captureSessionId&&a.stream===state.stream&&a.revision===state.monitorRegionRevision&&a.serial===state.rainbowDetectionSerial);}
  function m36CurrentTextRecord(record,canvas){try{if(m36CurrentTextStats.rows.length<32)m36CurrentTextStats.rows.push(record);else m36CurrentTextStats.dropped++;
    if(record.status==='PASSED'){if(m36CurrentTextStats.passedRows.length<16)m36CurrentTextStats.passedRows.push(record);else m36CurrentTextStats.passedDropped++;}
    if(window.__M36_DIAGNOSTIC_ACTIVE===true)m39ReleaseObservationNoop?.({stage:'fresh-text-before-general',...record},canvas);}catch(_){}}
  async function m36CurrentTextBeforeGeneral(oldCanvas,oldMarker,sessionIsCurrent){
    if(!M36_CURRENT_TEXT_N1_ENABLED||!sessionIsCurrent())return null;
    const oldFrame=strictThreeFrames.get(oldCanvas);
    if(!m35Owned(oldCanvas)||oldMarker?.kind!=='frame-count'||oldMarker.provider!==oldFrame?.provider||oldMarker.value!==oldFrame?.value)return null;
    m36CurrentTextStats.calls++;
    const record={at:performance.now(),route:'one-current-semantic-text-probe-before-old-general-ocr',oldMarker:{...oldMarker},oldCaptureAt:oldFrame.capturedAt,oldCaptureSequence:oldFrame.captureSequence,status:'INCOMPLETE',operatingVoteInjected:false};
    let freshCanvas;
    try{freshCanvas=captureSearchCanvas();}catch(error){record.reason='capture-error';record.error={name:error?.name,code:error?.code};m36CurrentTextStats.incomplete++;m36CurrentTextRecord(record,oldCanvas);return null;}
    const freshFrame=strictThreeFrames.get(freshCanvas),freshMarker=freshCanvas.auditFrameMarker;
    record.freshMarker=freshMarker?{...freshMarker}:null;record.freshCaptureAt=freshFrame?.capturedAt;record.freshCaptureSequence=freshFrame?.captureSequence;
    if(!sessionIsCurrent()||!m35Owned(oldCanvas)||!m35Owned(freshCanvas)||!m36CurrentTextScope(oldFrame,freshFrame)||
      freshMarker?.provider!==freshFrame.provider||freshMarker?.value!==freshFrame.value||
      !isIndependentTargetedRecheckFrame(oldMarker,freshMarker)){
      record.status='NOT_EXECUTED';record.reason='independent-current-owned-scope-required';m36CurrentTextStats.refused++;m36CurrentTextRecord(record,freshCanvas);return null;
    }
    m36CurrentTextStats.attempted++;let result=null;
    try{
      // Reuse the complete existing current-pixel text helper and its mandatory
      // semantic OCR. Do not pass the old canvas's contour, probe or result.
      m36ScopedTextOcrOwners.add(freshCanvas);m36ScopedTextOcrRoutes.set(freshCanvas,'fresh-existing-semantic-probe');
      result=await tryFastKnownGuide(freshCanvas,freshMarker,sessionIsCurrent,'text');
      if(!sessionIsCurrent()||!m35Owned(oldCanvas)||!m35Owned(freshCanvas)||!m36CurrentTextScope(oldFrame,freshFrame)){
        record.reason='scope-changed-after-await';throw ocrSupersededError();
      }
      const proof=result?.strictThreeEvidence;
      const owned=Array.isArray(proof)&&proof.length===1&&proof[0]?.frame===freshFrame&&
        proof[0].matched===true&&proof[0].policy==='semantic-ocr'&&m35ProofOwned(proof[0])&&strictThreeRectValid(proof[0]);
      const accepted=Boolean(result?.matched===true&&result.incomplete!==true&&result.label==='문자 입력형'&&
        result.preconfirmed===true&&result.confirmationMode==='ocr-single-final'&&owned&&
        rectInsideSearchMonitorRegion(result.rect,freshCanvas));
      record.resultMatched=result?.matched===true;record.proofOwned=owned;record.rect=result?.rect?{...result.rect}:null;
      if(accepted){record.status='PASSED';m36CurrentTextStats.passed++;return result;}
      // Null is a normal helper nonmatch, not a fabricated negative OCR result.
      // Actual failed-recheck objects remain journalled below, as in M26.
      record.status=result?.incomplete===true?'INCOMPLETE':'NO_ACCEPTED_RESULT';
      if(record.status==='NO_ACCEPTED_RESULT')m36CurrentTextStats.noAcceptedResult++;
      return null;
    }catch(error){record.reason=record.reason||'existing-helper-threw';record.error={name:error?.name,code:error?.code};throw error;}
    finally{
      m36ScopedTextOcrOwners.delete(freshCanvas);m36ScopedTextOcrRoutes.delete(freshCanvas);
      const failures=strictThreeFailedRechecks.get(freshCanvas)||[];
      if(failures.length){
        const previous=strictThreeFailedRechecks.get(oldCanvas)||[];
        const scoped=failures.filter(o=>m36CurrentTextScope(freshFrame,o?.frame));
        const added=scoped.filter((o,index)=>!previous.includes(o)&&scoped.indexOf(o)===index);
        if(added.length)strictThreeFailedRechecks.set(oldCanvas,[...previous,...added]);
        const remaining=failures.filter(o=>!scoped.includes(o));
        if(remaining.length)strictThreeFailedRechecks.set(freshCanvas,remaining);else strictThreeFailedRechecks.delete(freshCanvas);
        record.actualFailuresMoved=added.length;record.unmovedFailures=remaining.length;
      }
      record.endedAt=performance.now();record.elapsedMs=record.endedAt-record.at;
      if(record.status==='INCOMPLETE')m36CurrentTextStats.incomplete++;
      m36CurrentTextRecord(record,freshCanvas);
    }
  }
  window.MAlertM36CurrentTextBeforeGeneral=Object.freeze({enabled:()=>M36_CURRENT_TEXT_N1_ENABLED,status:()=>({...m36CurrentTextStats,rows:m36CurrentTextStats.rows.map(r=>({...r})),earlyHintOnly:{...m36EarlyHintStats,enabled:M36_EARLY_HINT_ONLY_ENABLED,rows:m36EarlyHintStats.rows.map(r=>({...r}))},maxFreshProbesPerGeneralEntry:1,extraOcrScope:'existing-preLargeText-and-fresh-semantic-probe',freshProbeExtraOcr:true,maxAdditionalCandidatesPerExistingOcrJob:1,maxScopedExtraJobsPerMain:2,scopedExtraOcr:window.MAlertM36ExtraStructuralRegionOcr?.status?.()||null})});

  async function tryFastKnownGuide(searchCanvas,frameMarker,sessionIsCurrent,kind,earlyProbe=null) {
    const matcher=window.MAlertTextContourMatcher,ocr=window.MAlertOcr;
    if(!matcher?.analyzeTargeted||!ocr||earlyProbe?.attempted)return null;
    const text=kind==='text';
    const ids=text?['text-input-prompt-94463','text-input-prompt-94465','text-input-prompt-99116']:['inline-click-94425','inline-click-88992','inline-click-88993'];
    let contour=earlyProbe?.contour||await matcher.analyzeTargeted(searchCanvas,{ids});
    if(!sessionIsCurrent())return null;
    contour=applyMonitorRegionToContourResult(contour,searchCanvas);
    if(earlyProbe)earlyProbe.contour=contour;
    if(earlyProbe?.onlyStrong){
      if(text){
        const candidates=(contour.candidates||[]).filter(c=>Number(c.score)-Number(c.threshold)>=earlyProbe.minimumMargin);
        if(!candidates.length)return null;
        contour={...contour,...candidates[0],candidates};
      }else if(!selectInlineClickFallbackCandidate(contour,searchCanvas.width,searchCanvas.height)){
        // A strong single candidate only schedules the unchanged semantic OCR.
        // It cannot itself pass the paired visual fallback or produce a vote.
        const candidates=(contour.candidates||[]).filter(c=>Number(c.score)-Number(c.threshold)>=earlyProbe.minimumMargin);
        if(!candidates.length)return null;
        contour={...contour,...candidates[0],candidates};
      }
    }
    const options={contourCandidates:contour.candidates||[],contourBest:contour,clickLikely:!text};
    const hints=text?ocr.detectTextInputPromptRegions?.(searchCanvas,options):ocr.detectInlineClickPromptRegions?.(searchCanvas,options);
    if(!hints?.some(h=>rectInsideSearchMonitorRegion(h.rect,searchCanvas)))return null;
    // R13: only the existing late, structural-recovery-only text proposal yields
    // its position to the existing fixed click route. A hint is not acceptance.
    if(PREFER_FIXED_BEFORE_STRUCTURAL_TEXT_RESEARCH_ENABLED && text &&
        earlyProbe?.onlyStrong===false && typeof earlyProbe.beforeStructuralRecovery==='function' &&
        hints.every(h=>h.retrievalRecovery==='94463-structural-top1')){
      const preferred=await earlyProbe.beforeStructuralRecovery();
      if(!sessionIsCurrent())return null;
      if(preferred)return {...preferred,researchFixedBeforeStructuralText:{version:1,route:'existing-fixed-before-structural-text'}};
    }
    const previousPhase=state.analysisPhase;state.analysisPhase='confirm';
    try {
      if(earlyProbe)earlyProbe.attempted=true;
      m39ReleaseLatencyAudit.record({event:'known-guide-ocr',kind,analysisStartedAt:state.analysisStartedAt});const first=await budgetedOcr(ocr,searchCanvas,{...options,textInputOnly:text,inlineContourOnly:!text});
      const label=text?'문자 입력형':'클릭형 거탐';
      // The existing paired fallback is permitted only after OCR fails. Reuse
      // this frame's targeted candidates rather than repeating the full scan;
      // the next two votes still re-read both contours on distinct frames.
      if(sessionIsCurrent()&&!text&&first?.matched===false){
        const pair=selectInlineClickFallbackCandidate(contour,searchCanvas.width,searchCanvas.height);
        if(pair&&rectInsideSearchMonitorRegion(pair.rect,searchCanvas))return {
          id:'text-contour-'+pair.id,label:pair.label,matched:true,score:pair.score,
          threshold:pair.confirmThreshold,rect:pair.rect,requiredStreak:3,quickRecheck:true,
          confirmationMode:pair.confirmationMode,voteIdentity:pair.voteIdentity,fallbackId:pair.id,
          source:'제한 OCR 미확인 후 기존 이중 윤곽 조건 · 독립 프레임 2회 확인'};
      }
      if(!sessionIsCurrent()||!first?.matched||first.label!==label||!rectInsideSearchMonitorRegion(first.rect,searchCanvas))return null;
      let second=await tryTargetedOcrRecheck(ocr,first,searchCanvas,contour,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      if(SEMANTIC_THIRD_DISPATCH_ENABLED && text)second=await completeThirdSemanticPair(ocr,first,second,searchCanvas,contour,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      return {id:text?'text-fixed-ocr':'inline-contour-ocr',label,score:second.score,threshold:second.threshold,matched:true,
        quickRecheck:true,rect:second.rect,source:'기존 안내문 후보 + 독립 프레임 같은 위치 OCR 문맥 확인',requiredStreak:2,
        confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?'ocr-single-final':'ocr-targeted-2vote'),preconfirmed:true,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:second.strictThreeEvidence}:{}),ocrText:second.text||'',ocrDurationMs:second.durationMs};
    } finally {if(sessionIsCurrent())state.analysisPhase=previousPhase;}
  }


  // R3: only a genuinely timed-out fixed-instruction OCR may expire a frame.
  // Ordinary nonmatches, fresh frames and unavailable frame counters keep R2.
  const TEXT_BEFORE_DEFERRED_LARGE_ENABLED=window.__MALERT_TEXT_BEFORE_DEFERRED_LARGE_EXPERIMENT===true&&(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const textBeforeDeferredLargeStats={attempts:0,accepted:0,nonmatches:0,elapsedMs:0};
  window.MAlertTextBeforeDeferredLargeResearch=Object.freeze({enabled:()=>TEXT_BEFORE_DEFERRED_LARGE_ENABLED,status:()=>({...textBeforeDeferredLargeStats})});
  const LARGE_AFTER_FAST_ENABLED=window.__MALERT_LARGE_AFTER_FAST_EXPERIMENT===true&&(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const OCR_FRAME_YIELD_ENABLED=window.__MALERT_OCR_FRAME_YIELD_EXPERIMENT===true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const OCR_EXPIRED_SCAN_GUARD_ENABLED=window.__MALERT_OCR_EXPIRED_SCAN_GUARD_EXPERIMENT===true && OCR_FRAME_YIELD_ENABLED;
  const OCR_POSTFAIL_STRONG_FIRST_ENABLED=window.__MALERT_OCR_POSTFAIL_STRONG_FIRST_EXPERIMENT===true && OCR_FRAME_YIELD_ENABLED;
  const completedFixedNonmatchFrames=new WeakSet();
  const ocrExpiredFrames=new WeakSet();
  const ocrFrameYieldStats={timeoutsYielded:0,blockedFollowups:0,abandonedAnalyses:0};
  window.MAlertOcrFrameResearch=Object.freeze({enabled:()=>OCR_FRAME_YIELD_ENABLED,status:()=>({...ocrFrameYieldStats})});
  function ocrSupersededError(){const e=new Error('Timed-out OCR frame superseded by actual newer input');e.code='OCR_SUPERSEDED';return e;}
  function assertOcrFrameNotExpired(canvas){
    if(OCR_FRAME_YIELD_ENABLED && ocrExpiredFrames.has(canvas)){ocrFrameYieldStats.blockedFollowups++;throw ocrSupersededError();}
  }
  function ocrFramePolicy(canvas,options){
    if(!OCR_FRAME_YIELD_ENABLED)return undefined;
    const frame=strictThreeFrames.get(canvas);
    if(!frame)return undefined;
    return {
      isCurrent:()=>semanticThirdScopeCurrent(frame),
      onRecognitionTimeout:timeoutMs=>{
        // Do not shorten ordinary 1.2s ROI fallbacks or invalidate other OCR
        // types. This first candidate targets the proven fixed-guide cascade.
        if(timeoutMs!==4500 || options.inlineFixedOnly!==true || !semanticThirdScopeCurrent(frame))return false;
        const current=getTargetedRecheckFrameMarker();
        if(frame.kind!=='frame-count' || current?.kind!=='frame-count' || current.provider!==frame.provider ||
            !Number.isFinite(frame.capturedAt) || !isIndependentTargetedRecheckFrame(frame,current))return false;
        ocrExpiredFrames.add(canvas);ocrFrameYieldStats.timeoutsYielded++;return true;
      }
    };
  }

  // Local session-bound OCR cleanup. The recognizer and its timeout settings
  // are unchanged. A stopped source cannot enqueue OCR behind the next source.
  const OCR_SESSION_CLEANUP_ENABLED = window.__MALERT_OCR_SESSION_EXPERIMENT === true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const ocrSessionStats={stopCancellations:0,staleRequestsRejected:0};
  window.MAlertOcrSessionResearch=Object.freeze({enabled:()=>OCR_SESSION_CLEANUP_ENABLED,status:()=>({...ocrSessionStats})});
  function assertOcrCanvasSession(canvas) {
    if(!OCR_SESSION_CLEANUP_ENABLED)return;
    const owner=strictThreeFrames.get(canvas);
    if(owner&&!isAnalysisContextCurrent(owner.session,owner.stream,owner.revision)){
      ocrSessionStats.staleRequestsRejected++;
      const error=new Error('Stopped capture OCR request discarded');error.code='OCR_CANCELLED';throw error;
    }
  }

  // Local, default-off research. No OCR settings or confirmation policy changes.
  const OCR_FRESH_HANDOFF_ENABLED = window.__MALERT_OCR_HANDOFF_EXPERIMENT === true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const ocrFreshStats={sampled:0,proposals:0,retries:0,recovered:0,retryRejected:0,sampleMs:0,sampleErrors:0};
  window.MAlertOcrHandoffResearch=Object.freeze({enabled:()=>OCR_FRESH_HANDOFF_ENABLED,status:()=>({...ocrFreshStats})});
  function beginOcrFreshProposal(firstCanvas,firstMarker,sessionIsCurrent) {
    const serial=state.rainbowDetectionSerial;
    let proposal=null,stopped=false;
    // A single bounded localization while the worker is pending. This is not
    // final acceptance and cannot append any confirmation record or alert.
    const timer=setTimeout(()=>{
      if(stopped||!sessionIsCurrent()||state.paused||state.regionSelecting||state.rainbowDetectionSerial!==serial)return;
      const at=performance.now();
      try{
      const canvas=captureSearchCanvas(),marker=canvas.auditFrameMarker;
      if(canvas.width!==firstCanvas.width||canvas.height!==firstCanvas.height||!isIndependentTargetedRecheckFrame(firstMarker,marker))return;
      const hints=window.MAlertOcr.detectInlineFixedInstructionRegions(canvas,{...blueSearchRegionOptions(canvas),nativeSource:canvas.nativeSource||canvas})||[];
      const rects=hints.filter(h=>rectInsideSearchMonitorRegion(h.fixedInstructionRect,canvas)).map(h=>({...h.fixedInstructionRect}));
      ocrFreshStats.sampled++;ocrFreshStats.sampleMs+=performance.now()-at;
      if(rects.length){ocrFreshStats.proposals++;proposal={rects,frame:strictThreeFrames.get(canvas),marker,serial};}
      }catch(_){ocrFreshStats.sampleErrors++;}
    },1000);
    return ()=>{stopped=true;clearTimeout(timer);return proposal;};
  }
  async function retryCurrentFixedGuide(firstCanvas,firstMarker,proposal,sessionIsCurrent) {
    if(!proposal||!sessionIsCurrent()||state.paused||state.regionSelecting||proposal.serial!==state.rainbowDetectionSerial)return null;
    const canvas=captureSearchCanvas(),marker=canvas.auditFrameMarker;
    const frame=strictThreeFrames.get(canvas),before=strictThreeFrames.get(firstCanvas);
    if(!strictThreeCore.sameScope(before,frame)||!strictThreeCore.sameScope(proposal.frame,frame)||
        !isIndependentTargetedRecheckFrame(firstMarker,marker)||!isIndependentTargetedRecheckFrame(proposal.marker,marker))return null;
    // Proposal coordinates are clues only; re-localize in this current input.
    const hints=window.MAlertOcr.detectInlineFixedInstructionRegions(canvas,{...blueSearchRegionOptions(canvas),nativeSource:canvas.nativeSource||canvas})||[];
    if(!hints.some(h=>rectInsideSearchMonitorRegion(h.fixedInstructionRect,canvas)&&proposal.rects.some(r=>sameTargetedContourLocation(r,h.fixedInstructionRect,canvas.width,canvas.height))))return null;
    ocrFreshStats.retries++;
    let result=null;
    try{
      result=await tryFastInlineInstructions(canvas,marker,sessionIsCurrent,true);
      if(result)ocrFreshStats.recovered++;else ocrFreshStats.retryRejected++;
      return result;
    }finally{
      // Preserve actual independent recheck failures under the original main
      // owner, including when a later legacy path continues after this miss.
      const failures=strictThreeFailedRechecks.get(canvas)||[];
      if(!result&&!failures.length&&sessionIsCurrent()&&proposal.serial===state.rainbowDetectionSerial){
        const failure=strictThreeObservation({matched:false},canvas,'main','scoped-ocr-handoff','barrier');
        failure.rejection='FRESH_SCOPED_OCR_NOT_ACCEPTED';failures.push(failure);
      }
      if(failures.length){strictThreeFailedRechecks.set(firstCanvas,[...(strictThreeFailedRechecks.get(firstCanvas)||[]),...failures]);strictThreeFailedRechecks.delete(canvas);}
    }
  }

  async function tryFastInlineInstructions(searchCanvas, frameMarker, sessionIsCurrent, isFreshRetry=false) {
    const ocr=window.MAlertOcr;
    const hints=ocr?.detectInlineFixedInstructionRegions?.(searchCanvas,{...blueSearchRegionOptions(searchCanvas),nativeSource:searchCanvas.nativeSource||searchCanvas})||[];
    m39ReleaseLatencyAudit.record({event:'inline-hints',analysisStartedAt:state.analysisStartedAt,marker:searchCanvas.auditFrameMarker,count:hints.length,rects:hints.slice(0,3).map(h=>h.fixedInstructionRect)});if(!hints.some(h=>rectInsideSearchMonitorRegion(h.fixedInstructionRect,searchCanvas)))return null;
    const previousPhase=state.analysisPhase;
    state.analysisPhase='confirm';
    const stopProposal=OCR_FRESH_HANDOFF_ENABLED&&!isFreshRetry?beginOcrFreshProposal(searchCanvas,frameMarker,sessionIsCurrent):null;
    try {
      const first=await budgetedOcr(ocr,searchCanvas,{inlineFixedOnly:true});
      if(OCR_POSTFAIL_STRONG_FIRST_ENABLED&&first?.matched===false&&first?.incomplete!==true)completedFixedNonmatchFrames.add(searchCanvas);
      const proposal=stopProposal?.();
      // Only a completed real OCR nonmatch can hand off once. Exceptions and
      // cancellations keep the original failure path. Every retry uses the
      // same semantic OCR and fresh recheck; a clue is never a success vote.
      if(OCR_FRESH_HANDOFF_ENABLED&&!isFreshRetry&&first?.matched===false&&sessionIsCurrent()&&(!OCR_FRAME_YIELD_ENABLED||(first?.incomplete===true&&first?.ocrSuperseded===true))){
        const retry=await retryCurrentFixedGuide(searchCanvas,frameMarker,proposal,sessionIsCurrent);
        if(retry)return retry;
      }
      const recoveredYellowClick = EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED && ocr.researchEarlyYellowAfterFixedEnabled?.()===true && first?.researchYellowAfterFixed?.version===1 && first.researchYellowAfterFixed.route==='existing-yellow-semantic-click';
      if(!sessionIsCurrent()||!first?.matched||first.label!=='클릭형 거탐'||(!first.confirmationInlineGuide&&!recoveredYellowClick)||!rectInsideSearchMonitorRegion(first.rect,searchCanvas))return null;
      const second=await tryTargetedOcrRecheck(ocr,first,searchCanvas,null,frameMarker,sessionIsCurrent);
      if(!second||!rectInsideSearchMonitorRegion(second.rect,searchCanvas))return null;
      return {id:'inline-fixed-ocr',label:second.label,score:second.score,threshold:second.threshold,matched:true,
        quickRecheck:true,rect:second.rect,source:recoveredYellowClick?'노란 안내 후보 + 독립 프레임 같은 위치 OCR 문맥 확인':'고정 안내 줄 배치 + 독립 프레임 같은 위치 OCR 문맥 확인',requiredStreak:2,
        confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?'ocr-single-final':'ocr-targeted-2vote'),preconfirmed:true,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:second.strictThreeEvidence}:{}),ocrText:second.text||'',ocrDurationMs:second.durationMs};
    } finally {
      stopProposal?.();
      if(sessionIsCurrent())state.analysisPhase=previousPhase;
    }
  }

  // Re-localize an already accepted inline pair on the current decoded frame.
  // The original color/gray or color-pair thresholds and three votes stay intact.
  async function findInlineFallbackRecheck(searchCanvas) {
    const previous=state.lastAnalysisBest;
    if(state.streak<=0||!['inline-dual-3vote','inline-colorpair-3vote'].includes(previous?.confirmationMode))return null;
    const matcher=window.MAlertTextContourMatcher;
    if(!matcher?.analyzeTargeted)return null;
    const ids=previous.confirmationMode==='inline-colorpair-3vote'
      ? ['inline-click-94425','inline-click-88992','inline-click-88993']
      : [previous.fallbackId];
    let result=await matcher.analyzeTargeted(searchCanvas,{ids});
    result=applyMonitorRegionToContourResult(result,searchCanvas);
    const candidate=selectInlineClickFallbackCandidate(result,searchCanvas.width,searchCanvas.height);
    if(!candidate||candidate.confirmationMode!==previous.confirmationMode||candidate.id!==previous.fallbackId||
      !rectInsideSearchMonitorRegion(candidate.rect,searchCanvas)||
      !sameTargetedContourLocation(previous.rect,candidate.rect,searchCanvas.width,searchCanvas.height))return null;
    return {id:'text-contour-'+candidate.id,label:candidate.label,matched:true,score:candidate.score,
      threshold:candidate.confirmThreshold,rect:candidate.rect,requiredStreak:3,quickRecheck:true,
      confirmationMode:candidate.confirmationMode,voteIdentity:candidate.voteIdentity,fallbackId:candidate.id,
      source:'인라인 이중 윤곽 · 현재 독립 프레임 같은 위치 재검사 · 2회 확인'};
  }

  async function findStrongContourGuide(searchCanvas) {
    const matcher=window.MAlertTextContourMatcher;
    if(!matcher?.analyzeTargeted)return null;
    const ids=['78001','77983','77984','77986','77987','77988','77997','click-prompt','transparent-click-88946','transparent-shape-77982'];
    let result=await matcher.analyzeTargeted(searchCanvas,{ids});
    result=applyMonitorRegionToContourResult(result,searchCanvas);
    const candidate=selectStrongContourCandidate(result,searchCanvas.width,searchCanvas.height);
    if(!candidate||!rectInsideSearchMonitorRegion(candidate.rect,searchCanvas))return null;
    return {id:'text-contour-'+candidate.id,label:candidate.label||'거짓말 탐지기',matched:true,score:candidate.score,
      threshold:candidate.confirmThreshold,rect:candidate.rect,requiredStreak:candidate.requiredStreak,quickRecheck:true,
      ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:[strictThreeContourObservation(candidate,searchCanvas)]}:{}),
      confirmationMode:candidate.confirmationMode,source:'기존 고신뢰 글자 윤곽 조건 · 독립 프레임 반복 확인'};
  }

  // Repeat an already accepted strong contour with the original selector.
  // The current frame must retain the same template, location and vote count.
  async function findStrongContourRecheck(searchCanvas) {
    const previous=state.lastAnalysisBest,matcher=window.MAlertTextContourMatcher;
    if(state.streak<=0||!previous?.matched||!previous.quickRecheck||previous.preconfirmed||
      !String(previous.id||'').startsWith('text-contour-')||!matcher?.analyzeTargeted)return null;
    const id=String(previous.id).slice('text-contour-'.length);
    let result=await matcher.analyzeTargeted(searchCanvas,{ids:[id]});
    result=applyMonitorRegionToContourResult(result,searchCanvas);
    const current=selectStrongContourCandidate(result,searchCanvas.width,searchCanvas.height);
    if(!current||current.id!==id||current.requiredStreak!==previous.requiredStreak||
      Number(current.confirmThreshold)!==Number(previous.threshold)||
      !rectInsideSearchMonitorRegion(current.rect,searchCanvas)||
      !sameTargetedContourLocation(previous.rect,current.rect,searchCanvas.width,searchCanvas.height))return null;
    return {...previous,score:current.score,rect:current.rect,matched:true,
      ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:[strictThreeContourObservation(current,searchCanvas)]}:{}),
      source:'기존 강한 글자 윤곽 · 현재 독립 프레임 같은 위치 재검사',quickRecheck:true};
  }

  // Strong recovery templates already required three frames in the scout.
  // Let the main path inspect those same templates before unrelated full scans;
  // main and scout votes are kept separate, so one frame cannot count twice.
  async function findStrongRecoveryGuide(searchCanvas) {
    const matcher=window.MAlertTextContourMatcher;
    if(!matcher?.analyzeQuick)return null;
    const previous=state.lastAnalysisBest;
    const focused=state.streak>0&&previous?.confirmationMode==='recovery-main-3vote';
    const ids=focused?[previous.recoveryId]:['rainbow-recovery-96118','rainbow-recovery-94496','rainbow-recovery-94497','rainbow-recovery-96116','rainbow-recovery-96117'];
    const result=await matcher.analyzeQuick(searchCanvas,{ids});
    const candidate=pickRainbowScoutCandidate(result,'rainbow-recovery-');
    if(!candidate?.matched||Number(candidate.score)-Number(candidate.threshold)<RAINBOW_RECOVERY_STRONG_MARGIN||
      !rectInsideSearchMonitorRegion(candidate.rect,searchCanvas))return null;
    if(focused&&(candidate.id!==previous.recoveryId||!sameTargetedContourLocation(previous.rect,candidate.rect,searchCanvas.width,searchCanvas.height)))return null;
    return {id:'text-contour-'+candidate.id,recoveryId:candidate.id,label:'클릭형 거탐',matched:true,
      score:candidate.score,threshold:Number(candidate.threshold)+RAINBOW_RECOVERY_STRONG_MARGIN,rect:candidate.rect,
      requiredStreak:RAINBOW_RECOVERY_REQUIRED_VOTES,quickRecheck:true,confirmationMode:'recovery-main-3vote',voteIdentity:candidate.id,
      source:'가림/회전 레인보우 강일치 · 독립 프레임 2회 확인'};
  }


  async function analyzeLieDetector(captureSessionIdAtStart = state.captureSessionId, streamAtStart = state.stream, monitorRegionRevisionAtStart = state.monitorRegionRevision) {
    const sessionIsCurrent = () => isAnalysisContextCurrent(captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart);
    if (!state.model || !sessionIsCurrent()) return 0;
    setRuntime("monitoring", "안내문 윤곽·OCR 확인 중");
    const startedAt = performance.now();
    const rainbowSerialAtStart = state.rainbowDetectionSerial;
    state.analysisPhase = "contour";
    markAnalysisProgress("capture-frame");
    const searchCanvas = captureSearchCanvas();
    const contourFrameMarker = searchCanvas.auditFrameMarker || getTargetedRecheckFrameMarker();
    const contourFrameCapturedAt = performance.now();
    markAnalysisProgress("contour-start");m39ReleaseObservationNoop?.(searchCanvas,'main-capture');
    const emptyBest = {id:null,label:"없음",score:-1,threshold:1,matched:false,quickRecheck:false,grayScore:-1,edgeScore:-1,rect:null,source:"글자 윤곽/OCR 미감지"};
    let best = emptyBest, ocrResult = null, contourResult = null;
    let inlineFallbackCandidate = null;
    let ocrVisualFallbackCandidate = null;
    let textInputPromptCandidate = null;
    let strongContour = false;
    let ocrRecoveryContext = null;
    resetOcrFrameEvidence();
    try {
      // Confirm a known panel in fresh captured pixels before unrelated searches.
      // The helper still validates current geometry and every fixed text band.
      const pendingPanel=state.streak>0&&state.lastAnalysisBest?.id==='panel-guide-shape';
      const fastPanelRecheck=pendingPanel?await findPanelGuide(searchCanvas):null;
      const fastInlineRecheck=fastPanelRecheck?null:await findInlineFallbackRecheck(searchCanvas);
      const fastStrong=fastPanelRecheck||fastInlineRecheck?null:await findStrongContourRecheck(searchCanvas);
      const fastRecovery=fastPanelRecheck||fastInlineRecheck||fastStrong?null:await findStrongRecoveryGuide(searchCanvas);
      const fastClickRecheck=!fastPanelRecheck&&!fastInlineRecheck&&!fastStrong&&!fastRecovery&&state.streak>0&&['click-fixed-lines','click-large-lines'].includes(state.lastAnalysisBest?.id) ? await m36EarlyClickRecheck(searchCanvas,state.lastAnalysisBest.id==='click-large-lines',state.lastAnalysisBest.adaptiveHint) : null;
      let fastColored=fastPanelRecheck || fastInlineRecheck || fastStrong || fastRecovery || fastClickRecheck || (await findColoredInputGuide(searchCanvas)) || (await findFixedRainbowGuide(searchCanvas)) || (await findPanelGuide(searchCanvas)) || (await findSentenceGuide(searchCanvas));
      const earlyViolettaProbe={onlyStrong:true,attempted:false};
      const earlyVioletta=!fastColored?await tryFastVioletta(searchCanvas,contourFrameMarker,sessionIsCurrent,earlyViolettaProbe):null;
      const earlyTextProbe={onlyStrong:true,minimumMargin:.25,attempted:false},earlyInlineProbe={onlyStrong:true,minimumMargin:.25,attempted:false};
      const earlyKnown=!fastColored&&!earlyVioletta?((await tryFastKnownGuide(searchCanvas,contourFrameMarker,sessionIsCurrent,'text',earlyTextProbe))||(await tryFastKnownGuide(searchCanvas,contourFrameMarker,sessionIsCurrent,'inline',earlyInlineProbe))):null;
      // A blue panel is proposed by its existing frame/guide geometry. Verify
      // its fixed instructions in two fresh frames before broad glyph scans.
      // This only moves the existing path; its OCR and confirmation gates stay.
      const earlyBlue=!fastColored&&!earlyVioletta&&!earlyKnown?await tryFastBlueInput(searchCanvas,contourFrameMarker,sessionIsCurrent):null;
      earlyTextProbe.onlyStrong=false;earlyInlineProbe.onlyStrong=false;earlyViolettaProbe.onlyStrong=false;
      // One attempt per current main frame. Strong early text, violet and blue paths retain priority.
      const earlyFixedBeforeClickProbe=PREFER_FIXED_BEFORE_CLICK_SCANS_RESEARCH_ENABLED?{attempted:false,result:null}:null;
      if(earlyFixedBeforeClickProbe&&!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue){
        earlyFixedBeforeClickProbe.attempted=true;
        earlyFixedBeforeClickProbe.result=await tryFastInlineInstructions(searchCanvas,contourFrameMarker,sessionIsCurrent);
        if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
        // R4: a timed-out canvas has already lost OCR ownership. A successful
        // fresh retry remains valid; on failure, use the existing incomplete
        // failure handler before scanning that same expired canvas again.
        if(OCR_EXPIRED_SCAN_GUARD_ENABLED&&!earlyFixedBeforeClickProbe.result)assertOcrFrameNotExpired(searchCanvas);
      }
      // After the large glyph path misses, verify the existing fixed/adaptive
      // native glyph paths before unrelated OCR. Acceptance and three votes
      // remain unchanged; each later adaptive hint rechecks current pixels.
      // Try the bounded large-pose glyph path before supplementary searches; all legacy paths remain on a miss.
      const postFixedStrongAttempted=OCR_POSTFAIL_STRONG_FIRST_ENABLED&&completedFixedNonmatchFrames.has(searchCanvas)&&!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result;
      if(postFixedStrongAttempted)fastColored=await findStrongContourGuide(searchCanvas);
      if(!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result&&!LARGE_AFTER_FAST_ENABLED)fastColored=await findClickLineGuide(searchCanvas,true,null,false);
      if(!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result)fastColored=await findClickLineGuide(searchCanvas,false,null,false,false,true);
      if(!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result)fastColored=await findClickLineGuide(searchCanvas,true,null,false,true);
      if(!postFixedStrongAttempted&&!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result)fastColored=await findStrongContourGuide(searchCanvas);
      // The existing fixed-instruction attempt must already have run, so the
      // structural text path keeps its unchanged fixed-before-text prerequisite.
      // Quick glyph/strong matches above retain L priority and skip this block.
      let preLargeText=null,preLargeTextAttempted=false;
      if(TEXT_BEFORE_DEFERRED_LARGE_ENABLED&&LARGE_AFTER_FAST_ENABLED&&earlyFixedBeforeClickProbe?.attempted===true&&!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result){
        preLargeTextAttempted=true;textBeforeDeferredLargeStats.attempts++;const beforeTextAt=performance.now();
        if(M36_CURRENT_TEXT_N1_ENABLED&&m35Owned(searchCanvas)){m36ScopedTextOcrOwners.add(searchCanvas);m36ScopedTextOcrRoutes.set(searchCanvas,'main-existing-preLargeText');}
        try{preLargeText=await tryFastKnownGuide(searchCanvas,contourFrameMarker,sessionIsCurrent,'text',earlyTextProbe);if(preLargeText)textBeforeDeferredLargeStats.accepted++;else textBeforeDeferredLargeStats.nonmatches++;}
        finally{m36ScopedTextOcrOwners.delete(searchCanvas);m36ScopedTextOcrRoutes.delete(searchCanvas);textBeforeDeferredLargeStats.elapsedMs+=performance.now()-beforeTextAt;}
        if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
      }
      if(!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result&&!preLargeText&&LARGE_AFTER_FAST_ENABLED)fastColored=await findClickLineGuide(searchCanvas,true,null,false);
      if(!fastColored&&!earlyVioletta&&!earlyKnown&&!earlyBlue&&!earlyFixedBeforeClickProbe?.result&&!preLargeText)fastColored=await findClickLineGuide(searchCanvas,false,null,false);
      // This state belongs only to this analysis and its current search canvas.
      // Move the later existing invocation, never repeat it after a null result.
      const lateFixedBeforeTextProbe=PREFER_FIXED_BEFORE_STRUCTURAL_TEXT_RESEARCH_ENABLED?{attempted:Boolean(earlyFixedBeforeClickProbe?.attempted)}:null;
      if(lateFixedBeforeTextProbe){
        earlyTextProbe.beforeStructuralRecovery=async()=>{
          if(lateFixedBeforeTextProbe.attempted)return null;
          lateFixedBeforeTextProbe.attempted=true;
          return tryFastInlineInstructions(searchCanvas,contourFrameMarker,sessionIsCurrent);
        };
      }
      const fastVioletta=earlyVioletta || earlyKnown || earlyBlue || earlyFixedBeforeClickProbe?.result || preLargeText || (fastColored?null:(await tryFastKnownGuide(searchCanvas,contourFrameMarker,sessionIsCurrent,'inline',earlyInlineProbe)) || (preLargeTextAttempted?null:(await tryFastKnownGuide(searchCanvas,contourFrameMarker,sessionIsCurrent,'text',earlyTextProbe))) || (await tryFastVioletta(searchCanvas,contourFrameMarker,sessionIsCurrent,earlyViolettaProbe)) || ((earlyFixedBeforeClickProbe?.attempted||lateFixedBeforeTextProbe?.attempted)?null:(await tryFastInlineInstructions(searchCanvas,contourFrameMarker,sessionIsCurrent))));
      if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
      if(fastColored||fastVioletta){best={...emptyBest,...(fastColored||fastVioletta)};} else {
      if (window.MAlertTextContourMatcher) {
        markAnalysisProgress('full-contour-start');contourResult = await window.MAlertTextContourMatcher.analyze(searchCanvas);
        markAnalysisProgress("contour-done");
        if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
        contourResult = applyMonitorRegionToContourResult(
          contourResult,
          searchCanvas
        );
      }
      if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
      // 팝업 외형은 판정하지 않는다. 글자 윤곽이 임계값을 크게 넘는 경우에만
      // '문구 윤곽 고신뢰'로 인정하고, 그 외에는 반드시 OCR 핵심 문구를 확인한다.
      const strongCandidate = selectStrongContourCandidate(contourResult, searchCanvas.width, searchCanvas.height);
      inlineFallbackCandidate = selectInlineClickFallbackCandidate(
        contourResult,
        searchCanvas.width,
        searchCanvas.height
      );
      ocrVisualFallbackCandidate = selectOcrVisualFallbackCandidate(
        contourResult,
        searchCanvas.width,
        searchCanvas.height
      );
      textInputPromptCandidate = selectTextInputPromptCandidate(contourResult);
      const contourMargin = strongCandidate
        ? Number(strongCandidate.score || -1) - Number(strongCandidate.threshold || 1)
        : Number(contourResult?.score || -1) - Number(contourResult?.threshold || 1);
      strongContour = Boolean(strongCandidate);

      const clickLinesCandidate = !strongContour && !inlineFallbackCandidate && !ocrVisualFallbackCandidate && !textInputPromptCandidate
        ? ((await findClickLineGuide(searchCanvas,true,null,false)) || (await findClickLineGuide(searchCanvas))) : null;
      if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
      if(clickLinesCandidate){
        best={...emptyBest,...clickLinesCandidate};
      } else if (strongContour) {
        const strictThreeStrongProof=STRICT_THREE_INPUT_RESEARCH_ENABLED?[strictThreeContourObservation(strongCandidate,searchCanvas)]:null;
        const requiredStreak = Math.max(2, Number(strongCandidate.requiredStreak || 2));
        best = {...emptyBest,id:`text-contour-${strongCandidate.id}`,label:strongCandidate.label||"거짓말 탐지기",score:Number(strongCandidate.score||0),threshold:Number(strongCandidate.confirmThreshold ?? (Number(strongCandidate.threshold||1)+.04)),matched:true,quickRecheck:true,nearMatchMargin:contourMargin,rect:strongCandidate.rect||null,source:`고신뢰 글자 윤곽 · ${strongCandidate.id} · 배율 ${Number(strongCandidate.templateScale||1).toFixed(2)} · 여유 ${contourMargin.toFixed(3)}${requiredStreak>2?` · ${requiredStreak}회 확인`:""}`,requiredStreak,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:strictThreeStrongProof}:{}),ocrText:"",ocrDurationMs:Number(contourResult?.durationMs||0)};
        if (!M35_SINGLE_CONFIRMATION_ENABLED && requiredStreak === 2) {
          const targetedConfirmation = await tryTargetedContourRecheck(
            strongCandidate,
            searchCanvas,
            contourFrameMarker,
            contourFrameCapturedAt,
            sessionIsCurrent
          );
          if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
          if (targetedConfirmation?.candidate) {
            const confirmedCandidate = targetedConfirmation.candidate;
            best = {
              ...best,
              score: Number(confirmedCandidate.score || 0),
              rect: confirmedCandidate.rect || best.rect,
              source: `${best.source} · 독립 프레임 동일 템플릿 표적 재확인`,
              confirmationMode:"contour-targeted-2vote",
              preconfirmed:true,
              targetedRecheckDurationMs:Number(targetedConfirmation.durationMs || 0),
              ...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:targetedConfirmation.strictThreeEvidence}:{})
            };
          }
        }
      } else if (inlineFallbackCandidate) {
          best = {
            ...emptyBest,
            id: `text-contour-${inlineFallbackCandidate.id}`,
            label: inlineFallbackCandidate.label || "클릭형 거탐",
            score: Number(inlineFallbackCandidate.score || 0),
            threshold: Number(inlineFallbackCandidate.confirmThreshold || 1),
            matched: true,
            quickRecheck: true,
            nearMatchMargin: Number(inlineFallbackCandidate.colorMargin || 0),
            rect: inlineFallbackCandidate.rect || null,
            source: `인라인 이중 윤곽 보조 · ${inlineFallbackCandidate.id} · 컬러 여유 ${Number(inlineFallbackCandidate.colorMargin || 0).toFixed(3)} · 회색조 여유 ${Number(inlineFallbackCandidate.grayMargin || 0).toFixed(3)} · 겹침 ${Number(inlineFallbackCandidate.dualIoU || 0).toFixed(3)} · 2회 확인`,
            requiredStreak: 3,
            confirmationMode: inlineFallbackCandidate.confirmationMode || "inline-dual-3vote",
            voteIdentity: inlineFallbackCandidate.voteIdentity,
            fallbackId: inlineFallbackCandidate.id,
            ocrText: "",
            ocrDurationMs: 0
          };

      } else if (ocrVisualFallbackCandidate) {
        const requiredStreak = Math.max(3, Number(ocrVisualFallbackCandidate.requiredStreak || 3));
        const detail = ocrVisualFallbackCandidate.fallbackKind === "lie-title"
          ? `컬러 ${Number(ocrVisualFallbackCandidate.score || 0).toFixed(3)} · 회색 ${Number(ocrVisualFallbackCandidate.grayScore || 0).toFixed(3)} · 중심거리 ${Number(ocrVisualFallbackCandidate.centerDistance || 0).toFixed(3)}`
          : ocrVisualFallbackCandidate.fallbackKind === "mouse-panel"
            ? `패널 ${Number(ocrVisualFallbackCandidate.score || 0).toFixed(3)} · 제목 ${Number(ocrVisualFallbackCandidate.titleScore || 0).toFixed(3)} · 상단위치 ${Number(ocrVisualFallbackCandidate.titleRelativeY || 0).toFixed(3)}`
            : `점수 ${Number(ocrVisualFallbackCandidate.score || 0).toFixed(3)} · 여유 ${Number(ocrVisualFallbackCandidate.margin || 0).toFixed(3)}`;
        best = {...emptyBest,id:`text-contour-${ocrVisualFallbackCandidate.id}`,label:ocrVisualFallbackCandidate.label||"거짓말 탐지기",score:Number(ocrVisualFallbackCandidate.score||0),threshold:Number(ocrVisualFallbackCandidate.confirmThreshold||1),matched:true,quickRecheck:true,nearMatchMargin:Number(ocrVisualFallbackCandidate.score||0)-Number(ocrVisualFallbackCandidate.confirmThreshold||1),rect:ocrVisualFallbackCandidate.rect||null,source:`OCR 미탐 보조 시각 검증 · ${ocrVisualFallbackCandidate.id} · ${detail} · ${requiredStreak}회 확인`,requiredStreak,confirmationMode:"ocr-visual-3vote",voteIdentity:ocrVisualFallbackCandidate.voteIdentity,ocrText:"",ocrDurationMs:Number(contourResult?.durationMs||0)};
      } else {
        const m36CurrentText=M36_CURRENT_TEXT_N1_ENABLED?await m36CurrentTextBeforeGeneral(searchCanvas,contourFrameMarker,sessionIsCurrent):null;
        if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
        if(M36_CURRENT_TEXT_N1_ENABLED&&!m35Owned(searchCanvas))throw ocrSupersededError();
        if(m36CurrentText){best={...emptyBest,...m36CurrentText};}else{
        const preferredRects = collectOcrPreferredRects(contourResult, searchCanvas.width, searchCanvas.height);
        const clickLikely = candidateLooksLikeClick(contourResult);
        ocrRecoveryContext = { preferredRects, clickLikely };
        markAnalysisProgress("ocr-load");
        const ocr = await ensureOcrLoaded();
        if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
        state.analysisPhase = "ocr";
        markAnalysisProgress("ocr-start");
        if (textInputPromptCandidate) {
          state.ocrFrameEvidenceActive = true;
          state.ocrFrameEvidenceLastAt = performance.now();
          state.ocrFrameEvidence = [];
        }
        ocrResult = await budgetedOcr(ocr,searchCanvas,{
          preferredRects,
          contourCandidates: contourResult?.candidates || [],
          contourBest: contourResult || null,
          clickLikely,
          skipOcr:false
        });
        if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
        state.ocrLast = ocrResult;
        markAnalysisProgress("ocr-primary-done");
        state.ocrFrameEvidenceActive = false;

        let queuedEvidence = { evidence: [], confirmed: null };
        const freshOcrConfirmation = ocrResult?.matched ? await tryTargetedOcrRecheck(ocr,ocrResult,searchCanvas,contourResult,contourFrameMarker,sessionIsCurrent) : null;
        if(!sessionIsCurrent())return Math.round(performance.now()-startedAt);
        if (textInputPromptCandidate && state.ocrFrameEvidence.length && !ocrResult?.matched && remainingAnalysisBudgetMs()>=1200) {
          queuedEvidence = await collectQueuedOcrEvidence(
            ocr, ocrResult, searchCanvas, contourResult, preferredRects, clickLikely,
            null, getRecoveryOcrTimeoutMs(), captureSessionIdAtStart, streamAtStart, monitorRegionRevisionAtStart, getRecoveryOcrTotalBudgetMs()
          );
          if (!sessionIsCurrent() || queuedEvidence.stale) return Math.round(performance.now() - startedAt);
        } else {
          const primaryEvidence = makeOcrEvidence(ocrResult, contourResult, searchCanvas, "primary");
          if (primaryEvidence) queuedEvidence.evidence = [primaryEvidence];
        }

        if (freshOcrConfirmation) {
          best={...emptyBest,id:`ocr-confirmed-${freshOcrConfirmation.label}`,label:freshOcrConfirmation.label,score:freshOcrConfirmation.score,threshold:freshOcrConfirmation.threshold,matched:true,quickRecheck:true,rect:freshOcrConfirmation.rect,source:`독립 프레임 OCR 재확인 · ${freshOcrConfirmation.reason}`,requiredStreak:2,confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?"ocr-single-final":"ocr-targeted-2vote"),preconfirmed:true,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:freshOcrConfirmation.strictThreeEvidence}:{}),ocrText:freshOcrConfirmation.text||"",ocrDurationMs:freshOcrConfirmation.durationMs};
        } else if (queuedEvidence.confirmed) {
          const confirmedResult = queuedEvidence.confirmed[queuedEvidence.confirmed.length - 1].result;
          const detectedLabel = queuedEvidence.confirmed[0].label;
          const detectedId = detectedLabel === "비올레타형" ? "text-violetta" : detectedLabel === "클릭형 거탐" ? "text-click" : detectedLabel === "거짓말 탐지기 팝업" ? "text-popup" : "text-input-captcha";
          ocrResult = confirmedResult;
          best = {...emptyBest,id:detectedId,label:detectedLabel,score:Number(confirmedResult.score||0),threshold:Number(confirmedResult.threshold||1),matched:true,quickRecheck:true,nearMatchMargin:0,rect:confirmedResult.rect||null,source:`OCR 시간축 보강 · 독립 프레임 2표 · ${confirmedResult.reason}`,requiredStreak:2,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:queuedEvidence.strictThreeEvents}:{}),confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?"ocr-snapshot-single-final":"ocr-snapshot-2vote"),preconfirmed:true,ocrText:confirmedResult.text||confirmedResult.rawText||"",ocrDurationMs:Number(confirmedResult.durationMs||0)};
        } else if (queuedEvidence.evidence.length) {
          const evidenceItem = queuedEvidence.evidence[queuedEvidence.evidence.length - 1];
          const evidenceResult = evidenceItem.result;
          const detectedLabel = evidenceItem.label;
          const detectedId = detectedLabel === "비올레타형" ? "text-violetta" : detectedLabel === "클릭형 거탐" ? "text-click" : detectedLabel === "거짓말 탐지기 팝업" ? "text-popup" : "text-input-captcha";
          ocrResult = evidenceResult;
          best = {...emptyBest,id:detectedId,label:detectedLabel,score:Number(evidenceResult.score||0),threshold:Number(evidenceResult.threshold||1),matched:true,quickRecheck:true,nearMatchMargin:0,rect:evidenceResult.rect||null,source:`OCR 문구 확인 · ${evidenceResult.reason}`,requiredStreak:2,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:queuedEvidence.strictThreeEvents||[evidenceItem.strictThreeEvidence]}:{}),ocrText:evidenceResult.text||evidenceResult.rawText||"",ocrDurationMs:Number(evidenceResult.durationMs||0)};
        } else if (inlineFallbackCandidate) {
          best = {
            ...emptyBest,
            id: `text-contour-${inlineFallbackCandidate.id}`,
            label: inlineFallbackCandidate.label || "클릭형 거탐",
            score: Number(inlineFallbackCandidate.score || 0),
            threshold: Number(inlineFallbackCandidate.confirmThreshold || 1),
            matched: true,
            quickRecheck: true,
            nearMatchMargin: Number(inlineFallbackCandidate.colorMargin || 0),
            rect: inlineFallbackCandidate.rect || null,
            source: `인라인 이중 윤곽 보조 · ${inlineFallbackCandidate.id} · 컬러 여유 ${Number(inlineFallbackCandidate.colorMargin || 0).toFixed(3)} · 회색조 여유 ${Number(inlineFallbackCandidate.grayMargin || 0).toFixed(3)} · 겹침 ${Number(inlineFallbackCandidate.dualIoU || 0).toFixed(3)} · 2회 확인`,
            requiredStreak: 3,
            confirmationMode: inlineFallbackCandidate.confirmationMode || "inline-dual-3vote",
            voteIdentity: inlineFallbackCandidate.voteIdentity,
            fallbackId: inlineFallbackCandidate.id,
            ocrText: ocrResult.text || ocrResult.rawText || "",
            ocrDurationMs: Number(ocrResult.durationMs || 0)
          };
        } else {
          best = {...emptyBest,score:Number(ocrResult.score||-1),threshold:Number(ocrResult.threshold||1),rect:ocrResult.rect||null,source:ocrResult.reason||"OCR 핵심 문구 미확인",ocrText:ocrResult.text||ocrResult.rawText||"",ocrDurationMs:Number(ocrResult.durationMs||0)};
        }
      }
      }
      }
    } catch (error) {
      if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
      if(OCR_FRAME_YIELD_ENABLED && error?.code==='OCR_SUPERSEDED'){
        ocrFrameYieldStats.abandonedAnalyses++;
        const barrier=strictThreeObservation({matched:false},searchCanvas,'main','ocr-incomplete','barrier');
        barrier.rejection='OCR_SUPERSEDED_INCONCLUSIVE';
        // Normal finalization consumes this explicitly inconclusive barrier
        // together with every actual recheck failure journal, then applies
        // the unchanged failed-vote treatment. No obsolete visual fallback.
        best={...emptyBest,strictThreeEvidence:[barrier],source:'시간초과 OCR 중단 · 새 입력 대기 · 미판정'};
        state.ocrLast={matched:false,incomplete:true,error:error.code};
      }else{
      const timeoutSnapshots = state.ocrFrameEvidence.slice(-2);
      state.ocrFrameEvidenceActive = false;
      let timeoutRecovery = { evidence: [], confirmed: null };
      if (error?.code === "DETECTOR_TIMEOUT") {
        try {
          await window.MAlertOcr?.terminate?.();
          if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
          markAnalysisProgress("ocr-timeout-reset");
          if (textInputPromptCandidate && timeoutSnapshots.length >= (M35_SINGLE_CONFIRMATION_ENABLED?1:2) && ocrRecoveryContext && remainingAnalysisBudgetMs()>=1200) {
            const recoveryOcr = await ensureOcrLoaded();
            markAnalysisProgress("ocr-timeout-recovery");
            timeoutRecovery = await collectQueuedOcrEvidence(
              recoveryOcr,
              null,
              null,
              contourResult,
              ocrRecoveryContext.preferredRects,
              ocrRecoveryContext.clickLikely,
              timeoutSnapshots,
              getRecoveryOcrTimeoutMs(),
              captureSessionIdAtStart,
              streamAtStart,
              monitorRegionRevisionAtStart,
              getRecoveryOcrTotalBudgetMs()
            );
            if (!sessionIsCurrent() || timeoutRecovery.stale) return Math.round(performance.now() - startedAt);
          }
        } catch (recoveryError) {
          if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
          console.warn("OCR 시간초과 프레임 복구 실패:", recoveryError);
        }
      }
      if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
      if (timeoutRecovery.confirmed) {
        const confirmedResult = timeoutRecovery.confirmed[timeoutRecovery.confirmed.length - 1].result;
        const detectedLabel = timeoutRecovery.confirmed[0].label;
        const detectedId = detectedLabel === "비올레타형" ? "text-violetta" : detectedLabel === "클릭형 거탐" ? "text-click" : detectedLabel === "거짓말 탐지기 팝업" ? "text-popup" : "text-input-captcha";
        ocrResult = confirmedResult;
        state.ocrLast = confirmedResult;
        best = {...emptyBest,id:detectedId,label:detectedLabel,score:Number(confirmedResult.score||0),threshold:Number(confirmedResult.threshold||1),matched:true,quickRecheck:true,nearMatchMargin:0,rect:confirmedResult.rect||null,source:`OCR 시간초과 복구 · 초기 독립 프레임 2표 · ${confirmedResult.reason}`,requiredStreak:2,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:timeoutRecovery.strictThreeEvents}:{}),confirmationMode:(M35_SINGLE_CONFIRMATION_ENABLED?"ocr-snapshot-single-final":"ocr-snapshot-2vote"),preconfirmed:true,ocrText:confirmedResult.text||confirmedResult.rawText||"",ocrDurationMs:Number(confirmedResult.durationMs||0)};
      } else if (timeoutRecovery.evidence.length) {
        const evidenceItem = timeoutRecovery.evidence[timeoutRecovery.evidence.length - 1];
        const evidenceResult = evidenceItem.result;
        const detectedLabel = evidenceItem.label;
        const detectedId = detectedLabel === "비올레타형" ? "text-violetta" : detectedLabel === "클릭형 거탐" ? "text-click" : detectedLabel === "거짓말 탐지기 팝업" ? "text-popup" : "text-input-captcha";
        ocrResult = evidenceResult;
        state.ocrLast = evidenceResult;
        best = {...emptyBest,id:detectedId,label:detectedLabel,score:Number(evidenceResult.score||0),threshold:Number(evidenceResult.threshold||1),matched:true,quickRecheck:true,nearMatchMargin:0,rect:evidenceResult.rect||null,source:`OCR 시간초과 복구 · 초기 독립 프레임 1표 · ${evidenceResult.reason}`,requiredStreak:2,...(STRICT_THREE_INPUT_RESEARCH_ENABLED?{strictThreeEvidence:timeoutRecovery.strictThreeEvents||[evidenceItem.strictThreeEvidence]}:{}),ocrText:evidenceResult.text||evidenceResult.rawText||"",ocrDurationMs:Number(evidenceResult.durationMs||0)};
      } else {
        state.ocrLast={matched:false,error:error.message||String(error)};
        console.warn("글자 윤곽/OCR 분석 실패:",error);
      }
      if (!best.matched && inlineFallbackCandidate) {
        best = {
          ...emptyBest,
          id: `text-contour-${inlineFallbackCandidate.id}`,
          label: inlineFallbackCandidate.label || "클릭형 거탐",
          score: Number(inlineFallbackCandidate.score || 0),
          threshold: Number(inlineFallbackCandidate.confirmThreshold || 1),
          matched: true,
          quickRecheck: true,
          nearMatchMargin: Number(inlineFallbackCandidate.colorMargin || 0),
          rect: inlineFallbackCandidate.rect || null,
          source: `OCR 오류 보조 · ${inlineFallbackCandidate.id} · 컬러/회색조 동시 일치 · 2회 확인`,
          requiredStreak: 3,
          confirmationMode: inlineFallbackCandidate.confirmationMode || "inline-dual-3vote",
          voteIdentity: inlineFallbackCandidate.voteIdentity,
          fallbackId: inlineFallbackCandidate.id,
          ocrText: "",
          ocrDurationMs: Number(contourResult?.durationMs || 0)
        };
      } else if (!best.matched) {
        best={...emptyBest,source:`문구 분석 오류 · ${error.message||error}`};
      }
    }
    }
    if (!sessionIsCurrent()) return Math.round(performance.now() - startedAt);
    // OCR·보조 경로로 만들어진 후보도 감시 영역 밖이면 최종 단계에서 제외한다.
    if (best.matched && !rectInsideSearchMonitorRegion(best.rect, searchCanvas)) {
      best = { ...emptyBest, source: `감시 영역 밖 후보 제외 · ${best.source}` };
    }
    state.analysisPhase = "finalize";
    markAnalysisProgress("finalize");
    state.completedAnalyses += 1;
    if (state.rainbowDetectionSerial !== rainbowSerialAtStart) {
      return Math.round(performance.now()-startedAt);
    }
    state.lastAnalysisBest={...best,analyzedAt:new Date().toISOString(),sharedWidth:video.videoWidth,sharedHeight:video.videoHeight,analysisCount:state.completedAnalyses};
    $("#calibrationCandidate").textContent=best.id?`${best.label} · ${best.score.toFixed(3)} / ${best.threshold.toFixed(3)}`:"문구 후보 없음";
    const monitoredPixels=getMonitorRegionPixels();
    $("#calibrationMeta").textContent=`${video.videoWidth}×${video.videoHeight} · 감시 ${monitoredPixels.w}×${monitoredPixels.h} · 분석 #${state.completedAnalyses} · ${best.source}${best.ocrText?` · 읽은 문구: ${best.ocrText.slice(0,80)}`:""}`;
    state.lastCandidateRects=(ocrResult?.candidateRegions||[]).map((rect)=>mapSearchRectToVideoRect(searchCanvas,rect)).filter(Boolean); state.lastBestRect=best.rect?mapSearchRectToVideoRect(searchCanvas,best.rect):null;
    const inlineFallbackMatched = ["inline-dual-3vote","inline-colorpair-3vote"].includes(best.confirmationMode);
    $("#candidateCount").textContent=best.confirmationMode === "sentence-guide-3vote" ? "정렬 행 다섯 개 + 고정 안내문" : best.confirmationMode === "panel-guide-3vote" ? "안내창 문구 세 구간" : best.confirmationMode === "click-lines-3vote" ? "안내문 세 구간" : best.confirmationMode === "fixed-guide-pair-3vote" ? "안내문 두 구간" : best.confirmationMode === "colored-guide-3vote" ? "문자 입력 안내문" : strongContour?"고신뢰 글자 윤곽":(inlineFallbackMatched?"인라인 컬러·회색조":(ocrResult?`OCR 후보 ${ocrResult.attempts?.length||0}개`:`문구 후보 없음`));
    $("#matchScore").textContent=best.score>=0?best.score.toFixed(3):"—";
    const matched=Boolean(best.id&&best.matched===true);
    const centerX=best.rect?(Number(best.rect.x||0)+Number(best.rect.w||0)/2)/Math.max(1,searchCanvas.width):0;
    const centerY=best.rect?(Number(best.rect.y||0)+Number(best.rect.h||0)/2)/Math.max(1,searchCanvas.height):0;
    if(M35_SINGLE_CONFIRMATION_ENABLED&&matched&&!m35Owned(searchCanvas)&&!best.strictThreeEvidence?.length)
      best={...best,matched:false};
    const originalRequiredStreak = Math.max(2, Number(best.requiredStreak || 2));
    const strictThreeMainApplies=STRICT_THREE_INPUT_RESEARCH_ENABLED && (M35_SINGLE_CONFIRMATION_ENABLED || originalRequiredStreak<3);
    const requiredStreak = M35_SINGLE_CONFIRMATION_ENABLED ? 1 : (DETECTION_CONFIRM_COUNT===2 ? 2 : (strictThreeMainApplies ? 3 : originalRequiredStreak));
    const inlineFallbackMode = ["inline-dual-3vote","inline-colorpair-3vote"].includes(best.confirmationMode);
    const preconfirmedTwoVoteMode = matched && best.preconfirmed === true &&
      (best.confirmationMode === "ocr-targeted-2vote" || best.confirmationMode === "ocr-snapshot-2vote" || best.confirmationMode === "contour-targeted-2vote");
    let votes = 0;
    const strictThreeDecision=STRICT_THREE_INPUT_RESEARCH_ENABLED?strictThreeMain(best,searchCanvas):null;
    if(strictThreeMainApplies){
      votes=strictThreeDecision.votes;
      state.inlineFallbackVotes=[];state.voteWindow=[];
      const lastProof=strictThreeMainRecords.at(-1);
      // The legacy shared success marker is not advanced by a failed recheck.
      if(lastProof?.frame&&lastProof.matched===true)state.lastVoteFrameMarker={kind:lastProof.frame.kind,value:lastProof.frame.value};
      best.requiredStreak=DETECTION_CONFIRM_COUNT;
      // Preserve the matcher/recheck cache's original requiredStreak contract.
      // Only this research final gate has an effective requirement of three.
      state.lastAnalysisBest={...state.lastAnalysisBest,effectiveRequiredStreak:DETECTION_CONFIRM_COUNT,originalRequiredStreak,strictThreeProof:best.strictThreeProof};
    }else{
    if (matched && !preconfirmedTwoVoteMode && !isIndependentTargetedRecheckFrame(state.lastVoteFrameMarker,contourFrameMarker) && state.lastVoteFrameMarker) return Math.round(performance.now()-startedAt);
    if(matched)state.lastVoteFrameMarker=contourFrameMarker;
    if (preconfirmedTwoVoteMode) {
      state.inlineFallbackVotes = [];
      const locationKey = `${best.voteIdentity || best.label}:${Math.round(centerX*10)}:${Math.round(centerY*10)}`;
      state.voteWindow = [locationKey, locationKey];
      votes = requiredStreak;
    } else if (matched && inlineFallbackMode) {
      const currentVote = {
        id: String(best.fallbackId || best.id || ""),
        rect: best.rect ? {...best.rect} : null,
        frameWidth: searchCanvas.width,
        frameHeight: searchCanvas.height
      };
      const previousVote = state.inlineFallbackVotes[state.inlineFallbackVotes.length - 1];
      state.inlineFallbackVotes = previousVote && sameInlineFallbackCandidate(previousVote, currentVote)
        ? [...state.inlineFallbackVotes, currentVote].slice(-requiredStreak)
        : [currentVote];
      state.voteWindow = [];
      votes = Math.min(requiredStreak, state.inlineFallbackVotes.length);
    } else {
      state.inlineFallbackVotes = [];
      const locationKey=matched?`${best.voteIdentity || best.label}:${Math.round(centerX*10)}:${Math.round(centerY*10)}`:null;
      state.voteWindow.push(locationKey); if(state.voteWindow.length>Math.max(3,requiredStreak))state.voteWindow.shift();
      const effectiveKeys=M35_SINGLE_CONFIRMATION_ENABLED?state.voteWindow.slice(-1):(DETECTION_CONFIRM_COUNT===2?state.voteWindow.slice(-2):state.voteWindow);
      const rawVotes=matched?effectiveKeys.filter((key)=>key===locationKey).length:0;
      votes=Math.min(requiredStreak,rawVotes);
      if (LOCAL_CLICK_LOCATION_RESEARCH.enabled) {
        const locationVote=collectMainClickLocationVote(best,searchCanvas,contourFrameMarker,
          {sessionId:captureSessionIdAtStart,stream:streamAtStart,revision:monitorRegionRevisionAtStart},
          contourFrameCapturedAt,locationKey);
        if (locationVote.eligible) votes=locationVote.votes;
      }
    }
    }
    if(M35_SINGLE_CONFIRMATION_ENABLED&&matched&&votes>=requiredStreak){
      const proof=strictThreeMainRecords.at(-1);
      if(!proof?.matched||!semanticThirdScopeCurrent(proof.frame))votes=0;
      else {m35Stats.acceptedByRoute['main:'+String(best.confirmationMode||best.id||'final')]=(m35Stats.acceptedByRoute['main:'+String(best.confirmationMode||best.id||'final')]||0)+1;
        m35Stats.last={route:'main',frame:proof.frame.value,provider:proof.frame.provider,captureSequence:proof.frame.captureSequence,matched:true};
        best={...best,effectiveRequiredStreak:1,m35SingleActualInput:true,source:best.source+' · 실제 입력 1회 최종 판정'};
        state.lastAnalysisBest={...state.lastAnalysisBest,effectiveRequiredStreak:1,m35SingleActualInput:true};}
    }
    state.streak=votes;m39ReleaseObservationNoop?.(searchCanvas,'selected-main',igBest(best),{reviewOnly:true,reason:'Actual main selection, not all contributing frames'});igEmit('main',{inlineFallbackVotes:igRows(state.inlineFallbackVotes),votes,requiredStreak,matched,marker:contourFrameMarker,capturedAt:contourFrameCapturedAt,best:igBest(best),voteWindow:[...state.voteWindow],locationRows:igRows(mainClickLocationWindows.get(state.voteWindow)),common:strictThreeDecision?strictThreePublicDecision(strictThreeDecision):null});
    if(matched){
      $("#detectedType").textContent=`${best.label} · ${best.source} · ${votes}/${requiredStreak}표`; state.candidateId=best.label; state.misses=0;
      state.nextAnalysisDelayMs=votes<requiredStreak?FAST_RECHECK_INTERVAL_MS:ANALYSIS_INTERVAL_MS;
      setRuntime("monitoring",`문구 반복 확인 · ${best.label} · ${votes}/${requiredStreak}표`);
      if(votes>=requiredStreak){const now=Date.now(),cooldownMs=state.config.cooldownSeconds*1000;state.detected=true;setRuntime("detected",`${best.label} 감지`);if(alertTypeCooldownAllows(best,now,cooldownMs,'main')){state.lastAlertAt=now;cacheLastAlertSnapshot(best).catch((error)=>console.warn("알림 화면 저장 실패:",error));emitAlert(best.label,best.score);}}
    }else{
      $("#detectedType").textContent="없음";state.candidateId=null;state.misses+=1;state.nextAnalysisDelayMs=ANALYSIS_INTERVAL_MS;
      if(state.misses>=MISS_RESET_COUNT){state.detected=false;setRuntime("monitoring","글자 윤곽·OCR 분석 중");}
    }
    return Math.round(performance.now()-startedAt);
  }

  async function scanOverlayProfiles(searchCanvas) {
    const profiles = state.model.profiles.filter(
      (profile) =>
        profile.overlaySrc ||
        (
          Array.isArray(profile.overlayVariants) &&
          profile.overlayVariants.length
        )
    );
    if (!profiles.length) return null;

    const searchEdge = createEdgeCanvas(searchCanvas);
    let sourceGray = null;
    const candidates = [];

    try {
      sourceGray = canvasToGrayMat(searchEdge);

      for (const profile of profiles) {
        if (
          Array.isArray(profile.overlayVariants) &&
          profile.overlayVariants.length
        ) {
          const variantResults = [];

          for (const variant of profile.overlayVariants) {
            const template =
              await loadOverlayVariantTemplate(
                profile,
                variant
              );

            const result = await adaptiveAbsoluteScaleMatch(
              sourceGray,
              template,
              Number(variant.scaleMin || 0.55),
              Number(variant.scaleMax || 1.1)
            );

            const threshold = clampNumber(
              Number(variant.threshold || 0.5) +
                (
                  (state.config.threshold + (window.__LIE_THR_OFF || 0)) -
                  Number(
                    state.model.referenceBaseline || 0.52
                  )
                ),
              0.30,
              0.84,
              0.5
            );

            variantResults.push({
              ...result,
              name: variant.name,
              group: variant.group || variant.name,
              threshold,
              passed: result.score >= threshold
            });
          }

          const bestByGroup = new Map();

          for (const result of variantResults) {
            const current =
              bestByGroup.get(result.group);

            if (
              !current ||
              result.score - result.threshold >
                current.score - current.threshold
            ) {
              bestByGroup.set(
                result.group,
                result
              );
            }
          }

          const groupResults = [
            ...bestByGroup.values()
          ];
          const passedGroups =
            groupResults.filter(
              (result) => result.passed
            );

          const requiredGroups = Number(
            profile.variantGroupsRequired ||
            profile.variantRequired ||
            2
          );

          const rankedGroups = [
            ...groupResults
          ].sort(
            (a, b) =>
              (
                b.score - b.threshold
              ) -
              (
                a.score - a.threshold
              )
          );

          const selectedGroups = (
            passedGroups.length >= requiredGroups
              ? [...passedGroups].sort(
                  (a, b) =>
                    (
                      b.score - b.threshold
                    ) -
                    (
                      a.score - a.threshold
                    )
                )
              : rankedGroups
          ).slice(
            0,
            Math.max(requiredGroups, 1)
          );

          const combinedScore =
            selectedGroups.reduce(
              (sum, result) =>
                sum + result.score,
              0
            ) / selectedGroups.length;

          const combinedThreshold =
            selectedGroups.reduce(
              (sum, result) =>
                sum + result.threshold,
              0
            ) / selectedGroups.length;

          const topGroup = rankedGroups[0];
          const passed =
            passedGroups.length >= requiredGroups;
          const strongSingle = Boolean(
            topGroup &&
            topGroup.score >= Math.max(
              topGroup.threshold + STRONG_SINGLE_MARGIN,
              0.82
            )
          );
          const relaxedPair = Boolean(
            !passed &&
            selectedGroups.length >= requiredGroups &&
            combinedScore >= combinedThreshold - RELAXED_MATCH_MARGIN &&
            passedGroups.length >= Math.max(1, requiredGroups - 1)
          );
          const candidateMatched =
            passed ||
            strongSingle ||
            relaxedPair;
          const quickRecheck =
            candidateMatched ||
            combinedScore >= combinedThreshold - (NEAR_MATCH_MARGIN + 0.02) ||
            (
              topGroup &&
              topGroup.score >= topGroup.threshold - 0.02
            );

          const locationResult =
            passedGroups[0] ||
            rankedGroups[0];

          candidates.push({
            id: profile.id,
            label: profile.label,
            score: combinedScore,
            threshold: combinedThreshold,
            matched: candidateMatched,
            quickRecheck,
            nearMatchMargin: NEAR_MATCH_MARGIN + 0.02,
            passed,
            grayScore: -1,
            edgeScore: combinedScore,
            videoRect: locationResult?.rect
              ? mapSearchRectToVideoRect(
                  searchCanvas,
                  locationResult.rect
                )
              : null,
            source:
              strongSingle && !passed
                ? `${profile.overlayLabel || profile.label} 강한 단독 후보`
                : relaxedPair && !passed
                ? `${profile.overlayLabel || profile.label} 완화 후보`
                : `${profile.overlayLabel || profile.label} ${passedGroups.length}/${requiredGroups} 영역 일치`
          });

          continue;
        }

        const template =
          await loadOverlayTemplate(profile);

        const result =
          await adaptiveAbsoluteScaleMatch(
            sourceGray,
            template,
            Number(
              profile.overlayScaleMin || 0.2
            ),
            Number(
              profile.overlayScaleMax || 0.7
            )
          );

        const threshold = clampNumber(
          Number(
            profile.overlayThreshold || 0.36
          ) +
            (
              (state.config.threshold + (window.__LIE_THR_OFF || 0)) -
              Number(
                state.model.referenceBaseline || 0.52
              )
            ),
          0.26,
          0.82,
          0.36
        );

        const strongSingle = Boolean(
          result.score >= Math.max(
            threshold + STRONG_SINGLE_MARGIN,
            0.80
          )
        );
        const candidateMatched =
          result.score >= threshold ||
          strongSingle;
        const quickRecheck =
          candidateMatched ||
          result.score >= threshold - NEAR_MATCH_MARGIN;

        candidates.push({
          id: profile.id,
          label: profile.label,
          score: result.score,
          threshold,
          matched: candidateMatched,
          quickRecheck,
          nearMatchMargin: NEAR_MATCH_MARGIN,
          passed: result.score >= threshold,
          grayScore: -1,
          edgeScore: result.score,
          videoRect: result.rect
            ? mapSearchRectToVideoRect(
                searchCanvas,
                result.rect
              )
            : null,
          source:
            strongSingle
              ? `${profile.overlayLabel || "전체 화면 직접 탐색"} 강한 단독 후보`
              : profile.overlayLabel ||
                "전체 화면 직접 탐색"
        });
      }
    } finally {
      sourceGray?.delete();
    }

    candidates.sort((a, b) => {
      if (a.passed !== b.passed) {
        return a.passed ? -1 : 1;
      }

      const marginA =
        a.score - a.threshold;
      const marginB =
        b.score - b.threshold;

      if (marginA !== marginB) {
        return marginB - marginA;
      }

      return b.score - a.score;
    });

    return candidates[0] || null;
  }

  async function adaptiveAbsoluteScaleMatch(
    sourceGray,
    templateCanvas,
    minimumScale,
    maximumScale
  ) {
    let coarseBest = {
      score: -1,
      scale: minimumScale,
      rect: null
    };

    // 배율 오차에 매우 민감한 글자 템플릿이라,
    // 넓게 훑은 뒤 최고 배율 주변을 0.01 단위로 재검사합니다.
    let operationCount = 0;

    for (
      let scale = minimumScale;
      scale <= maximumScale + 0.001;
      scale += 0.08
    ) {
      const result = templateScoreAtScale(
        sourceGray,
        templateCanvas,
        scale
      );
      if (result.score > coarseBest.score) {
        coarseBest = {
          ...result,
          scale
        };
      }

      operationCount += 1;
      if (operationCount % 4 === 0) {
        await yieldToBrowser();
      }
    }

    let refinedBest = coarseBest;
    const refineStart = Math.max(
      minimumScale,
      coarseBest.scale - 0.055
    );
    const refineEnd = Math.min(
      maximumScale,
      coarseBest.scale + 0.055
    );

    for (
      let scale = refineStart;
      scale <= refineEnd + 0.001;
      scale += 0.02
    ) {
      const result = templateScoreAtScale(
        sourceGray,
        templateCanvas,
        scale
      );
      if (result.score > refinedBest.score) {
        refinedBest = {
          ...result,
          scale
        };
      }

      operationCount += 1;
      if (operationCount % 4 === 0) {
        await yieldToBrowser();
      }
    }

    return refinedBest;
  }

  function templateScoreAtScale(
    sourceGray,
    templateCanvas,
    scale
  ) {
    const width = Math.max(
      4,
      Math.round(templateCanvas.width * scale)
    );
    const height = Math.max(
      4,
      Math.round(templateCanvas.height * scale)
    );

    if (
      width > sourceGray.cols ||
      height > sourceGray.rows
    ) {
      return { score: -1, rect: null };
    }

    const scaled = document.createElement("canvas");
    scaled.width = width;
    scaled.height = height;
    scaled
      .getContext("2d")
      .drawImage(
        templateCanvas,
        0,
        0,
        width,
        height
      );

    return templateScoreWithLocation(
      sourceGray,
      scaled
    );
  }

  function templateScoreWithLocation(
    sourceGray,
    templateCanvas
  ) {
    const cv = window.cv;
    let template;
    let templateGray;
    let result;

    try {
      template = cv.imread(templateCanvas);

      if (
        !template.cols ||
        !template.rows ||
        sourceGray.cols < template.cols ||
        sourceGray.rows < template.rows
      ) {
        return { score: -1, rect: null };
      }

      templateGray = new cv.Mat();
      result = new cv.Mat();

      cv.cvtColor(
        template,
        templateGray,
        cv.COLOR_RGBA2GRAY
      );
      cv.matchTemplate(
        sourceGray,
        templateGray,
        result,
        cv.TM_CCOEFF_NORMED
      );

      const location = cv.minMaxLoc(result);
      const score = Number.isFinite(location.maxVal)
        ? location.maxVal
        : -1;

      return {
        score,
        rect: {
          x: location.maxLoc.x,
          y: location.maxLoc.y,
          w: templateCanvas.width,
          h: templateCanvas.height
        }
      };
    } catch (error) {
      console.warn("오버레이 템플릿 비교 실패:", error);
      return { score: -1, rect: null };
    } finally {
      template?.delete();
      templateGray?.delete();
      result?.delete();
    }
  }

  function captureSearchCanvas(captureOptions) {
    const canvas = document.createElement("canvas");
    canvas.auditFrameMarker = getTargetedRecheckFrameMarker();
    if(STRICT_THREE_INPUT_RESEARCH_ENABLED)canvas.strictThreeCapturedAt=performance.now();
    const sourceWidth = Math.max(1, video.videoWidth);
    const sourceHeight = Math.max(1, video.videoHeight);
    const mode = normalizeScreenMode(state.config.screenMode);
    const portraitScale = mode === "portrait" ? PORTRAIT_DISPLAY_SCALE : 1;

    // 가로 기준은 R10과 완전히 같은 크기/좌표로 그린다.
    // 세로 기준은 Windows 150% 확대 환경에서 게임 UI가 상대적으로 크게 캡처되는 경우를
    // 보정하기 위해 프레임 전체를 1/1.5 크기로 축소하고 중앙에 배치한다.
    const effectiveWidth = sourceWidth * portraitScale;
    const scale = Math.min(1, SEARCH_WIDTH / effectiveWidth);
    canvas.width = Math.max(1, Math.round(effectiveWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * portraitScale * scale));

    const contentWidth = Math.max(1, Math.round(sourceWidth * scale));
    const contentHeight = Math.max(1, Math.round(sourceHeight * scale));
    const contentX = Math.max(0, Math.round((canvas.width - contentWidth) / 2));
    const contentY = Math.max(0, Math.round((canvas.height - contentHeight) / 2));

    canvas.dataset.referenceScale = String(contentWidth / REFERENCE_WIDTH);
    canvas.dataset.sourceX = "0";
    canvas.dataset.sourceY = "0";
    canvas.dataset.sourceWidth = String(sourceWidth);
    canvas.dataset.sourceHeight = String(sourceHeight);
    canvas.dataset.contentX = String(contentX);
    canvas.dataset.contentY = String(contentY);
    canvas.dataset.contentWidth = String(contentWidth);
    canvas.dataset.contentHeight = String(contentHeight);
    canvas.dataset.screenMode = mode;
    canvas.dataset.displayScale = String(portraitScale);

    if(mode==='landscape' && sourceWidth>canvas.width && sourceWidth<=4096){
      const native=document.createElement('canvas');native.width=sourceWidth;native.height=sourceHeight;
      native.auditFrameMarker=canvas.auditFrameMarker;
      native.getContext('2d',{alpha:false}).drawImage(video,0,0);
      canvas.nativeSource=native;
    }
    const context = READABLE_YELLOW_TARGETED_CAPTURE_RESEARCH_ENABLED && captureOptions?.readCurrentYellowConfirmation===true
      ? canvas.getContext("2d", { alpha: false, willReadFrequently: true })
      : canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      canvas.nativeSource || video,
      0,
      0,
      sourceWidth,
      sourceHeight,
      contentX,
      contentY,
      contentWidth,
      contentHeight
    );

    if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeCapture(canvas);
    try{window.__M8_CAPTURE?.(canvas);}catch{}
    return canvas;
  }

  function mapSearchRectToVideoRect(searchCanvas, rect) {
    if (!searchCanvas || !rect) return null;
    const sourceX = Number(searchCanvas.dataset.sourceX || 0);
    const sourceY = Number(searchCanvas.dataset.sourceY || 0);
    const sourceWidth = Number(searchCanvas.dataset.sourceWidth || video.videoWidth);
    const sourceHeight = Number(searchCanvas.dataset.sourceHeight || video.videoHeight);
    const contentX = Number(searchCanvas.dataset.contentX || 0);
    const contentY = Number(searchCanvas.dataset.contentY || 0);
    const contentWidth = Number(searchCanvas.dataset.contentWidth || searchCanvas.width);
    const contentHeight = Number(searchCanvas.dataset.contentHeight || searchCanvas.height);
    if (!(contentWidth > 0) || !(contentHeight > 0)) return null;

    const rx1 = Math.max(contentX, Number(rect.x || 0));
    const ry1 = Math.max(contentY, Number(rect.y || 0));
    const rx2 = Math.min(contentX + contentWidth, Number(rect.x || 0) + Math.max(0, Number(rect.w || 0)));
    const ry2 = Math.min(contentY + contentHeight, Number(rect.y || 0) + Math.max(0, Number(rect.h || 0)));
    if (rx2 <= rx1 || ry2 <= ry1) return null;

    const scaleX = sourceWidth / contentWidth;
    const scaleY = sourceHeight / contentHeight;
    const x = sourceX + (rx1 - contentX) * scaleX;
    const y = sourceY + (ry1 - contentY) * scaleY;
    const w = (rx2 - rx1) * scaleX;
    const h = (ry2 - ry1) * scaleY;

    return {
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      w: Math.max(1, Math.round(w)),
      h: Math.max(1, Math.round(h))
    };
  }

  function captureVideoRectCanvas(videoRect) {
    const x = clampNumber(videoRect.x, 0, Math.max(0, video.videoWidth - 1), 0);
    const y = clampNumber(videoRect.y, 0, Math.max(0, video.videoHeight - 1), 0);
    const w = clampNumber(videoRect.w, 1, video.videoWidth - x, 1);
    const h = clampNumber(videoRect.h, 1, video.videoHeight - y, 1);
    if (!w || !h) return null;

    const scale = Math.min(1, CANDIDATE_MAX_WIDTH / w);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.dataset.referenceScale = String(canvas.width / REFERENCE_WIDTH);
    canvas.getContext("2d", { alpha: false }).drawImage(video, x, y, w, h, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function createEdgeCanvas(sourceCanvas) {
    const cv = window.cv;
    let source;
    let gray;
    let blurred;
    let edges;
    let dilated;
    let kernel;

    try {
      source = cv.imread(sourceCanvas);
      gray = new cv.Mat();
      blurred = new cv.Mat();
      edges = new cv.Mat();
      dilated = new cv.Mat();
      kernel = cv.Mat.ones(2, 2, cv.CV_8U);
      cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
      cv.Canny(blurred, edges, 60, 150);
      cv.dilate(edges, dilated, kernel);

      const target = document.createElement("canvas");
      target.width = sourceCanvas.width;
      target.height = sourceCanvas.height;
      target.dataset.referenceScale = sourceCanvas.dataset.referenceScale || "1";
      cv.imshow(target, dilated);
      return target;
    } finally {
      source?.delete();
      gray?.delete();
      blurred?.delete();
      edges?.delete();
      dilated?.delete();
      kernel?.delete();
    }
  }

  function canvasToGrayMat(canvas) {
    const cv = window.cv;
    let source;
    const gray = new cv.Mat();
    try {
      source = cv.imread(canvas);
      cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
      return gray;
    } catch (error) {
      gray.delete();
      throw error;
    } finally {
      source?.delete();
    }
  }

  function multiScaleScore(searchCanvas, originalTemplate, sourceGray, offsets) {
    const referenceScale = Number(searchCanvas.dataset.referenceScale || 1);
    let best = -1;

    for (const offset of offsets) {
      const scale = referenceScale * offset;
      const width = Math.max(4, Math.round(originalTemplate.width * scale));
      const height = Math.max(4, Math.round(originalTemplate.height * scale));
      if (width > searchCanvas.width || height > searchCanvas.height) continue;

      const scaled = document.createElement("canvas");
      scaled.width = width;
      scaled.height = height;
      scaled.getContext("2d").drawImage(originalTemplate, 0, 0, width, height);
      best = Math.max(best, templateScore(sourceGray, scaled));
    }

    return best;
  }

  function templateScore(sourceGray, templateCanvas) {
    const cv = window.cv;
    let template;
    let templateGray;
    let result;
    try {
      template = cv.imread(templateCanvas);
      if (!template.cols || !template.rows || sourceGray.cols < template.cols || sourceGray.rows < template.rows) {
        return -1;
      }
      templateGray = new cv.Mat();
      result = new cv.Mat();
      cv.cvtColor(template, templateGray, cv.COLOR_RGBA2GRAY);
      cv.matchTemplate(sourceGray, templateGray, result, cv.TM_CCOEFF_NORMED);
      const value = cv.minMaxLoc(result).maxVal;
      return Number.isFinite(value) ? value : -1;
    } catch (error) {
      console.warn("템플릿 비교 실패:", error);
      return -1;
    } finally {
      template?.delete();
      templateGray?.delete();
      result?.delete();
    }
  }

  async function loadTemplate(profile) {
    if (state.templates.has(profile.id)) return state.templates.get(profile.id);
    const image = await loadImage(profile.src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    state.templates.set(profile.id, canvas);
    return canvas;
  }

  async function loadEdgeTemplate(profile) {
    if (state.edgeTemplates.has(profile.id)) return state.edgeTemplates.get(profile.id);
    const template = await loadTemplate(profile);
    const edge = createEdgeCanvas(template);
    state.edgeTemplates.set(profile.id, edge);
    return edge;
  }

  async function loadOverlayTemplate(profile) {
    if (state.overlayTemplates.has(profile.id)) {
      return state.overlayTemplates.get(profile.id);
    }

    const image = await loadImage(profile.overlaySrc);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas
      .getContext("2d")
      .drawImage(image, 0, 0);

    state.overlayTemplates.set(profile.id, canvas);
    return canvas;
  }

  async function loadOverlayVariantTemplate(
    profile,
    variant
  ) {
    const cacheKey =
      `${profile.id}:variant:${variant.name}`;

    if (state.overlayTemplates.has(cacheKey)) {
      return state.overlayTemplates.get(cacheKey);
    }

    const image = await loadImage(variant.src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas
      .getContext("2d")
      .drawImage(image, 0, 0);

    state.overlayTemplates.set(cacheKey, canvas);
    return canvas;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
      image.src = src;
    });
  }


  function startShareHealthMonitor(track) {
    stopShareHealthMonitor();
    state.shareHealthTrack = track || null;
    state.shareHealthStartedAt = performance.now();
    state.shareHealthLastFrameAt = performance.now();
    state.shareHealthLastCurrentTime = Number.isFinite(video.currentTime)
      ? video.currentTime
      : -1;
    state.shareHealthLastFrameCount = getPresentedFrameCount();
    state.shareHealthMutedAt = track?.muted ? performance.now() : 0;
    state.shareHealthBlackSamples = 0;
    state.shareHealthIssue = null;
    if (!state.lastAnalysisProgressAt) state.lastAnalysisProgressAt = performance.now();
    state.shareHealthLowResolution =
      video.videoWidth < 1280 || video.videoHeight < 720;

    setShareHealthUi(
      "checking",
      "화면공유 상태 점검 중",
      `${video.videoWidth}×${video.videoHeight} 프레임과 분석 흐름을 확인하고 있습니다.`,
      "점검 중"
    );

    if (track) {
      track.addEventListener("ended", handleShareTrackEnded, { once: true });
      track.addEventListener("mute", handleShareTrackMuted);
      track.addEventListener("unmute", handleShareTrackUnmuted);
    }

    scheduleShareVideoFrameHeartbeat();
    checkShareHealth();
    state.shareHealthTimer = window.setInterval(
      checkShareHealth,
      SHARE_HEALTH_CHECK_INTERVAL_MS
    );
  }

  function stopShareHealthMonitor() {
    if (state.shareHealthTimer) {
      clearInterval(state.shareHealthTimer);
      state.shareHealthTimer = null;
    }
    if (
      state.shareHealthFrameRequest !== null &&
      typeof video.cancelVideoFrameCallback === "function"
    ) {
      try {
        video.cancelVideoFrameCallback(state.shareHealthFrameRequest);
      } catch {
        // 이미 종료된 콜백은 무시합니다.
      }
    }
    const track = state.shareHealthTrack;
    if (track) {
      track.removeEventListener("ended", handleShareTrackEnded);
      track.removeEventListener("mute", handleShareTrackMuted);
      track.removeEventListener("unmute", handleShareTrackUnmuted);
    }
    state.shareHealthFrameRequest = null;
    state.shareHealthTrack = null;
    state.shareHealthMutedAt = 0;
    state.shareHealthBlackSamples = 0;
  }

  function scheduleShareVideoFrameHeartbeat() {
    if (
      !state.stream ||
      typeof video.requestVideoFrameCallback !== "function"
    ) {
      return;
    }
    state.shareHealthFrameRequest = video.requestVideoFrameCallback(
      (now) => {
        state.shareHealthLastFrameAt = now;
        scheduleShareVideoFrameHeartbeat();
      }
    );
  }

  function handleShareTrackEnded() {
    if (!state.stream) return;
    reportShareHealthIssue(
      "ended",
      "화면공유가 종료되었습니다",
      "Chrome 공유가 끊겼습니다. 메이플 창을 다시 선택해 주세요.",
      { level: "danger", audible: true }
    );
    stopCapture({ preserveHealth: true });
  }

  function handleShareTrackMuted() {
    state.shareHealthMutedAt = performance.now();
  }

  function handleShareTrackUnmuted() {
    state.shareHealthMutedAt = 0;
    state.shareHealthLastFrameAt = performance.now();
    state.shareHealthBlackSamples = 0;
  }

  function getPresentedFrameCount() {
    try {
      const quality = video.getVideoPlaybackQuality?.();
      if (Number.isFinite(quality?.totalVideoFrames)) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeMarkerProvider="playback-quality";
        return quality.totalVideoFrames;
      }
      if (Number.isFinite(video.webkitDecodedFrameCount)) {
        if(STRICT_THREE_INPUT_RESEARCH_ENABLED)strictThreeMarkerProvider="webkit-decoded";
        return video.webkitDecodedFrameCount;
      }
    } catch {
      // 브라우저별 미지원 값은 현재 시간으로 보완합니다.
    }
    return -1;
  }

  function refreshShareFrameProgress(now) {
    const currentTime = Number(video.currentTime);
    const frameCount = getPresentedFrameCount();
    const timeMoved =
      Number.isFinite(currentTime) &&
      currentTime > state.shareHealthLastCurrentTime + 0.001;
    const frameMoved =
      frameCount >= 0 &&
      frameCount > state.shareHealthLastFrameCount;

    // P4-R6: 프레임 카운터 지원 브라우저에서는 실제 presented frame 증가만 fresh 근거로 사용한다.
    // MediaStream video.currentTime은 새 프레임이 없어도 진행할 수 있으므로 frameCount 지원 시 fallback으로 쓰지 않는다.
    const hasFrameCount = frameCount >= 0;
    if (frameMoved || (!hasFrameCount && timeMoved)) {
      state.shareHealthLastFrameAt = now;
    }
    if (Number.isFinite(currentTime)) {
      state.shareHealthLastCurrentTime = currentTime;
    }
    if (frameCount >= 0) {
      state.shareHealthLastFrameCount = frameCount;
    }
  }

  function isNearlyBlackShareFrame() {
    if (
      !shareHealthContext ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return false;
    }

    try {
      shareHealthContext.drawImage(
        video,
        0,
        0,
        shareHealthCanvas.width,
        shareHealthCanvas.height
      );
      const pixels = shareHealthContext.getImageData(
        0,
        0,
        shareHealthCanvas.width,
        shareHealthCanvas.height
      ).data;
      let lumaTotal = 0;
      let darkPixels = 0;
      let maxLuma = 0;
      const count = pixels.length / 4;

      for (let index = 0; index < pixels.length; index += 4) {
        const luma =
          pixels[index] * 0.2126 +
          pixels[index + 1] * 0.7152 +
          pixels[index + 2] * 0.0722;
        lumaTotal += luma;
        maxLuma = Math.max(maxLuma, luma);
        if (luma < 10) darkPixels += 1;
      }

      return (
        lumaTotal / count < 4 &&
        darkPixels / count >= 0.995 &&
        maxLuma < 18
      );
    } catch (error) {
      console.warn("화면공유 밝기 점검 실패:", error);
      return false;
    }
  }

  function checkShareHealth() {
    if (!state.stream) return;
    const now = performance.now();
    const track = state.shareHealthTrack || state.stream.getVideoTracks()[0];

    if (!track || track.readyState === "ended") {
      handleShareTrackEnded();
      return;
    }

    if (video.videoWidth && video.videoHeight && previewCanvas.dataset.sourceSize !== `${video.videoWidth}×${video.videoHeight}`) resizePreview();
    refreshShareFrameProgress(now);

    if (track.muted) {
      if (!state.shareHealthMutedAt) state.shareHealthMutedAt = now;
      if (now - state.shareHealthMutedAt >= SHARE_TRACK_MUTE_WARNING_MS) {
        reportShareHealthIssue(
          "muted",
          "공유 영상이 일시 중단되었습니다",
          "게임 창 최소화·절전·화면공유 상태를 확인해 주세요.",
          { level: "danger", audible: true }
        );
        return;
      }
    } else {
      state.shareHealthMutedAt = 0;
    }

    if (
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      if (now - state.shareHealthStartedAt >= SHARE_FRAME_STALL_WARNING_MS) {
        reportShareHealthIssue(
          "no-frame",
          "공유 프레임을 받을 수 없습니다",
          "공유 창을 종료한 뒤 메이플 창을 다시 선택해 주세요.",
          { level: "danger", audible: true }
        );
      }
      return;
    }

    if (isNearlyBlackShareFrame()) {
      state.shareHealthBlackSamples += 1;
    } else {
      state.shareHealthBlackSamples = 0;
    }

    if (state.shareHealthBlackSamples >= SHARE_BLACK_CONFIRMATIONS) {
      reportShareHealthIssue(
        "black-screen",
        "공유 화면이 검게 표시되고 있습니다",
        "메이플 창 최소화 또는 그래픽 가속 문제인지 확인해 주세요.",
        { level: "warning", audible: true }
      );
      return;
    }

    // 프레임 heartbeat 지연만으로 공유 끊김을 단정하지 않는다.
    // track이 live·unmuted이고 video 데이터가 있으면 감시를 유지하며 소프트 상태만 표시한다.
    // P4-R5: 분석 활동은 frame freshness의 대체 증거가 아니다.
    if (now - state.shareHealthLastFrameAt >= SHARE_FRAME_STALL_WARNING_MS) {
      reportShareHealthIssue(
        "frame-stalled",
        "공유 화면 프레임이 멈춘 것으로 보입니다",
        "15초 이상 새 공유 프레임 진행이 확인되지 않았습니다. 메이플 창 공유 상태를 확인해 주세요.",
        { level: "danger", audible: true }
      );
      return;
    }

    if (
      !state.paused &&
      state.cvReady &&
      state.model &&
      now - state.shareHealthStartedAt >= SHARE_ANALYSIS_STALL_WARNING_MS
    ) {
      // 총 분석 시간이 아니라 마지막 실제 진행 시각을 기준으로 정지 여부를 판단한다.
      const progressAt = Number(state.lastAnalysisProgressAt || 0);
      const analysisStalled = state.analysisBusy
        ? progressAt > 0 && now - progressAt >= SHARE_ANALYSIS_STALL_WARNING_MS
        : state.lastAnalysisCompletedAt > 0 &&
          now - state.lastAnalysisCompletedAt >= SHARE_ANALYSIS_STALL_WARNING_MS;

      if (analysisStalled) {
        const phase = state.analysisBusy ? ` · 단계 ${state.analysisProgressPhase || state.analysisPhase || "unknown"}` : "";
        reportShareHealthIssue(
          "analysis-stalled",
          "화면 분석 진행이 지연되고 있습니다",
          `화면공유는 연결되어 있지만 분석 진행이 오래 확인되지 않습니다${phase}. 감시는 자동 복구를 시도합니다.`,
          { level: "warning", audible: false }
        );
        return;
      }
    }

    // OPT11: connection health must not imply that a 5-second analysis target is met.
    const elapsedAnalysis = state.analysisBusy && state.analysisStartedAt > 0
      ? now - state.analysisStartedAt : state.lastAnalysisDurationMs;
    if (!state.paused && state.cvReady && state.model && elapsedAnalysis >= 5000) {
      reportShareHealthIssue("analysis-slow", "화면공유 연결됨 · 분석 지연",
        (state.analysisBusy ? "현재 분석 " : "직전 분석 ") + (elapsedAnalysis/1000).toFixed(1) + "초 · 감지 결과가 늦어질 수 있습니다.",
        {level:"warning",audible:false});
      return;
    }
    state.shareHealthLowResolution =
      video.videoWidth < 1280 || video.videoHeight < 720;

    if (state.shareHealthLowResolution) {
      reportShareHealthIssue(
        "low-resolution",
        "공유 해상도가 낮습니다",
        `${video.videoWidth}×${video.videoHeight} · 1280×720 이상을 권장합니다.`,
        { level: "warning", audible: false }
      );
      return;
    }

    setShareHealthHealthy();
  }

  function setShareHealthHealthy() {
    const previous = state.shareHealthIssue;
    state.shareHealthIssue = null;
    setShareHealthUi(
      "healthy",
      "화면공유 정상",
      `${video.videoWidth}×${video.videoHeight} · 프레임과 분석 흐름이 정상입니다.`,
      "정상"
    );
    if (previous && previous !== "low-resolution") {
      addLog("화면 공유 복구", "공유 화면과 분석 흐름이 정상으로 돌아왔습니다.");
    }
    if (state.paused) {
      setStatusChip($("#captureStatus"), "paused", "감지 일시정지");
    } else {
      setStatusChip($("#captureStatus"), "live", "메이플 창 공유 중");
    }
  }

  function reportShareHealthIssue(
    code,
    title,
    body,
    { level = "warning", audible = false } = {}
  ) {
    const changed = state.shareHealthIssue !== code;
    const analysisIssue = code === "analysis-stalled" || code === "analysis-slow";
    state.shareHealthIssue = code;
    setShareHealthUi(
      level,
      title,
      body,
      level === "danger" ? "이상 감지" : analysisIssue ? "분석 지연" : "확인 필요"
    );
    setStatusChip(
      $("#captureStatus"),
      level === "danger" ? "paused" : "idle",
      level === "danger" ? "화면공유 이상" : analysisIssue ? "분석 지연" : "공유 상태 확인"
    );

    if (changed) {
      addLog(analysisIssue ? "분석 상태" : "화면 공유 이상", `${title} · ${body}`);
    }

    const now = Date.now();
    if (
      audible &&
      changed &&
      now - state.shareHealthLastAlertAt >= SHARE_HEALTH_ALERT_COOLDOWN_MS
    ) {
      state.shareHealthLastAlertAt = now;
      if (!state.detected && now - state.lastAlertAt >= 5000) {
        speak("화면 공유 상태를 확인하세요.");
      }
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("M-ALERT 화면공유 확인", {
          body: `${title}. ${body}`,
          icon: "./favicon.svg",
          tag: `m-alert-share-health-${code}`
        });
      }
    }
  }

  function setShareHealthUi(level, title, body, badge) {
    const panel = $("#shareHealthPanel");
    if (!panel) return;
    panel.className = `share-health-panel ${level}`;
    $("#shareHealthTitle").textContent = title;
    $("#shareHealthBody").textContent = body;
    $("#shareHealthBadge").textContent = badge;
  }

  function emitAlert(typeLabel, score) {igEmit('alert',{typeLabel,score,streak:state.streak,best:igBest(state.lastAnalysisBest),serial:state.rainbowDetectionSerial,common:window.MAlertStrictThreeResearch?.lastDecision?.()});
    recordActualAlertType(typeLabel);
    const text = state.config.voiceText;
    speak(text);

    $("#urgentTitle").textContent = "거짓말탐지기가 발견되었습니다.";
    $("#urgentBody").textContent = `${typeLabel} 후보를 감지했습니다. 현재 화면을 확인하세요.`;
    $("#urgentOverlay").hidden = false;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("거짓말탐지기 감지", {
        body: `${typeLabel} 후보를 감지했습니다. 화면을 확인하세요.`,
        icon: "./favicon.svg",
        tag: "m-alert-lie-detector"
      });
    }

    const time = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    $("#lastAlert").textContent = time;
    const safeScore = Number.isFinite(score) && score >= 0 ? score.toFixed(3) : "—";
    addLog("거탐 감지", `${typeLabel} · 판정 점수 ${safeScore}`);
  }

  function speak(text) {
    const message = String(text || "").trim();
    if (!message || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    try {
      if (window.MAlertAudio) {
        window.MAlertAudio.request(message, { priority: 100, key: 'detector', volume: state.config.volume, rate: state.config.rate, voice: selectVoice() });
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "ko-KR";
      utterance.volume = state.config.volume;
      utterance.rate = state.config.rate;
      utterance.pitch = 1;
      const voice = selectVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("음성 재생 실패:", error);
    }
  }

  function unlockSpeech() {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  }

  function populateVoiceSelect() {
    const select = $("#voiceSelect");
    if (!select || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const korean = voices.filter((voice) => String(voice.lang || "").toLowerCase().startsWith("ko"));
    const candidates = korean.length ? korean : voices;
    select.innerHTML = '<option value="">기본 한국어 음성</option>';
    for (const voice of candidates) {
      const option = document.createElement("option");
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      option.selected = voice.voiceURI === state.config.voiceURI;
      select.appendChild(option);
    }
  }

  function selectVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    if (state.config.voiceURI) {
      const selected = voices.find((voice) => voice.voiceURI === state.config.voiceURI);
      if (selected && /^ko(?:-|_|$)/i.test(String(selected.lang || ""))) return selected;
    }
    return voices.find((voice) => String(voice.lang || "").toLowerCase() === "ko-kr") ||
      voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith("ko")) ||
      null;
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      alert("현재 브라우저는 시스템 알림을 지원하지 않습니다.");
      return;
    }
    const permission = await Notification.requestPermission();
    addLog("시스템 알림", permission === "granted" ? "시스템 알림이 허용되었습니다." : "시스템 알림 권한이 허용되지 않았습니다.");
  }

  function setRuntime(className, text) {
    const badge = $("#runtimeBadge");
    badge.className = `runtime-badge ${className}`;
    badge.textContent = text;
  }

  function updateUi() {
    const active = Boolean(state.stream);
    $("#startCaptureBtn").disabled = active;
    $("#startCaptureBtn").textContent = active ? "메이플 창 공유 중" : "메이플 창 선택하기";
    $("#pauseBtn").disabled = !active;
    $("#stopCaptureBtn").disabled = !active;
    $("#runAnalysisBtn").disabled =
      !active;
    $("#selectRegionBtn").disabled =
      !active ||
      state.regionSelecting;
    $("#resetRegionBtn").disabled =
      !active ||
      isFullMonitorRegion();
    $("#saveCurrentSampleBtn").disabled =
      !active;
    $("#saveFalsePositiveBtn").disabled =
      !active;
    $("#saveLastAlertBtn").disabled =
      !active ||
      !state.lastAlertSnapshot;

    $("#pauseBtn").textContent =
      state.paused
        ? "감지 다시 시작"
        : "감지 일시정지";

    updateRegionStatus();

    if (!active) setRuntime("waiting", "대기");
    else if (state.paused) setRuntime("paused", "일시정지");
    else if (state.detected) setRuntime("detected", "거탐 감지됨");
    else setRuntime("monitoring", "감시 중");
  }

  function resetDetection(options = {}) {
    if(STRICT_THREE_INPUT_RESEARCH_ENABLED){strictThreeMainRecords=[];strictThreeLastDecision=null;}
    resetPriorityColorScout();
    state.largeGuideEvidence=[];
    state.lastVoteFrameMarker=null;
    const preserveAsyncBusy = Boolean(options && options.preserveAsyncBusy === true);
    state.streak = 0;
    state.voteWindow = [];
    state.inlineFallbackVotes = [];
    state.misses = 0;
    state.candidateId = null;
    state.detected = false;
    state.nextAnalysisDelayMs = ANALYSIS_INTERVAL_MS;
    if (!preserveAsyncBusy) state.rainbowScoutBusy = false;
    state.rainbowScoutScans = 0;
    state.consecutiveScoutStarts = 0;
    state.busySchedulerSkips = 0;
    state.rainbowLastScoutDurationMs = 0;
    state.rainbowLastRecoveryDurationMs = 0;
    state.lastRainbowScoutAt = 0;
    state.lastRainbowRecoveryScoutAt = -RAINBOW_RECOVERY_SCOUT_INTERVAL_MS;
    state.rainbowScoutDelayMs = RAINBOW_SCOUT_INTERVAL_MS;
    state.rainbowFocusUntil = 0;
    state.rainbowEvidence = [];
    state.rainbowLastCandidate = null;
    state.rainbowRecoveryEvidence = [];
    if (!preserveAsyncBusy) state.rainbowRecoveryOcrBusy = false;
    state.rainbowRecoveryLastOcrAt = 0;
    state.rainbowDetectionSerial = 0;
    resetOcrFrameEvidence();
    state.analysisPhase = "idle";
    state.analysisProgressPhase = "idle";
    state.pendingLatestAnalysis = false;
    state.lastCandidateRects = [];
    state.lastBestRect = null;
    $("#detectedType").textContent = "없음";
    $("#matchScore").textContent = "—";
  }

  function addLog(title, body) {
    const log = $("#eventLog");
    log.querySelector(".empty-log")?.remove();
    const entry = document.createElement("div");
    entry.className = "log-entry";
    const heading = document.createElement("strong");
    heading.textContent = `${new Date().toLocaleTimeString("ko-KR", { hour12: false })} · ${title}`;
    const detail = document.createElement("span");
    detail.textContent = body;
    entry.append(heading, detail);
    log.prepend(entry);
    while (log.children.length > 30) log.lastElementChild?.remove();
  }

  function setStatusChip(element, className, text) {
    element.className = `status-chip ${className}`;
    element.textContent = text;
  }

  function loadConfig() {
    try {
      let parsed = JSON.parse(
        localStorage.getItem(
          CONFIG_KEY
        ) || "null"
      );

      if (!parsed) {
        for (const legacyKey of LEGACY_CONFIG_KEYS) {
          const legacyValue = localStorage.getItem(legacyKey);
          if (!legacyValue) continue;

          try {
            const legacyConfig = JSON.parse(legacyValue);
            parsed = {
              ...legacyConfig,
              threshold: DEFAULT_CONFIG.threshold
            };
            localStorage.setItem(CONFIG_KEY, JSON.stringify(parsed));
            break;
          } catch {
            // Ignore malformed legacy settings and continue with defaults.
          }
        }
      }

      const merged = {
        ...DEFAULT_CONFIG,
        ...(parsed || {})
      };

      // 이전 기본 안내 문구만 갱신하고 사용자가 지정한 문구는 유지한다.
      if (merged.voiceText === "거짓말탐지기가 발견되었습니다. 화면을 확인하세요.") {
        merged.voiceText = DEFAULT_CONFIG.voiceText;
      }

      // 사용자 민감도 조절 UI를 제거했으므로 이전에 저장된 값과 관계없이
      // 회귀 검증된 기준값을 항상 사용한다.
      merged.threshold = DEFAULT_CONFIG.threshold;
      // 화면 기준은 사이트 진입 시 항상 가로 기준으로 시작한다.
      // 이전 세션에서 저장된 세로 선택값은 시작 기본값으로 복원하지 않는다.
      merged.screenMode = "landscape";

      merged.monitorRegion =
        normalizeStoredMonitorRegion(
          parsed?.monitorRegion
        );

      return merged;
    } catch {
      return {
        ...DEFAULT_CONFIG,
        monitorRegion: {
          ...DEFAULT_CONFIG.monitorRegion
        }
      };
    }
  }

  function normalizeStoredMonitorRegion(
    region
  ) {
    if (
      !region ||
      typeof region !== "object"
    ) {
      return {
        ...DEFAULT_CONFIG.monitorRegion
      };
    }

    const x = Math.min(
      0.98,
      Math.max(
        0,
        Number(region.x) || 0
      )
    );

    const y = Math.min(
      0.98,
      Math.max(
        0,
        Number(region.y) || 0
      )
    );

    const w = Math.min(
      1 - x,
      Math.max(
        0.02,
        Number(region.w) ||
        1 - x
      )
    );

    const h = Math.min(
      1 - y,
      Math.max(
        0.02,
        Number(region.h) ||
        1 - y
      )
    );

    return {
      x,
      y,
      w,
      h
    };
  }

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(state.config));
  }

  function delay(milliseconds) {
    return new Promise(
      (resolve) =>
        setTimeout(resolve, milliseconds)
    );
  }

  function yieldToBrowser() {
    return new Promise((resolve) => {
      if (
        typeof scheduler !== "undefined" &&
        typeof scheduler.yield === "function"
      ) {
        scheduler.yield().then(resolve);
        return;
      }

      setTimeout(resolve, 0);
    });
  }

  function clampNumber(value, minimum, maximum, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(maximum, Math.max(minimum, number));
  }

  function expandRect(rect, maxWidth, maxHeight, padding) {
    const x = Math.max(0, rect.x - padding);
    const y = Math.max(0, rect.y - padding);
    const right = Math.min(maxWidth, rect.x + rect.width + padding);
    const bottom = Math.min(maxHeight, rect.y + rect.height + padding);
    return { x, y, w: right - x, h: bottom - y };
  }

  function rectIoU(a, b) {
    const left = Math.max(a.x, b.x);
    const top = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.w, b.x + b.w);
    const bottom = Math.min(a.y + a.h, b.y + b.h);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    const intersection = width * height;
    if (!intersection) return 0;
    const union = a.w * a.h + b.w * b.h - intersection;
    return union ? intersection / union : 0;
  }

  function dedupeRects(rects, threshold) {
    const kept = [];
    for (const rect of rects) {
      if (!kept.some((saved) => rectIoU(saved, rect) >= threshold)) kept.push(rect);
    }
    return kept;
  }


})();


