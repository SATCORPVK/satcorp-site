/* ============================================================
   Pulse — app.js
   Advanced, dependency-free interaction layer
   ============================================================ */

(() => {
  "use strict";

  /* -----------------------
     STATE
  ------------------------ */
  const STORAGE_KEY = "pulse-state-v1";

  const defaultState = {
    theme: "auto",
    tasks: [],
    focusMinutesToday: 0,
    timer: {
      duration: 25 * 60,
      remaining: 25 * 60,
      running: false,
      lastTick: null,
    },
    flags: {
      sounds: false,
      haptics: false,
      confetti: false,
      compact: false,
    },
    streak: 0,
    lastActiveDate: null,
  };

  let state = loadState();

  /* -----------------------
     DOM CACHE
  ------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const ui = {
    themeBtn: $('[data-action="toggle-theme"]'),
    progress: $('[data-ui="scroll-progress"]'),
    toasts: $('[data-ui="toasts"]'),

    taskList: $('[data-ui="task-list"]'),
    taskEmpty: $('[data-ui="task-empty"]'),
    taskFilter: $('[data-ui="task-filter"]'),
    taskOpen: $('[data-ui="task-open"]'),
    taskDone: $('[data-ui="task-done"]'),

    kpiFocus: $('[data-ui="kpi-focus"]'),
    kpiTasks: $('[data-ui="kpi-tasks"]'),
    kpiMood: $('[data-ui="kpi-mood"]'),

    timerTime: $('[data-ui="timer-time"]'),
    timerRing: $('[data-ui="timer-ring"]'),
    timerState: $('[data-ui="timer-state"]'),
    timerMinutes: $('[data-ui="timer-minutes"]'),

    insightMomentum: $('[data-ui="insight-momentum"]'),
    insightStreak: $('[data-ui="insight-streak"]'),

    signalStorage: $('[data-ui="signal-storage"]'),
    signalMotion: $('[data-ui="signal-motion"]'),
    signalTheme: $('[data-ui="signal-theme"]'),

    log: $('[data-ui="log"]'),

    quickAddModal: $("#quickAddModal"),
    quickAddForm: $('[data-ui="quick-add-form"]'),
    quickTitle: $('[data-ui="quick-title"]'),
    quickPriority: $('[data-ui="quick-priority"]'),
    quickMood: $('[data-ui="quick-mood"]'),

    palette: $("#commandPalette"),
    paletteInput: $('[data-ui="palette-input"]'),
    paletteList: $('[data-ui="palette-list"]'),

    sparkline: $('[data-ui="sparkline"]'),
  };

  /* -----------------------
     INIT
  ------------------------ */
  applyTheme();
  updateStreak();
  renderAll();
  bindEvents();
  startRAF();

  /* -----------------------
     STORAGE
  ------------------------ */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : structuredClone(defaultState);
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* -----------------------
     THEME
  ------------------------ */
  function applyTheme() {
    let theme = state.theme;
    if (theme === "auto") {
      theme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    document.documentElement.dataset.theme = theme;
    ui.signalTheme.textContent = theme;
  }

  function toggleTheme() {
    state.theme =
      state.theme === "light"
        ? "dark"
        : state.theme === "dark"
        ? "auto"
        : "light";
    applyTheme();
    saveState();
    toast(`Theme: ${state.theme}`);
  }

  /* -----------------------
     TASKS
  ------------------------ */
  function addTask(title, priority = "med", mood = "—") {
    state.tasks.push({
      id: crypto.randomUUID(),
      title,
      priority,
      mood,
      done: false,
      created: Date.now(),
    });
    saveState();
    renderTasks();
    toast("Task added");
  }

  function toggleTask(id) {
    const t = state.tasks.find(t => t.id === id);
    if (!t) return;
    t.done = !t.done;
    saveState();
    renderTasks();
  }

  function clearDone() {
    state.tasks = state.tasks.filter(t => !t.done);
    saveState();
    renderTasks();
    toast("Completed tasks cleared");
  }

  function renderTasks() {
    const filter = ui.taskFilter.value?.toLowerCase() || "";
    const visible = state.tasks.filter(t =>
      t.title.toLowerCase().includes(filter)
    );

    ui.taskList.innerHTML = "";

    visible.forEach(task => {
      const li = document.createElement("li");
      li.className = "task";
      li.innerHTML = `
        <label>
          <input type="checkbox" ${task.done ? "checked" : ""} />
          <span>${task.title}</span>
          <small>${task.mood}</small>
        </label>
      `;
      li.querySelector("input").addEventListener("change", () => {
        toggleTask(task.id);
      });
      ui.taskList.appendChild(li);
    });

    ui.taskEmpty.hidden = visible.length > 0;

    const open = state.tasks.filter(t => !t.done).length;
    const done = state.tasks.filter(t => t.done).length;

    ui.taskOpen.textContent = open;
    ui.taskDone.textContent = done;
    ui.kpiTasks.textContent = open;
  }

  /* -----------------------
     TIMER
  ------------------------ */
  function startTimer() {
    if (state.timer.running) return;
    state.timer.running = true;
    state.timer.lastTick = performance.now();
    ui.timerState.textContent = "Running";
  }

  function stopTimer() {
    state.timer.running = false;
    ui.timerState.textContent = "Paused";
    saveState();
  }

  function resetTimer() {
    state.timer.running = false;
    state.timer.duration = Number(ui.timerMinutes.value) * 60;
    state.timer.remaining = state.timer.duration;
    ui.timerState.textContent = "Idle";
    renderTimer();
    saveState();
  }

  function tickTimer(now) {
    if (!state.timer.running) return;
    const delta = (now - state.timer.lastTick) / 1000;
    state.timer.lastTick = now;
    state.timer.remaining -= delta;

    if (state.timer.remaining <= 0) {
      state.timer.remaining = 0;
      state.timer.running = false;
      state.focusMinutesToday += state.timer.duration / 60;
      toast("Focus session complete");
    }
    renderTimer();
  }

  function renderTimer() {
    const m = Math.floor(state.timer.remaining / 60);
    const s = Math.floor(state.timer.remaining % 60);
    ui.timerTime.textContent = `${m}:${s.toString().padStart(2, "0")}`;

    const progress =
      1 - state.timer.remaining / state.timer.duration || 0;
    const circumference = 327;
    ui.timerRing.style.strokeDashoffset =
      circumference * (1 - progress);
  }

  /* -----------------------
     INSIGHTS
  ------------------------ */
  function renderInsights() {
    const done = state.tasks.filter(t => t.done).length;
    const momentum = Math.round(done * 10 + state.focusMinutesToday);
    ui.insightMomentum.textContent = momentum;
    ui.insightStreak.textContent = state.streak;
  }

  function updateStreak() {
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
      state.streak += 1;
      state.lastActiveDate = today;
      saveState();
    }
  }

  /* -----------------------
     SPARKLINE (CANVAS)
  ------------------------ */
  function renderSparkline() {
    if (!ui.sparkline) return;
    const ctx = ui.sparkline.getContext("2d");
    const w = ui.sparkline.width;
    const h = ui.sparkline.height;
    ctx.clearRect(0, 0, w, h);

    const points = state.tasks.slice(-10).map((_, i) => i + 1);
    if (!points.length) return;

    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent");
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / 10) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  /* -----------------------
     LOG / TOAST
  ------------------------ */
  function log(msg) {
    const div = document.createElement("div");
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    ui.log.appendChild(div);
    ui.log.scrollTop = ui.log.scrollHeight;
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    ui.toasts.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* -----------------------
     COMMAND PALETTE
  ------------------------ */
  const commands = [
    { name: "Toggle theme", run: toggleTheme },
    { name: "Add task", run: () => ui.quickAddModal.showModal() },
    { name: "Reset timer", run: resetTimer },
    { name: "Clear completed tasks", run: clearDone },
  ];

  function openPalette() {
    ui.palette.showModal();
    ui.paletteInput.value = "";
    renderPalette(commands);
    ui.paletteInput.focus();
  }

  function renderPalette(list) {
    ui.paletteList.innerHTML = "";
    list.forEach(cmd => {
      const li = document.createElement("li");
      li.textContent = cmd.name;
      li.tabIndex = 0;
      li.onclick = () => {
        cmd.run();
        ui.palette.close();
      };
      ui.paletteList.appendChild(li);
    });
  }

  /* -----------------------
     EVENTS
  ------------------------ */
  function bindEvents() {
    ui.themeBtn.onclick = toggleTheme;

    $('[data-action="add-task"]').onclick = () =>
      ui.quickAddModal.showModal();

    $('[data-action="clear-done"]').onclick = clearDone;

    $('[data-action="timer-toggle"]').onclick = () =>
      state.timer.running ? stopTimer() : startTimer();

    $('[data-action="timer-reset"]').onclick = resetTimer;

    ui.taskFilter.oninput = renderTasks;

    ui.quickAddForm.onsubmit = e => {
      if (e.submitter?.value !== "ok") return;
      e.preventDefault();
      addTask(
        ui.quickTitle.value,
        ui.quickPriority.value,
        ui.quickMood.value
      );
      ui.quickAddForm.reset();
      ui.quickAddModal.close();
    };

    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
      if (e.key === "n") ui.quickAddModal.showModal();
      if (e.key === " ") {
        e.preventDefault();
        state.timer.running ? stopTimer() : startTimer();
      }
      if (e.key.toLowerCase() === "r") resetTimer();
    });

    window.addEventListener("scroll", () => {
      const p =
        window.scrollY /
        (document.body.scrollHeight - window.innerHeight);
      ui.progress.style.width = `${Math.min(100, p * 100)}%`;
    });
  }

  /* -----------------------
     RENDER
  ------------------------ */
  function renderAll() {
    renderTasks();
    renderTimer();
    renderInsights();
    renderSparkline();

    ui.kpiFocus.textContent = Math.round(state.focusMinutesToday);
    ui.signalStorage.textContent = "localStorage";
    ui.signalMotion.textContent = matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
      ? "reduced"
      : "full";
  }

  /* -----------------------
     RAF LOOP
  ------------------------ */
  function startRAF() {
    function loop(now) {
      tickTimer(now);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();
