/* =========================================================
   LumiAI App — logika
   Nawigacja z przejściami, ekrany, sklep, płatności (demo), plany.
   Wszystkie dane są przykładowe; formularze płatności nic nie wysyłają.
   ========================================================= */
(function () {
  'use strict';
  var $ = function (q, c) { return (c || document).querySelector(q); };
  var $$ = function (q, c) { return [].slice.call((c || document).querySelectorAll(q)); };
  var root = document.documentElement, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = $('#stage'), appbar = $('#appbar'), ttl = $('#ttl'), back = $('#back'), tabsEl = $('#tabs'), tabind = $('#tabind'), layer = $('#layer'), paybar = $('#paybar'), wrap = $('#wrap');
  var fmt = function (v, d) { return v.toFixed(d == null ? 1 : d).replace('.', ','); };
  var zl = function (v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  /* lekka wibracja (Android) — dopiero po pierwszym dotknięciu, inaczej przeglądarka ją blokuje */
  var touched = false; addEventListener('pointerdown', function () { touched = true; }, { once: true, capture: true });
  var buzz = function (ms) { if (!touched || !navigator.vibrate) return; try { navigator.vibrate(ms || 8); } catch (e) {} };

  /* ---------- ikony ---------- */
  var I = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
    tr: '<path d="M4 5h9M8.5 3v2M6 5c.5 4 3 7 7 9M12 5c-.5 4-3 7-8 9"/><path d="M14 21l4-10 4 10M15.4 18h5.2"/>',
    hr: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    ey: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    mo: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    ch: '<path d="M9 6l6 6-6 6"/>',
    sl: '<path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z"/>',
    ge: '<path d="M9 11V5a1.5 1.5 0 013 0v5M12 10V4a1.5 1.5 0 013 0v7M15 11V6.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-1a6 6 0 01-5-3l-2.5-4a1.5 1.5 0 012.3-1.8L9 15"/>',
    bk: '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M8 7h7M8 11h7"/>',
    lk: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    us: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M17 11a3 3 0 100-6M18 14.5a6 6 0 013.5 5.5"/>',
    st: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    in: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    se: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
    rc: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    bell: '<path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    clinic: '<path d="M4 21V8l8-5 8 5v13"/><path d="M10 21v-5h4v5M12 9v4M10 11h4"/>',
    locker: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M8 9h1M15 9h1M8 14h1M15 14h1"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8z"/>'
  };
  var svg = function (k, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 1.7) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; };

  /* ---------- stan (zapamiętywany lokalnie) ---------- */
  var DEF = {
    name: 'Szymon', full: 'Szymon Brzozowski', wear: 5, bat: 78, cas: 92, meds: false, lo: 3.9, hi: 10,
    fun: { tr: true, ds: true, gl: true, fc: true, ge: true, hz: true },
    circle: [{ n: 'Córka', r: 'rodzina', on: true }, { n: 'Lekarz prowadzący', r: 'klinika okulistyczna', on: true }, { n: 'Opiekun', r: 'opieka domowa', on: false }],
    priv: { doc: true, care: false, face: true }, notif: { gl: true, med: true, rep: false },
    plan: 'plus',
    methods: [{ id: 'm1', type: 'card', brand: 'Visa', last4: '4242', exp: '08/29', def: true }, { id: 'm2', type: 'blik', def: false }],
    orders: [{ no: 'LA-24817', date: '2 paź 2026', items: 'LumiAI One · 3 miesiące', total: 511.99, st: 3 }],
    read: false
  };
  var ST;
  try { localStorage.removeItem('lumi-app-v2'); ST = JSON.parse(localStorage.getItem('lumi-app-v3') || 'null'); } catch (e) { ST = null; }
  if (!ST || typeof ST !== 'object') ST = JSON.parse(JSON.stringify(DEF));
  Object.keys(DEF).forEach(function (k) { if (ST[k] == null) ST[k] = JSON.parse(JSON.stringify(DEF[k])); });
  function save() { try { localStorage.setItem('lumi-app-v3', JSON.stringify(ST)); } catch (e) {} }

  /* ---------- dane przykładowe ---------- */
  var gl = [], NOW = 14.2;
  (function () { var g = function (t, m, s) { return Math.exp(-Math.pow(t - m, 2) / (2 * s * s)); }; for (var i = 0; i <= 28; i++) { var t = i * .5, v = 5.2 + .8 * Math.sin(i * .4) + 2.3 * g(t, 8.2, .9) + 2.8 * g(t, 13.2, .9) - 1.7 * g(t, 11.6, .5); gl.push([t, Math.max(3, Math.min(13, v))]); } gl.push([NOW, gl[gl.length - 1][1] * .98 + .1]); })();
  var cur = gl[gl.length - 1][1], prev = gl[gl.length - 3][1], trend = cur > prev + .15 ? '↗' : (cur < prev - .15 ? '↘' : '→');
  var COST = { tr: 2.5, ds: 1.5, gl: .8, fc: 1.2, ge: .5, hz: 1 };
  var FN = { tr: 'Tłumaczenie na żywo', ds: 'Wyświetlacz AI i przypomnienia', gl: 'Pomiar glukozy', fc: 'Rozpoznawanie osób zaufanych', ge: 'Sterowanie gestami', hz: 'Monitoring zdrowia i snu' };
  var PLANS = {
    care: { n: 'Care', p: 149, f: ['Soczewka co 30 dni', 'Aplikacja i przypomnienia', 'Tłumaczenie: 10 języków'] },
    plus: { n: 'Care+', p: 199, f: ['Wszystko z Care', 'Tłumaczenie: 40+ języków', 'Panel lekarza i opiekuna', 'Wariant nocny raz w kwartale'] },
    clinic: { n: 'Clinic', p: 0, f: ['Dla klinik i szpitali', 'Licencja na tłumaczenie wywiadu', 'Panel do prowadzenia pacjentów'] }
  };
  var PACKS = [{ k: 'm1', n: '1 miesiąc', s: '1 para · 30 dni', p: 179 }, { k: 'm3', n: '3 miesiące', s: '3 pary · oszczędzasz 38 zł', p: 499, old: 537 }, { k: 'm6', n: '6 miesięcy', s: '6 par · oszczędzasz 125 zł', p: 949, old: 1074 }];
  var ADDS = [{ k: 'case', n: 'Etui ładujące', s: 'ładowanie i czyszczenie', p: 249 }, { k: 'patch', n: 'Patch za uchem ×4', s: 'mikrofony i antena', p: 59 }];
  var DELIV = [{ k: 'locker', n: 'Paczkomat', s: 'jutro do 12:00', p: 12.99, i: 'locker' }, { k: 'courier', n: 'Kurier', s: 'jutro, 9:00–17:00', p: 19.99, i: 'truck' }, { k: 'clinic', n: 'Odbiór w klinice', s: 'z dopasowaniem przez okulistę', p: 0, i: 'clinic' }];
  var NOTIF = [['14:10', 'Przypomnienie o leku za 20 minut', 'Metformina 500 mg', 'drop'], ['11:40', 'Spadek glukozy do 4,1 mmol/L', 'Ostrzeżenie pokazane w soczewce', 'hr'], ['09:00', 'Zamówienie LA-24817 dostarczone', 'Paczkomat WAW123M', 'box'], ['wczoraj', 'Raport snu jest gotowy', '7 h 12 min · 2 przebudzenia', 'sl']];

  /* ---------- komunikaty: Dynamic Island / toast ---------- */
  var island = $('#island'), ilt = $('#ilt'), islT = 0;
  function toast(t, ic) {
    buzz();
    if (island.offsetParent) { ilt.innerHTML = '<i>' + (ic || '✓') + '</i><span>' + esc(t) + '</span>'; island.classList.add('wide'); clearTimeout(islT); islT = setTimeout(function () { island.classList.remove('wide'); }, 2600); return; }
    var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.innerHTML = '<i>' + (ic || '✓') + '</i><span>' + esc(t) + '</span>'; wrap.appendChild(d);
    requestAnimationFrame(function () { d.classList.add('on'); }); setTimeout(function () { d.classList.remove('on'); setTimeout(function () { d.remove(); }, 600); }, 2600);
  }
  /* ---------- arkusz od dołu (z przeciąganiem w dół) ---------- */
  function sheet(html, mount) {
    var s = document.createElement('div'); s.className = 'sheet'; s.innerHTML = '<div class="bd"></div><div class="pn" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
    layer.appendChild(s); var pn = $('.pn', s);
    function close() { s.classList.remove('on'); setTimeout(function () { s.remove(); }, 500); }
    $('.bd', s).onclick = close;
    var y0 = null, dy = 0;
    $('.grab', s).addEventListener('pointerdown', function (e) { y0 = e.clientY; pn.style.transition = 'none'; this.setPointerCapture(e.pointerId); });
    $('.grab', s).addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); pn.style.transform = 'translateY(' + dy + 'px)'; });
    $('.grab', s).addEventListener('pointerup', function () { pn.style.transition = ''; pn.style.transform = ''; if (dy > 90) close(); y0 = null; dy = 0; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.add('on'); }); });
    if (mount) mount(pn, close);
    return close;
  }
  function overlay(html) { var o = document.createElement('div'); o.className = 'ovl'; o.innerHTML = html; layer.appendChild(o); requestAnimationFrame(function () { o.classList.add('on'); }); return { el: o, close: function () { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 400); } }; }
  function confetti(el) { var c = document.createElement('div'); c.className = 'confetti'; var cols = ['#C3A063', '#E3CB97', '#7FE3F0', '#EDE7DC']; for (var i = 0; i < 40; i++) { var b = document.createElement('i'), a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 180; b.style.cssText = '--x:' + Math.cos(a) * r + 'px;--y:' + (Math.sin(a) * r + 120) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg;background:' + cols[i % 4] + ';animation-delay:' + Math.random() * .15 + 's'; c.appendChild(b); } el.appendChild(c); }
  function countUp(el) {
    $$('[data-to]', el).forEach(function (n) {
      var to = parseFloat(n.dataset.to), d = +n.dataset.dec || 0, suf = n.dataset.suf || '';
      if (reduce) { n.textContent = fmt(to, d) + suf; return; }
      var s = performance.now(); (function f(t) { var p = Math.min(1, (t - s) / 1100), e = 1 - Math.pow(1 - p, 3); n.textContent = fmt(to * e, d) + suf; if (p < 1) requestAnimationFrame(f); })(s);
    });
  }
  function bindSeg(seg) { var ind = $('.ind', seg); if (!ind) return; var b = $('[aria-pressed="true"]', seg) || $('button', seg); if (!b) return; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + (b.offsetLeft - 4) + 'px)'; }

  /* =========================================================
     EKRANY
     ========================================================= */
  var T = { start: 'Start', tl: 'Tłumacz', zd: 'Zdrowie', so: 'Soczewka', mo: 'Więcej', fn: 'Funkcje i gesty', kb: 'Baza wiedzy', pr: 'Prywatność', kr: 'Krąg zaufanych', us: 'Ustawienia', op: 'O projekcie', sr: 'Wyszukiwanie', plan: 'Plan i płatności', ord: 'Zamówienia', notif: 'Powiadomienia', shop: 'Zamów soczewki' };
  var TABOF = { start: 'start', tl: 'tl', zd: 'zd', so: 'so', mo: 'mo', fn: 'mo', kb: 'mo', pr: 'mo', kr: 'mo', us: 'mo', op: 'mo', sr: 'start', plan: 'mo', ord: 'mo', notif: 'start', shop: 'so' };
  var TABS = [['start', 'Start', 'home'], ['tl', 'Tłumacz', 'tr'], ['zd', 'Zdrowie', 'hr'], ['so', 'Soczewka', 'ey'], ['mo', 'Więcej', 'mo']];
  var R = {};

  function hello() { var h = new Date().getHours(); return h < 5 ? 'Dobranoc' : h < 12 ? 'Dzień dobry' : h < 18 ? 'Miłego dnia' : 'Dobry wieczór'; }
  var lensSVG = '<svg viewBox="0 0 100 100" fill="none"><defs><radialGradient id="lg1" cx="40%" cy="35%"><stop offset="0" stop-color="#7FE3F0" stop-opacity=".35"/><stop offset="1" stop-color="#7FE3F0" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill="url(#lg1)"/><circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,.35)"/><g class="rot"><circle cx="50" cy="50" r="38" stroke="#C3A063" stroke-dasharray="2 4"/><rect x="46" y="86" width="8" height="4" rx="1" fill="#C3A063"/></g><circle cx="50" cy="50" r="31" stroke="rgba(127,227,240,.7)" stroke-dasharray="1 3" stroke-width="2"/><circle cx="38" cy="36" r="6" fill="rgba(255,255,255,.5)"/></svg>';

  R.start = function (el) {
    var left = 30 - ST.wear;
    el.innerHTML = '<h1 class="big-t"><small>' + new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }) + '</small>' + hello() + ',<br><em>' + esc(ST.name) + '.</em></h1>' +
      '<div class="stack in">' +
      '<label class="search" style="--i:0"><span aria-hidden="true">' + svg('se') + '</span><input id="q" type="search" placeholder="Szukaj w aplikacji" aria-label="Szukaj"></label>' +
      '<div class="card hero" style="--i:1"><div class="row" style="align-items:flex-start"><div><span class="lbl">Soczewka LumiAI One</span><div class="num" style="margin:12px 0 6px;font-size:3rem"><span data-to="' + ST.bat + '">0</span><span style="font-size:1.2rem">%</span></div><span class="pill ok"><i class="dot"></i>połączona · przed chwilą</span></div><div class="lensviz">' + lensSVG + '</div></div>' +
      '<div class="row" style="margin-top:16px;font-size:.78rem;color:rgba(237,231,220,.6)"><span>Dzień ' + ST.wear + ' z 30</span><span>' + left + ' dni do wymiany</span></div><div class="meter glow" style="margin-top:8px"><i data-w="' + (ST.wear / 30 * 100) + '"></i></div></div>' +
      '<div class="grid2" style="--i:2">' +
      '<button class="tile" data-go="zd" data-sub="gluc"><span class="ti">' + svg('drop') + '</span><span class="num"><span data-to="' + cur.toFixed(1) + '" data-dec="1">0</span></span><small>mmol/L ' + trend + ' · w normie</small></button>' +
      '<button class="tile" data-go="zd" data-sub="sleep"><span class="ti">' + svg('sl') + '</span><span class="num">7 h 12</span><small>sen · 2 przebudzenia</small></button>' +
      '<button class="tile" data-go="tl"><span class="ti">' + svg('tr') + '</span><span class="num" style="font-size:1.6rem;padding-block:3px">ZH → PL</span><small>tłumacz gotowy</small></button>' +
      '<button class="tile" data-go="shop"><span class="ti">' + svg('bag') + '</span><span class="num"><span data-to="' + left + '">0</span> dni</span><small>zamów nowe soczewki</small></button></div>' +
      '<div class="card" style="--i:3"><div class="row"><h3 style="font:400 1.5rem var(--serif)">Dziś</h3><span class="note">dane przykładowe</span></div><div class="tl">' +
      '<div class="item"><time>08:05</time><span class="t"><b>Poranna dawka potwierdzona</b><small>gestem, 2× mrugnięcie</small></span><span class="pill ok">✓</span></div>' +
      '<div class="item"><time>11:40</time><span class="t"><b>Spadek glukozy do 4,1</b><small>ostrzeżenie pokazane w soczewce</small></span><span class="pill warn">alert</span></div>' +
      '<div class="item"><time>14:30</time><span class="t"><b>Metformina 500 mg</b><small>przypomnienie za 20 minut</small></span><button class="btn sm" id="med">' + (ST.meds ? '✓ Gotowe' : 'Potwierdź') + '</button></div>' +
      '<div class="item"><time>22:00</time><span class="t"><b>Zdejmij soczewkę do etui</b><small>ładowanie i czyszczenie</small></span></div></div></div>' +
      '<button class="btn sos full hold" id="sos" style="--i:4"><span class="fill"></span><span style="position:relative">Przytrzymaj, aby wezwać pomoc</span></button>' +
      '<p class="note" style="text-align:center;--i:5">Alarm SOS trafia do opiekuna i lekarza. W wersji demo nic nie jest wysyłane.</p></div>';
    var mb = $('#med', el);
    mb.onclick = function () { ST.meds = !ST.meds; save(); mb.textContent = ST.meds ? '✓ Gotowe' : 'Potwierdź'; mb.animate && mb.animate([{ transform: 'scale(.9)' }, { transform: 'scale(1.06)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.34,1.4,.5,1)' }); toast(ST.meds ? 'Dawka zapisana w raporcie lekarza' : 'Cofnięto potwierdzenie'); };
    var sos = $('#sos', el), ht = 0;
    function hs(e) { e.preventDefault(); sos.classList.add('on'); buzz(15); ht = setTimeout(function () { sos.classList.remove('on'); buzz([30, 40, 30]); var o = overlay('<svg class="check" viewBox="0 0 88 88"><circle cx="44" cy="44" r="40"/><path d="M28 45l11 11 21-23"/></svg><h3>Alarm wysłany</h3><p>Opiekun i lekarz prowadzący dostali powiadomienie z Twoją lokalizacją. (demo)</p><button class="btn ghost" id="ok">Zamknij</button>'); $('#ok', o.el).onclick = o.close; }, 1500); }
    function he() { clearTimeout(ht); sos.classList.remove('on'); }
    sos.addEventListener('pointerdown', hs); sos.addEventListener('pointerup', he); sos.addEventListener('pointerleave', he); sos.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') hs(e); }); sos.addEventListener('keyup', he);
    var q = $('#q', el); q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && q.value.trim()) go('sr', q.value.trim()); });
  };

  /* ---------- tłumacz ---------- */
  var LANGS = [
    { n: 'Chiński', c: 'zh-CN', s: '请问，去中央火车站怎么走？', r: 'Qǐngwèn, qù zhōngyāng huǒchēzhàn zěnme zǒu?', p: 'Przepraszam, jak dojść na dworzec centralny?', a: { s: '一直往前走，然后左转。', r: 'Yìzhí wǎng qián zǒu, ránhòu zuǒ zhuǎn.', w: 'i-dżyj łang cjen dzou, ran-hou dzuo dżuan.', m: 'Proszę iść prosto, a potem w lewo.' } },
    { n: 'Angielski', c: 'en-US', s: 'Take one tablet after breakfast.', r: '', p: 'Weź jedną tabletkę po śniadaniu.', a: { s: 'Thank you, I will.', r: '', w: 'fank ju, aj uil.', m: 'Dziękuję, tak zrobię.' } },
    { n: 'Niemiecki', c: 'de-DE', s: 'Haben Sie Schmerzen in der Brust?', r: '', p: 'Czy czuje Pan ból w klatce piersiowej?', a: { s: 'Nein, keine Schmerzen.', r: '', w: 'najn, kajne szmercen.', m: 'Nie, nic mnie nie boli.' } },
    { n: 'Ukraiński', c: 'uk-UA', s: 'Чи є у вас алергія на ліки?', r: 'Czy je u was alerhija na liky?', p: 'Czy ma Pan alergię na leki?', a: { s: 'Ні, алергії немає.', r: 'Ni, alerhiji nemaje.', w: 'ni, alerhiji nemaje.', m: 'Nie, nie mam alergii.' } },
    { n: 'Japoński', c: 'ja-JP', s: 'どこが痛いですか？', r: 'Doko ga itai desu ka?', p: 'Gdzie boli?', a: { s: '頭が痛いです。', r: 'Atama ga itai desu.', w: 'atama ga itaj des.', m: 'Boli mnie głowa.' } },
    { n: 'Hiszpański', c: 'es-ES', s: '¿Desde cuándo tiene fiebre?', r: '', p: 'Od kiedy ma Pan gorączkę?', a: { s: 'Desde ayer.', r: '', w: 'desde ajer.', m: 'Od wczoraj.' } }
  ];
  var li = 0, voiceOn = true;
  function bestVoice(lang) {
    if (!window.speechSynthesis) return null; var l = lang.slice(0, 2).toLowerCase(), b = null, bs = -99;
    speechSynthesis.getVoices().forEach(function (v) { if (v.lang.replace('_', '-').toLowerCase().indexOf(l) !== 0) return; var s = 0, n = v.name; if (/natural|neural/i.test(n)) s += 10; if (/online/i.test(n)) s += 3; if (/google/i.test(n)) s += 6; if (/premium|enhanced|siri/i.test(n)) s += 7; if (v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()) s += 2; if (s > bs) { bs = s; b = v; } });
    return b;
  }
  R.tl = function (el) {
    el.innerHTML = '<h1 class="big-t"><small>Rozmowa na żywo</small>Tłumacz</h1><div class="stack in">' +
      '<div class="chips" id="lg" role="group" aria-label="Język rozmówcy" style="--i:0"></div>' +
      '<div class="card" style="--i:1;min-height:260px"><div class="row"><span class="lbl">Napisy w soczewce</span><span class="pill ok"><i class="dot"></i>aktywne</span></div><div id="conv" style="display:grid;gap:10px;margin-top:14px"></div></div>' +
      '<button class="mic" id="talk" aria-label="Pokaż przykładową rozmowę" style="--i:2">' + svg('mic', 1.9) + '</button><p class="note" style="text-align:center;--i:3" id="hint">Dotknij, aby zobaczyć przykładową rozmowę</p>' +
      '<button class="item" role="switch" aria-checked="' + voiceOn + '" id="vo" style="--i:4;border:1px solid var(--line);border-radius:18px;padding:14px 16px;background:var(--card)"><span class="t"><b>Głos lektora</b><small id="vname">najbardziej naturalny dostępny głos</small></span><i class="sw"></i></button></div>';
    var lg = $('#lg', el), conv = $('#conv', el), timers = [], hint = $('#hint', el), mic = $('#talk', el);
    function empty() { conv.innerHTML = '<p class="note" style="padding:30px 0;text-align:center">Rozmówca mówi po ' + LANGS[li].n.toLowerCase().replace(/i$/, 'u').replace('ski', 'sku') + '. Tłumaczenie pojawi się tutaj i w soczewce.</p>'; }
    LANGS.forEach(function (l, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = l.n; b.setAttribute('aria-pressed', i === li); b.onclick = function () { li = i; $$('button', lg).forEach(function (x, j) { x.setAttribute('aria-pressed', j === i); }); stop(); empty(); }; lg.appendChild(b); });
    empty();
    $('#vo', el).onclick = function () { voiceOn = !voiceOn; this.setAttribute('aria-checked', voiceOn); };
    function say(t, lang) { if (!voiceOn || !window.speechSynthesis) return; var v = bestVoice(lang); if (!v) return; var u = new SpeechSynthesisUtterance(t); u.voice = v; u.lang = v.lang; u.rate = .92; speechSynthesis.speak(u); }
    function stop() { timers.forEach(clearTimeout); timers = []; try { speechSynthesis.cancel(); } catch (e) {} mic.classList.remove('live'); }
    function at(fn, d) { timers.push(setTimeout(fn, d)); }
    function add(h) { var t = $('.typing', conv); if (t) t.remove(); conv.insertAdjacentHTML('beforeend', h); conv.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    mic.onclick = function () {
      stop(); var l = LANGS[li]; conv.innerHTML = ''; mic.classList.add('live'); hint.textContent = 'Słucham rozmówcy…';
      var v = bestVoice(l.c); $('#vname', el).textContent = v ? v.name : 'brak głosu dla tego języka — same napisy';
      at(function () { add('<span class="typing"><i></i><i></i><i></i></span>'); }, 150);
      at(function () { add('<div class="bub in"><div class="lbl">' + l.n + ' · rozmówca</div><div class="src">' + l.s + '</div>' + (l.r ? '<div class="rom">' + l.r + '</div>' : '') + '</div>'); say(l.s, l.c); }, 1100);
      at(function () { add('<div class="hud"><div class="lbl" style="color:#7FE3F0;margin-bottom:4px">Tłumaczenie w soczewce</div>' + l.p + '</div>'); say(l.p, 'pl-PL'); hint.textContent = 'Podpowiadam odpowiedź…'; }, 3600);
      at(function () { add('<div class="bub out"><div class="lbl" style="color:inherit;opacity:.7">Powiedz po: ' + l.n.toLowerCase() + '</div><div class="src">' + l.a.s + '</div>' + (l.a.r ? '<div class="rom">' + l.a.r + '</div>' : '') + '<div style="font-size:.82rem;margin-top:6px">Wymowa: <b>' + l.a.w + '</b></div><div style="font-size:.8rem;opacity:.8">= ' + l.a.m + '</div></div>'); say(l.a.s, l.c); mic.classList.remove('live'); hint.textContent = 'Dotknij, aby powtórzyć'; }, 6800);
    };
    el._cleanup = stop;
  };

  /* ---------- zdrowie ---------- */
  function glChart() {
    var W = 340, H = 180, L = 30, Rr = 8, Tp = 8, B = 22, x = function (t) { return L + t / 24 * (W - L - Rr); }, y = function (v) { return Tp + (14 - v) / 12 * (H - Tp - B); };
    var d = ''; gl.forEach(function (p, i) { d += (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1); });
    var area = d + 'L' + x(NOW).toFixed(1) + ' ' + (H - B) + 'L' + L + ' ' + (H - B) + 'Z';
    var g = ''; [4, 8, 12].forEach(function (v) { g += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line2)" stroke-dasharray="2 4"/><text x="0" y="' + (y(v) + 3) + '">' + v + '</text>'; });
    [0, 6, 12, 18, 24].forEach(function (h) { g += '<text x="' + x(h) + '" y="' + (H - 6) + '" text-anchor="' + (h === 0 ? 'start' : h === 24 ? 'end' : 'middle') + '">' + ('0' + h).slice(-2) + ':00</text>'; });
    var e = gl[gl.length - 1];
    return '<svg class="chart" id="gc" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Wykres glukozy z ostatnich 24 godzin"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C3A063" stop-opacity=".35"/><stop offset="1" stop-color="#C3A063" stop-opacity="0"/></linearGradient></defs><rect x="' + L + '" y="' + y(ST.hi) + '" width="' + (W - L - Rr) + '" height="' + (y(ST.lo) - y(ST.hi)) + '" fill="var(--card2)" rx="4"/>' + g + '<path class="area" d="' + area + '" fill="url(#ga)"/><path class="ln" d="' + d + '" fill="none" stroke="#C3A063" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><line id="gcl" y1="' + Tp + '" y2="' + (H - B) + '" stroke="var(--tx)" stroke-opacity=".35" hidden/><circle id="gcp" cx="' + x(e[0]) + '" cy="' + y(e[1]) + '" r="5" fill="#C3A063" stroke="var(--card)" stroke-width="3"/></svg>';
  }
  var SEG = [['A', 6], ['L', 24], ['D', 50], ['L', 20], ['R', 12], ['L', 30], ['D', 44], ['L', 18], ['R', 18], ['L', 26], ['A', 4], ['L', 22], ['D', 20], ['L', 20], ['R', 26], ['L', 24], ['A', 3], ['L', 20], ['R', 34], ['L', 11]];
  function hyp() {
    var TOT = 432, S0 = 23 * 60 + 10, YS = { A: 6, R: 36, L: 66, D: 96 }, C = { A: 'var(--sa)', R: 'var(--sr)', L: 'var(--sl)', D: 'var(--sd)' }, N = { A: 'Przebudzenie', R: 'Faza REM', L: 'Sen lekki', D: 'Sen głęboki' };
    var hm = function (m) { m = (S0 + m) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); };
    var a = 0, r = '', g = ''; SEG.forEach(function (s, i) { var x = 52 + a / TOT * 282, w = Math.max(2, s[1] / TOT * 282 - 1); r += '<rect tabindex="0" class="hs" style="animation-delay:' + (i * 40) + 'ms" data-d="' + N[s[0]] + ' · ' + hm(a) + '–' + hm(a + s[1]) + ' (' + s[1] + ' min)" x="' + x.toFixed(1) + '" y="' + YS[s[0]] + '" width="' + w.toFixed(1) + '" height="22" rx="4" fill="' + C[s[0]] + '"/>'; a += s[1]; });
    [['Wybudz.', 6], ['REM', 36], ['Lekki', 66], ['Głęb.', 96]].forEach(function (l) { g += '<text x="0" y="' + (l[1] + 15) + '">' + l[0] + '</text>'; });
    [0, 120, 240, 360, 432].forEach(function (m) { g += '<text x="' + (52 + m / TOT * 282) + '" y="140" text-anchor="' + (m === 0 ? 'start' : m === 432 ? 'end' : 'middle') + '">' + hm(m) + '</text>'; });
    return '<svg class="chart" viewBox="0 0 340 146" role="img" aria-label="Fazy snu w ciągu nocy">' + g + r + '</svg>';
  }
  var zsub = 'gluc';
  R.zd = function (el, arg) {
    if (arg) zsub = arg;
    el.innerHTML = '<h1 class="big-t"><small>Dane z soczewki</small>Zdrowie</h1><div class="seg" id="zs" role="group" aria-label="Sekcja zdrowia"><span class="ind"></span><button data-z="gluc">Glukoza</button><button data-z="sleep">Sen</button><button data-z="vit">Wskaźniki</button></div><div id="zb" style="margin-top:12px"></div>';
    var zb = $('#zb', el), zs = $('#zs', el);
    function draw() {
      $$('button', zs).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.z === zsub); }); bindSeg(zs);
      if (zsub === 'gluc') {
        var inr = gl.filter(function (p) { return p[1] >= ST.lo && p[1] <= ST.hi; }).length / gl.length * 100, lo = gl.filter(function (p) { return p[1] < ST.lo; }).length / gl.length * 100, hi = 100 - inr - lo;
        zb.innerHTML = '<div class="stack in"><div class="card" style="--i:0"><div class="row"><div><span class="lbl">Teraz</span><div class="num" id="gv" style="margin-top:8px"><span data-to="' + cur.toFixed(1) + '" data-dec="1">0</span> <span style="font:500 .85rem var(--sans);color:var(--tx3)">mmol/L ' + trend + '</span></div></div><span class="pill ok"><i class="dot"></i>w normie</span></div><div style="margin-top:14px">' + glChart() + '</div><p class="note" id="gr">Przesuń palcem po wykresie, aby zobaczyć pomiar.</p></div>' +
          '<div class="card" style="--i:1"><span class="lbl">Czas w zakresie ' + fmt(ST.lo) + '–' + fmt(ST.hi) + ' mmol/L · dziś</span><div class="tir" style="margin-top:12px"><span style="width:' + inr + '%;background:#2F7D5D">' + Math.round(inr) + '%</span>' + (hi > 1 ? '<span style="width:' + hi + '%;background:#B88A2E">' + Math.round(hi) + '%</span>' : '') + (lo > 1 ? '<span style="width:' + lo + '%;background:#A9473C">' + Math.round(lo) + '%</span>' : '') + '</div><p class="note" style="margin-top:10px">zielony: w zakresie · żółty: powyżej · czerwony: poniżej</p></div></div>';
        countUp(zb);
        var svgc = $('#gc', zb), ln = $('#gcl', zb), pt = $('#gcp', zb), rd = $('#gr', zb);
        var mv = function (e) { var r = svgc.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 340, t = Math.max(0, Math.min(NOW, (px - 30) / 302 * 24)), best = gl[0]; gl.forEach(function (p) { if (Math.abs(p[0] - t) < Math.abs(best[0] - t)) best = p; }); var X = 30 + best[0] / 24 * 302, Y = 8 + (14 - best[1]) / 12 * 150; ln.hidden = false; ln.setAttribute('x1', X); ln.setAttribute('x2', X); pt.setAttribute('cx', X); pt.setAttribute('cy', Y); var hh = Math.floor(best[0]), mm = Math.round((best[0] - hh) * 60); rd.textContent = ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ' · ' + fmt(best[1]) + ' mmol/L'; };
        svgc.addEventListener('pointermove', mv); svgc.addEventListener('pointerdown', mv);
      } else if (zsub === 'sleep') {
        var tot = { A: 0, R: 0, L: 0, D: 0 }; SEG.forEach(function (s) { tot[s[0]] += s[1]; }); var C = 2 * Math.PI * 56, sc = 84;
        zb.innerHTML = '<div class="stack in"><div class="card hero" style="--i:0"><div class="row" style="gap:16px"><div class="ring"><svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="56" fill="none" stroke="rgba(237,231,220,.1)" stroke-width="9"/><circle class="rp" cx="66" cy="66" r="56" fill="none" stroke="#7FE3F0" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' + (C * (1 - sc / 100)).toFixed(1) + '"/></svg><div><b data-to="' + sc + '">0</b><small>ocena snu</small></div></div><div><span class="lbl">Noc 5–6 października</span><div class="num" style="margin:8px 0;font-size:2.1rem">7 h 12 min</div><div class="row" style="justify-content:flex-start;gap:16px;font-size:.8rem;color:rgba(237,231,220,.65)"><span>REM <b style="color:#fff">' + Math.round(tot.R / 432 * 100) + '%</b></span><span>głęboki <b style="color:#fff">' + Math.round(tot.D / 432 * 100) + '%</b></span></div></div></div></div>' +
          '<div class="card" style="--i:1"><span class="lbl">Fazy snu · dotknij fragmentu</span><div style="margin-top:10px">' + hyp() + '</div><p class="note" id="hr2">Wybierz fragment nocy.</p></div>' +
          '<div class="card pad0" style="--i:2"><div class="item"><span class="t"><b>Przebudzenia</b></span><b>2</b></div><div class="item"><span class="t"><b>Tętno spoczynkowe</b></span><b>58 / min</b></div><div class="item"><span class="t"><b>Wariant nocny</b></span><b>dzień 3 z 7</b></div></div><p class="note" style="--i:3">Dane przykładowe. Wariant nocny jest noszony tylko po decyzji lekarza.</p></div>';
        countUp(zb); requestAnimationFrame(function () { requestAnimationFrame(function () { var rp = $('.rp', zb); if (rp) rp.style.strokeDashoffset = rp.dataset.off; }); });
        $$('.hs', zb).forEach(function (r) { var f = function () { $('#hr2', zb).textContent = r.dataset.d; }; r.addEventListener('pointerenter', f); r.addEventListener('focus', f); r.addEventListener('click', f); });
      } else {
        var V = [['Tętno spoczynkowe', '58 / min', 'ok', 'w normie', 'hr'], ['Ciśnienie w oku', '15 mmHg', 'ok', 'w normie', 'ey'], ['Nawodnienie', 'niskie', 'warn', 'wypij szklankę wody', 'drop'], ['Stres (szacunek)', 'umiarkowany', 'neutral', 'dzisiaj', 'in'], ['Czas przy ekranie', '5 h 20 min', 'warn', 'zrób przerwę', 'phone'], ['Mruganie', '14 / min', 'ok', 'w normie', 'ey']];
        zb.innerHTML = '<div class="stack in"><div class="card pad0" style="--i:0"><div class="list">' + V.map(function (v) { return '<div class="item"><span class="ic">' + svg(v[4]) + '</span><span class="t"><b>' + v[0] + '</b><small>' + v[3] + '</small></span><span class="pill ' + v[2] + '">' + v[1] + '</span></div>'; }).join('') + '</div></div><p class="note" style="--i:1">Wskaźniki mają charakter orientacyjny i nie zastępują badania lekarskiego.</p></div>';
      }
    }
    $$('button', zs).forEach(function (b) { b.onclick = function () { if (zsub === b.dataset.z) return; zsub = b.dataset.z; buzz(5); draw(); }; });
    draw(); setTimeout(function () { bindSeg(zs); }, 60);
  };

  /* ---------- soczewka ---------- */
  var IT = [['Soczewka LumiAI', 30, 'co 30 dni'], ['Wariant nocny', 7, 'co 7 dni'], ['Sensor łzowy (kalibracja)', 14, 'co 14 dni'], ['Patch za uchem', 7, 'co 7 dni'], ['Modele AI', 90, 'co 3 miesiące'], ['Wizyta u okulisty', 180, 'co 6 miesięcy']];
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  R.so = function (el) {
    var left = 30 - ST.wear, C = 2 * Math.PI * 56, d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() - ST.wear);
    el.innerHTML = '<h1 class="big-t"><small>LumiAI One · nr seryjny LA1-0042</small>Soczewka</h1><div class="stack in">' +
      '<div class="card" style="--i:0"><div class="row" style="gap:18px"><div class="ring"><svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="56" fill="none" stroke="var(--line2)" stroke-width="9"/><circle class="rp" cx="66" cy="66" r="56" fill="none" stroke="#C3A063" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' + (C * (ST.wear / 30)).toFixed(1) + '"/></svg><div><b data-to="' + left + '">0</b><small>dni do wymiany</small></div></div>' +
      '<div style="flex:1;min-width:0"><span class="lbl">Obecna soczewka</span><p style="margin:6px 0 12px;font-weight:600">Dzień ' + ST.wear + ' z 30</p><div class="fld"><label for="wd">Data założenia</label><input id="wd" type="date" value="' + iso(d0) + '" max="' + iso(new Date()) + '"></div></div></div></div>' +
      '<div class="grid2" style="--i:1"><div class="card"><span class="lbl">Bateria</span><div class="num" style="font-size:2rem;margin:8px 0 12px"><span data-to="' + ST.bat + '">0</span>%</div><div class="meter glow"><i data-w="' + ST.bat + '"></i></div></div><div class="card"><span class="lbl">Etui</span><div class="num" style="font-size:2rem;margin:8px 0 12px"><span data-to="' + ST.cas + '">0</span>%</div><div class="meter"><i data-w="' + ST.cas + '"></i></div></div></div>' +
      '<button class="card" data-go="shop" style="--i:2;text-align:left;width:100%;display:flex;gap:14px;align-items:center;border-color:rgba(195,160,99,.4)"><span class="ic" style="width:46px;height:46px;border-radius:14px">' + svg('bag') + '</span><span style="flex:1"><b style="display:block;font-weight:700">Zamów nowe soczewki</b><small style="color:var(--tx3);font-size:.8rem">od 179 zł · dostawa jutro</small></span><span class="chev">' + svg('ch', 2) + '</span></button>' +
      '<div class="card pad0" style="--i:3"><div class="sec-h" style="padding:14px 0 4px"><h3>Kalendarz wymian</h3></div><div class="list" id="cal"></div></div>' +
      '<div class="grid2" style="--i:4"><button class="btn ghost" id="cal2"><span class="cf" style="position:absolute;left:0;top:0;bottom:0;width:0;background:color-mix(in srgb,var(--gold) 25%,transparent);transition:width .15s linear"></span><span style="position:relative" id="cal2t">Skalibruj sensor</span></button><button class="btn" data-go="ord">Zamówienia</button></div></div>';
    function cal() { var now = new Date(); now.setHours(0, 0, 0, 0); $('#cal', el).innerHTML = IT.map(function (it) { var due = new Date(d0); due.setDate(due.getDate() + it[1]); var lf = Math.round((due - now) / 864e5), cls = lf < 0 ? 'bad' : lf <= 3 ? 'warn' : 'ok'; return '<div class="item"><span class="t"><b>' + it[0] + '</b><small>' + it[2] + ' · ' + due.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) + '</small></span><span class="pill ' + cls + '">' + (lf < 0 ? 'po terminie ' + (-lf) + ' dn.' : lf === 0 ? 'dziś' : 'za ' + lf + ' dn.') + '</span></div>'; }).join(''); }
    cal(); countUp(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { var rp = $('.rp', el); if (rp) rp.style.strokeDashoffset = rp.dataset.off; }); });
    $('#wd', el).onchange = function () { var p = this.value.split('-'); if (p.length < 3) return; var s = new Date(+p[0], +p[1] - 1, +p[2]), n = new Date(); n.setHours(0, 0, 0, 0); ST.wear = Math.max(0, Math.min(30, Math.round((n - s) / 864e5))); save(); R.so(el); bind(el); };
    var cb = $('#cal2', el);
    cb.onclick = function () { if (cb.disabled) return; cb.disabled = true; var f = $('.cf', cb), t = $('#cal2t', cb), w = 0; var iv = setInterval(function () { w = Math.min(100, w + 5); f.style.width = w + '%'; t.textContent = 'Kalibracja ' + w + '%'; if (w >= 100) { clearInterval(iv); cb.disabled = false; f.style.width = '0'; t.textContent = 'Skalibruj sensor'; toast('Sensor skalibrowany · następnie za 14 dni'); } }, 90); };
  };

  /* ---------- więcej ---------- */
  var MORE = [
    ['Konto', [['plan', 'Plan i płatności', 'Care+ · Visa •••• 4242', 'crown'], ['ord', 'Zamówienia', 'historia i śledzenie', 'box'], ['notif', 'Powiadomienia', 'alerty i przypomnienia', 'bell']]],
    ['Soczewka', [['fn', 'Funkcje i gesty', 'czas pracy, gesty', 'ge'], ['kr', 'Krąg zaufanych', 'osoby rozpoznawane', 'us'], ['pr', 'Prywatność i dane', 'kto widzi Twoje dane', 'lk']]],
    ['Pomoc', [['kb', 'Baza wiedzy', 'jak to działa, FAQ', 'bk'], ['us', 'Ustawienia', 'motyw, progi, powiadomienia', 'st'], ['op', 'O projekcie', 'fikcyjna firma i autorzy', 'in']]]
  ];
  R.mo = function (el) {
    var pl = PLANS[ST.plan], dm = ST.methods.filter(function (m) { return m.def; })[0];
    el.innerHTML = '<h1 class="big-t"><small>Konto i ustawienia</small>Więcej</h1><div class="stack in">' +
      '<button class="card goldc" data-go="plan" style="--i:0;text-align:left;width:100%"><div class="row"><div class="row" style="gap:14px"><span style="width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#E3CB97,#8E703D);color:#16120B;font:600 1.1rem var(--sans)">' + esc(ST.full.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()) + '</span><span><b style="display:block;font:400 1.5rem var(--serif)">' + esc(ST.full) + '</b><small style="color:rgba(237,231,220,.6)">Plan ' + pl.n + (dm ? ' · ' + mlabel(dm) : '') + '</small></span></div><span class="chev">' + svg('ch', 2) + '</span></div></button>' +
      MORE.map(function (g, gi) { return '<div style="--i:' + (gi + 1) + '"><p class="lbl" style="padding:8px 4px 8px">' + g[0] + '</p><div class="card pad0"><div class="list">' + g[1].map(function (m) { return '<button class="item" data-go="' + m[0] + '"><span class="ic">' + svg(m[3]) + '</span><span class="t"><b>' + m[1] + '</b><small>' + m[2] + '</small></span><span class="chev">' + svg('ch', 2) + '</span></button>'; }).join('') + '</div></div></div>'; }).join('') +
      '<p class="note" style="text-align:center;--i:5">LumiAI App · wersja koncepcyjna 2.0</p></div>';
  };

  /* ---------- plan i płatności ---------- */
  function mlabel(m) { return m.type === 'card' ? m.brand + ' •••• ' + m.last4 : m.type === 'blik' ? 'BLIK' : m.type === 'apple' ? 'Apple Pay' : m.type === 'gpay' ? 'Google Pay' : 'Przelew online'; }
  function mlogo(t, brand) { if (t === 'card') return brand === 'Mastercard' ? '<span class="pm-logo mc"><svg viewBox="0 0 24 16"><circle cx="9" cy="8" r="6" fill="#EB001B"/><circle cx="15" cy="8" r="6" fill="#F79E1B" fill-opacity=".9"/></svg></span>' : '<span class="pm-logo visa">' + (brand === 'Visa' ? 'VISA' : svg('card')) + '</span>'; if (t === 'blik') return '<span class="pm-logo blik">blik</span>'; if (t === 'apple') return '<span class="pm-logo apple">Pay</span>'; if (t === 'gpay') return '<span class="pm-logo gpay">G Pay</span>'; return '<span class="pm-logo bank">' + svg('bank') + '</span>'; }
  R.plan = function (el) {
    var pl = PLANS[ST.plan];
    el.innerHTML = '<h1 class="big-t"><small>Abonament</small>Plan i <em>płatności</em></h1><div class="stack in">' +
      '<div class="card goldc" style="--i:0"><div class="row"><span class="lbl">Twój plan</span><span class="pill gold" style="color:#E3CB97">aktywny</span></div><div style="font:300 2.6rem/1 var(--serif);margin:14px 0 6px">LumiAI ' + pl.n + '</div><p style="color:rgba(237,231,220,.65);font-size:.86rem">' + (pl.p ? zl(pl.p) + ' / miesiąc · odnowienie 1 listopada' : 'Umowa z kliniką') + '</p><div class="meter" style="margin-top:16px;background:rgba(237,231,220,.12)"><i data-w="52"></i></div><p class="note" style="color:rgba(237,231,220,.5);margin-top:8px">16 z 31 dni okresu rozliczeniowego</p></div>' +
      '<div class="sec-h" style="--i:1"><h3>Zmień plan</h3></div>' +
      '<div class="stack" id="plans" style="--i:2">' + Object.keys(PLANS).map(function (k) { var p = PLANS[k]; return '<button class="plan" role="radio" aria-checked="' + (k === ST.plan) + '" data-k="' + k + '">' + (k === 'plus' ? '<span class="pill gold badge">polecany</span>' : '') + '<h4>' + p.n + '</h4><div class="price">' + (p.p ? p.p + ' zł <small>/ mies.</small>' : 'Wycena <small>indywidualna</small>') + '</div><ul>' + p.f.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></button>'; }).join('') + '</div>' +
      '<div class="sec-h" style="--i:3"><h3>Metody płatności</h3><button id="addm">+ Dodaj</button></div>' +
      '<div class="card pad0" style="--i:4"><div class="list" id="ml"></div></div>' +
      '<div class="sec-h" style="--i:5"><h3>Faktury</h3></div>' +
      '<div class="card pad0" style="--i:6"><div class="list">' + [['FV/10/2026/0412', '1 paź 2026', 199], ['FV/09/2026/0388', '1 wrz 2026', 199], ['FV/08/2026/0311', '1 sie 2026', 199]].map(function (f) { return '<button class="item" data-inv="' + f[0] + '"><span class="ic">' + svg('rc') + '</span><span class="t"><b>' + f[0] + '</b><small>' + f[1] + ' · opłacona</small></span><b>' + zl(f[2]) + '</b></button>'; }).join('') + '</div></div>' +
      '<p class="note" style="--i:7">Ceny i plany są przykładowe. To demonstracja: żadna płatność nie jest pobierana.</p></div>';
    countUp(el);
    function ml() {
      $('#ml', el).innerHTML = ST.methods.map(function (m) { return '<button class="item" data-m="' + m.id + '">' + mlogo(m.type, m.brand) + '<span class="t"><b>' + mlabel(m) + '</b><small>' + (m.type === 'card' ? 'ważna do ' + m.exp : m.type === 'blik' ? 'kod z aplikacji banku' : 'płatność jednym dotknięciem') + '</small></span>' + (m.def ? '<span class="pill gold">domyślna</span>' : '<span class="chev">' + svg('ch', 2) + '</span>') + '</button>'; }).join('');
      $$('[data-m]', el).forEach(function (b) {
        b.onclick = function () {
          var m = ST.methods.filter(function (x) { return x.id === b.dataset.m; })[0];
          sheet('<h3>' + mlabel(m) + '</h3><p class="sub">' + (m.def ? 'To Twoja domyślna metoda płatności.' : 'Ustaw jako domyślną albo usuń.') + '</p><div class="stack"><button class="btn full" id="mdef"' + (m.def ? ' disabled' : '') + '>Ustaw jako domyślną</button><button class="btn ghost full" id="mdel" style="color:var(--bad)">Usuń metodę</button></div>', function (pn, close) {
            $('#mdef', pn).onclick = function () { ST.methods.forEach(function (x) { x.def = x === m; }); save(); close(); ml(); toast('Domyślna: ' + mlabel(m)); };
            $('#mdel', pn).onclick = function () { if (ST.methods.length < 2) { toast('Zostaw przynajmniej jedną metodę', '!'); return; } ST.methods = ST.methods.filter(function (x) { return x !== m; }); if (!ST.methods.some(function (x) { return x.def; })) ST.methods[0].def = true; save(); close(); ml(); toast('Usunięto metodę płatności'); };
          });
        };
      });
    }
    ml();
    $$('#plans .plan', el).forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.k; if (k === ST.plan) return;
        if (k === 'clinic') { sheet('<h3>Plan Clinic</h3><p class="sub">Plan dla klinik i szpitali wymaga umowy. Zostaw kontakt, a opiekun klienta odezwie się w ciągu jednego dnia roboczego.</p><button class="btn full" id="cc">Poproś o kontakt</button>', function (pn, close) { $('#cc', pn).onclick = function () { close(); toast('Prośba wysłana (demo)'); }; }); return; }
        var p = PLANS[k];
        sheet('<h3>Zmienić na ' + p.n + '?</h3><p class="sub">Nowa cena ' + zl(p.p) + ' / mies. obowiązuje od następnego okresu rozliczeniowego. Różnicę rozliczymy proporcjonalnie.</p><button class="btn full" id="cp">Potwierdź zmianę</button>', function (pn, close) {
          $('#cp', pn).onclick = function () { close(); var o = overlay('<svg class="spin" viewBox="0 0 72 72"><circle class="bgc" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30"/></svg><p>Aktualizuję plan…</p>'); setTimeout(function () { o.close(); ST.plan = k; save(); R.plan(el); bind(el); toast('Plan zmieniony na ' + p.n); }, 1200); };
        });
      };
    });
    $('#addm', el).onclick = function () { addMethod(function () { ml(); }); };
    $$('[data-inv]', el).forEach(function (b) { b.onclick = function () { toast('Faktura ' + b.dataset.inv + ' · PDF (demo)', '↓'); }; });
  };
  function addMethod(done) {
    sheet('<h3>Dodaj metodę</h3><p class="sub">Wybierz, jak chcesz płacić za abonament i zamówienia.</p><div class="stack">' + [['card', 'Karta płatnicza', 'Visa, Mastercard'], ['blik', 'BLIK', 'kod z aplikacji banku'], ['apple', 'Apple Pay', 'na iPhonie i Macu'], ['gpay', 'Google Pay', 'na Androidzie i w Chrome']].map(function (o) { return '<button class="opt" data-t="' + o[0] + '">' + mlogo(o[0], o[0] === 'card' ? '' : '') + '<span class="t"><b>' + o[1] + '</b><small>' + o[2] + '</small></span><span class="chev">' + svg('ch', 2) + '</span></button>'; }).join('') + '</div>', function (pn, close) {
      $$('.opt', pn).forEach(function (b) {
        b.onclick = function () {
          var t = b.dataset.t; close();
          if (t === 'card') { cardForm(function (c) { ST.methods.push({ id: 'm' + Date.now(), type: 'card', brand: c.brand, last4: c.last4, exp: c.exp, def: false }); save(); done && done(); toast('Dodano kartę ' + c.brand + ' •••• ' + c.last4); }); return; }
          if (ST.methods.some(function (m) { return m.type === t; })) { toast('Ta metoda jest już dodana', '!'); return; }
          ST.methods.push({ id: 'm' + Date.now(), type: t, def: false }); save(); done && done(); toast('Dodano: ' + mlabel({ type: t }));
        };
      });
    });
  }
  /* formularz karty z podglądem (obraca się przy CVC) */
  function luhn(n) { var s = 0, alt = false; for (var i = n.length - 1; i >= 0; i--) { var d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return n.length >= 13 && s % 10 === 0; }
  function brandOf(n) { return /^4/.test(n) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : 'Karta'; }
  function cardHTML() {
    return '<div class="ccard" id="cc"><div class="in2"><div class="fc"><span class="cbrand" id="cbr">VISA</span><div class="chipi"></div><div class="cnum" id="cnum">•••• •••• •••• ••••</div><div class="cmeta"><span>Posiadacz<b id="cnm">TWOJE IMIĘ</b></span><span style="text-align:right">Ważna do<b id="cex">MM/RR</b></span></div></div><div class="bc"><div class="strip"></div><div class="cvc" id="ccv">•••</div></div></div></div>' +
      '<div class="stack" style="gap:10px;margin-top:12px"><div class="fld"><label for="fn1">Numer karty</label><input id="fn1" inputmode="numeric" autocomplete="off" placeholder="0000 0000 0000 0000" maxlength="19"></div><div class="grid2"><div class="fld"><label for="fe1">Ważna do</label><input id="fe1" inputmode="numeric" autocomplete="off" placeholder="MM/RR" maxlength="5"></div><div class="fld"><label for="fc1">CVC</label><input id="fc1" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4"></div></div><div class="fld"><label for="fh1">Imię i nazwisko</label><input id="fh1" autocomplete="off" placeholder="Jak na karcie"></div>' +
      '<button class="btn ghost sm" id="ftest" type="button">Użyj karty testowej</button><p class="note">Wersja demonstracyjna. Nie wpisuj prawdziwych danych karty — nic nie jest wysyłane ani zapisywane poza tym urządzeniem.</p></div>';
  }
  function bindCard(pn) {
    var n = $('#fn1', pn), e = $('#fe1', pn), c = $('#fc1', pn), h = $('#fh1', pn), cc = $('#cc', pn);
    function upd() {
      var raw = n.value.replace(/\D/g, '').slice(0, 16); n.value = raw.replace(/(.{4})/g, '$1 ').trim();
      $('#cnum', pn).textContent = (raw + '••••••••••••••••').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
      $('#cbr', pn).textContent = brandOf(raw) === 'Mastercard' ? 'mastercard' : brandOf(raw) === 'Visa' ? 'VISA' : '';
      var ev = e.value.replace(/\D/g, '').slice(0, 4); e.value = ev.length > 2 ? ev.slice(0, 2) + '/' + ev.slice(2) : ev; $('#cex', pn).textContent = e.value || 'MM/RR';
      c.value = c.value.replace(/\D/g, '').slice(0, 4); $('#ccv', pn).textContent = c.value || '•••';
      $('#cnm', pn).textContent = (h.value || 'Twoje imię').toUpperCase().slice(0, 22);
    }
    [n, e, c, h].forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('bad'); upd(); }); });
    c.addEventListener('focus', function () { cc.classList.add('flip'); }); c.addEventListener('blur', function () { cc.classList.remove('flip'); });
    $('#ftest', pn).onclick = function () { n.value = '4242424242424242'; e.value = '1229'; c.value = '123'; h.value = ST.full; upd(); };
    return function validate() {
      var raw = n.value.replace(/\D/g, ''), ok = true, ev = e.value.split('/'), mm = +ev[0], yy = +ev[1], now = new Date(), exp = new Date(2000 + yy, mm, 0);
      if (!luhn(raw)) { n.classList.add('bad'); ok = false; }
      if (!(mm >= 1 && mm <= 12 && yy && exp >= now)) { e.classList.add('bad'); ok = false; }
      if (!/^\d{3,4}$/.test(c.value)) { c.classList.add('bad'); ok = false; }
      if (!h.value.trim()) { h.classList.add('bad'); ok = false; }
      return ok ? { brand: brandOf(raw), last4: raw.slice(-4), exp: e.value } : null;
    };
  }
  function cardForm(done) {
    sheet('<h3>Nowa karta</h3><p class="sub">Karta zostanie zapisana jako metoda płatności.</p>' + cardHTML() + '<button class="btn full" id="csave" style="margin-top:14px">Zapisz kartę</button>', function (pn, close) {
      var v = bindCard(pn); $('#csave', pn).onclick = function () { var r = v(); if (!r) { buzz([20, 30, 20]); return; } close(); done(r); };
    });
  }

  /* ---------- sklep: produkt → dostawa → płatność → podsumowanie ---------- */
  var cart = { pack: 'm3', qty: 1, adds: {}, del: 'locker', pay: null, step: 0, blik: '', card: null };
  function totals() {
    var pk = PACKS.filter(function (p) { return p.k === cart.pack; })[0], sub = pk.p * cart.qty;
    ADDS.forEach(function (a) { if (cart.adds[a.k]) sub += a.p; });
    var dl = DELIV.filter(function (d) { return d.k === cart.del; })[0].p, disc = ST.plan === 'plus' ? Math.round(sub * .05 * 100) / 100 : 0;
    return { pk: pk, sub: sub, dl: dl, disc: disc, tot: sub + dl - disc };
  }
  R.shop = function (el, arg) {
    if (arg !== 'keep') { cart.step = 0; var dm = ST.methods.filter(function (m) { return m.def; })[0]; cart.pay = dm ? dm.id : 'blik'; cart.blik = ''; cart.card = null; }
    var STEPS = ['Produkt', 'Dostawa', 'Płatność', 'Podsumowanie'];
    function render() {
      var s = cart.step, t = totals();
      var h = '<h1 class="big-t"><small>Krok ' + (s + 1) + ' z 4 · ' + STEPS[s] + '</small>' + ['Wybierz <em>pakiet</em>', 'Jak <em>dostarczyć?</em>', 'Jak <em>zapłacić?</em>', 'Sprawdź i <em>zapłać</em>'][s] + '</h1><div class="steps">' + STEPS.map(function (x, i) { return '<i class="' + (i <= s ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="stack in">';
      if (s === 0) {
        h += '<div class="card" style="--i:0"><div class="product"><div class="pimg">' + lensSVG + '</div><div><span class="lbl">Wyrób medyczny · na receptę</span><b style="display:block;font:400 1.6rem/1.1 var(--serif);margin:6px 0 4px">LumiAI One</b><small style="color:var(--tx3)">moc −2,25 · BC 8,6 · z recepty lekarza prowadzącego</small></div></div></div>' +
          PACKS.map(function (p, i) { return '<button class="opt" role="radio" aria-checked="' + (cart.pack === p.k) + '" data-pack="' + p.k + '" style="--i:' + (i + 1) + '"><span class="radio"></span><span class="t"><b>' + p.n + '</b><small>' + p.s + '</small></span><span class="pr">' + zl(p.p) + (p.old ? '<s>' + zl(p.old) + '</s>' : '') + '</span></button>'; }).join('') +
          '<div class="card pad0" style="--i:4"><div class="item"><span class="t"><b>Ilość pakietów</b><small>dla obu oczu wybierz 2</small></span><div class="qty"><button id="qm" aria-label="Mniej">−</button><b id="qv">' + cart.qty + '</b><button id="qp" aria-label="Więcej">+</button></div></div>' +
          ADDS.map(function (a) { return '<button class="item" role="switch" aria-checked="' + !!cart.adds[a.k] + '" data-add="' + a.k + '"><span class="t"><b>' + a.n + ' · ' + zl(a.p) + '</b><small>' + a.s + '</small></span><i class="sw"></i></button>'; }).join('') + '</div>';
      } else if (s === 1) {
        h += DELIV.map(function (d, i) { return '<button class="opt" role="radio" aria-checked="' + (cart.del === d.k) + '" data-del="' + d.k + '" style="--i:' + i + '"><span class="ic">' + svg(d.i) + '</span><span class="t"><b>' + d.n + '</b><small>' + d.s + '</small></span><span class="pr">' + (d.p ? zl(d.p) : 'bezpłatnie') + '</span></button>'; }).join('') +
          '<div class="card" style="--i:3"><div class="fld"><label for="addr">' + (cart.del === 'locker' ? 'Paczkomat' : cart.del === 'courier' ? 'Adres dostawy' : 'Klinika') + '</label><input id="addr" value="' + (cart.del === 'locker' ? 'WAW123M · ul. Prosta 1, Warszawa' : cart.del === 'courier' ? 'ul. Słoneczna 12/4, 00-001 Warszawa' : 'Klinika Okulistyczna Lumen · ul. Jasna 8') + '"></div><p class="note" style="margin-top:10px">Dane przykładowe — możesz je zmienić.</p></div>';
      } else if (s === 2) {
        var opts = ST.methods.map(function (m) { return { id: m.id, t: m.type, b: m.brand, n: mlabel(m), s: m.type === 'card' ? 'zapisana karta · ważna do ' + m.exp : m.type === 'blik' ? 'wpisz 6-cyfrowy kod z aplikacji banku' : 'płatność jednym dotknięciem' }; });
        ['blik', 'apple', 'gpay', 'bank'].forEach(function (t) { if (!opts.some(function (o) { return o.t === t; })) opts.push({ id: t, t: t, n: mlabel({ type: t }), s: t === 'blik' ? 'wpisz 6-cyfrowy kod z aplikacji banku' : t === 'bank' ? 'szybki przelew z Twojego banku' : 'płatność jednym dotknięciem' }); });
        opts.push({ id: 'new', t: 'card', b: '', n: 'Nowa karta', s: 'Visa lub Mastercard' });
        h += opts.map(function (o, i) { var on = cart.pay === o.id; return '<button class="opt" role="radio" aria-checked="' + on + '" data-pay="' + o.id + '" data-t="' + o.t + '" style="--i:' + i + '">' + mlogo(o.t, o.b) + '<span class="t"><b>' + o.n + '</b><small>' + o.s + '</small></span><span class="radio"></span></button>' + (on && o.t === 'blik' ? '<div class="card" style="--i:' + i + '"><span class="lbl">Kod BLIK</span><div class="blik-in" id="blik">' + [0, 1, 2, 3, 4, 5].map(function (k) { return '<input inputmode="numeric" maxlength="1" aria-label="Cyfra ' + (k + 1) + '" value="' + (cart.blik[k] || '') + '">'; }).join('') + '</div><p class="note" style="text-align:center;margin-top:8px">Demo: wpisz dowolne 6 cyfr</p></div>' : '') + (on && o.id === 'new' ? '<div class="card" id="cardbox" style="--i:' + i + '">' + cardHTML() + '</div>' : ''); }).join('');
      } else {
        var pm = payInfo();
        h += '<div class="card sum" style="--i:0"><span class="lbl">Zamówienie</span><div style="margin-top:8px"><div class="row"><span>LumiAI One · ' + t.pk.n + (cart.qty > 1 ? ' ×' + cart.qty : '') + '</span><span>' + zl(t.pk.p * cart.qty) + '</span></div>' + ADDS.filter(function (a) { return cart.adds[a.k]; }).map(function (a) { return '<div class="row"><span>' + a.n + '</span><span>' + zl(a.p) + '</span></div>'; }).join('') + '<div class="row"><span>Dostawa · ' + DELIV.filter(function (d) { return d.k === cart.del; })[0].n + '</span><span>' + (t.dl ? zl(t.dl) : '0,00 zł') + '</span></div>' + (t.disc ? '<div class="row"><span>Rabat Care+ (5%)</span><span style="color:var(--ok)">−' + zl(t.disc) + '</span></div>' : '') + '<div class="row tot"><span>Do zapłaty</span><b>' + zl(t.tot) + '</b></div></div></div>' +
          '<div class="card pad0" style="--i:1"><button class="item" data-step="1"><span class="ic">' + svg(DELIV.filter(function (d) { return d.k === cart.del; })[0].i) + '</span><span class="t"><b>' + DELIV.filter(function (d) { return d.k === cart.del; })[0].n + '</b><small>' + esc(cart.addr || 'WAW123M · ul. Prosta 1, Warszawa') + '</small></span><span class="pill neutral">zmień</span></button><button class="item" data-step="2">' + mlogo(pm.t, pm.b) + '<span class="t"><b>' + pm.n + '</b><small>' + (pm.t === 'blik' ? 'kod ' + cart.blik.replace(/(\d{3})/, '$1 ') : 'płatność') + '</small></span><span class="pill neutral">zmień</span></button></div>' +
          '<p class="note" style="--i:2">Klikając „Zapłać”, akceptujesz regulamin sklepu (demo). Płatność jest symulowana — żadne środki nie zostaną pobrane.</p>';
      }
      h += '</div>';
      el.innerHTML = h;
      bar();
      bindStep();
    }
    function payInfo() { if (cart.pay === 'new' && cart.card) return { t: 'card', b: cart.card.brand, n: cart.card.brand + ' •••• ' + cart.card.last4 }; var m = ST.methods.filter(function (x) { return x.id === cart.pay; })[0]; if (m) return { t: m.type, b: m.brand, n: mlabel(m) }; return { t: cart.pay, n: mlabel({ type: cart.pay }) }; }
    var validateCard = null;
    function bindStep() {
      validateCard = null;
      $$('[data-pack]', el).forEach(function (b) { b.onclick = function () { cart.pack = b.dataset.pack; buzz(5); $$('[data-pack]', el).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); bar(); }; });
      $$('[data-add]', el).forEach(function (b) { b.onclick = function () { cart.adds[b.dataset.add] = !cart.adds[b.dataset.add]; b.setAttribute('aria-checked', !!cart.adds[b.dataset.add]); bar(); }; });
      var qm = $('#qm', el); if (qm) { qm.onclick = function () { cart.qty = Math.max(1, cart.qty - 1); $('#qv', el).textContent = cart.qty; bar(); }; $('#qp', el).onclick = function () { cart.qty = Math.min(4, cart.qty + 1); $('#qv', el).textContent = cart.qty; bar(); }; }
      $$('[data-del]', el).forEach(function (b) { b.onclick = function () { cart.del = b.dataset.del; cart.addr = null; render(); }; });
      var ad = $('#addr', el); if (ad) { cart.addr = ad.value; ad.oninput = function () { cart.addr = ad.value; }; }
      $$('[data-pay]', el).forEach(function (b) { b.onclick = function () { if (cart.pay === b.dataset.pay) return; cart.pay = b.dataset.pay; render(); var f = $('#blik input', el) || $('#fn1', el); if (f) setTimeout(function () { f.focus(); }, 300); }; });
      var bl = $$('#blik input', el);
      bl.forEach(function (inp, i) {
        inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(-1); cart.blik = bl.map(function (x) { return x.value; }).join(''); if (inp.value && bl[i + 1]) bl[i + 1].focus(); bar(); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !inp.value && bl[i - 1]) bl[i - 1].focus(); });
        inp.addEventListener('paste', function (e) { var t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (t.length) { e.preventDefault(); bl.forEach(function (x, k) { x.value = t[k] || ''; }); cart.blik = t; bar(); } });
      });
      var cb = $('#cardbox', el); if (cb) { validateCard = bindCard(cb); $$('input', cb).forEach(function (i) { i.addEventListener('input', bar); }); }
      $$('[data-step]', el).forEach(function (b) { b.onclick = function () { cart.step = +b.dataset.step; render(); el.scrollTop = 0; }; });
    }
    function canNext() { if (cart.step !== 2) return true; var t = $('[data-pay][aria-checked="true"]', el); if (!t) return false; if (t.dataset.t === 'blik') return cart.blik.length === 6; return true; }
    function bar() {
      var t = totals(), last = cart.step === 3;
      paybar.innerHTML = '<div class="row" style="margin-bottom:10px"><span class="lbl">' + (last ? 'Do zapłaty' : 'Razem') + '</span><b style="font:300 1.7rem/1 var(--serif)">' + zl(t.tot) + '</b></div><button class="btn full" id="nx"' + (canNext() ? '' : ' disabled') + '>' + (last ? '<span class="shine"></span>' + svg('lk', 2).replace('<svg', '<svg style="width:17px;height:17px"') + ' Zapłać ' + zl(t.tot) : 'Dalej · ' + ['dostawa', 'płatność', 'podsumowanie'][cart.step]) + '</button>';
      $('#nx', paybar).onclick = next;
    }
    function next() {
      if (cart.step === 2) {
        var t = $('[data-pay][aria-checked="true"]', el);
        if (cart.pay === 'new') { var r = validateCard && validateCard(); if (!r) { buzz([20, 30, 20]); toast('Sprawdź dane karty', '!'); return; } cart.card = r; }
        if (t && t.dataset.t === 'blik' && cart.blik.length !== 6) return;
      }
      if (cart.step < 3) { cart.step++; render(); el.scrollTop = 0; return; }
      pay();
    }
    function pay() {
      var pm = payInfo(), t = totals(), o;
      paybar.classList.remove('on');
      if (pm.t === 'blik') {
        o = overlay('<svg class="spin" viewBox="0 0 72 72"><circle class="bgc" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30"/></svg><h3>Potwierdź w aplikacji banku</h3><p>Wysłaliśmy żądanie płatności BLIK na ' + zl(t.tot) + '. Masz <b id="cd">5</b> s na potwierdzenie. (symulacja)</p>');
        var n = 5, iv = setInterval(function () { n--; var c = $('#cd', o.el); if (c) c.textContent = n; if (n <= 2) { clearInterval(iv); success(o); } }, 1000);
      } else {
        o = overlay('<svg class="spin" viewBox="0 0 72 72"><circle class="bgc" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30"/></svg><h3>' + (pm.t === 'card' ? 'Autoryzacja 3-D Secure' : pm.t === 'bank' ? 'Łączenie z bankiem' : 'Potwierdzanie płatności') + '</h3><p>' + pm.n + ' · ' + zl(t.tot) + '</p>');
        setTimeout(function () { success(o); }, pm.t === 'card' ? 2200 : 1600);
      }
    }
    function success(o) {
      var t = totals(), no = 'LA-' + (24818 + ST.orders.length);
      ST.orders.unshift({ no: no, date: new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }), items: 'LumiAI One · ' + t.pk.n + (cart.qty > 1 ? ' ×' + cart.qty : ''), total: t.tot, st: 0 }); save();
      buzz([20, 40, 60]);
      o.el.innerHTML = '<svg class="check" viewBox="0 0 88 88"><circle cx="44" cy="44" r="40"/><path d="M28 45l11 11 21-23"/></svg><h3>Płatność przyjęta</h3><p>Zamówienie <b>' + no + '</b> na ' + zl(t.tot) + '. Wyślemy je ' + (cart.del === 'clinic' ? 'do kliniki' : 'jutro') + ' — powiadomimy Cię w soczewce.</p><div style="display:grid;gap:10px;width:100%;max-width:280px"><button class="btn full" id="tr">Śledź zamówienie</button><button class="btn ghost full" id="hm">Wróć do startu</button></div>';
      confetti(o.el);
      $('#tr', o.el).onclick = function () { o.close(); stack = []; go('ord', no, 'tab'); };
      $('#hm', o.el).onclick = function () { o.close(); stack = []; go('start', null, 'tab'); };
    }
    el._cleanup = function () { paybar.classList.remove('on'); };
    el._back = function () { if (cart.step > 0) { cart.step--; render(); el.scrollTop = 0; return true; } return false; };
    el.style.paddingBottom = '200px';
    render(); setTimeout(function () { paybar.classList.add('on'); }, 120);
  };

  /* ---------- zamówienia ---------- */
  var OST = ['Opłacone', 'W przygotowaniu', 'W drodze', 'Dostarczone'];
  R.ord = function (el, focus) {
    el.innerHTML = '<h1 class="big-t"><small>Historia i śledzenie</small>Zamówienia</h1><div class="stack in">' + (ST.orders.length ? ST.orders.map(function (o, i) { return '<button class="card" data-o="' + o.no + '" style="--i:' + i + ';text-align:left;width:100%"><div class="row"><span class="lbl">' + o.no + ' · ' + o.date + '</span><span class="pill ' + (o.st >= 3 ? 'ok' : 'gold') + '">' + OST[o.st] + '</span></div><b style="display:block;font:400 1.35rem var(--serif);margin:10px 0 4px">' + o.items + '</b><div class="row"><small style="color:var(--tx3)">' + zl(o.total) + '</small><span class="chev">' + svg('ch', 2) + '</span></div><div class="meter" style="margin-top:12px"><i data-w="' + ((o.st + 1) / 4 * 100) + '"></i></div></button>'; }).join('') : '<p class="note">Brak zamówień.</p>') + '<button class="btn ghost full" data-go="shop" style="--i:' + ST.orders.length + '">Złóż nowe zamówienie</button></div>';
    $$('[data-o]', el).forEach(function (b) {
      b.onclick = function () {
        var o = ST.orders.filter(function (x) { return x.no === b.dataset.o; })[0];
        sheet('<h3>' + o.no + '</h3><p class="sub">' + o.items + ' · ' + zl(o.total) + '</p><div class="track">' + OST.map(function (s, i) { return '<div class="' + (i <= o.st ? 'ok' : '') + '"><b>' + s + '</b><small>' + (i <= o.st ? (i === 0 ? o.date : i === o.st ? 'teraz' : 'zakończono') : 'oczekuje') + '</small></div>'; }).join('') + '</div><button class="btn full" id="oc">Gotowe</button>', function (pn, close) { $('#oc', pn).onclick = close; });
      };
    });
    if (focus) setTimeout(function () { var b = $('[data-o="' + focus + '"]', el); if (b) b.click(); }, 700);
  };

  /* ---------- powiadomienia ---------- */
  R.notif = function (el) {
    ST.read = true; save(); $('#belld').hidden = true;
    el.innerHTML = '<h1 class="big-t"><small>Ostatnie 24 godziny</small>Powiadomienia</h1><div class="card pad0 in"><div class="list">' + NOTIF.map(function (n, i) { return '<div class="item" style="--i:' + i + '"><span class="ic">' + svg(n[3]) + '</span><span class="t"><b>' + n[1] + '</b><small>' + n[2] + '</small></span><small style="color:var(--tx3);font-size:.72rem">' + n[0] + '</small></div>'; }).join('') + '</div></div>';
  };

  /* ---------- funkcje, baza wiedzy, prywatność, krąg, ustawienia, o projekcie ---------- */
  function toggles(rootEl, list, get, set) {
    list.forEach(function (x) { var b = document.createElement('button'); b.className = 'item'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', get(x.k)); b.innerHTML = '<span class="t"><b>' + x.n + '</b><small>' + x.s + '</small></span><i class="sw"></i>'; if (x.lock) b.disabled = true; b.onclick = function () { var v = !get(x.k); set(x.k, v); b.setAttribute('aria-checked', v); buzz(5); save(); }; rootEl.appendChild(b); });
  }
  var GES = [['Podwójne mrugnięcie', 'Potwierdź lub zatwierdź'], ['Spojrzenie w górny róg', 'Pokaż pomiary zdrowia'], ['Skinienie głową', 'Przełącz język tłumaczenia'], ['Długie spojrzenie w bok', 'Ukryj ekran na 10 minut'], ['Pięć mrugnięć', 'Alarm SOS do opiekuna']];
  R.fn = function (el) {
    el.innerHTML = '<h1 class="big-t"><small>Soczewka</small>Funkcje i <em>gesty</em></h1><div class="stack in"><div class="card hero" style="--i:0"><span class="lbl">Szacowany czas pracy</span><div class="num" id="hh" style="margin:10px 0 12px;font-size:3rem"></div><div class="meter glow"><i id="hb"></i></div><p id="hn" style="color:rgba(237,231,220,.6);font-size:.8rem;margin-top:10px"></p></div><div class="card pad0" style="--i:1"><div class="list" id="ft"></div></div><div class="sec-h" style="--i:2"><h3>Gesty</h3></div><div class="card pad0" style="--i:3"><div class="list">' + GES.map(function (g) { return '<div class="item"><span class="ic">' + svg('ge') + '</span><span class="t"><b>' + g[0] + '</b><small>' + g[1] + '</small></span></div>'; }).join('') + '</div></div></div>';
    var last = null;
    function upd() { var c = 0; Object.keys(COST).forEach(function (k) { if (ST.fun[k]) c += COST[k]; }); var h = 23.5 - c, from = last == null ? h : last; last = h; var el2 = $('#hh', el), s = performance.now(); (function f(t) { var p = Math.min(1, (t - s) / 500); el2.textContent = fmt(from + (h - from) * (1 - Math.pow(1 - p, 3))) + ' h'; if (p < 1) requestAnimationFrame(f); })(s); $('#hb', el).style.width = (h / 24 * 100) + '%'; $('#hn', el).textContent = 'Cel projektowy: 16 h przy wszystkich funkcjach. Zapas: +' + fmt(h - 16) + ' h.'; }
    toggles($('#ft', el), Object.keys(FN).map(function (k) { return { k: k, n: FN[k], s: '−' + String(COST[k]).replace('.', ',') + ' h pracy' }; }), function (k) { return ST.fun[k]; }, function (k, v) { ST.fun[k] = v; upd(); });
    setTimeout(upd, 200);
  };
  var KB = [
    ['Jak działa soczewka', 'Soczewka ma miękki hydrożel z matrycą micro-LED, chipem AI, anteną i sensorem łzowym. Obraz widzi tylko jej użytkownik, a dla otoczenia soczewka jest przezroczysta.'],
    ['Technologia (warstwy)', 'Hydrożel zewnętrzny 90 µm, matryca micro-LED 40 µm, chip AI i antena 30 µm, sensor 20 µm, hydrożel wewnętrzny 100 µm. Razem 0,28 mm.'],
    ['Co ile wymieniać', 'Soczewka co 30 dni, wariant nocny co 7 dni, kalibracja sensora co 14 dni, patch za uchem co 7 dni, etui co 12 miesięcy, modele AI co 3 miesiące, wizyta u okulisty co 6 miesięcy.'],
    ['Jak działa płatność', 'Abonament pobierany jest co miesiąc z domyślnej metody płatności. Zamówienia możesz opłacić BLIK-iem, kartą, Apple Pay, Google Pay lub przelewem. W tej wersji demo płatności są symulowane.'],
    ['Zastosowania medyczne', 'Cukrzyca (ciągły pomiar glukozy), niedosłuch (napisy na żywo), zaburzenia pamięci (rozpoznawanie osób i leki), opieka międzynarodowa (tłumaczenie wywiadu).'],
    ['Plan badań', '2026 prototyp, 2027 badanie bezpieczeństwa, 2028 badanie kliniczne, 2030 znak CE i start.'],
    ['Czy inni zobaczą soczewkę?', 'Soczewka jest przezroczysta, bez diod i błysków, a obraz jest widoczny tylko dla noszącego. To założenie projektowe do potwierdzenia w badaniach.'],
    ['Czy soczewka nagrywa?', 'Nie. Soczewka nie zapisuje obrazu ani dźwięku. Analiza działa na urządzeniu.'],
    ['Jak działa sterowanie gestami?', 'Czujniki wykrywają mrugnięcia, kierunek spojrzenia i ruch głowy. Zestaw gestów można dopasować do możliwości pacjenta.']
  ];
  R.kb = function (el) { el.innerHTML = '<h1 class="big-t"><small>Pomoc</small>Baza <em>wiedzy</em></h1><div class="card pad0 in">' + KB.map(function (k, i) { return '<details style="--i:' + i + '"><summary>' + k[0] + '</summary><div><p>' + k[1] + '</p></div></details>'; }).join('') + '</div><p class="note" style="margin-top:12px">Wszystkie wartości to założenia projektowe fikcyjnej firmy.</p>'; };
  R.pr = function (el) { el.innerHTML = '<h1 class="big-t"><small>Twoje dane</small>Prywatność</h1><div class="stack in"><div class="card" style="--i:0"><p style="color:var(--tx2);font-size:.9rem">Analiza obrazu i dźwięku działa na soczewce. Soczewka nie nagrywa, a dane zdrowotne są szyfrowane.</p></div><div class="card pad0" style="--i:1"><div class="list" id="pl"></div></div><p class="note" style="--i:2">Niewidoczność dotyczy wyglądu soczewki, nie tego, co soczewka robi z danymi innych osób.</p></div>'; toggles($('#pl', el), [{ k: 'loc', n: 'Analiza na urządzeniu', s: 'zawsze włączona', lock: true }, { k: 'doc', n: 'Udostępnianie lekarzowi', s: 'panel lekarza widzi trendy' }, { k: 'care', n: 'Udostępnianie opiekunowi', s: 'alerty i zdarzenia' }, { k: 'face', n: 'Rozpoznawanie osób zaufanych', s: 'bez zapisu obrazu twarzy' }], function (k) { return k === 'loc' ? true : ST.priv[k]; }, function (k, v) { ST.priv[k] = v; }); };
  R.kr = function (el) {
    el.innerHTML = '<h1 class="big-t"><small>Osoby rozpoznawane i powiadamiane</small>Krąg <em>zaufanych</em></h1><div class="stack in"><div class="card pad0" style="--i:0"><div class="list" id="cl"></div></div><button class="btn full" id="add" style="--i:1">+ Dodaj osobę</button></div>';
    function draw() { var cl = $('#cl', el); cl.innerHTML = ''; ST.circle.forEach(function (p) { var b = document.createElement('button'); b.className = 'item'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', p.on); b.innerHTML = '<span class="ic" style="border-radius:50%;font:600 .8rem var(--sans)">' + esc(p.n.slice(0, 1)) + '</span><span class="t"><b>' + esc(p.n) + '</b><small>' + esc(p.r) + '</small></span><i class="sw"></i>'; b.onclick = function () { p.on = !p.on; b.setAttribute('aria-checked', p.on); save(); }; cl.appendChild(b); }); }
    draw();
    $('#add', el).onclick = function () { sheet('<h3>Nowa osoba</h3><p class="sub">Soczewka podpowie, kim jest ta osoba, i powiadomi ją w razie alarmu.</p><div class="stack"><div class="fld"><label for="pn">Kto to jest</label><input id="pn" placeholder="np. Siostra"></div><div class="fld"><label for="pr2">Relacja</label><select id="pr2"><option>rodzina</option><option>lekarz</option><option>opiekun</option><option>przyjaciel</option></select></div><button class="btn full" id="ok">Dodaj</button></div>', function (pn, close) { setTimeout(function () { $('#pn', pn).focus(); }, 400); $('#ok', pn).onclick = function () { var n = $('#pn', pn).value.trim(); if (!n) { $('#pn', pn).classList.add('bad'); return; } ST.circle.push({ n: n, r: $('#pr2', pn).value, on: true }); save(); close(); draw(); toast('Dodano: ' + n); }; }); };
  };
  R.us = function (el) {
    var th = root.getAttribute('data-theme') || 'dark';
    el.innerHTML = '<h1 class="big-t"><small>Aplikacja</small>Ustawienia</h1><div class="stack in"><div class="card" style="--i:0"><span class="lbl">Motyw</span><div class="seg" id="th" style="margin-top:10px"><span class="ind"></span><button data-t="dark">Ciemny</button><button data-t="light">Jasny</button></div></div>' +
      '<div class="card" style="--i:1"><span class="lbl">Progi glukozy (mmol/L)</span><div class="fld" style="margin-top:12px"><label for="lo" class="row"><span>Niski poniżej</span><b id="lov">' + fmt(ST.lo) + '</b></label><input id="lo" type="range" min="3" max="5" step=".1" value="' + ST.lo + '"></div><div class="fld" style="margin-top:12px"><label for="hi" class="row"><span>Wysoki powyżej</span><b id="hiv">' + fmt(ST.hi) + '</b></label><input id="hi" type="range" min="8" max="14" step=".1" value="' + ST.hi + '"></div></div>' +
      '<div class="card pad0" style="--i:2"><div class="list" id="nl"></div></div><button class="btn ghost full" id="rst" style="--i:3">Przywróć dane demonstracyjne</button></div>';
    var seg = $('#th', el);
    function ths() { $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === (root.getAttribute('data-theme') || 'dark')); }); bindSeg(seg); }
    $$('button', seg).forEach(function (b) { b.onclick = function () { root.setAttribute('data-theme', b.dataset.t); try { localStorage.setItem('lumi-app-theme', b.dataset.t); } catch (e) {} ths(); }; });
    setTimeout(ths, 50);
    $('#lo', el).oninput = function () { ST.lo = +this.value; $('#lov', el).textContent = fmt(ST.lo); save(); };
    $('#hi', el).oninput = function () { ST.hi = +this.value; $('#hiv', el).textContent = fmt(ST.hi); save(); };
    toggles($('#nl', el), [{ k: 'gl', n: 'Alerty glukozy', s: 'natychmiast' }, { k: 'med', n: 'Przypomnienia o lekach', s: 'zgodnie z harmonogramem' }, { k: 'rep', n: 'Poranny raport', s: 'sen i zdrowie o 7:00' }], function (k) { return ST.notif[k]; }, function (k, v) { ST.notif[k] = v; });
    $('#rst', el).onclick = function () { ST = JSON.parse(JSON.stringify(DEF)); save(); root.setAttribute('data-theme', 'dark'); try { localStorage.removeItem('lumi-app-theme'); } catch (e) {} $('#belld').hidden = false; R.us(el); bind(el); toast('Przywrócono dane demonstracyjne'); };
  };
  R.op = function (el) { el.innerHTML = '<h1 class="big-t"><small>LumiAI</small>O <em>projekcie</em></h1><div class="stack in"><div class="card hero" style="--i:0"><div style="font:300 2rem/1.05 var(--serif);margin-bottom:10px">Ekran AI przed oczami.<br><em style="color:#E3CB97">Niewidoczny dla innych.</em></div><p style="color:rgba(237,231,220,.65);font-size:.88rem">Inteligentne soczewki medyczne z tłumaczeniem na żywo, ekranem AI i sterowaniem gestami.</p></div><div class="card pad0" style="--i:1"><p class="lbl" style="padding:14px 0 4px">Autor projektu</p><div class="list">' + ['Szymon Brzozowski'].map(function (n) { return '<div class="item"><span class="ic" style="border-radius:50%">' + svg('us') + '</span><span class="t"><b>' + n + '</b></span></div>'; }).join('') + '</div></div><p class="note" style="--i:2">LumiAI to fikcyjna firma i fikcyjny produkt. Soczewka nie istnieje, a wszystkie parametry, ceny, dane i płatności w aplikacji są przykładowe.</p></div>'; };
  var IDX = [['Glukoza', 'Pomiar i wykres glukozy, alerty', 'zd', 'gluc'], ['Sen', 'Fazy snu, przebudzenia, tętno', 'zd', 'sleep'], ['Wskaźniki zdrowia', 'Tętno, ciśnienie w oku, nawodnienie', 'zd', 'vit'], ['Tłumacz', 'Tłumaczenie rozmowy na żywo', 'tl'], ['Wymiana soczewki', 'Kalendarz wymian i kalibracja', 'so'], ['Zamów soczewki', 'Sklep: pakiety, dostawa, płatność', 'shop'], ['Płatności', 'BLIK, karta, Apple Pay, Google Pay', 'plan'], ['Plan abonamentu', 'Care, Care+, Clinic', 'plan'], ['Zamówienia', 'Historia i śledzenie przesyłek', 'ord'], ['Gesty', 'Sterowanie gestami', 'fn'], ['Prywatność', 'Kto widzi Twoje dane', 'pr'], ['Krąg zaufanych', 'Osoby rozpoznawane przez soczewkę', 'kr'], ['Ustawienia', 'Motyw, progi, powiadomienia', 'us'], ['SOS', 'Alarm do opiekuna', 'start']].concat(KB.map(function (k) { return [k[0], k[1].slice(0, 70) + '…', 'kb']; }));
  R.sr = function (el, q) {
    var s = (q || '').toLowerCase(), res = IDX.filter(function (x) { return (x[0] + ' ' + x[1]).toLowerCase().indexOf(s) > -1; });
    el.innerHTML = '<h1 class="big-t"><small>Wyniki dla</small>„' + esc(q || '') + '”</h1><div class="card pad0 in"><div class="list">' + (res.length ? res.map(function (x, i) { return '<button class="item" data-i="' + i + '" style="--i:' + i + '"><span class="t"><b>' + x[0] + '</b><small>' + x[1] + '</small></span><span class="chev">' + svg('ch', 2) + '</span></button>'; }).join('') : '<p style="padding:16px 0;color:var(--tx3)">Brak wyników. Spróbuj: glukoza, płatności, wymiana.</p>') + '</div></div>';
    $$('[data-i]', el).forEach(function (b) { b.onclick = function () { var x = res[+b.dataset.i]; go(x[2], x[3]); }; });
  };

  /* =========================================================
     NAWIGACJA z przejściami
     ========================================================= */
  var stack = [], curId = null, curEl = null, busy = false;
  var NOTABS = { shop: 1 };
  function go(id, arg, mode) {
    if (busy) return;
    if (!mode) mode = (TABOF[id] === id && id !== 'shop') ? 'tab' : 'push';
    if (mode === 'push' && curId) stack.push(curId);
    var old = curEl; if (old && old._cleanup) old._cleanup();
    var el = document.createElement('div'); el.className = 'screen'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', T[id]);
    stage.appendChild(el); R[id](el, arg); bind(el);
    $$('.meter i[data-w]', el).forEach(function (i) { setTimeout(function () { i.style.width = i.dataset.w + '%'; }, 250); });
    countUp(el);
    curId = id; curEl = el;
    ttl.textContent = T[id]; appbar.classList.remove('sc');
    back.classList.toggle('ghost', !(stack.length || (TABOF[id] !== id)));
    tabsEl.classList.toggle('hide', !!NOTABS[id]);
    var ti = TABS.map(function (t) { return t[0]; }).indexOf(TABOF[id]);
    $$('.tab', tabsEl).forEach(function (t, i) { if (i === ti) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    if (ti > -1) tabind.style.transform = 'translateX(' + (ti * 100) + '%)';
    el.addEventListener('scroll', function () { appbar.classList.toggle('sc', el.scrollTop > 46); }, { passive: true });
    if (!old || reduce || !el.animate) { if (old) old.remove(); return; }
    busy = true; var D = 520, E = 'cubic-bezier(.16,1,.3,1)';
    var a1, a2;
    if (mode === 'push') { a1 = el.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: D, easing: E }); a2 = old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-28%)', opacity: .4 }], { duration: D, easing: E, fill: 'forwards' }); el.style.boxShadow = '-20px 0 40px rgba(0,0,0,.35)'; }
    else if (mode === 'back') { stage.insertBefore(el, old); a1 = el.animate([{ transform: 'translateX(-28%)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: D, easing: E }); a2 = old.animate([{ transform: 'none' }, { transform: 'translateX(100%)' }], { duration: D, easing: E, fill: 'forwards' }); old.style.boxShadow = '-20px 0 40px rgba(0,0,0,.35)'; }
    else { a1 = el.animate([{ opacity: 0, transform: 'translateY(16px) scale(.99)' }, { opacity: 1, transform: 'none' }], { duration: 460, easing: E }); a2 = old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }); }
    a1.onfinish = function () { old.remove(); el.style.boxShadow = ''; busy = false; };
    setTimeout(function () { if (busy) { if (old.parentNode) old.remove(); busy = false; } }, D + 200);
  }
  function bind(el) { $$('[data-go]', el).forEach(function (b) { b.onclick = function () { go(b.dataset.go, b.dataset.sub); }; }); }
  back.onclick = function () { if (back.classList.contains('ghost')) return; if (curEl && curEl._back && curEl._back()) return; var p = stack.pop() || TABOF[curId]; go(p, curId === 'shop' ? null : null, 'back'); };
  TABS.forEach(function (t) { var b = document.createElement('button'); b.className = 'tab'; b.type = 'button'; b.innerHTML = svg(t[2]) + '<span>' + t[1] + '</span>'; b.onclick = function () { buzz(4); if (curId === t[0]) { curEl.scrollTo({ top: 0, behavior: 'smooth' }); return; } stack = []; go(t[0], null, 'tab'); }; tabsEl.appendChild(b); });
  $('#bell').onclick = function () { go('notif'); };
  if (ST.read) $('#belld').hidden = true;
  function clk() { var d = new Date(); $('#clock').textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  clk(); setInterval(clk, 30000);
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; }

  /* ekran powitalny, potem start */
  var splash = $('#splash');
  setTimeout(function () { go('start', null, 'tab'); splash.classList.add('gone'); setTimeout(function () { toast('Soczewka połączona · bateria ' + ST.bat + '%', '◉'); }, 900); }, reduce ? 0 : 1500);
})();
