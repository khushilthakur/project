import React, { useState, useRef } from 'react';
import {
  User,
  GraduationCap,
  MapPin,
  Globe,
  Code2,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Skeleton } from '../../components/common/Badge';

const AVATAR_PRESETS = [
  { id: '1', name: 'Alex', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Jordan', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Taylor', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
  { id: '4', name: 'Morgan', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200' },
  { id: '5', name: 'Sam', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: '6', name: 'Casey', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
];

export function ProfilePage() {
  const { profile, updateProfile, loading } = useAuth();

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="60px" />
        <Skeleton height="200px" />
        <Skeleton height="200px" />
      </div>
    );
  }

  return (
    <ProfileForm
      key={profile?.id || 'profile-form'}
      profile={profile}
      updateProfile={updateProfile}
    />
  );
}

function ProfileForm({ profile, updateProfile }) {
  const fileInputRef = useRef(null);

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

  const [showUrlInput, setShowUrlInput] = useState(Boolean(formData.avatar_url && !formData.avatar_url.startsWith('data:')));
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, WebP, etc.).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image file size should be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, avatar_url: dataUrl }));
        setStatusMsg({ type: 'success', text: 'Image selected! Click "Save Profile Changes" below to apply.' });
      }
    };
    reader.onerror = () => {
      setStatusMsg({ type: 'error', text: 'Error reading image file. Please try another image.' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
    setStatusMsg({ type: 'success', text: 'Avatar preset selected! Click "Save Profile Changes" below to apply.' });
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar_url: '' }));
    setStatusMsg({ type: 'success', text: 'Profile photo removed. Click "Save Profile Changes" below to apply.' });
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
        <Card title="Personal Information" subtitle="Your profile photo, contact, and identification details">
          {/* Avatar & Profile Photo Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Clickable Avatar with Camera Overlay */}
              <div
                style={{
                  position: 'relative',
                  width: '92px',
                  height: '92px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  borderRadius: '50%',
                  outline: 'none',
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click on photo to upload image from your device"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.full_name || 'Profile'}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)',
                      boxShadow: 'var(--shadow-md)',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '2rem',
                      border: '3px solid var(--primary)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User size={40} />}
                  </div>
                )}

                {/* Floating Camera Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    border: '2px solid var(--bg-surface)',
                  }}
                  title="Click to change photo"
                >
                  <Camera size={15} />
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                aria-label="Upload profile image"
              />

              {/* Upload Controls & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1, minWidth: '220px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Profile Photo
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Click your avatar or choose an image file from your device (PNG, JPG, WebP up to 5MB).
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>

                  {formData.avatar_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={handleRemovePhoto}
                      style={{ color: 'var(--danger)' }}
                    >
                      Remove Photo
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={ImageIcon}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    {showUrlInput ? 'Hide URL Input' : 'Enter URL'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={13} style={{ color: 'var(--primary)' }} /> Or choose a preset avatar:
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      padding: 0,
                      border: formData.avatar_url === preset.url ? '2px solid var(--primary)' : '2px solid transparent',
                      boxShadow: formData.avatar_url === preset.url ? '0 0 0 2px var(--primary-light)' : 'none',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'transform 150ms ease',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    title={`Select preset avatar ${preset.name}`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Direct URL Input */}
            {showUrlInput && (
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                <Input
                  label="Direct Avatar URL"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>

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

            {/* Preferred Locations */}
            <div>
              <label className="form-label">Preferred Locations</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', marginTop: '0.25rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco, CA, Remote, New York, NY..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation(e);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button variant="secondary" onClick={handleAddLocation} icon={Plus}>
                  Add Location
                </Button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {preferredLocations.map((loc) => (
                  <span
                    key={loc}
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
                    <MapPin size={12} style={{ color: 'var(--primary)' }} />
                    {loc}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(loc)}
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
