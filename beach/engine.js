/* Coral Key engine. Adapted from Lanternveil (elves/engine.js); files are not shared.
   Saves: kylearcade_beach_* . Mute shares kylearcade_muted.
   Art and script URLs use ?v=1. Video files are requested only when listed in SHIP_LIST. */
(function () {
  'use strict';
  const D = window.BEACH;
  const META_KEY = 'kylearcade_beach_meta';
  const SET_KEY = 'kylearcade_beach_settings';
  const AUTO_KEY = 'kylearcade_beach_auto';
  const GATE_KEY = 'kylearcade_beach_gate';
  const MUTE_KEY = 'kylearcade_muted';
  const ART_V = '?v=2';
  const SPEEDS = [0, 12, 26, 48];
  const IDS = ['aurelia', 'mika', 'celeste', 'sable'];

  const SHIP = Object.create(null);
  (D && D.SHIP_LIST || []).forEach(function (f) { SHIP[f] = 1; });

  let meta = defaultMeta();
  let settings = { speed: 2, auto: false, skip: false };
  let muted = false;
  let state = null;
  let stepList = [];
  let stepIndex = 0;
  let textDone = true;
  let fullText = '';
  let pages = [''];
  let pageIndex = 0;
  let currentId = '';
  let currentWho = 'narr';
  let lineWasKnown = false;
  let loggedLine = '';
  let choiceOpen = false;
  let choiceMenu = 0;
  let choiceTaken = 0;
  let typeTimer = 0;
  let autoTimer = 0;
  let toastTimer = 0;
  let depth = 0;
  let videoOnDone = null;
  let audioCtx = null;
  let returnTo = 'title';
  let wipeMode = '';
  let finishing = false;

  const memStore = Object.create(null);
  function $(id) { return document.getElementById(id); }
  function storeGet(key) {
    try {
      const r = localStorage.getItem(key);
      if (r != null) { memStore[key] = r; return r; }
    } catch (e) {}
    try {
      const r = sessionStorage.getItem(key);
      if (r != null) { memStore[key] = r; return r; }
    } catch (e2) {}
    return memStore[key] == null ? null : memStore[key];
  }
  function storeSet(key, val) {
    memStore[key] = String(val);
    try { localStorage.setItem(key, String(val)); } catch (e) {}
    try { sessionStorage.setItem(key, String(val)); } catch (e2) {}
  }
  function storeDel(key) {
    delete memStore[key];
    try { localStorage.removeItem(key); } catch (e) {}
    try { sessionStorage.removeItem(key); } catch (e2) {}
  }
  function loadJSON(key) {
    const r = storeGet(key);
    if (!r) return null;
    try { return JSON.parse(r); } catch (e) { return null; }
  }
  function saveJSON(key, val) {
    try { storeSet(key, JSON.stringify(val)); } catch (e) {}
  }
  function defaultMeta() {
    return {
      v: 1, read: {}, gallery: {}, endings: {},
      unlocked: { aurelia: [], mika: [], celeste: [], sable: [] },
      worn: { aurelia: '', mika: '', celeste: '', sable: '' }
    };
  }
  function saveMeta() { saveJSON(META_KEY, meta); }
  function saveSettings() { saveJSON(SET_KEY, settings); }
  function syncViewport() {
    const active = document.activeElement;
    const typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    if (!typing) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }
  function pinAfterBlur() {
    syncViewport();
    setTimeout(syncViewport, 60);
    setTimeout(syncViewport, 200);
    setTimeout(syncViewport, 450);
    setTimeout(syncViewport, 800);
  }
  function nudgeVideos() {
    const nodes = document.querySelectorAll('video');
    for (let i = 0; i < nodes.length; i++) {
      const v = nodes[i];
      if (!(v.currentSrc || v.getAttribute('src')) || !v.paused) continue;
      const p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  function withV(src) {
    if (!src) return '';
    return src + (src.indexOf('?') >= 0 ? '' : ART_V);
  }
  function resolveSprite(key) {
    if (!key || !D) return '';
    const file = D.SPRITE_FILES[key];
    if (file && SHIP[file]) return file;
    return '';
  }
  function posterOf(vmeta) {
    if (!vmeta) return '';
    if (vmeta.poster && SHIP[vmeta.poster]) return vmeta.poster;
    if (vmeta.still && SHIP[vmeta.still]) return vmeta.still;
    return '';
  }
  function shipSrc(vmeta) {
    return vmeta && vmeta.src && SHIP[vmeta.src] ? vmeta.src : '';
  }
  function videoMeta(ref) {
    if (!ref || !D.VIDEOS) return null;
    const direct = D.VIDEOS[ref];
    if (direct && !Array.isArray(direct) && direct.src) return direct;
    const parts = String(ref).split('.');
    if (parts.length < 2) return null;
    const list = D.VIDEOS[parts[0]];
    if (!Array.isArray(list)) return null;
    const id = parts.slice(1).join('.');
    for (let i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }
  function cleanName(s) {
    let t = String(s || '').replace(/[<>&]/g, '').replace(/\s+/g, ' ').trim();
    if (!t) t = 'Kai';
    if (t.length > 18) t = t.slice(0, 18).trim();
    return t || 'Kai';
  }
  function fmt(s) {
    return String(s == null ? '' : s).replace(/\{name\}/g, state && state.name ? state.name : 'Kai');
  }
  function toast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1600);
  }
  function blip() {
    if (muted) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') {
        const r = audioCtx.resume();
        if (r && r.catch) r.catch(function () {});
      }
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = 620;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      const t = audioCtx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.stop(t + 0.07);
    } catch (e) {}
  }

  function hasOutfit(who, id) {
    const bag = (state && state.unlocked && state.unlocked[who]) || (meta.unlocked && meta.unlocked[who]) || [];
    return !!(id && bag.indexOf(id) >= 0);
  }
  function wornKey(who) {
    let outfit = (state && state.worn && state.worn[who]) || (meta.worn && meta.worn[who]) || '';
    if (!hasOutfit(who, outfit)) {
      const bag = (state && state.unlocked && state.unlocked[who]) || (meta.unlocked && meta.unlocked[who]) || [];
      outfit = bag.length ? bag[bag.length - 1] : '';
    }
    return outfit ? (who + '.' + outfit) : '';
  }
  function lineSprite(step) {
    if (!step) return '';
    if (step.sprite) return step.sprite;
    if (step.who && D.CAST[step.who]) return wornKey(step.who);
    return '';
  }

  function addAff(who, n, quiet) {
    if (!who || !n || !D.CAST[who] || !state) return;
    state.aff[who] = Math.max(0, Math.min(100, (state.aff[who] || 0) + n));
    if (!quiet) toast(D.CAST[who].name + '  ' + (n > 0 ? '+' : '') + n);
    renderMeters();
  }
  function renderMeters() {
    if (!state) return;
    document.querySelectorAll('[data-meter]').forEach(function (el) {
      const id = el.getAttribute('data-meter');
      const v = state.aff[id] || 0;
      const bar = el.querySelector('i');
      const lab = el.querySelector('b');
      if (bar) bar.style.width = Math.max(0, Math.min(100, v)) + '%';
      if (lab) lab.textContent = String(v);
    });
    const when = $('hudWhen');
    if (when) when.textContent = state.when || 'Friday';
    const you = $('hudYou');
    if (you) you.textContent = (state.name || 'Kai') + '  ·  27';
    const sub = $('mapSub');
    if (sub && state.screen === 'map') {
      sub.textContent = (state.name || 'Kai') + '  ·  age 27';
    }
  }

  function setBg(name) {
    const file = D.BG_FILES[name];
    const img = $('bgImg');
    if (!img || !file || !SHIP[file]) return;
    if (img.dataset.key === name) return;
    img.dataset.key = name;
    img.src = withV(file);
  }
  let loopToken = 0;
  let loopCurrent = '';
  let loopSlot = 0;
  function hideLoops() {
    loopToken += 1;
    loopCurrent = '';
    ['loopA', 'loopB', 'loopPoster'].forEach(function (id) {
      const el = $(id);
      if (!el) return;
      el.classList.remove('on');
    });
  }
  function loopFor(step) {
    if (!D) return null;
    if (step && step.video) {
      const direct = videoMeta(step.video);
      if (direct && direct.loop && shipSrc(direct)) return direct;
    }
    const key = lineSprite(step);
    const ref = key && D.LOOP_FOR && D.LOOP_FOR[key];
    if (!ref) return null;
    const meta = videoMeta(ref);
    if (meta && meta.loop && shipSrc(meta)) return meta;
    return null;
  }
  function armLoop(el) {
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.loop = true;
    el.autoplay = true;
    el.playsInline = true;
    el.preload = 'auto';
    el.playbackRate = 1;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    el.setAttribute('loop', '');
  }
  function showLoop(src, poster) {
    if (!src) { hideLoops(); return; }
    if (src === loopCurrent) {
      const live = $(loopSlot === 1 ? 'loopB' : 'loopA');
      if (live && live.paused) {
        const p = live.play();
        if (p && p.catch) p.catch(function () {});
      }
      return;
    }
    loopCurrent = src;
    const token = ++loopToken;
    const posterEl = $('loopPoster');
    if (posterEl && poster) {
      const url = withV(poster);
      if (posterEl.getAttribute('src') !== url) posterEl.src = url;
      posterEl.classList.add('on');
    }
    const nextId = loopSlot === 0 ? 'loopB' : 'loopA';
    const prevId = loopSlot === 0 ? 'loopA' : 'loopB';
    const next = $(nextId);
    const prev = $(prevId);
    if (!next) return;
    armLoop(next);
    if (poster) next.poster = withV(poster);
    let shown = false;
    const reveal = function () {
      if (shown || token !== loopToken || next.readyState < 2) return;
      shown = true;
      next.playbackRate = 1;
      next.style.zIndex = '3';
      if (prev) prev.style.zIndex = '2';
      next.classList.add('on');
      if (prev) prev.classList.remove('on');
      loopSlot = loopSlot === 0 ? 1 : 0;
      setTimeout(function () {
        if (token !== loopToken) return;
        if (posterEl) posterEl.classList.remove('on');
        if (prev && prev !== next) { try { prev.pause(); } catch (e) {} }
      }, 260);
    };
    const kick = function () {
      if (token !== loopToken || next.readyState < 2) return;
      const p = next.play();
      if (p && p.then) p.then(reveal).catch(function () {});
      else reveal();
    };
    if (next.dataset.src !== src) {
      next.dataset.src = src;
      next.oncanplay = null;
      next.src = withV(src);
      if (next.readyState >= 2) kick();
      else next.oncanplay = kick;
    } else kick();
  }
  function setVisual(step) {
    var who = (step && (step.who || (lineSprite(step) || '').split('.')[0])) || (state && state.sceneWho) || '';
    applyFocus(who);
    if (step && step.bg) setBg(step.bg);
    else if (state && state.play && state.play.bg) setBg(state.play.bg);
    const loop = loopFor(step);
    const cg = $('cgImg');
    if (loop) {
      if (cg) cg.hidden = true;
      showLoop(shipSrc(loop), posterOf(loop) || loop.still || '');
      document.body.classList.toggle('fade-out', !!(step && step.fade));
      return;
    }
    hideLoops();
    const key = lineSprite(step);
    const src = resolveSprite(key);
    if (!cg) return;
    if (!src) {
      cg.hidden = true;
    } else {
      const who = key.split('.')[0];
      if (cg.dataset.src !== src) {
        cg.dataset.src = src;
        cg.alt = D.CAST[who] ? D.CAST[who].name : '';
        cg.src = withV(src);
      }
      cg.hidden = false;
    }
    document.body.classList.toggle('fade-out', !!(step && step.fade));
  }
  function setSpeaker(who) {
    const plate = $('nameplate');
    const el = $('speaker');
    const role = $('role');
    if (!plate || !el) return;
    if (!who || who === 'narr' || !D.CAST[who]) {
      plate.hidden = true;
      el.textContent = '';
      role.textContent = '';
      return;
    }
    plate.hidden = false;
    el.textContent = D.CAST[who].name;
    el.style.color = D.CAST[who].color;
    role.textContent = 'AGE ' + D.CAST[who].age;
  }

  function showBase(name) {
    ['gate', 'title', 'name', 'map', 'scene', 'ending', 'wardrobe', 'gallery', 'viewer'].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = id !== name;
    });
    if (state) state.screen = name;
    document.body.dataset.screen = name;
    document.body.classList.remove('fade-out');
    document.body.classList.remove('choosing');
    if (name !== 'scene') hideLoops();
    syncViewport();
    syncBand();
  }
  function syncBand() {
    var scene = $('scene');
    var box = $('box');
    var on = scene && !scene.hidden && document.body.dataset.screen === 'scene' && box;
    var h = on ? box.offsetHeight : 0;
    document.documentElement.style.setProperty('--band', (h || 0) + 'px');
    if (window.requestAnimationFrame) requestAnimationFrame(layoutLoops);
  }
  var SUBJECT = {
    aurelia: { h: 0.02, t: 0.62, w: 720, ih: 1280 },
    mika: { h: 0.05, t: 0.68, w: 720, ih: 1280 },
    celeste: { h: 0.04, t: 0.66, w: 720, ih: 1280 },
    sable: { h: 0.04, t: 0.66, w: 720, ih: 1280 }
  };
  function layoutLoops() {
    var box = $('loops');
    var stage = $('stage');
    if (!box || !stage || !box.dataset.head) return;
    var head = parseFloat(box.dataset.head);
    var thigh = parseFloat(box.dataset.thigh);
    if (thigh < head + 0.42) thigh = head + 0.5;
    var iw = parseFloat(box.dataset.iw || '720');
    var ih = parseFloat(box.dataset.ih || '1280');
    var r = stage.getBoundingClientRect();
    var bw = r.width, bh = r.height;
    if (bh < 40) return;
    var s0 = Math.max(bw / iw, bh / ih);
    var rh = ih * s0;
    var p = (0.045 * bh - head * rh) / (bh - rh);
    if (!isFinite(p)) p = head;
    var headY = (bh - rh) * p + head * rh;
    if (headY < 0.02 * bh) p = (0.03 * bh - head * rh) / (bh - rh);
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    box.style.setProperty('--fy', (p * 100).toFixed(2) + '%');
  }
  function applyFocus(who) {
    var box = $('loops');
    if (!box) return;
    var s = SUBJECT[who];
    if (!s) {
      box.style.setProperty('--fy', '32%');
      delete box.dataset.head;
      return;
    }
    box.dataset.head = s.h;
    box.dataset.thigh = s.t;
    box.dataset.iw = s.w;
    box.dataset.ih = s.ih;
    layoutLoops();
  }
  function overlayName() { return document.body.dataset.overlay || ''; }
  function showOverlay(name) {
    ['video', 'menu', 'log', 'saves', 'settings'].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = id !== name;
    });
    document.body.dataset.overlay = name || '';
  }
  function clearOverlay() {
    ['video', 'menu', 'log', 'saves', 'settings'].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = true;
    });
    document.body.dataset.overlay = '';
  }

  function clearType() {
    clearTimeout(typeTimer);
    clearTimeout(autoTimer);
  }
  function markRead(id) {
    if (!id || meta.read[id]) return;
    meta.read[id] = 1;
    saveMeta();
  }
  function autoDelay() {
    const base = settings.speed === 0 ? 280 : settings.speed === 1 ? 650 : settings.speed === 3 ? 1500 : 1000;
    return base + Math.min(900, fullText.length * 12);
  }
  function lineFits(text) {
    const wrap = $('lineWrap');
    const el = $('line');
    if (!wrap || !el || wrap.clientHeight < 8) return true;
    el.textContent = text;
    return wrap.scrollHeight <= wrap.clientHeight + 2;
  }
  function paginate(text) {
    const wrap = $('lineWrap');
    if (!wrap || !text) return [text || ''];
    if (lineFits(text)) { $('line').textContent = ''; return [text]; }
    const words = text.split(/(\s+)/);
    const out = [];
    let page = '';
    for (let i = 0; i < words.length; i++) {
      const next = page + words[i];
      if (lineFits(next)) page = next;
      else {
        if (page.trim()) out.push(page.replace(/^\s+/, ''));
        page = words[i].replace(/^\s+/, '');
      }
    }
    if (page.trim()) out.push(page.replace(/^\s+/, ''));
    $('line').textContent = '';
    return out.length ? out : [text];
  }
  function afterTextShown(fromClick) {
    textDone = true;
    const last = pageIndex >= pages.length - 1;
    if (last) markRead(currentId);
    if (last && state && fullText && loggedLine !== currentId + '|' + fullText) {
      loggedLine = currentId + '|' + fullText;
      state.log = state.log || [];
      state.log.push({ who: currentWho, text: fullText });
      if (state.log.length > 80) state.log.shift();
    }
    const btn = $('btnAdvance');
    if (btn) btn.hidden = choiceOpen;
    if (choiceOpen) return;
    clearTimeout(autoTimer);
    if (!fromClick && settings.auto) autoTimer = setTimeout(function () { advance(false); }, autoDelay());
  }
  function typePage() {
    const page = pages[pageIndex] || '';
    textDone = false;
    clearType();
    const el = $('line');
    const btn = $('btnAdvance');
    if (btn) btn.hidden = false;
    const wrap = $('lineWrap');
    if (wrap) wrap.scrollTop = 0;
    if (settings.speed === 0 || (settings.skip && lineWasKnown)) {
      el.textContent = page;
      afterTextShown(false);
      return;
    }
    let i = 0;
    el.textContent = '';
    const step = function () {
      i += 1;
      el.textContent = page.slice(0, i);
      if (i < page.length) typeTimer = setTimeout(step, SPEEDS[settings.speed] || 26);
      else afterTextShown(false);
    };
    if (!page.length) afterTextShown(false);
    else step();
  }
  function typeText(raw, id) {
    fullText = fmt(raw);
    currentId = id || '';
    lineWasKnown = !!(id && meta.read[id]);
    document.body.classList.remove('choosing');
    pages = paginate(fullText);
    pageIndex = 0;
    typePage();
  }
  function completeText() {
    clearType();
    $('line').textContent = pages[pageIndex] || '';
    afterTextShown(true);
  }

  function showSay(step) {
    choiceOpen = false;
    document.body.classList.remove('choosing');
    $('choices').innerHTML = '';
    currentWho = (step && step.who) || 'narr';
    setSpeaker(step.who);
    setVisual(step);
    typeText(step.text || '', step.id || '');
    if (state && state.play) state.play.step = stepIndex;
    autosave();
  }
  function eventEl(t) {
    if (!t) return null;
    if (t.nodeType === 3) return t.parentElement;
    return t;
  }
  function takeChoice(menu, i, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (e && e.preventDefault && e.type !== 'click') e.preventDefault();
    if (!e || e.type !== 'click') swallowNextClick();
    if (menu !== choiceMenu || choiceTaken === menu) return;
    choiceTaken = menu;
    try { pickChoice(i); }
    catch (err) { showCrash(err && (err.stack || err.message) || err); }
  }
  function showChoice(step) {
    clearType();
    textDone = true;
    choiceOpen = true;
    document.body.classList.add('choosing');
    const btn = $('btnAdvance');
    if (btn) btn.hidden = true;
    setSpeaker(step.who);
    if (step.sprite || step.bg) setVisual(step);
    const box = $('choices');
    box.innerHTML = '';
    choiceMenu += 1;
    const menu = choiceMenu;
    (step.options || []).forEach(function (opt, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.id = 'choice' + i;
      b.textContent = fmt(opt.text);
      function arm(e) { takeChoice(menu, i, e); }
      b.addEventListener('pointerup', arm);
      b.addEventListener('click', arm);
      box.appendChild(b);
    });
    if (state && state.play) state.play.step = stepIndex;
    autosave();
  }

  function present() {
    if (depth > 64) { showCrash('Scene ran too long.'); return; }
    depth += 1;
    try { presentBody(); }
    finally { depth -= 1; }
  }
  function presentBody() {
    if (!stepList) return;
    if (stepIndex >= stepList.length) { finishScene(); return; }
    const step = stepList[stepIndex];
    if (state && state.play) state.play.step = stepIndex;
    if (!step || !step.op) { stepIndex += 1; present(); return; }
    if (step.bg) setBg(step.bg);
    if (step.op === 'say') { showSay(step); return; }
    if (step.op === 'choice') { showChoice(step); return; }
    if (step.op === 'aff') { addAff(step.who, step.n, step.quiet !== false); stepIndex += 1; present(); return; }
    if (step.op === 'unlock') {
      if (step.outfit) unlockOutfit(step.who, step.outfit);
      if (step.gallery) unlockGallery(step.gallery);
      stepIndex += 1;
      present();
      return;
    }
    if (step.op === 'branch') {
      const v = (state.aff && state.aff[step.who]) || 0;
      const pick = v < (step.below == null ? 16 : step.below) ? step.low : step.high;
      stepList.splice(stepIndex, 1, {
        op: 'say',
        id: step.id + '_b',
        who: step.who || 'narr',
        sprite: (pick && pick.sprite) || step.sprite || '',
        text: (pick && pick.text) || '',
        fade: pick && pick.fade,
        bg: pick && pick.bg
      });
      present();
      return;
    }
    if (step.op === 'video') { playVideoStep(step); return; }
    stepIndex += 1;
    present();
  }

  function swallowNextClick() {
    let done = false;
    const cleanup = function () {
      if (done) return;
      done = true;
      document.removeEventListener('click', eat, true);
    };
    const eat = function (e) {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
    };
    document.addEventListener('click', eat, true);
    setTimeout(cleanup, 0);
  }
  let lastAdvance = 0;
  function advance(fromUser) {
    if (fromUser) {
      const now = Date.now();
      if (now - lastAdvance < 250) return;
      lastAdvance = now;
    }
    if (overlayName()) return;
    if (!state || state.screen !== 'scene' || !state.play || finishing) return;
    if (choiceOpen) return;
    if (!textDone) { completeText(); return; }
    if (pageIndex < pages.length - 1) { pageIndex += 1; typePage(); return; }
    stepIndex += 1;
    present();
  }
  function pickChoice(i) {
    if (!choiceOpen) return;
    const step = stepList[stepIndex];
    if (!step || step.op !== 'choice') return;
    const opt = step.options[i];
    if (!opt) return;
    const who = opt.who || step.who || (state && state.sceneWho);
    if (opt.aff) addAff(who, opt.aff, false);
    if (opt.flag && state) state.seen[opt.flag] = true;
    choiceOpen = false;
    $('choices').innerHTML = '';
    document.body.classList.remove('choosing');
    blip();
    if (opt.scene) {
      const sc = D.SCENES[opt.scene];
      if (!sc) { showCrash('Missing scene ' + opt.scene); return; }
      runScene(sc, 'schedule');
      return;
    }
    if (opt.reply) {
      stepList.splice(stepIndex + 1, 0, {
        op: 'say',
        id: (step.id || 'c') + '_r' + i,
        who: who || 'narr',
        sprite: opt.sprite || step.sprite || '',
        text: opt.reply
      });
    }
    stepIndex += 1;
    if (state && state.play) state.play.steps = stepList;
    present();
  }

  function outfitName(who, id) {
    const list = D.OUTFITS[who] || [];
    for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i].name;
    return id;
  }
  function unlockOutfit(who, id) {
    if (!who || !id || !state) return;
    state.unlocked[who] = state.unlocked[who] || [];
    const fresh = state.unlocked[who].indexOf(id) < 0;
    if (fresh) state.unlocked[who].push(id);
    meta.unlocked[who] = state.unlocked[who].slice();
    state.worn[who] = id;
    meta.worn[who] = id;
    saveMeta();
    if (fresh) toast(outfitName(who, id) + ' unlocked');
  }
  function unlockGallery(id) {
    if (!id || !D.GALLERY[id]) return;
    state.gallery = state.gallery || {};
    const first = !meta.gallery[id];
    state.gallery[id] = 1;
    meta.gallery[id] = 1;
    saveMeta();
    if (first) toast('Memory  ·  ' + D.GALLERY[id].title);
  }

  function runScene(scene, after) {
    if (!scene) return;
    state.seen[scene.id] = true;
    if (scene.marks === 'day') state.dayDone = scene.id;
    if (scene.marks === 'night') state.nightDone = scene.id;
    if (scene.when) state.when = scene.when;
    if (scene.who) state.sceneWho = scene.who;
    const steps = JSON.parse(JSON.stringify(scene.steps || []));
    stepList = steps;
    stepIndex = 0;
    choiceOpen = false;
    state.phase = scene.phase || state.phase;
    state.play = {
      sceneId: scene.id,
      step: 0,
      steps: steps,
      after: after || 'schedule',
      who: scene.who || null,
      bg: scene.bg || 'beach',
      marks: scene.marks || ''
    };
    state.ending = null;
    showBase('scene');
    clearOverlay();
    setBg(scene.bg || 'beach');
    renderMeters();
    present();
    autosave();
  }
  function finishScene() {
    if (finishing) return;
    const play = state && state.play;
    const after = play ? play.after : 'schedule';
    if (play && play.who) state.focus = play.who;
    if (state) state.play = null;
    choiceOpen = false;
    clearType();
    document.body.classList.remove('choosing');
    finishing = true;
    // Let the click that ended the line land on the scene, not on whatever
    // screen appears underneath the finger.
    setTimeout(function () {
      finishing = false;
      if (!state || state.play) return;
      if (after && after.indexOf('ending:') === 0) {
        const id = after.slice(7);
        const warm = (state.aff[id] || 0) >= (D.BONUS_AFF || 16);
        if (!state.bonusPlayed && warm && D.BONUS && D.BONUS[id]) {
          state.bonusPlayed = 1;
          runScene(D.BONUS[id], 'ending:' + id);
          return;
        }
        if (!state.checkoutPlayed && D.CHECKOUT && D.CHECKOUT[id]) {
          state.checkoutPlayed = 1;
          runScene(D.CHECKOUT[id], 'ending:' + id);
          return;
        }
        showEndingCard(id, false);
      } else advanceSchedule();
    }, 0);
  }
  function advanceSchedule() {
    if (!state) return;
    if (!state.seen.friday_lobby) return runScene(D.SCENES.friday_lobby, 'schedule');
    if (!state.seen.friday_room) return runScene(D.SCENES.friday_room, 'schedule');
    if (!state.seen.saturday_open) return runScene(D.SCENES.saturday_open, 'schedule');
    if (!state.dayDone) {
      state.phase = 'day';
      state.when = 'Saturday';
      showPlanner();
      return;
    }
    if (!state.seen.dusk_open) return runScene(D.SCENES.dusk_open, 'schedule');
    if (!state.nightDone) {
      state.phase = 'night';
      state.when = 'Saturday night';
      showPlanner();
      return;
    }
    beginEnding();
  }
  function showPlanner() {
    state.play = null;
    showBase('map');
    clearOverlay();
    const map = $('map');
    if (map) map.scrollTop = 0;
    const night = state.phase === 'night';
    const dayBox = $('dayPlaces');
    const nightBox = $('nightPlaces');
    if (dayBox) dayBox.hidden = night;
    if (nightBox) nightBox.hidden = !night;
    const k = $('mapKicker');
    if (k) k.textContent = night ? 'Saturday night' : 'Saturday';
    const h = $('mapHeading');
    if (h) h.textContent = night ? 'Where does the evening go?' : 'Where will you spend the light?';
    renderMeters();
    autosave();
  }
  function winner() {
    let best = IDS[0];
    IDS.forEach(function (id) {
      const v = state.aff[id] || 0;
      const b = state.aff[best] || 0;
      if (v > b) best = id;
      else if (v === b && state.focus === id) best = id;
    });
    return best;
  }
  function beginEnding() {
    const id = winner();
    state.phase = 'sunday';
    state.when = 'Sunday';
    state.route = id;
    state.bonusPlayed = 0;
    state.checkoutPlayed = 0;
    runScene(D.ENDINGS[id], 'ending:' + id);
  }
  function showEndingCard(id, replay) {
    state.ending = id;
    state.phase = 'ending';
    state.when = 'Sunday';
    state.play = null;
    if (!replay) {
      meta.endings[id] = (meta.endings[id] || 0) + 1;
      meta.routes = meta.routes || {};
      meta.routes[id] = 1;
      unlockGallery('end_' + id);
      D.GALLERY_ORDER.forEach(function (gid) {
        const g = D.GALLERY[gid];
        if (g && g.route && g.who === id) unlockGallery(gid);
      });
      saveMeta();
    }
    const card = D.CARDS[id];
    $('endingKicker').textContent = card ? card.kicker : 'SUNDAY';
    $('endingTitle').textContent = card ? card.title : id;
    $('endingBody').textContent = fmt(card ? card.text : '');
    document.body.classList.remove('fade-out');
    showBase('ending');
    clearOverlay();
    setBg('beach');
    const cg = $('cgImg');
    if (cg) cg.hidden = true;
    autosave();
  }

  function blankState(name) {
    return {
      v: 1,
      name: name,
      aff: { aurelia: 0, mika: 0, celeste: 0, sable: 0 },
      seen: {},
      focus: '',
      phase: 'friday',
      when: 'Friday',
      dayDone: '',
      nightDone: '',
      route: '',
      worn: { aurelia: '', mika: '', celeste: '', sable: '' },
      unlocked: { aurelia: [], mika: [], celeste: [], sable: [] },
      gallery: {},
      log: [],
      screen: 'scene',
      ending: null,
      sceneWho: null,
      play: null,
      bonusPlayed: 0,
      checkoutPlayed: 0
    };
  }
  function newGame(name) {
    state = blankState(cleanName(name));
    IDS.forEach(function (id) {
      const u = (meta.unlocked && meta.unlocked[id]) ? meta.unlocked[id].slice() : [];
      state.unlocked[id] = u;
      const want = meta.worn && meta.worn[id];
      state.worn[id] = want && u.indexOf(want) >= 0 ? want : (u[u.length - 1] || '');
    });
    state.gallery = Object.assign({}, meta.gallery || {});
    runScene(D.SCENES.friday_lobby, 'schedule');
  }

  function capture() {
    if (!state) return null;
    return {
      v: 1,
      name: state.name,
      aff: Object.assign({}, state.aff),
      seen: Object.assign({}, state.seen),
      focus: state.focus || '',
      phase: state.phase,
      when: state.when,
      dayDone: state.dayDone || '',
      nightDone: state.nightDone || '',
      route: state.route || '',
      worn: Object.assign({}, state.worn),
      unlocked: JSON.parse(JSON.stringify(state.unlocked)),
      gallery: Object.assign({}, state.gallery || {}),
      log: (state.log || []).slice(-60),
      screen: state.screen,
      ending: state.ending || null,
      sceneWho: state.sceneWho || null,
      play: state.play ? {
        sceneId: state.play.sceneId,
        step: state.play.step,
        steps: state.play.steps,
        after: state.play.after,
        who: state.play.who || null,
        bg: state.play.bg || 'beach',
        marks: state.play.marks || ''
      } : null,
      ts: Date.now()
    };
  }
  function autosave() {
    const snap = capture();
    if (snap) saveJSON(AUTO_KEY, snap);
    refreshTitleBits();
  }
  function normalize(snap) {
    const s = blankState(snap.name || 'Kai');
    s.name = cleanName(snap.name || 'Kai');
    s.aff = Object.assign(s.aff, snap.aff || {});
    s.seen = Object.assign({}, snap.seen || {});
    s.focus = snap.focus || '';
    s.phase = snap.phase || 'friday';
    s.when = snap.when || 'Friday';
    s.dayDone = snap.dayDone || '';
    s.nightDone = snap.nightDone || '';
    s.route = snap.route || '';
    s.worn = Object.assign(s.worn, snap.worn || {});
    s.unlocked = snap.unlocked || s.unlocked;
    s.gallery = Object.assign({}, snap.gallery || {});
    s.log = snap.log || [];
    s.screen = snap.screen || 'scene';
    s.ending = snap.ending || null;
    s.sceneWho = snap.sceneWho || null;
    s.play = snap.play || null;
    return s;
  }
  function restore(snap) {
    if (!snap || snap.v !== 1) return;
    state = normalize(snap);
    clearType();
    clearOverlay();
    choiceOpen = false;
    if (state.play && state.play.steps && state.play.steps.length) {
      stepList = state.play.steps;
      stepIndex = state.play.step || 0;
      if (stepIndex < 0) stepIndex = 0;
      showBase('scene');
      setBg(state.play.bg || 'beach');
      renderMeters();
      present();
      return;
    }
    if (state.ending) { showEndingCard(state.ending, true); return; }
    advanceSchedule();
  }
  function slotKey(n) { return 'kylearcade_beach_slot_' + n; }
  function saveSlot(n) {
    const snap = capture();
    if (!snap) return;
    const phase = snap.when || 'Friday';
    snap.label = phase + '  ·  ' + IDS.map(function (id) {
      return D.CAST[id].name[0] + (snap.aff[id] || 0);
    }).join(' ');
    saveJSON(slotKey(n), snap);
    toast('Saved postcard ' + n);
    renderSaves();
  }
  function loadSlot(n) {
    const key = n === 0 ? AUTO_KEY : slotKey(n);
    const snap = loadJSON(key);
    if (!snap) { toast(n === 0 ? 'No weekend to continue.' : 'That postcard is blank.'); return; }
    clearOverlay();
    restore(snap);
    toast(n === 0 ? 'Continued' : 'Loaded postcard ' + n);
  }

  function clearVidEl() {
    const v = $('vid');
    if (!v) return;
    v.onended = null;
    v.onerror = null;
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src');
    try { v.load(); } catch (e) {}
    const poster = $('vidPoster');
    if (poster) {
      poster.hidden = true;
      if (poster.getAttribute('src')) poster.removeAttribute('src');
    }
  }
  function finishVideo() {
    const cb = videoOnDone;
    videoOnDone = null;
    clearVidEl();
    const ov = $('video');
    if (ov) ov.hidden = true;
    if (overlayName() === 'video') document.body.dataset.overlay = '';
    if (cb) cb();
  }
  function openVideo(vmeta, src, onDone) {
    videoOnDone = onDone;
    const v = $('vid');
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('muted', '');
    v.preload = 'auto';
    v.controls = false;
    v.loop = !!(vmeta && vmeta.loop);
    v.playbackRate = 1;
    v.disablePictureInPicture = true;
    v.setAttribute('disablepictureinpicture', '');
    const pos = (vmeta && vmeta.pos) || 'center 20%';
    v.style.objectFit = 'cover';
    v.style.objectPosition = pos;
    const posterEl = $('vidPoster');
    if (posterEl) {
      posterEl.style.objectFit = 'cover';
      posterEl.style.objectPosition = pos;
    }
    const poster = posterOf(vmeta);
    if (poster) {
      v.poster = withV(poster);
      posterEl.hidden = false;
      posterEl.src = withV(poster);
    } else {
      v.removeAttribute('poster');
      if (posterEl) posterEl.hidden = true;
    }
    v.onplaying = function () {
      if (posterEl) posterEl.hidden = true;
    };
    $('vidTitle').textContent = vmeta.title || 'Memory';
    $('btnVidSound').textContent = 'Tap for sound';
    showOverlay('video');
    const arm = Date.now();
    v.onended = function () {
      if (Date.now() - arm < 500) return;
      finishVideo();
    };
    v.onerror = function () { finishVideo(); };
    v.src = withV(src);
    let started = false;
    const start = function () {
      if (started || v.readyState < 2) return;
      started = true;
      v.playbackRate = 1;
      const p = v.play();
      if (p && p.catch) p.catch(function () { started = false; });
    };
    v.onloadeddata = start;
    v.oncanplay = start;
  }
  function unmuteVid() {
    const v = $('vid');
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    $('btnVidSound').textContent = 'Sound on';
    const p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function playVideoStep(step) {
    if (step.fallback) {
      showSay({
        op: 'say',
        id: (step.id || 'vid') + '_line',
        who: step.who || 'narr',
        sprite: step.sprite || '',
        text: step.fallback,
        video: step.video,
        fade: step.fade,
        bg: step.bg
      });
      return;
    }
    setVisual(step);
    stepIndex += 1;
    present();
  }

  function renderWardrobe() {
    const root = $('wardGrid');
    const tabs = $('wardTabs');
    if (!root || !tabs) return;
    root.innerHTML = '';
    tabs.innerHTML = '';
    const who = renderWardrobe.who || 'aurelia';
    renderWardrobe.who = who;
    IDS.forEach(function (id) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab' + (id === who ? ' on' : '');
      b.textContent = D.CAST[id].name;
      b.addEventListener('click', function () { renderWardrobe.who = id; renderWardrobe(); });
      tabs.appendChild(b);
    });
    const bag = (state && state.unlocked && state.unlocked[who]) || (meta.unlocked[who] || []);
    const worn = (state && state.worn && state.worn[who]) || meta.worn[who] || '';
    (D.OUTFITS[who] || []).forEach(function (o) {
      const owned = bag.indexOf(o.id) >= 0;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'fit' + (owned && worn === o.id ? ' on' : '') + (owned ? '' : ' lock');
      const t = document.createElement('b');
      t.textContent = owned ? o.name : 'Sealed';
      const s = document.createElement('small');
      s.textContent = owned ? (worn === o.id ? 'Remembering this look' : o.hint) : o.hint;
      card.appendChild(t);
      card.appendChild(s);
      card.disabled = !owned;
      card.addEventListener('click', function () {
        if (!owned) return;
        if (state && state.worn) state.worn[who] = o.id;
        meta.worn[who] = o.id;
        saveMeta();
        renderWardrobe();
      });
      root.appendChild(card);
    });
    previewOutfit(who);
  }
  function previewOutfit(who) {
    const key = wornKey(who);
    const src = resolveSprite(key);
    const img = $('wardImg');
    const crest = $('wardCrest');
    const cap = $('wardCap');
    const blurb = $('wardBlurb');
    if (cap) cap.textContent = D.CAST[who].name + '  ·  age ' + D.CAST[who].age;
    if (blurb) blurb.textContent = D.CAST[who].blurb || '';
    if (src) {
      img.hidden = false;
      img.alt = D.CAST[who].name;
      const url = withV(src);
      if (img.dataset.src !== src) { img.dataset.src = src; img.src = url; }
      crest.hidden = true;
    } else {
      img.hidden = true;
      if (img.getAttribute('src')) img.removeAttribute('src');
      img.dataset.src = '';
      crest.hidden = false;
      crest.textContent = D.CAST[who].name.slice(0, 1);
    }
  }
  function rememberReturn() {
    const screen = (state && state.screen) || document.body.dataset.screen || 'title';
    if (screen === 'wardrobe' || screen === 'gallery' || screen === 'viewer') return;
    returnTo = screen || 'title';
  }
  function openWardrobe() {
    rememberReturn();
    renderWardrobe.who = renderWardrobe.who || (state && state.sceneWho) || 'aurelia';
    renderWardrobe();
    showBase('wardrobe');
    clearOverlay();
    setBg('lobby');
    const el = $('wardrobe');
    if (el) el.scrollTop = 0;
  }
  function renderGallery() {
    const grid = $('galGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const have = Object.assign({}, meta.gallery || {}, (state && state.gallery) || {});
    let lastSec = '';
    D.GALLERY_ORDER.forEach(function (id) {
      const g = D.GALLERY[id];
      if (!g) return;
      const routeOn = !!(g.route && meta.routes && meta.routes[g.who]);
      const on = !!have[id] || routeOn;
      const sec = g.section || '';
      if (sec !== lastSec) {
        lastSec = sec;
        if (sec) {
          const h = document.createElement('div');
          h.className = 'gal-sec';
          h.textContent = sec;
          grid.appendChild(h);
        }
      }
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'gal' + (on ? '' : ' lock');
      const title = document.createElement('b');
      title.textContent = on ? g.title : 'Sealed';
      const sub = document.createElement('small');
      sub.textContent = on ? (g.who && D.CAST[g.who] ? D.CAST[g.who].name : 'Weekend') : 'Not yet';
      card.appendChild(title);
      card.appendChild(sub);
      if (on) card.addEventListener('click', function () { openViewer(id); });
      grid.appendChild(card);
    });
  }
  function openGallery() {
    rememberReturn();
    renderGallery();
    showBase('gallery');
    clearOverlay();
    const el = $('gallery');
    if (el) el.scrollTop = 0;
  }
  function openViewer(id) {
    const g = D.GALLERY[id];
    if (!g) return;
    showBase('viewer');
    const stage = $('viewStage');
    stage.classList.remove('full');
    stage.innerHTML = '';
    const vmeta = g.video ? videoMeta(g.video) : null;
    const vsrc = shipSrc(vmeta);
    if (vmeta && vmeta.loop && vsrc) {
      const v = document.createElement('video');
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.playbackRate = 1;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.setAttribute('loop', '');
      v.poster = withV(posterOf(vmeta) || vmeta.still || '');
      v.src = withV(vsrc);
      v.addEventListener('click', function () { stage.classList.toggle('full'); });
      const p = v.play();
      if (p && p.catch) p.catch(function () {});
      stage.appendChild(v);
    } else {
      const src = resolveSprite(g.sprite);
      if (src) {
        const img = document.createElement('img');
        img.alt = g.title;
        img.decoding = 'async';
        img.src = withV(src);
        img.addEventListener('click', function () { stage.classList.toggle('full'); });
        stage.appendChild(img);
      }
    }
    $('viewTitle').textContent = g.title;
    $('viewCaption').textContent = g.caption || '';
    const play = $('viewPlay');
    play.hidden = !vsrc;
    play.onclick = function () {
      if (!vsrc) return;
      openVideo(vmeta, vsrc, function () { showBase('viewer'); });
    };
  }
  function closeSub() {
    const back = returnTo || 'title';
    if (back === 'scene' && state && state.play) { showBase('scene'); return; }
    if (back === 'map' && state) { showPlanner(); return; }
    if (back === 'ending' && state && state.ending) { showEndingCard(state.ending, true); return; }
    if (back === 'name') { showBase('name'); return; }
    showTitle();
  }

  function renderSaves() {
    const list = $('saveList');
    if (!list) return;
    list.innerHTML = '';
    const mode = renderSaves.mode || 'save';
    $('saveHead').textContent = mode === 'save' ? 'Save a postcard' : 'Load a postcard';
    if (mode === 'load') addSlotRow(list, 'Autosave', loadJSON(AUTO_KEY), function () { loadSlot(0); });
    for (let n = 1; n <= 3; n++) {
      const snap = loadJSON(slotKey(n));
      addSlotRow(list, 'Postcard ' + n, snap, function () {
        if (mode === 'save') saveSlot(n);
        else loadSlot(n);
      });
    }
  }
  function addSlotRow(list, title, snap, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot';
    const t = document.createElement('b');
    t.textContent = title;
    const s = document.createElement('small');
    if (snap) {
      const when = snap.ts ? new Date(snap.ts).toLocaleString() : '';
      s.textContent = (snap.label || snap.when || 'Weekend') + (when ? '  ·  ' + when : '');
    } else s.textContent = 'Empty';
    b.appendChild(t);
    b.appendChild(s);
    b.addEventListener('click', fn);
    list.appendChild(b);
  }
  function openSaves(mode) {
    if (mode === 'save' && !state) { toast('Nothing to save yet.'); return; }
    renderSaves.mode = mode;
    renderSaves();
    showOverlay('saves');
  }
  function openLog() {
    const box = $('logList');
    box.innerHTML = '';
    const rows = (state && state.log) || [];
    if (!rows.length) {
      const p = document.createElement('p');
      p.textContent = 'No lines yet.';
      box.appendChild(p);
    }
    rows.forEach(function (row) {
      const p = document.createElement('p');
      const who = document.createElement('b');
      let name = '';
      if (row.who && D.CAST[row.who]) name = D.CAST[row.who].name;
      who.textContent = name ? name : ' ';
      p.appendChild(who);
      if (name) p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(row.text));
      box.appendChild(p);
    });
    showOverlay('log');
    box.scrollTop = box.scrollHeight;
  }
  function syncSetButtons() {
    document.querySelectorAll('[data-speed]').forEach(function (b) {
      b.classList.toggle('on', settings.speed === +b.getAttribute('data-speed'));
    });
    const mute = $('btnMute');
    if (mute) mute.textContent = muted ? 'Sound off' : 'Sound on';
    const a = $('btnAuto');
    if (a) {
      a.classList.toggle('on', !!settings.auto);
      a.textContent = settings.auto ? 'Auto on' : 'Auto';
    }
    const ma = $('menuAuto');
    if (ma) {
      ma.classList.toggle('on', !!settings.auto);
      ma.textContent = settings.auto ? 'Auto on' : 'Auto';
    }
    const sk = $('menuSkip');
    if (sk) {
      sk.classList.toggle('on', !!settings.skip);
      sk.textContent = settings.skip ? 'Skip on' : 'Skip read';
    }
  }
  function toggleAuto() {
    settings.auto = !settings.auto;
    saveSettings();
    syncSetButtons();
    if (settings.auto && textDone && !choiceOpen && state && state.screen === 'scene') {
      clearTimeout(autoTimer);
      autoTimer = setTimeout(advance, autoDelay());
    }
  }
  function toggleSkip() {
    settings.skip = !settings.skip;
    saveSettings();
    syncSetButtons();
    toast(settings.skip ? 'Read lines appear at once. One tap still moves one line.' : 'Skip off');
  }
  let theme = null;
  let themeArmed = false;
  function ensureTheme() {
    if (muted) return;
    if (!theme) {
      theme = new Audio('audio/theme.mp3');
      theme.loop = true;
      theme.volume = 0.35;
    }
    const p = theme.play();
    if (p && p.catch) p.catch(function () {});
    themeArmed = true;
  }
  function syncTheme() {
    if (!theme) {
      if (!muted) ensureTheme();
      return;
    }
    if (muted) theme.pause();
    else {
      const p = theme.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  function toggleMute() {
    muted = !muted;
    storeSet(MUTE_KEY, muted ? '1' : '0');
    syncTheme();
    syncSetButtons();
  }
  function openSettings() { showOverlay('settings'); syncSetButtons(); }
  let menuTimer = 0;
  function openMenu() {
    if (!state || (state.screen !== 'scene' && state.screen !== 'map')) { openSettings(); return; }
    showOverlay('menu');
    syncSetButtons();
    clearTimeout(menuTimer);
    menuTimer = setTimeout(function () {
      if (overlayName() === 'menu') clearOverlay();
    }, 7000);
  }
  function paintTitleCast() {
    const row = $('titleCast');
    if (!row) return;
    row.innerHTML = '';
    const leads = ['aurelia.hostess', 'mika.maid', 'celeste.beach', 'sable.palms'];
    let any = false;
    leads.forEach(function (key) {
      const src = resolveSprite(key);
      if (!src) return;
      any = true;
      const img = document.createElement('img');
      const who = key.split('.')[0];
      img.alt = D.CAST[who].name;
      img.decoding = 'async';
      img.src = withV(src);
      row.appendChild(img);
    });
    row.hidden = !any;
  }
  function showTitle() {
    clearType();
    showBase('title');
    clearOverlay();
    document.body.classList.remove('fade-out');
    setBg('beach');
    const cg = $('cgImg');
    if (cg) cg.hidden = true;
    paintTitleCast();
    refreshTitleBits();
  }
  function refreshTitleBits() {
    const cont = $('btnCont');
    const auto = loadJSON(AUTO_KEY);
    if (cont) cont.hidden = !auto;
    const info = $('saveInfo');
    if (!info) return;
    const bits = [];
    if (auto) bits.push('Autosave  ·  ' + (auto.when || 'Friday') + (auto.name ? '  ·  ' + auto.name : ''));
    const ends = meta.endings || {};
    const n = IDS.filter(function (id) { return ends[id]; }).length;
    if (n) bits.push('Endings  ' + n + '/4');
    info.textContent = bits.join('   ·   ');
  }
  function submitName() {
    const input = $('nameInput');
    const value = input ? input.value : 'Kai';
    if (input && input.blur) input.blur();
    setTimeout(function () { newGame(value); syncViewport(); }, 80);
    [100, 300, 600, 900].forEach(function (ms) { setTimeout(syncViewport, ms); });
  }
  function onEsc() {
    const ov = overlayName();
    if (ov === 'video') { finishVideo(); return; }
    if (ov) { clearOverlay(); return; }
    const screen = document.body.dataset.screen;
    if (screen === 'wardrobe' || screen === 'gallery' || screen === 'viewer') { closeSub(); return; }
    if (state && (state.screen === 'scene' || state.screen === 'map')) openMenu();
  }
  function showCrash(msg) {
    const el = $('crash');
    if (!el) return;
    el.hidden = false;
    el.textContent = String(msg || 'error');
  }
  function selfCheck() {
    const problems = [];
    if (!D) return ['Story missing'];
    const ids = Object.create(null);
    function walk(scene, label) {
      if (!scene || !scene.id) { problems.push('missing scene ' + label); return; }
      if (ids[scene.id]) problems.push('dup scene ' + scene.id);
      ids[scene.id] = 1;
      (scene.steps || []).forEach(function (st, i) {
        if (!st || !st.op) problems.push(scene.id + ' step ' + i);
        if (!st) return;
        if (st.op === 'video' && st.video && !videoMeta(st.video)) problems.push('unknown video ' + st.video);
        if (st.op === 'say' && !st.text) problems.push('empty line ' + (st.id || scene.id));
        if (st.op === 'choice' && (!(st.options && st.options.length))) problems.push('no choices ' + scene.id);
        if (st.sprite && !D.SPRITE_FILES[st.sprite]) problems.push('bad sprite ' + st.sprite);
        (st.options || []).forEach(function (opt) {
          if (opt.sprite && !D.SPRITE_FILES[opt.sprite]) problems.push('bad opt sprite ' + opt.sprite);
          if (opt.scene && !D.SCENES[opt.scene]) problems.push('bad jump ' + opt.scene);
        });
      });
    }
    Object.keys(D.SCENES).forEach(function (k) { walk(D.SCENES[k], k); });
    Object.keys(D.ENDINGS).forEach(function (k) { walk(D.ENDINGS[k], k); });
    Object.keys(D.VIDEOS).forEach(function (who) {
      const list = D.VIDEOS[who];
      if (!Array.isArray(list)) { problems.push('videos for ' + who + ' must be an array'); return; }
      const seenId = {};
      list.forEach(function (clip, i) {
        if (!clip || !clip.id || !clip.src || !clip.poster) problems.push('video meta ' + who + '[' + i + ']');
        else if (seenId[clip.id]) problems.push('dup video ' + who + '.' + clip.id);
        else seenId[clip.id] = 1;
      });
    });
    D.GALLERY_ORDER.forEach(function (id) {
      const g = D.GALLERY[id];
      if (!g) problems.push('missing gallery ' + id);
      else if (g.sprite && !D.SPRITE_FILES[g.sprite]) problems.push('gallery sprite ' + id);
      else if (g.video && !videoMeta(g.video)) problems.push('gallery video ' + id + ' ' + g.video);
    });
    return problems;
  }

  let bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    if ($('gateYes')) $('gateYes').addEventListener('click', function () {
      storeSet(GATE_KEY, '1');
      showTitle();
    });
    if ($('gateNo')) $('gateNo').addEventListener('click', function () {
      const stay = $('gateStay');
      if (stay) stay.hidden = false;
    });
    $('btnNew').addEventListener('click', function () { showBase('name'); });
    $('btnNameOk').addEventListener('click', submitName);
    $('btnCont').addEventListener('click', function () { loadSlot(0); });
    $('btnGallery').addEventListener('click', openGallery);
    $('btnWardrobe').addEventListener('click', openWardrobe);
    $('btnSettings').addEventListener('click', openSettings);
    $('btnTitleFromName').addEventListener('click', showTitle);
    $('place-pool').addEventListener('click', function () { if (state && state.phase === 'day') runScene(D.SCENES.pool_gate, 'schedule'); });
    $('place-beach').addEventListener('click', function () { if (state && state.phase === 'day') runScene(D.SCENES.celeste_day, 'schedule'); });
    $('place-palms').addEventListener('click', function () { if (state && state.phase === 'day') runScene(D.SCENES.sable_day, 'schedule'); });
    $('place-tiki').addEventListener('click', function () { if (state && state.phase === 'night') runScene(D.SCENES.tiki_gate, 'schedule'); });
    $('place-bonfire').addEventListener('click', function () { if (state && state.phase === 'night') runScene(D.SCENES.celeste_night, 'schedule'); });
    $('mapWardrobe').addEventListener('click', openWardrobe);
    $('mapGallery').addEventListener('click', openGallery);
    $('mapSave').addEventListener('click', function () { openSaves('save'); });
    $('mapLoad').addEventListener('click', function () { openSaves('load'); });
    $('mapSettings').addEventListener('click', openSettings);
    $('mapToTitle').addEventListener('click', function () { autosave(); showTitle(); });
    function advanceTap(e) {
      if (e && e.pointerType === 'mouse' && e.button !== 0) return;
      if (e && e.type !== 'click' && e.preventDefault) e.preventDefault();
      if (e && e.stopPropagation) e.stopPropagation();
      advance(true);
    }
    $('btnAdvance').addEventListener('pointerup', advanceTap);
    $('btnAdvance').addEventListener('click', advanceTap);
    let holdTimer = 0;
    let heldMenu = false;
    $('scene').addEventListener('pointerdown', function (e) {
      const el = eventEl(e.target);
      if (el && el.closest && el.closest('button, a, input, textarea, .choice')) return;
      heldMenu = false;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(function () { heldMenu = true; openMenu(); }, 560);
    });
    function sceneTap(e) {
      clearTimeout(holdTimer);
      if (heldMenu) { heldMenu = false; if (e && e.stopPropagation) e.stopPropagation(); return; }
      if (e && e.pointerType === 'mouse' && e.button !== 0) return;
      const el = eventEl(e && e.target);
      if (el && el.closest && el.closest('button, a, input, textarea, .choice')) return;
      if (overlayName()) return;
      if (e && e.type !== 'click' && e.preventDefault) e.preventDefault();
      advance(true);
    }
    $('scene').addEventListener('pointerup', sceneTap);
    $('scene').addEventListener('click', sceneTap);
    $('scene').addEventListener('pointercancel', function () { clearTimeout(holdTimer); });
    document.addEventListener('pointerup', function () { ensureTheme(); });
    $('btnAuto').addEventListener('click', function (e) { e.stopPropagation(); toggleAuto(); });
    $('btnLog').addEventListener('click', function (e) { e.stopPropagation(); openLog(); });
    $('btnMenu').addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });
    $('btnPeek').addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });
    $('menuAuto').addEventListener('click', function (e) { e.stopPropagation(); toggleAuto(); });
    $('btnVidSkip').addEventListener('click', function (e) { e.stopPropagation(); finishVideo(); });
    $('btnVidSound').addEventListener('click', function (e) { e.stopPropagation(); unmuteVid(); });
    $('vid').addEventListener('click', function (e) { e.stopPropagation(); unmuteVid(); });
    $('menuClose').addEventListener('click', clearOverlay);
    $('menuSave').addEventListener('click', function () { openSaves('save'); });
    $('menuLoad').addEventListener('click', function () { openSaves('load'); });
    $('menuLog').addEventListener('click', openLog);
    $('menuSkip').addEventListener('click', function (e) { e.stopPropagation(); toggleSkip(); });
    $('menuWard').addEventListener('click', function () { clearOverlay(); openWardrobe(); });
    $('menuGal').addEventListener('click', function () { clearOverlay(); openGallery(); });
    $('menuSet').addEventListener('click', openSettings);
    $('menuTitle').addEventListener('click', function () { autosave(); clearOverlay(); showTitle(); });
    $('logClose').addEventListener('click', clearOverlay);
    $('saveClose').addEventListener('click', clearOverlay);
    $('setClose').addEventListener('click', clearOverlay);
    $('wardBack').addEventListener('click', closeSub);
    $('galBack').addEventListener('click', closeSub);
    $('viewClose').addEventListener('click', function () { renderGallery(); showBase('gallery'); });
    $('btnEndingTitle').addEventListener('click', showTitle);
    $('btnEndingGallery').addEventListener('click', openGallery);
    $('btnAgain').addEventListener('click', function () { showBase('name'); });
    document.querySelectorAll('[data-speed]').forEach(function (b) {
      b.addEventListener('click', function () {
        settings.speed = +b.getAttribute('data-speed');
        saveSettings();
        syncSetButtons();
      });
    });
    $('btnMute').addEventListener('click', toggleMute);
    $('btnWipe').addEventListener('click', function () {
      wipeMode = 'saves';
      $('wipeAsk').hidden = false;
      $('wipeRow').hidden = false;
      $('wipeAsk').textContent = 'Erase the postcards and the autosave? Memories stay.';
    });
    $('btnWipeAll').addEventListener('click', function () {
      wipeMode = 'all';
      $('wipeAsk').hidden = false;
      $('wipeRow').hidden = false;
      $('wipeAsk').textContent = 'Erase saves, memories, outfits, and the read log?';
    });
    $('wipeYes').addEventListener('click', function () {
      if (wipeMode === 'all') {
        meta = defaultMeta();
        saveMeta();
        settings.auto = false;
        settings.skip = false;
        saveSettings();
      }
      storeDel(AUTO_KEY);
      for (let n = 1; n <= 3; n++) storeDel(slotKey(n));
      $('wipeAsk').hidden = true;
      $('wipeRow').hidden = true;
      toast(wipeMode === 'all' ? 'Memories cleared' : 'Saves cleared');
      refreshTitleBits();
    });
    $('wipeNo').addEventListener('click', function () {
      $('wipeAsk').hidden = true;
      $('wipeRow').hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { onEsc(); return; }
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Enter' && e.target.id === 'nameInput') { e.preventDefault(); submitName(); }
        return;
      }
      if (tag === 'BUTTON') return;
      if (e.key === 'a' || e.key === 'A') { if (!e.repeat) toggleAuto(); return; }
      if (choiceOpen && e.key >= '1' && e.key <= '9') {
        const n = +e.key - 1;
        if ($('choice' + n)) { e.preventDefault(); takeChoice(choiceMenu, n, e); }
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        if (document.body.dataset.screen !== 'scene') return;
        e.preventDefault();
        if (e.repeat && !textDone) { completeText(); return; }
        advance(true);
      }
    });
    window.addEventListener('pagehide', autosave);
  }

  function bootGate() {
    showTitle();
  }

  function init() {
    if (!D) { showCrash('Story missing'); return; }
    const m = loadJSON(META_KEY);
    if (m && m.v === 1) {
      meta = defaultMeta();
      meta.read = m.read || {};
      meta.gallery = m.gallery || {};
      meta.endings = m.endings || {};
      IDS.forEach(function (id) {
        if (m.unlocked && m.unlocked[id]) meta.unlocked[id] = m.unlocked[id];
        if (m.worn && m.worn[id]) meta.worn[id] = m.worn[id];
      });
    }
    const st = loadJSON(SET_KEY);
    if (st) settings = Object.assign(settings, st);
    muted = storeGet(MUTE_KEY) === '1';
    const q = new URLSearchParams(location.search).get('speed');
    if (q != null && q !== '') settings.speed = Math.max(0, Math.min(3, +q || 0));
    bind();
    syncViewport();
    document.addEventListener('focusout', pinAfterBlur, true);
    document.addEventListener('pointerup', nudgeVideos, true);
    document.addEventListener('click', nudgeVideos, true);
    window.addEventListener('resize', function () { syncViewport(); syncBand(); });
    window.addEventListener('orientationchange', syncViewport);
    window.addEventListener('pageshow', syncViewport);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { syncViewport(); syncBand(); });
    syncSetButtons();
    const problems = selfCheck();
    if (problems.length) showCrash(problems.join('\n'));
    bootGate();
    if (window.ResizeObserver && $('box')) new ResizeObserver(syncBand).observe($('box'));
    syncBand();
    document.body.dataset.ready = '1';
  }

  window.__BEACH = {
    get screen() { return document.body.dataset.screen; },
    get state() { return state; },
    get meta() { return meta; },
    advance: advance,
    choose: function (i) { takeChoice(choiceMenu, i); },
    winner: function () { return state ? winner() : ''; },
    problems: selfCheck,
    SHIP: SHIP
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
