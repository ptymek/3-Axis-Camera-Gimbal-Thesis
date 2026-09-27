// Loads the browser core scripts into a Node context (no DOM required).
const fs = require('fs'), path = require('path'), vm = require('vm');
module.exports = function load(withData) {
  const ctx = { console, Buffer, Math, Float64Array, Float32Array, Int16Array, Uint8Array };
  ctx.globalThis = ctx; vm.createContext(ctx);
  const dir = path.join(__dirname, '..', 'js', 'core');
  ['linalg', 'params', 'motor', 'controllers', 'thesis_dynamics', 'dynamics', 'disturbance', 'engine'].forEach(f =>
    vm.runInContext(fs.readFileSync(path.join(dir, f + '.js'), 'utf8'), ctx, { filename: f + '.js' }));
  (withData || []).forEach(id => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', `disturbance_${id}.js`), 'utf8').replace('window.GIMBAL_DATA', 'globalThis.GIMBAL_DATA').replace('window.GIMBAL_DATA', 'globalThis.GIMBAL_DATA'), ctx));
  return ctx.GS;
};
