/*
 * engine.js — closed-loop simulation of the stabiliser (thesis fig. 20 / 31):
 *
 *   base disturbance (yaw_d, pitch_d, roll_d) ─┐
 *   reference camera orientation ─────────────┴─> inverse kinematics -> required motor positions (x_mn)
 *   controller(x_mn, x_m) -> command u -> motor (saturation, rate limit, 2 lags) -> x_m
 *   forward kinematics (base * joints) -> global camera orientation -> error, MSE
 *   inverse dynamics (Newton-Euler) -> torque -> current -> energy [mAh]
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var r = GS.rot, D2R = GS.D2R, R2D = GS.R2D;

  var CHANNELS = [
    't',
    'bYaw', 'bPitch', 'bRoll',          // base disturbance [deg]
    'rYaw', 'rPitch', 'rRoll',          // reference camera orientation [deg]
    'cYaw', 'cPitch', 'cRoll',          // global camera orientation [deg]
    'eYaw', 'ePitch', 'eRoll',          // orientation error [deg]
    'nYaw', 'nPitch', 'nRoll',          // required ("new") motor position [deg]
    'mYaw', 'mPitch', 'mRoll',          // motor position [deg]
    'uYaw', 'uPitch', 'uRoll',          // controller output [deg]
    'wYaw', 'wPitch', 'wRoll',          // motor speed [deg/s]
    'tYaw', 'tPitch', 'tRoll',          // motor torque [mNm]
    'iYaw', 'iPitch', 'iRoll', 'iTot',  // current [A]
    'mAh',                              // cumulated charge [mAh]
    'mseYaw', 'msePitch', 'mseRoll',    // running MSE [deg^2]
    'jYaw', 'jPitch', 'jRoll'           // thesis index int (x_mn - x_m)^2 dt [rad^2 s]
  ];

  function Recorder(capacity) {
    this.cap = capacity || 4096; this.n = 0;
    this.data = {};
    var self = this;
    CHANNELS.forEach(function (c) { self.data[c] = new Float32Array(self.cap); });
  }
  Recorder.prototype.push = function (row) {
    if (this.n >= this.cap) {
      var nc = this.cap * 2, self = this;
      CHANNELS.forEach(function (c) { var a = new Float32Array(nc); a.set(self.data[c]); self.data[c] = a; });
      this.cap = nc;
    }
    for (var c in row) this.data[c][this.n] = row[c];
    this.n++;
  };
  Recorder.prototype.clear = function () { this.n = 0; };
  Recorder.prototype.toCSV = function () {
    var lines = [CHANNELS.join(',')];
    for (var i = 0; i < this.n; i++) {
      var row = [];
      for (var k = 0; k < CHANNELS.length; k++) row.push(+this.data[CHANNELS[k]][i].toFixed(5));
      lines.push(row.join(','));
    }
    return lines.join('\n');
  };

  function gauss(rng) {
    var u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function rngSeed(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  GS.defaultConfig = function () {
    var cp = {};
    GS.CONTROLLER_ORDER.forEach(function (k) { cp[k] = GS.defaultControllerParams(k); });
    return {
      dt: 0.001,
      recordHz: 100,
      controller: 'lqg',
      hybrid: false,
      axisController: { yaw: 'lqg', pitch: 'lqg', roll: 'mpc' },
      params: cp,
      reference: { yaw: 0, pitch: -45, roll: 0 },      // thesis scenario (ch. 5.6)
      mode: 'lock',                                      // lock | followYaw | follow
      followTau: 1.2,
      refProgram: 'static',                              // static | pan | steps
      yawShortest: true,
      sensor: { noiseDeg: 0, resolutionDeg: 0 },
      motor: GS.defaultMotor(),
      plant: GS.defaultPlant(),
      imbalance: [0, 0, 0],                              // extra camera COM offset [mm]
      payloadScale: 1,
      mseSkip: 0,
      kinematics: 'ZXY',                                 // ZXY (thesis text, eq. 2.33) | ZYX (Simulink models)
      energyModel: 'simulink',                           // simulink (current_calc, thesis) | rnea (Newton-Euler + I0)
      startAtZero: false                                 // motors start at 0 (Simulink initial conditions)
    };
  };

  /*
   * Model profiles.
   *   'thesis'   — as described in the thesis text (default of this simulator)
   *   'simulink' — reproduces src/models/*.slx: motor 1/(0.0002s+1)(0.0015s+1) with an 18.5 rad/s
   *                rate limiter on the output, ZYX angle conversions, disturbance X -> roll, Y -> pitch,
   *                Z -> yaw held at 100 Hz, no unwrapping, PID / NL PID / LQG gains from the models.
   * Returns the dataset options to use with this profile.
   */
  GS.applyProfile = function (cfg, name) {
    var d = GS.defaultConfig();
    cfg.motor = d.motor; cfg.kinematics = d.kinematics; cfg.yawShortest = d.yawShortest;
    ['pid', 'nlpid', 'lqg'].forEach(function (k) { cfg.params[k] = GS.defaultControllerParams(k); });
    cfg.reference = { yaw: 0, pitch: -45, roll: 0 }; cfg.mode = 'lock'; cfg.refProgram = 'static';
    cfg.energyModel = 'simulink'; cfg.startAtZero = false;
    if (name === 'simulink') {
      cfg.startAtZero = true;
      cfg.motor.plantT1 = 0.0002; cfg.motor.plantT2 = 0.0015; cfg.motor.rateAfter = true; cfg.motor.rateRad = 18.5;
      cfg.motor.limitsDeg = { yaw: 360, pitch: 2.35 * R2D, roll: 0.78 * R2D };
      cfg.kinematics = 'ZYX'; cfg.yawShortest = false;
      Object.keys(GS.SIMULINK_PARAMS).forEach(function (k) { Object.assign(cfg.params[k], GS.SIMULINK_PARAMS[k]); });
      return { map: { yaw: 'Z', pitch: 'Y', roll: 'X' }, sign: { yaw: 1, pitch: 1, roll: 1 }, unwrap: false, zero: false, gain: 1, loop: false, interp: 'hold' };
    }
    return { map: { yaw: 'X', pitch: 'Y', roll: 'Z' }, sign: { yaw: 1, pitch: 1, roll: 1 }, unwrap: true, zero: true, gain: 1, loop: false, interp: 'cubic' };
  };

  function Simulation(cfg, source) {
    this.cfg = cfg; this.source = source;
    this.rec = new Recorder(8192);
    this.build();
    this.reset();
  }
  Simulation.prototype.build = function () {
    var cfg = this.cfg, mc = cfg.motor, dt = cfg.dt, self = this;
    this.motors = {}; this.ctrls = {}; this.ctrlType = {};
    GS.AXES.forEach(function (ax) {
      var lim = mc.limitsDeg[ax] * D2R;
      self.motors[ax] = new GS.Motor(mc, lim, dt);
      var type = cfg.hybrid ? cfg.axisController[ax] : cfg.controller;
      self.ctrlType[ax] = type;
      var ctx = { dt: dt, limit: lim, rateMax: self.motors[ax].rateMax, motorCfg: mc };
      self.ctrls[ax] = GS.CONTROLLERS[type].create(cfg.params[type], ctx);
    });
    this.rebuildDynamics();
  };
  Simulation.prototype.reset = function () {
    var cfg = this.cfg;
    this.t = 0; this.k = 0; this.rec.clear();
    this.rng = rngSeed(12345);
    this.sumSq = [0, 0, 0]; this.nSq = 0; this.mAh = 0; this.mAhAxis = [0, 0, 0]; this.intSq = [0, 0, 0];
    this.qHist = null;
    this.maxErr = [0, 0, 0]; this.satCount = [0, 0, 0]; this.rateCount = [0, 0, 0];
    this.wf = [0, 0, 0]; this.af = [0, 0, 0];
    var b = this.source.sample(0, [0, 0, 0]);
    this.base = b.slice(); this.baseFollow = b.slice();
    this.Rb = r.eulerZYX(b[0], b[1], b[2]);
    this.refNow = this.computeRef(0);
    var req = this.required(this.Rb, this.refNow, null);
    var self = this;
    GS.AXES.forEach(function (ax, i) {
      self.motors[ax].reset(cfg.startAtZero ? 0 : r.clamp(req[i], -self.motors[ax].limit, self.motors[ax].limit));
      self.ctrls[ax].reset(self.motors[ax].q);
    });
    this.state = null;
    this.update(req, [0, 0, 0], true);
  };
  // reference orientation of the camera [yaw, pitch, roll] in rad
  Simulation.prototype.computeRef = function (t) {
    var c = this.cfg, ref = [c.reference.yaw * D2R, c.reference.pitch * D2R, c.reference.roll * D2R];
    if (c.refProgram === 'pan') {
      ref[0] += 30 * D2R * Math.sin(2 * Math.PI * t / 12);
      ref[1] += 10 * D2R * Math.sin(2 * Math.PI * t / 9);
    } else if (c.refProgram === 'steps') {
      var k = Math.floor(t / 4) % 4, tab = [[0, 0], [20, 0], [20, 15], [-15, -10]];
      ref[0] += tab[k][0] * D2R; ref[1] += tab[k][1] * D2R;
    }
    if (c.mode === 'followYaw' || c.mode === 'follow') {
      ref[0] += this.baseFollow ? this.baseFollow[0] : 0;
      if (c.mode === 'follow') ref[1] += this.baseFollow ? this.baseFollow[1] : 0;
    }
    return ref;
  };
  // required motor positions (display order yaw, pitch, roll) from inverse kinematics
  Simulation.prototype.required = function (Rb, ref, qPrevYaw) {
    var RG = r.eulerZYX(ref[0], ref[1], ref[2]);
    var Rrel = r.mul(r.T(Rb), RG), q;
    if (this.cfg.kinematics === 'ZYX') { var e = r.toEulerZYX(Rrel); q = [e[0], e[2], e[1]]; }   // Simulink: ZYX conversions
    else q = r.ikZXY(Rrel);                           // [yaw, roll, pitch]
    var yaw = q[0];
    if (this.cfg.yawShortest && qPrevYaw != null) {
      yaw = qPrevYaw + r.wrapPi(yaw - qPrevYaw);
      var lim = this.motors.yaw.limit;
      if (yaw > lim) yaw -= 2 * Math.PI; else if (yaw < -lim) yaw += 2 * Math.PI;
    }
    return [yaw, q[2], q[1]];
  };
  Simulation.prototype.measure = function (q) {
    var s = this.cfg.sensor, y = q;
    if (s.noiseDeg > 0) y += gauss(this.rng) * s.noiseDeg * D2R;
    if (s.resolutionDeg > 0) { var res = s.resolutionDeg * D2R; y = Math.round(y / res) * res; }
    return y;
  };
  Simulation.prototype.step = function () {
    var cfg = this.cfg, dt = cfg.dt, self = this;
    this.t += dt; this.k++;
    var t = this.t;
    // --- base orientation and its angular rates
    if (this.source.kind === 'manual') this.source.p.dtHint = dt;
    var b = this.source.sample(t, this.base);
    var Rb = r.eulerZYX(b[0], b[1], b[2]);
    var wRaw = r.scale(r.logSO3(r.mul(r.T(this.Rb), Rb)), 1 / dt);      // base frame
    this.Rb = Rb;
    var aF = dt / (dt + 1 / (2 * Math.PI * 25));
    var aPrev = this.wf.slice();
    for (var i = 0; i < 3; i++) this.wf[i] += aF * (wRaw[i] - this.wf[i]);
    for (i = 0; i < 3; i++) this.af[i] += aF * ((this.wf[i] - aPrev[i]) / dt - this.af[i]);
    // follow-mode filter
    if (cfg.mode !== 'lock') {
      var aFol = dt / (cfg.followTau + dt);
      for (i = 0; i < 2; i++) this.baseFollow[i] += aFol * (r.wrapPi(b[i] - this.baseFollow[i]));
    }
    // --- reference and required motor positions
    var ref = this.computeRef(t); this.refNow = ref;
    var req = this.required(Rb, ref, this.motors.yaw.q);
    // --- controllers and motors
    var u = [0, 0, 0];
    GS.AXES.forEach(function (ax, j) {
      var m = self.motors[ax];
      var y = self.measure(m.q);
      u[j] = self.ctrls[ax].step(req[j], y);
      m.step(u[j]);
      if (m.saturated) self.satCount[j]++;
      if (m.rateLimited) self.rateCount[j]++;
    });
    this.update(req, u, this.k % Math.max(1, Math.round(1 / (cfg.recordHz * dt))) === 0);
  };
  Simulation.prototype.update = function (req, u, record) {
    var cfg = this.cfg, dt = cfg.dt, M = this.motors;
    var q = [M.yaw.q, M.roll.q, M.pitch.q], qd = [M.yaw.qd, M.roll.qd, M.pitch.qd], qdd = [M.yaw.qdd, M.roll.qdd, M.pitch.qdd];
    var zyx = cfg.kinematics === 'ZYX';
    var Rj = zyx ? r.eulerZYX(M.yaw.q, M.pitch.q, M.roll.q) : r.jointsR(q[0], q[1], q[2]);
    var Rc = r.mul(this.Rb, Rj);
    var cam = r.toEulerZYX(Rc);
    var ref = this.refNow;
    var e = [r.wrapPi(ref[0] - cam[0]), r.wrapPi(ref[1] - cam[1]), r.wrapPi(ref[2] - cam[2])];
    // pose of the physical yaw-roll-pitch gimbal that realises the same camera orientation (3D view)
    var qVis;
    if (zyx) { var v = r.ikZXY(Rj); qVis = { yaw: v[0], roll: v[1], pitch: v[2] }; }
    else qVis = { yaw: M.yaw.q, pitch: M.pitch.q, roll: M.roll.q };
    var mc = cfg.motor, tauM, I, i;
    var qy = [M.yaw.q, M.pitch.q, M.roll.q];                                   // yaw, pitch, roll
    if (cfg.energyModel === 'simulink') {
      /* Simulink "current_calc": Q from gimbal_inverted (D*ACC + H + G), speeds and accelerations
       * from Derivative blocks of the motor positions, IMU = global camera angles;
       * per axis  I = 10 * |sat(Q, +-0.34 Nm)|  (10 A/Nm = 1/Kt, 0.34 Nm = holding torque),
       * charge = int I dt [A s], reported in the thesis tables as mAh = A s / 3.6. */
      var h = this.qHist, w, a;
      if (!h) { w = [0, 0, 0]; a = [0, 0, 0]; }
      else { w = qy.map(function (v, k) { return (v - h.q[k]) / dt; }); a = w.map(function (v, k) { return (v - h.w[k]) / dt; }); }
      this.qHist = { q: qy, w: w };
      tauM = this.tdyn.torques(qy, w, a, cam);
      I = tauM.map(function (tq) { var ts = Math.max(-mc.holdTorque, Math.min(mc.holdTorque, tq)); return Math.abs(ts) / mc.Kt; });
    } else {
      // inverse dynamics -> torques (chain order yaw, roll, pitch)
      var tau = this.dyn.torques(q, qd, qdd, this.Rb, this.wf, this.af);
      tauM = [tau[0] + mc.viscous * qd[0], tau[2] + mc.viscous * qd[2], tau[1] + mc.viscous * qd[1]];  // yaw, pitch, roll
      I = tauM.map(function (tq, k) { return Math.min(mc.Imax, mc.I0[k] + Math.abs(tq) / mc.Kt); });
    }
    var first = this.state === null;
    if (!first) {
      for (i = 0; i < 3; i++) { this.mAhAxis[i] += I[i] * dt / 3.6; var em = req[i] - qy[i]; this.intSq[i] += em * em * dt; }
      this.mAh = this.mAhAxis[0] + this.mAhAxis[1] + this.mAhAxis[2];
      if (this.t >= cfg.mseSkip) {
        for (i = 0; i < 3; i++) { var ed = e[i] * R2D; this.sumSq[i] += ed * ed; this.maxErr[i] = Math.max(this.maxErr[i], Math.abs(ed)); }
        this.nSq++;
      }
    }
    var mse = this.nSq ? this.sumSq.map(function (s) { return s / this.nSq; }, this) : [0, 0, 0];
    this.state = {
      t: this.t, base: this.base.slice(), ref: ref.slice(), cam: cam, err: e, req: req,
      q: { yaw: M.yaw.q, pitch: M.pitch.q, roll: M.roll.q }, qVis: qVis, J: this.intSq.slice(),
      qd: [M.yaw.qd, M.pitch.qd, M.roll.qd], u: u, tau: tauM, I: I, mAh: this.mAh, mse: mse, Rb: this.Rb, Rc: Rc,
      sat: [M.yaw.saturated, M.pitch.saturated, M.roll.saturated], rl: [M.yaw.rateLimited, M.pitch.rateLimited, M.roll.rateLimited]
    };
    if (record) {
      var b = this.base;
      this.rec.push({
        t: this.t,
        bYaw: b[0] * R2D, bPitch: b[1] * R2D, bRoll: b[2] * R2D,
        rYaw: ref[0] * R2D, rPitch: ref[1] * R2D, rRoll: ref[2] * R2D,
        cYaw: cam[0] * R2D, cPitch: cam[1] * R2D, cRoll: cam[2] * R2D,
        eYaw: e[0] * R2D, ePitch: e[1] * R2D, eRoll: e[2] * R2D,
        nYaw: req[0] * R2D, nPitch: req[1] * R2D, nRoll: req[2] * R2D,
        mYaw: M.yaw.q * R2D, mPitch: M.pitch.q * R2D, mRoll: M.roll.q * R2D,
        uYaw: u[0] * R2D, uPitch: u[1] * R2D, uRoll: u[2] * R2D,
        wYaw: M.yaw.qd * R2D, wPitch: M.pitch.qd * R2D, wRoll: M.roll.qd * R2D,
        tYaw: tauM[0] * 1000, tPitch: tauM[1] * 1000, tRoll: tauM[2] * 1000,
        iYaw: I[0], iPitch: I[1], iRoll: I[2], iTot: I[0] + I[1] + I[2],
        mAh: this.mAh,
        mseYaw: mse[0], msePitch: mse[1], mseRoll: mse[2],
        jYaw: this.intSq[0], jPitch: this.intSq[1], jRoll: this.intSq[2]
      });
    }
  };
  // re-create controllers (new type or re-designed gains) without resetting the plant (bumpless switch)
  Simulation.prototype.rebuildControllers = function () {
    var cfg = this.cfg, self = this;
    GS.AXES.forEach(function (ax) {
      var m = self.motors[ax], type = cfg.hybrid ? cfg.axisController[ax] : cfg.controller;
      self.ctrlType[ax] = type;
      var ctx = { dt: cfg.dt, limit: m.limit, rateMax: m.rateMax, motorCfg: cfg.motor };
      var c = GS.CONTROLLERS[type].create(cfg.params[type], ctx);
      c.reset(m.q);
      self.ctrls[ax] = c;
    });
  };
  Simulation.prototype.rebuildDynamics = function () {
    var cfg = this.cfg, im = cfg.imbalance || [0, 0, 0];
    var extra = [im[0] / 1000, im[1] / 1000, im[2] / 1000]; extra.massScale = cfg.payloadScale || 1;
    this.dyn = new GS.Dynamics(cfg.plant, extra);
    this.tdyn = new GS.ThesisDynamics(cfg.plant, extra);
  };
  Simulation.prototype.metrics = function () {
    var mse = this.nSq ? this.sumSq.map(function (s) { return s / this.nSq; }, this) : [0, 0, 0];
    var n = Math.max(1, this.k);
    return {
      t: this.t, mse: mse, mseMean: (mse[0] + mse[1] + mse[2]) / 3,
      rmse: mse.map(Math.sqrt), maxErr: this.maxErr.slice(),
      mAh: this.mAh, mAhAxis: this.mAhAxis.slice(), J: this.intSq.slice(),
      As: this.mAh * 3.6,
      satPct: this.satCount.map(function (c) { return 100 * c / n; }),
      ratePct: this.rateCount.map(function (c) { return 100 * c / n; })
    };
  };
  // advance until time T (or source end); returns true if finished
  Simulation.prototype.advance = function (T) {
    var end = Math.min(T, this.source.duration);
    while (this.t + this.cfg.dt * 0.5 < end) this.step();
    return this.t + this.cfg.dt * 0.5 >= this.source.duration;
  };

  GS.CHANNELS = CHANNELS;
  GS.Recorder = Recorder;
  GS.Simulation = Simulation;
})(typeof window !== 'undefined' ? window : globalThis);
