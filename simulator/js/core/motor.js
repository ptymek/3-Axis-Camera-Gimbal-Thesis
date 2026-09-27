/*
 * motor.js — simplified BLDC positioning motor (thesis ch. 2.3, fig. 13):
 * position command -> saturation (mechanical range) -> rate limiter (nominal speed)
 * -> two series first-order lags 1/((T1 s+1)(T2 s+1)).
 *
 * State-space realisation reproduces MATLAB ssdata(tf(1,[T1 1])*tf(1,[T2 1])):
 *   A = [-a1  -a0/512; 512 0],  B = [32; 0],  C = [0  a0/(32*512)]
 * which for T1 = 0.002, T2 = 0.0015 gives the matrices printed in ch. 5.3:
 *   A = 1e3*[-1.1667 -0.6510; 0.5120 0], B = [32 0]', C = [0 20.3451].
 *
 * Two plant variants:
 *   rateAfter = false  (thesis text, fig. 13): saturation -> rate limiter -> lags
 *   rateAfter = true   (src/models/*.slx, "*_position_dynamics"): 1/(0.0002s+1) -> 1/(0.0015s+1)
 *                      -> Rate Limiter 18.5 rad/s -> Saturation (pitch +-2.35, roll +-0.78 rad)
 * The design model used by LQG / MPC always stays T1, T2 (calculate_I_matrix.m).
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var la = GS.la;

  function motorSS(T1, T2) {
    var a1 = (T1 + T2) / (T1 * T2), a0 = 1 / (T1 * T2);
    return {
      A: [[-a1, -a0 / 512], [512, 0]],
      B: [[32], [0]],
      C: [[0, a0 / (32 * 512)]],
      D: [[0]]
    };
  }

  function Motor(cfg, limitRad, dt) {
    this.ss = motorSS(cfg.plantT1 || cfg.T1, cfg.plantT2 || cfg.T2);
    this.dt = dt;
    var d = la.c2d(this.ss.A, this.ss.B, dt);
    this.Ad = d.Ad; this.Bd = d.Bd;
    this.rateMax = cfg.rateRad != null ? cfg.rateRad : cfg.nomRpm * Math.PI / 30;   // rad/s (560 rpm = 58.6 rad/s)
    this.rateAfter = !!cfg.rateAfter;
    this.limit = limitRad;                              // symmetric position limit
    this.c = this.ss.C[0][1];
    this.reset(0);
  }
  Motor.prototype.reset = function (q0) {
    // steady state at position q0: x2 = q0 / c, x1 = 0, rate limiter output = q0
    this.x1 = 0; this.x2 = (q0 || 0) / this.c; this.r = q0 || 0;
    this.q = q0 || 0; this.qd = 0; this.qdd = 0; this.saturated = false; this.rateLimited = false;
  };
  Motor.prototype.step = function (u) {
    if (this.rateAfter) return this.stepSimulink(u);
    var lim = this.limit, cmd = u;
    this.saturated = false;
    if (cmd > lim) { cmd = lim; this.saturated = true; } else if (cmd < -lim) { cmd = -lim; this.saturated = true; }
    var dr = cmd - this.r, maxd = this.rateMax * this.dt;
    this.rateLimited = Math.abs(dr) > maxd;
    if (dr > maxd) dr = maxd; else if (dr < -maxd) dr = -maxd;
    this.r += dr;
    var A = this.Ad, B = this.Bd, x1 = this.x1, x2 = this.x2, r = this.r;
    this.x1 = A[0][0] * x1 + A[0][1] * x2 + B[0][0] * r;
    this.x2 = A[1][0] * x1 + A[1][1] * x2 + B[1][0] * r;
    // continuous derivatives (exact: C*B = 0, so q'' = C A (A x + B r))
    var Ac = this.ss.A, Bc = this.ss.B;
    var dx1 = Ac[0][0] * this.x1 + Ac[0][1] * this.x2 + Bc[0][0] * r;
    var dx2 = Ac[1][0] * this.x1;
    var ddx2 = Ac[1][0] * dx1;
    this.q = this.c * this.x2;
    this.qd = this.c * dx2;
    this.qdd = this.c * ddx2;
    return this.q;
  };

  // Simulink variant: lags -> rate limiter -> saturation; derivatives by finite differences
  Motor.prototype.stepSimulink = function (u) {
    var A = this.Ad, B = this.Bd, x1 = this.x1, x2 = this.x2, dt = this.dt;
    this.x1 = A[0][0] * x1 + A[0][1] * x2 + B[0][0] * u;
    this.x2 = A[1][0] * x1 + A[1][1] * x2 + B[1][0] * u;
    var ylag = this.c * this.x2, dr = ylag - this.r, maxd = this.rateMax * dt;
    this.rateLimited = Math.abs(dr) > maxd;
    if (dr > maxd) dr = maxd; else if (dr < -maxd) dr = -maxd;
    this.r += dr;
    var q = this.r, lim = this.limit;
    this.saturated = false;
    if (q > lim) { q = lim; this.saturated = true; } else if (q < -lim) { q = -lim; this.saturated = true; }
    var qd = (q - this.q) / dt;
    this.qdd = (qd - this.qd) / dt; this.qd = qd; this.q = q;
    return q;
  };

  GS.motorSS = motorSS;
  GS.Motor = Motor;
})(typeof window !== 'undefined' ? window : globalThis);
