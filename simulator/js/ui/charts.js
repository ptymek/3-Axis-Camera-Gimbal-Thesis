/*
 * charts.js — lightweight canvas charts:
 *   StripChart  live time-series reading straight from a GS.Recorder (min/max decimation, hover readout)
 *   LineChart   static x/y series (step responses)
 *   BarChart    grouped bars (benchmark / thesis tables), optional log scale
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};

  var C = {
    bg: '#0e131b', grid: '#1a2230', grid2: '#141b26', axis: '#2a3547', text: '#8b98ab', text2: '#5b6778', title: '#d7e0ec',
    font: '10px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace'
  };
  GS.CHART_COLORS = C;

  function setup(canvas) {
    var dpr = Math.min(2, root.devicePixelRatio || 1);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return null;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function niceStep(span, n) {
    var raw = span / Math.max(1, n), mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }
  function fmt(v, step) {
    var a = Math.abs(step || v);
    if (v === 0) return '0';
    if (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3)) return v.toExponential(1);
    var d = a >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(a)) + (a < 1 ? 0 : 0));
    return v.toFixed(d);
  }
  function fmtVal(v) {
    var a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1000) return v.toFixed(0);
    if (a >= 100) return v.toFixed(1);
    if (a >= 1) return v.toFixed(2);
    if (a >= 0.01) return v.toFixed(3);
    return v.toExponential(2);
  }
  GS.fmtVal = fmtVal;

  function lowerBound(arr, n, x) {
    var lo = 0, hi = n;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid] < x) lo = mid + 1; else hi = mid; }
    return lo;
  }

  // ------------------------------------------------------------------ StripChart
  function StripChart(canvas, opts) {
    this.canvas = canvas; this.o = opts; this.hover = null; this.dirty = true;
    var self = this;
    canvas.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect(); self.hover = { x: e.clientX - r.left, y: e.clientY - r.top }; self.dirty = true;
    });
    canvas.addEventListener('mouseleave', function () { self.hover = null; self.dirty = true; });
  }
  StripChart.prototype.draw = function (rec, win, axes) {
    var s = setup(this.canvas); if (!s) return;
    var ctx = s.ctx, W = s.w, H = s.h, o = this.o;
    var pad = { l: 44, r: 8, t: 22, b: 18 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.font = '600 10.5px Inter, "Segoe UI", system-ui, sans-serif'; ctx.fillStyle = C.title; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(o.title, 8, 11);
    var tw = ctx.measureText(o.title).width;
    ctx.font = C.font; ctx.fillStyle = C.text2; ctx.fillText(o.unit ? '[' + o.unit + ']' : '', 14 + tw, 11);
    var n = rec.n, T = rec.data.t;
    if (n < 2) { ctx.fillStyle = C.text2; ctx.textAlign = 'center'; ctx.fillText('brak danych — uruchom symulację', W / 2, H / 2); ctx.textAlign = 'left'; return; }
    var tEnd = T[n - 1], tStart = win === 'all' ? T[0] : Math.max(T[0], tEnd - win);
    if (win !== 'all' && tEnd - T[0] < win) { tStart = T[0]; }
    var span = win === 'all' ? Math.max(1e-3, tEnd - tStart) : win;
    var i0 = Math.max(0, lowerBound(T, n, tStart) - 1);
    var series = o.series.filter(function (sr) { return !sr.axis || axes[sr.axis]; });
    // y range
    var ymin = Infinity, ymax = -Infinity;
    series.forEach(function (sr) {
      var a = rec.data[sr.ch];
      for (var i = i0; i < n; i++) { var v = a[i]; if (v < ymin) ymin = v; if (v > ymax) ymax = v; }
    });
    if (!isFinite(ymin)) { ymin = -1; ymax = 1; }
    if (o.zeroBased) ymin = Math.min(0, ymin);
    var minSpan = o.minSpan || 1e-3;
    if (ymax - ymin < minSpan) { var c = (ymax + ymin) / 2; ymin = c - minSpan / 2; ymax = c + minSpan / 2; }
    var m = (ymax - ymin) * 0.08; ymin -= m; ymax += m;
    if (o.zeroBased && ymin > -m) ymin = Math.min(0, ymin);
    var X = function (t) { return pad.l + (t - tStart) / span * pw; };
    var Y = function (v) { return pad.t + (1 - (v - ymin) / (ymax - ymin)) * ph; };
    // grid
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.text; ctx.textAlign = 'right';
    var ys = niceStep(ymax - ymin, Math.max(2, Math.floor(ph / 28)));
    for (var yv = Math.ceil(ymin / ys) * ys; yv <= ymax; yv += ys) {
      var yy = Math.round(Y(yv)) + 0.5;
      ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke();
      ctx.fillText(fmt(yv, ys), pad.l - 5, yy);
    }
    ctx.textAlign = 'center';
    var xs = niceStep(span, Math.max(2, Math.floor(pw / 70)));
    for (var xv = Math.ceil(tStart / xs) * xs; xv <= tStart + span; xv += xs) {
      var xx = Math.round(X(xv)) + 0.5;
      ctx.strokeStyle = C.grid2; ctx.beginPath(); ctx.moveTo(xx, pad.t); ctx.lineTo(xx, pad.t + ph); ctx.stroke();
      ctx.fillText(fmt(xv, xs) + 's', xx, H - 8);
    }
    if (ymin < 0 && ymax > 0) { ctx.strokeStyle = C.axis; var y0 = Math.round(Y(0)) + 0.5; ctx.beginPath(); ctx.moveTo(pad.l, y0); ctx.lineTo(W - pad.r, y0); ctx.stroke(); }
    (o.hlines || []).forEach(function (hl) {
      if (hl.v < ymin || hl.v > ymax) return;
      ctx.strokeStyle = hl.color || '#fbbf24'; ctx.setLineDash([2, 3]);
      var y = Math.round(Y(hl.v)) + 0.5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]);
    });
    // series (min/max decimation per pixel column)
    ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, pw, ph); ctx.clip();
    var count = n - i0;
    series.forEach(function (sr) {
      var a = rec.data[sr.ch];
      ctx.strokeStyle = sr.color; ctx.lineWidth = sr.width || 1.25; ctx.globalAlpha = sr.alpha || 1;
      ctx.setLineDash(sr.dash || []);
      ctx.beginPath();
      if (count > pw * 2.5 && !sr.dash) {
        var col = -1, mn = 0, mx = 0, first = true;
        for (var i = i0; i < n; i++) {
          var px = Math.floor(X(T[i]));
          if (px !== col) {
            if (col >= 0) { if (first) { ctx.moveTo(col, Y(mn)); first = false; } else ctx.lineTo(col, Y(mn)); ctx.lineTo(col, Y(mx)); }
            col = px; mn = mx = a[i];
          } else { if (a[i] < mn) mn = a[i]; if (a[i] > mx) mx = a[i]; }
        }
        if (col >= 0) { ctx.lineTo(col, Y(mn)); ctx.lineTo(col, Y(mx)); }
      } else {
        var stride = Math.max(1, Math.floor(count / (pw * 2)));
        for (i = i0; i < n; i += stride) { var x = X(T[i]), y = Y(a[i]); if (i === i0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.lineTo(X(T[n - 1]), Y(a[n - 1]));
      }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    });
    ctx.restore();
    // legend with last values
    ctx.textAlign = 'right'; ctx.font = C.font;
    var lx = W - pad.r;
    var legend = series.filter(function (sr) { return !sr.hideLegend; });
    var titleEnd = 8 + tw + (o.unit ? ctx.measureText('[' + o.unit + ']').width + 14 : 6);
    for (var li = legend.length - 1; li >= 0; li--) {
      var sr = legend[li], txt = sr.label + ' ' + fmtVal(rec.data[sr.ch][n - 1]);
      var wtxt = ctx.measureText(txt).width;
      if (lx - wtxt < titleEnd) break;
      ctx.fillStyle = sr.color; ctx.globalAlpha = sr.dash ? 0.75 : 1;
      ctx.fillText(txt, lx, 11); lx -= wtxt + 10; ctx.globalAlpha = 1;
    }
    // hover crosshair
    if (this.hover && this.hover.x > pad.l && this.hover.x < W - pad.r) {
      var th = tStart + (this.hover.x - pad.l) / pw * span;
      var hi = Math.min(n - 1, lowerBound(T, n, th));
      var hx = Math.round(X(T[hi])) + 0.5;
      ctx.strokeStyle = 'rgba(215,224,236,.35)'; ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, pad.t + ph); ctx.stroke();
      var lines = ['t = ' + T[hi].toFixed(3) + ' s'].concat(series.map(function (sr) { return sr.label + ': ' + fmtVal(rec.data[sr.ch][hi]); }));
      ctx.font = C.font; var bw = 0; lines.forEach(function (l) { bw = Math.max(bw, ctx.measureText(l).width); });
      var bx = hx + 8, by = pad.t + 4, bh = lines.length * 13 + 6;
      if (bx + bw + 12 > W) bx = hx - bw - 20;
      ctx.fillStyle = 'rgba(7,9,13,.9)'; ctx.strokeStyle = C.axis; ctx.fillRect(bx, by, bw + 12, bh); ctx.strokeRect(bx + .5, by + .5, bw + 11, bh - 1);
      ctx.textAlign = 'left';
      lines.forEach(function (l, k) {
        ctx.fillStyle = k === 0 ? C.text : series[k - 1].color;
        ctx.fillText(l, bx + 6, by + 9 + k * 13);
        if (k > 0) { ctx.beginPath(); ctx.arc(hx, Y(rec.data[series[k - 1].ch][hi]), 2.5, 0, 7); ctx.fill(); }
      });
    }
    this.dirty = false;
  };

  // ------------------------------------------------------------------ LineChart (static)
  function LineChart(canvas, opts) { this.canvas = canvas; this.o = opts || {}; this.data = null; }
  LineChart.prototype.set = function (data) { this.data = data; this.draw(); };
  LineChart.prototype.draw = function () {
    var s = setup(this.canvas); if (!s || !this.data) return;
    var ctx = s.ctx, W = s.w, H = s.h, o = this.o, d = this.data;
    var pad = { l: 50, r: 10, t: 24, b: 22 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.font = '600 10.5px Inter, system-ui, sans-serif'; ctx.fillStyle = C.title; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(o.title || '', 8, 11); ctx.font = C.font;
    var xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    d.series.forEach(function (sr) { for (var i = 0; i < sr.x.length; i++) { xmin = Math.min(xmin, sr.x[i]); xmax = Math.max(xmax, sr.x[i]); ymin = Math.min(ymin, sr.y[i]); ymax = Math.max(ymax, sr.y[i]); } });
    (d.hlines || []).forEach(function (h) { ymin = Math.min(ymin, h.v); ymax = Math.max(ymax, h.v); });
    if (ymax - ymin < 1e-9) { ymax += 1; ymin -= 1; }
    var m = (ymax - ymin) * 0.08; ymin -= m; ymax += m;
    var X = function (x) { return pad.l + (x - xmin) / (xmax - xmin) * pw; }, Y = function (y) { return pad.t + (1 - (y - ymin) / (ymax - ymin)) * ph; };
    ctx.font = C.font; ctx.strokeStyle = C.grid; ctx.fillStyle = C.text; ctx.textAlign = 'right';
    var ys = niceStep(ymax - ymin, Math.max(2, Math.floor(ph / 30)));
    for (var v = Math.ceil(ymin / ys) * ys; v <= ymax; v += ys) { var yy = Math.round(Y(v)) + .5; ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke(); ctx.fillText(fmt(v, ys), pad.l - 5, yy); }
    ctx.textAlign = 'center';
    var xs = niceStep(xmax - xmin, Math.max(2, Math.floor(pw / 70)));
    for (v = Math.ceil(xmin / xs) * xs; v <= xmax + 1e-12; v += xs) { var xx = Math.round(X(v)) + .5; ctx.strokeStyle = C.grid2; ctx.beginPath(); ctx.moveTo(xx, pad.t); ctx.lineTo(xx, pad.t + ph); ctx.stroke(); ctx.fillText(fmt(v * (o.xScale || 1), xs * (o.xScale || 1)) + (o.xUnit || ''), xx, H - 9); }
    (d.hlines || []).forEach(function (h) { ctx.strokeStyle = h.color || C.axis; ctx.setLineDash([3, 3]); var y = Math.round(Y(h.v)) + .5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]); });
    ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, pw, ph); ctx.clip();
    d.series.forEach(function (sr) {
      ctx.strokeStyle = sr.color; ctx.lineWidth = sr.width || 1.6; ctx.setLineDash(sr.dash || []);
      ctx.beginPath(); for (var i = 0; i < sr.x.length; i++) { var x = X(sr.x[i]), y = Y(sr.y[i]); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    ctx.textAlign = 'right'; var lx = W - pad.r;
    for (var k = d.series.length - 1; k >= 0; k--) { var sr = d.series[k]; if (!sr.label) continue; ctx.fillStyle = sr.color; ctx.fillText(sr.label, lx, 11); lx -= ctx.measureText(sr.label).width + 12; }
  };

  // ------------------------------------------------------------------ BarChart
  function BarChart(canvas, opts) { this.canvas = canvas; this.o = opts || {}; this.data = null; }
  BarChart.prototype.set = function (data) { this.data = data; this.draw(); };
  BarChart.prototype.draw = function () {
    var s = setup(this.canvas); if (!s || !this.data) return;
    var ctx = s.ctx, W = s.w, H = s.h, d = this.data, log = !!d.log;
    var pad = { l: 52, r: 10, t: 22, b: 30 }, pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    var vals = []; d.series.forEach(function (sr) { sr.values.forEach(function (v) { if (isFinite(v) && (!log || v > 0)) vals.push(v); }); });
    if (!vals.length) return;
    var vmax = Math.max.apply(null, vals), vmin = log ? Math.min.apply(null, vals) : 0;
    var lo, hi, T;
    if (log) { lo = Math.floor(Math.log10(vmin)); hi = Math.ceil(Math.log10(vmax)); if (hi === lo) hi++; T = function (v) { return (Math.log10(Math.max(v, Math.pow(10, lo))) - lo) / (hi - lo); }; }
    else { hi = vmax * 1.12 || 1; lo = 0; T = function (v) { return v / hi; }; }
    ctx.font = C.font; ctx.textBaseline = 'middle'; ctx.fillStyle = C.text; ctx.strokeStyle = C.grid; ctx.textAlign = 'right';
    if (log) { for (var e = lo; e <= hi; e++) { var y = pad.t + (1 - (e - lo) / (hi - lo)) * ph; ctx.beginPath(); ctx.moveTo(pad.l, Math.round(y) + .5); ctx.lineTo(W - pad.r, Math.round(y) + .5); ctx.stroke(); ctx.fillText('1e' + e, pad.l - 5, y); } }
    else { var st = niceStep(hi, 5); for (var v = 0; v <= hi; v += st) { y = pad.t + (1 - v / hi) * ph; ctx.beginPath(); ctx.moveTo(pad.l, Math.round(y) + .5); ctx.lineTo(W - pad.r, Math.round(y) + .5); ctx.stroke(); ctx.fillText(fmt(v, st), pad.l - 5, y); } }
    var ng = d.groups.length, ns = d.series.length, gw = pw / ng, bw = Math.min(28, gw * 0.8 / ns);
    ctx.textAlign = 'center';
    d.groups.forEach(function (g, gi) {
      var gx = pad.l + gi * gw + gw / 2 - bw * ns / 2;
      d.series.forEach(function (sr, si) {
        var val = sr.values[gi]; if (!isFinite(val)) return;
        var h = T(val) * ph, x = gx + si * bw;
        ctx.fillStyle = sr.colors ? sr.colors[gi] : sr.color;
        ctx.globalAlpha = sr.alpha || 0.9;
        ctx.fillRect(x + 1, pad.t + ph - h, bw - 2, h);
        ctx.globalAlpha = 1;
        if (d.labels && bw > 14) { ctx.save(); ctx.fillStyle = C.text; ctx.font = '9px ' + C.font.split(' ').slice(1).join(' '); ctx.translate(x + bw / 2, pad.t + ph - h - 4); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'left'; ctx.fillText(fmtVal(val), 0, 0); ctx.restore(); }
      });
      ctx.fillStyle = C.text; ctx.fillText(g, pad.l + gi * gw + gw / 2, H - 16);
    });
    ctx.textAlign = 'right'; var lx = W - pad.r;
    for (var k = ns - 1; k >= 0; k--) { var sr = d.series[k]; if (!sr.label) continue; ctx.fillStyle = sr.color || C.text; ctx.fillText('■ ' + sr.label, lx, 10); lx -= ctx.measureText('■ ' + sr.label).width + 12; }
  };

  GS.StripChart = StripChart;
  GS.LineChart = LineChart;
  GS.BarChart = BarChart;
})(typeof window !== 'undefined' ? window : globalThis);
