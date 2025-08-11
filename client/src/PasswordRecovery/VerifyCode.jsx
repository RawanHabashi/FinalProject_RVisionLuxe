import React, { useState } from "react";
import api from "../api/axios";
import "./VerifyCode.css";

const VerifyCode = ({ onCodeVerified, email }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!code || code.length !== 6) {
      setError("❌ Invalid code. Must be 6 digits.");
      return;
    }

    try {
      const res = await api.post("/verify-code", { email, code });
      if (res.data.message) {
        setMessage("✅ Code verified successfully.");
        setTimeout(() => {
          onCodeVerified(code);
        }, 1000);
      } else {
        setError("❌ Code verification failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Server error.");
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify Code</h2>
        <p className="instruction-text">Enter the 6-digit code sent to your email.</p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit">Verify</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
