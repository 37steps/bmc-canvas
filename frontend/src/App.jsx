import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Upload from './Upload.jsx';
import Results from './Results.jsx';
import Profile from './Profile.jsx';
import './street-photo.css';

function Nav({ user, onLogout }) {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <>
          <span style={{ color: '#a7e0ff', fontSize: '0.95rem' }}>{user}</span>
          <Link to="/upload">העלאת תמונה</Link>
          <Link to="/results">תוצאות</Link>
          <Link to="/profile">הפרופיל שלי</Link>
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: '1.5px solid #ffb347', color: '#ffb347',
              borderRadius: '8px', padding: '0.3rem 1rem', cursor: 'pointer',
              fontSize: '1rem', fontWeight: 700
            }}
          >
            התנתק
          </button>
        </>
      ) : (
        <>
          <Link to="/login">התחברות</Link>
          <Link to="/register">הרשמה</Link>
        </>
      )}
    </nav>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('userEmail'));

  const handleLogin = (email, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('visionResult');
    setUser(null);
  };

  return (
    <Router>
      <Nav user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={
          <PrivateRoute user={user}>
            <Upload />
          </PrivateRoute>
        } />
        <Route path="/results" element={
          <PrivateRoute user={user}>
            <Results />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute user={user}>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="*" element={user ? <Navigate to="/upload" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
