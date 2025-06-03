import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    setError('');

    const { error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signupError) {
      setError(signupError.message);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      setError('Signup successful but no active session found.');
      return;
    }

    navigate('/user');
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
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
      <button type="button" onClick={handleSignup}>Sign Up</button>

      <p>
        Already have an account?{' '}
        <span className="link-text" onClick={() => navigate('/login')}>
          Login here
        </span>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SignupPage;
