//Roaia Habashi and Rawan Habashi

import React from 'react';
import './CategoryPage.css';

const CategoryPage = ({ type = "", products = [], onBack, onAddToWishlist }) => {
  return (
    <div className="category-page">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <h2 className="category-title">{type.charAt(0).toUpperCase() + type.slice(1)} Bags</h2>
      <div className="category-products">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div className="category-product" key={index}>
              <img
                src={`http://localhost:5000/images/${product.image}`}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <div className="product-actions">
                <button
                  className="wishlist-btn"
                  title="Add to Wishlist"
                  onClick={() => onAddToWishlist(product)}
                >
                  ♡
                </button>
                <button className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-products">No products available in this category.</p>
        )}
      </div>
    </div>
  );
};
export default CategoryPage;
