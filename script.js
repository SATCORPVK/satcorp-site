/* script.js — Supernatural-inspired “Hunter Archive” */

(() => {
  "use strict";

  /* ---------------- Helpers ---------------- */
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    gateControl();
    navScroll();
    themeToggle();
    audioToggle();
    flickerEffect();
    typewriter();
    caseFiles();
    bestiarySearch();
    tooltips();
    hotkeys();
  });

  /* ---------------- Footer Year ---------------- */
  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------- Entry Gate ---------------- */
  function gateControl() {
    const gate = $("#gate");
    const btn = $("#openJournal");
    const main = $("main");

    if (!gate || !btn) return;

    if (localStorage.getItem("hunter_seen") === "1") {
      gate.classList.add("is-hidden");
      main?.removeAttribute("inert");
      return;
    }

    main?.setAttribute("inert", "");

    btn.addEventListener("click", () => {
      localStorage.setItem("hunter_seen", "1");
      gate.classList.add("is-hidden");
      main?.removeAttribute("inert");
    });
  }

  /* ---------------- Navigation ---------------- */
  function navScroll() {
    const links = $$("nav a[href^='#']");
    if (!links.length) return;

    links.forEach(link => {
      link.addEventListener("click", e => {
        const id = link.getAttribute("href");
        const target = $(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
        history.pushState(null, "", id);
      });
    });

    const sections = links.map(l => $(l.getAttribute("href"))).filter(Boolean);

    window.addEventListener(
      "scroll",
      () => {
        let current = sections[0];
        sections.forEach(sec => {
          if (sec.getBoundingClientRect().top <= 140) current = sec;
        });

        links.forEach(l => l.classList.remove("is-active"));
        const active = links.find(
          l => l.getAttribute("href") === `#${current.id}`
        );
        active?.classList.add("is-active");
      },
      { passive: true }
    );
  }

  /* ---------------- Theme Toggle ---------------- */
  function themeToggle() {
    const btn = $("#themeToggle");
    if (!btn) return;

    const key = "hunter_theme";
    const saved = localStorage.getItem(key);
    if (saved) document.documentElement.dataset.theme = saved;

    btn.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "candle"
          ? "dark"
          : "candle";
      document.documentElement.dataset.theme = next;
      localStorage.setItem(key, next);
    });
  }

  /* ---------------- Audio Toggle ---------------- */
  function audioToggle() {
    const btn = $("#audioToggle");
    const audio = $("#ambientAudio");
    if (!btn || !audio) return;

    const key = "hunter_audio";
    if (localStorage.getItem(key) === "1") {
      audio.volume = 0.35;
      audio.play().catch(() => {});
      btn.classList.add("is-on");
    }

    btn.addEventListener("click", async () => {
      if (btn.classList.contains("is-on")) {
        audio.pause();
        btn.classList.remove("is-on");
        localStorage.setItem(key, "0");
      } else {
        try {
          audio.volume = 0.35;
          await audio.play();
          btn.classList.add("is-on");
          localStorage.setItem(key, "1");
        } catch {
          btn.classList.add("is-denied");
          setTimeout(() => btn.classList.remove("is-denied"), 300);
        }
      }
    });
  }

  /* ---------------- Flicker Effect ---------------- */
  function flickerEffect() {
    const flicker = $("#flicker");
    if (!flicker || reduceMotion) return;

    const start = performance.now();
    const tick = t => {
      const s = (t - start) / 1000;
      const base = 0.06 + Math.sin(s * 1.7) * 0.02;
      const spike = Math.random() < 0.02 ? Math.random() * 0.2 : 0;
      flicker.style.opacity = clamp(base + spike, 0, 0.25);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- Typewriter ---------------- */
  function typewriter() {
    const el = $("#typeLine");
    if (!el || reduceMotion) return;

    const lines = [
      "Saving people. Hunting things. The family business.",
      "Salt the doors. Lock the windows.",
      "Some things don’t stay dead.",
      "If you’re reading this, it’s already too late."
    ];

    let i = 0;
    const text = lines[Math.floor(Math.random() * lines.length)];
    el.textContent = "";

    const type = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i++);
        setTimeout(type, 22 + Math.random() * 18);
      }
    };
    type();
  }

  /* ---------------- Case Files ---------------- */
  function caseFiles() {
    const cards = $$(".case-card");
    const modal = $("#caseModal");
    const title = $("#caseModalTitle");
    const body = $("#caseModalBody");
    const close = $("#caseModalClose");

    if (!cards.length || !modal) return;

    const open = card => {
      title.textContent = card.dataset.title || "Case File";
      body.innerHTML = `
        <p><strong>Location:</strong> ${card.dataset.location || "Unknown"}</p>
        <p><strong>Status:</strong> ${card.dataset.status || "Open"}</p>
        <p><strong>Threat:</strong> ${card.dataset.threat || "Classified"}</p>
        <p>${card.dataset.notes || ""}</p>
      `;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    };

    const shut = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    };

    cards.forEach(card => {
      card.addEventListener("click", () => open(card));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter") open(card);
      });
    });

    close?.addEventListener("click", shut);
    modal.addEventListener("click", e => e.target === modal && shut());
    document.addEventListener("keydown", e => e.key === "Escape" && shut());
  }

  /* ---------------- Bestiary Search ---------------- */
  function bestiarySearch() {
    const input = $("#bestiarySearch");
    const items = $$(".bestiary-item");
    if (!input || !items.length) return;

    input.addEventListener("input", () => {
      const q = input.value.toLowerCase();
      items.forEach(i => {
        const text =
          (i.dataset.name + " " + i.dataset.tags + " " + i.textContent).toLowerCase();
        i.style.display = text.includes(q) ? "" : "none";
      });
    });
  }

  /* ---------------- Tooltips ---------------- */
  function tooltips() {
    const els = $$("[data-tip]");
    if (!els.length) return;

    const tip = document.createElement("div");
    tip.className = "tip-bubble";
    document.body.appendChild(tip);

    els.forEach(el => {
      el.addEventListener("mouseenter", () => {
        tip.textContent = el.dataset.tip;
        const r = el.getBoundingClientRect();
        tip.style.left = r.left + r.width / 2 + "px";
        tip.style.top = r.top - 10 + "px";
        tip.style.opacity = 1;
      });
      el.addEventListener("mouseleave", () => (tip.style.opacity = 0));
    });
  }

  /* ---------------- Hotkeys ---------------- */
  function hotkeys() {
    document.addEventListener("keydown", e => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "/") $("#bestiarySearch")?.focus();
      if (e.key.toLowerCase() === "t") $("#themeToggle")?.click();
      if (e.key.toLowerCase() === "a") $("#audioToggle")?.click();
      if (e.key.toLowerCase() === "g")
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();