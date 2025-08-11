import React, { useState } from 'react';
import './ContactUsPage.css';
import axios from 'axios';

function ContactUs({ onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      alert("✅ Message sent successfully!");
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      alert("❌ Failed to send message.");
      console.error(err);
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* כותרת חיצונית */}
      <div className="top-header">
        <h1 className="site-name">Rvision Luxe</h1>
        <button className="back-home-btn" onClick={onBack}>← Back to Home</button>
      </div>

      {/* חלון הלבן */}
      <div className="contact-container">
        <h2>Contact Us</h2>
        <p>Have a question or want to work with us? We'd love to hear from you.</p>

        <form onSubmit={handleSubmit}>
          <label>Your Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />

          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} required />

          <button type="submit">Send Message</button>
        </form>

        <div className="contact-footer">
          <p>Or reach us at:</p>
          <p>Email: rvisionluxe@gmail.com</p>
          <p>Phone: +972 50-3587600</p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
