/* Able Heart — script.js
   Works with the index.html + styles.css I provided.
   - Entrance gate
   - Modal system
   - Demo “player” (no real audio)
   - Toggle switches (ambient + liner notes)
   - Release/Moment card modals
   - Secret love-note modal
*/

(() => {
  // --- Helpers ---
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- Elements ---
  const gate = $("#gate");
  const enterBtn = $("#enterBtn");
  const playBtn = $("#playBtn");
  const openNoteBtn = $("#openNoteBtn");

  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalFoot = $("#modalFoot");
  const closeModalBtn = $("#closeModal");
  const linerBlock = $("#linerBlock");

  const ambSwitch = $("#ambSwitch");
  const linerSwitch = $("#linerSwitch");

  const trackTitle = $("#trackTitle");
  const trackMeta = $("#trackMeta");
  const nextBtn = $("#nextBtn");
  const togglePlay = $("#togglePlay");

  const mist = $(".mist");
  const grain = $(".grain");

  const releaseGrid = $("#releaseGrid");
  const visualsSection = $("#visuals");
  const secretBtn = $("#secretBtn");

  // --- State ---
  const tracks = [
    { title: "“Soft Static”", meta: "Demo track • 02:48 • headphone hours" },
    { title: "“Neon Lullaby”", meta: "Demo track • 03:12 • midnight glow" },
    { title: "“After the Show”", meta: "Demo track • 04:01 • city haze" }
  ];

  let t = 0;
  let playing = false;

  // --- Gate ---
  function hideGate() {
    if (!gate) return;
    gate.setAttribute("hidden", "true");
    // let fade transition finish then remove from layout
    setTimeout(() => {
      gate.style.display = "none";
    }, 650);
  }

  if (enterBtn) enterBtn.addEventListener("click", hideGate);

  // Optional: click outside the inner card to enter
  if (gate) {
    gate.addEventListener("click", (e) => {
      if (e.target === gate) hideGate();
    });
  }

  // --- Modal ---
  function openModal(title, desc, foot = "Press Esc to close") {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (modalTitle) modalTitle.textContent = title || "";
    if (modalDesc) modalDesc.textContent = desc || "";
    if (modalFoot) modalFoot.textContent = foot || "";

    // keep liner notes in sync with switch state
    syncLinerNotes();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function modalIsOpen() {
    return modal && modal.classList.contains("open");
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      // click backdrop closes
      if (e.target === modal) closeModal();
    });
  }

  // --- Keyboard (Esc closes modal; if none open, closes gate) ---
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (modalIsOpen()) closeModal();
    else if (gate && gate.style.display !== "none") hideGate();
  });

  // --- Switches ---
  function toggleSwitch(el) {
    if (!el) return false;
    el.classList.toggle("on");
    const on = el.classList.contains("on");
    el.setAttribute("aria-checked", on ? "true" : "false");
    return on;
  }

  function handleSwitchKey(el, e) {
    if (!el) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  }

  function syncLinerNotes() {
    if (!linerBlock || !linerSwitch) return;
    const on = linerSwitch.classList.contains("on");
    linerBlock.style.display = on ? "block" : "none";
  }

  // Ambient switch changes intensity of mist/grain (purely visual)
  if (ambSwitch) {
    ambSwitch.addEventListener("click", () => {
      const on = toggleSwitch(ambSwitch);
      if (mist) mist.style.opacity = on ? "1" : ".75";
      if (grain) grain.style.opacity = on ? ".15" : ".10";
    });
    ambSwitch.addEventListener("keydown", (e) => handleSwitchKey(ambSwitch, e));
  }

  // Liner notes switch reveals liner block inside modal
  if (linerSwitch) {
    linerSwitch.addEventListener("click", () => {
      toggleSwitch(linerSwitch);
      syncLinerNotes();
    });
    linerSwitch.addEventListener("keydown", (e) => handleSwitchKey(linerSwitch, e));
  }

  // --- Demo Player ---
  function setTrack(i) {
    t = (i + tracks.length) % tracks.length;
    if (trackTitle) trackTitle.textContent = tracks[t].title;
    if (trackMeta) trackMeta.textContent = tracks[t].meta;
  }

  function setPlaying(on) {
    playing = !!on;
    if (togglePlay) togglePlay.textContent = playing ? "❚❚ Pause" : "▶ Play";

    // tiny feedback pulse: swap accent briefly
    document.documentElement.style.setProperty("--accent", playing ? "#ff7aa5" : "#b88cff");
    setTimeout(() => {
      document.documentElement.style.setProperty("--accent", "#b88cff");
    }, 420);
  }

  if (nextBtn) nextBtn.addEventListener("click", () => setTrack(t + 1));

  if (togglePlay) {
    togglePlay.addEventListener("click", () => {
      setPlaying(!playing);
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      setPlaying(true);
      openModal(
        "Play the mood",
        "Drop your real Able Heart embed here (Spotify, Apple Music, YouTube). The layout is designed so the player feels like part of the atmosphere—not a loud widget.",
        "Tip: replace demo with an iframe embed"
      );
    });
  }

  // --- Cards: releases + moments open modal with their data attributes ---
  function bindCardClick(root) {
    if (!root) return;
    root.addEventListener("click", (e) => {
      const card = e.target.closest(".release");
      if (!card) return;
      const title = card.dataset.title || "Release";
      const desc = card.dataset.desc || "—";
      openModal(title, desc, "Click outside to close");
    });
  }

  bindCardClick(releaseGrid);

  if (visualsSection) {
    // only bind within visuals section so “release” cards elsewhere don’t double-fire
    $$("#visuals .release").forEach((el) => {
      el.addEventListener("click", () => {
        openModal(
          el.dataset.title || "Moment",
          el.dataset.desc || "—",
          "Click outside to close"
        );
      });
    });
  }

  // --- Secret note (edit this copy to be personal) ---
  if (secretBtn) {
    secretBtn.addEventListener("click", () => {
      openModal(
        "A note for you",
        "I know how much Able Heart means to you. So I wanted to build a place that feels the way the music makes you feel—quiet, beautiful, and real. This is my love letter in code.",
        "Replace this message with your exact words"
      );
      // Secret note is intentionally not a “liner notes” moment
      if (linerBlock) linerBlock.style.display = "none";
    });
  }

  if (openNoteBtn) {
    openNoteBtn.addEventListener("click", () => {
      if (secretBtn) secretBtn.click();
    });
  }

  // --- Optional: smooth anchor scroll (native fallback) ---
  // (Only apply if user hasn't requested reduced motion)
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // --- Initialize defaults ---
  setTrack(0);
  // gate stays until user clicks enter (intentional)
})();
