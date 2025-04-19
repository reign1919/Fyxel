let wbTool = 'pen';
let wbColor = 'black';
let wbSize = 4;

let currentPageIndex = 0;
let pages = [];

const panel = document.getElementById("whiteboardPanel");
const toggleBtn = document.getElementById("toggleWhiteboard");
const canvasContainer = document.getElementById("canvasContainer");

toggleBtn.onclick = () => {
  panel.classList.toggle("hidden");
};

document.getElementById("closeWhiteboard").onclick = () => {
  panel.classList.add("hidden");
};

document.getElementById("penBtn").onclick = () => wbTool = "pen";
document.getElementById("eraserBtn").onclick = () => wbTool = "eraser";
document.getElementById("colorSelect").onchange = (e) => wbColor = e.target.value;
document.getElementById("sizeSlider").oninput = (e) => wbSize = e.target.value;

document.getElementById("addPage").onclick = () => {
  createNewCanvas();
  currentPageIndex = pages.length - 1;
  showPage(currentPageIndex);
};

document.getElementById("wbNextPage").onclick = () => {
  if (currentPageIndex < pages.length - 1) {
    currentPageIndex++;
    showPage(currentPageIndex);
  }
};

document.getElementById("wbPrevPage").onclick = () => {
  if (currentPageIndex > 0) {
    currentPageIndex--;
    showPage(currentPageIndex);
  }
};

document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark-mode");
};

function createNewCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  canvas.style.zIndex = pages.length;
  canvasContainer.appendChild(canvas);
  setupWhiteboardDrawing(canvas); // isolated setup
  pages.push(canvas);
}

function showPage(index) {
  pages.forEach((canvas, i) => {
    canvas.style.display = i === index ? "block" : "none";
  });
  currentPageIndex = index;
}

function setupWhiteboardDrawing(canvas) {
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0, lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    const tool = wbTool;
    const color = wbColor;
    const size = parseInt(wbSize);

    ctx.lineWidth = size;
    ctx.lineCap = "round";

    if (tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseout", () => drawing = false);
}

// Init with first page
window.onload = () => {
  createNewCanvas();
  showPage(0);
};
