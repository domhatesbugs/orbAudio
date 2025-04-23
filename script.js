const orb = document.getElementById("orb");
const canvas = document.getElementById("stringCanvas");
const ctx = canvas.getContext("2d");

let dragging = false;

let orbX = window.innerWidth / 2;
let orbY = window.innerHeight / 2;
let velocityX = 0;
let velocityY = 0;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const SEGMENT_LENGTH = 20;
const NUM_SEGMENTS = 30;
const DAMPING = 0.9;

// Rope points
let points = [];

function initRope() {
  points = [];
  for (let i = 0; i <= NUM_SEGMENTS; i++) {
    const t = i / NUM_SEGMENTS;
    points.push({
      x: centerX + (orbX - centerX) * t,
      y: centerY + (orbY - centerY) * t,
      oldX: centerX + (orbX - centerX) * t,
      oldY: centerY + (orbY - centerY) * t,
    });
  }
}

initRope();

// Resizing canvas to match screen DPI
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.scale(dpr, dpr); // Scale for high-DPI
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Physics update
function verletUpdate(point) {
  const vx = (point.x - point.oldX) * DAMPING;
  const vy = (point.y - point.oldY) * DAMPING;

  point.oldX = point.x;
  point.oldY = point.y;

  point.x += vx;
  point.y += vy;
}

function constrainRope() {
  points[0].x = centerX;
  points[0].y = centerY;

  points[points.length - 1].x = orbX;
  points[points.length - 1].y = orbY;

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < points.length - 1; j++) {
      const p1 = points[j];
      const p2 = points[j + 1];

      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = SEGMENT_LENGTH - dist;
      const percent = diff / dist / 2;

      dx *= percent;
      dy *= percent;

      if (j !== 0) {
        p1.x -= dx;
        p1.y -= dy;
      }

      if (j !== points.length - 1) {
        p2.x += dx;
        p2.y += dy;
      }
    }
  }
}

function drawRope() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = "#3cf";
  ctx.lineWidth = 3;
  ctx.stroke();

  for (let p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#0ff";
    ctx.fill();
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!dragging) {
    const dx = centerX - orbX;
    const dy = centerY - orbY;
    velocityX += dx * 0.01;
    velocityY += dy * 0.01;

    velocityX *= DAMPING;
    velocityY *= DAMPING;

    orbX += velocityX;
    orbY += velocityY;
  }

  orb.style.left = `${orbX}px`;
  orb.style.top = `${orbY}px`;

  for (let point of points) verletUpdate(point);
  constrainRope();
  drawRope();
}

animate();

// Dragging the orb
orb.onmousedown = () => {
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

// Audio logic
const audio = new Audio();
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audio.src = objectURL;
    audio.play();
  }
});

function updateAudioDirection() {
  if (audio.paused) return;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const panner = audioContext.createPanner();
  const source = audioContext.createMediaElementSource(audio);
  source.connect(panner);
  panner.connect(audioContext.destination);

  panner.panningModel = "HRTF"; // Best for spatial audio
  panner.setPosition((orbX / canvas.width) * 2 - 1, 0, 0); // X-axis only for simplicity

  if (!audio.paused && audio.currentTime === 0) {
    audio.play(); // Ensure audio starts if it was paused
  }
}

audio.addEventListener("play", () => {
  setInterval(updateAudioDirection, 50); // Update direction every 50ms
});
