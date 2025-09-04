import React, { useState, useEffect } from 'react';
import './EditUserModal.css';
// טופס עדכון משתמש
  // לא טוען סיסמה קיימת (מונע דריסה בלי כוונה)
   // אם הסיסמה נשארת ריקה, לא נשלח אותה בעדכון
   //סגירה בלחיצה על הרקע/לחיצה על Esc
const EditUserModal = ({ user, onClose, onSave }) => {
  // מצב מקומי למשתמש/ת המעודכן/ת
  const [updatedUser, setUpdatedUser] = useState({
    user_id: user?.user_id ?? user?.id ?? null,
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '' // השארת ריק פירושה לא משנים סיסמה
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

    // ודאו שיש מזהה
    if (!updatedUser.user_id) {
      alert('❌ Missing user_id');
      return;
    }

    // לא שולחים password אם נשאר ריק
    const payload = { ...updatedUser };
    if (!payload.password) delete payload.password;

    onSave(payload);
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
          <label>Full Name:</label>
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

          <label>Password (optional):</label>
          <input
            name="password"
            type="password"
            value={updatedUser.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />

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
