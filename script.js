let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let sourceNode, panner, audioBuffer;
let isPlaying = false;

const orb = document.getElementById("orb");
const fileInput = document.getElementById("fileInput");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

panner = audioCtx.createPanner();
panner.panningModel = 'HRTF';
panner.setPosition(0, 0, -1); // In front of listener

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

// Drag Orb
orb.onmousedown = function (e) {
  const shiftX = e.clientX - orb.getBoundingClientRect().left;

  function moveAt(pageX) {
    let x = pageX - shiftX;
    orb.style.left = `${x}px`;
    // Calculate -1 to 1 based on window width
    const relativeX = (x / window.innerWidth) * 2 - 1;
    panner.setPosition(relativeX * 10, 0, -1);
  }

  function onMouseMove(e) {
    moveAt(e.pageX);
  }

  document.addEventListener('mousemove', onMouseMove);

  orb.onmouseup = () => {
    document.removeEventListener('mousemove', onMouseMove);
    orb.onmouseup = null;
  };
};

orb.ondragstart = () => false;
