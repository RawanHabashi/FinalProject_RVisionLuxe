import React, { useState } from 'react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const [orderItems] = useState([
    { name: 'School Bag', amount: 4, price: 320 },
    { name: 'Daily Bag', amount: 2, price: 200 },
    { name: 'Wallet', amount: 1, price: 50 }
  ]);

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 30;
  const total = subtotal + shipping;

  return (
    <div className="checkout-page">
      <h1>Closing an order</h1>
      
      <div className="order-summary">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Amount</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>x {item.amount}</td>
                <td>{item.price}₪</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="subtotal">
            <span>Amount for all bags</span>
            <span>{subtotal}₪</span>
          </div>
          <div className="total">
            <span>Final amount including shipping</span>
            <span>{total}₪</span>
          </div>
        </div>
      </div>

      <div className="checkout-form">
        <div className="personal-details">
          <h3>פרטי משתמש</h3>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input type="text" />
          </div>
        </div>

        <div className="payment-details">
          <h3>Payment details</h3>
          <div className="form-group">
            <label>Credit card number</label>
            <input type="text" maxLength="16" />
          </div>
          <div className="card-extra">
            <div className="form-group">
              <label>Validity</label>
              <input type="text" placeholder="MM/YY" maxLength="5" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="text" maxLength="3" />
            </div>
          </div>
          <div className="form-group">
            <label>Credit card holder's ID</label>
            <input type="text" maxLength="9" />
          </div>
        </div>

        <button className="place-order-btn">Place an order</button>
      </div>
    </div>
  );
};

export default CheckoutPage;