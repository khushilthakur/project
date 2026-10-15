import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Mic,
  Kanban,
  BarChart3,
  Compass,
  Bell,
  User,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

export function Sidebar({ isOpen, onClose }) {
  const { profile, signOut, isAdmin, isSupabaseConfigured } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'AI Resume Builder', path: '/app/resumes', icon: FileText },
    { label: 'Job Discovery', path: '/app/jobs', icon: Briefcase },
    { label: 'JD & Skill Matcher', path: '/app/job-matcher', icon: Target },
    { label: 'AI Interview Coach', path: '/app/interviews', icon: Mic },
    { label: 'Application Tracker', path: '/app/applications', icon: Kanban },
    { label: 'Career Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Learning Roadmaps', path: '/app/roadmaps', icon: Compass },
    { label: 'Reminders & Alerts', path: '/app/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile & Settings', path: '/app/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/app/admin', icon: ShieldAlert, isAdmin: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
          className="mobile-sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform var(--transition-normal)',
        }}
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 8px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Career<span style={{ color: 'var(--primary)' }}>Pilot</span>
              </span>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                AI Career Assistant
              </div>
            </div>
          </div>
        </div>

        {/* Database Mode Banner in Sidebar */}
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <div
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: isSupabaseConfigured ? 'var(--success-bg)' : 'var(--warning-bg)',
              color: isSupabaseConfigured ? 'var(--success-text)' : 'var(--warning-text)',
              border: `1px solid ${isSupabaseConfigured ? 'var(--success-border)' : 'var(--warning-border)'}`,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isSupabaseConfigured ? 'var(--success)' : 'var(--warning)',
              }}
            />
            {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Storage Mode'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <Badge variant="primary">{item.badge}</Badge>
                )}
                {item.isAdmin && (
                  <Badge variant="warning">Admin</Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile & Sign Out */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
              alt={profile?.full_name || 'User'}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {profile?.full_name || 'Candidate'}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {profile?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sign Out"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        .sidebar-link:hover {
          background-color: var(--bg-surface-hover);
          color: var(--text-primary);
        }
        .sidebar-link-active {
          background-color: var(--primary-light) !important;
          color: var(--primary) !important;
          font-weight: 700 !important;
        }
        @media (max-width: 1024px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
