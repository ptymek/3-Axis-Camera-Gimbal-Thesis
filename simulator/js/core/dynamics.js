/*
 * dynamics.js — inverse dynamics of the 3-DOF gimbal, Q = D(q)q'' + H(q,q') + G(q) (eq. 2.12),
 * evaluated with the recursive Newton-Euler algorithm (equivalent to the Lagrange form used by
 * calculate_D/H/G_matrix.m), including the rotation of the stabiliser base (disturbance) and gravity.
 *
 * All three joint axes intersect in one point (the camera centre), which is the origin of every
 * link frame. Link data (mass, centre of mass, inertia tensor) come from table 5.
 * Motor torque -> current:  I = I0 + |Q + b*q'| / Kt  (Kt = 0.1 Nm/A, GB3510 datasheet).
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var r = GS.rot;

  function inertiaMatrix(I) {
    // symmetrise the (slightly asymmetric) CAD export
    var xy = (I.xy + I.yx) / 2, xz = (I.xz + I.zx) / 2, yz = (I.yz + I.zy) / 2;
    return [I.xx, xy, xz, xy, I.yy, yz, xz, yz, I.zz];
  }

  function Dynamics(plant, extraCom) {
    this.links = plant.links.map(function (l, i) {
      var com = l.com.slice();
      if (i === 2 && extraCom) { com[0] += extraCom[0]; com[1] += extraCom[1]; com[2] += extraCom[2]; }
      return { m: l.m * (i === 2 && extraCom && extraCom.massScale ? extraCom.massScale : 1), c: com, I: inertiaMatrix(l.I) };
    });
    this.g = plant.g;
  }

  /*
   * q, qd, qdd : joint [yaw, roll, pitch] (chain order)
   * Rb         : base rotation matrix (world <- base)
   * wb, ab     : base angular velocity / acceleration expressed in base frame
   * returns torques [tau_yaw, tau_roll, tau_pitch]
   */
  Dynamics.prototype.torques = function (q, qd, qdd, Rb, wb, ab) {
    var L = this.links;
    var R1 = r.Rz(q[0]), R2 = r.mul(R1, r.Rx(q[1])), R3 = r.mul(R2, r.Ry(q[2]));
    var z1 = [0, 0, 1], z2 = [R1[0], R1[3], R1[6]], z3 = [R2[1], R2[4], R2[7]];
    // origin acceleration: gravity trick (a0 = -g expressed in base frame, NED: g = +z)
    var gB = r.mv(r.T(Rb), [0, 0, this.g]);
    var a0 = r.scale(gB, -1);
    var Rs = [R1, R2, R3], zs = [z1, z2, z3];
    var w = wb, al = ab, ws = [], als = [];
    for (var i = 0; i < 3; i++) {
      var wn = r.add(w, r.scale(zs[i], qd[i]));
      var aln = r.add(r.add(al, r.cross(w, r.scale(zs[i], qd[i]))), r.scale(zs[i], qdd[i]));
      w = wn; al = aln; ws.push(w); als.push(al);
    }
    var n = [0, 0, 0], tau = [0, 0, 0];
    for (i = 2; i >= 0; i--) {
      var R = Rs[i], l = L[i];
      var c = r.mv(R, l.c);
      var Iw = r.mul(r.mul(R, l.I), r.T(R));
      var ac = r.add(r.add(a0, r.cross(als[i], c)), r.cross(ws[i], r.cross(ws[i], c)));
      var F = r.scale(ac, l.m);
      var Nc = r.add(r.mv(Iw, als[i]), r.cross(ws[i], r.mv(Iw, ws[i])));
      n = r.add(r.add(n, Nc), r.cross(c, F));
      tau[i] = r.dot(zs[i], n);
    }
    return tau;
  };

  GS.Dynamics = Dynamics;
})(typeof window !== 'undefined' ? window : globalThis);
