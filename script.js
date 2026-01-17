// SΛTCORP // Blacksite Terminal (no libraries)

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* -----------------------
   1) CLOCK + STATUS
------------------------ */
const statusText = $("#statusText");
const clockEl = $("#clock");

function setStatus(t) {
  if (statusText) statusText.textContent = t;
}

function updateClock() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 250);
updateClock();

setStatus("HANDSHAKE");
setTimeout(() => setStatus("AUTH OK"), 550);
setTimeout(() => setStatus("ONLINE"), 1100);

/* -----------------------
   2) GRAIN CANVAS (CRT)
------------------------ */
const grain = $("#grain");
const gctx = grain.getContext("2d");
let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

function resizeCanvas(c) {
  c.width = Math.floor(window.innerWidth * DPR);
  c.height = Math.floor(window.innerHeight * DPR);
  c.style.width = "100%";
  c.style.height = "100%";
}

function drawGrain() {
  const w = grain.width, h = grain.height;
  const img = gctx.createImageData(w, h);
  const data = img.data;

  // sparse noise for performance
  for (let i = 0; i < data.length; i += 16) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;     // R
    data[i + 1] = v; // G
    data[i + 2] = v; // B
    data[i + 3] = 20; // A (subtle)
  }
  gctx.putImageData(img, 0, 0);
}

function onResize() {
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  resizeCanvas(grain);
}
window.addEventListener("resize", onResize);
onResize();

// re-render grain occasionally (not every frame)
setInterval(drawGrain, 180);

/* -----------------------
   3) TELEMETRY BARS
------------------------ */
const uplink = $("#uplink");
const integrity = $("#integrity");
const latency = $("#latency");

const uplinkVal = $("#uplinkVal");
const integrityVal = $("#integrityVal");
const latencyVal = $("#latencyVal");

function setBar(el, pct) {
  if (!el) return;
  el.style.width = `${pct}%`;
}

let t = 0;
function telemetryLoop() {
  t += 0.02;

  const up = Math.round(76 + Math.sin(t) * 14);
  const ok = Math.round(93 + Math.cos(t * 0.8) * 5);
  const lat = Math.round(10 + (Math.sin(t * 1.4) + 1) * 9);

  setBar(uplink, up);
  setBar(integrity, ok);
  setBar(latency, Math.min(100, lat * 4));

  if (uplinkVal) uplinkVal.textContent = `${up}%`;
  if (integrityVal) integrityVal.textContent = `${ok}%`;
  if (latencyVal) latencyVal.textContent = `${lat}ms`;

  requestAnimationFrame(telemetryLoop);
}
telemetryLoop();

/* -----------------------
   4) COUNTERS
------------------------ */
function animateCount(el, to, ms = 900) {
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - t0) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * eased));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
$$("[data-count]").forEach((el) => {
  const to = Number(el.getAttribute("data-count"));
  if (Number.isFinite(to)) animateCount(el, to, 950);
});

/* -----------------------
   5) REVEALS ON SCROLL
------------------------ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("on");
  });
}, { threshold: 0.18 });

$$(".reveal").forEach((el) => io.observe(el));

/* -----------------------
   6) BUTTONS / MODES
------------------------ */
const scanBtn = $("#scanBtn");
const lockBtn = $("#lockBtn");

function flashScan() {
  setStatus("SCANNING");
  document.body.animate(
    [{ filter: "brightness(1)" }, { filter: "brightness(1.25)" }, { filter: "brightness(1)" }],
    { duration: 240, easing: "ease-out" }
  );
  setTimeout(() => setStatus(document.body.classList.contains("lockdown") ? "LOCKDOWN" : "ONLINE"), 420);
}

if (scanBtn) scanBtn.addEventListener("click", flashScan);

if (lockBtn) {
  lockBtn.addEventListener("click", () => {
    document.body.classList.toggle("lockdown");
    setStatus(document.body.classList.contains("lockdown") ? "LOCKDOWN" : "ONLINE");
  });
}

/* -----------------------
   7) TERMINAL
------------------------ */
const termBody = $("#termBody");
const termInput = $("#termInput");
const termState = $("#termState");

function setTermState(s) {
  if (termState) termState.textContent = s;
}

function line(txt, cls = "line") {
  if (!termBody) return;
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = txt;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

function bootTerminal() {
  line("SATCORP BLACKSITE TERMINAL :: RELAY-09", "line ok");
  line("logging enabled • unauthorized access triggers containment", "line dim");
  line("type 'help' for commands", "line dim");
  line("—", "line dim");
}
bootTerminal();

function runCommand(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;

  line(`> ${raw}`, "line");

  if (cmd === "help") {
    line("help      • show commands", "line dim");
    line("scan      • run scan flash", "line dim");
    line("status    • report status", "line dim");
    line("lockdown  • toggle lockdown mode", "line dim");
    line("clear     • reset terminal", "line dim");
    return;
  }

  if (cmd === "clear") {
    if (termBody) termBody.innerHTML = "";
    bootTerminal();
    return;
  }

  if (cmd === "scan") {
    setTermState("SCANNING");
    line("running scan…", "line dim");
    flashScan();
    setTimeout(() => {
      line("scan complete • anomalies: 0", "line ok");
      setTermState("READY");
    }, 520);
    return;
  }

  if (cmd === "status") {
    line("uplink: stable", "line ok");
    line("integrity: high", "line ok");
    line("latency: nominal", "line ok");
    line(`mode: ${document.body.classList.contains("lockdown") ? "LOCKDOWN" : "NORMAL"}`, "line dim");
    return;
  }

  if (cmd === "lockdown") {
    lockBtn?.click();
    line(document.body.classList.contains("lockdown") ? "lockdown enabled" : "lockdown disabled", "line warn");
    return;
  }

  line("unknown command. type 'help'.", "line bad");
}

if (termInput) {
  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(termInput.value);
      termInput.value = "";
    }
  });
}

/* -----------------------
   8) CONTACT TRANSMIT
------------------------ */
const sendBtn = $("#sendBtn");
const txStatus = $("#txStatus");
if (sendBtn && txStatus) {
  sendBtn.addEventListener("click", () => {
    txStatus.textContent = "TRANSMITTING…";
    txStatus.style.color = "rgba(93,255,138,.95)";
    sendBtn.disabled = true;

    setTimeout(() => {
      txStatus.textContent = "SENT // ACK RECEIVED";
      txStatus.style.color = "rgba(255,204,102,.95)";
      sendBtn.disabled = false;
    }, 900);
  });
}

/* -----------------------
   9) YEAR
------------------------ */
const y = $("#year");
if (y) y.textContent = String(new Date().getFullYear());