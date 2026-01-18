(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ----- Year -----
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ----- Theme toggle (saved) -----
  const THEME_KEY = "pws_theme";
  const themeToggle = $('[data-theme-toggle]');

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;

    // Default to system preference
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
      toast(`Theme: ${next}`);
    });
  }

  // ----- Mobile nav -----
  const navToggle = $('[data-nav-toggle]');
  const navMenu = $('[data-nav-menu]');

  function setNavOpen(open) {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navMenu.classList.toggle("is-open", open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!isOpen);
    });

    // Close menu when clicking a link (mobile)
    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && window.matchMedia("(max-width: 780px)").matches) {
        setNavOpen(false);
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    // Close if clicking outside
    document.addEventListener("click", (e) => {
      if (!window.matchMedia("(max-width: 780px)").matches) return;
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      const clickedInside = navMenu.contains(e.target) || navToggle.contains(e.target);
      if (!clickedInside) setNavOpen(false);
    });
  }

  // ----- Header elevate on scroll -----
  const header = $('[data-elevate-on-scroll]');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-elevated", window.scrollY > 6);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ----- Scrollspy -----
  const sectionEls = $$("[data-section]");
  const navLinks = $$(".nav-link").filter(a => a.getAttribute("href")?.startsWith("#"));

  function setCurrent(hash) {
    navLinks.forEach(a => {
      const isCurrent = a.getAttribute("href") === hash;
      if (isCurrent) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  if (sectionEls.length && navLinks.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(en => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const id = visible.target.id;
      if (id) setCurrent(`#${id}`);
    }, { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.35] });

    sectionEls.forEach(s => io.observe(s));
  }

  // ----- Accordion -----
  const acc = $('[data-accordion]');
  if (acc) {
    acc.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-btn");
      if (!btn) return;

      const item = btn.closest(".acc-item");
      const panel = item?.querySelector(".acc-panel");
      if (!panel) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  // ----- Contact form validation (demo) -----
  const form = $("#contactForm");
  const toastEl = $("[data-toast]");

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;

    window.clearTimeout(toastEl._t);
    toastEl._t = window.setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function setError(name, msg) {
    const el = document.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
    if (el) el.textContent = msg || "";
  }

  function validateField(input) {
    const name = input.name;
    if (!name) return true;

    // Clear any previous message
    setError(name, "");

    if (input.validity.valid) return true;

    let msg = "Please enter a valid value.";
    if (input.validity.valueMissing) msg = "This field is required.";
    else if (input.validity.typeMismatch) msg = "Please enter a valid format.";
    else if (input.validity.tooShort) msg = `Please use at least ${input.minLength} characters.`;

    setError(name, msg);
    return false;
  }

  if (form) {
    const inputs = $$("input, textarea, select", form);

    inputs.forEach((inp) => {
      inp.addEventListener("blur", () => validateField(inp));
      inp.addEventListener("input", () => {
        // live clear when fixed
        if (inp.validity.valid) setError(inp.name, "");
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const ok = inputs.map(validateField).every(Boolean);

      if (!ok) {
        toast("Please fix the highlighted fields.");
        const firstError = inputs.find(i => !i.validity.valid);
        firstError?.focus();
        return;
      }

      // Demo behavior: “submit” locally
      const data = Object.fromEntries(new FormData(form).entries());
      console.log("Contact form submission (demo):", data);

      form.reset();
      toast("Message sent (demo). Hook this to a backend to email it!");
    });
  }
})();
