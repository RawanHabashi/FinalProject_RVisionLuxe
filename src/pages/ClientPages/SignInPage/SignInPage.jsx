import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignInPage.css';

const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.email === 'admin@rvision.com' && formData.password === 'admin123') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="sign-in-page">
      <div className="logo-container">
        <h1>Rvision Luxe</h1>
      </div>
      <div className="sign-in-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <Link to="/forgot-password" className="forgot-password">
            Forgot password?
          </Link>
          
          <button type="submit" className="sign-in-btn">
            Continue
          </button>
        </form>
        
        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;