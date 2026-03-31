const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

function loadUsers() {
  try {
    const f = path.join(__dirname, '../data/users.json');
    if (!fs.existsSync(f)) return [];
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch { return []; }
}

function formatPastFeedback(feedbacks) {
  if (!feedbacks.length) return '';
  return feedbacks.map((f, i) => {
    const fields = Object.entries(f.feedback)
      .map(([k, v]) => {
        const agreed = v.agreed ? 'הסכים' : 'לא הסכים';
        const note = v.note ? ` (הערה: ${v.note})` : '';
        return `    ${k}: ${agreed}${note}`;
      })
      .join('\n');
    return `  תמונה ${i + 1} (${f.timestamp.slice(0, 10)}):\n${fields}`;
  }).join('\n');
}

router.post('/', async (req, res) => {
  const { filename } = req.body;
  const userEmail = req.user?.email;

  if (process.env.GEMINI_API_KEY && filename) {
    try {
      const imagePath = path.join(__dirname, '../uploads', filename);
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      const ext = path.extname(filename).slice(1).toLowerCase();
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

      // פרופיל המשתמש
      let userProfile = '';
      if (userEmail) {
        const users = loadUsers();
        const user = users.find(u => u.email === userEmail);
        userProfile = user?.profile || '';
      }

      // משובים קודמים
      let pastFeedbackSection = '';
      if (userEmail) {
        const { getRecentFeedback } = require('./feedback');
        const recent = getRecentFeedback(userEmail, 4);
        if (recent.length) {
          pastFeedbackSection = `\nמשובים קודמים של המשתמש על ניתוחים קודמים (למד מהם את העדפותיו):\n${formatPastFeedback(recent)}\n`;
        }
      }

      const profileSection = userProfile
        ? `\nפרופיל המשתמש ודגשים אישיים:\n"${userProfile}"\nנתח את התמונה תוך התחשבות בדגשים אלו.\n`
        : '';

      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `אתה מאמן צילום מקצועי עם עומק ידע בעקרונות הקומפוזיציה הבאים:

**עקרונות קומפוזיציה לניתוח:**
- Rule of Thirds: הפריים מחולק ל-9 ריבועים (3×3). הנושא ממוקם על נקודות החיתוך, לא במרכז
- Leading Lines: קווים בסצנה (דרך, גדר, נהר, צל) שמובילים את העין אל הנושא
- Golden Ratio: פיתול ספירלי (1:1.618) — מרגיש יותר אורגני מ-Rule of Thirds
- Framing: שימוש באלמנטים בסצנה כ"מסגרת" סביב הנושא (קשת, חלון, ענפים)
- Symmetry & Patterns: סימטריה מושלמת, או שבירה מכוונת שלה ליצירת עניין
- Negative Space: שטח ריק בכוונה סביב הנושא — מדגיש ומעניק "נשימה"
- Depth / Layers: עצמים בחזית + אמצע + עומק יוצרים תחושת מרחב תלת-ממדי
- Fill the Frame: התקרבות מקסימלית — מסלקת הסחות ומדגישה פרטים
${profileSection}${pastFeedbackSection}
נתח את התמונה לפי העקרונות הרלוונטיים לה, ותחזיר JSON בלבד, ללא markdown ולא טקסט נוסף.

הפורמט המדויק (כל הטקסטים בעברית):
{
  "composition": "ציין איזה עקרון קומפוזיציה בולט בתמונה ואיך הוא מיושם",
  "angle": "האם התמונה ישרה? כמה מעלות לתקן ולאיזה כיוון?",
  "distance": "האם המרחק מהנושא אידיאלי? להתקרב, להתרחק, או מושלם?",
  "lighting": "מאיפה האור? האם הוא מחמיא לנושא ומשרת את הסגנון?",
  "focus": "האם הנושא המרכזי חד? מה בפוקוס ומה לא?",
  "details": "פרטים מסיחי דעת ברקע שכדאי להימנע מהם",
  "annotations": [
    כלול 3-6 annotations שמסמנים את עקרונות הקומפוזיציה על התמונה עצמה.
    התמונה מוצגת בגודל 400x400 פיקסלים — קואורדינטות בטווח 0-400.
    לכל annotation הוסף שדה "label" קצר (2-4 מילים בעברית) שמסביר מה הוא מסמן.
    פורמט: { "type": "arrow"|"line", "x1": N, "y1": N, "x2": N, "y2": N, "color": "...", "label": "..." }
    השתמש בחצים (arrow) להצבעה על נקודות ספציפיות, ובקווים (line) לסימון גבולות/צירים/Leading Lines.
    צבעים: "#ff4444" לבעיות, "#44ff88" לנקודות טובות, "rgba(255,200,0,0.8)" לאזורים לשיפור, "rgba(100,180,255,0.8)" להמלצות.
  ]
}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: base64Image } }
      ]);

      const raw = result.response.text().trim();
      console.log('Gemini raw:', raw.slice(0, 200));

      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({ ...parsed, filename });
      } else {
        console.error('Could not extract JSON:', raw.slice(0, 300));
      }
    } catch (err) {
      console.error('Gemini Vision error:', err.message);
    }
  }

  // דמו fallback
  res.json({
    filename,
    composition: 'חוק השלישים: טוב',
    angle: 'יש ליישר 5 מעלות ימינה',
    distance: 'התקרב מעט לנושא',
    lighting: 'תאורה טובה',
    focus: 'פוקוס תקין',
    details: 'אין הסחות דעת עיקריות',
    annotations: [
      { type: 'line', x1: 0, y1: 133, x2: 400, y2: 133, color: 'rgba(255,200,0,0.8)', label: 'שליש עליון' },
      { type: 'line', x1: 0, y1: 266, x2: 400, y2: 266, color: 'rgba(255,200,0,0.8)', label: 'שליש תחתון' },
      { type: 'line', x1: 133, y1: 0, x2: 133, y2: 400, color: 'rgba(255,200,0,0.8)', label: 'שליש שמאלי' },
      { type: 'line', x1: 266, y1: 0, x2: 266, y2: 400, color: 'rgba(255,200,0,0.8)', label: 'שליש ימני' },
      { type: 'arrow', x1: 200, y1: 200, x2: 250, y2: 160, color: '#44ff88', label: 'נושא מרכזי' }
    ]
  });
});

module.exports = router;
