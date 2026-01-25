/* =========================================================
   SATCORP • Planetary Operations Interface
   script.js
   - Boot sequence (skippable)
   - System arming + readouts
   - Orbital layer selection
   - Terminal modal (Request Access)
   - Canvas "holo globe" (lightweight, no libs)
   ========================================================= */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const now = () => performance.now();

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // ---------- Elements ----------
  const boot = $("#boot");
  const bootFill = $("#bootFill");
  const bootStatus = $("#bootStatus");
  const enterBtn = $("#enter");

  const armBtn = $("#armSystems");
  const netPill = $("#netPill");
  const nodesValue = $("#nodesValue");
  const latencyValue = $("#latencyValue");

  const healthChip = $("#healthChip");
  const telemetryChip = $("#telemetryChip");

  const layerTitle = $("#layerTitle");
  const layerStatus = $("#layerStatus");
  const layerMetric = $("#layerMetric");
  const layerDesc = $("#layerDesc");

  const accessModal = $("#accessModal");
  const openAccess = $("#openAccess");
  const openAccess2 = $("#openAccess2");
  const terminalLog = $("#terminalLog");
  const accessForm = $("#accessForm");
  const accessInput = $("#accessInput");

  const globe = $("#globe");

  // ---------- State ----------
  let systemsArmed = false;
  let activeLayer = "idle";
  let bootDone = false;

  const LAYERS = {
    infrastructure: {
      title: "INFRASTRUCTURE",
      status: "STATUS: ONLINE",
      metric: "METRIC: MULTI-REGION",
      desc:
        "Edge-first architecture with resilience doctrine. Hard limits stay hard. Failover stays clean."
    },
    automation: {
      title: "AUTOMATION",
      status: "STATUS: ARMED",
      metric: "METRIC: EVENT-DRIVEN",
      desc:
        "Webhook canon, retry rules, and ops-safe execution layers. Automation that never surprises operators."
    },
    intelligence: {
      title: "INTELLIGENCE",
      status: "STATUS: PASSIVE",
      metric: "METRIC: OBSERVABILITY",
      desc:
        "Telemetry, audit trails, and operator-grade readouts. Quiet signal extraction with structured truth."
    },
    deployments: {
      title: "DEPLOYMENTS",
      status: "STATUS: STABLE",
      metric: "METRIC: SSG + CACHE",
      desc:
        "Structured deployment cadence. Render checklists, cache keys, and migration-safe growth paths."
    },
    contact: {
      title: "CONTACT",
      status: "STATUS: GATED",
      metric: "METRIC: ACCESS NODE",
      desc:
        "Request access through the terminal. Entry is granted, not sold."
    }
  };

  // ---------- Boot Sequence ----------
  const bootLines = [
    "NETWORK: STANDBY",
    "NETWORK: SYNCHRONIZING",
    "ORBITAL NODES: ONLINE",
    "AI COORDINATION: ACTIVE",
    "INTERFACE: ARMED"
  ];

  function hideBoot() {
    if (!boot || bootDone) return;
    bootDone = true;
    boot.setAttribute("aria-hidden", "true");
    boot.style.display = "none";
  }

  function runBootSequence() {
    if (!boot || reduceMotion) {
      // Reduced motion: no boot delay
      bootFill && (bootFill.style.width = "100%");
      bootStatus && (bootStatus.textContent = "INTERFACE: READY");
      hideBoot();
      return;
    }

    let p = 0;
    let lineIndex = 0;

    const tick = () => {
      if (bootDone) return;
      p = clamp(p + rand(6, 14), 0, 100);
      if (bootFill) bootFill.style.width = `${p}%`;

      // Update status at checkpoints
      const checkpoint = Math.floor((p / 100) * (bootLines.length - 1));
      if (checkpoint !== lineIndex) {
        lineIndex = checkpoint;
        if (bootStatus) bootStatus.textContent = bootLines[lineIndex];
      }

      if (p >= 100) {
        if (bootStatus) bootStatus.textContent = "INTERFACE: READY";
        // Small cinematic pause
        setTimeout(hideBoot, 450);
        return;
      }
      setTimeout(tick, rand(140, 220));
    };

    tick();
  }

  // Skip with Esc
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideBoot();
      closeModal();
    }
  });

  enterBtn?.addEventListener("click", hideBoot);

  // ---------- System Arming + Readouts ----------
  function setPill(el, text, ok = false) {
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("pill--ok", ok);
  }

  function armSystems() {
    systemsArmed = true;

    setPill(netPill, "ONLINE", true);
    nodesValue && (nodesValue.textContent = `${Math.floor(rand(42, 88))} / 96`);
    latencyValue && (latencyValue.textContent = `${Math.floor(rand(7, 18))}ms`);

    healthChip && (healthChip.textContent = "ONLINE");
    telemetryChip && (telemetryChip.textContent = "ACTIVE");

    // Subtle "live" jitter updates
    if (!reduceMotion) {
      const pulse = () => {
        if (!systemsArmed) return;
        nodesValue && (nodesValue.textContent = `${Math.floor(rand(58, 92))} / 96`);
        latencyValue && (latencyValue.textContent = `${Math.floor(rand(6, 22))}ms`);
        setTimeout(pulse, rand(900, 1500));
      };
      pulse();
    }
  }

  armBtn?.addEventListener("click", () => {
    if (!systemsArmed) {
      armSystems();
      // Auto-select a default layer after arming
      setLayer("infrastructure");
    } else {
      // If already armed, cycle layers quickly (fun)
      const keys = Object.keys(LAYERS);
      const idx = keys.indexOf(activeLayer);
      setLayer(keys[(idx + 1) % keys.length]);
    }
  });

  // ---------- Orbital Layer Selection ----------
  function setLayer(key) {
    const layer = LAYERS[key];
    if (!layer) return;

    activeLayer = key;

    if (layerTitle) layerTitle.textContent = `SYSTEM LAYER: ${layer.title}`;
    if (layerStatus) layerStatus.textContent = layer.status;
    if (layerMetric) layerMetric.textContent = layer.metric;
    if (layerDesc) layerDesc.textContent = layer.desc;

    // If contact layer, open terminal (but only if systems are armed)
    if (key === "contact" && systemsArmed) {
      openModal();
    }

    // nudge globe visuals
    globeFX.setEmphasis(key);
  }

  $$(".seg").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-layer");
      if (!systemsArmed) armSystems();
      setLayer(key);
    });
  });

  // Initialize to idle
  if (layerTitle) layerTitle.textContent = "SYSTEM LAYER: IDLE";

  // ---------- Modal / Terminal ----------
  function openModal() {
    if (!accessModal) return;
    accessModal.setAttribute("aria-hidden", "false");
    accessModal.classList.add("isOpen");
    // Focus input
    setTimeout(() => accessInput?.focus(), 0);
  }

  function closeModal() {
    if (!accessModal) return;
    accessModal.setAttribute("aria-hidden", "true");
    accessModal.classList.remove("isOpen");
  }

  openAccess?.addEventListener("click", openModal);
  openAccess2?.addEventListener("click", openModal);

  accessModal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeModal();
  });

  function pushTerminal(line) {
    if (!terminalLog) return;
    const div = document.createElement("div");
    div.className = "tLine";
    div.textContent = line;
    terminalLog.appendChild(div);
    terminalLog.scrollTop = terminalLog.scrollHeight;
  }

  accessForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (accessInput?.value || "").trim();
    if (!val) return;

    pushTerminal(`> ${val.toUpperCase()}`);
    pushTerminal("TRANSMISSION QUEUED…");
    pushTerminal("NOTE: DEMO MODE • NO OUTBOUND ROUTE");

    accessInput.value = "";

    if (!reduceMotion) {
      // Fake "verification"
      setTimeout(() => pushTerminal("VERIFICATION: PENDING"), 450);
      setTimeout(() => pushTerminal("ACCESS GATE: AWAITING OPERATOR"), 900);
    } else {
      pushTerminal("VERIFICATION: PENDING");
      pushTerminal("ACCESS GATE: AWAITING OPERATOR");
    }
  });

  // ---------- Canvas Holographic Globe ----------
  // Lightweight: no 3D libs, but feels alive.
  // Draws: star glow ring, grid sphere, node points, orbit arcs, scanning sweep.

  const globeFX = (() => {
    if (!globe) return { start() {}, setEmphasis() {} };

    const ctx = globe.getContext("2d", { alpha: true });

    let w = globe.width;
    let h = globe.height;
    let cx = w / 2;
    let cy = h / 2;

    // Visual parameters
    const sphereR = Math.min(w, h) * 0.34;
    const ringR = sphereR * 1.25;

    let t0 = now();
    let raf = null;

    // Node field (points on a sphere)
    const nodes = Array.from({ length: 170 }, () => {
      // spherical coordinates
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      return {
        theta,
        phi,
        twinkle: rand(0.2, 1),
        phase: rand(0, Math.PI * 2)
      };
    });

    // Emphasis per layer (changes sweep speed / density)
    let sweepSpeed = 0.55;
    let gridDensity = 14; // meridians/parallels count
    let nodeBoost = 1.0;

    function setEmphasis(layer) {
      switch (layer) {
        case "infrastructure":
          sweepSpeed = 0.45;
          gridDensity = 16;
          nodeBoost = 1.05;
          break;
        case "automation":
          sweepSpeed = 0.75;
          gridDensity = 14;
          nodeBoost = 1.15;
          break;
        case "intelligence":
          sweepSpeed = 0.60;
          gridDensity = 18;
          nodeBoost = 1.25;
          break;
        case "deployments":
          sweepSpeed = 0.50;
          gridDensity = 12;
          nodeBoost = 1.08;
          break;
        case "contact":
          sweepSpeed = 0.85;
          gridDensity = 10;
          nodeBoost = 1.2;
          break;
        default:
          sweepSpeed = 0.55;
          gridDensity = 14;
          nodeBoost = 1.0;
      }
    }

    function resizeToDevice() {
      // Match CSS size to sharp canvas
      const rect = globe.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      globe.width = Math.floor(rect.width * dpr);
      globe.height = Math.floor(rect.height * dpr);

      w = globe.width;
      h = globe.height;
      cx = w / 2;
      cy = h / 2;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(1, 1);

      // Recompute sphere radius from size
      // (We keep it relative; drawing uses these recalculated values)
    }

    function clear() {
      ctx.clearRect(0, 0, w, h);
    }

    function glowCircle(r, alpha) {
      // Outer glow
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(79, 209, 255, 0.35)";
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.shadowColor = "rgba(79, 209, 255, 0.55)";
      ctx.shadowBlur = Math.max(12, w * 0.03);
      ctx.stroke();
      ctx.restore();
    }

    function drawRing(angle, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const r = Math.min(w, h) * 0.42;
      ctx.ellipse(0, 0, r, r * 0.52, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(122, 228, 255, 0.28)";
      ctx.lineWidth = Math.max(1, w * 0.002);
      ctx.shadowColor = "rgba(79, 209, 255, 0.25)";
      ctx.shadowBlur = Math.max(8, w * 0.02);
      ctx.stroke();
      ctx.restore();
    }

    function project(theta, phi, rotY, rotX) {
      // Unit sphere point
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      // Rotate around Y (spin) and X (tilt)
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective-ish projection
      const depth = 1.6; // larger = flatter
      const scale = 1 / (depth - z2);
      return { x: x1 * scale, y: y2 * scale, z: z2 };
    }

    function drawGrid(rotY, rotX) {
      ctx.save();
      ctx.translate(cx, cy);

      ctx.strokeStyle = "rgba(79, 209, 255, 0.13)";
      ctx.lineWidth = Math.max(1, w * 0.0015);
      ctx.shadowColor = "rgba(79, 209, 255, 0.18)";
      ctx.shadowBlur = Math.max(4, w * 0.01);

      const r = Math.min(w, h) * 0.34;

      // Meridians
      for (let i = 0; i < gridDensity; i++) {
        const mer = (i / gridDensity) * Math.PI * 2;
        ctx.beginPath();

        for (let s = 0; s <= 120; s++) {
          const phi = (s / 120) * Math.PI;
          const p = project(mer, phi, rotY, rotX);
          const px = p.x * r;
          const py = p.y * r;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Parallels
      for (let j = 1; j < gridDensity; j++) {
        const phi = (j / gridDensity) * Math.PI;
        ctx.beginPath();

        for (let s = 0; s <= 180; s++) {
          const theta = (s / 180) * Math.PI * 2;
          const p = project(theta, phi, rotY, rotX);
          const px = p.x * r;
          const py = p.y * r;

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawNodes(rotY, rotX, time) {
      const r = Math.min(w, h) * 0.34;

      // Sort far to near (z)
      const projected = nodes.map((n) => {
        const p = project(n.theta, n.phi, rotY, rotX);
        return { ...n, ...p };
      }).sort((a, b) => a.z - b.z);

      for (const p of projected) {
        // Fade points on far side
        const front = clamp((p.z + 1) / 2, 0, 1); // approx
        const tw = (0.35 + 0.65 * Math.sin(time * 0.002 + p.phase) ** 2) * p.twinkle;
        const a = 0.10 + front * 0.55 * tw * nodeBoost;

        const px = cx + p.x * r;
        const py = cy + p.y * r;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(122, 228, 255, 1)";
        ctx.shadowColor = "rgba(79, 209, 255, 0.9)";
        ctx.shadowBlur = Math.max(6, w * 0.015);

        const size = Math.max(1.2, w * 0.0025) * (0.7 + front * 0.8);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawSweep(rotY, time) {
      // A scanning wedge that rotates around the sphere
      const r = Math.min(w, h) * 0.34;
      const angle = (time * 0.001 * sweepSpeed) % (Math.PI * 2);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.05);
      grad.addColorStop(0, "rgba(79, 209, 255, 0.00)");
      grad.addColorStop(0.6, "rgba(79, 209, 255, 0.06)");
      grad.addColorStop(1, "rgba(79, 209, 255, 0.00)");

      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * 1.02, -0.20, 0.20);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function drawBaseHalo(time) {
      // subtle halo + base ring glow
      const r = Math.min(w, h) * 0.34;
      const pulse = 0.12 + 0.10 * Math.sin(time * 0.0012);

      // inner aura
      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.05);
      grad.addColorStop(0, "rgba(79, 209, 255, 0.08)");
      grad.addColorStop(0.55, "rgba(79, 209, 255, 0.02)");
      grad.addColorStop(1, "rgba(79, 209, 255, 0.00)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      glowCircle(r * 1.02, 0.20 + pulse);
      glowCircle(r * 1.16, 0.08 + pulse * 0.6);
      drawRing(time * 0.00025, 0.30);
      drawRing(-time * 0.00018 + 1.1, 0.20);
    }

    function loop() {
      const time = now() - t0;

      clear();
      drawBaseHalo(time);

      // Rotation changes slightly once armed
      const spin = (systemsArmed ? 0.00025 : 0.00018) * time;
      const tilt = 0.65;

      drawGrid(spin, tilt);
      drawNodes(spin, tilt, time);
      if (!reduceMotion) drawSweep(spin, time);

      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (!ctx) return;
      // Set canvas size to match CSS for sharpness
      // If CSS controls size via width:100% max-width, we handle DPR.
      const onResize = () => resizeToDevice();
      window.addEventListener("resize", onResize);
      setTimeout(onResize, 0);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }

    return { start, setEmphasis };
  })();

  // ---------- Init ----------
  runBootSequence();
  globeFX.start();

  // Prime readouts with plausible defaults
  setPill(netPill, "STANDBY", false);
  nodesValue && (nodesValue.textContent = "—");
  latencyValue && (latencyValue.textContent = "—");

  // Auto-arm via query param (?arm=1)
  const params = new URLSearchParams(location.search);
  if (params.get("arm") === "1") {
    hideBoot();
    armSystems();
    setLayer("infrastructure");
  }

  // Small UX: clicking brand returns to top without hard jump
  $(".brand")?.addEventListener("click", (e) => {
    // Allow normal if user wants
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
