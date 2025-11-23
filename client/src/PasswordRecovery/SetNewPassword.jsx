// Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import api from "../api/axios";
import "./SetNewPassword.css";

const SetNewPassword = ({ onDone, email, code }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // בדיקה בסיסית: סיסמה ואישור סיסמה
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      const res = await api.post("/reset-password", {
        email,
        code,
        newPassword: password,
      });

      if (res.data && res.data.message) {
        // איפוס מונה ניסיונות התחברות נכשלת
        localStorage.removeItem("login_fail_count");

        setMessage("✅ Password changed successfully.");

        // אחרי 2 שניות מודיעים להורה שהסתיים – הוא יחזיר ל-login
        setTimeout(() => {
          if (typeof onDone === "function") {
            onDone(); // ב-PasswordFlow זה יקרא ל-onBackToLogin
          }
        }, 2000);
      } else {
        setError("❌ Failed to change password.");
      }
    } catch (err) {
      console.error("❌ Reset password error:", err);
      setError(err?.response?.data?.message || "❌ Server error.");
    }
  };

  return (
    <div className="set-password-container">
      <div className="set-password-box">
        <h2>Set New Password</h2>
        <p>Please enter your new password below.</p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPassword;
