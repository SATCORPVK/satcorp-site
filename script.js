/* =========================
   Satcorp – script.js
   ========================= */

(() => {
  /* ---------- Helpers ---------- */
  const $ = (q, ctx = document) => ctx.querySelector(q);
  const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

  /* ---------- Header Elevation on Scroll ---------- */
  const header = $(".header");
  const onScroll = () => {
    if (!header) return;
    const elevated = window.scrollY > 8;
    header.setAttribute("data-elevate", elevated ? "true" : "false");
    header.style.boxShadow = elevated
      ? "0 8px 24px rgba(0,0,0,0.35)"
      : "none";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Nav Toggle ---------- */
  const navToggle = $(".nav__toggle");
  const navMenu = $("#navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navMenu.style.display = open ? "none" : "flex";
    });

    // Close nav when clicking a link (mobile)
    $$(".nav__link", navMenu).forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navMenu.style.display = "";
      });
    });
  }

  /* ---------- KPI Randomization (Demo Telemetry) ---------- */
  const kpis = {
    links: { min: 110, max: 140, step: 1 },
    throughput: { min: 2.1, max: 3.4, step: 0.1 },
    snr: { min: 15.5, max: 20.2, step: 0.1 },
    anomalies: { min: 0, max: 1, step: 1 }
  };

  function randomizeKpis() {
    Object.keys(kpis).forEach((key) => {
      const el = document.querySelector(`[data-kpi="${key}"]`);
      if (!el) return;
      const cfg = kpis[key];
      const raw =
        cfg.min +
        Math.random() * (cfg.max - cfg.min);
      const value =
        cfg.step < 1
          ? raw.toFixed(1)
          : Math.round(raw / cfg.step) * cfg.step;

      el.textContent = value;

      if (key === "anomalies") {
        el.classList.toggle("kpi__value--ok", Number(value) === 0);
      }
    });

    const lastSync = $("[data-last-sync]");
    if (lastSync) {
      lastSync.textContent = new Date().toLocaleTimeString();
    }
  }

  setInterval(randomizeKpis, 3500);
  randomizeKpis();

  /* ---------- Sparkline Canvas ---------- */
  const canvas = $("#spark");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const points = [];
    const MAX_POINTS = 40;

    function drawSpark() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Line
      ctx.strokeStyle = "#4cc9f0";
      ctx.lineWidth = 2;
      ctx.beginPath();

      points.forEach((p, i) => {
        const x = (i / (MAX_POINTS - 1)) * canvas.width;
        const y = canvas.height - p * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    }

    function tickSpark() {
      const next = 0.2 + Math.random() * 0.6;
      points.push(next);
      if (points.length > MAX_POINTS) points.shift();
      drawSpark();
    }

    setInterval(tickSpark, 1000);
    tickSpark();
  }

  /* ---------- Accordion ---------- */
  $$(".accordion").forEach((acc) => {
    const buttons = $$(".acc__btn", acc);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const panel = btn.nextElementSibling;

        btn.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  });

  /* ---------- Modals ---------- */
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = (modal) => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  $$("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openModal(btn.getAttribute("data-modal-open"));
    });
  });

  $$("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", () => {
      const modal = el.closest(".modal");
      if (modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $$(".modal").forEach((m) => {
        if (!m.hidden) closeModal(m);
      });
    }
  });

  /* ---------- Toasts ---------- */
  const toast = $("#toast");
  const toastMsg = $("#toastMsg");
  let toastTimer;

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  $$("[data-toast]").forEach((el) => {
    el.addEventListener("click", () => {
      showToast(el.getAttribute("data-toast"));
    });
  });

  /* ---------- Contact Form (Demo Only) ---------- */
  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Message sent (demo)");
      contactForm.reset();
    });
  }

  /* ---------- Footer Year ---------- */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();