import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';

export function ResumePreview({ resume, previewId = 'resume-export-preview' }) {
  if (!resume) return null;

  const {
    template = 'modern',
    personal_info = {},
    education = [],
    experience = [],
    projects = [],
    skills = {},
    certifications = [],
    achievements = [],
  } = resume;

  // Base styling for PDF container (White background, black/dark charcoal text for ATS compliance)
  const containerStyle = {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2.5rem',
    borderRadius: '4px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    fontFamily: template === 'minimal' ? '"Georgia", serif' : '"Plus Jakarta Sans", sans-serif',
    lineHeight: 1.5,
    minHeight: '1050px',
  };

  // Render Modern Template
  const renderModern = () => (
    <div id={previewId} style={containerStyle}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #4F46E5', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
          {personal_info.fullName || 'Your Full Name'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: '#475569' }}>
          {personal_info.email && <span>✉️ {personal_info.email}</span>}
          {personal_info.phone && <span>📞 {personal_info.phone}</span>}
          {personal_info.location && <span>📍 {personal_info.location}</span>}
          {personal_info.linkedin && <span>🔗 {personal_info.linkedin}</span>}
          {personal_info.github && <span>💻 {personal_info.github}</span>}
          {personal_info.portfolio && <span>🌐 {personal_info.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal_info.summary && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#334155', textAlign: 'justify', lineHeight: 1.5 }}>
            {personal_info.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills?.technical && skills.technical.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
            Skills & Competencies
          </h2>
          <div style={{ fontSize: '0.8125rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>
              <strong>Technical Skills: </strong>
              {skills.technical.join(', ')}
            </div>
            {skills.tools && skills.tools.length > 0 && (
              <div>
                <strong>Developer Tools: </strong>
                {skills.tools.join(', ')}
              </div>
            )}
            {skills.soft && skills.soft.length > 0 && (
              <div>
                <strong>Soft Skills: </strong>
                {skills.soft.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Experience & Internships
          </h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                  {exp.role} — <span style={{ color: '#4338CA' }}>{exp.company}</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  {exp.start_date} – {exp.current ? 'Present' : exp.end_date} | {exp.location}
                </span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: '#334155' }}>
                {exp.bullets?.map((b, bi) => (
                  <li key={bi} style={{ marginBottom: '0.2rem' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                  {proj.title} {proj.tech_stack && <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 500 }}>({proj.tech_stack})</span>}
                </span>
                {proj.link && <span style={{ fontSize: '0.75rem', color: '#4F46E5' }}>{proj.link}</span>}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>{proj.description}</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: '#334155' }}>
                {proj.bullets?.map((b, bi) => (
                  <li key={bi} style={{ marginBottom: '0.2rem' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{edu.degree}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                  {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                {edu.start_date} – {edu.end_date} | {edu.location}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications & Achievements */}
      {certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
            Certifications
          </h2>
          <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
            {certifications.map((c, ci) => (
              <span key={ci}>
                <strong>{c.name}</strong> ({c.issuer}, {c.issue_date}){ci < certifications.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Minimalist Template
  const renderMinimal = () => (
    <div id={previewId} style={{ ...containerStyle, border: '1px solid #E2E8F0', padding: '3rem 2.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 600, color: '#111827', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {personal_info.fullName || 'Your Full Name'}
        </h1>
        <div style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {personal_info.email && <span>{personal_info.email}</span>}
          {personal_info.phone && <span>• {personal_info.phone}</span>}
          {personal_info.location && <span>• {personal_info.location}</span>}
          {personal_info.github && <span>• {personal_info.github}</span>}
        </div>
      </div>

      {personal_info.summary && (
        <div style={{ marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic', maxWidth: '650px', margin: '0 auto' }}>
            "{personal_info.summary}"
          </p>
        </div>
      )}

      <div style={{ borderTop: '1px solid #111827', paddingTop: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Experience
        </h3>
        {experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <strong>{exp.role}, {exp.company}</strong>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{exp.start_date} – {exp.current ? 'Present' : exp.end_date}</span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.375rem', fontSize: '0.8125rem', color: '#374151' }}>
              {exp.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #111827', paddingTop: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Education
        </h3>
        {education.map((edu, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
            <span><strong>{edu.degree}</strong>, {edu.institution}</span>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{edu.start_date} – {edu.end_date}</span>
          </div>
        ))}
      </div>

      {skills?.technical && (
        <div style={{ borderTop: '1px solid #111827', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Technical Expertise
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#374151' }}>{skills.technical.join(' • ')}</p>
        </div>
      )}
    </div>
  );

  // Render Tech Template
  const renderTech = () => (
    <div id={previewId} style={{ ...containerStyle, borderLeft: '6px solid #10B981' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
            &gt; {personal_info.fullName || 'Engineer'}
          </h1>
          <div style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            Software Engineer / Developer
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'right' }}>
          <div>{personal_info.email}</div>
          <div>{personal_info.github} • {personal_info.location}</div>
        </div>
      </div>

      {/* Tech Skills Highlighted First */}
      {skills?.technical && (
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            [STACK &amp; LANGUAGES]
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
            {skills.technical.join(' | ')}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Featured Software Projects
          </div>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>{p.title} <span style={{ color: '#059669', fontSize: '0.75rem' }}>[{p.tech_stack}]</span></span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.link}</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#334155', marginTop: '0.2rem' }}>
                {p.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Work Experience
          </div>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>{e.role} @ {e.company}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{e.start_date} – {e.current ? 'Present' : e.end_date}</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#334155', marginTop: '0.2rem' }}>
                {e.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Education
          </div>
          {education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span><strong>{edu.degree}</strong> — {edu.institution}</span>
              <span style={{ color: '#64748B' }}>{edu.start_date} – {edu.end_date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (template === 'minimal') return renderMinimal();
  if (template === 'tech') return renderTech();
  return renderModern();
}
