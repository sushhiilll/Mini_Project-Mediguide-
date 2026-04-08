import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Pencil, FileText, Download, XCircle, UserX, CalendarX, Save, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './MyHub.css';

const MyHub = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('future');
  const [isEditing, setIsEditing] = useState(false);

  // Initialize state mapped to the user ID
  const [profileData, setProfileData] = useState({
    dob: '',
    address: '',
    allergies: '',
    diseases: '',
    bloodType: '',
    pastIllnesses: '',
    displayName: '',
    email: '',
    photoURL: ''
  });

  const displayProfile = {
      displayName: profileData.displayName || currentUser?.displayName,
      email: profileData.email || currentUser?.email,
      photoURL: profileData.photoURL || currentUser?.photoURL
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setProfileData({...profileData, photoURL: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      const saved = localStorage.getItem(`profile_${currentUser.uid}`);
      if (saved) {
        setProfileData(JSON.parse(saved));
      }
    }
  }, [currentUser]);

  // If there's no auth, redirect automatically 
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(profileData));
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const emptyStateMessage = "No consultation history found yet.";

  // Mocking empty arrays for a new authorized user
  const futureVisits = [];
  const pastVisits = [];
  const files = [];
  const notes = [];

  return (
    <div className="my-hub-container container">
      {/* Top Action Bar */}
      <div className="dashboard-actions">
        {isEditing ? (
          <button className="btn btn-primary small-btn" onClick={handleSave}>
            <Save size={16} style={{marginRight: '6px'}}/> SAVE
          </button>
        ) : (
          <button className="btn btn-primary small-btn" onClick={() => setIsEditing(true)}>
            <Pencil size={16} style={{marginRight: '6px'}}/> EDIT
          </button>
        )}
        <button className="btn btn-outline small-btn" onClick={handleLogout} style={{borderColor: '#ef4444', color: '#ef4444'}}>
          <LogOut size={16} style={{marginRight: '6px'}}/> LOGOUT
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Top Row */}
        <div className="card profile-card" style={{position: 'relative'}}>
          <div className="avatar-wrapper" style={{position: 'relative', display: 'inline-block'}}>
            <img src={displayProfile.photoURL} alt={displayProfile.displayName} className="avatar-img" />
            {isEditing && (
              <div className="avatar-edit-overlay" style={{position: 'absolute', bottom: 0, right: 0, background: '#10B981', color: 'white', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                <input type="file" id="avatarUpload" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                <label htmlFor="avatarUpload" style={{cursor: 'pointer', display: 'flex'}}>
                  <Pencil size={14} />
                </label>
              </div>
            )}
          </div>

          {isEditing ? (
             <input type="text" className="edit-input" style={{fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '8px', maxWidth: '80%'}} value={profileData.displayName || currentUser.displayName} onChange={e => setProfileData({...profileData, displayName: e.target.value})} placeholder="Your Name" />
          ) : (
             <h2 className="profile-name">{displayProfile.displayName}</h2>
          )}
          
          <div className="contact-info" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
             {isEditing ? (
                 <input type="email" className="edit-input" style={{textAlign: 'center', maxWidth: '80%'}} value={profileData.email || currentUser.email} onChange={e => setProfileData({...profileData, email: e.target.value})} placeholder="Your Email" />
             ) : (
                 <a href={`mailto:${displayProfile.email}`} className="email-link">{displayProfile.email}</a>
             )}
          </div>
        </div>

        <div className="card info-card">
          <div className="card-header-inline">
            <h3>General information</h3>
            {!isEditing && <Pencil size={14} className="icon-light" onClick={() => setIsEditing(true)} style={{cursor: 'pointer'}} />}
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Date of birth:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.dob} onChange={e => setProfileData({...profileData, dob: e.target.value})} placeholder="DD. MM. YYYY" />
              ) : (
                <span className="info-value">{profileData.dob || '-'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="City, State" />
              ) : (
                <span className="info-value">{profileData.address || '-'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Registration Date:</span>
              <span className="info-value">Today</span>
            </div>
          </div>
        </div>

        <div className="card anamnesis-card">
          <div className="card-header-inline">
            <h3>Anamnesis</h3>
            {!isEditing && <Pencil size={14} className="icon-light" onClick={() => setIsEditing(true)} style={{cursor: 'pointer'}}/>}
          </div>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">Allergies:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.allergies} onChange={e => setProfileData({...profileData, allergies: e.target.value})} placeholder="e.g. Dust, Dairy" />
              ) : (
                <span className="info-value">{profileData.allergies || '-'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Chronic diseases:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.diseases} onChange={e => setProfileData({...profileData, diseases: e.target.value})} placeholder="e.g. Diabetes" />
              ) : (
                <span className="info-value">{profileData.diseases || '-'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Blood type:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.bloodType} onChange={e => setProfileData({...profileData, bloodType: e.target.value})} placeholder="e.g. O+" />
              ) : (
                <span className="info-value">{profileData.bloodType || '-'}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">Past illnesses:</span>
              {isEditing ? (
                <input type="text" className="edit-input" value={profileData.pastIllnesses} onChange={e => setProfileData({...profileData, pastIllnesses: e.target.value})} placeholder="e.g. Typhoid" />
              ) : (
                <span className="info-value">{profileData.pastIllnesses || '-'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="card visits-card">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'future' ? 'active' : ''}`}
              onClick={() => setActiveTab('future')}
            >
              Future visits ({futureVisits.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past visits ({pastVisits.length})
            </button>
            <button className="tab-btn">
              Planned treatments
            </button>
          </div>

          <div className="visits-list">
             {(activeTab === 'future' ? futureVisits : pastVisits).length === 0 ? (
                <div className="empty-state">
                  <CalendarX size={48} className="empty-icon text-light"/>
                  <h4 className="empty-heading">{emptyStateMessage}</h4>
                </div>
             ) : (
                (activeTab === 'future' ? futureVisits : pastVisits).map((visit, index) => (
                  <div className={`visit-row ${index % 2 === 0 ? 'bg-light-blue' : 'bg-lighter-blue'}`} key={visit.id}>
                    <div className="visit-date-col">
                      <span className="visit-time">{visit.time}</span>
                      <span className="visit-date">{visit.date}</span>
                    </div>
                    <div className="visit-detail-col">
                      <span className="visit-label">Service:</span>
                      <span className="visit-value">{visit.service}</span>
                    </div>
                    <div className="visit-detail-col">
                      <span className="visit-label">Doctor:</span>
                      <span className="visit-value text-blue">{visit.doctor}</span>
                    </div>
                    <div className="visit-status-col">
                      <span className="visit-label">Status:</span>
                      <span className="status-pill text-blue">{visit.status}</span>
                    </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="sidebar-group">
          <div className="card list-card files-card">
            <div className="card-header-flex">
              <h3>Files</h3>
            </div>
            <div className="document-list">
               {files.length === 0 ? (
                  <div className="empty-state-small">
                     <FileText size={24} className="icon-light"/>
                     <span>No files yet</span>
                  </div>
               ) : (
                  files.map(file => (
                  <div className={`document-item ${file.selected ? 'selected' : ''}`} key={file.id}>
                    <div className="document-name">
                      <FileText size={16} className={file.selected ? 'text-blue' : 'icon-light'} />
                      <span className={file.selected ? 'text-blue font-medium' : ''}>{file.name}</span>
                    </div>
                  </div>
                ))
               )}
            </div>
          </div>

          <div className="card list-card notes-card">
            <div className="card-header-flex">
              <h3>Notes</h3>
            </div>
            <div className="document-list">
               {notes.length === 0 ? (
                  <div className="empty-state-small">
                     <FileText size={24} className="icon-light"/>
                     <span>No notes yet</span>
                  </div>
               ) : (
                  notes.map(note => (
                  <div className="document-item" key={note.id}>
                    <div className="document-name">
                      <FileText size={16} className="icon-light" />
                      <span>{note.name}</span>
                    </div>
                  </div>
                ))
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyHub;
