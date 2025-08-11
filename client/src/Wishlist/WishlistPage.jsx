import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './WishlistPage.css';

export default function WishlistPage({ onBack, onAddToCart, currentUserId, onWishlistChange }) {
  const [products, setProducts] = useState([]);
  const [wishIds, setWishIds] = useState([]);

  // מזהה משתמש נוכחי + מפתח בהתאם
  const userId =
    currentUserId ||
    JSON.parse(localStorage.getItem('user') || '{}')?.user_id ||
    'guest';
  const WISHLIST_KEY = `wishlist:${userId}`;

  // טוען מזהי מועדפים לפי המשתמש
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
      const ids = Array.isArray(stored) ? stored.map(Number) : [];
      setWishIds(ids);
      onWishlistChange?.(ids.length);
    } catch {
      setWishIds([]);
      onWishlistChange?.(0);
    }
  }, [WISHLIST_KEY, onWishlistChange]);

  // מביא את המוצרים ומסנן לפי ה-IDs
  useEffect(() => {
    if (!wishIds.length) {
      setProducts([]);
      return;
    }
    api.get('/products')
      .then(res => {
        const idSet = new Set(wishIds.map(Number));
        const filtered = res.data.filter(p => idSet.has(Number(p.product_id)));
        setProducts(filtered);
      })
      .catch(err => console.error('❌ Failed to fetch products:', err));
  }, [wishIds]);

  const removeFromWishlist = (productId) => {
    const id = Number(productId);
    const nextIds = wishIds.filter(x => x !== id);
    setWishIds(nextIds);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextIds));
    onWishlistChange?.(nextIds.length);
    setProducts(prev => prev.filter(p => Number(p.product_id) !== id));
  };

  return (
    <div className="wishlist-page">
      <button className="back-button" onClick={onBack}>← Back to Home</button>
      <h2 className="wishlist-title">Your Wishlist</h2>

      {products.length === 0 ? (
        <p className="empty-message">You have no items in your wishlist.</p>
      ) : (
        <div className="wishlist-items">
          {products.map((item) => (
            <div className="wishlist-item" key={item.product_id}>
              <img
                src={`http://localhost:5000/images/${item.image}`}
                alt={item.name}
                className="wishlist-item-image"
              />
              <div className="wishlist-item-details">
                <h3>{item.name}</h3>
                <p>₪{Number(item.price).toFixed(2)}</p>
              </div>
              <div className="wishlist-actions">
                <button className="add-to-cart-btn" onClick={() => onAddToCart?.(item)}>
                  Add to Cart
                </button>
                <button className="remove-btn" onClick={() => removeFromWishlist(item.product_id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
