/* =========================================================
   LumiAI — film koncepcyjny
   Render kinowy na canvasie + warstwa HUD w HTML, lektor (Web Speech API),
   podkład ambientowy i dźwięki interfejsu (Web Audio API).

   WŁASNE NAGRANIA LEKTORA (najlepsza jakość głosu):
   Nagraj lub wygeneruj (np. w ElevenLabs) pliki mp3 i wrzuć je do folderu
   „audio/” obok index.html, z nazwami jak klucze poniżej. Jeśli plik istnieje
   w VO_FILES, film użyje go zamiast głosu przeglądarki.
     n0  Zakładasz LumiAI. Kalibracja trwa tylko kilka sekund.
     n1  Wieczór w mieście. Ktoś zaczepia cię po chińsku.
     q   请问，去中央火车站怎么走？            (przechodzień)
     tr1 Przepraszam, jak dojść na dworzec centralny?   (tłumacz)
     n3  Soczewka podpowiada odpowiedź i jej wymowę.
     me  一直往前走，然后左转。                (Ty)
     thx 谢谢！                                (przechodzień)
     tr2 Dziękuję bardzo!                       (tłumacz)
     n4  Kilka minut później. Glukoza spada szybciej niż zwykle. Widzisz to tylko ty.
     n5  Czas na lek. Potwierdzasz go mrugnięciem, bez dotykania telefonu.
     n6  Dla otoczenia nic się nie zmieniło. Widzą zwykłe oko.
     n7  LumiAI. Ekran AI przed oczami. Niewidoczny dla innych.
   Przykład: var VO_FILES = { n0: 'audio/n0.mp3', n1: 'audio/n1.mp3' };
   ========================================================= */
(function () {
  'use strict';
  var VO_FILES = {};

  var Lumi = window.Lumi; if (!Lumi) return;
  var $ = function (q, c) { return (c || document).querySelector(q); };
  var $$ = function (q, c) { return [].slice.call((c || document).querySelectorAll(q)); };
  var clamp = Lumi.clamp, smooth = Lumi.smooth, lerp = Lumi.lerp, reduce = Lumi.reduce;
  var easeOut = function (t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); };

  var screen = $('#screen'); if (!screen) return;
  var cv = $('#filmcv'), x = cv.getContext('2d'), eye = new Lumi.Eye(23), city = new Lumi.City(9);
  var poster = $('#poster'), pp = $('#pp'), ppi = $('#ppi'), pch = $('#pch'), pti = $('#pti'), segsEl = $('#segs'), ptime = $('#ptime');
  var caps = $('#caps'), dip = $('#dip'), lids = $('#lids'), hudf = $('#hudf'), fmed = $('#fmed'), calp = $('#calp'), typ1 = $('#typ1'), vwarn = $('#vwarn');
  var muteB = $('#mute'), vset = $('#vset'), vpanel = $('#vpanel');
  var FE = $$('.fe', screen).map(function (e) { var s = e.dataset.s.split(',').map(Number); return { e: e, s: s, first: s[0], at: e.dataset.in != null ? +e.dataset.in : null, cue: e.dataset.cue || null }; });

  /* ---------- scenariusz ---------- */
  /* kadry: zdjęcie + ruch kamery (skala i punkt ogniskowy od → do), fx: dodatkowe efekty */
  var SC = [
    { t: 'Kalibracja', d: 6.2, bg: 'eye', img: 'eye', cam: [1.05, .535, .42, 1.16, .535, .42], ch: [110, 164.81, 220, 329.63] },
    { t: 'Spotkanie', d: 6, bg: 'city', img: 'stranger', cam: [1, .55, .5, 1.08, .58, .45], ch: [98, 146.83, 196, 293.66] },
    { t: 'Tłumaczenie', d: 5.4, bg: 'city', img: 'stranger', cam: [1.14, .6, .4, 1.2, .6, .38], ch: [130.81, 196, 261.63, 329.63] },
    { t: 'Odpowiedź', d: 8.6, bg: 'city', img: 'stranger', cam: [1.08, .5, .45, 1.14, .56, .42], ch: [110, 164.81, 220, 277.18] },
    { t: 'Glukoza', d: 6.6, bg: 'walk', img: 'walk', cam: [1.02, .4, .5, 1.22, .38, .5], fx: 'walk', ch: [87.31, 130.81, 174.61, 261.63] },
    { t: 'Lek', d: 6.8, bg: 'walk', img: 'meds', cam: [1.02, .45, .5, 1.12, .4, .48], ch: [98, 146.83, 196, 246.94] },
    { t: 'Dyskrecja', d: 6.4, bg: 'eye2', img: 'woman', cam: [1.04, .62, .45, 1.18, .66, .4], ch: [110, 164.81, 220, 329.63] },
    { t: 'LumiAI', d: 6, bg: 'end', ch: [110, 164.81, 220, 329.63, 440] }
  ];
  /* zdjęcia kadrów (wygenerowane AI); bez nich film używa scen rysowanych w kodzie */
  var IMG = {};
  ['eye', 'stranger', 'walk', 'meds', 'woman'].forEach(function (k) { var im = new Image(); im.decoding = 'async'; im.onload = function () { IMG[k] = im; dirty = true; if (!started) drawPoster(); }; im.src = 'assets/film/' + k + '.jpg'; });
  /* nagrania lektora z generatora (audio/manifest.json) */
  if (location.protocol !== 'file:' && window.fetch) fetch('audio/manifest.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (m) { if (m && typeof m === 'object') { Object.keys(m).forEach(function (k) { VO_FILES[k] = m[k]; }); hasVO = Object.keys(VO_FILES).length > 0; } }).catch(function () {});
  var hasVO = false, VOA = {};
  var CUES = [
    { s: 0, at: .5, id: 'n0', who: 'narr', text: 'Zakładasz LumiAI. Kalibracja trwa tylko kilka sekund.' },
    { s: 0, at: 4.2, tone: 'ready' },
    { s: 1, at: .4, id: 'n1', who: 'narr', text: 'Wieczór w mieście. Ktoś zaczepia cię po chińsku.' },
    { s: 1, at: 2.8, id: 'q', who: 'zh1', after: 'n1', text: '请问，去中央火车站怎么走？', cap: '请问，去中央火车站怎么走？  ·  Qǐngwèn, qù zhōngyāng huǒchēzhàn zěnme zǒu?' },
    { s: 2, at: .25, tone: 'hud' },
    { s: 2, at: .5, id: 'tr1', who: 'tr', text: 'Przepraszam, jak dojść na dworzec centralny?', type: true },
    { s: 3, at: .25, tone: 'hud' },
    { s: 3, at: .7, id: 'n3', who: 'narr', text: 'Soczewka podpowiada odpowiedź i jej wymowę.' },
    { s: 3, at: 3.2, id: 'me', who: 'zh2', after: 'n3', text: '一直往前走，然后左转。', cap: '一直往前走，然后左转。  ·  Yìzhí wǎng qián zǒu, ránhòu zuǒ zhuǎn.', kw: true },
    { s: 3, at: 5.6, id: 'thx', who: 'zh1', after: 'me', text: '谢谢！', cap: '谢谢！  ·  Xièxie!' },
    { s: 3, at: 6.4, id: 'tr2', who: 'tr', after: 'thx', text: 'Dziękuję bardzo!' },
    { s: 4, at: .45, tone: 'warn' },
    { s: 4, at: .9, id: 'n4', who: 'narr', text: 'Kilka minut później. Glukoza spada szybciej niż zwykle. Widzisz to tylko ty.' },
    { s: 5, at: .35, tone: 'hud' },
    { s: 5, at: .8, id: 'n5', who: 'narr', text: 'Czas na lek. Potwierdzasz go mrugnięciem, bez dotykania telefonu.' },
    { s: 5, at: 3.2, blink: true, after: 'n5' },
    { s: 6, at: 1, id: 'n6', who: 'narr', text: 'Dla otoczenia nic się nie zmieniło. Widzą zwykłe oko.' },
    { s: 7, at: .6, id: 'n7', who: 'narr', text: 'LumiAI. Ekran AI przed oczami. Niewidoczny dla innych.' },
    { s: 7, at: .3, tone: 'end' }
  ];
  var WHO = { narr: 'Lektor', tr: 'Tłumacz', zh1: 'Przechodzień', zh2: 'Ty' };
  var VOICE = { narr: { lang: 'pl', rate: .95, pitch: .92 }, tr: { lang: 'pl', rate: 1.02, pitch: 1.04 }, zh1: { lang: 'zh', rate: .86, pitch: .9 }, zh2: { lang: 'zh', rate: .84, pitch: 1.12 } };

  /* ---------- głosy ---------- */
  var synth = window.speechSynthesis || null, voices = [], choice = { narr: '', tr: '', zh: '' };
  try { var sv = JSON.parse(localStorage.getItem('lumi-voices') || '{}'); if (sv && typeof sv === 'object') { choice.narr = sv.narr || ''; choice.tr = sv.tr || ''; choice.zh = sv.zh || ''; } } catch (e) {}
  var PREF = { narr: /marek|krzysztof|jacek|adam|male|mężczyzna/i, tr: /zofia|zosia|paulina|ewa|agnieszka|female|kobieta/i, zh1: /yunxi|yunjian|yunyang|kangkang|male/i, zh2: /xiaoxiao|xiaoyi|huihui|tingting|meijia|female/i };
  function forLang(l) { return voices.filter(function (v) { return v.lang.replace('_', '-').toLowerCase().indexOf(l) === 0; }); }
  function score(v, pref) { var n = v.name, s = 0; if (/natural|neural/i.test(n)) s += 10; if (/online/i.test(n)) s += 3; if (/google/i.test(n)) s += 6; if (/premium|enhanced|siri/i.test(n)) s += 7; if (/zh-cn|cmn|hans/i.test(v.lang)) s += 2; if (pref && pref.test(n)) s += 4; if (/compact|espeak/i.test(n)) s -= 6; return s; }
  function best(l, pref, exclude) { var list = forLang(l), b = null, bs = -99; list.forEach(function (v) { var s = score(v, pref) - (exclude && v === exclude ? 3 : 0); if (s > bs) { bs = s; b = v; } }); return b; }
  function pick(who) {
    var c = VOICE[who], key = c.lang === 'zh' ? 'zh' : who, nm = choice[key];
    if (nm) { for (var i = 0; i < voices.length; i++) if (voices[i].name === nm) return voices[i]; }
    if (who === 'tr') return best('pl', PREF.tr, pick('narr'));
    return best(c.lang, PREF[who]);
  }
  function loadVoices() { voices = synth ? synth.getVoices() : []; fillSelects(); }
  if (synth) { loadVoices(); if ('onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices; }
  function fillSelects() {
    [['#v-narr', 'pl', 'narr'], ['#v-tr', 'pl', 'tr'], ['#v-zh', 'zh', 'zh']].forEach(function (s) {
      var el = $(s[0]); if (!el) return; var list = forLang(s[1]);
      el.innerHTML = '<option value="">Automatycznie (najlepszy dostępny)</option>' + list.map(function (v) { return '<option value="' + v.name.replace(/"/g, '&quot;') + '">' + v.name + '</option>'; }).join('') + (list.length ? '' : '<option disabled>Brak głosu w systemie</option>');
      el.value = choice[s[2]] || '';
    });
  }
  $$('#vpanel select').forEach(function (s) {
    s.addEventListener('change', function () { var k = s.id === 'v-narr' ? 'narr' : s.id === 'v-tr' ? 'tr' : 'zh'; choice[k] = s.value; try { localStorage.setItem('lumi-voices', JSON.stringify(choice)); } catch (e) {} });
  });
  vset.addEventListener('click', function () { var o = vpanel.hidden; vpanel.hidden = !o; vset.setAttribute('aria-expanded', o); if (o) loadVoices(); });
  $('#vtest').addEventListener('click', function () { audioInit(); if (!synth) return; synth.cancel(); ['narr', 'tr', 'zh1'].forEach(function (w) { var u = utter(w, w === 'zh1' ? '你好，很高兴认识你。' : w === 'tr' ? 'Tak brzmi tłumacz.' : 'Tak brzmi lektor filmu LumiAI.'); if (u) synth.speak(u); }); });
  function utter(who, text) {
    if (!synth || !window.SpeechSynthesisUtterance) return null;
    var c = VOICE[who], v = pick(who), u = new SpeechSynthesisUtterance(text);
    u.lang = c.lang === 'zh' ? 'zh-CN' : 'pl-PL'; if (v) { u.voice = v; u.lang = v.lang; }
    var same = who === 'tr' && v && pick('narr') === v;
    u.rate = c.rate; u.pitch = same ? 1.18 : c.pitch; u.volume = 1; return u;
  }

  /* ---------- dźwięk: podkład i sygnały ---------- */
  var AC = null, master, padG, padO = [], padF, muted = false;
  try { muted = localStorage.getItem('lumi-mute') === '1'; } catch (e) {}
  function impulse(sec) { var n = AC.sampleRate * sec, b = AC.createBuffer(2, n, AC.sampleRate); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); } return b; }
  var rev;
  function audioInit() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; return; }
    master = AC.createGain(); master.gain.value = muted ? 0 : 1; master.connect(AC.destination);
    rev = AC.createConvolver(); rev.buffer = impulse(3.4); var rg = AC.createGain(); rg.gain.value = .6; rev.connect(rg); rg.connect(master);
    padG = AC.createGain(); padG.gain.value = 0; padF = AC.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 1100; padF.Q.value = .6;
    padG.connect(padF); padF.connect(master); padF.connect(rev);
    var lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = .07; lg.gain.value = 420; lfo.connect(lg); lg.connect(padF.frequency); lfo.start();
    for (var i = 0; i < 5; i++) {
      var g = AC.createGain(); g.gain.value = 0; g.connect(padG);
      var a = AC.createOscillator(), b = AC.createOscillator(); a.type = 'triangle'; b.type = 'sine'; a.detune.value = -6; b.detune.value = 7;
      a.frequency.value = b.frequency.value = 220; a.connect(g); b.connect(g); a.start(); b.start(); padO.push({ a: a, b: b, g: g });
    }
  }
  function chord(ch) {
    if (!AC) return; var n = AC.currentTime;
    padO.forEach(function (o, i) { var f = ch[i] || ch[i % ch.length] * 2; o.a.frequency.setTargetAtTime(f, n, .7); o.b.frequency.setTargetAtTime(f, n, .7); o.g.gain.setTargetAtTime(i < ch.length ? (i === 0 ? .05 : .03) : 0, n, .9); });
  }
  function padOn(on) { if (!AC) return; padG.gain.setTargetAtTime(on ? .9 : 0, AC.currentTime, on ? 1.2 : .25); }
  function ping(fs, type, gain, gap) {
    if (!AC || muted) return; var n = AC.currentTime;
    fs.forEach(function (f, i) { var o = AC.createOscillator(), g = AC.createGain(), s = n + i * (gap || .09); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(gain || .05, s + .015); g.gain.exponentialRampToValueAtTime(.0005, s + 1.1); o.connect(g); g.connect(master); g.connect(rev); o.start(s); o.stop(s + 1.2); });
  }
  function whoosh() {
    if (!AC || muted) return; var n = AC.currentTime, len = AC.sampleRate * 1.1, b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(260, n); f.frequency.exponentialRampToValueAtTime(2400, n + .9);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.05, n + .35); g.gain.linearRampToValueAtTime(0, n + 1);
    s.connect(f); f.connect(g); g.connect(master); g.connect(rev); s.start(n); s.stop(n + 1.1);
  }
  var TONES = { hud: function () { ping([1318.5, 1975.5], 'sine', .035, .07); }, ready: function () { ping([659.3, 987.8, 1318.5], 'sine', .04, .12); }, warn: function () { ping([880, 659.3], 'triangle', .05, .18); }, ok: function () { ping([987.8, 1318.5], 'sine', .04, .1); }, end: function () { ping([440, 659.3, 880, 1318.5], 'sine', .03, .16); } };
  function setMute(m) {
    muted = m; muteB.textContent = m ? 'Dźwięk: wył.' : 'Dźwięk: wł.'; muteB.setAttribute('aria-pressed', m);
    try { localStorage.setItem('lumi-mute', m ? '1' : '0'); } catch (e) {}
    if (AC) master.gain.setTargetAtTime(m ? 0 : 1, AC.currentTime, .1);
    if (m && synth) { try { synth.cancel(); } catch (e) {} active.forEach(function (a) { if (!a.sim) { a.sim = true; a.until = ft + .3; } }); }
    if (curAudio && m) { try { curAudio.pause(); } catch (e) {} }
  }
  muteB.addEventListener('click', function () { audioInit(); setMute(!muted); });

  /* ---------- silnik ---------- */
  var idx = 0, st = 0, ft = 0, playing = false, started = false, trans = false, fired = {}, ended = {}, cueOn = {}, active = [];
  var typing = null, kwAt = -1, blinkAt = -1, medDone = false, curAudio = null, visible = true, dirty = true;
  var TOTAL = SC.reduce(function (a, s) { return a + s.d; }, 0);
  SC.forEach(function (s, i) { var b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--w', s.d); b.title = (i + 1) + '. ' + s.t; b.setAttribute('aria-label', 'Rozdział ' + (i + 1) + ': ' + s.t); b.innerHTML = '<i></i>'; b.addEventListener('click', function () { jump(i); }); segsEl.appendChild(b); });
  var segI = $$('i', segsEl);

  function estimate(text, lang) { return lang === 'zh' ? .9 + text.length * .32 : .8 + text.length * .068; }
  function caption(c) { caps.innerHTML = '<b>' + WHO[c.who] + '</b>' + (c.cap || c.text).replace(/</g, '&lt;'); caps.style.opacity = 1; }
  function endSpeech(a) { ended[a.id] = 1; if (a.who === 'zh1') talk = false; }
  var talk = false;
  function speak(c) {
    var lang = VOICE[c.who].lang, est = estimate(c.text, lang), entry = { id: c.id, who: c.who, sim: true, until: ft + est, max: ft + est * 2.6 + 4 };
    caption(c); if (c.who === 'zh1') talk = true;
    active.push(entry);
    if (muted) return;
    if (VO_FILES[c.id]) {
      var a = VOA[c.id] || new Audio(VO_FILES[c.id]); curAudio = a; entry.sim = false; duck(true);
      try { a.currentTime = 0; } catch (e) {}
      a.onended = function () { remove(entry); }; a.onerror = function () { entry.sim = true; entry.until = ft + est; };
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () { entry.sim = true; });
      return;
    }
    var u = utter(c.who, c.text), v = u && u.voice;
    if (!u || !v) return; /* brak głosu w tym języku: same napisy w tempie mowy */
    entry.sim = false; duck(true);
    u.onend = function () { remove(entry); };
    u.onerror = function (e) { if (e && (e.error === 'not-allowed' || e.error === 'audio-busy')) showWarn('Przeglądarka zablokowała głos. Kliknij w film, aby go włączyć.'); entry.sim = true; entry.until = ft + .2; };
    try { synth.speak(u); } catch (e) { entry.sim = true; }
  }
  function remove(entry) { var i = active.indexOf(entry); if (i > -1) { active.splice(i, 1); endSpeech(entry); } if (!active.length) duck(false); }
  /* muzyka cichnie pod głosem */
  function duck(on) { if (!AC || !playing) return; padG.gain.setTargetAtTime(on ? .38 : .9, AC.currentTime, on ? .15 : .6); }
  function stopSpeech() { if (synth) { try { synth.cancel(); } catch (e) {} } if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; } active = []; talk = false; }
  function fire(c) {
    if (c.tone) { if (TONES[c.tone]) TONES[c.tone](); return; }
    if (c.blink) { blinkAt = st; lids.classList.remove('blink'); void lids.offsetWidth; lids.classList.add('blink'); return; }
    cueOn[c.id] = true;
    if (c.type) typing = { el: typ1, text: c.text, at: st };
    if (c.kw) kwAt = st;
    speak(c);
  }
  function resetScene(i) {
    idx = i; st = 0; fired = {}; ended = {}; cueOn = {}; typing = null; kwAt = -1; blinkAt = -1; medDone = false;
    typ1.textContent = ''; fmed.classList.remove('done'); lids.classList.remove('blink');
    $$('.kw span', screen).forEach(function (s) { s.classList.remove('lit'); });
    pch.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + SC.length).slice(-2); pti.textContent = SC[i].t;
    hudf.classList.toggle('on', i >= 1 && i <= 5);
    chord(SC[i].ch); dirty = true;
  }
  function go(i, instant) {
    if (trans) return;
    if (instant || reduce) { resetScene(i); return; }
    trans = true; dip.classList.add('on'); whoosh();
    setTimeout(function () { resetScene(i); trans = false; requestAnimationFrame(function () { dip.classList.remove('on'); }); }, 480);
  }
  function jump(i) { audioInit(); if (!started) { begin(i); return; } stopSpeech(); go(i); setPlay(true); }
  function setPlay(p) {
    playing = p; ppi.setAttribute('d', p ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5v14l11-7z'); pp.setAttribute('aria-label', p ? 'Pauza' : 'Odtwórz film');
    if (synth) { try { if (p) synth.resume(); else synth.pause(); } catch (e) {} }
    if (curAudio) { try { if (p) curAudio.play(); else curAudio.pause(); } catch (e) {} }
    padOn(p);
  }
  function showWarn(t) { vwarn.textContent = t; }
  function begin(i) {
    started = true; audioInit(); poster.classList.add('gone');
    Object.keys(VO_FILES).forEach(function (k) { if (!VOA[k]) { var a = new Audio(); a.preload = 'auto'; a.src = VO_FILES[k]; VOA[k] = a; } });
    if (synth) { try { synth.cancel(); var q = new SpeechSynthesisUtterance(' '); q.volume = 0; synth.speak(q); } catch (e) {} loadVoices(); }
    if (hasVO) {}
    else if (!synth) caps.innerHTML = '<b>Uwaga</b>Ta przeglądarka nie odtwarza głosów. Zobaczysz napisy i usłyszysz muzykę.';
    else if (!forLang('zh').length) caps.innerHTML = '<b>Uwaga</b>Brak chińskiego głosu w systemie: kwestie po chińsku pokażą się jako napisy.';
    resetScene(i || 0); setPlay(true);
  }
  poster.addEventListener('click', function () { begin(0); });
  pp.addEventListener('click', function () {
    audioInit();
    if (!started) { begin(0); return; }
    if (!playing && idx === SC.length - 1 && st >= SC[idx].d) { stopSpeech(); go(0); setPlay(true); return; }
    setPlay(!playing);
  });
  cv.addEventListener('click', function () { pp.click(); });
  setTimeout(function () { loadVoices(); if (synth && !forLang('zh').length && voices.length) showWarn('Na tym urządzeniu nie ma chińskiego głosu. Kwestie po chińsku pokażą się jako napisy.'); }, 1200);

  /* ---------- render scen ---------- */
  var D = Math.min(window.devicePixelRatio || 1, 1.5);
  function size() { var r = screen.getBoundingClientRect(), W = Math.round(r.width * D), H = Math.round(r.height * D); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; dirty = true; } return { w: r.width, h: r.height }; }
  function draw(T) {
    var s = size(), w = s.w, h = s.h, sc = SC[idx], p = clamp(st / sc.d, 0, 1), port = h > w;
    x.setTransform(D, 0, 0, D, 0, 0);
    if (sc.bg === 'end') { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); return; }
    var im = sc.img && IMG[sc.img];
    if (im) { photo(im, sc, w, h, p, T); return; }
    x.save(); var k = 1 + .045 * easeOut(p); x.translate(w / 2, h / 2); x.scale(k, k); x.translate(-w / 2, -h / 2);
    if (sc.bg === 'eye' || sc.bg === 'eye2') {
      x.fillStyle = '#050506'; x.fillRect(0, 0, w, h);
      var R = port ? w * .17 : h * .27, e0 = sc.bg === 'eye';
      var zoom = e0 ? 1 : lerp(1.25, 1, easeOut(p * 1.4));
      var bl = 0; if (!e0 && st > 3.6 && st < 4) { var u = (st - 3.6) / .4; bl = u < .4 ? u / .4 : 1 - (u - .4) / .6; }
      x.save(); x.translate(w / 2, h * .5); x.scale(zoom, zoom);
      eye.draw(x, {
        x: 0, y: 0, R: R, t: T, gx: Math.sin(T * .5) * .06, gy: Math.sin(T * .37) * .03,
        open: e0 ? easeOut((st - .15) / 1.3) : 1 - bl * .96,
        pupil: e0 ? lerp(.5, .33, easeOut((st - .6) / 1.6)) : .34 + .01 * Math.sin(T),
        lens: e0 ? smooth(1.4, 1.9, st) : 1, draw: e0 ? easeOut((st - 1.4) / 1.8) : 1, led: e0 ? smooth(3.4, 4.2, st) * (1 - smooth(5.4, 6.2, st) * .5) : 0
      });
      if (e0) {
        var cp = clamp((st - .8) / 3.3, 0, 1);
        if (cp > 0 && st < 5.2) {
          var fa = 1 - smooth(4.4, 5.2, st);
          x.lineCap = 'round'; x.strokeStyle = 'rgba(127,227,240,' + (.12 * fa).toFixed(3) + ')'; x.lineWidth = R * .02; x.beginPath(); x.arc(0, 0, R * 1.45, 0, 7); x.stroke();
          x.strokeStyle = 'rgba(127,227,240,' + (.9 * fa).toFixed(3) + ')'; x.shadowColor = 'rgba(127,227,240,.8)'; x.shadowBlur = 14; x.beginPath(); x.arc(0, 0, R * 1.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cp); x.stroke(); x.shadowBlur = 0;
          for (var i = 0; i < 48; i++) { var an = i / 48 * Math.PI * 2, on = i / 48 < cp; x.strokeStyle = 'rgba(127,227,240,' + ((on ? .6 : .12) * fa).toFixed(3) + ')'; x.lineWidth = R * .006; x.beginPath(); x.moveTo(Math.cos(an) * R * 1.52, Math.sin(an) * R * 1.52); x.lineTo(Math.cos(an) * R * (i % 6 ? 1.56 : 1.6), Math.sin(an) * R * (i % 6 ? 1.56 : 1.6)); x.stroke(); }
        }
        calp.textContent = Math.round(cp * 100) + '%';
      }
      x.restore();
    } else {
      var walk = sc.bg === 'walk', bob = walk ? Math.sin(T * 5.2) * h * .006 : Math.sin(T * .9) * h * .002;
      var person = null;
      if (!walk) {
        var a = idx === 1 ? easeOut(st / 3) : 1;
        person = { x: lerp(.84, .56, a), scale: lerp(.46, .8, a), talk: talk };
      }
      city.draw(x, w, h, T, { drift: walk ? 4 : .8, bob: bob, blur: walk ? 1.25 : 1, person: person });
      if (idx === 4) { var wa = smooth(.3, 1.2, st) * (.5 + .5 * Math.sin(T * 3)); var vg = x.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, w * .7); vg.addColorStop(0, 'rgba(232,176,78,0)'); vg.addColorStop(1, 'rgba(232,176,78,' + (.16 * wa).toFixed(3) + ')'); x.fillStyle = vg; x.fillRect(0, 0, w, h); }
    }
    x.restore();
  }
  /* kadr ze zdjęcia: ruch kamery, kamera z ręki, krok, nakładki i gradacja */
  var EYE_PT = { x: .55, y: .459, r: .3 };
  function photo(im, sc, w, h, p, T) {
    var c = sc.cam, e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    var s = lerp(c[0], c[3], e), fx = lerp(c[1], c[4], e), fy = lerp(c[2], c[5], e), walk = sc.fx === 'walk';
    var hx = Math.sin(T * .7) * .0025 + Math.sin(T * 1.9) * .0011, hy = Math.cos(T * .6) * .002 + (walk ? Math.abs(Math.sin(T * 2.7)) * .008 - .004 : 0);
    var rot = (Math.sin(T * .5) * .12 + (walk ? Math.sin(T * 2.7) * .3 : 0)) * Math.PI / 180;
    var base = Math.max(w / im.width, h / im.height), dw = im.width * base * s, dh = im.height * base * s;
    var x0 = clamp(w / 2 - fx * dw, w - dw, 0), y0 = clamp(h / 2 - fy * dh, h - dh, 0);
    x.save(); x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    x.translate(w / 2, h / 2); x.rotate(rot); x.scale(1.035, 1.035); x.translate(-w / 2 + hx * w, -h / 2 + hy * h);
    x.drawImage(im, x0, y0, dw, dh);
    if (idx === 0) {
      /* skaner kalibracji na prawdziwej tęczówce */
      var cx = x0 + EYE_PT.x * dw, cy = y0 + EYE_PT.y * dh, R = EYE_PT.r * dh, cp = clamp((st - .8) / 3.3, 0, 1), fa = 1 - smooth(4.4, 5.2, st);
      if (cp > 0 && fa > 0) {
        x.lineCap = 'round'; x.lineWidth = Math.max(1.5, R * .012);
        x.strokeStyle = 'rgba(127,227,240,' + (.14 * fa).toFixed(3) + ')'; x.beginPath(); x.arc(cx, cy, R * 1.22, 0, 7); x.stroke();
        x.strokeStyle = 'rgba(127,227,240,' + (.95 * fa).toFixed(3) + ')'; x.shadowColor = 'rgba(127,227,240,.9)'; x.shadowBlur = 16;
        x.beginPath(); x.arc(cx, cy, R * 1.22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cp); x.stroke(); x.shadowBlur = 0;
        for (var i = 0; i < 60; i++) { var an = i / 60 * Math.PI * 2, on = i / 60 < cp; x.strokeStyle = 'rgba(127,227,240,' + ((on ? .7 : .15) * fa).toFixed(3) + ')'; x.lineWidth = Math.max(1, R * .005); x.beginPath(); x.moveTo(cx + Math.cos(an) * R * 1.28, cy + Math.sin(an) * R * 1.28); x.lineTo(cx + Math.cos(an) * R * (i % 5 ? 1.32 : 1.37), cy + Math.sin(an) * R * (i % 5 ? 1.32 : 1.37)); x.stroke(); }
        var sy = cy - R + 2 * R * ((st * .55) % 1), sl = x.createLinearGradient(cx - R, 0, cx + R, 0);
        sl.addColorStop(0, 'rgba(127,227,240,0)'); sl.addColorStop(.5, 'rgba(127,227,240,' + (.5 * fa).toFixed(3) + ')'); sl.addColorStop(1, 'rgba(127,227,240,0)');
        x.save(); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.clip(); x.fillStyle = sl; x.fillRect(cx - R, sy - 1, 2 * R, 2); x.restore();
      }
      var led = smooth(3.6, 4.4, st);
      if (led > 0) for (var j = 0; j < 80; j++) { var a2 = -2.4 + 2 * j / 79, al = led * (.25 + .3 * Math.sin(T * 2.6 - j * .3)); x.fillStyle = 'rgba(127,227,240,' + Math.max(0, al).toFixed(3) + ')'; x.beginPath(); x.arc(cx + Math.cos(a2) * R * 1.03, cy + Math.sin(a2) * R * 1.03, Math.max(1, R * .006), 0, 7); x.fill(); }
      calp.textContent = Math.round(cp * 100) + '%';
    }
    x.restore();
    /* światło z ulicy przesuwające się po kadrze */
    if (sc.bg === 'city' || walk) {
      x.globalCompositeOperation = 'lighter';
      var lx = w * (.2 + .6 * ((T * .03) % 1)), lg = x.createRadialGradient(lx, h * .2, 0, lx, h * .2, w * .5);
      lg.addColorStop(0, 'rgba(255,170,100,.07)'); lg.addColorStop(1, 'rgba(255,170,100,0)'); x.fillStyle = lg; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'source-over';
    }
    /* gradacja: lekkie przyciemnienie góry i dołu, winieta */
    var tb = x.createLinearGradient(0, 0, 0, h); tb.addColorStop(0, 'rgba(0,0,0,.35)'); tb.addColorStop(.2, 'rgba(0,0,0,0)'); tb.addColorStop(.75, 'rgba(0,0,0,0)'); tb.addColorStop(1, 'rgba(0,0,0,.45)');
    x.fillStyle = tb; x.fillRect(0, 0, w, h);
    if (idx === 4) { var wa = smooth(.3, 1.2, st) * (.5 + .5 * Math.sin(T * 3)), vg = x.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, w * .7); vg.addColorStop(0, 'rgba(232,176,78,0)'); vg.addColorStop(1, 'rgba(232,176,78,' + (.18 * wa).toFixed(3) + ')'); x.fillStyle = vg; x.fillRect(0, 0, w, h); }
    if (idx === 0) { var fi = 1 - smooth(0, 1.4, st); if (fi > 0) { x.fillStyle = 'rgba(0,0,0,' + fi.toFixed(3) + ')'; x.fillRect(0, 0, w, h); } }
  }
  function drawPoster() { var keep = { idx: idx, st: st }; idx = 0; st = 5.6; draw(performance.now() / 1000); idx = keep.idx; st = keep.st; }

  /* ---------- pętla ---------- */
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(.1, (now - last) / 1000), T = now / 1000; last = now;
    if (document.hidden || (!playing && !dirty)) { requestAnimationFrame(frame); return; }
    if (playing && !trans && visible) {
      st += dt; ft += dt;
      CUES.forEach(function (c, k) { if (c.s !== idx || fired[k] || st < c.at) return; if (c.after && !ended[c.after]) return; fired[k] = 1; fire(c); });
      for (var i = active.length - 1; i >= 0; i--) { var a = active[i]; if ((a.sim && ft >= a.until) || ft >= a.max) { active.splice(i, 1); endSpeech(a); } }
      if (typing) { var n = Math.floor((st - typing.at) * 24); typing.el.textContent = typing.text.slice(0, n); if (n >= typing.text.length) typing = null; }
      if (kwAt >= 0) { var lit = Math.floor((st - kwAt) / .75) + 1; ['#kw1', '#kw2', '#kw3'].forEach(function (q) { $$(':scope > span', $(q)).forEach(function (s, j) { s.classList.toggle('lit', j < lit); }); }); }
      if (blinkAt >= 0 && !medDone && st - blinkAt > 1.05) { medDone = true; fmed.classList.add('done'); TONES.ok(); }
      var allFired = CUES.every(function (c, k) { return c.s !== idx || fired[k]; });
      if (st >= SC[idx].d && ((!active.length && allFired) || st > SC[idx].d + 12)) {
        if (idx < SC.length - 1) go(idx + 1);
        else { st = SC[idx].d; setPlay(false); }
      }
    }
    /* widoczność warstw HUD */
    if (started) FE.forEach(function (f) {
      var on = false;
      if (f.s.indexOf(idx) > -1) { if (idx !== f.first) on = true; else if (f.cue) on = !!cueOn[f.cue]; else if (f.at != null) on = st >= f.at; }
      if (on !== f.e.classList.contains('on')) f.e.classList.toggle('on', on);
    });
    if (started && visible && (playing || dirty)) { draw(T); dirty = false; }
    /* pasek postępu */
    if (started) {
      segI.forEach(function (s, j) { s.style.width = '100%'; s.style.transformOrigin = 'left'; s.style.transform = 'scaleX(' + (j < idx ? 1 : j > idx ? 0 : clamp(st / SC[idx].d, 0, 1)) + ')'; });
      var el = 0; for (var j = 0; j < idx; j++) el += SC[j].d; el += Math.min(st, SC[idx].d);
      ptime.textContent = mmss(el) + ' / ' + mmss(TOTAL);
    }
    requestAnimationFrame(frame);
  }
  function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  ptime.textContent = '0:00 / ' + mmss(TOTAL);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (!visible && playing) setPlay(false); if (visible && !started) { drawPoster(); } }, { threshold: .15 }).observe(screen);
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) setPlay(false); });
  addEventListener('resize', function () { dirty = true; if (!started) drawPoster(); });
  muteB.textContent = muted ? 'Dźwięk: wył.' : 'Dźwięk: wł.'; muteB.setAttribute('aria-pressed', muted);
  drawPoster();
  requestAnimationFrame(frame);
})();
