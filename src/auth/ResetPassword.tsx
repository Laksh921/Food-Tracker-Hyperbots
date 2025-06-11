// pages/ResetPassword.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    setMessage('');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://food-tracker-hyperbots-nieq.vercel.app/update-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent. Check your inbox.');
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleReset}>Send Reset Link</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <p className="nav-text">
        Remember your password?{' '}
        <span className="link-text" onClick={() => navigate('/login')}>
          Login
        </span>
      </p>
    </div>
  );
};

export default ResetPassword;
