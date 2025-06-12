import React, { useState, useEffect } from 'react';
import './userPanel.css';
import { supabase } from '../lib/supabaseClient';
import logo from '../assets/hyprbots_systems_logo.jpeg';

interface Submission {
  id: string;
  name: string;
  meal_type: 'veg' | 'non-veg';
  email: string;
  created_date: string; // YYYY-MM-DD format
}

const UserPanel: React.FC = () => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<'veg' | 'non-veg' | ''>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [filteredMeal, setFilteredMeal] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [filterRange, setFilterRange] = useState<'7days' | 'month' | 'date'>('7days');
  const [filterDate, setFilterDate] = useState('');
  const [editSubmissionId, setEditSubmissionId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMealType, setEditMealType] = useState<'veg' | 'non-veg'>('veg');

  // Fetch current user email on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error('Error fetching user:', error.message);
      else setUserEmail(user?.email ?? null);
    };
    fetchUser();
  }, []);

  // Fetch submissions with filtering
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
      fromDate = filterDate || today.toISOString().split('T')[0];
    } else {
      fromDate = today.toISOString().split('T')[0];
    }

    let query = supabase
      .from('meal_preferences')
      .select('id, name, meal_type, email, created_date')
      .eq('email', userEmail)
      .order('created_date', { ascending: false });

    if (filterRange === 'date' && filterDate) {
      query = query.eq('created_date', filterDate);
    } else {
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

  useEffect(() => {
    fetchRecentSubmissions();
  }, [userEmail, filteredMeal, filterRange, filterDate]);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Submit new preference
  const handleSubmit = async () => {
    // IST time calculation
    const now = new Date();
    const istOffset = 5.5 * 60;
    const localOffset = now.getTimezoneOffset();
    const istTime = new Date(now.getTime() + (istOffset + localOffset) * 60000);
    const istHours = istTime.getHours();
    const istMinutes = istTime.getMinutes();

    if (istHours > 16 || (istHours === 16 && istMinutes >= 30)) {
      alert('Submissions are closed for today. Please try again after 12:00 AM IST.');
      return;
    }

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

  // Helper function for current IST date and hour
  const getCurrentISTDateAndHour = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000; // 5 hours 30 minutes in ms
    const istTime = new Date(utc + istOffset);

    const istDateStr = istTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const istHour = istTime.getHours();
    return { istDateStr, istHour };
  };

  // Start editing a submission
  const startEdit = (submission: Submission) => {
    setEditSubmissionId(submission.id);
    setEditName(submission.name);
    setEditMealType(submission.meal_type);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditSubmissionId(null);
    setEditName('');
    setEditMealType('veg');
  };

  // Save edits
  const saveEdit = async () => {
    if (!editName.trim() || !editMealType) {
      alert('Please enter a valid name and select meal type.');
      return;
    }
    if (!editSubmissionId) return;

    setLoading(true);
    const { error } = await supabase
      .from('meal_preferences')
      .update({ name: editName.trim(), meal_type: editMealType })
      .eq('id', editSubmissionId);

    setLoading(false);

    if (error) {
      alert('Error updating submission: ' + error.message);
    } else {
      alert('Submission updated successfully!');
      cancelEdit();
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
          <button className="logout-btn" onClick={handleLogout}>
            ↩ Logout
          </button>
        </div>
      </div>

      <div className="main-section">
        <div className="form-container">
          <h2 className="title">🍽️ Daily Meal Preference</h2>
          <p className="card-subtext">
            {`Select your food preference for ${new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'Asia/Kolkata',
            })}`}
            , before 4:30 PM.
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
              <span className="label">Non-Veg</span>
            </div>
          </div>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button className="admin-btn" onClick={() => (window.location.href = '/admin')}>
            Go to Admin Panel
          </button>
        </div>

        <div className="recent-submissions">
          <div className="recent-header-with-filter">
            <h3>📋 Past Submissions</h3>
            <div className="filter-dropdown">
              <select value={filterRange} onChange={(e) => setFilterRange(e.target.value as any)}>
                <option value="7days">Past 7 Days</option>
                <option value="month">Past Month</option>
                <option value="date">Specific Date</option>
              </select>
              {filterRange === 'date' && (
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="date-picker"
                  max={new Date().toISOString().split('T')[0]}
                />
              )}
            </div>
          </div>

          <div className="filter-buttons">
            <button onClick={() => setFilteredMeal('all')} className={filteredMeal === 'all' ? 'active' : ''}>
              All
            </button>
            <button onClick={() => setFilteredMeal('veg')} className={filteredMeal === 'veg' ? 'active' : ''}>
              Veg
            </button>
            <button onClick={() => setFilteredMeal('non-veg')} className={filteredMeal === 'non-veg' ? 'active' : ''}>
              Non-Veg
            </button>
          </div>

          <div className="submission-count">Total: {recentSubmissions.length}</div>

          <div className="submission-list">
            {recentSubmissions.length === 0 ? (
              <p className="no-submission">No submissions found.</p>
            ) : (
              <ul>
                {recentSubmissions.map((submission) => {
                  const { istDateStr, istHour } = getCurrentISTDateAndHour();
                  const isTodaySubmission = submission.created_date === istDateStr;
                  const canEdit = isTodaySubmission && istHour >= 0 && istHour < 16;

                  const isEditing = editSubmissionId === submission.id;

                  return (
                    <li key={submission.id} className={`submission-card ${submission.meal_type}`}>
                      <div className="submission-top">
                        <span className="meal-icon">{submission.meal_type === 'veg' ? '🌱' : '🍗'}</span>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="edit-input-name"
                            />
                            <select
                              value={editMealType}
                              onChange={(e) => setEditMealType(e.target.value as 'veg' | 'non-veg')}
                              className="edit-select-meal"
                            >
                              <option value="veg">Veg</option>
                              <option value="non-veg">Non-Veg</option>
                            </select>
                            <button onClick={saveEdit} disabled={loading} className="save-btn">
                              Save
                            </button>
                            <button onClick={cancelEdit} disabled={loading} className="cancel-btn">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="submission-name">{submission.name}</span>
                            {canEdit && (
                              <button
                                className="edit-btn"
                                onClick={() => startEdit(submission)}
                                title="Edit Submission"
                              >
                                ✏️ Edit
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="submission-date">
                        {new Date(submission.created_date).toLocaleDateString('en-IN')}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
