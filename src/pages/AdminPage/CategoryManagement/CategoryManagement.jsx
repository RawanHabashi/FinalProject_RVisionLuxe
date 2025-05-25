import React, { useState } from 'react';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Travel Bag', image: '/images/travel-bag.png' },
    { id: 2, name: 'Daily Bag', image: '/images/daily-bag.png' },
    { id: 3, name: 'School Bag', image: '/images/school-bag.png' },
    { id: 4, name: 'Wedding Bag', image: '/images/wedding-bag.png' }
  ]);

  const handleDelete = (categoryId) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const handleUpdate = (categoryId) => {
    // Add update logic here
  };

  return (
    <div className="category-management">
      <header className="admin-header">
        <h1>Rvision Luxe - Admin</h1>
        <nav>
          <a href="#reports">Reports</a>
          <a href="#products">Products</a>
          <a href="#users">Users</a>
          <a href="#" className="logout">Logout</a>
        </nav>
      </header>

      <main className="category-main">
        <h2>Category management</h2>
        
        <div className="add-category">
          <button className="add-btn">Add a new category +</button>
        </div>

        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
              <div className="category-actions">
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(category.id)}
                >
                  delete
                </button>
                <button 
                  className="update-btn"
                  onClick={() => handleUpdate(category.id)}
                >
                  update
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryManagement;