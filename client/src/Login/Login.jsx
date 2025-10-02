//Roaia Habashi and Rawan Habashi

import React, { useState } from 'react';
import api from '../api/axios';
import './Login.css';
function Login({ onForgotPassword, onRegister, onLoginSuccess, onAdminLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/users/login', { email, password });
      console.log('🔁 Full Response:', res);
      console.log('📦 Data:', res.data);
      const user = res.data.user || res.data; // ← גמישות אם השרת מחזיר ישירות את המשתמש
      if (user && user.email) {
        localStorage.setItem("user", JSON.stringify(user));
         // נשמור name/username בצורה סלחנית
      const displayName = user.name || user.username || '';
      if (displayName) {
        localStorage.setItem('username', displayName);
      }
         // הוספת שמירה של שם המשתמש וה־user_id
         // נשמור גם שם משתמש ו־id בנפרד
  if (user.user_id) {
    localStorage.setItem("user_id", user.user_id);
  }
        setMessage("✅ Logged in successfully");
        setTimeout(() => {
          if (user.role === 'admin' && onAdminLogin) {
            onAdminLogin();
          } else if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
      } else {
        setMessage("❌ Login failed: user not returned");
      }

    } catch (err) {
      console.error('❌ Axios Error:', err);

      if (err.response && err.response.data) {
        const errorMsg =
          err.response.data.error ||
          err.response.data.message ||
          'Unknown error';
        setMessage(`❌ ${errorMsg}`);
      } else {
        setMessage('❌ Network or server error');
      }
    }
  };

  return (
    <div className="login-page">
        <div className="login-container">
        <h1 className="site-title">Rvision Luxe</h1>
      <div className="login-box">
        <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <label>Email address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="login-links">
            <button
              type="button"
              className="forgot-link"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit">Continue</button>
          {message && (
            <p
              className="login-message"
              style={{
                color: message.includes("✅") ? "green" : "crimson",
                marginTop: '10px'
              }}
            >
              {message}
            </p>
          )}
        </form>
        <div className="signup-link">
          Don’t have an account?{' '}
          <button type="button" className="link-button" onClick={onRegister}>
            Sign up
          </button>
        </div>
      </div>
    </div>
     </div>
  );
}
export default Login;

