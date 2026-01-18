// Get canvas and context
const canvas = document.getElementById('blastCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // (If needed, could reset particles on resize, but here we simply adjust the drawing area)
});

// Overlay text element (for triggering shake effect)
const overlayText = document.querySelector('.overlay-text');

/**
 * Particle class representing a single explosion particle.
 * Each particle has its own position, velocity (dx, dy), radius, color, and transparency (alpha).
 */
class Particle {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;       // velocity in x direction
    this.dy = dy;       // velocity in y direction
    this.radius = radius;
    this.color = color;
    this.alpha = 1.0;   // opacity (fades from 1 to 0)
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;       // apply particle’s transparency
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.draw();
    // Move particle
    this.x += this.dx;
    this.y += this.dy;
    // Fade out
    this.alpha -= 0.01;
  }
}

// Array to hold active particles
let particles = [];
let animationRunning = false;  // flag to track if animation loop is active

/**
 * Animation loop function – updates and redraws all particles.
 * Uses requestAnimationFrame for smooth 60fps updates:contentReference[oaicite:13]{index=13}.
 */
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear canvas (transparent background)

  // Update particles array
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    // Remove particle if completely transparent (faded out)
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  // Continue the loop if particles remain
  if (particles.length > 0) {
    requestAnimationFrame(animate);
  } else {
    // Stop animation loop until next explosion
    animationRunning = false;
  }
}

/**
 * Creates an explosion at the given coordinates by spawning multiple particles.
 */
function createExplosion(x, y) {
  const particleCount = 80;  // number of particles per explosion (adjust for more/less debris)
  for (let i = 0; i < particleCount; i++) {
    // Generate a random direction and speed for each particle
    const angle = Math.random() * 2 * Math.PI;        // random direction in radians
    const speed = Math.random() * 5;                  // random speed (0 to 5)
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    const radius = Math.random() * 3 + 2;             // random size (radius 2px to 5px)
    const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;  // random bright color
    particles.push(new Particle(x, y, dx, dy, radius, color));
  }

  // Start the animation loop if not already running
  if (!animationRunning) {
    animationRunning = true;
    requestAnimationFrame(animate);
  }
}

// On user click/tap, create an explosion at that point and shake the text
canvas.addEventListener('click', (event) => {
  // Calculate click coordinates relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  createExplosion(x, y);  // trigger particle burst at (x, y)

  // Trigger the "shake" animation on the overlay text
  overlayText.classList.remove('shake');
  void overlayText.offsetWidth;          // trick: reflow to restart the animation if it's already running
  overlayText.classList.add('shake');
});
