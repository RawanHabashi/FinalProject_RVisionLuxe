import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // מערך של כל הדפים האפשריים
  const allPages = [
    { path: '/', label: 'Home' },
    { path: '/cart', label: 'Cart' },
    { path: '/new-collection', label: 'New Collection' },
    { path: '/contact', label: 'Contact Us' }
  ];

  // מסנן את הדף הנוכחי מהרשימה
  const navLinksToShow = allPages.filter(page => page.path !== currentPath);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-links">
          {navLinksToShow.map(link => (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;