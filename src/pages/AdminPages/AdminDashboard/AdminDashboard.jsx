import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>125</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>48</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>75</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;