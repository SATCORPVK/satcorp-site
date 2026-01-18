/* ===============================
   BLACKLIST // SECURE INTERFACE
   script.js
   =============================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     LIVE TIME CODE
     =============================== */
  const timeEl = document.getElementById("timecode");

  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toUTCString().slice(17, 25);
  }
  setInterval(updateTime, 1000);
  updateTime();

  /* ===============================
     TYPING CASE ID
     =============================== */
  const caseEl = document.getElementById("case-id");
  const caseNumber = `BL-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
  let idx = 0;

  function typeCase() {
    if (idx < caseNumber.length) {
      caseEl.textContent += caseNumber.charAt(idx);
      idx++;
      setTimeout(typeCase, 80);
    }
  }
  typeCase();

  /* ===============================
     NAV TAB SWITCH (VISUAL)
     =============================== */
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector(".nav-btn.active")?.classList.remove("active");
      btn.classList.add("active");

      glitch();
    });
  });

  /* ===============================
     CLEARANCE MODAL
     =============================== */
  const modal = document.getElementById("clearanceModal");
  const openButtons = document.querySelectorAll(".cta.primary");
  const grant = document.getElementById("grantAccess");
  const deny = document.getElementById("denyAccess");

  openButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      glitch();
    });
  });

  deny.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  grant.addEventListener("click", () => {
    modal.classList.add("hidden");
    stamp("ACCESS GRANTED");
  });

  /* ===============================
     GLITCH EFFECT
     =============================== */
  function glitch() {
    document.body.classList.add("glitch");
    setTimeout(() => document.body.classList.remove("glitch"), 120);
  }

  /* ===============================
     STAMP EFFECT
     =============================== */
  function stamp(text) {
    const stamp = document.createElement("div");
    stamp.textContent = text;
    stamp.style.position = "fixed";
    stamp.style.top = "50%";
    stamp.style.left = "50%";
    stamp.style.transform = "translate(-50%, -50%) rotate(-8deg)";
    stamp.style.fontFamily = "Oswald, sans-serif";
    stamp.style.fontSize = "3rem";
    stamp.style.color = "rgba(195,38,38,0.85)";
    stamp.style.border = "4px solid rgba(195,38,38,0.85)";
    stamp.style.padding = "0.5rem 1rem";
    stamp.style.zIndex = "2000";
    stamp.style.pointerEvents = "none";

    document.body.appendChild(stamp);

    setTimeout(() => {
      stamp.style.opacity = "0";
      stamp.style.transition = "opacity 0.6s ease";
    }, 400);

    setTimeout(() => stamp.remove(), 1200);
  }

});
