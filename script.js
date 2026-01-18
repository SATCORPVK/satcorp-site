/* =========================================================
   NorthBridge Public Health Initiative — Level 2
   Features:
   - Mobile nav toggle (escape + outside click + link click)
   - Footer year
   - Toast notifications
   - Intake form guidance (no data saved)
   - Animated metrics (on view)
   - Location filtering chips
   - Demo download button toast
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
      toastEl.textContent = "";
    }, 2800);
  }

  /* ---------- Mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const navMenu = $("#navMenu");

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("open");
  }

  function openNav() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", "true");
    navMenu.classList.add("open");
  }

  function isNavOpen() {
    return navMenu && navMenu.classList.contains("open");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      if (isNavOpen()) closeNav();
      else openNav();
    });

    // Close on link click (mobile)
    navMenu.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.tagName === "A") closeNav();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isNavOpen()) closeNav();
    });

    // Close on outside click (only when open)
    document.addEventListener("click", (e) => {
      if (!isNavOpen()) return;
      const target = e.target;
      const clickedInside = navMenu.contains(target) || navToggle.contains(target);
      if (!clickedInside) closeNav();
    });
  }

  /* ---------- Demo downloads ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='download']");
    if (!btn) return;
    const res = btn.getAttribute("data-resource") || "file";
    showToast(`Demo: "${res}" download (placeholder).`);
  });

  /* ---------- Intake form guidance ---------- */
  const intakeForm = $("#intakeForm");
  const intakeResult = $("#intakeResult");

  function renderGuidance({ service, age, lang }) {
    // Simple, believable guidance rules
    const langLabel =
      lang === "en" ? "English" :
      lang === "es" ? "Spanish" :
      lang === "pl" ? "Polish" : "Other language";

    let title = "Suggested next steps";
    let steps = [];
    let locationType = "clinic";

    if (service === "screening") {
      steps = [
        "Bring an ID if available (not required for all pop-ups).",
        "Plan 15–30 minutes for screening and follow-up questions.",
        "If you have results from past visits, bring them."
      ];
      locationType = "clinic";
    }

    if (service === "vaccines") {
      steps = [
        "Check if you have vaccine records (if not, we can still help).",
        "Plan 10–20 minutes for most vaccine visits.",
        "Ask about seasonal availability at pop-up sites."
      ];
      locationType = "popup";
    }

    if (service === "primary") {
      steps = [
        "We’ll help connect you to a primary care clinic or partner provider.",
        "Bring a list of medications if you have one.",
        "If you need same-week support, ask for navigation services."
      ];
      locationType = "clinic";
    }

    if (service === "education") {
      steps = [
        "Ask for a printed education kit (available in multiple languages).",
        "Join a workshop for practical guidance and Q&A.",
        "If you have a specific condition in mind, mention it at intake."
      ];
      locationType = "workshop";
    }

    // Age nuance
    if (age === "child") {
      steps.unshift("For children: a parent/guardian should attend when possible.");
    } else if (age === "senior") {
      steps.unshift("For seniors: bring a current medication list if available.");
    }

    return { title, steps, locationType, langLabel };
  }

  if (intakeForm && intakeResult) {
    intakeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(intakeForm);
      const service = String(fd.get("service") || "");
      const age = String(fd.get("age") || "");
      const lang = String(fd.get("lang") || "");

      if (!service || !age || !lang) {
        showToast("Please answer all 3 questions.");
        return;
      }

      const g = renderGuidance({ service, age, lang });

      intakeResult.innerHTML = `
        <div class="result-inner">
          <p class="result-title"><strong>${g.title}</strong></p>
          <p class="result-meta">Language support: ${g.langLabel} • Recommended site type: <strong>${g.locationType}</strong></p>
          <ol class="result-steps">
            ${g.steps.map((s) => `<li>${s}</li>`).join("")}
          </ol>
          <p class="result-cta">
            <a class="text-link" href="#locations">Jump to locations →</a>
          </p>
        </div>
      `;

      intakeResult.hidden = false;
      showToast("Guidance generated (demo).");

      // Nudge filter selection to match recommendation
      activateFilter(g.locationType);
    });
  }

  /* ---------- Metrics (count up on view) ---------- */
  const metricValues = $$("[data-count]");

  function animateCount(el, to) {
    const duration = 900; // ms
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const current = Math.floor(from + (to - from) * t);
      el.textContent = current.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (metricValues.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const to = Number(el.getAttribute("data-count") || "0");
          // prevent rerun
          if (el.getAttribute("data-animated") === "true") continue;
          el.setAttribute("data-animated", "true");
          animateCount(el, to);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    metricValues.forEach((el) => io.observe(el));
  }

  /* ---------- Location filtering ---------- */
  const chips = $$("[data-filter]");
  const locationGrid = $("#locationGrid");
  const locations = locationGrid ? $$(".location", locationGrid) : [];

  function activateFilter(filter) {
    chips.forEach((c) => {
      const isMatch = c.getAttribute("data-filter") === filter;
      c.classList.toggle("is-active", isMatch);
      if (isMatch) c.setAttribute("aria-pressed", "true");
      else c.setAttribute("aria-pressed", "false");
    });

    if (!locations.length) return;

    locations.forEach((card) => {
      const type = card.getAttribute("data-type");
      const show = filter === "all" || type === filter;
      card.style.display = show ? "" : "none";
    });
  }

  if (chips.length && locationGrid) {
    // Accessibility: make chips behave like toggle buttons
    chips.forEach((c) => c.setAttribute("aria-pressed", c.classList.contains("is-active") ? "true" : "false"));

    locationGrid.setAttribute("aria-live", "polite");

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter") || "all";
        activateFilter(filter);
        showToast(filter === "all" ? "Showing all locations." : `Filtered: ${filter}.`);
      });
    });
  }

  /* ---------- Contact form ---------- */
  const contactForm = $("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#name", contactForm)?.value?.trim();
      const email = $("#email", contactForm)?.value?.trim();
      const topic = $("#topic", contactForm)?.value?.trim();
      const message = $("#message", contactForm)?.value?.trim();

      if (!name || !email || !topic || !message) {
        showToast("Please complete all fields.");
        return;
      }

      contactForm.reset();
      showToast("Message sent! (Demo — nothing was delivered.)");
    });
  }
})();
