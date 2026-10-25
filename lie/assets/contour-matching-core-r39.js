(() => {
"use strict";
// OPT31 H: local research flag captured once, before any prepared-source holder exists.
const SIMD_NUMERATOR_RESEARCH_REALM = typeof document === "undefined" ? "worker" : "window";
const SIMD_NUMERATOR_RESEARCH_ENABLED = (() => {
  if (!((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true || (typeof document === 'undefined' && globalThis.location?.pathname === '/assets/contour-worker-r39.js' && new URL(globalThis.location.href).searchParams.get('mAlertR39Release') === 'M39-MXRSF2-20261019-RELEASE1')) || (['127.0.0.1','localhost','[::1]'].includes(globalThis.location?.hostname) || ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (typeof document === 'undefined' && globalThis.location?.pathname === '/assets/contour-worker-r39.js' && new URL(globalThis.location.href).searchParams.get('mAlertR39Release') === 'M39-MXRSF2-20261019-RELEASE1'))))) return false;
  if (SIMD_NUMERATOR_RESEARCH_REALM === "window") return globalThis.__MALERT_RESEARCH_CONFIG?.simdNumerator === true;
  try { return new URL(globalThis.location.href).searchParams.get('mAlertSimdNumerator') === '1'; } catch { return false; }
})();
if (SIMD_NUMERATOR_RESEARCH_ENABLED) {
globalThis.__MAlertSimdNumeratorRuntime=(function createRuntime(binary, options = {}) {
  const stats = {ready:false,wasmCalls:0,jsFallbackCalls:0,instancesCreated:0,arraysCopied:0,arrayBytesCopied:0,descriptorsCreated:0,memoryGrows:0,copyWallMs:0,allocatedBytes:0,maxHolderBytes:0,initializationError:null,lastFallback:null};
  const now=()=>globalThis.performance?.now?.()??Date.now();
  let compiledModule;
  const holders=new WeakMap();
  const maximumBytes=Number.isSafeInteger(options.maximumBytes)?options.maximumBytes:64*1024*1024;
  function fallback(reason){stats.jsFallbackCalls++;stats.lastFallback=String(reason);return null;}
  function reserve(h,bytes){
    const size=Math.ceil(bytes/16)*16,ptr=h.next,end=ptr+size;
    if(!Number.isSafeInteger(end)||end>maximumBytes)throw Error('SIMD diagnostic memory cap');
    if(end>h.memory.buffer.byteLength){h.memory.grow(Math.ceil((end-h.memory.buffer.byteLength)/65536));stats.memoryGrows++;}
    h.next=end;stats.allocatedBytes+=size;stats.maxHolderBytes=Math.max(stats.maxHolderBytes,end);return ptr;
  }
  function newHolder(){
    const instance=new WebAssembly.Instance(compiledModule,{}),h={memory:instance.exports.memory,dot4:instance.exports.dot4,next:64,viewBuffer:null,outView:null,outPtr:0,arrays:new WeakMap(),descriptors:new WeakMap(),disabled:null};
    h.outPtr=reserve(h,32);stats.instancesCreated++;return h;
  }
  function copyArray(h,a){
    if(Object.prototype.toString.call(a)!=='[object Float32Array]')throw Error('SIMD requires original Float32 feature arrays');
    const cached=h.arrays.get(a);if(cached)return cached;
    const started=now(),ptr=reserve(h,a.byteLength+16); // v128-safe zero padding after every array
    new Uint8Array(h.memory.buffer,ptr,a.byteLength).set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));
    new Uint8Array(h.memory.buffer,ptr+a.byteLength,16).fill(0);
    const value={ptr,length:a.length};h.arrays.set(a,value);stats.arraysCopied++;stats.arrayBytesCopied+=a.byteLength;stats.copyWallMs+=now()-started;return value;
  }
  function descriptor(h,source,template){
    const old=h.descriptors.get(template);if(old)return old;
    const channels=template.numeratorChannels,pairs=[];
    for(const c of channels){const s=copyArray(h,source.channels[c]),t=copyArray(h,template.centered[c]);if(s.length<source.width*source.height||t.length<template.width*template.height)throw Error('SIMD feature dimensions');pairs.push([s.ptr,t.ptr]);}
    const ptr=reserve(h,Math.max(16,pairs.length*8)),v=new Uint32Array(h.memory.buffer,ptr,pairs.length*2);
    pairs.forEach((p,i)=>{v[i*2]=p[0];v[i*2+1]=p[1];});const value={ptr,count:pairs.length};h.descriptors.set(template,value);stats.descriptorsCreated++;return value;
  }
  try {
    const bytes=typeof binary==='string'?Uint8Array.from(atob(binary),c=>c.charCodeAt(0)):new Uint8Array(binary);
    compiledModule=new WebAssembly.Module(bytes);
    const exports=WebAssembly.Module.exports(compiledModule);
    if(!exports.some(e=>e.name==='memory'&&e.kind==='memory')||!exports.some(e=>e.name==='dot4'&&e.kind==='function'))throw Error('SIMD module memory/dot4 export missing');
    stats.ready=true;
  }catch(e){stats.initializationError=String(e?.message||e);}
  function dot(source,template,x0,x1,x2,x3,y){
    if(!stats.ready)return fallback(stats.initializationError||'SIMD unavailable');
    if(x1!==x0+2||x2!==x0+4||x3!==x0+6)return fallback('Non-stride2 coarse batch');
    if(!Number.isInteger(x0)||!Number.isInteger(y)||x0<0||y<0||x3+template.width>source.width||y+template.height>source.height)return fallback('Coarse batch bounds');
    let h=holders.get(source);
    try{
      if(!h){h=newHolder();holders.set(source,h);}if(h.disabled)return fallback(h.disabled);
      const d=descriptor(h,source,template);
      h.dot4(d.ptr,d.count,source.width,template.width,template.height,x0,y,h.outPtr);
      // memory.grow detaches old views; always refresh after descriptor allocation/growth.
      if(h.viewBuffer!==h.memory.buffer){h.viewBuffer=h.memory.buffer;h.outView=new Float64Array(h.viewBuffer,h.outPtr,4);}
      stats.wasmCalls++;return h.outView;
    }catch(e){if(h)h.disabled=String(e?.message||e);return fallback(e?.message||e);}
  }
  return {dot,stats,status:()=>({...stats,memoryLifetime:'One instance/memory per prepared source in a WeakMap, no global bump allocator. Source disposal permits complete holder collection. allocatedBytes is cumulative, not live memory.',perSourceMemoryCapBytes:maximumBytes,sourceArrayContract:'Actual immutable prepared Float32 arrays; copied once per array within a prepared-source holder; template descriptors reused within that holder. No pixel hash or stored success.',performanceScope:'Copy wall includes allocation/growth. No per-dot timer. Caller measures full scan including instance creation and first-use copies.'})};
})([0,97,115,109,1,0,0,0,1,12,1,96,8,127,127,127,127,127,127,127,127,0,3,2,1,0,5,3,1,0,1,7,17,2,6,109,101,109,111,114,121,2,0,4,100,111,116,52,0,0,10,137,2,1,134,2,2,8,127,4,123,2,64,3,64,32,8,32,1,79,13,1,32,0,32,8,65,8,108,106,40,2,0,33,11,32,0,32,8,65,8,108,106,40,2,4,33,12,65,0,33,9,2,64,3,64,32,9,32,4,79,13,1,32,11,32,6,32,9,106,32,2,108,32,5,106,65,4,108,106,33,13,32,12,32,9,32,3,108,65,4,108,106,33,14,65,0,33,10,2,64,3,64,32,10,32,3,79,13,1,32,14,42,2,0,187,253,20,33,19,32,16,32,13,253,0,2,0,34,18,32,18,253,13,0,1,2,3,8,9,10,11,0,1,2,3,8,9,10,11,253,95,32,19,253,242,1,253,240,1,33,16,32,17,32,13,253,0,2,16,34,18,32,18,253,13,0,1,2,3,8,9,10,11,0,1,2,3,8,9,10,11,253,95,32,19,253,242,1,253,240,1,33,17,32,13,65,4,106,33,13,32,14,65,4,106,33,14,32,10,65,1,106,33,10,12,0,11,11,32,9,65,1,106,33,9,12,0,11,11,32,8,65,1,106,33,8,12,0,11,11,32,7,32,16,253,11,3,0,32,7,32,17,253,11,3,16,11],{"maximumBytes":67108864});
} else {
  globalThis.__MAlertSimdNumeratorRuntime = null;
}
function researchSimdStatus() {
  const status = globalThis.__MAlertSimdNumeratorRuntime?.status() ?? {ready:false,wasmCalls:0,jsFallbackCalls:0,initializationError:null,lastFallback:null};
  return {enabled:SIMD_NUMERATOR_RESEARCH_ENABLED,executionRealm:SIMD_NUMERATOR_RESEARCH_REALM,...status};
}

const COARSE_STRIDE=2,TOP_COARSE=14,REFINE_RADIUS=3,COARSE_BATCH_SIZE=4;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  function makeIntegralPair(channel, width, height) {
    const stride = width + 1;
    const size = (width + 1) * (height + 1);
    const integral = new Float64Array(size);
    const squareIntegral = new Float64Array(size);
    for (let y = 1; y <= height; y += 1) {
      let row = 0;
      let squareRow = 0;
      for (let x = 1; x <= width; x += 1) {
        const value = channel[(y - 1) * width + (x - 1)];
        row += value;
        squareRow += value * value;
        integral[y * stride + x] = integral[(y - 1) * stride + x] + row;
        squareIntegral[y * stride + x] = squareIntegral[(y - 1) * stride + x] + squareRow;
      }
    }
    return { integral, squareIntegral };
  }

  function rectIntegral(integral, stride, x, y, width, height) {
    const x2 = x + width;
    const y2 = y + height;
    return integral[y2 * stride + x2] - integral[y * stride + x2] - integral[y2 * stride + x] + integral[y * stride + x];
  }

  function prepareSource(features) {
    const integrals = [];
    const squareIntegrals = [];
    for (const channel of features.channels) {
      const pair = makeIntegralPair(channel, features.width, features.height);
      integrals.push(pair.integral);
      squareIntegrals.push(pair.squareIntegral);
    }
    return { ...features, integrals, squareIntegrals };
  }

  function scoreAt(source, template, x, y) {
    const sourceWidth = source.width;
    const tw = template.width;
    const th = template.height;
    const n = tw * th;
    const integralStride = sourceWidth + 1;
    let sourceVariance = 0;
    let numerator = 0;

    for (let c = 0; c < source.channels.length; c += 1) {
      let sum = rectIntegral(source.integrals[c], integralStride, x, y, tw, th);
      let sumSq = rectIntegral(source.squareIntegrals[c], integralStride, x, y, tw, th);
      let activeN = n;
      if (Array.isArray(template.ignoredRectsPx) && template.ignoredRectsPx.length) {
        activeN = Number(template.activeCount || n);
        for (const ignored of template.ignoredRectsPx) {
          sum -= rectIntegral(source.integrals[c], integralStride, x + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sumSq -= rectIntegral(source.squareIntegrals[c], integralStride, x + ignored.x, y + ignored.y, ignored.w, ignored.h);
        }
      }
      sourceVariance += Math.max(0, sumSq - (sum * sum) / Math.max(1, activeN));
    }

    if(sourceVariance <= n * 1e-6) return -1;
    const numeratorChannels = template.numeratorChannels;
    for (let index = 0; index < numeratorChannels.length; index += 1) {
      const c = numeratorChannels[index];
      const values = source.channels[c];
      const centered = template.centered[c];
      let ti = 0;
      for (let yy = 0; yy < th; yy += 1) {
        let si = (y + yy) * sourceWidth + x;
        const end = ti + tw;
        for (; ti < end; ti += 1, si += 1) numerator += values[si] * centered[ti];
      }
    }

    const denominator = Math.sqrt(sourceVariance * template.variance);
    return sourceVariance > n * 1e-6 && denominator > 1e-8 ? clamp(numerator / denominator, -1, 1) : -1;
  }

  // Coarse 위치 4개를 동시에 계산한다. template 값은 한 번 읽고 각 x 후보에 재사용한다.
  // 후보별 numerator 누적 순서는 기존 scoreAt과 동일하므로 점수/좌표/후보 순위가 바뀌지 않는다.
  function scoreAtCoarse4(source, template, x0, x1, x2, x3, y, out) {
    const sourceWidth = source.width;
    const tw = template.width;
    const th = template.height;
    const n = tw * th;
    const integralStride = sourceWidth + 1;
    let sourceVariance0 = 0;
    let sourceVariance1 = 0;
    let sourceVariance2 = 0;
    let sourceVariance3 = 0;
    const ignoredRects = template.ignoredRectsPx;
    const hasIgnoredRects = Array.isArray(ignoredRects) && ignoredRects.length > 0;
    const activeN = hasIgnoredRects ? Number(template.activeCount || n) : n;

    for (let c = 0; c < source.channels.length; c += 1) {
      const integral = source.integrals[c];
      const squareIntegral = source.squareIntegrals[c];
      let sum0 = rectIntegral(integral, integralStride, x0, y, tw, th);
      let sumSq0 = rectIntegral(squareIntegral, integralStride, x0, y, tw, th);
      let sum1 = rectIntegral(integral, integralStride, x1, y, tw, th);
      let sumSq1 = rectIntegral(squareIntegral, integralStride, x1, y, tw, th);
      let sum2 = rectIntegral(integral, integralStride, x2, y, tw, th);
      let sumSq2 = rectIntegral(squareIntegral, integralStride, x2, y, tw, th);
      let sum3 = rectIntegral(integral, integralStride, x3, y, tw, th);
      let sumSq3 = rectIntegral(squareIntegral, integralStride, x3, y, tw, th);
      if (hasIgnoredRects) {
        for (const ignored of ignoredRects) {
          sum0 -= rectIntegral(integral, integralStride, x0 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sumSq0 -= rectIntegral(squareIntegral, integralStride, x0 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sum1 -= rectIntegral(integral, integralStride, x1 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sumSq1 -= rectIntegral(squareIntegral, integralStride, x1 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sum2 -= rectIntegral(integral, integralStride, x2 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sumSq2 -= rectIntegral(squareIntegral, integralStride, x2 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sum3 -= rectIntegral(integral, integralStride, x3 + ignored.x, y + ignored.y, ignored.w, ignored.h);
          sumSq3 -= rectIntegral(squareIntegral, integralStride, x3 + ignored.x, y + ignored.y, ignored.w, ignored.h);
        }
      }
      sourceVariance0 += Math.max(0, sumSq0 - (sum0 * sum0) / Math.max(1, activeN));
      sourceVariance1 += Math.max(0, sumSq1 - (sum1 * sum1) / Math.max(1, activeN));
      sourceVariance2 += Math.max(0, sumSq2 - (sum2 * sum2) / Math.max(1, activeN));
      sourceVariance3 += Math.max(0, sumSq3 - (sum3 * sum3) / Math.max(1, activeN));
    }

    if(Math.max(sourceVariance0,sourceVariance1,sourceVariance2,sourceVariance3) <= n * 1e-6){out.fill(-1);return;}
    let numerator0 = 0;
    let numerator1 = 0;
    let numerator2 = 0;
    let numerator3 = 0;
    // BEGIN_DIAGNOSTIC_SIMD_DOT4_NUMERATOR
    const __simdDot4 = globalThis.__MAlertSimdNumeratorRuntime?.dot(source, template, x0, x1, x2, x3, y) ?? null;
    if (__simdDot4 !== null) {
      numerator0 = __simdDot4[0]; numerator1 = __simdDot4[1];
      numerator2 = __simdDot4[2]; numerator3 = __simdDot4[3];
    } else {
    const numeratorChannels = template.numeratorChannels;
    for (let index = 0; index < numeratorChannels.length; index += 1) {
      const c = numeratorChannels[index];
      const values = source.channels[c];
      const centered = template.centered[c];
      let ti = 0;
      for (let yy = 0; yy < th; yy += 1) {
        let si0 = (y + yy) * sourceWidth + x0;
        let si1 = (y + yy) * sourceWidth + x1;
        let si2 = (y + yy) * sourceWidth + x2;
        let si3 = (y + yy) * sourceWidth + x3;
        const end = ti + tw;
        const fastEnd = end - ((end - ti) % 4);
        for (; ti < fastEnd; ti += 4, si0 += 4, si1 += 4, si2 += 4, si3 += 4) {
          let templateValue = centered[ti];
          numerator0 += values[si0] * templateValue;
          numerator1 += values[si1] * templateValue;
          numerator2 += values[si2] * templateValue;
          numerator3 += values[si3] * templateValue;
          templateValue = centered[ti + 1];
          numerator0 += values[si0 + 1] * templateValue;
          numerator1 += values[si1 + 1] * templateValue;
          numerator2 += values[si2 + 1] * templateValue;
          numerator3 += values[si3 + 1] * templateValue;
          templateValue = centered[ti + 2];
          numerator0 += values[si0 + 2] * templateValue;
          numerator1 += values[si1 + 2] * templateValue;
          numerator2 += values[si2 + 2] * templateValue;
          numerator3 += values[si3 + 2] * templateValue;
          templateValue = centered[ti + 3];
          numerator0 += values[si0 + 3] * templateValue;
          numerator1 += values[si1 + 3] * templateValue;
          numerator2 += values[si2 + 3] * templateValue;
          numerator3 += values[si3 + 3] * templateValue;
        }
        for (; ti < end; ti += 1, si0 += 1, si1 += 1, si2 += 1, si3 += 1) {
          const templateValue = centered[ti];
          numerator0 += values[si0] * templateValue;
          numerator1 += values[si1] * templateValue;
          numerator2 += values[si2] * templateValue;
          numerator3 += values[si3] * templateValue;
        }
      }
    }

    }
    // END_DIAGNOSTIC_SIMD_DOT4_NUMERATOR

    const templateVariance = template.variance;
    const denominator0 = Math.sqrt(sourceVariance0 * templateVariance);
    const denominator1 = Math.sqrt(sourceVariance1 * templateVariance);
    const denominator2 = Math.sqrt(sourceVariance2 * templateVariance);
    const denominator3 = Math.sqrt(sourceVariance3 * templateVariance);
    out[0] = sourceVariance0 > n * 1e-6 && denominator0 > 1e-8 ? clamp(numerator0 / denominator0, -1, 1) : -1;
    out[1] = sourceVariance1 > n * 1e-6 && denominator1 > 1e-8 ? clamp(numerator1 / denominator1, -1, 1) : -1;
    out[2] = sourceVariance2 > n * 1e-6 && denominator2 > 1e-8 ? clamp(numerator2 / denominator2, -1, 1) : -1;
    out[3] = sourceVariance3 > n * 1e-6 && denominator3 > 1e-8 ? clamp(numerator3 / denominator3, -1, 1) : -1;
  }

  function insertTopScore(list, score, x, y, limit = TOP_COARSE, spacing = 0) {
    if(spacing){const near=list.findIndex(c=>Math.abs(c.x-x)<spacing&&Math.abs(c.y-y)<spacing);if(near>=0){if(list[near].score>=score)return;list.splice(near,1);}}
    // 대부분의 coarse 후보는 top-14에 들지 않는다. 탈락 확인 전 객체를 만들지 않아 GC를 줄인다.
    if (list.length >= limit && score <= list[list.length - 1].score) return;
    let index = 0;
    while (index < list.length && list[index].score >= score) index += 1;
    list.splice(index, 0, { score, x, y });
    if (list.length > limit) list.pop();
  }

  const RISING_SEED_SIDECAR_ENABLED = (() => {
    if (!((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true || (typeof document === 'undefined' && globalThis.location?.pathname === '/assets/contour-worker-r39.js' && new URL(globalThis.location.href).searchParams.get('mAlertR39Release') === 'M39-MXRSF2-20261019-RELEASE1')) || (['127.0.0.1','localhost','[::1]'].includes(globalThis.location?.hostname) || ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (typeof document === 'undefined' && globalThis.location?.pathname === '/assets/contour-worker-r39.js' && new URL(globalThis.location.href).searchParams.get('mAlertR39Release') === 'M39-MXRSF2-20261019-RELEASE1'))))) return false;
    if (typeof document !== 'undefined') return globalThis.__MALERT_RESEARCH_CONFIG?.retainRisingSeedSidecar === true;
    try { return new URL(globalThis.location.href).searchParams.get('mAlertRisingSeedSidecar') === '1'; } catch { return false; }
  })();

  const M39_SEED_COVERAGE_ENABLED=(['127.0.0.1','localhost','[::1]'].includes(globalThis.location?.hostname) || ((globalThis.MAlertR39Release?.id === 'M39-MXRSF2-20261019-RELEASE1' && globalThis.MAlertR39Release?.active === true) || (typeof document === 'undefined' && globalThis.location?.pathname === '/assets/contour-worker-r39.js' && new URL(globalThis.location.href).searchParams.get('mAlertR39Release') === 'M39-MXRSF2-20261019-RELEASE1')))&&(typeof document==='undefined'?new URL(globalThis.location.href).searchParams.get('m39SeedCoverage')==='1':globalThis.__MALERT_M39_SEED_COVERAGE_EXPERIMENT===true);
  function* scanTemplateIterator(source, template, maxCandidates = 1, options = {}) {
    const maxX = source.width - template.width;
    const maxY = source.height - template.height;
    if (maxX < 0 || maxY < 0) return { score: -1, x: 0, y: 0 };
    const coarse = [];
    const multiple = maxCandidates > 1;
    const retainSidecar = RISING_SEED_SIDECAR_ENABLED && options?.retainRisingSeedSidecar === true && multiple && String(template.id || "").startsWith("large-click-rising-");
    const seedBests = retainSidecar ? [] : null;
    const m39Cover=retainSidecar&&M39_SEED_COVERAGE_ENABLED,m39FieldWidth=Math.floor(maxX/COARSE_STRIDE)+1;
    const m39Field=m39Cover?new Float64Array(m39FieldWidth*(Math.floor(maxY/COARSE_STRIDE)+1)):null;
    const m39Remember=(score,x,y)=>{if(m39Field)m39Field[y/COARSE_STRIDE*m39FieldWidth+x/COARSE_STRIDE]=score;};
    const batchScores = new Float64Array(COARSE_BATCH_SIZE);
    const batchStep = COARSE_STRIDE * COARSE_BATCH_SIZE;
    for (let y = 0; y <= maxY; y += COARSE_STRIDE) {
      yield;
      let x = 0;
      for (; x + COARSE_STRIDE * (COARSE_BATCH_SIZE - 1) <= maxX; x += batchStep) {
        const x1 = x + COARSE_STRIDE;
        const x2 = x + COARSE_STRIDE * 2;
        const x3 = x + COARSE_STRIDE * 3;
        scoreAtCoarse4(source, template, x, x1, x2, x3, y, batchScores);
        if(m39Cover){m39Remember(batchScores[0],x,y);m39Remember(batchScores[1],x1,y);m39Remember(batchScores[2],x2,y);m39Remember(batchScores[3],x3,y);}
        if (!multiple && batchScores[0] === 1) return { score: 1, x, y };
        if (!multiple && batchScores[1] === 1) return { score: 1, x: x1, y };
        if (!multiple && batchScores[2] === 1) return { score: 1, x: x2, y };
        if (!multiple && batchScores[3] === 1) return { score: 1, x: x3, y };
        insertTopScore(coarse, batchScores[0], x, y, multiple?32:TOP_COARSE, multiple?Math.max(3,Math.min(template.width,template.height)*.3):0);
        insertTopScore(coarse, batchScores[1], x1, y, multiple?32:TOP_COARSE, multiple?Math.max(3,Math.min(template.width,template.height)*.3):0);
        insertTopScore(coarse, batchScores[2], x2, y, multiple?32:TOP_COARSE, multiple?Math.max(3,Math.min(template.width,template.height)*.3):0);
        insertTopScore(coarse, batchScores[3], x3, y, multiple?32:TOP_COARSE, multiple?Math.max(3,Math.min(template.width,template.height)*.3):0);
      }
      for (; x <= maxX; x += COARSE_STRIDE) {
        const score = scoreAt(source, template, x, y);
        if(m39Cover)m39Remember(score,x,y);
        if (!multiple && score === 1) return { score: 1, x, y };
        insertTopScore(coarse, score, x, y, multiple?32:TOP_COARSE, multiple?Math.max(3,Math.min(template.width,template.height)*.3):0);
      }
    }
    let best = coarse[0] || { score: -1, x: 0, y: 0 };
    const checked = new Set();
    const refined=[];
    for (const candidate of coarse) {
      let seedBest = null;
      yield;
      for (let dy = -REFINE_RADIUS; dy <= REFINE_RADIUS; dy += 1) {
        const y = clamp(candidate.y + dy, 0, maxY);
        for (let dx = -REFINE_RADIUS; dx <= REFINE_RADIUS; dx += 1) {
          const x = clamp(candidate.x + dx, 0, maxX);
          const key = y * (maxX + 1) + x;
          if (checked.has(key)) continue;
          checked.add(key);
          const score = scoreAt(source, template, x, y);
          if (retainSidecar && Number.isFinite(score) && (!seedBest || score > seedBest.score)) seedBest = { score, x, y };
          if (score > best.score) best = { score, x, y };
          if(multiple)insertTopScore(refined,score,x,y,maxCandidates,Math.max(3,Math.min(template.width,template.height)*.35));
        }
      }
      if (retainSidecar && seedBest) seedBests.push({ ...seedBest, seed: { rank: coarse.indexOf(candidate) + 1, x: candidate.x, y: candidate.y, score: candidate.score } });
    }
    const m39OriginalSeeds=seedBests?.length||0;
    if(m39Cover){
      // Reuse already computed coarse scores. One uncovered seed per original
      // suppression cell, at most32, and one original-size refinement square.
      // Never insert these into the original returned top2.
      const shadows=[],spacing=Math.max(3,Math.min(template.width,template.height)*.3),seen=new Set(checked);
      for(let rank=0;rank<coarse.length;rank++){
        yield;const owner=coarse[rank];let shadow=null;
        const left=Math.max(0,Math.ceil((owner.x-spacing)/COARSE_STRIDE)*COARSE_STRIDE),top=Math.max(0,Math.ceil((owner.y-spacing)/COARSE_STRIDE)*COARSE_STRIDE);
        for(let y=top;y<=maxY&&y<owner.y+spacing;y+=COARSE_STRIDE)for(let x=left;x<=maxX&&x<owner.x+spacing;x+=COARSE_STRIDE){
          if(Math.abs(x-owner.x)>=spacing||Math.abs(y-owner.y)>=spacing||checked.has(y*(maxX+1)+x))continue;
          const score=m39Field[y/COARSE_STRIDE*m39FieldWidth+x/COARSE_STRIDE];
          if(Number.isFinite(score)&&(!shadow||score>shadow.score))shadow={x,y,score,ownerRank:rank+1};
        }
        if(shadow)shadows.push(shadow);
      }
      for(const shadow of shadows){
        yield;let bestShadow=null;
        for(let dy=-REFINE_RADIUS;dy<=REFINE_RADIUS;dy++)for(let dx=-REFINE_RADIUS;dx<=REFINE_RADIUS;dx++){
          const x=clamp(shadow.x+dx,0,maxX),y=clamp(shadow.y+dy,0,maxY),key=y*(maxX+1)+x;
          if(seen.has(key))continue;seen.add(key);const score=scoreAt(source,template,x,y);
          if(Number.isFinite(score)&&(!bestShadow||score>bestShadow.score))bestShadow={score,x,y};
        }
        if(bestShadow)seedBests.push({...bestShadow,seed:{rank:shadow.ownerRank,x:shadow.x,y:shadow.y,score:shadow.score,coverageShadow:true,source:'EXISTING_COARSE_SCORE_OUTSIDE_REFINED_FOOTPRINT',maximumExtraSeeds:32}});
      }
    }
    if (retainSidecar) {
      // An earlier seed owns checked points. Skipped points are not reassigned.
      // Stable seed order resolves ties; original refined geometry is excluded.
      let sidecar = null;
      for (const seedBest of seedBests.slice(0,m39OriginalSeeds)) {
        if (refined.some(match => match.x === seedBest.x && match.y === seedBest.y)) continue;
        if (!sidecar || seedBest.score > sidecar.score) sidecar = seedBest;
      }
      return { matches: refined, sidecar: sidecar ? { ...sidecar, matched: false, retrievalOnly: true } : null, ...(m39Cover?{coverageSidecars:seedBests.slice(m39OriginalSeeds).map(v=>({...v,matched:false,retrievalOnly:true}))}:{}) };
    }
    return multiple ? refined : best;
  }


  function scanTemplate(source,template,maxCandidates=1,options={}){
    const scan=scanTemplateIterator(source,template,maxCandidates,options);let next;
    do{next=scan.next();}while(!next.done);return next.value;
  }
  globalThis.MAlertContourCore={makeIntegralPair,rectIntegral,prepareSource,scanTemplateIterator,scanTemplate,researchSimdStatus};
})();
