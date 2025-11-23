//Roaia Habashi and Rawan Habashi

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrdersInformation.css';

const money = (n) => (Number(n || 0)).toFixed(2) + " ₪";

function OrdersInformation({ userId: userIdProp, onBack }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // מזהה משתמש אפקטיבי: מה-prop ואם אין — מה-localStorage
  const effectiveUserId =
    userIdProp ??
    JSON.parse(localStorage.getItem("user") || "{}")?.user_id ??
    null;
  
      // טעינת ההזמנות של המשתמש המחובר
  useEffect(() => {
    if (!effectiveUserId) return; // אם אין משתמש מחובר — לא נביא הזמנות
    async function fetchOrders() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/orders/user/${effectiveUserId}`
        );
        setOrders(res.data || []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
        setError("Failed to load your orders. Please try again later.");
      }
    }
    fetchOrders();
  }, [effectiveUserId]);

  const statusSteps = [
    { label: "Pending", icon: "⏳" },
    { label: "Processing", icon: "🔄" },
    { label: "Ready for Shipment", icon: "📦" },
    { label: "In Transit", icon: "🚚" },
    { label: "Delivered", icon: "✅" },
  ];

  const getCurrentStep = (status) =>//סטטוס נוכחי
    statusSteps.findIndex((s) => s.label === status); // מחזיר -1 אם לא קיים

     // הורדת חשבונית PDF להזמנה
    const downloadInvoice = async (orderId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/invoice/${orderId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_order_${orderId}.pdf`);
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
      <button className="back-button" onClick={onBack}>
        ← Back to Home
      </button>

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
          <p>
            Looks a little empty here. Start shopping and your orders will
            appear right away!
          </p>
        </div>
      )}

      {/* יש הזמנות */}
      {!error &&
        orders.length > 0 &&
        orders.map((order) => {
          const currentStep = getCurrentStep(order.status);
          const widthPct = Math.max(0, currentStep + 1) * 20; // 0%–100%

          return (
            <div className="order-card" key={order.order_id}>
              <p>
                <strong>Order ID:</strong> {order.order_id}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.order_date).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>

              {/* טבלת פריטים */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="order-items">
                  <table className="order-items-table" width="100%">
                    <thead>
                      <tr>
                        <th align="left">Product</th>
                        <th align="right">Qty</th>
                        <th align="right">Unit Price (incl. VAT)</th>
                        <th align="right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((it, idx) => {
                        const qty = Number(it.quantity || 1);
                        const price = Number(it.price || 0);
                        const line = qty * price;
                        return (
                          <tr key={idx}>
                            <td>{it.name}</td>
                            <td align="right">{qty}</td>
                            <td align="right">{price.toFixed(2)} ₪</td>
                            <td align="right">{line.toFixed(2)} ₪</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* סיכומים מהשרת */}
              {order.totals ? (
                <div className="order-totals">
                  <hr />
                  <div className="totals-grid">
                    <div>
                      <strong>Products Total (incl. VAT):</strong>
                    </div>
                    <div>{money(order.totals.products_total_incl_vat)}</div>

                    <div>
                      <strong>🚚 Shipping:</strong>
                    </div>
                    <div>{money(order.totals.shipping)}</div>

                    <div>
                      <strong>VAT ({order.totals.vat_percent}%):</strong>
                    </div>
                    <div>{money(order.totals.vat_amount)}</div>

                    <div>
                      <strong>Products Total (net, before VAT):</strong>
                    </div>
                    <div>{money(order.totals.products_total_net)}</div>

                    <div style={{ fontSize: 16 }}>
                      <strong>Final Total:</strong>
                    </div>
                    <div style={{ fontSize: 16 }}>
                      {money(order.totals.final_total)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-totals">
                  <hr />
                  <div className="totals-grid">
                    <div>
                      <strong>Totals:</strong>
                    </div>
                    <div>—</div>
                  </div>
                </div>
              )}

              {/* בר התקדמות סטטוס */}
              <div className="order-status-bar">
                <div className="progress-line">
                  <div
                    className="progress-fill"
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>
                <button
                  className="invoice-button"
                  onClick={() => downloadInvoice(order.order_id)}
                >
                  📄 Download Invoice
                </button>
                <div className="status-steps">
                  {statusSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`status-step ${
                        idx === currentStep ? "active" : ""
                      }`}
                    >
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-label">
                        {idx + 1}
                        <br />
                        {step.label}
                      </div>
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
