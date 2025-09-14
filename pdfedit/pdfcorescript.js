const modeToggleBtn = document.getElementById("modeToggle");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const editorWrap = document.getElementById("editorWrap");
const pdfEditorFrame = document.getElementById("pdfEditorFrame");
const uploadContainer = document.getElementById("uploadContainer");
const loadingMsg = document.getElementById("loadingMsg");
const backBtn = document.getElementById("backBtn");

// dark mode default
modeToggleBtn.textContent = 'Switch to Light Mode';
modeToggleBtn.onclick = () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    modeToggleBtn.textContent = 'Switch to Light Mode';
  } else {
    modeToggleBtn.textContent = 'Switch to Dark Mode';
  }
};

uploadBtn.onclick = () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a PDF first!");
    return;
  }

  // Hide upload UI
  uploadContainer.style.display = "none";
  modeToggleBtn.style.display = "none";

  // Show loading message
  loadingMsg.style.display = "block";

  // Create object URL
  const fileURL = URL.createObjectURL(file);

  // After 2.5s show PDF
  setTimeout(() => {
    loadingMsg.style.display = "none";

    pdfEditorFrame.src = fileURL; 
    editorWrap.style.display = "flex";

    // trigger smooth fade
    requestAnimationFrame(() => {
      editorWrap.classList.add("show");
    });

    backBtn.style.display = "inline-block";
  }, 2500);
};

const openWhiteboardBtn = document.getElementById("openWhiteboardBtn");

openWhiteboardBtn.onclick = () => {
  // Open whiteboard in new tab
  window.open('https://excalidraw.com/', '_blank');
};
