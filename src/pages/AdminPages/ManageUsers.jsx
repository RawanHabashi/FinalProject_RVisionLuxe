import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
  };

  const handleSave = () => {
    const updatedUsers = users.map(user => {
      if (user.email === editingUser.email) {
        return { ...user, ...editForm };
      }
      return user;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleDelete = (userToDelete) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.email !== userToDelete.email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="manage-users">
      <div className="header">
        <h1>Manage Users</h1>
        <Link to="/admin/dashboard" className="back-link">Back to Dashboard</Link>
      </div>

      <table className="users-table">
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
          {users.map((user, index) => (
            <tr key={user.email}>
              <td>#{(index + 1).toString().padStart(3, '0')}</td>
              <td>
                {editingUser?.email === user.email ? (
                  <div className="edit-fields">
                    <input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    />
                    <input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    />
                  </div>
                ) : (
                  `${user.firstName} ${user.lastName}`
                )}
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {editingUser?.email === user.email ? (
                  <button onClick={handleSave} className="save-btn">Save</button>
                ) : (
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(user)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(user)} className="delete-btn">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;