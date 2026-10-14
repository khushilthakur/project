import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Target,
  Mic,
  PlusCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { resumeService } from '../../services/resumeService';
import { interviewService } from '../../services/interviewService';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton, EmptyState } from '../../components/common/Badge';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    byStatus: {},
    interviewCount: 0,
    offerCount: 0,
    interviewRate: 0,
    offerRate: 0,
    followUpsNeeded: [],
  });

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [apps, savedIds, allResumes, allInterviews] = await Promise.all([
          applicationService.getApplications(user.id),
          jobService.getSavedJobIds(user.id),
          resumeService.getResumes(user.id),
          interviewService.getSessions(user.id),
        ]);

        if (mounted) {
          setApplications(apps);
          setSavedJobs(savedIds);
          setResumes(allResumes);
          setInterviews(allInterviews);
          setMetrics(applicationService.calculateMetrics(apps));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Calculate resume completion percentage
  const defaultResume = resumes.find((r) => r.is_default) || resumes[0];
  const calculateResumeCompletion = (res) => {
    if (!res) return 0;
    let score = 0;
    if (res.personal_info?.fullName && res.personal_info?.email) score += 20;
    if (res.personal_info?.summary) score += 15;
    if (res.education && res.education.length > 0) score += 20;
    if (res.experience && res.experience.length > 0) score += 20;
    if (res.projects && res.projects.length > 0) score += 15;
    if (res.skills?.technical && res.skills.technical.length > 0) score += 10;
    return Math.min(score, 100);
  };
  const resumeCompletion = calculateResumeCompletion(defaultResume);

  // Status chart dataset
  const chartData = [
    { name: 'Saved', count: metrics.byStatus.Saved || 0, color: '#94A3B8' },
    { name: 'Applied', count: metrics.byStatus.Applied || 0, color: '#3B82F6' },
    { name: 'Assessment', count: metrics.byStatus.Assessment || 0, color: '#8B5CF6' },
    { name: 'Interview', count: metrics.byStatus.Interview || 0, color: '#F59E0B' },
    { name: 'Offer', count: metrics.byStatus.Offer || 0, color: '#10B981' },
    { name: 'Rejected', count: metrics.byStatus.Rejected || 0, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
        <Skeleton height="350px" />
      </div>
    );
  }

  const isBrandNewUser = applications.length === 0 && resumes.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '0.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Candidate'} 👋
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {metrics.total > 0
              ? `You have ${metrics.total} tracked application${metrics.total > 1 ? 's' : ''} and ${metrics.interviewCount} scheduled interview${metrics.interviewCount !== 1 ? 's' : ''}.`
              : 'Begin your career journey by creating your resume or exploring open roles.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            icon={Target}
            onClick={() => navigate('/app/job-matcher')}
          >
            Match Job Description
          </Button>
          <Button
            variant="outline"
            icon={Mic}
            onClick={() => navigate('/app/interviews')}
          >
            Mock Interview
          </Button>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/app/applications')}
          >
            Add Application
          </Button>
        </div>
      </div>

      {/* New User Onboarding Banner if empty records */}
      {isBrandNewUser && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
              🚀 Welcome to CareerPilot! Let's get you job-ready
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Step 1: Build your professional resume or load the curated starter profile.
            </p>
          </div>
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => navigate('/app/resumes')}
          >
            Build First Resume
          </Button>
        </div>
      )}

      {/* Primary Metrics Grid (100% Calculated from user's records) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Applications
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {savedJobs.length} saved opportunit{savedJobs.length === 1 ? 'y' : 'ies'}
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Interviews Scheduled
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {metrics.interviewCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {metrics.interviewRate}% interview conversion
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Offers Received
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {metrics.offerCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {metrics.offerRate}% offer conversion
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Follow-ups Due
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {metrics.followUpsNeeded.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Requiring action within 3 days
          </div>
        </Card>
      </div>

      {/* Middle Grid: Application Pipeline Chart & Resume Strength */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Real Status Distribution Chart */}
        <Card title="Application Pipeline Distribution" subtitle="Real-time counts across your hiring stages">
          {metrics.total === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No applications tracked yet"
              description="Add your first job application or link one from Job Discovery to visualize your funnel."
              actionLabel="Add Application"
              onAction={() => navigate('/app/applications')}
            />
          ) : (
            <div style={{ width: '100%', height: '240px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Resume Strength & Quick Preparation Progress */}
        <Card title="Career Preparation Health" subtitle="Profile readiness and interview simulation status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {/* Resume Completion */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Resume Completeness</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{resumeCompletion}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${resumeCompletion}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary) 0%, #8B5CF6 100%)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {defaultResume ? `Active: "${defaultResume.title}" (${defaultResume.template} template)` : 'No resume created yet.'}
              </p>
            </div>

            {/* Mock Interview Progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Mock Interviews</span>
                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>
                  {interviews.length} Session{interviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(interviews.length * 25, 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--warning)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {interviews.length > 0
                  ? `Last session completed with average score ${interviews[0].overall_score || 'N/A'}/100`
                  : 'Start a mock interview to test your technical & behavioral communication.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/resumes')}
                style={{ flex: 1 }}
              >
                Edit Resume
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/interviews')}
                style={{ flex: 1 }}
              >
                Practice Interview
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Recent Activity & Follow-up Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Applications List */}
        <Card
          title="Recent Applications"
          subtitle="Latest updates from your tracked opportunities"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/app/applications')}>
              View All
            </Button>
          }
        >
          {applications.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
              No applications recorded.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {app.role}
                    </h5>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {app.company} • {app.location || 'Remote'}
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.status === 'Offer'
                        ? 'success'
                        : app.status === 'Interview'
                        ? 'warning'
                        : app.status === 'Rejected'
                        ? 'danger'
                        : 'primary'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actionable Follow-ups & Reminders */}
        <Card
          title="Upcoming Actions & Reminders"
          subtitle="Deadlines and interview schedules"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/app/notifications')}>
              Manage
            </Button>
          }
        >
          {metrics.followUpsNeeded.length === 0 ? (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={28} style={{ color: 'var(--success)', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>All caught up!</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                No applications requiring immediate follow-up this week.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              {metrics.followUpsNeeded.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--warning-text)' }}>
                      Follow-up: {app.company}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Deadline: {app.follow_up_date} ({app.role})
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/app/applications')}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
