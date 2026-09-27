/*
 * linalg.js — small dense linear-algebra and rotation helpers.
 *
 * Conventions (same as the thesis kinematics, chapter 2.1 / 2.4):
 *   frames are NED-like: x forward (camera optical axis), y right, z down.
 *   Positive pitch = nose up, so "camera pointing 45 deg down" = pitch -45 deg.
 *   Camera global orientation / base disturbance: ZYX Euler (yaw, pitch, roll).
 *   Gimbal joint chain: R_joints = Rz(q_yaw) * Rx(q_roll) * Ry(q_pitch)
 *   (inverse kinematics eq. 2.33: th1 = atan2(-r12, r22), th2 = asin(r32),
 *    th3 = atan2(-r31, r33)).
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};

  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  // ---------- generic matrices (arrays of rows) ----------
  function zeros(n, m) {
    var a = new Array(n);
    for (var i = 0; i < n; i++) { a[i] = new Array(m); for (var j = 0; j < m; j++) a[i][j] = 0; }
    return a;
  }
  function eye(n) { var a = zeros(n, n); for (var i = 0; i < n; i++) a[i][i] = 1; return a; }
  function clone(A) { return A.map(function (r) { return r.slice(); }); }
  function mul(A, B) {
    var n = A.length, m = B[0].length, k = B.length, C = zeros(n, m);
    for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) {
      var s = 0; for (var l = 0; l < k; l++) s += A[i][l] * B[l][j]; C[i][j] = s;
    }
    return C;
  }
  function add(A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v + B[i][j]; }); }); }
  function sub(A, B) { return A.map(function (r, i) { return r.map(function (v, j) { return v - B[i][j]; }); }); }
  function scale(A, s) { return A.map(function (r) { return r.map(function (v) { return v * s; }); }); }
  function T(A) {
    var n = A.length, m = A[0].length, C = zeros(m, n);
    for (var i = 0; i < n; i++) for (var j = 0; j < m; j++) C[j][i] = A[i][j];
    return C;
  }
  function inv(A) {
    var n = A.length, M = A.map(function (r, i) { var e = new Array(n).fill(0); e[i] = 1; return r.concat(e); });
    for (var c = 0; c < n; c++) {
      var p = c, best = Math.abs(M[c][c]);
      for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > best) { best = Math.abs(M[r][c]); p = r; }
      if (best < 1e-300) throw new Error('singular matrix');
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      var d = M[c][c];
      for (var j = 0; j < 2 * n; j++) M[c][j] /= d;
      for (r = 0; r < n; r++) if (r !== c) {
        var f = M[r][c]; if (f === 0) continue;
        for (j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
      }
    }
    return M.map(function (r) { return r.slice(n); });
  }
  function norm1(A) {
    var m = 0;
    for (var j = 0; j < A[0].length; j++) { var s = 0; for (var i = 0; i < A.length; i++) s += Math.abs(A[i][j]); m = Math.max(m, s); }
    return m;
  }
  // matrix exponential: scaling & squaring + Taylor series
  function expm(A) {
    var n = A.length, s = Math.max(0, Math.ceil(Math.log2(norm1(A) + 1e-300)) + 1);
    var As = scale(A, 1 / Math.pow(2, s)), E = eye(n), term = eye(n);
    for (var k = 1; k <= 18; k++) { term = scale(mul(term, As), 1 / k); E = add(E, term); }
    for (var i = 0; i < s; i++) E = mul(E, E);
    return E;
  }
  // exact zero-order-hold discretisation of (A,B)
  function c2d(A, B, Ts) {
    var n = A.length, m = B[0].length, M = zeros(n + m, n + m);
    for (var i = 0; i < n; i++) { for (var j = 0; j < n; j++) M[i][j] = A[i][j] * Ts; for (j = 0; j < m; j++) M[i][n + j] = B[i][j] * Ts; }
    var E = expm(M);
    return {
      Ad: E.slice(0, n).map(function (r) { return r.slice(0, n); }),
      Bd: E.slice(0, n).map(function (r) { return r.slice(n); })
    };
  }
  // discrete algebraic Riccati equation (iterative), returns {P, K}
  // K = (R + B'PB)^-1 B'PA   (u = -K x)
  function dare(A, B, Q, R) {
    var P = clone(Q), At = T(A), Bt = T(B), K;
    for (var it = 0; it < 20000; it++) {
      var BtP = mul(Bt, P);
      var S = add(R, mul(BtP, B));
      K = mul(inv(S), mul(BtP, A));
      var Pn = add(Q, mul(mul(At, P), sub(A, mul(B, K))));
      var diff = 0, mag = 0;
      for (var i = 0; i < P.length; i++) for (var j = 0; j < P.length; j++) { diff = Math.max(diff, Math.abs(Pn[i][j] - P[i][j])); mag = Math.max(mag, Math.abs(Pn[i][j])); }
      P = Pn;
      if (diff <= 1e-12 * (1 + mag)) break;
    }
    return { P: P, K: K };
  }
  // eigenvalues of 2x2 (returns [{re,im},{re,im}])
  function eig2(A) {
    var tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    var disc = tr * tr / 4 - det;
    if (disc >= 0) { var s = Math.sqrt(disc); return [{ re: tr / 2 + s, im: 0 }, { re: tr / 2 - s, im: 0 }]; }
    var w = Math.sqrt(-disc); return [{ re: tr / 2, im: w }, { re: tr / 2, im: -w }];
  }

  // ---------- 3x3 rotations (flat row-major arrays of 9) ----------
  function m3(a, b, c, d, e, f, g, h, i) { return [a, b, c, d, e, f, g, h, i]; }
  function Rx(t) { var c = Math.cos(t), s = Math.sin(t); return m3(1, 0, 0, 0, c, -s, 0, s, c); }
  function Ry(t) { var c = Math.cos(t), s = Math.sin(t); return m3(c, 0, s, 0, 1, 0, -s, 0, c); }
  function Rz(t) { var c = Math.cos(t), s = Math.sin(t); return m3(c, -s, 0, s, c, 0, 0, 0, 1); }
  function m3mul(A, B) {
    return [
      A[0] * B[0] + A[1] * B[3] + A[2] * B[6], A[0] * B[1] + A[1] * B[4] + A[2] * B[7], A[0] * B[2] + A[1] * B[5] + A[2] * B[8],
      A[3] * B[0] + A[4] * B[3] + A[5] * B[6], A[3] * B[1] + A[4] * B[4] + A[5] * B[7], A[3] * B[2] + A[4] * B[5] + A[5] * B[8],
      A[6] * B[0] + A[7] * B[3] + A[8] * B[6], A[6] * B[1] + A[7] * B[4] + A[8] * B[7], A[6] * B[2] + A[7] * B[5] + A[8] * B[8]
    ];
  }
  function m3T(A) { return [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]]; }
  function m3v(A, v) { return [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function vadd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function vscale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }

  // ZYX Euler (yaw, pitch, roll) -> R = Rz(y) Ry(p) Rx(r)
  function eulerZYX(y, p, r) { return m3mul(Rz(y), m3mul(Ry(p), Rx(r))); }
  function toEulerZYX(R) {
    var sp = -R[6]; sp = Math.max(-1, Math.min(1, sp));
    return [Math.atan2(R[3], R[0]), Math.asin(sp), Math.atan2(R[7], R[8])];
  }
  // joint chain Rz(q1) Rx(q2) Ry(q3); q = [yaw, roll, pitch]
  function jointsR(qYaw, qRoll, qPitch) { return m3mul(Rz(qYaw), m3mul(Rx(qRoll), Ry(qPitch))); }
  // inverse kinematics (thesis eq. 2.32-2.33) -> [yaw, roll, pitch]
  function ikZXY(R) {
    var s = Math.max(-1, Math.min(1, R[7]));
    return [Math.atan2(-R[1], R[4]), Math.asin(s), Math.atan2(-R[6], R[8])];
  }
  // rotation vector of R (axis * angle)
  function logSO3(R) {
    var c = (R[0] + R[4] + R[8] - 1) / 2; c = Math.max(-1, Math.min(1, c));
    var th = Math.acos(c);
    var v = [R[7] - R[5], R[2] - R[6], R[3] - R[1]];
    if (th < 1e-9) return vscale(v, 0.5);
    return vscale(v, th / (2 * Math.sin(th)));
  }
  function wrapPi(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  GS.D2R = D2R; GS.R2D = R2D;
  GS.la = {
    zeros: zeros, eye: eye, clone: clone, mul: mul, add: add, sub: sub, scale: scale, T: T, inv: inv,
    expm: expm, c2d: c2d, dare: dare, eig2: eig2
  };
  GS.rot = {
    Rx: Rx, Ry: Ry, Rz: Rz, mul: m3mul, T: m3T, mv: m3v, cross: cross, dot: dot, add: vadd, scale: vscale,
    eulerZYX: eulerZYX, toEulerZYX: toEulerZYX, jointsR: jointsR, ikZXY: ikZXY, logSO3: logSO3,
    wrapPi: wrapPi, clamp: clamp
  };
})(typeof window !== 'undefined' ? window : globalThis);
