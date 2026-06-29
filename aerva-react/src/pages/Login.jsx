import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconUser } from '../components/icons.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      // For demo: accept any email/password
      console.log('Demo mode: accepting credentials');
      localStorage.setItem('auth-token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }));
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="#0A2E50"/>
              <path d="M20 8v24M8 20h24" stroke="#EFBE1D" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-name">AERVA</div>
            <div className="brand-sub">Air Intelligence</div>
          </div>
        </div>

        <div className="login-card card">
          <div className="login-header">
            <h1 className="display-2">Welcome back</h1>
            <p className="login-subtitle">Sign in to monitor your air quality</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-demo-note">
              Demo mode: Use any email and password
            </p>
          </div>
        </div>

        <div className="login-bottom">
          <p className="mono" style={{ fontSize: '11px', color: 'var(--text-3)' }}>
            © 2024 AERVA · Breathe better, at home
          </p>
        </div>
      </div>
    </div>
  );
}
