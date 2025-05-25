import React from 'react';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">
          Have a question or want to work with us? We'd love to hear from you.
        </p>
        
        <form className="contact-form">
          <div className="form-group">
            <label>Your Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea 
              placeholder="Write your message here..."
              rows="6"
            ></textarea>
          </div>

          <button type="submit" className="send-button">
            Send Message
          </button>
        </form>

        <div className="contact-info">
          <p>Or reach us at:</p>
          <p>Email: rvision.luxe@gmail.com</p>
          <p>Phone: +972 50-1234567</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;