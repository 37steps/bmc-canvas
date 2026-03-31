const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const FEEDBACK_FILE = path.join(__dirname, '../data/feedback.json');

function loadFeedback() {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) return [];
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
  } catch { return []; }
}

function saveFeedback(data) {
  const dir = path.dirname(FEEDBACK_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

// שמירת משוב
router.post('/', (req, res) => {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ message: 'נדרשת התחברות' });
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(403).json({ message: 'טוקן לא תקין' }); }

  const { filename, feedback } = req.body;
  if (!filename || !feedback) return res.status(400).json({ message: 'חסרים שדות' });

  const all = loadFeedback();
  // החלף אם כבר קיים משוב על אותה תמונה מאותו משתמש
  const idx = all.findIndex(f => f.email === decoded.email && f.filename === filename);
  const entry = { email: decoded.email, filename, timestamp: new Date().toISOString(), feedback };
  if (idx >= 0) all[idx] = entry; else all.push(entry);
  saveFeedback(all);
  res.json({ message: 'משוב נשמר' });
});

// קבלת המשובים האחרונים של משתמש (לשימוש פנימי בפרומפט)
function getRecentFeedback(email, limit = 5) {
  return loadFeedback()
    .filter(f => f.email === email)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

module.exports = { router, getRecentFeedback };
