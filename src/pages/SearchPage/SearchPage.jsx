import React from 'react';
import './SearchPage.css';

const SearchPage = () => {
  const products = [
    { name: 'School Bag', price: '80₪', image: '/images/school-bag.png' },
    { name: 'Daily Bag', price: '100₪', image: '/images/daily-bag.png' },
    { name: 'Wedding Bag', price: '120₪', image: '/images/wedding-bag.png' },
    { name: 'Wallet', price: '50₪', image: '/images/wallet.png' },
  ];

  return (
    <div className="search-page">
      <div className="search-section">
        <h2>Search Women's Bags</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by type, color, or style..."
            className="search-input"
          />
        </div>
        <div className="filters">
          <select className="filter-select">
            <option value="">Type</option>
            <option value="school">School Bag</option>
            <option value="daily">Daily Bag</option>
            <option value="wedding">Wedding Bag</option>
            <option value="wallet">Wallet</option>
          </select>
          <select className="filter-select">
            <option value="">All colors</option>
            <option value="black">Black</option>
            <option value="orange">Orange</option>
            <option value="beige">Beige</option>
            <option value="purple">Purple</option>
          </select>
        </div>
      </div>
      <div className="products-grid">
        {products.map((product, index) => (
          <div key={index} className="product-item">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;