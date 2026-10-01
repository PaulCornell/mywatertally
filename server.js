const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const express = require('express');

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'watertally.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS tallies (
    day     TEXT PRIMARY KEY,           -- YYYY-MM-DD, in the user's local time
    glasses INTEGER NOT NULL DEFAULT 0 CHECK (glasses >= 0)
  )
`);

const getDay = db.prepare('SELECT glasses FROM tallies WHERE day = ?');
const recentDays = db.prepare(
  'SELECT day, glasses FROM tallies WHERE day <= ? ORDER BY day DESC LIMIT ?'
);
const adjustDay = db.prepare(`
  INSERT INTO tallies (day, glasses) VALUES (:day, MAX(0, :delta))
  ON CONFLICT(day) DO UPDATE SET glasses = MAX(0, glasses + :delta)
`);

// The browser sends its own local date so "today" matches the user's time zone.
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
function validDay(req, res, next) {
  if (!DAY_RE.test(req.params.day)) {
    return res.status(400).json({ error: 'Day must be in YYYY-MM-DD format.' });
  }
  next();
}

function tallyFor(day) {
  const row = getDay.get(day);
  return { day, glasses: row ? row.glasses : 0 };
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tally/:day', validDay, (req, res) => {
  res.json(tallyFor(req.params.day));
});

app.post('/api/tally/:day/increment', validDay, (req, res) => {
  adjustDay.run({ day: req.params.day, delta: 1 });
  res.json(tallyFor(req.params.day));
});

app.post('/api/tally/:day/decrement', validDay, (req, res) => {
  adjustDay.run({ day: req.params.day, delta: -1 });
  res.json(tallyFor(req.params.day));
});

app.get('/api/history/:day', validDay, (req, res) => {
  res.json(recentDays.all(req.params.day, 7));
});

app.listen(PORT, () => {
  console.log(`My Water Tally is running at http://localhost:${PORT}`);
});
