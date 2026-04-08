import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-top">
          <h2 className="heading-lg footer-heading">Join Our Team Of<br/>Dedicated Healthcare<br/>Professionals</h2>
          
          <div className="footer-links-grid">
            <div className="footer-col">
              <h6>PRODUCT</h6>
              <ul>
                <li><a href="#">Patient Resources</a></li>
                <li><a href="#">Appointments</a></li>
                <li><a href="#">Services</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h6>COMPANY</h6>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Mission</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div className="footer-col newsletter-col">
              <h6>NEWSLETTER</h6>
              <div className="footer-input-group">
                <input type="email" placeholder="Email" />
                <button className="btn btn-primary">SEND</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-links">
            <a href="#" className="social-btn">f</a>
            <a href="#" className="social-btn">in</a>
            <a href="#" className="social-btn">x</a>
            <a href="#" className="social-btn">ig</a>
          </div>
          
          <p className="copyright">2026. All Rights Reserved</p>
          
          <div className="legal-links">
            <a href="#" className="legal-btn">TERMS & CONDITION</a>
            <a href="#" className="legal-btn">PRIVACY POLICY</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
