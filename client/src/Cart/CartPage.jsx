import React from 'react';
import './CartPage.css';

const CartPage = ({ items = [], onBack, onRemove, onCheckout }) => {
  const getQuantity = (item) => item.quantity || 1;
  const isLoggedIn = !!(
    localStorage.getItem('user_id') ||
    JSON.parse(localStorage.getItem('user') || '{}').user_id
  );

  // לוודא שמחיר הוא מספר
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * getQuantity(item),
    0
  );

  return (
    <div className="cart-page">
      <button className="back-button" onClick={onBack}>← Back to Home</button>
      <h2 className="cart-title">Your Shopping Cart</h2>

      {/* באנר לאורחים */}
      {!isLoggedIn && items.length > 0 && (
        <div className="cart-info-banner">
          You’re shopping as a guest. Please sign in to place your order.
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty-message">Your cart is currently empty.</p>
      ) : (
        <div className="cart-items">
          {items.map((item, index) => (
            <div className="cart-item" key={index}>
              <img
                src={`http://localhost:5000/images/${item.image}`}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>₪{item.price} x {getQuantity(item)}</p>
              </div>
              <button className="remove-btn" onClick={() => onRemove(item.name)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="cart-summary">
          <h3>Total: ₪{total.toFixed(2)}</h3>
          <button className="checkout-btn" onClick={onCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
