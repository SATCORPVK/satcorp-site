// -----------------------------
// THEME TOGGLE (FULL)
// -----------------------------
const THEME_KEY = "theme_preference";
const toggleBtn = document.querySelector("[data-theme-toggle]");
const yearEl = document.getElementById("year");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;

  // fallback to system preference
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

// Initial load
applyTheme(getSavedTheme());

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

// Footer year
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
