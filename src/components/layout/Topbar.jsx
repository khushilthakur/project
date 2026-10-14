import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  CheckCheck,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from '../common/Badge';

export function Topbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/dashboard')) return 'Career Dashboard';
    if (pathname.includes('/resumes/editor')) return 'AI Resume Editor';
    if (pathname.includes('/resumes')) return 'Resume Builder';
    if (pathname.includes('/jobs')) return 'Job & Internship Discovery';
    if (pathname.includes('/job-matcher')) return 'Job Description & Skill Matcher';
    if (pathname.includes('/interviews')) return 'AI Mock Interview Coach';
    if (pathname.includes('/applications')) return 'Job Application Tracker';
    if (pathname.includes('/analytics')) return 'Career Analytics & Metrics';
    if (pathname.includes('/roadmaps')) return 'Skill Development Roadmaps';
    if (pathname.includes('/notifications')) return 'Reminders & Notifications';
    if (pathname.includes('/profile')) return 'Career Profile & Preferences';
    if (pathname.includes('/admin')) return 'Admin Operational Dashboard';
    return 'CareerPilot';
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="topbar-mobile-btn"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Quick action: AI Coach button */}
        <button
          onClick={() => navigate('/app/interviews')}
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: '1px solid rgba(79, 70, 229, 0.2)',
          }}
          className="quick-coach-btn"
        >
          <Sparkles size={14} />
          Practice Interview
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
          }}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell with Dropdown Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              position: 'relative',
            }}
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px var(--bg-secondary)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
                overflow: 'hidden',
                animation: 'scaleUp 150ms ease-out',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && <Badge variant="primary">{unreadCount} new</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {!n.is_read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              title="Mark read"
                              style={{ color: 'var(--primary)', padding: '0.2rem' }}
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            title="Delete"
                            style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      {n.link && (
                        <button
                          onClick={() => {
                            setShowNotifMenu(false);
                            navigate(n.link);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            marginTop: '0.25rem',
                          }}
                        >
                          View Details <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '0.625rem 1rem',
                  borderTop: '1px solid var(--border-light)',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    navigate('/app/notifications');
                  }}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  View all reminders & history →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <button
          onClick={() => navigate('/app/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem',
            borderRadius: 'var(--radius-full)',
          }}
          aria-label="Go to profile"
        >
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
            alt={profile?.full_name || 'Profile'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary)',
            }}
          />
        </button>
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .topbar-mobile-btn { display: none !important; }
        }
        @media (min-width: 640px) {
          .quick-coach-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
