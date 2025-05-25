import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/new-collection">New Collection</Link>
        <Link to="/contact">Contact Us</Link>
      </div>
    </nav>
  );
};

export default Navigation;