// AI Service - Supabase Edge Functions integration with transparent fallback heuristics
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
  (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '');

// Safe helper to call Supabase Edge Function
async function callEdgeFunction(action, payload) {
  if (!isSupabaseConfigured || !supabase || !FUNCTIONS_URL) {
    return { success: false, reason: 'AI Edge Function not configured' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${FUNCTIONS_URL}/ai-career-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: data.result };
  } catch (error) {
    console.warn('Edge function invocation failed, falling back:', error);
    return { success: false, error: error.message };
  }
}

/**
 * AI Professional Summary Generator
 */
export async function generateProfessionalSummary(candidateInfo) {
  const edgeResult = await callEdgeFunction('generate_summary', candidateInfo);
  if (edgeResult.success && edgeResult.data) {
    return { text: edgeResult.data, source: 'ai' };
  }

  // Fallback intelligent summary synthesis preserving user's factual data
  const { fullName, education, experience, skills } = candidateInfo;
  const topSkills = Array.isArray(skills?.technical) && skills.technical.length > 0
    ? skills.technical.slice(0, 4).join(', ')
    : 'modern software development';

  const expLevel = experience && experience.length > 0 ? 'hands-on internship and project' : 'academic and project-based';
  const roleTarget = 'software engineering and technology';

  const fallbackSummary = `Results-oriented professional with ${expLevel} background in ${roleTarget}. Proficient in ${topSkills}, with demonstrated capability in architecting clean, maintainable code and solving complex technical challenges. Dedicated to continuous learning and eager to contribute high-impact solutions to forward-thinking engineering teams.`;

  return { text: fallbackSummary, source: 'fallback' };
}

/**
 * AI Bullet Point Optimizer (STAR Method)
 */
export async function optimizeResumeBullet(bullet, role = 'Software Engineer') {
  if (!bullet || bullet.trim().length === 0) return { text: '', source: 'empty' };

  const edgeResult = await callEdgeFunction('optimize_bullet', { bullet, role });
  if (edgeResult.success && edgeResult.data) {
    return { text: edgeResult.data.trim().replace(/^["']|["']$/g, ''), source: 'ai' };
  }

  // Fallback STAR transformation
  const clean = bullet.trim();
  const strongVerbs = ['Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Implemented', 'Refactored'];
  const randomVerb = strongVerbs[Math.floor(Math.random() * strongVerbs.length)];

  let transformed = clean;
  // If starts with passive "worked on", "helped", "did"
  if (/^(worked on|helped with|responsible for|did|assisted in)/i.test(clean)) {
    transformed = clean.replace(/^(worked on|helped with|responsible for|did|assisted in)\s*/i, `${randomVerb} `);
  } else if (!/^[A-Z][a-z]+ed\b/.test(clean)) {
    transformed = `${randomVerb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
  }

  if (!/[.!?]$/.test(transformed)) {
    transformed += ', improving overall project efficiency and test coverage.';
  }

  return { text: transformed, source: 'fallback' };
}

/**
 * Evaluate Interview Answer
 */
export async function evaluateInterviewAnswer({ question, answer, role, interview_type }) {
  const edgeResult = await callEdgeFunction('evaluate_interview_answer', {
    question,
    answer,
    role,
    interview_type,
  });

  if (edgeResult.success && edgeResult.data) {
    try {
      const parsed = typeof edgeResult.data === 'string' ? JSON.parse(edgeResult.data) : edgeResult.data;
      return { ...parsed, source: 'ai' };
    } catch {
      // If AI returned raw text
      return {
        score: 82,
        feedback: edgeResult.data,
        model_answer: 'Review industry best practices for structured technical responses.',
        source: 'ai_text',
      };
    }
  }

  // Fallback intelligent heuristic evaluation
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  let score = 50;
  const strengths = [];
  const areas_to_improve = [];

  if (wordCount > 60) {
    score += 25;
    strengths.push('Detailed, comprehensive explanation with context');
  } else if (wordCount > 30) {
    score += 15;
    strengths.push('Concise and direct response');
  } else {
    areas_to_improve.push('Response is very brief; consider elaborating with concrete project examples or architectural reasons.');
  }

  // Check for technical keywords or STAR terms
  if (/\b(because|result|implemented|architecture|impact|for example|led to)\b/i.test(answer)) {
    score += 15;
    strengths.push('Good use of rationale and cause-and-effect reasoning');
  } else {
    areas_to_improve.push('Incorporate specific metrics, consequences, or real-world project outcomes to strengthen credibility.');
  }

  score = Math.min(score, 94);

  return {
    score,
    feedback: `Your answer demonstrates solid foundational understanding. ${wordCount > 50 ? 'You effectively communicated key concepts.' : 'Consider expanding your answer with more depth and structure.'} To achieve higher impact, structure your answer using the STAR technique (Situation, Task, Action, Result) and mention concrete trade-offs or technical decisions.`,
    model_answer: 'A stellar answer addresses the core question directly in the opening sentence, followed by specific technical nuances (e.g., scoping, memory implications, performance diffs), and concludes with an example from production or personal project experience.',
    strengths,
    areas_to_improve,
    source: 'fallback_engine',
  };
}

/**
 * Transparent Skill Matching Algorithm
 */
export function calculateJobMatch(jobDescription, candidateSkills = [], resumeText = '') {
  if (!jobDescription) {
    return {
      matchScore: 0,
      matchingSkills: [],
      missingSkills: [],
      recommendations: [],
    };
  }

  const jdLower = jobDescription.toLowerCase();

  // Common tech dictionary for normalization
  const TECH_SKILLS = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'sql', 'postgresql', 'mongodb',
    'docker', 'aws', 'git', 'github', 'html5', 'css3', 'tailwind', 'rest api', 'graphql',
    'next.js', 'vue', 'vitest', 'jest', 'ci/cd', 'linux', 'data structures', 'algorithms',
    'fastapi', 'express', 'figma', 'ui/ux', 'agile', 'scrum', 'system design'
  ];

  // Extract skills mentioned in the job description
  const jdRequiredSkills = TECH_SKILLS.filter((skill) => {
    const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
    return regex.test(jdLower);
  });

  // Candidate skills pool (from skills array + resume text)
  const candidatePool = new Set(
    candidateSkills.map((s) => s.toLowerCase().trim()).filter(Boolean)
  );

  if (resumeText) {
    TECH_SKILLS.forEach((skill) => {
      const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(resumeText.toLowerCase())) {
        candidatePool.add(skill);
      }
    });
  }

  const matchingSkills = [];
  const missingSkills = [];

  jdRequiredSkills.forEach((skill) => {
    let matched = false;
    for (const userSkill of candidatePool) {
      if (userSkill.includes(skill) || skill.includes(userSkill)) {
        matched = true;
        break;
      }
    }
    if (matched) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const totalRequired = jdRequiredSkills.length;
  let matchScore = 0;
  if (totalRequired > 0) {
    matchScore = Math.round((matchingSkills.length / totalRequired) * 100);
  } else {
    // If no specific keyword detected, fallback to overlap percentage
    matchScore = candidatePool.size > 0 ? 70 : 40;
  }

  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push(
      `Consider adding hands-on evidence for: ${missingSkills.slice(0, 3).join(', ')} to your resume or projects.`
    );
  }
  if (matchScore >= 80) {
    recommendations.push('Strong skill alignment! Tailor your project bullet points to emphasize these matching competencies.');
  } else if (matchScore >= 50) {
    recommendations.push('Moderate alignment. Highlight transferable fundamentals and consider completing a focused mini-project addressing missing skills.');
  } else {
    recommendations.push('Low direct keyword overlap. Review the requirements and consider adding corresponding coursework or portfolio work before applying.');
  }

  return {
    matchScore,
    matchingSkills: matchingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    recommendations,
    disclaimer: 'This score is an automated algorithmic estimate based on detected keyword overlap and is not a guarantee of hiring success.',
  };
}
