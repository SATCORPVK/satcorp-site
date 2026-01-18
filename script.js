// Tactical Ops Interface — canvas radar + contacts + impact particles + parallax silhouettes
(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: false });

  const ui = {
    spawnBtn: document.getElementById("spawnBtn"),
    clearBtn: document.getElementById("clearBtn"),
    nightVision: document.getElementById("nightVision"),
    audio: document.getElementById("audio"),
    threat: document.getElementById("threat"),
    threatVal: document.getElementById("threatVal"),
    range: document.getElementById("range"),
    rangeVal: document.getElementById("rangeVal"),
    readout: document.getElementById("readout"),
    clock: document.getElementById("clock"),
    connDot: document.getElementById("connDot"),
    connLabel: document.getElementById("connLabel"),
    footerLeft: document.getElementById("footerLeft"),
    footerRight: document.getElementById("footerRight"),
  };

  // --- sizing ---
  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    state.dpr = dpr;
  }
  window.addEventListener("resize", resize);

  // --- state ---
  const state = {
    dpr: 1,
    t: 0,
    mx: 0.5,
    my: 0.5,
    pulse: 0,
    threat: +ui.threat.value,
    radarRange: +ui.range.value,
    night: ui.nightVision.checked,
    audio: ui.audio.checked,
    contacts: [],
    particles: [],
    sparks: [],
    log: [],
    conn: 0, // 0 standby, 1 linked
  };

  // --- helpers ---
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nowTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  function pushLog(line) {
    state.log.unshift(`${nowTime()}  ${line}`);
    state.log = state.log.slice(0, 14);
    ui.readout.textContent = state.log.join("\n");
  }

  // --- audio (optional) ---
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  function beep(freq = 880, dur = 0.05, type = "sine", gain = 0.04) {
    if (!state.audio) return;
    ensureAudio();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // --- contacts ---
  function spawnContacts(n = 8) {
    const w = canvas.width, h = canvas.height;
    const cx = w * 0.5, cy = h * 0.54;

    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2);
      const r = rand(0.12, 0.48) * Math.min(w, h);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      state.contacts.push({
        id: Math.random().toString(16).slice(2, 7).toUpperCase(),
        x, y,
        vx: rand(-0.25, 0.25),
        vy: rand(-0.20, 0.20),
        sig: rand(0.4, 1.0), // signal strength
        age: rand(0, 2.0),
        flagged: Math.random() < (0.15 + state.threat * 0.03)
      });
    }
    pushLog(`CONTACTS DEPLOYED: +${n}`);
    beep(1040, 0.05, "square", 0.03);
  }

  function clearAll() {
    state.contacts.length = 0;
    state.particles.length = 0;
    state.sparks.length = 0;
    pushLog("SYSTEM CLEARED");
    beep(240, 0.06, "sawtooth", 0.03);
  }

  // --- impact burst ---
  function impact(x, y, power = 1) {
    const w = canvas.width, h = canvas.height;
    x = clamp(x, 0, w);
    y = clamp(y, 0, h);

    // shock ring particle
    state.particles.push({
      kind: "ring",
      x, y,
      r: 0,
      vr: rand(10, 18) * state.dpr * (0.9 + power * 0.4),
      life: 0,
      max: rand(0.7, 1.1)
    });

    // sparks
    const count = Math.floor(rand(36, 60) * (0.7 + power * 0.5));
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(2.0, 8.5) * state.dpr * (0.8 + power * 0.5);
      state.sparks.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: rand(0.35, 0.8),
        drag: rand(0.975, 0.992),
      });
    }

    // camera pulse
    state.pulse = 1.0;

    pushLog(`IMPACT @ X:${Math.floor(x/state.dpr)} Y:${Math.floor(y/state.dpr)} • BURST`);
    beep(rand(520, 820), 0.04, "triangle", 0.04);
    beep(rand(120, 220), 0.06, "sine", 0.03);
  }

  // --- input ---
  window.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    state.mx = (e.clientX - r.left) / r.width;
    state.my = (e.clientY - r.top) / r.height;
  });

  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (!t) return;
    const r = canvas.getBoundingClientRect();
    state.mx = (t.clientX - r.left) / r.width;
    state.my = (t.clientY - r.top) / r.height;
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * canvas.width;
    const y = (e.clientY - r.top) / r.height * canvas.height;
    impact(x, y, clamp(state.threat / 8, 0.6, 1.5));
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "KeyR") {
      clearAll();
      spawnContacts(Math.floor(rand(6, 14)));
      pushLog("RANDOMIZE COMPLETE");
    }
    if (e.code === "Space") {
      state.pulse = 1.2;
      pushLog("SWEEP PULSE TRIGGERED");
      beep(980, 0.05, "square", 0.03);
    }
  });

  // --- UI events ---
  ui.spawnBtn.addEventListener("click", () => spawnContacts(Math.floor(rand(6, 12))));
  ui.clearBtn.addEventListener("click", clearAll);

  ui.nightVision.addEventListener("change", () => {
    state.night = ui.nightVision.checked;
    pushLog(state.night ? "NIGHT VISION: ON" : "NIGHT VISION: OFF");
    beep(state.night ? 980 : 420, 0.05, "sine", 0.03);
  });

  ui.audio.addEventListener("change", async () => {
    state.audio = ui.audio.checked;
    if (state.audio) {
      try {
        ensureAudio();
        if (audioCtx.state === "suspended") await audioCtx.resume();
        pushLog("AUDIO: ARMED");
        beep(880, 0.05, "sine", 0.035);
      } catch {
        state.audio = false;
        ui.audio.checked = false;
        pushLog("AUDIO: BLOCKED BY BROWSER");
      }
    } else {
      pushLog("AUDIO: OFF");
    }
  });

  ui.threat.addEventListener("input", () => {
    state.threat = +ui.threat.value;
    ui.threatVal.textContent = String(state.threat);
  });

  ui.range.addEventListener("input", () => {
    state.radarRange = +ui.range.value;
    ui.rangeVal.textContent = String(state.radarRange);
  });

  // --- drawing primitives ---
  function bgFill() {
    // base
    ctx.fillStyle = state.night ? "#050607" : "#070a0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGrid(cx, cy, spacing) {
    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.strokeStyle = "rgba(70,255,160,0.08)";
    ctx.lineWidth = 1 * state.dpr;

    // vertical / horizontal lines
    for (let x = (cx % spacing); x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = (cy % spacing); y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRadar(cx, cy, radius, sweepA, intensity) {
    // rings
    ctx.save();
    ctx.lineWidth = 1 * state.dpr;
    for (let i = 1; i <= 5; i++) {
      const r = radius * (i / 5);
      ctx.strokeStyle = `rgba(120,255,185,${0.05 + i * 0.015})`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // crosshair
    ctx.strokeStyle = "rgba(120,255,185,0.12)";
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // sweep wedge (fake glow)
    const wedge = 0.35;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(120,255,185,${0.18 * intensity})`);
    grad.addColorStop(1, "rgba(120,255,185,0)");
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepA - wedge, sweepA + 0.05);
    ctx.closePath();
    ctx.fill();

    // sweep line
    ctx.strokeStyle = `rgba(140,255,210,${0.35 * intensity})`;
    ctx.lineWidth = 2 * state.dpr;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepA) * radius, cy + Math.sin(sweepA) * radius);
    ctx.stroke();
    ctx.restore();
  }

  function drawSilhouetteLayer(px, py) {
    // simple soldier-ish shapes using paths; parallax for "depth"
    const w = canvas.width, h = canvas.height;
    const baseY = h * 0.78;
    const shiftX = (px - 0.5) * 60 * state.dpr;
    const shiftY = (py - 0.5) * 18 * state.dpr;

    function soldier(x, scale, alpha) {
      ctx.save();
      ctx.translate(x + shiftX, baseY + shiftY);
      ctx.scale(scale, scale);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      // body
      ctx.beginPath();
      ctx.roundRect(-22, -90, 44, 70, 10);
      ctx.fill();
      // head
      ctx.beginPath();
      ctx.arc(0, -104, 14, 0, Math.PI * 2);
      ctx.fill();
      // helmet brim
      ctx.fillStyle = "rgba(0,0,0,0.78)";
      ctx.beginPath();
      ctx.roundRect(-18, -118, 36, 18, 8);
      ctx.fill();
      // rifle
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.beginPath();
      ctx.roundRect(12, -74, 62, 10, 6);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(64, -78, 10, 18, 6);
      ctx.fill();
      // legs
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.beginPath();
      ctx.roundRect(-18, -22, 16, 36, 8);
      ctx.roundRect(2, -22, 16, 36, 8);
      ctx.fill();

      ctx.restore();
    }

    soldier(w * 0.22, 1.05 * state.dpr, 0.55);
    soldier(w * 0.52, 1.25 * state.dpr, 0.65);
    soldier(w * 0.82, 1.00 * state.dpr, 0.50);

    // haze band
    ctx.save();
    ctx.globalAlpha = 0.22;
    const g = ctx.createLinearGradient(0, baseY - 140 * state.dpr, 0, baseY + 140 * state.dpr);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, baseY - 200 * state.dpr, w, 400 * state.dpr);
    ctx.restore();
  }

  function drawContacts(cx, cy, sweepA, radius) {
    // contacts brighten when sweep passes near them
    const sweepVec = { x: Math.cos(sweepA), y: Math.sin(sweepA) };

    for (const c of state.contacts) {
      const dx = c.x - cx;
      const dy = c.y - cy;
      const dist = Math.hypot(dx, dy);

      // keep within radar range-ish
      if (dist > radius) continue;

      // alignment between sweep and contact angle
      const ndx = dx / (dist || 1);
      const ndy = dy / (dist || 1);
      const align = ndx * sweepVec.x + ndy * sweepVec.y; // [-1..1]
      const near = clamp((align - 0.86) / 0.14, 0, 1); // bright close to sweep head
      const sig = c.sig * (0.35 + near * 1.1);

      // blip
      ctx.save();
      const baseA = 0.12 + sig * 0.55;
      ctx.globalAlpha = baseA;

      const size = (2.2 + sig * 3.2) * state.dpr;
      ctx.fillStyle = c.flagged ? `rgba(255,90,90,${0.65 + near * 0.35})` : `rgba(120,255,185,${0.55 + near * 0.35})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, size, 0, Math.PI * 2);
      ctx.fill();

      // shimmer ring
      if (near > 0.35) {
        ctx.strokeStyle = c.flagged ? "rgba(255,90,90,0.35)" : "rgba(140,255,210,0.28)";
        ctx.lineWidth = 1 * state.dpr;
        ctx.beginPath();
        ctx.arc(c.x, c.y, size * (2.2 + near * 1.5), 0, Math.PI * 2);
        ctx.stroke();
      }

      // label when strong
      if (near > 0.55) {
        ctx.globalAlpha = 0.75;
        ctx.font = `${11 * state.dpr}px ui-monospace, Menlo, Consolas, monospace`;
        ctx.fillStyle = "rgba(190,255,235,0.8)";
        ctx.fillText(`${c.id}`, c.x + 8 * state.dpr, c.y - 10 * state.dpr);
      }

      ctx.restore();
    }
  }

  function stepSim(dt) {
    const w = canvas.width, h = canvas.height;
    const cx = w * 0.5, cy = h * 0.54;

    // contacts drift
    for (const c of state.contacts) {
      c.age += dt;
      const speed = 0.55 + state.threat * 0.08;
      c.x += c.vx * speed * dt * 60 * state.dpr;
      c.y += c.vy * speed * dt * 60 * state.dpr;

      // mild wander
      c.vx += rand(-0.01, 0.01) * dt * 60;
      c.vy += rand(-0.01, 0.01) * dt * 60;
      c.vx = clamp(c.vx, -0.6, 0.6);
      c.vy = clamp(c.vy, -0.6, 0.6);

      // keep in bounds with soft bounce
      if (c.x < 0 || c.x > w) c.vx *= -1;
      if (c.y < 0 || c.y > h) c.vy *= -1;

      c.x = clamp(c.x, 0, w);
      c.y = clamp(c.y, 0, h);
    }

    // ring particles
    for (const p of state.particles) {
      p.life += dt;
      if (p.kind === "ring") {
        p.r += p.vr * dt * 60;
      }
    }
    state.particles = state.particles.filter(p => p.life < p.max);

    // sparks
    for (const s of state.sparks) {
      s.life += dt;
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      s.vx *= s.drag;
      s.vy *= s.drag;
      s.vy += 0.06 * state.dpr; // slight fall
    }
    state.sparks = state.sparks.filter(s => s.life < s.max);

    // pulse decay
    state.pulse = Math.max(0, state.pulse - dt * 1.2);
  }

  function drawParticles() {
    // rings
    for (const p of state.particles) {
      const a = 1 - (p.life / p.max);
      ctx.save();
      ctx.globalAlpha = 0.55 * a;
      ctx.lineWidth = 2.5 * state.dpr;
      ctx.strokeStyle = "rgba(140,255,210,0.55)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.22 * a;
      ctx.lineWidth = 10 * state.dpr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // sparks
    for (const s of state.sparks) {
      const a = 1 - (s.life / s.max);
      ctx.save();
      ctx.globalAlpha = 0.8 * a;
      ctx.strokeStyle = "rgba(255,190,120,0.85)";
      ctx.lineWidth = 1.6 * state.dpr;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.6, s.y - s.vy * 0.6);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawVignette() {
    const w = canvas.width, h = canvas.height;
    ctx.save();
    const g = ctx.createRadialGradient(w*0.5, h*0.55, Math.min(w,h)*0.12, w*0.5, h*0.55, Math.min(w,h)*0.85);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();
  }

  // --- main loop ---
  let last = performance.now();
  function frame(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    state.t += dt;

    // UI clock / link status
    ui.clock.textContent = nowTime();
    if (state.contacts.length > 0 && state.conn === 0) {
      state.conn = 1;
      ui.connDot.style.background = "rgba(120,255,185,.95)";
      ui.connDot.style.boxShadow = "0 0 14px rgba(120,255,185,.35)";
      ui.connLabel.textContent = "LINK: ACTIVE";
      pushLog("LINK ESTABLISHED");
      beep(920, 0.05, "sine", 0.03);
    }
    if (state.contacts.length === 0 && state.conn === 1) {
      state.conn = 0;
      ui.connDot.style.background = "rgba(255,220,120,.9)";
      ui.connDot.style.boxShadow = "0 0 14px rgba(255,220,120,.35)";
      ui.connLabel.textContent = "LINK: STANDBY";
      pushLog("LINK STANDBY");
    }

    ui.threatVal.textContent = String(state.threat);
    ui.rangeVal.textContent = String(state.radarRange);

    stepSim(dt);

    const w = canvas.width, h = canvas.height;
    const cx = w * 0.5, cy = h * 0.54;

    // parallax offset for grid
    const px = state.mx, py = state.my;
    const offx = (px - 0.5) * 18 * state.dpr;
    const offy = (py - 0.5) * 12 * state.dpr;

    const radius = Math.min(w, h) * (state.radarRange / 200);
    const sweepSpeed = 0.85 + state.threat * 0.08;
    const sweepA = state.t * sweepSpeed;

    bgFill();

    // subtle background glow pulse
    if (state.pulse > 0) {
      ctx.save();
      ctx.globalAlpha = 0.18 * state.pulse;
      ctx.fillStyle = "rgba(120,255,185,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    drawGrid(offx, offy, 38 * state.dpr);

    // silhouettes behind radar to feel "real"
    drawSilhouetteLayer(px, py);

    // radar centered + sweep
    const intensity = clamp(0.7 + state.pulse * 0.55, 0.7, 1.4);
    drawRadar(cx, cy, radius, sweepA, intensity);

    // contacts & impact particles
    drawContacts(cx, cy, sweepA, radius);
    drawParticles();

    // subtle HUD tint (night vision)
    if (state.night) {
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = "rgba(120,255,185,0.55)";
      ctx.fillRect(0,0,w,h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "rgba(120,190,255,0.55)";
      ctx.fillRect(0,0,w,h);
      ctx.restore();
    }

    drawVignette();

    // footer info
    ui.footerLeft.textContent = `SECTOR A9 • CONTACTS: ${state.contacts.length} • THREAT: ${state.threat}`;
    ui.footerRight.textContent = state.contacts.length ? "CLICK: IMPACT • R: RANDOMIZE • SPACE: PULSE" : "SPAWN CONTACTS TO BEGIN";

    requestAnimationFrame(frame);
  }

  // --- boot ---
  resize();
  pushLog("SYSTEM BOOT");
  pushLog("HUD ONLINE");
  pushLog("AWAITING CONTACTS…");
  spawnContacts(10); // start hot
  requestAnimationFrame(frame);
})();
