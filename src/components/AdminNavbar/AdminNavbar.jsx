import React from 'react';
import { Link } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <div className="logo">
        <Link to="/admin">Rvision Luxe - Admin</Link>
      </div>
      <div className="nav-links">
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/reports">Reports</Link>
        <Link to="/" className="logout">Log Out</Link>
      </div>
    </nav>
  );
};

export default AdminNavbar;