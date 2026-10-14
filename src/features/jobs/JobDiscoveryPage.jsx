import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  ExternalLink,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card, Badge, Skeleton, EmptyState } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export function JobDiscoveryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');

  // Modals state
  const [selectedJob, setSelectedJob] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Manual Job Form
  const [manualForm, setManualForm] = useState({
    title: '',
    company: '',
    location: '',
    work_mode: 'Remote',
    type: 'Full-time',
    experience_level: 'Fresher',
    salary_range: '',
    skills_required: '',
    description: '',
    eligibility: '',
    application_url: '',
    source: 'Manual Opportunity',
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [jobList, savedList] = await Promise.all([
          jobService.getJobListings({
            search,
            type: typeFilter,
            work_mode: modeFilter,
            experience_level: expFilter,
          }),
          user ? jobService.getSavedJobIds(user.id) : [],
        ]);
        if (mounted) {
          setJobs(jobList);
          setSavedJobIds(savedList);
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [search, typeFilter, modeFilter, expFilter, user]);

  const handleToggleSave = async (jobId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const isSaved = await jobService.toggleSaveJob(jobId, user.id);
      if (isSaved) {
        setSavedJobIds([...savedJobIds, jobId]);
      } else {
        setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const handleAddToTracker = async (job, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await applicationService.addApplication({
        job_id: job.id,
        company: job.company,
        role: job.title,
        location: job.location,
        job_url: job.application_url,
        salary: job.salary_range,
        status: 'Applied',
      }, user.id);
      navigate('/app/applications');
    } catch (err) {
      console.error('Failed to add to tracker:', err);
    }
  };

  const handleCreateManualJob = async (e) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.company || !manualForm.description) return;
    setSubmittingManual(true);
    try {
      const skillsArray = manualForm.skills_required
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await jobService.createJobListing({
        ...manualForm,
        skills_required: skillsArray,
      }, user?.id);

      setJobs([created, ...jobs]);
      setShowManualModal(false);
      setManualForm({
        title: '',
        company: '',
        location: '',
        work_mode: 'Remote',
        type: 'Full-time',
        experience_level: 'Fresher',
        salary_range: '',
        skills_required: '',
        description: '',
        eligibility: '',
        application_url: '',
        source: 'Manual Opportunity',
      });
    } catch (err) {
      console.error('Error creating manual job:', err);
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportTarget) return;
    await jobService.reportJob(reportTarget.id, reportReason || 'Inappropriate or expired');
    setJobs(jobs.filter((j) => j.id !== reportTarget.id));
    setReportTarget(null);
    setReportReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Job & Internship Discovery
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Curated entry-level and internship listings with verifiable source integrity.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowManualModal(true)}>
          Add Unlisted Opportunity
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            placeholder="Search role, company, or skill..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0 }}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={['All', 'Internship', 'Full-time', 'Part-time', 'Contract']}
            style={{ marginBottom: 0 }}
          />

          <Select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            options={['All', 'Remote', 'Hybrid', 'Onsite']}
            style={{ marginBottom: 0 }}
          />

          <Select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            options={['All', 'Fresher', 'Junior', 'Mid', 'Senior']}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <Skeleton height="220px" />
          <Skeleton height="220px" />
          <Skeleton height="220px" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found matching your criteria"
          description="Try broadening your search keywords or add an unlisted opportunity manually."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setTypeFilter('All');
            setModeFilter('All');
            setExpFilter('All');
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            return (
              <Card
                key={job.id}
                interactive
                onClick={() => setSelectedJob(job)}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {job.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                      <Building2 size={14} />
                      <span style={{ fontWeight: 600 }}>{job.company}</span>
                      {job.is_verified && (
                        <ShieldCheck size={14} style={{ color: 'var(--primary)' }} title="Verified Listing" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleSave(job.id, e)}
                    style={{
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-sm)',
                      color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                    }}
                    title={isSaved ? 'Unsave job' : 'Save job'}
                  >
                    {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                  </button>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.875rem' }}>
                  <Badge variant="primary">{job.type}</Badge>
                  <Badge variant="info">{job.work_mode}</Badge>
                  <Badge variant="warning">{job.experience_level}</Badge>
                </div>

                {/* Details snippet */}
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  {job.salary_range && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success-text)', fontWeight: 600 }}>
                      <DollarSign size={14} />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                {/* Skills Required */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', flex: 1, marginBottom: '1.25rem' }}>
                  {job.skills_required?.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                  {job.skills_required?.length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      +{job.skills_required.length - 4} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.875rem' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={(e) => handleAddToTracker(job, e)}
                    style={{ flex: 1 }}
                  >
                    Track Application
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        subtitle={`${selectedJob?.company} • ${selectedJob?.location}`}
        maxWidth="680px"
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Badge variant="primary">{selectedJob.type}</Badge>
              <Badge variant="info">{selectedJob.work_mode}</Badge>
              <Badge variant="warning">{selectedJob.experience_level}</Badge>
              {selectedJob.salary_range && (
                <Badge variant="success">{selectedJob.salary_range}</Badge>
              )}
            </div>

            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                About the Role
              </h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.eligibility && (
              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Eligibility & Requirements
                </h5>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedJob.eligibility}
                </p>
              </div>
            )}

            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Required Skills
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedJob.skills_required?.map((s) => (
                  <span
                    key={s}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Source: {selectedJob.source || 'CareerPilot Curated'} • Verified integrity
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setReportTarget(selectedJob);
                  setSelectedJob(null);
                }}
                style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <AlertTriangle size={14} /> Report listing
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="secondary"
                  icon={ExternalLink}
                  onClick={() => window.open(selectedJob.application_url, '_blank', 'noopener,noreferrer')}
                >
                  Apply on Company Site
                </Button>
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={(e) => {
                    handleAddToTracker(selectedJob, e);
                    setSelectedJob(null);
                  }}
                >
                  Add to Application Tracker
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Job Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Add Unlisted Opportunity"
        subtitle="Manually record a job from LinkedIn, college job board, or company site"
        maxWidth="600px"
      >
        <form onSubmit={handleCreateManualJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Job Title"
              value={manualForm.title}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
              placeholder="e.g. Junior Frontend Dev"
              required
            />
            <Input
              label="Company"
              value={manualForm.company}
              onChange={(e) => setManualForm({ ...manualForm, company: e.target.value })}
              placeholder="e.g. Acme Inc."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Type"
              value={manualForm.type}
              onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
              options={['Internship', 'Full-time', 'Part-time', 'Contract']}
            />
            <Select
              label="Work Mode"
              value={manualForm.work_mode}
              onChange={(e) => setManualForm({ ...manualForm, work_mode: e.target.value })}
              options={['Remote', 'Hybrid', 'Onsite']}
            />
            <Select
              label="Experience"
              value={manualForm.experience_level}
              onChange={(e) => setManualForm({ ...manualForm, experience_level: e.target.value })}
              options={['Fresher', 'Junior', 'Mid', 'Senior']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Location"
              value={manualForm.location}
              onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
              placeholder="e.g. Austin, TX or Remote"
            />
            <Input
              label="Salary Range (Optional)"
              value={manualForm.salary_range}
              onChange={(e) => setManualForm({ ...manualForm, salary_range: e.target.value })}
              placeholder="e.g. $70,000 - $85,000 / yr"
            />
          </div>

          <Input
            label="Required Skills (Comma separated)"
            value={manualForm.skills_required}
            onChange={(e) => setManualForm({ ...manualForm, skills_required: e.target.value })}
            placeholder="e.g. React, JavaScript, Git, REST APIs"
          />

          <Input
            label="Application Link / URL"
            value={manualForm.application_url}
            onChange={(e) => setManualForm({ ...manualForm, application_url: e.target.value })}
            placeholder="https://..."
          />

          <Textarea
            label="Description & Notes"
            rows={4}
            value={manualForm.description}
            onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
            placeholder="Paste role description or key qualifications..."
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setShowManualModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingManual}>
              Save Opportunity
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        title="Report Opportunity"
        subtitle="Help keep CareerPilot clean by reporting expired or inaccurate listings"
        maxWidth="450px"
      >
        <form onSubmit={handleReportSubmit}>
          <Textarea
            label="Reason for Reporting"
            rows={3}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="e.g. Expired listing, broken application link, spam..."
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setReportTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
