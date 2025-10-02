//Roaia Habashi and Rawan Habashi

import React, { useState } from 'react';
import './SignUpPage.css';
const SignUpPage = ({ onBack }) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    phone_number: '',
    role: 'customer',
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          location: formData.location,
          phone_number: formData.phone_number,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      alert('✅ Registration successful!');
      if (onBack) onBack();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed');
    }
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
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          >
            <option value="customer">Customer</option>
          </select>
          <button type="submit" className="create-account-btn">
            Create Account
          </button>
        </form>
        <div className="signin-link">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onBack}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
