import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setProfile(d.profile || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profile })
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <div className="page" dir="rtl">
      <h2>הפרופיל שלי</h2>
      <p style={{ color: '#a7e0ff', fontSize: '0.97rem', marginBottom: '1.2rem' }}>
        תאר את הדגשים, הסגנון והערכים שחשובים לך בצילום.<br />
        Gemini ישתמש בפרופיל זה בכל ניתוח תמונה.
      </p>
      <div style={{ marginBottom: '0.5rem', color: '#ffb347', fontWeight: 700 }}>דגשים אישיים</div>
      {loading ? (
        <p>טוען...</p>
      ) : (
        <textarea
          value={profile}
          onChange={e => setProfile(e.target.value)}
          placeholder={`לדוגמה:\nאני מצלם רחוב בסגנון Cartier-Bresson — מחפש רגע מכריע עם גיאומטריה חזקה.\nחשוב לי Rule of Thirds, Leading Lines ושכבות עומק.\nקומפוזיציה מסודרת מדי שנראית מתוכננת היא שגיאה בעיניי.`}
          rows={7}
          style={{
            width: '100%', background: '#18181a', color: '#f3f3f3',
            border: '1.5px solid #444', borderRadius: '10px',
            padding: '0.9rem', fontSize: '1rem', resize: 'vertical',
            fontFamily: 'inherit', direction: 'rtl', boxSizing: 'border-box'
          }}
        />
      )}
      <button onClick={handleSave} style={{ marginTop: '1rem' }}>
        {saved ? 'נשמר ✓' : 'שמור פרופיל'}
      </button>

      <div style={{ marginTop: '2.5rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
        <div style={{ color: '#ffb347', fontWeight: 700, marginBottom: '0.7rem' }}>השראה לפרופיל</div>
        {[
          {
            name: 'Cartier-Bresson / הרגע המכריע',
            text: 'אני מחפש את הרגע שבו תוכן, צורה וזמן מתאחדים בשלמות — לא לחכות, לא לייצר. הקומפוזיציה גיאומטרית ומדויקת: קווים, צללים, פרופורציות מתוך סצנה חיה. שחור-לבן, לא חתוך, אפס מניפולציה. קומפוזיציה "נקייה מדי" שנראית מסודרת ומתוכננת היא שגיאה.'
          },
          {
            name: 'סגנון יפני / Wabi-Sabi',
            text: 'אני עובד לפי שני עקרונות: Wabi-Sabi — יופי באי-שלמות, בחולפות, בישן ובנשחק. Ma — הריק בין הדברים הוא מרכיב ויזואלי שווה ערך לאובייקטים עצמם. מה שנעדר מהפריים חשוב לא פחות ממה שנמצא בו. אור עדין ומפוזר, פלטה מינימלית. עומס ויזואלי וצבעים חזקים הם שגיאה.'
          },
          {
            name: 'דוקומנטרי-עיתונאי',
            text: 'האמת על פני האסתטיקה — תמיד. אני מתעד, לא יוצר. תמונה מטושטשת עם חדשות חזקות עדיפה על תמונה מושלמת שמחמיצה את הרגע. קונטקסט חיוני: מי, מה, מתי ואיפה חייבים להיות ניתנים לקריאה מהתמונה. עריכה — רק תיקון חשיפה בסיסי. תמונה יפה שאינה מספרת סיפור ברור היא שגיאה.'
          },
          {
            name: 'Fine Art',
            text: 'התמונה היא ביטוי אישי, לא תיעוד. אין כלל שלא ניתן לשבור — הכלל היחיד הוא כוונה מודעת. עריכה, חשיפה כפולה, מניפולציה דיגיטלית — כולם כלים לגיטימיים כשהם משרתים רעיון. אני עובד בסדרות נושאיות. השאלה המרכזית היא לא "מה אני רואה?" אלא "מה אני אומר?". תמונה ללא כוונה ברורה שנראית מקרית היא שגיאה.'
          },
        ].map(s => (
          <div
            key={s.name}
            onClick={() => setProfile(s.text)}
            style={{
              background: '#18181a', borderRadius: '8px', padding: '0.7rem 1rem',
              marginBottom: '0.5rem', cursor: 'pointer', border: '1px solid #333',
              transition: 'border 0.2s', textAlign: 'right'
            }}
            onMouseEnter={e => e.currentTarget.style.border = '1px solid #ffb347'}
            onMouseLeave={e => e.currentTarget.style.border = '1px solid #333'}
          >
            <span style={{ color: '#ffb347', fontWeight: 700 }}>{s.name}</span>
            <span style={{ color: '#aaa', fontSize: '0.92rem', marginRight: '0.7rem' }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
