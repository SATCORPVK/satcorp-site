// script.js — Moana-inspired ocean journey theme (original code)

// Year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll helper
const smoothTo = (id) => {
  const el = document.querySelector(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Buttons / nav helpers
const journeyBtn = document.getElementById("scrollJourney");
if (journeyBtn) journeyBtn.addEventListener("click", () => smoothTo("#journey"));

const menuBtn = document.getElementById("menuBtn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    // Simple "next section" jump on mobile
    const targets = ["#vibe", "#features", "#journey", "#contact"];
    const next =
      targets.find((sel) => {
        const node = document.querySelector(sel);
        return node && node.getBoundingClientRect().top > 120;
      }) || "#vibe";
    smoothTo(next);
  });
}

// Modal logic
const backdrop = document.getElementById("modalBackdrop");
const openModalBtn = document.getElementById("openModalBtn");
const openModalBtn2 = document.getElementById("openModalBtn2");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const sendBtn = document.getElementById("sendBtn");

const openModal = () => {
  if (!backdrop) return;
  backdrop.style.display = "flex";
  setTimeout(() => {
    const name = document.getElementById("name");
    if (name) name.focus();
  }, 40);
};

const closeModal = () => {
  if (!backdrop) return;
  backdrop.style.display = "none";
};

if (openModalBtn) openModalBtn.addEventListener("click", openModal);
if (openModalBtn2) openModalBtn2.addEventListener("click", openModal);
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

if (backdrop) {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const name = (document.getElementById("name")?.value || "").trim() || "Explorer";
    const goal = (document.getElementById("goal")?.value || "").trim() || "No details provided.";
    alert(`Thanks, ${name}!\n\nRequest received:\n${goal}`);

    const nameEl = document.getElementById("name");
    const goalEl = document.getElementById("goal");
    if (nameEl) nameEl.value = "";
    if (goalEl) goalEl.value = "";
    closeModal();
  });
}

// Ocean canvas animation (simple wave field)
const canvas = document.getElementById("oceanCanvas");
const ctx = canvas?.getContext?.("2d");

const state = {
  t: 0,
  dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
  breeze: 0.65, // motion intensity
};

const prefersReduced =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReduced) state.breeze = 0.15;

// Optional: update stats if elements exist
const statWaves = document.getElementById("statWaves");
const statBreeze = document.getElementById("statBreeze");
const statMood = document.getElementById("statMood");
if (statWaves) statWaves.textContent = "3";
if (statBreeze) statBreeze.textContent = prefersReduced ? "Minimal" : "Low";
if (statMood) statMood.textContent = "Sunset";

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * state.dpr);
  canvas.height = Math.floor(rect.height * state.dpr);
}

function drawOcean() {
  if (!canvas || !ctx) return;

  const w = canvas.width,
    h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background glow
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(255,154,107,0.14)");
  grad.addColorStop(0.35, "rgba(24,183,167,0.10)");
  grad.addColorStop(1, "rgba(0,0,0,0.15)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Horizon haze
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, h * 0.35, w, 1);

  // Wave layers
  const layers = [
    { amp: 10, len: 140, y: 0.62, alpha: 0.14 },
    { amp: 14, len: 190, y: 0.70, alpha: 0.12 },
    { amp: 18, len: 240, y: 0.80, alpha: 0.10 },
  ];

  layers.forEach((L, i) => {
    ctx.beginPath();

    const baseY = h * L.y;
    const A = L.amp * state.dpr;
    const k = (Math.PI * 2) / (L.len * state.dpr);
    const speed = (0.9 + i * 0.18) * state.breeze;

    ctx.moveTo(0, baseY);

    for (let x = 0; x <= w; x += 6 * state.dpr) {
      const y =
        baseY +
        Math.sin(x * k + state.t * speed) * A +
        Math.sin(x * k * 0.7 + state.t * speed * 1.3) * (A * 0.35);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = `rgba(24,183,167,${L.alpha})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.16, L.alpha + 0.05)})`;
    ctx.lineWidth = 1.2 * state.dpr;
    ctx.stroke();
  });

  // Sparkle points
  const sparkCount = 26;
  for (let i = 0; i < sparkCount; i++) {
    const x = (i * 97 + state.t * 22) % w;
    const y =
      h * 0.18 +
      Math.sin(i * 1.7 + state.t * 0.9) * (h * 0.03) +
      (i % 6) * 2 * state.dpr;
    const r = (1 + (i % 3)) * state.dpr;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fill();
  }

  state.t += 0.016;
  requestAnimationFrame(drawOcean);
}

if (canvas && ctx) {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawOcean();
}

// Gentle parallax (pointer move) on the ocean window
const oceanWindow = document.querySelector(".ocean-window");
if (oceanWindow) {
  oceanWindow.addEventListener("pointermove", (e) => {
    const rect = oceanWindow.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    oceanWindow.style.transform = `translateY(-1px) rotateX(${(-ny * 2).toFixed(
      2
    )}deg) rotateY(${(nx * 2).toFixed(2)}deg)`;
  });

  oceanWindow.addEventListener("pointerleave", () => {
    oceanWindow.style.transform = "translateY(0px) rotateX(0deg) rotateY(0deg)";
  });
}
