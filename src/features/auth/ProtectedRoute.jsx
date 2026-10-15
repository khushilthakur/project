import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/common/Badge';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center', width: '300px' }}>
          <Skeleton height="32px" style={{ marginBottom: '1rem' }} />
          <Skeleton height="16px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton height="16px" width="80%" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
