import React from 'react';
import { Link } from 'react-router-dom';
import './ClientNavbar.css';

const ClientNavbar = () => {
  return (
    <nav className="client-navbar">
      <div className="logo">
        <Link to="/">Rvision Luxe</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/new-collection">New collection</Link>
        <Link to="/contact">Contact us</Link>
        <Link to="/signin">Sign in</Link>
      </div>
    </nav>
  );
};

export default ClientNavbar;