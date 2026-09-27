/*
 * app.js — main simulation view: configuration panel, real-time loop, 3D view, HUD, KPIs and charts.
 */
(function (root) {
  'use strict';
  var GS = root.GS, doc = root.document, $ = function (s) { return doc.querySelector(s); };
  var R2D = GS.R2D, D2R = GS.D2R;

  var app = GS.app = {
    cfg: GS.defaultConfig(),
    srcKey: 'ds:1',
    source: null, sim: null,
    running: false, speed: 1, finished: false,
    win: 5, axes: { Yaw: true, Pitch: true, Roll: true },
    dsOpts: { map: { yaw: 'X', pitch: 'Y', roll: 'Z' }, sign: { yaw: 1, pitch: 1, roll: 1 }, unwrap: true, zero: true, gain: 1, loop: false, interp: 'cubic' },
    profile: 'thesis',
    synth: { amp: 1, ay: 5, fy: 0.5, ap: 8, fp: 1.5, ar: 6, fr: 1, step: 15 },
    battery: 2000,
    busy: false
  };

  // ------------------------------------------------------------------ sources
  function buildSourceSelect() {
    var s = $('#src-select'), og = doc.createElement('optgroup');
    og.label = 'Rzeczywiste zakłócenia (MATLAB Mobile, 100 Hz)';
    GS.DATASETS.forEach(function (d, i) {
      var o = doc.createElement('option'); o.value = 'ds:' + d.id;
      o.textContent = d.name + ' — ' + GS.THESIS.durations[i] + ' s · ' + d.desc; og.appendChild(o);
    });
    s.appendChild(og);
    var og2 = doc.createElement('optgroup'); og2.label = 'Profile syntetyczne i testowe';
    Object.keys(GS.Disturbance.PROFILES).forEach(function (k) {
      var o = doc.createElement('option'); o.value = 'syn:' + k; o.textContent = GS.Disturbance.PROFILES[k].label; og2.appendChild(o);
    });
    s.appendChild(og2);
    s.value = app.srcKey;
    s.addEventListener('change', function () { app.srcKey = s.value; loadSource().then(function () { restart(); }); });
  }
  function sourceUI() {
    var k = app.srcKey, isDs = k.indexOf('ds:') === 0, kind = k.split(':')[1];
    $('#src-dataset-opts').hidden = !isDs;
    $('#src-synth-opts').hidden = isDs || ['walk', 'run', 'car', 'boat'].indexOf(kind) < 0;
    $('#src-sine-opts').hidden = kind !== 'sine' || isDs;
    $('#src-steps-opts').hidden = kind !== 'steps' || isDs;
    $('#src-manual-opts').hidden = kind !== 'manual' || isDs;
    var desc = '';
    if (isDs) {
      var ds = GS.Disturbance.decodeDataset(+kind);
      desc = 'Zapis orientacji telefonu (X — azymut, Y — pochylenie, Z — przechylenie). ' + (ds ? ds.n + ' próbek, ' + ds.duration.toFixed(1) + ' s.' : '');
    } else desc = GS.Disturbance.PROFILES[kind].desc;
    $('#src-desc').textContent = desc;
  }
  function loadSource() {
    var k = app.srcKey;
    sourceUI();
    if (k.indexOf('ds:') === 0) {
      var id = +k.split(':')[1];
      $('#loading').hidden = false;
      return GS.Disturbance.loadDataset(id).then(function (ds) {
        $('#loading').hidden = true;
        app.source = new GS.Disturbance.DatasetSource(ds, app.dsOpts);
        sourceUI();
      }, function (err) { $('#loading').hidden = true; alert(err.message); });
    }
    var kind = k.split(':')[1];
    app.source = new GS.Disturbance.SyntheticSource(kind, app.synth);
    if (kind === 'manual') app.source.manual = [sl('man-yaw').value, sl('man-pitch').value, sl('man-roll').value];
    return Promise.resolve();
  }
  function rebuildDatasetSource() {
    if (app.srcKey.indexOf('ds:') !== 0) return;
    var ds = GS.Disturbance.decodeDataset(+app.srcKey.split(':')[1]);
    app.source = new GS.Disturbance.DatasetSource(ds, app.dsOpts);
    restart();
  }

  // ------------------------------------------------------------------ simulation lifecycle
  function restart() {
    if (!app.source) return;
    app.sim = new GS.Simulation(app.cfg, app.source);
    app.finished = false;
    app.rtAcc = { sim: 0, real: 0 };
    app.charts.forEach(function (c) { c.dirty = true; });
    refreshControllerInfo();
    updateHUD(true);
    drawCharts(true);
  }
  function setRunning(on) {
    if (on && app.finished) restart();
    app.running = on;
    $('#play-icon').setAttribute('d', on ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M7 5v14l12-7z');
    $('#play-label').textContent = on ? 'Pauza' : 'Start';
    var dot = $('#st-dot'); dot.className = 'dot' + (on ? ' run' : app.finished ? ' done' : '');
    $('#st-state').textContent = on ? 'PRACA' : app.finished ? 'KONIEC' : 'STOP';
  }

  // seek (fast-forward in chunks, restart when going backwards)
  function seek(frac) {
    if (!app.sim || !isFinite(app.source.duration) || app.busy) return;
    var target = frac * app.source.duration;
    if (target < app.sim.t) restart();
    var wasRunning = app.running; setRunning(false);
    app.busy = true; $('#loading').hidden = false;
    $('#loading span').textContent = 'Przewijanie…';
    (function chunk() {
      var t0 = performance.now();
      while (app.sim.t < target - 1e-9 && performance.now() - t0 < 40) app.sim.advance(Math.min(target, app.sim.t + 0.25));
      updateProgress();
      if (app.sim.t < target - 1e-9) return setTimeout(chunk, 0);
      app.busy = false; $('#loading').hidden = true; $('#loading span').textContent = 'Wczytywanie danych…';
      updateHUD(true); drawCharts(true); setRunning(wasRunning);
    })();
  }

  // ------------------------------------------------------------------ controller panel
  var ctrlSliders = {};
  function buildControllerUI() {
    var seg = $('#ctrl-seg');
    seg.innerHTML = '';
    GS.CONTROLLER_ORDER.forEach(function (k) {
      var c = GS.CONTROLLERS[k], b = doc.createElement('button');
      b.dataset.k = k; b.innerHTML = '<span class="sw" style="background:' + c.color + '"></span>' + c.label;
      b.addEventListener('click', function () { app.cfg.controller = k; paintSeg(); buildParamUI(); applyControllers(); });
      seg.appendChild(b);
    });
    ['yaw', 'pitch', 'roll'].forEach(function (ax) {
      var s = $('#hy-' + ax);
      GS.CONTROLLER_ORDER.forEach(function (k) { var o = doc.createElement('option'); o.value = k; o.textContent = GS.CONTROLLERS[k].label; s.appendChild(o); });
      s.value = app.cfg.axisController[ax];
      s.addEventListener('change', function () { app.cfg.axisController[ax] = s.value; applyControllers(); });
    });
    $('#ctrl-hybrid').addEventListener('change', function (e) {
      app.cfg.hybrid = e.target.checked; $('#hybrid-opts').hidden = !app.cfg.hybrid; applyControllers();
    });
    $('#ctrl-defaults').addEventListener('click', function () {
      var k = app.cfg.controller; app.cfg.params[k] = GS.defaultControllerParams(k); buildParamUI(); applyControllers();
    });
    paintSeg(); buildParamUI();
  }
  function paintSeg() {
    doc.querySelectorAll('#ctrl-seg button').forEach(function (b) { b.classList.toggle('active', b.dataset.k === app.cfg.controller); });
    $('#ctrl-desc').textContent = GS.CONTROLLERS[app.cfg.controller].desc;
  }
  function buildParamUI() {
    var k = app.cfg.controller, box = $('#ctrl-params'), p = app.cfg.params[k];
    box.innerHTML = ''; ctrlSliders = {};
    GS.CONTROLLERS[k].params.forEach(function (d) {
      if (d.type === 'bool') {
        var lab = doc.createElement('label'); lab.className = 'checks';
        lab.innerHTML = '<label><input type="checkbox"' + (p[d.key] ? ' checked' : '') + '> ' + d.label + '</label>';
        lab.querySelector('input').addEventListener('change', function (e) { p[d.key] = e.target.checked; applyControllers(); });
        box.appendChild(lab); return;
      }
      ctrlSliders[d.key] = new GS.ui.Slider(box, {
        label: d.label, min: d.min, max: d.max, step: d.step, value: p[d.key], log: d.log,
        onInput: function (v) {
          p[d.key] = d.int ? Math.round(v) : v;
          if (k === 'pid' || k === 'nlpid') refreshControllerInfo();     // PID gains act live (shared object)
        },
        onChange: function () { if (k !== 'pid' && k !== 'nlpid') applyControllers(); }
      });
    });
  }
  function applyControllers() {
    if (app.sim) { app.sim.cfg = app.cfg; app.sim.rebuildControllers(); }
    refreshControllerInfo(); updateHUD(true);
  }
  function refreshControllerInfo() {
    var k = app.cfg.controller, box = $('#ctrl-info'), s = '';
    try {
      if (k === 'lqg') {
        var d = GS.designLQG(app.cfg.params.lqg, app.cfg.motor, app.cfg.dt);
        s = 'K (dyskretne, Ts=1 ms) = [' + d.K.map(f4).join('  ') + ']\n' +
          'K (ciągłe)            = [' + (d.Kc ? d.Kc.map(f4).join('  ') : '—') + ']\n' +
          'Nx = [' + d.Nx.map(f4).join('  ') + ']   Nu = ' + f4(d.Nu) + '\n' +
          'L Kalmana = [' + d.L.map(f4).join('  ') + ']\n' +
          'bieguny ukł. zamkniętego: ' + d.polesC.map(function (p) { return p.re.toFixed(1) + (Math.abs(p.im) > 1e-6 ? (p.im > 0 ? '+' : '') + p.im.toFixed(1) + 'j' : ''); }).join(', ');
      } else if (k === 'mpc') {
        var p = app.cfg.params.mpc, Ts = Math.max(1, Math.round(p.Ts / app.cfg.dt)) * app.cfg.dt;
        s = 'Ts = ' + (Ts * 1000).toFixed(0) + ' ms, horyzont predykcji ' + (p.N * Ts * 1000).toFixed(0) + ' ms\n' +
          'Δu_max = ω_max·Ts = ' + (app.cfg.motor.nomRpm * Math.PI / 30 * Ts * R2D).toFixed(2) + '°/próbkę\n' +
          'QP: ' + (p.Nu) + ' zmiennych, ' + (4 * p.Nu) + ' ograniczeń (zbiór aktywny)';
        if (app.sim && app.sim.ctrls.pitch && app.sim.ctrls.pitch.stats) {
          var st = app.sim.ctrls.pitch.stats; s += '\naktywne ograniczenia (pitch): ' + (st.qp ? (100 * st.active / st.qp).toFixed(2) : '0') + '% kroków';
        }
      } else if (k === 'pid' || k === 'nlpid') {
        var q = app.cfg.params[k];
        s = (k === 'pid' ? 'u = kp[e + 1/Ti∫e + Td·ė]' : 'u = kp[ε₀(e/ε₀)|e/ε₀| + 1/Ti∫e + Td·ė]') + '\n' +
          'kp = ' + q.kp.toFixed(3) + ', ki = kp/Ti = ' + (q.kp / q.Ti).toFixed(1) + ' 1/s, kd = kp·Td = ' + (q.kp * q.Td * 1000).toFixed(3) + ' ms\n' +
          'anti-windup: całkowanie warunkowe przy nasyceniu';
      } else s = 'Brak sprzężenia zwrotnego: u = x_mn (zadana z kinematyki odwrotnej).';
    } catch (e) { s = 'Błąd projektu: ' + e.message; }
    box.textContent = s;
  }
  function f4(v) { return Math.abs(v) >= 1000 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(3) : v.toFixed(4); }

  // ------------------------------------------------------------------ sliders
  var S = {};
  function sl(id) { return S[id]; }
  function onSlider(id, v, final) {
    var c = app.cfg;
    switch (id) {
      case 'ref-yaw': c.reference.yaw = v; break;
      case 'ref-pitch': c.reference.pitch = v; break;
      case 'ref-roll': c.reference.roll = v; break;
      case 'ds-gain': if (final) { app.dsOpts.gain = v; rebuildDatasetSource(); } break;
      case 'syn-amp': app.synth.amp = v; break;
      case 'sin-ay': app.synth.ay = v; break; case 'sin-fy': app.synth.fy = v; break;
      case 'sin-ap': app.synth.ap = v; break; case 'sin-fp': app.synth.fp = v; break;
      case 'sin-ar': app.synth.ar = v; break; case 'sin-fr': app.synth.fr = v; break;
      case 'stp-amp': app.synth.step = v; break;
      case 'man-yaw': case 'man-pitch': case 'man-roll':
        if (app.source && app.source.kind === 'manual') app.source.manual = [sl('man-yaw').value, sl('man-pitch').value, sl('man-roll').value];
        break;
      case 'mdl-payload': c.payloadScale = v; if (app.sim) app.sim.rebuildDynamics(); break;
      case 'mdl-imbx': c.imbalance[0] = v; if (app.sim) app.sim.rebuildDynamics(); break;
      case 'mdl-imbz': c.imbalance[2] = v; if (app.sim) app.sim.rebuildDynamics(); break;
      case 'mdl-rpm': if (final) { c.motor.nomRpm = v; c.motor.rateRad = v * Math.PI / 30; restart(); } break;
      case 'mdl-i0': c.motor.I0 = [v, v, v]; break;
      case 'mdl-noise': c.sensor.noiseDeg = v; break;
      case 'mdl-res': c.sensor.resolutionDeg = v; break;
      case 'mdl-batt': app.battery = v; break;
      default: break;
    }
  }

  // ------------------------------------------------------------------ model profile
  var PROFILE_HINT = {
    thesis: 'Silnik wg rozdz. 2.3 (T₁ = 2 ms, 560 rpm), kinematyka ZXY (wzór 2.33), zakłócenia X→yaw z rozwinięciem ±180°.',
    simulink: 'Odtworzenie plików .slx: silnik T₁ = 0.2 ms z ogranicznikiem 18.5 rad/s na wyjściu, kinematyka ZYX, X→roll / Y→pitch / Z→yaw, nastawy PID/NL PID/LQG z modeli, start z 0. Energia i J odpowiadają tab. 6–13.'
  };
  function applyProfile(name) {
    app.profile = name;
    var loop = app.dsOpts.loop;
    app.dsOpts = GS.applyProfile(app.cfg, name); app.dsOpts.loop = loop;
    syncModelUI();
    buildParamUI(); refreshControllerInfo();
    if (app.srcKey.indexOf('ds:') === 0) rebuildDatasetSource(); else restart();
  }
  function syncModelUI() {
    var c = app.cfg, o = app.dsOpts;
    $('#mdl-profile').value = app.profile;
    $('#mdl-profile-hint').textContent = PROFILE_HINT[app.profile];
    $('#mdl-energy').value = c.energyModel;
    $('#mdl-zero').checked = !!c.startAtZero;
    ['yaw', 'pitch', 'roll'].forEach(function (ax) { $('#map-' + ax).value = o.map[ax]; S['ref-' + ax].set(c.reference[ax]); });
    $('#ds-unwrap').checked = o.unwrap; $('#ds-zero').checked = o.zero; $('#ds-hold').checked = o.interp === 'hold';
    $('#ref-mode').value = c.mode; $('#ref-program').value = c.refProgram;
    var rate = c.motor.rateRad != null ? c.motor.rateRad : c.motor.nomRpm * Math.PI / 30;
    S['mdl-rpm'].set(Math.round(rate * 30 / Math.PI));
    $('#dials').innerHTML = ''; buildDials();
  }

  // ------------------------------------------------------------------ HUD / KPI
  var kpiEls = {};
  function buildKPIs() {
    var g = $('#kpi-grid');
    var defs = [
      ['mseYaw', 'MSE yaw', 'deg²', 'yaw'], ['msePitch', 'MSE pitch', 'deg²', 'pitch'],
      ['mseRoll', 'MSE roll', 'deg²', 'roll'], ['mseMean', 'MSE średnie', 'deg²'],
      ['jYaw', 'J yaw (praca)', 'rad²s', 'yaw'], ['jPitch', 'J pitch (praca)', 'rad²s', 'pitch'],
      ['jRoll', 'J roll (praca)', 'rad²s', 'roll'], ['energy', 'Energia', 'mAh'],
      ['current', 'Prąd chwilowy', 'A'],
      ['power', 'Moc (12 V)', 'W'], ['maxErr', 'Maks. |błąd|', '°'],
      ['sat', 'Nasycenie pozycji', '%'], ['rate', 'Ogr. prędkości', '%'],
      ['battery', 'Akumulator', '', null, true]
    ];
    defs.forEach(function (d) {
      var t = doc.createElement('div'); t.className = 'kpi' + (d[4] ? ' wide' : '');
      t.innerHTML = '<div class="k">' + (d[3] ? '<i style="background:' + GS.ui.AX_COL[d[3]] + '"></i>' : '') + d[1] + '</div><div class="v">—</div><div class="s">&nbsp;</div>' + (d[0] === 'battery' ? '<div class="battery"><div></div></div>' : '');
      g.appendChild(t);
      kpiEls[d[0]] = { v: t.querySelector('.v'), s: t.querySelector('.s'), unit: d[2], bar: t.querySelector('.battery div') };
    });
  }
  function setK(key, val, sub) {
    var e = kpiEls[key]; if (!e) return;
    e.v.innerHTML = val + (e.unit ? '<small>' + e.unit + '</small>' : '');
    if (sub != null) e.s.textContent = sub;
  }
  var dials = {};
  function buildDials() {
    var box = $('#dials');
    GS.AXES.forEach(function (ax) { dials[ax] = new GS.ui.Dial(box, ax, app.cfg.motor.limitsDeg[ax]); });
  }
  var lastHud = 0;
  function updateHUD(force) {
    var now = performance.now();
    if (!force && now - lastHud < 80) return;
    lastHud = now;
    var sim = app.sim; if (!sim || !sim.state) return;
    var st = sim.state, m = sim.metrics();
    $('#st-time').textContent = st.t.toFixed(3) + ' s';
    // orientation table
    var rows = ['yaw', 'pitch', 'roll'].map(function (ax, i) {
      var q = st.q[ax];
      return '<tr><td class="t-' + ax + '">' + ax.toUpperCase() + '</td><td>' + (st.base[i] * R2D).toFixed(2) + '</td><td>' + (st.ref[i] * R2D).toFixed(2) + '</td><td>' + (st.cam[i] * R2D).toFixed(2) + '</td><td>' + (st.err[i] * R2D).toFixed(3) + '</td><td>' + (q * R2D).toFixed(2) + '</td></tr>';
    }).join('');
    $('#hud-orient').innerHTML = '<div class="hud-panel"><table><tr><th>OŚ</th><th>PODSTAWA</th><th>ZADANA</th><th>KAMERA</th><th>BŁĄD</th><th>SILNIK</th></tr>' + rows + '</table></div>';
    var cname = app.cfg.hybrid ? 'HYBRYDA ' + GS.AXES.map(function (a) { return GS.CONTROLLERS[app.cfg.axisController[a]].label; }).join('/') : GS.CONTROLLERS[app.cfg.controller].label;
    $('#hud-motors').innerHTML = '<div class="hud-panel mono"><span style="color:#8b98ab">REG</span> ' + cname +
      ' &nbsp;<span style="color:#8b98ab">ŹRÓDŁO</span> ' + app.source.name + ' &nbsp;<span style="color:#8b98ab">TRYB</span> ' +
      ({ lock: 'blokada', followYaw: 'podążanie yaw', follow: 'FPV' })[app.cfg.mode] + '</div>';
    // POV overlay
    var tc = st.t, hh = Math.floor(tc / 3600), mm = Math.floor(tc / 60) % 60, ss = Math.floor(tc) % 60, ff = Math.floor((tc % 1) * 60);
    $('#pov-tc').textContent = (hh ? pad(hh) + ':' : '') + pad(mm) + ':' + pad(ss) + ':' + pad(ff);
    $('#pov-att').innerHTML = '<span>Y ' + (st.cam[0] * R2D).toFixed(1) + '°</span><span>P ' + (st.cam[1] * R2D).toFixed(1) + '°</span><span>R ' + (st.cam[2] * R2D).toFixed(1) + '°</span>';
    // KPIs
    setK('mseYaw', GS.fmtVal(m.mse[0]), 'RMSE ' + GS.fmtVal(m.rmse[0]) + '°');
    setK('msePitch', GS.fmtVal(m.mse[1]), 'RMSE ' + GS.fmtVal(m.rmse[1]) + '°');
    setK('mseRoll', GS.fmtVal(m.mse[2]), 'RMSE ' + GS.fmtVal(m.rmse[2]) + '°');
    setK('mseMean', GS.fmtVal(m.mseMean), 'średnia 3 osi (tab. 10)');
    setK('energy', m.mAh.toFixed(m.mAh < 10 ? 3 : 2), '∫|I|dt = ' + m.As.toFixed(2) + ' A·s · Y ' + m.mAhAxis[0].toFixed(2) + ' · P ' + m.mAhAxis[1].toFixed(2) + ' · R ' + m.mAhAxis[2].toFixed(2));
    ['jYaw', 'jPitch', 'jRoll'].forEach(function (k, i) { setK(k, GS.fmtVal(m.J[i]), '∫(x_mn − x_m)² dt'); });
    var Itot = st.I[0] + st.I[1] + st.I[2];
    setK('current', Itot.toFixed(3), 'Y ' + st.I[0].toFixed(2) + ' · P ' + st.I[1].toFixed(2) + ' · R ' + st.I[2].toFixed(2));
    var avgI = st.t > 0 ? m.mAh * 3.6 / st.t : Itot;
    setK('power', (Itot * app.cfg.motor.voltage).toFixed(2), 'średnio ' + (avgI * app.cfg.motor.voltage).toFixed(2) + ' W');
    setK('maxErr', Math.max.apply(null, m.maxErr).toFixed(3), 'Y ' + m.maxErr[0].toFixed(2) + ' · P ' + m.maxErr[1].toFixed(2) + ' · R ' + m.maxErr[2].toFixed(2));
    setK('sat', Math.max.apply(null, m.satPct).toFixed(2), 'Y ' + m.satPct[0].toFixed(1) + ' · P ' + m.satPct[1].toFixed(1) + ' · R ' + m.satPct[2].toFixed(1));
    setK('rate', Math.max.apply(null, m.ratePct).toFixed(2), 'Y ' + m.ratePct[0].toFixed(1) + ' · P ' + m.ratePct[1].toFixed(1) + ' · R ' + m.ratePct[2].toFixed(1));
    var left = Math.max(0, 1 - m.mAh / app.battery), hrs = avgI > 0 ? app.battery / 1000 / avgI : Infinity;
    setK('battery', (left * 100).toFixed(1) + '%', 'szac. czas pracy ' + (isFinite(hrs) ? hrs.toFixed(2) + ' h' : '—') + ' przy ' + avgI.toFixed(2) + ' A');
    kpiEls.battery.bar.style.width = (left * 100) + '%';
    // dials
    GS.AXES.forEach(function (ax, i) {
      dials[ax].update(st.q[ax] * R2D, st.req[i] * R2D, st.qd[i] * R2D, st.I[i], st.tau[i] * 1000, st.sat[i], st.rl[i]);
    });
    updateProgress();
    if (GS.views && GS.views.onSimUpdate) GS.views.onSimUpdate(st);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function updateProgress() {
    var sim = app.sim, d = app.source ? app.source.duration : Infinity;
    if (!sim) return;
    if (isFinite(d)) {
      var f = Math.min(1, sim.t / d);
      $('#progress-bar').style.width = (f * 100) + '%';
      $('#progress-txt').textContent = sim.t.toFixed(1) + ' / ' + d.toFixed(1) + ' s  (' + (f * 100).toFixed(1) + '%)  · kliknij, aby przewinąć';
    } else {
      $('#progress-bar').style.width = '0';
      $('#progress-txt').textContent = sim.t.toFixed(1) + ' s  · źródło ciągłe';
    }
  }

  // ------------------------------------------------------------------ charts
  function axSeries(prefix, dashPrefix, extra) {
    var out = [];
    [['Yaw', '#60a5fa'], ['Pitch', '#4ade80'], ['Roll', '#f87171']].forEach(function (a) {
      out.push({ ch: prefix + a[0], label: a[0].charAt(0), color: a[1], axis: a[0] });
      if (dashPrefix) out.push({ ch: dashPrefix + a[0], label: a[0].charAt(0) + '*', color: a[1], axis: a[0], dash: [4, 3], alpha: 0.7, width: 1 });
    });
    return out.concat(extra || []);
  }
  function buildCharts() {
    var defs = [
      { title: 'Orientacja globalna kamery', unit: '°', series: axSeries('c', 'r'), minSpan: 0.5 },
      { title: 'Zakłócenie — orientacja podstawy', unit: '°', series: axSeries('b'), minSpan: 0.5 },
      { title: 'Silniki: pozycja x_m / nowa zadana x_mn', unit: '°', series: axSeries('m', 'n'), minSpan: 0.5 },
      { title: 'Błąd orientacji kamery', unit: '°', series: axSeries('e'), minSpan: 0.01 },
      { title: 'Sterowanie u (wyjście regulatora)', unit: '°', series: axSeries('u'), minSpan: 0.5 },
      { title: 'Prędkość silników', unit: '°/s', series: axSeries('w'), minSpan: 1, hlines: [{ v: 560 * 6, color: '#fbbf24' }, { v: -560 * 6, color: '#fbbf24' }] },
      { title: 'Moment silników', unit: 'mNm', series: axSeries('t'), minSpan: 0.1 },
      { title: 'Prąd silników', unit: 'A', series: axSeries('i', null, [{ ch: 'iTot', label: 'Σ', color: '#e2e8f0' }]), minSpan: 0.1, zeroBased: true },
      { title: 'Wskaźnik z pracy J = ∫(x_mn − x_m)² dt', unit: 'rad²s', series: axSeries('j'), minSpan: 1e-6, zeroBased: true },
      { title: 'Zużyta energia', unit: 'mAh', series: [{ ch: 'mAh', label: 'Σ', color: '#38bdf8', width: 1.8 }], minSpan: 1e-3, zeroBased: true }
    ];
    var grid = $('#chart-grid');
    app.charts = defs.map(function (d) {
      var cell = doc.createElement('div'); cell.className = 'chart-cell';
      var cv = doc.createElement('canvas'); cell.appendChild(cv); grid.appendChild(cell);
      return new GS.StripChart(cv, d);
    });
    doc.querySelectorAll('#win-seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        doc.querySelectorAll('#win-seg button').forEach(function (x) { x.classList.toggle('active', x === b); });
        app.win = b.dataset.win === 'all' ? 'all' : +b.dataset.win; drawCharts(true);
      });
    });
    doc.querySelectorAll('#axis-toggle input').forEach(function (i) {
      i.addEventListener('change', function () { app.axes[i.dataset.ax] = i.checked; drawCharts(true); });
    });
  }
  var lastCharts = 0;
  function drawCharts(force) {
    var now = performance.now();
    if (!app.sim) return;
    var any = force || (app.running && now - lastCharts > 33);
    app.charts.forEach(function (c) { if (any || c.dirty) c.draw(app.sim.rec, app.win, app.axes); });
    if (any) lastCharts = now;
  }

  // ------------------------------------------------------------------ main loop
  var lastT = 0, fpsAcc = 0, fpsN = 0, fpsT = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    var dtR = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
    fpsAcc += dtR; fpsN++;
    if (ts - fpsT > 500) { $('#st-fps').textContent = (fpsN / Math.max(1e-3, fpsAcc)).toFixed(0); fpsAcc = 0; fpsN = 0; fpsT = ts; }
    if (!doc.getElementById('view-sim').classList.contains('active')) return;
    var sim = app.sim;
    if (sim && app.running && !app.busy) {
      var t0 = sim.t, c0 = performance.now(), done;
      if (app.speed === 'max') {
        done = false;
        while (performance.now() - c0 < 14 && !done) done = sim.advance(sim.t + 0.02);
      } else done = sim.advance(sim.t + dtR * app.speed);
      app.rtAcc.sim += sim.t - t0; app.rtAcc.real += dtR;
      if (app.rtAcc.real > 0.5) { $('#st-rt').textContent = (app.rtAcc.sim / app.rtAcc.real).toFixed(2) + '×'; app.rtAcc = { sim: 0, real: 0 }; }
      if (done && !(app.source.opts && app.source.opts.loop)) { app.finished = true; setRunning(false); updateHUD(true); drawCharts(true); }
    }
    if (sim) {
      app.scene.update(sim.state);
      app.scene.render($('#pov'));
      updateHUD(false);
      drawCharts(false);
    }
  }

  // ------------------------------------------------------------------ init
  function init() {
    GS.ui.collapsibles(doc);
    S = GS.ui.buildSliders(doc.getElementById('view-sim'), {
      input: function (id, v) { onSlider(id, v, false); },
      change: function (id, v) { onSlider(id, v, true); }
    });
    app.sliders = S;
    buildSourceSelect();
    buildControllerUI();
    buildKPIs(); buildDials(); buildCharts();
    syncModelUI();

    ['yaw', 'pitch', 'roll'].forEach(function (ax) {
      $('#map-' + ax).addEventListener('change', function (e) { app.dsOpts.map[ax] = e.target.value; rebuildDatasetSource(); });
    });
    $('#ds-unwrap').addEventListener('change', function (e) { app.dsOpts.unwrap = e.target.checked; rebuildDatasetSource(); });
    $('#ds-zero').addEventListener('change', function (e) { app.dsOpts.zero = e.target.checked; rebuildDatasetSource(); });
    $('#ds-hold').addEventListener('change', function (e) { app.dsOpts.interp = e.target.checked ? 'hold' : 'cubic'; rebuildDatasetSource(); });
    $('#mdl-profile').addEventListener('change', function (e) { applyProfile(e.target.value); });
    $('#mdl-energy').addEventListener('change', function (e) { app.cfg.energyModel = e.target.value; restart(); });
    $('#mdl-zero').addEventListener('change', function (e) { app.cfg.startAtZero = e.target.checked; restart(); });
    $('#ds-loop').addEventListener('change', function (e) { app.dsOpts.loop = e.target.checked; if (app.source && app.source.opts) app.source.opts.loop = e.target.checked; });
    $('#ref-mode').addEventListener('change', function (e) { app.cfg.mode = e.target.value; if (app.sim) app.sim.baseFollow = app.sim.base.slice(); });
    $('#ref-program').addEventListener('change', function (e) { app.cfg.refProgram = e.target.value; });
    doc.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.dataset.preset === 'thesis' ? [0, -45, 0] : [0, 0, 0];
        ['yaw', 'pitch', 'roll'].forEach(function (ax, i) { S['ref-' + ax].set(p[i]); app.cfg.reference[ax] = p[i]; });
      });
    });

    app.scene = new GS.Scene3D($('#gl'), {
      onBaseDrag: function (dx, dy) {
        if (!app.source || app.source.kind !== 'manual') return;
        S['man-roll'].set(S['man-roll'].value + dx * 0.25); S['man-pitch'].set(S['man-pitch'].value - dy * 0.25);
        onSlider('man-roll', S['man-roll'].value);
      }
    });
    doc.querySelectorAll('#view-buttons [data-cam]').forEach(function (b) { b.addEventListener('click', function () { app.scene.setView(b.dataset.cam); }); });
    [['tg-axes', 'axes'], ['tg-ghost', 'ghost'], ['tg-frustum', 'frustum'], ['tg-horizon', 'horizon'], ['tg-pov', 'pov']].forEach(function (p) {
      $('#' + p[0]).addEventListener('change', function (e) { app.scene.setToggle(p[1], e.target.checked); if (p[1] === 'pov') $('#pov').classList.toggle('off', !e.target.checked); });
    });

    $('#btn-play').addEventListener('click', function () { setRunning(!app.running); });
    $('#btn-reset').addEventListener('click', function () { setRunning(false); restart(); });
    $('#btn-step').addEventListener('click', function () { if (app.sim) { app.sim.advance(app.sim.t + 0.01); updateHUD(true); drawCharts(true); } });
    $('#speed').addEventListener('change', function (e) { app.speed = e.target.value === 'max' ? 'max' : +e.target.value; });
    $('#progress').addEventListener('click', function (e) { var r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); });
    $('#btn-csv').addEventListener('click', function () {
      if (!app.sim) return;
      download('gimbalsim_' + (app.cfg.hybrid ? 'hybrid' : app.cfg.controller) + '_' + app.srcKey.replace(':', '') + '.csv', app.sim.rec.toCSV(), 'text/csv');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.target.closest('input,select,[contenteditable]')) return;
      if (!doc.getElementById('view-sim').classList.contains('active')) return;
      if (e.code === 'Space') { e.preventDefault(); setRunning(!app.running); }
      else if (e.key === 'r' || e.key === 'R') { setRunning(false); restart(); }
      else if (['1', '2', '3', '4'].indexOf(e.key) >= 0) app.scene.setView(['iso', 'front', 'side', 'top'][+e.key - 1]);
    });
    // tabs
    doc.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        doc.querySelectorAll('.tab').forEach(function (x) { x.classList.toggle('active', x === t); });
        doc.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + t.dataset.view); });
        if (t.dataset.view === 'sim') { drawCharts(true); }
        if (GS.views && GS.views.onShow) GS.views.onShow(t.dataset.view);
      });
    });
    root.addEventListener('resize', function () { drawCharts(true); });

    loadSource().then(function () { restart(); requestAnimationFrame(frame); });
  }

  function download(name, text, type) {
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
    a.download = name; doc.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  GS.download = download;
  app.restart = restart;
  app.init = init;
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})(window);
