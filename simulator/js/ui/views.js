/*
 * views.js — secondary views: batch benchmark, model & tuning (step tests, LQG/MPC design), thesis results.
 */
(function (root) {
  'use strict';
  var GS = root.GS, doc = root.document, $ = function (s) { return doc.querySelector(s); };
  var R2D = GS.R2D, D2R = GS.D2R;
  var app = GS.app;
  var views = GS.views = {};
  var CT = GS.CONTROLLERS;

  function f(v, d) { return v == null || !isFinite(v) ? '—' : GS.fmtVal(v); }
  void f;

  // ================================================================== BENCHMARK
  var bench = { results: null, stop: false, running: false, W: null };
  function buildBench() {
    var dsBox = $('#bench-ds');
    GS.DATASETS.forEach(function (d, i) {
      var l = doc.createElement('label');
      l.innerHTML = '<input type="checkbox" value="' + d.id + '"' + ([1, 4, 7].indexOf(d.id) >= 0 ? ' checked' : '') + '> ' + d.id + ' <span class="muted">' + GS.THESIS.durations[i] + 's</span>';
      dsBox.appendChild(l);
    });
    var cBox = $('#bench-ctrl');
    GS.CONTROLLER_ORDER.forEach(function (k) {
      var l = doc.createElement('label');
      l.innerHTML = '<input type="checkbox" value="' + k + '"' + (k !== 'direct' ? ' checked' : '') + '> <span class="swatch" style="background:' + CT[k].color + '"></span>' + CT[k].label;
      cBox.appendChild(l);
    });
    function setDs(ids) { dsBox.querySelectorAll('input').forEach(function (i) { i.checked = ids.indexOf(+i.value) >= 0; }); }
    $('#bench-ds-all').onclick = function () { setDs([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); };
    $('#bench-ds-short').onclick = function () { setDs([1, 4, 7]); };
    $('#bench-ds-none').onclick = function () { setDs([]); };
    bench.W = GS.ui.buildSliders(doc.getElementById('view-bench'), { input: function () { if (bench.results) renderBench(); } });
    $('#bench-errmetric').onchange = function () { if (bench.results) renderBench(); };
    bench.charts = {
      mse: new GS.BarChart($('#bench-mse')), energy: new GS.BarChart($('#bench-energy')),
      score: new GS.BarChart($('#bench-score')), perds: new GS.BarChart($('#bench-perds'))
    };
    $('#bench-run').onclick = runBench;
    $('#bench-stop').onclick = function () { bench.stop = true; };
    $('#bench-csv').onclick = function () {
      if (!bench.results) return;
      var lines = ['controller,dataset,duration_s,mse_yaw,mse_pitch,mse_roll,mse_mean,J_yaw,J_pitch,J_roll,energy_mAh,energy_yaw,energy_pitch,energy_roll,charge_As,max_err_deg'];
      bench.results.ctrls.forEach(function (c) {
        bench.results.ds.forEach(function (d) {
          var m = bench.results.m[c][d]; if (!m) return;
          lines.push([CT[c].label, d, m.t.toFixed(2), m.mse[0], m.mse[1], m.mse[2], m.mseMean, m.J[0], m.J[1], m.J[2], m.mAh, m.mAhAxis[0], m.mAhAxis[1], m.mAhAxis[2], m.As, Math.max.apply(null, m.maxErr)].join(','));
        });
      });
      GS.download('gimbalsim_benchmark.csv', lines.join('\n'), 'text/csv');
    };
  }
  function runBench() {
    if (bench.running) return;
    var ds = [].map.call(doc.querySelectorAll('#bench-ds input:checked'), function (i) { return +i.value; });
    var ctrls = [].map.call(doc.querySelectorAll('#bench-ctrl input:checked'), function (i) { return i.value; });
    if (!ds.length || !ctrls.length) { $('#bench-txt').textContent = 'wybierz zestawy i regulatory'; return; }
    var limit = +$('#bench-limit').value;
    var jobs = [];
    ds.forEach(function (d) { ctrls.forEach(function (c) { jobs.push({ ds: d, c: c }); }); });
    bench.results = { ds: ds, ctrls: ctrls, m: {}, full: !limit };
    ctrls.forEach(function (c) { bench.results.m[c] = {}; });
    bench.running = true; bench.stop = false;
    $('#bench-run').disabled = true; $('#bench-stop').disabled = false;
    var totalSim = 0, doneSim = 0;
    var durOf = function (d) { var dur = GS.THESIS.durations[d - 1]; return limit ? Math.min(limit, dur) : dur; };
    jobs.forEach(function (j) { totalSim += durOf(j.ds); });
    var ji = 0, t0 = performance.now();
    function nextJob() {
      if (bench.stop || ji >= jobs.length) return finish();
      var j = jobs[ji];
      GS.Disturbance.loadDataset(j.ds).then(function (dsObj) {
        var opts = JSON.parse(JSON.stringify(app.dsOpts)); opts.loop = false;
        var src = new GS.Disturbance.DatasetSource(dsObj, opts);
        var cfg = JSON.parse(JSON.stringify(app.cfg)); cfg.controller = j.c; cfg.hybrid = false; cfg.recordHz = 1;
        var sim = new GS.Simulation(cfg, src);
        var end = limit ? Math.min(limit, src.duration) : src.duration;
        (function chunk() {
          if (bench.stop) return finish();
          var c0 = performance.now();
          while (sim.t < end - 1e-9 && performance.now() - c0 < 30) sim.advance(Math.min(end, sim.t + 0.2));
          var frac = (doneSim + sim.t) / totalSim;
          $('#bench-bar').style.width = (frac * 100) + '%';
          var el = (performance.now() - t0) / 1000, eta = frac > 0.01 ? el / frac - el : 0;
          $('#bench-txt').textContent = CT[j.c].label + ' · zestaw ' + j.ds + ' · ' + sim.t.toFixed(0) + '/' + end.toFixed(0) + ' s · ' + (frac * 100).toFixed(1) + '% · pozostało ~' + eta.toFixed(0) + ' s';
          if (sim.t < end - 1e-9) return setTimeout(chunk, 0);
          bench.results.m[j.c][j.ds] = sim.metrics();
          doneSim += end; ji++;
          renderBench();
          setTimeout(nextJob, 0);
        })();
      }, function (e) { $('#bench-txt').textContent = e.message; finish(); });
    }
    function finish() {
      bench.running = false;
      $('#bench-run').disabled = false; $('#bench-stop').disabled = true;
      if (!bench.stop) { $('#bench-bar').style.width = '100%'; $('#bench-txt').textContent = 'zakończono · ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s obliczeń'; }
      else $('#bench-txt').textContent = 'przerwano';
      renderBench();
    }
    nextJob();
  }
  function renderBench() {
    var R = bench.results; if (!R) return;
    var W = { energy: bench.W['w-energy'].value, yaw: bench.W['w-yaw'].value, pitch: bench.W['w-pitch'].value, roll: bench.W['w-roll'].value };
    var sumW = W.energy + W.yaw + W.pitch + W.roll || 1;
    var rows = R.ctrls.map(function (c) {
      var ms = R.ds.map(function (d) { return R.m[c][d]; }).filter(Boolean);
      if (!ms.length) return null;
      var avg = function (fn) { return ms.reduce(function (s, m) { return s + fn(m); }, 0) / ms.length; };
      var r = {
        c: c, n: ms.length,
        mseY: avg(function (m) { return m.mse[0]; }), mseP: avg(function (m) { return m.mse[1]; }), mseR: avg(function (m) { return m.mse[2]; }),
        mAh: avg(function (m) { return m.mAh; }), eY: avg(function (m) { return m.mAhAxis[0]; }), eP: avg(function (m) { return m.mAhAxis[1]; }), eR: avg(function (m) { return m.mAhAxis[2]; }),
        maxE: Math.max.apply(null, ms.map(function (m) { return Math.max.apply(null, m.maxErr); })),
        rate: avg(function (m) { return Math.max.apply(null, m.ratePct); })
      };
      r.mse = (r.mseY + r.mseP + r.mseR) / 3;
      r.jY = avg(function (m) { return m.J[0]; }); r.jP = avg(function (m) { return m.J[1]; }); r.jR = avg(function (m) { return m.J[2]; });
      var useJ = $('#bench-errmetric').value === 'J';
      r.score = (W.energy * r.mAh + W.yaw * (useJ ? r.jY : r.mseY) + W.pitch * (useJ ? r.jP : r.mseP) + W.roll * (useJ ? r.jR : r.mseR)) / sumW;
      // thesis reference for the same datasets (tables 6 and 13), when the full datasets were simulated
      var tn = { pid: 'PID', nlpid: 'NL PID', lqg: 'LQG', mpc: 'MPC' }[c];
      var dsDone = R.ds.filter(function (d) { return R.m[c][d]; });
      r.thE = R.full && tn ? dsDone.reduce(function (s2, d) { return s2 + GS.THESIS.energy[tn][d - 1]; }, 0) / dsDone.length : NaN;
      r.thJR = R.full && tn ? dsDone.reduce(function (s2, d) { return s2 + GS.THESIS.mseRoll[tn][d - 1]; }, 0) / dsDone.length : NaN;
      return r;
    }).filter(Boolean);
    if (!rows.length) return;
    var sorted = rows.slice().sort(function (a, b) { return a.score - b.score; });
    rows.forEach(function (r) { r.rank = sorted.indexOf(r) + 1; });
    var cols = [['mseY', 'MSE yaw'], ['mseP', 'MSE pitch'], ['mseR', 'MSE roll'], ['jY', 'J yaw'], ['jP', 'J pitch'], ['jR', 'J roll'], ['thJR', 'J roll praca'], ['mAh', 'Energia [mAh]'], ['thE', 'E praca'], ['eY', 'E yaw'], ['eP', 'E pitch'], ['eR', 'E roll'], ['maxE', 'max |e| [°]'], ['score', 'Wynik']];
    var best = {}, worst = {};
    cols.forEach(function (c) { var v = rows.map(function (r) { return r[c[0]]; }).filter(isFinite); best[c[0]] = Math.min.apply(null, v); worst[c[0]] = Math.max.apply(null, v); });
    var h = '<thead><tr><th>Regulator</th><th>n</th>' + cols.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '<th>Miejsce</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      h += '<tr><td><span class="swatch" style="background:' + CT[r.c].color + '"></span>' + CT[r.c].label + '</td><td>' + r.n + '</td>' +
        cols.map(function (c) {
          var v = r[c[0]], ref = c[0].indexOf('th') === 0;
          var cls = ref ? 'muted' : rows.length > 1 && v === best[c[0]] ? 'best' : rows.length > 1 && v === worst[c[0]] ? 'worst' : '';
          return '<td class="' + cls + '">' + (isFinite(v) ? GS.fmtVal(v) : '—') + '</td>';
        }).join('') + '<td><span class="rank' + (r.rank === 1 ? ' r1' : '') + '">' + r.rank + '</span></td></tr>';
    });
    $('#bench-table').innerHTML = h + '</tbody>';
    var colors = rows.map(function (r) { return CT[r.c].color; });
    bench.charts.mse.set({ log: true, groups: ['Yaw', 'Pitch', 'Roll', 'Średnia'], series: rows.map(function (r) { return { label: CT[r.c].label, color: CT[r.c].color, values: [r.mseY, r.mseP, r.mseR, r.mse] }; }) });
    bench.charts.energy.set({ labels: true, groups: ['Σ', 'Yaw', 'Pitch', 'Roll'], series: rows.map(function (r) { return { label: CT[r.c].label, color: CT[r.c].color, values: [r.mAh, r.eY, r.eP, r.eR] }; }) });
    bench.charts.score.set({ labels: true, groups: rows.map(function (r) { return CT[r.c].label; }), series: [{ values: rows.map(function (r) { return r.score; }), colors: colors }] });
    bench.charts.perds.set({ log: true, groups: R.ds.map(String), series: rows.map(function (r) { return { label: CT[r.c].label, color: CT[r.c].color, values: R.ds.map(function (d) { var m = R.m[r.c][d]; return m ? m.mseMean : NaN; }) }; }) });
    // detail
    var d = '<thead><tr><th>Zestaw</th><th>Regulator</th><th>t [s]</th><th>MSE yaw</th><th>MSE pitch</th><th>MSE roll</th><th>J yaw</th><th>J pitch</th><th>J roll</th><th>Energia [mAh]</th><th>E praca [mAh]</th><th>max |e| [°]</th></tr></thead><tbody>';
    R.ds.forEach(function (ds) {
      R.ctrls.forEach(function (c) {
        var m = R.m[c][ds]; if (!m) return;
        var tn = { pid: 'PID', nlpid: 'NL PID', lqg: 'LQG', mpc: 'MPC' }[c];
        var thE = R.full && tn ? GS.THESIS.energy[tn][ds - 1].toFixed(2) : '—';
        d += '<tr><td>' + ds + '</td><td><span class="swatch" style="background:' + CT[c].color + '"></span>' + CT[c].label + '</td><td>' + m.t.toFixed(1) + '</td><td>' + GS.fmtVal(m.mse[0]) + '</td><td>' + GS.fmtVal(m.mse[1]) + '</td><td>' + GS.fmtVal(m.mse[2]) + '</td><td>' + GS.fmtVal(m.J[0]) + '</td><td>' + GS.fmtVal(m.J[1]) + '</td><td>' + GS.fmtVal(m.J[2]) + '</td><td>' + m.mAh.toFixed(2) + '</td><td class="muted">' + thE + '</td><td>' + Math.max.apply(null, m.maxErr).toFixed(3) + '</td></tr>';
      });
    });
    $('#bench-detail').innerHTML = d + '</tbody>';
  }

  // ================================================================== MODEL & TUNING
  var model = { built: false };
  function stepResponse(type, axis, ampDeg, horizon, noiseDeg) {
    var cfg = app.cfg, mc = cfg.motor, dt = cfg.dt, lim = mc.limitsDeg[axis] * D2R;
    var m = new GS.Motor(mc, lim, dt);
    var c = CT[type].create(cfg.params[type], { dt: dt, limit: lim, rateMax: m.rateMax, motorCfg: mc });
    m.reset(0); c.reset(0);
    var r = ampDeg * D2R, n = Math.round(horizon / dt), t = [0], y = [0], u = [0];
    var seed = 99, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var ise = 0, peak = 0, t10 = null, t90 = null, ts = 0;
    for (var k = 1; k <= n; k++) {
      var meas = m.q + (noiseDeg ? noiseDeg * D2R * Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()) : 0);
      var uu = c.step(r, meas); m.step(uu);
      var tt = k * dt; t.push(tt * 1000); y.push(m.q * R2D); u.push(uu * R2D);
      var e = r - m.q; ise += e * e * dt;
      peak = Math.max(peak, m.q);
      if (t10 === null && m.q >= 0.1 * r) t10 = tt;
      if (t90 === null && m.q >= 0.9 * r) t90 = tt;
      if (Math.abs(e) > 0.02 * Math.abs(r)) ts = tt;
    }
    return { t: t, y: y, u: u, rise: t10 !== null && t90 !== null ? (t90 - t10) * 1000 : NaN, os: Math.max(0, (peak - r) / r * 100), ts: ts * 1000, ise: ise * R2D * R2D };
  }
  function runStep() {
    var axis = $('#st-axis').value, amp = +$('#st-amp').value, hor = +$('#st-hor').value, noise = +$('#st-noise').value;
    var res = GS.CONTROLLER_ORDER.map(function (k) { return { k: k, r: stepResponse(k, axis, amp, hor, noise) }; });
    model.step.set({
      hlines: [{ v: amp, color: '#5b6778' }],
      series: res.map(function (x) { return { x: x.r.t, y: x.r.y, color: CT[x.k].color, label: CT[x.k].label, dash: x.k === 'direct' ? [4, 3] : null }; })
    });
    model.stepU.set({ series: res.map(function (x) { return { x: x.r.t, y: x.r.u, color: CT[x.k].color, width: 1.2, dash: x.k === 'direct' ? [4, 3] : null }; }) });
    var h = '<thead><tr><th>Regulator</th><th>czas narastania 10–90% [ms]</th><th>przeregulowanie [%]</th><th>czas regulacji 2% [ms]</th><th>ISE [deg²·s]</th><th>max u [°]</th></tr></thead><tbody>';
    res.forEach(function (x) {
      h += '<tr><td><span class="swatch" style="background:' + CT[x.k].color + '"></span>' + CT[x.k].label + '</td><td>' + (isFinite(x.r.rise) ? x.r.rise.toFixed(1) : '—') + '</td><td>' + x.r.os.toFixed(2) + '</td><td>' + x.r.ts.toFixed(1) + '</td><td>' + GS.fmtVal(x.r.ise) + '</td><td>' + Math.max.apply(null, x.r.u).toFixed(2) + '</td></tr>';
    });
    $('#step-table').innerHTML = h + '</tbody>';
  }
  function motorPanel() {
    var mc = app.cfg.motor, ss = GS.motorSS(mc.T1, mc.T2);
    $('#m-t1').textContent = mc.T1 + ' s'; $('#m-t2').textContent = mc.T2 + ' s';
    $('#m-wmax').textContent = (mc.nomRpm * Math.PI / 30).toFixed(2) + ' rad/s';
    $('#m-ss').textContent =
      'A = [' + ss.A[0].map(n4).join('  ') + ';  ' + ss.A[1].map(n4).join('  ') + ']\n' +
      'B = [' + ss.B[0][0] + '; ' + ss.B[1][0] + ']      C = [' + ss.C[0].map(n4).join('  ') + ']      D = 0\n' +
      'praca (rozdz. 5.3): A = 1e3·[−1.1667 −0.6510; 0.5120 0], B = [32 0]ᵀ, C = [0 20.3451]';
    function sim(rateLimited) {
      var m = new GS.Motor(Object.assign({}, mc, { nomRpm: rateLimited ? mc.nomRpm : 1e9 }), 10, 0.0002);
      m.reset(0); var t = [0], y = [0];
      for (var k = 1; k <= 300; k++) { m.step(1); t.push(k * 0.2); y.push(m.q); }
      return { t: t, y: y };
    }
    var a = sim(true), b = sim(false);
    model.motor.set({ hlines: [{ v: 1, color: '#5b6778' }], series: [
      { x: b.t, y: b.y, color: '#94a3b8', label: 'bez ograniczenia', dash: [4, 3] },
      { x: a.t, y: a.y, color: '#38bdf8', label: 'z ograniczeniem ω_max' }] });
  }
  function n4(v) { return Math.abs(v) >= 100 ? v.toFixed(2) : v.toFixed(4); }
  function lqgPanel() {
    var d = GS.designLQG(app.cfg.params.lqg, app.cfg.motor, app.cfg.dt), p = app.cfg.params.lqg;
    var poles = d.polesC.map(function (z) { return z.re.toFixed(2); }).join(', ');
    $('#lqg-info').innerHTML =
      'Wagi LQR:  Q = diag(<b>' + p.q1 + '</b>, <b>' + p.q2 + '</b>),  R = <b>' + p.r + '</b>   (formuła Brysona, ε = 0.01)\n' +
      'Filtr Kalmana:  Q = <b>' + p.qn + '</b>,  R = <b>' + p.rn + '</b>\n\n' +
      'K ciągłe       = [<b>' + (d.Kc ? d.Kc.map(n4).join('  ') : '—') + '</b>]    praca: [0.0245  0.0246]\n' +
      'K dyskretne    = [<b>' + d.K.map(n4).join('  ') + '</b>]   (Ts = ' + app.cfg.dt * 1000 + ' ms)\n' +
      'bieguny u. z.  = <b>' + poles + '</b>    praca: −667.39, −500.06\n' +
      'Nx = [<b>' + d.Nx.map(n4).join('  ') + '</b>]   Nu = <b>' + n4(d.Nu) + '</b>    praca: Nx = [0 0.0492], Nu = 1\n' +
      'L (Kalman)     = [<b>' + d.L.map(n4).join('  ') + '</b>]\n\n' +
      'u(t) = −K·x̂(t) + (Nu + K·Nx)·y_zad   (3.28)\n' +
      'rank(obsv(A,C)) = 2, rank(ctrb(A,B)) = 2 — obiekt sterowalny i obserwowalny';
  }
  function mpcPanel() {
    var p = app.cfg.params.mpc, div = Math.max(1, Math.round(p.Ts / app.cfg.dt)), Ts = div * app.cfg.dt;
    var d = GS.designMPC(p, app.cfg.motor, Ts);
    var S = d.S.slice(1, 7).map(function (v) { return v.toFixed(4); }).join(', ');
    $('#mpc-info').innerHTML =
      '<div class="eq">min<sub>Δu</sub> J = Σ<sub>p=1..N</sub> w<sub>y</sub>(y<sub>zad</sub> − ŷ(k+p|k))² + λ Σ<sub>p=0..Nu−1</sub> Δu(k+p|k)² &nbsp;(3.3)</div>' +
      '<div class="eq">|Δu| ≤ ω<sub>max</sub>·T<sub>s</sub>, &nbsp; u<sub>min</sub> ≤ u ≤ u<sub>max</sub> &nbsp;(3.4)</div>' +
      '<div class="matrix mono">N = ' + d.N + ', Nu = ' + d.Nu + ', Ts = ' + (Ts * 1000).toFixed(0) + ' ms, λ = ' + p.lambda + ', w_y = ' + p.wy + '\n' +
      'horyzont predykcji: ' + (d.N * Ts * 1000).toFixed(0) + ' ms\n' +
      'odp. skokowa modelu S1..S6 = [' + S + ']\n' +
      'H = 2(w_y·ΦᵀΦ + λI): ' + d.Nu + '×' + d.Nu + ', diag = [' + d.H.map(function (r, i) { return r[i].toFixed(2); }).join(', ') + ']\n' +
      'ograniczenia: ' + d.M.length + ' nierówności, QP — metoda zbioru aktywnego (primal active-set)\n' +
      'estymacja: model wewnętrzny + stałe zakłócenie wyjściowe d = y − Cx̂</div>';
  }
  function plantTable() {
    var P = GS.defaultPlant(), L = P.links;
    var rows = [['Ixx [kg·m²]', 'xx'], ['Iyy', 'yy'], ['Izz', 'zz'], ['Ixy', 'xy'], ['Ixz', 'xz'], ['Iyx', 'yx'], ['Iyz', 'yz'], ['Izx', 'zx'], ['Izy', 'zy']];
    var h = '<thead><tr><th>Parametr</th><th>Człon 1 (yaw)</th><th>Człon 2 (roll)</th><th>Człon 3 (pitch + kamera)</th></tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr><td>' + r[0] + '</td>' + L.map(function (l) { return '<td>' + l.I[r[1]] + '</td>'; }).join('') + '</tr>'; });
    h += '<tr><td>Masa [kg]</td>' + L.map(function (l) { return '<td>' + l.m + '</td>'; }).join('') + '</tr>';
    ['X', 'Y', 'Z'].forEach(function (a, i) { h += '<tr><td>' + a + ' środka masy [m]</td>' + L.map(function (l) { return '<td>' + l.com[i] + '</td>'; }).join('') + '</tr>'; });
    h += '<tr><td>B1 / L1 / H1 / H3 [m]</td><td colspan="3" style="text-align:left">' + [P.dims.B1, P.dims.L1, P.dims.H1, P.dims.H3].join(' / ') + '</td></tr>';
    $('#plant-table').innerHTML = h + '</tbody>';
  }
  function buildModel() {
    if (model.built) return;
    model.built = true;
    model.step = new GS.LineChart($('#step-chart'), { title: 'Pozycja silnika [°]', xUnit: ' ms' });
    model.stepU = new GS.LineChart($('#step-u-chart'), { title: 'Sterowanie u [°]', xUnit: ' ms' });
    model.motor = new GS.LineChart($('#motor-chart'), { title: 'Odpowiedź skokowa silnika [rad]', xUnit: ' ms' });
    $('#st-run').onclick = runStep;
    plantTable();
  }
  function refreshModel() {
    buildModel(); motorPanel(); lqgPanel(); mpcPanel(); runStep();
  }

  // ================================================================== THESIS
  var thesis = { built: false };
  var TH_COL = { 'LQG': CT.lqg.color, 'MPC': CT.mpc.color, 'PID': CT.pid.color, 'NL PID': CT.nlpid.color, 'NN NARMA': '#64748b', 'NN MRC': '#475569' };
  function avg(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function buildThesis() {
    if (thesis.built) return; thesis.built = true;
    var T = GS.THESIS, cs = T.controllers;
    var rows = cs.map(function (c) {
      return { c: c, e: avg(T.energy[c]), y: avg(T.mseYaw[c]), p: avg(T.msePitch[c]), r: avg(T.mseRoll[c]), s: T.score[c] };
    });
    var sorted = rows.slice().sort(function (a, b) { return a.s - b.s; });
    var cols = [['e', 'Energia [mAh]'], ['y', 'MSE yaw'], ['p', 'MSE pitch'], ['r', 'MSE roll'], ['s', 'Wynik ważony']];
    var best = {}; cols.forEach(function (k) { best[k[0]] = Math.min.apply(null, rows.map(function (r) { return r[k[0]]; })); });
    var h = '<thead><tr><th>Regulator</th>' + cols.map(function (c) { return '<th>' + c[1] + '</th>'; }).join('') + '<th>Miejsce</th><th>W symulatorze</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var nn = !T.simulated[r.c], rank = sorted.indexOf(r) + 1;
      h += '<tr class="' + (nn ? 'nn' : '') + '"><td><span class="swatch" style="background:' + TH_COL[r.c] + '"></span>' + r.c + '</td>' +
        cols.map(function (c) { return '<td class="' + (r[c[0]] === best[c[0]] ? 'best' : '') + '">' + GS.fmtVal(r[c[0]]) + '</td>'; }).join('') +
        '<td><span class="rank' + (rank === 1 ? ' r1' : '') + '">' + rank + '</span></td><td style="font-family:var(--sans)">' + (nn ? 'nie (SSN)' : 'tak') + '</td></tr>';
    });
    $('#th-score').innerHTML = h + '<tr><td>Waga</td><td>0.6</td><td>0.6</td><td>0.5</td><td>0.2</td><td></td><td></td><td></td></tr></tbody>';
    thesis.chart = new GS.BarChart($('#th-chart'));
    $('#th-metric').onchange = renderThesisTable;
    var sel = $('#pl-test');
    for (var i = 1; i <= 10; i++) { var o = doc.createElement('option'); o.value = i; o.textContent = 'Test ' + i + ' (' + T.durations[i - 1] + ' s)'; sel.appendChild(o); }
    ['#pl-ctrl', '#pl-test', '#pl-type'].forEach(function (s) { $(s).onchange = showPlot; });
    $('#pl-img').onerror = function () { this.hidden = true; $('#pl-missing').hidden = false; };
    $('#pl-img').onload = function () { this.hidden = false; $('#pl-missing').hidden = true; };
    renderThesisTable(); showPlot();
  }
  function renderThesisTable() {
    var T = GS.THESIS, key = $('#th-metric').value, data = T[key], cs = T.controllers;
    var h = '<thead><tr><th>Regulator</th>' + T.durations.map(function (d, i) { return '<th>Test ' + (i + 1) + '</th>'; }).join('') + '<th>Średnia</th></tr></thead><tbody>';
    var colBest = T.durations.map(function (d, i) { return Math.min.apply(null, cs.map(function (c) { return data[c][i]; })); });
    var colWorst = T.durations.map(function (d, i) { return Math.max.apply(null, cs.map(function (c) { return data[c][i]; })); });
    cs.forEach(function (c) {
      h += '<tr class="' + (T.simulated[c] ? '' : 'nn') + '"><td><span class="swatch" style="background:' + TH_COL[c] + '"></span>' + c + '</td>' +
        data[c].map(function (v, i) { return '<td class="' + (v === colBest[i] ? 'best' : v === colWorst[i] ? 'worst' : '') + '">' + GS.fmtVal(v) + '</td>'; }).join('') +
        '<td>' + GS.fmtVal(avg(data[c])) + '</td></tr>';
    });
    $('#th-table').innerHTML = h + '</tbody>';
    thesis.chart.set({
      log: key.indexOf('mse') === 0, groups: T.durations.map(function (d, i) { return 'T' + (i + 1); }),
      series: cs.map(function (c) { return { label: c, color: TH_COL[c], values: data[c], alpha: T.simulated[c] ? 0.9 : 0.45 }; })
    });
  }
  function showPlot() {
    var c = $('#pl-ctrl').value, t = $('#pl-test').value, ty = $('#pl-type').value;
    var name = ty === 'ZAKŁÓCENIE' ? 'TEST ' + t + ' ZAKŁÓCENIE.png' : c + '   ' + t + ' ' + ty + '.png';
    $('#pl-img').src = '../results/plots/' + encodeURIComponent(name);
  }

  // ================================================================== hooks
  var current = 'sim';
  views.onShow = function (v) {
    current = v;
    if (v === 'model') refreshModel();
    if (v === 'thesis') buildThesis();
    if (v === 'bench') { if (bench.results) renderBench(); }
  };
  views.onSimUpdate = function (st) {
    if (current !== 'model' || !st) return;
    var RG = GS.rot.eulerZYX(st.ref[0], st.ref[1], st.ref[2]);
    var M = GS.rot.mul(GS.rot.T(st.Rb), RG);
    var q = GS.rot.ikZXY(M);
    $('#kin-live').textContent =
      '⎡' + [M[0], M[1], M[2]].map(n4s).join(' ') + ' ⎤\n' +
      '⎢' + [M[3], M[4], M[5]].map(n4s).join(' ') + ' ⎥   →  θyaw = ' + (q[0] * R2D).toFixed(2) + '°,  θroll = ' + (q[1] * R2D).toFixed(2) + '°,  θpitch = ' + (q[2] * R2D).toFixed(2) + '°\n' +
      '⎣' + [M[6], M[7], M[8]].map(n4s).join(' ') + ' ⎦';
  };
  function n4s(v) { var s = v.toFixed(4); return (v >= 0 ? ' ' : '') + s; }
  // the model view reads the live simulation state even when paused
  setInterval(function () { if (current === 'model' && app.sim) views.onSimUpdate(app.sim.state); }, 250);
  root.addEventListener('resize', function () {
    if (current === 'bench' && bench.results) renderBench();
    if (current === 'model' && model.built) { model.step.draw(); model.stepU.draw(); model.motor.draw(); }
    if (current === 'thesis' && thesis.built) thesis.chart.draw();
  });

  function init() { buildBench(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})(window);
