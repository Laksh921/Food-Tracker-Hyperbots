import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (loginError) {
      setError(loginError.message);
    } else {
      if (ADMIN_EMAILS.includes(trimmedEmail)) {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {/* ✅ Missing Login Button added here */}
      <button type="button" onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account?{' '}
        <span className="link-text" onClick={() => navigate('/signup')}>
          Sign up here
        </span>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default LoginPage;
