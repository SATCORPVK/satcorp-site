/* =========================================================
   KORN 1990s THEME — script.js
   Raw • Distressed • Industrial • Late-90s Internet
   Works with the index.html I gave you:
   - Nav hover heat
   - Distort toggle
   - Panic kill
   - Fake transmit
   - Year stamp
   ========================================================= */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- YEAR ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- NAV HOVER HEAT ----------
  $$(".navbtn").forEach((a) => {
    a.addEventListener("mousemove", (e) => {
      const r = a.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      a.style.setProperty("--mx", mx + "%");
      a.style.setProperty("--my", my + "%");
    });
  });

  // ---------- SHAKE KEYFRAMES (INJECTED) ----------
  const inject = document.createElement("style");
  inject.textContent = `
    @keyframes shake{
      0%{transform:translate3d(0,0,0)}
      25%{transform:translate3d(0.6px,-0.4px,0)}
      50%{transform:translate3d(-0.5px,0.5px,0)}
      75%{transform:translate3d(0.4px,0.2px,0)}
      100%{transform:translate3d(0,0,0)}
    }
  `;
  document.head.appendChild(inject);

  // ---------- DISTORT MODE ----------
  const toggleBtn = $("#toggleDistort");
  let distortOn = false;

  const setDistort = (on) => {
    distortOn = !!on;

    if (toggleBtn) {
      toggleBtn.setAttribute("aria-pressed", String(distortOn));
      toggleBtn.textContent = distortOn ? "Toggle Distort (ON)" : "Toggle Distort";
    }

    if (distortOn) {
      document.body.style.filter = "contrast(1.08) saturate(1.06)";
      document.body.style.animation = "shake .22s steps(2,end) infinite";
    } else {
      document.body.style.filter = "";
      document.body.style.animation = "";
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setDistort(!distortOn);
    });
  }

  // ---------- PANIC KILL (RESET UI STATE) ----------
  const panicBtn = $("#panic");
  const statusEl = $("#status");
  const nameEl = $("#name");
  const channelEl = $("#channel");
  const msgEl = $("#msg");

  const resetForm = () => {
    if (nameEl) nameEl.value = "";
    if (channelEl) channelEl.value = "";
    if (msgEl) msgEl.value = "";
  };

  const setStatus = (t) => {
    if (statusEl) statusEl.textContent = t;
  };

  if (panicBtn) {
    panicBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setDistort(false);
      setStatus("offline");
      resetForm();

      // Remove hash + scroll to top
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (_) {
        window.location.hash = "";
      }

      // "instant" isn't standardized across browsers; use "auto"
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  // ---------- FAKE TRANSMIT (VISUAL FEEDBACK ONLY) ----------
  const sendBtn = $("#fakeSend");
  let txTimer1 = null;
  let txTimer2 = null;

  if (sendBtn) {
    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear existing timers
      if (txTimer1) clearTimeout(txTimer1);
      if (txTimer2) clearTimeout(txTimer2);

      setStatus("transmitting");
      txTimer1 = setTimeout(() => setStatus("sent"), 600);
      txTimer2 = setTimeout(() => setStatus("offline"), 2200);
    });
  }

  // ---------- OPTIONAL: SUBTLE AUDIO "PRESSURE" (OFF BY DEFAULT) ----------
  // If you ever want, you can wire a user-initiated button to create an AudioContext
  // and generate a low hum or noise—kept OFF here to avoid autoplay / permission issues.
})();
