import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminStyles.css';

const Reports = () => {
  const [salesData] = useState([
    { id: 1, date: '2024-01-15', product: 'Wedding Bag', quantity: 2, revenue: '500₪' },
    { id: 2, date: '2024-01-16', product: 'School Bag', quantity: 3, revenue: '540₪' },
    { id: 3, date: '2024-01-17', product: 'Daily Bag', quantity: 1, revenue: '200₪' }
  ]);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Rvision Luxe - Admin</h1>
        <nav>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
          <Link to="/signin" className="logout">Log Out</Link>
        </nav>
      </header>

      <main className="admin-main">
        <h2>Sales Reports</h2>

        <div className="reports-summary">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p>1,240₪</p>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p>6</p>
          </div>
          <div className="summary-card">
            <h3>Popular Item</h3>
            <p>School Bag</p>
          </div>
        </div>

        <div className="reports-table">
          <h3>Recent Sales</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.date}</td>
                  <td>{sale.product}</td>
                  <td>{sale.quantity}</td>
                  <td>{sale.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Reports;