import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save,
  Download,
  Eye,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  Wand2,
  AlertCircle,
  Layout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resumeService } from '../../services/resumeService';
import { generateProfessionalSummary, optimizeResumeBullet } from '../../services/aiService';
import { exportResumeToPdf } from './utils/pdfExport';
import { ResumePreview } from './ResumePreview';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton } from '../../components/common/Badge';
import { SAMPLE_RESUME } from '../../lib/mockData';

export function ResumeEditorPage() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('id');
  const isNew = searchParams.get('new') === 'true';

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // personal, summary, experience, education, projects, skills, certs
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [statusAlert, setStatusAlert] = useState(null);

  // AI Suggestion Modal / Inline state
  const [aiGeneratingSummary, setAiGeneratingSummary] = useState(false);
  const [aiOptimizingBullet, setAiOptimizingBullet] = useState(null); // index or id
  const [aiSuggestion, setAiSuggestion] = useState(null); // { type, original, suggested, targetField }

  useEffect(() => {
    let mounted = true;

    async function initResume() {
      if (!user) return;
      try {
        setLoading(true);
        if (resumeId) {
          const data = await resumeService.getResumeById(resumeId);
          if (mounted && data) setResume(data);
        } else if (isNew) {
          // Initialize from user's profile
          const starter = {
            id: 'res-' + Date.now(),
            user_id: user.id,
            title: `${profile?.full_name || 'My'} Resume`,
            template: 'modern',
            personal_info: {
              fullName: profile?.full_name || '',
              email: profile?.email || '',
              phone: '',
              location: profile?.preferred_locations?.[0] || '',
              linkedin: profile?.linkedin_url || '',
              github: profile?.github_url || '',
              portfolio: profile?.portfolio_url || '',
              summary: '',
            },
            education: profile?.education
              ? [{
                  id: 'edu-0',
                  institution: profile.education,
                  degree: 'Bachelor Degree',
                  location: '',
                  start_date: '2022',
                  end_date: profile.graduation_year || '2026',
                  gpa: '',
                  highlights: '',
                }]
              : [],
            experience: [],
            projects: [],
            skills: {
              technical: profile?.skills || [],
              soft: ['Teamwork', 'Communication', 'Problem Solving'],
              tools: ['Git', 'VS Code'],
              languages: ['English'],
            },
            certifications: [],
            achievements: [],
            is_default: false,
          };
          if (mounted) setResume(starter);
        } else {
          // Default to first resume
          const list = await resumeService.getResumes(user.id);
          if (mounted) setResume(list[0] || SAMPLE_RESUME);
        }
      } catch (err) {
        console.error('Error initializing resume editor:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initResume();
    return () => { mounted = false; };
  }, [resumeId, isNew, user, profile]);

  // Handle Save
  const handleSave = async () => {
    if (!resume) return;
    setSaving(true);
    try {
      const saved = await resumeService.saveResume(resume);
      setResume(saved);
      setStatusAlert({ type: 'success', text: 'Resume saved successfully!' });
      setTimeout(() => setStatusAlert(null), 3000);
    } catch (err) {
      console.error('Failed to save resume:', err);
      setStatusAlert({ type: 'error', text: 'Failed to save resume.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle PDF Export
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportResumeToPdf('resume-live-preview-target', `${resume.title.replace(/\s+/g, '_')}.pdf`);
      setStatusAlert({ type: 'success', text: 'PDF exported successfully!' });
      setTimeout(() => setStatusAlert(null), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      setStatusAlert({ type: 'error', text: 'Could not export PDF. Please check browser settings.' });
    } finally {
      setExporting(false);
    }
  };

  // AI Summary Generator
  const handleAiGenerateSummary = async () => {
    setAiGeneratingSummary(true);
    try {
      const result = await generateProfessionalSummary({
        fullName: resume.personal_info.fullName,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
      });

      setAiSuggestion({
        type: 'summary',
        suggested: result.text,
        source: result.source,
      });
    } catch (e) {
      console.error('AI summary failed:', e);
    } finally {
      setAiGeneratingSummary(false);
    }
  };

  // AI Bullet Optimizer
  const handleAiOptimizeBullet = async (bulletText, expIndex, bulletIndex) => {
    setAiOptimizingBullet(`${expIndex}-${bulletIndex}`);
    try {
      const result = await optimizeResumeBullet(bulletText, resume.experience[expIndex]?.role);
      setAiSuggestion({
        type: 'bullet',
        expIndex,
        bulletIndex,
        original: bulletText,
        suggested: result.text,
        source: result.source,
      });
    } catch (e) {
      console.error('AI bullet optimization failed:', e);
    } finally {
      setAiOptimizingBullet(null);
    }
  };

  // Accept AI suggestion
  const acceptSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.type === 'summary') {
      setResume((prev) => ({
        ...prev,
        personal_info: { ...prev.personal_info, summary: aiSuggestion.suggested },
      }));
    } else if (aiSuggestion.type === 'bullet') {
      const updatedExp = [...resume.experience];
      updatedExp[aiSuggestion.expIndex].bullets[aiSuggestion.bulletIndex] = aiSuggestion.suggested;
      setResume((prev) => ({ ...prev, experience: updatedExp }));
    }
    setAiSuggestion(null);
  };

  // Section modifiers
  const addExperience = () => {
    const newExp = {
      id: 'exp-' + Date.now(),
      role: 'Software Developer Intern',
      company: 'Tech Corp',
      location: 'Remote',
      start_date: 'Jun 2025',
      end_date: 'Aug 2025',
      current: false,
      bullets: ['Developed responsive features improving user engagement.'],
    };
    setResume((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const removeExperience = (index) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addExperienceBullet = (expIndex) => {
    const updated = [...resume.experience];
    updated[expIndex].bullets.push('Accomplished [X] as measured by [Y] by doing [Z].');
    setResume((prev) => ({ ...prev, experience: updated }));
  };

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    const updated = [...resume.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setResume((prev) => ({ ...prev, experience: updated }));
  };

  const addProject = () => {
    const newProj = {
      id: 'proj-' + Date.now(),
      title: 'Full-Stack Web App',
      tech_stack: 'React, Node.js, PostgreSQL',
      link: 'https://github.com/...',
      description: 'Built a collaborative web application with persistent database storage.',
      bullets: ['Implemented end-to-end authentication and responsive UI.'],
    };
    setResume((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProject = (index) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: 'edu-' + Date.now(),
      degree: 'B.S. in Computer Science',
      institution: 'State University',
      location: 'City, State',
      start_date: '2022',
      end_date: '2026',
      gpa: '3.8',
    };
    setResume((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (index) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  if (loading || !resume) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="50px" />
        <Skeleton height="500px" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/app/resumes')}
          >
            All Resumes
          </Button>
          <input
            type="text"
            value={resume.title}
            onChange={(e) => setResume({ ...resume, title: e.target.value })}
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px dashed var(--border-light)',
              color: 'var(--text-primary)',
              padding: '0.2rem 0.5rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Template:</span>
            <select
              value={resume.template || 'modern'}
              onChange={(e) => setResume({ ...resume, template: e.target.value })}
              className="form-select"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem' }}
            >
              <option value="modern">Modern Professional</option>
              <option value="minimal">Minimal Classic</option>
              <option value="tech">Tech / Terminal</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
            className="mobile-preview-toggle"
          >
            {showPreviewMobile ? 'Edit Sections' : 'View Preview'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            isLoading={exporting}
            onClick={handleExportPdf}
          >
            Export PDF
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            isLoading={saving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {statusAlert && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: statusAlert.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${statusAlert.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            color: statusAlert.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {statusAlert.text}
        </div>
      )}

      {/* AI Suggestion Approval Banner */}
      {aiSuggestion && (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>
              <Sparkles size={16} /> AI Suggested Improvement ({aiSuggestion.type === 'summary' ? 'Summary' : 'STAR Bullet Point'})
            </span>
            <Badge variant="primary">Review Before Applying</Badge>
          </div>

          {aiSuggestion.original && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <strong>Original:</strong> {aiSuggestion.original}
            </div>
          )}

          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {aiSuggestion.suggested}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" size="sm" icon={X} onClick={() => setAiSuggestion(null)}>
              Reject
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={acceptSuggestion}>
              Accept & Apply to Resume
            </Button>
          </div>
        </div>
      )}

      {/* Split Editor & Live Preview Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: showPreviewMobile ? '1fr' : 'repeat(auto-fit, minmax(440px, 1fr))', gap: '2rem' }}>
        {/* Editor Form Columns */}
        <div style={{ display: showPreviewMobile ? 'none' : 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            {[
              { id: 'personal', label: 'Contact Info' },
              { id: 'summary', label: 'Summary' },
              { id: 'experience', label: 'Experience' },
              { id: 'projects', label: 'Projects' },
              { id: 'education', label: 'Education' },
              { id: 'skills', label: 'Skills' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  border: activeTab === tab.id ? '1px solid rgba(79, 70, 229, 0.3)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Personal Contact */}
          {activeTab === 'personal' && (
            <Card title="Contact Information">
              <Input
                label="Full Name"
                value={resume.personal_info?.fullName || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, fullName: e.target.value },
                  })
                }
              />
              <Input
                label="Email"
                type="email"
                value={resume.personal_info?.email || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, email: e.target.value },
                  })
                }
              />
              <Input
                label="Phone"
                value={resume.personal_info?.phone || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, phone: e.target.value },
                  })
                }
              />
              <Input
                label="Location"
                value={resume.personal_info?.location || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, location: e.target.value },
                  })
                }
              />
              <Input
                label="LinkedIn URL"
                value={resume.personal_info?.linkedin || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, linkedin: e.target.value },
                  })
                }
              />
              <Input
                label="GitHub URL"
                value={resume.personal_info?.github || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, github: e.target.value },
                  })
                }
              />
            </Card>
          )}

          {/* Tab 2: Professional Summary */}
          {activeTab === 'summary' && (
            <Card
              title="Professional Summary"
              action={
                <Button
                  variant="primary"
                  size="sm"
                  icon={Wand2}
                  isLoading={aiGeneratingSummary}
                  onClick={handleAiGenerateSummary}
                >
                  Generate with AI
                </Button>
              }
            >
              <Textarea
                rows={5}
                value={resume.personal_info?.summary || ''}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    personal_info: { ...resume.personal_info, summary: e.target.value },
                  })
                }
                placeholder="Write a concise 3-4 sentence professional summary focusing on your technical strengths and ambitions..."
              />
            </Card>
          )}

          {/* Tab 3: Experience */}
          {activeTab === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Work & Internships ({resume.experience.length})
                </h4>
                <Button variant="outline" size="sm" icon={Plus} onClick={addExperience}>
                  Add Experience
                </Button>
              </div>

              {resume.experience.map((exp, expIdx) => (
                <Card key={exp.id || expIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Position #{expIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(expIdx)}
                      style={{ color: 'var(--danger)', padding: '0.2rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Input
                      label="Job Title"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[expIdx].role = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                    <Input
                      label="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[expIdx].company = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Input
                      label="Start Date"
                      value={exp.start_date}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[expIdx].start_date = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                    <Input
                      label="End Date"
                      value={exp.end_date}
                      onChange={(e) => {
                        const copy = [...resume.experience];
                        copy[expIdx].end_date = e.target.value;
                        setResume({ ...resume, experience: copy });
                      }}
                    />
                  </div>

                  {/* Bullet points with AI optimizer */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Achievement Bullet Points
                      </span>
                      <button
                        type="button"
                        onClick={() => addExperienceBullet(expIdx)}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        + Add Bullet
                      </button>
                    </div>

                    {exp.bullets?.map((bullet, bIdx) => (
                      <div key={bIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={bullet}
                          onChange={(e) => {
                            const copy = [...resume.experience];
                            copy[expIdx].bullets[bIdx] = e.target.value;
                            setResume({ ...resume, experience: copy });
                          }}
                          style={{ flex: 1, fontSize: '0.8125rem' }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Wand2}
                          title="Optimize bullet with STAR method"
                          isLoading={aiOptimizingBullet === `${expIdx}-${bIdx}`}
                          onClick={() => handleAiOptimizeBullet(bullet, expIdx, bIdx)}
                        >
                          STAR
                        </Button>
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(expIdx, bIdx)}
                          style={{ color: 'var(--danger)', padding: '0.2rem' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tab 4: Projects */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Projects ({resume.projects.length})
                </h4>
                <Button variant="outline" size="sm" icon={Plus} onClick={addProject}>
                  Add Project
                </Button>
              </div>

              {resume.projects.map((proj, pIdx) => (
                <Card key={proj.id || pIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Project #{pIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProject(pIdx)}
                      style={{ color: 'var(--danger)', padding: '0.2rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    label="Project Title"
                    value={proj.title}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pIdx].title = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                  <Input
                    label="Tech Stack"
                    value={proj.tech_stack}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pIdx].tech_stack = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                  <Input
                    label="Project URL / GitHub"
                    value={proj.link}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pIdx].link = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                  <Textarea
                    label="Description"
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const copy = [...resume.projects];
                      copy[pIdx].description = e.target.value;
                      setResume({ ...resume, projects: copy });
                    }}
                  />
                </Card>
              ))}
            </div>
          )}

          {/* Tab 5: Education */}
          {activeTab === 'education' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Education ({resume.education.length})
                </h4>
                <Button variant="outline" size="sm" icon={Plus} onClick={addEducation}>
                  Add Degree
                </Button>
              </div>

              {resume.education.map((edu, eIdx) => (
                <Card key={edu.id || eIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Degree #{eIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(eIdx)}
                      style={{ color: 'var(--danger)', padding: '0.2rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    label="Degree & Major"
                    value={edu.degree}
                    onChange={(e) => {
                      const copy = [...resume.education];
                      copy[eIdx].degree = e.target.value;
                      setResume({ ...resume, education: copy });
                    }}
                  />
                  <Input
                    label="Institution / College"
                    value={edu.institution}
                    onChange={(e) => {
                      const copy = [...resume.education];
                      copy[eIdx].institution = e.target.value;
                      setResume({ ...resume, education: copy });
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Input
                      label="Start Year"
                      value={edu.start_date}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[eIdx].start_date = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                    />
                    <Input
                      label="Graduation Year"
                      value={edu.end_date}
                      onChange={(e) => {
                        const copy = [...resume.education];
                        copy[eIdx].end_date = e.target.value;
                        setResume({ ...resume, education: copy });
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Tab 6: Skills */}
          {activeTab === 'skills' && (
            <Card title="Skills Inventory">
              <Input
                label="Technical Skills (Comma separated)"
                value={resume.skills?.technical?.join(', ') || ''}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setResume({
                    ...resume,
                    skills: { ...resume.skills, technical: arr },
                  });
                }}
                helperText="Example: React, JavaScript, Python, PostgreSQL, Git, Docker"
              />
              <Input
                label="Developer Tools (Comma separated)"
                value={resume.skills?.tools?.join(', ') || ''}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setResume({
                    ...resume,
                    skills: { ...resume.skills, tools: arr },
                  });
                }}
                helperText="Example: Vite, VS Code, Figma, Postman, Linux"
              />
              <Input
                label="Soft Skills (Comma separated)"
                value={resume.skills?.soft?.join(', ') || ''}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  setResume({
                    ...resume,
                    skills: { ...resume.skills, soft: arr },
                  });
                }}
                helperText="Example: Problem Solving, Agile Collaboration, Technical Writing"
              />
            </Card>
          )}
        </div>

        {/* Live Resume Preview Column */}
        <div
          style={{
            display: showPreviewMobile ? 'block' : 'block',
            position: 'sticky',
            top: '80px',
            alignSelf: 'start',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 100px)',
          }}
        >
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Document Preview (A4 ATS Standard)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Updates instantly as you type
            </span>
          </div>

          <div style={{ transform: 'scale(0.96)', transformOrigin: 'top center' }}>
            <ResumePreview resume={resume} previewId="resume-live-preview-target" />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-preview-toggle { display: inline-flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-preview-toggle { display: none !important; }
        }
      `}</style>
    </div>
  );
}
