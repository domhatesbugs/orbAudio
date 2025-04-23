const orb = document.getElementById("orb");
const canvas = document.getElementById("stringCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let orbX = window.innerWidth / 2;
let orbY = window.innerHeight / 2;
let velocityX = 0;
let velocityY = 0;
let dragging = false;

// Spring physics constants
const SPRING_K = 0.01;
const DAMPING = 0.9;
const MASS = 1;

// Rope config
const NUM_SEGMENTS = 20;
let rope = [];

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

// Initialize rope
for (let i = 0; i <= NUM_SEGMENTS; i++) {
  rope.push({
    x: centerX + (orbX - centerX) * (i / NUM_SEGMENTS),
    y: centerY + (orbY - centerY) * (i / NUM_SEGMENTS)
  });
}

function updateOrbPhysics() {
  if (!dragging) {
    const dx = centerX - orbX;
    const dy = centerY - orbY;

    const forceX = dx * SPRING_K;
    const forceY = dy * SPRING_K;

    const ax = forceX / MASS;
    const ay = forceY / MASS;

    velocityX += ax;
    velocityY += ay;

    velocityX *= DAMPING;
    velocityY *= DAMPING;

    orbX += velocityX;
    orbY += velocityY;
  }

  orb.style.left = `${orbX}px`;
  orb.style.top = `${orbY}px`;
}

function updateRope() {
  // Set last point to orb
  rope[NUM_SEGMENTS].x = orbX;
  rope[NUM_SEGMENTS].y = orbY;

  // Set first point to center
  rope[0].x = centerX;
  rope[0].y = centerY;

  // Relax rope
  for (let i = 1; i < NUM_SEGMENTS; i++) {
    const prev = rope[i - 1];
    const curr = rope[i];
    const next = rope[i + 1];

    // Midpoint attraction
    const dx = (prev.x + next.x) / 2 - curr.x;
    const dy = (prev.y + next.y) / 2 - curr.y;

    curr.x += dx * 0.25;
    curr.y += dy * 0.25;
  }
}

function drawRope() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(rope[0].x, rope[0].y);
  for (let i = 1; i <= NUM_SEGMENTS; i++) {
    ctx.lineTo(rope[i].x, rope[i].y);
  }
  ctx.strokeStyle = "#3cf";
  ctx.lineWidth = 4;
  ctx.stroke();
}

function animate() {
  requestAnimationFrame(animate);
  updateOrbPhysics();
  updateRope();
  drawRope();
}

animate();

// Dragging logic
orb.onmousedown = function () {
  dragging = true;

  function onMouseMove(e) {
    orbX = e.clientX;
    orbY = e.clientY;
    velocityX = 0;
    velocityY = 0;
  }

  function onMouseUp() {
    dragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

orb.ondragstart = () => false;
