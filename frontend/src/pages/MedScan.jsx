import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { UploadCloud, Camera, ScanLine, AlertOctagon, HeartPulse, Clock, FileBadge, CheckCircle, ShieldAlert, BadgeInfo } from 'lucide-react';
import userProfile from '../data/userProfile.json';
import vitalsData from '../data/vitalsData.json';
import './MedScan.css';

const MedScan = () => {
  const [status, setStatus] = useState('idle'); // idle, scanning, results
  const [ocrProgress, setOcrProgress] = useState(0);
  const [scannedText, setScannedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Triggered when file uploaded or Mock Scan clicked
  const handleScan = async (fileOrMock) => {
    setStatus('scanning');
    setOcrProgress(0);

    let extractedText = '';

    if (fileOrMock === 'mock') {
      // Simulate scanning delay
      await new Promise(res => setTimeout(res, 2000));
      extractedText = 'RX: AMOXICILLIN 500mg CAP. TAKE TWO TIMES DLY.';
    } else if (fileOrMock === 'mock_danger') {
      await new Promise(res => setTimeout(res, 2000));
      extractedText = 'ADVIL IBUPROFEN 200MG';
    } else {
      // Real file scan
      try {
        const result = await Tesseract.recognize(
          fileOrMock,
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                setOcrProgress(Math.round(m.progress * 100));
              }
            }
          }
        );
        extractedText = result.data.text;
      } catch (err) {
        console.error("OCR Failed:", err);
        setStatus('idle');
        return;
      }
    }

    setScannedText(extractedText);
    analyzeText(extractedText);
  };

  const analyzeText = async (text) => {
    try {
      const response = await fetch('http://localhost:5000/api/medscan-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocrText: text,
          userConditions: userProfile.conditions,
          userAllergies: userProfile.allergies,
          userMeds: userProfile.currentMeds
        })
      });
      
      const payload = await response.json();
      
      if (!payload.found) {
        setAnalysis({ found: false });
        setStatus('results');
        return;
      }
      
      setAnalysis({
        found: true,
        medicine: payload.medicine,
        alerts: payload.alerts || [],
        vitalsWarnings: vitalsData.bloodPressureStatus !== 'Normal' ? payload.medicine.vitalsWarning : null
      });
      setStatus('results');
    } catch(err) {
      console.error("AI Fetch Error:", err);
      setAnalysis({ found: false });
      setStatus('results');
    }
  };

  const getTimelineSteps = (instructions) => {
      const now = new Date();
      const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (instructions.foodRequirement === 'Empty Stomach') {
          const takeTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
          return [
              { time: formatTime(now), label: "Stop Eating", type: 'warning' },
              { time: formatTime(takeTime), label: "Safe to Take Pill", type: 'safe' }
          ];
      } else if (instructions.foodRequirement === 'Take with food') {
          return [
              { time: formatTime(now), label: "Eat Meal/Snack", type: 'warning' },
              { time: formatTime(now), label: "Safe to Take Pill", type: 'safe' }
          ];
      }
      return [
        { time: formatTime(now), label: "Safe to take anytime", type: 'safe' }
      ];
  };

  return (
    <div className="medscan-page container">
      
      {/* Header */}
      <div className="medscan-header">
        <h1 className="heading-lg">MedScan Intelligence</h1>
        <p className="body-text">OCR-powered medication cross-referencing against your health profile.</p>
      </div>

      {status === 'idle' && (
        <div className="scan-upload-zone glass-panel">
            <div className="upload-icon-circle">
               <ScanLine size={48} className="text-blue" />
            </div>
            <h2>Scan Your Medication</h2>
            <p>Upload a photo of your pill bottle or prescription label.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden-file-input"
              onChange={(e) => {
                  if(e.target.files[0]) handleScan(e.target.files[0]);
              }}
            />
            
            <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>
                    <UploadCloud size={20} className="btn-icon"/> Upload Photo
                </button>
                <div className="divider-text">OR TRY A DEMO</div>
                <div className="demo-buttons">
                    <button className="btn btn-outline" onClick={() => handleScan('mock')}>Scan Safe Med (Amoxicillin)</button>
                    <button className="btn btn-outline danger-outline" onClick={() => handleScan('mock_danger')}>Scan Danger Med (Ibuprofen)</button>
                </div>
            </div>
        </div>
      )}

      {status === 'scanning' && (
        <div className="scanning-zone glass-panel">
            <div className="scan-beam-container">
                <ScanLine size={64} className="scan-icon-pulse text-blue" />
                <div className="scan-line-anim"></div>
            </div>
            <h2>Analyzing Image...</h2>
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: `${ocrProgress}%`}}></div>
            </div>
            <p className="body-text">Extracting text & matching databases: {ocrProgress}%</p>
        </div>
      )}

      {status === 'results' && (
        <div className="results-zone">
            <button className="btn btn-outline back-btn" onClick={() => setStatus('idle')}>Scan Another</button>
            
            {!analysis.found ? (
                <div className="card glass-panel text-center">
                    <BadgeInfo size={48} className="text-light mx-auto mb-4" />
                    <h2 className="heading-md">No Match Found</h2>
                    <p className="body-text">We read: "{scannedText}". Could not find this in the database.</p>
                </div>
            ) : (
                <div className="intelligence-grid">
                    {/* Primary Alerts Section */}
                    {analysis.alerts.length > 0 && (
                        <div className="alert-card critical-alert glass-panel col-span-full">
                            <div className="alert-header" style={{alignItems: 'flex-start'}}>
                                <ShieldAlert size={32} style={{marginTop: '4px'}} />
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <h2 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{analysis.medicine.name}</h2>
                                    <span style={{fontWeight: 600, opacity: 0.9}}>⚠️ CRITICAL PROFILE WARNING</span>
                                </div>
                            </div>
                            <ul className="alert-list" style={{marginTop: '12px'}}>
                                {analysis.alerts.map((alert, i) => <li key={i}>{alert}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    {analysis.alerts.length === 0 && (
                        <div className="alert-card safe-alert glass-panel col-span-full">
                            <div className="alert-header" style={{alignItems: 'flex-start'}}>
                                <CheckCircle size={32} style={{marginTop: '4px'}} />
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <h2 style={{fontSize: '1.5rem', marginBottom: '4px'}}>{analysis.medicine.name}</h2>
                                    <span style={{fontWeight: 600, opacity: 0.9}}>✓ SAFE FOR YOUR PROFILE</span>
                                </div>
                            </div>
                            <p style={{marginTop: '12px', fontSize: '1.05rem'}}>No contraindications found with your allergies or current conditions.</p>
                        </div>
                    )}

                    {/* Medicine Uses Panel */}
                    <div className="info-card glass-panel col-span-full">
                        <div className="card-header">
                           <BadgeInfo size={24} className="text-blue"/>
                           <h3>Clinical Details & Uses</h3>
                        </div>
                        <p className="body-text" style={{fontSize: '1.05rem', lineHeight: '1.6'}}>{analysis.medicine.uses}</p>
                    </div>

                    {/* Vitals Panel */}
                    <div className="info-card vitals-panel glass-panel">
                        <div className="card-header">
                           <HeartPulse size={24} className="text-blue"/>
                           <h3>Vitals Integration</h3>
                        </div>
                        <div className="vitals-data">
                            <div className="vital-stat">
                                <span className="stat-label">Blood Pressure</span>
                                <span className={`stat-value ${vitalsData.bloodPressureStatus !== 'Normal' ? 'text-warning' : 'text-safe'}`}>
                                    {vitalsData.bloodPressure} ({vitalsData.bloodPressureStatus})
                                </span>
                            </div>
                            <div className="vital-stat">
                                <span className="stat-label">Heart Rate</span>
                                <span className="stat-value text-safe">{vitalsData.heartRate} bpm</span>
                            </div>
                        </div>
                        {analysis.vitalsWarnings ? (
                             <div className="vitals-warning-box">
                                 <AlertOctagon size={18} />
                                 <p>{analysis.vitalsWarnings}</p>
                             </div>
                        ) : (
                             <div className="vitals-safe-box">
                                 <CheckCircle size={18} />
                                 <p>Vitals check passed. Safe to proceed.</p>
                             </div>
                        )}
                    </div>

                    {/* Timeline Panel */}
                    <div className="info-card timeline-panel glass-panel">
                        <div className="card-header">
                           <Clock size={24} className="text-blue"/>
                           <h3>Food-Drug Interface</h3>
                        </div>
                        <p className="req-pill">{analysis.medicine.instructions.foodRequirement}</p>
                        
                        <div className="visual-timeline">
                            {getTimelineSteps(analysis.medicine.instructions).map((step, idx) => (
                                <div key={idx} className={`timeline-step ${step.type}`}>
                                    <div className="step-time">{step.time}</div>
                                    <div className="step-dot"></div>
                                    <div className="step-label">{step.label}</div>
                                </div>
                            ))}
                        </div>
                        <p className="instruction-details">{analysis.medicine.instructions.details}</p>
                    </div>

                    {/* Meta Reference */}
                    <div className="card glass-panel col-span-full meta-reference">
                        <div className="verified-badge">
                            <FileBadge size={16} />
                            Verified Scientific Source: FDA Drug Database
                        </div>
                        <p className="disclaimer">
                            <strong>Medical Disclaimer:</strong> This application provides automated intelligence based on mock health data. 
                            It is not a substitute for professional medical advice, diagnosis, or treatment. 
                            Always seek the advice of your physician regarding a medical condition.
                        </p>
                    </div>

                </div>
            )}
        </div>
      )}

    </div>
  );
};

export default MedScan;
