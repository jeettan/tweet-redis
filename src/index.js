import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap-modal.css';
import './index.css';
import App from './pages/App';
import Login from './pages/Login'
import Profile from './pages/Profile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.StrictMode>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </React.StrictMode>
  </Router>
);
