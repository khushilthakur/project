import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  History,
  CheckCircle2,
  AlertTriangle,
  MoveRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton, EmptyState } from '../../components/common/Badge';
import { Modal, ConfirmDialog } from '../../components/common/Modal';

const STATUS_COLUMNS = [
  { id: 'Saved', label: 'Saved', color: '#94A3B8' },
  { id: 'Applied', label: 'Applied', color: '#3B82F6' },
  { id: 'Assessment', label: 'Assessment', color: '#8B5CF6' },
  { id: 'Interview', label: 'Interview', color: '#F59E0B' },
  { id: 'Offer', label: 'Offer 🎉', color: '#10B981' },
  { id: 'Rejected', label: 'Rejected', color: '#EF4444' },
  { id: 'Withdrawn', label: 'Withdrawn', color: '#64748B' },
];

export function ApplicationTrackerPage() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    job_url: '',
    salary: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    interview_date: '',
    follow_up_date: '',
    notes: '',
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const list = await applicationService.getApplications(user.id);
        if (mounted) setApplications(list);
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const filteredApps = applications.filter((app) => {
    if (filterStatus !== 'All' && app.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchComp = app.company?.toLowerCase().includes(q);
      const matchRole = app.role?.toLowerCase().includes(q);
      const matchLoc = app.location?.toLowerCase().includes(q);
      if (!matchComp && !matchRole && !matchLoc) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      job_url: '',
      salary: '',
      status: 'Applied',
      applied_date: new Date().toISOString().split('T')[0],
      interview_date: '',
      follow_up_date: '',
      notes: '',
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (app, e) => {
    if (e) e.stopPropagation();
    setEditingApp(app);
    setFormData({
      company: app.company || '',
      role: app.role || '',
      location: app.location || '',
      job_url: app.job_url || '',
      salary: app.salary || '',
      status: app.status || 'Applied',
      applied_date: app.applied_date || '',
      interview_date: app.interview_date ? app.interview_date.split('T')[0] : '',
      follow_up_date: app.follow_up_date || '',
      notes: app.notes || '',
    });
    setShowAddEditModal(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    try {
      if (editingApp) {
        const updated = await applicationService.updateApplication(editingApp.id, formData, user.id);
        setApplications(applications.map((a) => (a.id === editingApp.id ? updated : a)));
      } else {
        const created = await applicationService.addApplication(formData, user.id);
        setApplications([created, ...applications]);
      }
      setShowAddEditModal(false);
    } catch (err) {
      console.error('Failed to save application:', err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const updated = await applicationService.updateApplication(appId, { status: newStatus }, user.id);
      setApplications(applications.map((a) => (a.id === appId ? updated : a)));
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await applicationService.deleteApplication(deleteTarget.id);
      setApplications(applications.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <Skeleton height="500px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Job Application Tracker
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Monitor and manage your hiring pipeline across interactive Kanban and table views.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'kanban' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Kanban size={16} /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <TableIcon size={16} /> Table
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Add Application
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Input
            placeholder="Search company or role..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={['All', ...STATUS_COLUMNS.map((c) => c.id)]}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div
          style={{
            display: 'flex',
            gap: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '1.5rem',
            alignItems: 'flex-start',
          }}
        >
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  minWidth: '280px',
                  width: '280px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 260px)',
                  overflowY: 'auto',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--bg-secondary)',
                    zIndex: 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: col.color,
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {col.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colApps.length === 0 ? (
                    <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => setViewDetailsTarget(app)}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.875rem',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {app.role}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.2rem' }}>
                            <button
                              onClick={(e) => handleOpenEditModal(app, e)}
                              style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(app);
                              }}
                              style={{ color: 'var(--danger)', padding: '0.2rem' }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {app.company}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {app.location && <span>📍 {app.location}</span>}
                          {app.salary && <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>💵 {app.salary}</span>}
                          {app.interview_date && (
                            <span style={{ color: 'var(--warning-text)', fontWeight: 600 }}>
                              🗓️ Interview: {new Date(app.interview_date).toLocaleDateString()}
                            </span>
                          )}
                          {app.follow_up_date && <span>⏰ Follow-up: {app.follow_up_date}</span>}
                        </div>

                        {/* Move status selector inside card */}
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Move to:</span>
                          <select
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.4rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-light)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {STATUS_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Company & Role</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Location</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Applied Date</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Upcoming Interview</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Follow-up</th>
                  <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No applications found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{app.role}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.company}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
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
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                        {app.location || 'Remote'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {app.applied_date || '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {app.interview_date ? (
                          <span style={{ color: 'var(--warning-text)', fontWeight: 600 }}>
                            {new Date(app.interview_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {app.follow_up_date || '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => setViewDetailsTarget(app)}
                            style={{ color: 'var(--primary)', padding: '0.2rem' }}
                            title="View details & notes"
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={(e) => handleOpenEditModal(app, e)}
                            style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(app)}
                            style={{ color: 'var(--danger)', padding: '0.2rem' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Application Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={editingApp ? 'Edit Application' : 'Add New Application'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Company Name"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Google, Nexus Labs"
              required
            />
            <Input
              label="Role / Position"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Software Engineer Intern"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Application Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={STATUS_COLUMNS.map((c) => c.id)}
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Remote or Austin, TX"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Job URL (Optional)"
              type="url"
              value={formData.job_url}
              onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
              placeholder="https://company.com/jobs/..."
            />
            <Input
              label="Salary / Hourly Rate (Optional)"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g. $80,000 / yr or $40 / hr"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Applied Date"
              type="date"
              value={formData.applied_date}
              onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
            />
            <Input
              label="Interview Date"
              type="date"
              value={formData.interview_date}
              onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
            />
            <Input
              label="Follow-up Date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            />
          </div>

          <Textarea
            label="Notes & Interview Context"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Record recruiter communications, interview questions asked, or referral contacts..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowAddEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingApp ? 'Update Application' : 'Create Application'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details & Status History Modal */}
      <Modal
        isOpen={Boolean(viewDetailsTarget)}
        onClose={() => setViewDetailsTarget(null)}
        title={viewDetailsTarget?.role}
        subtitle={`${viewDetailsTarget?.company} • Status: ${viewDetailsTarget?.status}`}
        maxWidth="550px"
      >
        {viewDetailsTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Application Notes
              </h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                {viewDetailsTarget.notes || 'No specific notes recorded.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
              <div>
                <strong>Applied: </strong> {viewDetailsTarget.applied_date || 'N/A'}
              </div>
              <div>
                <strong>Location: </strong> {viewDetailsTarget.location || 'Remote'}
              </div>
              <div>
                <strong>Interview Date: </strong> {viewDetailsTarget.interview_date || 'None'}
              </div>
              <div>
                <strong>Follow-up Date: </strong> {viewDetailsTarget.follow_up_date || 'None'}
              </div>
            </div>

            {viewDetailsTarget.job_url && (
              <div>
                <a
                  href={viewDetailsTarget.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}
                >
                  Visit Job Posting <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message={`Delete your application record for ${deleteTarget?.role} at ${deleteTarget?.company}?`}
        confirmText="Delete"
      />
    </div>
  );
}
