/*
 * disturbance.js — base (handle / vehicle) orientation sources.
 *   - 10 real recordings from MATLAB Mobile (src/data/disturbances/*.mat, 100 Hz, Orientation X/Y/Z [deg])
 *   - synthetic profiles (walk, run, car, boat, sine, steps) and manual control.
 * All sources return base ZYX Euler angles [yaw, pitch, roll] in radians.
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var D2R = Math.PI / 180;

  // ---------------------------------------------------------------- recorded datasets
  var cache = {};
  function decodeDataset(id) {
    if (cache[id]) return cache[id];
    var raw = root.GIMBAL_DATA && root.GIMBAL_DATA[id];
    if (!raw) return null;
    var bin;
    if (typeof atob === 'function') {
      var s = atob(raw.b64); bin = new Uint8Array(s.length);
      for (var i = 0; i < s.length; i++) bin[i] = s.charCodeAt(i);
    } else bin = new Uint8Array(Buffer.from(raw.b64, 'base64'));
    var i16 = new Int16Array(bin.buffer, bin.byteOffset, bin.byteLength / 2);
    var n = raw.n, X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n);
    for (i = 0; i < n; i++) { X[i] = i16[3 * i] * raw.scale; Y[i] = i16[3 * i + 1] * raw.scale; Z[i] = i16[3 * i + 2] * raw.scale; }
    cache[id] = { id: id, fs: raw.fs, n: n, X: X, Y: Y, Z: Z, duration: n / raw.fs };
    return cache[id];
  }
  // load dataset script lazily (works from file:// as well)
  function loadDataset(id, base) {
    return new Promise(function (resolve, reject) {
      if (root.GIMBAL_DATA && root.GIMBAL_DATA[id]) return resolve(decodeDataset(id));
      var s = document.createElement('script');
      s.src = (base || 'data/') + 'disturbance_' + id + '.js';
      s.onload = function () { resolve(decodeDataset(id)); };
      s.onerror = function () { reject(new Error('Nie można wczytać zestawu ' + id)); };
      document.head.appendChild(s);
    });
  }

  function unwrapDeg(a) {
    var out = new Float64Array(a.length), off = 0;
    out[0] = a[0];
    for (var i = 1; i < a.length; i++) {
      var d = a[i] - a[i - 1];
      if (d > 180) off -= 360; else if (d < -180) off += 360;
      out[i] = a[i] + off;
    }
    return out;
  }

  /*
   * opts: { map: {yaw:'X', pitch:'Y', roll:'Z'}, sign: {yaw:1,...}, unwrap: true, zero: true, gain: 1, loop: false }
   */
  function DatasetSource(ds, opts) {
    this.ds = ds; this.opts = opts; this.kind = 'dataset';
    this.duration = ds.duration;
    var self = this, ch = { X: ds.X, Y: ds.Y, Z: ds.Z };
    this.series = GS.AXES.map(function (ax) {
      var src = ch[opts.map[ax]];
      var a = opts.unwrap ? unwrapDeg(src) : Float64Array.from(src);
      var sgn = opts.sign[ax] || 1, z0 = opts.zero ? a[0] : 0, gain = opts.gain == null ? 1 : opts.gain;
      var out = new Float64Array(a.length);
      for (var i = 0; i < a.length; i++) out[i] = (a[i] - z0) * sgn * gain * D2R;
      return out;
    });
    this.fs = ds.fs;
    this.name = 'Zestaw ' + ds.id;
    void self;
  }
  // Catmull-Rom interpolation (smooth first derivative for the inverse dynamics)
  DatasetSource.prototype.sample = function (t, out) {
    out = out || [0, 0, 0];
    var n = this.ds.n, x = t * this.fs;
    if (this.opts.loop) { x = x % (n - 1); if (x < 0) x += n - 1; }
    if (x <= 0) x = 0; if (x >= n - 1) x = n - 1 - 1e-9;
    var i = Math.floor(x), f = x - i;
    var i0 = Math.max(0, i - 1), i2 = Math.min(n - 1, i + 1), i3 = Math.min(n - 1, i + 2);
    var f2 = f * f, f3 = f2 * f;
    for (var k = 0; k < 3; k++) {
      var s = this.series[k], p0 = s[i0], p1 = s[i], p2 = s[i2], p3 = s[i3];
      out[k] = 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
    }
    return out;
  };

  // ---------------------------------------------------------------- synthetic profiles
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // band-limited pseudo-noise as a sum of sines (stateless, deterministic)
  function Noise(seed, fLo, fHi, count) {
    var rnd = mulberry32(seed), comps = [], norm = 0;
    for (var i = 0; i < count; i++) {
      var f = fLo * Math.pow(fHi / fLo, rnd()), a = 1 / Math.sqrt(f);
      comps.push([2 * Math.PI * f, rnd() * 2 * Math.PI, a]); norm += a * a / 2;
    }
    this.c = comps; this.k = 1 / Math.sqrt(norm);
  }
  Noise.prototype.at = function (t) {
    var s = 0, c = this.c;
    for (var i = 0; i < c.length; i++) s += c[i][2] * Math.sin(c[i][0] * t + c[i][1]);
    return s * this.k;   // unit RMS
  };

  var PROFILES = {
    none: { label: 'Brak zakłóceń', desc: 'Nieruchoma podstawa.' },
    walk: { label: 'Chód (syntetyczny)', desc: 'Kołysanie ~0.9 Hz, podskoki kroku ~1.8 Hz, drgania dłoni.' },
    run: { label: 'Bieg (syntetyczny)', desc: 'Silne uderzenia kroku ~2.7 Hz i szybkie zwroty.' },
    car: { label: 'Samochód (syntetyczny)', desc: 'Wibracje 4–12 Hz + powolne zakręty.' },
    boat: { label: 'Łódź (syntetyczny)', desc: 'Kołysanie fali 0.1–0.2 Hz o dużej amplitudzie.' },
    sine: { label: 'Sinusoida', desc: 'Harmoniczne zakłócenie o zadanej amplitudzie i częstotliwości.' },
    steps: { label: 'Skoki (test)', desc: 'Skokowe zmiany orientacji podstawy (yaw, pitch, roll kolejno).' },
    manual: { label: 'Sterowanie ręczne', desc: 'Orientacja podstawy z suwaków / myszy (na żywo).' }
  };

  function SyntheticSource(kind, p) {
    this.kind = kind; this.p = p || {}; this.duration = Infinity;
    this.name = PROFILES[kind] ? PROFILES[kind].label : kind;
    this.n = [new Noise(11, 0.2, 3, 14), new Noise(23, 0.2, 3, 14), new Noise(37, 0.2, 3, 14)];
    this.hf = [new Noise(41, 4, 12, 16), new Noise(53, 4, 12, 16), new Noise(67, 4, 12, 16)];
    this.slow = [new Noise(71, 0.02, 0.15, 6), new Noise(83, 0.02, 0.15, 6), new Noise(97, 0.02, 0.15, 6)];
    this.manual = [0, 0, 0]; this.manualF = [0, 0, 0];
  }
  SyntheticSource.prototype.sample = function (t, out) {
    out = out || [0, 0, 0];
    var p = this.p, a = p.amp == null ? 1 : p.amp, s = Math.sin, TW = 2 * Math.PI;
    var y = 0, pi = 0, r = 0;
    switch (this.kind) {
      case 'walk':
        y = 4 * s(TW * 0.45 * t) + 1.5 * this.n[0].at(t) + 12 * this.slow[0].at(t);
        pi = 3 * s(TW * 1.8 * t + 0.4) + 1.2 * s(TW * 3.6 * t) + 1.0 * this.n[1].at(t);
        r = 3.5 * s(TW * 0.9 * t + 1.1) + 0.8 * this.n[2].at(t);
        break;
      case 'run':
        y = 7 * s(TW * 0.6 * t) + 3 * this.n[0].at(t) + 20 * this.slow[0].at(t);
        pi = 6 * s(TW * 2.7 * t) + 3 * Math.pow(Math.abs(s(TW * 1.35 * t)), 8) * 4 + 2 * this.n[1].at(t);
        r = 6 * s(TW * 1.35 * t + 0.7) + 2 * this.n[2].at(t);
        break;
      case 'car':
        y = 35 * this.slow[0].at(t) + 0.4 * this.hf[0].at(t);
        pi = 1.2 * this.hf[1].at(t) + 2 * this.n[1].at(t) + 3 * this.slow[1].at(t);
        r = 1.0 * this.hf[2].at(t) + 1.5 * this.n[2].at(t) + 4 * this.slow[2].at(t);
        break;
      case 'boat':
        y = 8 * s(TW * 0.05 * t) + 3 * this.slow[0].at(t);
        pi = 7 * s(TW * 0.17 * t + 0.5) + 2 * this.slow[1].at(t);
        r = 14 * s(TW * 0.11 * t) + 3 * s(TW * 0.31 * t + 1) + 0.5 * this.n[2].at(t);
        break;
      case 'sine':
        y = (p.ay || 0) * s(TW * (p.fy || 0.5) * t);
        pi = (p.ap || 0) * s(TW * (p.fp || 0.5) * t + 0.7);
        r = (p.ar || 0) * s(TW * (p.fr || 0.5) * t + 1.4);
        a = 1;
        break;
      case 'steps':
        var st = p.step || 10, per = 6, ph = t % (per * 3), k = Math.floor(ph / per), on = (ph % per) < per / 2 ? 1 : 0;
        if (t > 0.5) { if (k === 0) y = st * on; else if (k === 1) pi = st * on; else r = st * on; }
        a = 1;
        break;
      case 'manual':
        // smooth towards target (first-order, tau = 0.08 s) — evaluated per call
        for (var i = 0; i < 3; i++) this.manualF[i] += (this.manual[i] - this.manualF[i]) * Math.min(1, (p.dtHint || 0.001) / 0.08);
        y = this.manualF[0]; pi = this.manualF[1]; r = this.manualF[2]; a = 1;
        break;
      default: break;
    }
    out[0] = y * a * D2R; out[1] = pi * a * D2R; out[2] = r * a * D2R;
    return out;
  };

  GS.Disturbance = {
    PROFILES: PROFILES,
    decodeDataset: decodeDataset,
    loadDataset: loadDataset,
    DatasetSource: DatasetSource,
    SyntheticSource: SyntheticSource,
    unwrapDeg: unwrapDeg
  };
})(typeof window !== 'undefined' ? window : globalThis);
