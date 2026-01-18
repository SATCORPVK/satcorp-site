/* script.js — Supernatural-inspired “Hunter Archive”
   Works with the HTML/CSS structure I described (journal/sections, case cards, audio toggle, etc.)
   Safe if some elements don’t exist — it just won’t enable that feature.
*/

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    initYearStamp();
    initGate();
    initNav();
    initThemeToggle();
    initAmbientAudio();
    initFlicker();
    initTypewriter();
    initCaseFiles();
    initBestiaryFilter();
    initTooltips();
    initKeyboardShortcuts();
  });

  // ---------- Footer year ----------
  function initYearStamp() {
    const el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // ---------- Entry Gate / “Open the Journal” ----------
  function initGate() {
    const gate = $("#gate");
    const openBtn = $("#openJournal");
    const main = $("main");

    if (!gate || !openBtn) return;

    const hasSeen = localStorage.getItem("hunterArchive_seen") === "1";
    if (hasSeen) {
      gate.classList.add("is-hidden");
      main?.removeAttribute("inert");
      return;
    }

    // Gate starts visible; main inert until opened (if supported)
    if (main) main.setAttribute("inert", "");

    openBtn.addEventListener("click", () => {
      localStorage.setItem("hunterArchive_seen", "1");
      gate.classList.add("is-hidden");
      main?.removeAttribute("inert");

      // Focus first nav link for accessibility
      const firstLink = $("nav a");
      firstLink?.focus?.();
    });
  }

  // ---------- Navigation (smooth scroll + active state) ----------
  function initNav() {
    const navLinks = $$("nav a[href^='#']");
    if (!navLinks.length) return;

    navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id ? $(id) : null;
        if (!target) return;

        e.preventDefault();
        if (reduceMotion) {
          target.scrollIntoView();
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Update hash without jumping
        history.pushState(null, "", id);
      });
    });

    // Active section highlight on scroll
    const sections = navLinks
      .map((a) => $(a.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;

        const y = window.scrollY || window.pageYOffset;
        const offset = 120;

        let current = sections[0];
        for (const sec of sections) {
          const top = sec.getBoundingClientRect().top + y;
          if (top - offset <= y) current = sec;
        }

        navLinks.forEach((a) => a.classList.remove("is-active"));
        const active = navLinks.find((a) => a.getAttribute("href") === `#${current.id}`);
        active?.classList.add("is-active");
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Theme Toggle (dark / “candlelight”) ----------
  function initThemeToggle() {
    const btn = $("#themeToggle");
    if (!btn) return;

    const key = "hunterArchive_theme";
    const saved = localStorage.getItem(key);
    if (saved) document.documentElement.dataset.theme = saved;

    btn.addEventListener("click", () => {
      const now = document.documentElement.dataset.theme === "candle" ? "dark" : "candle";
      document.documentElement.dataset.theme = now;
      localStorage.setItem(key, now);
      btn.setAttribute("aria-pressed", now === "candle" ? "true" : "false");
    });
  }

  // ---------- Ambient Audio (optional) ----------
  function initAmbientAudio() {
    const toggle = $("#audioToggle");
    const audio = $("#ambientAudio"); // <audio id="ambientAudio" loop src="...">
    if (!toggle || !audio) return;

    const key = "hunterArchive_audio";
    const saved = localStorage.getItem(key);
    const shouldPlay = saved === "1";

    // Audio autoplay is restricted; we only attempt if user already opted-in.
    if (shouldPlay) {
      audio.volume = 0.35;
      audio.play().catch(() => {
        // If blocked, user can press toggle again.
      });
      toggle.setAttribute("aria-pressed", "true");
      toggle.classList.add("is-on");
    }

    toggle.addEventListener("click", async () => {
      const isOn = toggle.classList.contains("is-on");

      if (isOn) {
        audio.pause();
        toggle.classList.remove("is-on");
        toggle.setAttribute("aria-pressed", "false");
        localStorage.setItem(key, "0");
      } else {
        audio.volume = 0.35;
        try {
          await audio.play();
          toggle.classList.add("is-on");
          toggle.setAttribute("aria-pressed", "true");
          localStorage.setItem(key, "1");
        } catch {
          // Still blocked; add a tiny shake/notice if your CSS supports it.
          toggle.classList.add("is-denied");
          setTimeout(() => toggle.classList.remove("is-denied"), 400);
        }
      }
    });
  }

  // ---------- Subtle “TV flicker / neon hum” ----------
  function initFlicker() {
    const flickerLayer = $("#flicker"); // optional overlay div
    if (!flickerLayer || reduceMotion) return;

    // Random opacity flicker
    let rafId = 0;
    const start = performance.now();

    const tick = (t) => {
      const elapsed = (t - start) / 1000;
      // Slow baseline + occasional spike
      const base = 0.06 + 0.02 * Math.sin(elapsed * 1.7);
      const spike = Math.random() < 0.02 ? Math.random() * 0.18 : 0;
      const o = clamp(base + spike, 0, 0.26);
      flickerLayer.style.opacity = String(o);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // Stop on tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(tick);
    });
  }

  // ---------- Typewriter for “journal quote” ----------
  function initTypewriter() {
    const el = $("#typeLine"); // element to type into
    if (!el || reduceMotion) return;

    const lines = [
      "Saving people. Hunting things. The family business.",
      "If you’re reading this, you’re already involved.",
      "Salt the doors. Check the mirrors. Trust nobody.",
      "Some things stay dead. Some things lie about it."
    ];

    const key = "hunterArchive_lineIndex";
    let idx = Number(localStorage.getItem(key) || "0");
    if (!Number.isFinite(idx)) idx = 0;
    idx = ((idx % lines.length) + lines.length) % lines.length;
    localStorage.setItem(key, String((idx + 1) % lines.length));

    const text = lines[idx];
    el.textContent = "";

    let i = 0;
    const speed = 22; // ms per char
    const jitter = 20;

    const typeNext = () => {
      if (i > text.length) return;
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(typeNext, speed + Math.random() * jitter);
    };

    setTimeout(typeNext, 250);
  }

  // ---------- Case Files: open modal / drawer ----------
  function initCaseFiles() {
    const cards = $$(".case-card");
    if (!cards.length) return;

    const modal = $("#caseModal");
    const modalTitle = $("#caseModalTitle");
    const modalBody = $("#caseModalBody");
    const closeBtn = $("#caseModalClose");

    const hasModal = modal && modalTitle && modalBody && closeBtn;

    // If no modal present, enable simple expand/collapse on card
    if (!hasModal) {
      cards.forEach((card) => {
        const more = $(".case-more", card);
        if (!more) return;

        // Start collapsed
        more.hidden = true;

        card.addEventListener("click", (e) => {
          // ignore clicks on links/buttons
          if (e.target instanceof Element && e.target.closest("a,button")) return;
          more.hidden = !more.hidden;
          card.classList.toggle("is-open", !more.hidden);
        });
      });
      return;
    }

    const openModal = (card) => {
      const title = card.getAttribute("data-title") || $(".case-title", card)?.textContent?.trim() || "Case File";
      const location = card.getAttribute("data-location") || $(".case-location", card)?.textContent?.trim() || "";
      const status = card.getAttribute("data-status") || $(".case-status", card)?.textContent?.trim() || "";
      const threat = card.getAttribute("data-threat") || $(".case-threat", card)?.textContent?.trim() || "";
      const notes = card.getAttribute("data-notes") || $(".case-notes", card)?.textContent?.trim() || "";

      modalTitle.textContent = title;

      modalBody.innerHTML = `
        <div class="case-meta">
          ${location ? `<div><span class="label">Location</span> <span class="value">${escapeHTML(location)}</span></div>` : ""}
          ${status ? `<div><span class="label">Status</span> <span class="value">${escapeHTML(status)}</span></div>` : ""}
          ${threat ? `<div><span class="label">Threat</span> <span class="value">${escapeHTML(threat)}</span></div>` : ""}
        </div>
        ${notes ? `<div class="case-notes-block"><span class="label">Notes</span><p>${escapeHTML(notes).replace(/\n/g, "<br>")}</p></div>` : ""}
      `;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      closeBtn.focus?.();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target instanceof Element && e.target.closest("a,button")) return;
        openModal(card);
      });

      // accessibility: Enter/Space open if card has tabindex
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  // ---------- Bestiary filter/search ----------
  function initBestiaryFilter() {
    const input = $("#bestiarySearch");
    const items = $$(".bestiary-item");
    if (!input || !items.length) return;

    const normalize = (s) =>
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const apply = () => {
      const q = normalize(input.value);
      items.forEach((it) => {
        const hay =
          normalize(it.getAttribute("data-name")) +
          " " +
          normalize(it.getAttribute("data-tags")) +
          " " +
          normalize(it.textContent);

        const show = !q || hay.includes(q);
        it.style.display = show ? "" : "none";
      });
    };

    input.addEventListener("input", apply);
    apply();
  }

  // ---------- Optional: simple tooltip hover for sigils ----------
  function initTooltips() {
    const tips = $$("[data-tip]");
    if (!tips.length) return;

    let bubble = null;

    const show = (el) => {
      const text = el.getAttribute("data-tip");
      if (!text) return;

      if (!bubble) {
        bubble = document.createElement("div");
        bubble.className = "tip-bubble";
        document.body.appendChild(bubble);
      }

      bubble.textContent = text;
      bubble.style.opacity = "1";

      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top - 10;

      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.transform = "translate(-50%, -100%)";
    };

    const hide = () => {
      if (!bubble) return;
      bubble.style.opacity = "0";
    };

    tips.forEach((el) => {
      el.addEventListener("mouseenter", () => show(el));
      el.addEventListener("focus", () => show(el));
      el.addEventListener("mouseleave", hide);
      el.addEventListener("blur", hide);
    });
  }

  // ---------- Keyboard shortcuts ----------
  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // ignore when typing in form fields
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      // / focuses bestiary search
      if (e.key === "/") {
        const input = $("#bestiarySearch");
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }

      // t toggles theme
      if (e.key.toLowerCase() === "t") {
        $("#themeToggle")?.click();
      }

      // a toggles audio
      if (e.key.toLowerCase() === "a") {
        $("#audioToggle")?.click();
      }

      // g returns to top (like “back to journal cover”)
      if (e.key.toLowerCase() === "g") {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }

  // ---------- Escape HTML ----------
  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();