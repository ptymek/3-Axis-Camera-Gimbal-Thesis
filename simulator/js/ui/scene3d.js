/*
 * scene3d.js — Three.js model of the 3-axis GoPro gimbal.
 *
 * The model is built in the NED-like frame used by the simulation (x forward, y right, z down),
 * unit = 1 cm, and mapped to three.js (y up) by a single root rotation. All three motor axes
 * intersect in the camera centre (origin), as in the kinematic model (fig. 5):
 *   yaw motor   on the z axis, H1 = 90 mm above the camera
 *   roll motor  on the x axis, B1 = 67 mm behind the camera
 *   pitch motor on the y axis, L1 = 72 mm to the right of the camera
 * Layer 0: gimbal + helpers (orbit view).  Layer 1: outdoor world seen by the camera (POV inset).
 */
(function (root) {
  'use strict';
  var GS = root.GS = root.GS || {};
  var THREE = root.THREE;

  var COL = { yaw: 0x60a5fa, pitch: 0x4ade80, roll: 0xf87171, ghost: 0x34d399, fov: 0x38bdf8 };

  function std(color, metal, rough, extra) {
    var m = new THREE.MeshStandardMaterial(Object.assign({ color: color, metalness: metal, roughness: rough }, extra || {}));
    return m;
  }
  function roundedBox(sx, sy, sz, r, mat) {
    // rounded rectangle (x-y) extruded along z, bevelled
    r = Math.min(r, sx / 2 - 0.01, sy / 2 - 0.01);
    var s = new THREE.Shape(), x = -sx / 2, y = -sy / 2;
    s.moveTo(x + r, y); s.lineTo(x + sx - r, y); s.quadraticCurveTo(x + sx, y, x + sx, y + r);
    s.lineTo(x + sx, y + sy - r); s.quadraticCurveTo(x + sx, y + sy, x + sx - r, y + sy);
    s.lineTo(x + r, y + sy); s.quadraticCurveTo(x, y + sy, x, y + sy - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    var bev = Math.min(0.12, sz / 4);
    var g = new THREE.ExtrudeGeometry(s, { depth: sz - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 6 });
    g.translate(0, 0, -(sz - 2 * bev) / 2);
    var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  // box from min/max extents
  function slab(x0, x1, y0, y1, z0, z1, mat, r) {
    var sx = x1 - x0, sy = y1 - y0, sz = z1 - z0, m;
    // choose the thinnest dimension as extrusion axis for nice rounded edges
    if (r) {
      if (sz <= sx && sz <= sy) { m = roundedBox(sx, sy, sz, r, mat); }
      else if (sx <= sy && sx <= sz) { m = roundedBox(sz, sy, sx, r, mat); m.rotation.y = Math.PI / 2; }
      else { m = roundedBox(sx, sz, sy, r, mat); m.rotation.x = Math.PI / 2; }
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); m.castShadow = true; m.receiveShadow = true;
    }
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return m;
  }
  function cyl(axis, r0, r1, len, mat, seg) {
    var g = new THREE.CylinderGeometry(r0, r1, len, seg || 48);
    if (axis === 'x') g.rotateZ(-Math.PI / 2); else if (axis === 'z') g.rotateX(Math.PI / 2);
    var m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function axisVec(axis) { return axis === 'x' ? new THREE.Vector3(1, 0, 0) : axis === 'y' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1); }

  /* GB3510-style gimbal motor: stator (fixed to the previous link), rotor (moves with next link) */
  function makeMotor(axis, center, rotorDir, accent, M) {
    var a = axisVec(axis), stator = new THREE.Group(), rotor = new THREE.Group();
    var R = 2.1, hs = 0.85, hr = 0.9;
    function at(g, s) { g.position.copy(center).addScaledVector(a, s); return g; }
    // stator: base disc + fins
    stator.add(at(cyl(axis, R * 0.92, R * 0.95, hs * 0.55, M.motorDark), -rotorDir * hs * 0.72));
    stator.add(at(cyl(axis, R * 0.55, R * 0.55, hs * 0.5, M.alu), -rotorDir * hs * 0.3));
    // cooling slots / screws around the stator rim
    for (var i = 0; i < 12; i++) {
      var ang0 = i * Math.PI / 6, rad = new THREE.Vector3();
      if (axis === 'x') rad.set(0, Math.cos(ang0), Math.sin(ang0)); else if (axis === 'y') rad.set(Math.cos(ang0), 0, Math.sin(ang0)); else rad.set(Math.cos(ang0), Math.sin(ang0), 0);
      var slot = cyl(axis, 0.18, 0.18, hs * 0.62, M.alu, 10);
      at(slot, -rotorDir * hs * 0.72).position.addScaledVector(rad, R * 0.93);
      stator.add(slot);
    }
    var ring = at(cyl(axis, R * 1.0, R * 1.0, 0.12, std(accent, 0.2, 0.4, { emissive: accent, emissiveIntensity: 0.55 })), -rotorDir * 0.06);
    stator.add(ring);
    // rotor: bell with spokes, cap and index mark
    rotor.add(at(cyl(axis, R, R, hr * 0.8, M.motorBell), rotorDir * hr * 0.42));
    rotor.add(at(cyl(axis, R * 0.35, R * 0.35, 0.1, M.alu), rotorDir * (hr * 0.82 + 0.05)));
    var cap = at(cyl(axis, R * 0.82, R * 0.82, 0.08, M.motorDark), rotorDir * (hr * 0.82 + 0.02));
    rotor.add(cap);
    // index mark (shows rotation)
    var mark = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), std(0xffffff, 0.1, 0.5, { emissive: accent, emissiveIntensity: 0.8 }));
    var perp = axis === 'z' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, -1);
    if (axis === 'y') perp = new THREE.Vector3(1, 0, 0);
    mark.position.copy(center).addScaledVector(a, rotorDir * hr * 0.42).addScaledVector(perp, R * 1.0);
    rotor.add(mark);
    // screw holes on cap
    for (i = 0; i < 4; i++) {
      var ang = i * Math.PI / 2 + Math.PI / 4, hole = cyl(axis, 0.13, 0.13, 0.12, M.black, 12);
      var p = new THREE.Vector3();
      if (axis === 'x') p.set(0, Math.cos(ang), Math.sin(ang)); else if (axis === 'y') p.set(Math.cos(ang), 0, Math.sin(ang)); else p.set(Math.cos(ang), Math.sin(ang), 0);
      hole.position.copy(center).addScaledVector(a, rotorDir * (hr * 0.82 + 0.07)).addScaledVector(p, R * 0.58);
      rotor.add(hole);
    }
    return { stator: stator, rotor: rotor };
  }

  function makeCamera(M) {
    var g = new THREE.Group();
    var body = roundedBox(3.36, 6.23, 4.49, 0.5, M.camBody);
    // extrusion axis is z already (height 4.49 along z) — x depth, y width
    g.add(body);
    // grip texture bands
    g.add(slab(-1.2, 1.2, -3.13, -3.11, -1.9, 1.9, M.rubber));
    // lens bezel + glass
    g.add(slab(1.62, 2.02, 0.35, 2.85, -1.85, 0.65, M.camBezel, 0.3));
    g.add(cyl('x', 0.95, 1.0, 0.35, M.alu).translateX(2.12).translateY(1.6).translateZ(-0.6));
    var lens = cyl('x', 0.78, 0.78, 0.2, M.lens); lens.position.set(2.32, 1.6, -0.6); g.add(lens);
    var lensIn = cyl('x', 0.42, 0.42, 0.05, std(0x0b1a3a, 1, 0.05, { emissive: 0x1e3a8a, emissiveIntensity: 0.6 })); lensIn.position.set(2.43, 1.6, -0.6); g.add(lensIn);
    // front screen
    var fs = slab(1.66, 1.72, -2.7, -0.2, -1.7, 0.2, std(0x0a0f18, 0.3, 0.15, { emissive: 0x0b2a4a, emissiveIntensity: 0.9 })); g.add(fs);
    // rear touch screen
    g.add(slab(-1.74, -1.68, -2.7, 2.7, -1.85, 1.85, std(0x071018, 0.3, 0.1, { emissive: 0x0e3b52, emissiveIntensity: 0.6 })));
    // shutter button + LED
    var btn = cyl('z', 0.55, 0.55, 0.2, M.camBezel); btn.position.set(0.2, -1.8, -2.32); g.add(btn);
    var led = cyl('z', 0.1, 0.1, 0.06, std(0xff3b30, 0, 0.3, { emissive: 0xff2020, emissiveIntensity: 2 })); led.position.set(1.1, 2.4, -2.28); g.add(led);
    g.userData.led = led;
    return g;
  }

  function gradientSky(radius, top, mid, bottom) {
    var g = new THREE.SphereGeometry(radius, 48, 24), pos = g.attributes.position, cols = [];
    var ct = new THREE.Color(top), cm = new THREE.Color(mid), cb = new THREE.Color(bottom), c = new THREE.Color();
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / radius;       // three.js up
      if (y > 0) c.copy(cm).lerp(ct, Math.pow(y, 0.6)); else c.copy(cm).lerp(cb, Math.min(1, -y * 6));
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false }));
  }
  function groundTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var x = c.getContext('2d');
    x.fillStyle = '#3b4a3a'; x.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 2500; i++) { x.fillStyle = 'rgba(' + (40 + Math.random() * 40 | 0) + ',' + (60 + Math.random() * 40 | 0) + ',' + (40 + Math.random() * 30 | 0) + ',.35)'; x.fillRect(Math.random() * 512, Math.random() * 512, 3, 3); }
    x.strokeStyle = 'rgba(230,240,255,.35)'; x.lineWidth = 3;
    x.strokeRect(0, 0, 512, 512);
    x.strokeStyle = 'rgba(230,240,255,.12)'; x.lineWidth = 1;
    for (i = 64; i < 512; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function Scene3D(canvas, opts) {
    this.canvas = canvas; this.opts = opts || {};
    var r = this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(2, root.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.35;
    var scene = this.scene = new THREE.Scene();

    // environment map for metals
    var pm = new THREE.PMREMGenerator(r), env = new THREE.Scene();
    env.add(gradientSky(100, 0x9cc4ff, 0x404a5c, 0x0a0c10));
    var pan = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    pan.position.set(0, 60, -40); pan.lookAt(0, 0, 0); env.add(pan);
    var pan2 = pan.clone(); pan2.position.set(70, 20, 30); pan2.lookAt(0, 0, 0); pan2.material = new THREE.MeshBasicMaterial({ color: 0x88bbff, side: THREE.DoubleSide }); env.add(pan2);
    scene.environment = pm.fromScene(env, 0.04).texture;

    // lights (visible to both layers)
    var hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a303a, 1.1);
    var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(30, 60, 25);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    var sc = key.shadow.camera; sc.left = -25; sc.right = 25; sc.top = 25; sc.bottom = -25; sc.near = 1; sc.far = 200; key.shadow.bias = -0.0004;
    var rim = new THREE.DirectionalLight(0x7fb5ff, 0.9); rim.position.set(-40, 20, -30);
    [hemi, key, rim].forEach(function (l) { l.layers.enableAll(); scene.add(l); });

    // root: NED -> three (x_t = y_n, y_t = -z_n, z_t = -x_n)
    var rootG = this.root = new THREE.Group();
    rootG.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0, 1));
    scene.add(rootG);

    var M = this.M = {
      arm: std(0x3a4252, 0.75, 0.3), armEdge: std(0x3a4250, 0.8, 0.3),
      alu: std(0xb9c2cf, 1.0, 0.28), motorDark: std(0x15181d, 0.6, 0.45), motorBell: std(0x23272e, 0.85, 0.3),
      black: std(0x050608, 0.2, 0.8), rubber: std(0x111316, 0.0, 0.95),
      camBody: std(0x2b2f36, 0.2, 0.6), camBezel: std(0x2a2d33, 0.5, 0.4),
      lens: std(0x0d1526, 1.0, 0.04, { envMapIntensity: 1.6 }),
      damper: std(0xff7a1a, 0.0, 0.6), carbon: std(0x1b1f25, 0.3, 0.55), pcb: std(0x0f5132, 0.2, 0.6)
    };

    // ---------------- base (mount) ----------------
    var base = this.base = new THREE.Group(); rootG.add(base);
    base.add(slab(-4.6, 4.6, -4.6, 4.6, -10.55, -9.9, M.arm, 0.9));
    base.add(slab(-4.9, 4.9, -4.9, 4.9, -12.45, -11.85, M.carbon, 1.0));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) {
      var d = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 16), M.damper); d.position.set(3.4 * s[0], 3.4 * s[1], -11.2); d.castShadow = true; base.add(d);
    });
    // drone arm stubs for context
    for (var i = 0; i < 4; i++) {
      var arm = slab(4.5, 11, -0.6, 0.6, -12.35, -11.95, M.carbon, 0.3);
      var hold = new THREE.Group(); hold.rotation.z = Math.PI / 4 + i * Math.PI / 2; hold.add(arm); base.add(hold);
    }
    var yawM = makeMotor('z', new THREE.Vector3(0, 0, -9.0), 1, COL.yaw, M);
    base.add(yawM.stator);

    // ---------------- link 1: yaw arm ----------------
    var yawG = this.yawG = new THREE.Group(); base.add(yawG);
    yawG.add(yawM.rotor);
    yawG.add(cyl('z', 2.2, 2.2, 0.5, M.arm).translateZ(-7.85));
    yawG.add(slab(-8.1, 0.8, -1.3, 1.3, -8.1, -7.6, M.arm, 0.4));
    yawG.add(slab(-8.1, -7.6, -1.3, 1.3, -8.1, 2.3, M.arm, 0.4));
    yawG.add(cyl('x', 2.2, 2.2, 0.5, M.arm).translateX(-7.85));
    var rollM = makeMotor('x', new THREE.Vector3(-6.7, 0, 0), 1, COL.roll, M);
    yawG.add(rollM.stator);

    // ---------------- link 2: roll arm ----------------
    var rollG = this.rollG = new THREE.Group(); yawG.add(rollG);
    rollG.add(rollM.rotor);
    rollG.add(cyl('x', 2.2, 2.2, 0.5, M.arm).translateX(-5.55));
    rollG.add(slab(-5.8, -5.3, -1.3, 8.1, -1.25, 1.25, M.arm, 0.4));
    rollG.add(slab(-5.8, 1.0, 7.6, 8.1, -1.25, 1.25, M.arm, 0.4));
    rollG.add(cyl('y', 2.2, 2.2, 0.5, M.arm).translateY(7.85));
    var pitchM = makeMotor('y', new THREE.Vector3(0, 6.4, 0), -1, COL.pitch, M);
    rollG.add(pitchM.stator);

    // ---------------- link 3: pitch cradle + GoPro ----------------
    var pitchG = this.pitchG = new THREE.Group(); rollG.add(pitchG);
    pitchG.add(pitchM.rotor);
    pitchG.add(cyl('y', 2.0, 2.0, 0.45, M.arm).translateY(5.3));
    pitchG.add(slab(-1.7, 1.7, 4.9, 5.4, -1.5, 3.0, M.arm, 0.35));
    pitchG.add(slab(-1.7, 1.7, -3.7, 5.4, 2.45, 2.95, M.arm, 0.35));
    pitchG.add(slab(-1.0, 1.0, -3.75, -3.3, 1.3, 2.95, M.armEdge, 0.2));
    pitchG.add(slab(-1.2, 0.6, -1.5, 1.5, 2.95, 3.25, M.pcb));                   // IMU board
    var cam = this.cam = makeCamera(M); pitchG.add(cam);

    // camera field of view (GoPro wide)
    var fovG = this.fovG = new THREE.Group();
    var L = 16, hw = L * Math.tan(118 / 2 * Math.PI / 180) * 0.55, hh = hw * 9 / 16, o = new THREE.Vector3(2.4, 1.6, -0.6);
    var pts = [], corners = [[L, -hw, -hh], [L, hw, -hh], [L, hw, hh], [L, -hw, hh]].map(function (c) { return new THREE.Vector3(o.x + c[0], o.y + c[1], o.z + c[2]); });
    corners.forEach(function (c, k) { pts.push(o, c, c, corners[(k + 1) % 4]); });
    var fg = new THREE.BufferGeometry().setFromPoints(pts);
    fovG.add(new THREE.LineSegments(fg, new THREE.LineBasicMaterial({ color: COL.fov, transparent: true, opacity: 0.55 })));
    var fplane = new THREE.Mesh(new THREE.PlaneGeometry(2 * hh, 2 * hw), new THREE.MeshBasicMaterial({ color: COL.fov, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }));
    fplane.rotation.y = Math.PI / 2; fplane.position.set(o.x + L, o.y, o.z); fovG.add(fplane);
    pitchG.add(fovG);

    // joint axes (dashed) and camera triad
    var axesG = this.axesG = new THREE.Group();
    function dashed(a, b, color, parent) {
      var g = new THREE.BufferGeometry().setFromPoints([a, b]);
      var l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: color, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.8 }));
      l.computeLineDistances(); parent.add(l); return l;
    }
    this.axisLines = [
      dashed(new THREE.Vector3(0, 0, -14), new THREE.Vector3(0, 0, 8), COL.yaw, base),
      dashed(new THREE.Vector3(-11, 0, 0), new THREE.Vector3(9, 0, 0), COL.roll, yawG),
      dashed(new THREE.Vector3(0, -8, 0), new THREE.Vector3(0, 11, 0), COL.pitch, rollG)
    ];
    var triad = new THREE.Group();
    triad.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 6, COL.roll, 0.8, 0.45));
    triad.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 4.5, COL.pitch, 0.8, 0.45));
    triad.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 4.5, COL.yaw, 0.8, 0.45));
    triad.traverse(function (o2) { if (o2.material) { o2.material.depthTest = false; o2.renderOrder = 10; } });
    pitchG.add(triad); this.triad = triad;
    void axesG; this.axisObjs = this.axisLines.concat([triad]);

    // reference (ghost) camera orientation
    var ghost = this.ghost = new THREE.Group();
    var gb = new THREE.Mesh(new THREE.BoxGeometry(3.36, 6.23, 4.49), new THREE.MeshBasicMaterial({ color: COL.ghost, transparent: true, opacity: 0.08, depthWrite: false }));
    ghost.add(gb);
    ghost.add(new THREE.LineSegments(new THREE.EdgesGeometry(gb.geometry), new THREE.LineBasicMaterial({ color: COL.ghost, transparent: true, opacity: 0.7 })));
    ghost.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(1.7, 0, 0), 12, COL.ghost, 1.0, 0.6));
    rootG.add(ghost);

    // horizon ring (world level)
    var hr = this.horizon = new THREE.Group();
    var ringG = new THREE.RingGeometry(12.5, 12.65, 128); ringG.rotateX(0);
    var ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0x9fb3c8, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
    hr.add(ring);
    for (i = 0; i < 36; i++) {
      var a2 = i * Math.PI / 18, len = i % 9 === 0 ? 1.6 : i % 3 === 0 ? 0.9 : 0.45;
      var tg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a2) * 12.6, Math.sin(a2) * 12.6, 0), new THREE.Vector3(Math.cos(a2) * (12.6 + len), Math.sin(a2) * (12.6 + len), 0)]);
      hr.add(new THREE.Line(tg, new THREE.LineBasicMaterial({ color: i === 0 ? 0x38bdf8 : 0x6b7c90, transparent: true, opacity: 0.7 })));
    }
    rootG.add(hr);

    // floor (shadow catcher + grid), layer 0
    var floorZ = 17;
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.35 }));
    shadow.position.z = floorZ; shadow.rotation.x = Math.PI; shadow.receiveShadow = true; rootG.add(shadow);
    var grid = new THREE.GridHelper(120, 60, 0x1f3347, 0x131c28); grid.rotation.x = Math.PI / 2; grid.position.z = floorZ - 0.01;
    grid.material.transparent = true; grid.material.opacity = 0.9; rootG.add(grid);
    var grid2 = new THREE.GridHelper(120, 12, 0x24425e, 0x24425e); grid2.rotation.x = Math.PI / 2; grid2.position.z = floorZ - 0.02; rootG.add(grid2);

    // ---------------- POV world (layer 1) ----------------
    var world = this.world = new THREE.Group(); rootG.add(world);
    var sky = gradientSky(40000, 0x3b82c4, 0xcfe2f3, 0x6f7f70); sky.rotation.x = -Math.PI / 2; world.add(sky);   // sky oriented to NED via root
    var groundM = new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 0.95, metalness: 0 });
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), groundM); ground.position.z = 150; ground.rotation.x = Math.PI; world.add(ground);
    var rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    var palette = [0xe2e8f0, 0x94a3b8, 0xf59e0b, 0x38bdf8, 0xef4444, 0x22c55e, 0xa78bfa];
    for (i = 0; i < 70; i++) {
      var ang = rnd() * Math.PI * 2, dist = 700 + rnd() * 5000, h = 150 + rnd() * 1400, w = 120 + rnd() * 500;
      var b = new THREE.Mesh(new THREE.BoxGeometry(w, w * (0.6 + rnd()), h), new THREE.MeshStandardMaterial({ color: palette[i % palette.length], roughness: 0.8, metalness: 0.1 }));
      b.position.set(Math.cos(ang) * dist, Math.sin(ang) * dist, 150 - h / 2); world.add(b);
    }
    // a few poles close by for parallax + marker in front (north)
    for (i = 0; i < 16; i++) {
      var pa = i * Math.PI / 8, pole = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 300, 12), new THREE.MeshStandardMaterial({ color: i === 0 ? 0xef4444 : 0xf8fafc, roughness: 0.5 }));
      pole.rotation.x = Math.PI / 2; pole.position.set(Math.cos(pa) * 420, Math.sin(pa) * 420, 0); world.add(pole);
    }
    var sun = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 12), new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: false }));
    sun.position.set(20000, -9000, -12000); world.add(sun);
    world.traverse(function (o3) { o3.layers.set(1); });

    // ---------------- cameras ----------------
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.5, 5000);
    this.camera.layers.set(0);
    this.povCam = new THREE.PerspectiveCamera(64, 16 / 9, 1, 80000);
    this.povCam.layers.set(1);
    var bx = new THREE.Vector3(0, 1, 0), by = new THREE.Vector3(0, 0, -1), bz = new THREE.Vector3(-1, 0, 0);
    this.povCam.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(bx, by, bz));
    this.povCam.position.set(2.5, 1.6, -0.6);
    pitchG.add(this.povCam);
    scene.fog = null;

    // orbit
    this.orbit = { target: new THREE.Vector3(-0.5, 3.2, 1.2), r: 46, th: 0.75, ph: 1.12 };
    this.setView('iso');
    this.bindInput();
    this.show = { pov: true };
    this._m4 = new THREE.Matrix4();
  }

  Scene3D.prototype.setView = function (v) {
    var o = this.orbit;
    if (v === 'iso') { o.th = -0.9; o.ph = 1.2; o.r = 46; }
    else if (v === 'front') { o.th = 0; o.ph = Math.PI / 2 - 0.05; o.r = 44; }
    else if (v === 'side') { o.th = Math.PI / 2; o.ph = Math.PI / 2 - 0.05; o.r = 44; }
    else if (v === 'top') { o.th = 0.001; o.ph = 0.08; o.r = 48; }
    this.updateCamera();
  };
  Scene3D.prototype.updateCamera = function () {
    var o = this.orbit, c = this.camera;
    // spherical around target (three.js coords): th around y, ph from +y; front = looking at camera lens (three -z is NED +x)
    c.position.set(o.target.x + o.r * Math.sin(o.ph) * Math.sin(o.th), o.target.y + o.r * Math.cos(o.ph), o.target.z - o.r * Math.sin(o.ph) * Math.cos(o.th));
    c.lookAt(o.target);
  };
  Scene3D.prototype.bindInput = function () {
    var self = this, el = this.canvas, drag = null;
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('pointerdown', function (e) {
      el.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, mode: e.shiftKey ? 'base' : (e.button === 2 || e.ctrlKey || e.metaKey) ? 'pan' : 'rot' };
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      var o = self.orbit;
      if (drag.mode === 'rot') { o.th -= dx * 0.008; o.ph = Math.max(0.05, Math.min(Math.PI - 0.05, o.ph - dy * 0.008)); }
      else if (drag.mode === 'pan') {
        var cam = self.camera, right = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrix, 1);
        var k = o.r * 0.0016; o.target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
      } else if (drag.mode === 'base' && self.opts.onBaseDrag) self.opts.onBaseDrag(dx, dy);
      self.updateCamera();
    });
    el.addEventListener('pointerup', function () { drag = null; });
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.orbit.r = Math.max(12, Math.min(260, self.orbit.r * Math.exp(e.deltaY * 0.001)));
      self.updateCamera();
    }, { passive: false });
  };
  function setQ(obj, R, m4) {
    m4.set(R[0], R[1], R[2], 0, R[3], R[4], R[5], 0, R[6], R[7], R[8], 0, 0, 0, 0, 1);
    obj.quaternion.setFromRotationMatrix(m4);
  }
  Scene3D.prototype.update = function (st) {
    if (!st) return;
    var m4 = this._m4;
    setQ(this.base, st.Rb, m4);
    var qv = st.qVis || st.q;       // equivalent yaw-roll-pitch pose (differs from motor angles for ZYX kinematics)
    this.yawG.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), qv.yaw);
    this.rollG.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), qv.roll);
    this.pitchG.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), qv.pitch);
    setQ(this.ghost, GS.rot.eulerZYX(st.ref[0], st.ref[1], st.ref[2]), m4);
    var led = this.cam.userData.led; if (led) led.visible = (Math.floor(st.t * 2) % 2) === 0;
  };
  Scene3D.prototype.setToggle = function (name, on) {
    if (name === 'axes') this.axisObjs.forEach(function (o) { o.visible = on; });
    else if (name === 'ghost') this.ghost.visible = on;
    else if (name === 'frustum') this.fovG.visible = on;
    else if (name === 'horizon') this.horizon.visible = on;
    else if (name === 'pov') this.show.pov = on;
  };
  Scene3D.prototype.render = function (povEl) {
    var r = this.renderer, cv = this.canvas, w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    var size = r.getSize(new THREE.Vector2());
    if (size.x !== w || size.y !== h) { r.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
    r.setScissorTest(false); r.setViewport(0, 0, w, h); r.clear();
    r.render(this.scene, this.camera);
    if (this.show.pov && povEl) {
      var cr = cv.getBoundingClientRect(), pr = povEl.getBoundingClientRect();
      var x = pr.left - cr.left, y = cr.bottom - pr.bottom, pw = pr.width, ph = pr.height;
      if (pw > 10 && ph > 10) {
        this.povCam.aspect = pw / ph; this.povCam.updateProjectionMatrix();
        r.setScissorTest(true); r.setScissor(x, y, pw, ph); r.setViewport(x, y, pw, ph);
        r.setClearColor(0x000000, 1); r.clear();
        r.render(this.scene, this.povCam);
        r.setScissorTest(false); r.setClearColor(0x000000, 0);
      }
    }
  };

  GS.Scene3D = Scene3D;
})(typeof window !== 'undefined' ? window : globalThis);
