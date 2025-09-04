import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import EditUserModal from './EditUserModal';
import './AdminUserTable.css';
// טבלת ניהול משתמשים
   // תצוגה, עריכה ומחיקה
   // אחידות מזהה על user_id (עם גיבוי ל-id)
   // כפתור חזרה לדשבורד אדמין דרך onBack (אם סופק)
const AdminUserTable = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // משתמש לעריכה
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

  // מחיקת משתמש
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers(); // רענון רשימה אחרי מחיקה
      alert('✅ User deleted');
    } catch (err) {
      console.error('Delete failed', err);
      alert('❌ Delete failed');
    }
  };

  // עדכון משתמש (מהמודל)
  const handleUpdate = async (updatedUser) => {
    try {
      // חשוב: משתמשים ב־user_id כ־PK
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

  return (
    <div className="admin-table-container">
      <div className="admin-users-header">
        <h2 className="title"> User Management👤</h2>
        {typeof onBack === 'function' && (
          <button className="back-home-btn" onClick={onBack}> Back to Admin</button>
        )}
      </div>

      {loading && <div className="loading">Loading users...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
              </tr>
            ) : (
              users.map((u, index) => {
                const id = u.user_id ?? u.id; // גיבוי אם השרת מחזיר id
                return (
                  <tr key={id} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td>{id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{'********'}</td>
                    <td className="actions-cell">
                      <button className="edit-btn" onClick={() => setSelectedUser(u)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(id)}>Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default AdminUserTable;
