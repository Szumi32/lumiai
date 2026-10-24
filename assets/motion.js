/* =========================================================
   LumiAI — warstwa ruchu
   Pasek postępu, żywe tło z paralaksą, karty 3D ze światłem.
   Tylko transform/opacity, jedna pętla rAF uruchamiana przewijaniem.
   ========================================================= */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (q, c) { return [].slice.call((c || document).querySelectorAll(q)); };
  var root = document.documentElement;

  /* ---------- pasek postępu ---------- */
  var bar = document.createElement('div'); bar.className = 'sprog'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);

  /* ---------- żywe tło: poświaty w sekcjach ---------- */
  var GOLD = 'rgba(216,189,134,', SAGE = 'rgba(170,196,180,', CYAN = 'rgba(127,227,240,';
  var par = [];
  $$('main > .sec, main > .world, main > .contact').forEach(function (s, n) {
    var light = s.classList.contains('s-light'), amb = document.createElement('div'); amb.className = 'amb'; amb.setAttribute('aria-hidden', 'true');
    var a = light ? [GOLD + '.42)', SAGE + '.32)'] : [GOLD + '.2)', CYAN + '.09)'];
    var left = n % 2 ? 62 : -12;
    amb.innerHTML =
      '<i style="--s:640px;--c:' + a[0] + ';--o:' + (light ? .55 : .9) + ';--t:28s;left:' + left + '%;top:-8%"><b></b></i>' +
      '<i style="--s:520px;--c:' + a[1] + ';--o:' + (light ? .5 : .9) + ';--t:34s;left:' + (100 - left - 30) + '%;top:52%"><b></b></i>';
    s.insertBefore(amb, s.firstChild);
    $$('i', amb).forEach(function (el, k) { par.push({ el: el, sec: s, k: k ? -.18 : .28, v: true }); });
  });
  $$('.bigword').forEach(function (el) { par.push({ el: el, sec: el.parentElement, k: .22, t: true, base: 'translateX(-50%)' }); });

  /* ---------- pętla przewijania ---------- */
  var ticking = false, VH = innerHeight;
  function frame() {
    ticking = false;
    var h = root.scrollHeight - VH, y = scrollY;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ')';
    if (reduce) return;
    for (var i = 0; i < par.length; i++) {
      var p = par[i], r = p.sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > VH + 200) continue;
      var off = ((r.top + r.height / 2) - VH / 2) * -p.k;
      if (p.t) p.el.style.transform = p.base + ' translate3d(0,' + off.toFixed(1) + 'px,0)';
      else p.el.style.setProperty('--py', off.toFixed(1) + 'px');
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', function () { VH = innerHeight; req(); }, { passive: true });
  frame();

  /* ---------- karty: przechył 3D, reflektor, świecąca krawędź ---------- */
  var CARDS = '.f, .pm, .idea, .biz article, .principle-grid article, .case, .out, .stats > div';
  function setupTilt(el) {
    if (el.__tilt) return; el.__tilt = true; el.classList.add('tilt');
    if (!hover || reduce) return;
    var raf = 0, ev = null;
    function apply() {
      raf = 0; var r = el.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      el.style.setProperty('--rx', ((.5 - py) * 7).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((px - .5) * 9).toFixed(2) + 'deg');
    }
    el.addEventListener('pointerenter', function () { el.classList.add('hov'); });
    el.addEventListener('pointermove', function (e) { ev = e; if (!raf) raf = requestAnimationFrame(apply); });
    el.addEventListener('pointerleave', function () { el.classList.remove('hov'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
  $$(CARDS).forEach(setupTilt);
  /* pomysły i inne karty tworzone dynamicznie */
  if ('MutationObserver' in window) new MutationObserver(function () { $$(CARDS).forEach(setupTilt); }).observe(document.getElementById('ideas') || document.body, { childList: true });
})();
