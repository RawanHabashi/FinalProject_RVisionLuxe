// Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import "./CheckoutPage.css";
import axios from "axios";
// ⚠️  מחירי המוצרים כוללים מע״מ.
// לכן ה־VAT שמוצג הוא רכיב המע״מ מתוך המחיר הכולל (18/118).
const TAX_RATE = 0.18;   // 18%
const SHIPPING = 30;     // משלוח קבוע 
const CheckoutPage = ({ items = [], onBack, onOrderPlaced }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ccNumber, setCcNumber] = useState("");
  const [validity, setValidity] = useState("");
  const [cvv, setCvv] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [message, setMessage] = useState("");

  // סכום שורות (כולל מע״מ כי item.price כולל מע״מ)
  const subtotalInclVat = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  // רכיב המע״מ מתוך המחיר הכולל: 18/118 (באופן כללי: r / (1 + r))
  const vatAmount = +(subtotalInclVat * (TAX_RATE / (1 + TAX_RATE))).toFixed(2);

  // נטו (לפני מע״מ) – אופציונלי להצגה
  const netBeforeVat = +(subtotalInclVat - vatAmount).toFixed(2);

  // מחיר סופי ללקוחה: מוצרים (כולל מע״מ) + משלוח (לא מוסיפים VAT שוב)
  const finalTotal = +(subtotalInclVat + SHIPPING).toFixed(2);

  // עוזר לייצר תאריך-שעה לפי שעון ישראל בפורמט YYYY-MM-DD HH:mm:ss
  function getCurrentDateTimeInIsrael() {
    const now = new Date();
    const offset = now.getTimezoneOffset(); // בדקות
    const israelOffset = -180; // UTC+3 = -180 דקות
    const diff = israelOffset - offset;
    const israelDate = new Date(now.getTime() + diff * 60000);
    return israelDate.toISOString().slice(0, 19).replace("T", " ");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user?.user_id) {
        setMessage("❌ You must be logged in to place an order.");
        return;
      }

      // 📨 יצירת הזמנה (שימי לב: total_amount = finalTotal)
      const orderRes = await axios.post("http://localhost:5000/api/orders", {
        user_id: user.user_id,
        order_date: getCurrentDateTimeInIsrael(),
        total_amount: finalTotal.toFixed(2),
        status: "Pending",
      });

      const orderId = orderRes.data.order_id;
      console.log("🧾 Created order ID:", orderId);

      // 📨 יצירת פריטי הזמנה
      for (const item of items) {
        const productId = item.product_id || item.id;
        if (!productId) {
          console.error("❌ Missing product_id for item:", item);
          setMessage("❌ Failed to place order. Invalid product data.");
          return;
        }
        await axios.post("http://localhost:5000/api/order_items", {
          order_id: orderId,
          product_id: productId,
          quantity: item.quantity || 1,
        });
      }

      setMessage("✅ Order placed successfully!");
      setTimeout(() => onOrderPlaced(orderId), 1200);
    } catch (err) {
      console.error("Order failed:", err);
      setMessage("❌ Failed to place order. Please try again.");
    }
  };

  return (
    <div className="checkout-container">
      <button className="back-button" onClick={onBack}>
        ← Back to Cart
      </button>

      <h2>Closing an order</h2>

      {/* טבלת פריטים */}
      <table className="summary-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
            <th>Unit Price (incl. VAT)</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = item.quantity || 1;
            const unit = Number(item.price) || 0; // כולל מע״מ
            const line = unit * qty;
            return (
              <tr key={index}>
                <td>{item.name}</td>
                <td>x {qty}</td>
                <td>{unit.toFixed(2)}₪</td>
                <td>{line.toFixed(2)}₪</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="layout-wrapper">
        {/* סיכומי הזמנה (לפי לוגיקה חדשה) */}
        <div className="summary-totals">
          <p>
            💼 Products Total (incl. VAT): {subtotalInclVat.toFixed(2)}₪
          </p>
          <p>🧮 VAT (18%): {vatAmount.toFixed(2)}₪</p>
          {/* אופציונלי להצגה: נטו לפני מע״מ */}
          <p>🧾 Products Total (net, before VAT): {netBeforeVat.toFixed(2)}₪</p>
          <p>🚚 Shipping: {SHIPPING.toFixed(2)}₪</p>
          <h3>✅ Final Total: {finalTotal.toFixed(2)}₪</h3>
        </div>

        {/* טופס פרטי תשלום (דמה) */}
        <form className="payment-form" onSubmit={handleSubmit}>
          <h3>User information</h3>
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <h3>Payment details</h3>
          <input
            type="text"
            placeholder="Credit card number"
            value={ccNumber}
            onChange={(e) => setCcNumber(e.target.value)}
            required
          />
          <div className="row">
            <input
              type="text"
              placeholder="Validity"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>
          <input
            type="text"
            placeholder="ID of cardholder"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />

          <button type="submit">Place an order</button>
          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
