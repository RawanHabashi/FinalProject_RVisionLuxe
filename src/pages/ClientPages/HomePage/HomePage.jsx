import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <header>
        <h1>Rvision Luxe</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/new-collection">New Collection</Link>
          <Link to="/contact">Contact us</Link>
          <Link to="/search" className="search-btn">
            <img src="/images/search-icon.png" alt="Search" className="search-icon" />
          </Link>
          <Link to="/signin" className="sign-in-btn">Sign in</Link>
        </nav>
      </header>

      <div className="title-section">
        <h2>Women's Bags</h2>
      </div>

      <div className="products-container">
        <div className="first-row">
          <div className="product">
            <img src="/images/wedding-bag.png" alt="Wedding Bag" />
            <span>WEDDING BAG</span>
          </div>
          <div className="product">
            <img src="/images/school-bag.png" alt="School Bag" />
            <span>SCHOOL BAG</span>
          </div>
          <div className="product">
            <img src="/images/daily-bag.png" alt="Daily Bag" />
            <span>DAILY BAG</span>
          </div>
          <div className="product">
            <img src="/images/travel-bag.png" alt="Travel Bag" />
            <span>TRAVEL BAG</span>
          </div>
        </div>
        <div className="second-row">
          <div className="product">
            <img src="/images/brand-bag.png" alt="Brand Bag" />
            <span>Brand Bag</span>
          </div>
          <div className="product">
            <img src="/images/wallet.png" alt="Wallet" />
            <span>Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;