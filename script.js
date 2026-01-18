(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- Theme toggle (saved) ----------
  const themeBtn = $("#themeBtn");
  const root = document.documentElement;

  function getPreferredTheme() {
    const saved = localStorage.getItem("ironops_theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("ironops_theme", theme);
    themeBtn?.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }

  setTheme(getPreferredTheme());
  themeBtn?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
    log(`THEME SWITCHED: <b>${(root.getAttribute("data-theme") || "").toUpperCase()}</b>`);
  });

  // ---------- “Ops” readouts + log ----------
  const logBox = $(".log");
  const statusChip = $("#statusChip");
  const sigEl = $("#sig");
  const footSig = $("#footSig");
  const threatEl = $("#threat");
  const rangeEl = $("#range");
  const signalEl = $("#signal");

  function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function signature() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 10; i++) s += alphabet[rnd(0, alphabet.length - 1)];
    return s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8);
  }

  function nowStamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function log(html) {
    if (!logBox) return;
    const p = document.createElement("p");
    p.className = "log__line";
    p.innerHTML = `[${nowStamp()}] ${html}`;
    logBox.prepend(p);

    // keep it tidy
    const lines = $$(".log__line", logBox);
    lines.slice(18).forEach((n) => n.remove());
  }

  const sig = signature();
  if (sigEl) sigEl.textContent = sig;
  if (footSig) footSig.textContent = `SIG: ${sig}`;

  function updateReadouts() {
    const t = rnd(45, 98);
    const r = rnd(12, 88);
    const s = rnd(60, 99);

    if (threatEl) threatEl.textContent = String(t);
    if (rangeEl) rangeEl.textContent = String(r);
    if (signalEl) signalEl.textContent = String(s);

    // Flip chip state sometimes
    const armed = t > 65;
    if (statusChip) {
      statusChip.querySelector(".chip__text").textContent = armed ? "SYSTEM: ARMED" : "SYSTEM: STANDBY";
      statusChip.querySelector(".chip__ping").style.background = armed ? "var(--danger)" : "var(--accent2)";
    }
  }

  log("LINK ESTABLISHED: <b>SECURE</b>");
  log("NODES ONLINE: <b>12</b>");
  updateReadouts();
  setInterval(updateReadouts, 5200);

  // Buttons
  $("#pingBtn")?.addEventListener("click", () => {
    log("PING SENT… RESPONSE: <b>OK</b>");
    blastAt(window.innerWidth * 0.72, window.innerHeight * 0.32, 0.9);
  });

  $("#scrambleBtn")?.addEventListener("click", () => {
    log("SIGNAL SCRAMBLED: <b>ROTATE KEYS</b>");
    blastAt(window.innerWidth * 0.58, window.innerHeight * 0.36, 1.1);
  });

  $("#armBtn")?.addEventListener("click", () => {
    log("ARM SEQUENCE: <b>ENGAGED</b>");
    blastAt(window.innerWidth * 0.5, window.innerHeight * 0.16, 1.4);
  });

  $("#shockBtn")?.addEventListener("click", () => {
    blastAt(window.innerWidth * 0.35, window.innerHeight * 0.32, 1.6);
    log("BLAST TEST: <b>CONFIRMED</b>");
  });

  // ---------- Count-up stats ----------
  const stats = $$(".stat__num[data-count]");
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el) {
    const target = Number(el.getAttribute("data-count") || "0");
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }

    const duration = 900 + Math.random() * 600;
    const start = performance.now();
    const from = 0;

    function tick(t) {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      el.textContent = String(v);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  stats.forEach(animateCount);

  // ---------- Demo form ----------
  const form = $("#contactForm");
  const formNote = $("#formNote");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();

    blastAt(window.innerWidth * 0.52, window.innerHeight * 0.82, 1.2);
    log(`MESSAGE QUEUED FROM: <b>${escapeHtml(name || "UNKNOWN")}</b>`);

    if (formNote) formNote.textContent = "Sent (demo). Wire to a backend when ready.";
    form.reset();
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[c]));
  }

  // ---------- Keyboard: G = stealth grid ----------
  let stealthGrid = false;
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "g") {
      stealthGrid = !stealthGrid;
      log(`STEALTH GRID: <b>${stealthGrid ? "ON" : "OFF"}</b>`);
    }
  });

  // ---------- Canvas FX: radar sweep + tracers + blast ----------
  const canvas = $("#fx");
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

  const tracers = [];
  const blasts = [];

  function addTracer() {
    const speed = 0.35 + Math.random() * 0.65;
    tracers.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      life: 280 + Math.random() * 260,
    });
  }

  for (let i = 0; i < 34; i++) addTracer();

  // Blast rings (public hook)
  function blastAt(x, y, strength = 1) {
    if (reduceMotion) return;
    blasts.push({ x, y, r: 0, a: 0.85, s: Math.max(0.6, Math.min(2.0, strength)) });
  }
  window.addEventListener("pointerdown", (e) => {
    blastAt(e.clientX, e.clientY, 1.0);
  }, { passive: true });

  // Gentle center “radar”
  let sweep = 0;

  function drawGrid() {
    const step = 44;
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.lineWidth = 1;

    // Read current CSS vars
    const styles = getComputedStyle(document.documentElement);
    const line = styles.getPropertyValue("--line").trim() || "rgba(202,255,140,.14)";
    ctx.strokeStyle = line;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRadar() {
    const cx = w * 0.18;
    const cy = h * 0.38;
    const radius = Math.min(w, h) * 0.34;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#caff8c";
    const accent2 = styles.getPropertyValue("--accent2").trim() || "#72d4ff";

    // rings
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.strokeStyle = accent;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // crosshair
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = accent2;
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // sweep wedge
    ctx.globalAlpha = 0.22;
    const ang = sweep;
    const wedge = 0.45;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.35, accent);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, ang - wedge, ang, false);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawTracers() {
    const styles = getComputedStyle(document.documentElement);
    const line = styles.getPropertyValue("--line").trim() || "rgba(202,255,140,.18)";
    const accent2 = styles.getPropertyValue("--accent2").trim() || "#72d4ff";

    // trails
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;

    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];
      const x2 = t.x - t.vx * 18;
      const y2 = t.y - t.vy * 18;

      ctx.strokeStyle = (i % 4 === 0) ? accent2 : line;

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBlasts() {
    if (!blasts.length) return;

    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue("--accent").trim() || "#caff8c";
    const danger = styles.getPropertyValue("--danger").trim() || "#ff5f6d";

    ctx.save();
    for (const b of blasts) {
      ctx.globalAlpha = Math.max(0, b.a);
      ctx.lineWidth = 2;
      ctx.strokeStyle = b.a > 0.5 ? accent : danger;

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();

      // inner ring
      ctx.globalAlpha = Math.max(0, b.a * 0.7);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.max(0, b.r * 0.6), 0, Math.PI * 2);
      ctx.stroke();

      b.r += 7.5 * b.s;
      b.a -= 0.035 * (1 / b.s);
    }
    ctx.restore();

    // prune
    for (let i = blasts.length - 1; i >= 0; i--) {
      if (blasts[i].a <= 0) blasts.splice(i, 1);
    }
  }

  function step() {
    // clear with subtle fade for “smear” look
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    if (!reduceMotion) sweep += 0.012;

    // update tracers
    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];
      t.x += t.vx;
      t.y += t.vy;
      t.life -= 1;

      // bounds wrap
      if (t.x < -30) t.x = w + 30;
      if (t.x > w + 30) t.x = -30;
      if (t.y < -30) t.y = h + 30;
      if (t.y > h + 30) t.y = -30;

      if (t.life <= 0) {
        tracers[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (0.35 + Math.random() * 0.65),
          vy: (Math.random() - 0.5) * (0.35 + Math.random() * 0.65),
          life: 280 + Math.random() * 260,
        };
      }
    }

    if (stealthGrid) drawGrid();
    drawRadar();
    drawTracers();
    drawBlasts();

    requestAnimationFrame(step);
  }

  // Start with a clean first frame
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(step);

  // “System boot” blast
  setTimeout(() => {
    blastAt(window.innerWidth * 0.22, window.innerHeight * 0.42, 1.5);
  }, 260);

})();
