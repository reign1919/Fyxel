// Info box functionality
const infoBox = document.getElementById('infoBox');
function showInfo(type) {
  if(type==='vc') infoBox.textContent = "VC Rooms use Discord — join a live group call and study together!";
  else infoBox.textContent = "Static Rooms are chill — no calls, just focused group presence and silent accountability.";
}
function hideInfo() { infoBox.textContent = "Hover over a button to learn more."; }

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  document.querySelector('.theme-toggle').textContent = document.body.classList.contains('dark') ? "🌙" : "☀️";
}

// Discord modal - show on page load
const discordModal = document.getElementById('discordModal');
const closeModal = document.getElementById('closeModal');
const browserBtn = document.getElementById('browserBtn');
const appBtn = document.getElementById('appBtn');

// Show modal immediately
window.onload = () => {
  discordModal.classList.remove('hidden');
}

// Close modal on X or click outside
closeModal.addEventListener('click', () => discordModal.classList.add('hidden'));
window.addEventListener('click', (e) => {
  if(e.target === discordModal) discordModal.classList.add('hidden');
});



// Button actions
browserBtn.addEventListener('click', () => {
  window.open('https://discord.com/channels/@me', '_blank');
  discordModal.classList.add('hidden'); // hide modal
});

appBtn.addEventListener('click', () => {
  window.location.href = 'discord://';
  discordModal.classList.add('hidden'); // hide modal
});

