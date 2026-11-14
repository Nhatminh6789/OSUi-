/* Bộ giải mã Ogg Vorbis thuần JS (dự phòng cho Safari/iOS vốn không đọc được .ogg).
   Dùng:  const r = await VorbisDec.decode(arrayBuffer, {limit:giây, onprogress:fn});
          r = {sampleRate, channels:[Float32Array,...], length}                          */
(function (root) {
  'use strict';
  const ilog = x => { let n = 0; while (x > 0) { n++; x >>>= 1; } return n; };
  const f32unpack = x => {
    let m = x & 0x1fffff; const s = x & 0x80000000, e = (x & 0x7fe00000) >>> 21;
    if (s) m = -m;
    return m * Math.pow(2, e - 788);
  };
  const lookup1 = (entries, dim) => {
    let r = Math.floor(Math.pow(entries, 1 / dim));
    while (Math.pow(r + 1, dim) <= entries) r++;
    while (r > 1 && Math.pow(r, dim) > entries) r--;
    return r;
  };
  // floor1 inverse dB table (geometric, 256 entries)
  const DB = new Float32Array(256);
  { const r = Math.pow(1 / 1.0649863e-07, 1 / 255); for (let i = 0; i < 256; i++) DB[i] = Math.pow(r, i - 255); }

  class Bits {
    constructor(u8) { this.d = u8; this.p = 0; this.b = 0; this.n = 0; this.eop = false; }
    read(n) {
      if (n === 0) return 0;
      while (this.n < n) {
        if (this.p >= this.d.length) { this.eop = true; this.b += 0; this.n += 8; continue; }
        this.b += this.d[this.p++] * Math.pow(2, this.n); this.n += 8;
      }
      const v = this.b % Math.pow(2, n);
      this.b = Math.floor(this.b / Math.pow(2, n)); this.n -= n;
      return v;
    }
    bit() {
      if (this.n === 0) {
        if (this.p >= this.d.length) { this.eop = true; return 0; }
        this.b = this.d[this.p++]; this.n = 8;
      }
      const v = this.b & 1; this.b >>>= 1; this.n--; return v;
    }
  }
  // fast reader for audio packets (<=24 bits per op, 32-bit ints)
  class FB {
    constructor(u8) { this.d = u8; this.p = 0; this.b = 0; this.n = 0; }
    fill() { while (this.n <= 24) { if (this.p < this.d.length) this.b |= this.d[this.p] << this.n; this.p++; this.n += 8; } }
    read(k) { if (k === 0) return 0; if (this.n < k) this.fill(); const v = this.b & ((1 << k) - 1); this.b >>>= k; this.n -= k; return v; }
    bit() { if (this.n < 1) this.fill(); const v = this.b & 1; this.b >>>= 1; this.n--; return v; }
    over() { return this.p * 8 - this.n > this.d.length * 8; }
  }

  // ---- codebook ----
  function readCodebook(br) {
    if (br.read(24) !== 0x564342) throw Error('codebook sync');
    const dim = br.read(16), entries = br.read(24), lens = new Uint8Array(entries);
    let used = 0;
    if (!br.bit()) {
      const sparse = br.bit();
      for (let i = 0; i < entries; i++) {
        if (sparse) { if (br.bit()) { lens[i] = br.read(5) + 1; used++; } else lens[i] = 0; }
        else { lens[i] = br.read(5) + 1; used++; }
      }
    } else {
      let cur = 0, len = br.read(5) + 1;
      while (cur < entries) {
        const num = br.read(ilog(entries - cur));
        for (let i = 0; i < num && cur + i < entries; i++) lens[cur + i] = len;
        cur += num; len++; used = cur;
        if (len > 33) throw Error('codebook len');
      }
      used = entries;
    }
    const lt = br.read(4);
    let vecs = null;
    if (lt === 1 || lt === 2) {
      const mn = f32unpack(br.read(32)), dl = f32unpack(br.read(32)), vb = br.read(4) + 1, seq = br.bit();
      const nv = lt === 1 ? lookup1(entries, dim) : entries * dim, mul = new Float64Array(nv);
      for (let i = 0; i < nv; i++) mul[i] = br.read(vb);
      vecs = new Float32Array(entries * dim);
      for (let e = 0; e < entries; e++) {
        let last = 0, div = 1;
        for (let j = 0; j < dim; j++) {
          let off;
          if (lt === 1) { off = Math.floor(e / div) % nv; div *= nv; } else off = e * dim + j;
          const v = mul[off] * dl + mn + last; if (seq) last = v; vecs[e * dim + j] = v;
        }
      }
    } else if (lt !== 0) throw Error('lookup type');
    // huffman codes (canonical)
    const FBITS = 10, fast = new Int32Array(1 << FBITS).fill(-1);
    const tree = []; // slow nodes: [child0, child1] ; leaf encoded as -(sym+2)
    tree.push([-1, -1]);
    const avail = new Array(33).fill(0);
    let first = -1;
    for (let i = 0; i < entries; i++) if (lens[i]) { first = i; break; }
    const ins = (code, len, sym) => { // code MSB-first in `len` bits
      if (len <= FBITS) {
        let rev = 0; for (let k = 0; k < len; k++) if (code & (1 << (len - 1 - k))) rev |= 1 << k;
        for (let k = rev; k < (1 << FBITS); k += (1 << len)) fast[k] = (sym << 5) | len;
      } else {
        let nd = 0;
        for (let k = len - 1; k >= 0; k--) {
          const b = (code >>> k) & 1;
          if (k === 0) { tree[nd][b] = -(sym + 2); break; }
          let nx = tree[nd][b];
          if (nx < 0 || nx === undefined) { tree.push([-1, -1]); nx = tree.length - 1; tree[nd][b] = nx; }
          nd = nx;
        }
      }
    };
    if (first >= 0) {
      ins(0, lens[first], first);
      for (let i = 1; i <= lens[first]; i++) avail[i] = Math.pow(2, 32 - i);
      for (let m = first + 1; m < entries; m++) {
        const L = lens[m]; if (!L) continue;
        let z = L; while (z > 0 && !avail[z]) z--;
        if (z === 0) throw Error('overspecified tree');
        const res = avail[z]; avail[z] = 0;
        ins(Math.floor(res / Math.pow(2, 32 - L)), L, m);
        for (let y = L; y > z; y--) avail[y] = res + Math.pow(2, 32 - y);
      }
    }
    return { dim, entries, vecs, fast, FBITS, tree, lens };
  }
  function decSym(cb, br) {
    if (br.n < 24) br.fill();
    const e = cb.fast[br.b & ((1 << cb.FBITS) - 1)];
    if (e >= 0) { const l = e & 31; br.b >>>= l; br.n -= l; return e >> 5; }
    // slow path
    let nd = 0, cnt = 0;
    for (;;) {
      const b = br.bit(); const nx = cb.tree[nd][b]; cnt++;
      if (nx === -1 || nx === undefined) return -1;
      if (nx <= -2) return -nx - 2;
      nd = nx; if (cnt > 40) return -1;
    }
  }

  // ---- FFT / IMDCT ----
  const fftCache = {};
  function fftPlan(n) {
    if (fftCache[n]) return fftCache[n];
    const rev = new Uint32Array(n), bits = Math.round(Math.log2(n));
    for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) if (i & (1 << b)) r |= 1 << (bits - 1 - b); rev[i] = r; }
    const cs = new Float64Array(n / 2), sn = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
    return fftCache[n] = { rev, cs, sn, n };
  }
  function fft(re, im, pl) {
    const { rev, cs, sn, n } = pl;
    for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let sz = 2; sz <= n; sz <<= 1) {
      const h = sz >> 1, st = n / sz;
      for (let i = 0; i < n; i += sz) {
        for (let j = 0, k = 0; j < h; j++, k += st) {
          const a = i + j, b = a + h, wr = cs[k], wi = sn[k];
          const xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        }
      }
    }
  }
  const imdctCache = {};
  function imdctPlan(N) {
    if (imdctCache[N]) return imdctCache[N];
    const M = N >> 1, H = M >> 1, tw = new Float64Array(2 * H);
    for (let j = 0; j < H; j++) { const a = -Math.PI * (4 * j + 1) / (4 * M); tw[2 * j] = Math.cos(a); tw[2 * j + 1] = Math.sin(a); }
    return imdctCache[N] = { M, H, tw, pl: fftPlan(H), re: new Float64Array(H), im: new Float64Array(H), u: new Float64Array(M) };
  }
  // X: Float32Array(N/2) -> out Float32Array(N)   (x[n] = sum X[k] cos(2pi/N (n+1/2+N/4)(k+1/2)))
  function imdct(X, N, out) {
    const P = imdctPlan(N), { M, H, tw, pl, re, im, u } = P;
    for (let j = 0; j < H; j++) {
      const a = X[2 * j], b = X[M - 1 - 2 * j], c = tw[2 * j], s = tw[2 * j + 1];
      re[j] = a * c - b * s; im[j] = a * s + b * c;
    }
    fft(re, im, pl);
    for (let k = 0; k < H; k++) {
      const c = tw[2 * k], s = tw[2 * k + 1], yr = re[k] * c - im[k] * s, yi = re[k] * s + im[k] * c;
      u[2 * k] = yr; u[M - 1 - 2 * k] = -yi;
    }
    const q = M >> 1;
    for (let n = 0; n < q; n++) out[n] = u[q + n];
    for (let n = q; n < 3 * q; n++) out[n] = -u[3 * q - 1 - n];
    for (let n = 3 * q; n < N; n++) out[n] = -u[n - 3 * q];
  }

  const winCache = {};
  function slope(n) { // rising half-window of length n
    if (winCache[n]) return winCache[n];
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) { const s = Math.sin((i + .5) / n * Math.PI / 2); w[i] = Math.sin(Math.PI / 2 * s * s); }
    return winCache[n] = w;
  }

  // ---- setup parsing ----
  function parseSetup(u8, ch, b0, b1) {
    const br = new Bits(u8); br.read(8); for (let i = 0; i < 6; i++) br.read(8); // 0x05 'vorbis'
    const S = { books: [], floors: [], residues: [], maps: [], modes: [], b0, b1, ch };
    const nb = br.read(8) + 1; for (let i = 0; i < nb; i++) S.books.push(readCodebook(br));
    const nt = br.read(6) + 1; for (let i = 0; i < nt; i++) br.read(16);
    const nf = br.read(6) + 1;
    for (let i = 0; i < nf; i++) {
      const t = br.read(16);
      if (t !== 1) { S.floors.push({ type: t }); if (t === 0) throw Error('floor0 chưa hỗ trợ'); throw Error('floor type'); }
      const f = { type: 1, cls: [], X: [] }, np = br.read(5), pcl = [];
      let mx = -1; for (let j = 0; j < np; j++) { pcl.push(br.read(4)); if (pcl[j] > mx) mx = pcl[j]; }
      f.pcl = pcl; f.classes = [];
      for (let j = 0; j <= mx; j++) {
        const c = { dim: br.read(3) + 1, sub: br.read(2), master: 0, books: [] };
        if (c.sub) c.master = br.read(8);
        for (let k = 0; k < (1 << c.sub); k++) c.books.push(br.read(8) - 1);
        f.classes.push(c);
      }
      f.mult = br.read(2) + 1; const rb = br.read(4);
      f.X = [0, 1 << rb];
      for (let j = 0; j < np; j++) { const c = f.classes[pcl[j]]; for (let k = 0; k < c.dim; k++) f.X.push(br.read(rb)); }
      const n = f.X.length; f.n = n;
      f.order = Array.from({ length: n }, (_, i) => i).sort((a, b) => f.X[a] - f.X[b] || a - b);
      f.lo = new Int32Array(n); f.hi = new Int32Array(n);
      for (let j = 2; j < n; j++) {
        let lo = 0, hi = 1;
        for (let k = 0; k < j; k++) { if (f.X[k] < f.X[j] && f.X[k] > f.X[lo]) lo = k; if (f.X[k] > f.X[j] && f.X[k] < f.X[hi]) hi = k; }
        f.lo[j] = lo; f.hi[j] = hi;
      }
      f.range = [256, 128, 86, 64][f.mult - 1];
      S.floors.push(f);
    }
    const nr = br.read(6) + 1;
    for (let i = 0; i < nr; i++) {
      const t = br.read(16); if (t > 2) throw Error('residue type');
      const r = { type: t, begin: br.read(24), end: br.read(24), psize: br.read(24) + 1, ncls: br.read(6) + 1, cbook: br.read(8), books: [] };
      const casc = [];
      for (let j = 0; j < r.ncls; j++) { const lo = br.read(3); const hi = br.bit() ? br.read(5) : 0; casc.push(hi * 8 + lo); }
      for (let j = 0; j < r.ncls; j++) { const bk = []; for (let k = 0; k < 8; k++) bk.push(casc[j] & (1 << k) ? br.read(8) : -1); r.books.push(bk); }
      S.residues.push(r);
    }
    const nm = br.read(6) + 1;
    for (let i = 0; i < nm; i++) {
      if (br.read(16) !== 0) throw Error('mapping type');
      const m = { subs: br.bit() ? br.read(4) + 1 : 1, steps: [], mux: new Array(ch).fill(0), sf: [], sr: [] };
      if (br.bit()) { const n = br.read(8) + 1; for (let j = 0; j < n; j++) m.steps.push([br.read(ilog(ch - 1)), br.read(ilog(ch - 1))]); }
      if (br.read(2) !== 0) throw Error('mapping reserved');
      if (m.subs > 1) for (let j = 0; j < ch; j++) m.mux[j] = br.read(4);
      for (let j = 0; j < m.subs; j++) { br.read(8); m.sf.push(br.read(8)); m.sr.push(br.read(8)); }
      S.maps.push(m);
    }
    const nmo = br.read(6) + 1;
    for (let i = 0; i < nmo; i++) { const bf = br.read(1); br.read(16); br.read(16); S.modes.push({ flag: bf, map: br.read(8) }); }
    S.modeBits = ilog(S.modes.length - 1);
    return S;
  }

  // ---- floor1 ----
  function floorDecode(f, br, books) {
    if (!br.bit()) return null;
    const Y = new Int32Array(f.n), rb = ilog(f.range - 1);
    Y[0] = br.read(rb); Y[1] = br.read(rb);
    let off = 2;
    for (let i = 0; i < f.pcl.length; i++) {
      const c = f.classes[f.pcl[i]], cb = c.sub, cs = (1 << cb) - 1; let cv = 0;
      if (cb) cv = decSym(books[c.master], br);
      for (let j = 0; j < c.dim; j++) {
        const bk = c.books[cv & cs]; cv >>= cb;
        Y[off + j] = bk >= 0 ? Math.max(0, decSym(books[bk], br)) : 0;
      }
      off += c.dim;
    }
    return Y;
  }
  function renderLine(x0, y0, x1, y1, out) {
    const dy = y1 - y0, adx = x1 - x0, ady = Math.abs(dy), base = (dy / adx) | 0, sy = dy < 0 ? base - 1 : base + 1;
    let x = x0, y = y0, err = 0; const a = ady - Math.abs(base) * adx;
    if (x < out.length) out[x] = y;
    for (x = x0 + 1; x < x1; x++) { err += a; if (err >= adx) { err -= adx; y += sy; } else y += base; if (x < out.length) out[x] = y; }
  }
  function floorCurve(f, Y, half, out) {
    const n = f.n, fy = new Int32Array(n), st = new Uint8Array(n), rg = f.range, X = f.X;
    fy[0] = Y[0]; fy[1] = Y[1]; st[0] = st[1] = 1;
    for (let i = 2; i < n; i++) {
      const lo = f.lo[i], hi = f.hi[i], dx = X[hi] - X[lo], dy = fy[hi] - fy[lo], ad = Math.abs(dy) * (X[i] - X[lo]);
      const off = (ad / dx) | 0, pred = dy < 0 ? fy[lo] - off : fy[lo] + off;
      const val = Y[i], hr = rg - pred, lr = pred, room = (hr < lr ? hr : lr) * 2;
      if (val) {
        st[lo] = 1; st[hi] = 1; st[i] = 1;
        if (val >= room) fy[i] = hr > lr ? val - lr + pred : pred - val + hr - 1;
        else fy[i] = (val & 1) ? pred - ((val + 1) >> 1) : pred + (val >> 1);
      } else { st[i] = 0; fy[i] = pred; }
    }
    const tmp = new Int32Array(half + 1), mult = f.mult;
    let hx = 0, hy = 0, lx = 0, ly = fy[f.order[0]] * mult;
    for (let k = 1; k < n; k++) {
      const j = f.order[k]; if (!st[j]) continue;
      hy = fy[j] * mult; hx = X[j];
      if (hx > lx) renderLine(lx, ly, hx, hy, tmp);
      lx = hx; ly = hy;
    }
    if (hx < half) renderLine(hx, hy, half, hy, tmp);
    for (let i = 0; i < half; i++) { let v = tmp[i]; v = v < 0 ? 0 : v > 255 ? 255 : v; out[i] = DB[v]; }
  }

  // ---- residue ----
  function residueDecode(R, br, books, vecs, dnd, half) {
    const nv = vecs.length, type = R.type, psz = R.psize, cb = books[R.cbook], cw = cb.dim;
    const total = type === 2 ? half * nv : half;
    const begin = Math.min(R.begin, total), end = Math.min(R.end, total), n = end - begin;
    if (n <= 0) return;
    const np = Math.floor(n / psz);
    let vlist = vecs, flags = dnd;
    if (type === 2) { // single interleaved vector
      if (dnd.every(x => x)) return;
      vlist = [new Float32Array(total)]; flags = [false];
    }
    const nvec = vlist.length, cls = []; for (let j = 0; j < nvec; j++) cls.push(new Int32Array(np + cw));
    for (let pass = 0; pass < 8; pass++) {
      let i = 0;
      while (i < np) {
        if (pass === 0) {
          for (let j = 0; j < nvec; j++) {
            if (flags[j]) continue;
            let t = decSym(cb, br); if (t < 0) return;
            for (let k = cw - 1; k >= 0; k--) { cls[j][i + k] = t % R.ncls; t = (t / R.ncls) | 0; }
          }
        }
        for (let k = 0; k < cw && i < np; k++, i++) {
          for (let j = 0; j < nvec; j++) {
            if (flags[j]) continue;
            const bk = R.books[cls[j][i]][pass]; if (bk < 0) continue;
            const book = books[bk]; if (!book.vecs) continue;
            const off = begin + i * psz, dim = book.dim, v = vlist[j], bv = book.vecs;
            if (type === 0) {
              const step = (psz / dim) | 0;
              for (let q = 0; q < step; q++) {
                const e = decSym(book, br); if (e < 0) return;
                for (let d = 0; d < dim; d++) v[off + q + d * step] += bv[e * dim + d];
              }
            } else {
              let o = off;
              for (let q = 0; q < psz; q += dim) {
                const e = decSym(book, br); if (e < 0) return;
                for (let d = 0; d < dim; d++) v[o++] += bv[e * dim + d];
              }
            }
          }
          if (br.over()) return;
        }
      }
    }
    if (type === 2) { const v = vlist[0]; for (let j = 0; j < nv; j++) for (let i = 0; i < half; i++) vecs[j][i] = v[i * nv + j]; }
  }

  // ---- ogg ----
  function oggPackets(u8) {
    const pk = []; let p = 0, cur = [], serial = null, lastGran = -1;
    const join = parts => { if (parts.length === 1) return parts[0]; let t = 0; parts.forEach(x => t += x.length); const d = new Uint8Array(t); let z = 0; parts.forEach(x => { d.set(x, z); z += x.length; }); return d; };
    while (p + 27 <= u8.length) {
      if (u8[p] !== 0x4f || u8[p + 1] !== 0x67 || u8[p + 2] !== 0x67 || u8[p + 3] !== 0x53) { p++; continue; }
      const ns = u8[p + 26]; if (p + 27 + ns > u8.length) break;
      const ser = (u8[p + 14] | u8[p + 15] << 8 | u8[p + 16] << 16 | u8[p + 17] << 24) >>> 0;
      let gran = 0, neg = true; for (let i = 7; i >= 0; i--) { gran = gran * 256 + u8[p + 6 + i]; if (u8[p + 6 + i] !== 255) neg = false; }
      let o = p + 27 + ns, tot = 0;
      for (let i = 0; i < ns; i++) tot += u8[p + 27 + i];
      if (serial === null) serial = ser;
      if (ser === serial) {
        let q = o;
        for (let i = 0; i < ns; i++) {
          const l = u8[p + 27 + i];
          cur.push(u8.subarray(q, q + l)); q += l;
          if (l < 255) { pk.push(join(cur)); cur = []; }
        }
        if (!neg && gran > 0) lastGran = gran;
      }
      p = o + tot;
    }
    return { pk, lastGran };
  }

  async function decode(ab, opt) {
    opt = opt || {};
    const u8 = new Uint8Array(ab), { pk, lastGran } = oggPackets(u8);
    if (pk.length < 4) throw Error('không phải Ogg Vorbis');
    const id = pk[0];
    if (id[0] !== 1 || String.fromCharCode(id[1], id[2], id[3], id[4], id[5], id[6]) !== 'vorbis') throw Error('không phải Vorbis (có thể là Opus)');
    const dv = new DataView(id.buffer, id.byteOffset, id.byteLength);
    const ch = id[11], sr = dv.getUint32(12, true), bs = id[28], b0 = 1 << (bs & 15), b1 = 1 << (bs >> 4);
    if (ch < 1 || ch > 8) throw Error('số kênh không hợp lệ');
    const S = parseSetup(pk[2], ch, b0, b1);
    const cap0 = lastGran > 0 ? lastGran : Math.ceil(pk.length * b1 / 4);
    let cap = Math.max(cap0 + b1 * 2, 1024); if (opt.limit) cap = Math.min(cap, Math.ceil(opt.limit * sr) + b1 * 2);
    let out = []; for (let c = 0; c < ch; c++) out.push(new Float32Array(cap));
    const ensure = n => { if (n <= out[0].length) return; const nc = Math.max(n, out[0].length * 1.5 | 0); out = out.map(a => { const b = new Float32Array(nc); b.set(a); return b; }); };
    const win = {}, tmpOut = new Float32Array(b1);
    let prevN = 0, center = 0, valid = 0, t0 = performance.now(), lastY = t0;
    const res = []; for (let c = 0; c < ch; c++) res.push(new Float32Array(b1 / 2));
    const flr = []; for (let c = 0; c < ch; c++) flr.push(new Float32Array(b1 / 2));
    const maxS = opt.limit ? Math.ceil(opt.limit * sr) : Infinity;
    for (let pi = 3; pi < pk.length; pi++) {
      const br = new FB(pk[pi]);
      if (br.bit() !== 0) continue;
      const mode = S.modes[br.read(S.modeBits)]; if (!mode) continue;
      const long = mode.flag, N = long ? b1 : b0, half = N >> 1;
      let pw = 1, nw = 1; if (long) { pw = br.bit(); nw = br.bit(); }
      const m = S.maps[mode.map], nz = new Array(ch), Ys = new Array(ch);
      for (let c = 0; c < ch; c++) {
        const f = S.floors[m.sf[m.mux[c]]];
        const Y = floorDecode(f, br, S.books);
        if (Y && !br.over()) { Ys[c] = Y; nz[c] = true; floorCurve(f, Y, half, flr[c]); } else { nz[c] = false; }
      }
      const noRes = nz.map(x => !x);
      for (const [mg, an] of m.steps) if (nz[mg] || nz[an]) { nz[mg] = nz[an] = true; noRes[mg] = noRes[an] = false; }
      for (let c = 0; c < ch; c++) res[c].fill(0, 0, half);
      for (let s = 0; s < m.subs; s++) {
        const idx = [], vecs = [], dnd = [];
        for (let c = 0; c < ch; c++) if (m.mux[c] === s) { idx.push(c); vecs.push(res[c].subarray(0, half)); dnd.push(noRes[c]); }
        if (vecs.length) residueDecode(S.residues[m.sr[s]], br, S.books, vecs, dnd, half);
      }
      for (let k = m.steps.length - 1; k >= 0; k--) {
        const [mg, an] = m.steps[k], M = res[mg], A = res[an];
        for (let i = 0; i < half; i++) {
          const a = M[i], b = A[i]; let nm, na;
          if (a > 0) { if (b > 0) { nm = a; na = a - b; } else { na = a; nm = a + b; } }
          else { if (b > 0) { nm = a; na = a + b; } else { na = a; nm = a - b; } }
          M[i] = nm; A[i] = na;
        }
      }
      // window
      const wk = N + '_' + pw + '_' + nw;
      let W = win[wk];
      if (!W) {
        W = new Float32Array(N);
        const ln = long && !pw ? b0 / 2 : half, ls = long && !pw ? N / 4 - b0 / 4 : 0;
        const rn = long && !nw ? b0 / 2 : half, rs = long && !nw ? N * 3 / 4 - b0 / 4 : half;
        const sl = slope(ln), sr2 = slope(rn);
        for (let i = 0; i < N; i++) {
          if (i < ls) W[i] = 0;
          else if (i < ls + ln) W[i] = sl[i - ls];
          else if (i < rs) W[i] = 1;
          else if (i < rs + rn) W[i] = sr2[rn - 1 - (i - rs)];
          else W[i] = 0;
        }
        win[wk] = W;
      }
      // position
      if (prevN === 0) center = 0; else center += prevN / 4 + N / 4;
      const start = center - half, need = start + N + 8; ensure(Math.min(need, maxS + b1 * 2 + 8));
      for (let c = 0; c < ch; c++) {
        const o = out[c];
        if (!nz[c]) { /* silent block */ continue; }
        const X = res[c], F = flr[c];
        for (let i = 0; i < half; i++) X[i] *= F[i];
        imdct(X.subarray(0, half), N, tmpOut);
        for (let i = 0; i < N; i++) { const pos = start + i; if (pos >= 0 && pos < o.length) o[pos] += tmpOut[i] * W[i]; }
      }
      prevN = N; valid = center;
      if (valid >= maxS) break;
      if ((pi & 31) === 0) {
        const now = performance.now();
        if (now - lastY > 30) {
          lastY = now;
          if (opt.onprogress) opt.onprogress(pi / pk.length);
          await new Promise(r => setTimeout(r, 0));
        }
      }
    }
    let len = lastGran > 0 ? Math.min(lastGran, valid) : valid; len = Math.min(len, out[0].length);
    if (opt.limit) len = Math.min(len, maxS);
    return { sampleRate: sr, length: len, channels: out.map(a => a.subarray(0, len)) };
  }

  root.VorbisDec = { decode, _imdct: imdct, _ilog: ilog };
})(typeof window !== 'undefined' ? window : globalThis);
