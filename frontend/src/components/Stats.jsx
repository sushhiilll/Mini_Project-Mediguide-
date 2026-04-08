import React from 'react';
import './Stats.css';

const Stats = () => {
  return (
    <div className="stats-section">
      <div className="container stats-container">
        <div className="stat-item">
          <h2>24/7</h2>
          <p>Support</p>
        </div>
        <div className="stat-item">
          <h2>15+</h2>
          <p>Medical Specialties</p>
        </div>
        <div className="stat-item">
          <h2>Verified</h2>
          <p>Sources</p>
        </div>
        <div className="stat-item">
          <h2>500+</h2>
          <p>Health Articles</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
