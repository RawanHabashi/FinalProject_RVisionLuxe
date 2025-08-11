import React, { useState } from "react";
import PasswordRecoveryPage from "./PasswordRecoveryPage";
import VerifyCode from "./VerifyCode";
import SetNewPassword from "./SetNewPassword";
import "./PasswordFlow.css";

const PasswordFlow = () => {
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

  const handleResetComplete = () => {
    setEmail("");
    setCode("");
    setStage("email");
  };

  return (
    <div className="password-flow-wrapper">
      {stage === "email" && (
        <PasswordRecoveryPage onEmailSent={handleEmailSent} />
      )}

      {stage === "code" && (
        <VerifyCode email={email} onCodeVerified={handleCodeVerified} />
      )}

      {stage === "newPassword" && (
        <SetNewPassword email={email} code={code} onReset={handleResetComplete} />
      )}
    </div>
  );
};

export default PasswordFlow;
