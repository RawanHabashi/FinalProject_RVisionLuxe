import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Travel Bag', price: 250, image: '/images/travel-bag.png' },
    { id: 2, name: 'Wallet', price: 50, image: '/images/wallet.png' },
    { id: 3, name: 'Daily', price: 120, image: '/images/daily-bag.png' }
  ]);

  const handleRemove = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-page">
      <h1>My Shopping Cart</h1>

      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="price">{item.price}₪</p>
              <button 
                className="remove-btn"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="total">
          <span>Total: {total}₪</span>
        </div>
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;