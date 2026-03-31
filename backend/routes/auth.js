const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// הרשמה
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'יש למלא אימייל וסיסמה' });
  const users = loadUsers();
  if (users.find(u => u.email === email)) return res.status(409).json({ message: 'משתמש כבר קיים' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ email, password: hash });
  saveUsers(users);
  res.json({ message: 'נרשמת בהצלחה' });
});

// קבלת פרופיל
router.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'נדרשת התחברות' });
  const jwt = require('jsonwebtoken');
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(403).json({ message: 'טוקן לא תקין' }); }
  const users = loadUsers();
  const user = users.find(u => u.email === decoded.email);
  res.json({ profile: user?.profile || '' });
});

// עדכון פרופיל
router.put('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'נדרשת התחברות' });
  const jwt = require('jsonwebtoken');
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(403).json({ message: 'טוקן לא תקין' }); }
  const { profile } = req.body;
  const users = loadUsers();
  const idx = users.findIndex(u => u.email === decoded.email);
  if (idx === -1) return res.status(404).json({ message: 'משתמש לא נמצא' });
  users[idx].profile = profile || '';
  saveUsers(users);
  res.json({ message: 'פרופיל עודכן' });
});

// התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'משתמש לא נמצא' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'סיסמה שגויה' });
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, email });
});

module.exports = router;
