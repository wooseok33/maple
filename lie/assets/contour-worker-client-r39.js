(() => {
  "use strict";
  const workerUrl = new URL("./contour-worker-r39.js?rev=M39-MXRSF2-20261019-RELEASE1", document.currentScript.src);
  // OPT31 H: propagate only the captured local, explicitly enabled research setting.
  const SIMD_NUMERATOR_RESEARCH_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.simdNumerator === true;
  if (SIMD_NUMERATOR_RESEARCH_ENABLED) workerUrl.searchParams.set('mAlertSimdNumerator','1');
  const RISING_SEED_SIDECAR_ENABLED = ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))) && window.__MALERT_RESEARCH_CONFIG?.retainRisingSeedSidecar === true;
  if (RISING_SEED_SIDECAR_ENABLED) workerUrl.searchParams.set('mAlertRisingSeedSidecar','1');
  if (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) workerUrl.searchParams.set('mAlertR39Release','M39-MXRSF2-20261019-RELEASE1');
  const m39CoverageEnabled=(['127.0.0.1','localhost','[::1]'].includes(location.hostname) || (globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true))&&window.__MALERT_M39_SEED_COVERAGE_EXPERIMENT===true;
  if(m39CoverageEnabled)workerUrl.searchParams.set('m39SeedCoverage','1');
  window.MAlertM39SeedCoverage=Object.freeze({enabled:()=>m39CoverageEnabled,defaultEnabled:false});
  workerUrl.searchParams.set('m39Arm','MXRSF2');
  const templateIndices = new WeakMap(), pending = new Map();
  const continuation = new MessageChannel(), waiters = [];
  continuation.port1.onmessage = () => waiters.shift()?.();
  const yieldUi = () => new Promise(resolve => { waiters.push(resolve); continuation.port2.postMessage(0); });
  let templates = null, worker = null, ready = null, disabled = false, generation = 0, sequence = 0;
  const stats = { mode: "idle", completed: 0, fallbackCompleted: 0, cancellations: 0, lastError: null };
  const cancelled = () => new DOMException("Contour scan cancelled", "AbortError");
  function dispose(error) {
    worker?.terminate();
    worker = null;
    ready = null;
    for (const job of pending.values()) { clearTimeout(job.timer); job.reject(error); }
    pending.clear();
  }
  function fail(error) {
    disabled = true;
    stats.mode = "cooperative-fallback";
    stats.lastError = String(error?.message || error);
    dispose(error);
  }
  function request(payload) {
    return new Promise((resolve, reject) => {
      if (!worker) return reject(Error("Contour worker unavailable"));
      const id = ++sequence;
      const timer = setTimeout(() => fail(Error("Contour worker response timeout")), 30000);
      pending.set(id, { resolve, reject, timer });
      try { worker.postMessage({ ...payload, id }); }
      catch (error) { fail(error); }
    });
  }
  function ensureReady() {
    if (disabled) return Promise.resolve(false);
    if (ready) return ready;
    const epoch = generation;
    ready = (async () => {
      try {
        if (!templates) throw Error("Contour templates are not initialized");
        worker = new Worker(workerUrl, { name: "m-alert-contour" });
        stats.mode = "starting";
        worker.onmessage = ({ data }) => {
          if (epoch !== generation) return;
          const job = pending.get(data.id);
          if (!job) return;
          pending.delete(data.id); clearTimeout(job.timer);
          if (data.error) job.reject(Error(data.error)); else job.resolve(data.result);
        };
        worker.onerror = event => { event.preventDefault(); if (epoch === generation) fail(Error(event.message || "Contour worker startup failed")); };
        worker.onmessageerror = () => { if (epoch === generation) fail(Error("Contour worker message could not be decoded")); };
        await request({ type: "init", templates });
        if (epoch !== generation) throw cancelled();
        stats.mode = "worker";
        return true;
      } catch (error) {
        if (epoch !== generation) throw cancelled();
        fail(error);
        return false;
      }
    })();
    return ready;
  }
  async function initialize(fullTemplates, quickTemplates, gateTemplates = []) {
    if (!templates) {
      templates = [...fullTemplates, ...quickTemplates, ...gateTemplates];
      templates.forEach((template, index) => templateIndices.set(template, index));
    }
    return ensureReady();
  }
  async function fallback(features, activeTemplates, maxCandidates, epoch, retainSidecar = false) {
    const source = MAlertContourCore.prepareSource(features), results = [];
    let until = performance.now() + 8;
    for (const template of activeTemplates) {
      const iterator = retainSidecar
        ? MAlertContourCore.scanTemplateIterator(source, template, maxCandidates, { retainRisingSeedSidecar: true })
        : MAlertContourCore.scanTemplateIterator(source, template, maxCandidates);
      while (true) {
        if (epoch !== generation) throw cancelled();
        const next = iterator.next();
        if (next.done) { results.push(next.value); break; }
        if (performance.now() >= until) { await yieldUi(); until = performance.now() + 8; }
      }
    }
    stats.fallbackCompleted++;
    return results;
  }
  async function scan(features, activeTemplates, maxCandidates = 1, options = {}) {
    const retainSidecar = RISING_SEED_SIDECAR_ENABLED && options.retainRisingSeedSidecar === true;
    const epoch = generation;
    const available = await ensureReady();
    if (epoch !== generation) throw cancelled();
    if (available) {
      try {
        const indices = activeTemplates.map(t => templateIndices.get(t));
        if (indices.some(i => i === undefined)) throw Error("Unregistered contour template");
        const payload = { type: "scan", features, indices, maxCandidates, priority: options.priority };
        if (retainSidecar) payload.retainRisingSeedSidecar = true;
        const result = await request(payload);
        if (epoch !== generation) throw cancelled();
        stats.completed++;
        return result;
      } catch (error) {
        if (epoch !== generation) throw cancelled();
        fail(error);
      }
    }
    return retainSidecar
      ? fallback(features, activeTemplates, maxCandidates, epoch, true)
      : fallback(features, activeTemplates, maxCandidates, epoch);
  }
  function cancelAll() {
    generation++;
    stats.cancellations++;
    dispose(cancelled());
    stats.mode = disabled ? "cooperative-fallback" : "idle";
  }
  function makeYieldPoint() {
    const epoch = generation;
    let until = performance.now() + 8;
    return async () => {
      if (epoch !== generation) throw cancelled();
      if (performance.now() >= until) {
        await yieldUi();
        if (epoch !== generation) throw cancelled();
        until = performance.now() + 8;
      }
    };
  }
  window.MAlertContourWorker = { initialize, scan, cancelAll, makeYieldPoint, getStatus: () => ({ ...stats, pending: pending.size, generation }) };
  window.addEventListener("pagehide", cancelAll);
})();
