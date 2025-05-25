import React from 'react';
import Header from '../../components/Header/Header';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <Header />
      <main className="admin-content">
        <h2>Admin Dashboard</h2>
        {/* כאן יבוא תוכן הדף */}
      </main>
    </div>
  );
};

export default AdminDashboard;