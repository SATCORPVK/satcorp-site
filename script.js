(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- State ----------
  const state = {
    overdrive: false,
    calm: false,
    grid: false,
    pointer: { x: innerWidth * 0.35, y: innerHeight * 0.45, vx: 0, vy: 0 },
    energy: 0.72,
    distort: 0.58,
    sync: 0.91,
  };

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // ---------- Theme ----------
  const themeBtn = $("#themeBtn");
  const root = document.documentElement;

  function getTheme() {
    const saved = localStorage.getItem("voidrift_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
  }
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    localStorage.setItem("voidrift_theme", t);
  }
  setTheme(getTheme());
  themeBtn?.addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
    log(`THEME: <b>${(root.getAttribute("data-theme") || "").toUpperCase()}</b>`);
    punch(innerWidth * 0.18, 70, 0.9);
  });

  // ---------- Signature ----------
  const sig = genSig();
  $("#sig").textContent = sig;
  $("#footSig").textContent = `SIG: ${sig}`;

  function genSig() {
    const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 10; i++) s += a[(Math.random() * a.length) | 0];
    return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
  }

  function stamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // ---------- Log ----------
  const logBox = $(".log");
  function log(html) {
    if (!logBox) return;
    const p = document.createElement("p");
    p.className = "log__line";
    p.innerHTML = `[${stamp()}] ${html}`;
    logBox.prepend(p);
    const lines = $$(".log__line", logBox);
    lines.slice(20).forEach(n => n.remove());
  }

  log("LINK: <b>ESTABLISHED</b>");
  log("RIFT CORE: <b>STABLE</b>");
  log("NOISE FLOOR: <b>HIGH</b>");

  // ---------- Buttons ----------
  const overdriveBtn = $("#overdriveBtn");
  const shatterBtn = $("#shatterBtn");
  const muteBtn = $("#muteBtn");

  overdriveBtn?.addEventListener("click", toggleOverdrive);
  shatterBtn?.addEventListener("click", () => {
    log("SHATTER: <b>TRIGGERED</b>");
    for (let i = 0; i < 6; i++) {
      punch(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.25 + Math.random() * 0.55), 1.2 + Math.random() * 0.8);
    }
  });
  muteBtn?.addEventListener("click", () => {
    state.calm = !state.calm;
    log(`CALM MODE: <b>${state.calm ? "ON" : "OFF"}</b>`);
    punch(innerWidth * 0.32, innerHeight * 0.36, 1.1);
  });

  $("#pingBtn")?.addEventListener("click", () => {
    log("PING… <b>OK</b>");
    state.sync = clamp(state.sync + 0.03, 0.25, 0.99);
    punch(innerWidth * 0.72, innerHeight * 0.32, 1.0);
  });

  $("#scrambleBtn")?.addEventListener("click", () => {
    log("SCRAMBLE: <b>ROTATE KEYS</b>");
    state.distort = clamp(state.distort + 0.07, 0.2, 0.98);
    state.energy = clamp(state.energy + 0.05, 0.2, 0.98);
    punch(innerWidth * 0.62, innerHeight * 0.38, 1.2);
  });

  function toggleOverdrive() {
    state.overdrive = !state.overdrive;
    log(`OVERDRIVE: <b>${state.overdrive ? "ON" : "OFF"}</b>`);
    punch(innerWidth * 0.5, 120, state.overdrive ? 1.6 : 1.0);
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "g") { state.grid = !state.grid; log(`GRID: <b>${state.grid ? "ON" : "OFF"}</b>`); }
    if (k === "o") toggleOverdrive();
    if (k === "r") {
      log("RESET: <b>OK</b>");
      shocks.length = 0;
      for (let i = 0; i < 60; i++) spawnShard(true);
      punch(innerWidth * 0.5, innerHeight * 0.45, 1.6);
    }
  });

  // ---------- Metrics ----------
  const chaosVal = $("#chaosVal"), distVal = $("#distVal"), syncVal = $("#syncVal");
  const chaosBar = $("#chaosBar"), distBar = $("#distBar"), syncBar = $("#syncBar");
  function setMetrics() {
    const chaos = Math.round(state.energy * 100);
    const dist = Math.round(state.distort * 100);
    const sync = Math.round(state.sync * 100);
    if (chaosVal) chaosVal.textContent = String(chaos);
    if (distVal) distVal.textContent = String(dist);
    if (syncVal) syncVal.textContent = String(sync);
    if (chaosBar) chaosBar.style.setProperty("--w", `${chaos}%`);
    if (distBar) distBar.style.setProperty("--w", `${dist}%`);
    if (syncBar) syncBar.style.setProperty("--w", `${sync}%`);
  }
  setMetrics();
  setInterval(() => {
    // gently drift stats
    const drift = state.calm ? 0.015 : 0.03;
    state.energy = clamp(state.energy + (Math.random() - 0.5) * drift + (state.overdrive ? 0.01 : 0), 0.2, 0.98);
    state.distort = clamp(state.distort + (Math.random() - 0.5) * drift + (state.overdrive ? 0.015 : 0), 0.2, 0.98);
    state.sync = clamp(state.sync + (Math.random() - 0.5) * drift - (state.overdrive ? 0.01 : 0), 0.25, 0.99);
    setMetrics();
  }, 1400);

  // ---------- Canvas: VOID RIFT ----------
  const canvas = $("#rift");
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Pointer
  window.addEventListener("pointermove", (e) => {
    const px = e.clientX, py = e.clientY;
    state.pointer.vx = px - state.pointer.x;
    state.pointer.vy = py - state.pointer.y;
    state.pointer.x = px;
    state.pointer.y = py;

    if (state.overdrive && !reduceMotion && Math.random() < 0.12) {
      punch(px, py, 0.9 + Math.random() * 0.8);
    }
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    punch(e.clientX, e.clientY, 1.2);
    log("IMPACT: <b>CONFIRMED</b>");
  }, { passive: true });

  // Shards (particles)
  const shards = [];
  const shocks = [];

  function spawnShard(burst = false) {
    const base = burst ? 1.5 : 1.0;
    const speed = (0.2 + Math.random() * 1.1) * base * (state.overdrive ? 1.35 : 1.0) * (state.calm ? 0.7 : 1.0);
    const ang = Math.random() * Math.PI * 2;
    const cx = w * (0.25 + Math.random() * 0.65);
    const cy = h * (0.15 + Math.random() * 0.7);

    shards.push({
      x: cx,
      y: cy,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 220 + Math.random() * 260,
      size: 0.6 + Math.random() * 2.2,
      hue: Math.random() < 0.5 ? "hot" : "cold",
    });
  }

  for (let i = 0; i < 160; i++) spawnShard();

  function punch(x, y, strength = 1) {
    if (reduceMotion) return;
    shocks.push({ x, y, r: 0, a: 0.85, s: clamp(strength, 0.6, 2.2) });
    // add shards near impact
    for (let i = 0; i < 18; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = (0.8 + Math.random() * 2.4) * strength * (state.overdrive ? 1.2 : 1.0);
      shards.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 110 + Math.random() * 180,
        size: 0.8 + Math.random() * 2.6,
        hue: Math.random() < 0.5 ? "hot" : "cold",
      });
    }
  }

  // Utility
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Colors from CSS vars
  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  // Simple hash noise (fast + deterministic enough for vibes)
  function hash2(x, y) {
    let n = x * 374761393 + y * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  let t = 0;
  function draw() {
    t += 0.016 * (state.calm ? 0.7 : 1.0) * (state.overdrive ? 1.35 : 1.0);

    // fade-clear (smear)
    ctx.save();
    ctx.globalAlpha = state.calm ? 0.18 : 0.24;
    ctx.fillStyle = root.getAttribute("data-theme") === "light" ? "white" : "black";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    if (state.grid) drawGrid();

    const hot = cssVar("--hot", "#ff2bd6");
    const cold = cssVar("--cold", "#28d7ff");
    const acid = cssVar("--acid", "#b7ff2a");
    const line = cssVar("--line", "rgba(255,255,255,.12)");

    // Rift center follows pointer (but weighted toward left for composition)
    const cx = lerp(w * 0.42, state.pointer.x, 0.55);
    const cy = lerp(h * 0.45, state.pointer.y, 0.55);
    const baseR = Math.min(w, h) * (0.22 + state.energy * 0.12);

    // "Rift" core gradient
    const g = ctx.createRadialGradient(cx, cy, baseR * 0.08, cx, cy, baseR * 1.2);
    g.addColorStop(0, colorMix(acid, "transparent", 0.0));
    g.addColorStop(0.12, colorMix(cold, "transparent", 0.15));
    g.addColorStop(0.25, colorMix(hot, "transparent", 0.18));
    g.addColorStop(0.58, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.85 + (state.overdrive ? 0.12 : 0);
    ctx.fillStyle = g;

    // wobble blob
    ctx.beginPath();
    const wob = 10 + state.distort * 40;
    const points = 64;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const n = hash2((i * 17) | 0, (t * 60) | 0);
      const rr = baseR * (0.9 + (n - 0.5) * 0.22) + Math.sin(t * 2 + i) * (wob * 0.08);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Chromatic smear / edge ring
    ctx.save();
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.35 + (state.overdrive ? 0.25 : 0);
    ctx.strokeStyle = cold;
    ctx.beginPath(); ctx.arc(cx - 2, cy, baseR * 0.92, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = hot;
    ctx.beginPath(); ctx.arc(cx + 2, cy, baseR * 0.92, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // Noise dust (cheap procedural specks)
    const dustCount = state.calm ? 120 : 240;
    ctx.save();
    ctx.globalAlpha = 0.10 + state.energy * 0.08;
    ctx.fillStyle = line;
    for (let i = 0; i < dustCount; i++) {
      const x = (hash2(i, (t * 80) | 0) * w);
      const y = (hash2(i + 999, (t * 80) | 0) * h);
      const s = 0.8 + hash2(i + 333, (t * 30) | 0) * 1.8;
      ctx.fillRect(x, y, s, s);
    }
    ctx.restore();

    // Shards physics
    const pull = 0.0009 + state.energy * 0.0016;
    const drag = state.calm ? 0.992 : 0.986;
    for (let i = shards.length - 1; i >= 0; i--) {
      const p = shards[i];
      const dx = cx - p.x;
      const dy
