/* lvl10 script.js — Northbridge Initiative
   Goals:
   - Accessible navigation (mobile drawer)
   - Theme + reduced motion toggles with persistence
   - Scroll progress + sticky header behavior
   - Reveal-on-scroll + stagger groups
   - Count-up numbers (respect reduced motion)
   - Tabs (ARIA) for Impact section
   - Modal system (focus trap, ESC, click-out)
   - Toast notifications
   - Events list: render + search + filter + reset
   - Forms: newsletter + contact (client-side demo)
   - Back-to-top
   No dependencies. */

(() => {
  "use strict";

  // ----------------------------
  // Helpers
  // ----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const prefersDark = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const storage = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
    },
    del(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };

  const rafThrottle = (fn) => {
    let raf = 0;
    return (...args) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        fn(...args);
      });
    };
  };

  const formatNumber = (n) => {
    const abs = Math.abs(n);
    if (abs >= 1000000) return `${Math.round(n / 100000) / 10}M`;
    if (abs >= 10000) return `${Math.round(n / 100) / 10}K`;
    return String(n);
  };

  // Focus trap for modals/drawers
  const createFocusTrap = (container) => {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const getFocusable = () =>
      $$(selectors, container).filter((el) => el.offsetParent !== null && !el.hasAttribute("inert"));

    const state = { active: false, lastFocus: null };

    const onKeyDown = (e) => {
      if (!state.active) return;
      if (e.key !== "Tab") return;

      const items = getFocusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    return {
      activate() {
        if (state.active) return;
        state.active = true;
        state.lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.addEventListener("keydown", onKeyDown, true);

        // Move focus to first focusable element or container
        const items = getFocusable();
        (items[0] || container).focus?.();
      },
      deactivate() {
        if (!state.active) return;
        state.active = false;
        document.removeEventListener("keydown", onKeyDown, true);
        state.lastFocus?.focus?.();
        state.lastFocus = null;
      },
    };
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.documentElement.classList.add("js");
  document.body.classList.remove("no-js");
  const YEAR = new Date().getFullYear();
  $$("[data-year]").forEach((el) => (el.textContent = String(YEAR)));

  // ----------------------------
  // Preferences: Theme + Motion
  // ----------------------------
  const THEME_KEY = "lvl10.theme"; // system | light | dark
  const MOTION_KEY = "lvl10.motion"; // full | reduce

  const applyTheme = (mode) => {
    // mode: system | light | dark
    const root = document.documentElement;
    root.dataset.theme = mode;

    // For CSS convenience: actual resolved scheme
    const resolved = mode === "system" ? (prefersDark() ? "dark" : "light") : mode;
    root.dataset.scheme = resolved;
  };

  const applyMotion = (mode) => {
    // mode: full | reduce
    const root = document.documentElement;
    root.dataset.motion = mode;
  };

  const initPreferences = () => {
    const savedTheme = storage.get(THEME_KEY, "system");
    const savedMotion = storage.get(MOTION_KEY, prefersReducedMotion() ? "reduce" : "full");

    applyTheme(savedTheme);
    applyMotion(savedMotion);

    const themeBtn = $("[data-theme-toggle]");
    const motionBtn = $("[data-reduce-motion-toggle]");

    const syncButtons = () => {
      if (themeBtn) {
        const t = document.documentElement.dataset.theme || "system";
        themeBtn.setAttribute("aria-pressed", t !== "system" ? "true" : "false");
        themeBtn.title = `Theme: ${t}`;
      }
      if (motionBtn) {
        const m = document.documentElement.dataset.motion || "full";
        motionBtn.setAttribute("aria-pressed", m === "reduce" ? "true" : "false");
        motionBtn.title = `Motion: ${m}`;
      }
    };

    syncButtons();

    themeBtn?.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "system";
      const next = current === "system" ? "dark" : current === "dark" ? "light" : "system";
      storage.set(THEME_KEY, next);
      applyTheme(next);
      syncButtons();
      toast(`Theme set to ${next}.`);
    });

    motionBtn?.addEventListener("click", () => {
      const current = document.documentElement.dataset.motion || "full";
      const next = current === "reduce" ? "full" : "reduce";
      storage.set(MOTION_KEY, next);
      applyMotion(next);
      syncButtons();
      toast(`Motion set to ${next}.`);
      // Recompute reveals/counts based on motion
      revealController?.refresh?.();
      countController?.refresh?.();
    });

    // React to OS changes when in system mode
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener?.("change", () => {
        if ((storage.get(THEME_KEY, "system") || "system") === "system") applyTheme("system");
      });

      const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
      rmq.addEventListener?.("change", () => {
        // If user never chose, keep in sync
        const stored = storage.get(MOTION_KEY, null);
        if (stored === null) {
          const auto = prefersReducedMotion() ? "reduce" : "full";
          applyMotion(auto);
          syncButtons();
        }
      });
    }
  };

  // ----------------------------
  // Toasts
  // ----------------------------
  const toastsEl = $("[data-toasts]");
  let toastId = 0;

  function toast(message, opts = {}) {
    if (!toastsEl) return;
    const id = ++toastId;
    const dur = clamp(opts.duration ?? 3500, 1000, 10000);

    const item = document.createElement("div");
    item.className = "toast";
    item.setAttribute("role", "status");
    item.setAttribute("aria-live", "polite");
    item.dataset.toastId = String(id);

    item.innerHTML = `
      <div class="toast__msg"></div>
      <button class="iconbtn toast__x" type="button" aria-label="Dismiss">×</button>
    `;

    $(".toast__msg", item).textContent = message;

    const remove = () => {
      item.classList.add("is-leaving");
      const done = () => item.remove();
      item.addEventListener("animationend", done, { once: true });
      setTimeout(done, 400);
    };

    $(".toast__x", item).addEventListener("click", remove);

    toastsEl.appendChild(item);

    const motion = document.documentElement.dataset.motion || "full";
    if (motion === "reduce") {
      // No timed removal unless user wants
      setTimeout(remove, dur);
    } else {
      setTimeout(remove, dur);
    }
  }

  // ----------------------------
  // Announcement dismiss
  // ----------------------------
  const ANNOUNCE_KEY = "lvl10.announce.dismissed";
  const initAnnouncement = () => {
    const bar = $(".announce");
    if (!bar) return;
    const dismissed = storage.get(ANNOUNCE_KEY, "0") === "1";
    if (dismissed) {
      bar.remove();
      return;
    }
    const btn = $("[data-announce-dismiss]");
    btn?.addEventListener("click", () => {
      storage.set(ANNOUNCE_KEY, "1");
      bar.classList.add("is-hidden");
      setTimeout(() => bar.remove(), 350);
    });
  };

  // ----------------------------
  // Nav drawer + header behavior
  // ----------------------------
  const initNav = () => {
    const toggle = $("[data-nav-toggle]");
    const panel = $("#nav-panel");
    const header = $("[data-header]");

    if (!toggle || !panel) return;

    const trap = createFocusTrap(panel);
    let open = false;

    const setOpen = (v) => {
      open = v;
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("is-open", open);
      document.documentElement.classList.toggle("nav-open", open);

      if (open) {
        panel.removeAttribute("inert");
        trap.activate();
      } else {
        panel.setAttribute("inert", "");
        trap.deactivate();
      }
    };

    // inert by default for accessibility (mobile)
    panel.setAttribute("inert", "");

    toggle.addEventListener("click", () => setOpen(!open));

    // Close on nav link click (especially mobile)
    $$(".nav__link", panel).forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    });

    // Click outside closes (only when overlayed; panel is inside header)
    document.addEventListener("click", (e) => {
      if (!open) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (panel.contains(t) || toggle.contains(t)) return;
      setOpen(false);
    });

    // Sticky header: shrink on scroll down, reveal on scroll up
    let lastY = window.scrollY || 0;
    const onScroll = rafThrottle(() => {
      const y = window.scrollY || 0;
      const delta = y - lastY;

      header?.classList.toggle("is-scrolled", y > 8);
      if (Math.abs(delta) > 8) {
        header?.classList.toggle("is-hidden", delta > 0 && y > 120 && !open);
      }
      lastY = y;
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  // ----------------------------
  // Scroll progress bar
  // ----------------------------
  const initScrollProgress = () => {
    const bar = $("[data-scroll-progress]");
    if (!bar) return;

    const update = rafThrottle(() => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight || 1) - doc.clientHeight;
      const y = window.scrollY || 0;
      const p = max <= 0 ? 0 : y / max;
      bar.style.transform = `scaleX(${clamp(p, 0, 1)})`;
    });

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  };

  // ----------------------------
  // Reveal-on-scroll + stagger
  // ----------------------------
  let revealController = null;

  const initReveals = () => {
    const motion = document.documentElement.dataset.motion || "full";
    const canAnimate = motion !== "reduce";

    const revealEls = $$("[data-reveal]");
    const staggerGroups = $$("[data-stagger]");

    // Apply stagger indices
    staggerGroups.forEach((group) => {
      const kids = $$("[data-reveal], .card, .row", group);
      kids.forEach((el, i) => el.style.setProperty("--stagger", String(i)));
    });

    // If reduced motion, just show
    if (!canAnimate || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return (revealController = {
        refresh() {
          revealEls.forEach((el) => el.classList.add("is-visible"));
        },
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            ent.target.classList.add("is-visible");
            io.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));

    revealController = {
      refresh() {
        // For now: ensure everything already visible stays visible; observe any new ones
        $$("[data-reveal]").forEach((el) => {
          if (!el.classList.contains("is-visible")) io.observe(el);
        });
      },
    };
  };

  // ----------------------------
  // Count-up numbers
  // ----------------------------
  let countController = null;

  const initCountUps = () => {
    const els = $$("[data-count-to]");
    if (!els.length) return;

    const motion = document.documentElement.dataset.motion || "full";
    const canAnimate = motion !== "reduce";

    const run = (el) => {
      const raw = el.getAttribute("data-count-to");
      const target = raw ? Number(raw) : 0;
      if (!Number.isFinite(target)) return;

      if (!canAnimate) {
        el.textContent = formatNumber(target);
        return;
      }

      const duration = 900;
      const start = performance.now();
      const from = 0;

      const tick = (t) => {
        const p = clamp((t - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const val = Math.round(from + (target - from) * eased);
        el.textContent = formatNumber(val);
        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      els.forEach(run);
      return (countController = { refresh: () => els.forEach(run) });
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            run(ent.target);
            io.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.35 }
    );

    els.forEach((el) => io.observe(el));

    countController = {
      refresh() {
        // If switching motion, set remaining numbers
        if (!canAnimate) els.forEach(run);
      },
    };
  };

  // ----------------------------
  // Simple sparkline + mini chart (no canvas, pure div bars)
  // ----------------------------
  const initMicroCharts = () => {
    // Sparkline in hero
    const spark = $("[data-sparkline]");
    if (spark) {
      const data = [3, 4, 5, 3, 6, 7, 6, 8, 9, 7, 10, 12];
      spark.innerHTML = "";
      const max = Math.max(...data);
      data.forEach((v, i) => {
        const b = document.createElement("div");
        b.className = "sparkline__bar";
        b.style.height = `${(v / max) * 100}%`;
        b.style.setProperty("--i", String(i));
        spark.appendChild(b);
      });
    }

    // Mini chart in impact
    const chart = $("[data-mini-chart]");
    if (chart) {
      const data = [12, 14, 11, 16, 18, 19, 17, 22, 23, 24, 21, 26];
      chart.innerHTML = "";
      const max = Math.max(...data);
      data.forEach((v, i) => {
        const b = document.createElement("div");
        b.className = "minichart__bar";
        b.style.height = `${(v / max) * 100}%`;
        b.style.setProperty("--i", String(i));
        chart.appendChild(b);
      });
    }
  };

  // ----------------------------
  // Parallax (very light, disabled on reduced motion)
  // ----------------------------
  const initParallax = () => {
    const el = $("[data-parallax]");
    if (!el) return;

    const motion = document.documentElement.dataset.motion || "full";
    if (motion === "reduce") return;

    const onMove = rafThrottle((e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.transform = `translate3d(${dx * 10}px, ${dy * 10}px, 0)`;
    });

    const reset = () => (el.style.transform = "");
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
  };

  // ----------------------------
  // Tabs (ARIA)
  // ----------------------------
  const initTabs = () => {
    const tablist = $('[role="tablist"][aria-label="Impact tabs"]');
    if (!tablist) return;

    const tabs = $$('[role="tab"]', tablist);
    const panels = $$('[role="tabpanel"]');

    const activate = (tab) => {
      const name = tab.getAttribute("data-tab");
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const isMatch = p.getAttribute("data-panel") === name;
        p.hidden = !isMatch;
        if (isMatch) p.focus({ preventScroll: true });
      });
    };

    // Click
    tabs.forEach((t) => t.addEventListener("click", () => activate(t)));

    // Keyboard
    tablist.addEventListener("keydown", (e) => {
      const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      if (current < 0) return;

      let next = current;
      if (e.key === "ArrowRight") next = (current + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;

      e.preventDefault();
      tabs[next].focus();
      activate(tabs[next]);
    });
  };

  // ----------------------------
  // Modal system (single root)
  // ----------------------------
  const modalRoot = $("[data-modalroot]");
  const modal = $(".modal", modalRoot || document);
  const backdrop = $("[data-backdrop]", modalRoot || document);
  const modalTitle = $("#modal-title", modalRoot || document);
  const modalDesc = $("#modal-desc", modalRoot || document);
  const modalContent = $("[data-modal-content]", modalRoot || document);
  const modalPrimary = $("[data-modal-primary]", modalRoot || document);

  const modalTrap = modal ? createFocusTrap(modal) : null;
  let modalOpen = false;

  const modalTemplates = {
    donate: {
      title: "Support our work",
      desc: "This is a demo donation flow. Replace with your real payment link/provider.",
      html: `
        <div class="stack">
          <p><strong>Ways to give</strong></p>
          <div class="grid grid--2">
            <button class="btn btn--ghost" type="button" data-give="25">$25</button>
            <button class="btn btn--ghost" type="button" data-give="50">$50</button>
            <button class="btn btn--ghost" type="button" data-give="100">$100</button>
            <button class="btn btn--ghost" type="button" data-give="custom">Custom</button>
          </div>
          <label class="field">
            <span class="field__label">Optional note</span>
            <textarea class="textarea" rows="3" placeholder="Tell us what you’d like to support…"></textarea>
          </label>
          <p class="muted small">Tip: connect Stripe/PayPal/Donorbox in production.</p>
        </div>
      `,
      primary: "Continue",
      onPrimary() {
        toast("Thanks! Hook this to your real donation checkout.");
        closeModal();
      },
    },
    newsletter: {
      title: "Subscribe",
      desc: "Monthly updates. No spam.",
      html: `
        <form class="stack" data-modal-newsletter>
          <label class="field">
            <span class="field__label">Email</span>
            <input class="input" type="email" name="email" autocomplete="email" required placeholder="you@example.org"/>
          </label>
          <label class="field">
            <span class="field__label">Interests</span>
            <select class="select" name="interest">
              <option value="programs">Programs</option>
              <option value="research">Research</option>
              <option value="partnerships">Partnerships</option>
            </select>
          </label>
          <button class="btn btn--primary" type="submit">Subscribe</button>
          <p class="muted small">We’ll send a confirmation email.</p>
        </form>
      `,
      primary: "Done",
      onPrimary() {
        closeModal();
      },
    },
    impact: {
      title: "Impact details",
      desc: "A deeper view into outcomes and how we measure.",
      html: `
        <div class="stack">
          <div class="card card--soft">
            <h3 class="card__title">What we publish</h3>
            <ul class="bullets" role="list">
              <li>Program outputs (what we delivered)</li>
              <li>Outcomes (what changed)</li>
              <li>Methods and limitations</li>
              <li>Replicable toolkits and templates</li>
            </ul>
          </div>
          <p class="muted">Replace this with your real report content or embed a PDF viewer.</p>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
    partner: {
      title: "Become a partner",
      desc: "Tell us about your organization and collaboration goals.",
      html: `
        <form class="stack" data-modal-partner>
          <div class="grid grid--2">
            <label class="field">
              <span class="field__label">Organization</span>
              <input class="input" name="org" required />
            </label>
            <label class="field">
              <span class="field__label">Email</span>
              <input class="input" type="email" name="email" required />
            </label>
          </div>
          <label class="field">
            <span class="field__label">What are you looking for?</span>
            <textarea class="textarea" rows="4" name="msg" required></textarea>
          </label>
          <button class="btn btn--primary" type="submit">Submit</button>
        </form>
      `,
      primary: "Done",
      onPrimary() {
        closeModal();
      },
    },
    volunteer: {
      title: "Volunteer",
      desc: "Sign up to help with events, facilitation, or research support.",
      html: `
        <form class="stack" data-modal-volunteer>
          <div class="grid grid--2">
            <label class="field">
              <span class="field__label">Name</span>
              <input class="input" name="name" autocomplete="name" required />
            </label>
            <label class="field">
              <span class="field__label">Email</span>
              <input class="input" type="email" name="email" autocomplete="email" required />
            </label>
          </div>
          <label class="field">
            <span class="field__label">Area</span>
            <select class="select" name="area">
              <option value="events">Events</option>
              <option value="facilitation">Facilitation</option>
              <option value="research">Research</option>
              <option value="design">Design</option>
            </select>
          </label>
          <button class="btn btn--primary" type="submit">Send</button>
        </form>
      `,
      primary: "Done",
      onPrimary() {
        closeModal();
      },
    },
    rsvp: {
      title: "RSVP",
      desc: "Reserve a spot for the selected session (demo).",
      html: `
        <div class="stack">
          <p class="muted">In production, connect this to a real registration system.</p>
          <button class="btn btn--primary" type="button" data-rsvp-confirm>Confirm RSVP</button>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
    api: {
      title: "API access",
      desc: "This demo shows how you might present API documentation / keys.",
      html: `
        <div class="stack">
          <div class="card card--soft">
            <p><strong>Endpoint</strong></p>
            <p class="muted small"><code>GET /v1/aggregates?region=...&amp;from=...&amp;to=...</code></p>
          </div>
          <p class="muted">Replace with real docs or a link to your developer portal.</p>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
    privacy: {
      title: "Privacy policy",
      desc: "Demo content — replace with your real policy text.",
      html: `
        <div class="stack">
          <p class="muted">
            We collect only the data needed to respond to inquiries and improve our services.
            We do not sell personal information.
          </p>
          <ul class="bullets" role="list">
            <li>Data minimization</li>
            <li>Purpose limitation</li>
            <li>Security controls</li>
          </ul>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
    terms: {
      title: "Terms of use",
      desc: "Demo content — replace with your real terms.",
      html: `
        <div class="stack">
          <p class="muted">Use this site responsibly. Content is provided “as-is”.</p>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
    team: {
      title: "Meet the team",
      desc: "A lightweight team view (demo).",
      html: `
        <div class="grid grid--2">
          <div class="card card--soft"><strong>Alex Rivera</strong><p class="muted small">Executive Director</p></div>
          <div class="card card--soft"><strong>Jordan Kim</strong><p class="muted small">Head of Research</p></div>
          <div class="card card--soft"><strong>Sam Patel</strong><p class="muted small">Partnerships Lead</p></div>
          <div class="card card--soft"><strong>Riley Chen</strong><p class="muted small">Program Ops</p></div>
        </div>
      `,
      primary: "Close",
      onPrimary() {
        closeModal();
      },
    },
  };

  const openModal = (name) => {
    if (!modalRoot || !modal || !backdrop || !modalContent) return;
    const tpl = modalTemplates[name];
    if (!tpl) return;

    modalOpen = true;
    modalRoot.hidden = false;
    document.documentElement.classList.add("modal-open");

    modalTitle.textContent = tpl.title || "Dialog";
    modalDesc.textContent = tpl.desc || "";
    modalContent.innerHTML = tpl.html || "";
    modalPrimary.textContent = tpl.primary || "Continue";

    // Wire template-specific events
    const wireForm = (sel, onSubmit) => {
      const form = $(sel, modalContent);
      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        onSubmit(new FormData(form));
      });
    };

    wireForm("[data-modal-newsletter]", (fd) => {
      const email = String(fd.get("email") || "").trim();
      toast(email ? `Subscribed: ${email}` : "Subscribed!");
      closeModal();
    });

    wireForm("[data-modal-partner]", (fd) => {
      const org = String(fd.get("org") || "").trim();
      toast(org ? `Partner request sent: ${org}` : "Partner request sent!");
      closeModal();
    });

    wireForm("[data-modal-volunteer]", (fd) => {
      const name2 = String(fd.get("name") || "").trim();
      toast(name2 ? `Thanks for volunteering, ${name2}!` : "Thanks for volunteering!");
      closeModal();
    });

    $("[data-rsvp-confirm]", modalContent)?.addEventListener("click", () => {
      toast("RSVP confirmed (demo).");
      closeModal();
    });

    $$("[data-give]", modalContent).forEach((b) => {
      b.addEventListener("click", () => {
        const amt = b.getAttribute("data-give");
        toast(amt === "custom" ? "Custom amount selected." : `Selected: $${amt}`);
      });
    });

    // Primary action
    modalPrimary.onclick = () => {
      tpl.onPrimary?.();
    };

    // Focus trap
    modalTrap?.activate();

    // Close buttons
    $$("[data-close-modal]", modalRoot).forEach((b) =>
      b.addEventListener("click", closeModal)
    );

    // Click backdrop closes
    backdrop.onclick = closeModal;

    // ESC closes
    document.addEventListener(
      "keydown",
      (e) => {
        if (!modalOpen) return;
        if (e.key === "Escape") closeModal();
      },
      { capture: true, once: false }
    );
  };

  const closeModal = () => {
    if (!modalRoot) return;
    if (!modalOpen) return;

    modalOpen = false;
    document.documentElement.classList.remove("modal-open");

    // animate out via CSS class if present
    modalRoot.classList.add("is-leaving");
    setTimeout(() => {
      modalRoot.classList.remove("is-leaving");
      modalRoot.hidden = true;
      if (modalContent) modalContent.innerHTML = "";
    }, 180);

    modalTrap?.deactivate();
  };

  const initModals = () => {
    $$("[data-open-modal]").forEach((el) => {
      el.addEventListener("click", () => {
        const name = el.getAttribute("data-open-modal");
        if (name) openModal(name);
      });
    });
  };

  // ----------------------------
  // Events list: render + search + filter
  // ----------------------------
  const eventsData = [
    {
      id: "e1",
      type: "workshop",
      title: "Partner onboarding workshop",
      dateLabel: "FEB 05",
      meta: "Virtual • 11:00 AM CT",
      desc: "A practical walkthrough of toolkits, reporting, and implementation support.",
    },
    {
      id: "e2",
      type: "briefing",
      title: "Quarterly impact briefing",
      dateLabel: "MAR 12",
      meta: "Virtual • 2:00 PM CT",
      desc: "Review outcomes, methods updates, and the next quarter roadmap.",
    },
    {
      id: "e3",
      type: "community",
      title: "Community roundtable",
      dateLabel: "APR 02",
      meta: "Chicago • 5:30 PM CT",
      desc: "Shared learning session with local partners and program alumni.",
    },
    {
      id: "e4",
      type: "workshop",
      title: "Measurement framework clinic",
      dateLabel: "APR 18",
      meta: "Virtual • 10:00 AM CT",
      desc: "Hands-on support implementing the framework in your context.",
    },
  ];

  const renderEvents = (items, root) => {
    if (!root) return;
    root.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.innerHTML = `<p><strong>No events found.</strong></p><p class="muted">Try adjusting your search or filter.</p>`;
      root.appendChild(empty);
      return;
    }

    items.forEach((ev) => {
      const [m, d] = ev.dateLabel.split(" ");
      const el = document.createElement("article");
      el.className = "row";
      el.setAttribute("role", "listitem");
      el.dataset.type = ev.type;
      el.dataset.title = ev.title.toLowerCase();

      el.innerHTML = `
        <div class="row__date">
          <div class="datepill">
            <span class="datepill__m">${m}</span>
            <span class="datepill__d">${d}</span>
          </div>
        </div>
        <div class="row__body">
          <h3 class="row__title">${ev.title}</h3>
          <p class="row__meta muted">${ev.meta} • ${capitalize(ev.type)}</p>
          <p class="row__desc">${ev.desc}</p>
        </div>
        <div class="row__actions">
          <button class="btn btn--sm" type="button" data-open-modal="rsvp">RSVP</button>
        </div>
      `;

      root.appendChild(el);
    });

    // Ensure new open-modal buttons work
    $$('[data-open-modal="rsvp"]', root).forEach((b) =>
      b.addEventListener("click", () => openModal("rsvp"))
    );
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const initEvents = () => {
    const listRoot = $('[data-list="events"]');
    if (!listRoot) return;

    // initial render (replace no-js skeleton)
    renderEvents(eventsData, listRoot);

    const searchInput = $('[data-search="events"]');
    const filterSelect = $('[data-filter="events"]');
    const resetBtn = $('[data-reset="events"]');

    const apply = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const type = filterSelect?.value || "all";

      const filtered = eventsData.filter((ev) => {
        const matchType = type === "all" ? true : ev.type === type;
        const hay = (ev.title + " " + ev.desc + " " + ev.meta).toLowerCase();
        const matchQ = q ? hay.includes(q) : true;
        return matchType && matchQ;
      });

      renderEvents(filtered, listRoot);
    };

    searchInput?.addEventListener("input", rafThrottle(apply));
    filterSelect?.addEventListener("change", apply);

    resetBtn?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (filterSelect) filterSelect.value = "all";
      apply();
      toast("Filters reset.");
    });
  };

  // ----------------------------
  // Forms: Newsletter + Contact (demo)
  // ----------------------------
  const initForms = () => {
    // Newsletter inline
    const newsletter = $("[data-newsletter]");
    newsletter?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(newsletter);
      const email = String(fd.get("email") || "").trim();
      toast(email ? `Subscribed: ${email}` : "Subscribed!");
      newsletter.reset();
    });

    // Contact
    const contact = $("[data-contact]");
    const status = $("[data-form-status]", contact || document);
    contact?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(contact);
      const name = String(fd.get("name") || "").trim();

      // Fake latency
      if (status) status.textContent = "Sending…";
      setTimeout(() => {
        if (status) status.textContent = "Message sent. We’ll reply soon.";
        toast(name ? `Thanks, ${name}! We received your message.` : "Message received.");
        contact.reset();
        // Clear status after a bit
        setTimeout(() => {
          if (status) status.textContent = "";
        }, 4500);
      }, 550);
    });
  };

  // ----------------------------
  // Back to top
  // ----------------------------
  const initBackToTop = () => {
    const btn = $("[data-back-to-top]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const motion = document.documentElement.dataset.motion || "full";
      window.scrollTo({
        top: 0,
        behavior: motion === "reduce" ? "auto" : "smooth",
      });
    });
  };

  // ----------------------------
  // Smooth anchor scrolling (respects reduced motion)
  // ----------------------------
  const initAnchors = () => {
    document.addEventListener("click", (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href === "#" || href.length < 2) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      const motion = document.documentElement.dataset.motion || "full";
      const y = target.getBoundingClientRect().top + window.scrollY - 76; // header offset

      window.scrollTo({ top: y, behavior: motion === "reduce" ? "auto" : "smooth" });

      // Update URL without jumping
      history.pushState(null, "", href);
    });
  };

  // ----------------------------
  // Init
  // ----------------------------
  initPreferences();
  initAnnouncement();
  initNav();
  initScrollProgress();
  initReveals();
  initCountUps();
  initMicroCharts();
  initParallax();
  initTabs();
  initModals();
  initEvents();
  initForms();
  initBackToTop();
  initAnchors();

  // Minor: warn if assets missing (optional)
  window.addEventListener("error", (e) => {
    // Avoid noisy errors; only log
    // eslint-disable-next-line no-console
    console.debug("Runtime error:", e?.message || e);
  });
})();