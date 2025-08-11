import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrdersInformation.css';

function OrdersInformation({ userId: userIdProp, onBack }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // מזהה משתמש אפקטיבי: מה-prop ואם אין — מה-localStorage
  const effectiveUserId = userIdProp ?? JSON.parse(localStorage.getItem("user") || "{}")?.user_id ?? null;

  useEffect(() => {
    // אם אין משתמש מחובר — לא ננסה להביא הזמנות
    if (!effectiveUserId) return;

    async function fetchOrders() {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/user/${effectiveUserId}`);
        setOrders(res.data || []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
        setError("Failed to load your orders. Please try again later.");
      }
    }
    fetchOrders();
  }, [effectiveUserId]); // ← חשוב

  const statusSteps = [
    { label: "Pending", icon: "⏳" },
    { label: "Processing", icon: "🔄" },
    { label: "Ready for Shipment", icon: "📦" },
    { label: "In Transit", icon: "🚚" },
    { label: "Delivered", icon: "✅" },
  ];

  const getCurrentStep = (status) =>
    statusSteps.findIndex((s) => s.label === status); // מחזיר -1 אם לא קיים

  const downloadInvoice = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/invoice/${orderId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_order_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Failed to download invoice:", err);
      alert("Failed to download invoice. Please try again later.");
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-title">📦 My Orders</div>
      <button className="back-button" onClick={onBack}>← Back to Home</button>

      {error && <div className="error-message">{error}</div>}

      {/* אורח – אין משתמש מחובר */}
      {!error && !effectiveUserId && (
        <div className="empty-orders">
          <div className="empty-emoji">🛍️</div>
          <h3>You’re not signed in</h3>
          <p>Sign in to view your order history.</p>
        </div>
      )}

      {/* משתמש מחובר אבל אין הזמנות */}
      {!error && effectiveUserId && orders.length === 0 && (
        <div className="empty-orders">
          <div className="empty-emoji">✨</div>
          <h3>No orders yet</h3>
          <p>Looks a little empty here. Start shopping and your orders will appear right away!</p>
        </div>
      )}

      {/* יש הזמנות */}
      {!error && orders.length > 0 && orders.map((order) => {
        const currentStep = getCurrentStep(order.status); // -1 אם לא נמצא
        const widthPct = Math.max(0, currentStep + 1) * 20; // 0%–100%

        return (
          <div className="order-card" key={order.order_id}>
            <p><strong>Order ID:</strong> {order.order_id}</p>
            <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Status:</strong> {order.status}</p>

            <div className="order-status-bar">
              <div className="progress-line">
                <div className="progress-fill" style={{ width: `${widthPct}%` }}></div>
              </div>

              <button className="invoice-button" onClick={() => downloadInvoice(order.order_id)}>
                📄 Download Invoice
              </button>

              <div className="status-steps">
                {statusSteps.map((step, idx) => (
                  <div key={idx} className={`status-step ${idx === currentStep ? "active" : ""}`}>
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-label">{idx + 1}<br />{step.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrdersInformation;
