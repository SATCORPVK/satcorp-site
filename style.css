// SATCORP website interactive scripts

// 1) Vanta animated background
// Attach a dynamic network to our background using Vanta.js. This creates a subtle sci‑fi energy field.
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

// 2) Custom cursor
// Make a small glowing orb follow the user’s mouse and briefly expand on click.
const customCursor = document.getElementById("custom-cursor");
window.addEventListener("mousemove", (e) => {
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;
});

window.addEventListener("mousedown", () => {
  customCursor.animate(
    [
      { transform: "translate(-50%, -50%) scale(1)" },
      { transform: "translate(-50%, -50%) scale(2)" },
      { transform: "translate(-50%, -50%) scale(1)" }
    ],
    { duration: 250, easing: "ease-out" }
  );
});

// 3) Typewriter effect
// Read the data-text attribute and gradually reveal it, giving a retro console feel.
const typewriterElem = document.querySelector(".typewriter");
const typewriterText = typewriterElem?.dataset.text || "";
let typeIndex = 0;
function typeLoop() {
  typewriterElem.textContent = typewriterText.slice(0, typeIndex++);
  if (typeIndex <= typewriterText.length) requestAnimationFrame(typeLoop);
}
if (typewriterText) {
  typeLoop();
}

// 4) Confetti triggers
// Launch confetti on button clicks and once when reaching the end section.
function launchConfetti(options = {}) {
  confetti(Object.assign({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.7 }
  }, options));
}

document.getElementById("hero-confetti").addEventListener("click", () => {
  launchConfetti({ origin: { y: 0.6 } });
});

document.getElementById("end-confetti").addEventListener("click", () => {
  launchConfetti({ origin: { y: 0.8 }, particleCount: 150 });
});

// 5) GSAP ScrollTrigger animations
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
  onEnter: () => launchConfetti({ particleCount: 60, spread: 60, origin: { y: 0.9 } })
});
