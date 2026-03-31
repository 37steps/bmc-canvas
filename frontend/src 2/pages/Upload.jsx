import React, { useState } from 'react';
import api from '../api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('בחר תמונה');
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // שלב 1: העלאה
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // שלב 2: ניתוח
      const visionRes = await api.post('/vision', { filename: uploadRes.data.filename });
      setResult(visionRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהעלאה/ניתוח');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>העלה תמונה לניתוח</h2>
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <input type="file" accept="image/*" onChange={handleFile} />
        <button type="submit" disabled={loading}>{loading ? 'מעלה...' : 'העלה ונתח'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      {result && (
        <div style={{ marginTop: 32 }}>
          <h3>תוצאות ניתוח</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
