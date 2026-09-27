/*
 * widgets.js — UI building blocks: sliders, motor dials, KPI tiles, collapsible cards.
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var doc = root.document;

  function el(tag, attrs, html) {
    var e = doc.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (html != null) e.innerHTML = html;
    return e;
  }

  function decimals(step) { var s = String(step); return s.indexOf('e-') >= 0 ? +s.split('e-')[1] : (s.split('.')[1] || '').length; }

  /*
   * Slider with editable value. opts: {label, min, max, step, value, unit, log, onChange, onInput}
   * For log sliders the range input works on log10(value).
   */
  function Slider(container, opts) {
    this.o = opts;
    var wrap = this.el = el('div', { class: 'sl' });
    var head = el('div', { class: 'sl-head' });
    head.appendChild(el('span', null, opts.label));
    var val = this.valEl = el('span', { class: 'val', contenteditable: 'true', spellcheck: 'false' });
    head.appendChild(val);
    var inp = this.input = el('input', { type: 'range' });
    if (opts.log) { inp.min = Math.log10(opts.min); inp.max = Math.log10(opts.max); inp.step = 0.001; }
    else { inp.min = opts.min; inp.max = opts.max; inp.step = opts.step; }
    wrap.appendChild(head); wrap.appendChild(inp);
    container.appendChild(wrap);
    var self = this;
    this.set(opts.value, true);
    inp.addEventListener('input', function () {
      var v = opts.log ? Math.pow(10, +inp.value) : +inp.value;
      if (opts.log) v = +v.toPrecision(3);
      self.value = v; self.paint();
      if (opts.onInput) opts.onInput(v);
    });
    inp.addEventListener('change', function () { if (opts.onChange) opts.onChange(self.value); });
    val.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); val.blur(); } });
    val.addEventListener('blur', function () {
      var v = parseFloat(val.textContent.replace(',', '.'));
      if (isFinite(v)) { self.set(v); if (opts.onInput) opts.onInput(self.value); if (opts.onChange) opts.onChange(self.value); }
      else self.paint();
    });
  }
  Slider.prototype.set = function (v, silent) {
    var o = this.o;
    v = Math.max(o.min, Math.min(o.max, v));
    this.value = v;
    this.input.value = o.log ? Math.log10(v) : v;
    this.paint();
    void silent;
  };
  Slider.prototype.paint = function () {
    var o = this.o, v = this.value, txt;
    if (o.log) txt = Math.abs(v) >= 1000 || Math.abs(v) < 0.01 ? v.toExponential(2) : (+v.toPrecision(3)).toString();
    else txt = v.toFixed(Math.min(6, decimals(o.step)));
    if (doc.activeElement !== this.valEl) this.valEl.textContent = txt + (o.unit ? ' ' + o.unit : '');
    var p = (this.input.value - this.input.min) / (this.input.max - this.input.min) * 100;
    this.input.style.setProperty('--p', p + '%');
  };

  // build all <div class="slider" data-*> placeholders
  function buildSliders(scope, handlers) {
    var map = {};
    scope.querySelectorAll('.slider[data-id]').forEach(function (ph) {
      var d = ph.dataset, id = d.id;
      var s = new Slider(ph, {
        label: d.label, min: +d.min, max: +d.max, step: +d.step, value: +d.value, unit: d.unit || '',
        onInput: function (v) { if (handlers.input) handlers.input(id, v); },
        onChange: function (v) { if (handlers.change) handlers.change(id, v); }
      });
      ph.classList.remove('slider');
      map[id] = s;
    });
    return map;
  }

  function collapsibles(scope) {
    scope.querySelectorAll('[data-collapsible] > h3').forEach(function (h) {
      h.addEventListener('click', function (e) { if (e.target.closest('select,button,input')) return; h.parentElement.classList.toggle('collapsed'); });
    });
  }

  // ---------------------------------------------------------------- motor dial (SVG)
  var AX_COL = { yaw: '#60a5fa', pitch: '#4ade80', roll: '#f87171' };
  function Dial(container, axis, limitDeg) {
    this.axis = axis; this.limit = limitDeg;
    var d = this.el = el('div', { class: 'dial' });
    var ns = 'http://www.w3.org/2000/svg';
    var svg = doc.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '-50 -50 100 100');
    var c = AX_COL[axis];
    function mk(tag, attrs) { var e = doc.createElementNS(ns, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; }
    mk('circle', { r: 44, fill: '#0b0f15', stroke: '#1c2533', 'stroke-width': 1 });
    // limit arc
    if (limitDeg < 360) {
      var a0 = (-limitDeg - 90) * Math.PI / 180, a1 = (limitDeg - 90) * Math.PI / 180, large = limitDeg * 2 > 180 ? 1 : 0;
      mk('path', { d: 'M ' + 40 * Math.cos(a0) + ' ' + 40 * Math.sin(a0) + ' A 40 40 0 ' + large + ' 1 ' + 40 * Math.cos(a1) + ' ' + 40 * Math.sin(a1), fill: 'none', stroke: c, 'stroke-opacity': 0.25, 'stroke-width': 5 });
      [a0, a1].forEach(function (a) { mk('line', { x1: 34 * Math.cos(a), y1: 34 * Math.sin(a), x2: 46 * Math.cos(a), y2: 46 * Math.sin(a), stroke: '#fbbf24', 'stroke-width': 1.5 }); });
    } else mk('circle', { r: 40, fill: 'none', stroke: c, 'stroke-opacity': 0.25, 'stroke-width': 5 });
    for (var i = 0; i < 36; i++) {
      var a = i * 10 * Math.PI / 180, l = i % 9 === 0 ? 7 : i % 3 === 0 ? 4 : 2;
      mk('line', { x1: 44 * Math.cos(a), y1: 44 * Math.sin(a), x2: (44 - l) * Math.cos(a), y2: (44 - l) * Math.sin(a), stroke: '#3a4658', 'stroke-width': 1 });
    }
    this.req = mk('line', { x1: 0, y1: 0, x2: 0, y2: -38, stroke: '#e2e8f0', 'stroke-width': 1.3, 'stroke-dasharray': '3 2', 'stroke-opacity': 0.8 });
    this.needle = mk('line', { x1: 0, y1: 0, x2: 0, y2: -36, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' });
    mk('circle', { r: 4, fill: c });
    this.txt = mk('text', { x: 0, y: 20, 'text-anchor': 'middle', fill: '#d7e0ec', 'font-size': 10, 'font-family': 'JetBrains Mono, monospace' });
    d.appendChild(svg);
    var meta = this.meta = el('div', { class: 'meta' });
    d.appendChild(meta);
    container.appendChild(d);
  }
  Dial.prototype.update = function (qDeg, reqDeg, wDeg, curA, tauMNm, sat, rl) {
    var rot = function (e, a) { e.setAttribute('transform', 'rotate(' + a + ')'); };
    rot(this.needle, qDeg); rot(this.req, reqDeg);
    this.txt.textContent = qDeg.toFixed(1) + '°';
    var c = AX_COL[this.axis];
    this.meta.innerHTML =
      '<div class="name" style="color:' + c + '">' + this.axis.toUpperCase() + ' <span style="color:#5b6778;font-weight:500">±' + this.limit + '°</span></div>' +
      'zadana <b>' + reqDeg.toFixed(2) + '°</b><br>ω <b>' + wDeg.toFixed(1) + ' °/s</b><br>M <b>' + tauMNm.toFixed(1) + ' mNm</b><br>I <b>' + curA.toFixed(2) + ' A</b>' +
      '<div class="minibar"><div style="width:' + Math.min(100, curA / 3.4 * 100) + '%;background:' + c + '"></div></div>' +
      '<div class="flags"><span class="flag ' + (sat ? 'on-bad' : '') + '">SAT</span><span class="flag ' + (rl ? 'on-warn' : '') + '">RATE</span></div>';
  };

  GS.ui = { el: el, Slider: Slider, buildSliders: buildSliders, collapsibles: collapsibles, Dial: Dial, AX_COL: AX_COL };
})(typeof window !== 'undefined' ? window : globalThis);
