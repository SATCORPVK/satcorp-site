/* ---------------------------
   CSS VARIABLES (DARK DEFAULT)
---------------------------- */
:root {
  --bg: #0f1220;
  --surface: #1a1e33;
  --text: #f4f6ff;
  --muted: #b7bddc;
  --border: rgba(255,255,255,0.15);
  --accent: #7dd3fc;
  --accent-2: #a7f3d0;
  --radius: 16px;
  --transition: 180ms ease;
}

/* LIGHT THEME */
[data-theme="light"] {
  --bg: #f6f7fb;
  --surface: #ffffff;
  --text: #1a1a1a;
  --muted: #555;
  --border: rgba(0,0,0,0.15);
  --accent: #2563eb;
  --accent-2: #16a34a;
}

/* ---------------------------
   GLOBAL
---------------------------- */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background var(--transition), color var(--transition);
}

.container {
  width: min(1100px, calc(100% - 40px));
  margin: 0 auto;
}

/* ---------------------------
   HEADER
---------------------------- */
.site-header {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.logo {
  margin: 0;
  font-size: 1.4rem;
}

/* ---------------------------
   THEME TOGGLE
---------------------------- */
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
}

.track {
  width: 56px;
  height: 30px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 3px;
  display: flex;
  align-items: center;
}

.thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: grid;
  place-items: center;
  transform: translateX(0);
  transition: transform var(--transition);
  position: relative;
  overflow: hidden;
}

.icon {
  position: absolute;
  font-size: 14px;
  transition: opacity var(--transition), transform var(--transition);
}

.sun {
  opacity: 0;
  transform: translateY(6px);
}

.moon {
  opacity: 1;
  transform: translateY(0);
}

/* Light mode animation */
[data-theme="light"] .thumb {
  transform: translateX(26px);
}

[data-theme="light"] .sun {
  opacity: 1;
  transform: translateY(0);
}

[data-theme="light"] .moon {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------------------------
   CONTENT
---------------------------- */
.card {
  margin-top: 60px;
  padding: 32px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
}

p {
  color: var(--muted);
  line-height: 1.6;
}

/* ---------------------------
   FOOTER
---------------------------- */
.site-footer {
  margin-top: 80px;
  padding: 24px 0;
  text-align: center;
  color: var(--muted);
  border-top: 1px solid var(--border);
}
