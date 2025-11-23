//Roaia Habashi and Rawan Habashi

import React, { useState } from 'react';
import api from '../api/axios';          // ✅ להשתמש ב־axios שהגדרת
import './SignUpPage.css';

const SignUpPage = ({ onBack }) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    phone_number: '',
    role: 'customer',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔹 בדיקת סיסמה ואישור סיסמה
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 🔹 בדיקת שם – רק אותיות ורווחים (תומך בשפות שונות)
    const nameTrimmed = formData.name.trim();
    const nameRegex = /^[\p{L}\s]+$/u; // כל אותיות יוניקוד + רווחים
    if (!nameRegex.test(nameTrimmed)) {
      setError('Name must contain letters and spaces only');
      return;
    }

    // 🔹 בדיקת מספר טלפון – בדיוק 10 ספרות
    const digitsOnly = formData.phone_number.replace(/\D/g, ''); // מוריד רווחים, מקפים וכו'
    if (digitsOnly.length !== 10) {
      setError('Phone number must contain exactly 10 digits');
      return;
    }

    try {
      // ✅ שליחה לנתיב הנכון בשרת: /api/users/register
      const res = await api.post('/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location,
        phone_number: digitsOnly,   // נשמור במסד מספר נקי
        role: formData.role,
      });

      // אם הגענו לפה בלי שגיאה – ההרשמה הצליחה
      alert('✅ Registration successful!');
      if (onBack) onBack(); // חזרה למסך ההתחברות
    } catch (err) {
      console.error('Register error:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Registration failed';
      setError(msg);
    }
  };

  return (
    <div className="signup-page">
      <div className="site-title">
        <h1>Rvision Luxe</h1>
      </div>

      <div className="signup-form">
        <h2>Sign Up</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData({ ...formData, phone_number: e.target.value })
            }
            required
          />

          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            required
          >
            <option value="customer">Customer</option>
          </select>

          <button type="submit" className="create-account-btn">
            Create Account
          </button>
        </form>

        <div className="signin-link">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onBack}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
