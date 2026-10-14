import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="app-main-wrapper"
      >
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            maxWidth: '1360px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .app-main-wrapper {
            margin-left: var(--sidebar-width);
          }
        }
      `}</style>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-light)',
        padding: '3rem 1.5rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Career<span style={{ color: 'var(--primary)' }}>Pilot</span>
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '280px' }}>
            The AI-powered career assistant built for students, freshers, and job seekers to navigate their path into tech.
          </p>
        </div>

        <div>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Core Features
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <li><a href="#features" style={{ color: 'var(--text-secondary)' }}>ATS Resume Builder</a></li>
            <li><a href="#tools" style={{ color: 'var(--text-secondary)' }}>AI Mock Interview Coach</a></li>
            <li><a href="#features" style={{ color: 'var(--text-secondary)' }}>JD & Skill Gap Matcher</a></li>
            <li><a href="#features" style={{ color: 'var(--text-secondary)' }}>Job Application Tracker</a></li>
          </ul>
        </div>

        <div>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security & Tech
          </h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <li>PostgreSQL & Supabase RLS</li>
            <li>Zero Data Scraping Guarantee</li>
            <li>Edge Function Server Isolation</li>
            <li>Client-Side Privacy Controls</li>
          </ul>
        </div>

        <div>
          <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Transparency
          </h5>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            CareerPilot calculates skill match scores based on transparent normalized term overlap. AI interview evaluations provide structured guidance and never claim predictive hiring authority.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          © 2026 CareerPilot: AI Career Assistant. Portfolio Software Engineering Project.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>React 19 + Vite</span>
          <span>Supabase PostgreSQL</span>
          <span>Vitest Verified</span>
        </div>
      </div>
    </footer>
  );
}
