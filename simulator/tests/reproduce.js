// Reproduce thesis tables 6-13 with the 'simulink' profile: node simulator/tests/reproduce.js [datasets] [controllers]
const GS = require('./load.js')([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
const ds = (process.argv[2] || '1,4,7').split(',').map(Number);
const ctrls = (process.argv[3] || 'lqg,pid,nlpid').split(',');
const NAME = { lqg: 'LQG', pid: 'PID', nlpid: 'NL PID', mpc: 'MPC' };
const T = GS.THESIS, f = (v, d = 2) => v.toFixed(d).padStart(9);
console.log('ctrl    ds |   E sim    E thesis |  Ey sim  thesis |  Ep sim  thesis |  Er sim  thesis |  Jyaw sim  thesis |  Jpitch sim thesis |  Jroll sim  thesis');
for (const c of ctrls) for (const d of ds) {
  const cfg = GS.defaultConfig(); const opts = GS.applyProfile(cfg, 'simulink'); cfg.controller = c; cfg.recordHz = 1;
  const src = new GS.Disturbance.DatasetSource(GS.Disturbance.decodeDataset(d), opts);
  const sim = new GS.Simulation(cfg, src); const t0 = Date.now(); sim.advance(src.duration); const m = sim.metrics();
  const n = NAME[c], i = d - 1;
  console.log(n.padEnd(7), String(d).padStart(2), '|', f(m.mAh), f(T.energy[n][i]), '|', f(m.mAhAxis[0]), f(T.energyYaw[n][i]), '|', f(m.mAhAxis[1]), f(T.energyPitch[n][i]), '|', f(m.mAhAxis[2]), f(T.energyRoll[n][i]),
    '|', f(m.J[0], 5), f(T.mseYaw[n][i], 5), '|', f(m.J[1], 5), f(T.msePitch[n][i], 5), '|', f(m.J[2], 3), f(T.mseRoll[n][i], 3), ` (${Date.now() - t0} ms)`);
}
