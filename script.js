(() => {
  "use strict";

  /* ---------------------------------
     Helpers
  --------------------------------- */
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  document.body.classList.remove("no-js");
  $("[data-year]") && ($("[data-year]").textContent = new Date().getFullYear());

  /* ---------------------------------
     Toasts
  --------------------------------- */
  const toastRoot = $("[data-toasts]");
  const toast = (msg) => {
    if (!toastRoot) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="toast__msg">${msg}</div>
      <button class="iconbtn toast__x">×</button>`;
    t.querySelector("button").onclick = () => t.remove();
    toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  };

  /* ---------------------------------
     Scroll progress
  --------------------------------- */
  const bar = $("[data-scroll-progress]");
  if (bar) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.transform = `scaleX(${clamp(p, 0, 1)})`;
    }, { passive: true });
  }

  /* ---------------------------------
     Navigation
  --------------------------------- */
  const navToggle = $("[data-nav-toggle]");
  const navPanel = $("#nav-panel");

  if (navToggle && navPanel) {
    navPanel.setAttribute("inert", "");
    navToggle.onclick = () => {
      const open = navPanel.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open);
      open ? navPanel.removeAttribute("inert") : navPanel.setAttribute("inert", "");
    };
  }

  /* ---------------------------------
     Count up
  --------------------------------- */
  $$("[data-count-to]").forEach(el => {
    const target = Number(el.dataset.countTo);
    let n = 0;
    const step = Math.max(1, target / 40);
    const tick = () => {
      n += step;
      if (n >= target) {
        el.textContent = target.toLocaleString();
      } else {
        el.textContent = Math.floor(n).toLocaleString();
        requestAnimationFrame(tick);
      }
    };
    tick();
  });

  /* ---------------------------------
     Sparkline
  --------------------------------- */
  const spark = $("[data-sparkline]");
  if (spark) {
    [2,3,4,3,5,6,5,7,8,7,9,10].forEach(v => {
      const b = document.createElement("div");
      b.className = "sparkline__bar";
      b.style.height = `${v * 8}%`;
      spark.appendChild(b);
    });
  }

  /* ---------------------------------
     MODAL SYSTEM (FIXED)
  --------------------------------- */
  const modalRoot = $("[data-modalroot]");
  const modalContent = $("[data-modal-content]");
  const modalTitle = $("#modal-title");
  const modalPrimary = $("[data-modal-primary]");
  const backdrop = $("[data-backdrop]");

  let modalOpen = false;

  const closeModal = () => {
    if (!modalRoot) return;

    modalOpen = false;
    document.documentElement.classList.remove("modal-open");

    modalRoot.classList.add("is-leaving");

    setTimeout(() => {
      modalRoot.hidden = true;
      modalRoot.classList.remove("is-leaving");
      modalContent.innerHTML = "";
    }, 180);

    // 🔥 HARD MOBILE RESET
    document.body.style.overflow = "";
    modalRoot.style.pointerEvents = "none";
    setTimeout(() => modalRoot.style.pointerEvents = "", 200);
  };

  const openModal = (title, html) => {
    if (!modalRoot) return;

    modalOpen = true;
    modalRoot.hidden = false;
    modalRoot.style.pointerEvents = "auto";
    document.documentElement.classList.add("modal-open");

    modalTitle.textContent = title;
    modalContent.innerHTML = html;

    modalPrimary.onclick = closeModal;
  };

  // Bind triggers
  $$("[data-open-modal]").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.openModal;
      openModal(
        type.charAt(0).toUpperCase() + type.slice(1),
        `<p class="muted">This is a demo <strong>${type}</strong> modal.</p>`
      );
    };
  });

  // Close handlers
  $$("[data-close-modal]").forEach(b => b.onclick = closeModal);
  backdrop && (backdrop.onclick = closeModal);

  document.addEventListener("keydown", e => {
    if (modalOpen && e.key === "Escape") closeModal();
  });

})();