/*
====================================================
CHIEFS' MESS — QUARTERDECK SCRIPT
Full script.js:
- Shipboard DARK/LIGHT toggle (saved to localStorage)
- Falls back to system preference on first visit
- Handles the two data-action buttons:
    - Today’s Intent
    - Come Aboard
====================================================
*/

(() => {
  "use strict";

  const root = document.documentElement;

  // -----------------------------
  // THEME: Shipboard Dark / Light
  // -----------------------------
  const THEME_KEY = "shipboard-theme";
  const themeToggleBtn = document.getElementById("themeToggle");

  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  function setToggleLabel(theme) {
    if (!themeToggleBtn) return;
    if (theme === "light") {
      themeToggleBtn.textContent = "Shipboard: LIGHT";
      themeToggleBtn.setAttribute("aria-pressed", "true");
    } else {
      themeToggleBtn.textContent = "Shipboard: DARK";
      themeToggleBtn.setAttribute("aria-pressed", "false");
    }
  }

  /**
   * Apply theme
   * @param {"dark"|"light"} theme
   */
  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      setToggleLabel("light");
    } else {
      // Dark is the default (no attribute needed)
      root.removeAttribute("data-theme");
      setToggleLabel("dark");
    }
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return prefersLight ? "light" : "dark";
  }

  function toggleTheme() {
    const isLight = root.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // Initialize theme ASAP
  applyTheme(getInitialTheme());

  // Bind toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Optional: listen to system changes only if user hasn't chosen
  // (If you want system changes to always apply, remove the saved check)
  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = (e) => {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return; // user chose, don't override
      applyTheme(e.matches ? "light" : "dark");
    };

    // Modern + fallback binding
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onSystemChange);
    } else if (typeof mql.addListener === "function") {
      mql.addListener(onSystemChange);
    }
  }

  // -----------------------------
  // UI ACTIONS (data-action)
  // -----------------------------
  const INTENT_MESSAGE =
    "TODAY'S INTENT:\n" +
    "Maintain standards.\n" +
    "Train deliberately.\n" +
    "Document progress.\n" +
    "Take care of people.";

  const ABOARD_MESSAGE =
    "COME ABOARD — Quarterdeck acknowledged.\n" +
    "Execute with standards and accountability.";

  document.addEventListener("click", (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.getAttribute("data-action");

    switch (action) {
      case "open-announce":
        window.alert(INTENT_MESSAGE);
        break;

      case "come-aboard": {
        // If you want to require the checkbox before "Come Aboard":
        // Find the nearest gate form and check for an input[type="checkbox"]
        const gateForm = actionEl.closest("form");
        const ackBox = gateForm ? gateForm.querySelector('input[type="checkbox"]') : null;

        if (ackBox && !ackBox.checked) {
          window.alert("ACKNOWLEDGEMENT REQUIRED:\nCheck the box to come aboard.");
          return;
        }

        window.alert(ABOARD_MESSAGE);

        // Optional: Smooth scroll to Mess Board after acknowledging
        const target = document.querySelector("#messboard");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        break;
      }

      default:
        // Unknown action; do nothing
        break;
    }
  });

  // -----------------------------
  // OPTIONAL: Keyboard shortcut
  // Press "T" to toggle theme
  // -----------------------------
  document.addEventListener("keydown", (e) => {
    // Ignore typing in inputs/textareas
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    const isTypingField = tag === "input" || tag === "textarea" || e.target.isContentEditable;
    if (isTypingField) return;

    if (e.key === "t" || e.key === "T") {
      toggleTheme();
    }
  });

})();