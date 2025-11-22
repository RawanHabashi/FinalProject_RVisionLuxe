// Roaia Habashi and Rawan Habashi

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import EditUserModal from './EditUserModal';
import './AdminUserTable.css';

// טבלת ניהול משתמשים – תצוגה, עריכה ומחיקה
// הצגת: ID, Name, Email, Phone, Location, Role (בלי סיסמה!)
const AdminUserTable = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // משתמש לעריכה
  const [userToDelete, setUserToDelete] = useState(null); // משתמש למחיקה (מודל)
  const [loading, setLoading] = useState(true);           // מצב טעינה
  const [error, setError] = useState(null);               // הודעת שגיאה

  // שליפת משתמשים מהשרת
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // פתיחת מודל מחיקה
  const openDeleteModal = (user) => {
    setUserToDelete(user);
  };

  // סגירת מודל מחיקה
  const closeDeleteModal = () => {
    setUserToDelete(null);
  };

  // מחיקת משתמש (אחרי אישור במודל)
  const confirmDelete = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.user_id ?? userToDelete.id;

    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers(); // רענון רשימה אחרי מחיקה
      setUserToDelete(null);
      alert('✅ User deleted');
    } catch (err) {
      console.error('Delete failed', err);
      alert('❌ Delete failed');
    }
  };

  // עדכון משתמש (מהמודל)
  const handleUpdate = async (updatedUser) => {
    try {
      // משתמשים ב־user_id כ־PK
      await api.put(`/users/${updatedUser.user_id}`, updatedUser);
      setSelectedUser(null);
      await fetchUsers();
      alert('✅ User updated');
    } catch (err) {
      console.error('Update failed', err);
      alert('❌ Update failed');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // סגירת מודל המחיקה בלחיצה על הרקע
  const handleDeleteBackdrop = (e) => {
    if (e.target.classList.contains('delete-modal-backdrop')) {
      closeDeleteModal();
    }
  };

  return (
    <div className="admin-table-container">
      <div className="admin-users-header">
        <h2 className="title">User Management👤</h2>
        {typeof onBack === 'function' && (
          <button className="back-home-btn" onClick={onBack}>
            Back to Admin
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading users...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u, index) => {
                const id = u.user_id ?? u.id; // גיבוי אם השרת מחזיר id
                const role = (u.role || 'customer').toLowerCase();
                const roleLabel = role === 'admin' ? 'Admin' : 'Customer';
                const roleClass =
                  role === 'admin'
                    ? 'role-badge role-admin'
                    : 'role-badge role-customer';

                return (
                  <tr key={id} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td>{id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone_number}</td>
                    <td>{u.location}</td>
                    <td>
                      <span className={roleClass}>{roleLabel}</span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="edit-btn"
                        onClick={() => setSelectedUser(u)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => openDeleteModal(u)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* מודל עריכת משתמש */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleUpdate}
        />
      )}

      {/* מודל מחיקת משתמש */}
      {userToDelete && (
        <div
          className="delete-modal-backdrop"
          onClick={handleDeleteBackdrop}
        >
          <div className="delete-modal" role="dialog" aria-modal="true">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user?</p>
            <div className="delete-user-info">
              <strong>{userToDelete.name}</strong>
              <br />
              <span>{userToDelete.email}</span>
            </div>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="cancel-delete-btn"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;
