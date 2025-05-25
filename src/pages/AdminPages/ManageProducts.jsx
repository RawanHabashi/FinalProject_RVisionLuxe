import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminStyles.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Wedding Bag',
      description: 'Elegant small bag for weddings',
      price: '250₪',
      image: '/images/wedding-bag.png'
    },
    {
      id: '2',
      name: 'School Bag',
      description: 'Blue backpack for daily use',
      price: '180₪',
      image: '/images/school-bag.png'
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    // Add new product logic here
  };

  const handleDelete = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
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
        <h2>Manage Products</h2>
        
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className="product-thumb" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="add-product-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input 
                type="text" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input 
                type="file" 
                onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})}
              />
            </div>
            <button type="submit" className="add-btn">Add Product</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ManageProducts;