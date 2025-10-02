const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rvisionluxe@gmail.com',
      pass: 'ofewfgxgrvsawtfp'
    }
  });
  const mailOptions = {
    from: email,
    to: 'rvisionluxe@gmail.com',
    subject: `New Contact Message from ${name}`,
    text: message
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ success: false, error });
  }
});
module.exports = router;
