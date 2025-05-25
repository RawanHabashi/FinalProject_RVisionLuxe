import React from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  return (
    <div className="cart-page">
      <nav className="page-nav">
        <Link to="/">Home</Link>
        <Link to="/new-collection">New Collection</Link>
        <Link to="/contact">Contact Us</Link>
      </nav>
      
      {/* תוכן סל הקניות */}
      <div className="cart-content">
        {/* ... תוכן הסל ... */}
      </div>
    </div>
  );
};

export default CartPage;