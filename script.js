/* script.js — SATCORP // BLACKLIST TERMINAL
   - Theme toggle (dark <-> light)
   - Nav routing (sections)
   - Search + filter on Blacklist index
   - Dossier modal open/close + populate
   - Redaction reveal effect + typing/scanline polish
*/

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Smoothly prefer reduced motion users
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- State ----------
  const state = {
    theme: "dark",
    route: "home",
    query: "",
    threat: "all",
    activeId: null
  };

  // ---------- Demo Data ----------
  // (Replace with your own later; keep structure)
  const BLACKLIST = [
    {
      id: 1,
      number: "001",
      name: "THE BROKER",
      alias: "Sable",
      specialty: "Connections / Information Arbitrage",
      threat: 5,
      status: "ACTIVE",
      lastKnown: "Chicago, IL",
      summary:
        "A high-tier intermediary who sells leverage. Never the hands—always the phone. Known to broker deals between rival crews.",
      associates: ["The Fixer", "The Courier"],
      evidence: [
        { type: "doc", title: "Intercepted Call Transcript", tag: "EVID-1042" },
        { type: "img", title: "Surveillance Still", tag: "EVID-1101" }
      ],
      timeline: [
        "48h: Contact pinged near a freight yard.",
        "6d: Payment trail flagged via shell accounts.",
        "3w: Last confirmed meet with 'The Fixer'."
      ]
    },
    {
      id: 2,
      number: "014",
      name: "THE FORGER",
      alias: "Ivory",
      specialty: "Documents / IDs / Passports",
      threat: 4,
      status: "ACTIVE",
      lastKnown: "Dallas, TX",
      summary:
        "Produces near-perfect identities with chain-of-custody clean rooms. Suspected links to multiple border crossings.",
      associates: ["The Broker"],
      evidence: [
        { type: "doc", title: "Recovered Template Pack", tag: "EVID-0933" },
        { type: "doc", title: "Customs Alert Notice", tag: "EVID-0990" }
      ],
      timeline: [
        "12h: New batch flagged at port of entry.",
        "9d: Printer signature matched to prior cases."
      ]
    },
    {
      id: 3,
      number: "022",
      name: "THE COURIER",
      alias: "Marrow",
      specialty: "High-risk Transport",
      threat: 3,
      status: "COLD",
      lastKnown: "Unknown (Midwest)",
      summary:
        "Moves packages nobody else will touch. Operates on dead drops and burned routes. Always one step ahead of surveillance.",
      associates: ["The Broker"],
      evidence: [{ type: "img", title: "Route Heat Snapshot", tag: "EVID-0717" }],
      timeline: [
        "2m: Activity dropped off after sting attempt.",
        "5m: Vehicle burned; identity unconfirmed."
      ]
    },
    {
      id: 4,
      number: "031",
      name: "THE FIXER",
      alias: "Cinder",
      specialty: "Cleanup / Extraction",
      threat: 5,
      status: "ACTIVE",
      lastKnown: "Houston, TX",
      summary:
        "If a problem exists, this subject makes it disappear. Specialists on retainer. High collateral risk.",
      associates: ["The Broker"],
      evidence: [
        { type: "doc", title: "Incident Report (Redacted)", tag: "EVID-1204" },
        { type: "img", title: "Bodycam Fragment", tag: "EVID-1209" }
      ],
      timeline: [
        "24h: Contact with known associate detected.",
        "2w: Linked to extraction in industrial zone."
      ]
    }
  ];

  // ---------- DOM ----------
  const dom = {
    html: document.documentElement,
    body: document.body,
    themeBtn: $('[data-action="toggle-theme"]'),
    routeLinks: $$('[data-route]'),
    sections: $$("section[data-view]"),
    statusRoute: $('[data-bind="route"]'),
    statusTime: $('[data-bind="timecode"]'),
    statusConn: $('[data-bind="connection"]'),

    // Blacklist index
    searchInput: $('[data-bind="search"]'),
    threatSelect: $('[data-bind="threat"]'),
    listWrap: $('[data-bind="blacklist"]'),
    resultsCount: $('[data-bind="results-count"]'),

    // Modal
    modal: $("#dossierModal"),
    modalClose: $('[data-action="close-modal"]'),
    modalTitle: $('[data-bind="dossier-title"]'),
    modalMeta: $('[data-bind="dossier-meta"]'),
    modalSummary: $('[data-bind="dossier-summary"]'),
    modalTimeline: $('[data-bind="dossier-timeline"]'),
    modalAssoc: $('[data-bind="dossier-associates"]'),
    modalEvidence: $('[data-bind="dossier-evidence"]'),

    // FX layers
    scanline: $("#scanline"),
    toast: $("#toast")
  };

  // ---------- FX: Timecode ----------
  function startTimecode() {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      const t = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      if (dom.statusTime) dom.statusTime.textContent = t;
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Theme ----------
  function loadTheme() {
    const saved = localStorage.getItem("blacklist_theme");
    state.theme = saved === "light" ? "light" : "dark";
    dom.html.dataset.theme = state.theme;
    updateThemeButton();
  }

  function updateThemeButton() {
    if (!dom.themeBtn) return;
    const next = state.theme === "dark" ? "LIGHT" : "DARK";
    dom.themeBtn.setAttribute("aria-label", `Switch theme to ${next}`);
    dom.themeBtn.textContent = `THEME: ${next}`;
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    dom.html.dataset.theme = state.theme;
    localStorage.setItem("blacklist_theme", state.theme);
    updateThemeButton();
    toast(`Theme set: ${state.theme.toUpperCase()}`);
  }

  // ---------- Routing ----------
  function setRoute(route) {
    state.route = route;

    // Update active nav
    dom.routeLinks.forEach((a) => {
      const isActive = a.dataset.route === route;
      a.classList.toggle("is-active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // Show section
    dom.sections.forEach((sec) => {
      sec.hidden = sec.dataset.view !== route;
    });

    // Update status
    if (dom.statusRoute) dom.statusRoute.textContent = route.toUpperCase();

    // Push hash
    if (location.hash.replace("#", "") !== route) {
      history.replaceState(null, "", `#${route}`);
    }

    // Small scanline pulse on route change
    pulseScanline();
  }

  function initRouting() {
    dom.routeLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setRoute(a.dataset.route);
      });
    });

    // Load from hash
    const fromHash = location.hash ? location.hash.replace("#", "") : "";
    const route = dom.sections.some((s) => s.dataset.view === fromHash) ? fromHash : "home";
    setRoute(route);
  }

  // ---------- Connection status ----------
  function setConnectionStatus() {
    if (!dom.statusConn) return;
    // Simulated status
    const status = "ENCRYPTED";
    dom.statusConn.textContent = status;
  }

  // ---------- Toast ----------
  let toastTimer = null;
  function toast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 1400);
  }

  // ---------- Scanline pulse ----------
  function pulseScanline() {
    if (!dom.scanline || prefersReduced) return;
    dom.scanline.classList.remove("pulse");
    // reflow
    void dom.scanline.offsetWidth;
    dom.scanline.classList.add("pulse");
  }

  // ---------- Render Blacklist ----------
  function threatLabel(n) {
    const map = { 1: "LOW", 2: "GUARDED", 3: "ELEVATED", 4: "SEVERE", 5: "CRITICAL" };
    return map[n] || "UNKNOWN";
  }

  function threatBadge(n) {
    const label = threatLabel(n);
    return `<span class="badge badge--t${n}" title="Threat: ${label}">${label}</span>`;
  }

  function matches(item, query, threat) {
    const q = query.trim().toLowerCase();
    const tOk = threat === "all" ? true : String(item.threat) === threat;

    if (!q) return tOk;
    const hay = [
      item.number,
      item.name,
      item.alias,
      item.specialty,
      item.lastKnown,
      item.status
    ]
      .join(" ")
      .toLowerCase();

    return tOk && hay.includes(q);
  }

  function renderList() {
    if (!dom.listWrap) return;

    const filtered = BLACKLIST.filter((i) => matches(i, state.query, state.threat));

    if (dom.resultsCount) dom.resultsCount.textContent = String(filtered.length);

    dom.listWrap.innerHTML = filtered
      .map((i) => {
        return `
          <article class="card dossier-card" tabindex="0" role="button"
            aria-label="Open dossier for ${i.name}"
            data-open="${i.id}">
            <div class="card__top">
              <div class="stamp">BLACKLIST #${i.number}</div>
              <div class="card__badges">
                ${threatBadge(i.threat)}
                <span class="badge badge--status">${i.status}</span>
              </div>
            </div>

            <h3 class="card__title">${escapeHtml(i.name)}</h3>
            <div class="card__meta">
              <div><span class="k">ALIAS</span> <span class="v redacted" data-redact>${escapeHtml(
                i.alias
              )}</span></div>
              <div><span class="k">SPECIALTY</span> <span class="v">${escapeHtml(
                i.specialty
              )}</span></div>
              <div><span class="k">LAST KNOWN</span> <span class="v redacted" data-redact>${escapeHtml(
                i.lastKnown
              )}</span></div>
            </div>

            <p class="card__summary">${escapeHtml(i.summary)}</p>
            <div class="card__footer">
              <span class="mono dim">EVIDENCE: ${i.evidence.length}</span>
              <span class="mono dim">ASSOCIATES: ${i.associates.length}</span>
              <span class="mono dim">OPEN ➜</span>
            </div>
          </article>
        `;
      })
      .join("");

    // Bind open events
    $$("[data-open]", dom.listWrap).forEach((el) => {
      el.addEventListener("click", () => openDossier(Number(el.dataset.open)));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDossier(Number(el.dataset.open));
        }
      });
    });

    // Hook redactions
    initRedactions(dom.listWrap);
  }

  // ---------- Modal ----------
  function openDossier(id) {
    const item = BLACKLIST.find((x) => x.id === id);
    if (!item || !dom.modal) return;

    state.activeId = id;

    if (dom.modalTitle) dom.modalTitle.textContent = `${item.name} // #${item.number}`;

    if (dom.modalMeta) {
      dom.modalMeta.innerHTML = `
        <div class="metaRow"><span class="k">ALIAS</span> <span class="v redacted" data-redact>${escapeHtml(
          item.alias
        )}</span></div>
        <div class="metaRow"><span class="k">SPECIALTY</span> <span class="v">${escapeHtml(
          item.specialty
        )}</span></div>
        <div class="metaRow"><span class="k">THREAT</span> <span class="v">${threatLabel(
          item.threat
        )} (${item.threat}/5)</span></div>
        <div class="metaRow"><span class="k">STATUS</span> <span class="v">${escapeHtml(
          item.status
        )}</span></div>
        <div class="metaRow"><span class="k">LAST KNOWN</span> <span class="v redacted" data-redact>${escapeHtml(
          item.lastKnown
        )}</span></div>
      `;
    }

    if (dom.modalSummary) dom.modalSummary.textContent = item.summary;

    if (dom.modalTimeline) {
      dom.modalTimeline.innerHTML = item.timeline
        .map((t) => `<li><span class="dot"></span><span>${escapeHtml(t)}</span></li>`)
        .join("");
    }

    if (dom.modalAssoc) {
      dom.modalAssoc.innerHTML =
        item.associates.length === 0
          ? `<span class="dim">None on record.</span>`
          : item.associates.map((a) => `<span class="pill">${escapeHtml(a)}</span>`).join("");
    }

    if (dom.modalEvidence) {
      dom.modalEvidence.innerHTML = item.evidence
        .map((e) => {
          const icon = e.type === "img" ? "▣" : "▤";
          return `
            <div class="evidence">
              <div class="evidence__icon" aria-hidden="true">${icon}</div>
              <div class="evidence__body">
                <div class="evidence__title">${escapeHtml(e.title)}</div>
                <div class="evidence__tag mono dim">${escapeHtml(e.tag)}</div>
              </div>
              <button class="btn btn--ghost small" type="button" data-action="fake-decrypt">DECRYPT</button>
            </div>
          `;
        })
        .join("");
    }

    // Show modal
    dom.modal.classList.add("open");
    dom.modal.setAttribute("aria-hidden", "false");
    dom.body.classList.add("no-scroll");

    // Bind decrypt buttons
    $$('[data-action="fake-decrypt"]', dom.modal).forEach((b) => {
      b.addEventListener("click", () => toast("Decrypting… ACCESS DENIED"));
    });

    initRedactions(dom.modal);
    pulseScanline();

    // Typing effect for meta if motion allowed
    if (!prefersReduced) typeIn(dom.modalMeta, 12);
  }

  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove("open");
    dom.modal.setAttribute("aria-hidden", "true");
    dom.body.classList.remove("no-scroll");
    state.activeId = null;
  }

  function initModalEvents() {
    if (dom.modalClose) dom.modalClose.addEventListener("click", closeModal);
    if (dom.modal) {
      dom.modal.addEventListener("click", (e) => {
        if (e.target === dom.modal) closeModal();
      });
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dom.modal?.classList.contains("open")) closeModal();
    });
  }

  // ---------- Redaction Reveal ----------
  function initRedactions(root) {
    $$("[data-redact]", root).forEach((el) => {
      if (el.dataset.bound) return;
      el.dataset.bound = "1";

      // store original
      if (!el.dataset.original) el.dataset.original = el.textContent;

      el.addEventListener("mouseenter", () => {
        if (prefersReduced) return;
        el.classList.add("reveal");
        setTimeout(() => el.classList.remove("reveal"), 700);
      });
      el.addEventListener("focus", () => {
        if (prefersReduced) return;
        el.classList.add("reveal");
        setTimeout(() => el.classList.remove("reveal"), 700);
      });
    });
  }

  // ---------- Typing / Terminal reveal ----------
  async function typeIn(container, cps = 14) {
    if (!container || prefersReduced) return;

    const nodes = Array.from(container.childNodes);
    const full = container.innerHTML;
    container.innerHTML = "";
    container.style.opacity = "1";

    // Type as plain text, then restore HTML to avoid breaking tags.
    const text = stripHtml(full);
    const delay = Math.floor(1000 / clamp(cps, 6, 30));

    for (let i = 0; i < text.length; i++) {
      container.textContent += text[i];
      if (i % 3 === 0) await sleep(delay);
    }

    // Restore
    container.innerHTML = full;
  }

  function stripHtml(html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || d.innerText || "";
  }

  // ---------- Search / Filters ----------
  function initSearch() {
    if (dom.searchInput) {
      dom.searchInput.addEventListener("input", (e) => {
        state.query = e.target.value;
        renderList();
      });
    }
    if (dom.threatSelect) {
      dom.threatSelect.addEventListener("change", (e) => {
        state.threat = e.target.value;
        renderList();
      });
    }
  }

  // ---------- Safety: escape ----------
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------- Init ----------
  function init() {
    loadTheme();
    setConnectionStatus();
    startTimecode();

    if (dom.themeBtn) dom.themeBtn.addEventListener("click", toggleTheme);

    initRouting();
    initModalEvents();
    initSearch();
    renderList();

    // initial redactions across page
    initRedactions(document);

    // First-load pulse
    pulseScanline();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
