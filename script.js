/* =========================================================
   SATCORP — Planetary Operations Interface (script.js)
   - Boot / entry sequence
   - Radial + module navigation (smooth scroll)
   - Classified mode toggle
   - Access terminal modal
   - Lightweight "holo globe" canvas animation (no libs)
   - Live-ish telemetry + event stream (mock)
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Elements ---------- */
const boot = $("#boot");
const bootBar = $("#bootBar");
const bootPct = $("#bootPct");
const enterBtn = $("#enterBtn");

const modeBtn = $("#modeBtn");
const modeLabel = $("#modeLabel");

const accessBtn = $("#accessBtn");
const terminalModal = $("#terminalModal");
const terminalForm = $("#terminalForm");

const openTerminalBtn = $("#openTerminal");

const yearEl = $("#year");
const buildId = $("#buildId");

const latencyEl = $("#latency");
const uplinkEl = $("#uplink");
const coverageEl = $("#coverage");
const regionsEl = $("#regions");

const eventsEl = $("#events");

const globeCanvas = $("#globeCanvas");
const ctx = globeCanvas?.getContext("2d");

/* ---------- Init ---------- */
(() => {
  // Footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Build ID placeholder (simple deterministic-ish string)
  if (buildId) buildId.textContent = `OPS-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

  // Boot sequence
  runBootSequence();

  // Wire UI
  wireNavigation();
  wireClassifiedMode();
  wireTerminalModal();

  // Start ambient telemetry + events
  startTelemetry();
  startEventStream();

  // Start canvas globe animation
  if (ctx) startHoloGlobe(globeCanvas, ctx);

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    // Enter to proceed once unlocked
    if (e.key === "Enter" && enterBtn && !enterBtn.disabled && boot && !boot.classList.contains("boot--hidden")) {
      e.preventDefault();
      enterInterface();
    }

    // Esc closes modal
    if (e.key === "Escape" && terminalModal && !terminalModal.hidden) {
      closeTerminal();
    }
  });
})();

/* =========================================================
   Boot / Entry
   ========================================================= */

function runBootSequence() {
  if (!boot || !bootBar || !bootPct || !enterBtn) return;

  const lines = $$("[data-bootline]", boot);
  lines.forEach((l) => (l.style.opacity = "0"));

  let pct = 0;
  let lineIdx = 0;

  const tick = () => {
    pct += randInt(2, 6);
    if (pct > 100) pct = 100;

    bootBar.style.width = `${pct}%`;
    bootPct.textContent = String(pct);

    // Reveal lines as we go
    const revealAt = [10, 35, 60, 82];
    if (lineIdx < lines.length && pct >= revealAt[lineIdx]) {
      lines[lineIdx].style.opacity = "0.85";
      lines[lineIdx].style.transform = "translateY(0)";
      lineIdx++;
    }

    if (pct >= 100) {
      enterBtn.disabled = false;
      enterBtn.focus();
      return;
    }

    window.setTimeout(tick, randInt(70, 120));
  };

  // Small initial delay for dramatic timing
  window.setTimeout(tick, 450);

  enterBtn.addEventListener("click", enterInterface);
}

function enterInterface() {
  if (!boot) return;
  boot.classList.add("boot--hidden");
  // Fully remove from a11y tree after fade
  window.setTimeout(() => {
    boot.style.display = "none";
  }, 300);
}

/* =========================================================
   Navigation
   ========================================================= */

function wireNavigation() {
  const navButtons = $$("[data-target]");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (!target) return;

      const el = $(target);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // Micro feedback: flash the target border briefly
      pulseTarget(el);
    });
  });
}

function pulseTarget(el) {
  el.classList.add("pulseTarget");
  window.setTimeout(() => el.classList.remove("pulseTarget"), 500);
}

/* Add a tiny style hook for pulseTarget without touching CSS file */
(() => {
  const s = document.createElement("style");
  s.textContent = `
    .pulseTarget{ outline: 2px solid rgba(55,211,255,0.45); outline-offset: 6px; }
    body.classified .pulseTarget{ outline-color: rgba(191,239,255,0.55); }
  `;
  document.head.appendChild(s);
})();

/* =========================================================
   Classified Mode
   ========================================================= */

function wireClassifiedMode() {
  if (!modeBtn || !modeLabel) return;

  modeBtn.addEventListener("click", () => {
    const isOn = document.body.classList.toggle("classified");
    modeBtn.setAttribute("aria-pressed", String(isOn));
    modeBtn.textContent = `CLASSIFIED: ${isOn ? "ON" : "OFF"}`;
    modeLabel.textContent = isOn ? "CLASSIFIED" : "PUBLIC";
  });
}

/* =========================================================
   Terminal Modal
   ========================================================= */

function wireTerminalModal() {
  if (accessBtn) accessBtn.addEventListener("click", openTerminal);
  if (openTerminalBtn) openTerminalBtn.addEventListener("click", openTerminal);

  if (!terminalModal) return;

  // Close by backdrop or [data-close]
  terminalModal.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.hasAttribute("data-close")) closeTerminal();
  });

  if (terminalForm) {
    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(terminalForm);
      const payload = Object.fromEntries(data.entries());

      // Prototype behavior: log payload + show a quick confirmation
      console.log("SATCORP REQUEST (prototype):", payload);

      pushEvent(`Access request submitted: ${String(payload.opType || "Unknown")}`);
      softToast("REQUEST ACCEPTED · ROUTING…");

      terminalForm.reset();
      closeTerminal();
    });
  }
}

function openTerminal() {
  if (!terminalModal) return;
  terminalModal.hidden = false;

  // Focus first input for accessibility
  const first = terminalModal.querySelector("input,select,textarea,button");
  if (first) first.focus();
}

function closeTerminal() {
  if (!terminalModal) return;
  terminalModal.hidden = true;
}

/* Tiny toast (no dependency) */
function softToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--in"));
  setTimeout(() => toast.classList.remove("toast--in"), 1700);
  setTimeout(() => toast.remove(), 2200);
}

(() => {
  const s = document.createElement("style");
  s.textContent = `
    .toast{
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid rgba(105,200,255,0.16);
      background: rgba(6, 14, 30, 0.75);
      backdrop-filter: blur(16px);
      color: rgba(235,245,255,0.85);
      font: 600 12px/1.2 ${getComputedStyle(document.body).fontFamily};
      letter-spacing: 0.14em;
      box-shadow: 0 12px 50px rgba(0,0,0,0.45);
      z-index: 60;
      transition: opacity 220ms ease, transform 220ms ease;
      pointer-events: none;
      white-space: nowrap;
    }
    .toast--in{
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(s);
})();

/* =========================================================
   Telemetry (mock, but feels alive)
   ========================================================= */

function startTelemetry() {
  if (!latencyEl || !uplinkEl || !coverageEl || !regionsEl) return;

  const coverages = ["GLOBAL", "MULTI-REGION", "EDGE-LAYER", "ORBITAL"];
  const regionCounts = [12, 18, 24, 30, 36];

  const tick = () => {
    const latency = randInt(8, 38);
    const uplink = randInt(92, 100);
    const coverage = coverages[randInt(0, coverages.length - 1)];
    const regions = regionCounts[randInt(0, regionCounts.length - 1)];

    latencyEl.textContent = String(latency);
    uplinkEl.textContent = String(uplink);
    coverageEl.textContent = coverage;
    regionsEl.textContent = String(regions);
  };

  tick();
  setInterval(tick, 1200);
}

/* =========================================================
   Event Stream
   ========================================================= */

const EVENT_POOL = [
  "Node handshake complete",
  "Routing tables refreshed",
  "Edge cache synchronized",
  "Telemetry uplink stable",
  "Signal integrity nominal",
  "Regional relay online",
  "Auth layer hardened",
  "Deployment window prepared",
  "Sync pulse received",
  "Orbit lock maintained",
  "Index rebuilt at edge",
  "Audit trail appended"
];

function startEventStream() {
  if (!eventsEl) return;

  setInterval(() => {
    const msg = EVENT_POOL[randInt(0, EVENT_POOL.length - 1)];
    pushEvent(msg);
  }, 2400);
}

function pushEvent(message) {
  if (!eventsEl) return;

  const li = document.createElement("li");
  li.innerHTML = `<span class="dot"></span> ${escapeHtml(message)}`;

  // Insert at top
  eventsEl.prepend(li);

  // Cap list
  while (eventsEl.children.length > 7) {
    eventsEl.lastElementChild?.remove();
  }

  // Subtle flash
  li.style.opacity = "0";
  li.style.transform = "translateY(-4px)";
  requestAnimationFrame(() => {
    li.style.transition = "opacity 220ms ease, transform 220ms ease";
    li.style.opacity = "1";
    li.style.transform = "translateY(0)";
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   Holographic Globe (Canvas)
   - No external libraries
   - A "data sphere" vibe: grid + arcs + nodes + glow
   ========================================================= */

function startHoloGlobe(canvas, ctx) {
  // Ensure sharpness on HiDPI
  const resize = () => {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height));
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);

  let t = 0;

  const draw = () => {
    t += 0.008;

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.38;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background glow
    radialGlow(ctx, cx, cy, r * 2.1, 0.18);

    // Sphere clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Dark inside
    ctx.fillStyle = "rgba(2, 6, 17, 0.55)";
    ctx.fillRect(0, 0, w, h);

    // Latitudinal lines
    for (let i = -6; i <= 6; i++) {
      const y = cy + (i / 6) * r;
      const k = Math.cos((i / 6) * (Math.PI / 2));
      const rx = r * k;
      const alpha = 0.18 + 0.10 * (1 - Math.abs(i) / 6);
      glowStroke(ctx, `rgba(55,211,255,${alpha})`, 1);
      ellipse(ctx, cx, y, rx, 0.5, t * 0.0);
    }

    // Longitudinal arcs
    const meridians = 10;
    for (let i = 0; i < meridians; i++) {
      const ang = (i / meridians) * Math.PI + t * 0.8;
      const s = Math.sin(ang);
      const c = Math.cos(ang);
      const alpha = 0.10 + 0.12 * (Math.abs(c));
      glowStroke(ctx, `rgba(191,239,255,${alpha})`, 1);

      // Simulate 3D by scaling ellipse width by cos
      const rx = r * Math.abs(c);
      ellipse(ctx, cx, cy, rx, 1.0, 0);
    }

    // Data nodes
    const nodeCount = 60;
    for (let i = 0; i < nodeCount; i++) {
      const a = (i / nodeCount) * Math.PI * 2 + t * 0.25;
      const b = Math.sin(i * 12.77) * 0.6;
      const px = cx + Math.cos(a) * r * 0.78;
      const py = cy + b * r * 0.55;

      // Fake depth (front/back)
      const depth = (Math.sin(a + t) + 1) / 2; // 0..1
      const size = 1 + depth * 1.6;
      const alpha = 0.15 + depth * 0.45;

      ctx.fillStyle = `rgba(55,211,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();

      // occasional twinkle
      if (i % 9 === 0) {
        ctx.fillStyle = `rgba(255,255,255,${0.08 + depth * 0.18})`;
        ctx.beginPath();
        ctx.arc(px + 1.5, py - 1.0, size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Subtle scan sweep
    const sweepY = ((Math.sin(t * 1.3) + 1) / 2) * (r * 2) + (cy - r);
    ctx.fillStyle = "rgba(55,211,255,0.06)";
    ctx.fillRect(cx - r, sweepY, r * 2, 8);

    ctx.restore();

    // Sphere rim
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(55,211,255,0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer halo
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.08, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(55,211,255,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
}

function ellipse(ctx, cx, cy, rx, ryScale, rot) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(1, ryScale);
  ctx.beginPath();
  ctx.ellipse(0, (cy - cy) / ryScale, rx, rx * 0.52, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function glowStroke(ctx, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = "rgba(55,211,255,0.35)";
  ctx.shadowBlur = 10;
}

function radialGlow(ctx, cx, cy, radius, strength) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, `rgba(55,211,255,${strength})`);
  g.addColorStop(0.45, `rgba(44,134,255,${strength * 0.55})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

/* =========================================================
   Helpers
   ========================================================= */

function randInt(min, max) {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
