// SΛTCORP // Blacksite Depth (no libraries)

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

/* -----------------------
   CLOCK + STATUS
------------------------ */
const statusText = $("#statusText");
const clockEl = $("#clock");

function setStatus(t){ if(statusText) statusText.textContent = t; }

function updateClock(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  if(clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 250);
updateClock();

setStatus("SYNC");
setTimeout(()=>setStatus("AUTH OK"), 520);
setTimeout(()=>setStatus("ONLINE"), 1100);

/* -----------------------
   BACKGROUND PARALLAX
------------------------ */
const bg = document.querySelector(".bg");
const l0 = document.querySelector(".l0");
const l1 = document.querySelector(".l1");
const l2 = document.querySelector(".l2");
const beam = document.querySelector(".scanBeam");

let mx=0, my=0, tx=0, ty=0;
window.addEventListener("mousemove", (e)=>{
  const cx = window.innerWidth/2;
  const cy = window.innerHeight/2;
  mx = (e.clientX - cx)/cx;
  my = (e.clientY - cy)/cy;
});

function parallax(){
  tx += (mx - tx)*0.06;
  ty += (my - ty)*0.06;

  if(l0) l0.style.transform = `translate(${tx*6}px, ${ty*6}px)`;
  if(l1) l1.style.transform = `perspective(800px) rotateX(60deg) translateY(18%) translate(${tx*10}px, ${ty*8}px)`;
  if(l2) l2.style.transform = `translate(${tx*14}px, ${ty*14}px)`;

  requestAnimationFrame(parallax);
}
parallax();

/* scanning beam drift */
let b = -60;
function beamLoop(){
  b += 0.08;
  if (b > 120) b = -60;
  if (beam) beam.style.transform = `translateX(${b}%) skewX(-20deg)`;
  requestAnimationFrame(beamLoop);
}
beamLoop();

/* -----------------------
   COUNTERS
------------------------ */
function animateCount(el, to, ms=900){
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t-t0)/ms);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = String(Math.round(to*eased));
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
$$("[data-count]").forEach(el=>{
  const to = Number(el.getAttribute("data-count"));
  if(Number.isFinite(to)) animateCount(el, to, 950);
});

/* -----------------------
   TELEMETRY
------------------------ */
const uplink = $("#uplink");
const integrity = $("#integrity");
const latency = $("#latency");

const uplinkVal = $("#uplinkVal");
const integrityVal = $("#integrityVal");
const latencyVal = $("#latencyVal");

function setBar(el, pct){ if(el) el.style.width = `${pct}%`; }

let t = 0;
function telemetryLoop(){
  t += 0.02;
  const up = Math.round(78 + Math.sin(t)*12);
  const ok = Math.round(94 + Math.cos(t*0.8)*4);
  const lat = Math.round(12 + (Math.sin(t*1.4)+1)*8);

  setBar(uplink, up);
  setBar(integrity, ok);
  setBar(latency, Math.min(100, lat*4));

  if(uplinkVal) uplinkVal.textContent = `${up}%`;
  if(integrityVal) integrityVal.textContent = `${ok}%`;
  if(latencyVal) latencyVal.textContent = `${lat}ms`;

  requestAnimationFrame(telemetryLoop);
}
telemetryLoop();

/* -----------------------
   SCAN + ALERT
------------------------ */
const scanBtn = $("#scanBtn");
const alertBtn = $("#alertBtn");

function flashScan(){
  setStatus("SCANNING");
  document.body.animate(
    [{filter:"brightness(1)"},{filter:"brightness(1.22)"},{filter:"brightness(1)"}],
    {duration:260, easing:"ease-out"}
  );
  setTimeout(()=>setStatus(document.body.classList.contains("alert") ? "ALERT" : "ONLINE"), 460);
}
if(scanBtn) scanBtn.addEventListener("click", flashScan);

if(alertBtn){
  alertBtn.addEventListener("click", ()=>{
    document.body.classList.toggle("alert");
    setStatus(document.body.classList.contains("alert") ? "ALERT" : "ONLINE");
  });
}

/* -----------------------
   REVEALS
------------------------ */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("on");
  });
},{threshold:0.18});
$$(".reveal").forEach(el=>io.observe(el));

/* -----------------------
   3D TILT CARDS
------------------------ */
function tiltify(card){
  const max = 9;
  card.addEventListener("mousemove", (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * max;
    const ry = (x - 0.5) * max;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  });
  card.addEventListener("mouseleave", ()=>{
    card.style.transform = "";
  });
}
$$(".tilt").forEach(tiltify);

/* -----------------------
   TERMINAL
------------------------ */
const termBody = $("#termBody");
const termInput = $("#termInput");
const termState = $("#termState");

function setTermState(s){ if(termState) termState.textContent = s; }

function line(txt, cls="line"){
  if(!termBody) return;
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = txt;
  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;
}

function boot(){
  line("SATCORP BLACKSITE DEPTH :: RELAY-09", "ok");
  line("depth grid online • trace active • logging enabled", "dim");
  line("type 'help' for commands", "dim");
  line("—", "dim");
}
boot();

function runCommand(raw){
  const cmd = raw.trim().toLowerCase();
  if(!cmd) return;

  line(`> ${raw}`, "line");

  if(cmd==="help"){
    line("help  • show commands", "dim");
    line("scan  • pulse scan", "dim");
    line("status• system report", "dim");
    line("alert • toggle alert mode", "dim");
    line("clear • reset terminal", "dim");
    return;
  }
  if(cmd==="clear"){
    termBody.innerHTML = "";
    boot();
    return;
  }
  if(cmd==="scan"){
    setTermState("SCANNING");
    line("running scan…", "dim");
    flashScan();
    setTimeout(()=>{
      line("scan complete • anomalies: 0", "ok");
      setTermState("READY");
    }, 520);
    return;
  }
  if(cmd==="status"){
    line("uplink: stable", "ok");
    line("integrity: high", "ok");
    line("latency: nominal", "ok");
    line(`mode: ${document.body.classList.contains("alert") ? "ALERT" : "NORMAL"}`, "dim");
    return;
  }
  if(cmd==="alert"){
    alertBtn?.click();
    line(document.body.classList.contains("alert") ? "alert enabled" : "alert disabled", "warn");
    return;
  }
  line("unknown command. type 'help'.", "bad");
}

if(termInput){
  termInput.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"){
      e.preventDefault();
      runCommand(termInput.value);
      termInput.value = "";
    }
  });
}

/* -----------------------
   TRANSMIT
------------------------ */
const sendBtn = $("#sendBtn");
const txStatus = $("#txStatus");
if(sendBtn && txStatus){
  sendBtn.addEventListener("click", ()=>{
    txStatus.textContent = "TRANSMITTING…";
    sendBtn.disabled = true;
    setTimeout(()=>{
      txStatus.textContent = "SENT // ACK RECEIVED";
      sendBtn.disabled = false;
    }, 900);
  });
}

/* YEAR */
const y = $("#year");
if(y) y.textContent = String(new Date().getFullYear());
