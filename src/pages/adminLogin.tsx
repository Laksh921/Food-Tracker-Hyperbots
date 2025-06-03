import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './adminLogin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    // Sign in with Supabase auth
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('Invalid email or password.');
      return;
    }

    // Validate admin access key
    const { data, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.trim())
      .eq('access_key', accessKey.trim())
      .single();

    if (adminError || !data) {
      setError('Access denied: invalid admin credentials or key.');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h2>🔐 Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Admin Access Key"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
        />
        <button onClick={handleLogin}>Login as Admin</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
