import React, { useState, useEffect } from 'react';
import './userPanel.css';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/hyprbots_systems_logo.jpeg';

const UserPanel: React.FC = () => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [filteredMeal, setFilteredMeal] = useState<'all' | 'veg' | 'non-veg'>('all');

  // New states for filter range and specific date
  const [filterRange, setFilterRange] = useState<'7days' | 'month' | 'date'>('7days');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.error('Error fetching user:', error.message);
      else setUserEmail(user?.email ?? null);
    };
    fetchUser();
  }, []);

  const fetchRecentSubmissions = async () => {
    if (!userEmail) return;

    let fromDate: string;
    const today = new Date();

    if (filterRange === '7days') {
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      fromDate = lastWeek.toISOString().split('T')[0];
    } else if (filterRange === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = startOfMonth.toISOString().split('T')[0];
    } else if (filterRange === 'date') {
      if (!filterDate) {
        // If no date selected, fallback to today
        fromDate = today.toISOString().split('T')[0];
      } else {
        fromDate = filterDate;
      }
    } else {
      fromDate = today.toISOString().split('T')[0];
    }

    let query = supabase
      .from('meal_preferences')
      .select('*')
      .eq('email', userEmail)
      .order('created_date', { ascending: false });

    if (filterRange === 'date' && filterDate) {
      // For specific date, filter exact date
      query = query.eq('created_date', filterDate);
    } else {
      // For 7days or month, filter dates from 'fromDate' onward
      query = query.gte('created_date', fromDate);
    }

    if (filteredMeal !== 'all') {
      query = query.eq('meal_type', filteredMeal);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching submissions:', error.message);
      setRecentSubmissions([]);
    } else {
      setRecentSubmissions(data || []);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchRecentSubmissions();
  }, [userEmail, filteredMeal, filterRange, filterDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSubmit = async () => {
    if (!name.trim() || !mealType) {
      alert('Please enter your name and select a meal type.');
      return;
    }
    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setLoading(true);
    const { error } = await supabase.from('meal_preferences').insert([
      {
        name: name.trim(),
        meal_type: mealType,
        email: userEmail,
        created_date: today,
      },
    ]);
    setLoading(false);
    if (error) alert('Error submitting data: ' + error.message);
    else {
      alert(`Submitted:\nName: ${name.trim()}\nMeal: ${mealType}`);
      setName('');
      setMealType('');
      fetchRecentSubmissions();
    }
  };

  return (
    <div className="user-panel">
      <div className="top-bar">
        <div className="left-brand">
          <img src={logo} alt="Logo" className="logo-img" />
          <span className="brand-text">Hyperbots</span>
        </div>
        <div className="right-controls">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span>{userEmail}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>↩ Logout</button>
        </div>
      </div>

      <div className="main-section">
        <div className="form-container">
          <h2 className="title">🍽️ Daily Meal Preference</h2>
          <p className="card-subtext">
            {`Select your food preference for ${new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
            })}`}
          </p>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="meal-options">
            <div
                className={`meal-card ${mealType === 'veg' ? 'selected veg' : ''}`}
                onClick={() => setMealType('veg')}
            >

              <span className="emoji">🌱</span>
              <span className="label">Veg</span>
            </div>
            <div
              className={`meal-card ${mealType === 'non-veg' ? 'selected non-veg' : ''}`}
              onClick={() => setMealType('non-veg')}
            >

              <span className="emoji">🍗</span>
              <span className="non-veg label">Non-Veg</span>
            </div>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button className="admin-btn" onClick={() => window.location.href = '/admin'}>
            Go to Admin Panel
          </button>
        </div>

        <div className="recent-submissions">
          <div className="recent-header-with-filter">
            <h3>
              📋 Past Submissions
            </h3>

            <div className="filter-dropdown">
              <select
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value as any)}
                aria-label="Filter submissions by date range"
              >
                <option value="7days">Past 7 Days</option>
                <option value="month">Past Month</option>
                <option value="date">Specific Date</option>
              </select>

              {filterRange === 'date' && (
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  aria-label="Select specific date"
                  className="date-picker"
                  max={new Date().toISOString().split('T')[0]}
                />
              )}
            </div>
          </div>

          <div className="filter-buttons">
            <button onClick={() => setFilteredMeal('all')} className={filteredMeal === 'all' ? 'active' : ''}>All</button>
            <button onClick={() => setFilteredMeal('veg')} className={filteredMeal === 'veg' ? 'active' : ''}>Veg</button>
            <button onClick={() => setFilteredMeal('non-veg')} className={filteredMeal === 'non-veg' ? 'active' : ''}>Non-Veg</button>
          </div>
          <div className="submission-count">Total: {recentSubmissions.length}</div>
          <div className="submission-list">
            {recentSubmissions.length === 0 ? (
              <p className="no-submission">No submissions found.</p>
            ) : (
              <ul>
                {recentSubmissions.map((submission, idx) => (
                  <li key={idx} className={`submission-card ${submission.meal_type}`}>
                    <div className="submission-top">
                      <span className="meal-icon">{submission.meal_type === 'veg' ? '🌱' : '🍗'}</span>
                      <span className="submission-name">{submission.name}</span>
                    </div>
                    <div className="submission-date">
                      {new Date(submission.created_date).toLocaleDateString('en-IN')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
