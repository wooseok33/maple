(() => {
  'use strict';
  const scriptBase = document.currentScript?.src || document.baseURI;
  const FW = 320, FH = 28;
  const work = new Map();
  let reference = null, loading = null;
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function sample(source, rect, w, h) {
    const key = w + 'x' + h;
    let c = work.get(key);
    if (!c) { c = canvas(w, h); work.set(key, c); }
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  }
  function feature(source, rect) {
    const d = sample(source, rect, FW, FH), f = new Float32Array(FW * FH);
    // The white fixed heading is distinct from the blue background. No answer
    // option pixels or changing countdown digits enter this feature vector.
    for (let i = 0; i < f.length; i++) f[i] = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
    return f;
  }
  function ncc(a, b, x1 = 0, x2 = FW) {
    let n = 0, sa = 0, sb = 0, aa = 0, bb = 0, ab = 0;
    for (let y = 1; y < FH - 1; y++) for (let x = x1; x < x2; x++) {
      const i = y * FW + x, u = a[i], v = b[i];
      n++; sa += u; sb += v; aa += u * u; bb += v * v; ab += u * v;
    }
    const va = aa - sa * sa / n, vb = bb - sb * sb / n;
    return va > n * 12 && vb > n * 12 ? (ab - sa * sb / n) / Math.sqrt(va * vb) : -1;
  }
  async function init() {
    if (reference) return reference;
    if (!loading) loading = (async () => {
      const img = new Image();
      img.src = new URL('../assets/local-templates/sentence-fixed-heading.png', scriptBase).href;
      await img.decode();
      reference = feature(img, { x: 0, y: 0, w: img.width, h: img.height });
      return reference;
    })().catch(error => { loading = null; throw error; });
    return loading;
  }
  function components(mask, w, h, kind, minPixels) {
    const seen = new Uint8Array(mask.length), queue = new Int32Array(mask.length), out = [];
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] !== kind || seen[i]) continue;
      let head = 0, tail = 1, x1 = i % w, x2 = x1, y1 = (i / w) | 0, y2 = y1;
      queue[0] = i; seen[i] = 1;
      while (head < tail) {
        const p = queue[head++], x = p % w, y = (p / w) | 0;
        x1 = Math.min(x1, x); x2 = Math.max(x2, x); y1 = Math.min(y1, y); y2 = Math.max(y2, y);
        const neighbors = [x > 0 ? p - 1 : -1, x + 1 < w ? p + 1 : -1, y > 0 ? p - w : -1, y + 1 < h ? p + w : -1];
        for (const j of neighbors) if (j >= 0 && !seen[j] && mask[j] === kind) { seen[j] = 1; queue[tail++] = j; }
      }
      if (tail < minPixels) continue;
      const rw = x2 - x1 + 1, rh = y2 - y1 + 1;
      out.push({ x: x1, y: y1, w: rw, h: rh, fill: tail / (rw * rh) });
    }
    return out;
  }
  function regions(source) {
    const w = Math.min(400, source.width), sx = w / source.width, h = Math.round(source.height * sx), sy = h / source.height;
    const d = sample(source, { x: 0, y: 0, w: source.width, h: source.height }, w, h), mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      if (b >= 85 && b > r * 1.6 && b > g * 1.22 && g > r * 1.15 && r <= 100 && g <= 145) mask[i] = 1;
      else if (Math.min(r, g, b) > 145 && Math.max(r, g, b) - Math.min(r, g, b) < 75) mask[i] = 2;
    }
    const blue = components(mask, w, h, 1, 600), light = components(mask, w, h, 2, 80), candidates = [];
    for (const p of blue) {
      const aspect = p.w / p.h;
      if (p.w < 80 || p.h < 95 || aspect < .72 || aspect > 1.13 || p.fill < .45) continue;
      const rows = light.filter(r => r.x >= p.x && r.y >= p.y && r.x + r.w <= p.x + p.w + 1 && r.y + r.h <= p.y + p.h + 1 && r.w / p.w >= .60 && r.w / p.w <= .96 && r.h / p.h >= .045 && r.h / p.h <= .105 && r.w / r.h >= 6 && r.fill >= .62).sort((a, b) => a.y - b.y);
      if (rows.length !== 5) continue;
      const mw = rows.reduce((a, r) => a + r.w, 0) / 5, mh = rows.reduce((a, r) => a + r.h, 0) / 5;
      const gaps = rows.slice(1).map((r, i) => r.y - rows[i].y), mg = gaps.reduce((a, n) => a + n, 0) / 4;
      if (rows.some(r => Math.abs(r.w - mw) / mw > .075 || Math.abs(r.h - mh) / mh > .15 || Math.abs(r.x - rows[0].x) / mw > .035)) continue;
      if (gaps.some(g => Math.abs(g - mg) / mg > .16) || mg / mh < 1.25 || mg / mh > 2.2) continue;
      if ((rows[0].y - p.y) / p.h < .24 || (rows[0].y - p.y) / p.h > .37 || (rows[4].y + rows[4].h - p.y) / p.h < .78 || (rows[4].y + rows[4].h - p.y) / p.h > .96) continue;
      const r = rows[0];
      // Geometry is measured from the five option backgrounds. Their wording
      // is deliberately ignored; only the fixed heading above them is read.
      const heading = { x: (r.x + r.w * .126) / sx, y: (r.y - mh * 1.71) / sy, w: mw * .752 / sx, h: mh * .66 / sy };
      candidates.push({ rect: { x: p.x / sx, y: p.y / sy, w: p.w / sx, h: p.h / sy }, heading, rows: rows.map(r => ({ x: r.x / sx, y: r.y / sy, w: r.w / sx, h: r.h / sy })), blueFill: p.fill });
    }
    return candidates.sort((a, b) => b.blueFill - a.blueFill).slice(0, 4);
  }
  function verify(source, item, target) {
    let best = { score: -1, scores: [-1, -1, -1] };
    const a = item.heading;
    for (const scale of [.97, 1, 1.03]) for (const dx of [-.008, 0, .008]) for (const dy of [-.20, -.16, -.12, -.08, -.04, 0, .04, .08, .12]) {
      const rect = { x: a.x + a.w * dx - a.w * (scale - 1) / 2, y: a.y + a.h * dy - a.h * (scale - 1) / 2, w: a.w * scale, h: a.h * scale };
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > source.width || rect.y + rect.h > source.height) continue;
      const f = feature(source, rect), scores = [ncc(target, f, 0, 107), ncc(target, f, 107, 214), ncc(target, f, 214, 320)], score = ncc(target, f);
      if (score > best.score) best = { score, scores, headingRect: rect };
    }
    if (best.score > .40) {
      const anchor = best.headingRect;
      for (const dx of [-.002, 0, .002]) for (const dy of [-.02, 0, .02]) {
        const rect = { ...anchor, x: anchor.x + anchor.w * dx, y: anchor.y + anchor.h * dy };
        if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > source.width || rect.y + rect.h > source.height) continue;
        const f = feature(source, rect), scores = [ncc(target, f, 0, 107), ncc(target, f, 107, 214), ncc(target, f, 214, 320)], score = ncc(target, f);
        if (score > best.score) best = { score, scores, headingRect: rect };
      }
    }
    return best;
  }
  async function analyze(source, native = source) {
    const candidates = regions(source);
    if (!candidates.length) return { matched: false, candidates };
    const target = await init(), sx = native.width / source.width, sy = native.height / source.height;
    for (const item of candidates) {
      const h = item.heading, v = verify(native, { ...item, heading: { x: h.x * sx, y: h.y * sy, w: h.w * sx, h: h.h * sy } }, target);
      Object.assign(item, v);
      item.matched = v.score >= .72 && v.scores.every(s => s >= .63);
      if (item.matched) return { matched: true, id: 'sentence-fixed-heading', label: '올바른 문장 선택형', score: v.score, threshold: .72, scores: v.scores, rect: item.rect, headingRect: { x: v.headingRect.x / sx, y: v.headingRect.y / sy, w: v.headingRect.w / sx, h: v.headingRect.h / sy }, candidates };
    }
    return { matched: false, candidates };
  }
  window.MAlertSentenceGuide = { init, regions, analyze };
})();
