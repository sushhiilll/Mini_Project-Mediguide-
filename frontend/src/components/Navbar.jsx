import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
  const currentPath = location.pathname;
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="navbar container">
      <div className="navbar-logo">
        <Activity size={24} className="text-blue" />
        <Link to="/" className="logo-text">MediGuide</Link>
      </div>
      
      <div className="mobile-toggle" onClick={toggleMenu}>
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      <div className={`navbar-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
        <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
        <Link to="/symptom-guide" className={`nav-link ${currentPath === '/symptom-guide' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Symptom Guide</Link>
        <Link to="/my-hub" className={`nav-link ${currentPath === '/my-hub' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>My Hub</Link>
        <Link to="/doctors" className={`nav-link ${currentPath === '/doctors' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Doctors</Link>
        <Link to="/medscan" className={`nav-link ${currentPath === '/medscan' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>MedScan</Link>
        <Link to="/care-map" className={`nav-link ${currentPath === '/care-map' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>Care Map</Link>
        
        {/* Mobile ONLY auth links inside menu to keep it enclosed */}
        <div className="mobile-auth-links">
           {!currentUser ? (
             <>
               <Link to="/login" className="btn btn-outline mobile-btn" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
               <Link to="/login" className="btn btn-primary mobile-btn" onClick={() => setMobileMenuOpen(false)}>Register</Link>
             </>
           ) : null}
        </div>
      </div>
      
      <div className="navbar-actions">
        <div className="lang-selector">
          <span>EN</span>
        </div>
        {!currentUser ? (
          <div className="desktop-auth">
            <Link to="/login" className="btn btn-outline login-btn">Log in</Link>
            <Link to="/login" className="btn btn-primary register-btn">Register</Link>
          </div>
        ) : (
          <Link to="/my-hub" className="profile-circle-link">
            <img src={currentUser.photoURL || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="profile-avatar" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
