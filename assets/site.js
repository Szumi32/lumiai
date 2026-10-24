/* =========================================================
   LumiAI — skrypt strony
   1. narzędzia i wspólne rendery (oko, miasto nocą)
   2. loader, nagłówek, menu
   3. sceny przewijania: hero (wlot w oko), soczewka 3D, glob
   4. odsłanianie, liczniki, magnetyczne przyciski
   5. interaktywne sekcje: demo, konfigurator, kalendarz, pomysły, FAQ, formularz
   ========================================================= */
window.__lumi = true;
(function () {
  'use strict';
  var $ = function (q, c) { return (c || document).querySelector(q); };
  var $$ = function (q, c) { return [].slice.call((c || document).querySelectorAll(q)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); };
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  var VW = innerWidth, VH = innerHeight;

  /* ---------- tekstura szumu (ziarno filmu, skóra) ---------- */
  var noiseCv = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 180;
    var x = c.getContext('2d'), d = x.createImageData(180, 180), r = rng(3);
    for (var i = 0; i < d.data.length; i += 4) { var v = (r() * 255) | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return c;
  })();
  try { var nURL = noiseCv.toDataURL('image/png'); $$('.grain,.fx-grain').forEach(function (g) { g.style.backgroundImage = 'url(' + nURL + ')'; }); } catch (e) {}

  /* =========================================================
     OKO — proceduralny render makro (tęczówka, powieki, rzęsy, soczewka)
     ========================================================= */
  function irisTexture(seed) {
    var S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    var x = c.getContext('2d'), r = rng(seed), C = S / 2, R = S / 2 - 2, i;
    var g = x.createRadialGradient(C, C, R * .18, C, C, R);
    g.addColorStop(0, '#4a3218'); g.addColorStop(.32, '#8c6631'); g.addColorStop(.44, '#6e6a49'); g.addColorStop(.6, '#3e6a6c'); g.addColorStop(.84, '#25474e'); g.addColorStop(1, '#0c171a');
    x.fillStyle = g; x.beginPath(); x.arc(C, C, R, 0, 7); x.fill();
    x.save(); x.beginPath(); x.arc(C, C, R, 0, 7); x.clip();
    var cols = ['218,178,108', '236,210,156', '146,190,184', '92,142,142', '40,72,76', '184,142,82', '250,236,204', '120,170,168'];
    for (i = 0; i < 3000; i++) {
      var a = r() * Math.PI * 2, r0 = R * (.3 + r() * .14), r1 = R * (.6 + r() * .4), bend = (r() - .5) * .2;
      x.strokeStyle = 'rgba(' + cols[(r() * cols.length) | 0] + ',' + (.04 + r() * .2).toFixed(3) + ')';
      x.lineWidth = .5 + r() * 1.7; x.beginPath();
      x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
      var rm = (r0 + r1) / 2, am = a + bend;
      x.quadraticCurveTo(C + Math.cos(am) * rm, C + Math.sin(am) * rm, C + Math.cos(a + bend * .4) * r1, C + Math.sin(a + bend * .4) * r1);
      x.stroke();
    }
    x.lineWidth = R * .028; x.strokeStyle = 'rgba(226,182,108,.32)'; x.beginPath();
    for (i = 0; i <= 360; i++) { var a2 = i / 360 * Math.PI * 2, rr = R * (.5 + .035 * Math.sin(a2 * 13) + .018 * Math.sin(a2 * 31 + 1)); if (i) x.lineTo(C + Math.cos(a2) * rr, C + Math.sin(a2) * rr); else x.moveTo(C + Math.cos(a2) * rr, C + Math.sin(a2) * rr); }
    x.closePath(); x.stroke();
    for (i = 0; i < 80; i++) { var a3 = r() * 7, r3 = R * (.52 + r() * .32); x.fillStyle = 'rgba(8,18,20,' + (.12 + r() * .25).toFixed(2) + ')'; x.beginPath(); x.ellipse(C + Math.cos(a3) * r3, C + Math.sin(a3) * r3, R * (.008 + r() * .02), R * (.02 + r() * .05), a3, 0, 7); x.fill(); }
    for (i = 0; i < 700; i++) { var a4 = r() * 7, r4 = R * (.3 + r() * .7); x.fillStyle = r() > .5 ? 'rgba(255,235,190,' + (r() * .18).toFixed(2) + ')' : 'rgba(0,0,0,' + (r() * .2).toFixed(2) + ')'; x.fillRect(C + Math.cos(a4) * r4, C + Math.sin(a4) * r4, 1.4, 1.4); }
    var g2 = x.createRadialGradient(C, C, R * .26, C, C, R * .62); g2.addColorStop(0, 'rgba(205,140,60,.55)'); g2.addColorStop(1, 'rgba(205,140,60,0)'); x.fillStyle = g2; x.fillRect(0, 0, S, S);
    var g3 = x.createRadialGradient(C, C, R * .74, C, C, R); g3.addColorStop(0, 'rgba(4,9,11,0)'); g3.addColorStop(.7, 'rgba(4,9,11,.5)'); g3.addColorStop(1, 'rgba(2,5,6,.96)'); x.fillStyle = g3; x.fillRect(0, 0, S, S);
    x.restore(); return c;
  }
  function bz(a, b, c, d, t) { var m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d; }
  function dbz(a, b, c, d, t) { var m = 1 - t; return 3 * m * m * (b - a) + 6 * m * t * (c - b) + 3 * t * t * (d - c); }

  function Eye(seed) {
    var r = rng(seed || 11), i; this.tex = irisTexture(seed || 11); this.lash = []; this.low = []; this.veins = [];
    for (i = 0; i < 140; i++) this.lash.push({ t: .05 + .92 * (i / 140) + (r() - .5) * .006, l: .6 + r() * .4, c: (r() - .5) * .3, w: .6 + r() * .7 });
    for (i = 0; i < 64; i++) this.low.push({ t: .14 + .78 * (i / 64) + (r() - .5) * .01, l: .4 + r() * .6, w: .5 + r() * .5 });
    for (i = 0; i < 9; i++) { var side = i % 2 ? 1 : -1, pts = [], x0 = side * (2.4 + r() * .2), y0 = (r() - .5) * .3; pts.push([x0, y0]); for (var k = 0; k < 6; k++) { x0 -= side * (.12 + r() * .14); y0 += (r() - .5) * .14; pts.push([x0, y0]); } this.veins.push(pts); }
    this.pat = null;
  }
  Eye.prototype.lids = function (open) {
    return {
      L: [-2.75, .1], R: [2.75, -.12],
      u1: [-1.35, lerp(.66, -1.4, open)], u2: [1.35, lerp(.62, -1.44, open)],
      d1: [-1.25, lerp(.8, 1.3, open)], d2: [1.4, lerp(.76, 1.24, open)]
    };
  };
  /* o: {x,y,R,open,pupil,gx,gy,lens(0-1 widoczność),draw(0-1 rysowanie obręczy),led(0-1),t,lashes} */
  Eye.prototype.draw = function (x, o) {
    var R = o.R, t = o.t || 0, Ld = this.lids(o.open), i;
    if (!this.pat) { try { this.pat = x.createPattern(noiseCv, 'repeat'); } catch (e) { this.pat = null; } }
    x.save(); x.translate(o.x, o.y);
    /* skóra wokół oka */
    var sk = x.createRadialGradient(-.5 * R, -.7 * R, R * .2, 0, 0, R * 4.8);
    sk.addColorStop(0, '#4b3428'); sk.addColorStop(.3, '#2d1f18'); sk.addColorStop(.65, '#15100d'); sk.addColorStop(1, 'rgba(11,12,14,0)');
    x.fillStyle = sk; x.fillRect(-R * 6, -R * 5, R * 12, R * 10);
    if (this.pat) { x.save(); x.globalAlpha = .07; x.fillStyle = this.pat; x.beginPath(); x.ellipse(0, 0, R * 4.4, R * 3.4, 0, 0, 7); x.fill(); x.restore(); }
    /* fałd powieki */
    [[.34, .06], [.18, .1], [.07, .16]].forEach(function (s) { x.strokeStyle = 'rgba(0,0,0,' + s[1] + ')'; x.lineWidth = R * s[0]; x.beginPath(); x.moveTo(-2.7 * R, -.25 * R); x.bezierCurveTo(-1.2 * R, -2.15 * R, 1.4 * R, -2.2 * R, 3 * R, -.45 * R); x.stroke(); });
    x.strokeStyle = 'rgba(255,214,186,.05)'; x.lineWidth = R * .5; x.beginPath(); x.moveTo(-2.4 * R, -1 * R); x.bezierCurveTo(-1 * R, -2.9 * R, 1.4 * R, -2.9 * R, 2.8 * R, -1.2 * R); x.stroke();
    function ap() { x.beginPath(); x.moveTo(Ld.L[0] * R, Ld.L[1] * R); x.bezierCurveTo(Ld.u1[0] * R, Ld.u1[1] * R, Ld.u2[0] * R, Ld.u2[1] * R, Ld.R[0] * R, Ld.R[1] * R); x.bezierCurveTo(Ld.d2[0] * R, Ld.d2[1] * R, Ld.d1[0] * R, Ld.d1[1] * R, Ld.L[0] * R, Ld.L[1] * R); x.closePath(); }
    x.save(); ap(); x.clip();
    /* białko */
    var gx = (o.gx || 0) * R, gy = (o.gy || 0) * R;
    var sc = x.createRadialGradient(gx * .3, gy * .3, R * .4, 0, 0, R * 3);
    sc.addColorStop(0, '#efe8de'); sc.addColorStop(.42, '#d9cdbd'); sc.addColorStop(.74, '#a69583'); sc.addColorStop(1, '#5a473b');
    x.fillStyle = sc; x.fillRect(-R * 3, -R * 2, R * 6, R * 4);
    x.strokeStyle = 'rgba(165,52,46,.16)'; x.lineWidth = R * .012;
    this.veins.forEach(function (p) { x.beginPath(); p.forEach(function (q, k) { if (k) x.lineTo(q[0] * R, q[1] * R); else x.moveTo(q[0] * R, q[1] * R); }); x.stroke(); });
    /* tęczówka + źrenica + soczewka */
    x.save(); x.translate(gx, gy);
    var ish = x.createRadialGradient(0, 0, R * .95, 0, 0, R * 1.25); ish.addColorStop(0, 'rgba(60,40,30,.35)'); ish.addColorStop(1, 'rgba(60,40,30,0)'); x.fillStyle = ish; x.beginPath(); x.arc(0, 0, R * 1.25, 0, 7); x.fill();
    x.drawImage(this.tex, -R, -R, R * 2, R * 2);
    var pr = (o.pupil || .34) * R, pg = x.createRadialGradient(0, 0, pr * .2, 0, 0, pr * 1.08);
    pg.addColorStop(0, '#010102'); pg.addColorStop(.86, '#030304'); pg.addColorStop(1, 'rgba(3,3,4,0)');
    x.fillStyle = pg; x.beginPath(); x.arc(0, 0, pr * 1.08, 0, 7); x.fill();
    if (o.lens > 0) {
      x.globalAlpha = o.lens; var dr = o.draw == null ? 1 : o.draw, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * dr;
      var lt = x.createRadialGradient(0, 0, R * .9, 0, 0, R * 1.17); lt.addColorStop(0, 'rgba(170,225,235,0)'); lt.addColorStop(1, 'rgba(170,225,235,.07)');
      x.fillStyle = lt; x.beginPath(); x.arc(0, 0, R * 1.17, 0, 7); x.fill();
      x.lineWidth = R * .012; x.strokeStyle = 'rgba(255,255,255,.26)'; x.beginPath(); x.arc(0, 0, R * 1.17, a0, a1); x.stroke();
      x.lineWidth = R * .01; x.strokeStyle = 'rgba(0,0,0,.22)'; x.beginPath(); x.arc(0, 0, R * 1.19, a0, a1); x.stroke();
      x.lineWidth = R * .008; x.strokeStyle = 'rgba(216,182,118,.6)'; x.beginPath(); x.arc(0, 0, R * 1.075, a0, a1); x.stroke();
      x.setLineDash([R * .02, R * .028]); x.strokeStyle = 'rgba(216,182,118,.32)'; x.beginPath(); x.arc(0, 0, R * 1.035, a0, a1); x.stroke(); x.setLineDash([]);
      if (dr > .55) { x.save(); x.translate(0, R * 1.075); x.fillStyle = 'rgba(28,24,18,.85)'; x.strokeStyle = 'rgba(216,182,118,.75)'; x.lineWidth = R * .005; x.fillRect(-R * .055, -R * .016, R * .11, R * .032); x.strokeRect(-R * .055, -R * .016, R * .11, R * .032); x.restore(); }
      if (o.led > 0) {
        x.lineWidth = R * .035; x.strokeStyle = 'rgba(127,227,240,' + (.07 * o.led).toFixed(3) + ')'; x.beginPath(); x.arc(0, 0, R * 1.11, -2.3, -.5); x.stroke();
        for (i = 0; i < 70; i++) { var an = -2.3 + 1.8 * i / 69, al = o.led * (.35 + .35 * Math.sin(t * 2.6 - i * .35)); x.fillStyle = 'rgba(127,227,240,' + al.toFixed(3) + ')'; x.beginPath(); x.arc(Math.cos(an) * R * 1.11, Math.sin(an) * R * 1.11, R * .0065, 0, 7); x.fill(); }
      }
      x.globalAlpha = 1;
    }
    x.restore();
    /* odbicia (okno studyjne) */
    x.save(); x.translate((-.52 + (o.gx || 0) * .35) * R, (-.5 + (o.gy || 0) * .35) * R); x.rotate(-.22);
    var w = R * .42, h = R * .28, rf = x.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    rf.addColorStop(0, 'rgba(255,255,255,.82)'); rf.addColorStop(1, 'rgba(255,255,255,.22)');
    x.fillStyle = rf; x.beginPath();
    if (x.roundRect) x.roundRect(-w / 2, -h / 2, w, h, R * .05); else x.rect(-w / 2, -h / 2, w, h);
    x.fill(); x.fillStyle = 'rgba(20,20,20,.22)'; x.fillRect(-R * .006, -h / 2, R * .012, h); x.fillRect(-w / 2, -R * .006, w, R * .012);
    x.restore();
    x.fillStyle = 'rgba(255,255,255,.88)'; x.beginPath(); x.arc((.42 + (o.gx || 0) * .35) * R, (-.4 + (o.gy || 0) * .35) * R, R * .04, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = R * .05; x.beginPath(); x.arc(gx, gy, R * .82, .3, 1.3); x.stroke();
    /* cień powieki, kąciki */
    var ls = x.createLinearGradient(0, -1.3 * R, 0, -.2 * R); ls.addColorStop(0, 'rgba(28,16,10,.7)'); ls.addColorStop(1, 'rgba(28,16,10,0)');
    x.fillStyle = ls; x.fillRect(-R * 3, -R * 2, R * 6, R * 2);
    [[-2.6, .05], [2.6, -.1]].forEach(function (c) { var cg = x.createRadialGradient(c[0] * R, c[1] * R, 0, c[0] * R, c[1] * R, R * 1.1); cg.addColorStop(0, 'rgba(60,24,18,.55)'); cg.addColorStop(1, 'rgba(60,24,18,0)'); x.fillStyle = cg; x.fillRect(-R * 3, -R * 2, R * 6, R * 4); });
    var car = x.createRadialGradient(-2.52 * R, .08 * R, 0, -2.52 * R, .08 * R, R * .26); car.addColorStop(0, 'rgba(208,122,112,.8)'); car.addColorStop(1, 'rgba(208,122,112,0)');
    x.fillStyle = car; x.fillRect(-R * 3, -R, R, R * 2);
    x.restore();
    /* krawędzie powiek */
    x.lineCap = 'round';
    x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = R * .022; x.beginPath(); x.moveTo(Ld.L[0] * R, Ld.L[1] * R); x.bezierCurveTo(Ld.d1[0] * R, (Ld.d1[1] - .03) * R, Ld.d2[0] * R, (Ld.d2[1] - .03) * R, Ld.R[0] * R, Ld.R[1] * R); x.stroke();
    x.strokeStyle = 'rgba(226,168,150,.38)'; x.lineWidth = R * .045; x.beginPath(); x.moveTo(Ld.L[0] * R, (Ld.L[1] + .03) * R); x.bezierCurveTo(Ld.d1[0] * R, (Ld.d1[1] + .045) * R, Ld.d2[0] * R, (Ld.d2[1] + .045) * R, Ld.R[0] * R, (Ld.R[1] + .03) * R); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = R * .12; x.beginPath(); x.moveTo(Ld.L[0] * R, (Ld.L[1] + .12) * R); x.bezierCurveTo(Ld.d1[0] * R, (Ld.d1[1] + .17) * R, Ld.d2[0] * R, (Ld.d2[1] + .17) * R, Ld.R[0] * R, (Ld.R[1] + .12) * R); x.stroke();
    x.strokeStyle = '#0d0907'; x.lineWidth = R * .075; x.beginPath(); x.moveTo(Ld.L[0] * R, Ld.L[1] * R); x.bezierCurveTo(Ld.u1[0] * R, Ld.u1[1] * R, Ld.u2[0] * R, Ld.u2[1] * R, Ld.R[0] * R, Ld.R[1] * R); x.stroke();
    if (o.lashes !== false) {
      x.strokeStyle = 'rgba(12,8,6,.88)';
      this.lash.forEach(function (l) {
        var tt = l.t, px = bz(Ld.L[0], Ld.u1[0], Ld.u2[0], Ld.R[0], tt) * R, py = bz(Ld.L[1], Ld.u1[1], Ld.u2[1], Ld.R[1], tt) * R;
        var tx = dbz(Ld.L[0], Ld.u1[0], Ld.u2[0], Ld.R[0], tt), ty = dbz(Ld.L[1], Ld.u1[1], Ld.u2[1], Ld.R[1], tt), m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
        var nx = ty, ny = -tx; if (ny > 0) { nx = -nx; ny = -ny; }
        var bell = Math.exp(-Math.pow((tt - .68) / .3, 2)), len = R * (.16 + .42 * bell) * l.l, dx = nx + tx * (.5 * (tt - .35) + l.c * .3), dy = ny, dm = Math.hypot(dx, dy); dx /= dm; dy /= dm;
        x.lineWidth = R * .012 * l.w; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + dx * len * .55, py + dy * len * .4, px + dx * len + len * .12 * (tt - .3), py + dy * len - len * .18); x.stroke();
      });
      x.strokeStyle = 'rgba(14,10,8,.55)';
      this.low.forEach(function (l) {
        var tt = l.t, px = bz(Ld.L[0], Ld.d1[0], Ld.d2[0], Ld.R[0], tt) * R, py = (bz(Ld.L[1], Ld.d1[1], Ld.d2[1], Ld.R[1], tt) + .04) * R;
        var len = R * .13 * l.l; x.lineWidth = R * .008 * l.w; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + len * .1 * (tt - .5), py + len * .6, px + len * .3 * (tt - .45), py + len); x.stroke();
      });
    }
    x.restore();
  };

  /* =========================================================
     MIASTO NOCĄ — bokeh, sylwetki, odbicia (tło hero i filmu)
     ========================================================= */
  function City(seed) {
    var r = rng(seed || 5), i; this.b = []; this.bld = []; this.r = r;
    var pal = ['255,178,102', '255,214,160', '127,227,240', '255,240,220', '255,120,90', '200,170,255', '255,196,120'];
    for (i = 0; i < 150; i++) { var yy = .5 + (r() - .5) * .5 * (r() + .3); this.b.push({ x: r() * 1.2 - .1, y: yy, s: r(), c: pal[(r() * pal.length) | 0], a: .07 + r() * .26, z: .25 + r() * .75, ph: r() * 6 }); }
    var xx = -.05; while (xx < 1.1) { var bw = .04 + r() * .09; this.bld.push({ x: xx, w: bw, h: .18 + r() * .38, z: r() }); xx += bw + .004; }
  }
  City.prototype.draw = function (x, w, h, t, o) {
    o = o || {}; var k = h / 700, i, drift = o.drift == null ? 1 : o.drift, bob = o.bob || 0;
    var sky = x.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#04060a'); sky.addColorStop(.42, '#0b131d'); sky.addColorStop(.62, '#2a1d18'); sky.addColorStop(.7, '#1a1412'); sky.addColorStop(1, '#07080a');
    x.fillStyle = sky; x.fillRect(0, 0, w, h);
    var hg = x.createRadialGradient(w * .5, h * .64, 0, w * .5, h * .64, w * .7); hg.addColorStop(0, 'rgba(255,150,80,.22)'); hg.addColorStop(1, 'rgba(255,150,80,0)'); x.fillStyle = hg; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(10,14,20,.9)';
    this.bld.forEach(function (b) { x.globalAlpha = .55 + b.z * .4; x.fillRect(b.x * w, h * (.66 - b.h) + bob * .3, b.w * w, b.h * h + 2); });
    x.globalAlpha = 1;
    var fl = x.createLinearGradient(0, h * .66, 0, h); fl.addColorStop(0, 'rgba(20,16,15,.9)'); fl.addColorStop(1, 'rgba(6,6,7,1)'); x.fillStyle = fl; x.fillRect(0, h * .66 + bob * .3, w, h);
    x.globalCompositeOperation = 'lighter';
    for (i = 0; i < this.b.length; i++) {
      var b = this.b[i], px = (((b.x + t * .006 * b.z * drift) % 1.2) + 1.2) % 1.2 - .1, py = b.y * h + bob * b.z;
      var rad = (3 + b.s * b.s * 44) * k * (.55 + b.z * .9) * (o.blur || 1), fl2 = .75 + .25 * Math.sin(t * 1.3 + b.ph);
      var g = x.createRadialGradient(px * w, py, 0, px * w, py, rad);
      g.addColorStop(0, 'rgba(' + b.c + ',' + (b.a * .55 * fl2).toFixed(3) + ')'); g.addColorStop(.82, 'rgba(' + b.c + ',' + (b.a * fl2).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + b.c + ',0)');
      x.fillStyle = g; x.beginPath(); x.arc(px * w, py, rad, 0, 7); x.fill();
      if (py < h * .66 && b.a > .2) { x.fillStyle = 'rgba(' + b.c + ',' + (b.a * .07).toFixed(3) + ')'; x.fillRect(px * w - rad * .3, h * .68 + (h * .66 - py) * .2, rad * .6, rad * 3.5); }
    }
    x.globalCompositeOperation = 'source-over';
    if (o.person) this.person(x, w, h, t, o.person);
    var vg = x.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, w * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = vg; x.fillRect(0, 0, w, h);
  };
  City.prototype.person = function (x, w, h, t, p) {
    var K = h * p.scale, px = w * p.x, base = h * 1.03, nod = p.talk ? Math.sin(t * 9) * K * .004 : 0, sway = Math.sin(t * .8) * K * .004;
    function shape(dx, dy) {
      x.beginPath();
      x.moveTo(px - .4 * K + dx, base + dy);
      x.bezierCurveTo(px - .4 * K + dx, base - .45 * K + dy, px - .34 * K + dx, base - .6 * K + dy, px - .2 * K + dx, base - .64 * K + dy);
      x.bezierCurveTo(px - .1 * K + dx, base - .67 * K + dy, px - .07 * K + dx, base - .7 * K + dy, px - .06 * K + dx, base - .74 * K + dy);
      x.lineTo(px + .06 * K + dx, base - .74 * K + dy);
      x.bezierCurveTo(px + .07 * K + dx, base - .7 * K + dy, px + .1 * K + dx, base - .67 * K + dy, px + .2 * K + dx, base - .64 * K + dy);
      x.bezierCurveTo(px + .34 * K + dx, base - .6 * K + dy, px + .4 * K + dx, base - .45 * K + dy, px + .4 * K + dx, base + dy);
      x.closePath();
      x.moveTo(px + .085 * K + dx + sway, base - .86 * K + dy + nod);
      x.ellipse(px + dx + sway, base - .86 * K + dy + nod, .085 * K, .112 * K, 0, 0, 7);
    }
    var hasF = 'filter' in x;
    /* poświata za postacią (oddziela ją od tła) */
    var halo = x.createRadialGradient(px, base - .7 * K, K * .1, px, base - .6 * K, K * .75); halo.addColorStop(0, 'rgba(255,170,110,.16)'); halo.addColorStop(1, 'rgba(255,170,110,0)');
    x.fillStyle = halo; x.fillRect(px - K, base - 1.5 * K, 2 * K, 1.5 * K);
    if (hasF) x.filter = 'blur(' + Math.max(.6, K * .0035).toFixed(1) + 'px)';
    x.fillStyle = 'rgba(255,190,128,.75)'; shape(K * .011, -K * .004); x.fill();
    x.fillStyle = 'rgba(127,190,230,.35)'; shape(-K * .008, -K * .002); x.fill();
    var bg = x.createLinearGradient(px - .4 * K, 0, px + .4 * K, 0); bg.addColorStop(0, '#101318'); bg.addColorStop(.55, '#1a1d22'); bg.addColorStop(1, '#22201f');
    x.fillStyle = bg; shape(0, 0); x.fill();
    /* bryła: światło z prawej, cień z lewej, kołnierz, włosy */
    x.save(); shape(0, 0); x.clip();
    var sh = x.createRadialGradient(px + .3 * K, base - .62 * K, 0, px + .3 * K, base - .62 * K, .45 * K); sh.addColorStop(0, 'rgba(255,190,140,.16)'); sh.addColorStop(1, 'rgba(255,190,140,0)'); x.fillStyle = sh; x.fillRect(px - K, base - K * 1.2, 2 * K, 1.2 * K);
    var fh = x.createRadialGradient(px + .05 * K, base - .86 * K + nod, 0, px + .05 * K, base - .86 * K + nod, .12 * K); fh.addColorStop(0, 'rgba(230,180,150,.12)'); fh.addColorStop(1, 'rgba(230,180,150,0)'); x.fillStyle = fh; x.fillRect(px - K, base - K * 1.2, 2 * K, 1.2 * K);
    var dk = x.createLinearGradient(0, base - .45 * K, 0, base); dk.addColorStop(0, 'rgba(0,0,0,0)'); dk.addColorStop(1, 'rgba(0,0,0,.6)'); x.fillStyle = dk; x.fillRect(px - K, base - K, 2 * K, K);
    x.strokeStyle = 'rgba(255,200,150,.12)'; x.lineWidth = K * .006;
    x.beginPath(); x.moveTo(px - .07 * K, base - .69 * K); x.quadraticCurveTo(px - .1 * K, base - .56 * K, px - .02 * K, base - .44 * K); x.moveTo(px + .07 * K, base - .69 * K); x.quadraticCurveTo(px + .1 * K, base - .56 * K, px + .03 * K, base - .44 * K); x.stroke();
    x.fillStyle = 'rgba(6,6,8,.85)'; x.beginPath(); x.ellipse(px + sway, base - .9 * K + nod, .09 * K, .085 * K, 0, Math.PI, 0); x.fill();
    x.restore();
    if (hasF) x.filter = 'none';
  };
  window.Lumi = { Eye: Eye, City: City, rng: rng, smooth: smooth, clamp: clamp, lerp: lerp, reduce: reduce, noise: noiseCv };

  /* =========================================================
     LOADER + INTRO
     ========================================================= */
  var t0 = performance.now(), loadedAt = 0;
  var ll = $('#ldlogo');
  if (ll) ll.innerHTML = ll.textContent.split('').map(function (c, i) { return '<span style="animation-delay:' + (i * .07) + 's">' + c + '</span>'; }).join('');
  function markLoaded() { if (loadedAt) return; loadedAt = performance.now(); root.classList.add('loaded'); }
  if (reduce) markLoaded();
  else {
    var minWait = new Promise(function (r) { setTimeout(r, 1500); });
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([minWait, fontsReady]).then(markLoaded);
    setTimeout(markLoaded, 3200);
  }

  /* =========================================================
     NAGŁÓWEK, MENU, AKTYWNY LINK
     ========================================================= */
  var hdr = $('#hdr'), burger = $('#burger'), menu = $('#menu'), lastY = scrollY, menuOpen = false;
  var themed = $$('main > section, footer, .marq');
  var navLinks = $$('.nav a');
  function setMenu(o) {
    menuOpen = o; menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o);
    document.body.style.overflow = o ? 'hidden' : ''; hdr.classList.toggle('light', false);
    if (o) hdr.classList.remove('hide');
  }
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  function headerTick() {
    var y = scrollY;
    hdr.classList.toggle('solid', y > 40);
    if (!menuOpen) {
      if (y > 700 && y > lastY + 6) hdr.classList.add('hide');
      else if (y < lastY - 6 || y < 700) hdr.classList.remove('hide');
      var probe = 36, light = false;
      for (var i = 0; i < themed.length; i++) { var r = themed[i].getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) { light = themed[i].classList.contains('s-light'); break; } }
      hdr.classList.toggle('light', light);
    }
    lastY = y;
    var act = null;
    navLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) { var r = s.getBoundingClientRect(); if (r.top < VH * .4 && r.bottom > VH * .4) act = a; } });
    navLinks.forEach(function (a) { a.classList.toggle('act', a === act); });
  }

  /* =========================================================
     HERO — oko, zbliżenie w źrenicę, widok „od środka”
     ========================================================= */
  var hero = $('#top'), ecv = $('#eyecv'), ex = ecv.getContext('2d'), eye = new Eye(11);
  var ccv = $('#citycv'), cx2 = ccv.getContext('2d'), city = new City(5);
  var inside = $('#inside'), black = $('#blackout'), hcopy = $('#hcopy'), hmeta = $('#hmeta'), cue = $('#cue'), shade = $('.hero-shade');
  var hc = [$('#hc1'), $('#hc2'), $('#hc3')], it1 = $('#it1');
  var sceneLabel = $('#scene-label'), sceneProgress = $('#scene-progress'), chapter = -1;
  var heroP = 0, gazeT = { x: 0, y: 0 }, gaze = { x: 0, y: 0 }, sacc = { x: 0, y: 0 }, nextSacc = 0, nextBlink = 3, blinkAt = -1;
  function sizeCv(c, w, h, d) { var W = Math.round(w * d), H = Math.round(h * d); if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } }
  addEventListener('pointermove', function (e) { gazeT.x = clamp((e.clientX / VW - .5) * 2, -1, 1); gazeT.y = clamp((e.clientY / VH - .5) * 2, -1, 1); }, { passive: true });

  function heroTick(t, dt) {
    var r = hero.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
    var p = reduce ? 0 : clamp(-r.top / (r.height - VH), 0, 1);
    heroP += (p - heroP) * Math.min(1, dt * 7);
    var P = heroP, mob = VW < 760, d = Math.min(DPR, 1.5);
    if(sceneProgress) sceneProgress.style.transform='scaleX('+P.toFixed(4)+')';
    var nextChapter = P<.15?0:P<.56?1:2;
    if(sceneLabel && chapter!==nextChapter){chapter=nextChapter;sceneLabel.textContent=['01 / SPOJRZENIE','02 / WEJDŹ DO ŚRODKA','03 / TWÓJ WIDOK'][chapter];}
    /* napisy */
    var fo = 1 - smooth(.02, .15, P);
    hcopy.style.opacity = fo; hcopy.style.transform = 'translateY(' + (-60 * smooth(.02, .18, P)).toFixed(1) + 'px)';
    hmeta.style.opacity = fo; cue.style.opacity = loadedAt ? 1 - smooth(0, .03, P) : 0; shade.style.opacity = 1 - smooth(.05, .25, P);
    hcopy.style.visibility = fo < .01 ? 'hidden' : '';
    /* zbliżenie */
    var z = smooth(.08, .54, P), bo = smooth(.42, .53, P) * (1 - smooth(.56, .63, P));
    black.style.opacity = bo;
    if (P < .56) {
      sizeCv(ecv, VW, VH, d); ex.setTransform(d, 0, 0, d, 0, 0);
      ex.fillStyle = '#0B0C0E'; ex.fillRect(0, 0, VW, VH);
      var since = loadedAt ? (performance.now() - loadedAt) / 1000 : 0;
      var openI = reduce ? 1 : easeOut((since - .35) / 1.5);
      if (!reduce && since > 3 && t > nextBlink) { blinkAt = t; nextBlink = t + 3.5 + Math.random() * 4; }
      var bl = blinkAt > 0 ? (t - blinkAt) / .38 : 2, blink = bl < 1 ? (bl < .4 ? bl / .4 : 1 - (bl - .4) / .6) : 0;
      if (t > nextSacc) { sacc.x = (Math.random() - .5) * .05; sacc.y = (Math.random() - .5) * .03; nextSacc = t + 1 + Math.random() * 2; }
      gaze.x += (gazeT.x * .13 + sacc.x - gaze.x) * Math.min(1, dt * 6); gaze.y += (gazeT.y * .07 + sacc.y - gaze.y) * Math.min(1, dt * 6);
      var R = mob ? Math.min(VW * .15, VH * .075) : Math.min(VH * .17, VW * .12);
      var bx = mob ? VW * .5 : VW * .64, by = mob ? VH * .2 : VH * .47;
      var m = smooth(.08, .4, P), scale = 1 + (Math.pow(34, z) - 1);
      var gx = gaze.x * (1 - m), gy = gaze.y * (1 - m);
      var pcx = lerp(bx + gx * R, VW / 2, m), pcy = lerp(by + gy * R, VH / 2, m);
      ex.save(); ex.translate(pcx, pcy); ex.scale(scale, scale); ex.translate(-gx * R, -gy * R);
      eye.draw(ex, {
        x: 0, y: 0, R: R, open: Math.max(0, openI * (1 - blink * .96)), t: t, gx: gx, gy: gy,
        pupil: lerp(.5, .33, easeOut((since - .9) / 1.6)) + .012 * Math.sin(t * .7) + .3 * z,
        lens: reduce ? 1 : smooth(1.3, 1.6, since), draw: reduce ? 1 : easeOut((since - 1.3) / 1.4), led: reduce ? 1 : smooth(2.4, 3.2, since),
        lashes: scale < 6
      });
      ex.restore();
      ecv.style.visibility = '';
    } else ecv.style.visibility = 'hidden';
    /* widok od środka */
    var io = smooth(.55, .63, P);
    inside.style.opacity = io;
    if (io > 0) {
      inside.style.transform = 'scale(' + (1.14 - .14 * smooth(.55, .9, P)).toFixed(4) + ')';
      sizeCv(ccv, VW, VH, 1); cx2.setTransform(1, 0, 0, 1, 0, 0);
      city.draw(cx2, VW, VH, t, { drift: 1, bob: Math.sin(t * 1.6) * 2 });
      hc.forEach(function (el, i) { var a = smooth(.62 + i * .06, .68 + i * .06, P); el.style.opacity = a; el.style.transform = 'translateY(' + ((1 - a) * 24).toFixed(1) + 'px)'; });
      var ta = smooth(.64, .72, P); it1.style.opacity = ta; it1.style.transform = 'translate(-50%,-50%) scale(' + (.94 + .06 * ta).toFixed(3) + ')';
    }
  }

  /* =========================================================
     SOCZEWKA — wynurzenie, specyfikacja, rozłożenie na warstwy
     ========================================================= */
  var lensSec = $('#soczewka'), l3d = $('#lens3d'), lsh = $('#lshadow'), w1 = $('.split2 .w1'), w2 = $('.split2 .w2'), split2 = $('#split2');
  var spec = $('#spec'), claim = $('#claim'), xray = $('#xray'), llist = $('#llist'), lis = $$('#llist li'), lys = $$('#lens3d .ly');
  var lensP = 0, manualK = -1, manualUntil = 0;
  function setLayer(k) {
    lis.forEach(function (li) { li.classList.toggle('on', +li.dataset.k === k); });
    llist.classList.toggle('has-on', k >= 0);
    lys.forEach(function (l) { var on = +l.dataset.k === k; l.classList.toggle('hl', on && k >= 0); l.classList.toggle('dim', k >= 0 && !on); });
  }
  lis.forEach(function (li) {
    var f = function () { manualK = +li.dataset.k; manualUntil = performance.now() + 4000; setLayer(manualK); };
    li.tabIndex = 0; li.addEventListener('focus', f);
    li.addEventListener('pointerenter', f); li.addEventListener('click', f);
  });
  function lensTick(t, dt) {
    var r = lensSec.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
    var p = reduce ? .8 : clamp(-r.top / (r.height - VH), 0, 1);
    lensP += (p - lensP) * Math.min(1, dt * 6);
    var P = reduce ? .8 : lensP, mob = VW < 760, L = mob ? Math.min(VH * .36, VW * .7) : Math.min(VH * .46, VW * .4);
    l3d.style.setProperty('--L', L + 'px'); lsh.style.setProperty('--L', L + 'px');
    var rise = easeOut(smooth(0, .22, P)), part = smooth(.02, .2, P), wf = 1 - smooth(.24, .33, P);
    var gapW = L * (mob ? .42 : .6) * part;
    w1.style.transform = 'translateX(' + (-gapW).toFixed(1) + 'px)'; w2.style.transform = 'translateX(' + gapW.toFixed(1) + 'px)';
    split2.style.opacity = wf;
    var sa = smooth(.28, .36, P) * (1 - smooth(.46, .52, P));
    spec.style.opacity = sa; claim.style.opacity = sa; spec.classList.toggle('live', sa > .5); claim.classList.toggle('live', sa > .5);
    var ex2 = smooth(.5, .66, P), xa = smooth(.56, .64, P);
    xray.style.opacity = xa; xray.classList.toggle('live', xa > .5);
    var y = lerp(VH * .62, 0, rise), x = 0, sc = lerp(.5, 1, rise), rx = lerp(84, 0, rise), rz = 0;
    if (mob) { y += -VH * .14 * smooth(.26, .36, P) * (1 - ex2); y += -VH * .2 * ex2; sc *= lerp(1, .8, smooth(.26, .36, P)); }
    else x = -VW * .2 * ex2;
    rx += 64 * ex2; rz = -22 * ex2 + Math.sin(t * .4) * 2;
    var fl = reduce ? 0 : Math.sin(t * 1.1) * 6;
    l3d.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (y + fl).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
    var gap = L * .3 * ex2;
    lys.forEach(function (l) { var k = +l.dataset.k; l.style.transform = 'translateZ(' + ((2 - k) * gap).toFixed(1) + 'px)'; });
    lsh.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y + L * (.55 + .1 * ex2) * sc).toFixed(1) + 'px) scale(' + (sc * (1 - .2 * ex2)).toFixed(3) + ')';
    lsh.style.opacity = rise * (.6 + .4 * ex2);
    var k = -1;
    if (performance.now() < manualUntil) k = manualK;
    else if (P > .66) k = Math.min(4, Math.floor((P - .66) / .3 * 5));
    setLayer(k);
  }

  /* =========================================================
     GLOB — kropkowana kula z trasami tłumaczeń
     ========================================================= */
  var gcv = $('#globe'), gx2 = gcv && gcv.getContext('2d'), gpts = [], grot = 0;
  (function () { var N = 2400, ga = Math.PI * (3 - Math.sqrt(5)); for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga * i; gpts.push([Math.cos(th) * rr, y, Math.sin(th) * rr]); } })();
  var CITIES = [['Warszawa', 52.2, 21], ['Pekin', 39.9, 116.4], ['Kijów', 50.45, 30.5], ['Berlin', 52.5, 13.4], ['Madryt', 40.4, -3.7], ['Tokio', 35.7, 139.7], ['Nowy Jork', 40.7, -74], ['Kair', 30, 31.2], ['Seul', 37.5, 127], ['Rzym', 41.9, 12.5]];
  function ll2v(la, lo) { la *= Math.PI / 180; lo *= Math.PI / 180; return [Math.cos(la) * Math.sin(lo), -Math.sin(la), Math.cos(la) * Math.cos(lo)]; }
  var CV = CITIES.map(function (c) { return ll2v(c[1], c[2]); });
  function rot(v, ay, ax) { var c = Math.cos(ay), s = Math.sin(ay), x = v[0] * c + v[2] * s, z = -v[0] * s + v[2] * c, y = v[1]; var c2 = Math.cos(ax), s2 = Math.sin(ax); return [x, y * c2 - z * s2, y * s2 + z * c2]; }
  function slerp(a, b, t) { var d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1), om = Math.acos(d), so = Math.sin(om) || 1, k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so; return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2]; }
  function globeTick(t, dt) {
    if (!gx2) return; var r = gcv.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH || r.width < 10) return;
    var d = Math.min(DPR, 1.5); sizeCv(gcv, r.width, r.height, d); var W = r.width, H = r.height;
    gx2.setTransform(d, 0, 0, d, 0, 0); gx2.clearRect(0, 0, W, H);
    grot += dt * (reduce ? 0 : .07); var ay = grot - 1.2, ax = -.38, cx = W / 2, cy = H / 2, R = W * .42;
    var halo = gx2.createRadialGradient(cx, cy, R * .9, cx, cy, R * 1.2); halo.addColorStop(0, 'rgba(195,160,99,.07)'); halo.addColorStop(1, 'rgba(195,160,99,0)'); gx2.fillStyle = halo; gx2.fillRect(0, 0, W, H);
    for (var i = 0; i < gpts.length; i++) {
      var v = rot(gpts[i], ay, ax); if (v[2] < 0) continue;
      var shade = clamp(.25 + .75 * (-.45 * v[0] - .35 * v[1] + .82 * v[2]), 0, 1), a = (.05 + .5 * shade) * v[2];
      gx2.fillStyle = 'rgba(227,203,151,' + a.toFixed(3) + ')'; var s = .7 + 1.3 * v[2];
      gx2.fillRect(cx + v[0] * R - s / 2, cy + v[1] * R - s / 2, s, s);
    }
    gx2.lineCap = 'round';
    for (var j = 1; j < CV.length; j++) {
      var ph = ((t * .16 + j * .23) % 1.7), head = clamp(ph, 0, 1), tail = clamp(ph - .45, 0, 1);
      if (head <= tail) continue;
      var prev = null;
      for (var s2 = 0; s2 <= 40; s2++) {
        var u = tail + (head - tail) * s2 / 40, q = slerp(CV[0], CV[j], u), lift = 1 + .22 * Math.sin(Math.PI * u), w = rot([q[0] * lift, q[1] * lift, q[2] * lift], ay, ax);
        if (prev && w[2] > -.05 && prev[2] > -.05) { gx2.strokeStyle = 'rgba(227,203,151,' + (.15 + .6 * s2 / 40).toFixed(3) + ')'; gx2.lineWidth = 1.3; gx2.beginPath(); gx2.moveTo(cx + prev[0] * R, cy + prev[1] * R); gx2.lineTo(cx + w[0] * R, cy + w[1] * R); gx2.stroke(); }
        prev = w;
      }
      if (prev && prev[2] > 0 && head < 1) { var hg = gx2.createRadialGradient(cx + prev[0] * R, cy + prev[1] * R, 0, cx + prev[0] * R, cy + prev[1] * R, 9); hg.addColorStop(0, 'rgba(255,230,180,.95)'); hg.addColorStop(1, 'rgba(255,230,180,0)'); gx2.fillStyle = hg; gx2.beginPath(); gx2.arc(cx + prev[0] * R, cy + prev[1] * R, 9, 0, 7); gx2.fill(); }
    }
    gx2.font = '500 10px "IBM Plex Mono", monospace';
    CV.forEach(function (c, k) { var v = rot(c, ay, ax); if (v[2] < .15) return; var px = cx + v[0] * R, py = cy + v[1] * R; gx2.fillStyle = 'rgba(227,203,151,' + (v[2] * .95).toFixed(2) + ')'; gx2.beginPath(); gx2.arc(px, py, k ? 2.4 : 3.6, 0, 7); gx2.fill(); if (v[2] > .45) { gx2.fillStyle = 'rgba(237,231,220,' + ((v[2] - .45) * .7).toFixed(2) + ')'; gx2.fillText(CITIES[k][0].toUpperCase(), px + 8, py + 3); } });
  }
  /* karta-przepustka: przechył, odblask, zmiana języka, kod kreskowy */
  var pass = $('#pass'), world = $('#swiat');
  if (pass && world && !reduce) {
    world.addEventListener('pointermove', function (e) { var r = pass.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height; pass.style.setProperty('--ry', clamp(dx * 14, -12, 12).toFixed(2) + 'deg'); pass.style.setProperty('--rx', clamp(-dy * 10, -10, 10).toFixed(2) + 'deg'); pass.style.setProperty('--sx', (50 - dx * 80).toFixed(1) + '%'); }, { passive: true });
    world.addEventListener('pointerleave', function () { pass.style.setProperty('--rx', '0deg'); pass.style.setProperty('--ry', '0deg'); });
  }
  var LANGS = [['中文', 1], ['English', 0], ['Deutsch', 0], ['Українська', 0], ['Español', 0], ['日本語', 1], ['Français', 0], ['Italiano', 0]], li0 = 0, pl = $('#plang');
  if (pl) setInterval(function () { if (document.hidden) return; pl.classList.add('out'); setTimeout(function () { li0 = (li0 + 1) % LANGS.length; pl.textContent = LANGS[li0][0]; pl.classList.toggle('zh', !!LANGS[li0][1]); pl.classList.remove('out'); }, 400); }, 2400);
  var bc = $('#barcode'); if (bc) { var br = rng(42), bx = 0, h = ''; while (bx < 108) { var bw = 1 + ((br() * 3) | 0); if (br() > .35) h += '<rect x="' + bx + '" y="0" width="' + bw + '" height="34" fill="currentColor"/>'; bx += bw + 1; } bc.innerHTML = h; }

  /* =========================================================
     PLAN — linia czasu rysowana przewijaniem
     ========================================================= */
  var road = $('#road'), roadArts = road ? $$('article', road) : [];
  function roadTick() {
    if (!road) return; var r = road.getBoundingClientRect(); if (r.bottom < 0 || r.top > VH) return;
    var p = reduce ? 1 : clamp((VH * .85 - r.top) / (VH * .55), 0, 1);
    road.style.setProperty('--p', p.toFixed(3));
    roadArts.forEach(function (a, i) { a.classList.toggle('hit', p >= i / 4 + .02); });
  }
  /* napis w stopce */
  var wm = $('#wordmark'), wmL = [];
  if (wm) { wm.innerHTML = wm.textContent.split('').map(function (c) { return '<span>' + c + '</span>'; }).join(''); wmL = $$('span', wm); }
  function wmTick() {
    if (!wm || reduce) return; var r = wm.getBoundingClientRect(); if (r.top > VH || r.bottom < 0) return;
    var p = clamp((VH - r.top) / (r.height + VH * .3), 0, 1);
    wmL.forEach(function (s, i) { var q = smooth(i * .07, .45 + i * .07, p); s.style.transform = 'translateY(' + ((1 - q) * 45).toFixed(1) + '%)'; s.style.opacity = (.2 + .8 * q).toFixed(3); });
  }
  /* telefon z aplikacją */
  var phone = $('#phone'), phph = $('#phph'), appSec = $('#aplikacja');
  function phoneTick() {
    if (!phph) return; var r = phone.getBoundingClientRect();
    if (r.top < VH * 1.6 && r.bottom > -VH) { var f = document.createElement('iframe'); f.src = 'app/'; f.title = 'Makieta aplikacji LumiAI'; f.loading = 'lazy'; phph.replaceWith(f); phph = null; }
  }
  if (phone && appSec && !reduce) {
    appSec.addEventListener('pointermove', function (e) { var r = phone.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / VW, dy = (e.clientY - (r.top + r.height / 2)) / VH; phone.style.setProperty('--ry', clamp(-8 + dx * 18, -18, 6).toFixed(2) + 'deg'); phone.style.setProperty('--rx', clamp(4 - dy * 10, -6, 10).toFixed(2) + 'deg'); }, { passive: true });
  }

  /* =========================================================
     GŁÓWNA PĘTLA
     ========================================================= */
  // One animation loop, active only while a cinematic scene is visible.
  var viewportDirty = true;
  var frameId = 0, globeVisible = false, heroVisible = false, lensVisible = false, lastT = performance.now();
  function schedule() { if (!document.hidden && !frameId) frameId = requestAnimationFrame(loop); }
  function loop(now) {
    frameId = 0;
    var dt = Math.min(.05, (now-lastT)/1000); lastT = now;
    if(viewportDirty){headerTick(); roadTick(); wmTick(); phoneTick();viewportDirty=false;}
    if(heroVisible) heroTick(now/1000, dt);
    if(lensVisible) lensTick(now/1000, dt);
    if (globeVisible) globeTick(reduce ? 0 : now/1000, dt);
    if ((globeVisible || heroVisible || lensVisible) && !reduce) schedule();
  }
  if (gcv && 'IntersectionObserver' in window) new IntersectionObserver(function(entries) {
    globeVisible = entries[0].isIntersecting; schedule();
  }).observe(gcv);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries) { heroVisible=entries[0].isIntersecting; schedule(); }).observe(hero);
    new IntersectionObserver(function(entries) { lensVisible=entries[0].isIntersecting; schedule(); }).observe(lensSec);
  } else { heroVisible=true; lensVisible=true; globeVisible=true; }
  addEventListener('scroll', function(){viewportDirty=true;schedule();}, {passive:true});
  addEventListener('resize', function() { VW=innerWidth; VH=innerHeight; viewportDirty=true; schedule(); }, {passive:true});
  document.addEventListener('visibilitychange', function() {
    if(document.hidden) { cancelAnimationFrame(frameId); frameId=0; } else schedule();
  });
  schedule();

  /* =========================================================
     ODSŁANIANIE + NAGŁÓWKI SŁOWO PO SŁOWIE + LICZNIKI
     ========================================================= */
  function splitWords(el) {
    var i = 0;
    function walk(node, out) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/([ \n\t]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[ \n\t]+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; var s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = part; w.appendChild(s); out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { out.appendChild(n.cloneNode()); return; }
          var c = n.cloneNode(false); walk(n, c); out.appendChild(c);
        }
      });
    }
    var frag = document.createDocumentFragment(); walk(el, frag);
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.innerHTML = ''; el.appendChild(frag);
    $$('.w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
  }
  function count(b) {
    var to = parseFloat(b.dataset.count), pre = b.dataset.pre ? b.dataset.pre.replace('&lt;', '<') : '', suf = b.dataset.suf || '';
    if (reduce || !to) { b.textContent = pre + to + suf; return; }
    var s = performance.now(); (function f(n) { var p = clamp((n - s) / 1400, 0, 1), v = Math.round(to * easeOut(p)); b.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(f); })(s);
  }
  function revealSetup() {
    var items = $$('[data-rv]');
    if (reduce || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.removeAttribute('data-rv'); }); $$('.stats b[data-count]').forEach(count); return; }
    items.forEach(function (el) { if (el.dataset.rv === 'split') splitWords(el); });
    var io = new IntersectionObserver(function (en) {
      var batch = en.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
      batch.forEach(function (el, i) {
        /* kaskada: w siatkach liczymy pozycję w rzędzie, w listach kolejność w partii */
        io.unobserve(el); var par0 = el.parentElement, index = i;
        if (par0 && par0.matches('.fgrid,.principle-grid,.biz,.road,.ideas,.panelmock,.cfg,.stats')) { var row = [].filter.call(par0.children, function (c) { return Math.abs(c.offsetTop - el.offsetTop) < 6; }); index = row.indexOf(el); }
        var d = Math.min(index, 6) * .09;
        el.style.setProperty('--d', d + 's'); el.classList.add('in');
        $$('b[data-count]', el).forEach(function (b) { setTimeout(function () { count(b); }, d * 1000 + 200); });
        $$('.tir span,.lbar i', el).forEach(function (s) { if (s.animate) s.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}], {duration:750,delay:d*1000+150,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}); });
        var words = $$('.w', el).length;
        setTimeout(function () { el.removeAttribute('data-rv'); el.style.removeProperty('--d'); }, (d + 1.2 + words * .045) * 1000);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* magnetyczne przyciski */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* płynne otwieranie FAQ */
  $$('details').forEach(function (d) {
    var s = $('summary', d), a = $('.ans', d); if (!a || reduce || !a.animate) return;
    s.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) { var h = a.scrollHeight; var an = a.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.65,0,.35,1)' }); an.onfinish = function () { d.open = false; }; }
      else { d.open = true; var h2 = a.scrollHeight; a.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' }); }
    });
  });

  /* =========================================================
     DEMO
     ========================================================= */
  var L = [
    { c: 'Angielski', s: 'Take one tablet after breakfast.', t: 'Weź jedną tabletkę po śniadaniu.' },
    { c: 'Chiński', s: '你有药物过敏吗？', t: 'Czy ma Pan alergię na leki?' },
    { c: 'Niemiecki', s: 'Haben Sie Schmerzen in der Brust?', t: 'Czy czuje Pan ból w klatce piersiowej?' },
    { c: 'Hiszpański', s: '¿Desde cuándo tiene fiebre?', t: 'Od kiedy ma Pan gorączkę?' },
    { c: 'Ukraiński', s: 'Чи є у вас алергія на ліки?', t: 'Czy ma Pan alergię na leki?' },
    { c: 'Japoński', s: 'どこが痛いですか？', t: 'Gdzie boli?' }
  ];
  var G = [
    { n: 'Podwójne mrugnięcie', s: 'Potwierdź lub zatwierdź', out: '<small>Akcja</small><div class="big">Potwierdzono</div><div class="row"><span>lek</span><span>Metformina 500 mg</span></div><div class="row"><span>zapisano</span><span>14:30</span></div>', i: '<circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>' },
    { n: 'Spojrzenie w górny róg', s: 'Pokaż pomiary zdrowia', out: '<small>Zdrowie</small><div class="big">5,4 mmol/L</div><div class="row"><span>trend</span><span>↗ lekki wzrost</span></div><div class="row"><span>następny pomiar</span><span>za 3 min</span></div>', i: '<path d="M7 17L17 7M9 7h8v8"/>' },
    { n: 'Skinienie głową', s: 'Przełącz język tłumaczenia', out: '<small>Tłumaczenie</small><div class="big">ZH → PL</div><div class="row"><span>język rozmówcy</span><span>chiński</span></div><div class="row"><span>tryb</span><span>napisy na żywo</span></div>', i: '<path d="M5 9l7 7 7-7"/>' },
    { n: 'Długie spojrzenie w bok', s: 'Ukryj ekran na 10 minut', out: '<small>Tryb dyskrecji</small><div class="big">Ekran wyłączony</div><div class="row"><span>czas</span><span>10 min</span></div><div class="row"><span>alarmy krytyczne</span><span>nadal aktywne</span></div>', i: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 10 6 10 6a17 17 0 01-3 3.5M6.4 7.7A17 17 0 002 12s4 7 10 7a9.7 9.7 0 004-.9"/>' }
  ];
  var tab = 'tr', li = 0, gi = 0, body = $('#dbody');
  function render(anim) {
    if (tab === 'tr') {
      var x = L[li];
      body.innerHTML = '<div><h3>Rozmowa bez tłumacza</h3><p class="d">Wybierz język, którym mówi rozmówca. Tłumaczenie pojawia się w Twoim polu widzenia, a rozmówca nie widzi nic poza zwykłym kontaktem wzrokowym.</p><div class="chips" id="chips"></div></div><div class="view"><small>' + x.c + ' → polski · na żywo</small><div class="src">' + x.s + '</div><div class="tr">' + x.t + '</div><div class="row"><span>opóźnienie</span><span>240 ms</span></div></div>';
      var ch = $('#chips');
      L.forEach(function (l, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = l.c; b.setAttribute('aria-pressed', i === li); b.onclick = function () { li = i; render(true); }; ch.appendChild(b); });
    } else if (tab === 'sl') {
      var SEG = [['A', 6], ['L', 24], ['D', 50], ['L', 20], ['R', 12], ['L', 30], ['D', 44], ['L', 18], ['R', 18], ['L', 26], ['A', 4], ['L', 22], ['D', 20], ['L', 20], ['R', 26], ['L', 24], ['A', 3], ['L', 20], ['R', 34], ['L', 11]];
      var TOTm = 432, ST0 = 23 * 60 + 10, YS = { A: 8, R: 40, L: 72, D: 104 }, COL = { A: '#E3CB97', R: '#7FE3F0', L: '#4F8FA0', D: '#2B5C8A' }, NM = { A: 'Przebudzenie', R: 'Faza REM', L: 'Sen lekki', D: 'Sen głęboki' };
      var hm = function (m) { m = (ST0 + m) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); };
      var acc = 0, sum = { A: 0, R: 0, L: 0, D: 0 }, wake = 0, rects = '';
      SEG.forEach(function (g, n) { var xx = 56 + acc / TOTm * 530, w = Math.max(2, g[1] / TOTm * 530 - 1); rects += '<rect class="s" tabindex="0" data-d="' + NM[g[0]] + ' · ' + hm(acc) + '–' + hm(acc + g[1]) + ' (' + g[1] + ' min)" x="' + xx.toFixed(1) + '" y="' + YS[g[0]] + '" width="' + w.toFixed(1) + '" height="22" rx="3" fill="' + COL[g[0]] + '"/>'; sum[g[0]] += g[1]; if (g[0] === 'A' && n > 0) wake++; acc += g[1]; });
      var grid = ''; [['Wybudz.', 8], ['REM', 40], ['Lekki', 72], ['Głęboki', 104]].forEach(function (r) { grid += '<text x="0" y="' + (r[1] + 15) + '">' + r[0] + '</text><line x1="56" x2="586" y1="' + (r[1] + 11) + '" y2="' + (r[1] + 11) + '" stroke="#1d3a44"/>'; });
      [0, 120, 240, 360, 432].forEach(function (m) { grid += '<text x="' + (56 + m / TOTm * 530) + '" y="146" text-anchor="' + (m === 0 ? 'start' : m === 432 ? 'end' : 'middle') + '">' + hm(m) + '</text>'; });
      var rem = Math.round(sum.R / TOTm * 100), deep = Math.round(sum.D / TOTm * 100);
      body.innerHTML = '<div><h3>Poranny raport snu</h3><p class="d">Po nocy w wariancie nocnym aplikacja pokazuje fazy snu. Najedź na pasek lub dotknij go, aby zobaczyć szczegóły. Dane są przykładowe.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:26px"><div class="mini"><b>' + rem + '%</b><span>faza REM</span></div><div class="mini"><b>' + deep + '%</b><span>sen głęboki</span></div><div class="mini"><b>' + wake + '</b><span>przebudzenia</span></div><div class="mini"><b>58</b><span>tętno spocz./min</span></div></div></div><div class="view"><small>Noc 5–6 października · 7 h 12 min</small><svg class="hyp" viewBox="0 0 600 152" role="img" aria-label="Wykres faz snu w ciągu nocy">' + grid + rects + '</svg><div class="row"><span id="hyd">Wybierz fragment nocy</span><span>ciśnienie w oku: w normie</span></div></div>';
      var hd = $('#hyd');
      $$('rect.s', body).forEach(function (r) { var f = function () { hd.textContent = r.dataset.d; }; r.addEventListener('pointerenter', f); r.addEventListener('focus', f); r.addEventListener('click', f); });
    } else if (tab === 'gl') {
      body.innerHTML = '<div><h3>Symulator glukozy</h3><p class="d">Przesuń suwak i zobacz, co pokazuje soczewka przy różnych wartościach. To tylko przykład działania, a nie porada medyczna.</p><div class="slider"><label for="gs"><span>Poziom glukozy</span><span id="gsv">5,4 mmol/L</span></label><input id="gs" type="range" min="2.5" max="14" step="0.1" value="5.4"></div></div><div class="view" id="gview"></div>';
      var gs = $('#gs'), gv = $('#gview'), gsv = $('#gsv');
      var up = function () {
        var v = parseFloat(gs.value), c, st, msg;
        if (v < 3.9) { c = '#F2706B'; st = 'Niski'; msg = v < 3.0 ? 'Pilnie zjedz węglowodany i poinformuj opiekuna. Soczewka wysyła alarm w polu widzenia.' : 'Zjedz 15 g węglowodanów i zmierz ponownie za 15 minut.'; }
        else if (v <= 10) { c = '#5FD3A1'; st = 'W normie'; msg = 'Wynik w zakresie docelowym 3,9–10,0 mmol/L. Soczewka nie wyświetla ostrzeżeń.'; }
        else { c = '#F2C46B'; st = 'Wysoki'; msg = v > 13 ? 'Skontaktuj się z lekarzem. Soczewka zapisuje zdarzenie w raporcie.' : 'Wypij wodę i sprawdź plan posiłków. Soczewka pokaże trend w kolejnych pomiarach.'; }
        var t2 = v.toFixed(1).replace('.', ','); gsv.textContent = t2 + ' mmol/L';
        gv.innerHTML = '<small>Widok w soczewce</small><div class="gv" style="color:' + c + '">' + t2 + '<span>mmol/L</span></div><div><span class="stbadge" style="color:' + c + '">' + st + '</span></div><div class="row"><span>podpowiedź</span><span style="text-align:right;max-width:62%">' + msg + '</span></div>';
      };
      gs.addEventListener('input', up); up();
    } else {
      var g = G[gi];
      body.innerHTML = '<div><h3>Obsługa bez rąk</h3><p class="d">Wybierz gest, aby zobaczyć reakcję soczewki. Zestaw gestów lekarz może dostosować do sprawności pacjenta.</p><div class="list" id="gl"></div></div><div class="view">' + g.out + '</div>';
      var gl = $('#gl');
      G.forEach(function (e, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', i === gi); b.innerHTML = '<span class="g"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + e.i + '</svg></span><span><b>' + e.n + '</b><span class="s">' + e.s + '</span></span>'; b.onclick = function () { gi = i; render(true); }; gl.appendChild(b); });
    }
    if (anim && !reduce) { var vw = $('.view', body); if (vw) vw.classList.add('vin'); }
  }
  $$('#dtabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (tab === b.dataset.t) return; tab = b.dataset.t;
      $$('#dtabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      render(true);
      if (!reduce && body.animate) body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
  });
  render(false);

  /* =========================================================
     POMYSŁY
     ========================================================= */
  var I = [
    ['Zdrowie', 'Monitoring ciśnienia w oku', 'Soczewka mierzy ciśnienie śródgałkowe przez całą dobę, co pomaga wcześnie wykrywać jaskrę.', 'w planie'],
    ['Zdrowie', 'Autofokus dla prezbiopii', 'Soczewka dopasowuje ostrość do odległości, na którą patrzy użytkownik, bez okularów do czytania.', 'w koncepcji'],
    ['Zdrowie', 'Ochrona przed zmęczeniem oczu', 'Przypomnienie o przerwie i wygaszenie bodźców po długiej pracy przy ekranie.', 'w koncepcji'],
    ['Zdrowie', 'Krople na żądanie', 'Mikrozbiornik uwalnia lek w ustalonej dawce, na przykład w terapii jaskry.', 'badania'],
    ['Komunikacja', 'Tłumaczenie z kontekstem medycznym', 'Słownik terminów klinicznych i ostrzeżenie, gdy tłumaczenie jest niepewne.', 'w planie'],
    ['Komunikacja', 'Nauka języka w tle', 'Soczewka podpowiada słowa, które użytkownik słyszy po raz pierwszy.', 'w koncepcji'],
    ['Komunikacja', 'Napisy do wideokonsultacji', 'Tekst z wizyt telemedycznych w polu widzenia, bez przełączania ekranów.', 'w planie'],
    ['Bezpieczeństwo', 'Gest SOS', 'Pięć mrugnięć wzywa pomoc i wysyła lokalizację do opiekuna.', 'w planie'],
    ['Bezpieczeństwo', 'Wykrywanie upadku', 'Czujniki ruchu w patchu rozpoznają upadek i uruchamiają alarm.', 'w koncepcji'],
    ['Bezpieczeństwo', 'Alergeny na etykietach', 'Soczewka ostrzega, gdy skład produktu zawiera substancję, na którą pacjent jest uczulony.', 'badania'],
    ['Dostępność', 'Powiększenie i kontrast', 'Dla osób słabowidzących: powiększenie napisów i znaków oraz zwiększenie kontrastu.', 'w planie'],
    ['Dostępność', 'Wsparcie przy dysleksji', 'Dostosowany krój pisma i podświetlanie czytanego wiersza.', 'w koncepcji'],
    ['Dostępność', 'Nawigacja w budynkach', 'Strzałki w polu widzenia prowadzą pacjenta do gabinetu w dużym szpitalu.', 'w koncepcji']
  ];
  var ig = $('#ideas');
  I.forEach(function (x) { var d = document.createElement('article'); d.className = 'idea'; d.dataset.c = x[0]; d.setAttribute('data-rv', ''); d.innerHTML = '<div class="tag"><span>' + x[0] + '</span><i>' + x[3] + '</i></div><h3>' + x[1] + '</h3><p>' + x[2] + '</p>'; ig.appendChild(d); });
  $$('#ifilter button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#ifilter button').forEach(function (y) { y.setAttribute('aria-pressed', y === b); });
      var n = 0;
      $$('.idea', ig).forEach(function (d) {
        d.hidden = !(b.dataset.f === 'all' || d.dataset.c === b.dataset.f); d.classList.remove('pop');
        if (!d.hidden && !reduce) { void d.offsetWidth; d.style.setProperty('--d', Math.min(n++, 8) * .05 + 's'); d.classList.add('pop'); }
      });
    });
  });

  /* =========================================================
     KONFIGURATOR
     ========================================================= */
  var F = [{ k: 'tr', n: 'Tłumaczenie na żywo', c: 2.5 }, { k: 'ds', n: 'Wyświetlacz AI i przypomnienia', c: 1.5 }, { k: 'gl', n: 'Pomiar glukozy', c: .8 }, { k: 'fc', n: 'Rozpoznawanie osób z kręgu zaufanych', c: 1.2 }, { k: 'ge', n: 'Sterowanie gestami', c: .5 }, { k: 'hz', n: 'Monitoring zdrowia i snu', c: 1 }];
  var P = [
    { n: 'Cukrzyca', on: ['gl', 'ds', 'ge', 'hz'], r: 'Wymiana soczewki co 30 dni, kalibracja sensora co 14 dni, kontrola u okulisty co 6 miesięcy.' },
    { n: 'Niedosłuch', on: ['tr', 'ds', 'ge'], r: 'Wymiana soczewki co 30 dni, patch z mikrofonami co 7 dni.' },
    { n: 'Zaburzenia pamięci', on: ['fc', 'ds', 'ge'], r: 'Wymiana soczewki co 30 dni, krąg zaufanych ustawia opiekun, kontrola co 3 miesiące.' },
    { n: 'Praca międzynarodowa', on: ['tr', 'ds', 'ge'], r: 'Wymiana soczewki co 30 dni, aktualizacja słowników językowych co 3 miesiące.' },
    { n: 'Sen i regeneracja', on: ['hz', 'ge'], r: 'Wariant nocny wymieniany co 7 dni, noszony po decyzji lekarza.' }
  ];
  var tg = $('#tgl'), co = $('#cout'), pc = $('#personas'), state = {}, curP = 0, lastH = null;
  var fmt1 = function (v) { return v.toFixed(1).replace('.', ','); };
  F.forEach(function (f) { var b = document.createElement('button'); b.type = 'button'; b.className = 'tg'; b.setAttribute('role', 'switch'); b.dataset.k = f.k; b.innerHTML = '<span><b>' + f.n + '</b><small>−' + String(f.c).replace('.', ',') + ' h pracy</small></span><i class="sw"></i>'; b.addEventListener('click', function () { state[f.k] = !state[f.k]; curP = -1; paint(); }); tg.appendChild(b); });
  P.forEach(function (p, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = p.n; b.addEventListener('click', function () { curP = i; state = {}; p.on.forEach(function (k) { state[k] = true; }); paint(); }); pc.appendChild(b); });
  function paint() {
    var cost = 0; F.forEach(function (f) { if (state[f.k]) cost += f.c; }); var h = Math.max(0, 23.5 - cost);
    $$('.tg', tg).forEach(function (b) { b.setAttribute('aria-checked', !!state[b.dataset.k]); });
    $$('button', pc).forEach(function (b, i) { b.setAttribute('aria-pressed', i === curP); });
    var rec = curP >= 0 ? P[curP].r : 'Dobierz profil powyżej, aby zobaczyć zalecany harmonogram wymian.', gap = h - 16, from = lastH == null || reduce ? h : lastH; lastH = h;
    co.innerHTML = '<small>Szacowany czas pracy na jednym ładowaniu</small><div class="hours">' + fmt1(from) + '<span>godz.</span></div><div class="meter" role="img" aria-label="Czas pracy ' + fmt1(h) + ' godzin z 24"><i style="width:' + (from / 24 * 100).toFixed(1) + '%"></i><u></u></div><div class="mk">linia przerywana: cel 16 h</div><p>' + (gap >= 0 ? 'Zapas względem celu: +' + fmt1(gap) + ' h. Soczewka starczy na pełny dzień.' : '') + '</p><p>' + rec + '</p>';
    if (from !== h) {
      var hv = $('.hours', co).firstChild, mi = $('.meter i', co), s0 = performance.now();
      mi.style.width = '100%'; mi.style.transform = 'scaleX(' + (h/24) + ')';
      if(mi.animate) mi.animate([{transform:'scaleX('+(from/24)+')'},{transform:'scaleX('+(h/24)+')'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)'});
      (function f(n) { var p = clamp((n - s0) / 500, 0, 1); hv.nodeValue = fmt1(from + (h - from) * easeOut(p)); if (p < 1) requestAnimationFrame(f); })(s0);
    }
  }
  P[0].on.forEach(function (k) { state[k] = true; }); paint();

  /* =========================================================
     KALENDARZ WYMIAN
     ========================================================= */
  var wd = $('#wd'), wl = $('#wl');
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var d0 = new Date(); d0.setDate(d0.getDate() - 5); wd.value = iso(d0); wd.max = iso(new Date());
  var IT = [['Soczewka LumiAI', 30], ['Wariant nocny', 7], ['Sensor łzowy (kalibracja)', 14], ['Patch za uchem', 7], ['Modele AI', 90], ['Wizyta u okulisty', 180]];
  function draw() {
    var p = wd.value.split('-'); if (p.length < 3) return; var st = new Date(+p[0], +p[1] - 1, +p[2]), now = new Date(); now.setHours(0, 0, 0, 0);
    var used = Math.max(0, Math.round((now - st) / 864e5)), h = '<div class="lbar" role="img" aria-label="Zużycie soczewki: ' + Math.min(used, 30) + ' z 30 dni"><i style="width:' + Math.min(100, used / 30 * 100).toFixed(0) + '%"></i></div>';
    IT.forEach(function (it) { var due = new Date(st); due.setDate(due.getDate() + it[1]); var left = Math.round((due - now) / 864e5); var cls = left < 0 ? 'late' : (left <= 3 ? 'soon' : ''), txt = left < 0 ? 'po terminie o ' + (-left) + ' dn.' : (left === 0 ? 'dziś' : 'za ' + left + ' dn.'); h += '<div class="' + cls + '"><b>' + it[0] + '</b><span>' + due.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + txt + '</span></div>'; });
    wl.innerHTML = h;
  }
  wd.addEventListener('input', draw); draw();

  /* =========================================================
     FORMULARZ
     ========================================================= */
  var form = $('#form'), msg = $('#msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var em = $('#em').value.trim(); msg.classList.remove('ok');
    if (!/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = 'Wpisz poprawny adres e-mail, na przykład imie@domena.pl.'; $('#em').focus(); return; }
    msg.textContent = 'Formularz działa poprawnie. To demonstracja — dane nie zostały wysłane ani zapisane.'; msg.classList.add('ok'); form.reset();
  });

  revealSetup();
})();
