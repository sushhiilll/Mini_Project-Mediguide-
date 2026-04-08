import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Activity, Play, Plus, X, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import './Doctors.css';
import { useAuth } from '../contexts/AuthContext';

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Sr. Neurologist', image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0D8ABC&color=fff', number: '+91-9876543210', city: 'Bilaspur', available: true, price: 'Free Consultation', date: '10th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] },
  { id: 2, name: 'Dr. Rohan Kumar', specialty: 'Neurologist', image: 'https://ui-avatars.com/api/?name=Rohan+Kumar&background=0f766e&color=fff', number: '+91-9876543211', city: 'Raipur', available: true, price: '₹400 / session', date: '11th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] },
  { id: 3, name: 'Dr. Anjali Desai', specialty: 'Asst. Neurologist', image: 'https://ui-avatars.com/api/?name=Anjali+Desai&background=0D8ABC&color=fff', number: '+91-9876543212', city: 'Bhilai', available: false, price: '₹300 / session', date: '12th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] },
  { id: 4, name: 'Dr. Amit Patel', specialty: 'Sr. Neurologist', image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=0f766e&color=fff', number: '+91-9876543213', city: 'Mumbai', available: true, price: '₹1000 / session', date: '13th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] },
  { id: 5, name: 'Dr. Vikram Singh', specialty: 'Sr. Neurologist', image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=0D8ABC&color=fff', number: '+91-9876543214', city: 'Raipur', available: true, price: '₹200 / session', date: '14th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] },
  { id: 6, name: 'Dr. Sneha Reddy', specialty: 'Asst. Neurologist', image: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=0f766e&color=fff', number: '+91-9876543215', city: 'Hyderabad', available: true, price: '₹600 / session', date: '15th March 2026', slots: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] }
];

const CATEGORIES = [
  { name: 'Cardiologist', icon: '❤️' },
  { name: 'Dentist', icon: '🦷' },
  { name: 'Neurologist', icon: '🧠', active: true },
  { name: 'Psychologist', icon: '☀️' },
  { name: 'Orthopedic', icon: '🦴' }
];

const MESSAGES = [
  { id: 1, name: 'Dr. Priya Sharma', message: 'Hello, how is your current condition?', image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0D8ABC&color=fff' },
  { id: 2, name: 'Dr. Rohan Kumar', message: 'Is there any problem did you face?', image: 'https://ui-avatars.com/api/?name=Rohan+Kumar&background=0f766e&color=fff' },
  { id: 3, name: 'Dr. Anjali Desai', message: 'Let me know when you are available...', image: 'https://ui-avatars.com/api/?name=Anjali+Desai&background=0D8ABC&color=fff' },
  { id: 4, name: 'Dr. Amit Patel', message: 'Hello, how are you?', image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=0f766e&color=fff' },
  { id: 5, name: 'Dr. Vikram Singh', message: 'How\'s your health today?', image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=0D8ABC&color=fff' },
  { id: 6, name: 'Dr. Sneha Reddy', message: 'Hey, how\'s everything going with you?', image: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=0f766e&color=fff' }
];

const Doctors = () => {
  const { currentUser } = useAuth();
  const userName = currentUser?.displayName?.split(' ')[0] || "User";
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorPopup, setSelectedDoctorPopup] = useState(null);
  
  // Track selected time slots per doctor (doctor.id -> time index)
  const [selectedSlots, setSelectedSlots] = useState({});

  const filteredMessages = MESSAGES.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSlotSelect = (docId, slotIndex) => {
    setSelectedSlots({ ...selectedSlots, [docId]: slotIndex });
  };

  const openDetails = (doc, e) => {
    // Get position to anchor popup
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedDoctorPopup({ doctor: doc, x: rect.left, y: rect.top });
  };

  const closeDetails = () => setSelectedDoctorPopup(null);

  return (
    <div className="dashboard-container">
      {/* iOS Style Overlay Popup */}
      {selectedDoctorPopup && (
        <div className="ios-popup-overlay" onClick={closeDetails}>
          <div className="ios-popup-bubble" onClick={(e) => e.stopPropagation()} style={{
            top: `clamp(20px, ${selectedDoctorPopup.y}px, calc(100vh - 300px))`,
            left: `clamp(20px, ${selectedDoctorPopup.x}px, calc(100vw - 300px))`
          }}>
            <button className="close-bubble" onClick={closeDetails}><X size={18} /></button>
            <div className="bubble-header">
              <img src={selectedDoctorPopup.doctor.image} alt="doc" className="bubble-avatar" />
              <div>
                <h4>{selectedDoctorPopup.doctor.name}</h4>
                <p>{selectedDoctorPopup.doctor.specialty}</p>
              </div>
            </div>
            
            <div className="bubble-details">
               <div className="b-row"><Phone size={16}/> <span>{selectedDoctorPopup.doctor.number}</span></div>
               <div className="b-row"><MapPin size={16}/> <span>{selectedDoctorPopup.doctor.city}</span></div>
               <div className="b-row"><Activity size={16}/> <span>{selectedDoctorPopup.doctor.specialty}</span></div>
               <div className="b-row">
                 {selectedDoctorPopup.doctor.available ? <CheckCircle size={16} color="green"/> : <XCircle size={16} color="red"/>} 
                 <span className={selectedDoctorPopup.doctor.available ? 'text-green' : 'text-red'}>
                   {selectedDoctorPopup.doctor.available ? 'Available Today' : 'Not Available Today'}
                 </span>
               </div>
               <div className="price-tag mt-2">{selectedDoctorPopup.doctor.price}</div>
            </div>
            
          </div>
        </div>
      )}

      {/* Main Left Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="heading-lg">Hello, {userName}!</h1>
            <p className="body-text">Welcome to our telehealth app! How can we help you today?</p>
          </div>
          <div className="header-actions">
            <button className="btn icon-btn chevron-btn"><ChevronLeft size={20} /></button>
            <button className="btn icon-btn play-btn bg-blue"><Play size={20} fill="white" /></button>
          </div>
        </header>

        <div className="category-scroll">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className={`category-card ${cat.active ? 'active' : ''}`}>
              <div className="cat-icon">{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>

        <div className="section-title-row">
          <h2 className="heading-md">Popular Specialist</h2>
          <p className="body-text flex justify-between items-center w-full mt-1">
            <span>Here you can see popular doctor specialist of the above selected department.</span>
            <a href="#" className="view-more">View More</a>
          </p>
        </div>

        <div className="doctor-dash-grid">
          {MOCK_DOCTORS.map(doc => (
            <div key={doc.id} className="doc-dash-card">
              <div className="doc-dash-header">
                <img src={doc.image} alt={doc.name} className="doc-dash-img" />
                <div>
                  <h4>{doc.name}</h4>
                  <p className="text-light text-sm">{doc.specialty}</p>
                </div>
              </div>
              
              <div className="doc-date-carousel">
                <button className="btn chevron-mini"><ChevronLeft size={16} /></button>
                <span className="date-text font-semibold">{doc.date}</span>
                <button className="btn chevron-mini"><ChevronRight size={16} /></button>
              </div>

              <div className="time-slots-grid">
                {doc.slots.map((time, idx) => (
                  <button 
                    key={idx} 
                    className={`time-slot ${selectedSlots[doc.id] === idx ? 'selected' : (idx === 7 ? 'more-slot' : '')}`}
                    onClick={() => handleSlotSelect(doc.id, idx)}
                  >
                    {idx === 7 ? 'More' : time}
                  </button>
                ))}
              </div>

              <div className="doc-dash-actions">
                <button className="btn btn-outline check-btn" onClick={(e) => openDetails(doc, e)}>Check Details</button>
                <button className="btn btn-primary schedule-btn">Book Appointment</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header flex justify-between items-center">
          <h2 className="heading-md">Messages</h2>
          <a href="#" className="view-more text-sm">View More</a>
        </div>
        <p className="body-text text-sm mb-4">Here are recent messages with various doctors.</p>
        
        <div className="search-wrapper mb-6">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Doctor Name" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="messages-list">
          {filteredMessages.length > 0 ? filteredMessages.map(msg => (
            <div key={msg.id} className="message-card">
               <img src={msg.image} alt={msg.name} className="message-avatar" />
               <div className="message-content">
                 <h5 className="font-semibold text-dark">{msg.name}</h5>
                 <p className="text-light text-xs text-ellipsis">{msg.message}</p>
               </div>
            </div>
          )) : (
            <p className="text-center text-light mt-8">No messages found matching "{searchQuery}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
