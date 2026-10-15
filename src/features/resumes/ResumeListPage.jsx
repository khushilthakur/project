import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resumeService } from '../../services/resumeService';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { AiResumeFromDetailsModal } from './AiResumeFromDetailsModal';

export function ResumeListPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      try {
        setLoading(true);
        const data = await resumeService.getResumes(user.id);
        if (mounted) setResumes(data);
      } catch (err) {
        console.error('Error loading resumes:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  const handleCreateNew = () => {
    navigate('/app/resumes/editor?new=true');
  };

  const handleAiGeneratedSuccess = (newResume) => {
    navigate(`/app/resumes/editor?id=${newResume.id}`);
  };

  const handleDuplicate = async (res) => {
    try {
      const copy = await resumeService.duplicateResume(res, user.id);
      setResumes([copy, ...resumes]);
    } catch (err) {
      console.error('Failed to duplicate:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await resumeService.deleteResume(deleteTarget.id);
      setResumes(resumes.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            AI Resume Builder
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Create and customize ATS-compliant resumes with AI bullet point and summary optimization.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Plus} onClick={handleCreateNew}>
            Create Blank Resume
          </Button>
          <Button variant="primary" icon={Sparkles} onClick={() => setShowAiModal(true)}>
            ✨ Generate with AI (Simple Form)
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <FileText size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No resumes created yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
            Choose how you'd like to begin: fill in your details simply to let AI generate a structured resume, or start directly with a blank editor.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={Sparkles} onClick={() => setShowAiModal(true)}>
              ✨ Generate with AI (Fill Simple Form)
            </Button>
            <Button variant="secondary" icon={Plus} onClick={handleCreateNew}>
              Create Blank Resume
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {resumes.map((res) => (
            <Card key={res.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {res.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.375rem' }}>
                    <Badge variant="primary">Template: {res.template || 'Modern'}</Badge>
                    {res.is_default && <Badge variant="success">Default</Badge>}
                  </div>
                </div>
                <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <FileText size={20} />
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '1.25rem' }}>
                {res.personal_info?.summary
                  ? res.personal_info.summary.slice(0, 120) + '...'
                  : 'No summary written yet. Click edit to customize.'}
              </p>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Last updated: {new Date(res.updated_at || res.created_at).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => navigate(`/app/resumes/editor?id=${res.id}`)}
                  style={{ flex: 1 }}
                >
                  Edit Resume
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  title="Duplicate Resume"
                  onClick={() => handleDuplicate(res)}
                >
                  <Copy size={15} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  title="Delete Resume"
                  onClick={() => setDeleteTarget(res)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Resume"
      />

      {/* AI Resume Creator Modal from Details */}
      <AiResumeFromDetailsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSuccess={handleAiGeneratedSuccess}
        defaultValues={{
          fullName: profile?.full_name || '',
          email: profile?.email || '',
          location: profile?.preferred_locations?.[0] || '',
          targetRole: profile?.preferred_roles?.[0] || 'Software Engineer',
          skills: profile?.skills?.join(', ') || '',
        }}
      />
    </div>
  );
}
