//Roaia Habashi and Rawan Habashi

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Login.css';

const MAX_ATTEMPTS = 3;

function Login({ onForgotPassword, onRegister, onLoginSuccess, onAdminLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage]   = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);

  // קריאה ראשונית – טוענים כמה נסיונות נכשלו מה-localStorage
  useEffect(() => {
    const failed = Number(localStorage.getItem('login_fail_count') || '0');
    setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - failed));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    // אם כבר אין נסיונות – שולחים ישר לשחזור סיסמה
    if (attemptsLeft <= 0) {
      setMessage('❌ You have reached the maximum number of attempts. Redirecting to password recovery...');
      if (onForgotPassword) {
        setTimeout(() => onForgotPassword(), 1500);
      }
      return;
    }

    try {
      const res = await api.post('/users/login', { email, password });

      console.log('🔁 Full Response:', res);
      console.log('📦 Data:', res.data);

      const user = res.data.user || res.data;

      if (user && user.email) {
        // התחברות הצליחה – מאפסים נסיונות כושלים
        localStorage.removeItem('login_fail_count');
        setAttemptsLeft(MAX_ATTEMPTS);

        localStorage.setItem("user", JSON.stringify(user));

        const displayName = user.name || user.username || '';
        if (displayName) {
          localStorage.setItem('username', displayName);
        }
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

      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        '';

      // נבדוק אם זו באמת שגיאת סיסמה/אימייל שגויים
      const isCredError =
        err?.response?.status === 401 ||
        serverMsg.toLowerCase().includes('invalid email or password');

      if (isCredError) {
        const prevFails = Number(localStorage.getItem('login_fail_count') || '0');
        const newFails  = prevFails + 1;
        localStorage.setItem('login_fail_count', String(newFails));

        const left = Math.max(0, MAX_ATTEMPTS - newFails);
        setAttemptsLeft(left);

        if (newFails >= MAX_ATTEMPTS) {
          // הגענו ל-3 נסיונות → שולחים לשחזור סיסמה
          setMessage('❌ Invalid email or password. Redirecting you to password recovery...');
          if (onForgotPassword) {
            setTimeout(() => onForgotPassword(), 1500);
          }
        } else {
          setMessage(`❌ Invalid email or password. You have ${left} more attempt${left === 1 ? '' : 's'} before password reset.`);
        }
      } else {
        // שגיאת רשת/שרת אחרת
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

            {/* אפשרות להראות למשתמש כמה נסיונות נשארו */}
            <div className="login-attempts-info">
              {attemptsLeft > 0
                ? `Attempts remaining: ${attemptsLeft}/${MAX_ATTEMPTS}`
                : `No attempts left – please reset your password`}
            </div>

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
