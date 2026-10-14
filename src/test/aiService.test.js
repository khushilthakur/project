import { describe, it, expect } from 'vitest';
import { calculateJobMatch, optimizeResumeBullet, generateProfessionalSummary } from '../services/aiService';

describe('AI & Skill Matcher Algorithms', () => {
  it('calculates job match score and separates matching vs missing skills accurately', () => {
    const jobDescription = `
      We are looking for a Junior React Developer with experience in JavaScript,
      React, Node.js, and PostgreSQL. Familiarity with Docker and Git is a plus.
    `;
    const candidateSkills = ['JavaScript', 'React', 'Git'];

    const result = calculateJobMatch(jobDescription, candidateSkills);

    expect(result.matchScore).toBeGreaterThan(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(result.matchingSkills).toContain('Javascript');
    expect(result.matchingSkills).toContain('React');
    expect(result.matchingSkills).toContain('Git');
    expect(result.missingSkills).toContain('Postgresql');
    expect(result.missingSkills).toContain('Node.js');
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.disclaimer).toBeDefined();
  });

  it('handles empty job description safely with zero match score', () => {
    const result = calculateJobMatch('', ['React']);
    expect(result.matchScore).toBe(0);
    expect(result.matchingSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
  });

  it('optimizes passive bullet point into action-driven STAR statement', async () => {
    const passiveBullet = 'helped with building responsive user interface components';
    const optimized = await optimizeResumeBullet(passiveBullet, 'Frontend Developer');

    expect(optimized.text).toBeDefined();
    expect(optimized.text.length).toBeGreaterThan(passiveBullet.length);
    expect(optimized.text).not.toMatch(/^helped with/i);
  });

  it('generates factual professional summary based on candidate profile', async () => {
    const candidateInfo = {
      fullName: 'Jane Doe',
      skills: { technical: ['Python', 'FastAPI', 'PostgreSQL'] },
      experience: [{ role: 'Backend Intern', company: 'CloudCo' }],
    };

    const summary = await generateProfessionalSummary(candidateInfo);
    expect(summary.text).toContain('Python');
    expect(summary.text).toContain('FastAPI');
  });
});
