// Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import "./CheckoutPage.css";
import axios from "axios";
import { PayPalButtons } from "@paypal/react-paypal-js";

// ⚠️ מחירי המוצרים כוללים מע״מ (VAT כלול במחירי המוצרים)
const TAX_RATE = 0.18;   // 18%
const SHIPPING = 30;     // משלוח קבוע

const CheckoutPage = ({ items = [], onBack, onOrderPlaced }) => {
  // ===== פרטי לקוח (נאספים לצורך הזמנה / משלוח) =====
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // ===== שדות כרטיס אשראי) =====
  const [ccNumber, setCcNumber] = useState("");
  const [validity, setValidity] = useState("");
  const [cvv, setCvv] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // ===== אמצעי תשלום: "Card" | "PayPal" =====
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [message, setMessage] = useState("");

  // ===== חישובי סכומים (מחיר המוצר כולל מע״מ) =====
  const subtotalInclVat = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );
  const vatAmount = +(subtotalInclVat * (TAX_RATE / (1 + TAX_RATE))).toFixed(2);
  const netBeforeVat = +(subtotalInclVat - vatAmount).toFixed(2);
  const finalTotal = +(subtotalInclVat + SHIPPING).toFixed(2);

  // ===== עוזר: תאריך-שעה ישראל בפורמט DB =====
  function getCurrentDateTimeInIsrael() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const israelOffset = -180; // UTC+3
    const diff = israelOffset - offset;
    const israelDate = new Date(now.getTime() + diff * 60000);
    return israelDate.toISOString().slice(0, 19).replace("T", " ");
  }

  // ===== ולידציה בסיסית לשדות המשתמש והסל =====
  function validateUserAndCart() {
    if (!fullName || !phone || !address) {
      setMessage("❌ Please fill in full name, phone and address.");
      return null;
    }
    if (!items?.length) {
      setMessage("❌ Your cart is empty.");
      return null;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.user_id) {
      setMessage("❌ You must be signed in to place an order.");
      return null;
    }
    return user;
  }

  // ===== יצירת הזמנה ושמירת פריטים ב־DB =====
  async function createOrderInDb({ user_id, status, payment_method }) {
    // יצירת הזמנה
    const orderRes = await axios.post("http://localhost:5000/api/orders", {
      user_id,
      order_date: getCurrentDateTimeInIsrael(),
      total_amount: finalTotal.toFixed(2),
      status,                 // "Pending"/"Processing"/"Paid"
      payment_method,         // "Card" / "PayPal"
    });
    const orderId = orderRes.data.order_id;

    // יצירת פריטי הזמנה
    for (const item of items) {
      const productId = item.product_id || item.id;
      if (!productId) throw new Error("Invalid product_id in cart item.");
      await axios.post("http://localhost:5000/api/order_items", {
        order_id: orderId,
        product_id: productId,
        quantity: item.quantity || 1,
      });
    }
    return orderId;
  }

  // ===== תשלום בכרטיס  =====
  const handleSubmitCard = async (e) => {
    e.preventDefault();
    setMessage("");
    const user = validateUserAndCart();
    if (!user) return;

    // ולידציה לשדות הכרטיס 
    if (!ccNumber || !validity || !cvv || !idNumber) {
      setMessage("❌ Please complete all credit card fields.");
      return;
    }

    try {
      const orderId = await createOrderInDb({
        user_id: user.user_id,
        status: "Pending",         
        payment_method: "Card",
      });
      setMessage("✅ Order placed successfully (Credit Card ).");
      setTimeout(() => onOrderPlaced?.(orderId), 1200);
    } catch (err) {
      console.error("Order failed:", err);
      setMessage("❌ Failed to place order. Please try again.");
    }
  };

  // ===== לאחר PayPal capture מוצלח (Sandbox) =====
  const onPayPalApproved = async () => {
    setMessage("");
    const user = validateUserAndCart();
    if (!user) return;

    try {
      const orderId = await createOrderInDb({
        user_id: user.user_id,
        status: "Paid",
        payment_method: "PayPal",
      });
      setMessage("✅ Payment approved via PayPal. Order saved.");
      setTimeout(() => onOrderPlaced?.(orderId), 1000);
    } catch (err) {
      console.error("Failed to save order after PayPal:", err);
      setMessage("❌ Error saving your order after PayPal payment.");
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
            const unit = Number(item.price) || 0;
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
        {/* סיכומי הזמנה */}
        <div className="summary-totals">
          <p>💼 Products Total (incl. VAT): {subtotalInclVat.toFixed(2)}₪</p>
          <p>🧮 VAT (18%): {vatAmount.toFixed(2)}₪</p>
          <p>🧾 Products Total (net, before VAT): {netBeforeVat.toFixed(2)}₪</p>
          <p>🚚 Shipping: {SHIPPING.toFixed(2)}₪</p>
          <h3>✅ Final Total: {finalTotal.toFixed(2)}₪</h3>
        </div>

        {/* טופס פרטי משתמש + אמצעי תשלום */}
        <form
          className="payment-form"
          onSubmit={paymentMethod === "Card" ? handleSubmitCard : (e) => e.preventDefault()}
        >
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

          <h3>Payment method</h3>
          {/* בחירת אמצעי תשלום */}
          <div className="payment-method">
            <label>
              <input
                type="radio"
                name="pm"
                value="Card"
                checked={paymentMethod === "Card"}
                onChange={() => setPaymentMethod("Card")}
              />
              Credit Card
            </label>
            <label style={{ marginInlineStart: 16 }}>
              <input
                type="radio"
                name="pm"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={() => setPaymentMethod("PayPal")}
              />
              PayPal 
            </label>
          </div>

          {/* --- מצב כרטיס אשראי  --- */}
          {paymentMethod === "Card" && (
            <>
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
            </>
          )}

          {/* --- מצב PayPal  --- */}
          {paymentMethod === "PayPal" && (
            <div style={{ marginTop: 8 }}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: finalTotal.toFixed(2),
                          currency_code: "ILS",
                        },
                        description: `Order (${items.length} items)`,
                      },
                    ],
                    application_context: { shipping_preference: "NO_SHIPPING" },
                  });
                }}
                onApprove={async (data, actions) => {
                  try {
                    await actions.order.capture(); 
                    await onPayPalApproved();
                  } catch (err) {
                    console.error("PayPal capture error:", err);
                    setMessage("❌ A payment error occurred. Please try again.");
                  }
                }}
                onError={(err) => {
                  console.error("PayPal error:", err);
                  setMessage("❌ PayPal error. Please try again.");
                }}
              />
            </div>
          )}

          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
