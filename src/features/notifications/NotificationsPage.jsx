import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  Plus,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge, EmptyState } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, addNotification } = useNotifications();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customReminder, setCustomReminder] = useState({
    title: '',
    message: '',
    type: 'follow_up',
    link: '/app/applications',
    due_date: '',
  });

  const filtered = notifications.filter((n) => {
    if (filterType === 'Unread') return !n.is_read;
    if (filterType !== 'All') return n.type === filterType;
    return true;
  });

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!customReminder.title || !customReminder.message) return;
    await addNotification(customReminder);
    setShowAddModal(false);
    setCustomReminder({
      title: '',
      message: '',
      type: 'follow_up',
      link: '/app/applications',
      due_date: '',
    });
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'interview_reminder':
        return <Badge variant="warning">Interview Reminder</Badge>;
      case 'follow_up':
        return <Badge variant="primary">Follow-up</Badge>;
      case 'job_alert':
        return <Badge variant="info">Opportunity Alert</Badge>;
      case 'achievement':
        return <Badge variant="success">Milestone</Badge>;
      default:
        return <Badge variant="secondary">System Notice</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Reminders & In-App Notifications
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage upcoming interview alerts, follow-up deadlines, and career milestones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Custom Reminder
          </Button>
        </div>
      </div>

      {/* Infrastructure Notice */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          color: 'var(--info-text)',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Info size={16} />
        <span>
          <strong>In-App Delivery Active:</strong> Reminders persist in your authenticated database and trigger whenever you log in. External email or push delivery requires third-party SMS/SMTP gateway configuration.
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['All', 'Unread', 'interview_reminder', 'follow_up', 'system'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: filterType === type ? 'var(--primary-light)' : 'var(--bg-tertiary)',
              color: filterType === type ? 'var(--primary)' : 'var(--text-secondary)',
              border: filterType === type ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid var(--border-light)',
            }}
          >
            {type === 'interview_reminder' ? 'Interviews' : type === 'follow_up' ? 'Follow-ups' : type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this view"
          description="You are all caught up on scheduled follow-ups and interview reminders."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map((n) => (
            <Card
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                backgroundColor: n.is_read ? 'var(--bg-card)' : 'var(--primary-light)',
                borderLeft: !n.is_read ? '4px solid var(--primary)' : undefined,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  {getTypeBadge(n.type)}
                  {!n.is_read && <Badge variant="warning">New</Badge>}
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Created: {new Date(n.created_at).toLocaleDateString()}</span>
                  {n.due_date && (
                    <span style={{ color: 'var(--warning-text)', fontWeight: 600 }}>
                      Due / Scheduled: {new Date(n.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {n.link && (
                    <button
                      onClick={() => navigate(n.link)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--primary)',
                        fontWeight: 600,
                      }}
                    >
                      Open Target <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action controls */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    style={{ padding: '0.4rem', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}
                    title="Mark as read"
                  >
                    <CheckCheck size={18} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  style={{ padding: '0.4rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}
                  title="Delete reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Custom Reminder Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add In-App Reminder"
        subtitle="Set a personal follow-up deadline or interview checkpoint"
        maxWidth="480px"
      >
        <form onSubmit={handleCreateReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Reminder Title"
            value={customReminder.title}
            onChange={(e) => setCustomReminder({ ...customReminder, title: e.target.value })}
            placeholder="e.g. Email hiring manager for status update"
            required
          />

          <Select
            label="Category"
            value={customReminder.type}
            onChange={(e) => setCustomReminder({ ...customReminder, type: e.target.value })}
            options={[
              { label: 'Follow-up Deadline', value: 'follow_up' },
              { label: 'Interview Reminder', value: 'interview_reminder' },
              { label: 'General Task', value: 'system' },
            ]}
          />

          <Input
            label="Due Date (Optional)"
            type="date"
            value={customReminder.due_date}
            onChange={(e) => setCustomReminder({ ...customReminder, due_date: e.target.value })}
          />

          <Textarea
            label="Message & Context"
            rows={3}
            value={customReminder.message}
            onChange={(e) => setCustomReminder({ ...customReminder, message: e.target.value })}
            placeholder="Add specific details or talking points..."
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
