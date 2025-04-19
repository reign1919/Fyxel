
document.getElementById('createRoomForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('roomName').value.trim();
  const description = document.getElementById('roomDesc').value.trim();
  const rawLink = document.getElementById('roomLink').value.trim();

  // Convert to full link if it's just a code
  let link = rawLink;
  if (!rawLink.startsWith("http")) {
    link = `https://meet.google.com/${rawLink.replace(/\s+/g, "")}`;
  }

  const newRoom = {
    id: `vc-${Date.now()}`,
    type: "vc",
    name,
    description,
    link,
    createdAt: Date.now()
  };

  // Send to your Node backend
  try {
    const response = await fetch('http://localhost:3000/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRoom)
    });

    const data = await response.json();
    if (data.success) {
      alert("Room created successfully!");
      // Optionally clear fields or redirect
      document.getElementById('createRoomForm').reset();
    } else {
      alert("Failed to create room.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Server error. Check console.");
  }
});


const createBtn = document.getElementById('createRoomBtn');
const modal     = document.getElementById('createModal');
const cancelBtn = document.getElementById('cancelBtn');
const form      = document.getElementById('createRoomForm');
const roomList  = document.getElementById('roomList');

// 1) Open Google Meet in new tab, then show form
createBtn.addEventListener('click', () => {
  window.open('https://meet.google.com/new', '_blank');
  setTimeout(() => modal.classList.remove('hidden'), 500);
});

// 2) Cancel / close
cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  form.reset();
});

// 3) Handle submission
form.addEventListener('submit', e => {
  e.preventDefault();
  let raw = document.getElementById('meetInput').value.trim();
  let link = raw.startsWith('http')
           ? raw
           : `https://meet.google.com/${raw}`;

  const name = document.getElementById('roomNameInput').value.trim();
  const desc = document.getElementById('roomDescInput').value.trim();
  const more = document.getElementById('roomMoreInput').value.trim();

  // build a room card
  const card = document.createElement('div');
  card.className = 'room-card';
  card.innerHTML = `
    <h3>${name}</h3>
    <p>${desc}</p>
    ${more ? `<p class="more">${more}</p>` : ''}
    <a href="${link}" target="_blank" class="join-btn">Join Meet ↗</a>
  `;
  roomList.appendChild(card);

  // reset and hide
  form.reset();
  modal.classList.add('hidden');
});