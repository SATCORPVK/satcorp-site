/* ===============================
   BLACKLIST SECURE INTERFACE
   script.js
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
  initBootSequence();
  initTimecode();
  initCaseNumber();
  initRedactions();
  initClearanceModal();
  initNavFeedback();
});

/* ---------- BOOT SEQUENCE ---------- */
function initBootSequence() {
  setTimeout(() => {
    document.body.classList.remove("booting");
    microGlitch();
  }, 800);
}

/* ---------- TIMECODE ---------- */
function initTimecode() {
  const timeEl = document.getElementById("timecode");

  function updateTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hh}:${mm}:${ss}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/* ---------- CASE NUMBER ROTATION ---------- */
function initCaseNumber() {
  const caseEl = document.getElementById("case-number");

  function generateCase() {
    const year = new Date().getFullYear();
    const block = Math.floor(Math.random() * 900 + 100);
    const serial = Math.floor(Math.random() * 9000 + 1000);
    caseEl.textContent = `${year}-${block}-${serial}`;
  }

  generateCase();
  setInterval(generateCase, 6000);
}

/* ---------- REDACTION FLICKER ---------- */
function initRedactions() {
  const redactedEls = document.querySelectorAll(".redacted");

  redactedEls.forEach(el => {
    el.addEventListener("mouseenter", () => {
      el.classList.add("revealed");
      setTimeout(() => el.classList.remove("revealed"), 600);
    });
  });
}

/* ---------- CLEARANCE MODAL ---------- */
function initClearanceModal() {
  const modal = document.getElementById("clearanceModal");
  const grantBtn = document.getElementById("grantClearance");

  if (!modal || !grantBtn) return;

  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("locked")) {
      modal.classList.remove("hidden");
      microGlitch();
    }
  });

  grantBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    flashStatus("CLEARANCE TEMPORARILY GRANTED");
  });
}

/* ---------- NAV FEEDBACK ---------- */
function initNavFeedback() {
  const tabs = document.querySelectorAll(".nav-tabs button");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      microGlitch();
    });
  });
}

/* ---------- MICRO GLITCH ---------- */
function microGlitch() {
  document.body.classList.add("glitch");

  setTimeout(() => {
    document.body.classList.remove("glitch");
  }, 120);
}

/* ---------- STATUS FLASH ---------- */
function flashStatus(message) {
  const footer = document.querySelector(".system-footer");
  if (!footer) return;

  const span = document.createElement("span");
  span.textContent = message;
  span.style.color = "#9b1c1c";
  span.style.marginLeft = "1rem";

  footer.appendChild(span);

  setTimeout(() => {
    span.remove();
  }, 2500);
}
