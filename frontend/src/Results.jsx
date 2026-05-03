import React, { useState } from 'react';

function Arrow({ x1, y1, x2, y2, color }) {
  const dx = x2 - x1, dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const arrowHead = [
    { x: x2, y: y2 },
    { x: x2 - 12 * Math.cos(angle - 0.4), y: y2 - 12 * Math.sin(angle - 0.4) },
    { x: x2 - 12 * Math.cos(angle + 0.4), y: y2 - 12 * Math.sin(angle + 0.4) }
  ];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" />
      <polygon points={arrowHead.map(p => `${p.x},${p.y}`).join(' ')} fill={color} />
    </g>
  );
}

const FIELD_LABELS = {
  composition: 'קומפוזיציה',
  angle: 'זווית',
  distance: 'מרחק',
  lighting: 'תאורה',
  focus: 'פוקוס',
  details: 'פרטים',
};

export default function Results() {
  let vision = null;
  try { vision = JSON.parse(localStorage.getItem('visionResult')); } catch {}

  const [feedback, setFeedback] = useState(() => {
    const initial = {};
    Object.keys(FIELD_LABELS).forEach(k => { initial[k] = { agreed: null, note: '' }; });
    return initial;
  });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);

  const [imgSize, setImgSize] = useState({ w: 400, h: 400 });
  const MAX_W = 460;

  const imageUrl = vision?.filename
    ? `http://localhost:4000/uploads/${vision.filename}`
    : null;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const w = Math.min(naturalWidth, MAX_W);
    const h = Math.round(naturalHeight * (w / naturalWidth));
    setImgSize({ w, h });
  };

  // Gemini מחשב annotations על בסיס 400x400 - נמיר לגודל המוצג
  const scaleAnnotation = (a) => ({
    ...a,
    x1: Math.round(a.x1 * imgSize.w / 400),
    y1: Math.round(a.y1 * imgSize.h / 400),
    x2: Math.round(a.x2 * imgSize.w / 400),
    y2: Math.round(a.y2 * imgSize.h / 400),
  });

  const width = imgSize.w, height = imgSize.h;

  const toggleAgreed = (field, value) => {
    setFeedback(f => ({
      ...f,
      [field]: { ...f[field], agreed: f[field].agreed === value ? null : value }
    }));
  };

  const setNote = (field, note) => {
    setFeedback(f => ({ ...f, [field]: { ...f[field], note } }));
  };

  const submitFeedback = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:4000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filename: vision.filename, feedback })
    });
    setFeedbackSent(true);
  };

  if (!vision) return <div className="page" dir="rtl"><p>אין תוצאה להצגה.</p></div>;

  return (
    <div className="page" dir="rtl" style={{ maxWidth: 520 }}>
      <h2>ניתוח התמונה</h2>

      {/* תמונה עם annotations */}
      <div style={{ position: 'relative', display: 'inline-block', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px #0007', marginBottom: '1.5rem' }}>
        <img
          src={imageUrl || '/placeholder.jpg'}
          alt="תמונה מנותחת"
          onLoad={handleImageLoad}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        <svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {vision.annotations?.map((a, i) => {
            const s = scaleAnnotation(a);
            return a.type === 'line' ? (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={a.color} strokeWidth="2.5" />
            ) : a.type === 'arrow' ? (
              <Arrow key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} color={a.color} />
            ) : null;
          })}
        </svg>
        {/* תוויות annotations */}
        {vision.annotations?.map((a, i) => {
          if (!a.label) return null;
          const s = scaleAnnotation(a);
          const lx = a.type === 'arrow' ? s.x2 : (s.x1 + s.x2) / 2;
          const ly = a.type === 'arrow' ? s.y2 : (s.y1 + s.y2) / 2;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: Math.min(lx + 4, width - 110),
                top: Math.max(ly - 22, 2),
                background: 'rgba(24,24,26,0.85)',
                color: a.color || '#ffb347',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 5,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                border: `1px solid ${a.color || '#ffb347'}44`,
              }}
            >
              {a.label}
            </div>
          );
        })}
      </div>

      {/* שדות ניתוח + משוב */}
      {Object.entries(FIELD_LABELS).map(([key, label]) => {
        const fb = feedback[key];
        return (
          <div key={key} style={{ marginBottom: '1.1rem', background: '#18181a', borderRadius: 10, padding: '0.9rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#ffb347', fontWeight: 700 }}>{label}: </span>
                <span style={{ color: '#f3f3f3', fontSize: '0.97rem' }}>{vision[key]}</span>
              </div>
              {/* כפתורי הסכמה */}
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                <button
                  onClick={() => toggleAgreed(key, true)}
                  title="הסכמתי"
                  style={{
                    background: fb.agreed === true ? '#44ff8833' : 'none',
                    border: `1.5px solid ${fb.agreed === true ? '#44ff88' : '#444'}`,
                    color: fb.agreed === true ? '#44ff88' : '#666',
                    borderRadius: 7, padding: '2px 8px', cursor: 'pointer', fontSize: '1rem'
                  }}
                >✓</button>
                <button
                  onClick={() => toggleAgreed(key, false)}
                  title="לא הסכמתי"
                  style={{
                    background: fb.agreed === false ? '#ff444433' : 'none',
                    border: `1.5px solid ${fb.agreed === false ? '#ff4444' : '#444'}`,
                    color: fb.agreed === false ? '#ff4444' : '#666',
                    borderRadius: 7, padding: '2px 8px', cursor: 'pointer', fontSize: '1rem'
                  }}
                >✗</button>
                <button
                  onClick={() => setActiveNote(activeNote === key ? null : key)}
                  title="הוסף הערה"
                  style={{
                    background: activeNote === key ? '#ffb34733' : 'none',
                    border: `1.5px solid ${fb.note ? '#ffb347' : '#444'}`,
                    color: fb.note ? '#ffb347' : '#666',
                    borderRadius: 7, padding: '2px 8px', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >✎</button>
              </div>
            </div>
            {activeNote === key && (
              <input
                autoFocus
                value={fb.note}
                onChange={e => setNote(key, e.target.value)}
                placeholder="הערה שלך..."
                style={{
                  marginTop: '0.6rem', width: '100%', background: '#23232b',
                  border: '1px solid #ffb347', borderRadius: 7, color: '#f3f3f3',
                  padding: '0.4rem 0.7rem', fontSize: '0.93rem', boxSizing: 'border-box', direction: 'rtl'
                }}
              />
            )}
          </div>
        );
      })}

      {/* שליחת משוב */}
      {!feedbackSent ? (
        <button
          onClick={submitFeedback}
          style={{ marginTop: '0.5rem', width: '100%' }}
        >
          שלח משוב ← Gemini ילמד מהדגשים שלך
        </button>
      ) : (
        <p style={{ color: '#44ff88', textAlign: 'center', marginTop: '1rem' }}>
          משוב נשמר! הניתוח הבא יתחשב בהעדפותיך.
        </p>
      )}
    </div>
  );
}
