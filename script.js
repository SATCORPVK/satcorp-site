// script.js
(() => {
  "use strict";

  // -----------------------------
  // Data (you can replace these)
  // -----------------------------
  const subjects = [
    {
      id: "BL-014",
      number: 14,
      name: "THE CLEANER",
      alias: "Mason Vale",
      specialty: "Removal & evidence sanitation",
      threat: "high",
      status: "ACTIVE",
      lastKnown: "Chicago, IL",
      confidence: "67%",
      verifiedAt: minutesAgo(186),
      overview:
        "A private operator specializing in post-event sanitation—physical cleanup, digital erasure, and witness displacement. Works through proxies and dead drops.",
      notes: [
        "Prefers service corridors, loading bays, and municipal access points.",
        "Uses disposable devices; contact windows under 90 seconds.",
        "Suspected ties to multiple financial mules and a forged custody chain."
      ],
      associates: [27, 3],
      evidence: ["E-7712", "E-2280", "E-9001"]
    },
    {
      id: "BL-027",
      number: 27,
      name: "THE FORGER",
      alias: "Elena Koss",
      specialty: "Identity fabrication & travel vectors",
      threat: "critical",
      status: "ACTIVE",
      lastKnown: "Unknown (EU transit)",
      confidence: "54%",
      verifiedAt: minutesAgo(420),
      overview:
        "Produces high-fidelity identities and travel documents. Known to seed false leads while routing assets through legitimate corporate structures.",
      notes: [
        "Operates via boutique legal offices and medical credential pipelines.",
        "Leverages 'clean' intermediaries with no obvious criminal profile.",
        "Redaction request pending on cross-border liaison."
      ],
      associates: [14, 9],
      evidence: ["E-1402", "E-6134"]
    },
    {
      id: "BL-003",
      number: 3,
      name: "THE BROKER",
      alias: "Silas Roe",
      specialty: "Information exchange & asset placement",
      threat: "elevated",
      status: "SURVEILLANCE",
      lastKnown: "New York, NY",
      confidence: "72%",
      verifiedAt: minutesAgo(92),
      overview:
        "A human switchboard for sensitive intel. Trades in access—where, when, and who. Rarely handles contraband directly.",
      notes: [
        "Public-facing philanthropy is likely operational cover.",
        "Favors art events and private tastings as contact venues.",
        "Pattern suggests a new handler entering the network."
      ],
      associates: [14],
      evidence: ["E-3319", "E-4400", "E-1055"]
    },
    {
      id: "BL-009",
      number: 9,
      name: "THE PHARMACIST",
      alias: "Dr. Harlow S.",
      specialty: "Illicit compounds & field sedation",
      threat: "high",
      status: "ACTIVE",
      lastKnown: "St. Louis, MO",
      confidence: "61%",
      verifiedAt: minutesAgo(240),
      overview:
        "Runs a quiet supply chain for specialized compounds: sedation, compliance, and memory disruption. Packaging mimics hospital stock.",
      notes: [
        "Uses after-hours clinic access; shifts rotate to avoid pattern.",
        "Cold-storage courier network likely subcontracted.",
        "Suspected tie to missing-person case cluster."
      ],
      associates: [27],
      evidence: ["E-0909", "E-7721"]
    },
    {
      id: "BL-041",
      number: 41,
      name: "THE DRIVER",
      alias: "K. Mercer",
      specialty: "Exfiltration & pursuit denial",
      threat: "elevated",
      status: "COLD",
      lastKnown: "Phoenix, AZ",
      confidence: "38%",
      verifiedAt: minutesAgo(980),
      overview:
        "Professional exfiltrator. Leaves no signature beyond timing—intersections, service roads, and plate rotations. Known for non-linear routes.",
      notes: [
        "Rarely communicates. Prefers single-use codes in public signage.",
        "May be contracting through third-party logistics firms.",
        "Vehicle profiles indicate rapid mid-route swaps."
      ],
      associates: [],
      evidence: ["E-4102"]
    }
  ];

  const cases = [
    {
      title: "OP: NIGHT GLASS",
      status: "ACTIVE",
      summary:
        "Locate the identity pipeline feeding forged clearances into municipal systems. Priority is isolating the broker chain without alerting the handler.",
      tags: ["Intel: Moderate", "Lead: Hot", "Scope: Citywide"],
      progress: 62
    },
    {
      title: "OP: HOLLOW SEAL",
      status: "ACTIVE",
      summary:
        "Track evidence disappearances across three jurisdictions. Pattern indicates sanitation crew with digital access to custody logs.",
      tags: ["Intel: Medium", "Lead: Warm", "Scope: Multi-agency"],
      progress: 47
    },
    {
      title: "OP: IRON LANTERN",
      status: "COLD",
      summary:
        "Historic exfil routes reactivated. Suspect a new transport coordinator. Monitoring transit data for the next ripple.",
      tags: ["Intel: Low", "Lead: Cold", "Scope: Regional"],
      progress: 19
    }
  ];

  const evidence = [
    { id: "E-7712", title: "Custody Log Fragment", sub: "Checksum mismatch", seal: "CHAIN OK", type: "DOC" },
    { id: "E-2280", title: "Transit Camera Still", sub: "Partial plate, 02:11", seal: "SEALED", type: "IMG" },
    { id: "E-9001", title: "Burner Device Dump", sub: "Contacts redacted", seal: "SEALED", type: "BIN" },
    { id: "E-1402", title: "Passport Substrate", sub: "Fiber anomalies", seal: "CHAIN OK", type: "MAT" },
    { id: "E-6134", title: "Ledger Snapshot", sub: "Escrow routing", seal: "SEALED", type: "DOC" },
    { id: "E-3319", title: "Venue Guest List", sub: "Two false names", seal: "CHAIN OK", type: "DOC" },
    { id: "E-4400", title: "Audio Clip", sub: "Coded phrase", seal: "SEALED", type: "AUD" },
    { id: "E-1055", title: "Keycard Clone", sub: "RF profile match", seal: "CHAIN OK", type: "HW" },
    { id: "E-0909", title: "Cold-Pack Label", sub: "Clinic origin", seal: "SEALED", type: "MAT" },
    { id: "E-7721", title: "Invoice Bundle", sub: "Routing patterns", seal: "SEALED", type: "DOC" },
    { id: "E-4102", title: "Toll Data Slice", sub: "Loop route", seal: "CHAIN OK", type: "DAT" }
  ];

  const intelLines = [
    "Unverified sighting: subject moved through service entrance, no CCTV confirmation.",
    "New alias detected in travel manifests; confidence 0.61.",
    "Intercepted message mentions 'clean hands' and a 12-minute window.",
    "Custody chain updated externally—possible admin credential compromise.",
    "Contact venue changed last minute; pattern consistent with broker protocols.",
    "Heat signature spike near transit hub; unit dispatched for soft surveillance."
  ];

  const notes = [
    { title: "Directive", body: "Avoid direct contact. Prioritize link analysis. Build the network before the arrest.", meta: "TASK FORCE // 04:12Z" },
    { title: "Risk", body: "Assume compromised custody logs. Validate with independent timestamps and physical chain markers.", meta: "OPS NOTE // 04:31Z" },
    { title: "Opportunity", body: "Associate crosslinks suggest a shared handler. Look for the quiet node—the one who never appears twice.", meta: "ANALYST // 05:09Z" }
  ];

  const transcriptSegments = [
    [
      { t: "00:14", who: "AGENT", text: "You moved three assets without leaving a print. That's not luck." },
      { t: "00:22", who: "SUBJECT", text: "Prints are for people who like to be found." },
      { t: "00:31", who: "AGENT", text: "We have your chain. One call and it collapses." },
      { t: "00:38", who: "SUBJECT", text: "You have a <span class='redacted'>████████</span>. Not a chain." }
    ],
    [
      { t: "02:07", who: "AGENT", text: "Why Chicago?" },
      { t: "02:10", who: "SUBJECT", text: "Because the city forgets. It forgets fast." },
      { t: "02:18", who: "AGENT", text: "You didn't answer the question." },
      { t: "02:22", who: "SUBJECT", text: "I did. You just don't like it." }
    ],
    [
      { t: "05:41", who: "AGENT", text: "Name your handler." },
      { t: "05:44", who: "SUBJECT", text: "If I had one, I'd be dead." },
      { t: "05:52", who: "AGENT", text: "We can protect you." },
      { t: "05:56", who: "SUBJECT", text: "Protection is a <span class='wave'>~ waveform ~</span> until the lights go out." }
    ]
  ];

  // -----------------------------
  // Utilities
  // -----------------------------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function uid() {
    return Math.random().toString(16).slice(2, 10).toUpperCase();
  }

  function minutesAgo(mins) {
    // store as epoch ms
    return Date.now() - mins * 60_000;
  }

  function timeSince(ms) {
    const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[ch]));
  }

  function glitch(el) {
    el.classList.remove("glitch");
    void el.offsetWidth; // reflow
    el.classList.add("glitch");
  }

  // -----------------------------
  // Elements
  // -----------------------------
  const sessionIdEl = $("#sessionId");
  const clockEl = $("#clock");
  const btnToggleEffects = $("#btnToggleEffects");
  const tabs = $all(".tab[data-view]");
  const views = $all(".view");
  const ledgerEl = $("#ledger");
  const resultsCountEl = $("#resultsCount");
  const searchInput = $("#searchInput");
  const btnClearSearch = $("#btnClearSearch");

  const mostWantedEl = $("#mostWanted");
  const taskNotesEl = $("#taskNotes");
  const intelFeedEl = $("#intelFeed");

  const casesGridEl = $("#casesGrid");
  const lockerGridEl = $("#lockerGrid");

  const transcriptEl = $("#transcript");
  const scrubHintEl = $("#scrubHint");
  const btnLoadLog = $("#btnLoadLog");
  const btnRedactToggle = $("#btnRedactToggle");

  const btnOpenCurrent = $("#btnOpenCurrent");

  // hero meta
  const currentCaseLabelEl = $("#currentCaseLabel");
  const currentCaseSubEl = $("#currentCaseSub");
  const intelBarEl = $("#intelBar");
  const intelHintEl = $("#intelHint");
  const lastVerifiedEl = $("#lastVerified");
  const timeSinceEl = $("#timeSince");

  // modal
  const dossierModal = $("#dossierModal");
  const btnCloseModal = $("#btnCloseModal");
  const btnCopyDossier = $("#btnCopyDossier");
  const btnRequestClearance = $("#btnRequestClearance");

  const dossierTitleEl = $("#dossierTitle");
  const dossierSubEl = $("#dossierSub");
  const threatBadgeEl = $("#threatBadge");
  const dossierNumEl = $("#dossierNum");
  const dossierStatusEl = $("#dossierStatus");
  const dossierLocEl = $("#dossierLoc");
  const dossierConfEl = $("#dossierConf");
  const dossierOverviewEl = $("#dossierOverview");
  const dossierNotesEl = $("#dossierNotes");
  const associateLinksEl = $("#associateLinks");
  const dossierEvidenceEl = $("#dossierEvidence");
  const dossierRedactedEl = $("#dossierRedacted");

  // lock screen
  const btnLock = $("#btnLock");
  const lockScreen = $("#lockScreen");
  const lockInput = $("#lockInput");
  const btnUnlock = $("#btnUnlock");

  // filters
  const chips = $all(".chip[data-filter]");

  // -----------------------------
  // State
  // -----------------------------
  let currentView = "dashboard";
  let filterThreat = "all";
  let query = "";
  let redactionsOn = true;
  let activeSubjectId = subjects[0].id;

  // -----------------------------
  // Init
  // -----------------------------
  sessionIdEl.textContent = uid();
  tickClock();
  setInterval(tickClock, 1000);

  // Hero pick "current case"
  const currentCase = cases[0];
  currentCaseLabelEl.textContent = currentCase.title;
  currentCaseSubEl.textContent = `${currentCase.status} // ${currentCase.tags.join(" • ")}`;
  intelBarEl.style.width = `${currentCase.progress}%`;
  intelHintEl.textContent = `${currentCase.progress}% // ${progressHint(currentCase.progress)}`;

  // Most recent verified across subjects
  const mostRecent = subjects.reduce((a, b) => (a.verifiedAt > b.verifiedAt ? a : b), subjects[0]);
  lastVerifiedEl.textContent = formatTime(mostRecent.verifiedAt);
  timeSinceEl.textContent = timeSince(mostRecent.verifiedAt);
  setInterval(() => {
    timeSinceEl.textContent = timeSince(mostRecent.verifiedAt);
  }, 1000);

  // Build sections
  renderMostWanted();
  renderNotes();
  renderIntelFeed(true);

  renderCases();
  renderLocker();
  renderLedger();

  renderTranscript(randInt(0, transcriptSegments.length - 1));

  // -----------------------------
  // Events
  // -----------------------------
  // Tabs
  tabs.forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  // Buttons that switch view
  $all("[data-switch]").forEach(b => {
    b.addEventListener("click", () => switchView(b.dataset.switch));
  });

  // FX toggle
  btnToggleEffects.addEventListener("click", () => {
    document.body.classList.toggle("fx-off");
    glitch(btnToggleEffects);
  });

  // Search
  searchInput?.addEventListener("input", () => {
    query = searchInput.value.trim();
    renderLedger();
  });

  btnClearSearch?.addEventListener("click", () => {
    searchInput.value = "";
    query = "";
    renderLedger();
    searchInput.focus();
  });

  // Filter chips
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      filterThreat = chip.dataset.filter;
      renderLedger();
    });
  });

  // Transcript
  btnLoadLog.addEventListener("click", () => {
    renderTranscript(randInt(0, transcriptSegments.length - 1));
    glitch(btnLoadLog);
  });

  btnRedactToggle.addEventListener("click", () => {
    redactionsOn = !redactionsOn;
    document.body.classList.toggle("reveal-redactions", !redactionsOn);
    // toggle class on redacted spans
    $all(".redacted", transcriptEl).forEach(s => {
      s.classList.toggle("reveal", !redactionsOn);
    });
    glitch(btnRedactToggle);
  });

  // Open current target
  btnOpenCurrent.addEventListener("click", () => {
    openDossier(activeSubjectId);
  });

  // Modal close
  btnCloseModal.addEventListener("click", () => closeDossier());
  dossierModal.addEventListener("click", (e) => {
    // click outside frame closes
    const rect = $(".modal__frame", dossierModal).getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) closeDossier();
  });

  btnCopyDossier.addEventListener("click", async () => {
    const subj = subjectsById(activeSubjectId);
    if (!subj) return;
    const text =
`BLACKLIST DOSSIER
#${subj.number} ${subj.name} (${subj.alias})
Specialty: ${subj.specialty}
Threat: ${subj.threat.toUpperCase()} | Status: ${subj.status}
Last Known: ${subj.lastKnown} | Confidence: ${subj.confidence}

Overview: ${subj.overview}
Notes: ${subj.notes.join(" / ")}
Evidence: ${subj.evidence.join(", ")}
`;
    try {
      await navigator.clipboard.writeText(text);
      btnCopyDossier.textContent = "Copied";
      setTimeout(() => (btnCopyDossier.textContent = "Copy Summary"), 900);
    } catch {
      btnCopyDossier.textContent = "Copy failed";
      setTimeout(() => (btnCopyDossier.textContent = "Copy Summary"), 900);
    }
    glitch(btnCopyDossier);
  });

  btnRequestClearance.addEventListener("click", () => {
    // playful “clearance” reveal
    const reveal = [
      "Asset names confirmed via secondary chain.",
      "Handler contact vector: indirect / rotating.",
      "Location triangulation: pending 3rd ping.",
      "Recommendation: isolate broker, then collapse the corridor."
    ];
    dossierRedactedEl.innerHTML = reveal
      .map(line => `<span class="redacted reveal">${escapeHtml(line)}</span>`)
      .join("");
    glitch(btnRequestClearance);
  });

  // Lock screen
  btnLock.addEventListener("click", () => openLock());
  btnUnlock.addEventListener("click", () => tryUnlock());
  lockInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
    if (e.key === "Escape") closeLock();
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && !isTypingTarget(e.target)) {
      e.preventDefault();
      switchView("index");
      searchInput?.focus();
      return;
    }

    if (e.key === "Escape") {
      if (!lockScreen.hidden) return closeLock();
      if (dossierModal.open) return closeDossier();
    }

    if (e.key === "Enter" && currentView === "index" && document.activeElement === searchInput) {
      const first = ledgerEl.querySelector(".row");
      if (first) {
        const id = first.getAttribute("data-id");
        if (id) openDossier(id);
      }
    }
  });

  // Periodically rotate intel feed
  setInterval(() => renderIntelFeed(false), 4000);

  // -----------------------------
  // Renderers
  // -----------------------------
  function renderMostWanted() {
    const picks = [...subjects]
      .sort((a, b) => threatRank(b.threat) - threatRank(a.threat))
      .slice(0, 3);

    mostWantedEl.innerHTML = picks.map(s => `
      <div class="wanted">
        <div class="wanted__top">
          <div>
            <div class="wanted__name">${escapeHtml(s.name)}</div>
            <div class="wanted__spec">${escapeHtml(s.specialty)}</div>
          </div>
          <div class="wanted__num">${escapeHtml(s.id)} // ${escapeHtml(s.threat.toUpperCase())}</div>
        </div>
        <div class="wanted__cta">
          <button class="btn btn--primary" data-open="${escapeHtml(s.id)}" type="button">Open Dossier</button>
          <button class="btn btn--ghost" data-ping="${escapeHtml(s.id)}" type="button">Ping</button>
        </div>
      </div>
    `).join("");

    $all("[data-open]", mostWantedEl).forEach(b => b.addEventListener("click", () => openDossier(b.dataset.open)));
    $all("[data-ping]", mostWantedEl).forEach(b => b.addEventListener("click", () => pingSubject(b.dataset.ping)));
  }

  function renderNotes() {
    taskNotesEl.innerHTML = notes.map(n => `
      <div class="note">
        <div class="note__title">${escapeHtml(n.title)}</div>
        <div class="note__body">${escapeHtml(n.body)}</div>
        <div class="note__meta">${escapeHtml(n.meta)}</div>
      </div>
    `).join("");
  }

  function renderIntelFeed(initial) {
    // keep list short
    const max = 5;
    if (initial) {
      intelFeedEl.innerHTML = "";
      for (let i = 0; i < max; i++) intelFeedEl.appendChild(makeIntelItem(intelLines[i % intelLines.length]));
      return;
    }

    // rotate: drop last, add new at top
    const line = intelLines[randInt(0, intelLines.length - 1)];
    const li = makeIntelItem(line);
    intelFeedEl.prepend(li);
    while (intelFeedEl.children.length > max) intelFeedEl.lastElementChild.remove();
  }

  function makeIntelItem(text) {
    const li = document.createElement("li");
    const stamp = `${pad2(randInt(0, 23))}:${pad2(randInt(0, 59))}:${pad2(randInt(0, 59))}Z`;
    li.innerHTML = `<div class="meta">${stamp} // channel: LIVE</div><div class="msg">${escapeHtml(text)}</div>`;
    return li;
  }

  function renderCases() {
    casesGridEl.innerHTML = cases.map(c => `
      <div class="case">
        <div class="case__top">
          <div class="case__title">${escapeHtml(c.title)}</div>
          <div class="case__status">${escapeHtml(c.status)}</div>
        </div>
        <div class="case__body">${escapeHtml(c.summary)}</div>
        <div class="case__meta">
          ${c.tags.map(t => `<span class="tag elevated">${escapeHtml(t)}</span>`).join("")}
          <span class="tag">${escapeHtml(c.progress + "%")} COMPLETE</span>
        </div>
      </div>
    `).join("");
  }

  function renderLocker() {
    lockerGridEl.innerHTML = evidence.map(ev => `
      <div class="item" role="button" tabindex="0" data-evidence="${escapeHtml(ev.id)}" aria-label="Evidence ${escapeHtml(ev.id)}">
        <div class="item__id">${escapeHtml(ev.id)} // ${escapeHtml(ev.type)}</div>
        <div class="item__title">${escapeHtml(ev.title)}</div>
        <div class="item__sub">${escapeHtml(ev.sub)}</div>
        <div class="item__seal">
          <span>${escapeHtml(ev.seal)}</span>
          <span>DECRYPT ▸</span>
        </div>
      </div>
    `).join("");

    $all(".item", lockerGridEl).forEach(card => {
      const open = () => {
        const id = card.dataset.evidence;
        const ev = evidence.find(e => e.id === id);
        if (!ev) return;
        // Open modal with a quick “evidence” dossier (simple reuse)
        openEvidence(ev);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  }

  function renderLedger() {
    const list = subjects
      .filter(s => filterThreat === "all" ? true : s.threat === filterThreat)
      .filter(s => {
        if (!query) return true;
        const hay = `${s.id} ${s.name} ${s.alias} ${s.specialty} ${s.lastKnown} ${s.status} ${s.threat}`.toLowerCase();
        return hay.includes(query.toLowerCase());
      })
      .sort((a, b) => threatRank(b.threat) - threatRank(a.threat) || b.number - a.number);

    resultsCountEl.textContent = `${list.length} RESULTS`;

    ledgerEl.innerHTML = list.map(s => `
      <div class="row" data-id="${escapeHtml(s.id)}">
        <div class="cellTitle">
          <div class="num mono">${escapeHtml(s.id)}</div>
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="alias">Alias: <span class="muted">${escapeHtml(s.alias)}</span></div>
        </div>

        <div class="cell">
          <div class="muted mono small">SPECIALTY</div>
          <div>${escapeHtml(s.specialty)}</div>
        </div>

        <div class="cell">
          <div class="muted mono small">LAST KNOWN</div>
          <div>${escapeHtml(s.lastKnown)}</div>
        </div>

        <div class="cell">
          <div class="muted mono small">STATUS
