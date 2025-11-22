// Roaia Habashi and Rawan Habashi

import React, { useState, useEffect } from 'react';
import './EditUserModal.css';

// טופס עדכון משתמש
// בלי עריכת סיסמה, כולל הצגת ID, Name, Email, Phone, Location, Role
// סגירה בלחיצה על הרקע / לחיצה על Esc
const EditUserModal = ({ user, onClose, onSave }) => {
  const [updatedUser, setUpdatedUser] = useState({
    user_id: user?.user_id ?? user?.id ?? null,
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone_number: user?.phone_number ?? '',
    location: user?.location ?? '',
    role: user?.role ?? 'customer',
  });

  // סגירה בלחיצה על Esc
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // שינוי שדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  // שליחה
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!updatedUser.user_id) {
      alert('❌ Missing user_id');
      return;
    }

    // שולחים רק את השדות הרלוונטיים (בלי סיסמה)
    onSave(updatedUser);
  };

  // סגירה בלחיצה על הרקע
  const handleBackdrop = (e) => {
    if (e.target.classList.contains('modal-backdrop')) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <h3 id="edit-user-title">Edit User</h3>

        <form onSubmit={handleSubmit}>
          {/* ID – לתצוגה בלבד */}
          <label>User ID:</label>
          <input
            value={updatedUser.user_id ?? ''}
            disabled
            className="readonly-input"
          />

          <label>Name:</label>
          <input
            name="name"
            value={updatedUser.name}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            name="email"
            type="email"
            value={updatedUser.email}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            name="phone_number"
            value={updatedUser.phone_number}
            onChange={handleChange}
          />

          <label>Location:</label>
          <input
            name="location"
            value={updatedUser.location}
            onChange={handleChange}
          />

          <label>Role:</label>
          <select
            name="role"
            value={updatedUser.role}
            onChange={handleChange}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>

          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
