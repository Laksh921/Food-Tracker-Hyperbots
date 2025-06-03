import React, { useState, useEffect } from 'react';
import './userPanel.css';
import { supabase } from '../lib/supabaseClient';

const UserPanel: React.FC = () => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUserEmail(user?.email ?? null);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !mealType) {
      alert('Please enter your name and select a meal type.');
      return;
    }

    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('meal_preferences')
      .insert([
        {
          name: name.trim(),
          meal_type: mealType,
          email: userEmail,
        }
      ]);

    setLoading(false);

    if (error) {
      console.error('Insert error:', error);
      alert('Error submitting data: ' + error.message);
    } else {
      alert(`Submitted:\nName: ${name.trim()}\nMeal: ${mealType}`);
      setName('');
      setMealType('');
    }
  };

  return (
    <div className="user-panel">
      <div className="form-container">
        <h2 className="title">🍽️ Daily Meal Preference</h2>

        <input
          className="input-field"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="meal-options">
          <label className="radio-option">
            <input
              type="radio"
              value="veg"
              checked={mealType === 'veg'}
              onChange={() => setMealType('veg')}
            />
            Veg 🌱
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="non-veg"
              checked={mealType === 'non-veg'}
              onChange={() => setMealType('non-veg')}
            />
            Non-Veg 🍗
          </label>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button
          className="admin-btn"
          onClick={() => window.location.href = '/admin'}
        >
          Go to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default UserPanel;
