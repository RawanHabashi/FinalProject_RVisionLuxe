import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  // רק אם אנחנו בדף מנהל
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="header-wrapper">
      <header className="main-header">
        <div className="header-content">
          <Link to={currentUser?.role === 'admin' ? '/admin/dashboard' : '/'} className="logo">
            Rvision Luxe
          </Link>
          {currentUser && (
            <div className="user-info">
              <span>Welcome, {currentUser.role === 'admin' ? 'Admin' : currentUser.firstName}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </header>
      {isAdminPage && currentUser?.role === 'admin' && (
        <nav className="admin-nav">
          <div className="nav-content">
            <Link to="/admin/reports">Reports</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/categories">Categories</Link>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Header;