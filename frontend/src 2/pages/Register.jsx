import React, { useState } from 'react';
import api from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register', { email, password });
      setSuccess('נרשמת בהצלחה! אפשר להתחבר');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה');
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>הרשמה</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
        <input type="email" placeholder="אימייל" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="סיסמה" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">הרשם</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
      </form>
    </div>
  );
}
