import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setMessage('');
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('בחר תמונה להעלאה');
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.filename) {
        setMessage('מנתח תמונה...');
        const visionRes = await fetch('http://localhost:4000/api/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ filename: data.filename })
        });
        const vision = await visionRes.json();
        localStorage.setItem('visionResult', JSON.stringify(vision));
        navigate('/results');
      } else {
        setMessage(data.message || 'שגיאה בהעלאה');
      }
    } catch (err) {
      setMessage('שגיאת רשת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>העלאת תמונה</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleChange} />
        {preview && (
          <div style={{ margin: '1rem 0' }}>
            <img
              src={preview}
              alt="תצוגה מקדימה"
              style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #444' }}
            />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'מעלה ומנתח...' : 'העלה וקבל ניתוח'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
