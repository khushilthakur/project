import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENT_ACCOUNT } from '../../context/authConstants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const [roleMode, setRoleMode] = useState('candidate'); // 'candidate' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleRoleSelect = (role) => {
    setRoleMode(role);
    setLocalError('');
    if (role === 'admin') {
      setEmail('khushilthakur28@gmail.com');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleFillDemoStudent = () => {
    setRoleMode('candidate');
    setEmail(DEMO_STUDENT_ACCOUNT.email);
    setPassword(DEMO_STUDENT_ACCOUNT.password);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setLocalError(error.message || 'Failed to sign in. Please verify your credentials.');
    } else {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'khushilthakur28@gmail.com') {
        navigate(from || '/app/admin', { replace: true });
      } else {
        navigate(from || '/app/dashboard', { replace: true });
      }
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
          maxWidth: '460px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            Sign in with verified credentials to access your account
          </p>
        </div>

        {/* Role Mode Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            padding: '0.25rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-light)',
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect('candidate')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: roleMode === 'candidate' ? 'var(--bg-surface)' : 'transparent',
              color: roleMode === 'candidate' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: roleMode === 'candidate' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <User size={15} /> Candidate / Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            style={{
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: roleMode === 'admin' ? 'var(--bg-surface)' : 'transparent',
              color: roleMode === 'admin' ? '#D97706' : 'var(--text-secondary)',
              boxShadow: roleMode === 'admin' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ShieldAlert size={15} /> Administrator
          </button>
        </div>

        {/* Informational banner based on role */}
        {roleMode === 'admin' ? (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#D97706', marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} /> Restricted Administrator Verification
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              Authorized Admin ID: <strong style={{ color: 'var(--text-primary)' }}>khushilthakur28@gmail.com</strong>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Enter the designated 6-digit administrator password to unlock platform governance.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '0.6rem 0.875rem',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              Looking to try student features?
            </span>
            <button
              type="button"
              onClick={handleFillDemoStudent}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Fill Demo Candidate
            </button>
          </div>
        )}

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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label={roleMode === 'admin' ? 'Administrator ID (Email)' : 'Candidate Email Address'}
            name="email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={roleMode === 'admin' ? 'khushilthakur28@gmail.com' : 'name@example.com'}
            required
            autoComplete="username"
          />

          <Input
            label={roleMode === 'admin' ? 'Administrator Password' : 'Password'}
            name="password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={roleMode === 'admin' ? 'Enter 6-digit admin pass' : '••••••••'}
            required
            autoComplete="current-password"
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
            {roleMode === 'admin' ? 'Verify & Access Admin Console' : 'Sign In'}
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
