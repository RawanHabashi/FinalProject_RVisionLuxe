import React from 'react';
import './HomePage.css';

const HomePage = ({
  onCart,
  onWishlist,
  onSelectCategory,
  onViewProducts,
  onLoginClick,
  cartCount,
  wishlistCount,
  username,
   onLogout,
   onSearch, onContact,onMyOrders
}) => {
  return (
    <div className="home-page">
      <header>
        <div className="logo-container">
          <img
            src="/images/Rvision-Luxe-Logo.jpg"
            alt="Rvision Luxe Logo"
            className="logo"
          />
          <h1 className="site-title">Rvision Luxe</h1>
        </div>

        <nav>
          <div className="nav-buttons">
            {username ? (
              <button onClick={onLogout}>Sign out</button>
            ) : (
              <button onClick={onLoginClick}>Sign in</button>
            )}
        <button className="contact-btn" onClick={onContact}>Contact us</button>
        <button onClick={onMyOrders}>📦 My Orders</button>
          </div>

          <div className="icon-container">
            <div className="welcome-message">
        {username ? `Welcome ${username} ♡` : 'Welcome ♡'}
        </div>
            <button onClick={onCart} className="icon-link">
              <img src="/images/cart-icon.png" alt="Cart" />
              <span className="badge">{cartCount}</span>
            </button>

            <button onClick={onWishlist} className="icon-link">
              <img src="/images/heart-icon.png" alt="Wishlist" />
              <span className="badge">{wishlistCount}</span>
            </button>

            <button className="icon-link" onClick={onSearch}>
              <img src="/images/search-icon.png" alt="Search" />
            </button>
          </div>
        </nav>
      </header>

      <div className="hero-section">
        <img
          src="/images/homepage-hero.jpg"
          alt="Hero Banner"
          className="hero-image"
        />
      </div>
      <div className="category-grid">
  <div className="category-card" onClick={() => onSelectCategory("wedding")}>
    <img src="http://localhost:5000/images/weddingBagCategory.jpg" alt="Wedding Bag" />
    <p>Wedding Bag</p>
  </div>
  <div className="category-card" onClick={() => onSelectCategory("school")}>
    <img src="http://localhost:5000/images/schoolBagCategory.jpg" alt="School Bag" />
    <p>School Bag</p>
  </div>
  <div className="category-card" onClick={() => onSelectCategory("daily")}>
    <img src="http://localhost:5000/images/dailyBagCategory.jpg" alt="Daily Bag" />
    <p>Daily Bag</p>
  </div>
  <div className="category-card" onClick={() => onSelectCategory("travel")}>
    <img src="http://localhost:5000/images/travelBagCategory.jpg" alt="Travel Bag" />
    <p>Travel Bag</p>
  </div>
  <div className="category-card" onClick={() => onSelectCategory("brand")}>
    <img src="http://localhost:5000/images/brandBagCategory.jpg" alt="Brand Bag" />
    <p>Brand Bag</p>
  </div>
  <div className="category-card" onClick={() => onSelectCategory("wallet")}>
    <img src="http://localhost:5000/images/WalletCategory.jpg" alt="Wallet" />
    <p>Wallet</p>
  </div>
</div>
    </div>
  );
};

export default HomePage;
