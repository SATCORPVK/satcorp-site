/* =========================================================
   HUNTER’S ARCHIVE — script.js
   Subtle motion, quiet menace, investigative UX
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------
     CORE ELEMENTS
     ------------------------ */
  const cover = document.getElementById("cover");
  const archive = document.getElementById("archive");
  const btnEnter = document.getElementById("btnEnter");

  const navItems = document.querySelectorAll(".nav__item");
  const panels = document.querySelectorAll(".panel");
  const crumbPath = document.getElementById("crumbPath");

  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalMeta = document.getElementById("modalMeta");
  const btnCloseModal = document.getElementById("btnCloseModal");

  const searchModal = document.getElementById("searchModal");
  const btnSearch = document.getElementById("btnSearch");
  const btnCloseSearch = document.getElementById("btnCloseSearch");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  const ambience = document.getElementById("ambience");
  const btnAudio = document.getElementById("btnAudio");
  const btnGlitch = document.getElementById("btnGlitch");

  /* ------------------------
     ENTER ARCHIVE
     ------------------------ */
  btnEnter.addEventListener("click", () => {
    cover.classList.add("is-hidden");
    archive.classList.remove("is-hidden");
    ambience.volume = 0.4;
  });

  /* ------------------------
     NAVIGATION
     ------------------------ */
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;

      navItems.forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");

      panels.forEach(panel => {
        panel.classList.toggle(
          "is-active",
          panel.dataset.panel === target
        );
      });

      crumbPath.textContent = `/${target}`;
    });
  });

  /* ------------------------
     MODAL SYSTEM
     ------------------------ */
  function openModal(title, body, meta = "— CLASSIFIED") {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modalMeta.textContent = meta;
    overlay.classList.remove("is-hidden");
    modal.showModal();
  }

  function closeModal() {
    modal.close();
    overlay.classList.add("is-hidden");
  }

  btnCloseModal.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  /* ------------------------
     JOURNAL FEED
     ------------------------ */
  const journalFeed = document.getElementById("journalFeed");
  const journalEntries = [
    "Salt ring broke at 2:11 AM. Wind wasn’t the cause.",
    "Dreamt of the road again. Same mile marker. Same blood.",
    "Whatever followed us knew the car by name.",
    "Never trust a town with too many churches.",
    "Radio turned on by itself. Gospel station. Wrong lyrics."
  ];

  journalFeed.innerHTML = journalEntries
    .map(
      note => `<p class="mono" style="margin-bottom:12px;">• ${note}</p>`
    )
    .join("");

  /* ------------------------
     CASE FILES
     ------------------------ */
  const casesGrid = document.getElementById("casesGrid");
  const cases = [
    {
      title: "Black River Shade",
      location: "Black River, WI",
      status: "unresolved",
      body: "Victims reported reflections moving independently. Avoid mirrors."
    },
    {
      title: "Cornfield Howler",
      location: "Harlan County, NE",
      status: "contained",
      body: "Iron rounds effective. Do not pursue after dusk."
    },
    {
      title: "Motel Room 217",
      location: "Route 61",
      status: "ongoing",
      body: "Entity responds to prayer. Not in a good way."
    }
  ];

  function renderCases(filter = "all") {
    casesGrid.innerHTML = "";
    cases
      .filter(c => filter === "all" || c.status === filter)
      .forEach(c => {
        const el = document.createElement("section");
        el.className = "card";
        el.innerHTML = `
          <div class="card__meta mono">${c.location}</div>
          <h3 class="card__title">${c.title}</h3>
          <p class="card__text">${c.body}</p>
          <span class="stamp stamp--red">${c.status.toUpperCase()}</span>
        `;
        el.addEventListener("click", () =>
          openModal(c.title, `<p>${c.body}</p>`, c.location)
        );
        casesGrid.appendChild(el);
      });
  }

  renderCases();

  document.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderCases(btn.dataset.filter);
    });
  });

  /* ------------------------
     BESTIARY
     ------------------------ */
  const bestiaryList = document.getElementById("bestiaryList");
  const bestiaryPage = document.getElementById("bestiaryPage");

  const creatures = [
    {
      name: "Wendigo",
      text: "Cannibal spirits of winter hunger. Fire works. So does mercy—sometimes."
    },
    {
      name: "Crossroad Demon",
      text: "Deals sealed in blood. Contract survives death."
    },
    {
      name: "Vengeful Spirit",
      text: "Salt, iron, and unfinished business."
    }
  ];

  creatures.forEach(creature => {
    const btn = document.createElement("button");
    btn.className = "relic";
    btn.innerHTML = `
      <span class="relic__name">${creature.name}</span>
      <span class="relic__warn">WARNING</span>
    `;
    btn.addEventListener("click", () => {
      bestiaryPage.innerHTML = `
        <h3>${creature.name}</h3>
        <p>${creature.text}</p>
      `;
    });
    bestiaryList.appendChild(btn);
  });

  /* ------------------------
     LORE
     ------------------------ */
  const loreText = document.getElementById("loreText");
  loreText.innerHTML = `
    <p>“And the watchers fell, and their names were stricken.”</p>
    <p class="muted">— Fragment, Book of Enoch (translated)</p>
    <p>The text warns that knowledge attracts attention.</p>
  `;

  /* ------------------------
     SAFE HOUSES
     ------------------------ */
  const safeGrid = document.getElementById("safeGrid");
  ["Colorado Springs", "Flagstaff", "Baton Rouge"].forEach(place => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3 class="card__title">${place}</h3>
      <p class="card__text">Stocked with salt, iron, and bad memories.</p>
    `;
    safeGrid.appendChild(el);
  });

  /* ------------------------
     ROAD / TIMELINE
     ------------------------ */
  const timeline = document.getElementById("timeline");
  ["Missouri → Kansas", "Kansas → Nebraska", "Nebraska → Wisconsin"].forEach(
    step => {
      const p = document.createElement("p");
      p.className = "mono";
      p.textContent = step;
      timeline.appendChild(p);
    }
  );

  /* ------------------------
     SEARCH
     ------------------------ */
  btnSearch.addEventListener("click", () => {
    searchModal.showModal();
    searchInput.focus();
  });

  btnCloseSearch.addEventListener("click", () => searchModal.close());

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    searchResults.innerHTML = "";

    [...cases.map(c => c.title), ...creatures.map(c => c.name)]
      .filter(item => item.toLowerCase().includes(q))
      .forEach(match => {
        const div = document.createElement("div");
        div.textContent = match;
        div.className = "mono";
        searchResults.appendChild(div);
      });
  });

  /* ------------------------
     AUDIO
     ------------------------ */
  btnAudio.addEventListener("click", () => {
    const state = btnAudio.dataset.state;
    if (state === "off") {
      ambience.play().catch(() => {});
      btnAudio.dataset.state = "on";
    } else {
      ambience.pause();
      btnAudio.dataset.state = "off";
    }
  });

  /* ------------------------
     GLITCH TOGGLE
     ------------------------ */
  btnGlitch.addEventListener("click", () => {
    document.querySelector(".fx-flicker").classList.toggle("is-hidden");
  });

  /* ------------------------
     KEYBINDS
     ------------------------ */
  document.addEventListener("keydown", e => {
    if (e.key === "/") {
      e.preventDefault();
      searchModal.showModal();
      searchInput.focus();
    }
    if (e.key === "Escape") {
      closeModal();
      searchModal.close();
    }
  });
});