const nodemailer = require("nodemailer");
require("dotenv").config();
//לשליחת מייל בשלבי שחזור סיסמה 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Ready to send emails!");
  }
});
const sendRecoveryEmail = async (to, code) => {
  const mailOptions = {
    from: `Rvision Luxe <${process.env.EMAIL_USER}>`,
    to,
    subject: "🔐 Password Recovery Code",
    text: `Your verification code is: ${code}\nIt is valid for 15 minutes.`
  };
  await transporter.sendMail(mailOptions);
};
module.exports = { sendRecoveryEmail };
