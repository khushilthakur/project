import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resumeService } from '../../services/resumeService';
import { calculateJobMatch } from '../../services/aiService';
import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../../lib/supabaseClient';
import { Textarea, Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge } from '../../components/common/Badge';

export function JobMatcherPage() {
  const { user, profile } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customSkills, setCustomSkills] = useState('');
  const [loading, setLoading] = useState(false);

  // Results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      try {
        const [allResumes] = await Promise.all([resumeService.getResumes(user.id)]);
        if (mounted) {
          setResumes(allResumes);
          if (allResumes.length > 0) {
            setSelectedResumeId(allResumes[0].id);
          }
        }

        // Load saved analyses
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase
            .from('job_analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (mounted && data) setSavedAnalyses(data);
        } else {
          const cached = storage.get(STORAGE_KEYS.ANALYSES, []);
          if (mounted) setSavedAnalyses(cached);
        }
      } catch (err) {
        console.error('Error loading matcher data:', err);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [user]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    let candidateSkills = [];

    if (selectedResume?.skills?.technical) {
      candidateSkills = [...selectedResume.skills.technical];
    } else if (profile?.skills) {
      candidateSkills = [...profile.skills];
    }

    if (customSkills.trim()) {
      const extra = customSkills.split(',').map((s) => s.trim()).filter(Boolean);
      candidateSkills = [...candidateSkills, ...extra];
    }

    // Build resume text representation
    const resumeText = selectedResume
      ? `${selectedResume.personal_info?.summary || ''} ${JSON.stringify(selectedResume.experience || [])} ${JSON.stringify(selectedResume.projects || [])}`
      : '';

    // Deterministic, transparent matching calculation
    const result = calculateJobMatch(jobDescription, candidateSkills, resumeText);
    setAnalysisResult(result);
    setSavedSuccess(false);
    setLoading(false);
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !user) return;
    setSavingAnalysis(true);

    const record = {
      id: 'analysis-' + Date.now(),
      user_id: user.id,
      resume_id: selectedResumeId || null,
      job_title: jobTitle || 'Target Position',
      company: company || 'Company',
      job_description: jobDescription,
      match_score: analysisResult.matchScore,
      matching_skills: analysisResult.matchingSkills,
      missing_skills: analysisResult.missingSkills,
      recommendations: analysisResult.recommendations,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('job_analyses').insert(record);
      }
      const updated = [record, ...savedAnalyses];
      setSavedAnalyses(updated);
      if (!isSupabaseConfigured) {
        storage.set(STORAGE_KEYS.ANALYSES, updated);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving analysis:', err);
    } finally {
      setSavingAnalysis(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--primary)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Job Description & Skill Matcher
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Analyze any job description against your resume or skills to identify gaps and boost keyword alignment.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Job Details & Skills Source">
            <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Target Job Title (Optional)"
                  placeholder="e.g. Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
                <Input
                  label="Company Name (Optional)"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              {resumes.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Compare Against Resume</label>
                  <select
                    className="form-select"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.template} template)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="Additional Skills to Test (Comma separated)"
                placeholder="e.g. TypeScript, GraphQL, Docker"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                helperText="Appended to your selected resume skills for the matching algorithm."
              />

              <Textarea
                label="Target Job Description"
                rows={9}
                placeholder="Paste the complete job description, responsibilities, and qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Target}
                isLoading={loading}
              >
                Analyze Match & Extract Keywords
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Analysis Results or Empty Guidance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {analysisResult ? (
            <Card
              title="Skill Match Analysis"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Save}
                  isLoading={savingAnalysis}
                  onClick={handleSaveAnalysis}
                >
                  {savedSuccess ? 'Saved!' : 'Save Analysis'}
                </Button>
              }
            >
              {/* Score Dial / Progress */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-tertiary)',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: `6px solid ${getScoreColor(analysisResult.matchScore)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: getScoreColor(analysisResult.matchScore), lineHeight: 1 }}>
                    {analysisResult.matchScore}%
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Match
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {analysisResult.matchScore >= 80
                      ? 'High Requirement Alignment'
                      : analysisResult.matchScore >= 50
                      ? 'Moderate Skill Overlap'
                      : 'Skill Gap Identified'}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {analysisResult.disclaimer}
                  </p>
                </div>
              </div>

              {/* Matching Skills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  Matching Skills Found ({analysisResult.matchingSkills.length})
                </h5>
                {analysisResult.matchingSkills.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    No direct skill matches detected in your selected resume.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {analysisResult.matchingSkills.map((s) => (
                      <Badge key={s} variant="success">
                        ✓ {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <XCircle size={16} style={{ color: 'var(--danger)' }} />
                  Keywords / Skills to Evidence ({analysisResult.missingSkills.length})
                </h5>
                {analysisResult.missingSkills.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--success-text)' }}>
                    All identified core skills are covered in your profile!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {analysisResult.missingSkills.map((s) => (
                      <Badge key={s} variant="danger">
                        Missing: {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <Lightbulb size={16} style={{ color: 'var(--warning)' }} />
                  Actionable Recommendations
                </h5>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Target size={28} />
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Paste a Job Description to Begin
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                Our matching engine extracts required technologies, compares them against your resume, and provides ATS improvement strategies.
              </p>
            </Card>
          )}

          {/* Saved Analyses History */}
          {savedAnalyses.length > 0 && (
            <Card title="Past Saved Analyses" subtitle="Review your historical target comparisons">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {savedAnalyses.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {a.job_title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.company} • {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={a.match_score >= 70 ? 'success' : 'warning'}>
                      {a.match_score}% Match
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
