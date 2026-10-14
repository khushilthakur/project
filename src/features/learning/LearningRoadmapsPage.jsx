import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  BookOpen,
  ExternalLink,
  Edit2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roadmapService } from '../../services/roadmapService';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton, EmptyState } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function LearningRoadmapsPage() {
  const { user, profile } = useAuth();

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTargetRole, setNewTargetRole] = useState('Full Stack Developer (React & Node)');
  const [newRoadmapTitle, setNewRoadmapTitle] = useState('');

  // Edit Item Details Modal
  const [editingItem, setEditingItem] = useState(null);
  const [itemNote, setItemNote] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const list = await roadmapService.getRoadmaps(user.id);
        if (mounted) {
          setRoadmaps(list);
          if (list.length > 0) setActiveRoadmap(list[0]);
        }
      } catch (err) {
        console.error('Error loading roadmaps:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const handleStatusToggle = async (itemId, currentStatus) => {
    if (!activeRoadmap) return;
    const nextStatus = currentStatus === 'Not Started'
      ? 'In Progress'
      : currentStatus === 'In Progress'
      ? 'Completed'
      : 'Not Started';

    const updated = await roadmapService.updateItemStatus(activeRoadmap.id, itemId, nextStatus);
    if (updated) {
      setActiveRoadmap(updated);
      setRoadmaps(roadmaps.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  const handleSaveItemNotes = async (e) => {
    e.preventDefault();
    if (!editingItem || !activeRoadmap) return;
    const updated = await roadmapService.updateItemDetails(activeRoadmap.id, editingItem.id, {
      personal_notes: itemNote,
    });
    if (updated) {
      setActiveRoadmap(updated);
      setRoadmaps(roadmaps.map((r) => (r.id === updated.id ? updated : r)));
      setEditingItem(null);
    }
  };

  const handleCreateNewRoadmap = async (e) => {
    e.preventDefault();
    if (!newTargetRole || !user) return;

    // Blueprint presets
    const presetItems = [
      {
        skill_name: 'Core System & Language Fundamentals',
        category: 'Core Concept',
        priority: 'High',
        milestone: 'Master language syntax, memory management, and asynchronous I/O execution.',
        resources: [
          { title: 'Official Documentation', url: 'https://developer.mozilla.org', type: 'Docs' }
        ]
      },
      {
        skill_name: 'Framework & Component Architecture',
        category: 'Tool / Framework',
        priority: 'High',
        milestone: 'Design reusable, performant component trees and predictable state flows.',
        resources: [
          { title: 'Architecture Patterns Guide', url: 'https://patterns.dev', type: 'Guide' }
        ]
      },
      {
        skill_name: 'Database Schema & Transaction Design',
        category: 'Core Concept',
        priority: 'Medium',
        milestone: 'Implement relational normalization, indexes, foreign keys, and RLS security.',
        resources: [
          { title: 'PostgreSQL Manual & Supabase Quickstart', url: 'https://supabase.com/docs', type: 'Docs' }
        ]
      },
      {
        skill_name: 'End-to-End Capstone Project Deployment',
        category: 'Hands-on Project',
        priority: 'High',
        milestone: 'Build and deploy a full-stack production application to Vercel/Cloud.',
        resources: [
          { title: 'Vercel Deployment Guide', url: 'https://vercel.com/docs', type: 'Guide' }
        ]
      }
    ];

    const created = await roadmapService.createRoadmap({
      targetRole: newTargetRole,
      title: newRoadmapTitle || `${newTargetRole} Preparation Roadmap`,
      items: presetItems,
      userId: user.id,
    });

    setRoadmaps([created, ...roadmaps]);
    setActiveRoadmap(created);
    setShowCreateModal(false);
  };

  // Calculate completed count
  const items = activeRoadmap?.items || [];
  const completedCount = items.filter((i) => i.status === 'Completed').length;
  const inProgressCount = items.filter((i) => i.status === 'In Progress').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <Skeleton height="350px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Skill Development & Learning Roadmaps
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Structured milestone roadmaps to bridge skill gaps and achieve job-readiness for your target role.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create New Roadmap
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No learning roadmaps created yet"
          description="Create a targeted preparation plan breaking down required competencies into clear milestones."
          actionLabel="Create Roadmap"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Roadmap Switcher Tabs */}
          {roadmaps.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {roadmaps.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoadmap(r)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    backgroundColor: activeRoadmap?.id === r.id ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                    color: activeRoadmap?.id === r.id ? 'var(--primary)' : 'var(--text-secondary)',
                    border: activeRoadmap?.id === r.id ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid var(--border-light)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.target_role}
                </button>
              ))}
            </div>
          )}

          {/* Active Roadmap Overview Header */}
          {activeRoadmap && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <Badge variant="primary">{activeRoadmap.target_role}</Badge>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                    {activeRoadmap.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {activeRoadmap.description}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {progressPercent}% Complete
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {completedCount} of {items.length} milestones completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary) 0%, #10B981 100%)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </Card>
          )}

          {/* Milestones Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, idx) => (
              <Card
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: `5px solid ${
                    item.status === 'Completed'
                      ? 'var(--success)'
                      : item.status === 'In Progress'
                      ? 'var(--warning)'
                      : 'var(--border-subtle)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleStatusToggle(item.id, item.status)}
                    style={{
                      marginTop: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        item.status === 'Completed'
                          ? 'var(--success)'
                          : item.status === 'In Progress'
                          ? 'var(--warning)'
                          : 'var(--text-muted)',
                    }}
                    title={`Status: ${item.status}. Click to cycle.`}
                  >
                    {item.status === 'Completed' ? (
                      <CheckCircle2 size={24} />
                    ) : item.status === 'In Progress' ? (
                      <Clock size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                        }}
                      >
                        {item.skill_name}
                      </h4>
                      <Badge
                        variant={
                          item.status === 'Completed'
                            ? 'success'
                            : item.status === 'In Progress'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {item.status}
                      </Badge>
                      <Badge variant="info">{item.category}</Badge>
                      {item.priority === 'High' && <Badge variant="danger">High Priority</Badge>}
                    </div>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {item.milestone}
                    </p>

                    {item.personal_notes && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic',
                        }}
                      >
                        Note: {item.personal_notes}
                      </div>
                    )}

                    {/* Resources */}
                    {item.resources && item.resources.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.625rem' }}>
                        {item.resources.map((res, ri) => (
                          <a
                            key={ri}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem',
                              color: 'var(--primary)',
                              backgroundColor: 'var(--primary-light)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 600,
                            }}
                          >
                            <BookOpen size={12} />
                            {res.title} <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit notes button */}
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setItemNote(item.personal_notes || '');
                  }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                  }}
                  title="Edit Notes"
                >
                  <Edit2 size={16} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Create Roadmap Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Learning Roadmap"
        subtitle="Establish milestone targets for your next career step"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateNewRoadmap} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Target Role Preset"
            value={newTargetRole}
            onChange={(e) => setNewTargetRole(e.target.value)}
            options={[
              'Frontend Engineer (React / JavaScript)',
              'Full Stack Developer (React & Node)',
              'Backend Cloud Engineer (Python & PostgreSQL)',
              'AI / ML Application Engineer',
              'Associate Product Designer (UI/UX)',
            ]}
          />

          <Input
            label="Custom Roadmap Title (Optional)"
            placeholder="e.g. 90-Day Full Stack Preparation"
            value={newRoadmapTitle}
            onChange={(e) => setNewRoadmapTitle(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate Roadmap
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Personal Notes Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Milestone Notes"
        subtitle={editingItem?.skill_name}
        maxWidth="480px"
      >
        <form onSubmit={handleSaveItemNotes}>
          <Textarea
            label="Personal Progress Notes"
            rows={4}
            value={itemNote}
            onChange={(e) => setItemNote(e.target.value)}
            placeholder="Add personal notes, completed tutorial links, or key takeaways..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Notes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
