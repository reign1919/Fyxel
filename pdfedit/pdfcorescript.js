// PDF Editor Core Script
let pdfDoc = null, scale = 1.5, currentPage = 1, isPagination = false;
let toolMode = "pen", currentColor = "black";

const container = document.getElementById("pdfContainer");

// Toolbar handlers
document.getElementById("fileInput").addEventListener("change", handleFile);
document.getElementById("draw").addEventListener("click", () => updateState("pen"));
document.getElementById("erase").addEventListener("click", () => updateState("eraser"));
document.getElementById("addText").addEventListener("click", () => updateState("text"));
document.getElementById("colorPicker").addEventListener("change", e => currentColor = e.target.value);
document.getElementById("togglePagination").addEventListener("click", () => {
  isPagination = !isPagination;
  container.className = isPagination ? "pagination-mode" : "scroll-mode";
  renderAllPages();
});
document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < pdfDoc.numPages) { currentPage++; renderAllPages(); }
});
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) { currentPage--; renderAllPages(); }
});

// Switch tool state
function updateState(newState) {
  toolMode = newState;
  updateToolButtons();
}
function updateToolButtons() {
  ["draw","erase","addText"].forEach(id => document.getElementById(id).classList.remove("active"));
  if (toolMode==="pen")   document.getElementById("draw").classList.add("active");
  if (toolMode==="eraser")document.getElementById("erase").classList.add("active");
  if (toolMode==="text")  document.getElementById("addText").classList.add("active");
}

// Load PDF file
function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const arr = new Uint8Array(reader.result);
    pdfjsLib.getDocument(arr).promise.then(pdf => {
      pdfDoc = pdf; currentPage = 1;
      renderAllPages();
    });
  };
  reader.readAsArrayBuffer(file);
}

// Render pages
function renderAllPages() {
  container.innerHTML = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    pdfDoc.getPage(i).then(page => {
      const vw = page.getViewport({ scale });
      const wrap = document.createElement("div");
      wrap.className = "pdf-page" + (isPagination && i===currentPage ? " active" : "");
      wrap.style.position="relative"; wrap.style.width=`${vw.width}px`; wrap.style.height=`${vw.height}px`;

      // PDF canvas
      const pdfCanvas = document.createElement("canvas");
      pdfCanvas.width = vw.width; pdfCanvas.height = vw.height;
      page.render({ canvasContext: pdfCanvas.getContext("2d"), viewport: vw });

      // Drawing canvas
      const drawCanvas = document.createElement("canvas");
      drawCanvas.width = vw.width; drawCanvas.height = vw.height;
      drawCanvas.style.cssText = "position:absolute;top:0;left:0;z-index:1;";
      wrap.append(pdfCanvas, drawCanvas);
      container.appendChild(wrap);

      setupDrawing(drawCanvas);
    });
  }
}

// Drawing logic
function setupDrawing(canvas) {
  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let lastX = 0, lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const brushSize = parseInt(document.getElementById("brushSize").value);
    const selectedColor = document.getElementById("colorPicker").value;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    if (toolMode === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
    } else if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mouseup", () => isDrawing = false);
  canvas.addEventListener("mouseout", () => isDrawing = false);
}


// Add movable text boxes
document.getElementById("addText").addEventListener("click", () => {
  const tb = document.createElement("textarea");
  tb.className="text-box"; tb.rows=1; tb.cols=20; tb.value="Enter text";
  tb.style.cssText = "left:100px;top:100px;background:rgba(255,255,255,0.85);color:#000;border:1px solid #aaa;";
  makeDraggable(tb); container.appendChild(tb); tb.focus();
});

// Draggable helper
function makeDraggable(el) {
  let ox, oy, dragging=false;
  el.onmousedown = e => {
    dragging = true;
    ox = e.clientX - el.offsetLeft; oy = e.clientY - el.offsetTop;
    document.onmousemove = m=>{ if(dragging){ el.style.left=m.clientX-ox+"px"; el.style.top=m.clientY-oy+"px"; }};
    document.onmouseup = ()=>{ dragging=false; document.onmousemove=null; document.onmouseup=null; };
  };
  el.ondragstart = ()=>false;
}

// Save & Download PDF
document.getElementById("savePDF").addEventListener("click", async () => {
  if (!pdfDoc) return alert("Load a PDF first");
  const origBytes = await pdfDoc.save();
  const libDoc = await PDFLib.PDFDocument.load(origBytes);
  const pages = libDoc.getPages();
  document.querySelectorAll(".pdf-page").forEach((wrap,i) => {
    const draw = wrap.querySelector("canvas:nth-child(2)");
    if (!draw) return;
    const png = draw.toDataURL("image/png");
    libDoc.embedPng(png).then(img => {
      const { width, height } = pages[i].getSize();
      pages[i].drawImage(img, { x:0, y:0, width, height });
    });
  });
  const out = await libDoc.save();
  const blob = new Blob([out],{type:"application/pdf"});
  const url = URL.createObjectURL(blob);
  localStorage.setItem("lastPdf", url);
  const a = document.createElement("a"); a.href=url; a.download="edited.pdf"; a.click();
});

// Load last PDF
function loadLastPDF() {
  const url = localStorage.getItem("lastPdf");
  if (!url) return;
  fetch(url).then(r=>r.arrayBuffer()).then(buf =>
    pdfjsLib.getDocument(new Uint8Array(buf)).promise.then(pdf=>{pdfDoc=pdf;renderAllPages();})
  );
}
window.onload = loadLastPDF;

// ------------- Notes -------------
const notesPanel = document.getElementById("notesPanel"), toggleNotes = document.getElementById("toggleNotes"),
      addNoteBtn = document.getElementById("addNote"), noteInput = document.getElementById("noteInput"),
      noteList = document.getElementById("noteList");
let notes = [];

function saveNotes(){ localStorage.setItem("pdfNotes", JSON.stringify(notes)); }
function loadNotes(){ const s=localStorage.getItem("pdfNotes"); if(s){notes=JSON.parse(s); notes.forEach(r=>renderNote(r));} }
toggleNotes.onclick = ()=>notesPanel.classList.toggle("open");
addNoteBtn.onclick = ()=>{
  const txt = noteInput.value.trim(); if(!txt) return;
  const y = window.scrollY, pg = getPageFromScroll(y);
  const n = {id:Date.now(), text:txt, scrollY:y, page:pg};
  notes.push(n); renderNote(n); saveNotes(); noteInput.value="";
};
function renderNote(n){
  const li = document.createElement("li"),
        div = document.createElement("div"), eb=document.createElement("button"), db=document.createElement("button");
  div.className="note-text"; div.textContent=`Page ${n.page}: ${n.text}`; div.onclick=()=>window.scrollTo({top:n.scrollY,behavior:"smooth"});
  eb.className="note-edit"; eb.textContent="✏️"; eb.onclick=e=>{e.stopPropagation();const t=prompt("Edit:",n.text);if(t){n.text=t;div.textContent=`Page ${n.page}: ${n.text}`;saveNotes();}};
  db.className="note-delete"; db.textContent="🗑️"; db.onclick=e=>{e.stopPropagation();notes=notes.filter(x=>x.id!==n.id);li.remove();saveNotes();};
  li.append(div, eb, db); noteList.append(li);
}
function getPageFromScroll(y){
  const pages = document.querySelectorAll(".pdf-page");
  for(let i=0;i<pages.length;i++){
    const t=pages[i].offsetTop, b=t+pages[i].offsetHeight;
    if(y>=t&&y<b) return i+1;
  }
  return 1;
}
window.addEventListener("load", loadNotes);




