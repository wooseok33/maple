(() => {
  "use strict";
  const THRESHOLD = 0.86;
  // M392-B1: explicit local research only, default off. No OCR/threshold/vote change.
  const M392_WEAK_TEXT_INPUT_GUARD_ENABLED = window.__MALERT_M392_WEAK_TEXT_INPUT_GUARD === true && (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'));
  const M36_EXTRA_STRUCTURAL_OCR_ENABLED=window.__MALERT_M36_DUAL_SCOPE_EXTRA_EXPERIMENT===true&&window.__MALERT_SINGLE_CONFIRMATION_EXPERIMENT===true&&window.MAlertR39Release?.confirmationVotes===1&&window.__MALERT_RESEARCH_CONFIG?.strictThreeActualInputs===true&&(['127.0.0.1','localhost','[::1]','::1'].includes(window.location?.hostname||'') || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const m36ExtraStats={considered:0,attempted:0,passed:0,failed:0,incomplete:0,skipped:{},rows:[],dropped:0};
  function m36ExtraSkip(reason){m36ExtraStats.skipped[reason]=(m36ExtraStats.skipped[reason]||0)+1;}
  function m36ExtraRelated(candidate,attempt){
    if(!candidate||!attempt||attempt.textInputTemplateId!==candidate.id||!attempt.region)return false;
    const rect=attempt.textInputFixedPart==='top'?candidate.rect:attempt.textInputFixedPart==='bottom'?(candidate.bottomRect||(candidate.rect?{x:candidate.rect.x-candidate.rect.w*.08,y:candidate.rect.y+candidate.rect.h*1.82,w:candidate.rect.w*1.16,h:candidate.rect.h*.72}:null)):null;
    return Boolean(rect&&rectIou(attempt.region,rect)>.60);
  }
  function m36ExtraNonmatchState(candidates,added,elapsed){
    const reads=added.filter(a=>a.textInputFixedPart==='top'||a.textInputFixedPart==='bottom');
    if(!reads.length)return {status:'NOT_EXECUTED_ORIGINAL_BUDGET'};
    if(candidates.some(c=>reads.some(a=>m36ExtraRelated(c,a)&&(a.error===true||a.incomplete===true))))return {status:'INCOMPLETE',reason:'extra-error-or-incomplete'};
    if(!candidates.every(c=>['gray','color','adaptive'].every(variant=>reads.some(a=>m36ExtraRelated(c,a)&&a.textInputFixedPart==='top'&&a.region.variant===variant&&a.matched===false&&a.error!==true&&a.incomplete!==true))))return {status:'INCOMPLETE',reason:elapsed>=7000?'original-budget-partial':'extra-not-fully-completed-nonmatch'};
    return {status:'FINAL_FALSE'};
  }
  function m36ExtraEligibility(options,visited,attempts,elapsed){
    if(!M36_EXTRA_STRUCTURAL_OCR_ENABLED)return 'disabled';
    if(options.m36ScopedTextExtra!==true||!['main-existing-preLargeText','fresh-existing-semantic-probe'].includes(options.m36ScopedTextRoute))return 'not-existing-dual-text-scope';
    if(!TEXT_INPUT_STRUCTURAL_FALLBACK_RESEARCH_ENABLED||!TEXT_AFTER_NORMAL_FALLBACK_ENABLED)return 'original-research-disabled';
    if(options.textInputOnly!==true)return 'not-text-input-only';
    if(options.confirmationLabel||options.confirmationRect||options.confirmationGuides?.length||options.confirmationInlineGuide||options.confirmationInlineContour||options.inlineFixedOnly||options.inlineContourOnly||options.violettaFixedOnly||options.violettaGeneralOnly||options.blueInputOnly)return 'confirmation-or-other-scope';
    if(!Number.isFinite(elapsed)||elapsed>=7000)return 'original-budget-exhausted';
    if(!visited.length)return 'no-original-read-candidates';
    for(const candidate of visited){
      if(attempts.some(a=>m36ExtraRelated(candidate,a)&&(a.error===true||a.incomplete===true)))return 'original-error-or-incomplete';
      if(!['gray','color','adaptive'].every(variant=>attempts.some(a=>m36ExtraRelated(candidate,a)&&a.textInputFixedPart==='top'&&a.region.variant===variant&&a.matched===false&&a.error!==true&&a.incomplete!==true)))return 'original-not-fully-completed-nonmatch';
    }
    return null;
  }
  function m36ExtraReducedOptions(options,visited){const removed=[];const keep=(item,origin)=>{if(!item)return true;const exhausted=visited.find(r=>r.id===item.id&&r.rect&&item.rect&&rectIou(r.rect,item.rect)>.60);if(!exhausted)return true;removed.push({origin,id:item.id,rect:{...item.rect}});return false;};return{removed,options:{...options,contourBest:keep(options.contourBest,'contourBest')?options.contourBest:null,contourCandidates:(options.contourCandidates||[]).filter(item=>keep(item,'contourCandidates'))}};}
  function m36ExtraRecord(record,canvas){if(m36ExtraStats.rows.length<32)m36ExtraStats.rows.push(record);else m36ExtraStats.dropped++;}
  window.MAlertM36ExtraStructuralRegionOcr=Object.freeze({enabled:()=>M36_EXTRA_STRUCTURAL_OCR_ENABLED,status:()=>({...m36ExtraStats,rows:m36ExtraStats.rows.map(r=>({...r})),maxAdditionalCandidatesPerJob:1,scope:'existing-preLargeText-and-fresh-semantic-probe',diagnosticRowsLimit:32})});

  const TEXT_CONFIRMATION_FALLBACK_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_TEXT_CONFIRMATION_FALLBACK_EXPERIMENT===true;
  window.MAlertTextConfirmationFallbackResearch=Object.freeze({enabled:()=>TEXT_CONFIRMATION_FALLBACK_ENABLED,status:()=>({enabled:TEXT_CONFIRMATION_FALLBACK_ENABLED,
    afterNormalEnabled:TEXT_AFTER_NORMAL_FALLBACK_ENABLED,
    recordedConfirmationRows:textAfterNormalStats.rows.filter(r=>r.scope==='text-confirmation').map(r=>JSON.parse(JSON.stringify(r))),
    recordLimit:8,rowsDropped:textAfterNormalStats.rowsDropped,
    scope:'Only eligible textInputOnly exact-label finite-rect confirmation may bypass label/rect exclusion; all other M21 conditions and app confirmation remain unchanged',
    recordedRowsAreNotUnboundedTotals:true})});
  const TEXT_AFTER_NORMAL_FALLBACK_ENABLED=(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_TEXT_AFTER_NORMAL_FALLBACK_EXPERIMENT===true;
  const textAfterNormalStats={considered:0,attempted:0,passed:0,failed:0,incomplete:0,skipped:{},totalWallMs:0,rows:[],rowsDropped:0};
  function textAfterNormalEligibility(options,regions,attempts,elapsedMs) {
    if(!TEXT_AFTER_NORMAL_FALLBACK_ENABLED)return 'disabled';
    if(!TEXT_INPUT_STRUCTURAL_FALLBACK_RESEARCH_ENABLED)return 'original-structural-flag-off';
    if(options.textInputOnly!==true)return 'not-first-targeted-text';
    const confirmationRect=options.confirmationRect;
    const textConfirmationScope=TEXT_CONFIRMATION_FALLBACK_ENABLED&&options.textInputOnly===true&&options.confirmationLabel==='문자 입력형'&&
      confirmationRect&&['x','y','w','h'].every(k=>Number.isFinite(confirmationRect[k]))&&
      confirmationRect.x>=0&&confirmationRect.y>=0&&confirmationRect.w>0&&confirmationRect.h>0;
    if((!textConfirmationScope&&(options.confirmationLabel||options.confirmationRect))||options.confirmationGuides?.length||options.confirmationInlineGuide||
      options.confirmationInlineContour||options.inlineFixedOnly||options.inlineContourOnly||options.violettaFixedOnly||options.blueInputOnly)return 'confirmation-or-other-scope';
    if(!Number.isFinite(elapsedMs)||elapsedMs>=7000)return 'original-budget-exhausted';
    if(!regions.length||regions.some(r=>r.retrievalRecovery))return 'not-normal-regions';
    if(!regions.every(r=>['gray','color','adaptive'].every(variant=>attempts.some(a=>
      a.textInputFixedPart==='top'&&a.textInputTemplateId===r.id&&a.region?.variant===variant&&a.error!==true&&
      a.region&&r.rect&&rectIou(a.region,r.rect)>.60))))return 'normal-not-fully-read';
    return null;
  }
  window.MAlertTextAfterNormalFallbackResearch=Object.freeze({enabled:()=>TEXT_AFTER_NORMAL_FALLBACK_ENABLED,status:()=>({enabled:TEXT_AFTER_NORMAL_FALLBACK_ENABLED,
    considered:textAfterNormalStats.considered,attempted:textAfterNormalStats.attempted,passed:textAfterNormalStats.passed,failed:textAfterNormalStats.failed,
    incomplete:textAfterNormalStats.incomplete,totalWallMs:textAfterNormalStats.totalWallMs,skipped:{...textAfterNormalStats.skipped},rowsDropped:textAfterNormalStats.rowsDropped,
    rows:JSON.parse(JSON.stringify(textAfterNormalStats.rows)),scope:'First textInputOnly only, no confirmation; one remaining existing base(true) candidate in same original OCR job/budget; M20 matcher retained'})});

  // R17: local, explicit, default-off fixed-letter edge sampling research.
  const FIXED_INSTRUCTION_EDGE_RADIUS2_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.fixedInstructionEdgeRadius2 === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R12: loopback-only current-parent read-order research, immutable/default off.
  const READ_CURRENT_FIXED_YELLOW_PARENT_FIRST_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.readCurrentFixedYellowParentFirst === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R11: explicit loopback-only current-parent order research, default off.
  const PREFER_CURRENT_FIXED_YELLOW_PARENT_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.preferCurrentFixedYellowParent === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R10: explicit loopback-only order research, immutable and default off.
  const PREFER_CONFIRMED_YELLOW_CANDIDATE_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.preferConfirmedYellowCandidate === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R9: disabled unless explicitly enabled on loopback at script load.
  const EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.earlyYellowAfterFixed === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  // R8: the additional call only exposes the unchanged general Violetta block.
  const FAST_VIOLETTA_SPLIT_AFTER_FIXED_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.fastViolettaSplitAfterFixed === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  const TEXT_INPUT_STRUCTURAL_FALLBACK_RESEARCH_ENABLED = window.__MALERT_RESEARCH_CONFIG?.textInputStructuralFallback === true && ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (["127.0.0.1", "localhost", "[::1]", "::1"].includes(window.location?.hostname || "") || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true)));
  let worker = null;
  let workerPromise = null;
  let currentPsm = null;
  let statusCallback = null;
  let recognitionCount = 0;
  let analysisCount = 0;
  const MAX_RECOGNITIONS_BEFORE_RECYCLE = 240;
  const MAX_ANALYSES_BEFORE_RECYCLE = 40;
  const TITLE_WORD_MATCH_THRESHOLD = 0.88;
  const VIOLETTA_STRUCTURE_THRESHOLD = 0.93;
  const VIOLETTA_HEADER_THRESHOLD = 0.82;
  const TEXT_INPUT_TEMPLATE_ID_PATTERN = /^text-input-prompt-/;
  // 영문 제목의 '독립 팝업 동반 증거'로 인정할 템플릿 ID 목록.
  // app.js의 POPUP_TEMPLATE_ID_PATTERN과 반드시 동일하게 유지할 것.
  // 신규 템플릿을 추가할 때 두 곳을 함께 갱신하지 않으면
  // 해당 팝업이 영문 제목 경로에서 동반 증거로 인정되지 않아 미탐이 발생한다.
  const POPUP_TEMPLATE_ID_PATTERN =
    /^(78001|77983|77984|77986|77987|77988|77997|click-prompt|inline-click-88992|inline-click-88993|inline-click-94425|transparent-click-88946|transparent-shape-77982)$/;
  const TITLE_WORD_TEMPLATE_FILES = [
    "lie-title-77959.png",
    "lie-title-77985.png",
    "lie-title-78000.png",
    "lie-title-78002.png"
  ];
  let titleWordTemplatePromise = null;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = (v) => String(v || "").normalize("NFKC").toUpperCase().replace(/[^0-9A-Z가-힣]/g, "");

  function levenshtein(a, b, limit = 99) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > limit) return limit + 1;
    let p = Array.from({ length: b.length + 1 }, (_, i) => i);
    let c = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i += 1) {
      c[0] = i;
      let rowMin = i;
      for (let j = 1; j <= b.length; j += 1) {
        c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        rowMin = Math.min(rowMin, c[j]);
      }
      if (rowMin > limit) return limit + 1;
      [p, c] = [c, p];
    }
    return p[b.length];
  }

  function has(text, keyword, distance) {
    const source = norm(text);
    const target = norm(keyword);
    if (!source || !target) return false;
    if (source.includes(target)) return true;
    for (let length = Math.max(1, target.length - distance); length <= Math.min(source.length, target.length + distance); length += 1) {
      for (let start = 0; start + length <= source.length; start += 1) {
        if (levenshtein(source.slice(start, start + length), target, distance) <= distance) return true;
      }
    }
    return false;
  }

  function hasPhrase(text, phrase, distance, minRatio = 0.65) {
    const source = norm(text);
    const target = norm(phrase);
    if (!source || !target) return false;
    if (source.includes(target)) return true;
    const minLength = Math.max(2, Math.ceil(target.length * minRatio), target.length - distance);
    const maxLength = Math.min(source.length, target.length + distance);
    for (let length = minLength; length <= maxLength; length += 1) {
      for (let start = 0; start + length <= source.length; start += 1) {
        if (levenshtein(source.slice(start, start + length), target, distance) <= distance) return true;
      }
    }
    return false;
  }

  const SUPPORTED_CLICK_PHRASES = [
    "2번클릭하세요",
    "3번클릭하세요",
    "5번클릭하세요"
  ];

  // 클릭 안내 어미. OCR 오인식(클릭→클랙/클를)과 잘린 어미까지 허용한다.
  const CLICK_VERB = "(?:클릭하세요|클릭하세|클릭하|클릭|클랙|클를)";
  // 반드시 "숫자 + 번" 뒤에 곧바로 클릭 어미가 붙어 있어야 한다.
  // 숫자와 클릭 문구를 화면 아무 곳에서나 따로 잡아 결합하면
  // "3층 보스 클리어", "5분 뒤에 클리어" 같은 일반 문구가 그대로 오탐이 된다.
  const SUPPORTED_CLICK_NEAR = new RegExp("[235]번" + CLICK_VERB);
  // 숫자가 한글로 오인식되는 경우의 보조 경로.
  const SUPPORTED_CLICK_KOREAN_NUMERAL = new RegExp("(?:이번|삼번|오번)" + CLICK_VERB);

  function hasSupportedClickInstruction(text) {
    const source = norm(text);
    if (!source) return false;
    if (SUPPORTED_CLICK_PHRASES.some((phrase) => source.includes(phrase))) return true;
    if (SUPPORTED_CLICK_NEAR.test(source)) return true;
    return SUPPORTED_CLICK_KOREAN_NUMERAL.test(source);
  }


  // 문자 입력형 하단 고정 문구. 카운트다운 숫자나 CAPTCHA 랜덤 문자열은 사용하지 않는다.
  function hasTextInputBottomPrompt(text) {
    const source = norm(text);
    if (!source) return false;
    if (hasPhrase(source, "클릭후입력해주세요", 3, 0.60)) return true;
    return has(source, "클릭", 1) && hasPhrase(source, "입력해주세요", 2, 0.55);
  }

  const M39_SEM2_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_M39_SEM2_STRICT_INPUT_EXPERIMENT===true;
  function evaluateText(text) {
    const s = {
      corePhrase: hasPhrase(text, "거짓말탐지기", 2, 0.72),
      englishPhrase: hasPhrase(text, "LIEDETECTOR", 3, 0.70),
      englishLie: has(text, "LIE", 1),
      englishDetector: has(text, "DETECTOR", 1),
      lie: has(text, "거짓말", 1),
      detector: has(text, "탐지기", 1) || has(text, "탐지", 0),
      activation: has(text, "발동되었습니다", 2) || has(text, "발동되었", 1) || has(text, "발동", 0),
      mini: has(text, "미니게임", 1),
      start: has(text, "시작됩니다", 2) || has(text, "시작", 0),
      click: has(text, "클릭하세요", 2) || has(text, "번클릭", 1) || has(text, "클릭", 0),
      clickCount: /[1-9]번/.test(norm(text)),
      supportedClickCount: /[235]번/.test(norm(text)),
      supportedClickInstruction: hasSupportedClickInstruction(text),
      input: has(text, "입력을위해", 2) || has(text, "입력", 0),
      inputLoose: has(text, "입력", 1),
      image: has(text, "이미지", 1),
      hangul: has(text, "한글", 1),
      enter: has(text, "엔터키", 2) || has(text, "엔터", 1),
      visible: hasPhrase(text, "보이는대로", 2, 0.65) || has(text, "보이는", 1),
      afterInput: hasPhrase(text, "입력한후", 2, 0.65),
      purpose: has(text, "위해", 0),
      first: has(text, "먼저", 0),
      violetta: has(text, "비올레타", 1) || has(text, "비올렛", 1),
      beautiful: has(text, "아름답게", 2) || has(text, "화장한", 1) || has(text, "화려한", 1),
      find: has(text, "찾아주세요", 2) || has(text, "찾아", 0) || has(text, "추적해주세요", 2) || has(text, "추적", 1),
      correct: has(text, "정답", 0),
      test: has(text, "테스트", 1),
      pass: has(text, "통과", 0),
      fail: has(text, "실패", 0),
      mouse: has(text, "마우스커서", 2) || has(text, "마우스", 0),
      move: has(text, "움직여", 1) || has(text, "움직이는", 2)
    };

    const evidence = [];
    if (s.englishLie) evidence.push("LIE");
    if (s.englishDetector) evidence.push("DETECTOR");
    if (s.lie) evidence.push("거짓말");
    if (s.detector) evidence.push("탐지기");
    if (s.activation) evidence.push("발동");
    if (s.mini) evidence.push("미니게임");
    if (s.start) evidence.push("시작");
    if (s.click) evidence.push("클릭");
    if (s.clickCount) evidence.push("클릭횟수");
    if (s.supportedClickInstruction) evidence.push("2·3·5번 클릭 안내");
    if (s.input) evidence.push("입력");
    if (s.image) evidence.push("이미지");
    if (s.hangul) evidence.push("한글");
    if (s.enter) evidence.push("엔터");
    if (s.visible) evidence.push("보이는 대로");
    if (s.first) evidence.push("먼저");
    if (s.violetta) evidence.push("비올레타");
    if (s.beautiful) evidence.push("화장/아름답게");
    if (s.find) evidence.push("찾아주세요");
    if (s.correct) evidence.push("정답");
    if (s.test) evidence.push("테스트");
    if (s.pass) evidence.push("통과");
    if (s.fail) evidence.push("실패");
    if (s.mouse) evidence.push("마우스");
    if (s.move) evidence.push("움직임");

    let score = 0;
    let reason = "핵심 문구 2개 미만";
    let label = "거짓말 탐지기 문구";

    // 반드시 같은 OCR 후보 영역 안에서 관련 핵심 문구가 둘 이상 확인되어야 한다.
    // 영문 제목은 일반 OCR 문자열에서 단독 확정하지 않는다.
    // 실제 제목 전용 영역 + 별도 팝업 증거가 있을 때 evaluateEnglishHeader() 경로에서만 사용한다.
    if (s.corePhrase) [score, reason] = [0.98, "거짓말 탐지기 문구 유사 일치"];
    else if (s.lie && s.detector) [score, reason] = [0.98, "거짓말 + 탐지기"];
    else if (s.lie && s.activation) [score, reason] = [0.97, "거짓말 + 발동"];
    else if (s.detector && s.activation) [score, reason] = [0.96, "탐지기 + 발동"];
    else if (s.violetta && (s.beautiful || s.find || s.correct || s.test || s.pass || s.fail)) [score, reason, label] = [0.98, "비올레타 + 전용 안내 문구", "비올레타형"];
    else if ([s.image, s.hangul, s.inputLoose, s.enter, s.visible].filter(Boolean).length >= 4 && s.inputLoose && (s.image || s.hangul)) [score, reason, label] = [0.97, "이미지/한글/입력/엔터 문자입력 안내", "문자 입력형"];
    else if (s.hangul && (M39_SEM2_ENABLED ? s.input : s.inputLoose) && (s.visible || s.afterInput || s.enter)) [score, reason, label] = [0.95, "한글 + 입력 + 문자입력 문맥", "문자 입력형"];
    else if (s.lie && s.mini && s.start) [score, reason] = [0.96, "거짓말 + 미니게임 + 시작"];
    else if (s.mini && s.start && (s.detector || s.lie)) [score, reason] = [0.95, "탐지 문맥 + 미니게임 시작"];
    else if (s.mini && s.start) [score, reason] = [0.90, "미니게임 시작 문구"];
    else if (s.supportedClickInstruction && (s.input || s.first || s.purpose || s.activation || s.corePhrase)) [score, reason] = [0.96, "2·3·5번 클릭 안내 + 거탐 문맥"];
    else if (s.input && s.click && (s.first || s.purpose || s.mouse || s.move)) [score, reason] = [0.93, "입력 + 클릭 안내"];
    else if (s.activation && s.input && (s.first || s.click || s.purpose)) [score, reason] = [0.94, "발동 + 입력 안내"];
    else if (s.click && s.input && (s.first || s.mouse || s.purpose)) [score, reason] = [0.93, "클릭 + 입력 안내"];
    else if (s.mouse && s.move && (s.test || s.pass || s.fail || s.click)) [score, reason] = [0.91, "마우스 이동 + 테스트 안내"];
    else {
      const unique = new Set(evidence);
      score = Math.min(0.84, unique.size * 0.16);
    }

    return { score, matched: score >= THRESHOLD, label, reason, signals: s, evidence: [...new Set(evidence)] };
  }

  function evaluateEnglishHeader(text) {
    const letters=String(text||"").toUpperCase().replace(/[^A-Z]/g,"");
    const target="LIEDETECTOR";
    if(!letters || letters.length < 10 || letters.length > 14){
      return {score:0,matched:false,label:"거짓말 탐지기 문구",reason:"영문 제목 길이 불일치",text:String(text||"").trim(),rect:null,evidence:[]};
    }
    let bestDistance=99;
    const minLength=Math.max(10,target.length-1);
    const maxLength=Math.min(letters.length,target.length+1);
    for(let length=minLength;length<=maxLength;length+=1){
      for(let start=0;start+length<=letters.length;start+=1){
        bestDistance=Math.min(bestDistance,levenshtein(letters.slice(start,start+length),target,1));
      }
    }
    const exact=letters===target || letters.includes(target);
    const full=exact || bestDistance<=1;
    if(full){
      return {score:exact?0.99:0.95,matched:true,label:"거짓말 탐지기 팝업",reason:"LIE DETECTOR 영문 제목 엄격 일치",text:String(text||"").trim(),rect:null,evidence:["LIEDETECTOR"]};
    }
    return {score:0,matched:false,label:"거짓말 탐지기 문구",reason:"영문 제목 미확인",text:String(text||"").trim(),rect:null,evidence:[]};
  }

  function parseLines(tsv, offset, scaleBack, frameW, frameH) {
    const map = new Map();
    const rows = String(tsv || "").split(/\r?\n/);
    for (let i = 1; i < rows.length; i += 1) {
      const c = rows[i].split("\t");
      if (c.length < 12 || c[0] !== "5") continue;
      const text = c.slice(11).join("\t").trim();
      if (!text) continue;
      const key = `${c[2]}:${c[3]}:${c[4]}`;
      const l = offset.x + Number(c[6]) * scaleBack;
      const t = offset.y + Number(c[7]) * scaleBack;
      const r = l + Number(c[8]) * scaleBack;
      const b = t + Number(c[9]) * scaleBack;
      const item = map.get(key) || { block: c[2], words: [], l, t, r, b };
      item.words.push(text); item.l = Math.min(item.l, l); item.t = Math.min(item.t, t); item.r = Math.max(item.r, r); item.b = Math.max(item.b, b);
      map.set(key, item);
    }
    const lines = [...map.values()].map(x => ({ ...x, text: x.words.join(" "), rect: { x: x.l, y: x.t, w: x.r - x.l, h: x.b - x.t } }));
    const counts = new Map();
    lines.forEach(x => counts.set(x.block, (counts.get(x.block) || 0) + 1));
    return lines.filter(x => {
      const cx = x.rect.x + x.rect.w / 2, cy = x.rect.y + x.rect.h / 2;
      return !(cx < frameW * .55 && cy > frameH * .72 && x.rect.h < frameH * .021 && (counts.get(x.block) || 0) >= 5);
    }).sort((a, b) => a.t - b.t || a.l - b.l);
  }

  function union(lines) {
    const l = Math.min(...lines.map(x => x.rect.x)), t = Math.min(...lines.map(x => x.rect.y));
    const r = Math.max(...lines.map(x => x.rect.x + x.rect.w)), b = Math.max(...lines.map(x => x.rect.y + x.rect.h));
    return { x: l, y: t, w: r - l, h: b - t };
  }

  function evaluateRecognition(text, tsv, geometry) {
    const lines = parseLines(tsv, geometry.offset, geometry.scaleBack, geometry.frameW, geometry.frameH);
    const groups = lines.map(x => ({ text: x.text, lines: [x] }));
    for (let i = 0; i < lines.length; i += 1) {
      const cluster = [lines[i]];
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j += 1) {
        const prev = cluster[cluster.length - 1], next = lines[j];
        if (next.t - prev.b > geometry.frameH * .065) break;
        cluster.push(next);
        groups.push({ text: cluster.map(x => x.text).join(" "), lines: [...cluster] });
      }
    }
    groups.push({ text: String(text || ""), lines, whole: true });
    let best = { score: 0, matched: false, label: "거짓말 탐지기 문구", reason: "OCR 문구 없음", text: "", rect: null };
    for (const g of groups) {
      const e = evaluateText(g.text);
      // signals에 english 키는 존재하지 않으므로 기존 조건은 사실상 아래와 같이 동작했다.
      // 여러 영역의 글자가 이어 붙은 전체 문자열은 0.94 이상일 때만 채택한다.
      if (g.whole && e.score < .94) continue;
      if (e.score > best.score) best = { ...e, text: g.text.trim(), rect: g.lines.length ? union(g.lines) : null };
    }
    return best;
  }

  const R3_FRAME_YIELD=window.__MALERT_OCR_FRAME_YIELD_EXPERIMENT===true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  const r3OcrStats={stageChecks:0,expiredJobs:0};
  window.MAlertOcrFrameEngineResearch=Object.freeze({enabled:()=>R3_FRAME_YIELD,status:()=>({...r3OcrStats})});
  function r3SupersededError(){const e=new Error('Actual OCR timeout yielded obsolete input');e.code='OCR_SUPERSEDED';return e;}
  function r3Check(job=activeOcrJob){
    if(!R3_FRAME_YIELD || !job?.r3FramePolicy)return;
    r3OcrStats.stageChecks++;
    if(!job.r3FramePolicy.isCurrent())throw ocrCancelledError();
    if(job.r3Superseded)throw r3SupersededError();
  }
  function r3AfterTimeout(error,timeoutMs){
    if(!R3_FRAME_YIELD || error?.code!=='OCR_TIMEOUT' || !activeOcrJob?.r3FramePolicy)return;
    if(activeOcrJob.r3FramePolicy.onRecognitionTimeout(timeoutMs)){
      activeOcrJob.r3Superseded=true;r3OcrStats.expiredJobs++;throw r3SupersededError();
    }
  }
  let workerEpoch = 0;
  let cancelGeneration = 0;
  let analysisTail = Promise.resolve();
  let activeOcrJob = null;

  function ocrCancelledError() {
    const error = new Error("종료된 OCR 작업 결과 폐기");
    error.code = "OCR_CANCELLED";
    return error;
  }

  function assertOcrJobCurrent(job = activeOcrJob) {
    if (job && job.generation !== cancelGeneration) throw ocrCancelledError();
    r3Check(job);
  }

  function waitForOcrJob(task, job = activeOcrJob) {
    return job ? Promise.race([task, job.cancelled]) : task;
  }

  async function disposeOcrWorker(instance) {
    if (!instance) return;
    // Keep the facade's internal Worker reference intact while deferred image
    // conversion can still post to it. Sending to a stopped Worker is harmless;
    // calling facade.terminate() as well would set that reference to null.
    if (typeof instance.worker?.terminate === "function") {
      instance.worker.terminate();
    } else {
      try { await instance.terminate?.(); } catch (_) {}
    }
  }

  async function resetOcrWorker(reason = "OCR 워커 재시작") {
    workerEpoch += 1;
    const active = worker;
    worker = null;
    workerPromise = null;
    currentPsm = null;
    recognitionCount = 0;
    await disposeOcrWorker(active);
    statusCallback?.(reason);
  }

  async function initOcrWorker() {
    if (workerPromise) return workerPromise;
    if (worker) return worker;
    if (!window.Tesseract) throw new Error("OCR 라이브러리가 없습니다.");
    const epoch = workerEpoch;
    let expired = false, timer = null;
    const loading = (async () => {
      statusCallback?.("한글 OCR 준비 중");
      const createTask = window.Tesseract.createWorker("kor+eng", window.Tesseract.OEM.LSTM_ONLY, {
        workerPath: new URL("../assets/ocr/worker.min.js?v=1149r16", document.baseURI).href,
        corePath: new URL("../assets/ocr/core", document.baseURI).href,
        ...(window.__LIE_LANG_LOCAL === false ? {} : { langPath: new URL("../assets/ocr/lang", document.baseURI).href }),
        logger: m => { if (m?.status === "recognizing text") statusCallback?.("거탐 문구 읽는 중"); }
      });
      createTask.then(instance => {
        if (expired || epoch !== workerEpoch) disposeOcrWorker(instance).catch(() => {});
      }, () => {});
      const instance = await Promise.race([createTask, new Promise((_, reject) => {
        timer = setTimeout(() => { expired = true; const error = new Error("OCR 워커 준비 20초 제한 초과"); error.code = "OCR_INIT_TIMEOUT"; reject(error); }, 20000);
      })]);
      if (expired || epoch !== workerEpoch) throw ocrCancelledError();
      await instance.setParameters({tessedit_pageseg_mode:window.Tesseract.PSM.SPARSE_TEXT,preserve_interword_spaces:"1"});
      if (epoch !== workerEpoch) { await disposeOcrWorker(instance); throw ocrCancelledError(); }
      worker = instance;
      currentPsm = window.Tesseract.PSM.SPARSE_TEXT;
      statusCallback?.("한글 OCR 준비");
      return instance;
    })();
    workerPromise = loading;
    try { return await loading; }
    catch (error) { if (workerPromise === loading) { workerPromise = null; worker = null; } throw error; }
    finally { if (timer) clearTimeout(timer); }
  }

  async function setPsm(psm, instance = worker) {
    assertOcrJobCurrent();
    if (!instance || instance !== worker) throw ocrCancelledError();
    if (currentPsm === psm) return;
    await waitForOcrJob(instance.setParameters({ tessedit_pageseg_mode: psm, preserve_interword_spaces: "1" }));
    assertOcrJobCurrent();
    if (instance !== worker) throw ocrCancelledError();
    currentPsm = psm;
  }

  function normalizeRect(rect, w, h) {
    const x = clamp(Math.round(Number(rect?.x || 0)), 0, w - 1), y = clamp(Math.round(Number(rect?.y || 0)), 0, h - 1);
    return { x, y, w: clamp(Math.round(Number(rect?.w || w)), 1, w - x), h: clamp(Math.round(Number(rect?.h || h)), 1, h - y) };
  }


  function detectEdgeTextRegions(source) {
    const targetWidth = Math.min(960, Math.max(640, source.width));
    const scale = targetWidth / source.width;
    const targetHeight = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, targetWidth, targetHeight);
    const rgba = context.getImageData(0, 0, targetWidth, targetHeight).data;
    const count = targetWidth * targetHeight;
    const gray = new Uint8Array(count);
    for (let i = 0; i < count; i += 1) {
      const o = i * 4;
      gray[i] = Math.round(0.299 * rgba[o] + 0.587 * rgba[o + 1] + 0.114 * rgba[o + 2]);
    }

    const edge = new Uint8Array(count);
    const integral = new Uint32Array((targetWidth + 1) * (targetHeight + 1));
    const stride = targetWidth + 1;
    for (let y = 1; y < targetHeight - 1; y += 1) {
      for (let x = 1; x < targetWidth - 1; x += 1) {
        const i = y * targetWidth + x;
        const gx = -gray[i-targetWidth-1] + gray[i-targetWidth+1] - 2*gray[i-1] + 2*gray[i+1] - gray[i+targetWidth-1] + gray[i+targetWidth+1];
        const gy = -gray[i-targetWidth-1] - 2*gray[i-targetWidth] - gray[i-targetWidth+1] + gray[i+targetWidth-1] + 2*gray[i+targetWidth] + gray[i+targetWidth+1];
        if (Math.abs(gx) + Math.abs(gy) >= 110) edge[i] = 1;
      }
    }
    for (let y = 1; y <= targetHeight; y += 1) {
      let row = 0;
      for (let x = 1; x <= targetWidth; x += 1) {
        row += edge[(y-1)*targetWidth + (x-1)];
        integral[y*stride+x] = integral[(y-1)*stride+x] + row;
      }
    }
    const sum = (x,y,w,h) => {
      const x2=Math.min(targetWidth,x+w), y2=Math.min(targetHeight,y+h);
      return integral[y2*stride+x2]-integral[y*stride+x2]-integral[y2*stride+x]+integral[y*stride+x];
    };

    // 전체 화면과 9개 겹침 구역. 윤곽선은 순서만 정하고 최종 판정에는 사용하지 않는다.
    const raw=[];
    raw.push({x:0,y:0,w:targetWidth,h:targetHeight,kind:"full-gray",lineCount:0});
    raw.push({x:0,y:0,w:targetWidth,h:targetHeight,kind:"full-adaptive",lineCount:0});
    raw.push({x:0,y:0,w:targetWidth,h:targetHeight,kind:"full-color",lineCount:0});
    const ww=Math.round(targetWidth*0.58), hh=Math.round(targetHeight*0.60);
    const xs=[0,Math.round((targetWidth-ww)/2),targetWidth-ww];
    const ys=[0,Math.round((targetHeight-hh)/2),targetHeight-hh];
    for (const y of ys) for (const x of xs) raw.push({x,y,w:ww,h:hh,kind:"edge-window",lineCount:0});

    const candidates=raw.map((r,index)=>{
      const edges=sum(r.x,r.y,r.w,r.h);
      const density=edges/Math.max(1,r.w*r.h);
      const fullBonus=r.kind.startsWith("full-") ? 1e9 - index*1e6 : 0;
      return {
        x:r.x/scale,y:r.y/scale,w:r.w/scale,h:r.h/scale,
        kind:r.kind,lineCount:0,edgeCount:edges,edgeDensity:density,
        edgeScore:fullBonus + edges*(0.7+Math.min(0.25,density)*2.2),priority:index===0?1000:500-index
      };
    });
    return candidates.map(c=>({...c,...normalizeRect(c,source.width,source.height)}));
  }


  // 비올레타 팝업은 위치가 랜덤이므로 화면 전체를 동일한 가중치로 훑는다.
  // 무거운 전체 OCR 대신 청록 안내판 + 상하단 어두운 프레임 + 노란/분홍 보조색 구조로
  // 후보만 찾고, 실제 확정은 후보 내부 OCR의 "비올레타" 문구가 담당한다.
  function detectViolettaPopupRegions(source) {
    const targetWidth = Math.min(640, Math.max(480, source.width));
    const scale = targetWidth / source.width;
    const targetHeight = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth; canvas.height = targetHeight;
    const context = canvas.getContext("2d", {alpha:false, willReadFrequently:true});
    context.drawImage(source, 0, 0, targetWidth, targetHeight);
    const data = context.getImageData(0,0,targetWidth,targetHeight).data;
    const count = targetWidth * targetHeight;
    const masks = Array.from({length:6}, () => new Uint8Array(count));
    for (let i=0;i<count;i+=1) {
      const o=i*4, r=data[o], g=data[o+1], b=data[o+2];
      const max=Math.max(r,g,b), min=Math.min(r,g,b), delta=max-min;
      const sat=max>0 ? delta/max : 0;
      const value=max;
      // RGB에서 직접 계산한 넓은 청록 범위. 저화질 JPEG와 밝기 변화 허용.
      const cyan = b>=55 && g>=55 && b>=r*1.05 && g>=r*.95 && (g+b-r*2)>=28 && sat>=.12;
      const dark = value<105;
      const navy = b>=55 && b>=r*1.12 && g>=r*.92 && value<190 && sat>.22;
      const white = value>150 && delta<75;
      const yellow = r>105 && g>80 && b<Math.min(r,g)*.88 && delta>25;
      const pink = r>115 && b>80 && r>=g*1.08 && b>=g*.85 && delta>28;
      masks[0][i]=cyan?1:0; masks[1][i]=dark?1:0; masks[2][i]=navy?1:0;
      masks[3][i]=white?1:0; masks[4][i]=yellow?1:0; masks[5][i]=pink?1:0;
    }
    const stride=targetWidth+1;
    const integrals=masks.map(mask=>{
      const out=new Uint32Array((targetWidth+1)*(targetHeight+1));
      for(let y=1;y<=targetHeight;y+=1){let row=0;for(let x=1;x<=targetWidth;x+=1){row+=mask[(y-1)*targetWidth+x-1];out[y*stride+x]=out[(y-1)*stride+x]+row;}}
      return out;
    });
    const sum=(ii,x,y,w,h)=>{
      const x1=clamp(Math.round(x),0,targetWidth),y1=clamp(Math.round(y),0,targetHeight);
      const x2=clamp(Math.round(x+w),x1,targetWidth),y2=clamp(Math.round(y+h),y1,targetHeight);
      return ii[y2*stride+x2]-ii[y1*stride+x2]-ii[y2*stride+x1]+ii[y1*stride+x1];
    };
    const density=(index,x,y,w,h)=>sum(integrals[index],x,y,w,h)/Math.max(1,Math.max(0,Math.min(targetWidth,x+w)-Math.max(0,x))*Math.max(0,Math.min(targetHeight,y+h)-Math.max(0,y)));
    const raw=[];
    const fractions=[.12,.16,.20,.26,.34,.46,.62,.82,.94];
    for(const fraction of fractions){
      const w=Math.max(42,Math.round(targetWidth*fraction));
      const h=Math.max(14,Math.round(w/3.15));
      if(h>=targetHeight)continue;
      const step=Math.max(5,Math.round(w*.075));
      for(let y=0;y+h<=targetHeight;y+=step){
        for(let x=0;x+w<=targetWidth;x+=step){
          const cyan=density(0,x,y,w,h);
          if(cyan<.34)continue;
          const ring=Math.max(3,Math.round(h*.16));
          const outerArea=Math.max(1,(w+ring*2)*(h+ring*2)-w*h);
          const outsideCyan=(sum(integrals[0],x-ring,y-ring,w+ring*2,h+ring*2)-sum(integrals[0],x,y,w,h))/outerArea;
          const cyanContrast=clamp((cyan-outsideCyan)/.42,0,1);
          if(cyanContrast<.12)continue;
          const px=x-w*.06,pw=w*1.12;
          const aboveY=y-h*.78,aboveH=h*.72;
          const belowY=y+h,belowH=h*1.45;
          const aboveDark=density(1,px,aboveY,pw,aboveH);
          const aboveNavy=density(2,px,aboveY,pw,aboveH);
          const belowDark=density(1,px,belowY,pw,belowH);
          const yellow=density(4,x,y,w,h);
          const pink=density(5,x+w*.55,y+h,w*.50,h*1.60);
          const py=y-h*.85,ph=h*3.25,strip=Math.max(2,w*.025);
          const borderArea=Math.max(1,2*pw*strip+2*ph*strip);
          const borderWhite=(sum(integrals[3],px,py,pw,strip)+sum(integrals[3],px,py+ph-strip,pw,strip)+sum(integrals[3],px,py,strip,ph)+sum(integrals[3],px+pw-strip,py,strip,ph))/borderArea;
          const score=.33*Math.min(1,cyan/.62)+.20*cyanContrast+.12*Math.min(1,(aboveDark+aboveNavy)/.50)+.12*Math.min(1,belowDark/.45)+.08*Math.min(1,borderWhite/.22)+.08*Math.min(1,yellow/.035)+.07*Math.min(1,pink/.045);
          if(score<VIOLETTA_STRUCTURE_THRESHOLD)continue;
          raw.push({score,x,y,w,h,cyan,outsideCyan,cyanContrast,aboveDark,aboveNavy,belowDark,borderWhite,yellow,pink});
        }
      }
    }
    // 93327 계열은 안내문이 매우 넓고 낮은 청록 헤더(가로세로 약 8~14:1)로 표시된다.
    // 기존 3.15:1 패널 탐색과 별도로 헤더를 찾은 뒤, 주변 전체 팝업을 OCR 후보로 확장한다.
    const headerRaw=[];
    const headerFractions=[.14,.18,.22,.26,.30,.34];
    for(const fraction of headerFractions){
      const w=Math.max(70,Math.round(targetWidth*fraction));
      const h=Math.max(9,Math.round(w/10.5));
      if(h>=targetHeight)continue;
      const step=Math.max(4,Math.round(h*.55));
      for(let y=0;y+h<=targetHeight;y+=step){
        for(let x=0;x+w<=targetWidth;x+=step){
          const cyan=density(0,x,y,w,h);
          if(cyan<.30)continue;
          const ring=Math.max(2,Math.round(h*.18));
          const outerArea=Math.max(1,(w+ring*2)*(h+ring*2)-w*h);
          const outsideCyan=(sum(integrals[0],x-ring,y-ring,w+ring*2,h+ring*2)-sum(integrals[0],x,y,w,h))/outerArea;
          const cyanContrast=clamp((cyan-outsideCyan)/.36,0,1);
          if(cyanContrast<.16)continue;
          const aboveDark=density(1,x-w*.03,y-h*.95,w*1.06,h*.82);
          const belowDark=density(1,x-w*.03,y+h,w*1.06,h*2.7);
          // 실제 93327 비올레타 팝업은 긴 청록 안내 헤더 바로 아래에
          // 흰색 미니게임 본문 + 어두운 프레임이 함께 이어진다.
          // 전투 이펙트의 가는 청록 선/문구를 헤더로 오인하지 않도록 깊은 하단 구조를 교차검증한다.
          const belowWhiteDeep=density(3,x-w*.03,y+h,w*1.06,h*6.0);
          const belowDarkDeep=density(1,x-w*.03,y+h,w*1.06,h*6.0);
          const belowCyanDeep=density(0,x-w*.03,y+h,w*1.06,h*6.0);
          if(belowWhiteDeep<.28 || belowDarkDeep<.20 || belowDarkDeep>.50 || belowCyanDeep>.12)continue;
          const borderWhite=(
            sum(integrals[3],x-ring,y-ring,w+ring*2,ring)+
            sum(integrals[3],x-ring,y+h,w+ring*2,ring)+
            sum(integrals[3],x-ring,y,ring,h)+
            sum(integrals[3],x+w,y,ring,h)
          )/Math.max(1,2*(w+ring*2)*ring+2*h*ring);
          const yellow=density(4,x,y,w,h);
          const whiteInside=density(3,x,y,w,h);
          const score=.34*Math.min(1,cyan/.52)+.20*cyanContrast+.14*Math.min(1,belowDark/.55)+.10*Math.min(1,aboveDark/.55)+.10*Math.min(1,borderWhite/.34)+.07*Math.min(1,yellow/.055)+.05*Math.min(1,whiteInside/.22);
          if(score<VIOLETTA_HEADER_THRESHOLD)continue;
          headerRaw.push({score,x,y,w,h,cyan,cyanContrast,aboveDark,belowDark,belowWhiteDeep,belowDarkDeep,belowCyanDeep,borderWhite,yellow,whiteInside,headerMode:true});
        }
      }
    }
    raw.push(...headerRaw);
    raw.sort((a,b)=>b.score-a.score);
    const selected=[];
    for(const item of raw){
      const rect={x:item.x/scale,y:item.y/scale,w:item.w/scale,h:item.h/scale};
      if(selected.some(other=>rectIou(other.textRect,rect)>.38))continue;
      const popup=item.headerMode
        ? normalizeRect({x:(item.x-item.w*.04)/scale,y:(item.y-item.h*.82)/scale,w:(item.w*1.08)/scale,h:(item.h*8.35)/scale},source.width,source.height)
        : normalizeRect({x:(item.x-item.w*.10)/scale,y:(item.y-item.h*.92)/scale,w:(item.w*1.20)/scale,h:(item.h*3.45)/scale},source.width,source.height);
      selected.push({
        ...popup, rect:popup, textRect:normalizeRect(rect,source.width,source.height),
        kind:"violetta-candidate", variant:item.headerMode?"wide-header":"color", priority:9000-selected.length,
        score:item.score, threshold:item.headerMode?VIOLETTA_HEADER_THRESHOLD:VIOLETTA_STRUCTURE_THRESHOLD, diagnostics:{cyan:item.cyan,cyanContrast:item.cyanContrast,aboveDark:item.aboveDark,aboveNavy:item.aboveNavy,belowDark:item.belowDark,borderWhite:item.borderWhite,yellow:item.yellow,pink:item.pink,whiteInside:item.whiteInside,belowWhiteDeep:item.belowWhiteDeep,belowDarkDeep:item.belowDarkDeep,belowCyanDeep:item.belowCyanDeep,headerMode:Boolean(item.headerMode)}
      });
      if(selected.length>=5)break;
    }
    return selected;
  }

  function detectEnglishTitleRegions(source) {
    const targetWidth = Math.min(960, Math.max(640, source.width));
    const scale = targetWidth / source.width;
    const targetHeight = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d", {alpha:false, willReadFrequently:true});
    context.drawImage(source, 0, 0, targetWidth, targetHeight);
    const data = context.getImageData(0,0,targetWidth,targetHeight).data;
    const raw = new Uint8Array(targetWidth*targetHeight);
    for (let i=0;i<raw.length;i+=1) {
      const o=i*4, r=data[o], g=data[o+1], b=data[o+2];
      const warmGreen = r>70 && g>75 && b<170 && g>b+12 && r>b+8 && (r+g-2*b)>28;
      const cream = r>150 && g>130 && b<170 && (r+g-2*b)>34;
      if (warmGreen || cream) raw[i]=1;
    }
    // 글자 획을 가로로 묶어 한 줄 후보를 만든다.
    const dilated = new Uint8Array(raw.length);
    const rx=5, ry=1;
    for (let y=0;y<targetHeight;y+=1) {
      for (let x=0;x<targetWidth;x+=1) {
        let hit=0;
        for (let yy=Math.max(0,y-ry);yy<=Math.min(targetHeight-1,y+ry)&&!hit;yy+=1) {
          const base=yy*targetWidth;
          for (let xx=Math.max(0,x-rx);xx<=Math.min(targetWidth-1,x+rx);xx+=1) {
            if (raw[base+xx]) { hit=1; break; }
          }
        }
        dilated[y*targetWidth+x]=hit;
      }
    }
    const seen=new Uint8Array(dilated.length), stackX=new Int32Array(dilated.length), stackY=new Int32Array(dilated.length);
    const out=[];
    for (let sy=0;sy<targetHeight;sy+=1) for (let sx=0;sx<targetWidth;sx+=1) {
      const si=sy*targetWidth+sx;
      if (!dilated[si] || seen[si]) continue;
      let top=0,used=0,minX=sx,maxX=sx,minY=sy,maxY=sy,rawCount=0;
      stackX[top]=sx;stackY[top]=sy;top+=1;seen[si]=1;
      while(top>0){
        top-=1;const x=stackX[top],y=stackY[top];used+=1;if(raw[y*targetWidth+x])rawCount+=1;
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
        const ns=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
        for(const [nx,ny] of ns){if(nx<0||ny<0||nx>=targetWidth||ny>=targetHeight)continue;const ni=ny*targetWidth+nx;if(dilated[ni]&&!seen[ni]){seen[ni]=1;stackX[top]=nx;stackY[top]=ny;top+=1;}}
      }
      const w=maxX-minX+1,h=maxY-minY+1,aspect=w/Math.max(1,h);
      if(w<28||w>targetWidth*.16||h<4||h>targetHeight*.09||aspect<2.4||aspect>20||rawCount<10)continue;
      const x=(minX/scale),y=(minY/scale),rw=w/scale,rh=h/scale;
      const px=Math.max(16,rw*.22),py=Math.max(12,rh*1.15);
      const glyphRect=normalizeRect({x,y,w:rw,h:rh},source.width,source.height);
      const rect=normalizeRect({x:x-px,y:y-py,w:rw+px*2,h:rh+py*2},source.width,source.height);
      const score=rawCount*aspect/(1+Math.abs(h-targetHeight*.018));
      out.push({...rect,glyphRect,kind:"title-color",variant:"gray",lineCount:1,priority:7000+score,score});
    }
    out.sort((a,b)=>b.score-a.score);
    const unique=[];
    for(const item of out){if(unique.some(x=>rectIou(x,item)>.55))continue;unique.push(item);if(unique.length>=8)break;}
    return unique;
  }


  function loadImage(url) {
    return new Promise((resolve,reject)=>{
      const image=new Image();
      image.decoding="async";
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error(`제목 윤곽 템플릿 로드 실패: ${url}`));
      image.src=url;
    });
  }

  function extractTitleColorMask(source, rect = null) {
    const sx=rect ? Math.max(0,Math.floor(rect.x)) : 0;
    const sy=rect ? Math.max(0,Math.floor(rect.y)) : 0;
    const sw=rect ? Math.max(1,Math.min(source.width-sx,Math.ceil(rect.w))) : source.width;
    const sh=rect ? Math.max(1,Math.min(source.height-sy,Math.ceil(rect.h))) : source.height;
    const canvas=document.createElement("canvas");
    canvas.width=sw;canvas.height=sh;
    const context=canvas.getContext("2d",{alpha:false,willReadFrequently:true});
    context.drawImage(source,sx,sy,sw,sh,0,0,sw,sh);
    const rgba=context.getImageData(0,0,sw,sh).data;
    const mask=new Uint8Array(sw*sh);
    let count=0;
    for(let i=0;i<mask.length;i+=1){
      const o=i*4,r=rgba[o],g=rgba[o+1],b=rgba[o+2];
      const warmGreen=r>70&&g>75&&b<170&&g>b+12&&r>b+8&&(r+g-2*b)>28;
      const cream=r>150&&g>130&&b<170&&(r+g-2*b)>34;
      if(warmGreen||cream){mask[i]=1;count+=1;}
    }
    return {mask,width:sw,height:sh,count};
  }

  function normalizeTitleMask(input,targetW=200,targetH=40){
    const {mask,width,height}=input;
    let minX=width,minY=height,maxX=-1,maxY=-1,count=0;
    for(let y=0;y<height;y+=1){
      for(let x=0;x<width;x+=1){
        if(!mask[y*width+x])continue;
        count+=1;if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
    const out=new Uint8Array(targetW*targetH);
    if(!count||maxX<minX||maxY<minY)return {mask:out,width:targetW,height:targetH,count:0,aspect:0};
    const cropW=maxX-minX+1,cropH=maxY-minY+1;
    const scale=Math.min((targetW-10)/cropW,(targetH-6)/cropH);
    const newW=Math.max(1,Math.round(cropW*scale)),newH=Math.max(1,Math.round(cropH*scale));
    const ox=Math.floor((targetW-newW)/2),oy=Math.floor((targetH-newH)/2);
    for(let y=0;y<newH;y+=1){
      const srcY=minY+Math.min(cropH-1,Math.floor(y/scale));
      for(let x=0;x<newW;x+=1){
        const srcX=minX+Math.min(cropW-1,Math.floor(x/scale));
        if(mask[srcY*width+srcX])out[(oy+y)*targetW+ox+x]=1;
      }
    }
    let outCount=0;for(const v of out)outCount+=v;
    return {mask:out,width:targetW,height:targetH,count:outCount,aspect:cropW/Math.max(1,cropH)};
  }

  function shiftedDice(a,b,width=200,height=40){
    if(!a?.count||!b?.count)return 0;
    let best=0;
    for(let dy=-2;dy<=2;dy+=1){
      for(let dx=-4;dx<=4;dx+=1){
        let inter=0;
        for(let y=0;y<height;y+=1){
          const by=y-dy;if(by<0||by>=height)continue;
          for(let x=0;x<width;x+=1){
            if(!a.mask[y*width+x])continue;
            const bx=x-dx;if(bx<0||bx>=width)continue;
            if(b.mask[by*width+bx])inter+=1;
          }
        }
        const score=(2*inter)/Math.max(1,a.count+b.count);
        if(score>best)best=score;
      }
    }
    return best;
  }

  async function loadTitleWordTemplates(){
    if(titleWordTemplatePromise)return titleWordTemplatePromise;
    titleWordTemplatePromise=Promise.all(TITLE_WORD_TEMPLATE_FILES.map(async file=>{
      const image=await loadImage(`../assets/local-templates/${file}?v=1149r16`);
      return {id:file.replace(/\.png$/,""),...normalizeTitleMask(extractTitleColorMask(image))};
    })).catch(error=>{titleWordTemplatePromise=null;throw error;});
    return titleWordTemplatePromise;
  }

  async function matchHighConfidenceEnglishTitle(source,regions){
    if(!regions?.length)return {matched:false,score:0};
    const templates=await loadTitleWordTemplates();
    let best={matched:false,score:0,threshold:TITLE_WORD_MATCH_THRESHOLD};
    for(const region of regions.slice(0,10)){
      const glyph=normalizeTitleMask(extractTitleColorMask(source,region.glyphRect||region));
      if(glyph.count<20||glyph.aspect<2.5||glyph.aspect>12)continue;
      for(const template of templates){
        const score=shiftedDice(glyph,template);
        if(score>best.score){
          best={matched:score>=TITLE_WORD_MATCH_THRESHOLD,score,threshold:TITLE_WORD_MATCH_THRESHOLD,
            label:"거짓말 탐지기 팝업",reason:`LIE DETECTOR 고신뢰 글자 윤곽 · ${template.id}`,
            rect:region.glyphRect||region,region,templateId:template.id};
        }
      }
    }
    return best;
  }

  function rectIou(a,b){
    const x1=Math.max(a.x,b.x),y1=Math.max(a.y,b.y),x2=Math.min(a.x+a.w,b.x+b.w),y2=Math.min(a.y+a.h,b.y+b.h);
    const inter=Math.max(0,x2-x1)*Math.max(0,y2-y1),uni=a.w*a.h+b.w*b.h-inter;
    return uni>0?inter/uni:0;
  }

  function titleCompanionCandidate(options,titleRect,source){
    if(!titleRect)return null;
    const tr=normalizeRect(titleRect,source.width,source.height);
    const tcx=tr.x+tr.w/2,tcy=tr.y+tr.h/2;
    const eligible=POPUP_TEMPLATE_ID_PATTERN;
    return [options?.contourBest,...(options?.contourCandidates||[])]
      .filter(Boolean)
      .filter(item=>eligible.test(String(item.id||"")) && item.rect)
      .map(item=>{
        const cr=normalizeRect(item.rect,source.width,source.height);
        const threshold=Number(item.threshold||1),score=Number(item.score||-1);
        const expanded={x:cr.x-cr.w*.12,y:cr.y-cr.h*.16,w:cr.w*1.24,h:cr.h*1.32};
        const inside=tcx>=expanded.x&&tcx<=expanded.x+expanded.w&&tcy>=expanded.y&&tcy<=expanded.y+expanded.h;
        const nearAbove=tcy<=cr.y+cr.h*.45 && Math.abs(tcx-(cr.x+cr.w/2))<=Math.max(cr.w*.65,tr.w*2.2);
        return {item,score,threshold,margin:score-threshold,inside:inside||nearAbove};
      })
      .filter(x=>x.inside && x.margin>=-.04)
      .sort((a,b)=>b.margin-a.margin)[0]?.item||null;
  }


  // 문자 입력형은 CAPTCHA 내부 글자가 매번 바뀌므로 고정 안내 문구 템플릿을 위치 힌트로만 쓴다.
  // 템플릿 단독 확정은 금지하고, 안내문 자체의 획 밀도 + 바로 아래 CAPTCHA 띠 구조를 통과한 후보만 OCR한다.
  function detectTextInputPromptRegions(source, options={}) {
    const normal = detectTextInputPromptRegionsBase(source, options, false);
    if (normal.length || !TEXT_INPUT_STRUCTURAL_FALLBACK_RESEARCH_ENABLED) return normal;
    return detectTextInputPromptRegionsBase(source, options, true);
  }

  // Research recovery requires the complete implied layout before any clamp.
  // This does not restrict the original margin-qualified proposal path.
  function textInputFallbackLayoutStatus(guide, width, height) {
    const fits = r => r && [r.x,r.y,r.w,r.h,width,height].every(Number.isFinite) &&
      r.w>0 && r.h>0 && width>0 && height>0 && r.x>=0 && r.y>=0 &&
      r.x+r.w<=width && r.y+r.h<=height;
    const captcha = guide && {x:guide.x-guide.w*.08,y:guide.y+guide.h*.95,w:guide.w*1.16,h:guide.h*.85};
    // Use the untruncated CAPTCHA extent, never its normalized/clamped height.
    const bottom = guide && captcha && {x:guide.x-guide.w*.08,y:captcha.y+captcha.h*.96,w:guide.w*1.16,h:guide.h*.72};
    const firstClipped = !fits(guide) ? "guide" : !fits(captcha) ? "captcha" : !fits(bottom) ? "bottom" : null;
    return {valid:firstClipped===null,firstClipped,guide,captcha,bottom};
  }

  function detectTextInputPromptRegionsBase(source, options={}, structuralFallback=false) {
    const pool=[options?.contourBest,...(options?.contourCandidates||[])]
      .filter(Boolean)
      .filter(item=>TEXT_INPUT_TEMPLATE_ID_PATTERN.test(String(item.id||""))&&item.rect)
      .filter(item=>!structuralFallback || textInputFallbackLayoutStatus(item.rect,source.width,source.height).valid)
      .map(item=>({
        id:String(item.id||""),score:Number(item.score||-1),threshold:Number(item.threshold||1),
        margin:Number(item.score||-1)-Number(item.threshold||1),
        rect:normalizeRect(item.rect,source.width,source.height),templateScale:Number(item.templateScale||1)
      }))
      // P4-R13: 94463 계열은 스킬 이펙트가 겹친 실화면에서 -0.055까지 내려갔다.
      // 최종 확정 기준은 낮추지 않고, -0.06까지는 아래의 강한 안내문/CAPTCHA 구조 게이트를 거쳐 OCR 대상으로만 회수한다.
      .filter(item=>item.margin>=.02||
        (item.id==="text-input-prompt-99116"&&item.margin>=-.04)||
        (item.id==="text-input-prompt-94463"&&item.margin>=-.06)||
        (structuralFallback&&item.id==="text-input-prompt-94463"))
      .sort((a,b)=>b.margin-a.margin||b.score-a.score);
    if(!pool.length)return [];

    const targetWidth=Math.min(640,Math.max(480,source.width));
    const scale=targetWidth/source.width;
    const targetHeight=Math.max(1,Math.round(source.height*scale));
    const canvas=document.createElement("canvas");canvas.width=targetWidth;canvas.height=targetHeight;
    const context=canvas.getContext("2d",{alpha:false,willReadFrequently:true});
    context.drawImage(source,0,0,targetWidth,targetHeight);
    const data=context.getImageData(0,0,targetWidth,targetHeight).data;
    const count=targetWidth*targetHeight;
    const edge=new Uint8Array(count),sat=new Uint8Array(count);
    const gray=new Uint8Array(count);
    for(let i=0;i<count;i+=1){const o=i*4,r=data[o],g=data[o+1],b=data[o+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);gray[i]=Math.round(.299*r+.587*g+.114*b);sat[i]=(mx>0&&(mx-mn)/mx>=.25)?1:0;}
    for(let y=1;y<targetHeight-1;y+=1)for(let x=1;x<targetWidth-1;x+=1){const i=y*targetWidth+x;const grad=Math.abs(gray[i+1]-gray[i-1])+Math.abs(gray[i+targetWidth]-gray[i-targetWidth]);if(grad>=25)edge[i]=1;}
    const stride=targetWidth+1;
    const integral=(mask)=>{const out=new Uint32Array((targetWidth+1)*(targetHeight+1));for(let y=1;y<=targetHeight;y+=1){let row=0;for(let x=1;x<=targetWidth;x+=1){row+=mask[(y-1)*targetWidth+x-1];out[y*stride+x]=out[(y-1)*stride+x]+row;}}return out;};
    const edgeI=integral(edge),satI=integral(sat);
    const density=(ii,rect)=>{const x1=clamp(Math.round(rect.x*scale),0,targetWidth),y1=clamp(Math.round(rect.y*scale),0,targetHeight),x2=clamp(Math.round((rect.x+rect.w)*scale),x1,targetWidth),y2=clamp(Math.round((rect.y+rect.h)*scale),y1,targetHeight);const area=Math.max(1,(x2-x1)*(y2-y1));return (ii[y2*stride+x2]-ii[y1*stride+x2]-ii[y2*stride+x1]+ii[y1*stride+x1])/area;};
    const selected=[];
    for(const item of pool){
      const r=item.rect;
      const area=r.w*r.h/Math.max(1,source.width*source.height);
      if(area<.0015||area>.05)continue;
      const captchaRect=normalizeRect({x:r.x-r.w*.08,y:r.y+r.h*.95,w:r.w*1.16,h:r.h*.85},source.width,source.height);
      const textEdge=density(edgeI,r),captchaEdge=density(edgeI,captchaRect),textSat=density(satI,r),captchaSat=density(satI,captchaRect);
      // LS2.2-P1: 템플릿이 임계값 바로 아래여도 구조가 강하면 OCR 진입을 허용한다.
      // 근접 후보는 더 강한 획/CAPTCHA 조건을 요구해 사냥 UI 오탐 OCR 부하는 억제한다.
      const nearCandidate=item.margin<.02;
      const minTextEdge=nearCandidate?.18:.15,minCaptchaEdge=nearCandidate?.08:.06,minCaptchaSat=nearCandidate?.42:.35;
      if(textEdge<minTextEdge||captchaEdge<minCaptchaEdge||captchaSat<minCaptchaSat)continue;
      const visualScore=clamp(.52+Math.min(.20,Math.max(0,item.margin)*.55)+Math.min(.14,(textEdge-minTextEdge)*.75)+Math.min(.10,(captchaEdge-minCaptchaEdge)*.70)+Math.min(.04,(captchaSat-minCaptchaSat)*.12),0,1);
      const bottomRect=normalizeRect({x:r.x-r.w*.08,y:captchaRect.y+captchaRect.h*.96,w:r.w*1.16,h:r.h*.72},source.width,source.height);
      const candidate={...item,kind:"text-input-candidate",priority:9400-selected.length,visualScore,diagnostics:{textEdge,captchaEdge,textSat,captchaSat},captchaRect,bottomRect};
      // P3와 동일하게 margin 순서를 보존하고 같은 위치의 중복 스케일만 제거한다.
      // 기존 통과 표본의 후보 우선순위를 P4가 뒤집지 않게 한다.
      if(selected.some(other=>rectIou(other.rect,r)>.60))continue;
      selected.push(structuralFallback ? {...candidate, retrievalRecovery:"94463-structural-top1"} : candidate);
      if(selected.length>=(structuralFallback?1:6))break;
    }
    return selected;
  }

  // Yellow lettering is a localization hint only. OCR must still read a click
  // instruction and detector/input context; color alone never produces a vote.
  function detectYellowPromptRegions(source, options={}) {
    const width=Math.min(640,source.width),scale=width/source.width;
    const height=Math.round(source.height*scale),c=document.createElement("canvas");
    c.width=width;c.height=height;
    const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(source,0,0,width,height);
    const data=ctx.getImageData(0,0,width,height).data;
    const cell=4,gw=Math.ceil(width/cell),gh=Math.ceil(height/cell),counts=new Uint16Array(gw*gh);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
      if(r>150&&g>125&&b<Math.min(r,g)*.52&&r/g<1.45)counts[Math.floor(y/cell)*gw+Math.floor(x/cell)]++;
    }
    const seen=new Uint8Array(counts.length),regions=[];
    for(let seed=0;seed<counts.length;seed++){
      if(seen[seed]||counts[seed]<2)continue;
      const queue=[seed];seen[seed]=1;let x0=gw,y0=gh,x1=0,y1=0,pixels=0;
      for(let k=0;k<queue.length;k++){
        const at=queue[k],x=at%gw,y=Math.floor(at/gw);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);pixels+=counts[at];
        for(let dy=-5;dy<=5;dy++)for(let dx=-2;dx<=2;dx++){
          const nx=x+dx,ny=y+dy;if(nx<0||nx>=gw||ny<0||ny>=gh)continue;
          const ni=ny*gw+nx;if(!seen[ni]&&counts[ni]>=2){seen[ni]=1;queue.push(ni);}
        }
      }
      const w=(x1-x0+1)*cell,h=(y1-y0+1)*cell;
      if(w<35||h<35||w>width*.55||h>height*.60||pixels<60||pixels/(w*h)>.55)continue;
      const rect=normalizeRect({x:(x0*cell-8)/scale,y:(y0*cell-8)/scale,w:(w+16)/scale,h:(h+16)/scale},source.width,source.height);
      regions.push({id:"yellow-click-text",rect,margin:0,score:0,kind:"inline-click-candidate",yellowOnly:true,pixels});
    }
    // Yellow is a localization hint, not a detector subtype. Legacy callers
    // keep their three-region limit; the constrained blue-panel search may
    // inspect more hints before accepting any structural candidate.
    return regions.sort((a,b)=>b.pixels-a.pixels).slice(0,Math.max(1,Math.min(24,Number(options.maxRegions)||3)));
  }

  // A repeated, aligned lettering layout is only a localization hint. Unlike
  // the broad yellow cloud/UI boxes, this ROI omits the countdown and nearby
  // buff rows. It must still pass the existing Korean instruction semantics,
  // and app.js must confirm it on an independently captured frame.
  function detectInlineFixedInstructionRegions(source, options={}) {
    if(!source?.width||!source?.height)return [];
    const native=options.nativeSource||source.nativeSource;
    const work=native?.width>=source.width&&native?.height&&Math.abs(native.width/native.height-source.width/source.height)<.015?native:source;
    const width=Math.min(1536,work.width),scale=width/source.width,height=Math.round(work.height*width/work.width);
    const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(work,0,0,width,height);
    const data=ctx.getImageData(0,0,width,height).data;
    const searchPixels=work===source?null:source.getContext("2d",{willReadFrequently:true}).getImageData(0,0,source.width,source.height).data;
    const allowed=options.allowedSearchRect;
    const validRect=r=>r&&[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0;
    if(allowed!==undefined&&!validRect(allowed))return [];
    const inside=r=>allowed===undefined||(r.x>=allowed.x&&r.y>=allowed.y&&r.x+r.w<=allowed.x+allowed.w&&r.y+r.h<=allowed.y+allowed.h);
    const hints=Array.isArray(options.yellowRegions)?options.yellowRegions:detectYellowPromptRegions(source,{maxRegions:8});
    const mask=new Uint8Array(width*height);
    for(const hint of hints){
      if(!hint?.yellowOnly||!validRect(hint.rect))continue;
      const r=normalizeRect({x:hint.rect.x*scale,y:hint.rect.y*scale,w:hint.rect.w*scale,h:hint.rect.h*scale},width,height);
      for(let y=Math.max(1,r.y);y<Math.min(height-1,r.y+r.h);y++)for(let x=Math.max(1,r.x);x<Math.min(width-1,r.x+r.w);x++){
        const at=(y*width+x)*4,R=data[at],G=data[at+1],B=data[at+2];
        if(R<=180||G<=160||B>=Math.min(R,G)*.48||R/G<=.85||R/G>=1.4)continue;
        let edge=0;
        if(FIXED_INSTRUCTION_EDGE_RADIUS2_RESEARCH_ENABLED){
          // Same four directions and contrast gate, sampled two pixels away.
          // Out-of-frame neighbors supply no contrast; no row wrapping.
          for(const [dx,dy] of [[-2,0],[2,0],[0,-2],[0,2]]){
            const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
            const p=(ny*width+nx)*4;edge=Math.max(edge,Math.abs(R-data[p]),Math.abs(G-data[p+1]),Math.abs(B-data[p+2]));
          }
        }else{
        for(const offset of [-4,4,-width*4,width*4]){
          const p=at+offset;edge=Math.max(edge,Math.abs(R-data[p]),Math.abs(G-data[p+1]),Math.abs(B-data[p+2]));
        }
        }
        // Flat skill colours cannot supply the lettering layout.
        if(edge>70)mask[y*width+x]=1;
      }
    }
    const accepted=[];
    for(const hint of hints){
      if(!hint?.yellowOnly||!validRect(hint.rect))continue;
      const r=normalizeRect({x:hint.rect.x*scale,y:hint.rect.y*scale,w:hint.rect.w*scale,h:hint.rect.h*scale},width,height);
      let best=null;
      // Several bounded windows avoid connecting an adjacent buff column to
      // the guide. No window or letter colour can itself produce a match.
      for(const [left,right] of [[0,.8],[.1,.9],[.2,1],[.2,.9]]){
        const x0=Math.floor(r.x+r.w*left),x1=Math.ceil(r.x+r.w*right),bands=[];let open=null;
        for(let y=r.y;y<r.y+r.h;y++){
          let count=0;
          for(let x=x0;x<x1;x++)count+=mask[y*width+x];
          if(count>=Math.max(3,Math.round(r.w*.009))){if(!open)open={y0:y,y1:y};open.y1=y;}
          else if(open&&y-open.y1>2){bands.push(open);open=null;}
        }
        if(open)bands.push(open);
        const segments=[];
        for(const band of bands){
          const h=band.y1-band.y0+1;
          if(h<Math.max(5,height*.011)||h>height*.045)continue;
          const columns=[];
          for(let x=x0;x<x1;x++){let n=0;for(let y=band.y0;y<=band.y1;y++)n+=mask[y*width+x];if(n)columns.push(x);}
          let first=null,last=null,pixels=0;
          const finish=()=>{
            if(first===null)return;
            const w=last-first+1;
            if(w>=Math.max(30,h*3)&&w<=r.w*.92&&pixels>=25)segments.push({x:first,y:band.y0,w,h,pixels});
          };
          for(const x of columns){
            if(last!==null&&x-last>Math.max(12,h*1.5)){finish();first=null;pixels=0;}
            if(first===null)first=x;last=x;
            for(let y=band.y0;y<=band.y1;y++)pixels+=mask[y*width+x];
          }
          finish();
        }
        segments.sort((a,b)=>a.y-b.y||a.x-b.x);
        for(const anchor of segments){
          const group=[anchor];let pitch=null;
          for(const next of segments){
            const prev=group[group.length-1],gap=next.y+next.h/2-prev.y-prev.h/2;
            if(next.y<=prev.y||Math.abs(next.x-anchor.x)>Math.max(anchor.h,next.h)*1.2)continue;
            if(next.w/anchor.w<.65||next.w/anchor.w>1.60||gap<Math.max(prev.h,next.h)*1.5||gap>Math.max(prev.h,next.h)*4.3)continue;
            if(pitch!==null&&Math.abs(gap-pitch)>pitch*.28)continue;
            if(next.y+next.h-anchor.y>height*.35)continue;
            group.push(next);pitch=pitch===null?gap:(pitch+gap)/2;
            if(group.length===4)break;
          }
          if(group.length<3)continue;
          const score=group.length+Math.min(.4,group.reduce((sum,line)=>sum+line.pixels,0)/2000);
          if(!best||score>best.score)best={score,group};
        }
      }
      if(!best)continue;
      const fixed=union(best.group.map(line=>({rect:line}))),pad=Math.max(4,Math.max(...best.group.map(line=>line.h))*.22);
      const fixedInstructionRect=normalizeRect({x:(fixed.x-pad)/scale,y:(fixed.y-pad)/scale,w:(fixed.w+pad*2)/scale,h:(fixed.h+pad*2)/scale},source.width,source.height);
      if(!inside(fixedInstructionRect))continue;
      const instructionBands=best.group.map(line=>({x:line.x/scale,y:line.y/scale,w:line.w/scale,h:line.h/scale}));
      if(searchPixels){
        // An unmasked native image cannot resurrect an instruction hidden on
        // the search canvas. Every native lettering band needs current yellow
        // pixels at its corresponding, allowed search location as well.
        const visible=instructionBands.every(band=>{
          const r=normalizeRect(band,source.width,source.height);let pixels=0;
          for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
            const at=(y*source.width+x)*4,R=searchPixels[at],G=searchPixels[at+1],B=searchPixels[at+2];
            if(R>140&&G>115&&B<Math.min(R,G)*.65&&R/G<1.5)pixels++;
          }
          return pixels>=Math.max(2,r.w*r.h*.018);
        });
        if(!visible)continue;
      }
      const item={...hint,fixedInstructionRect,instructionBands,localizationScore:best.score,structuralHint:true,localizationPixelSource:work===source?"search":"same-frame-native"};
      if(!accepted.some(other=>rectIou(other.fixedInstructionRect,item.fixedInstructionRect)>.6))accepted.push(item);
    }
    return accepted.sort((a,b)=>b.localizationScore-a.localizationScore).slice(0,2);
  }

  function confirmedInlineGuide(source, candidates, options={}) {
    const previous=options.confirmationInlineGuide;
    if(!previous||previous.version!==1||options.confirmationLabel!=="클릭형 거탐"||previous.frameWidth!==source.width||previous.frameHeight!==source.height)return null;
    const r=previous.fixedInstructionRect;
    const anchor=previous.candidateRect;
    if(!r||!anchor||![r.x,r.y,r.w,r.h,anchor.x,anchor.y,anchor.w,anchor.h].every(Number.isFinite)||r.w<=0||r.h<=0||anchor.w<=0||anchor.h<=0)return null;
    if(r.x<0||r.y<0||r.x+r.w>source.width||r.y+r.h>source.height||anchor.x<0||anchor.y<0||anchor.x+anchor.w>source.width||anchor.y+anchor.h>source.height)return null;
    if(options.confirmationRect&&rectIou(options.confirmationRect,r)<.65)return null;
    // Re-localize from this frame before reading the previous instruction ROI.
    // Old OCR text/signals are deliberately absent from this metadata.
    return candidates.find(item=>item.id===previous.candidateId&&rectIou(item.rect,previous.candidateRect)>.65&&rectIou(item.fixedInstructionRect,r)>.65)||null;
  }

  // A yellow guide can belong to the blue text-input panel as well as to a
  // click prompt. Its fixed upper/lower instructions surround a dark strip.
  // The strip content and the countdown are never read as detection evidence.
  function detectBlueInputGuideRegions(source, options={}) {
    // Localize on the caller's search canvas. An explicit allowedSearchRect
    // limits candidates when that canvas contains pixels outside its monitor
    // region. A native frame is used only to read the accepted fixed ROI.
    const work=source;
    const width=Math.min(640,work.width),scale=width/work.width,height=Math.round(work.height*scale);
    const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const cx=canvas.getContext("2d",{willReadFrequently:true});cx.drawImage(work,0,0,width,height);
    const d=cx.getImageData(0,0,width,height).data;
    const dark=new Uint8Array(width*height),pale=new Uint8Array(dark.length),blue=new Uint8Array(dark.length),yellow=new Uint8Array(dark.length);
    for(let i=0;i<dark.length;i++){
      const r=d[i*4],g=d[i*4+1],b=d[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);
      dark[i]=mx<80?1:0;pale[i]=mx>150&&mx-mn<90?1:0;
      blue[i]=b>70&&b>r*1.25&&g>r*1.05&&b>g*1.08&&r<160?1:0;
      yellow[i]=r>140&&g>115&&b<Math.min(r,g)*.65&&r/g<1.5?1:0;
    }
    const density=(mask,r)=>{const x0=clamp(Math.floor(r.x),0,width),y0=clamp(Math.floor(r.y),0,height),x1=clamp(Math.ceil(r.x+r.w),x0,width),y1=clamp(Math.ceil(r.y+r.h),y0,height);let n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)n+=mask[y*width+x];return n/Math.max(1,(x1-x0)*(y1-y0));};
    const hints=detectYellowPromptRegions(work,{maxRegions:24}),accepted=[];
    const outputScale=source.width/work.width;
    for(const hint of hints){
      const h={x:hint.rect.x*scale,y:hint.rect.y*scale,w:hint.rect.w*scale,h:hint.rect.h*scale};
      if(h.w<45||h.w>width*.30||h.h<12||h.h>height*.38)continue;
      let best=null;
      for(const ws of [.90,.98,1.06])for(const hs of [.20,.23,.26])for(const dy of [-.02,.025,.07,.12]){
        const strip={x:h.x+h.w*(1-ws)/2,y:h.y+h.h+h.w*dy,w:h.w*ws,h:h.w*ws*hs};
        if(strip.y<0||strip.x<0||strip.x+strip.w>width||strip.y+strip.h>height)continue;
        const top={x:strip.x+strip.w*.025,y:strip.y-strip.w*.39,w:strip.w*.95,h:strip.w*.32};
        const bottom={x:strip.x+strip.w*.025,y:strip.y+strip.h+strip.w*.025,w:strip.w*.95,h:strip.w*.18};
        if(top.y<0||bottom.y+bottom.h>height)continue;
        const left={x:strip.x-strip.w*.10,y:top.y,w:strip.w*.065,h:bottom.y+bottom.h-top.y};
        const right={x:strip.x+strip.w*1.035,y:top.y,w:strip.w*.065,h:left.h};
        const metrics={dark:density(dark,strip),pale:density(pale,strip),leftBlue:density(blue,left),rightBlue:density(blue,right),topBlue:density(blue,top),bottomBlue:density(blue,bottom),topYellow:density(yellow,top),bottomYellow:density(yellow,bottom)};
        if(metrics.dark<.38||metrics.pale<.025||metrics.leftBlue<.68||metrics.rightBlue<.68||metrics.topBlue<.50||metrics.bottomBlue<.50||metrics.topYellow<.035||metrics.bottomYellow<.025)continue;
        const score=metrics.dark+Math.min(metrics.leftBlue,metrics.rightBlue)+metrics.topYellow+metrics.bottomYellow;
        if(!best||score>best.score)best={score,strip,top,bottom,metrics};
      }
      if(!best)continue;
      const toOutput=r=>normalizeRect({x:r.x/scale*outputScale,y:r.y/scale*outputScale,w:r.w/scale*outputScale,h:r.h/scale*outputScale},source.width,source.height);
      const rect=toOutput(best.top),captchaRect=toOutput(best.strip),bottomRect=toOutput(best.bottom);
      const panelRect=normalizeRect({x:captchaRect.x-captchaRect.w*.1,y:rect.y,w:captchaRect.w*1.2,h:bottomRect.y+bottomRect.h-rect.y},source.width,source.height);
      if(options.allowedSearchRect!==undefined){
        const allowed=options.allowedSearchRect;
        if(!allowed||![allowed.x,allowed.y,allowed.w,allowed.h].every(Number.isFinite)||allowed.w<=0||allowed.h<=0)continue;
        const inside=r=>r.x>=allowed.x&&r.y>=allowed.y&&r.x+r.w<=allowed.x+allowed.w&&r.y+r.h<=allowed.y+allowed.h;
        // All three fixed evidence areas must remain inside the allowed region;
        // a partially allowed candidate must not read its lower guide outside.
        if(![rect,captchaRect,bottomRect].every(inside))continue;
      }
      const item={id:"blue-input-fixed-guide",kind:"text-input-guide-candidate",rect,captchaRect,bottomRect,panelRect,diagnostics:best.metrics,structural:true};
      if(!accepted.some(other=>rectIou(other.rect,rect)>.60))accepted.push(item);
      if(accepted.length>=2)break;
    }
    return accepted;
  }

  function blueGuideCoversYellowRegion(guide,region) {
    if(!guide?.structural||!region)return false;
    const a=guide.rect,b=region,x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),right=Math.min(a.x+a.w,b.x+b.w),bottom=Math.min(a.y+a.h,b.y+b.h);
    return Math.max(0,right-x)*Math.max(0,bottom-y)/Math.max(1,a.w*a.h)>=.75;
  }

  function renderNativeGuideVariant(source,region,options={}) {
    const native=options.nativeSource;
    if(native?.width&&native?.height&&Math.abs(native.width/native.height-source.width/source.height)<.015){
      const ratio=native.width/source.width,r={...region,x:region.x*ratio,y:region.y*ratio,w:region.w*ratio,h:region.h*ratio};
      const rendered=renderVariant(native,r);return {...rendered,coordinateScaleBack:1/(rendered.scale*ratio)};
    }
    const rendered=renderVariant(source,region);return {...rendered,coordinateScaleBack:1/rendered.scale};
  }

  function makeYellowTextPanel(source) {
    const c=document.createElement("canvas");c.width=source.width;c.height=source.height;
    const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(source,0,0);
    const image=ctx.getImageData(0,0,c.width,c.height),d=image.data;
    for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const v=r>140&&g>115&&b<Math.min(r,g)*.65&&r/g<1.5?0:255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
    ctx.putImageData(image,0,0);return c;
  }


  function detectInlineClickPromptRegions(source, options={}) {
    const pattern=/^(inline-click-88992|inline-click-88993|inline-click-94425)$/;
    const pool=[options?.contourBest,...(options?.contourCandidates||[])]
      .filter(Boolean)
      .filter(item=>pattern.test(String(item.id||""))&&item.rect)
      .filter(item=>!options.inlineContourOnly||item.matched===true)
      .map(item=>{
        const score=Number(item.score||-1),threshold=Number(item.threshold||1),margin=score-threshold;
        const rect=normalizeRect(item.rect,source.width,source.height);
        const area=rect.w*rect.h/Math.max(1,source.width*source.height);
        return {rect,id:String(item.id||""),score,threshold,margin,area,templateScale:Number(item.templateScale||1),detectionMode:item.detectionMode||"hybrid"};
      })
      .filter(item=>item.margin>=.12&&item.area>=.012&&item.area<=.09)
      .sort((a,b)=>b.margin-a.margin||b.score-a.score);
    const selected=[];
    for(const item of pool){
      if(selected.some(other=>rectIou(other.rect,item.rect)>.58))continue;
      selected.push({...item,kind:"inline-click-candidate",priority:8800-selected.length});
      if(selected.length>=2)break;
    }
    return selected;
  }

  function rectAllowedForOcr(source,rect,options={}) {
    if(!rect||![rect.x,rect.y,rect.w,rect.h].every(Number.isFinite)||rect.w<=0||rect.h<=0||rect.x<0||rect.y<0||rect.x+rect.w>source.width||rect.y+rect.h>source.height)return false;
    const a=options.allowedSearchRect;
    if(a===undefined)return true;
    return a&&[a.x,a.y,a.w,a.h].every(Number.isFinite)&&a.w>0&&a.h>0&&rect.x>=a.x&&rect.y>=a.y&&rect.x+rect.w<=a.x+a.w&&rect.y+rect.h<=a.y+a.h;
  }

  // R12 reorders one existing read, not its semantic acceptance. The parent is
  // linked by the current rect object retained by the structural hint's spread.
  function currentFixedYellowParentForFirstRead(candidates,fixedCandidates,options={}) {
    if(!READ_CURRENT_FIXED_YELLOW_PARENT_FIRST_RESEARCH_ENABLED ||
        !EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED || options.inlineFixedOnly!==true ||
        options.confirmationRect || options.confirmationLabel ||
        options.confirmationInlineGuide || options.confirmationInlineContour ||
        options.inlineContourOnly || options.textInputOnly || options.violettaFixedOnly ||
        options.violettaGeneralOnly || options.blueInputOnly ||
        !Array.isArray(fixedCandidates) || fixedCandidates.length!==1 ||
        !candidates.length || !candidates.every(candidate=>candidate.yellowOnly===true))return null;
    const parent=fixedCandidates[0];
    if(parent?.structuralHint!==true || parent.yellowOnly!==true ||
        !parent.rect || typeof parent.id!=="string")return null;
    let selected=null;
    for(const candidate of candidates){
      if(candidate?.rect!==parent.rect)continue;
      if(selected)return null;
      selected=candidate;
    }
    return selected?.yellowOnly===true && selected.id===parent.id?selected:null;
  }

  // R11 orders only the initial failed-fixed fallback. A fixed hint was made
  // by spreading a current yellow candidate, preserving that candidate's rect.
  // Its structure is a read-order clue, never a semantic pass or a saved result.
  function preferCurrentFixedYellowParentOrder(candidates,fixedCandidates,options={}) {
    if(!PREFER_CURRENT_FIXED_YELLOW_PARENT_RESEARCH_ENABLED ||
        options.inlineFixedOnly!==true || options.confirmationRect ||
        options.confirmationLabel || options.confirmationInlineGuide ||
        options.confirmationInlineContour || options.inlineContourOnly ||
        options.textInputOnly || options.violettaFixedOnly ||
        options.violettaGeneralOnly || options.blueInputOnly ||
        !Array.isArray(fixedCandidates) || fixedCandidates.length!==1)return candidates;
    const parent=fixedCandidates[0];
    if(parent?.structuralHint!==true || parent.yellowOnly!==true ||
        !parent.rect || typeof parent.id!=="string")return candidates;
    let selected=-1;
    for(let index=0;index<candidates.length;index++){
      if(candidates[index]?.rect!==parent.rect)continue;
      if(selected!==-1)return candidates;
      selected=index;
    }
    if(selected<=0 || candidates[selected].yellowOnly!==true ||
        candidates[selected].id!==parent.id)return candidates;
    return [candidates[selected],...candidates.slice(0,selected),...candidates.slice(selected+1)];
  }

  // R10 chooses read order only. It does not accept a match or change the final
  // location/semantic gates. Current candidate objects and remaining order survive.
  function preferConfirmedYellowReadOrder(source,candidates,options={}) {
    if(!PREFER_CONFIRMED_YELLOW_CANDIDATE_RESEARCH_ENABLED ||
        options.confirmationLabel!=="클릭형 거탐" ||
        options.inlineFixedOnly || options.inlineContourOnly || options.textInputOnly ||
        options.violettaFixedOnly || options.violettaGeneralOnly || options.blueInputOnly ||
        options.confirmationInlineGuide || options.confirmationInlineContour ||
        !rectAllowedForOcr(source,options.confirmationRect,options))return candidates;
    let selected=-1;
    for(let index=0;index<candidates.length;index++){
      const candidate=candidates[index];
      if(candidate?.yellowOnly!==true || !rectAllowedForOcr(source,candidate.rect,options) ||
          rectIou(candidate.rect,options.confirmationRect)<.8)continue;
      if(selected!==-1)return candidates;
      selected=index;
    }
    if(selected<=0)return candidates;
    return [candidates[selected],...candidates.slice(0,selected),...candidates.slice(selected+1)];
  }

  function confirmedInlineContourPlans(source,candidate,options={}) {
    const m=options.confirmationInlineContour;
    if(!m||m.version!==1||m.frameWidth!==source.width||m.frameHeight!==source.height||options.confirmationLabel!=="클릭형 거탐"||m.candidateId!==candidate.id||!rectAllowedForOcr(source,m.candidateRect,options)||rectIou(candidate.rect,m.candidateRect)<.8)return [];
    if(options.confirmationRect&&(!rectAllowedForOcr(source,options.confirmationRect,options)||rectIou(options.confirmationRect,m.candidateRect)<.8))return [];
    if(!Array.isArray(m.guides)||m.guides.length<1||m.guides.length>2)return [];
    const plans=[];
    for(const guide of m.guides){
      const r=guide?.region;
      if(!rectAllowedForOcr(source,r,options)||!["gray","adaptive","color"].includes(r.variant)||guide.psm!==window.Tesseract.PSM.SINGLE_BLOCK||(guide.renderTargetWidth!==undefined&&guide.renderTargetWidth!==500))return [];
      const intersection=Math.max(0,Math.min(r.x+r.w,candidate.rect.x+candidate.rect.w)-Math.max(r.x,candidate.rect.x))*Math.max(0,Math.min(r.y+r.h,candidate.rect.y+candidate.rect.h)-Math.max(r.y,candidate.rect.y));
      if(intersection/(r.w*r.h)<.98)return [];
      plans.push({region:{x:r.x,y:r.y,w:r.w,h:r.h,kind:"inline-click",variant:r.variant,lineCount:4},psm:guide.psm});
    }
    return plans;
  }

  function paddedRect(rect, frameW, frameH, ratio=.18) {
    const base=normalizeRect(rect,frameW,frameH);
    const px=Math.max(12,Math.round(base.w*ratio)),py=Math.max(10,Math.round(base.h*ratio));
    const x=Math.max(0,base.x-px),y=Math.max(0,base.y-py);
    const r=Math.min(frameW,base.x+base.w+px),b=Math.min(frameH,base.y+base.h+py);
    return {...normalizeRect({x,y,w:r-x,h:b-y},frameW,frameH),kind:"preferred",lineCount:2,priority:2000};
  }

  function buildRegions(source, options={}) {
    const regions=[];
    const add=(rect,kind="preferred",priority=1000,variant="gray")=>{
      if(!rect)return;
      const n=normalizeRect(rect,source.width,source.height);
      const area=n.w*n.h/(source.width*source.height);
      if(kind==="preferred" && (area>.34 || n.h/source.height>.68 || n.w/source.width>.78))return;
      if(kind==="preferred" && (n.w<90||n.h<32))return;
      if(n.w<70||n.h<28)return;
      const item={...n,kind,variant,lineCount:(kind==="preferred"||kind==="rainbow-recovery")?2:0,priority};
      if(regions.some(x=>x.kind===kind&&x.variant===variant&&rectIou(x,item)>.72))return;
      regions.push(item);
    };

    let textInputIndex=0;
    for(const candidate of options.textInputRegions||[]){
      const rect=candidate?.rect||candidate;
      add(rect,"text-input",5400-textInputIndex*10,"gray");
      add(rect,"text-input",5399-textInputIndex*10,"color");
      add(rect,"text-input",5398-textInputIndex*10,"adaptive");
      textInputIndex+=1;
      if(textInputIndex>=3)break;
    }

    let violettaIndex=0;
    for(const candidate of options.violettaRegions||[]){
      const rect=candidate?.textRect||candidate?.rect||candidate;
      add(rect,"violetta",5200-violettaIndex*10,"color");
      add(rect,"violetta",5199-violettaIndex*10,"gray");
      add(rect,"violetta",5198-violettaIndex*10,"adaptive");
      violettaIndex+=1;
      if(violettaIndex>=3)break;
    }

    let inlineIndex=0;
    for(const candidate of options.inlineClickRegions||[]){
      const rect=candidate?.rect||candidate;
      add(rect,"inline-click",5000-inlineIndex*10,"gray");
      add(rect,"inline-click",4999-inlineIndex*10,"adaptive");
      inlineIndex+=1;
      if(inlineIndex>=2)break;
    }

    let rainbowRecoveryIndex=0;
    for(const rect of options.rainbowRecoveryRegions||[]){
      const r=paddedRect(rect,source.width,source.height,.26);
      add(r,"rainbow-recovery",6100-rainbowRecoveryIndex*10,"gray");
      add(r,"rainbow-recovery",6099-rainbowRecoveryIndex*10,"adaptive");
      add(r,"rainbow-recovery",6098-rainbowRecoveryIndex*10,"color");
      add(r,"rainbow-recovery",6097-rainbowRecoveryIndex*10,"rotate-left");
      add(r,"rainbow-recovery",6096-rainbowRecoveryIndex*10,"rotate-right");
      add(r,"rainbow-recovery",6095-rainbowRecoveryIndex*10,"rotate-left-18");
      add(r,"rainbow-recovery",6094-rainbowRecoveryIndex*10,"rotate-right-18");
      rainbowRecoveryIndex+=1;
      if(rainbowRecoveryIndex>=2)break;
    }

    let prefIndex=0;
    for(const rect of options.preferredRects||[]){
      const r=paddedRect(rect,source.width,source.height,.20);
      add(r,"preferred",3000-prefIndex*10,"gray");
      add(r,"preferred",2999-prefIndex*10,"color");
      add(r,"preferred",2998-prefIndex*10,"adaptive");
      add(r,"preferred",2997-prefIndex*10,"rotate-left");
      add(r,"preferred",2996-prefIndex*10,"rotate-right");
      prefIndex++;
      if(prefIndex>=3)break;
    }

    add({x:0,y:0,w:source.width,h:source.height},"full",1900,"gray");
    add({x:0,y:0,w:source.width,h:source.height},"full",1899,"color");
    add({x:0,y:0,w:source.width,h:source.height},"full",1898,"adaptive");

    const ww=Math.round(source.width*.44),hh=Math.round(source.height*.56);
    const xs=[0,Math.round((source.width-ww)/2),source.width-ww];
    const ys=[0,Math.round((source.height-hh)/2),source.height-hh];
    let k=0;
    for(const y of ys)for(const x of xs){
      // 모든 9개 위치를 한 번씩 보장한다. 색상 변형은 전체 화면 단계에서 이미 검사한다.
      add({x,y,w:ww,h:hh},"window",1000-k,"gray");
      k++;
    }
    return regions.sort((a,b)=>b.priority-a.priority);
  }

  function cropToCanvas(source, r, targetWidth=1180) {
    const scale=clamp(targetWidth/Math.max(1,r.w),1,3.0);
    const innerW=Math.max(1,Math.round(r.w*scale)),innerH=Math.max(1,Math.round(r.h*scale));
    const margin=Math.max(18,Math.round(Math.min(innerW,innerH)*.055));
    const c=document.createElement("canvas");c.width=innerW+margin*2;c.height=innerH+margin*2;
    const x=c.getContext("2d",{alpha:false,willReadFrequently:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
    // 화면 모서리에서도 글자가 잘리지 않도록 가장자리 픽셀을 복제해 여백을 만든다.
    x.drawImage(source,r.x,r.y,r.w,r.h,margin,margin,innerW,innerH);
    const sx0=Math.max(0,Math.min(source.width-1,r.x)),sy0=Math.max(0,Math.min(source.height-1,r.y));
    const sx1=Math.max(0,Math.min(source.width-1,r.x+r.w-1)),sy1=Math.max(0,Math.min(source.height-1,r.y+r.h-1));
    x.drawImage(source,sx0,sy0,1,r.h,0,margin,margin,innerH);
    x.drawImage(source,sx1,sy0,1,r.h,margin+innerW,margin,margin,innerH);
    x.drawImage(source,sx0,sy0,r.w,1,margin,0,innerW,margin);
    x.drawImage(source,sx0,sy1,r.w,1,margin,margin+innerH,innerW,margin);
    x.drawImage(source,sx0,sy0,1,1,0,0,margin,margin);
    x.drawImage(source,sx1,sy0,1,1,margin+innerW,0,margin,margin);
    x.drawImage(source,sx0,sy1,1,1,0,margin+innerH,margin,margin);
    x.drawImage(source,sx1,sy1,1,1,margin+innerW,margin+innerH,margin,margin);
    return {canvas:c,scale,margin};
  }

  function grayscaleData(canvas) {
    const x=canvas.getContext("2d",{alpha:false,willReadFrequently:true});
    const img=x.getImageData(0,0,canvas.width,canvas.height);
    const gray=new Uint8Array(canvas.width*canvas.height);
    for(let i=0;i<gray.length;i+=1){const o=i*4;gray[i]=Math.round(.299*img.data[o]+.587*img.data[o+1]+.114*img.data[o+2]);}
    return gray;
  }

  function makeGrayPanel(base) {
    const c=document.createElement("canvas");c.width=base.width;c.height=base.height;
    const x=c.getContext("2d",{alpha:false,willReadFrequently:true});x.drawImage(base,0,0);
    const img=x.getImageData(0,0,c.width,c.height);for(let i=0;i<img.data.length;i+=4){let g=.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2];g=clamp((g-105)*1.55+118,0,255);img.data[i]=img.data[i+1]=img.data[i+2]=g;img.data[i+3]=255;}x.putImageData(img,0,0);return c;
  }

  function makeThresholdPanel(base, threshold = 125) {
    const c=document.createElement("canvas");c.width=base.width;c.height=base.height;
    const x=c.getContext("2d",{alpha:false,willReadFrequently:true});x.drawImage(base,0,0);
    const img=x.getImageData(0,0,c.width,c.height);
    for(let i=0;i<img.data.length;i+=4){
      const g=.299*img.data[i]+.587*img.data[i+1]+.114*img.data[i+2];
      const v=g>=threshold?255:0;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;
    }
    x.putImageData(img,0,0);return c;
  }

  function makeAdaptivePanel(base) {
    const w=base.width,h=base.height,gray=grayscaleData(base),radius=Math.max(7,Math.round(Math.min(w,h)*.018));
    const integ=new Uint32Array((w+1)*(h+1)),st=w+1;
    for(let y=1;y<=h;y+=1){let row=0;for(let x=1;x<=w;x+=1){row+=gray[(y-1)*w+x-1];integ[y*st+x]=integ[(y-1)*st+x]+row;}}
    const c=document.createElement("canvas");c.width=w;c.height=h;const cx=c.getContext("2d",{alpha:false});const out=cx.createImageData(w,h);
    for(let y=0;y<h;y+=1){const y1=Math.max(0,y-radius),y2=Math.min(h,y+radius+1);for(let x=0;x<w;x+=1){const x1=Math.max(0,x-radius),x2=Math.min(w,x+radius+1);const area=(x2-x1)*(y2-y1);const mean=(integ[y2*st+x2]-integ[y1*st+x2]-integ[y2*st+x1]+integ[y1*st+x1])/area;const v=gray[y*w+x]>(mean-8)?255:0;const o=(y*w+x)*4;out.data[o]=out.data[o+1]=out.data[o+2]=v;out.data[o+3]=255;}}
    cx.putImageData(out,0,0);return c;
  }

  function makeInvertedPanel(base) {
    const c=document.createElement("canvas");c.width=base.width;c.height=base.height;
    const x=c.getContext("2d",{alpha:false,willReadFrequently:true});x.drawImage(base,0,0);
    const img=x.getImageData(0,0,c.width,c.height);
    for(let i=0;i<img.data.length;i+=4){img.data[i]=255-img.data[i];img.data[i+1]=255-img.data[i+1];img.data[i+2]=255-img.data[i+2];img.data[i+3]=255;}
    x.putImageData(img,0,0);return c;
  }

  function makeColorTextPanel(base) {
    const w=base.width,h=base.height,c=document.createElement("canvas"),x=c.getContext("2d",{alpha:false,willReadFrequently:true});
    c.width=w;c.height=h;x.drawImage(base,0,0);const img=x.getImageData(0,0,w,h),out=x.createImageData(w,h);
    for(let i=0;i<w*h;i+=1){const o=i*4,r=img.data[o],g=img.data[o+1],b=img.data[o+2];const max=Math.max(r,g,b),min=Math.min(r,g,b);const sat=max-min;const yellow=(r>105&&g>80&&b<Math.min(r,g)*.88&&sat>25);const pale=(max>175&&sat<85);const v=(yellow||pale)?0:255;out.data[o]=out.data[o+1]=out.data[o+2]=v;out.data[o+3]=255;}x.putImageData(out,0,0);return c;
  }

  function rotatePanel(source,deg){
    const rad=deg*Math.PI/180,co=Math.abs(Math.cos(rad)),si=Math.abs(Math.sin(rad));
    const c=document.createElement("canvas");c.width=Math.ceil(source.width*co+source.height*si);c.height=Math.ceil(source.width*si+source.height*co);
    const x=c.getContext("2d",{alpha:false});x.fillStyle="white";x.fillRect(0,0,c.width,c.height);x.translate(c.width/2,c.height/2);x.rotate(rad);x.drawImage(source,-source.width/2,-source.height/2);return c;
  }

  function renderVariant(source,r,scopedTargetWidth){
    const target=r.kind==="full"?1800:((r.kind==="violetta"||r.kind==="violetta-line")?1700:(r.kind==="inline-fixed"?440:(r.kind==="inline-click"?650:(r.kind==="rainbow-recovery"?1350:(r.kind==="preferred"?1100:980)))));
    // A caller can reduce the rendered image only for its explicitly scoped
    // instruction read. The general OCR route keeps every original target.
    const rendered=cropToCanvas(source,r,scopedTargetWidth??target);
    const gray=makeGrayPanel(rendered.canvas);
    let panel=gray;
    if(r.variant==="yellow") panel=makeYellowTextPanel(rendered.canvas);
    else if(r.variant==="binary-110") panel=makeThresholdPanel(rendered.canvas,110);
    else if(r.variant==="binary-130") panel=makeThresholdPanel(rendered.canvas,130);
    else if(r.variant==="binary-inv-130") panel=makeInvertedPanel(makeThresholdPanel(rendered.canvas,130));
    else if(r.variant==="binary-150") panel=makeThresholdPanel(rendered.canvas,150);
    else if(r.variant==="adaptive") panel=makeAdaptivePanel(rendered.canvas);
    else if(r.variant==="color") panel=makeColorTextPanel(rendered.canvas);
    else if(r.variant==="inverted") panel=makeInvertedPanel(makeAdaptivePanel(rendered.canvas));
    else if(r.variant==="rotate-left") panel=rotatePanel(gray,-10);
    else if(r.variant==="rotate-right") panel=rotatePanel(gray,10);
    else if(r.variant==="rotate-left-18") panel=rotatePanel(gray,-18);
    else if(r.variant==="rotate-right-18") panel=rotatePanel(gray,18);
    return {canvas:panel,scale:rendered.scale,margin:rendered.margin};
  }

  // Local research: preserve the current rendered PNG pixels while avoiding
  // the browser's deferred HTMLCanvasElement.toBlob callback before dispatch.
  // This changes transport only; OCR language, PSM and validation stay intact.
  const OCR_PNG_TRANSFER_ENABLED=window.__MALERT_OCR_PNG_TRANSFER_EXPERIMENT===true &&
    (['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true));
  function recognitionImageSource(canvas){
    if(!OCR_PNG_TRANSFER_ENABLED)return canvas;
    try{const png=canvas.toDataURL('image/png');return png.startsWith('data:image/png;base64,')?png:canvas;}
    catch(_){return canvas;}
  }

  async function recognize(canvas, psm, geometry, timeoutMs=4500) {
    assertOcrJobCurrent();
    const instance = await waitForOcrJob(initOcrWorker());
    assertOcrJobCurrent();
    await setPsm(psm, instance);
    assertOcrJobCurrent();
    const started = performance.now();
    let timeoutId = null;
    try {
      const recognitionInput=recognitionImageSource(canvas);
      const recognition = instance.recognize(recognitionInput, {}, { text: true, tsv: true });
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error(`OCR ${(timeoutMs/1000).toFixed(1)}초 제한 초과`);
          error.code = "OCR_TIMEOUT";
          reject(error);
        }, timeoutMs);
      });
      const { data } = await waitForOcrJob(Promise.race([recognition, timeout]));
      assertOcrJobCurrent();
      recognitionCount += 1;
      return { ...evaluateRecognition(data?.text, data?.tsv, geometry), rawText: String(data?.text || "").trim(), durationMs: Math.round(performance.now() - started) };
    } catch (error) {
      if (error?.code === "OCR_TIMEOUT" && worker === instance) {
        await resetOcrWorker("OCR 시간 초과 후 재시작");
      }
      r3AfterTimeout(error,timeoutMs);
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async function recognizeEnglishHeader(canvas, geometry, psm = window.Tesseract.PSM.SPARSE_TEXT) {
    assertOcrJobCurrent();
    const instance = await waitForOcrJob(initOcrWorker());
    assertOcrJobCurrent();
    const started=performance.now();
    let timeoutId=null;
    try{
      await waitForOcrJob(instance.setParameters({
        tessedit_pageseg_mode:psm,
        preserve_interword_spaces:"1",
        tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      }));
      assertOcrJobCurrent();
      currentPsm=psm;
      const recognition=instance.recognize(canvas,{}, {text:true,tsv:false});
      const timeout=new Promise((_,reject)=>{timeoutId=setTimeout(()=>{const e=new Error("영문 OCR 4.5초 제한 초과");e.code="OCR_TIMEOUT";reject(e);},4500);});
      const {data}=await waitForOcrJob(Promise.race([recognition,timeout]));
      assertOcrJobCurrent();
      recognitionCount += 1;
      const e=evaluateEnglishHeader(data?.text||"");
      return {...e,rawText:String(data?.text||"").trim(),durationMs:Math.round(performance.now()-started)};
    }catch(error){
      if(error?.code==="OCR_TIMEOUT" && worker === instance){
        await resetOcrWorker("영문 OCR 시간 초과 후 재시작");
      }
      r3AfterTimeout(error,4500);
      throw error;
    }finally{
      if(timeoutId)clearTimeout(timeoutId);
      if(worker === instance && activeOcrJob?.generation === cancelGeneration){try{await waitForOcrJob(instance.setParameters({tessedit_char_whitelist:""}));}catch(_){} }
    }
  }

  async function init() {
    statusCallback?.("OCR 준비 중");
    await initOcrWorker();
    statusCallback?.("글자 윤곽/OCR 준비 완료");
    return true;
  }

  function analyze(source, options = {}) {
    const generation = cancelGeneration;
    const run = async () => {
      if (generation !== cancelGeneration) throw ocrCancelledError();
      const job = { generation, cancel: null, cancelled: null, r3FramePolicy:R3_FRAME_YIELD?options.r3FramePolicy:undefined, r3Superseded:false };
      job.cancelled = new Promise((_, reject) => { job.cancel = reject; });
      job.cancelled.catch(() => {});
      activeOcrJob = job;
      try {
        const result = await analyzeUnlocked(source, options);
        assertOcrJobCurrent(job);
        // Only an explicitly scoped first read may restrict the app's fresh
        // confirmation. Legacy preferred/full OCR retains its original route.
        if(result.matched&&options.textInputOnly&&result.label==="문자 입력형")return {...result,confirmationTextInputOnly:true};
        if(result.matched&&options.violettaFixedOnly&&result.label==="비올레타형")return {...result,confirmationViolettaFixedOnly:true};
        return result;
      } catch(error){
        if(R3_FRAME_YIELD && error?.code==='OCR_SUPERSEDED')return {
          matched:false,incomplete:true,ocrSuperseded:true,score:0,label:'OCR 미판정',rect:null,
          reason:'실제 시간초과 후 새 입력 확인 · 이전 프레임 OCR 중단',engine:'r3-timeout-superseded-inconclusive'};
        throw error;
      } finally { if (activeOcrJob === job) activeOcrJob = null; }
    };
    const task = analysisTail.then(run, run);
    analysisTail = task.catch(() => {});
    return task;
  }

  async function analyzeUnlocked(source, options = {}) {
    analysisCount += 1;
    if (recognitionCount >= MAX_RECOGNITIONS_BEFORE_RECYCLE || analysisCount % MAX_ANALYSES_BEFORE_RECYCLE === 0) {
      await resetOcrWorker("장시간 안정성을 위한 OCR 워커 재시작");
    }

    const violettaGeneralOnly=FAST_VIOLETTA_SPLIT_AFTER_FIXED_RESEARCH_ENABLED && options.violettaGeneralOnly===true;
    const scopedMode=options.inlineFixedOnly||options.inlineContourOnly||options.violettaFixedOnly||options.textInputOnly||violettaGeneralOnly;
    const blueInputRegions = scopedMode||options.confirmationLabel==="비올레타형" ? [] : detectBlueInputGuideRegions(source,options);
    const textInputRegions = violettaGeneralOnly||options.inlineFixedOnly||options.inlineContourOnly||options.violettaFixedOnly||options.blueInputOnly||options.confirmationLabel==="비올레타형" ? [] : detectTextInputPromptRegions(source,options).filter(candidate=>!options.textInputOnly||(rectAllowedForOcr(source,candidate.rect,options)&&rectAllowedForOcr(source,candidate.bottomRect,options)));
    const violettaRegions = options.inlineFixedOnly||options.inlineContourOnly||options.textInputOnly||options.blueInputOnly?[]:detectViolettaPopupRegions(source).filter(candidate=>!options.violettaFixedOnly||(Number(candidate.score||0)>=VIOLETTA_STRUCTURE_THRESHOLD&&rectAllowedForOcr(source,candidate.rect,options)));
    const templateInlineRegions = violettaGeneralOnly||options.inlineFixedOnly||options.violettaFixedOnly||options.textInputOnly||options.blueInputOnly?[]:detectInlineClickPromptRegions(source,options).filter(candidate=>!options.inlineContourOnly||rectAllowedForOcr(source,candidate.rect,options));
    const inlineClickRegions = violettaGeneralOnly||options.blueInputOnly||options.violettaFixedOnly||options.textInputOnly?[]:(templateInlineRegions.length ? templateInlineRegions :(options.inlineContourOnly?[]:detectYellowPromptRegions(source)));
    const regions = scopedMode?[]:buildRegions(source, {...options, textInputRegions, violettaRegions, inlineClickRegions});
    const attempts = [];
    let best = null;
    const startedAt = performance.now();
    const maxDuration = 12000;
    if(window.__MALERT_M399_VIOLET_BOUNDED_VARIANTS===true&&(['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname)||(window.MAlertR39Release?.id==='M39-MXRSF2-20261019-RELEASE1'&&window.MAlertR39Release?.active===true&&window.MAlertR39Release?.publicReleaseId==='M400-P2-20261021-RELEASE1'))&&options.m399BoundedGeneralOnly===true){
      const candidate=violettaRegions[0];
      const eligible=Number(candidate?.score)>=.96&&Number(candidate?.diagnostics?.aboveDark)>=.5&&Number(candidate?.diagnostics?.aboveNavy)>=.5;
      const boundedRegions=eligible?buildRegions(source,{violettaRegions:[candidate]}).filter(r=>r.kind==='violetta'&&['color','gray'].includes(r.variant)).slice(0,2):[];
      for(const region of boundedRegions){
        if(performance.now()-startedAt>maxDuration)break;
        try{
          const rendered=renderVariant(source,region),result=await recognize(rendered.canvas,window.Tesseract.PSM.SINGLE_BLOCK,{
            offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height
          });
          attempts.push({...result,region});
          if(result.matched===true&&result.label==='비올레타형')return {...result,threshold:THRESHOLD,rect:result.rect||region,
            durationMs:Math.round(performance.now()-startedAt),attempts,engine:'edge-candidate-ocr-v10',candidateRegions:[region],violettaRegions,
            researchBoundedGeneral:{version:1,region,structureScore:candidate.score,semanticSource:'EXISTING_GENERAL_RECOGNITION_ONLY_NO_COMBINED_PRIOR_SIGNALS'}};
        }catch(error){
          if(['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true});
        }
      }
      return {matched:false,score:0,threshold:THRESHOLD,label:'비올레타형',reason:boundedRegions.length?'기존 일반 color·gray OCR 고유 문구 미확인':'기존 강한 비올레타 후보 미확인',rect:null,
        durationMs:Math.round(performance.now()-startedAt),attempts,engine:'edge-candidate-ocr-m399-bounded-miss',violettaRegions};
    }

    async function evaluateExistingInlineClickRegions(inlineClickRegions,blueInputRegions,readOrder=inlineClickRegions){
    for(const candidate of preferConfirmedYellowReadOrder(source,readOrder,options)){
      const r=candidate.rect;
      const makeRegion=(top,height,variant="gray")=>({
        ...normalizeRect({x:r.x+r.w*.02,y:r.y+r.h*top,w:r.w*.96,h:r.h*height},source.width,source.height),
        kind:"inline-click",variant,lineCount:1
      });
      const plans=[
        {region:{...r,kind:"inline-click",variant:candidate.yellowOnly?"yellow":"gray",lineCount:4},psm:window.Tesseract.PSM.SINGLE_BLOCK},
        {region:{...r,kind:"inline-click",variant:"adaptive",lineCount:4},psm:window.Tesseract.PSM.SINGLE_BLOCK},
        {region:makeRegion(.48,.28,"gray"),psm:window.Tesseract.PSM.SINGLE_BLOCK},
        {region:makeRegion(.70,.24,"gray"),psm:window.Tesseract.PSM.SINGLE_LINE}
      ];
      const selectedPlans=options.inlineContourOnly?(options.confirmationInlineContour?confirmedInlineContourPlans(source,candidate,options):plans.slice(0,2)):(candidate.yellowOnly?plans.slice(0,1):plans);
      const combined={corePhrase:false,lie:false,detector:false,activation:false,input:false,purpose:false,first:false,click:false,clickCount:false,supportedClickCount:false,supportedClickInstruction:false};
      const texts=[];
      const successfulGuides=[];
      for(const plan of selectedPlans){
        if(performance.now()-startedAt>3000)break;
        const region=plan.region;
        try{
          const rendered=renderVariant(source,region,options.inlineContourOnly?500:undefined);
          const result=await recognize(rendered.canvas,plan.psm,{offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height});
          const item={...result,region,inlineClickTemplateId:candidate.id,inlineClickMargin:candidate.margin};
          attempts.push(item);
          successfulGuides.push({region,psm:plan.psm,...(options.inlineContourOnly?{renderTargetWidth:500}:{})});
          // A yellow localization is not intrinsically a click prompt. Preserve
          // an existing text-input semantic success only with a fresh, same-ROI
          // blue panel/strip/lower-guide structural companion.
          const blueCompanion=candidate.yellowOnly?blueInputRegions.find(guide=>blueGuideCoversYellowRegion(guide,r)):null;
          if(blueCompanion&&item.matched&&item.label==="문자 입력형"){
            return {matched:true,score:Number(item.score||.96),threshold:THRESHOLD,label:"문자 입력형",reason:`중립 노란 안내 후보 + 파란 문자 입력 패널 구조 · ${item.reason}`,text:item.text||item.rawText||"",rawText:item.rawText||"",rect:blueCompanion.rect,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v12-neutral-route",candidateRegions:regions,textInputRegions,blueInputRegions};
          }
          const rawText=item.text||item.rawText||"";
          texts.push(rawText);
          for(const key of Object.keys(combined))combined[key]=combined[key]||Boolean(item.signals?.[key]);
          // 이 경로에서만 흔한 OCR 오인식(클릭→클랙/클를)을 한 글자까지 허용한다.
          combined.click=combined.click||has(rawText,"클릭",1)||has(rawText,"클랙",0)||has(rawText,"클를",0);
          combined.clickCount=combined.clickCount||/[1-9]번/.test(norm(rawText));
          combined.supportedClickCount=combined.supportedClickCount||/[235]번/.test(norm(rawText));
          combined.supportedClickInstruction=combined.supportedClickInstruction||hasSupportedClickInstruction(rawText);
          const instruction=combined.supportedClickInstruction||(combined.click&&(combined.clickCount||combined.input||combined.first||combined.purpose));
          const context=combined.corePhrase||(combined.lie&&combined.detector)||combined.activation||combined.input;
          if((instruction&&context)||(candidate.margin>=.24&&(combined.input||combined.activation||combined.corePhrase||(combined.click&&combined.clickCount)))) break;
        }catch(error){if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          if(error?.code==="OCR_CANCELLED")throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,inlineClickFast:true,inlineClickTemplateId:candidate.id});
        }
      }
      combined.supportedClickInstruction=combined.supportedClickInstruction||(combined.click&&combined.supportedClickCount);
      const clickInstruction=combined.supportedClickInstruction||(combined.click&&(combined.clickCount||combined.input||combined.first||combined.purpose));
      const lieContext=combined.corePhrase||(combined.lie&&combined.detector)||combined.activation||combined.input;
      // 강한 위치 윤곽(.12 이상 여유) + OCR 의미 신호를 모두 요구한다.
      if((clickInstruction&&lieContext)||(candidate.yellowOnly&&combined.activation&&combined.input&&(combined.purpose||combined.first))||(candidate.margin>=.24&&(combined.input||combined.activation||combined.corePhrase||(combined.click&&combined.clickCount)))){
        return {
          matched:true,score:Math.max(.90,Math.min(.98,.86+candidate.margin*.30)),threshold:THRESHOLD,label:"클릭형 거탐",
          reason:`인라인 클릭 안내 위치 + OCR 문맥 확인${combined.supportedClickInstruction?" · 2·3·5번 클릭 문구":""} · ${candidate.id}`,
          text:texts.filter(Boolean).join(" / "),rawText:texts.filter(Boolean).join(" / "),rect:r,
          durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v9",
          candidateRegions:regions,violettaRegions,inlineClickRegions,
          ...(options.inlineContourOnly?{engine:"edge-candidate-ocr-v14-inline-contour",confirmationInlineContour:{version:1,candidateId:candidate.id,candidateRect:r,frameWidth:source.width,frameHeight:source.height,guides:successfulGuides}}:{})
        };
      }
      attempts.push({matched:false,score:Math.min(.84,.62+candidate.margin),threshold:THRESHOLD,label:"클릭형 거탐 후보",reason:"인라인 클릭 위치 확인 · OCR 문맥 부족",region:r,inlineClickTemplateId:candidate.id,signals:combined});
    }
      return null;
    }

    // Reserve a small, bounded pass for a structurally verified blue panel.
    // Unrelated contour/UI candidates cannot consume this pass first.
    const fixedGuideStartedAt=performance.now(),fixedGuideBudgetMs=2200;
    for(const guide of blueInputRegions.slice(0,1)){
      const combined={image:false,hangul:false,input:false,inputLoose:false,enter:false,visible:false,afterInput:false,click:false};
      const texts=[],topTexts=[],bottomTexts=[];let bottomPrompt=false;
      const plans=[{rect:guide.rect,part:"top",variant:"yellow",psm:window.Tesseract.PSM.SINGLE_BLOCK},{rect:guide.bottomRect,part:"bottom",variant:"yellow",psm:window.Tesseract.PSM.SINGLE_LINE},{rect:guide.rect,part:"top",variant:"gray",psm:window.Tesseract.PSM.SINGLE_BLOCK}];
      for(const plan of plans){
        const remaining=fixedGuideBudgetMs-(performance.now()-fixedGuideStartedAt);if(remaining<350)break;
        const region={...plan.rect,kind:"text-input",variant:plan.variant,lineCount:plan.part==="top"?3:1};
        try{
          const rendered=renderNativeGuideVariant(source,region,options);
          const remainingAfterRender=fixedGuideBudgetMs-(performance.now()-fixedGuideStartedAt);if(remainingAfterRender<350)break;
          const result=await recognize(rendered.canvas,plan.psm,{offset:{x:region.x,y:region.y},scaleBack:rendered.coordinateScaleBack,frameW:source.width,frameH:source.height},Math.min(1200,remainingAfterRender));
          const raw=result.text||result.rawText||"";texts.push(raw);(plan.part==="top"?topTexts:bottomTexts).push(raw);
          // evaluateRecognition deliberately discards an incomplete whole-frame
          // result. Here raw text is a small, structurally verified fixed ROI;
          // retain its existing semantic flags for the lower-guide recovery,
          // while leaving the global recognition acceptance rule unchanged.
          const fixedRoiSemantics=plan.part==="top"?evaluateText(raw):null;
          if(plan.part==="top")for(const key of Object.keys(combined))combined[key]=combined[key]||Boolean(result.signals?.[key]||fixedRoiSemantics?.signals?.[key]);
          if(plan.part==="bottom")bottomPrompt=bottomPrompt||hasTextInputBottomPrompt(raw);
          const topHasInput=combined.inputLoose;
          const semanticCount=[combined.image,combined.hangul,combined.inputLoose,combined.enter,combined.visible,combined.afterInput].filter(Boolean).length;
          const legacySemantic=topHasInput&&semanticCount>=3&&(combined.image||combined.hangul||combined.enter);
          // The lower fixed phrase may recover a damaged upper input word only
          // when upper image/Hangul + another fixed semantic signal survived.
          const fixedRecovery=bottomPrompt&&(combined.image||combined.hangul)&&[combined.image,combined.hangul,combined.enter,combined.visible,combined.afterInput].filter(Boolean).length>=2;
          attempts.push({...result,region,textInputTemplateId:guide.id,textInputFixedPart:plan.part,blueInputGuide:guide.diagnostics,textInputBottomPrompt:bottomPrompt});
          if(legacySemantic||fixedRecovery){
            return {matched:true,score:legacySemantic?.96:.98,threshold:THRESHOLD,label:"문자 입력형",reason:`파란 패널 상·하단 구조 + 고정 안내 OCR${fixedRecovery?" · 하단 고정문구 회수":""}`,text:texts.filter(Boolean).join(" / "),rawText:texts.filter(Boolean).join(" / "),rect:guide.rect,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v12-blue-fixed",candidateRegions:regions,textInputRegions,blueInputRegions,confirmationGuides:[{rect:guide.rect,part:"top"},{rect:guide.bottomRect,part:"bottom"}]};
          }
        }catch(error){if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;if(error?.code==="OCR_CANCELLED")throw error;attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,textInputTemplateId:guide.id,textInputFixedPart:plan.part});if(error?.code==="OCR_TIMEOUT")break;}
      }
    }
    if(options.blueInputOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"문자 입력형",reason:blueInputRegions.length?"파란 패널 구조 확인 · 고정 안내 의미 부족":"파란 문자 입력 패널 구조 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,blueInputRegions,engine:"edge-candidate-ocr-v12-blue-fixed"};

    // Reserve this additive scout for the explicit fast route. A failed scout
    // must not consume the legacy general path's candidate/time budget again.
    const fixedInlineRegions=options.inlineFixedOnly?detectInlineFixedInstructionRegions(source,{...options,yellowRegions:templateInlineRegions.length?undefined:inlineClickRegions}):[];
    const preferredInline=confirmedInlineGuide(source,fixedInlineRegions,options);
    const fixedInline=options.confirmationInlineGuide?[preferredInline].filter(Boolean):fixedInlineRegions.slice(0,1);
    // R12: the whole-parent read occurs once before its fixed subsets. Keep a
    // text result local until the existing fixed click route has had priority.
    const parentFirstCandidate=currentFixedYellowParentForFirstRead(inlineClickRegions,fixedInline,options);
    let parentFirstReadState=null;
    if(parentFirstCandidate){
      const currentBlueInputRegions=detectBlueInputGuideRegions(source,options);
      parentFirstReadState={candidate:parentFirstCandidate,blueInputRegions:currentBlueInputRegions,deferredResult:null};
      const parentResult=await evaluateExistingInlineClickRegions(inlineClickRegions,currentBlueInputRegions,[parentFirstCandidate]);
      if(parentResult){
        if(parentResult.matched && parentResult.label==='클릭형 거탐' &&
            parentFirstCandidate.yellowOnly===true && parentFirstCandidate.rect===parentResult.rect){
          return {...parentResult,researchYellowAfterFixed:{version:1,route:'existing-yellow-semantic-click'}};
        }
        parentFirstReadState.deferredResult=parentResult;
      }
    }
    for(const candidate of fixedInline){
      const savedVariant=options.confirmationInlineGuide?.variant;
      const variants=savedVariant?[savedVariant]:["gray","adaptive"];
      const fixedStartedAt=performance.now(),fixedBudgetMs=2200;
      for(const variant of variants){
      if(!["gray","adaptive"].includes(variant))break;
      const remaining=fixedBudgetMs-(performance.now()-fixedStartedAt);if(remaining<350)break;
      const region={...candidate.fixedInstructionRect,kind:"inline-fixed",variant,lineCount:4};
      try{
        const rendered=renderNativeGuideVariant(source,region,options);
        const afterRender=fixedBudgetMs-(performance.now()-fixedStartedAt);if(afterRender<350)break;
        const result=await recognize(rendered.canvas,window.Tesseract.PSM.SINGLE_BLOCK,{offset:{x:region.x,y:region.y},scaleBack:rendered.coordinateScaleBack,frameW:source.width,frameH:source.height},Math.min(1200,afterRender));
        attempts.push({...result,region,inlineFixedGuide:true,inlineClickTemplateId:candidate.id});
        // Use the full raw text from this one fixed-instruction ROI. A higher
        // scoring title line must not discard the other guide lines' meaning.
        const text=result.rawText||result.text||"",s=evaluateText(text).signals;
        const click=s.supportedClickInstruction||hasSupportedClickInstruction(text)||(has(text,"클릭",1)&&(s.input||s.first||s.purpose));
        const context=s.corePhrase||(s.lie&&s.detector)||s.activation||s.input;
        // The same semantic gates as the original yellow inline path. English,
        // countdowns, and answer text cannot provide these instruction gates.
        if((click&&context)||(s.activation&&s.input&&(s.purpose||s.first))){
          return {matched:true,score:.90,threshold:THRESHOLD,label:"클릭형 거탐",reason:"인라인 고정 안내 줄 배치 + 기존 OCR 문맥 확인",text,rawText:result.rawText||text,rect:candidate.fixedInstructionRect,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v13-inline-fixed",confirmationInlineGuide:{version:1,candidateId:candidate.id,candidateRect:candidate.rect,fixedInstructionRect:candidate.fixedInstructionRect,frameWidth:source.width,frameHeight:source.height,variant},fixedInlineRegions};
        }
      }catch(error){if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
        if(error?.code==="OCR_CANCELLED")throw error;
        attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,inlineFixedGuide:true});
      }
      }
    }
    if(EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED && options.inlineFixedOnly===true &&
        !options.confirmationRect && !options.confirmationLabel && !options.confirmationInlineGuide &&
        inlineClickRegions.length>0 && inlineClickRegions.every(candidate=>candidate.yellowOnly===true)){
      // Current pixels and the original startedAt/3000ms guard remain in use.
      // A parent visited before fixed OCR is not read a second time. A deferred
      // non-click result is returned only after the fixed click route failed.
      const currentBlueInputRegions=parentFirstReadState?parentFirstReadState.blueInputRegions:detectBlueInputGuideRegions(source,options);
      const yellowReadOrder=preferCurrentFixedYellowParentOrder(inlineClickRegions,fixedInline,options);
      const yellowResult=parentFirstReadState?.deferredResult
        ?{...parentFirstReadState.deferredResult,durationMs:Math.round(performance.now()-startedAt)}
        :await evaluateExistingInlineClickRegions(inlineClickRegions,currentBlueInputRegions,parentFirstReadState?yellowReadOrder.filter(candidate=>candidate!==parentFirstReadState.candidate):yellowReadOrder);
      if(yellowResult){
        // Blue-companion text success keeps its original label and return fields.
        // The app cannot use it as an early click or early text confirmation.
        if(yellowResult.matched && yellowResult.label==='클릭형 거탐' &&
            inlineClickRegions.some(candidate=>candidate.yellowOnly===true&&candidate.rect===yellowResult.rect)){
          return {...yellowResult,researchYellowAfterFixed:{version:1,route:'existing-yellow-semantic-click'}};
        }
        return yellowResult;
      }
    }
    if(options.inlineFixedOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"클릭형 거탐",reason:fixedInlineRegions.length?"고정 안내 줄 배치 확인 · OCR 문맥 부족":"인라인 고정 안내 줄 배치 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,fixedInlineRegions,engine:"edge-candidate-ocr-v13-inline-fixed"};
    // Re-read the two successful fixed-guide areas in the new video frame.
    // Re-localizing a tiny translucent panel may choose a different background
    // rectangle; the next frame still needs structure AND fresh OCR semantics.
    if(options.confirmationLabel==='비올레타형'&&options.confirmationRect&&Array.isArray(options.confirmationGuides)){
      const anchor=options.confirmationRect;
      const compactWholeConfirmation=options.violettaFixedOnly&&source.width<640&&source.height>=source.width*.9&&options.confirmationGuides.length===1&&options.confirmationGuides[0]?.region?.lineName==="compact-whole";
      const structure=violettaRegions.find(c=>{
        if(Number(c.score||0)<VIOLETTA_STRUCTURE_THRESHOLD)return false;
        const r=c.rect||c,overlap=Math.max(0,Math.min(r.x+r.w,anchor.x+anchor.w)-Math.max(r.x,anchor.x))*Math.max(0,Math.min(r.y+r.h,anchor.y+anchor.h)-Math.max(r.y,anchor.y));
        return overlap/Math.max(1,Math.min(r.w*r.h,anchor.w*anchor.h))>=.8&&(!compactWholeConfirmation||rectIou(r,anchor)>=.8);
      });
      if(structure){
        const combined={violetta:false,beautiful:false,find:false,correct:false,test:false,pass:false,fail:false},texts=[];
        for(const guide of options.confirmationGuides.slice(0,2)){
          const region=guide?.region;
          if(!region||region.w<=0||region.h<=0||region.x<0||region.y<0||region.x+region.w>source.width||region.y+region.h>source.height)break;
          if(options.violettaFixedOnly){
            const fixed=structure.textRect||structure.rect;
            if(!rectAllowedForOcr(source,region,options)||!fixed||region.x<fixed.x||region.y<fixed.y||region.x+region.w>fixed.x+fixed.w||region.y+region.h>fixed.y+fixed.h)break;
          }
          const compactWholeGuide=options.violettaFixedOnly&&source.width<640&&source.height>=source.width*.9&&region.lineName==="compact-whole";
          const psm=compactWholeGuide?window.Tesseract.PSM.SINGLE_BLOCK:window.Tesseract.PSM.SINGLE_LINE;
          if(options.violettaFixedOnly&&guide.psm!==undefined&&guide.psm!==psm)break;
          const rendered=renderVariant(source,region),item=await recognize(rendered.canvas,psm,{offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height});
          attempts.push({...item,region,violettaStructureScore:structure.score});texts.push(item.text||item.rawText||'');
          for(const key of Object.keys(combined))combined[key]=combined[key]||Boolean(item.signals?.[key]);
          // The first scoped read already accepts one named guide with this
          // existing rule. Re-read that same guide in fresh pixels as well.
          const namedGuide=item.matched&&item.label==='비올레타형'&&(structure.variant!=="wide-header"||Boolean(item.signals?.violetta&&(item.signals?.beautiful||item.signals?.find)));
          if(options.violettaFixedOnly&&namedGuide)return {...item,rect:anchor,label:'비올레타형',threshold:THRESHOLD,reason:'독립 프레임 비올레타 구조 + 고정 고유 문구 OCR',attempts,durationMs:Math.round(performance.now()-startedAt),engine:'edge-candidate-ocr-v14-violetta-fixed'};
        }
        const named=combined.violetta&&(combined.beautiful||combined.find||combined.correct||combined.test||combined.pass||combined.fail),pair=(combined.beautiful||combined.find)&&(combined.correct||combined.test||combined.pass||combined.fail);
        if(texts.length===2&&(named||pair))return {matched:true,score:named?.98:.95,threshold:THRESHOLD,label:'비올레타형',rect:anchor,text:texts.join(' / '),rawText:texts.join(' / '),reason:'독립 프레임 비올레타 구조 + 고정 두 문장 OCR',attempts,durationMs:Math.round(performance.now()-startedAt)};
      }
    }

    if(!options.violettaFixedOnly&&options.confirmationLabel==="비올레타형" && options.confirmationRect && options.confirmationRect.w/options.confirmationRect.h>3 && violettaRegions.some(r=>Number(r.score||0)>=.93)){
      const r=options.confirmationRect;
      const region={...normalizeRect({x:r.x-r.w*.08,y:r.y-r.h*.30,w:r.w*1.16,h:r.h*1.6},source.width,source.height),kind:"violetta-line",variant:"gray"};
      const rendered=renderVariant(source,region);
      const item=await recognize(rendered.canvas,window.Tesseract.PSM.SINGLE_LINE,{offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height});
      if(item.matched&&item.label==="비올레타형")return {...item,rect:region,threshold:THRESHOLD,durationMs:Math.round(performance.now()-startedAt),attempts:[item],reason:"비올레타 구조 + 확정 문구 영역 재확인",engine:"targeted-violetta-ocr"};
    }
    if(options.violettaFixedOnly&&options.confirmationRect)return {matched:false,score:0,threshold:THRESHOLD,label:"비올레타형",reason:"새 프레임 비올레타 고정 안내 의미 부족",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v14-violetta-fixed",violettaRegions};


    // P4-R3 문자 입력형: P3의 기존 recall 경로를 그대로 보존하고 고정 하단 문구는 추가 회수에만 사용한다.
    // 카운트다운 숫자와 CAPTCHA 랜덤 문자열은 최종 의미 판정에 사용하지 않는다.
    const m36ExtraVisited=[];
    async function readExistingTextInputCandidates(textInputRegions) {
    const textInputCandidates=textInputRegions.slice(0,6).map(candidate=>{
      const topRegion=normalizeRect({x:candidate.rect.x-candidate.rect.w*.10,y:candidate.rect.y-candidate.rect.h*.10,w:candidate.rect.w*1.20,h:candidate.rect.h*1.22},source.width,source.height);
      const bottomRegion=normalizeRect(candidate.bottomRect||{x:candidate.rect.x-candidate.rect.w*.08,y:candidate.rect.y+candidate.rect.h*1.82,w:candidate.rect.w*1.16,h:candidate.rect.h*.72},source.width,source.height);
      return {
        candidate,
        region:topRegion,
        bottomRegion,
        combined:{image:false,hangul:false,input:false,inputLoose:false,enter:false,visible:false,afterInput:false,click:false},
        texts:[],
        bottomTexts:[],
        bottomPrompt:false
      };
    }).filter(entry=>!options.textInputOnly||(rectAllowedForOcr(source,entry.region,options)&&rectAllowedForOcr(source,entry.bottomRegion,options)));
    if(M36_EXTRA_STRUCTURAL_OCR_ENABLED)for(const entry of textInputCandidates)m36ExtraVisited.push(entry.candidate);
    const textInputVariants=["gray","color","adaptive"];
    const textInputSemanticCount=(entry)=>[
      entry.combined.image,entry.combined.hangul,entry.combined.inputLoose,entry.combined.enter,entry.combined.visible,entry.combined.afterInput
    ].filter(Boolean).length;
    const evaluateTextInputState=(entry)=>{
      const {candidate,combined,texts,bottomTexts,bottomPrompt}=entry;
      const semanticCount=textInputSemanticCount(entry);
      // P3와 동일한 기존 recall 경로. 이 조건은 P4에서 절대 좁히지 않는다.
      const strongVisual=Number(candidate.margin||0)>=.20&&Number(candidate.visualScore||0)>=.80;
      const legacySemantic=(combined.inputLoose&&semanticCount>=3&&(combined.image||combined.hangul||combined.enter)&&
        (!M392_WEAK_TEXT_INPUT_GUARD_ENABLED||strongVisual||combined.input))||
        (strongVisual&&semanticCount>=2&&(combined.image||combined.hangul));
      // 추가 회수: 상단 OCR이 일부 깨졌지만 문자입력 문맥이 남아 있고 하단 고정 문구까지 확인된 경우만 허용한다.
      // 기존 P3 조건의 대체가 아니라 OR 추가이므로 recall 집합을 축소하지 않는다.
      const fixedPhraseRecovery=bottomPrompt&&combined.inputLoose&&semanticCount>=2&&
        (combined.image||combined.hangul||combined.enter||combined.visible||combined.afterInput)&&
        Number(candidate.visualScore||0)>=.62;
      if(!legacySemantic&&!fixedPhraseRecovery)return null;
      const allTexts=[...texts,...bottomTexts].filter(Boolean);
      const score=fixedPhraseRecovery&&!legacySemantic?.98:(strongVisual?.97:.96);
      const reason=fixedPhraseRecovery&&!legacySemantic
        ? `문자 입력 기존 문맥 일부 + 하단 고정문구 회수 · 핵심어 ${semanticCount}개 · ${candidate.id}`
        : `문자 입력 안내 구조 + 분할 OCR 핵심어 ${semanticCount}개 · ${candidate.id}`;
      return {matched:true,score,threshold:THRESHOLD,label:"문자 입력형",reason,text:allTexts.join(" / "),rawText:allTexts.join(" / "),rect:candidate.rect,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v11-r3-additive",candidateRegions:regions,textInputRegions,violettaRegions,inlineClickRegions};
    };

    // 1) P3와 동일한 상단 OCR 순서/예산. 99116만 PSM11을 사용한다.
    for(const variant of textInputVariants){
      for(const entry of textInputCandidates){
        if(performance.now()-startedAt>7000)break;
        const {candidate,combined,texts}=entry;
        const region={...entry.region,kind:"text-input",variant,lineCount:4};
        try{
          const rendered=renderVariant(source,region,options.textInputOnly?560:undefined);
          const textInputPsm=candidate.id==="text-input-prompt-99116"?window.Tesseract.PSM.SPARSE_TEXT:window.Tesseract.PSM.SINGLE_BLOCK;
          const result=await recognize(rendered.canvas,textInputPsm,{offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height});
          const item={...result,region,textInputTemplateId:candidate.id,textInputVisualScore:candidate.visualScore,textInputFixedPart:"top"};
          attempts.push(item);
          const rawText=item.text||item.rawText||"";
          texts.push(rawText);
          for(const key of Object.keys(combined))combined[key]=combined[key]||Boolean(item.signals?.[key]);
          combined.inputLoose=combined.inputLoose||has(rawText,"입력",1);
          // P3 조기 확정 복원: 기존에 통과하던 OCR 판정은 그대로 살린다.
          if(item.matched&&item.label==="문자 입력형"){
            return {matched:true,score:Number(item.score||.97),threshold:THRESHOLD,label:"문자 입력형",reason:`문자 입력 안내 위치 + OCR · ${item.reason} · ${candidate.id}`,text:item.text||"",rawText:item.rawText||"",rect:candidate.rect,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v11-r3-additive",candidateRegions:regions,textInputRegions,violettaRegions,inlineClickRegions};
          }
          const semanticResult=evaluateTextInputState(entry);
          if(semanticResult)return semanticResult;
        }catch(error){if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,textInputFast:true,textInputTemplateId:candidate.id,textInputFixedPart:"top"});
        }
      }
      if(performance.now()-startedAt>7000)break;
    }

    // 2) 기존 P3에서 아직 확정되지 않은 경우에만 하단 고정 문구를 추가 회수 신호로 사용한다.
    // 모든 후보에 2×2 OCR을 추가하지 않고, 상단에 부분 문맥이 가장 많이 남은 후보 1개만 최대 2회 확인한다.
    const recoveryEntry=textInputCandidates
      .map(entry=>({entry,count:textInputSemanticCount(entry),visual:Number(entry.candidate.visualScore||0)}))
      .filter(x=>x.entry.combined.inputLoose&&x.count>=2&&
        (x.entry.combined.image||x.entry.combined.hangul||x.entry.combined.enter||x.entry.combined.visible||x.entry.combined.afterInput))
      .sort((a,b)=>b.count-a.count||b.visual-a.visual)[0]?.entry||null;
    if(recoveryEntry){
      for(const variant of ["gray","adaptive"]){
        if(performance.now()-startedAt>7000)break;
        const region={...recoveryEntry.bottomRegion,kind:"text-input",variant,lineCount:1};
        try{
          const rendered=renderVariant(source,region,options.textInputOnly?560:undefined);
          const result=await recognize(rendered.canvas,window.Tesseract.PSM.SINGLE_LINE,{offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height});
          const rawText=result.text||result.rawText||"";
          recoveryEntry.bottomTexts.push(rawText);
          recoveryEntry.bottomPrompt=recoveryEntry.bottomPrompt||hasTextInputBottomPrompt(rawText);
          attempts.push({...result,region,textInputTemplateId:recoveryEntry.candidate.id,textInputVisualScore:recoveryEntry.candidate.visualScore,textInputFixedPart:"bottom",textInputBottomPrompt:recoveryEntry.bottomPrompt});
          const semanticResult=evaluateTextInputState(recoveryEntry);
          if(semanticResult)return semanticResult;
          if(recoveryEntry.bottomPrompt)break;
        }catch(error){if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,textInputFast:true,textInputTemplateId:recoveryEntry.candidate.id,textInputFixedPart:"bottom"});
        }
      }
    }

    for(const entry of textInputCandidates){
      const semanticResult=evaluateTextInputState(entry);
      if(semanticResult)return semanticResult;
      attempts.push({matched:false,score:.82,threshold:THRESHOLD,label:"문자 입력형 후보",reason:"안내문 위치 + CAPTCHA 구조 확인 · OCR 핵심어 부족",region:entry.candidate.rect,textInputTemplateId:entry.candidate.id,signals:entry.combined,textInputBottomPrompt:entry.bottomPrompt});
    }
      return null;
    }
    const normalTextRead=await readExistingTextInputCandidates(textInputRegions);
    if(normalTextRead)return normalTextRead;
    if(TEXT_AFTER_NORMAL_FALLBACK_ENABLED&&options.textInputOnly===true){
      textAfterNormalStats.considered++;
      const eligibility=textAfterNormalEligibility(options,textInputRegions,attempts,performance.now()-startedAt);
      if(eligibility)textAfterNormalStats.skipped[eligibility]=(textAfterNormalStats.skipped[eligibility]||0)+1;
      else{
        assertOcrJobCurrent();
        const continuationStarted=performance.now(),attemptStart=attempts.length,removed=[];
        const keep=(item,origin)=>{
          if(!item)return true;
          const exhausted=textInputRegions.find(r=>r.id===item.id&&r.rect&&item.rect&&rectIou(r.rect,item.rect)>.60);
          if(!exhausted)return true;
          removed.push({origin,id:item.id,score:item.score,threshold:item.threshold,rect:{...item.rect}});return false;
        };
        const reduced={...options,contourBest:keep(options.contourBest,'contourBest')?options.contourBest:null,
          contourCandidates:(options.contourCandidates||[]).filter(item=>keep(item,'contourCandidates'))};
        const remaining=detectTextInputPromptRegionsBase(source,reduced,true).slice(0,1)
          .filter(candidate=>rectAllowedForOcr(source,candidate.rect,options)&&rectAllowedForOcr(source,candidate.bottomRect,options));
        assertOcrJobCurrent();
        if(!remaining.length)textAfterNormalStats.skipped['no-remaining-layout-allowed-candidate']=(textAfterNormalStats.skipped['no-remaining-layout-allowed-candidate']||0)+1;
        else if(performance.now()-startedAt>=7000)textAfterNormalStats.skipped['budget-before-continuation']=(textAfterNormalStats.skipped['budget-before-continuation']||0)+1;
        else{
          const record={scope:options.confirmationLabel==='문자 입력형'?'text-confirmation':'first-targeted',confirmationRect:options.confirmationRect?{...options.confirmationRect}:null,marker:source.auditFrameMarker?{...source.auditFrameMarker}:null,width:source.width,height:source.height,
            elapsedBeforeMs:performance.now()-startedAt,exhaustedRegions:textInputRegions.map(r=>({id:r.id,rect:{...r.rect}})),
            removedCandidates:removed,selected:remaining.map(r=>({id:r.id,score:r.score,threshold:r.threshold,rect:{...r.rect},retrievalRecovery:r.retrievalRecovery})),
            jobGeneration:activeOcrJob?.generation,attemptStart,status:'INCOMPLETE',sameOriginalJob:true};
          textAfterNormalStats.attempted++;
          try{
            const continued=await readExistingTextInputCandidates(remaining);
            assertOcrJobCurrent();
            record.additionalAttempts=attempts.length-attemptStart;
            record.additionalOcrReadAttemptRecords=attempts.slice(attemptStart).filter(a=>a.textInputFixedPart==='top'||a.textInputFixedPart==='bottom'||a.textInputFast===true).length;
            if(continued){record.status='PASSED';textAfterNormalStats.passed++;return continued;}
            if(record.additionalOcrReadAttemptRecords===0){
              record.status=performance.now()-startedAt>=7000?'NOT_EXECUTED_BUDGET':'NOT_EXECUTED_NO_READABLE_REGION';
              textAfterNormalStats.attempted--;
              textAfterNormalStats.skipped[record.status]=(textAfterNormalStats.skipped[record.status]||0)+1;
            }else{record.status='FINAL_FALSE';textAfterNormalStats.failed++;}
          }finally{
            record.elapsedWallMs=performance.now()-continuationStarted;textAfterNormalStats.totalWallMs+=record.elapsedWallMs;
            if(record.status==='INCOMPLETE')textAfterNormalStats.incomplete++;
            if(textAfterNormalStats.rows.length<8)textAfterNormalStats.rows.push(record);else textAfterNormalStats.rowsDropped++;try{window.__M8_TEXT_FALLBACK?.(record);}catch(_){}
          }
        }
      }
    }

    if(M36_EXTRA_STRUCTURAL_OCR_ENABLED&&options.textInputOnly===true&&options.m36ScopedTextExtra===true){
      m36ExtraStats.considered++;
      const eligibility=m36ExtraEligibility(options,m36ExtraVisited,attempts,performance.now()-startedAt);
      if(eligibility)m36ExtraSkip(eligibility);
      else{
        assertOcrJobCurrent();
        const reduced=m36ExtraReducedOptions(options,m36ExtraVisited);
        const extra=detectTextInputPromptRegionsBase(source,reduced.options,true).slice(0,1)
          .filter(candidate=>rectAllowedForOcr(source,candidate.rect,options)&&rectAllowedForOcr(source,candidate.bottomRect,options));
        assertOcrJobCurrent();
        if(!extra.length)m36ExtraSkip('no-remaining-existing-structural-region');
        else if(performance.now()-startedAt>=7000)m36ExtraSkip('original-budget-before-extra');
        else{
          const record={at:performance.now(),scopedTextOwner:options.m36ScopedTextOwner||null,route:options.m36ScopedTextRoute,scope:options.m36ScopedTextRoute,status:'INCOMPLETE',elapsedBeforeMs:performance.now()-startedAt,exhausted:m36ExtraVisited.map(c=>({id:c.id,rect:{...c.rect}})),removed:reduced.removed,selected:extra.map(c=>({id:c.id,score:c.score,threshold:c.threshold,rect:{...c.rect},retrievalRecovery:c.retrievalRecovery})),attemptStart:attempts.length,sameOriginalJob:true,operatingVoteInjected:false};
          m36ExtraStats.attempted++;
          try{
            const extraResult=await readExistingTextInputCandidates(extra);
            assertOcrJobCurrent();record.additionalAttempts=attempts.length-record.attemptStart;
            record.additionalOcrReads=attempts.slice(record.attemptStart).filter(a=>a.textInputFixedPart==='top'||a.textInputFixedPart==='bottom').length;
            if(extraResult){record.status='PASSED';m36ExtraStats.passed++;return extraResult;}
            const classification=m36ExtraNonmatchState(extra,attempts.slice(record.attemptStart),performance.now()-startedAt);
            record.status=classification.status;if(classification.reason)record.incompleteReason=classification.reason;
            if(record.status==='FINAL_FALSE')m36ExtraStats.failed++;
            else if(record.status==='NOT_EXECUTED_ORIGINAL_BUDGET'){m36ExtraStats.attempted--;m36ExtraSkip(record.status);}
          }finally{record.completedAt=performance.now();record.elapsedAtEndMs=record.completedAt-startedAt;if(record.status==='INCOMPLETE')m36ExtraStats.incomplete++;m36ExtraRecord(record,source);}
        }
      }
    }

    if(options.textInputOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"문자 입력형",reason:textInputRegions.length?"문자 입력 안내 구조 확인 · 기존 고정 OCR 의미 부족":"문자 입력 안내 구조 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v14-text-input-only",textInputRegions};

    // 위치와 무관하게 찾은 비올레타 안내판을 가장 먼저 OCR한다.
    // 저화질 작은 팝업에서도 읽히도록 안내판 전체와 두 문장 영역을 분리해 확대한다.
    const compactViolettaFixed=Boolean(options.violettaFixedOnly&&source.width<640&&source.height>=source.width*.9);
    const fixedViolettaCandidates=compactViolettaFixed?[...violettaRegions].sort((a,b)=>a.textRect.w*a.textRect.h-b.textRect.w*b.textRect.h||a.textRect.y-b.textRect.y):violettaRegions;
    for (const [candidateIndex,candidate] of fixedViolettaCandidates.slice(0,1).entries()) {
      const t=candidate.textRect;
      const wideHeader=candidate.variant==="wide-header";
      const lineRegions=(wideHeader ? [
        {x:t.x+t.w*.01,y:t.y,w:t.w*.98,h:t.h,kind:"violetta-line",lineName:"wide-header",lineCount:1,priority:9250}
      ] : [
        {x:t.x+t.w*.025,y:t.y+t.h*.08,w:t.w*.95,h:t.h*.40,kind:"violetta-line",lineName:"intro",lineCount:1,priority:9200},
        {x:t.x+t.w*.025,y:t.y+t.h*.49,w:t.w*.95,h:t.h*.39,kind:"violetta-line",lineName:"outcome",lineCount:1,priority:9190},
        {...t,kind:"violetta",lineName:"whole",lineCount:2,priority:9100}
      ]).map(r=>normalizeRect(r,source.width,source.height));
      const plans=compactViolettaFixed?[
        {region:{...t,kind:"violetta",lineName:"compact-whole",lineCount:2},variant:"gray",psm:window.Tesseract.PSM.SINGLE_BLOCK}
      ]:wideHeader ? [
        {region:lineRegions[0],variant:"color",psm:window.Tesseract.PSM.SINGLE_LINE},
        {region:lineRegions[0],variant:"gray",psm:window.Tesseract.PSM.SINGLE_LINE},
        {region:lineRegions[0],variant:"adaptive",psm:window.Tesseract.PSM.SINGLE_LINE}
      ] : [
        {region:lineRegions[0],variant:"color",psm:window.Tesseract.PSM.SINGLE_LINE},
        {region:lineRegions[1],variant:"gray",psm:window.Tesseract.PSM.SINGLE_LINE},
        {region:lineRegions[2],variant:"adaptive",psm:window.Tesseract.PSM.SINGLE_BLOCK}
      ];
      const combined={violetta:false,beautiful:false,find:false,correct:false,test:false,pass:false,fail:false};
      const texts=[];
      for (const plan of (options.violettaFixedOnly?plans.slice(0,2):plans)) {
        if (performance.now()-startedAt>8500) break;
        const region={...plan.region,variant:plan.variant};
        try {
          const rendered=renderVariant(source,region);
          const result=await recognize(rendered.canvas,plan.psm,{
            offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height
          });
          const item={...result,region,violettaStructureScore:candidate.score,...(options.violettaFixedOnly?{psm:plan.psm}:{})};
          attempts.push(item);
          texts.push(item.text||item.rawText||"");
          for(const key of Object.keys(combined)) combined[key]=combined[key]||Boolean(item.signals?.[key]);
          const wideHeaderSemanticOk=!wideHeader || Boolean(item.signals?.violetta && (item.signals?.beautiful || item.signals?.find));
          if(item.matched && item.label==="비올레타형" && wideHeaderSemanticOk){
            return {
              matched:true,score:Number(item.score||0),threshold:THRESHOLD,label:"비올레타형",
              reason:`전체 화면 비올레타 구조 + 분할 OCR · ${item.reason}`,text:item.text||"",rawText:item.rawText||"",
              rect:candidate.rect||candidate.textRect,durationMs:Math.round(performance.now()-startedAt),attempts,
              engine:"edge-candidate-ocr-v9",candidateRegions:regions,violettaRegions
            };
          }
          if(!wideHeader&&texts.length>=2&&Number(candidate.score||0)>=VIOLETTA_STRUCTURE_THRESHOLD){
            const named=combined.violetta&&(combined.beautiful||combined.find||combined.correct||combined.test||combined.pass||combined.fail);
            const pair=(combined.beautiful||combined.find)&&(combined.correct||combined.test||combined.pass||combined.fail);
            if(named||pair)break;
          }
        } catch(error) {if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          if(error?.code==="OCR_CANCELLED")throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true,violettaFast:true});
        }
      }
      const named=combined.violetta && (combined.beautiful||combined.find||combined.correct||combined.test||combined.pass||combined.fail);
      const sentencePair=(combined.beautiful||combined.find) && (combined.correct||combined.test||combined.pass||combined.fail);
      if(Number(candidate.score||0)>=VIOLETTA_STRUCTURE_THRESHOLD && (named||(!compactViolettaFixed&&sentencePair))){
        return {
          matched:true,score:named?.98:.95,threshold:THRESHOLD,label:"비올레타형",
          reason:named?"전체 화면 비올레타 구조 + 분할 OCR 고유 문구":"전체 화면 비올레타 구조 + 두 안내 문장 교차 확인",
          text:texts.filter(Boolean).join(" / "),rawText:texts.filter(Boolean).join(" / "),
          rect:candidate.rect||candidate.textRect,durationMs:Math.round(performance.now()-startedAt),attempts,
          engine:"edge-candidate-ocr-v9",candidateRegions:regions,violettaRegions
        };
      }
      const d=candidate.diagnostics||{};
      const visualSignature=Number(candidate.score||0)>=.93 &&
        Number(d.cyan||0)>=.65 &&
        Number(d.aboveDark||0)+Number(d.aboveNavy||0)>=.70 &&
        Number(d.belowDark||0)>=.40 &&
        Number(d.borderWhite||0)>=.05 &&
        Number(d.yellow||0)>=.02 &&
        Number(d.pink||0)>=.06;
      if(visualSignature){
        attempts.push({matched:false,score:.84,threshold:THRESHOLD,label:"비올레타 시각 후보",reason:"시각 서명만 확인 · OCR 고유 문구 미확인",region:candidate.rect||candidate.textRect,visualSignature:true});
      }
    }
    if(violettaGeneralOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"비올레타형",reason:violettaRegions.length?"비올레타 구조 확인 · 기존 분할 OCR 의미 부족":"비올레타 구조 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-r8-violetta-general-only",violettaRegions};
    if(options.violettaFixedOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"비올레타형",reason:violettaRegions.length?"비올레타 구조 확인 · 고정 두 안내 의미 부족":"고신뢰 비올레타 구조 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v14-violetta-fixed",violettaRegions};


    // 88992/88993 인라인 클릭 안내문: 템플릿은 위치만 찾고 OCR 문맥이 반드시 동반되어야 한다.
    // 전체 블록과 하단 안내 줄을 따로 읽어 스킬 이펙트/데미지 숫자 가림에 대응한다.
    const inlineClickResult=await evaluateExistingInlineClickRegions(inlineClickRegions,blueInputRegions);
    if(inlineClickResult)return inlineClickResult;
    if(options.inlineContourOnly)return {matched:false,score:0,threshold:THRESHOLD,label:"클릭형 거탐",reason:inlineClickRegions.length?"인라인 클릭 위치 확인 · 제한 OCR 문맥 부족":"일치한 인라인 클릭 후보 없음",rect:null,durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v14-inline-contour",inlineClickRegions};

    // 밝기 변화에도 안정적인 회색조 LIE DETECTOR 글자 상관도.
    // 팝업 외형이 아니라 제목 글자 자체가 0.90 이상 일치할 때만 확정한다.
    const grayTitleCandidate = [options?.contourBest, ...(options?.contourCandidates || [])]
      .filter(Boolean)
      .filter(item => String(item.id || "").startsWith("lie-title-gray-") && item.matched === true)
      .sort((a,b)=>Number(b.score||0)-Number(a.score||0))[0];
    if(grayTitleCandidate){
      const companion=titleCompanionCandidate(options,grayTitleCandidate.rect,source);
      attempts.push({...grayTitleCandidate,matched:false,fastGrayTitle:true,
        reason:companion?`회색조 제목 후보 + 독립 팝업 후보 ${companion.id}`:"회색조 제목 후보만 확인 · 단독 확정 금지",
        titleCompanionId:companion?.id||null});
    }

    // 색상으로 분리된 LIE DETECTOR 글자 자체가 알려진 제목 윤곽과 매우 높게 일치하면
    // OCR이 빈 문자열을 반환하는 작은 글씨도 안전하게 보완한다. 팝업 외형은 사용하지 않는다.
    const colorTitleRegions = detectEnglishTitleRegions(source)
      .filter(region=>{
        const r=region?.glyphRect||region;
        const aspect=Number(r?.w||0)/Math.max(1,Number(r?.h||0));
        return Number(r?.w||0)>=80 && Number(r?.h||0)>=10 && aspect>=2.2 && aspect<=15;
      })
      .slice(0,8);
    const contourTitleRegions = [options?.contourBest, ...(options?.contourCandidates || [])]
      .filter(Boolean)
      .filter(item => String(item.id || "").startsWith("lie-title") && item.rect)
      .filter(item => Number(item.score || -1) >= Number(item.threshold || .58) - .02)
      .map(item => {
        const glyphRect=normalizeRect(item.rect,source.width,source.height);
        return {...glyphRect,glyphRect,kind:"title-contour",variant:"gray",lineCount:1,priority:8000,score:Number(item.score||0),contourId:item.id};
      });
    let titleOutline = {matched:false,score:0,threshold:TITLE_WORD_MATCH_THRESHOLD};
    try {
      titleOutline = await matchHighConfidenceEnglishTitle(source,[...contourTitleRegions,...colorTitleRegions]);
      attempts.push({...titleOutline,fastTitleOutline:true});
      if(titleOutline.matched){
        const companion=titleCompanionCandidate(options,titleOutline.rect,source);
        if(companion){
          return {
            matched:true,score:Number(titleOutline.score||0),threshold:TITLE_WORD_MATCH_THRESHOLD,
            label:titleOutline.label,reason:`${titleOutline.reason} + 독립 팝업 후보 ${companion.id}`,text:"LIE DETECTOR",rawText:"",
            rect:titleOutline.rect||null,durationMs:Math.round(performance.now()-startedAt),attempts,
            engine:"edge-candidate-ocr-v9",candidateRegions:regions
          };
        }
        attempts.push({...titleOutline,matched:false,reason:"LIE DETECTOR 제목 윤곽만 확인 · 단독 확정 금지",titleOnly:true});
      }
    } catch(error) {if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
      attempts.push({matched:false,score:0,reason:error.message||String(error),error:true,fastTitleOutline:true});
    }

    // 정상 사냥 화면에서 매 주기마다 무거운 OCR을 실행하면 Tesseract가 장시간 누적 대기할 수 있다.
    // 글자 윤곽 후보가 실제로 근접한 경우에만 OCR을 열어 안정성과 오탐을 함께 지킨다.
    const ocrContourHint = (options?.contourCandidates || []).some(item => {
      if(!item || String(item.id||"").startsWith("lie-title") || TEXT_INPUT_TEMPLATE_ID_PATTERN.test(String(item.id||""))) return false;
      const id=String(item.id||"");
      const margin=Number(item.score||-1)-Number(item.threshold||1);
      const rect=item.rect||null;
      const area=rect ? (Number(rect.w||0)*Number(rect.h||0))/Math.max(1,source.width*source.height) : 1;
      // 77986은 단독 윤곽 확정을 엄격하게 제한했으므로, 기존 강윤곽 진입선(.04)부터
      // OCR을 열어 실제 거탐 문구를 확인한다. 나머지 템플릿은 기존 .10 힌트를 유지한다.
      const minMargin=id==="77986" ? .04 : .10;
      return margin>=minMargin && area>.005 && area<=.25;
    });
    const titleHintRect=titleOutline.rect||grayTitleCandidate?.rect||null;
    const titleCompanion=titleCompanionCandidate(options,titleHintRect,source);
    const rainbowRecoveryRegions = Array.isArray(options?.rainbowRecoveryRegions) ? options.rainbowRecoveryRegions.filter(Boolean) : [];
    const shouldRunOcr = rainbowRecoveryRegions.length>0 || textInputRegions.length>0 || violettaRegions.length>0 || inlineClickRegions.length>0 || ocrContourHint || (Boolean(titleCompanion) && (Number(titleOutline.score||0)>=.82 || Number(grayTitleCandidate?.score||0)>=.90));
    if(!shouldRunOcr){
      return {
        matched:false,score:Number(titleOutline.score||0),threshold:THRESHOLD,
        label:"거짓말 탐지기 문구",reason:"고신뢰 글자 후보 없음 · OCR 생략",text:"",rawText:"",
        rect:titleOutline.rect||null,durationMs:Math.round(performance.now()-startedAt),attempts,
        engine:"edge-candidate-ocr-v9",candidateRegions:regions
      };
    }

    // 일반 팝업은 상단의 LIE DETECTOR 제목이 가장 안정적인 표식이다.
    // 윤곽 후보는 실행 여부만 결정하며, 영문 OCR이 실제 문구를 확인해야 통과한다.
    const titleCandidate = [options?.contourBest, ...(options?.contourCandidates || [])]
      .filter(Boolean)
      .filter(item => String(item.id || "").startsWith("lie-title") && !String(item.id || "").startsWith("lie-title-gray-") && Number(item.score || -1) >= Number(item.threshold || .58) - .03)
      .sort((a,b) => (Number(b.score||-1)-Number(b.threshold||1)) - (Number(a.score||-1)-Number(a.threshold||1)))[0];
    if (titleCandidate) {
      const tr = normalizeRect(titleCandidate.rect || {x:0,y:0,w:source.width,h:source.height}, source.width, source.height);
      const px = Math.max(20, Math.round(tr.w * .28));
      const py = Math.max(14, Math.round(tr.h * .75));
      const tightRegion = normalizeRect({x:tr.x-px,y:tr.y-py,w:tr.w+px*2,h:tr.h+py*2},source.width,source.height);
      const titleRegions = [];
      for (const region of colorTitleRegions.slice(0,3)) {
        titleRegions.push({...region,variant:"binary-inv-130"});
        titleRegions.push({...region,variant:"gray",priority:region.priority-1});
      }
      const titleMargin = Number(titleCandidate.score||-1)-Number(titleCandidate.threshold||1);
      if (titleMargin >= .02) {
        titleRegions.push(
          {...tightRegion,kind:"preferred",variant:"gray",lineCount:1,priority:6000},
          {...tightRegion,kind:"preferred",variant:"adaptive",lineCount:1,priority:5999}
        );
      }
      for (const fullRegion of titleRegions) {
        try {
          const rendered = renderVariant(source, fullRegion);
          const header = await recognizeEnglishHeader(rendered.canvas, {
            offset:{x:fullRegion.x,y:fullRegion.y}, scaleBack:1/rendered.scale, frameW:source.width, frameH:source.height
          }, fullRegion.kind === "full" ? window.Tesseract.PSM.SPARSE_TEXT : window.Tesseract.PSM.SINGLE_LINE);
          let item = {...header, region:fullRegion};
          if (!item.matched && fullRegion.kind === "title-color") {
            const letters=String(item.rawText||item.text||"").toUpperCase().replace(/[^A-Z]/g,"");
            const strongTitleMargin=Number(titleCandidate?.score||-1)-Number(titleCandidate?.threshold||1);
            if (strongTitleMargin>=.08 && letters.length >= 8 && letters.length <= 16 && has(letters,"DETECTOR",1)) {
              item={...item,matched:true,score:.94,label:"거짓말 탐지기 팝업",reason:"강한 제목 윤곽 + DETECTOR 부분 OCR",evidence:["DETECTOR"]};
            }
          }
          attempts.push(item);
          if (!best || item.score > best.score) best = item;
          if (item.matched) {
            const companion=titleCompanionCandidate(options,titleCandidate.rect,source);
            if(companion){
              return {
                matched:true, score:Number(item.score||0), threshold:THRESHOLD,
                label:item.label||"거짓말 탐지기 팝업", reason:`${item.reason||"LIE DETECTOR OCR 확인"} + 독립 팝업 후보 ${companion.id}`,
                text:item.text||"", rawText:item.rawText||"", rect:titleCandidate.rect||null,
                durationMs:Math.round(performance.now()-startedAt), attempts,
                engine:"edge-candidate-ocr-v9", candidateRegions:regions
              };
            }
            item={...item,matched:false,score:Math.min(.84,Number(item.score||0)),reason:"LIE DETECTOR OCR만 확인 · 독립 팝업 증거 없음",titleOnly:true};
            attempts[attempts.length-1]=item;
            if (!best || item.score > best.score) best = item;
          }
        } catch (error) {if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
          attempts.push({matched:false,score:0,reason:error.message||String(error),region:fullRegion,error:true,fastHeader:true});
        }
        if (performance.now()-startedAt>maxDuration) break;
      }
    }

    const outlineHint = (options?.contourCandidates || []).some(item =>
      String(item?.id || "") !== "lie-title" &&
      !TEXT_INPUT_TEMPLATE_ID_PATTERN.test(String(item?.id || "")) &&
      Number(item?.score || -1) >= Number(item?.threshold || 1) + .04
    );
    const maxAttempts = rainbowRecoveryRegions.length>0 ? 8 : ((outlineHint || textInputRegions.length>0 || violettaRegions.length>0 || inlineClickRegions.length>0 || options.clickLikely) ? 6 : 3);
    let generalAttempts = 0;

    for (let index=0; index<regions.length; index+=1) {
      if (performance.now()-startedAt>maxDuration) break;
      if (generalAttempts>=maxAttempts) break;
      const region=regions[index];
      // 영문 빠른 검사에서 이미 전체 gray를 읽었으면 같은 입력을 중복 분석하지 않는다.
      if (titleCandidate && region.kind==="full" && (region.variant==="gray" || region.variant==="adaptive")) continue;
      const rendered=renderVariant(source,region);
      generalAttempts += 1;
      let result;
      try {
        const psm=(region.kind==="preferred"||region.kind==="rainbow-recovery"||region.kind==="text-input"||region.kind==="violetta"||region.kind==="inline-click")?window.Tesseract.PSM.SINGLE_BLOCK:window.Tesseract.PSM.SPARSE_TEXT;
        result=await recognize(rendered.canvas,psm,{
          offset:{x:region.x,y:region.y},scaleBack:1/rendered.scale,frameW:source.width,frameH:source.height
        });
      } catch(error) {if(R3_FRAME_YIELD && ['OCR_SUPERSEDED','OCR_CANCELLED'].includes(error?.code))throw error;
        attempts.push({matched:false,score:0,reason:error.message||String(error),region,error:true});
        continue;
      }
      let item={...result,region};
      const titleMargin=Number(titleCandidate?.score||-1)-Number(titleCandidate?.threshold||1);
      const titleContext=String(titleCandidate?.id||"").startsWith("lie-title") && titleMargin>=.05;
      const rawForTitle=String(item.rawText||item.text||"");
      const strictHeader=evaluateEnglishHeader(rawForTitle);
      if(!item.matched && titleContext && strictHeader.matched){
        const companion=titleCompanionCandidate(options,titleCandidate?.rect,source);
        if(companion){
          item={...item,matched:true,score:0.94,label:"거짓말 탐지기 팝업",reason:`제목 윤곽 + LIE DETECTOR 엄격 OCR + 독립 팝업 후보 ${companion.id}`};
        }else{
          item={...item,matched:false,score:Math.min(.84,Number(item.score||0)),reason:"LIE DETECTOR 엄격 OCR만 확인 · 독립 팝업 증거 없음",titleOnly:true};
        }
      }
      attempts.push(item);
      if(!best||item.score>best.score)best=item;
      if(item.matched)break;
    }

    return {
      matched:Boolean(best?.matched),score:Number(best?.score||0),threshold:THRESHOLD,
      label:best?.label||"거짓말 탐지기 문구",reason:best?.reason||"OCR 핵심 문구 미확인",
      text:best?.text||"",rawText:best?.rawText||"",rect:best?.rect||best?.region||null,
      durationMs:Math.round(performance.now()-startedAt),attempts,engine:"edge-candidate-ocr-v10",candidateRegions:regions,textInputRegions
    };
  }

  async function terminate() { cancelGeneration += 1; activeOcrJob?.cancel(ocrCancelledError()); await resetOcrWorker("OCR 워커 종료"); }
  window.MAlertOcr = { researchFixedInstructionEdgeRadius2Enabled:()=>FIXED_INSTRUCTION_EDGE_RADIUS2_RESEARCH_ENABLED, researchReadCurrentFixedYellowParentFirstEnabled:()=>READ_CURRENT_FIXED_YELLOW_PARENT_FIRST_RESEARCH_ENABLED, researchPreferCurrentFixedYellowParentEnabled:()=>PREFER_CURRENT_FIXED_YELLOW_PARENT_RESEARCH_ENABLED, researchPreferConfirmedYellowCandidateEnabled:()=>PREFER_CONFIRMED_YELLOW_CANDIDATE_RESEARCH_ENABLED, researchEarlyYellowAfterFixedEnabled:()=>EARLY_YELLOW_AFTER_FIXED_RESEARCH_ENABLED, researchFastViolettaSplitAfterFixedEnabled:()=>FAST_VIOLETTA_SPLIT_AFTER_FIXED_RESEARCH_ENABLED, researchTextStructuralFallbackEnabled:()=>TEXT_INPUT_STRUCTURAL_FALLBACK_RESEARCH_ENABLED, detectYellowPromptRegions, detectInlineFixedInstructionRegions, detectBlueInputGuideRegions, blueGuideCoversYellowRegion, init, analyze, terminate, evaluateText, detectEdgeTextRegions, detectEnglishTitleRegions, detectTextInputPromptRegions, detectViolettaPopupRegions, detectInlineClickPromptRegions, matchHighConfidenceEnglishTitle, setStatusCallback(fn) { statusCallback = typeof fn === "function" ? fn : null; }, normalizeText: norm };
})();

