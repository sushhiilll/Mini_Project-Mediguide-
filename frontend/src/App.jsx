import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MyHub from './pages/MyHub';
import SymptomGuide from './pages/SymptomGuide';
import Doctors from './pages/Doctors';
import MedScan from './pages/MedScan';
import CareMap from './pages/CareMap';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import MockGoogleAuth from './pages/MockGoogleAuth';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    // Attempt to fetch from backend
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(err => console.error("Backend not reachable", err));
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/google" element={<MockGoogleAuth />} />
            <Route path="/symptom-guide" element={<SymptomGuide />} />
            <Route path="/my-hub" element={<MyHub />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/medscan" element={<MedScan />} />
            <Route path="/care-map" element={<CareMap />} />
            <Route path="/appointments" element={<Appointments />} />
          </Routes>
          <Footer />

        {backendStatus && (
           <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '24px', fontSize: '12px', zIndex: 100 }}>
              {backendStatus}
           </div>
        )}
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
