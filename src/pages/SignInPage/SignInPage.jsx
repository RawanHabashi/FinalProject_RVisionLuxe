import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // בדיקה אם יש משתמשים ב-localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // חיפוש המשתמש
    const user = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.password === formData.password
    );

    if (formData.email === 'admin@rvision.com' && formData.password === 'admin123') {
      const adminUser = {
        firstName: 'Admin',
        email: formData.email,
        role: 'admin'
      };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      navigate('/admin/dashboard');
    } 
    else if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/');
    } 
    else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="sign-in-page">
      <div className="site-title">
        <h1>Rvision Luxe</h1>
      </div>
      <div className="sign-in-form">
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>
        <div className="signup-prompt">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;