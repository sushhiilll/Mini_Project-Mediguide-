import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import { Activity, Baby, Pill, Hospital, Send, Navigation, Clock, CheckCircle2, Search, Sparkles, Loader, AlertTriangle, QrCode, ShieldCheck, Flame, HeartPulse } from 'lucide-react';
import hospitalData from '../data/hospital_status.json';
import waitTimesData from '../data/wait_times_api.json';
import { useAuth } from '../contexts/AuthContext';
import './CareMap.css';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

const BILASPUR_CENTER = {
  lat: 22.0797,
  lng: 82.1391
};

const LIBRARIES = ['places'];

const CareMap = () => {
    const { currentUser } = useAuth();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "", 
        libraries: LIBRARIES
    });

    const [map, setMap] = useState(null);
    const [filter, setFilter] = useState('all'); 
    const [ayushOnly, setAyushOnly] = useState(false);
    const [openWindowOnly, setOpenWindowOnly] = useState(false);
    const [isPanicMode, setIsPanicMode] = useState(false);
    
    const [hospitals, setHospitals] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [hospitalIntel, setHospitalIntel] = useState(null);
    const [intelLoading, setIntelLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    const [showQR, setShowQR] = useState(false);

    // Mock Ambulance state
    const [ambulancePos, setAmbulancePos] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        const enrichedHospitals = hospitalData.map(hosp => {
            const waitData = waitTimesData[hosp.id] || { status: 'Unknown', minutes: 15, color: 'green' };
            const isAyush = hosp.tags.includes('ayush') || Math.random() > 0.8; // mock ayush mapping
            const lat = hosp.coordinates[0];
            const lng = hosp.coordinates[1];
            return { ...hosp, waitData, isAyush, position: { lat, lng } };
        });
        setHospitals(enrichedHospitals);
    }, []);

    // Filter Logic
    const filteredHospitals = (filter === 'search' ? searchResults : hospitals).filter(h => {
        if (ayushOnly && !h.isAyush) return false;
        
        // Mocking open window filter. If openWindowOnly is true, randomly drop busy/closed ones
        if (openWindowOnly && h.waitData?.color === 'red') return false; 
        
        if (filter === 'search') return true;
        if (filter === 'all') return true;
        if (filter === 'cardiac') return h.tags.includes('cardiac') || h.tags.includes('icu');
        if (filter === 'pediatric') return h.tags.includes('pediatric');
        if (filter === 'trauma') return h.tags.includes('trauma') || h.tags.includes('icu');
        if (filter === 'pharmacy') return h.tags.includes('pharmacy');
        return true;
    });

    useEffect(() => {
        if (isPanicMode) {
            document.body.classList.add('emergency-panic-mode');
            
            // Start mock ambulance
            setAmbulancePos({ lat: 22.0650, lng: 82.1300, eta: '4 mins' });
            const interval = setInterval(() => {
                setAmbulancePos(prev => {
                    if (!prev) return null;
                    const diffLat = (BILASPUR_CENTER.lat - prev.lat) * 0.1;
                    const diffLng = (BILASPUR_CENTER.lng - prev.lng) * 0.1;
                    return { lat: prev.lat + diffLat, lng: prev.lng + diffLng, eta: 'Arriving soon...' };
                });
            }, 3000);
            return () => {
                document.body.classList.remove('emergency-panic-mode');
                clearInterval(interval);
            };
        } else {
            document.body.classList.remove('emergency-panic-mode');
            setAmbulancePos(null);
        }
    }, [isPanicMode]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleHospitalClick = async (hosp) => {
        setSelectedHospital(hosp);
        setShowQR(false);
        setHospitalIntel(null);
        setIntelLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/hospital-intel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hospitalName: hosp.name })
            });
            const data = await response.json();
            setHospitalIntel(data);
        } catch(e) {
            console.error(e);
        } finally {
            setIntelLoading(false);
        }
    };

    const handleAISearch = async (e) => {
        e.preventDefault();
        if(!searchQuery.trim()) return;

        setIsSearching(true);
        setAiRecommendation(null);
        setSelectedHospital(null);

        try {
            const response = await fetch('http://localhost:5000/api/treatment-map', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: searchQuery,
                    hospitals: hospitals
                })
            });

            const data = await response.json();
            
            if (data.action === "use_places_api" && data.placesQuery) {
                if (!window.google || !map) {
                    showToast("Google Maps not fully loaded yet.");
                    return;
                }
                
                const service = new window.google.maps.places.PlacesService(map);
                const request = {
                    location: new window.google.maps.LatLng(BILASPUR_CENTER.lat, BILASPUR_CENTER.lng),
                    radius: 50000,
                    query: data.placesQuery
                };
                
                service.textSearch(request, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                        const newPlaces = results.map(place => ({
                            id: place.place_id,
                            name: place.name,
                            position: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
                            tags: ['search_result'],
                            waitData: { status: 'Live', minutes: 10, color: 'green' }
                        }));
                        
                        setSearchResults(newPlaces);
                        setFilter('search'); 
                        setAiRecommendation({
                            treatment: data.treatmentName,
                            description: data.description || "Found live locations via Google Maps."
                        });
                        
                        if (newPlaces.length > 0) {
                            if (newPlaces.length === 1) {
                                map.panTo(newPlaces[0].position);
                                setTimeout(() => map.setZoom(16), 300);
                            } else {
                                const bounds = new window.google.maps.LatLngBounds();
                                newPlaces.forEach(p => bounds.extend(p.position));
                                map.fitBounds(bounds);
                            }
                        }
                        showToast(`Found ${newPlaces.length} locations for ${data.treatmentName}`);
                    } else {
                        showToast("Google Places API could not find results.");
                    }
                    setIsSearching(false);
                });
                return;
            } else if (data.action === "match_network" && data.hospitalId) {
                const targetHosp = hospitals.find(h => h.id === data.hospitalId);
                if (targetHosp) {
                    setSearchResults([targetHosp]);
                    setFilter('search');
                    handleHospitalClick(targetHosp);
                    setAiRecommendation({
                        treatment: data.treatmentName,
                        description: data.description
                    });
                    
                    if (map) {
                        map.panTo(targetHosp.position);
                        setTimeout(() => map.setZoom(16), 300);
                    }
                    showToast(`AI matched: ${targetHosp.name} for ${data.treatmentName}`);
                } else {
                    showToast("No confident match found. Please try general terms.");
                }
            } else {
                showToast("No confident match found. Please try general terms.");
            }
        } catch (error) {
            console.error(error);
            showToast("AI Routing failed check your connection.");
        } finally {
            setIsSearching(false);
        }
    };

    const sendEmergencyBrief = (hospName) => {
        // Build mock FHIR JSON
        const fhirBundle = {
            resourceType: "Bundle",
            type: "document",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        identifier: [{ system: "https://abha.abdm.gov.in", value: currentUser?.uid || "GUEST" }],
                        bloodGroup: "O+",
                    }
                }
            ]
        };
        console.log("FHIR Payload Generated:", JSON.stringify(fhirBundle, null, 2));
        showToast(`FHIR Pre-Check-in sent to ${hospName}. Scan QR at desk.`);
        setShowQR(true);
    };

    return (
        <div className={`care-map-container container fade-in ${isPanicMode ? 'panic-active' : ''}`}>
            {toastMessage && (
                <div className="toast-notification">
                    <CheckCircle2 size={24} />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="care-map-header">
                <h1 className="heading-lg">Triage Care Map</h1>
                <p className="body-text">Real-time emergency routing and pre-admission data sharing.</p>
                <button 
                  className={`sos-btn ${isPanicMode ? 'active' : ''}`}
                  onClick={() => setIsPanicMode(!isPanicMode)}
                >
                    <AlertTriangle size={24} /> 
                    {isPanicMode ? 'CANCEL PANIC MODE' : 'SOS / PANIC MODE'}
                </button>
            </div>

            <form className="ai-search-bar glass-panel" onSubmit={handleAISearch}>
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search treatments using AI (e.g., 'Chemotherapy')" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="treatment-input"
                    />
                    <button type="submit" className="ai-submit-btn" disabled={isSearching || !searchQuery}>
                        {isSearching ? <Loader className="spin" size={18} /> : <Sparkles size={18} />}
                        <span>{isSearching ? 'Finding...' : 'AI Find'}</span>
                    </button>
                </div>
            </form>

            <div className="specialty-toggles glass-panel">
                <div className="toggle-group">
                    <label className="toggle-label">
                        <input type="checkbox" checked={ayushOnly} onChange={(e)=>setAyushOnly(e.target.checked)} />
                        <span className="slider"></span>
                        <span className="label-text text-color">AYUSH Centers Only</span>
                    </label>
                    <label className="toggle-label">
                        <input type="checkbox" checked={openWindowOnly} onChange={(e)=>setOpenWindowOnly(e.target.checked)} />
                        <span className="slider slider-blue"></span>
                        <span className="label-text text-color">+4hr Open Window</span>
                    </label>
                </div>
            </div>

            <div className="triage-controls glass-panel">
                <button 
                  className={`triage-btn ${filter === 'all' ? 'active' : ''}`} 
                  onClick={() => { setFilter('all'); setSelectedHospital(null); }}>
                    <Hospital size={20} /> All Centers
                </button>
                <button 
                  className={`triage-btn critical-filter ${filter === 'cardiac' ? 'active alert' : ''}`} 
                  onClick={() => { setFilter('cardiac'); setSelectedHospital(null); }}>
                    <HeartPulse size={20} /> Cardiac
                </button>
                <button 
                  className={`triage-btn critical-filter ${filter === 'trauma' ? 'active alert' : ''}`} 
                  onClick={() => { setFilter('trauma'); setSelectedHospital(null); }}>
                    <Flame size={20} /> Trauma
                </button>
                <button 
                  className={`triage-btn ${filter === 'pediatric' ? 'active' : ''}`} 
                  onClick={() => { setFilter('pediatric'); setSelectedHospital(null); }}>
                    <Baby size={20} /> Pediatric
                </button>
                <button 
                  className={`triage-btn ${filter === 'pharmacy' ? 'active' : ''}`} 
                  onClick={() => { setFilter('pharmacy'); setSelectedHospital(null); }}>
                    <Pill size={20} /> Pharmacy
                </button>
            </div>

            <div className="map-wrapper glass-panel">
                 <div className="status-legend">
                     <span className="legend-item"><span className="dot pulse-dot green-bg"></span> Low Wait / Open</span>
                     <span className="legend-item"><span className="dot pulse-dot red-bg fast-pulse"></span> High Wait / Busy</span>
                 </div>
                 
                 <div className="google-map-container-box">
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={BILASPUR_CENTER}
                            zoom={13}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{ mapTypeControl: false, streetViewControl: false }}
                        >
                            {/* Dynamically pulse markers via OverlayView instead of simple Marker to utilize CSS animations */}
                            {filteredHospitals.map(hosp => {
                                const pulseClass = hosp.waitData.color === 'red' ? 'pulse-fast bg-red-500' : 'pulse-slow bg-green-500';
                                return (
                                    <OverlayView
                                        key={hosp.id}
                                        position={hosp.position}
                                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                    >
                                        <div className="map-marker-container" onClick={() => handleHospitalClick(hosp)}>
                                            <div className={`map-pulse-ring ${pulseClass}`}></div>
                                            <div className="map-marker-core">
                                                <Hospital size={16} color="#fff" />
                                            </div>
                                            {/* Resource Overlay Tag */}
                                            {hosp.waitData.color !== 'red' && <div className="floating-resource">Active</div>}
                                        </div>
                                    </OverlayView>
                                )
                            })}

                            {ambulancePos && (
                                <Marker
                                    position={{ lat: ambulancePos.lat, lng: ambulancePos.lng }}
                                    icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                                    label="ETA"
                                />
                            )}

                            {selectedHospital && (
                                <InfoWindow
                                    position={selectedHospital.position}
                                    onCloseClick={() => setSelectedHospital(null)}
                                >
                                    <div className="popup-content">
                                        <h3 className="hosp-name">{selectedHospital.name}</h3>
                                        
                                        {!intelLoading && hospitalIntel && (
                                           <div className="hospital-intel-box">
                                                <div className="trust-badge">
                                                    <ShieldCheck size={14} color="#059669"/>
                                                    <span>{hospitalIntel.trustScore || 'Verified'}</span>
                                                </div>
                                                <p><Clock size={12}/> OPD: {hospitalIntel.opdTimings}</p>
                                                <p>Casualty: {hospitalIntel.casualtyContact}</p>
                                                <p className="highlight-tag">ICU Beds: {hospitalIntel.icuBedsAvailable}</p>
                                                <p className="highlight-tag">Blood: {hospitalIntel.bloodUnits}</p>
                                           </div>
                                        )}
                                        {intelLoading && (
                                           <div className="intel-loading"><Loader className="spin" size={16}/> Sourcing Live Data...</div>
                                        )}

                                        <div className="action-grid mt-3">
                                            {!showQR ? (
                                                <button className="btn btn-primary" onClick={() => sendEmergencyBrief(selectedHospital.name)}>
                                                    <Send size={16} /> Pre-Check-In (FHIR Handover)
                                                </button>
                                            ) : (
                                                <div className="qr-box">
                                                    <QrCode size={64} className="qr-stub"/>
                                                    <p>Scan at Reception</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    ) : (
                        <div style={{...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0'}}>
                            <h3>Loading Google Maps...</h3>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default CareMap;
