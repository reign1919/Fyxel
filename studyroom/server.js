const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// READ all rooms
app.get('/rooms', (req, res) => {
  const data = JSON.parse(fs.readFileSync('rooms.json', 'utf-8'));
  res.json(data.rooms);
});

// POST a new room
app.post('/rooms', (req, res) => {
  try {
    const newRoom = req.body;
    const data = JSON.parse(fs.readFileSync('rooms.json', 'utf-8'));

    newRoom.id = `vc-${Date.now()}`;
    newRoom.createdAt = Date.now();

    data.rooms.push(newRoom);

    fs.writeFileSync('rooms.json', JSON.stringify(data, null, 2), 'utf-8');

    res.json({ success: true, room: newRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving room' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
