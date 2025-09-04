import React, { useState } from "react";
import "./CheckoutPage.css";
import axios from "axios";

const TAX_RATE = 0.18;
const SHIPPING = 30;

const CheckoutPage = ({ items = [], onBack, onOrderPlaced }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ccNumber, setCcNumber] = useState("");
  const [validity, setValidity] = useState("");
  const [cvv, setCvv] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [message, setMessage] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const vat = subtotal * TAX_RATE;
  const total = subtotal + vat + SHIPPING;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.user_id) {
        setMessage("❌ You must be logged in to place an order.");
        return;
      }

      function getCurrentDateTimeInIsrael() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const israelOffset = -180;
  const diff = israelOffset - offset;
  const israelDate = new Date(now.getTime() + diff * 60000);
  return israelDate.toISOString().slice(0, 19).replace("T", " ");
}

      // שליחת הזמנה לשרת
      const orderRes = await axios.post("http://localhost:5000/api/orders", {
        user_id: user.user_id,
          order_date: getCurrentDateTimeInIsrael(),
        total_amount: total.toFixed(2),
        status: "Pending",
      });


      const orderId = orderRes.data.order_id;
      console.log("🧾 Created order ID:", orderId);

      // שליחת פריטים להזמנה
      for (const item of items) {
        console.log("📦 Sending item:", item);

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

      // מעבר לדף סטטוס
      setTimeout(() => {
        onOrderPlaced(orderId);
      }, 1500);
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
      <table className="summary-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Amount</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>x {item.quantity || 1}</td>
              <td>{item.price * (item.quantity || 1)}₪</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="layout-wrapper">
        <div className="summary-totals">
          <p>💼 Amount for all bags: {subtotal.toFixed(2)}₪</p>
          <p>👜 VAT (18%): {vat.toFixed(2)}₪</p>
          <p>🚚 Shipping: {SHIPPING}₪</p>
          <h3>✅ Total: {total.toFixed(2)}₪</h3>
        </div>

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
