import React from 'react';
import { Link } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <>
      <ParticleBackground />
      <div className="landing-container">
        <nav className="landing-nav">
          <div className="nav-logo">
            <span>💕</span> Daily Planner
          </div>
          <div className="nav-links">
            <span className="nav-link">Features</span>
            <span className="nav-link">About</span>
            <span className="nav-link">Contact</span>
          </div>
        </nav>

        <div className="hero-section">
          <h1 className="hero-title">Free Daily Planning Tool</h1>
          <p className="hero-subtitle">
            A simple, cozy place to organize your daily tasks and stay on track.
            Completely free, forever.
          </p>
          <Link to="/login" className="cta-button">
            Start Planning
          </Link>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">✨</span>
              <h3>Simple Tasks</h3>
              <p>Easy task management for your daily to-dos.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📅</span>
              <h3>Calendar View</h3>
              <p>Visualize your schedule at a glance.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📝</span>
              <h3>Quick Notes</h3>
              <p>Jot down thoughts and ideas instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
