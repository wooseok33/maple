/* 재획 알리미 ↔ M-ALERT 감지 엔진 연결부.
   감지 로직(app.js 등)은 원본 그대로 두고, 바깥과 주고받는 부분만 바꿉니다.
   - 화면: 알리미가 이미 공유 중인 화면을 그대로 넘겨받음 (공유 창을 두 번 고르지 않음)
   - 소리·알림: 알리미가 대신 울리므로 엔진 자체 음성/알림은 끔
   - 타이머: 탭이 뒤로 가도 느려지지 않게 Worker 타이머 사용
   - 감지되면 알리미에 알리고 엔진 쪽 경고창은 닫음 */
(function () {
  'use strict';
  var host = null;
  try { if (window.parent !== window && window.parent.__lieHost) host = window.parent.__lieHost; } catch (e) { host = null; }
  window.__LIE_EMBED = !!host;
  if (!host) return; /* 단독으로 열면 원본과 똑같이 동작 */

  /* 민감도 보정값: 알리미 게이지에서 실시간으로 읽음 (기본 0 = 원본 기준) */
  Object.defineProperty(window, '__LIE_THR_OFF', { configurable: true, get: function () { try { return +host.off() || 0; } catch (e) { return 0; } } });

  /* OCR 언어 데이터: 같은 폴더에 있으면 그것을, 없으면 Tesseract 기본 위치(CDN)를 사용 */
  window.__LIE_LANG_LOCAL = false;
  try { fetch(new URL('../assets/ocr/lang/kor.traineddata.gz', document.baseURI).href, { method: 'HEAD', cache: 'no-store' }).then(function (r) { window.__LIE_LANG_LOCAL = !!r.ok; }, function () {}); } catch (e) {}

  /* Worker 타이머 */
  try {
    var src = 'var m={};onmessage=function(e){var d=e.data;if(d[0]==="s"){m[d[1]]=(d[3]?setInterval:setTimeout)(function(){if(!d[3])delete m[d[1]];postMessage(d[1])},d[2])}else{clearTimeout(m[d[1]]);clearInterval(m[d[1]]);delete m[d[1]]}}';
    var tw = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    var nST = window.setTimeout.bind(window), nSI = window.setInterval.bind(window), nCT = window.clearTimeout.bind(window), nCI = window.clearInterval.bind(window);
    var cbs = new Map(), seq = 1000000;
    tw.onmessage = function (e) {
      var c = cbs.get(e.data); if (!c) return; if (!c.rep) cbs.delete(e.data);
      try { c.fn.apply(window, c.args); } catch (err) { if (typeof reportError === 'function') reportError(err); else nST(function () { throw err; }, 0); }
    };
    var set = function (rep, fn, ms, args) {
      if (typeof fn !== 'function') return (rep ? nSI : nST)(fn, ms);
      var id = ++seq; cbs.set(id, { fn: fn, args: args, rep: rep }); tw.postMessage(['s', id, Math.max(0, +ms || 0), rep]); return id;
    };
    var clr = function (id) { if (cbs.has(id)) { cbs.delete(id); tw.postMessage(['c', id]); } else { nCT(id); nCI(id); } };
    window.setTimeout = function (fn, ms) { return set(false, fn, ms, Array.prototype.slice.call(arguments, 2)); };
    window.setInterval = function (fn, ms) { return set(true, fn, ms, Array.prototype.slice.call(arguments, 2)); };
    window.clearTimeout = clr; window.clearInterval = clr;
  } catch (e) {}

  /* 화면: 알리미의 공유 화면 사본을 넘겨줌 */
  try {
    var md = navigator.mediaDevices;
    if (md) Object.defineProperty(md, 'getDisplayMedia', { configurable: true, value: function () {
      var s = null; try { s = host.stream(); } catch (e) {}
      return s ? Promise.resolve(s) : Promise.reject(new DOMException('화면 공유가 없습니다', 'NotAllowedError'));
    } });
  } catch (e) {}

  /* 엔진 자체 음성·알림·팝업 끄기 (알리미가 대신 알림) */
  try { window.SpeechSynthesisUtterance = undefined; } catch (e) {}
  try {
    var N = function () {}; N.permission = 'denied'; N.requestPermission = function () { return Promise.resolve('denied'); };
    window.Notification = N;
  } catch (e) {}
  window.alert = function (m) { try { host.msg(String(m)); } catch (e) {} };

  var $ = function (s) { return document.querySelector(s); };
  var txt = function (s) { var el = $(s); return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
  window.__lieBridge = {
    status: function () {
      var v = $('#captureVideo');
      return { capture: txt('#captureStatus'), engine: txt('#cvStatus'), last: txt('#lastAnalysis'), type: txt('#detectedType'),
        score: txt('#matchScore'), alert: txt('#lastAlert'), live: !!(v && v.srcObject && v.videoWidth) };
    },
    stop: function () { var b = $('#stopCaptureBtn'); if (b && !b.disabled) b.click(); }
  };

  function boot() {
    var ov = $('#urgentOverlay');
    if (ov) new MutationObserver(function () {
      if (ov.hidden) return;
      try { host.hit({ title: txt('#urgentTitle'), body: txt('#urgentBody') }); } catch (e) {}
      setTimeout(function () { var b = $('#dismissAlertBtn'); if (b) b.click(); }, 200);
    }).observe(ov, { attributes: true, attributeFilter: ['hidden'] });
    /* 공유 영상이 멈춰 있으면 다시 재생 */
    setInterval(function () { var v = $('#captureVideo'); if (v && v.srcObject && v.paused) { try { v.play().catch(function () {}); } catch (e) {} } }, 2000);
    var b = $('#startCaptureBtn');
    if (b) b.click();
    try { host.ready(); } catch (e) {}
  }
  window.addEventListener('load', function () { setTimeout(boot, 30); });
})();
