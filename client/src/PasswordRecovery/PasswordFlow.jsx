//Roaia Habashi and Rawan Habashi

import React, { useState } from "react";
import PasswordRecoveryPage from "./PasswordRecoveryPage";
import VerifyCode from "./VerifyCode";
import SetNewPassword from "./SetNewPassword";
import "./PasswordFlow.css";

const PasswordFlow = ({ onBackToLogin }) => {
  const [stage, setStage] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleEmailSent = (emailValue) => {
    setEmail(emailValue);
    setStage("code");
  };

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
