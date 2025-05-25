import React from 'react';
import { Link } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
  return (
    <div className="sign-in-container">
      <h1>Rvision Luxe</h1>
      <nav className="secondary-nav">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/new-collection">New Collection</Link>
        <Link to="/contact">Contact us</Link>
      </nav>
      
      <div className="sign-in-form">
        <h2>Sign In</h2>
        <form>
          <div className="form-group">
            <input type="email" placeholder="Email address" />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password" />
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="continue-btn">Continue</button>
          <div className="sign-up-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;