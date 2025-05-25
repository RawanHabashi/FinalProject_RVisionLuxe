import React, { useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  const [users, setUsers] = useState([
    { id: '001', name: 'Rawan Habashi', email: 'rawan78@gmail.com', role: 'Customer' },
    { id: '002', name: 'Roaia Habashi', email: 'roaia1110@gmail.com', role: 'Customer' }
  ]);

  const [selectedUser, setSelectedUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Customer'
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleDelete = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Rvision Luxe - Admin</h1>
        <nav>
          <a href="#reports">Reports</a>
          <a href="#products">Products</a>
          <a href="#users">Users</a>
          <a href="#categories">Categories</a>
          <a href="#" className="logout">Log Out</a>
        </nav>
      </header>

      <main className="admin-main">
        <h2>Manage Users</h2>
        
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="update-form">
          <h3>Update User Info</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>User ID</label>
              <input 
                type="text" 
                value={selectedUser.id}
                onChange={e => setSelectedUser({...selectedUser, id: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={selectedUser.name}
                onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={selectedUser.email}
                onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input 
                type="text" 
                value={selectedUser.role}
                onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
              />
            </div>
            <button type="submit" className="update-btn">Update User</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;