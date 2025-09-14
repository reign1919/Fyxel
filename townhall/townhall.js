// --- Townhall v2.2 ---
// DOM refs
const countDisplay = document.getElementById('countDisplay');
const sessionCountEl = document.getElementById('sessionCount');
const avatarsStrip = document.getElementById('avatarsStrip');
const toasts = document.getElementById('toasts');
const blipList = document.getElementById('blipList');
const locationHint = document.getElementById('locationHint');
const glowRing = document.getElementById('glowRing');

// Settings
const MIN = 160;
const MAX = 1200;
let base = computeBase();
let current = base + Math.floor(Math.random() * 8) - 4;
let sessionTotal = 600 + Math.floor(Math.random() * 1200);
let recentBlips = new Set();
let avatarsPool = [];

// Data
const LOCATIONS = [
  // Asia
  "New Delhi", "Beijing", "Tokyo", "Seoul", "Jakarta", "Bangkok", "Hanoi", "Islamabad", "Kuala Lumpur", "Dhaka",
  // Europe
  "London", "Paris", "Berlin", "Madrid", "Rome", "Athens", "Warsaw", "Vienna", "Prague", "Oslo",
  // Africa
  "Cairo", "Nairobi", "Lagos", "Addis Ababa", "Cape Town", "Accra", "Dakar", "Algiers",
  // Americas
  "Washington D.C.", "Ottawa", "Mexico City", "Brasília", "Buenos Aires", "Lima", "Santiago", "Bogotá",
  // Oceania
  "Canberra", "Wellington", "Suva", "Port Moresby"
];

const ACHIEVEMENTS = [
  "{init} finished a 25-min sprint",
  "{init} completed a 50-min focus block",
  "{init} logged their 3rd session today",
  "{init} reached 2 hours total study",
  "{init} hit a {num}-day streak",
  "{init} wrapped up notes on Chapter {num}",
  "{init} joined a static study room",
  "{init} wrapped up a Pomodoro block"
];

// Helpers
function computeBase() {
  const hour = new Date().getHours();
  let peak = 1;
  if (hour >= 18 && hour <= 23) peak = 1.2;
  else if (hour >= 13 && hour < 18) peak = 1.05;
  else if (hour >= 0 && hour <= 6) peak = 0.75;
  const raw = 240 + Math.random() * 280;
  return Math.round(raw * peak);
}
function fmt(n) { return n.toLocaleString(); }

// --- ODOMETER ---
// --- ODOMETER FIX ---
function renderCount(num) {
  const str = fmt(num); // includes commas
  countDisplay.innerHTML = '';

  for (let ch of str) {
    if (/\d/.test(ch)) {
      const wrapper = document.createElement('div');
      wrapper.className = 'digit-wrapper';
      const digitContainer = document.createElement('div');
      digitContainer.className = 'digit';
      for (let i = 0; i <= 9; i++) {
        const span = document.createElement('span');
        span.textContent = i;
        digitContainer.appendChild(span);
      }
      wrapper.appendChild(digitContainer);
      countDisplay.appendChild(wrapper);
    } else {
      // commas or other symbols
      const el = document.createElement('span');
      el.className = 'digit-symbol';
      el.textContent = ch;
      countDisplay.appendChild(el);
    }
  }
}

function updateCount(newNum) {
  const str = fmt(newNum);
  const wrappers = countDisplay.querySelectorAll('.digit-wrapper');

  // Map each digit to corresponding wrapper
  let digitIndex = 0;
  for (let ch of str) {
    if (/\d/.test(ch)) {
      const container = wrappers[digitIndex].querySelector('.digit');
      container.style.transition = 'transform 0.6s ease';
      container.style.transform = `translateY(-${ch * 1.5}em)`; // each digit 1.5em tall
      digitIndex++;
    }
  }

  // Glow effect
  glowRing.classList.remove('active');
  void glowRing.offsetWidth;
  glowRing.classList.add('active');
  setTimeout(() => glowRing.classList.remove('active'), 700);

  current = newNum;
}


// Initials
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randomInitial() { return letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)]; }
function uniqueInitials(n) {
  const set = new Set();
  while (set.size < n) set.add(randomInitial());
  return [...set];
}

// Avatars
function renderAvatars() {
  const visible = 6;
  if (avatarsPool.length < 20) avatarsPool = avatarsPool.concat(uniqueInitials(40));
  const chosen = [];
  for (let i = 0; i < visible; i++) {
    const idx = Math.floor(Math.random() * avatarsPool.length);
    chosen.push(avatarsPool.splice(idx, 1)[0]);
  }
  avatarsStrip.innerHTML = '';
  chosen.forEach(init => {
    const el = document.createElement('div');
    el.className = 'avatar';
    el.textContent = init;
    el.style.background = randomGradient();
    avatarsStrip.appendChild(el);
  });
}
function randomGradient() {
  const palettes = [
    ['#60a5fa', '#818cf8'],
    ['#34d399', '#059669'],
    ['#fbbf24', '#f97316'],
    ['#fb7185', '#f43f5e'],
    ['#7c3aed', '#6d28d9']
  ];
  const p = palettes[Math.floor(Math.random() * palettes.length)];
  return `linear-gradient(135deg, ${p[0]}, ${p[1]})`;
}
function rotateAvatar() {
  const nodes = avatarsStrip.children;
  if (!nodes.length) return;
  const idx = Math.floor(Math.random() * nodes.length);
  const node = nodes[idx];
  node.textContent = randomInitial();
  node.style.background = randomGradient();
  node.classList.add('pop');
  setTimeout(() => node.classList.remove('pop'), 900);
}

// Achievements
function pushAchievement() {
  const init = randomInitial();
  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  const tmpl = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)];
  const num = 2 + Math.floor(Math.random() * 12);
  const text = tmpl.replace('{init}', init).replace('{num}', num);
  if (recentBlips.has(text)) return;
  recentBlips.add(text);
  if (recentBlips.size > 40) recentBlips = new Set([...recentBlips].slice(-30));

  showToast(text);

  const li = document.createElement('li');
  li.className = 'blip-item';
  li.innerHTML = `<div class="tick">${init}</div><div><div style="font-size:.9rem;color:#e8e8e8">${text}</div></div>`;
  blipList.prepend(li);

  if (blipList.children.length > 6) {
    const last = blipList.lastChild;
    last.classList.add('fade-out');
    setTimeout(() => last.remove(), 600);
  }

  locationHint.textContent = `📍 ${loc}`;
  if (Math.random() < 0.4) bumpSessions(1 + Math.floor(Math.random() * 2));
}
function showToast(msg, ttl = 4500) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  toasts.prepend(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(8px)';
    setTimeout(() => t.remove(), 600);
  }, ttl);
}
function bumpSessions(n = 1) {
  sessionTotal += n;
  sessionCountEl.textContent = fmt(sessionTotal);
}

// Count fluctuation
function fluctuationStep() {
  if (Math.random() < 0.03) base = computeBase();
  let change = Math.floor(Math.random() * 3) - 1;
  if (Math.random() < 0.05) change = Math.floor(Math.random() * 40) - 20;
  const drift = Math.round((base - current) * 0.06);
  change += Math.sign(drift) * Math.min(Math.abs(drift), 2);
  let next = current + change;
  const lower = Math.max(MIN, Math.round(base * 0.6));
  const upper = Math.min(MAX, Math.round(base * 1.6));
  if (next < lower) next = lower;
  if (next > upper) next = upper;
  updateCount(next);
  if (next > current && Math.random() < 0.35) bumpSessions(Math.floor(Math.random() * 3));
  if (Math.random() < 0.6) rotateAvatar();
  if (Math.random() < 0.45) pushAchievement();
}



// Init
(function init() {
  sessionCountEl.textContent = fmt(sessionTotal);
  renderCount(current);
  avatarsPool = uniqueInitials(120);
  renderAvatars();
  for (let i = 0; i < 2; i++) setTimeout(() => pushAchievement(), 600 + i * 1000);
  setInterval(fluctuationStep, 3200 + Math.random() * 2200);
  setInterval(() => { if (Math.random() < 0.5) pushAchievement(); }, 12000 + Math.random() * 12000);
  setInterval(() => { if (Math.random() < 0.35) rotateAvatar(); }, 4200 + Math.random() * 2500);
  setInterval(() => { if (Math.random() < 0.4) base = computeBase(); }, 60_000);
})();
