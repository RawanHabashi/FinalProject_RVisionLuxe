import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <h1>Rvision Luxe</h1>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/new-collection">New Collection</Link>
        <Link to="/contact">Contact us</Link>
      </div>
      <div className="sign-in">
        <Link to="/signin">Sign in</Link>
      </div>
    </nav>
  );
};

export default Navbar;