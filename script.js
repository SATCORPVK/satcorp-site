// SATCORP // Frontier Ops interactions

// Spotlight follow (CSS vars drive the radial gradient)
const root = document.documentElement;
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  root.style.setProperty("--mx", `${x}%`);
  root.style.setProperty("--my", `${y}%`);
});

// Animated counters
function animateCount(el, to, ms = 900) {
  const start = 0;
  const t0 = performance.now();
  const isInt = Number.isInteger(to);

  function tick(t) {
    const p = Math.min(1, (t - t0) / ms);
    const v = start + (to - start) * (1 - Math.pow(1 - p, 3));
    el.textContent = isInt ? Math.round(v) : v.toFixed(0);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

document.querySelectorAll("[data-count]").forEach((el) => {
  const to = Number(el.getAttribute("data-count"));
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

// Pulse scan button effect
const pulseBtn = document.getElementById("btnPulse");
if (pulseBtn) {
  pulseBtn.addEventListener("click", () => {
    document.body.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(1.15)" },
        { filter: "brightness(1)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
  });
}

// Transmit button (fake UX feedback)
const btnSend = document.getElementById("btnSend");
const txStatus = document.getElementById("txStatus");
if (btnSend && txStatus) {
  btnSend.addEventListener("click", () => {
    txStatus.textContent = "TRANSMITTING...";
    txStatus.style.color = "rgba(37,243,255,.9)";
    btnSend.disabled = true;

    setTimeout(() => {
      txStatus.textContent = "SENT // ACK RECEIVED";
      txStatus.style.color = "rgba(155,93,229,.95)";
      btnSend.disabled = false;
    }, 900);
  });
}

// Year stamp
const y = document.getElementById("year");
if (y) y.textContent = String(new Date().getFullYear());
