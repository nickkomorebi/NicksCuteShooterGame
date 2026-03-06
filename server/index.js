const express  = require('express');
const Database = require('better-sqlite3');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app     = express();
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, 'scores.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    score      INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());

app.get('/api/scores', (req, res) => {
  const rows = db.prepare(
    'SELECT name, score, created_at FROM scores ORDER BY score DESC LIMIT 10'
  ).all();
  res.json(rows);
});

app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;
  if (typeof score !== 'number' || !isFinite(score)) {
    return res.status(400).json({ error: 'Invalid score' });
  }
  const safeName = String(name || 'AAA').replace(/[<>]/g, '').slice(0, 3).trim().toUpperCase() || 'AAA';
  db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)').run(safeName, Math.floor(score));
  res.json({ ok: true });
});

app.listen(3000, () => console.log('Scores API listening on :3000'));
