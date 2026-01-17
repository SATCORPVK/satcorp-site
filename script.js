// SATCORP // COMMAND BRIDGE
// Lightweight, no build tools.

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Clock + signal readout */
function pad2(n){ return String(n).padStart(2,"0"); }
function tickClock(){
  const d = new Date();
  const t = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const clock = $("#clock");
  if(clock) clock.textContent = t;
}
setInterval(tickClock, 1000);
tickClock();

function rand(min, max){ return Math.random() * (max - min) + min; }
function tickSignal(){
  const v = Math.round(rand(62, 99));
  const sig = $("#sig");
  if(sig) sig.textContent = `SIG: ${v}`;
}
setInterval(tickSignal, 1200);
tickSignal();

/* Event feed */
const FEED_LINES = [
  ["LINK", "VANTA DISABLED", "No external heavy FX required."],
  ["SYNC", "MODULES READY", "Panels and views online."],
  ["SCAN", "SPECTRUM OPEN", "Click bars to spike readings."],
  ["AUTH", "OPERATOR", "Local session accepted."],
  ["PING", "NODE VK-ORBIT", "Latency nominal."]
];

function pushFeed(line){
  const feed = $("#feed");
  if(!feed) return;

  const [tag, title, desc] = line;
  const item = document.createElement("div");
  item.className = "item";
  const time = new Date();
  const t = `${pad2(time.getHours())}:${pad2(time.getMinutes())}:${pad2(time.getSeconds())}`;

  item.innerHTML = `<div><b>${tag}</b> :: ${title}</div><div class="t">${t} — ${desc}</div>`;
  feed.prepend(item);

  // cap items
  const items = $$(".item", feed);
  if(items.length > 7) items.slice(7).forEach(n => n.remove());
}
FEED_LINES.forEach((l, i) => setTimeout(() => pushFeed(l), 250 + i * 250));

/* Views (sidebar navigation) */
function setActiveView(id){
  $$(".view").forEach(v => v.classList.remove("is-active"));
  const view = document.getElementById(id);
  if(view) view.classList.add("is-active");

  $$(".navlink").forEach(a => a.classList.toggle("active", a.getAttribute("data-view") === id));
  history.replaceState(null, "", `#${id}`);
}

$$(".navlink").forEach(a => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("data-view");
    if(id) setActiveView(id);
  });
});

/* Initialize view from hash */
const initial = (location.hash || "#overview").replace("#", "");
setActiveView(initial);

/* Buttons */
$("#btn-boot")?.addEventListener("click", () => {
  pushFeed(["DIAG", "RUNNING", "Verifying bridge subsystems…"]);
  setTimeout(() => pushFeed(["DIAG", "PASS", "All systems nominal."]), 650);
});

$("#btn-scan")?.addEventListener("click", () => {
  pushFeed(["SCAN", "INIT", "Sweeping frequencies…"]);
  spikeBars(0.85);
});

$("#btn-clear")?.addEventListener("click", () => {
  $("#contactForm")?.reset();
  const notice = $("#notice");
  if(notice) notice.textContent = "";
});

/* Spectrum bars */
const barsEl = $("#bars");
let locked = false;

function buildBars(){
  if(!barsEl) return;
  barsEl.innerHTML = "";
  for(let i=0;i<48;i++){
    const b = document.createElement("div");
    b.className = "bar";
    b.style.transform = `scaleY(${rand(0.15, 0.75).toFixed(2)})`;
    b.addEventListener("click", () => spikeOne(b));
    barsEl.appendChild(b);
  }
}
buildBars();

function animateBars(){
  if(!barsEl || locked) return;
  const bars = $$(".bar", barsEl);
  bars.forEach((b, i) => {
    const wave = 0.22 + Math.abs(Math.sin((Date.now()/600) + i/6)) * 0.7;
    const jitter = rand(-0.08, 0.08);
    const v = Math.max(0.12, Math.min(1.0, wave + jitter));
    b.style.transform = `scaleY(${v.toFixed(2)})`;
  });
  requestAnimationFrame(animateBars);
}
requestAnimationFrame(animateBars);

function spikeOne(bar){
  if(!bar) return;
  bar.style.transform = `scaleY(${rand(0.85, 1.0).toFixed(2)})`;
  pushFeed(["PULSE", "SPIKE", "Local amplitude surge detected."]);
}

function spikeBars(intensity = 0.8){
  if(!barsEl) return;
  const bars = $$(".bar", barsEl);
  bars.forEach((b) => {
    const v = rand(0.2, intensity);
    b.style.transform = `scaleY(${v.toFixed(2)})`;
  });
}

$("#btn-lock")?.addEventListener("click", () => {
  locked = !locked;
  const lockEl = $("#lock");
  if(lockEl) lockEl.textContent = locked ? "YES" : "NO";
  pushFeed(["LOCK", locked ? "ENGAGED" : "RELEASED", locked ? "Hold current readings." : "Resume live scan."]);
  if(!locked) requestAnimationFrame(animateBars);
});

/* Gain readout (cosmetic) */
let gain = 1.0;
setInterval(() => {
  gain = Math.max(0.8, Math.min(1.6, gain + rand(-0.08, 0.08)));
  const g = $("#gain");
  if(g) g.textContent = gain.toFixed(1);
}, 900);

/* Contact form (local confirmation) */
$("#contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const callsign = String(data.get("callsign") || "").trim();
  const channel = String(data.get("channel") || "").trim();

  const notice = $("#notice");
  if(notice){
    notice.textContent = `TRANSMISSION QUEUED :: ${callsign || "OPERATOR"} @ ${channel || "UNKNOWN"} — (local capture)`;
  }

  pushFeed(["TX", "QUEUED", "Transmission captured client-side."]);
  $("#statusBadge")?.setAttribute("style", "color: rgba(37,243,255,.9)");
});