import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Mic,
  Target,
  Kanban,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/AppLayout';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: 'ATS Resume Builder & PDF Export',
      description: 'Create multi-template, recruiter-ready resumes. Use STAR bullet point optimization and download formatted, selectable PDF documents without broken layouts.',
      badge: 'Core Tool',
    },
    {
      icon: Mic,
      title: 'AI Mock Interview Coach',
      description: 'Practice role-specific Technical and HR interviews across Beginner to Advanced levels. Receive instant scoring, criteria feedback, and exemplary model answers.',
      badge: 'AI Powered',
    },
    {
      icon: Target,
      title: 'JD & Skill Gap Matcher',
      description: 'Paste any target job description to calculate transparent skill overlap percentages, pinpoint missing keywords, and receive step-by-step profile upgrade advice.',
      badge: 'Algorithmic',
    },
    {
      icon: Kanban,
      title: 'Application Tracker & Kanban',
      description: 'Manage opportunities across Saved, Applied, Assessment, Interview, Offer, and Rejected. Set interview dates, follow-up reminders, and status notes.',
      badge: 'Productivity',
    },
    {
      icon: Compass,
      title: 'Personalized Learning Roadmaps',
      description: 'Bridge identified skill gaps with structured milestone plans, task checklists, and verified learning resources for Frontend, Backend, Full Stack, and AI roles.',
      badge: 'Growth',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Career Analytics',
      description: 'Understand your application pipeline with responsive funnel charts, conversion rates, and role targeting metrics backed by your actual database records.',
      badge: 'Analytics',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Craft Your Master Resume',
      desc: 'Enter your education, projects, and skills. Choose from modern templates and generate ATS-compliant PDF exports.',
    },
    {
      step: '02',
      title: 'Analyze Target Opportunities',
      desc: 'Paste job postings into the Skill Matcher to measure alignment, extract key requirements, and bridge gaps.',
    },
    {
      step: '03',
      title: 'Simulate Realistic Interviews',
      desc: 'Rehearse technical concepts and behavioral questions with immediate constructive feedback and model answers.',
    },
    {
      step: '04',
      title: 'Track Pipeline to Offer',
      desc: 'Visualize your progress on the Kanban board, respond to follow-up alerts, and negotiate with data-backed confidence.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 1.5rem 6rem',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.05) 60%, transparent 80%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          {/* Eyebrow Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 1rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                color: 'var(--primary)',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              <Sparkles size={14} /> Built for Students, Freshers & Job Seekers
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              maxWidth: '960px',
              margin: '0 auto 1.5rem',
            }}
          >
            Navigate Your Tech Career Journey With An{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              All-In-One AI Assistant
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Create ATS-tailored resumes, practice technical interviews with real-time scoring, analyze job requirements, and manage your full application pipeline from one unified platform.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '3.5rem',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/register')}
              style={{ padding: '0.875rem 2rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)' }}
            >
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}
            >
              Explore Live Demo
            </Button>
          </div>

          {/* Highlights Banner */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Real Supabase PostgreSQL Database</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Pixel-Perfect PDF Resume Generation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Zero Fake Simulation Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        id="features"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Comprehensive Platform
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              Everything You Need to Get Hired
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.75rem auto 0' }}>
              Engineered to replace fragmented spreadsheets, disconnected resume builders, and guesswork with a rigorous preparation workflow.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="card card-interactive"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <Badge variant="primary">{feat.badge}</Badge>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section
        id="workflow"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Structured Process
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              Your 4-Stage Preparation Pipeline
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {workflowSteps.map((ws, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    opacity: 0.8,
                    marginBottom: '1rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {ws.step}
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {ws.title}
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-light)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '3.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Ready to Accelerate Your Career Search?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            Join students and early-career developers organizing their applications and mastering technical interviews with CareerPilot.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
