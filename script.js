let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode, panner, audioBuffer;
let isPlaying = false;

const orb = document.getElementById("orb");
const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

panner = audioCtx.createPanner();
panner.panningModel = 'HRTF';
panner.setPosition(0, 0, -1);

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  }
});

playBtn.addEventListener("click", () => {
  if (audioBuffer && !isPlaying) {
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(panner).connect(audioCtx.destination);
    sourceNode.start();
    isPlaying = true;
  }
});

pauseBtn.addEventListener("click", () => {
  if (sourceNode && isPlaying) {
    sourceNode.stop();
    isPlaying = false;
  }
});

// Orb movement
let orbX = window.innerWidth / 2;
let orbY = window.innerHeight / 2;
let velocityX = 0;
let velocityY = 0;
let dragging = false;

function updateOrbPosition() {
  orb.style.left = `${orbX}px`;
  orb.style.top = `${orbY}px`;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Normalize for panning: map to -10 to 10
  const normX = ((orbX - centerX) / centerX) * 10;
  const normY = -((orbY - centerY) / centerY) * 10;
  panner.setPosition(normX, normY, -1);
}

function animate() {
  requestAnimationFrame(animate);

  if (!dragging) {
    // Spring back to center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dx = centerX - orbX;
    const dy = centerY - orbY;

    velocityX += dx * 0.02;
    velocityY += dy * 0.02;

    // Apply friction
    velocityX *= 0.85;
    velocityY *= 0.85;

    orbX += velocityX;
    orbY += velocityY;

    if (Math.abs(velocityX) < 0.01) velocityX = 0;
    if (Math.abs(velocityY) < 0.01) velocityY = 0;
  }

  updateOrbPosition();
}

animate();

// Mouse controls
orb.onmousedown = function (e) {
  dragging = true;

  function onMouseMove(ev) {
    orbX = ev.clientX;
    orbY = ev.clientY;
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
