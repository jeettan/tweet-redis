import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './Login'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.StrictMode>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
      </Routes>
    </React.StrictMode>
  </Router>
);


