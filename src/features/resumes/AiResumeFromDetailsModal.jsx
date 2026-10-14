import React, { useState } from 'react';
import {
  Sparkles,
  X,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Wrench,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { generateResumeFromSimpleDetails } from '../../services/aiService';
import { resumeService } from '../../services/resumeService';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function AiResumeFromDetailsModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues = {},
}) {
  const [formData, setFormData] = useState({
    fullName: defaultValues.fullName || '',
    email: defaultValues.email || '',
    phone: defaultValues.phone || '',
    location: defaultValues.location || '',
    targetRole: defaultValues.targetRole || 'Software Engineer',
    degree: defaultValues.degree || '',
    institution: defaultValues.institution || '',
    gradYear: defaultValues.gradYear || '2026',
    roughSummary: defaultValues.roughSummary || '',
    roughExperience: defaultValues.roughExperience || '',
    roughProjects: defaultValues.roughProjects || '',
    skills: defaultValues.skills || '',
    template: defaultValues.template || 'modern',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please provide your Full Name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide your Email Address.');
      return;
    }
    if (!formData.targetRole.trim()) {
      setError('Please provide your Target Role (e.g. Frontend Developer, Python Engineer).');
      return;
    }

    setLoading(true);
    try {
      const generatedResume = await generateResumeFromSimpleDetails({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        targetRole: formData.targetRole,
        education: {
          degree: formData.degree,
          institution: formData.institution,
          gradYear: formData.gradYear,
        },
        roughSummary: formData.roughSummary,
        roughExperience: formData.roughExperience,
        roughProjects: formData.roughProjects,
        skills: formData.skills,
        template: formData.template,
      });

      // Save to persistence
      const saved = await resumeService.saveResume(generatedResume);
      setLoading(false);
      onSuccess(saved);
      onClose();
    } catch (err) {
      console.error('Error generating resume from details:', err);
      setError('Failed to generate resume. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1100,
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '720px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.04) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                AI Resume Creator: Fill Your Details
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                Fill in your basic information below — AI will structure and polish everything into an ATS resume.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.4rem',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form
          onSubmit={handleGenerate}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-text)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contact Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              <User size={16} /> 1. Personal & Contact Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <Input
                label="Full Name *"
                placeholder="e.g. Khushil Thakur"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
              <Input
                label="Target Job Role *"
                placeholder="e.g. Frontend Developer, Python Engineer"
                value={formData.targetRole}
                onChange={(e) => handleChange('targetRole', e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginTop: '0.75rem' }}>
              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. name@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="e.g. +1 (555) 019-2834"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <Input
                label="Location / City"
                placeholder="e.g. San Francisco, CA / Remote"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Education */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              <GraduationCap size={16} /> 2. Education
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.875rem' }}>
              <Input
                label="Degree & Major"
                placeholder="e.g. B.S. in Computer Science"
                value={formData.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
              />
              <Input
                label="Graduation Year"
                placeholder="e.g. 2026"
                value={formData.gradYear}
                onChange={(e) => handleChange('gradYear', e.target.value)}
              />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <Input
                label="College / University Name"
                placeholder="e.g. California State University"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Skills */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              <Wrench size={16} /> 3. Skills & Technologies
            </div>
            <Input
              label="Technical Skills (Comma separated)"
              placeholder="e.g. React, JavaScript, Node.js, Python, PostgreSQL, Git, Docker"
              value={formData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
              helperText="List your core programming languages, frameworks, databases, and tools."
            />
          </div>

          {/* Section 4: Rough Experience (Optional) */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              <Briefcase size={16} /> 4. Work Experience or Internships (Optional)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Write in plain English or rough bullet points. AI will polish them into high-impact STAR statements with strong action verbs.
            </p>
            <Textarea
              rows={3}
              placeholder="e.g. Intern at CloudTech: built customer analytics dashboard with React, reduced loading time, fixed 15+ frontend bugs, helped team connect backend REST APIs."
              value={formData.roughExperience}
              onChange={(e) => handleChange('roughExperience', e.target.value)}
            />
          </div>

          {/* Section 5: Projects (Optional) */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
              <Code2 size={16} /> 5. Key Projects (Optional)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Describe what you built in simple words. AI will formulate architectural bullets highlighting your technical impact.
            </p>
            <Textarea
              rows={3}
              placeholder="e.g. E-Commerce Web App: built full stack store using React, Node, and Postgres. Added user login, shopping cart, and Stripe checkout."
              value={formData.roughProjects}
              onChange={(e) => handleChange('roughProjects', e.target.value)}
            />
          </div>

          {/* Section 6: Template Selection */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
              Resume Layout Template
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[
                { id: 'modern', name: 'Modern', desc: 'Indigo accents & clean hierarchy' },
                { id: 'minimal', name: 'Minimal', desc: 'Classic monochrome serif typography' },
                { id: 'tech', name: 'Tech', desc: 'Structured grid with skills emphasis' },
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleChange('template', tmpl.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: formData.template === tmpl.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: formData.template === tmpl.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {tmpl.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {tmpl.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action */}
          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Sparkles}
              isLoading={loading}
              disabled={loading || !formData.fullName.trim() || !formData.email.trim()}
              style={{ minWidth: '220px' }}
            >
              {loading ? 'AI Generating Resume...' : '✨ Generate Resume & Open Editor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
