//Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import api from "../api/axios";
import "./PasswordRecoveryPage.css";
/*  
  שלב 1 בתהליך שחזור הסיסמה
  המשתמשת מזינה מייל- השרת שולח קוד אימות למייל
  אם הצליח — עוברים לשלב הבא
*/
const PasswordRecoveryPage = ({ onEmailSent }) => {
  const [email, setEmail] = useState("");// המייל שהמשתמשת מקלידה
  const [message, setMessage] = useState("");// הודעת הצלחה
  const [error, setError] = useState("");// הודעת שגיאה
   /*
    handleSubmit – "Send Recovery Email" כשמשתמשת לוחצת על 
      הפעולה שולחת בקשת פוסט לשרת עם מייל
    אם השרת מחזיר הודעה – עוברים לשלב הבא בתהליך
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
            // שולחים את המייל לשרת כדי שישלח קוד אימות
      const res = await api.post("/password-recovery", { email }); 
      if (res.data.message) {
                // אם השרת החזיר הצלחה
        setMessage("✅ Code sent to your email.");
        setTimeout(() => {
          onEmailSent(email); // עובר לשלב הבא בתהליך האימות
        }, 1000);
      } else {
        setError("❌ Unexpected server response.");
      }
    } catch (err) {
      console.error(err);
      //שגיאה 
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
