import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import Results from './pages/Results';

export default function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: 16, padding: 16 }}>
        <Link to="/">דף הבית</Link>
        <Link to="/upload">העלה תמונה</Link>
        <Link to="/login">התחברות</Link>
        <Link to="/register">הרשמה</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
