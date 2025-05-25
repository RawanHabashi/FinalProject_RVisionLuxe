import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(user => user.email === formData.email)) {
      setError('Email already exists');
      return;
    }

    const newUser = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: 'customer'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    navigate('/signin');
  };

  return (
    <div className="signup-page">
      <div className="site-title">
        <h1>Rvision Luxe</h1>
      </div>
      <div className="signup-form">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="name-fields">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
          </div>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
          <button type="submit" className="create-account-btn">
            Create Account
          </button>
        </form>
        <div className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;