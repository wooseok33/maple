(() => {
  "use strict";
  const M400_POSE_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'))&&window.__M400_CLICK_POSE_EXT===true;
  const M400_NARROW_ENABLED=M400_POSE_ENABLED&&window.__M400_CLICK_NARROW_EXT===true;
  const TEXT_CURRENT_RASTER_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_TEXT_CURRENT_RASTER_EXPERIMENT===true;
  const textCurrentRasterIds=new Set(['text-input-prompt-94463','text-input-prompt-94465','text-input-prompt-99116']);
  const textCurrentRasterStats={attempts:0,copies:0,failures:0,totalWallMs:0,failureStages:{},rows:[],rowsDropped:0};
  function textCurrentRasterEligible(source,group,templates) {
    return Boolean(TEXT_CURRENT_RASTER_ENABLED&&source instanceof HTMLCanvasElement&&
      group?.mode==='hybrid'&&group.analysisWidth===320&&group.indices?.length>0&&
      group.indices.every(index=>textCurrentRasterIds.has(String(templates[index]?.id||''))));
  }
  function extractTextCurrentRaster(source,group,templates) {
    if(!textCurrentRasterEligible(source,group,templates))return null;
    const start=performance.now();textCurrentRasterStats.attempts++;
    let stage='source-read',copied=false,error=null;
    try {
      const sourceContext=source.getContext('2d');
      if(!sourceContext)throw Error('Source 2d context unavailable');
      const pixels=sourceContext.getImageData(0,0,source.width,source.height);
      stage='copy-create';
      const copy=document.createElement('canvas');copy.width=source.width;copy.height=source.height;
      const context=copy.getContext('2d',{alpha:false,willReadFrequently:true});
      if(!context)throw Error('Copy 2d context unavailable');
      stage='copy-put';context.putImageData(pixels,0,0);copied=true;textCurrentRasterStats.copies++;
      stage='features';
      // Temporary feature-only surface. Native verification/candidate coordinates
      // continue to use original source. No dataset/marker/owner is assigned.
      return extractModeFeatures(copy,320,'hybrid');
    }catch(e){
      error=String(e?.message||e).slice(0,160);textCurrentRasterStats.failures++;
      textCurrentRasterStats.failureStages[stage]=(textCurrentRasterStats.failureStages[stage]||0)+1;
      return null;
    }finally{
      const elapsedWallMs=performance.now()-start;textCurrentRasterStats.totalWallMs+=elapsedWallMs;
      if(textCurrentRasterStats.rows.length<8)textCurrentRasterStats.rows.push({width:source.width,height:source.height,
        mode:group.mode,analysisWidth:group.analysisWidth,templateIds:group.indices.map(i=>String(templates[i]?.id||'')),
        copied,stage,error,elapsedWallMs,sourcePreserved:true,temporaryFeatureOnly:true});
      else textCurrentRasterStats.rowsDropped++;
    }
  }
  window.MAlertTextCurrentRasterResearch=Object.freeze({enabled:()=>TEXT_CURRENT_RASTER_ENABLED,status:()=>({enabled:TEXT_CURRENT_RASTER_ENABLED,
    attempts:textCurrentRasterStats.attempts,copies:textCurrentRasterStats.copies,failures:textCurrentRasterStats.failures,
    totalWallMs:textCurrentRasterStats.totalWallMs,failureStages:{...textCurrentRasterStats.failureStages},rowsDropped:textCurrentRasterStats.rowsDropped,
    rows:textCurrentRasterStats.rows.map(r=>({...r,templateIds:[...r.templateIds]})),
    scope:'Current search-canvas hybrid320 group exclusively consisting of the three existing text IDs; original source/native/reference preparation unchanged',
    contextHintOnly:true,runtimeHashes:false,operatingVotesChanged:false})});
  // OPT32-R22 follow-up: normalize only the current adaptive coarse RGB group.
  // Reference preparation and the original source passed to native verification stay unchanged.
  const ADAPTIVE_CURRENT_RASTER_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.adaptiveCurrentRaster === true;
  const adaptiveCurrentRasterStats={attempts:0,calls:0,failures:0,failureTotalMs:0,failureRows:[],failureRowsDropped:0,readMs:0,identityCopyMs:0,scaleMs:0,featureMs:0,totalMs:0,rows:[],dropped:0};
  function prepareAdaptiveCurrentRgba(source,targetWidth){
    const start=performance.now(),width=Math.round(targetWidth),height=Math.round(source.height*width/source.width);
    const sourceFrameMarker=source.auditFrameMarker?{...source.auditFrameMarker}:null;
    let stage='source-read';adaptiveCurrentRasterStats.attempts++;
    try{
    const input=source.getContext('2d').getImageData(0,0,source.width,source.height),readAt=performance.now();
    stage='identity-copy';
    const canonical=document.createElement('canvas');canonical.width=source.width;canonical.height=source.height;
    canonical.getContext('2d',{alpha:false,willReadFrequently:true}).putImageData(input,0,0);
    const copiedAt=performance.now(),scaled=document.createElement('canvas'),context=scaled.getContext('2d',{alpha:false,willReadFrequently:true});
    stage='fresh-scale';
    scaled.width=width;scaled.height=height;context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    context.drawImage(canonical,0,0,width,height);const rgba=context.getImageData(0,0,width,height).data,scaledAt=performance.now();
    return{rgba,start,scaledAt,cost:{sourceWidth:source.width,sourceHeight:source.height,width,height,sourceFrameMarker,startedAtPerformanceMs:start,readMs:readAt-start,identityCopyMs:copiedAt-readAt,scaleMs:scaledAt-copiedAt}};
    }catch(error){
      const end=performance.now();adaptiveCurrentRasterStats.failures++;adaptiveCurrentRasterStats.failureTotalMs+=end-start;
      if(adaptiveCurrentRasterStats.failureRows.length<8)adaptiveCurrentRasterStats.failureRows.push({stage,startedAtPerformanceMs:start,endedAtPerformanceMs:end,elapsedMs:end-start,sourceFrameMarker,error:String(error?.message||error),existingPathFallback:true});else adaptiveCurrentRasterStats.failureRowsDropped++;
      return null;
    }
  }
  function recordAdaptiveCurrentRaster(raster){
    const end=performance.now(),r={...raster.cost,endedAtPerformanceMs:end,featureMs:end-raster.scaledAt,totalMs:end-raster.start};
    adaptiveCurrentRasterStats.calls++;for(const k of ['readMs','identityCopyMs','scaleMs','featureMs','totalMs'])adaptiveCurrentRasterStats[k]+=r[k];
    if(adaptiveCurrentRasterStats.rows.length<32)adaptiveCurrentRasterStats.rows.push(r);else adaptiveCurrentRasterStats.dropped++;
  }

  // R13 local research: decode RGB-detail reference images to native-size raster once.
  // Actual frame canvases, reference alpha masks and all matching conditions are unchanged.
  const RGB_DETAIL_REFERENCE_CANVAS_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.rgbDetailReferenceCanvas === true;
  const rgbDetailReferenceCanvases = new WeakMap();
  const rgbDetailReferenceCanvasStats = { normalized: 0, dimensions: [] };
  function rgbDetailReferenceRaster(source) {
    if (!RGB_DETAIL_REFERENCE_CANVAS_ENABLED || !(source instanceof HTMLImageElement)) return source;
    let canvas = rgbDetailReferenceCanvases.get(source);
    if (!canvas) {
      const width = source.naturalWidth || source.width, height = source.naturalHeight || source.height;
      if (!(width > 0 && height > 0)) return source;
      canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = 'high';
      context.drawImage(source, 0, 0);
      rgbDetailReferenceCanvases.set(source, canvas);
      rgbDetailReferenceCanvasStats.normalized += 1;
      rgbDetailReferenceCanvasStats.dimensions.push({ width, height });
    }
    return canvas;
  }

  // Local research only. Capture once so reference caches and current frames use one feature contract.
  const VALID_ROOT_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.largeClickValidRootFeatures === true;
  // Local speed research: preserve the excluded pixels; only combine vertically contiguous equal-width runs.
  const COMPACT_LARGE_SUPPORT_RESEARCH_ENABLED = VALID_ROOT_RESEARCH_ENABLED && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.compactLargeSupportRectangles === true;
  function compact(rects){const out=[],last=new Map();for(const r of rects){const key=r.x+':'+r.w,p=last.get(key);if(p&&p.y+p.h===r.y)p.h+=r.h;else{const n={x:r.x,y:r.y,w:r.w,h:r.h};out.push(n);last.set(key,n);}}return out;}


  const ANALYSIS_WIDTH = 176;
  const QUICK_ANALYSIS_WIDTH = 128;
  const COARSE_STRIDE = 2;
  const TOP_COARSE = 14;
  const REFINE_RADIUS = 3;
  // P4-R11: coarse x 위치 4개를 한 묶음으로 계산한다.
  // 각 후보의 상관계수 수식/누적 순서/coarse stride/top-14/refine은 그대로 유지하는 동치 최적화다.
  const COARSE_BATCH_SIZE = 4;
  const MULTISCALE_IDS = new Set(["78001", "77984", "77986", "77987", "77988", "77997", "inline-click-88992", "inline-click-88993", "inline-click-94425"]);
  const TEMPLATE_SCALES = [0.82, 1.00, 1.20];
  const CLICK_PROMPT_SCALES = [0.22, 0.32, 0.46, 0.66, 0.82, 1.00];
  // P4-R3: 기존 문자입력형 94458/94463/94465는 P3의 3배율을 그대로 유지한다.
  // Chrome 화면공유 미탐이 재현된 99116에만 근거가 확인된 소형 복구 0.60을 포함한 6배율을 적용해 범위를 국소화한다.
  const TEXT_INPUT_SCALES = [0.82, 1.00, 1.20];
  const TEXT_INPUT_99116_SCALES = [0.60, 0.68, 0.82, 1.00, 1.20, 1.40];
  // LS2.2-P3-R2: 미탐 우선 정책. 클릭형 전체(일반/인라인/레인보우/투명)의
  // 주 후보 진입선을 0.02 낮춘다. 회색조 보조 임계값과 후단 OCR/구조/연속표 조건은 유지한다.
  const CLICK_RECALL_THRESHOLD_OFFSET = -0.02;
  const clickRecallThreshold = (base) => Math.max(0, Math.min(1, base + CLICK_RECALL_THRESHOLD_OFFSET));
  const QUICK_TEMPLATE_IDS = new Set(["78001", "77983", "77984", "77986", "77987", "77988", "77997", "click-prompt", "transparent-click-88946", "transparent-shape-77982", "rainbow-prompt-recent-315", "rainbow-prompt-recent-330", "rainbow-prompt-recent-345", "rainbow-prompt-zud-2775", "rainbow-prompt-zud-2825", "rainbow-prompt-zud-2900", "rainbow-recovery-94496", "rainbow-recovery-94497", "rainbow-recovery-96116", "rainbow-recovery-96117", "rainbow-recovery-96118", "rainbow-recovery-static-recent-315", "rainbow-recovery-static-recent-330", "rainbow-recovery-static-recent-345", "rainbow-recovery-static-zud-2775", "rainbow-recovery-static-zud-2825", "rainbow-recovery-static-zud-2900", "rainbow-recovery-static-94496", "rainbow-recovery-static-94497", "rainbow-recovery-static-96116", "rainbow-recovery-static-96117", "rainbow-recovery-static-96118"]);
  const QUICK_CLICK_PROMPT_SCALES = [0.32, 0.46, 0.66, 0.82, 1.00];

  // LS2.2: 저사양 최적화. 전체 템플릿을 곧바로 176/320/512px로 정밀 스캔하지 않고
  // 96px 게이트로 후보 ID를 좁힌 뒤 원래 매처를 그대로 실행한다.
  // 판정 임계값/점수 계산은 정밀 단계에서 기존 코드 그대로 사용한다.
  const GATE_ANALYSIS_WIDTH = 96;
  const GATE_TOP_IDS = 10;
  const FULL_SCAN_EVERY = 4;
  // 게이트가 저해상도에서 밀리기 쉬우면서 실사용 회귀 표본상 중요한 군은 항상 정밀 검사한다.
  // 77984는 사용자 정적 회귀에서 게이트 누락으로 4번째 full scan까지 지연되는 것이 확인되어 추가했다.
  // R16: 77959/94456 페어의 두 증거가 같은 프레임에 항상 존재하도록 lie-title도 보존한다.
  const ALWAYS_FULL_IDS = new Set([
    "78001", "77983", "77984", "77986", "77988",
    "inline-click-88992", "inline-click-88993", "inline-click-94425",
    "transparent-shape-77982", "lie-title", "text-input-prompt-94458"
  ]);
  // P4-R8: 94458은 ALWAYS_FULL로 유지하고, 실사용 회귀에서 게이트에 밀린 94463과
  // 신규 99116은 서로가 reserve를 독점하지 않도록 각 ID를 독립적으로 정밀검사에 보존한다.
  // 레인보우형 카운트다운 숫자는 매초 바뀌므로 보조 템플릿에서는 해당 영역을 상관계산에서 제외한다.
  // R10: 템플릿마다 크롭 여백/회전이 달라 공통 상대좌표 마스크를 폐기하고 실제 숫자 위치별 rect를 사용한다.
  // x/y/w/h는 각 템플릿 상대좌표다. 고정 안내문은 최대한 보존하고 숫자 영역만 덮는다.
  const RAINBOW_TIMER_IGNORE_RECTS_BY_ID = Object.freeze({
    "recent-315": [{ x: 0.12, y: 0.00, w: 0.30, h: 0.20 }],
    "recent-330": [{ x: 0.35, y: 0.12, w: 0.30, h: 0.22 }],
    "recent-345": [{ x: 0.34, y: 0.08, w: 0.28, h: 0.23 }],
    "zud-2775": [{ x: 0.00, y: 0.30, w: 0.38, h: 0.32 }],
    "zud-2825": [{ x: 0.00, y: 0.28, w: 0.40, h: 0.34 }],
    "zud-2900": [{ x: 0.31, y: 0.34, w: 0.28, h: 0.26 }],
    "94496": [{ x: 0.37, y: 0.08, w: 0.30, h: 0.21 }],
    "94497": [{ x: 0.39, y: 0.10, w: 0.27, h: 0.21 }],
    "96116": [{ x: 0.38, y: 0.18, w: 0.30, h: 0.20 }],
    "96117": [{ x: 0.52, y: 0.15, w: 0.28, h: 0.18 }],
    "96118": [{ x: 0.06, y: 0.02, w: 0.38, h: 0.25 }]
  });

  const TEMPLATE_SPECS = [
    {"id":"adaptive-click-a","file":"click-lines-a.png","frameWidth":1280,"analysisWidth":256,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.55,0.7,0.85,1,1.2,1.45],"ignoreRects":[{"x":0,"y":0.08,"w":0.08,"h":0.84},{"x":0.92,"y":0.08,"w":0.08,"h":0.84},{"x":0,"y":0,"w":1,"h":0.04},{"x":0,"y":0.96,"w":1,"h":0.04}]},
    {"id":"adaptive-click-b","file":"click-lines-b.png","frameWidth":1280,"analysisWidth":256,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.55,0.7,0.85,1,1.2,1.45],"ignoreRects":[{"x":0,"y":0.08,"w":0.08,"h":0.84},{"x":0.92,"y":0.08,"w":0.08,"h":0.84},{"x":0,"y":0,"w":1,"h":0.04},{"x":0,"y":0.96,"w":1,"h":0.04}]},
    {"id":"adaptive-click-yellow","file":"click-lines-yellow.png","frameWidth":1536,"analysisWidth":256,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.55,0.7,0.85,1,1.2,1.45],"ignoreRects":[{"x":0,"y":0.08,"w":0.08,"h":0.84},{"x":0.92,"y":0.08,"w":0.08,"h":0.84},{"x":0,"y":0,"w":1,"h":0.04},{"x":0,"y":0.96,"w":1,"h":0.04}]},
    {"id":"adaptive-click-occluded","file":"click-lines-occluded.png","frameWidth":1280,"analysisWidth":256,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.55,0.7,0.85,1,1.2,1.45],"ignoreRects":[{"x":0,"y":0.08,"w":0.08,"h":0.84},{"x":0.92,"y":0.08,"w":0.08,"h":0.84},{"x":0,"y":0,"w":1,"h":0.04},{"x":0,"y":0.96,"w":1,"h":0.04}]},
    {"id":"large-click-tilted--6","file":"oct-click-tilted.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-6,"scales":[0.8,0.9,1,1.1,1.2]},
    {"id":"large-click-tilted-0","file":"oct-click-tilted.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.8,0.9,1,1.1,1.2]},
    {"id":"large-click-tilted-6","file":"oct-click-tilted.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":6,"scales":[0.8,0.9,1,1.1,1.2]},
    ...(M400_POSE_ENABLED?[{"id":"large-click-flat--12","file":"oct-click-flat.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-12,"scales":[0.8,0.9,1,1.1,1.2]}]:[]),
    ...(M400_NARROW_ENABLED?[{"id":"large-click-flat-narrow--12","file":"oct-click-flat.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-12,"coarseReferenceAspect":[0.8,1.1],"scales":[0.8,0.9,1,1.1,1.2]}]:[]),
    {"id":"large-click-flat--6","file":"oct-click-flat.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-6,"scales":[0.8,0.9,1,1.1,1.2]},
    {"id":"large-click-flat-0","file":"oct-click-flat.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.8,0.9,1,1.1,1.2]},
    {"id":"large-click-flat-6","file":"oct-click-flat.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":6,"scales":[0.8,0.9,1,1.1,1.2]},
    // Fixed three-line reference, used only by the bounded source-deskew path.
    {"id":"large-click-rising-0","file":"oct-click-rising-fixed.png","frameWidth":1366,"analysisWidth":384,"mode":"rgb-detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.8,0.9,1,1.1,1.2]},
    {"id":"click-lines-a--6","file":"click-lines-a.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-6,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    {"id":"click-lines-a-0","file":"click-lines-a.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    {"id":"click-lines-a-6","file":"click-lines-a.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":6,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    {"id":"click-lines-b--6","file":"click-lines-b.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":-6,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    {"id":"click-lines-b-0","file":"click-lines-b.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":0,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    {"id":"click-lines-b-6","file":"click-lines-b.png","frameWidth":1280,"analysisWidth":256,"mode":"detail","targetedOnly":true,"label":"클릭형 거탐","threshold":0.68,"rotation":6,"scales":[0.68,0.75,0.82,0.9,1,1.1,1.2]},
    { id: "fixed-rainbow-top", file: "rainbow-fixed-top.png", ignoreRects:[{x:.45,y:0,w:.55,h:.20}], frameWidth:1280, analysisWidth:320, mode:"detail", targetedOnly:true, label:"클릭형 거탐", threshold:.62, scales:[.50,.60,.70,.82,.92,1,1.06,1.12,1.20] },
    { id: "fixed-rainbow-bottom", file: "rainbow-fixed-bottom.png", frameWidth:1280, analysisWidth:320, mode:"detail", targetedOnly:true, label:"클릭형 거탐", threshold:.62, scales:[.50,.60,.70,.82,.92,1,1.06,1.12,1.20] },
    { id: "78001", file: "78001.png", frameWidth: 1536, label: "투명 문자형", threshold: 0.54 },
    { id: "77983", file: "77983.png", frameWidth: 1536, label: "비올레타형", threshold: 0.50 },
    { id: "77984", file: "77984.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.48), grayThreshold: 0.70 },
    { id: "77986", file: "77986.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.42) },
    { id: "77987", file: "77987.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.47) },
    { id: "77988", file: "77988.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.57), grayThreshold: 0.84 },
    { id: "77997", file: "77997.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.62) },
    // 88992/88993은 팝업이 아니라 화면 위에 직접 그려지는 반투명 클릭 안내문이다.
    // 이 두 템플릿은 위치 후보만 제공하며 app.js에서 단독 확정 대상에서는 제외한다.
    { id: "inline-click-88992", file: "inline-click-88992.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.50), grayThreshold: 0.88, scales: [0.82, 1.00, 1.20] },
    { id: "inline-click-88993", file: "inline-click-88993.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.50), grayThreshold: 0.88, scales: [0.82, 1.00, 1.20] },
    { id: "inline-click-94425", file: "inline-click-94425.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.50), grayThreshold: 0.88, scales: [0.82, 1.00, 1.20] },
    { id: "click-prompt", file: "click-prompt.png", frameWidth: 1469, analysisWidth: 176, label: "클릭형 거탐", threshold: clickRecallThreshold(0.50), scales: CLICK_PROMPT_SCALES },
    { id: "transparent-click-88946", file: "88946.png", frameWidth: 1536, label: "투명 클릭형", threshold: clickRecallThreshold(0.66), scales: [0.82, 1.00, 1.20] },
    { id: "transparent-shape-77982", file: "77982.png", frameWidth: 1536, label: "투명 도형형", threshold: clickRecallThreshold(0.64), scales: [0.82, 0.90, 1.00, 1.10, 1.20] },
    // 94458 계열 문자 입력형: CAPTCHA 내부 글자는 매번 바뀌므로 고정 안내 문구 영역만 위치 후보로 사용한다.
    { id: "text-input-prompt-94458", file: "text-input-prompt-94458.png", frameWidth: 1920, analysisWidth: 320, label: "문자 입력형", threshold: 0.44, scales: TEXT_INPUT_SCALES },
    { id: "text-input-prompt-94463", file: "text-input-prompt-94463.png", frameWidth: 1536, analysisWidth: 320, label: "문자 입력형", threshold: 0.44, scales: TEXT_INPUT_SCALES, ignoreRects: [{ x: 0.32, y: 0.00, w: 0.36, h: 0.42 }] },
    { id: "text-input-prompt-94465", file: "text-input-prompt-94465.png", frameWidth: 1536, analysisWidth: 320, label: "문자 입력형", threshold: 0.50, scales: TEXT_INPUT_SCALES },
    // LS2.2-P1: 세로 150% 실사용 미탐 99116. 카운트다운/CAPTCHA 랜덤 문자열은 제외하고
    // 고정 안내문 색상/배경 조합만 위치 힌트로 사용한다. 단독 확정 금지, OCR 구조 확인 필수.
    { id: "text-input-prompt-99116", file: "text-input-prompt-99116.png", frameWidth: 1536, analysisWidth: 320, label: "문자 입력형", threshold: 0.50, scales: TEXT_INPUT_99116_SCALES },
    { id: "rainbow-prompt-recent-315", file: "rainbow-prompt-recent-315.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-prompt-recent-330", file: "rainbow-prompt-recent-330.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-prompt-recent-345", file: "rainbow-prompt-recent-345.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-prompt-zud-2775", file: "rainbow-prompt-zud-2775.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-prompt-zud-2825", file: "rainbow-prompt-zud-2825.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-prompt-zud-2900", file: "rainbow-prompt-zud-2900.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true },
    // 카운트다운 숫자 무시 보조. 기존 템플릿이 근접 후보를 만든 경우에만 단독 재검사하며,
    // app.js에서 OCR 문구 확인 없이는 절대 알림을 확정하지 않는다.
    { id: "rainbow-recovery-static-recent-315", file: "rainbow-prompt-recent-315.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["recent-315"], ocrRequired: true },
    { id: "rainbow-recovery-static-recent-330", file: "rainbow-prompt-recent-330.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["recent-330"], ocrRequired: true },
    { id: "rainbow-recovery-static-recent-345", file: "rainbow-prompt-recent-345.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["recent-345"], ocrRequired: true },
    { id: "rainbow-recovery-static-zud-2775", file: "rainbow-prompt-zud-2775.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["zud-2775"], ocrRequired: true },
    { id: "rainbow-recovery-static-zud-2825", file: "rainbow-prompt-zud-2825.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["zud-2825"], ocrRequired: true },
    { id: "rainbow-recovery-static-zud-2900", file: "rainbow-prompt-zud-2900.png", frameWidth: 1366, label: "클릭형 거탐", threshold: clickRecallThreshold(0.60), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["zud-2900"], ocrRequired: true },
    { id: "rainbow-recovery-static-94496", file: "rainbow-recovery-94496.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.64), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["94496"], ocrRequired: true },
    { id: "rainbow-recovery-static-94497", file: "rainbow-recovery-94497.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.56), scales: [0.82, 1.00, 1.20], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["94497"], ocrRequired: true },
    { id: "rainbow-recovery-static-96116", file: "rainbow-recovery-96116.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.62), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["96116"], ocrRequired: true },
    { id: "rainbow-recovery-static-96117", file: "rainbow-recovery-96117.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.62), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["96117"], ocrRequired: true },
    { id: "rainbow-recovery-static-96118", file: "rainbow-recovery-96118.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.70), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true, ignoreRects: RAINBOW_TIMER_IGNORE_RECTS_BY_ID["96118"], ocrRequired: true },
    // 특정 카운트다운 초에 종속되지 않는 보조 후보.
    // 시각 점수만으로 확정하지 않고 app.js에서 반드시 OCR 문구 확인을 요구한다.
    // 강한 스킬 이펙트/회전으로 기존 레인보우 템플릿 점수가 낮아지는 미탐 보조 샘플.
    // 단독 확정은 금지하며 app.js에서 기존 레인보우 약한 동반 증거 + OCR/3표 검증을 추가로 요구한다.
    { id: "rainbow-recovery-94496", file: "rainbow-recovery-94496.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.64), scales: [0.82, 1.00, 1.20], quickOnly: true },
    { id: "rainbow-recovery-94497", file: "rainbow-recovery-94497.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.56), scales: [0.82, 1.00, 1.20], quickOnly: true },
    // 96116/96117: 위치/크기/배경이 크게 달라진 신규 레인보우 미탐 샘플.
    // recovery 계열은 app.js에서 OCR 또는 3표 강일치 검증을 추가로 요구한다.
    { id: "rainbow-recovery-96116", file: "rainbow-recovery-96116.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.62), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true },
    { id: "rainbow-recovery-96117", file: "rainbow-recovery-96117.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.62), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true },
    { id: "rainbow-recovery-96118", file: "rainbow-recovery-96118.png", frameWidth: 1536, label: "클릭형 거탐", threshold: clickRecallThreshold(0.70), scales: [0.72, 0.86, 1.00, 1.18, 1.36], quickOnly: true },
    { id: "lie-title", file: "lie-title.png", frameWidth: 1536, analysisWidth: 320, label: "거짓말 탐지기 팝업", threshold: 0.58 },
    { id: "lie-title-77959", file: "lie-title-77959.png", frameWidth: 1536, analysisWidth: 320, label: "거짓말 탐지기 팝업", threshold: 0.50 },
    { id: "lie-title-77985", file: "lie-title-77985.png", frameWidth: 1536, analysisWidth: 320, label: "거짓말 탐지기 팝업", threshold: 0.50 },
    { id: "lie-title-78000", file: "lie-title-78000.png", frameWidth: 1536, analysisWidth: 320, label: "거짓말 탐지기 팝업", threshold: 0.50 },
    { id: "lie-title-78002", file: "lie-title-78002.png", frameWidth: 1536, analysisWidth: 320, label: "거짓말 탐지기 팝업", threshold: 0.50 },
    { id: "lie-title-gray-77959", file: "lie-title-77959.png", frameWidth: 1536, analysisWidth: 512, mode: "gray", label: "거짓말 탐지기 팝업", threshold: 0.90 },
    { id: "lie-title-gray-77985", file: "lie-title-77985.png", frameWidth: 1536, analysisWidth: 512, mode: "gray", label: "거짓말 탐지기 팝업", threshold: 0.90 },
    { id: "lie-title-gray-78000", file: "lie-title-78000.png", frameWidth: 1536, analysisWidth: 512, mode: "gray", label: "거짓말 탐지기 팝업", threshold: 0.90 },
    { id: "lie-title-gray-78002", file: "lie-title-78002.png", frameWidth: 1536, analysisWidth: 512, mode: "gray", label: "거짓말 탐지기 팝업", threshold: 0.90 }
  ];

  let templates = null;
  let quickTemplates = null;
  let gateTemplates = null;
  let initPromise = null;
  let analyzeSerial = 0;
  const SCALED_CANVAS_CACHE_LIMIT = 6;
  const scaledCanvasCache = new Map();
  const coarseBatchScores = new Float64Array(COARSE_BATCH_SIZE);

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`로컬 문구 템플릿 로드 실패: ${url}`));
      image.src = url;
    });
  }

  function drawScaled(source, width, height) {
    // R16-OPT1: 최근 target width만 보존해 비율/해상도 변경 시 canvas 캐시가 누적되지 않게 한다.
    const key = String(width);
    let cached = scaledCanvasCache.get(key);
    if (!cached) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      cached = { canvas, context };
    } else {
      scaledCanvasCache.delete(key);
    }
    scaledCanvasCache.set(key, cached);
    while (scaledCanvasCache.size > SCALED_CANVAS_CACHE_LIMIT) {
      scaledCanvasCache.delete(scaledCanvasCache.keys().next().value);
    }
    if (cached.canvas.width !== width || cached.canvas.height !== height) {
      cached.canvas.width = width;
      cached.canvas.height = height;
      cached.context.imageSmoothingEnabled = true;
      cached.context.imageSmoothingQuality = "high";
    } else {
      cached.context.clearRect(0, 0, width, height);
    }
    cached.context.drawImage(source, 0, 0, width, height);
    return cached.context;
  }

  function extractFeatures(source, targetWidth = ANALYSIS_WIDTH) {
    const width = Math.max(1, Math.round(targetWidth));
    const height = Math.max(1, Math.round(source.height * width / source.width));
    const context = drawScaled(source, width, height);
    const rgba = context.getImageData(0, 0, width, height).data;
    const count = width * height;
    const gray = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const o = i * 4;
      const r = rgba[o];
      const g = rgba[o + 1];
      const b = rgba[o + 2];
      gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    const edge = new Float32Array(count);
    const warm = new Float32Array(count);
    const pale = new Float32Array(count);
    const dark = new Float32Array(count);

    for (let y = 0; y < height; y += 1) {
      const ym1 = Math.max(0, y - 1);
      const yp1 = Math.min(height - 1, y + 1);
      for (let x = 0; x < width; x += 1) {
        const xm1 = Math.max(0, x - 1);
        const xp1 = Math.min(width - 1, x + 1);
        const i = y * width + x;
        const a = gray[ym1 * width + xm1];
        const b = gray[ym1 * width + x];
        const c = gray[ym1 * width + xp1];
        const d = gray[y * width + xm1];
        const f = gray[y * width + xp1];
        const g0 = gray[yp1 * width + xm1];
        const h = gray[yp1 * width + x];
        const j = gray[yp1 * width + xp1];
        const gx = -a + c - 2 * d + 2 * f - g0 + j;
        const gy = -a - 2 * b - c + g0 + 2 * h + j;
        edge[i] = Math.min(1, Math.sqrt(gx * gx + gy * gy)) * 0.5;

        const o = i * 4;
        const r = rgba[o];
        const gg = rgba[o + 1];
        const bb = rgba[o + 2];
        const maximum = Math.max(r, gg, bb);
        const minimum = Math.min(r, gg, bb);
        const sat = Math.fround(maximum > 0 ? (maximum - minimum) / maximum : 0);
        if (r >= 110 && gg >= 45 && bb <= 165 && r >= gg * 0.98 && r >= bb * 1.10 && sat >= 0.22) warm[i] = 1;
        if (gg >= 100 && bb >= 80 && gg >= r * 0.95 && Math.max(gg, bb) - Math.min(r, gg, bb) >= 10) pale[i] = 0.35;
        if (gray[i] < 0.45 && sat > 0.18) dark[i] = 0.25;
      }
    }

    return { width, height, channels: [edge, warm, pale, dark] };
  }

  function extractGrayFeatures(source, targetWidth = 512) {
    const width = Math.max(1, Math.round(targetWidth));
    const height = Math.max(1, Math.round(source.height * width / source.width));
    const context = drawScaled(source, width, height);
    const rgba = context.getImageData(0, 0, width, height).data;
    const gray = new Float32Array(width * height);
    for (let i = 0; i < gray.length; i += 1) {
      const o = i * 4;
      gray[i] = (0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2]) / 255;
    }
    return { width, height, channels: [gray] };
  }


  function extractDetailFeatures(source, targetWidth) {
    const features=extractGrayFeatures(source,targetWidth),{width,height}=features;
    const gray=features.channels[0],values=new Float32Array(gray.length);
    const {integral}=makeIntegralPair(gray,width,height);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const x1=Math.max(0,x-2),y1=Math.max(0,y-2),w=Math.min(width,x+3)-x1,h=Math.min(height,y+3)-y1;
      values[y*width+x]=gray[y*width+x]-rectIntegral(integral,width+1,x1,y1,w,h)/(w*h);
    }
    return {width,height,channels:[values]};
  }

  // Unsigned RGB local contrast keeps the same letter edges when rainbow text
  // changes luminance polarity. Only the new fixed-guide templates use it.
  function extractRgbDetailFeatures(source, targetWidth, preparedRgba = null) {
    source = rgbDetailReferenceRaster(source);
    const width=Math.round(targetWidth),height=Math.round(source.height*width/source.width);
    const rgba=preparedRgba || drawScaled(source,width,height).getImageData(0,0,width,height).data;
    const values=new Float32Array(width*height);
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      let magnitude=0;
      for(let ch=0;ch<3;ch++){
        let mean=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)mean+=rgba[((y+dy)*width+x+dx)*4+ch];
        const v=rgba[(y*width+x)*4+ch]-mean/9;magnitude+=v*v;
      }
      values[y*width+x]=Math.sqrt(magnitude);
    }
    return {width,height,channels:[values]};
  }

  function extractModeFeatures(source,width,mode){
    return mode==="rgb-detail"?extractRgbDetailFeatures(source,width):mode==="detail"?extractDetailFeatures(source,width):mode==="gray"?extractGrayFeatures(source,width):extractFeatures(source,width);
  }

  function validAlphaSupport(rgba,width,height){const mask=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){let valid=true;for(let dy=-1;dy<=1&&valid;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height||rgba[(yy*width+xx)*4+3]!==255){valid=false;break;}}mask[y*width+x]=valid?1:0;}return mask;}
  function unionAlphaIgnored(alphaMask,width,height,ignored){const valid=new Uint8Array(alphaMask);for(const r of ignored)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)valid[y*width+x]=0;const runs=[];for(let y=0;y<height;y++){let x=0;while(x<width){if(valid[y*width+x]){x++;continue;}const start=x;while(x<width&&!valid[y*width+x])x++;runs.push({x:start,y,w:x-start,h:1});}}return runs;}
  function templateAlphaSupport(source,width,height){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:true,willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,width,height);ctx.drawImage(source,0,0,width,height);
    return validAlphaSupport(ctx.getImageData(0,0,width,height).data,width,height);
  }
  function prepareTemplate(spec, features) {
    const size = features.width * features.height;
    let ignored = (Array.isArray(spec.ignoreRects) ? spec.ignoreRects : [])
      .map((rect) => ({
        x: clamp(Math.round(Number(rect.x || 0) * features.width), 0, features.width),
        y: clamp(Math.round(Number(rect.y || 0) * features.height), 0, features.height),
        w: Math.max(0, Math.round(Number(rect.w || 0) * features.width)),
        h: Math.max(0, Math.round(Number(rect.h || 0) * features.height))
      }))
      .map((rect) => ({
        x: rect.x,
        y: rect.y,
        w: Math.max(0, Math.min(rect.w, features.width - rect.x)),
        h: Math.max(0, Math.min(rect.h, features.height - rect.y))
      }))
      .filter((rect) => rect.w > 0 && rect.h > 0);
    if(VALID_ROOT_RESEARCH_ENABLED&&features.validAlphaMask)ignored=unionAlphaIgnored(features.validAlphaMask,features.width,features.height,ignored);
    const mask = ignored.length ? new Uint8Array(size).fill(1) : null;
    if (mask) {
      for (const rect of ignored) {
        for (let yy = rect.y; yy < rect.y + rect.h; yy += 1) {
          const row = yy * features.width;
          for (let xx = rect.x; xx < rect.x + rect.w; xx += 1) mask[row + xx] = 0;
        }
      }
    }
    let activeCount = size;
    if (mask) {
      activeCount = 0;
      for (let i = 0; i < size; i += 1) activeCount += mask[i];
      activeCount = Math.max(1, activeCount);
    }
    const centered = [];
    const numeratorChannels = [];
    let variance = 0;
    for (const channel of features.channels) {
      let sum = 0;
      if (mask) {
        for (let i = 0; i < size; i += 1) if (mask[i]) sum += channel[i];
      } else {
        for (let i = 0; i < size; i += 1) sum += channel[i];
      }
      const mean = sum / activeCount;
      const output = new Float32Array(size);
      let hasNumeratorValues = false;
      for (let i = 0; i < size; i += 1) {
        if (mask && !mask[i]) {
          output[i] = 0;
          continue;
        }
        const value = channel[i] - mean;
        output[i] = value;
        if (output[i] !== 0) hasNumeratorValues = true;
        variance += value * value;
      }
      centered.push(output);
      if (hasNumeratorValues) numeratorChannels.push(centered.length - 1);
    }
    return { ...spec, width: features.width, height: features.height, centered, numeratorChannels, variance, activeCount, ignoredRectsPx: COMPACT_LARGE_SUPPORT_RESEARCH_ENABLED && features.validAlphaMask && spec.id.startsWith("large-click-") ? compact(ignored) : ignored };
  }

  const {makeIntegralPair,rectIntegral} = window.MAlertContourCore;

  const RISING_SEED_SIDECAR_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.retainRisingSeedSidecar === true;

  async function scanActiveTemplates(source, activeTemplates, widthOverride = 0, maxCandidates = 1, options = {}) {
    const retainSidecar = RISING_SEED_SIDECAR_ENABLED && options.retainRisingSeedSidecar === true;
    const groups = new Map();
    for (let index = 0; index < activeTemplates.length; index += 1) {
      const template = activeTemplates[index];
      const analysisWidth = Number(widthOverride || template.analysisWidth || ANALYSIS_WIDTH);
      const mode = template.mode === "rgb-detail" ? "rgb-detail" : template.mode === "detail" ? "detail" : template.mode === "gray" ? "gray" : "hybrid";
      const cacheKey = `${mode}:${analysisWidth}`;
      let group = groups.get(cacheKey);
      if (!group) {
        group = { mode, analysisWidth, indices: [] };
        groups.set(cacheKey, group);
      }
      group.indices.push(index);
    }

    const candidates = new Array(activeTemplates.length);
    const extra=[];
    const sidecars = retainSidecar ? [] : null;
    for (const group of groups.values()) {
      const normalizeCurrentAdaptive = ADAPTIVE_CURRENT_RASTER_ENABLED && source instanceof HTMLCanvasElement && group.mode === 'rgb-detail' && group.analysisWidth === 256 && group.indices.length > 0 && group.indices.every(index=>String(activeTemplates[index].id||'').startsWith('adaptive-click-'));
      const currentRaster = normalizeCurrentAdaptive ? prepareAdaptiveCurrentRgba(source,group.analysisWidth) : null;
      const textCurrentFeatures = extractTextCurrentRaster(source,group,activeTemplates);
      const extracted = textCurrentFeatures || (currentRaster ? extractRgbDetailFeatures(source,group.analysisWidth,currentRaster.rgba) : extractModeFeatures(source,group.analysisWidth,group.mode));
      if(currentRaster)recordAdaptiveCurrentRaster(currentRaster);
      const scaleBack = source.width / extracted.width;
      const scans = retainSidecar
        ? await window.MAlertContourWorker.scan(extracted,group.indices.map(index=>activeTemplates[index]),maxCandidates,{retainRisingSeedSidecar:true})
        : await window.MAlertContourWorker.scan(extracted,group.indices.map(index=>activeTemplates[index]),maxCandidates);
      let scanIndex = 0;
      for (const index of group.indices) {
        const template = activeTemplates[index];
        const scanned = scans[scanIndex++];
        const envelope = retainSidecar && scanned && !Array.isArray(scanned) && Array.isArray(scanned.matches) ? scanned : null;
        const originalScanned = envelope ? envelope.matches : scanned;
        const matches=Array.isArray(originalScanned)?originalScanned:[originalScanned];
        for (const match of (envelope && String(template.id || "").startsWith("large-click-rising-")?[envelope.sidecar,...(envelope.coverageSidecars||[])].filter(Boolean):[])) {

          sidecars.push({
            id: template.id, label: template.label, score: match.score, threshold: template.threshold,
            matched: false, retrievalOnly: true, retrievalSource: "COARSE_SEED_UNIQUE_REFINEMENT_SIDECAR",
            templateScale: Number(template.templateScale || 1),
            detectionMode: template.detectionMode || template.mode || "hybrid", rotation: template.rotation || 0,
            analysisWidth: group.analysisWidth, extractedWidth: extracted.width, extractedHeight: extracted.height,
            sourceWidth: source.width, sourceHeight: source.height, scaleBack,
            featureRect: { x: match.x, y: match.y, w: template.width, h: template.height },
            sidecarSeed: match.seed ? { ...match.seed } : null,
            rect: { x: match.x * scaleBack, y: match.y * scaleBack, w: template.width * scaleBack, h: template.height * scaleBack }
          });
        }
        for(let mi=0;mi<matches.length;mi++){
        const match=matches[mi];
        const candidate = {
          id: template.id,
          label: template.label,
          score: match.score,
          threshold: template.threshold + (window.__LIE_THR_OFF || 0),
          matched: match.score >= template.threshold + (window.__LIE_THR_OFF || 0),
          templateScale: Number(template.templateScale || 1),
          detectionMode: template.detectionMode || template.mode || "hybrid",
          rotation:template.rotation||0,
          rect: {
            x: match.x * scaleBack,
            y: match.y * scaleBack,
            w: template.width * scaleBack,
            h: template.height * scaleBack
          }
        };
        if(mi===0)candidates[index]=candidate;else extra.push(candidate);
        }
      }
    }
    const originalCandidates = candidates.filter(Boolean).concat(extra);
    return retainSidecar ? { candidates: originalCandidates, sidecars } : originalCandidates;
  }

  function rotateReference(image,degrees){
    const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
    const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);ctx.rotate(degrees*Math.PI/180);ctx.drawImage(image,-c.width/2,-c.height/2);
    c.naturalWidth=c.width;c.naturalHeight=c.height;return c;
  }
  async function init() {
    if (templates) return templates;
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const result = [];
      const quickResult = [];
      const gateResult = [];
      for (const spec of TEMPLATE_SPECS) {
        const url = new URL(`../assets/local-templates/${spec.file}?v=1149ls22r16`, document.baseURI).href;
        const rawImage = await loadImage(url);
        let image=spec.rotation?rotateReference(rawImage,spec.rotation):rawImage;
        // Reference-only retrieval geometry. Native input pixels and final native references are unchanged.
        if(M400_NARROW_ENABLED&&spec.coarseReferenceAspect){const c=document.createElement('canvas');c.width=Math.round(image.naturalWidth*spec.coarseReferenceAspect[0]);c.height=Math.round(image.naturalHeight*spec.coarseReferenceAspect[1]);c.getContext('2d').drawImage(image,0,0,c.width,c.height);c.naturalWidth=c.width;c.naturalHeight=c.height;image=c;}
        const analysisWidth = Number(spec.analysisWidth || ANALYSIS_WIDTH);
        const baseWidth = image.naturalWidth * analysisWidth / spec.frameWidth;
        const scales = Array.isArray(spec.scales) ? spec.scales : (MULTISCALE_IDS.has(spec.id) ? TEMPLATE_SCALES : [1]);
        if (!spec.quickOnly) {
          for (const templateScale of scales) {
            const width = Math.max(8, Math.round(baseWidth * templateScale));
            const features = extractModeFeatures(image,width,spec.mode);
            if(VALID_ROOT_RESEARCH_ENABLED&&spec.id.startsWith('large-click-'))features.validAlphaMask=templateAlphaSupport(image,features.width,features.height);
            result.push({...prepareTemplate(spec, features), analysisWidth, templateScale, rotation:spec.rotation||0, detectionMode:spec.mode||"hybrid"});

            // 96px 게이트 템플릿도 같은 원본/배율에서 준비한다. 게이트 점수는 후보 순위에만 사용되고
            // 최종 score/threshold/rect는 아래 정밀 스캔 결과만 사용한다.
            const gateBaseWidth = image.naturalWidth * GATE_ANALYSIS_WIDTH / spec.frameWidth;
            const gateWidth = Math.max(6, Math.round(gateBaseWidth * templateScale));
            const gateFeatures = extractModeFeatures(image,gateWidth,spec.mode);
            if(!spec.targetedOnly) gateResult.push({...prepareTemplate(spec, gateFeatures), analysisWidth:GATE_ANALYSIS_WIDTH, templateScale, detectionMode:spec.mode||"hybrid"});

            if (MULTISCALE_IDS.has(spec.id) && spec.mode !== "gray") {
              const graySpec={...spec,mode:"gray",threshold:Number(spec.grayThreshold||0.88)};
              const grayFeatures=extractGrayFeatures(image,width);
              result.push({...prepareTemplate(graySpec,grayFeatures),analysisWidth,templateScale,detectionMode:"gray"});
              const gateGrayFeatures=extractGrayFeatures(image,gateWidth);
              gateResult.push({...prepareTemplate(graySpec,gateGrayFeatures),analysisWidth:GATE_ANALYSIS_WIDTH,templateScale,detectionMode:"gray"});
            }
          }
        }

        if (spec.mode !== "gray" && QUICK_TEMPLATE_IDS.has(spec.id)) {
          const quickScales = spec.id === "click-prompt"
            ? QUICK_CLICK_PROMPT_SCALES
            : (Array.isArray(spec.scales) ? spec.scales : (MULTISCALE_IDS.has(spec.id) ? TEMPLATE_SCALES : [1]));
          const quickBaseWidth = image.naturalWidth * QUICK_ANALYSIS_WIDTH / spec.frameWidth;
          for (const templateScale of quickScales) {
            const width = Math.max(7, Math.round(quickBaseWidth * templateScale));
            const features = extractFeatures(image, width);
            quickResult.push({
              ...prepareTemplate(spec, features),
              analysisWidth: QUICK_ANALYSIS_WIDTH,
              templateScale,
              detectionMode: "quick-hybrid",
              quickThreshold: Number(spec.quickThreshold ?? spec.threshold)
            });
          }
        }
      }
      templates = result;
      quickTemplates = quickResult;
      gateTemplates = gateResult;
      // Register gate templates as well: the 96px ranking pass uses the same
      // worker/core scanner as full/quick scans, with unchanged scores/order.
      await window.MAlertContourWorker.initialize(templates, quickTemplates, gateTemplates);
      return templates;
    })();
    try {
      return await initPromise;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  }


  async function verifyShapeContourCandidates(source,candidates){
    const shapes=candidates.filter(c=>c.id==='transparent-shape-77982');
    if(!shapes.length)return candidates;
    for(const candidate of shapes){candidate.shapeGuideVerified=false;candidate.shapeGuideReason='below-shape-contour-floor';}
    const eligible=shapes.filter(c=>Number(c.score)>=Math.min(Number(c.threshold),.63));
    if(!eligible.length)return candidates;
    const detector=window.MAlertPanelGuide;
    let verification;
    try{verification=detector?.verifyShapeCandidates?await detector.verifyShapeCandidates(source,eligible):null;}
    catch(error){for(const c of eligible)c.shapeGuideReason='shape-guide-verification-error';}
    for(let i=0;i<eligible.length;i++){
      const candidate=eligible[i],result=verification?.[i];
      candidate.shapeGuideVerified=result?.matched===true;
      candidate.shapeGuideReason=result?.reason||candidate.shapeGuideReason||'shape-guide-unavailable';
      candidate.shapeGuideScores=result?.scores||[];
      candidate.shapeGuideEvidenceRects=result?.evidenceRects||[];
      candidate.shapeGuideDurationMs=result?.durationMs||0;
      candidate.shapeGuideNativePixelsUsed=result?.nativePixelsUsed===true;
      if(result?.matched&&result.rect){candidate.contourRect={...candidate.rect};candidate.rect=result.rect;}
      // Keep the measured contour score and threshold. Generic acceptance must
      // additionally require this same-frame fixed-title/instruction evidence.
      candidate.matched=candidate.matched&&candidate.shapeGuideVerified;
    }
    return candidates;
  }

  async function analyzeQuick(source, options = {}) {
    const started = performance.now();
    await init();
    const requestedPrefix = String(options.prefix || "");
    const requestedIds = Array.isArray(options.ids) ? new Set(options.ids.map(String)) : null;
    const activeTemplates = (quickTemplates || []).filter((template) => {
      if (requestedPrefix && !String(template.id || "").startsWith(requestedPrefix)) return false;
      if (requestedIds && !requestedIds.has(String(template.id || ""))) return false;
      return true;
    });
    const features = extractFeatures(source, QUICK_ANALYSIS_WIDTH);
    const scaleBack = source.width / features.width;
    const scans = await window.MAlertContourWorker.scan(features,activeTemplates,1,{priority:"quick"});
    let scanIndex=0;
    const candidates = [];
    for (const template of activeTemplates) {
      const match = scans[scanIndex++];
      const threshold = Number(template.quickThreshold ?? template.threshold ?? 1) + (window.__LIE_THR_OFF || 0);
      candidates.push({
        id: template.id,
        label: template.label,
        score: match.score,
        threshold,
        matched: match.score >= threshold,
        templateScale: Number(template.templateScale || 1),
        detectionMode: "quick-hybrid",
        rect: {
          x: match.x * scaleBack,
          y: match.y * scaleBack,
          w: template.width * scaleBack,
          h: template.height * scaleBack
        }
      });
    }
    await verifyShapeContourCandidates(source,candidates);
    candidates.sort((a, b) => {
      const matchedOrder = Number(b.matched) - Number(a.matched);
      if (matchedOrder) return matchedOrder;
      const marginOrder = (b.score - b.threshold) - (a.score - a.threshold);
      return marginOrder || b.score - a.score;
    });
    const best = candidates[0] || { id: null, label: "없음", score: -1, threshold: 1, matched: false, rect: null };
    return {
      ...best,
      source: best.matched ? `경량 전체 화면 문구 패턴 · ${best.id}` : "경량 문구 패턴 없음",
      durationMs: Math.round(performance.now() - started),
      candidates
    };
  }

  // P4-R12: 첫 강한 후보의 두 번째 표만 확인하는 정밀 경로.
  // full matcher에서 이미 준비한 동일 템플릿/배율/모드를 그대로 사용하므로 점수식과 threshold는 바뀌지 않는다.
  async function analyzeTargeted(source, options = {}) {
    const started = performance.now();
    const allTemplates = await init();
    const requestedId = String(options.id || "");
    const requestedIds = Array.isArray(options.ids)
      ? new Set(options.ids.map((id) => String(id || "")).filter(Boolean))
      : (requestedId ? new Set([requestedId]) : null);
    const requestedScale = Number(options.templateScale);
    const requestedMode = String(options.detectionMode || "");
    const activeTemplates = allTemplates.filter((template) => {
      if (requestedIds && !requestedIds.has(String(template.id || ""))) return false;
      if (Number.isFinite(requestedScale) && Math.abs(Number(template.templateScale || 1) - requestedScale) > 1e-9) return false;
      if (requestedMode && String(template.detectionMode || template.mode || "hybrid") !== requestedMode) return false;
      return true;
    });
    const retainSidecar = RISING_SEED_SIDECAR_ENABLED && options.retainRisingSeedSidecar === true;
    const scanned = retainSidecar
      ? await scanActiveTemplates(source, activeTemplates, Number(options.analysisWidth)||0,Math.max(1,Math.min(6,Number(options.maxCandidates)||1)),{retainRisingSeedSidecar:true})
      : await scanActiveTemplates(source, activeTemplates, Number(options.analysisWidth)||0,Math.max(1,Math.min(6,Number(options.maxCandidates)||1)));
    const candidates = retainSidecar ? scanned.candidates : scanned;
    await verifyShapeContourCandidates(source,candidates);
    candidates.sort((a, b) => {
      const matchedOrder = Number(b.matched) - Number(a.matched);
      if (matchedOrder) return matchedOrder;
      const marginOrder = (b.score - b.threshold) - (a.score - a.threshold);
      return marginOrder || b.score - a.score;
    });
    const best = candidates[0] || { id: null, label: "없음", score: -1, threshold: 1, matched: false, rect: null };
    return {
      ...best,
      source: best.id ? `동일 템플릿 정밀 재확인 · ${best.id}` : "표적 템플릿 없음",
      durationMs: Math.round(performance.now() - started),
      ...(retainSidecar ? { sidecars: scanned.sidecars } : {}),
      candidates
    };
  }

  async function analyze(source) {
    const started = performance.now();
    const allTemplates = (await init()).filter(t=>!t.targetedOnly);
    analyzeSerial += 1;
    const forcedFullScan = analyzeSerial % FULL_SCAN_EVERY === 0;
    let selectedIds = null;
    let gateDurationMs = 0;

    if (!forcedFullScan && Array.isArray(gateTemplates) && gateTemplates.length) {
      const gateStarted = performance.now();
      const gateGroups = new Map();
      const bestById = new Map();
      for (let index = 0; index < gateTemplates.length; index += 1) {
        const template = gateTemplates[index];
        const mode = template.mode === "detail" ? "detail" : template.mode === "gray" ? "gray" : "hybrid";
        if (!gateGroups.has(mode)) gateGroups.set(mode, []);
        gateGroups.get(mode).push(index);
      }
      const gateMatches = new Array(gateTemplates.length);
      for (const [mode, indices] of gateGroups) {
        const extracted = mode === "gray"
          ? extractGrayFeatures(source, GATE_ANALYSIS_WIDTH)
          : extractFeatures(source, GATE_ANALYSIS_WIDTH);
        const scans = await window.MAlertContourWorker.scan(extracted, indices.map(index => gateTemplates[index]));
        for (let i = 0; i < indices.length; i += 1) gateMatches[indices[i]] = scans[i];
      }
      // Fold scores in original template order so equal-rank ID ordering and
      // the top-10 gate selection remain identical to the synchronous pass.
      for (let index = 0; index < gateTemplates.length; index += 1) {
        const template = gateTemplates[index];
        const match = gateMatches[index];
        const threshold = Number(template.threshold || 1) + (window.__LIE_THR_OFF || 0);
        const rank = Number(match.score || -1) - threshold;
        const id = String(template.id || "");
        const previous = bestById.get(id);
        if (!previous || rank > previous.rank) bestById.set(id, { id, rank, score: match.score });
      }
      const gateRanked = [...bestById.values()]
        .sort((a, b) => b.rank - a.rank || b.score - a.score);
      const ranked = gateRanked.slice(0, GATE_TOP_IDS).map((item) => item.id);
      const reservedTextInput = gateRanked
        .filter((item) => ["text-input-prompt-94463", "text-input-prompt-94465", "text-input-prompt-99116"].includes(String(item.id || "")))
        .map((item) => item.id);
      selectedIds = new Set([...ALWAYS_FULL_IDS, ...ranked, ...reservedTextInput]);
      gateDurationMs = performance.now() - gateStarted;
    }

    const activeTemplates = selectedIds
      ? allTemplates.filter((template) => selectedIds.has(String(template.id || "")))
      : allTemplates;
    const candidates = await scanActiveTemplates(source, activeTemplates);
    await verifyShapeContourCandidates(source,candidates);
    candidates.sort((a, b) => {
      const matchedOrder = Number(b.matched) - Number(a.matched);
      if (matchedOrder) return matchedOrder;
      const marginOrder = (b.score - b.threshold) - (a.score - a.threshold);
      return marginOrder || b.score - a.score;
    });
    const best = candidates[0] || { id: null, label: "없음", score: -1, threshold: 1, matched: false, rect: null };
    return {
      ...best,
      source: best.matched ? `로컬 거탐 문구 패턴 · ${best.id}` : "로컬 문구 패턴 없음",
      durationMs: Math.round(performance.now() - started),
      candidates,
      optimization: {
        scanMode: selectedIds ? "gated" : "full",
        forcedFullScan,
        gateDurationMs: Math.round(gateDurationMs),
        selectedIdCount: selectedIds ? selectedIds.size : null,
        scannedTemplateCount: activeTemplates.length,
        totalTemplateCount: allTemplates.length,
        selectedIds: selectedIds ? [...selectedIds] : null
      }
    };
  }

  window.MAlertTextContourMatcher = { researchAdaptiveCurrentRasterEnabled:()=>ADAPTIVE_CURRENT_RASTER_ENABLED, researchAdaptiveCurrentRasterStatus:()=>({...adaptiveCurrentRasterStats,rows:adaptiveCurrentRasterStats.rows.map(r=>({...r,sourceFrameMarker:r.sourceFrameMarker?{...r.sourceFrameMarker}:null})),failureRows:adaptiveCurrentRasterStats.failureRows.map(r=>({...r,sourceFrameMarker:r.sourceFrameMarker?{...r.sourceFrameMarker}:null})),scope:"ADAPTIVE_RGB_DETAIL_256_CURRENT_GROUP_ONLY",originalSourceWrites:0,perCallFreshCanvases:true}), researchReferenceCanvasEnabled:()=>RGB_DETAIL_REFERENCE_CANVAS_ENABLED, researchReferenceCanvasStatus:()=>({normalized:rgbDetailReferenceCanvasStats.normalized,dimensions:rgbDetailReferenceCanvasStats.dimensions.map(x=>({...x}))}), init, analyze, analyzeQuick, analyzeTargeted, extractFeatures, extractGrayFeatures, verifyShapeContourCandidates, researchValidRootEnabled:()=>VALID_ROOT_RESEARCH_ENABLED, researchCompactSupportEnabled:()=>COMPACT_LARGE_SUPPORT_RESEARCH_ENABLED };
})();
