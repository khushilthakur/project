// Default seed data, templates, and question banks for CareerPilot

export const INITIAL_CURATED_JOBS = [
  {
    id: "job-1",
    title: "Junior Frontend Developer (React / JavaScript)",
    company: "Nexus Labs Inc.",
    location: "San Francisco, CA / Remote",
    work_mode: "Remote",
    type: "Full-time",
    experience_level: "Fresher",
    salary_range: "$70,000 - $85,000 / yr",
    skills_required: ["JavaScript", "React", "HTML5", "CSS3", "Git", "REST APIs"],
    description: "Join our fast-growing UI engineering team building next-generation SaaS tools. You will implement responsive interfaces, collaborate with UX designers, and write clean, maintainable modular React code.",
    eligibility: "Recent graduates or self-taught developers with strong JavaScript & React portfolio projects.",
    application_url: "https://example.com/careers/nexus-frontend",
    source: "CareerPilot Verified Partner",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "job-2",
    title: "Software Engineer Intern (Summer 2026)",
    company: "CloudScale Systems",
    location: "Austin, TX",
    work_mode: "Hybrid",
    type: "Internship",
    experience_level: "Fresher",
    salary_range: "$38 - $48 / hr",
    skills_required: ["Python", "PostgreSQL", "Docker", "Linux", "Data Structures", "Algorithms"],
    description: "Work alongside senior backend engineers building scalable cloud microservices, database optimizations, and telemetry pipelines. Real hands-on production code from day one.",
    eligibility: "Currently enrolled in Bachelor's or Master's in Computer Science or related degree graduating 2026/2027.",
    application_url: "https://example.com/careers/cloudscale-intern",
    source: "University Campus Portal",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "job-3",
    title: "Associate Full Stack Engineer",
    company: "FinTech Pulse",
    location: "New York, NY",
    work_mode: "Hybrid",
    type: "Full-time",
    experience_level: "Junior",
    salary_range: "$82,000 - $96,000 / yr",
    skills_required: ["React", "Node.js", "PostgreSQL", "TypeScript", "TailwindCSS", "Jest"],
    description: "Develop high-throughput customer dashboards and payment processing integrations. Emphasis on code testability, security, and responsive financial charts.",
    eligibility: "0-2 years of experience with modern web applications and relational databases.",
    application_url: "https://example.com/careers/fintech-pulse-assoc",
    source: "CareerPilot Curated",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "job-4",
    title: "AI / ML Engineering Intern",
    company: "CognitiveWorks AI",
    location: "Seattle, WA / Remote",
    work_mode: "Remote",
    type: "Internship",
    experience_level: "Fresher",
    salary_range: "$42 - $55 / hr",
    skills_required: ["Python", "PyTorch", "FastAPI", "LLM Prompting", "Vector Databases", "Hugging Face"],
    description: "Assist in evaluating large language model responses, fine-tuning retrieval augmented generation (RAG) pipelines, and deploying model inference endpoints.",
    eligibility: "Strong mathematical foundation, proficiency in Python, and demonstrated passion for generative AI applications.",
    application_url: "https://example.com/careers/cognitiveworks-ai-intern",
    source: "AI Fellowship Network",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "job-5",
    title: "Junior Product Designer (UI/UX)",
    company: "Aura Studio",
    location: "Chicago, IL / Remote",
    work_mode: "Remote",
    type: "Full-time",
    experience_level: "Fresher",
    salary_range: "$65,000 - $78,000 / yr",
    skills_required: ["Figma", "UI/UX Design", "Wireframing", "User Research", "Design Systems", "Prototyping"],
    description: "Craft intuitive user experiences, design accessible component libraries in Figma, conduct user interviews, and hand off specifications to frontend teams.",
    eligibility: "Strong portfolio demonstrating end-to-end design process, usability testing, and visual design craft.",
    application_url: "https://example.com/careers/aura-studio-junior-designer",
    source: "Dribbble Talent",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "job-6",
    title: "Graduate QA Automation Engineer",
    company: "Veritas Tech",
    location: "Boston, MA",
    work_mode: "Onsite",
    type: "Full-time",
    experience_level: "Fresher",
    salary_range: "$68,000 - $82,000 / yr",
    skills_required: ["Selenium", "Cypress", "JavaScript", "Python", "CI/CD", "API Testing"],
    description: "Build and maintain automated test suites for enterprise web applications, perform regression testing, and integrate end-to-end test suites into GitHub Actions pipelines.",
    eligibility: "Degree in Computer Science, IT, or certified QA bootcamp graduate with strong programming fundamentals.",
    application_url: "https://example.com/careers/veritas-qa-engineer",
    source: "CareerPilot Curated",
    is_verified: true,
    is_reported: false,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  }
];

export const SAMPLE_RESUME = {
  id: "res-starter-1",
  title: "Professional Resume",
  template: "modern",
  personal_info: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: ""
  },
  education: [],
  experience: [],
  projects: [],
  skills: {
    technical: [],
    soft: [],
    tools: [],
    languages: []
  },
  certifications: [],
  achievements: [],
  is_default: true,
  created_at: new Date().toISOString()
};

export const INTERVIEW_QUESTIONS_DATABASE = {
  Technical: {
    Beginner: [
      {
        question: "Can you explain the difference between 'var', 'let', and 'const' in modern JavaScript?",
        category: "JavaScript Fundamentals",
        guidance: "Mention scoping (function vs block), hoisting behaviors, and immutability of bindings.",
        model_answer: "'var' is function-scoped and hoisted with an initial value of undefined, allowing re-declaration. 'let' and 'const' were introduced in ES6 and are block-scoped, existing in a Temporal Dead Zone until declared. 'let' can be reassigned, whereas 'const' cannot be reassigned (though objects or arrays bound to a const can still have their contents mutated)."
      },
      {
        question: "What is the Virtual DOM in React, and how does it improve web application rendering performance?",
        category: "React Architecture",
        guidance: "Highlight in-memory representation, reconciliation / diffing algorithm, and batching DOM mutations.",
        model_answer: "The Virtual DOM is a lightweight in-memory JavaScript representation of the real DOM. When component state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), and batches only the necessary minimal updates to the real browser DOM, avoiding expensive direct layout reflows."
      },
      {
        question: "How do relational databases differ from NoSQL databases, and when would you choose PostgreSQL?",
        category: "Databases & Storage",
        guidance: "Discuss ACID guarantees, schema enforcement, joins, and relational integrity.",
        model_answer: "Relational databases like PostgreSQL organize data in structured tables with strict schemas and foreign keys, providing full ACID transactional compliance. NoSQL databases offer flexible, schemaless documents or key-value stores. PostgreSQL is the premier choice when data integrity, complex relational queries, foreign constraints, and financial/audit compliance are required."
      }
    ],
    Intermediate: [
      {
        question: "Explain the React component lifecycle or useEffect hook dependency array nuances. How do you prevent memory leaks?",
        category: "React Advanced",
        guidance: "Mention cleanup functions, stale closures, subscription teardowns, and dependency array linting.",
        model_answer: "The useEffect hook executes side effects after render. If dependencies are omitted or misconfigured, stale closures can capture outdated state values. To prevent memory leaks from active subscriptions, event listeners, or timers, the effect must return a cleanup function that cancels the timer, aborts the fetch request via AbortController, or unsubscribes before re-running or unmounting."
      },
      {
        question: "How does Row Level Security (RLS) in PostgreSQL safeguard multi-tenant data, and how does it integrate with Supabase Auth?",
        category: "Backend Security",
        guidance: "Discuss auth.uid(), policy expressions (SELECT, INSERT, UPDATE, DELETE), and bypassing vs enforcing.",
        model_answer: "Row Level Security enables table policies evaluated at query execution time. With Supabase, each client request carries a JWT containing the user's ID. PostgreSQL evaluates policies using 'auth.uid() = user_id', ensuring that even if a client attempts a raw query, the database engine filters out rows belonging to other users automatically."
      },
      {
        question: "What strategies do you employ to optimize web application load performance and Core Web Vitals?",
        category: "Performance Engineering",
        guidance: "Cover code splitting (React.lazy), asset compression, lazy loading images, memoization, and caching.",
        model_answer: "Key strategies include dynamic route-based code splitting using React.lazy and Suspense to minimize initial bundle size, modern WebP/SVG image formats with lazy loading, caching API responses, tree-shaking unused dependencies, and using React.memo or useMemo only where profiling proves expensive renders."
      }
    ],
    Advanced: [
      {
        question: "Design an end-to-end resilient background job processing architecture for high-volume notification delivery.",
        category: "System Design",
        guidance: "Discuss message queues (RabbitMQ/SQS), idempotency keys, dead-letter queues, rate limits, and exponential backoff.",
        model_answer: "A resilient pipeline uses an event broker or message queue where job publishers push structured payloads containing a unique idempotency key. Worker pools consume tasks concurrently, utilizing exponential backoff retry policies for transient failures. Messages that fail repeatedly are diverted to a Dead Letter Queue (DLQ) for alerting and manual inspection, preventing message loss."
      }
    ]
  },
  "HR / Behavioral": {
    Beginner: [
      {
        question: "Tell me about yourself, your educational journey, and what inspired you to pursue a career in software development.",
        category: "Introduction & Motivation",
        guidance: "Use the Present-Past-Future structure: who you are now, what you studied and built, and why this position aligns with your goals.",
        model_answer: "I am a recent Computer Science graduate passionate about building intuitive web applications that solve tangible problems. During my studies, I led several collaborative projects involving React and database design, which solidified my passion for UI engineering. I am eager to contribute my strong work ethic and continuous learning mindset to your engineering team."
      },
      {
        question: "Describe a challenging bug or technical hurdle you encountered in a project. How did you diagnose and overcome it?",
        category: "Problem Solving (STAR)",
        guidance: "Use STAR (Situation, Task, Action, Result). State the bug, your debugging methodology, and the measurable outcome.",
        model_answer: "In my task tracker project, we noticed rapid state updates caused race conditions in task ordering. My task was to stabilize the pipeline. I utilized browser profilers and network logs to isolate the issue, implemented optimistic UI updates combined with request debouncing, and resolved the discrepancy. This eliminated user-reported errors and improved UI response time by 40%."
      }
    ],
    Intermediate: [
      {
        question: "Tell me about a time you had a disagreement with a teammate or team lead regarding a technical decision. How did you resolve it?",
        category: "Conflict Resolution & Collaboration",
        guidance: "Highlight active listening, relying on data/benchmarks rather than ego, and finding consensus.",
        model_answer: "During a hackathon, a teammate wanted to implement Redux while I advocated for React Context and lightweight state. Instead of debating theoretically, we analyzed our project scope and build timeline: Context met 100% of our requirements with 80% fewer lines of boilerplate. We aligned smoothly on that pragmatic approach and delivered our submission 2 hours ahead of deadline."
      },
      {
        question: "Where do you see your technical and professional trajectory in the next three to five years?",
        category: "Career Vision",
        guidance: "Demonstrate ambition for technical depth, mentorship, code quality, and ownership.",
        model_answer: "Over the next three years, I aim to master frontend system architecture, deepen my knowledge of cloud infrastructure and database optimization, and take full ownership of feature lifecycles. In five years, I hope to mentor junior engineers, contribute to architectural roadmaps, and help drive product impact."
      }
    ]
  }
};

export const INITIAL_ROADMAPS = [
  {
    id: "roadmap-1",
    target_role: "Frontend Engineer (React / JavaScript)",
    title: "Modern Frontend Mastery: From Fresh Graduate to Hirable Engineer",
    description: "Curated path focusing on modern JavaScript (ES6+), React hooks and state management, CSS layouts, and portfolio project development.",
    items: [
      {
        id: "item-1",
        skill_name: "Modern JavaScript (ES6+) Fundamentals",
        category: "Core Concept",
        status: "Completed",
        priority: "High",
        milestone: "Master async/await, closures, array methods (map, filter, reduce), and destructuring.",
        target_date: "2026-03-01",
        personal_notes: "Solidified with practice exercises on leetcode and JS30.",
        resources: [
          { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "Docs" },
          { title: "javascript.info - Modern Tutorial", url: "https://javascript.info", type: "Tutorial" }
        ]
      },
      {
        id: "item-2",
        skill_name: "React 19 & Component Architecture",
        category: "Tool / Framework",
        status: "In Progress",
        priority: "High",
        milestone: "Understand useState, useEffect, useMemo, custom hooks, and component composition patterns.",
        target_date: "2026-04-15",
        personal_notes: "Currently building reusable design system components.",
        resources: [
          { title: "Official React Documentation", url: "https://react.dev", type: "Documentation" }
        ]
      },
      {
        id: "item-3",
        skill_name: "Responsive CSS & Glassmorphism UI",
        category: "Core Concept",
        status: "In Progress",
        priority: "Medium",
        milestone: "Flexbox, CSS Grid, media queries, CSS custom properties, and dark mode theming.",
        target_date: "2026-04-30",
        personal_notes: "Practice creating polished SaaS card layouts.",
        resources: [
          { title: "CSS-Tricks Flexbox & Grid Guides", url: "https://css-tricks.com", type: "Guide" }
        ]
      },
      {
        id: "item-4",
        skill_name: "REST API Integration & Supabase Database",
        category: "Hands-on Project",
        status: "Not Started",
        priority: "High",
        milestone: "Build a production CRUD application with authentication, database queries, and error handling.",
        target_date: "2026-05-20",
        personal_notes: "Connect CareerPilot to live Supabase backend.",
        resources: [
          { title: "Supabase Official Quickstarts", url: "https://supabase.com/docs", type: "Docs" }
        ]
      },
      {
        id: "item-5",
        skill_name: "Frontend Testing (Vitest & React Testing Library)",
        category: "Certification",
        status: "Not Started",
        priority: "Medium",
        milestone: "Write unit and component interaction tests with test assertions.",
        target_date: "2026-06-10",
        personal_notes: "Targeting 80%+ test coverage on core workflows.",
        resources: [
          { title: "Vitest Testing Guide", url: "https://vitest.dev", type: "Docs" }
        ]
      }
    ]
  }
];

// Student data starts clean and empty by default
export const INITIAL_APPLICATIONS = [];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Upcoming Technical Interview",
    message: "Nexus Labs Inc. technical interview is in 2 days. Practice with AI Coach to prepare!",
    type: "interview_reminder",
    link: "/app/interviews",
    is_read: false,
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: "notif-2",
    title: "Application Follow-up Reminder",
    message: "FinTech Pulse follow-up deadline is approaching. Check application tracker.",
    type: "follow_up",
    link: "/app/applications",
    is_read: false,
    due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: "notif-3",
    title: "Welcome to CareerPilot! 🚀",
    message: "Complete your profile and build your first ATS resume to unlock AI job matching.",
    type: "system",
    link: "/app/resumes",
    is_read: true,
    due_date: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];
