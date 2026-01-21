/* =========
   Eternal Love in the Shadows — interactions
   ========= */

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Year
  $("#year").textContent = new Date().getFullYear();

  // -----------------------
  // Theme: Light of Dawn
  // -----------------------
  const themeToggle = $("#themeToggle");
  const themeToggle2 = $("#themeToggle2");

  const applyThemeUI = () => {
    const isDawn = document.body.classList.contains("is-dawn");
    themeToggle.setAttribute("aria-pressed", String(isDawn));
    themeToggle.querySelector(".pill__icon").textContent = isDawn ? "☼" : "☾";
    themeToggle.querySelector(".pill__label").textContent = isDawn ? "Dawn" : "Night";
  };

  const setTheme = (mode) => {
    // mode: "dawn" | "night"
    document.body.classList.toggle("is-dawn", mode === "dawn");
    localStorage.setItem("els-theme", mode);
    applyThemeUI();
  };

  const savedTheme = localStorage.getItem("els-theme");
  if (savedTheme === "dawn" || savedTheme === "night") setTheme(savedTheme);
  else applyThemeUI();

  themeToggle.addEventListener("click", () => {
    const isDawn = document.body.classList.contains("is-dawn");
    setTheme(isDawn ? "night" : "dawn");
  });
  themeToggle2.addEventListener("click", () => themeToggle.click());

  // -----------------------
  // Reveal on scroll (whispered fade)
  // -----------------------
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 }
    );

    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  // -----------------------
  // Modal: Whisper
  // -----------------------
  const modal = $("#whisperModal");
  const openBtns = [$("#openWhisper"), $("#openWhisper2")].filter(Boolean);
  const closeEls = () => $$("[data-close='true']", modal);
  const copyBtn = $("#copyWhisper");

  let lastFocus = null;

  const openModal = () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Focus close for keyboard users
    const closeBtn = $(".modal__close", modal);
    closeBtn?.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  };

  openBtns.forEach((b) => b.addEventListener("click", openModal));
  closeEls().forEach((el) => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();

    // Basic focus trap
    if (e.key === "Tab") {
      const focusables = $$(
        "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])",
        modal
      ).filter((el) => !el.hasAttribute("disabled"));

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  copyBtn.addEventListener("click", async () => {
    const text = $("#whisperBody").innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.classList.add("pulse");
      setTimeout(() => copyBtn.classList.remove("pulse"), 1300);
      copyBtn.textContent = "Kept.";
      setTimeout(() => (copyBtn.innerHTML = `Keep the words <span class="cta__arrow" aria-hidden="true">→</span>`), 1400);
    } catch {
      // If clipboard blocked
      copyBtn.textContent = "Could not copy";
      setTimeout(() => (copyBtn.innerHTML = `Keep the words <span class="cta__arrow" aria-hidden="true">→</span>`), 1400);
    }
  });

  // -----------------------
  // Contact-ish form (no backend)
  // -----------------------
  const form = $("#letterForm");
  const formNote = $("#formNote");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = new FormData(form).get("name")?.toString().trim() || "Beloved";
    form.reset();
    formNote.textContent = `Your whisper is sealed, ${name}. The night will remember.`;
    formNote.classList.add("pulse");
    setTimeout(() => formNote.classList.remove("pulse"), 1300);
  });

  // -----------------------
  // Sound: faint heartbeat + whispery air (toggleable)
  // Web Audio (no external files)
  // -----------------------
  const soundToggle = $("#soundToggle");
  let audioCtx = null;
  let master = null;
  let heartbeatTimer = null;

  const makeAudio = () => {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    master = audioCtx.createGain();
    master.gain.value = 0.0; // start silent, fade in on enable
    master.connect(audioCtx.destination);

    // Gentle "air" (filtered noise)
    const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const airFilter = audioCtx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.value = 520;
    airFilter.Q.value = 0.8;

    const airGain = audioCtx.createGain();
    airGain.gain.value = 0.08;

    noise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);

    noise.start();

    // Heartbeat helper: two quick thumps (low sine + short noise)
    const thump = (t, strength = 1) => {
      // low sine
      const osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(62, t);

      const g = audioCtx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22 * strength, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(g);
      g.connect(master);

      // soft transient noise
      const nBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
      const nd = nBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.35;

      const n = audioCtx.createBufferSource();
      n.buffer = nBuf;

      const f = audioCtx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(180, t);

      const ng = audioCtx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.12 * strength, t + 0.01);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      n.connect(f);
      f.connect(ng);
      ng.connect(master);

      osc.start(t);
      osc.stop(t + 0.2);
      n.start(t);
      n.stop(t + 0.2);
    };

    const scheduleHeartbeats = () => {
      if (!audioCtx) return;
      const bpm = 54; // slow, romantic
      const interval = 60 / bpm; // seconds
      let next = audioCtx.currentTime + 0.1;

      const tick = () => {
        if (!audioCtx || master.gain.value < 0.001) return;
        // lub-dub
        thump(next, 1);
        thump(next + 0.18, 0.75);

        next += interval;

        // schedule next tick
        heartbeatTimer = window.setTimeout(tick, interval * 1000);
      };

      tick();
    };

    // Expose for pulse button
    window.__ELS_thumpOnce = () => {
      if (!audioCtx) makeAudio();
      audioCtx.resume?.();
      const t = audioCtx.currentTime + 0.02;
      thump(t, 1);
      thump(t + 0.18, 0.75);
    };

    window.__ELS_startHeart = scheduleHeartbeats;
  };

  const setSoundUI = (on) => {
    soundToggle.setAttribute("aria-pressed", String(on));
    soundToggle.querySelector(".pill__label").textContent = on ? "Heartbeat" : "Silence";
  };

  const enableSound = async () => {
    makeAudio();
    await audioCtx.resume?.();

    // fade in
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.setValueAtTime(master.gain.value, audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(0.24, audioCtx.currentTime + 0.9);

    window.__ELS_startHeart?.();
    localStorage.setItem("els-sound", "on");
    setSoundUI(true);
  };

  const disableSound = () => {
    if (!audioCtx || !master) {
      localStorage.setItem("els-sound", "off");
      setSoundUI(false);
      return;
    }
    // fade out
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.setValueAtTime(master.gain.value, audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

    if (heartbeatTimer) window.clearTimeout(heartbeatTimer);
    heartbeatTimer = null;

    localStorage.setItem("els-sound", "off");
    setSoundUI(false);
  };

  // Persist sound state (but only start after user interaction is allowed)
  const savedSound = localStorage.getItem("els-sound");
  setSoundUI(savedSound === "on");

  soundToggle.addEventListener("click", async () => {
    const isOn = soundToggle.getAttribute("aria-pressed") === "true";
    if (isOn) disableSound();
    else await enableSound();
  });

  // Pulse button (one-time heartbeat)
  $("#pulseOnce").addEventListener("click", async () => {
    // If sound is off, still allow a single soft thump (user gesture)
    makeAudio();
    await audioCtx.resume?.();
    window.__ELS_thumpOnce?.();

    $("#pulseOnce").classList.add("pulse");
    setTimeout(() => $("#pulseOnce").classList.remove("pulse"), 1200);
  });

  // -----------------------
  // Cinematic atmosphere: fog + embers (canvas)
  // -----------------------
  const canvas = $("#atmosCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const embers = [];
  const fog = [];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = Math.floor(rect.width);
    h = Math.floor(rect.height);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const rand = (a, b) => a + Math.random() * (b - a);

  const seed = () => {
    embers.length = 0;
    fog.length = 0;

    const emberCount = Math.floor((w * h) / 60000); // scale with area
    const fogCount = Math.floor((w * h) / 90000);

    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: rand(0, w),
        y: rand(0, h),
        r: rand(0.6, 2.2),
        vx: rand(-0.08, 0.14),
        vy: rand(-0.28, -0.06),
        a: rand(0.08, 0.25),
        drift: rand(0, Math.PI * 2)
      });
    }

    for (let i = 0; i < fogCount; i++) {
      fog.push({
        x: rand(-w * 0.2, w * 1.2),
        y: rand(h * 0.15, h * 0.95),
        r: rand(80, 220),
        vx: rand(-0.08, 0.08),
        a: rand(0.035, 0.085),
        wob: rand(0, Math.PI * 2)
      });
    }
  };

  const draw = (t) => {
    if (prefersReducedMotion) {
      // Keep it minimal if user prefers reduced motion
      ctx.clearRect(0, 0, w, h);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    // Background vignette
    const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.55, Math.max(w, h));
    g.addColorStop(0, "rgba(255,255,255,0.06)");
    g.addColorStop(0.35, "rgba(179,18,45,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Fog (soft, slow)
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const f of fog) {
      const wob = Math.sin(t * 0.00025 + f.wob) * 18;
      const x = f.x + wob;
      const y = f.y + Math.cos(t * 0.00018 + f.wob) * 10;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, f.r);
      grad.addColorStop(0, `rgba(239,232,220,${f.a})`);
      grad.addColorStop(1, "rgba(239,232,220,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, f.r, 0, Math.PI * 2);
      ctx.fill();

      f.x += f.vx;
      if (f.x < -w * 0.3) f.x = w * 1.3;
      if (f.x > w * 1.3) f.x = -w * 0.3;
    }
    ctx.restore();

    // Embers (crimson → warm gold)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const e of embers) {
      e.drift += 0.012;
      const sway = Math.sin(e.drift) * 0.25;

      e.x += e.vx + sway;
      e.y += e.vy;

      if (e.y < -10 || e.x < -20 || e.x > w + 20) {
        e.x = rand(0, w);
        e.y = h + rand(0, 120);
        e.vy = rand(-0.32, -0.07);
      }

      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
      grad.addColorStop(0, `rgba(209,27,59,${e.a})`);
      grad.addColorStop(0.6, `rgba(231,196,122,${e.a * 0.55})`);
      grad.addColorStop(1, "rgba(231,196,122,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    requestAnimationFrame(draw);
  };

  const bootAtmos = () => {
    resize();
    seed();
    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", () => {
    resize();
    seed();
  });

  bootAtmos();

  // -----------------------
  // Tiny parallax shadow feel (very subtle)
  // -----------------------
  const heroVeil = $(".hero__veil");
  const heroContent = $(".hero__content");

  if (!prefersReducedMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY || 0;
        const p = Math.min(1, y / 700);
        heroVeil.style.opacity = String(0.92 - p * 0.18);
        heroContent.style.transform = `translateY(${p * 10}px)`;
      },
      { passive: true }
    );
  }

  // -----------------------
  // Friendly: first interaction can auto-enable saved sound
  // (Browsers require a user gesture for audio)
  // -----------------------
  const tryAutoSound = async () => {
    document.removeEventListener("pointerdown", tryAutoSound);
    document.removeEventListener("keydown", tryAutoSound);

    if (savedSound === "on") {
      try { await enableSound(); } catch { /* ignore */ }
    }
  };
  document.addEventListener("pointerdown", tryAutoSound, { once: true });
  document.addEventListener("keydown", tryAutoSound, { once: true });
})();