"use strict";
importScripts("./contour-matching-core-r39.js?rev=M39-MXRSF2-20261019-RELEASE1&m39Arm=MXRSF2&m39SeedCoverage=1");

// Yield between rows so a quick scan can share this worker with a full scan.
// The score formula, search positions, candidate order and thresholds are unchanged.
let templates = [], scheduled = false, quickSlices = 0;
const normal = [], quick = [], continuation = new MessageChannel();
continuation.port1.onmessage = runSlice;
function schedule() {
  if (!scheduled && (normal.length || quick.length)) {
    scheduled = true;
    continuation.port2.postMessage(0);
  }
}
function runSlice() {
  scheduled = false;
  const queue = quick.length && (!normal.length || quickSlices < 2) ? quick : normal;
  const job = queue.shift();
  if (!job) return;
  quickSlices = queue === quick ? quickSlices + 1 : 0;
  const until = performance.now() + 8;
  try {
    if (!job.source) job.source = MAlertContourCore.prepareSource(job.features);
    do {
      if (!job.iterator) {
        if (job.position === job.indices.length) {
          postMessage({ id: job.id, result: job.results });
          schedule();
          return;
        }
        job.iterator = job.retainRisingSeedSidecar === true
          ? MAlertContourCore.scanTemplateIterator(job.source, templates[job.indices[job.position]], job.maxCandidates, { retainRisingSeedSidecar: true })
          : MAlertContourCore.scanTemplateIterator(job.source, templates[job.indices[job.position]], job.maxCandidates);
      }
      const next = job.iterator.next();
      if (next.done) {
        job.results.push(next.value);
        job.position++;
        job.iterator = null;
      }
    } while (performance.now() < until);
    queue.push(job);
  } catch (error) {
    postMessage({ id: job.id, error: String(error?.message || error) });
  }
  schedule();
}
self.onmessage = ({ data }) => {
  try {
    if (data.type === "init") {
      templates = data.templates;
      postMessage({ id: data.id, result: { ready: true } });
    } else if (data.type === "scan") {
      if (normal.length + quick.length >= 8) throw Error("Contour queue limit reached");
      if (!data.indices.every(i => Number.isInteger(i) && templates[i])) throw Error("Unknown contour template");
      (data.priority === "quick" ? quick : normal).push({ ...data, position: 0, results: [], iterator: null, source: null });
      schedule();
    }
  } catch (error) {
    postMessage({ id: data.id, error: String(error?.message || error) });
  }
};
