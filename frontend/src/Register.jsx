import React, { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('נרשמת בהצלחה!');
      } else {
        setMessage(data.message || 'שגיאה בהרשמה');
      }
    } catch (err) {
      setMessage('שגיאת רשת');
    }
  };

  return (
    <div className="page">
      <h2>הרשמה</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>אימייל:</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>סיסמה:</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">הרשם</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
