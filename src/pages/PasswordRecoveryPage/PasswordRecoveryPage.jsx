import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PasswordRecoveryPage.css';

const PasswordRecoveryPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Password recovery instructions have been sent to your email');
  };

  return (
    <div className="recovery-page">
      <div className="site-title">
        <h1>Rvision Luxe</h1>
      </div>
      <div className="recovery-form">
        <h2>Password Recovery</h2>
        <p className="instructions">
          Enter your email address and we'll send you instructions
          to reset your password.
        </p>
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="recovery-btn">
            Send Recovery Email
          </button>
        </form>
        <div className="back-link">
          <Link to="/signin">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;