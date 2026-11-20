/* Lanternveil engine. Saves: kylearcade_elves_* . Mute shares kylearcade_muted. */
(function () {
  'use strict';
  const D = window.LVDATA;
  const META_KEY = 'kylearcade_elves_meta';
  const SET_KEY = 'kylearcade_elves_settings';
  const AUTO_KEY = 'kylearcade_elves_auto';
  const MUTE_KEY = 'kylearcade_muted';
  const SPEEDS = [0, 10, 24, 46];
  const IDS = ['aelith', 'nyssa', 'lirael'];
  const PLACES = { gardens: 'aelith', tower: 'nyssa', falls: 'lirael' };

  const SHIP = Object.create(null);
  (D.SHIP_LIST || []).forEach(function (f) { SHIP[f] = 1; });

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
  let lineWasKnown = false;
  let loggedLine = '';
  let choiceOpen = false;
  let typeTimer = 0;
  let autoTimer = 0;
  let readTimer = 0;
  let toastTimer = 0;
  let depth = 0;
  let mini = null;
  let videoOnDone = null;
  let audioCtx = null;
  let returnTo = 'title';
  let wipeMode = '';

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
      unlocked: { aelith: ['default'], nyssa: ['default'], lirael: ['default'] },
      worn: { aelith: 'default', nyssa: 'default', lirael: 'default' },
      pose: { aelith: '', nyssa: '', lirael: '' }
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

  function spriteChain(key) {
    if (!key) return [];
    const parts = String(key).split('.');
    const id = parts[0];
    const out = [];
    function push(k) { if (k && out.indexOf(k) < 0) out.push(k); }
    push(key);
    if (parts.length >= 3) push(parts.slice(0, -1).join('.'));
    if (parts.length >= 3) push(id + '.default.' + parts[parts.length - 1]);
    push(id + '.default');
    return out;
  }
  function resolveSprite(key) {
    const chain = spriteChain(key);
    for (let i = 0; i < chain.length; i++) {
      const file = D.SPRITE_FILES[chain[i]];
      if (file && SHIP[file]) return { key: chain[i], src: file };
    }
    return { key: key || '', src: null };
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

  function cleanName(s) {
    let t = String(s || '').replace(/[<>&]/g, '').replace(/\s+/g, ' ').trim();
    if (!t) t = 'Cael';
    if (t.length > 18) t = t.slice(0, 18).trim();
    return t || 'Cael';
  }
  function fmt(s) {
    return String(s == null ? '' : s)
      .replace(/\{name\}/g, state && state.name ? state.name : 'Cael')
      .replace(/\{coins\}/g, state ? String(state.tokens || 0) : '0');
  }
  function weekName(day) {
    if (day <= 7) return 'First week';
    if (day <= 14) return 'Second week';
    if (day <= 20) return 'Final week';
    return 'The last night';
  }
  function toast(msg) {
    const el = $('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1700);
  }
  function blip() {
    if (muted) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') { const r = audioCtx.resume(); if (r && r.catch) r.catch(function () {}); }
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.frequency.value = 540;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      const t = audioCtx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.stop(t + 0.08);
    } catch (e) {}
  }

  function hasOutfit(who, id) {
    const bag = state && state.unlocked && state.unlocked[who];
    return id === 'default' || (bag && bag.indexOf(id) >= 0);
  }
  function wornKey(who, pose) {
    let outfit = (state && state.worn && state.worn[who]) || 'default';
    if (!hasOutfit(who, outfit)) outfit = 'default';
    const p = pose != null ? pose : ((state && state.pose && state.pose[who]) || '');
    return p ? (who + '.' + outfit + '.' + p) : (who + '.' + outfit);
  }
  function lineSprite(step) {
    if (!step) return null;
    if (step.sprite) return step.sprite;
    if (!D.CAST[step.who]) return null;
    if (Object.prototype.hasOwnProperty.call(step, 'pose')) return wornKey(step.who, step.pose);
    return wornKey(step.who, null);
  }

  function addAff(who, n, quiet) {
    if (!who || !n || !D.CAST[who] || !state) return;
    state.aff[who] = Math.max(0, Math.min(100, (state.aff[who] || 0) + n));
    if (!quiet) toast(D.CAST[who].name + ' ' + (n > 0 ? '+' : '') + n);
    if (state.aff[who] >= 100 && !state.certain[who]) {
      state.certain[who] = 1;
      toast(D.CAST[who].name + ' is certain of you.');
    }
    renderMeters();
  }
  function renderMeters() {
    if (!state) return;
    document.querySelectorAll('[data-meter]').forEach(function (el) {
      const id = el.getAttribute('data-meter');
      const v = state.aff[id] || 0;
      const bar = el.querySelector('i');
      const lab = el.querySelector('b');
      if (bar) bar.style.width = v + '%';
      if (lab) lab.textContent = String(v);
    });
    const coins = $('mapCoins');
    if (coins) coins.textContent = 'Lantern coins  ' + (state.tokens || 0);
    const hud = $('hudDay');
    if (hud) hud.textContent = 'Day ' + state.day + '  ·  ' + weekName(state.day);
    const you = $('hudYou');
    if (you) you.textContent = (state.name || 'Cael') + '  ·  27';
  }

  function setBg(name) {
    const bg = $('bg');
    if (bg) bg.className = 'bg ' + (name || 'gate');
  }
  function setSprite(step) {
    const fig = $('figure');
    const key = lineSprite(step);
    if (!fig) return;
    document.body.classList.toggle('aelith-night', !!(key && key.indexOf('aelith.night') === 0));
    if (!key) {
      fig.classList.add('quiet');
      fig.classList.remove('cg');
      return;
    }
    fig.classList.remove('quiet');
    const who = key.split('.')[0];
    fig.dataset.who = D.CAST[who] ? who : '';
    var sub = SUBJECT[who];
    if (sub) {
      fig.dataset.head = sub.h;
      fig.dataset.thigh = sub.t;
      fig.dataset.iw = sub.w;
      fig.dataset.ih = sub.ih;
      layoutFigure();
    }
    fig.classList.toggle('cg', !!(step && step.cg));
    const resolved = resolveSprite(key);
    const img = $('sprite');
    const crest = $('crest');
    if (resolved.src) {
      if (img.dataset.src !== resolved.src) {
        img.dataset.src = resolved.src;
        img.alt = D.CAST[who] ? D.CAST[who].name : '';
        img.src = resolved.src;
      }
      img.hidden = false;
      crest.hidden = true;
    } else {
      img.hidden = true;
      if (img.getAttribute('src')) img.removeAttribute('src');
      img.dataset.src = '';
      crest.hidden = false;
      const c = D.CAST[who];
      $('crestMark').textContent = c ? c.name.slice(0, 1) : '';
      $('crestName').textContent = c ? c.name : '';
      $('crestRole').textContent = c ? c.role : '';
    }
    document.body.classList.toggle('fade-out', !!(step && step.fade));
  }
  function setSpeaker(who) {
    const plate = $('nameplate');
    const el = $('speaker');
    const role = $('role');
    if (!who || who === 'narr' || !D.CAST[who] && who !== 'you') {
      plate.hidden = true;
      el.textContent = '';
      role.textContent = '';
      return;
    }
    plate.hidden = false;
    if (who === 'you') {
      el.textContent = state.name || 'Cael';
      el.style.color = '';
      role.textContent = 'AGE 27';
      return;
    }
    el.textContent = D.CAST[who].name;
    el.style.color = D.CAST[who].color;
    role.textContent = 'APPEARS ' + D.CAST[who].age;
  }

  function showBase(name) {
    ['title', 'name', 'map', 'scene', 'ending', 'wardrobe', 'gallery', 'viewer'].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = id !== name;
    });
    if (state) state.screen = name;
    document.body.dataset.screen = name;
    document.body.classList.remove('fade-out');
    document.body.classList.remove('choosing');
    syncViewport();
    syncBand();
  }
  function syncBand() {
    var scene = $('scene');
    var box = $('box');
    var on = scene && !scene.hidden && document.body.dataset.screen === 'scene' && box;
    var h = on ? box.offsetHeight : 0;
    document.documentElement.style.setProperty('--band', (h || 0) + 'px');
    if (window.requestAnimationFrame) requestAnimationFrame(layoutFigure);
  }
  var SUBJECT = {
    aelith: { h: 0.02, t: 0.64, w: 720, ih: 960 },
    nyssa: { h: 0.04, t: 0.66, w: 720, ih: 960 },
    lirael: { h: 0.02, t: 0.62, w: 720, ih: 960 }
  };
  function layoutFigure() {
    var fig = $('figure');
    if (!fig || !fig.dataset.head) return;
    var head = parseFloat(fig.dataset.head);
    var iw = parseFloat(fig.dataset.iw || '720');
    var ih = parseFloat(fig.dataset.ih || '960');
    var r = fig.getBoundingClientRect();
    var bw = r.width, bh = r.height;
    if (bh < 40) return;
    var s0 = Math.max(bw / iw, bh / ih);
    var rh = ih * s0;
    var p = 0;
    if (rh > bh + 1) {
      var den = bh - rh;
      function pFor(frac) { return (frac * bh - head * rh) / den; }
      var pMax = pFor(0.03);
      p = Math.min(pFor(0.05), pMax);
      if (p < 0 || p > 1 || den * p + head * rh < 0.03 * bh) p = 0;
    }
    fig.style.setProperty('--fy', (p * 100).toFixed(2) + '%');
  }
  function overlayName() { return document.body.dataset.overlay || ''; }
  function showOverlay(name) {
    ['video', 'mini', 'menu', 'log', 'saves', 'settings'].forEach(function (id) {
      const el = $(id);
      if (el) el.hidden = id !== name;
    });
    document.body.dataset.overlay = name || '';
  }
  function clearOverlay() {
    showOverlay('');
    ['video', 'mini', 'menu', 'log', 'saves', 'settings'].forEach(function (id) {
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
    clearTimeout(readTimer);
    readTimer = setTimeout(saveMeta, 400);
  }
  function autoDelay() {
    const base = settings.speed === 0 ? 380 : settings.speed === 1 ? 700 : settings.speed === 3 ? 1600 : 1100;
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
        if (page && !lineFits(page)) {
          let hard = '';
          for (let c = 0; c < page.length; c++) {
            if (lineFits(hard + page.charAt(c))) hard += page.charAt(c);
            else {
              if (hard) out.push(hard);
              hard = page.charAt(c);
            }
          }
          page = hard;
        }
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
    if (last && state && fullText && loggedLine !== currentId + fullText) {
      loggedLine = currentId + fullText;
      state.log = state.log || [];
      state.log.push({ who: currentId, text: fullText });
      if (state.log.length > 80) state.log.shift();
    }
    $('btnAdvance').hidden = choiceOpen;
    if (choiceOpen) return;
    clearTimeout(autoTimer);
    if (!fromClick && settings.auto) autoTimer = setTimeout(function () { advance(false); }, autoDelay());
  }
  function typePage() {
    const page = pages[pageIndex] || '';
    textDone = false;
    clearType();
    const el = $('line');
    $('btnAdvance').hidden = false;
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
      if (i < page.length) typeTimer = setTimeout(step, SPEEDS[settings.speed] || 24);
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
    setSpeaker(step.who);
    setSprite(step);
    typeText(step.text || '', step.id || '');
    if (state && state.play) state.play.step = stepIndex;
  }
  let choiceGate = 0;
  let choiceGateKey = '';
  let choiceMenu = 0;
  function eventEl(t) {
    if (!t) return null;
    if (t.nodeType === 3) return t.parentElement;
    return t;
  }
  function takeChoice(menu, i, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const now = Date.now();
    const key = menu + ':' + i;
    if (choiceGateKey === key && now - choiceGate < 500) return;
    choiceGateKey = key;
    choiceGate = now;
    try { pickChoice(i); }
    catch (err) { showCrash(err && (err.stack || err.message) || err); }
  }
  function showChoice(step) {
    clearType();
    textDone = true;
    choiceOpen = true;
    document.body.classList.add('choosing');
    $('btnAdvance').hidden = true;
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
  }

  function present() {
    if (depth > 48) { showCrash('Scene ran too long.'); return; }
    depth += 1;
    try { presentBody(); }
    finally { depth -= 1; }
  }
  function presentBody() {
    if (!stepList) return;
    if (stepIndex >= stepList.length) { finishScene(); return; }
    const step = stepList[stepIndex];
    if (state && state.play) {
      state.play.step = stepIndex;
      state.play.steps = stepList;
    }
    if (!step || !step.op) { stepIndex += 1; present(); return; }
    if (step.op === 'say') { showSay(step); return; }
    if (step.op === 'choice') { showChoice(step); return; }
    if (step.op === 'aff') { addAff(step.who, step.n, true); stepIndex += 1; present(); return; }
    if (step.op === 'unlock') {
      if (step.outfit) unlockOutfit(step.who, step.outfit);
      if (step.gallery) unlockGallery(step.gallery);
      stepIndex += 1;
      present();
      return;
    }
    if (step.op === 'flag') {
      if (step.flag) state.seen[step.flag] = true;
      stepIndex += 1;
      present();
      return;
    }
    if (step.op === 'mini') { startMini(step); return; }
    if (step.op === 'video') { playVideoStep(step); return; }
    stepIndex += 1;
    present();
  }

  let lastAdvance = 0;
  function advance(fromUser) {
    if (fromUser) {
      const now = Date.now();
      if (now - lastAdvance < 250) return;
      lastAdvance = now;
    }
    if (overlayName() === 'video' || overlayName() === 'mini') return;
    if (overlayName()) return;
    if (!state || state.screen !== 'scene') return;
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
    if (opt.need && (state.tokens || 0) < opt.need) { toast('Not enough lantern coins.'); return; }
    if (opt.need) state.tokens -= opt.need;
    const who = opt.who || step.who || (state && state.sceneWho);
    if (opt.aff) addAff(who, opt.aff, false);
    if (opt.flag && state) state.seen[opt.flag] = true;
    if (opt.gift) state.gifted[opt.gift] = (state.gifted[opt.gift] || 0) + 1;
    choiceOpen = false;
    $('choices').innerHTML = '';
    blip();
    if (opt.ending) {
      state.bonusPlayed = 0;
      state.checkoutPlayed = 0;
      runScene(D.ENDINGS[opt.ending], 'ending:' + opt.ending);
      return;
    }
    if (opt.reply) {
      stepList.splice(stepIndex + 1, 0, {
        op: 'say',
        id: step.id + '_r' + i,
        who: who || 'narr',
        sprite: opt.sprite || '',
        text: opt.reply
      });
    }
    stepIndex += 1;
    if (state && state.play) state.play.steps = stepList;
    present();
  }

  function unlockOutfit(who, id) {
    if (!who || !id || !state) return;
    state.unlocked[who] = state.unlocked[who] || ['default'];
    const fresh = state.unlocked[who].indexOf(id) < 0;
    if (fresh) state.unlocked[who].push(id);
    meta.unlocked[who] = state.unlocked[who].slice();
    state.worn[who] = id;
    meta.worn[who] = id;
    saveMeta();
    if (fresh) {
      const list = D.OUTFITS[who] || [];
      let name = id;
      for (let i = 0; i < list.length; i++) if (list[i].id === id) name = list[i].name;
      toast(name + ' unlocked');
    }
  }
  function unlockGallery(id) {
    if (!id) return;
    state.gallery = state.gallery || {};
    const first = !state.gallery[id] && !meta.gallery[id];
    state.gallery[id] = 1;
    meta.gallery[id] = 1;
    saveMeta();
    if (first && D.GALLERY[id]) toast('Memory  ·  ' + D.GALLERY[id].title);
  }

  function runScene(scene, after) {
    if (!scene) return;
    if (scene.flag) state.seen[scene.flag] = true;
    const steps = JSON.parse(JSON.stringify(scene.steps || []));
    stepList = steps;
    stepIndex = 0;
    choiceOpen = false;
    state.sceneWho = scene.who || null;
    state.play = {
      sceneId: scene.id,
      step: 0,
      steps: steps,
      after: after || 'none',
      who: scene.who || null,
      bg: scene.bg || 'festival'
    };
    state.ending = null;
    showBase('scene');
    clearOverlay();
    setBg(scene.bg || 'festival');
    renderMeters();
    present();
    autosave();
  }
  function finishScene() {
    const after = state && state.play ? state.play.after : 'none';
    if (state) state.play = null;
    choiceOpen = false;
    clearType();
    if (after === 'map') beginDay();
    else if (after === 'endday') endDay();
    else if (after && after.indexOf('visit:') === 0) afterVisit(after.slice(6));
    else if (after && after.indexOf('ending:') === 0) {
      const id = after.slice(7);
      if (id !== 'neutral' && D.CAST[id]) {
        if (!state.bonusPlayed && (state.aff[id] || 0) >= 48) {
          state.bonusPlayed = 1;
          runScene(bonusScene(id), 'ending:' + id);
          return;
        }
        if (!state.checkoutPlayed) {
          state.checkoutPlayed = 1;
          runScene(farewellScene(id), 'ending:' + id);
          return;
        }
      }
      showEndingCard(id, false);
    }
  }
  function pendingEvent(who) {
    for (let i = 0; i < D.EVENTS.length; i++) {
      const e = D.EVENTS[i];
      if (e.who !== who) continue;
      if (state.seen[e.id]) continue;
      if (state.day < e.minDay) continue;
      if ((state.aff[who] || 0) < e.minAff) continue;
      let ok = true;
      for (let n = 0; n < (e.need || []).length; n++) if (!state.seen[e.need[n]]) ok = false;
      if (ok) return e;
    }
    return null;
  }
  function nextDaily(who) {
    const list = D.DAILIES[who];
    const n = state.dailyN[who] || 0;
    state.dailyN[who] = n + 1;
    return list[n % list.length];
  }
  let blockPlacesUntil = 0;
  function pickPlace(place) {
    if (Date.now() < blockPlacesUntil) return;
    if (!state || state.screen !== 'map') return;
    const who = PLACES[place];
    if (!who) return;
    const ev = pendingEvent(who);
    if (ev) runScene(ev, 'visit:' + who);
    else runScene(nextDaily(who), 'visit:' + who);
  }
  function afterVisit(who) {
    state.visits[who] = (state.visits[who] || 0) + 1;
    addAff(who, 1, true);
    if ([4, 8, 12, 16].indexOf(state.day) >= 0) runScene(marketScene(), 'endday');
    else endDay();
  }
  function endDay() {
    state.tokens = Math.min(12, (state.tokens || 0) + 1);
    state.day += 1;
    beginDay();
  }
  function qualified() {
    return IDS.filter(function (id) { return state.seen[id + '_vow']; });
  }
  function beginDay() {
    if (state.day >= 21) {
      const q = qualified();
      if (!q.length) runScene(buildNeutral(), 'ending:neutral');
      else runScene(buildPick(q), 'none');
      return;
    }
    showMap();
    autosave();
  }
  function showMap() {
    if (!state) return;
    state.play = null;
    showBase('map');
    clearOverlay();
    const k = $('mapKicker');
    if (k) k.textContent = 'Day ' + state.day + ' of 21  ·  ' + weekName(state.day);
    const sub = $('mapSub');
    if (sub) sub.textContent = state.name + '  ·  age 27  ·  where will you spend the light?';
    IDS.forEach(function (id) {
      const badge = document.querySelector('[data-wait="' + id + '"]');
      const ev = pendingEvent(id);
      if (badge) badge.hidden = !ev || /_meet$/.test(ev.id);
    });
    renderMeters();
  }

  function marketScene() {
    const options = [];
    IDS.forEach(function (id) {
      if (!state.seen[id + '_meet']) return;
      const c = D.CAST[id];
      const again = state.gifted[id];
      options.push({
        text: (again ? 'Another ' : '') + c.gift + ' for ' + c.name + ' (2 coins)',
        need: 2,
        gift: id,
        who: id,
        aff: again ? 3 : 8,
        reply: again ? c.giftAgain : c.giftLine
      });
    });
    options.push({ text: 'Keep your coins.', aff: 0 });
    const met = options.length > 1;
    return {
      id: 'market_' + state.day,
      bg: 'festival',
      steps: [
        {
          op: 'say',
          id: 'market_open_' + state.day,
          who: 'narr',
          text: met
            ? 'The lantern market is strung between the trees. You have {coins} coins, and a few people who might like a gift.'
            : 'The lantern market glows, but you have not met anyone to spoil yet. You have {coins} coins.'
        },
        { op: 'choice', id: 'market_c_' + state.day, options: options }
      ]
    };
  }
  function buildPick(q) {
    return {
      id: 'close_pick',
      bg: 'festival',
      steps: [
        {
          op: 'say', id: 'close1', who: 'narr',
          text: 'The festival ends at dawn. The gate is already forgetting the road. More than one heart is open. If you are going to choose, choose now.'
        },
        {
          op: 'choice', id: 'close_c',
          options: q.map(function (id) {
            return { text: 'Spend the last night with ' + D.CAST[id].name + '.', ending: id };
          })
        }
      ]
    };
  }
  function buildNeutral() {
    const steps = [{ op: 'say', id: 'neu_open', who: 'narr', text: D.NEUTRAL.open }];
    IDS.forEach(function (id) {
      if (state.seen[id + '_meet']) {
        steps.push({ op: 'say', id: 'neu_' + id, who: id, sprite: id + '.default', text: D.NEUTRAL[id] });
      }
    });
    steps.push({ op: 'say', id: 'neu_close', who: 'narr', text: D.NEUTRAL.close, fade: true, cg: true });
    steps.push({ op: 'unlock', id: 'neu_gal', gallery: 'end_neutral' });
    return { id: 'neutral', bg: 'gate', steps: steps };
  }

  function bonusScene(id) {
    const name = D.CAST[id] ? D.CAST[id].name : 'She';
    const bg = id === 'nyssa' ? 'tower' : id === 'lirael' ? 'camp' : 'gardens';
    return {
      id: 'bonus_' + id,
      who: id,
      bg: bg,
      steps: [
        { op: 'say', id: 'bn1', who: 'narr', text: name + ' keeps you past the last polite lantern. What she is wearing is not a costume anymore. It is what she chose, for you.' },
        { op: 'say', id: 'bn2', who: id, sprite: id + '.night.pose2', text: 'This is the part the festival does not get to watch. Stay for it.' },
        { op: 'video', id: 'bn3', who: id, video: id + '.night.b', sprite: id + '.night.clipb', fallback: name + ' laughs, close, and does not look away.' },
        { op: 'unlock', id: 'bn4', who: id, gallery: id + '_night_b' }
      ]
    };
  }
  function farewellScene(id) {
    const name = D.CAST[id] ? D.CAST[id].name : 'She';
    const bg = id === 'nyssa' ? 'tower' : id === 'lirael' ? 'falls' : 'gardens';
    const line = {
      aelith: 'The road can have you for a while. It cannot have the last thing I give you. Look back.',
      nyssa: 'Go, if you must. I will be on the balcony. This is the kiss I am not going to joke about.',
      lirael: 'The forest will keep your footprints. I am keeping the rest. Watch me do this properly.'
    }[id];
    return {
      id: 'farewell_' + id,
      who: id,
      bg: bg,
      steps: [
        { op: 'say', id: 'fw1', who: 'narr', text: 'The last lanterns thin out. ' + name + ' walks you as far as the gate and does not pretend it is only polite.' },
        { op: 'say', id: 'fw2', who: id, sprite: id + '.night.pose4', text: line || 'Come back when the lanterns are lit. I will be looking.' },
        { op: 'video', id: 'fw3', who: id, video: id + '.night.c', sprite: id + '.night.clipc', fallback: 'She blows you a kiss, and the road takes everything except that.' },
        { op: 'unlock', id: 'fw4', who: id, gallery: id + '_night_c' }
      ]
    };
  }
  function showEndingCard(id, replay) {
    state.ending = id;
    state.play = null;
    if (!replay && !state.endingCredited) {
      state.endingCredited = true;
      meta.endings[id] = (meta.endings[id] || 0) + 1;
      meta.routes = meta.routes || {};
      if (id !== 'neutral') {
        meta.routes[id] = 1;
        unlockGallery('end_' + id);
        D.GALLERY_ORDER.forEach(function (gid) {
          if (gid.indexOf(id + '_night') === 0 || gid === id + '_close_night') unlockGallery(gid);
        });
      } else unlockGallery('end_neutral');
      saveMeta();
    }
    const card = D.CARDS[id] || D.CARDS.neutral;
    $('endingKicker').textContent = card.kicker;
    $('endingTitle').textContent = card.title;
    $('endingBody').textContent = card.text;
    document.body.classList.remove('fade-out');
    showBase('ending');
    clearOverlay();
    setBg('gate');
    autosave();
  }

  function blankState(name) {
    return {
      v: 1,
      name: name,
      day: 1,
      aff: { aelith: 0, nyssa: 0, lirael: 0 },
      visits: {},
      seen: {},
      tokens: 3,
      worn: { aelith: 'default', nyssa: 'default', lirael: 'default' },
      pose: { aelith: '', nyssa: '', lirael: '' },
      unlocked: { aelith: ['default'], nyssa: ['default'], lirael: ['default'] },
      gifted: {},
      gallery: {},
      log: [],
      dailyN: {},
      certain: {},
      screen: 'scene',
      ending: null,
      endingCredited: false,
      sceneWho: null,
      play: null
    };
  }
  function newGame(name) {
    state = blankState(cleanName(name));
    IDS.forEach(function (id) {
      const u = (meta.unlocked && meta.unlocked[id]) ? meta.unlocked[id].slice() : ['default'];
      if (u.indexOf('default') < 0) u.unshift('default');
      state.unlocked[id] = u;
      const want = meta.worn && meta.worn[id];
      state.worn[id] = want && u.indexOf(want) >= 0 ? want : 'default';
      state.pose[id] = (meta.pose && meta.pose[id]) || '';
    });
    state.gallery = Object.assign({}, meta.gallery || {});
    runScene(D.INTRO, 'map');
  }

  function capture() {
    if (!state) return null;
    return {
      v: 1,
      name: state.name,
      day: state.day,
      aff: Object.assign({}, state.aff),
      visits: Object.assign({}, state.visits),
      seen: Object.assign({}, state.seen),
      tokens: state.tokens,
      worn: Object.assign({}, state.worn),
      pose: Object.assign({}, state.pose),
      unlocked: JSON.parse(JSON.stringify(state.unlocked)),
      gifted: Object.assign({}, state.gifted),
      gallery: Object.assign({}, state.gallery || {}),
      log: (state.log || []).slice(-60),
      dailyN: Object.assign({}, state.dailyN || {}),
      certain: Object.assign({}, state.certain || {}),
      screen: state.screen,
      ending: state.ending || null,
      endingCredited: !!state.endingCredited,
      sceneWho: state.sceneWho || null,
      play: state.play ? {
        sceneId: state.play.sceneId,
        step: state.play.step,
        steps: state.play.steps,
        after: state.play.after,
        who: state.play.who || null,
        bg: state.play.bg || 'festival'
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
    const s = blankState(snap.name || 'Cael');
    Object.keys(s).forEach(function (k) { if (snap[k] !== undefined) s[k] = snap[k]; });
    s.aff = Object.assign({ aelith: 0, nyssa: 0, lirael: 0 }, snap.aff || {});
    s.unlocked = snap.unlocked || s.unlocked;
    s.worn = Object.assign(s.worn, snap.worn || {});
    s.pose = Object.assign(s.pose, snap.pose || {});
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
      showBase('scene');
      setBg(state.play.bg || 'festival');
      renderMeters();
      present();
      return;
    }
    if (state.ending) { showEndingCard(state.ending, true); return; }
    if ((state.day || 1) >= 21) { beginDay(); return; }
    showMap();
  }
  function slotKey(n) { return 'kylearcade_elves_slot_' + n; }
  function saveSlot(n) {
    const snap = capture();
    if (!snap) return;
    snap.label = 'Day ' + snap.day + '  ·  ' + IDS.map(function (id) { return D.CAST[id].name[0] + (snap.aff[id] || 0); }).join(' ');
    saveJSON(slotKey(n), snap);
    toast('Saved lantern ' + n);
    renderSaves();
  }
  function loadSlot(n) {
    const key = n === 0 ? AUTO_KEY : slotKey(n);
    const snap = loadJSON(key);
    if (!snap) { toast('That lantern is empty.'); return; }
    clearOverlay();
    restore(snap);
    toast(n === 0 ? 'Continued' : 'Loaded lantern ' + n);
  }

  function cleanupMini() {
    if (!mini) return;
    if (mini.raf) cancelAnimationFrame(mini.raf);
    (mini.timers || []).forEach(function (t) { clearTimeout(t); });
    mini = null;
  }
  function endMini(step, score) {
    if (!mini) return;
    if (step && mini.step !== step) return;
    cleanupMini();
    const live = $('mini');
    if (live) live.hidden = true;
    if (overlayName() === 'mini') document.body.dataset.overlay = '';
    const aff = miniAff(step.game, score);
    addAff(step.who, aff, false);
    stepList.splice(stepIndex + 1, 0, {
      op: 'say',
      id: step.id + '_res',
      who: step.who,
      sprite: step.sprite,
      text: miniLine(step.game, score)
    });
    stepIndex += 1;
    if (state && state.play) state.play.steps = stepList;
    present();
  }
  function miniAff(game, score) {
    if (game === 'archery') return 2 + Math.max(0, Math.min(6, score));
    if (game === 'stars') return 2 + Math.max(0, Math.min(2, score)) * 3;
    if (game === 'dance') return 2 + Math.max(0, Math.min(4, score)) * 2;
    return 2;
  }
  function miniLine(game, score) {
    if (game === 'archery') {
      if (score >= 5) return 'You hit where I look. That is unfair, and I like it.';
      if (score >= 2) return 'The target survived. My pride did not. Stand closer tomorrow.';
      return 'We will call that a lesson. Mine, for betting on your first arrow. Again tomorrow.';
    }
    if (game === 'stars') {
      if (score >= 2) return 'You mapped my sky. Do not get proud. Get closer.';
      if (score >= 1) return 'One constellation. I will pretend that was romance and not luck.';
      return 'The stars are offended. I am only amused. We can try again another night.';
    }
    if (score >= 3) return 'Now you look like someone I would keep past the first song.';
    if (score >= 1) return 'You missed a step and found my hand anyway. That is the better trick.';
    return 'We will tell the court it was avant-garde. Come here.';
  }
  function startMini(step) {
    cleanupMini();
    choiceOpen = false;
    textDone = true;
    $('choices').innerHTML = '';
    $('btnAdvance').hidden = true;
    showOverlay('mini');
    mini = { step: step, raf: 0, timers: [], good: step.game === 'archery' ? 6 : step.game === 'stars' ? 2 : 4 };
    if (step.game === 'archery') setupArchery(step);
    else if (step.game === 'stars') setupStars(step);
    else setupDance(step);
  }
  function setupArchery(step) {
    $('miniTitle').textContent = 'Archery with Lirael';
    $('miniHelp').textContent = 'Loose when the spark sits in the gold. Three arrows.';
    $('miniAct').hidden = false;
    $('miniAct').textContent = 'Loose';
    const stage = $('miniStage');
    stage.innerHTML = '<div class="track"><i id="gold"></i><b id="pip"></b></div><p id="miniScore"></p>';
    let pos = 0;
    let dir = 1;
    let shots = 0;
    let score = 0;
    const pip = $('pip');
    function frame() {
      if (!mini) return;
      pos += dir * 0.018;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      pip.style.left = (pos * 100) + '%';
      mini.pos = pos;
      mini.raf = requestAnimationFrame(frame);
    }
    mini.raf = requestAnimationFrame(frame);
    $('miniAct').onclick = function () {
      if (!mini) return;
      const d = Math.abs((mini.pos || 0) - 0.5);
      if (d < 0.07) score += 2;
      else if (d < 0.16) score += 1;
      shots += 1;
      $('miniScore').textContent = 'Arrow ' + shots + ' of 3';
      if (shots >= 3) endMini(step, score);
    };
  }
  function setupStars(step) {
    $('miniTitle').textContent = 'Stargazing with Nyssa';
    $('miniHelp').textContent = 'Watch the order, then touch the stars the same way.';
    $('miniAct').hidden = true;
    const stage = $('miniStage');
    stage.innerHTML = '';
    const names = ['North', 'Ember', 'Veil', 'Quiet'];
    const buttons = names.map(function (name, idx) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'star';
      b.textContent = name;
      b.dataset.i = String(idx);
      stage.appendChild(b);
      return b;
    });
    let round = 0;
    let score = 0;
    function playRound() {
      if (!mini) return;
      const len = round === 0 ? 3 : 4;
      const seq = [];
      for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 4));
      let listen = true;
      let at = 0;
      $('miniHelp').textContent = 'Watch.';
      function flash(i) {
        if (!mini) return;
        if (i >= seq.length) {
          listen = false;
          at = 0;
          $('miniHelp').textContent = 'Your turn.';
          return;
        }
        buttons.forEach(function (b) { b.classList.remove('on'); });
        buttons[seq[i]].classList.add('on');
        const t = setTimeout(function () {
          buttons[seq[i]].classList.remove('on');
          const t2 = setTimeout(function () { flash(i + 1); }, 180);
          mini.timers.push(t2);
        }, 420);
        mini.timers.push(t);
      }
      buttons.forEach(function (b) {
        b.onclick = function () {
          if (!mini || listen) return;
          const got = +b.dataset.i;
          b.classList.add('on');
          setTimeout(function () { b.classList.remove('on'); }, 160);
          if (got !== seq[at]) {
            round += 1;
            if (round >= 2) endMini(step, score);
            else playRound();
            return;
          }
          at += 1;
          if (at >= seq.length) {
            score += 1;
            round += 1;
            if (round >= 2) endMini(step, score);
            else playRound();
          }
        };
      });
      flash(0);
    }
    playRound();
  }
  function setupDance(step) {
    $('miniTitle').textContent = 'A step with Aelith';
    $('miniHelp').textContent = 'Tap when the ring meets the gold circle. Four beats.';
    $('miniAct').hidden = false;
    $('miniAct').textContent = 'Step';
    const stage = $('miniStage');
    stage.innerHTML = '<div class="dance"><i id="ring"></i><b id="target"></b></div><p id="miniScore"></p>';
    let beat = 0;
    let score = 0;
    let t0 = 0;
    let running = false;
    const ring = $('ring');
    function frame(now) {
      if (!mini || !running) return;
      const p = Math.min(1, (now - t0) / 1000);
      const scale = 1.5 - p * 0.9;
      ring.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
      mini.scale = scale;
      if (p < 1) mini.raf = requestAnimationFrame(frame);
      else {
        running = false;
        beat += 1;
        if (beat >= 4) endMini(step, score);
        else arm();
      }
    }
    function arm() {
      const t = setTimeout(function () {
        if (!mini) return;
        t0 = performance.now();
        running = true;
        mini.raf = requestAnimationFrame(frame);
      }, 420);
      mini.timers.push(t);
    }
    $('miniAct').onclick = function () {
      if (!mini || !running) return;
      const s = mini.scale || 0;
      if (s > 0.92 && s < 1.12) score += 1;
      $('miniScore').textContent = 'Beat ' + (beat + 1) + ' of 4';
    };
    arm();
  }

  function clearVidEl() {
    const v = $('vid');
    if (!v) return;
    v.onended = null;
    v.onerror = null;
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src');
    const poster = $('vidPoster');
    if (poster) {
      poster.hidden = true;
      if (poster.getAttribute('src')) poster.removeAttribute('src');
    }
  }
  function finishVideo() {
    const cb = videoOnDone;
    videoOnDone = null;
    markReplay(false);
    clearVidEl();
    const ov = $('video');
    if (ov) ov.hidden = true;
    if (overlayName() === 'video') document.body.dataset.overlay = '';
    if (cb) cb();
  }
  let videoEnded = false;
  let replayStamp = 0;
  function markReplay(show) {
    videoEnded = !!show;
    const b = $('btnVidReplay');
    if (b) b.hidden = !show;
  }
  function replayVid() {
    const v = $('vid');
    if (!v || !v.getAttribute('src')) return;
    replayStamp = Date.now();
    markReplay(false);
    try { v.currentTime = 0; } catch (e) {}
    v.playsInline = true;
    const p = v.play();
    if (p && p.catch) p.catch(function () { markReplay(true); });
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
    v.setAttribute('autoplay', '');
    v.autoplay = true;
    v.preload = 'auto';
    v.controls = false;
    v.loop = false;
    v.disablePictureInPicture = true;
    const pos = (vmeta && vmeta.pos) || 'center 22%';
    v.style.objectPosition = pos;
    const posterEl = $('vidPoster');
    if (posterEl) posterEl.style.objectPosition = pos;
    const poster = posterOf(vmeta);
    const bust = function (src) { return src ? src + (src.indexOf('?') >= 0 ? '' : '?v=2') : ''; };
    if (poster) {
      v.poster = bust(poster);
      posterEl.hidden = false;
      posterEl.src = bust(poster);
    } else {
      v.removeAttribute('poster');
      if (posterEl) posterEl.hidden = true;
    }
    v.onplaying = function () {
      if (posterEl) posterEl.hidden = true;
    };
    $('vidTitle').textContent = vmeta.title || '';
    $('btnVidSound').textContent = 'Tap for sound';
    markReplay(false);
    showOverlay('video');
    v.onended = function () { markReplay(true); };
    v.onerror = function () { finishVideo(); };
    v.src = src + (src.indexOf('?') >= 0 ? '' : '?v=2');
    const p = v.play();
    if (p && p.catch) p.catch(function () { markReplay(true); });
  }
  function unmuteVid() {
    if (Date.now() - replayStamp < 500) return;
    const v = $('vid');
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    $('btnVidSound').textContent = 'Sound on';
    const p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function playVideoStep(step) {
    const vmeta = D.VIDEOS[step.video];
    const src = shipSrc(vmeta);
    if (!src) {
      showSay({
        op: 'say',
        id: (step.id || 'vid') + '_still',
        who: step.who || (state && state.sceneWho) || 'narr',
        sprite: step.sprite,
        text: step.fallback || 'The moment passes like light on water.',
        cg: true,
        fade: step.fade
      });
      return;
    }
    openVideo(vmeta, src, function () {
      stepIndex += 1;
      present();
    });
  }

  function renderWardrobe() {
    const root = $('wardGrid');
    root.innerHTML = '';
    const tabs = $('wardTabs');
    tabs.innerHTML = '';
    const who = renderWardrobe.who || 'aelith';
    renderWardrobe.who = who;
    IDS.forEach(function (id) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab' + (id === who ? ' on' : '');
      b.textContent = D.CAST[id].name;
      b.addEventListener('click', function () { renderWardrobe.who = id; renderWardrobe(); });
      tabs.appendChild(b);
    });
    const bag = (state && state.unlocked && state.unlocked[who]) || (meta.unlocked[who] || ['default']);
    const worn = (state && state.worn && state.worn[who]) || meta.worn[who] || 'default';
    const pose = (state && state.pose && state.pose[who]) || meta.pose[who] || '';
    (D.OUTFITS[who] || []).forEach(function (o) {
      const owned = o.id === 'default' || bag.indexOf(o.id) >= 0;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'fit' + (worn === o.id ? ' on' : '') + (owned ? '' : ' lock');
      const t = document.createElement('b');
      t.textContent = owned ? o.name : 'Sealed';
      const s = document.createElement('small');
      s.textContent = owned ? (worn === o.id ? 'Wearing this on ordinary days' : o.hint) : o.hint;
      card.appendChild(t);
      card.appendChild(s);
      card.disabled = !owned;
      card.addEventListener('click', function () {
        if (!owned) return;
        if (state && state.worn) state.worn[who] = o.id;
        meta.worn[who] = o.id;
        saveMeta();
        renderWardrobe();
        previewOutfit(who);
      });
      root.appendChild(card);
    });
    const poseRow = $('poseRow');
    poseRow.innerHTML = '';
    ['', 'pose2'].forEach(function (p) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn' + (pose === p ? ' on' : '');
      b.textContent = p ? 'Turned pose' : 'Standing pose';
      b.addEventListener('click', function () {
        if (state && state.pose) state.pose[who] = p;
        meta.pose[who] = p;
        saveMeta();
        renderWardrobe();
        previewOutfit(who);
      });
      poseRow.appendChild(b);
    });
    previewOutfit(who);
  }
  function previewOutfit(who) {
    const pose = (state && state.pose && state.pose[who]) || meta.pose[who] || '';
    const key = (state && state.worn) ? wornKey(who, pose) : (who + '.' + ((meta.worn && meta.worn[who]) || 'default') + (pose ? '.' + pose : ''));
    const resolved = resolveSprite(key);
    const img = $('wardImg');
    const crest = $('wardCrest');
    const cap = $('wardCap');
    cap.textContent = D.CAST[who].name + '  ·  appears ' + D.CAST[who].age;
    if (resolved.src) {
      img.hidden = false;
      img.alt = D.CAST[who].name;
      if (img.dataset.src !== resolved.src) { img.dataset.src = resolved.src; img.src = resolved.src; }
      crest.hidden = true;
    } else {
      img.hidden = true;
      if (img.getAttribute('src')) img.removeAttribute('src');
      img.dataset.src = '';
      crest.hidden = false;
      crest.dataset.who = who;
      crest.textContent = D.CAST[who].name.slice(0, 1);
    }
  }
  function rememberReturn() {
    const screen = state && state.screen;
    if (!screen || screen === 'wardrobe' || screen === 'gallery' || screen === 'viewer') {
      if (!returnTo) returnTo = 'title';
      return;
    }
    returnTo = screen;
  }
  function openWardrobe() {
    rememberReturn();
    renderWardrobe.who = renderWardrobe.who || 'aelith';
    renderWardrobe();
    showBase('wardrobe');
    clearOverlay();
  }
  function renderGallery() {
    const grid = $('galGrid');
    grid.innerHTML = '';
    const have = Object.assign({}, meta.gallery || {}, (state && state.gallery) || {});
    let lastSec = '';
    D.GALLERY_ORDER.forEach(function (id) {
      const g = D.GALLERY[id];
      const lingerie = id.indexOf('_night') !== -1;
      const routeOn = lingerie && g.who && meta.routes && meta.routes[g.who];
      const on = !!have[id] || !!routeOn;
      const sec = lingerie && g.who && D.CAST[g.who] ? D.CAST[g.who].name.toUpperCase() + ' · NIGHT SET' : '';
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
      sub.textContent = on ? (g.who && D.CAST[g.who] ? D.CAST[g.who].name : 'Festival') : 'Not yet';
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
  }
  function openViewer(id) {
    const g = D.GALLERY[id];
    if (!g) return;
    showBase('viewer');
    const stage = $('viewStage');
    stage.className = 'view-stage bg ' + (g.bg || 'gate');
    stage.innerHTML = '';
    const resolved = resolveSprite(g.sprite);
    if (resolved.src) {
      const img = document.createElement('img');
      img.alt = g.title;
      img.decoding = 'async';
      img.src = resolved.src;
      img.addEventListener('click', function () { stage.classList.toggle('full'); });
      stage.appendChild(img);
    } else {
      const c = document.createElement('div');
      c.className = 'crest big';
      c.dataset.who = g.who || '';
      c.textContent = g.who && D.CAST[g.who] ? D.CAST[g.who].name.slice(0, 1) : '✦';
      stage.appendChild(c);
    }
    $('viewTitle').textContent = g.title;
    $('viewCaption').textContent = g.caption || '';
    const play = $('viewPlay');
    const vmeta = g.video ? D.VIDEOS[g.video] : null;
    const src = shipSrc(vmeta);
    play.hidden = !src;
    play.onclick = function () {
      if (!src) return;
      openVideo(vmeta, src, function () { showBase('viewer'); });
    };
  }
  function closeSub() {
    const back = returnTo || 'title';
    if (back === 'scene' && state && state.play) {
      showBase('scene');
      return;
    }
    if (back === 'map' && state) { showMap(); return; }
    if (back === 'gallery') { openGallery(); return; }
    if (back === 'ending' && state && state.ending) { showEndingCard(state.ending, true); return; }
    showTitle();
  }

  function renderSaves() {
    const list = $('saveList');
    list.innerHTML = '';
    const mode = renderSaves.mode || 'save';
    $('saveHead').textContent = mode === 'save' ? 'Keep a lantern' : 'Light a lantern';
    if (mode === 'load') addSlotRow(list, 'Autosave', loadJSON(AUTO_KEY), function () { loadSlot(0); });
    for (let n = 1; n <= 6; n++) {
      const snap = loadJSON(slotKey(n));
      addSlotRow(list, 'Lantern ' + n, snap, function () {
        if (mode === 'save') saveSlot(n);
        else loadSlot(n);
      }, mode);
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
      s.textContent = (snap.label || ('Day ' + (snap.day || 1))) + (when ? '  ·  ' + when : '');
    } else s.textContent = 'Empty';
    b.appendChild(t);
    b.appendChild(s);
    b.addEventListener('click', fn);
    list.appendChild(b);
  }
  function openSaves(mode) {
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
      who.textContent = name;
      p.appendChild(who);
      p.appendChild(document.createTextNode(name ? '  ' + row.text : row.text));
      box.appendChild(p);
    });
    showOverlay('log');
    const sc = box;
    sc.scrollTop = sc.scrollHeight;
  }
  function syncSetButtons() {
    document.querySelectorAll('[data-speed]').forEach(function (b) {
      b.classList.toggle('on', settings.speed === +b.getAttribute('data-speed'));
    });
    const mute = $('btnMute');
    if (mute) mute.textContent = muted ? 'Sound off' : 'Sound on';
    const a = $('btnAuto');
    const s = $('btnSkip');
    if (a) a.classList.toggle('on', !!settings.auto);
    if (s) s.classList.toggle('on', !!settings.skip);
    if (a) a.textContent = settings.auto ? 'Auto on' : 'Auto';
    const ma = $('menuAuto');
    if (ma) {
      ma.classList.toggle('on', !!settings.auto);
      ma.textContent = settings.auto ? 'Auto on' : 'Auto';
    }
    if (s) s.textContent = settings.skip ? 'Skip on' : 'Skip';
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
  function ensureTheme() {
    if (muted) return;
    if (!theme) {
      theme = new Audio('audio/theme.mp3');
      theme.loop = true;
      theme.volume = 0.32;
    }
    const p = theme.play();
    if (p && p.catch) p.catch(function () {});
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
    clearTimeout(menuTimer);
    menuTimer = setTimeout(function () {
      if (overlayName() === 'menu') clearOverlay();
    }, 7000);
  }
  function paintTitleCast() {
    const row = $('titleCast');
    if (!row) return;
    row.innerHTML = '';
    let any = false;
    IDS.forEach(function (id) {
      const resolved = resolveSprite(id + '.default');
      if (!resolved.src) return;
      any = true;
      const img = document.createElement('img');
      img.alt = D.CAST[id].name;
      img.decoding = 'async';
      img.src = resolved.src;
      if (id === 'aelith') img.className = 'lead';
      row.appendChild(img);
    });
    row.hidden = !any;
  }
  function showTitle() {
    clearType();
    showBase('title');
    clearOverlay();
    document.body.classList.remove('fade-out');
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
    if (auto) bits.push('Autosave  ·  day ' + (auto.day || 1));
    const ends = meta.endings || {};
    const n = ['aelith', 'nyssa', 'lirael', 'neutral'].filter(function (id) { return ends[id]; }).length;
    if (n) bits.push('Endings remembered  ' + n + '/4');
    info.textContent = bits.join('   ·   ');
  }
  function submitName() {
    const input = $('nameInput');
    const value = input ? input.value : 'Cael';
    if (input && input.blur) input.blur();
    setTimeout(function () { newGame(value); syncViewport(); }, 80);
    [100, 300, 600, 900].forEach(function (ms) { setTimeout(syncViewport, ms); });
  }
  function onEsc() {
    const ov = overlayName();
    if (ov === 'video') { finishVideo(); return; }
    if (ov === 'mini' && mini) { endMini(mini.step, 0); return; }
    if (ov) { clearOverlay(); return; }
    if (state && (state.screen === 'wardrobe' || state.screen === 'gallery' || state.screen === 'viewer')) {
      closeSub();
      return;
    }
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
    const ids = Object.create(null);
    function walk(scene, label) {
      if (!scene || !scene.id) { problems.push('missing scene ' + label); return; }
      if (ids[scene.id]) problems.push('dup scene ' + scene.id);
      ids[scene.id] = 1;
      (scene.steps || []).forEach(function (st, i) {
        if (!st.op) problems.push(scene.id + ' step ' + i);
        if (st.op === 'video') {
          if (!D.VIDEOS[st.video]) problems.push('unknown video ' + st.video);
        }
        if (st.op === 'say' && !st.text) problems.push('empty line ' + (st.id || scene.id));
        if (st.op === 'choice' && (!(st.options && st.options.length))) problems.push('no choices ' + scene.id);
      });
    }
    walk(D.INTRO, 'intro');
    D.EVENTS.forEach(function (e) { walk(e, e.id); });
    IDS.forEach(function (id) { (D.DAILIES[id] || []).forEach(function (sc) { walk(sc, sc.id); }); });
    Object.keys(D.ENDINGS).forEach(function (k) { walk(D.ENDINGS[k], k); });
    Object.keys(D.VIDEOS).forEach(function (k) {
      if (!D.VIDEOS[k].src || !D.VIDEOS[k].poster) problems.push('video meta ' + k);
    });
    return problems;
  }

  let bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    $('btnNew').addEventListener('click', function () { showBase('name'); });
    $('btnNameOk').addEventListener('click', submitName);
    $('btnCont').addEventListener('click', function () { loadSlot(0); });
    $('btnGallery').addEventListener('click', openGallery);
    $('btnWardrobe').addEventListener('click', openWardrobe);
    $('btnSettings').addEventListener('click', openSettings);
    $('btnTitleFromName').addEventListener('click', showTitle);
    $('place-gardens').addEventListener('click', function () { pickPlace('gardens'); });
    $('place-tower').addEventListener('click', function () { pickPlace('tower'); });
    $('place-falls').addEventListener('click', function () { pickPlace('falls'); });
    $('mapWardrobe').addEventListener('click', openWardrobe);
    $('mapGallery').addEventListener('click', openGallery);
    $('mapSave').addEventListener('click', function () { openSaves('save'); });
    $('mapLoad').addEventListener('click', function () { openSaves('load'); });
    $('mapSettings').addEventListener('click', openSettings);
    $('mapTitle').addEventListener('click', function () { autosave(); showTitle(); });
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
      if (!state || state.screen !== 'scene') return;
      if (choiceOpen) return;
      if (e && e.type !== 'click' && e.preventDefault) e.preventDefault();
      blockPlacesUntil = Date.now() + 450;
      advance(true);
    }
    $('scene').addEventListener('pointerup', sceneTap);
    $('scene').addEventListener('click', sceneTap);
    $('scene').addEventListener('pointercancel', function () { clearTimeout(holdTimer); });
    document.addEventListener('pointerup', function () { ensureTheme(); });
    $('btnAuto').addEventListener('click', function (e) { e.stopPropagation(); toggleAuto(); });
    $('btnSkip').addEventListener('click', function (e) { e.stopPropagation(); toggleSkip(); });
    $('btnLog').addEventListener('click', function (e) { e.stopPropagation(); openLog(); });
    $('btnMenu').addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });
    if ($('btnPeek')) $('btnPeek').addEventListener('click', function (e) { e.stopPropagation(); openMenu(); });
    if ($('menuAuto')) $('menuAuto').addEventListener('click', function (e) { e.stopPropagation(); toggleAuto(); });
    let vidTap = 0;
    let vidTapKey = '';
    function onceVid(key, fn, e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (e && e.type === 'pointerup' && e.preventDefault) e.preventDefault();
      const now = Date.now();
      if (vidTapKey === key && now - vidTap < 400) return;
      vidTapKey = key;
      vidTap = now;
      fn();
    }
    $('btnVidSkip').addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      onceVid('skip', finishVideo, e);
    });
    $('btnVidSkip').addEventListener('click', function (e) { onceVid('skip', finishVideo, e); });
    $('btnVidSound').addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      onceVid('sound', unmuteVid, e);
    });
    $('btnVidSound').addEventListener('click', function (e) { onceVid('sound', unmuteVid, e); });
    $('btnVidReplay').addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      onceVid('replay', replayVid, e);
    });
    $('btnVidReplay').addEventListener('click', function (e) { onceVid('replay', replayVid, e); });
    $('vid').addEventListener('click', function (e) {
      e.stopPropagation();
      if (Date.now() - replayStamp < 500) return;
      if (videoEnded || $('vid').ended) replayVid();
      else unmuteVid();
    });
    $('viewPlay').addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.preventDefault) e.preventDefault();
      e.stopPropagation();
      if ($('viewPlay').onclick) $('viewPlay').onclick();
    });
    $('menuClose').addEventListener('click', clearOverlay);
    $('menuSave').addEventListener('click', function () { openSaves('save'); });
    $('menuLoad').addEventListener('click', function () { openSaves('load'); });
    $('menuLog').addEventListener('click', openLog);
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
    $('btnWipe').addEventListener('click', function () { wipeMode = 'saves'; $('wipeAsk').hidden = false; $('wipeAsk').textContent = 'Erase the six lanterns and the autosave? Memories stay.'; });
    $('btnWipeAll').addEventListener('click', function () { wipeMode = 'all'; $('wipeAsk').hidden = false; $('wipeAsk').textContent = 'Erase saves and memories, outfits, and the read log?'; });
    $('wipeYes').addEventListener('click', function () {
      if (wipeMode === 'all') {
        meta = defaultMeta();
        saveMeta();
        settings = { speed: settings.speed, auto: false, skip: false };
        saveSettings();
      }
      storeDel(AUTO_KEY);
      for (let n = 1; n <= 6; n++) storeDel(slotKey(n));
      $('wipeAsk').hidden = true;
      toast(wipeMode === 'all' ? 'Lanterns and memories cleared' : 'Saves cleared');
      refreshTitleBits();
    });
    $('wipeNo').addEventListener('click', function () { $('wipeAsk').hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { onEsc(); return; }
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Enter' && e.target.id === 'nameInput') { e.preventDefault(); submitName(); }
        return;
      }
      if (tag === 'BUTTON') return;
      if (e.key === 'a' || e.key === 'A') { if (!e.repeat) toggleAuto(); return; }
      if (e.key === 's' || e.key === 'S') { if (!e.repeat) toggleSkip(); return; }
      if (choiceOpen && e.key >= '1' && e.key <= '9') { e.preventDefault(); pickChoice(+e.key - 1); return; }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.repeat && !textDone) { completeText(); return; }
        advance(true);
      }
    });
    window.addEventListener('error', function (e) {
      showCrash((e && e.message) || 'Script error');
    });
    window.addEventListener('unhandledrejection', function (e) {
      showCrash((e && e.reason && (e.reason.message || e.reason)) || 'Promise error');
    });
  }

  function init() {
    const m = loadJSON(META_KEY);
    if (m && m.v === 1) meta = Object.assign(defaultMeta(), m);
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
    window.addEventListener('pageshow', function () { syncViewport(); syncBand(); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { syncViewport(); syncBand(); });
    syncSetButtons();
    const problems = selfCheck();
    if (problems.length) showCrash(problems.join('\n'));
    showTitle();
    if (window.ResizeObserver && $('box')) new ResizeObserver(syncBand).observe($('box'));
    syncBand();
  }

  window.__ELVES = {
    get screen() { return state && state.screen; },
    get state() { return state; },
    spriteChain: spriteChain,
    resolveSprite: resolveSprite,
    newGame: newGame,
    advance: advance,
    choose: pickChoice,
    place: pickPlace,
    settleMini: function (score) { if (mini) endMini(mini.step, score == null ? mini.good : score); },
    skipVideo: function () { if (videoOnDone) finishVideo(); },
    setSpeed: function (n) { settings.speed = n; },
    problems: selfCheck,
    SHIP: SHIP
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
