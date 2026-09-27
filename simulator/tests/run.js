// Core model tests: node simulator/tests/run.js
const assert = require('assert');
const load = require('./load.js');
const GS = load([1, 4]);
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test('motor state space matches thesis (ch. 5.3)', () => {
  const ss = GS.motorSS(0.002, 0.0015);
  close(ss.A[0][0], -1166.67, 0.01, 'A11'); close(ss.A[0][1], -651.04, 0.01, 'A12');
  close(ss.A[1][0], 512, 1e-9, 'A21'); close(ss.B[0][0], 32, 1e-9, 'B1'); close(ss.C[0][1], 20.3451, 1e-4, 'C2');
});

test('LQR gains, poles and Nx/Nu match thesis', () => {
  const cfg = GS.defaultConfig();
  const d = GS.designLQG(cfg.params.lqg, cfg.motor, cfg.dt);
  close(d.Kc[0], 0.0245, 2e-4, 'K1'); close(d.Kc[1], 0.0246, 2e-4, 'K2');
  const p = d.polesC.map(z => z.re).sort((a, b) => a - b);
  close(p[0], -667.39, 1, 'pole 1'); close(p[1], -500.06, 1, 'pole 2');
  close(d.Nx[0], 0, 1e-9, 'Nx1'); close(d.Nx[1], 0.0492, 1e-4, 'Nx2'); close(d.Nu, 1, 1e-9, 'Nu');
});

test('inverse kinematics inverts the joint chain', () => {
  const r = GS.rot;
  for (let i = 0; i < 200; i++) {
    const q = [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 3];
    const back = r.ikZXY(r.jointsR(q[0], q[1], q[2]));
    const R1 = r.jointsR(q[0], q[1], q[2]), R2 = r.jointsR(back[0], back[1], back[2]);
    R1.forEach((v, k) => close(v, R2[k], 1e-9, 'R'));
  }
});

test('camera holds reference orientation when base is tilted (static)', () => {
  const cfg = GS.defaultConfig();
  const src = new GS.Disturbance.SyntheticSource('manual', {});
  src.manual = [20, 10, -15]; src.manualF = [20, 10, -15];
  const sim = new GS.Simulation(cfg, src);
  sim.advance(0.5);
  const cam = sim.state.cam.map(v => v * GS.R2D);
  close(cam[0], 0, 1e-3, 'yaw'); close(cam[1], -45, 1e-3, 'pitch'); close(cam[2], 0, 1e-3, 'roll');
});

test('every controller stabilises all axes on a real dataset', () => {
  const ds = GS.Disturbance.decodeDataset(1);
  for (const c of GS.CONTROLLER_ORDER) {
    const cfg = GS.defaultConfig(); cfg.controller = c;
    const src = new GS.Disturbance.DatasetSource(ds, { map: { yaw: 'X', pitch: 'Y', roll: 'Z' }, sign: {}, unwrap: true, zero: true });
    const sim = new GS.Simulation(cfg, src);
    sim.advance(20);
    const m = sim.metrics();
    m.mse.forEach((v, i) => assert.ok(v < 0.01, `${c} axis ${i} MSE ${v}`));
    assert.ok(m.mAh > 0 && isFinite(m.mAh), `${c} energy`);
  }
});

test('MPC respects the motor rate constraint and position limits', () => {
  const cfg = GS.defaultConfig(), mc = cfg.motor, dt = cfg.dt, lim = 45 * GS.D2R;
  const m = new GS.Motor(mc, lim, dt);
  const c = GS.CONTROLLERS.mpc.create(cfg.params.mpc, { dt, limit: lim, rateMax: m.rateMax, motorCfg: mc });
  m.reset(0); c.reset(0);
  let prev = 0, maxDu = 0, maxU = 0;
  for (let k = 0; k < 400; k++) { const u = c.step(80 * GS.D2R, m.q); m.step(u); maxDu = Math.max(maxDu, Math.abs(u - prev)); maxU = Math.max(maxU, Math.abs(u)); prev = u; }
  assert.ok(maxU <= lim + 1e-9, 'position constraint');
  assert.ok(maxDu <= m.rateMax * c.Ts + 1e-6, 'rate constraint ' + maxDu);
  close(m.q, lim, 1e-3, 'settles at limit');
});

test('PID windup: large step overshoots more than LQG (rate limiter, ch. 5.2)', () => {
  const cfg = GS.defaultConfig(), mc = cfg.motor, dt = cfg.dt, lim = 135 * GS.D2R;
  function peak(type) {
    const m = new GS.Motor(mc, lim, dt), c = GS.CONTROLLERS[type].create(cfg.params[type], { dt, limit: lim, rateMax: m.rateMax, motorCfg: mc });
    m.reset(0); c.reset(0); let pk = 0;
    for (let k = 0; k < 600; k++) { m.step(c.step(60 * GS.D2R, m.q)); pk = Math.max(pk, m.q); }
    return pk * GS.R2D - 60;
  }
  assert.ok(peak('pid') > 5 && peak('lqg') < 0.5, 'overshoot pattern');
});

test('dataset decoding keeps thesis sample counts', () => {
  assert.strictEqual(GS.Disturbance.decodeDataset(1).n, 9652);
  assert.strictEqual(GS.Disturbance.decodeDataset(4).n, 5939);
});

test('dynamics: gravity torque on pitch vanishes for balanced camera and grows with imbalance', () => {
  const P = GS.defaultPlant(); P.links.forEach(l => { l.com = [0, 0, 0]; });
  const bal = new GS.Dynamics(P, null), unb = new GS.Dynamics(P, [0.01, 0, 0]);
  const I3 = GS.rot.eulerZYX(0, 0, 0), z = [0, 0, 0];
  close(bal.torques([0, 0, 0], z, z, I3, z, z)[2], 0, 1e-12, 'balanced');
  close(Math.abs(unb.torques([0, 0, 0], z, z, I3, z, z)[2]), 0.174 * 9.81 * 0.01, 1e-6, 'm g d');
});

test('Simulink profile reproduces thesis energy (tab. 6-9) and J roll (tab. 13) on dataset 1', () => {
  const T = GS.THESIS;
  for (const [c, n] of [['lqg', 'LQG'], ['pid', 'PID']]) {
    const cfg = GS.defaultConfig(); const opts = GS.applyProfile(cfg, 'simulink'); cfg.controller = c; cfg.recordHz = 1;
    const src = new GS.Disturbance.DatasetSource(GS.Disturbance.decodeDataset(1), opts);
    const sim = new GS.Simulation(cfg, src); sim.advance(src.duration); const m = sim.metrics();
    const rel = (a, b) => Math.abs(a - b) / b;
    assert.ok(rel(m.mAh, T.energy[n][0]) < 0.03, `${n} energy ${m.mAh} vs ${T.energy[n][0]}`);
    assert.ok(rel(m.mAhAxis[0], T.energyYaw[n][0]) < 0.03, `${n} yaw energy`);
    assert.ok(rel(m.mAhAxis[1], T.energyPitch[n][0]) < 0.03, `${n} pitch energy`);
    assert.ok(rel(m.mAhAxis[2], T.energyRoll[n][0]) < 0.03, `${n} roll energy`);
    assert.ok(rel(m.J[2], T.mseRoll[n][0]) < 0.01, `${n} J roll ${m.J[2]} vs ${T.mseRoll[n][0]}`);
  }
});

console.log(`\n${passed} tests passed`);
