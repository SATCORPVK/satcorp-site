/* =========================================================
   CivicWorks Alliance — Level 1 Scale Test
   Clean, accessible, organization-style design
   ========================================================= */

/* ---------- CSS RESET / BASE ---------- */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1f2933;
  background-color: #f8fafc;
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

/* ---------- UTILITIES ---------- */
.container {
  width: min(1120px, 92%);
  margin-inline: auto;
}

.section {
  padding: 4rem 0;
}

.section-alt {
  background: #ffffff;
}

.section-head {
  max-width: 720px;
  margin-bottom: 2.5rem;
}

.section-head h2 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
}

.section-head p {
  margin: 0;
  color: #475569;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  margin: 0 0 0.5rem;
}

.lead {
  font-size: 1.05rem;
  color: #334155;
}

.muted-note {
  font-size: 0.85rem;
  color: #64748b;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: auto;
}

.skip-link:focus {
  left: 1rem;
  top: 1rem;
  background: #ffffff;
  padding: 0.5rem 0.75rem;
  z-index: 999;
}

/* ---------- BUTTONS ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border-radius: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-ghost {
  background: transparent;
  color: #2563eb;
  border-color: #2563eb;
}

.btn-ghost:hover {
  background: #eff6ff;
}

/* ---------- HEADER ---------- */
.site-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
}

.brand-name {
  display: block;
  font-weight: 700;
}

.brand-tag {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
}

/* ---------- NAVIGATION ---------- */
.site-nav {
  position: relative;
}

.nav-toggle {
  background: none;
  border: none;
  padding: 0.4rem;
  display: none;
  cursor: pointer;
}

.nav-toggle-lines,
.nav-toggle-lines::before,
.nav-toggle-lines::after {
  content: "";
  display: block;
  width: 22px;
  height: 2px;
  background: #1f2933;
  position: relative;
}

.nav-toggle-lines::before {
  top: -6px;
  position: absolute;
}

.nav-toggle-lines::after {
  top: 6px;
  position: absolute;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.nav-menu a {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

.nav-menu a:hover {
  color: #2563eb;
}

/* ---------- HERO ---------- */
.hero {
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  padding: 4rem 0;
}

.hero-grid {
  display: grid;
  gap: 3rem;
}

.hero h1 {
  font-size: clamp(2rem, 4vw, 2.6rem);
  line-height: 1.2;
  margin: 0.5rem 0 1rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.hero-stats {
  list-style: none;
  display: flex;
  gap: 2rem;
  padding: 0;
  margin: 2rem 0 0;
}

.stat-value {
  display: block;
  font-weight: 700;
  font-size: 1.2rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #475569;
}

/* ---------- CARDS ---------- */
.cards {
  display: grid;
  gap: 1.5rem;
}

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  padding: 1.5rem;
}

.card-title {
  margin-top: 0;
}

.meta {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.06em;
}

/* ---------- LISTS ---------- */
.list {
  padding-left: 1.2rem;
  margin: 0.75rem 0 0;
}

.list li {
  margin-bottom: 0.4rem;
}

/* ---------- IMPACT ---------- */
.impact-grid {
  display: grid;
  gap: 1.5rem;
}

.impact-item h3 {
  margin-top: 0;
}

.cta-row {
  margin-top: 3rem;
  padding: 2rem;
  background: #eff6ff;
  border-radius: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

/* ---------- RESOURCES ---------- */
.resource-list {
  display: grid;
  gap: 1.25rem;
}

.resource h3 {
  margin-top: 0;
}

/* ---------- CONTACT ---------- */
.contact-grid {
  display: grid;
  gap: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.field label {
  font-size: 0.8rem;
  font-weight: 600;
}

.field input,
.field select,
.field textarea {
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid #cbd5f5;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: #2563eb;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contact-aside .divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

/* ---------- FOOTER ---------- */
.site-footer {
  background: #0f172a;
  color: #e5e7eb;
  padding: 2.5rem 0;
}

.footer-grid {
  display: grid;
  gap: 2rem;
}

.footer-brand {
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a:hover {
  color: #93c5fd;
}

/* ---------- TOAST ---------- */
.toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #1e293b;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
}

/* ---------- RESPONSIVE ---------- */
@media (min-width: 768px) {
  .hero-grid {
    grid-template-columns: 1.3fr 1fr;
    align-items: center;
  }

  .cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .impact-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .contact-grid {
    grid-template-columns: 1.3fr 1fr;
  }

  .footer-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }

  .nav-toggle {
    display: none;
  }
}

@media (max-width: 767px) {
  .nav-toggle {
    display: block;
  }

  .nav-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: #ffffff;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    display: none;
  }

  .nav-menu.open {
    display: flex;
  }
}
