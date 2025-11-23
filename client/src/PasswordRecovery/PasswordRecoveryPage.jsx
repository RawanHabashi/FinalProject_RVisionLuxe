//Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import api from "../api/axios";
import "./PasswordRecoveryPage.css";
const PasswordRecoveryPage = ({ onEmailSent }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("/password-recovery", { email }); 
      if (res.data.message) {
        setMessage("✅ Code sent to your email.");
        setTimeout(() => {
          onEmailSent(email); // עובר לשלב הבא בתהליך האימות
        }, 1000);
      } else {
        setError("❌ Unexpected server response.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Failed to send email.");
    }
  };
  return (
    <div className="recovery-container">
      <div className="recovery-box">
        <h2>Password Recovery</h2>
        <p className="instruction-text">
          Enter your email address and we will send you instructions to reset your password.
        </p>
        {message && !error && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Recovery Email</button>
        </form>
      </div>
    </div>
  );
};
export default PasswordRecoveryPage;
