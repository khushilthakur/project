import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Globe,
  Code2,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge } from '../../components/common/Badge';

export function ProfilePage() {
  const { profile, updateProfile, isSupabaseConfigured } = useAuth();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    education: profile?.education || '',
    graduation_year: profile?.graduation_year || '',
    experience_level: profile?.experience_level || 'Fresher / Entry Level',
    remote_preference: profile?.remote_preference || 'Remote',
    career_interests: profile?.career_interests || '',
    portfolio_url: profile?.portfolio_url || '',
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
  });

  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [preferredRoles, setPreferredRoles] = useState(profile?.preferred_roles || []);
  const [newRole, setNewRole] = useState('');

  const [preferredLocations, setPreferredLocations] = useState(profile?.preferred_locations || []);
  const [newLocation, setNewLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    if (newRole.trim() && !preferredRoles.includes(newRole.trim())) {
      setPreferredRoles([...preferredRoles, newRole.trim()]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setPreferredRoles(preferredRoles.filter((r) => r !== roleToRemove));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (newLocation.trim() && !preferredLocations.includes(newLocation.trim())) {
      setPreferredLocations([...preferredLocations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (locToRemove) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    const updates = {
      ...formData,
      skills,
      preferred_roles: preferredRoles,
      preferred_locations: preferredLocations,
    };

    const { success, error } = await updateProfile(updates);
    setLoading(false);

    if (success) {
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } else {
      setStatusMsg({ type: 'error', text: error || 'Failed to update profile.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Career Profile & Preferences
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Your profile informs AI resume summaries, job description matching, and interview questions.
        </p>
      </div>

      {statusMsg.text && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: statusMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            color: statusMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Basic Information */}
        <Card title="Personal Information" subtitle="Your basic contact and identification details">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Full Name"
              name="full_name"
              icon={User}
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera"
              required
            />
            <Input
              label="Avatar Image URL (Optional)"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </Card>

        {/* Education & Experience Level */}
        <Card title="Education & Experience" subtitle="Academic background and current career stage">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Degree / Major & University"
              name="education"
              icon={GraduationCap}
              value={formData.education}
              onChange={handleChange}
              placeholder="e.g. B.S. in Computer Science, San Jose State Univ"
            />
            <Input
              label="Graduation Year"
              name="graduation_year"
              value={formData.graduation_year}
              onChange={handleChange}
              placeholder="e.g. 2026"
            />
            <Select
              label="Current Experience Level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              options={[
                'Fresher / Entry Level',
                'Junior (1-2 yrs)',
                'Mid-level (3-5 yrs)',
                'Senior (5+ yrs)',
              ]}
            />
            <Select
              label="Work Mode Preference"
              name="remote_preference"
              value={formData.remote_preference}
              onChange={handleChange}
              options={['Remote', 'Hybrid', 'Onsite', 'Any']}
            />
          </div>
        </Card>

        {/* Skills Tag Management */}
        <Card title="Skills & Competencies" subtitle="Core technical abilities, frameworks, and programming languages">
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add a skill (e.g. React, Python, PostgreSQL, Docker)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
              style={{ flex: 1 }}
            />
            <Button variant="secondary" onClick={handleAddSkill} icon={Plus}>
              Add
            </Button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ display: 'flex', alignItems: 'center', color: 'inherit', padding: 0 }}
                  aria-label={`Remove skill ${skill}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </Card>

        {/* Target Roles & Locations */}
        <Card title="Target Roles & Career Interests" subtitle="Positions you are actively pursuing">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Preferred Roles */}
            <div>
              <label className="form-label">Preferred Job Titles</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Frontend Engineer, Full Stack Intern..."
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRole(e);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button variant="secondary" onClick={handleAddRole} icon={Plus}>
                  Add Role
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {preferredRoles.map((role) => (
                  <span
                    key={role}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role)}
                      style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Career Interests Description */}
            <Textarea
              label="Career Interests & Growth Focus"
              name="career_interests"
              rows={3}
              value={formData.career_interests}
              onChange={handleChange}
              placeholder="Share what industries or software domains you are passionate about (e.g. cloud SaaS, fintech, machine learning interfaces)..."
            />
          </div>
        </Card>

        {/* Online Portfolio & Links */}
        <Card title="Portfolio & Public Profiles" subtitle="Links to showcase in resumes and applications">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Portfolio / Personal Website"
              name="portfolio_url"
              icon={Globe}
              value={formData.portfolio_url}
              onChange={handleChange}
              placeholder="https://yourportfolio.dev"
            />
            <Input
              label="GitHub Profile URL"
              name="github_url"
              icon={Code2}
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
            <Input
              label="LinkedIn Profile URL"
              name="linkedin_url"
              icon={Share2}
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </Card>

        {/* Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            icon={Save}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
