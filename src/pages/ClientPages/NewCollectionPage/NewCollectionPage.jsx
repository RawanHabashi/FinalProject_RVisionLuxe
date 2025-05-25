import React from 'react';
import './NewCollectionPage.css';

const NewCollectionPage = () => {
  const products = [
    {
      id: 1,
      name: 'black Bag',
      price: '90₪',
      image: '/images/black-bag.png'
    },
    {
      id: 2,
      name: 'travel bag sets',
      price: '500₪',
      image: '/images/travel-set.png'
    },
    {
      id: 3,
      name: 'Gucci bag',
      price: '210₪',
      image: '/images/gucci-bag.png'
    },
    {
      id: 4,
      name: 'blue wallet',
      price: '120₪',
      image: '/images/blue-wallet.png'
    }
  ];

  const handleAddToCart = (productId) => {
    // Add to cart logic here
  };

  return (
    <div className="new-collection">
      <h1>New Collection</h1>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <button 
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(product.id)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCollectionPage;