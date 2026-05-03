import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLogin(data.email, data.token);
        navigate('/upload');
      } else {
        setMessage(data.message || 'שגיאה בהתחברות');
      }
    } catch (err) {
      setMessage('שגיאת רשת');
    }
  };

  return (
    <div className="page">
      <h2>התחברות</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>אימייל:</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>סיסמה:</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">התחבר</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
