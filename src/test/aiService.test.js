import { describe, it, expect } from 'vitest';
import {
  calculateJobMatch,
  optimizeResumeBullet,
  generateProfessionalSummary,
  evaluateInterviewAnswer,
  generateResumeFromSimpleDetails,
} from '../services/aiService';

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
      fullName: 'Khushil Thakur',
      skills: { technical: ['Python', 'FastAPI', 'PostgreSQL'] },
      experience: [{ role: 'Backend Intern', company: 'CloudCo' }],
    };

    const summary = await generateProfessionalSummary(candidateInfo);
    expect(summary.text).toContain('Python');
    expect(summary.text).toContain('FastAPI');
  });

  it('dynamically scores interview answers without defaulting to a flat 50%', async () => {
    const question = "Can you explain the difference between 'var', 'let', and 'const' in modern JavaScript?";
    const modelAnswer = "'var' is function-scoped and hoisted with undefined. 'let' and 'const' are block-scoped and exist in temporal dead zone until defined. 'const' cannot be reassigned.";

    // Case 1: Empty answer
    const emptyResult = await evaluateInterviewAnswer({
      question,
      answer: '',
      model_answer: modelAnswer,
    });
    expect(emptyResult.score).toBe(0);
    expect(emptyResult.model_answer).toBe(modelAnswer);

    // Case 2: Dismissive non-answer must NOT get 50%
    const dismissiveResult = await evaluateInterviewAnswer({
      question,
      answer: "i don't know",
      model_answer: modelAnswer,
    });
    expect(dismissiveResult.score).toBeLessThanOrEqual(20);
    expect(dismissiveResult.score).not.toBe(50);
    expect(dismissiveResult.areas_to_improve.length).toBeGreaterThan(0);

    // Case 3: High quality answer with technical concepts
    const goodResult = await evaluateInterviewAnswer({
      question,
      answer: "In modern JavaScript, var is function scoped and hoisted to the top of its scope. In contrast, let and const are block scoped. For example, const cannot be reassigned because it creates an immutable binding, which means it helps prevent unexpected reassignments in production projects.",
      model_answer: modelAnswer,
    });
    expect(goodResult.score).toBeGreaterThanOrEqual(70);
    expect(goodResult.strengths.length).toBeGreaterThan(0);
    expect(goodResult.model_answer).toBe(modelAnswer);
  });

  it('generates structured resume from simple user details', async () => {
    const generated = await generateResumeFromSimpleDetails({
      fullName: 'Khushil Thakur',
      email: 'khushilthakur28@gmail.com',
      phone: '+1 555-0192',
      location: 'San Francisco, CA',
      targetRole: 'Full Stack Engineer',
      education: {
        degree: 'B.S. in Computer Science',
        institution: 'Tech University',
        gradYear: '2026',
      },
      roughExperience: 'Intern at WebCorp: built react frontend, improved load time, connected backend API',
      roughProjects: 'Career Assistant: built web application with React and PostgreSQL for job seekers',
      skills: 'React, JavaScript, Python, PostgreSQL, Git',
      template: 'modern',
    });

    expect(generated.personal_info.fullName).toBe('Khushil Thakur');
    expect(generated.personal_info.email).toBe('khushilthakur28@gmail.com');
    expect(generated.personal_info.summary).toBeDefined();
    expect(generated.education.length).toBe(1);
    expect(generated.education[0].institution).toBe('Tech University');
    expect(generated.experience.length).toBe(1);
    expect(generated.experience[0].bullets.length).toBeGreaterThan(0);
    expect(generated.projects.length).toBe(1);
    expect(generated.skills.technical).toContain('React');
    expect(generated.skills.technical).toContain('PostgreSQL');
  });
});

