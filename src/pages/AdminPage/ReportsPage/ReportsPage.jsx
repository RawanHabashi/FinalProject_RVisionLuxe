import React, { useState } from 'react';
import './ReportsPage.css';

const ReportsPage = () => {
  const [date, setDate] = useState('');
  const [customers] = useState([
    {
      name: 'Ghaidaa Zoabi',
      items: '3 Bags',
      status: 'Completed',
      email: 'ghidaa.zoabi@gmail.com'
    },
    {
      name: 'Rihan darawshy',
      items: '1 Bag',
      status: 'Pending',
      email: 'rihan.rr@gmail.com'
    }
  ]);

  const stats = {
    ordersCount: 120,
    bagsSold: 250
  };

  const handleExport = () => {
    // Export to Excel logic here
  };

  const handleSendReport = (email) => {
    // Send report logic here
  };

  return (
    <div className="reports-page">
      <h1>Generate Reports</h1>

      <div className="reports-container">
        <div className="date-picker">
          <label>Date:</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="stats">
          <div className="stat-item">
            <label>Orders Count:</label>
            <span>{stats.ordersCount}</span>
          </div>
          <div className="stat-item">
            <label>Bags Sold:</label>
            <span>{stats.bagsSold}</span>
          </div>
          <button className="export-btn" onClick={handleExport}>
            Export to Excel
          </button>
        </div>

        <div className="customer-reports">
          <h2>Customer Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index}>
                  <td>{customer.name}</td>
                  <td>{customer.items}</td>
                  <td className={`status ${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </td>
                  <td>{customer.email}</td>
                  <td>
                    <button 
                      className="send-report-btn"
                      onClick={() => handleSendReport(customer.email)}
                    >
                      Send Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;