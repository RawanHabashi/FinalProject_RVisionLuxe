import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminStyles.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([
    {
      id: '1',
      name: 'Travel Bag',
      image: '/images/travel-bag.png'
    },
    {
      id: '2',
      name: 'Daily Bag',
      image: '/images/daily-bag.png'
    },
    {
      id: '3',
      name: 'School Bag',
      image: '/images/school-bag.png'
    },
    {
      id: '4',
      name: 'Wedding Bag',
      image: '/images/wedding-bag.png'
    }
  ]);

  const handleDelete = (categoryId) => {
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Rvision Luxe - Admin</h1>
        <nav>
          <Link to="/admin/dashboard">Back to Dashboard</Link>
          <Link to="/signin" className="logout">Log Out</Link>
        </nav>
      </header>

      <main className="admin-main">
        <h2>Category Management</h2>
        
        <button className="add-category-btn">Add a new category</button>

        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.name} />
              <h3>{category.name}</h3>
              <div className="category-actions">
                <button className="edit-btn">Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(category.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManageCategories;