import React, { useState } from "react";
import api from "../api/axios"; // ✅ נתיב מתוקן
import "./SetNewPassword.css";

const SetNewPassword = ({ onReset, email, code }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

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

      if (res.data.message) {
        setMessage("✅ Password changed successfully.");
        setTimeout(() => onReset("login"), 2000);
      } else {
        setError("❌ Failed to change password.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Server error.");
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
