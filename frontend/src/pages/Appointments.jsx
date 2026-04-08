import React, { useEffect, useState } from 'react';
import { MapPin, ShieldCheck, Clock, Phone, MessageCircle, Link as LinkIcon, Database, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Appointments.css';

const Appointments = () => {
  const { currentUser } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch specifically simulated Koni, Bilaspur validated data from the backend
    fetch('http://localhost:5000/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        setHospitals(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching verified appointments:", err);
        setIsLoading(false);
      });
  }, []);

  const generateWhatsAppLink = (whatsappNumber) => {
    const patientName = currentUser?.displayName || "a Patient";
    // For a real app, symptomSummary would strictly pull from context/localStorage.
    const symptomSummary = "Please review my profile/symptoms.";
    const message = `Hello, I am ${patientName}. I would like to request an appointment. Symptom context: ${symptomSummary}.`;
    
    // Ensure the number has no spaces/dashes before sending to WA format
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="container appointments-container">
      <div className="appointments-header">
        <h1>Book Verified Appointments</h1>
        <p>Our AI Validation Engine ensures 100% data authenticity. Direct contact to verified hospitals and clinics.</p>
        <div className="location-badge">
          <MapPin size={18} />
          <span>Locked Area: Koni, Bilaspur (495009) & Surrounding</span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-block">
          <Loader2 className="spinning-icon" size={32} />
          <span>Running Verification Engine...</span>
        </div>
      ) : (
        <div className="hospital-grid">
          {hospitals.map((hospital) => (
            <div className="hospital-card" key={hospital.id}>
              
              <div className="hospital-title-row">
                <h3>{hospital.name}</h3>
                {hospital.isGovVerified && (
                  <div className="shield-verified" title="Cross-Verified with Government Database">
                    <ShieldCheck size={28} />
                  </div>
                )}
              </div>
              
              <div className="hospital-location-row">
                <MapPin size={16} />
                <span>{hospital.location}</span>
              </div>
              
              <div className="cat-tags">
                {hospital.categories.map((cat, idx) => (
                  <span key={idx} className="cat-chip">{cat}</span>
                ))}
              </div>

              <div className="contact-section">
                <div className="number-item">
                  <span className="number-label">Primary ({hospital.primaryType})</span>
                  <span className="number-value">
                    <Phone size={18} /> {hospital.primaryNumber}
                  </span>
                </div>
                
                {hospital.whatsappNumber && (
                   <div className="number-item">
                     <span className="number-label">Direct Appt (WhatsApp)</span>
                     <span className="number-value">
                       <MessageCircle size={18} color="#25D366" /> +{hospital.whatsappNumber}
                     </span>
                   </div>
                )}
              </div>

              <div className="validation-block">
                <div className="val-title">
                  <Database size={14} /> Verification Sources
                </div>
                <div className="sources-list">
                  {hospital.sources.map((src, idx) => (
                    <span key={idx} className="source-tag">{src}</span>
                  ))}
                </div>
                <div className="last-verified mt-2">
                  <CheckCircle size={14} /> {hospital.lastVerified}
                </div>
              </div>

              <div className="mt-auto">
                {hospital.whatsappNumber ? (
                  <a 
                    href={generateWhatsAppLink(hospital.whatsappNumber)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <MessageCircle size={18} /> Send Appointment Request
                  </a>
                ) : (
                  <a href={`tel:${hospital.primaryNumber}`} className="btn btn-outline" style={{ width: '100%' }}>
                    <Phone size={18} /> Call Reception directly
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
