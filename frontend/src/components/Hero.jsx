import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Star, Users, Activity } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero container">
      {/* Left Content Area */}
      <div className="hero-content">
        <div className="hero-top-badge">
          <Star size={16} className="text-blue" />
          <p className="badge-text">WE PROVIDE A COMPREHENSIVE RANGE OF MEDICAL SERVICES TO MEET ALL YOUR HEALTHCARE NEEDS.</p>
        </div>

        <div className="trusted-users-widget">
          <div className="avatars-group">
            <img src="https://ui-avatars.com/api/?name=User+X&background=random" alt="User" />
            <img src="https://ui-avatars.com/api/?name=User+Y&background=random" alt="User" />
            <img src="https://ui-avatars.com/api/?name=User+Z&background=random" alt="User" />
          </div>
          <div className="trusted-stats">
            <h4>125K+</h4>
            <p>TRUSTED USER</p>
          </div>
        </div>

        <h1 className="heading-xl hero-title">
          Trusted Specialist<br />
          for Every <span className="text-blue">Medical<br />Need</span>
        </h1>

        <div className="hero-actions">
          <button className="btn btn-outline schedule-btn">
            <Calendar size={18} />
            <span>Schedule an Appointment</span>
          </button>
          <button className="btn btn-primary find-doc-btn" onClick={() => navigate('/doctors')}>
            <Search size={18} />
            <span>Find Doctor</span>
          </button>
        </div>
      </div>

      {/* Right Image/Graphics Area */}
      <div className="hero-graphics">
        <div className="main-image-wrapper">
          <img 
            src="/hero_doctor.png" 
            alt="Senior Doctor" 
            className="main-doctor-img"
          />
          
          {/* Floating Cards */}
          <div className="glass-panel float-card orthopedics-card">
            <div className="card-header">
               <div className="icon-wrap bg-pink"><Activity size={14} color="#D81B60"/></div>
               <h5>Orthopedics</h5>
            </div>
            <div className="avatars-mini">
              <img src="https://ui-avatars.com/api/?name=Doc+A&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=Doc+B&background=random" alt="User" />
              <span className="time-badge">9 am - 4 pm</span>
            </div>
          </div>

          <div className="glass-panel float-card review-card">
            <p className="review-title">We Help You Feel Extraordinary Medical Services.</p>
            <div className="reviewer-info">
              <img src="https://ui-avatars.com/api/?name=Alex+Maine&background=random" alt="Dentist" className="small-doc-img" />
              <div>
                <h6>Alex Maine</h6>
                <p>Dentist</p>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="hero-tags">
            <span className="badge glass-badge">Cardiologist</span>
            <span className="badge glass-badge active">Neurologist</span>
            <span className="badge glass-badge">Dermatologist</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
