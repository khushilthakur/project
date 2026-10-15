// AI Service - Supabase Edge Functions integration with transparent fallback heuristics
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 
  (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '');

// Safe helper to call Supabase Edge Function
async function callEdgeFunction(action, payload) {
  if (!isSupabaseConfigured || !supabase || !FUNCTIONS_URL) {
    return { success: false, reason: 'AI Edge Function not configured' };
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

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
      signal: controller?.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data: data.result };
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
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
  const { experience, skills } = candidateInfo;
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
/**
 * Dynamic, realistic evaluation of candidate interview answers
 * Evaluates concept coverage, depth, reasoning, and STAR structure.
 */
export async function evaluateInterviewAnswer({ question = '', answer = '', role = 'Software Engineer', interview_type = 'Technical', model_answer = '', guidance = '' }) {
  const edgeResult = await callEdgeFunction('evaluate_interview_answer', {
    question,
    answer,
    role,
    interview_type,
    model_answer,
    guidance,
  });

  if (edgeResult.success && edgeResult.data) {
    try {
      const parsed = typeof edgeResult.data === 'string' ? JSON.parse(edgeResult.data) : edgeResult.data;
      return {
        ...parsed,
        model_answer: model_answer || parsed.model_answer,
        source: 'ai',
      };
    } catch {
      return {
        score: 82,
        feedback: edgeResult.data,
        model_answer: model_answer || 'Review industry best practices for structured technical responses.',
        strengths: ['Demonstrated clear communication and technical relevance.'],
        areas_to_improve: ['Consider elaborating with specific metrics or trade-offs.'],
        source: 'ai_text',
      };
    }
  }

  // Fallback intelligent semantic & concept-matching evaluation
  const cleanAnswer = (answer || '').trim();
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;
  const answerLower = cleanAnswer.toLowerCase();

  // Guard against empty or dismissive responses
  if (!cleanAnswer || wordCount === 0) {
    return {
      score: 0,
      feedback: 'No answer provided. In an interview, always attempt an answer by explaining related concepts or stating how you would reason through the problem.',
      model_answer: model_answer || 'Provide a structured explanation addressing the core question principles.',
      strengths: [],
      areas_to_improve: ['Provide a complete response explaining core principles and practical examples.'],
      source: 'evaluation_engine',
    };
  }

  // Dismissive / very short non-answers (e.g. "i don't know", "skip", "no idea", "not sure")
  if (wordCount < 6 || /^(i don'?t know|no idea|not sure|skip|idk|nothing|no|yes)\b/i.test(cleanAnswer)) {
    return {
      score: Math.min(20, Math.max(5, wordCount * 3)),
      feedback: 'Your response is too brief to demonstrate technical competence. High-scoring responses unpack foundational concepts, discuss memory/architectural nuances, and share practical project experience.',
      model_answer: model_answer || 'Explain the core principles and support your response with real-world examples.',
      strengths: [],
      areas_to_improve: [
        'Explain the underlying technical mechanism or behavioral context.',
        'Address the specific keywords and concepts highlighted in the question.',
        'Use the STAR method (Situation, Task, Action, Result) to illustrate your hands-on experience.',
      ],
      source: 'evaluation_engine',
    };
  }

  // Extract core concepts from question, model answer, and guidance
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'with', 'by', 'of',
    'can', 'you', 'explain', 'what', 'how', 'when', 'why', 'where', 'difference', 'between', 'modern',
    'describe', 'tell', 'about', 'would', 'should', 'from', 'into', 'that', 'this', 'these', 'those',
    'your', 'their', 'our', 'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'just', 'more', 'most', 'some', 'any', 'such', 'than', 'then', 'very'
  ]);

  const extractKeywords = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9_\-#+.]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  };

  const questionKeywords = extractKeywords(question);
  const modelKeywords = extractKeywords(model_answer);
  const guidanceKeywords = extractKeywords(guidance);

  // Union of key domain concepts
  const keyDomainConcepts = Array.from(new Set([...questionKeywords, ...modelKeywords, ...guidanceKeywords]));

  // Match candidate answer against key domain concepts
  const matchedConcepts = keyDomainConcepts.filter((concept) => {
    return answerLower.includes(concept);
  });

  // Calculate concept coverage ratio based on key distinct domain concepts
  const conceptTarget = Math.max(3, Math.min(keyDomainConcepts.length, 6));
  const conceptCoverageRatio = keyDomainConcepts.length > 0
    ? Math.min(1, matchedConcepts.length / conceptTarget)
    : 0.5;

  // Reasoning and cause-and-effect indicators
  const reasoningMatches = (answerLower.match(/\b(because|therefore|as a result|specifically|for example|such as|in contrast|whereas|however|which means|trade-off|performance|benefit|leading to|advantage)\b/g) || []).length;

  // Practical implementation / STAR markers
  const practicalMatches = (answerLower.match(/\b(project|implemented|designed|built|handled|optimized|experience|situation|faced|measured|debugged|scaled|deployed)\b/g) || []).length;

  // Calculate dynamic score components
  // 1. Concept coverage (0 - 55 points)
  let score = Math.round(conceptCoverageRatio * 55);

  // 2. Depth and word count (0 - 20 points)
  if (wordCount >= 60) score += 20;
  else if (wordCount >= 35) score += 15;
  else if (wordCount >= 20) score += 10;
  else score += 5;

  // 3. Reasoning and trade-offs (0 - 15 points)
  score += Math.min(15, reasoningMatches * 5);

  // 4. Practical examples (0 - 10 points)
  score += Math.min(10, practicalMatches * 5);

  // Clamp realistic score between 15 and 96
  score = Math.max(15, Math.min(96, score));

  // Determine strengths
  const strengths = [];
  if (matchedConcepts.length > 0) {
    const displayConcepts = matchedConcepts.slice(0, 4).map((c) => `"${c}"`).join(', ');
    strengths.push(`Addressed core question concepts: ${displayConcepts}`);
  }
  if (reasoningMatches > 0) {
    strengths.push('Articulated cause-and-effect reasoning and technical justification.');
  }
  if (practicalMatches > 0) {
    strengths.push('Incorporated real-world project context or implementation experience.');
  }
  if (wordCount >= 50) {
    strengths.push('Provided a comprehensive, well-elaborated response.');
  }

  // Determine areas to improve
  const areas_to_improve = [];
  const missingImportant = keyDomainConcepts.filter((c) => !answerLower.includes(c)).slice(0, 3);
  if (missingImportant.length > 0) {
    areas_to_improve.push(`Mention key principles such as ${missingImportant.map((m) => `"${m}"`).join(', ')} to provide complete depth.`);
  }
  if (reasoningMatches === 0) {
    areas_to_improve.push('Include cause-and-effect phrases (e.g., "because", "as a result", "in contrast") to demonstrate architectural thinking.');
  }
  if (practicalMatches === 0) {
    areas_to_improve.push('Reference a practical scenario or project challenge where you applied this principle in code.');
  }
  if (wordCount < 40) {
    areas_to_improve.push('Expand your explanation with more technical nuance rather than a high-level definition.');
  }

  // Formulate tailored feedback paragraph
  let feedback = '';
  if (score >= 80) {
    feedback = `Exceptional response! You effectively addressed the core principles of the question with strong clarity and technical depth. ${strengths[0] || ''}`;
  } else if (score >= 60) {
    feedback = `Solid answer demonstrating good foundational knowledge. To reach top-tier interview standards, integrate more specific architectural trade-offs and concrete implementation examples.`;
  } else {
    feedback = `Your answer touches upon the topic but lacks technical depth and precision. Focus on explaining the mechanics in detail and contrasting alternatives.`;
  }

  return {
    score,
    feedback,
    model_answer: model_answer || 'A stellar answer addresses the core question directly, followed by specific technical nuances, and concludes with an example from production or personal project experience.',
    strengths,
    areas_to_improve,
    source: 'evaluation_engine',
  };
}

/**
 * AI Resume Generator from Simple User Details
 * Turns rough, unstructured user notes into a polished ATS-compliant resume
 */
export async function generateResumeFromSimpleDetails({
  fullName = '',
  email = '',
  phone = '',
  location = '',
  targetRole = 'Software Engineer',
  education = { degree: '', institution: '', gradYear: '' },
  roughExperience = '',
  roughProjects = '',
  roughSummary = '',
  skills = '',
  template = 'modern',
}) {
  const edgeResult = await callEdgeFunction('generate_resume_from_details', {
    fullName,
    email,
    phone,
    location,
    targetRole,
    education,
    roughExperience,
    roughProjects,
    roughSummary,
    skills,
    template,
  });

  if (edgeResult.success && edgeResult.data) {
    try {
      const parsed = typeof edgeResult.data === 'string' ? JSON.parse(edgeResult.data) : edgeResult.data;
      return parsed;
    } catch {
      // Fall through to reliable local synthesizer
    }
  }

  // 1. Synthesize Professional Summary
  const cleanSkills = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const topSkillsStr = cleanSkills.slice(0, 4).join(', ') || 'modern software development';
  let summary = roughSummary.trim();
  if (!summary) {
    summary = `Motivated and results-driven ${targetRole} with hands-on proficiency in ${topSkillsStr}. Skilled in engineering maintainable, high-performance web applications and collaborating across agile workflows. Passionate about leveraging software best practices to solve complex technical problems.`;
  } else if (summary.length < 80) {
    summary = `Results-oriented ${targetRole} skilled in ${topSkillsStr}. ${summary.replace(/[.]+$/, '')}. Committed to engineering clean, robust solutions and delivering measurable business impact.`;
  }

  // 2. Synthesize Experience & STAR Bullet Points
  const experiences = [];
  if (roughExperience.trim()) {
    const lines = roughExperience.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets = [];

    lines.forEach((line) => {
      let b = line.replace(/^[-*•0-9.)\s]+/, '').trim();
      if (!b) return;

      // Transform into strong STAR bullet
      if (/^(worked on|helped with|responsible for|did|assisted|handled)/i.test(b)) {
        b = b.replace(/^(worked on|helped with|responsible for|did|assisted|handled)\s*/i, 'Spearheaded ');
      } else if (!/^[A-Z][a-z]+ed\b/.test(b)) {
        b = `Engineered ${b.charAt(0).toLowerCase() + b.slice(1)}`;
      }
      if (!/[.!?]$/.test(b)) {
        b += ', ensuring responsive user experience and robust system reliability.';
      }
      bullets.push(b);
    });

    experiences.push({
      id: 'exp-' + Date.now(),
      role: targetRole,
      company: 'Engineering Internship / Project Experience',
      location: location || 'Remote',
      start_date: '2025',
      end_date: 'Present',
      current: true,
      bullets: bullets.length > 0 ? bullets : [
        `Engineered robust ${targetRole} components with ${topSkillsStr}, optimizing execution speed and codebase maintainability.`,
        'Collaborated with cross-functional peers to implement responsive user interfaces and integrate secure RESTful APIs.'
      ],
    });
  }

  // 3. Synthesize Projects
  const projects = [];
  if (roughProjects.trim()) {
    const projectBlocks = roughProjects.split(/\n\s*\n/).filter(Boolean);
    projectBlocks.forEach((block, idx) => {
      const pLines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const titleLine = pLines[0] || `${targetRole} Portfolio Project`;
      const descLines = pLines.slice(1).join(' ') || pLines[0];

      let bullet1 = `Architected full-featured application implementing ${topSkillsStr}, delivering sub-second response times and seamless UX.`;
      let bullet2 = `Designed and deployed scalable data flow pipelines with persistent database storage and automated error handling.`;

      if (descLines) {
        bullet1 = `Developed ${descLines.replace(/^[-*•\s]+/, '')}, ensuring modular code architecture and comprehensive unit test coverage.`;
      }

      projects.push({
        id: 'proj-' + Date.now() + '-' + idx,
        title: titleLine.replace(/^[-*•\s]+/, ''),
        tech_stack: cleanSkills.slice(0, 5).join(', ') || 'React, JavaScript, PostgreSQL',
        link: '',
        description: descLines || titleLine,
        bullets: [bullet1, bullet2],
      });
    });
  } else {
    // Generate starter project aligned with target role
    projects.push({
      id: 'proj-' + Date.now(),
      title: `${targetRole} Application Suite`,
      tech_stack: cleanSkills.slice(0, 4).join(', ') || 'React, Node.js, PostgreSQL',
      link: '',
      description: `End-to-end full stack application showcasing ${topSkillsStr}.`,
      bullets: [
        `Designed and built responsive application architecture utilizing ${topSkillsStr}, maintaining 100% test pass rate.`,
        'Integrated clean database queries and state management for scalable, high-throughput user interactions.',
      ],
    });
  }

  // 4. Synthesize Education
  const educationList = [];
  if (education?.institution || education?.degree) {
    educationList.push({
      id: 'edu-' + Date.now(),
      degree: education.degree || 'Bachelor of Science in Computer Science',
      institution: education.institution || 'Accredited University',
      location: location || '',
      start_date: '2022',
      end_date: education.gradYear || '2026',
      gpa: '',
      highlights: `Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems.`,
    });
  }

  // 5. Structure Skills
  const technicalSkills = cleanSkills.length > 0 ? cleanSkills : ['JavaScript', 'React', 'HTML5', 'CSS3', 'Git'];
  const softSkills = ['Agile Collaboration', 'Critical Problem Solving', 'Technical Documentation', 'Code Review'];
  const devTools = ['Git', 'GitHub', 'VS Code', 'Postman', 'Vite'];

  return {
    id: 'res-' + Date.now(),
    title: `${fullName.trim() ? fullName.trim() + ' - ' : ''}${targetRole} Resume`,
    template: template || 'modern',
    personal_info: {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      linkedin: '',
      github: '',
      portfolio: '',
      summary,
    },
    education: educationList,
    experience: experiences,
    projects,
    skills: {
      technical: technicalSkills,
      soft: softSkills,
      tools: devTools,
      languages: ['English'],
    },
    certifications: [],
    achievements: [],
    is_default: false,
    created_at: new Date().toISOString(),
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

  // Comprehensive tech dictionary for normalization
  const TECH_SKILLS = [
    'javascript', 'typescript', 'react', 'node.js', 'python', 'sql', 'postgresql', 'mongodb',
    'docker', 'aws', 'git', 'github', 'html5', 'css3', 'tailwind', 'rest api', 'graphql',
    'next.js', 'vue', 'vitest', 'jest', 'ci/cd', 'linux', 'data structures', 'algorithms',
    'fastapi', 'express', 'figma', 'ui/ux', 'agile', 'scrum', 'system design',
    'java', 'c++', 'c#', 'c', 'golang', 'go', 'rust', 'kotlin', 'swift', 'flutter', 'dart',
    'php', 'ruby', 'rails', 'spring', 'spring boot', 'django', 'flask', 'angular', 'svelte',
    'react native', 'redux', 'zustand', 'bootstrap', 'sass', 'webpack', 'vite', 'redis',
    'mysql', 'sqlite', 'oracle', 'firebase', 'supabase', 'kafka', 'rabbitmq', 'microservices',
    'kubernetes', 'terraform', 'gcp', 'azure', 'devops', 'machine learning', 'pytorch',
    'tensorflow', 'pandas', 'numpy', 'cypress', 'playwright', 'selenium'
  ];

  // Candidate skills pool (from skills array + resume text)
  const candidatePool = new Set(
    candidateSkills.map((s) => s.toLowerCase().trim()).filter(Boolean)
  );

  // Extract skills mentioned in the job description: tech dictionary + any candidate skills in JD
  const detectedSkillsSet = new Set();
  TECH_SKILLS.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(jdLower)) {
      detectedSkillsSet.add(skill);
    }
  });

  // Also include any user-specified skills if they appear in the job description
  candidateSkills.forEach((skill) => {
    const sClean = skill.toLowerCase().trim();
    if (sClean && sClean.length >= 2) {
      const escaped = sClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(jdLower)) {
        detectedSkillsSet.add(sClean);
      }
    }
  });

  const jdRequiredSkills = Array.from(detectedSkillsSet);

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
