//Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import PasswordRecoveryPage from "./PasswordRecoveryPage";
import VerifyCode from "./VerifyCode";
import SetNewPassword from "./SetNewPassword";
import "./PasswordFlow.css";
/*
  PasswordFlow
  -------------
  קומפוננטה שמנהלת 3 שלבים רצופים בתהליך שחזור סיסמה:

  1. הזנת אימייל → שליחת קוד למייל
  2. הזנת קוד → אימות בשרת
  3. הזנת סיסמה חדשה → עדכון בשרת

  כל שלב מוצג לפי "stage" ב-state
*/
const PasswordFlow = ({ onBackToLogin }) => {
    // stage – השלב הנוכחי בתהליך: email / code / newPassword
  const [stage, setStage] = useState("email");
    // נשמור את האימייל והקוד כדי להעביר לשלב הבא
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  /*
    כשהמשתמשת מסיימת להזין את המייל והמערכת שולחת קוד
    המעבר הוא לשלב הבא – הזנת קוד
  */
  const handleEmailSent = (emailValue) => {
    setEmail(emailValue);
    setStage("code");
  };
 /*
    לאחר שהקוד נכון והשרת מאשר
    אנחנו עוברים לשלב הזנת סיסמה חדשה
  */
  const handleCodeVerified = (codeValue) => {
    setCode(codeValue);
    setStage("newPassword");
  };

  // ⬅️ אחרי שינוי סיסמה הולכים לדף login
  const handlePasswordChanged = () => {
    setEmail("");
    setCode("");
    setStage("email");

    if (onBackToLogin) {
      onBackToLogin();   // ⬅️ זה יחזור ל-login
    }
  };

  return (
    <div className="password-flow-wrapper">
      {stage === "email" && (
        <PasswordRecoveryPage onEmailSent={handleEmailSent} />
      )}

      {stage === "code" && (
        <VerifyCode
          email={email}
          onCodeVerified={handleCodeVerified}
        />
      )}

      {stage === "newPassword" && (
        <SetNewPassword
          email={email}
          code={code}
          onDone={handlePasswordChanged}   
        />
      )}
    </div>
  );
};

export default PasswordFlow;
