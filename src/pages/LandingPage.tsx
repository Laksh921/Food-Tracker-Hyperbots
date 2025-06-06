import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>🍽️ Food Tracker</h1>
        <p>Track daily food choices for Hyperbots</p>
        <div className="btn-group">
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="outline" onClick={() => navigate("/signup")}>Create Account</button>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="icon">🥗</div>
          <h3>Daily Choices</h3>
          <p>Submit your daily food preference - Vegetarian or Non-Vegetarian</p>
        </div>
        <div className="card">
          <div className="icon">📊</div>
          <h3>Analytics</h3>
          <p>View comprehensive reports and export data for analysis</p>
        </div>
        <div className="card">
          <div className="icon">🛡️</div>
          <h3>Admin Dashboard</h3>
          <p>Administrative access for viewing summaries and managing data</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
