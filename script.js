// Futuristic micro-interactions (no libraries required)

// Count-up animation
function animateCount(el, to, ms = 900) {
  const t0 = performance.now();
  const start = 0;
  const isInt = Number.isInteger(to);

  function tick(t) {
    const p = Math.min(1, (t - t0) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = start + (to - start) * eased;
    el.textContent = isInt ? String(Math.round(v)) : String(v.toFixed(0));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.querySelectorAll("[data-count]").forEach((el) => {
  const to = Number(el.getAttribute("data-count"));
  if (!Number.isFinite(to)) return;
  animateCount(el, to, 950);
});

// Magnetic buttons + click pulse
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });

  btn.addEventListener("click", () => {
    btn.animate(
      [
        { boxShadow: "0 0 0 rgba(37,243,255,0)" },
        { boxShadow: "0 0 28px rgba(37,243,255,0.35)" },
        { boxShadow: "0 0 0 rgba(37,243,255,0)" }
      ],
      { duration: 420, easing: "ease-out" }
    );
  });
});

// Pulse button
const pulseBtn = document.getElementById("pulseBtn");
if (pulseBtn) {
  pulseBtn.addEventListener("click", () => {
    document.body.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(1.14)" },
        { filter: "brightness(1)" }
      ],
      { duration: 260, easing: "ease-out" }
    );
  });
}

// Fake transmit UX
const sendBtn = document.getElementById("sendBtn");
const txStatus = document.getElementById("txStatus");
if (sendBtn && txStatus) {
  sendBtn.addEventListener("click", () => {
    txStatus.textContent = "TRANSMITTING…";
    txStatus.style.color = "rgba(37,243,255,.9)";
    sendBtn.disabled = true;

    setTimeout(() => {
      txStatus.textContent = "SENT // ACK RECEIVED";
      txStatus.style.color = "rgba(155,93,229,.95)";
      sendBtn.disabled = false;
    }, 900);
  });
}

// Year stamp
const y = document.getElementById("year");
if (y) y.textContent = String(new Date().getFullYear());
