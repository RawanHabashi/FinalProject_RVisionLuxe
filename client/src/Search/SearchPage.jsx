//Roaia Habashi and Rawan Habashi

import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import './SearchPage.css';
/*
  דף שמאפשר ללקוחה לחפש תיקים לפי:
  • סוג (Wedding / School / Daily / Travel / Brand / Wallet)
  • צבע (Black, White, Pink...)

  הנתונים נמשכים מהשרת /products
  ואז מתבצע סינון בצד הלקוח לפי שם המוצר
*/
function SearchPage({ onBack }) {
    // state לשמירת המוצרים לאחר סינון
  const [products, setProducts] = useState([]);
    // סינונים - סוג וצבע
  const [typeFilter, setTypeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  /*
    fetchProducts
    -------------
    פעולה שמביאה את כל המוצרים מהשרת
    ואז מבצעת סינון לפי שם המוצר
     מופעל- שומרים רק את המוצרים המתאימיםfiltering אם 
  */
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      let filtered = response.data;  // מתחילים מרשימת המוצרים המלאה
      if (typeFilter) {//סינון לפי סוג
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(typeFilter.toLowerCase())
        );
      }
      if (colorFilter) {//סינון לפי צבע
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(colorFilter.toLowerCase())
        );
      }
      setProducts(filtered);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [typeFilter, colorFilter]);
  return (
    <div className="search-page">
      <h2>Search Women's Bags</h2>
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <div className="filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="wedding">Wedding Bag</option>
          <option value="school">School Bag</option>
          <option value="daily">Daily Bag</option>
          <option value="travel">Travel Bag</option>
          <option value="brand">Brand Bag</option>
          <option value="wallet">Wallet</option>
        </select>
        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
          <option value="">All Colors</option>
          <option value="black">Black</option>
          <option value="white">White</option>
          <option value="pink">Pink</option>
          <option value="red">Red</option>
          <option value="beige">Beige</option>
          <option value="brown">Brown</option>
          <option value="colorful">Colorful</option>
           <option value="Gray">Gray</option>
          <option value="Blue">Blue</option>
          <option value="Green">Green</option>
        </select>
      </div>
     <div className="products-list">
  {products.length > 0 ? (
    products.map((product) => (
      <div key={product.product_id} className="product-card">
        <img
          src={`http://localhost:5000/images/${product.image}`}
          alt={product.name}
        />
        <h3>{product.name}</h3>
        <p>{product.price}₪</p>
      </div>
    ))
  ) : (
    <p className="no-results"> 🔍No products found matching your search !</p>
  )}
</div>
</div>
  );}
export default SearchPage;
