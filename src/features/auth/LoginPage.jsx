import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setLocalError(error.message || 'Failed to sign in. Please check your credentials.');
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleAdminSignIn = async () => {
    setEmail('khushilthakur28@gmail.com');
    setPassword('280106');
    setLoading(true);
    const { error } = await signIn('khushilthakur28@gmail.com', '280106');
    setLoading(false);
    if (!error) {
      navigate('/app/dashboard', { replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Compass size={26} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Career<span style={{ color: 'var(--primary)' }}>Pilot</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1.25rem', color: 'var(--text-primary)' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sign in to manage your career path & applications
          </p>
        </div>

        {/* Admin Fast Access Card */}
        <div
          style={{
            padding: '0.875rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            ⚡ VERIFIED ADMINISTRATOR ACCESS
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdminSignIn}
            disabled={loading}
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            Sign In as Admin (khushilthakur28@gmail.com)
          </Button>
        </div>

        {localError && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '1.25rem',
              marginTop: '-0.5rem',
            }}
          >
            <Link
              to="/forgot-password"
              style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={ArrowRight}
            style={{ width: '100%', marginBottom: '1.25rem' }}
          >
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
