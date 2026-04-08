import React from 'react';
import { ArrowRight, ChevronRight, Play, Activity } from 'lucide-react';
import './Features.css';

const Features = () => {
  return (
    <section className="features-section container">
      
      {/* Top Feature Row */}
      <div className="feature-row feature-top">
        <div className="feature-card img-card glass-panel dark-gradient">
          <div className="badge inline-badge">INSIGHT</div>
          <p className="date-text">20/11/2026</p>
          <h4>We are here to support your health</h4>
          <button className="btn btn-white-round"><ArrowRight size={18} /></button>
        </div>
        
        <div className="feature-card text-card">
          <div className="badge solid-badge">SERVICE</div>
          <h2 className="heading-lg">Our team of highly trained <span className="text-blue">medical</span> professionals is here to provide the best possible care.</h2>
          <button className="btn btn-outline outline-dark">
            LEARN MORE <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="feature-grid">
        <div className="grid-left flex-col gap-6">
          <div className="feature-card light-blue-card">
            <div className="badge outline-badge">OUR TEAM</div>
            <h3>Our team can help you get best consultant</h3>
            <div className="avatars-group mt-4">
              <img src="https://ui-avatars.com/api/?name=User+A&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=User+B&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=User+C&background=random" alt="User" />
              <img src="https://ui-avatars.com/api/?name=User+D&background=random" alt="User" />
            </div>
          </div>

          <div className="feature-card light-blue-card newsletter-card">
            <div className="badge outline-badge">STAY UPDATED</div>
            <h3>Discover our latest medical health areas.</h3>
            <div className="input-group">
              <input type="email" placeholder="Email" className="email-input" />
              <button className="btn btn-primary w-full mt-2">Subscribe Now</button>
            </div>
          </div>
        </div>

        <div className="grid-right">
          <div className="large-image-card">
             <img src="/surgeon_hologram.png" alt="Surgeon Hologram" className="cover-img" />
             <div className="play-button-overlay">
                <Play fill="white" size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Service Grid */}
      <div className="service-info-row">
        <div className="feature-card light-blue-card flex-col justify-between doc-profile-card">
           <div className="badge outline-badge">TEAM UP AND INNOVATE</div>
           <h4 className="mt-4">Reach out to us with any questions or to schedule a visit</h4>
           <div className="doc-mini">
              <img src="/hero_doctor.png" alt="Doctor" style={{ objectPosition: "top" }} />
              <button className="btn btn-white contact-btn">CONTACT WITH US</button>
           </div>
        </div>

        <div className="service-text-area">
          <div className="badge solid-badge mb-4">CARE</div>
          <h2 className="heading-lg">We are here to support your health at every stage and look forward</h2>
        </div>
      </div>

      <div className="specialty-cards-row">
        <div className="feature-card light-blue-card">
          <div className="icon-badge"><Activity size={18}/></div>
          <h5 className="mt-4">SPECIALIZES IN DIGESTIVE SYSTEM</h5>
          <a href="#" className="learn-link mt-4">Learn More</a>
        </div>
        <div className="feature-card light-blue-card">
          <div className="icon-badge"><Activity size={18}/></div>
          <h5 className="mt-4">TREATS SKIN-RELATED ISSUES</h5>
          <a href="#" className="learn-link mt-4">Learn More</a>
        </div>
        <div className="feature-card light-blue-card">
          <div className="icon-badge"><Activity size={18}/></div>
          <h5 className="mt-4">NEUROLOGIST</h5>
          <a href="#" className="learn-link mt-4">Learn More</a>
        </div>
        <div className="feature-card clear-card">
           <p className="text-light text-sm font-semibold mb-4">EXPERT IN TREATING DISORDERS OF THE NERVOUS SYSTEM, INCLUDING THE BRAIN AND SPINAL CORD.</p>
           <div className="nav-arrows">
              <button className="nav-btn bg-dark"><ChevronRight size={18} color="white" /></button>
              <button className="nav-btn"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>

      {/* Health Centric Paragraph */}
      <div className="logos-row text-center flex-col justify-center gap-4">
        <h2 className="heading-md text-blue">Committed to Your Well-being</h2>
        <p className="body-text max-w-md mx-auto" style={{ lineHeight: '1.8' }}>
          At MediGuide, we empower you with comprehensive, science-backed guidance 
          to take control of your health journey. From preventative care strategies 
          to advanced medical diagnostics, our mission is to deliver reliable health 
          intelligence directly to your fingertips.
        </p>
      </div>

      {/* CTA Banner */}
      <div className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-shape shape-large"></div>
          <div className="cta-shape shape-small"></div>
          
          <div className="cta-content">
            <h2 className="cta-heading text-white">Bring your customer services the next level of excellence.</h2>
            <button className="btn cta-btn-schedule">
              Make a schedule <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Features;
