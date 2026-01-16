// SATCORP website interactive scripts

// 0) Boot sequence overlay
const boot = document.getElementById("boot");
const bootLines = document.getElementById("boot-lines");
if (boot && bootLines) {
  const lines = [
    "INIT :: CORE",
    "LINK :: VANTA.NET",
    "LOAD :: UI MODULES",
    "SYNC :: SCROLLTRIGGER",
    "STATUS :: GREEN",
    "ENTER :: FRONTIER"
  ];
  let i = 0;
  const interval = setInterval(() => {
    bootLines.textContent += lines[i++] + "\n";
    if (i >= lines.length) {
      clearInterval(interval);
      setTimeout(() => {
        boot.remove();
      }, 500);
    }
  }, 180);
}

// 1) Vanta animated background
if (window.VANTA && VANTA.NET) {
  VANTA.NET({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    color: 0x25f3ff,
    backgroundColor: 0x0b0a10,
    points: 12.0,
    maxDistance: 24.0,
    spacing: 18.0
  });
}

// 2) Custom cursor
const customCursor = document.getElementById("custom-cursor");
window.addEventListener("mousemove", (e) => {
  if (customCursor) {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  }
});

window.addEventListener("mousedown", () => {
  if (customCursor) {
    customCursor.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)" },
        { transform: "translate(-50%, -50%) scale(2)" },
        { transform: "translate(-50%, -50%) scale(1)" }
      ],
      { duration: 250, easing: "ease-out" }
    );
  }
});

// 3) Typewriter effect
const typewriterElem = document.querySelector(".typewriter");
const typewriterText = typewriterElem?.dataset.text || "";
let typeIndex = 0;
function typeLoop() {
  if (typewriterElem) {
    typewriterElem.textContent = typewriterText.slice(0, typeIndex++);
    if (typeIndex <= typewriterText.length) requestAnimationFrame(typeLoop);
  }
}
if (typewriterElem && typewriterText) {
  typeLoop();
}

// 4) Confetti triggers
function launchConfetti(options = {}) {
  if (typeof window.confetti !== "function") return;
  confetti(
    Object.assign(
      {
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 }
      },
      options
    )
  );
}

const heroBtn = document.getElementById("hero-confetti");
if (heroBtn) {
  heroBtn.addEventListener("click", () => {
    launchConfetti({ origin: { y: 0.6 } });
  });
}

const endBtn = document.getElementById("end-confetti");
if (endBtn) {
  endBtn.addEventListener("click", () => {
    launchConfetti({ origin: { y: 0.8 }, particleCount: 150 });
  });
}

// 5) GSAP ScrollTrigger animations
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  // Reveal elements smoothly as they enter the viewport
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  // SVG line drawing on scroll
  const svgPath = document.getElementById("mountain-path");
  if (svgPath) {
    const pathLen = svgPath.getTotalLength();
    svgPath.style.strokeDasharray = pathLen;
    svgPath.style.strokeDashoffset = pathLen;
    gsap.to(svgPath, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: svgPath,
        start: "top 85%",
        end: "bottom 40%",
        scrub: true
      }
    });
  }

  // Fire confetti when end section enters the viewport (once)
  ScrollTrigger.create({
    trigger: document.getElementById("contact"),
    start: "top 70%",
    once: true,
    onEnter: () =>
      launchConfetti({ particleCount: 60, spread: 60, origin: { y: 0.9 } })
  });
}

// 6) Magnetic buttons and click pulse
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
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
