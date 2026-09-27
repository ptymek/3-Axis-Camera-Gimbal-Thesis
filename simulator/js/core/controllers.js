/*
 * controllers.js — per-axis position controllers from the thesis (ch. 3 and 5):
 *   PID     u = kp [ e + 1/Ti * int(e) + Td * de/dt ]                      (3.1)
 *   NL PID  u = kp [ e|e| + 1/Ti * int(e) + Td * de/dt ]                   (3.2)
 *   LQG     LQR (u = -K x^ + (Nu + K Nx) r) + steady-state Kalman filter   (3.5, 3.28)
 *   MPC     state-space MPC with constraints on u, du (active-set QP)      (3.3, 3.4)
 *   DIRECT  no feedback (u = r), reference only
 * Each controller receives the required motor position r and the measured
 * motor position y and returns the new motor position command u (table 4).
 * Neural-network controllers (NARMA-L2, MRC) are intentionally not implemented.
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var la = GS.la;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // ------------------------------------------------------------------ PID / NL-PID
  function PID(p, ctx, nonlinear) {
    this.p = p; this.ctx = ctx; this.nl = !!nonlinear;
    this.reset(0);
  }
  PID.prototype.reset = function (y0) {
    this.i = y0 || 0;      // integral state (in output units), bumpless start at u = y0
    this.eprev = 0; this.df = 0; this.first = true; this.u = y0 || 0;
    this.terms = [0, 0, 0];
  };
  PID.prototype.step = function (r, y) {
    var p = this.p, dt = this.ctx.dt, e = r - y, kp = p.kp;
    var P;
    if (this.nl) {
      var e0 = p.e0 * Math.PI / 180, en = e / e0;       // e0: non-linearity threshold (|e| = e0 -> gain 1)
      P = kp * e0 * en * Math.abs(en);
    } else P = kp * e;
    // filtered derivative (first-order filter, N)
    var de = this.first ? 0 : (e - this.eprev) / dt;
    this.first = false; this.eprev = e;
    var Tf = p.Td > 0 ? p.Td / Math.max(1, p.N) : 0;
    this.df = Tf > 0 ? this.df + (dt / (Tf + dt)) * (de - this.df) : de;
    var D = kp * p.Td * this.df;
    var Iinc = p.Ti > 0 ? kp * dt / p.Ti * e : 0;
    var lim = this.ctx.limit * 1.02;
    var uUnsat = P + this.i + Iinc + D;
    // conditional integration anti-windup
    if (!(uUnsat > lim && e > 0) && !(uUnsat < -lim && e < 0)) this.i += Iinc;
    var u = clamp(P + this.i + D, -lim, lim);
    this.terms = [P, this.i, D];
    this.u = u;
    return u;
  };
  PID.prototype.info = function () {
    return { type: this.nl ? 'NL PID' : 'PID', kp: this.p.kp, Ti: this.p.Ti, Td: this.p.Td };
  };

  // ------------------------------------------------------------------ LQG
  function designLQG(p, motorCfg, dt) {
    var ss = GS.motorSS(motorCfg.T1, motorCfg.T2);
    var d = la.c2d(ss.A, ss.B, dt), Ad = d.Ad, Bd = d.Bd, C = ss.C;
    var Q = [[p.q1, 0], [0, p.q2]], R = [[p.r]];
    var lq = la.dare(Ad, Bd, Q, R), K = lq.K;                         // 1x2
    // continuous LQR (for comparison with the thesis K = [0.0245 0.0246])
    var Kc = null;
    try { Kc = lqrContinuous(ss.A, ss.B, Q, R); } catch (e) { Kc = null; }
    // Nx, Nu from [A B; C D]^-1 [0;0;1]  (eq. 3.27, continuous model as in regulator_lqr.m)
    var M = [[ss.A[0][0], ss.A[0][1], ss.B[0][0]], [ss.A[1][0], ss.A[1][1], ss.B[1][0]], [C[0][0], C[0][1], 0]];
    var N = la.mul(la.inv(M), [[0], [0], [1]]);
    var Nx = [N[0][0], N[1][0]], Nu = N[2][0];
    // Kalman filter: process noise through B (variance Qn), measurement noise Rn
    var Qw = la.add(la.scale(la.mul(Bd, la.T(Bd)), p.qn), [[1e-12, 0], [0, 1e-12]]);
    var kf = la.dare(la.T(Ad), la.T(C), Qw, [[p.rn]]);
    var P = kf.P;                                                          // a-priori covariance
    var S = la.mul(la.mul(C, P), la.T(C))[0][0] + p.rn;
    var Mk = [P[0][0] * C[0][0] / S + P[0][1] * C[0][1] / S, P[1][0] * C[0][0] / S + P[1][1] * C[0][1] / S];
    var Acl = la.sub(Ad, la.mul(Bd, K));
    var polesD = la.eig2(Acl);
    var polesC = polesD.map(function (z) {
      var mag = Math.hypot(z.re, z.im), ang = Math.atan2(z.im, z.re);
      return { re: Math.log(mag) / dt, im: ang / dt };
    });
    return { Ad: Ad, Bd: Bd, C: C, K: K[0], Kc: Kc, Nx: Nx, Nu: Nu, L: Mk, P: lq.P, polesC: polesC, ss: ss };
  }
  // continuous LQR via Hamiltonian-free iteration: discretise very finely and scale (sufficient for display)
  function lqrContinuous(A, B, Q, R) {
    var h = 1e-6, d = la.c2d(A, B, h);
    var r = la.dare(d.Ad, d.Bd, la.scale(Q, h), la.scale(R, h));
    return r.K[0];
  }

  function LQG(p, ctx) {
    this.p = p; this.ctx = ctx;
    this.design = designLQG(p, ctx.motorCfg, ctx.dt);
    this.reset(0);
  }
  LQG.prototype.reset = function (y0) {
    var c = this.design.C[0][1];
    this.xh = [0, (y0 || 0) / c];
    this.uPrev = y0 || 0; this.rl = y0 || 0; this.u = y0 || 0;
  };
  LQG.prototype.step = function (r, y) {
    var d = this.design, A = d.Ad, B = d.Bd, C = d.C[0];
    // estimator knows the motor rate limit (nominal speed) and range
    var lim = this.ctx.limit, maxd = this.ctx.rateMax * this.ctx.dt;
    var ua = clamp(this.uPrev, -lim, lim);
    this.rl += clamp(ua - this.rl, -maxd, maxd);
    // time update
    var x1 = A[0][0] * this.xh[0] + A[0][1] * this.xh[1] + B[0][0] * this.rl;
    var x2 = A[1][0] * this.xh[0] + A[1][1] * this.xh[1] + B[1][0] * this.rl;
    // measurement update
    var inn = y - (C[0] * x1 + C[1] * x2);
    x1 += d.L[0] * inn; x2 += d.L[1] * inn;
    this.xh[0] = x1; this.xh[1] = x2;
    var K = d.K;
    var u = -(K[0] * x1 + K[1] * x2) + (d.Nu + K[0] * d.Nx[0] + K[1] * d.Nx[1]) * r;
    u = clamp(u, -lim, lim);
    this.uPrev = u; this.u = u;
    return u;
  };
  LQG.prototype.info = function () { return this.design; };

  // ------------------------------------------------------------------ MPC
  function designMPC(p, motorCfg, Ts) {
    var ss = GS.motorSS(motorCfg.T1, motorCfg.T2);
    var d = la.c2d(ss.A, ss.B, Ts), A = d.Ad, B = d.Bd, C = ss.C;
    var N = p.N, Nu = Math.min(p.Nu, N);
    // step-response coefficients S_k = sum_{j<k} C A^j B and free-response rows C A^p
    var S = [0], Fx = [], Ap = la.eye(2), acc = 0;
    for (var k = 1; k <= N; k++) {
      acc += la.mul(la.mul(C, Ap), B)[0][0];
      S.push(acc);
      Ap = la.mul(Ap, A);
      Fx.push(la.mul(C, Ap)[0]);
    }
    var Phi = la.zeros(N, Nu);
    for (k = 1; k <= N; k++) for (var i = 0; i < Nu; i++) if (k > i) Phi[k - 1][i] = S[k - i];
    var PhiT = la.T(Phi);
    var H = la.add(la.scale(la.mul(PhiT, Phi), 2 * p.wy), la.scale(la.eye(Nu), 2 * p.lambda));
    var Hinv = la.inv(H);
    // constraints  M dU <= gamma : [I; -I; L; -L]
    var M = [];
    for (i = 0; i < Nu; i++) { var row = new Array(Nu).fill(0); row[i] = 1; M.push(row); }
    for (i = 0; i < Nu; i++) { row = new Array(Nu).fill(0); row[i] = -1; M.push(row); }
    for (i = 0; i < Nu; i++) { row = new Array(Nu).fill(0); for (var j = 0; j <= i; j++) row[j] = 1; M.push(row); }
    for (i = 0; i < Nu; i++) { row = new Array(Nu).fill(0); for (j = 0; j <= i; j++) row[j] = -1; M.push(row); }
    return { A: A, B: B, C: C, N: N, Nu: Nu, S: S, Fx: Fx, Phi: Phi, PhiT: PhiT, H: H, Hinv: Hinv, M: M, Ts: Ts };
  }

  function MPC(p, ctx) {
    this.p = p; this.ctx = ctx;
    this.div = Math.max(1, Math.round(p.Ts / ctx.dt));
    this.Ts = this.div * ctx.dt;
    this.design = designMPC(p, ctx.motorCfg, this.Ts);
    this.stats = { qp: 0, active: 0, iters: 0 };
    this.reset(0);
  }
  MPC.prototype.reset = function (y0) {
    var c = this.design.C[0][1];
    this.xm = [0, (y0 || 0) / c]; this.u = y0 || 0; this.k = 0; this.rl = y0 || 0;
    this.lastDU = null;
  };
  MPC.prototype.step = function (r, y) {
    if (this.k++ % this.div !== 0) return this.u;          // zero-order hold between MPC samples
    var d = this.design, p = this.p, Nu = d.Nu, N = d.N;
    var lim = this.ctx.limit, delta = this.ctx.rateMax * this.Ts;
    // internal model (open loop) driven by the rate-limited applied input + output disturbance estimate
    var A = d.A, B = d.B, C = d.C[0];
    var dist = y - (C[0] * this.xm[0] + C[1] * this.xm[1]);
    var x0 = this.xm[0], x1 = this.xm[1], u1 = this.u;
    // f = -2 wy Phi' (R - Fx x - S u(-1) - d)
    var f = new Array(Nu).fill(0);
    for (var k = 0; k < N; k++) {
      var free = d.Fx[k][0] * x0 + d.Fx[k][1] * x1 + d.S[k + 1] * u1 + dist;
      var err = r - free;
      for (var i = 0; i < Nu; i++) f[i] += -2 * p.wy * d.Phi[k][i] * err;
    }
    // unconstrained solution
    var du = new Array(Nu).fill(0);
    for (i = 0; i < Nu; i++) { var s = 0; for (var j = 0; j < Nu; j++) s -= d.Hinv[i][j] * f[j]; du[i] = s; }
    // constraint vector
    var gamma = [];
    for (i = 0; i < Nu; i++) gamma.push(p.rateConstraint ? delta : 1e9);
    for (i = 0; i < Nu; i++) gamma.push(p.rateConstraint ? delta : 1e9);
    for (i = 0; i < Nu; i++) gamma.push(p.posConstraint ? lim - u1 : 1e9);
    for (i = 0; i < Nu; i++) gamma.push(p.posConstraint ? u1 + lim : 1e9);
    var viol = false;
    for (i = 0; i < d.M.length && !viol; i++) {
      s = 0; for (j = 0; j < Nu; j++) s += d.M[i][j] * du[j];
      if (s > gamma[i] + 1e-12) viol = true;
    }
    this.stats.qp++;
    if (viol) {
      this.stats.active++;
      du = activeSetQP(d.H, f, d.M, gamma, this.stats);
    }
    var du0 = p.rateConstraint ? clamp(du[0], -delta, delta) : du[0];
    var u = p.posConstraint ? clamp(u1 + du0, -lim, lim) : u1 + du0;
    // advance internal model with the input that the motor will actually follow
    this.rl += clamp(u - this.rl, -delta, delta);
    var n0 = A[0][0] * x0 + A[0][1] * x1 + B[0][0] * this.rl;
    var n1 = A[1][0] * x0 + A[1][1] * x1 + B[1][0] * this.rl;
    this.xm[0] = n0; this.xm[1] = n1;
    this.u = u; this.lastDU = du;
    return u;
  };
  MPC.prototype.info = function () { return this.design; };

  // dense linear solve with partial pivoting (small KKT systems)
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (k = 0; k < n; k++) {
      var p = k, best = Math.abs(A[k][k]);
      for (i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > best) { best = Math.abs(A[i][k]); p = i; }
      if (best < 1e-300) return null;
      var t = A[k]; A[k] = A[p]; A[p] = t; var tb = b[k]; b[k] = b[p]; b[p] = tb;
      for (i = k + 1; i < n; i++) {
        var fct = A[i][k] / A[k][k]; if (fct === 0) continue;
        for (j = k; j < n; j++) A[i][j] -= fct * A[k][j];
        b[i] -= fct * b[k];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }

  /*
   * Primal active-set QP:  min 0.5 x'Hx + f'x  s.t.  M x <= gamma, started from the feasible point x = 0
   * (du = 0 is always feasible because the previous input already satisfies the limits).
   */
  function activeSetQP(H, f, M, gamma, stats) {
    var n = f.length, m = M.length, x = new Array(n).fill(0), W = [], it, i, j;
    for (i = 0; i < m; i++) if (gamma[i] <= 1e-12) W.push(i);          // constraints active at x = 0
    for (it = 0; it < 100; it++) {
      var nw = W.length, sz = n + nw, sol = null;
      for (var attempt = 0; attempt < 2 && !sol; attempt++) {
        var K = [], rhs = [];
        for (i = 0; i < n; i++) {
          var row = new Array(sz).fill(0), g = f[i];
          for (j = 0; j < n; j++) { row[j] = H[i][j]; g += H[i][j] * x[j]; }
          for (j = 0; j < nw; j++) row[n + j] = M[W[j]][i];
          K.push(row); rhs.push(-g);
        }
        for (j = 0; j < nw; j++) {
          row = new Array(sz).fill(0);
          for (i = 0; i < n; i++) row[i] = M[W[j]][i];
          if (attempt) row[n + j] = -1e-12;                               // regularise only if singular
          K.push(row); rhs.push(0);
        }
        sol = solve(K, rhs);
        if (sol && !sol.every(isFinite)) sol = null;
      }
      if (!sol) break;
      var pnorm = 0;
      for (i = 0; i < n; i++) pnorm = Math.max(pnorm, Math.abs(sol[i]));
      if (pnorm < 1e-10) {
        var minL = 0, minJ = -1;
        for (j = 0; j < nw; j++) if (sol[n + j] < minL) { minL = sol[n + j]; minJ = j; }
        if (minJ < 0 || minL > -1e-10) break;                             // KKT satisfied
        W.splice(minJ, 1);
        continue;
      }
      var alpha = 1, block = -1;
      for (i = 0; i < m; i++) {
        if (W.indexOf(i) >= 0) continue;
        var ap = 0, ax = 0;
        for (j = 0; j < n; j++) { ap += M[i][j] * sol[j]; ax += M[i][j] * x[j]; }
        if (ap > 1e-14) { var tt = (gamma[i] - ax) / ap; if (tt < alpha) { alpha = Math.max(0, tt); block = i; } }
      }
      for (j = 0; j < n; j++) x[j] += alpha * sol[j];
      if (block >= 0) W.push(block);
    }
    stats.iters += it;
    return x;
  }

  // ------------------------------------------------------------------ direct
  function Direct(p, ctx) { this.ctx = ctx; this.u = 0; }
  Direct.prototype.reset = function (y0) { this.u = y0 || 0; };
  Direct.prototype.step = function (r) { this.u = clamp(r, -this.ctx.limit, this.ctx.limit); return this.u; };
  Direct.prototype.info = function () { return {}; };

  // ------------------------------------------------------------------ registry
  GS.CONTROLLERS = {
    pid: {
      label: 'PID', color: '#fbbf24', desc: 'Klasyczny regulator PID (baza porównawcza), nastawy metodą inżynierską.',
      params: [
        { key: 'kp', label: 'k_p', min: 0, max: 5, step: 0.01, def: 1.2 },
        { key: 'Ti', label: 'T_i [s]', min: 0.0005, max: 0.1, step: 0.0005, def: 0.004 },
        { key: 'Td', label: 'T_d [s]', min: 0, max: 0.005, step: 0.0001, def: 0.0005 },
        { key: 'N', label: 'N (filtr D)', min: 1, max: 100, step: 1, def: 10 }
      ],
      create: function (p, ctx) { return new PID(p, ctx, false); }
    },
    nlpid: {
      label: 'NL PID', color: '#fb7185', desc: 'Nieliniowy PID — uchyb w torze P podniesiony do kwadratu: e·|e| (wzór 3.2).',
      params: [
        { key: 'kp', label: 'k_p', min: 0, max: 5, step: 0.01, def: 1.2 },
        { key: 'Ti', label: 'T_i [s]', min: 0.0005, max: 0.1, step: 0.0005, def: 0.004 },
        { key: 'Td', label: 'T_d [s]', min: 0, max: 0.005, step: 0.0001, def: 0.0005 },
        { key: 'N', label: 'N (filtr D)', min: 1, max: 100, step: 1, def: 10 },
        { key: 'e0', label: 'ε₀ próg [°]', min: 0.05, max: 10, step: 0.05, def: 1 }
      ],
      create: function (p, ctx) { return new PID(p, ctx, true); }
    },
    lqg: {
      label: 'LQG', color: '#a78bfa', desc: 'LQR + filtr Kalmana, sprzężenie od estymaty stanu i wejście zadane Nx/Nu (wzór 3.28).',
      params: [
        { key: 'q1', label: 'Q₁₁', min: 1, max: 1e6, step: 1, def: 10000, log: true },
        { key: 'q2', label: 'Q₂₂', min: 1, max: 1e6, step: 1, def: 10000, log: true },
        { key: 'r', label: 'R', min: 1e-2, max: 1e6, step: 0.01, def: 10000, log: true },
        { key: 'qn', label: 'Kalman Q (proces)', min: 1, max: 1e6, step: 1, def: 30000, log: true },
        { key: 'rn', label: 'Kalman R (pomiar)', min: 1e-5, max: 10, step: 1e-5, def: 0.01, log: true }
      ],
      create: function (p, ctx) { return new LQG(p, ctx); }
    },
    mpc: {
      label: 'MPC', color: '#2dd4bf', desc: 'Regulator predykcyjny w przestrzeni stanu z ograniczeniami u i Δu, QP metodą zbioru aktywnego.',
      params: [
        { key: 'N', label: 'Horyzont predykcji N', min: 2, max: 60, step: 1, def: 20, int: true },
        { key: 'Nu', label: 'Horyzont sterowania Nu', min: 1, max: 10, step: 1, def: 3, int: true },
        { key: 'lambda', label: 'λ (kara Δu)', min: 1e-6, max: 10, step: 1e-6, def: 0.3, log: true },
        { key: 'wy', label: 'Waga wyjścia', min: 0.01, max: 100, step: 0.01, def: 1, log: true },
        { key: 'Ts', label: 'Okres próbkowania [s]', min: 0.001, max: 0.02, step: 0.001, def: 0.002 },
        { key: 'rateConstraint', label: 'Ograniczenie Δu', type: 'bool', def: true },
        { key: 'posConstraint', label: 'Ograniczenie u', type: 'bool', def: true }
      ],
      create: function (p, ctx) { return new MPC(p, ctx); }
    },
    direct: {
      label: 'Bez regulatora', color: '#94a3b8', desc: 'Sterowanie bezpośrednie u = zadana (brak sprzężenia zwrotnego) — punkt odniesienia.',
      params: [],
      create: function (p, ctx) { return new Direct(p, ctx); }
    }
  };
  GS.CONTROLLER_ORDER = ['pid', 'nlpid', 'lqg', 'mpc', 'direct'];
  GS.defaultControllerParams = function (type) {
    var o = {};
    GS.CONTROLLERS[type].params.forEach(function (d) { o[d.key] = d.def; });
    return o;
  };
  GS.designLQG = designLQG;
  GS.designMPC = designMPC;
})(typeof window !== 'undefined' ? window : globalThis);
