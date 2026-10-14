import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Cpu,
  History,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { Card, Badge, Skeleton, EmptyState } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export function AdminDashboardPage() {
  const { user, profile, isAdmin } = useAuth();

  const [stats, setStats] = useState(null);
  const [reportedJobs, setReportedJobs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAdminData() {
      if (!isAdmin) return;
      try {
        setLoading(true);
        const [statData, reported, logs] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getReportedJobs(),
          adminService.getAuditLogs(),
        ]);
        if (mounted) {
          setStats(statData);
          setReportedJobs(reported);
          setAuditLogs(logs);
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAdminData();
    return () => { mounted = false; };
  }, [isAdmin]);

  const handleDismissReport = async (jobId) => {
    await adminService.dismissReport(jobId, user?.id);
    setReportedJobs(reportedJobs.filter((j) => j.id !== jobId));
  };

  const handleRemoveJob = async (jobId) => {
    await adminService.removeJob(jobId, user?.id);
    setReportedJobs(reportedJobs.filter((j) => j.id !== jobId));
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <Lock size={32} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Restricted Administrative Route
        </h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
          Access to this management interface is strictly restricted to trusted database-backed administrators. Your current account profile ({profile?.email}) does not possess elevated permissions.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
        <Skeleton height="350px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={28} style={{ color: 'var(--warning)' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Admin Operational Dashboard
          </h2>
        </div>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Secure, role-based platform telemetry, job listing moderation, and operational audit logs.
        </p>
      </div>

      {/* Platform Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Users</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {stats?.totalUsers || 1}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
            Database-backed profiles
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Job Listings</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {stats?.totalJobs || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Verified & Community entries
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tracked Applications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
            {stats?.totalApplications || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Protected by RLS isolation
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>System Health</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-text)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={18} /> Operational
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {stats?.databaseStatus}
          </div>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card
        title="Job Moderation Queue"
        subtitle="Reported or flagged listings requiring administrator review"
      >
        {reportedJobs.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Moderation queue is clean!</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>No listings currently reported by users.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reportedJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--danger-text)' }}>
                    {job.title} — {job.company}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Reason: {job.report_reason || 'Flagged for review'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDismissReport(job.id)}
                  >
                    Dismiss Report (Keep Listing)
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveJob(job.id)}
                  >
                    Remove Listing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit Log Stream */}
      <Card
        title="Administrative Audit Logs"
        subtitle="Chronological security record of privileged operations"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  [{log.action}]
                </span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>
                  Target: {log.target_type} ({log.target_id || 'System'})
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
