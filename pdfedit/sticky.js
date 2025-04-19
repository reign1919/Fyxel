document.getElementById("addStickyNote").addEventListener("click", createStickyNote);

function createStickyNote() {
  const note = document.createElement("div");
  note.className = "sticky-note";
  note.style.left = "100px";
  note.style.top  = "100px";

  const header = document.createElement("div");
  header.className = "sticky-header";
  const title = document.createElement("span");
  title.className = "sticky-title";
  title.textContent = "Sticky";
  const boldBtn = document.createElement("button");
  boldBtn.className = "sticky-bold";
  boldBtn.innerHTML = "<b>B</b>";
  boldBtn.title = "Bold text";
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "sticky-delete";
  deleteBtn.textContent = "×";
  deleteBtn.title = "Delete";

  header.append(title, boldBtn, deleteBtn);
  note.append(header);

  const content = document.createElement("div");
  content.className = "sticky-content";
  content.contentEditable = "true";
  content.textContent = "Type your note here...";
  note.append(content);

  document.body.append(note);

  deleteBtn.onclick = e => { e.stopPropagation(); note.remove(); };
  boldBtn.onclick   = e => { e.stopPropagation(); content.focus(); document.execCommand("bold"); };
  makeStickyDraggable(note, header);
}

function makeStickyDraggable(el, handle) {
  let ox=0, oy=0, dragging=false;
  handle.style.cursor="move";
  handle.onmousedown = e => {
    dragging=true;
    ox = e.clientX - el.offsetLeft;
    oy = e.clientY - el.offsetTop;
    document.onmousemove = e => {
      if (!dragging) return;
      el.style.left = (e.clientX-ox)+"px";
      el.style.top  = (e.clientY-oy)+"px";
    };
    document.onmouseup = () => {
      dragging=false;
      document.onmousemove=null;
      document.onmouseup=null;
    };
  };
}
