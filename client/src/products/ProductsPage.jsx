import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './ProductsPage.css';

const categoryMap = {
  wedding: 1,
  school: 2,
  daily: 3,
  travel: 4,
  brand: 5,
  wallet: 6,
};

const ProductsPage = ({ onAddToCart, onBack, category, onWishlistChange, currentUserId }) => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // מפתח מועדפים לפי משתמש (guest אם אין התחברות)
  const userId = currentUserId || JSON.parse(localStorage.getItem('user') || '{}')?.user_id || 'guest';
  const WISHLIST_KEY = `wishlist:${userId}`;

  // טוענים מועדפים לפי המשתמש הנוכחי
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
      const clean = Array.isArray(stored) ? stored.map(Number) : [];
      setWishlist(clean);
      onWishlistChange?.(clean.length);
    } catch {
      setWishlist([]);
      onWishlistChange?.(0);
    }
    // בכל פעם שהמשתמש מתחלף נטען מחדש
  }, [WISHLIST_KEY]); // תלוי במפתח שנגזר מה-userId

  // טוענים מוצרים לפי קטגוריה
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const categoryId = categoryMap[category];
        const filtered = categoryId
          ? res.data.filter(p => p.category_id === categoryId)
          : res.data;
        setProducts(filtered);
      })
      .catch(err => console.error('❌ Failed to fetch products:', err));
  }, [category]);

  const getCategoryTitle = (cat) => {
    switch (cat) {
      case 'wedding': return 'Wedding Bags';
      case 'school': return 'School Bags';
      case 'daily': return 'Daily Bags';
      case 'travel': return 'Travel Bags';
      case 'brand': return 'Brand Bags';
      case 'wallet': return 'Wallets';
      default: return 'All Products';
    }
  };

  const toggleWishlist = (productId) => {
    const id = Number(productId);
    const updated = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];

    setWishlist(updated);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    onWishlistChange?.(updated.length);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <button className="back-button" onClick={onBack}>← Back to Home</button>
      </div>

      <h2 className="products-title">{getCategoryTitle(category)}</h2>

      {products.length === 0 ? (
        <p className="empty-message">No products found in this category.</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div className="product-card" key={product.product_id}>
              <img
                src={`http://localhost:5000/images/${product.image}`}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p><strong>₪{Number(product.price).toFixed(2)}</strong></p>
              <div className="product-actions">
                <button
                  onClick={() => toggleWishlist(product.product_id)}
                  aria-label={wishlist.includes(Number(product.product_id)) ? 'Remove from wishlist' : 'Add to wishlist'}
                  title={wishlist.includes(Number(product.product_id)) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlist.includes(Number(product.product_id)) ? '❤️' : '♡'}
                </button>

                <button onClick={() => onAddToCart(product)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
