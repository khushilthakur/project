import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Calendar,
  Briefcase,
  HelpCircle,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { interviewService } from '../../services/interviewService';
import { Card, Skeleton } from '../../components/common/Badge';

export function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const [apps, saved, allInterviews] = await Promise.all([
          applicationService.getApplications(user.id),
          jobService.getSavedJobIds(user.id),
          interviewService.getSessions(user.id),
        ]);
        if (mounted) {
          setApplications(apps);
          setSavedJobs(saved);
          setInterviews(allInterviews);
        }
      } catch (err) {
        console.error('Error loading analytics data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  // Derived real metrics
  const totalApps = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const interviewCount = (statusCounts.Interview || 0) + (statusCounts.Offer || 0);
  const offerCount = statusCounts.Offer || 0;
  const activeApps = totalApps - (statusCounts.Saved || 0) - (statusCounts.Withdrawn || 0);

  const interviewRate = activeApps > 0 ? Math.round((interviewCount / activeApps) * 100) : 0;
  const offerRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;

  // Pie chart data: Status breakdown
  const pieColors = {
    Saved: '#94A3B8',
    Applied: '#3B82F6',
    Assessment: '#8B5CF6',
    Interview: '#F59E0B',
    Offer: '#10B981',
    Rejected: '#EF4444',
    Withdrawn: '#64748B',
  };

  const statusPieData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: pieColors[status] || '#6366F1',
  }));

  // Targeted roles frequency
  const roleCounts = applications.reduce((acc, app) => {
    const r = app.role || 'Unspecified Role';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const rolesBarData = Object.keys(roleCounts).map((role) => ({
    role: role.length > 18 ? role.slice(0, 18) + '...' : role,
    count: roleCounts[role],
  }));

  // Timeline: Applications by applied_date
  const timelineDataMap = applications.reduce((acc, app) => {
    const d = app.applied_date || 'Earlier';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const timelineData = Object.keys(timelineDataMap)
    .sort()
    .map((date) => ({
      date,
      applications: timelineDataMap[date],
    }));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </div>
        <Skeleton height="350px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Career Analytics & Conversion Funnel
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Real metrics calculated from your authenticated database records. No fabricated data.
        </p>
      </div>

      {/* Conversion Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Interview Rate
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {interviewRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ({interviewCount} interviews from {activeApps} submitted applications)
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Offer Conversion Rate
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {offerRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ({offerCount} offers from {interviewCount} interview rounds)
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Opportunity Conversion
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {savedJobs.length > 0 ? Math.round((totalApps / (totalApps + savedJobs.length)) * 100) : 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {totalApps} applied vs. {savedJobs.length} saved listings
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mock Rehearsals
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {interviews.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            AI interview practice sessions completed
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Status Breakdown Pie Chart */}
        <Card title="Status Pipeline Breakdown" subtitle="Distribution of candidates across pipeline stages">
          {totalApps === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No application records to chart yet.
            </div>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Targeted Roles Breakdown */}
        <Card title="Target Roles Frequency" subtitle="Most frequently pursued job roles in your pipeline">
          {rolesBarData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No role data available yet.
            </div>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rolesBarData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="role" tick={{ fontSize: 12, fill: 'var(--text-primary)' }} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Timeline Chart */}
      <Card title="Application Activity Timeline" subtitle="Submission cadence over time">
        {timelineData.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No dated application activity yet.
          </div>
        ) : (
          <div style={{ width: '100%', height: '220px', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#appColorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
