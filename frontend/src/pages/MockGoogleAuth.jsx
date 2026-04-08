import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MockGoogleAuth.css';

const MockGoogleAuth = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleAccountSelect = async () => {
        setLoading(true);
        await signInWithGoogle();
        navigate('/my-hub');
    };

    return (
        <div className="google-auth-container">
            <div className="google-auth-card">
                <div className="google-logo">
                    <span className="g-blue">G</span>
                    <span className="g-red">o</span>
                    <span className="g-yellow">o</span>
                    <span className="g-blue">g</span>
                    <span className="g-green">l</span>
                    <span className="g-red">e</span>
                </div>
                <h2>Choose an account</h2>
                <p>to continue to <strong>MediGuide</strong></p>

                <div className="account-list">
                    <div className="account-item" onClick={loading ? null : handleAccountSelect}>
                        <img src="https://ui-avatars.com/api/?name=Guest+User&background=0d9488&color=fff" alt="Avatar" className="account-avatar"/>
                        <div className="account-details">
                            <span className="account-name">Guest User</span>
                            <span className="account-email">guest@mediguide.com</span>
                        </div>
                    </div>
                </div>

                <div className="google-footer">
                    <span>To continue, Google will share your name, email address, and profile picture with MediGuide.</span>
                </div>
            </div>
        </div>
    );
};

export default MockGoogleAuth;
