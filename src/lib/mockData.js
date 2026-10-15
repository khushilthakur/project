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
      },
      {
        question: "Explain the purpose of RESTful API principles and HTTP status codes (e.g. 200, 201, 400, 401, 404, 500).",
        category: "API & Web Protocols",
        guidance: "Define statelessness, standard verbs (GET, POST, PUT, DELETE), and differentiate client vs server error codes.",
        model_answer: "REST is an architectural style based on stateless client-server communication using standard HTTP methods. Status codes provide immediate semantic clarity: 200 OK and 201 Created indicate success; 400 Bad Request, 401 Unauthorized, and 404 Not Found represent client errors; and 500 represents internal server errors."
      },
      {
        question: "What are CSS Flexbox and Grid, and when should you choose one over the other?",
        category: "CSS & Responsive Design",
        guidance: "Explain one-dimensional (Flexbox) vs two-dimensional (Grid) layout models.",
        model_answer: "Flexbox is designed for one-dimensional layouts along a single axis (either row or column), ideal for navbars, form input alignments, and card content distribution. CSS Grid is a two-dimensional layout system managing both rows and columns simultaneously, ideal for whole-page scaffolding and photo galleries."
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
      },
      {
        question: "How does database indexing work, and what are the trade-offs between read and write operations?",
        category: "Database Indexing",
        guidance: "Explain B-Trees, O(log N) search complexity, index storage overhead, and write penalty on inserts/updates.",
        model_answer: "An index is an auxiliary data structure (typically a B-Tree) that allows the database engine to find matching rows in O(log N) time rather than doing an expensive full table scan. The trade-off is write amplification: every INSERT, UPDATE, or DELETE requires updating both the base table and all corresponding index trees, increasing disk I/O and storage consumption."
      },
      {
        question: "Explain Cross-Origin Resource Sharing (CORS) and how preflight OPTIONS requests protect web applications.",
        category: "Web Security",
        guidance: "Discuss origin definition (protocol, domain, port), server response headers (Access-Control-Allow-Origin), and preflights.",
        model_answer: "CORS is a browser security mechanism that restricts web pages from making AJAX requests to a different domain, protocol, or port than the one serving the page. For non-simple requests (like those with custom headers or PUT/DELETE verbs), the browser automatically issues a preflight OPTIONS request to verify whether the server authorizes the cross-origin operation before dispatching the real payload."
      }
    ],
    Advanced: [
      {
        question: "Design an end-to-end resilient background job processing architecture for high-volume notification delivery.",
        category: "System Design",
        guidance: "Discuss message queues (RabbitMQ/SQS), idempotency keys, dead-letter queues, rate limits, and exponential backoff.",
        model_answer: "A resilient pipeline uses an event broker or message queue where job publishers push structured payloads containing a unique idempotency key. Worker pools consume tasks concurrently, utilizing exponential backoff retry policies for transient failures. Messages that fail repeatedly are diverted to a Dead Letter Queue (DLQ) for alerting and manual inspection, preventing message loss."
      },
      {
        question: "How do you architect distributed database caching using Redis, and how do you handle cache invalidation and the 'thundering herd' problem?",
        category: "Distributed Caching",
        guidance: "Discuss Cache-Aside, Write-Through, TTL strategies, mutex locking, and cache stampede prevention.",
        model_answer: "A Cache-Aside architecture checks Redis first; on a miss, the application loads from the database and populates Redis with a sensible TTL. To prevent the 'thundering herd' where thousands of concurrent requests query the database when an item expires, you can implement distributed mutex locks, probabilistic early expiration (XFetch), or background cache warmers."
      },
      {
        question: "Explain the CAP theorem and describe the trade-offs between Strong Consistency and Eventual Consistency in microservices.",
        category: "Distributed Systems",
        guidance: "Define Consistency, Availability, and Partition Tolerance, citing concrete transactional examples like Saga vs 2PC.",
        model_answer: "The CAP theorem states that a distributed data store can guarantee at most two out of Consistency, Availability, and Partition tolerance in the presence of network splits. In modern microservices, network partitions are inevitable, so systems usually choose AP (high availability with Eventual Consistency via event sourcing and the Saga pattern) or CP (strict consistency with two-phase commit where operations block or fail if quorum cannot be reached)."
      },
      {
        question: "How would you optimize a slow database query operating on a table with 50+ million rows?",
        category: "Database Tuning",
        guidance: "Discuss EXPLAIN ANALYZE, composite indexes, table partitioning, avoiding SELECT *, and connection pooling.",
        model_answer: "First, inspect the execution plan using EXPLAIN (ANALYZE, BUFFERS) to detect sequential scans and nested loops. Add targeted composite indexes covering the WHERE and ORDER BY clauses, eliminate unnecessary columns from the projection, rewrite correlated subqueries into JOINs, and if data is historical, partition the table by date range to prune scan partitions."
      },
      {
        question: "How do modern frontend bundlers like Vite utilize native ES Modules (ESM) to outperform legacy Webpack setups?",
        category: "Build Tooling & Bundlers",
        guidance: "Explain dev server on-demand compilation, browser native ESM requests, and Rollup/esbuild usage for production.",
        model_answer: "Legacy bundlers like Webpack bundle the entire application into memory before serving requests, which slows down as codebases scale. Vite serves source code over native browser ESM, transforming and serving only the specific files imported on the currently loaded page on-demand. Dependencies are pre-bundled using high-speed esbuild in Go, providing instant server start and lightning-fast Hot Module Replacement (HMR)."
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
      },
      {
        question: "How do you prioritize your tasks when you have multiple assignments or deadlines approaching simultaneously?",
        category: "Time Management",
        guidance: "Discuss assessing impact vs urgency, using task trackers (Kanban), and communicating early with stakeholders.",
        model_answer: "I break down larger deliverables into discrete milestones and classify tasks by urgency and project impact using an Eisenhower matrix or Kanban board. I focus on critical blockers first, maintain transparent communication with project mentors, and provide early updates if scope adjustments are necessary."
      },
      {
        question: "What is your approach to learning a new programming language, framework, or tool from scratch?",
        category: "Continuous Learning",
        guidance: "Explain reading official documentation, building hands-on mini-projects, and studying open-source code.",
        model_answer: "I start by reviewing the official documentation and architectural philosophies of the tool. Next, rather than passively watching tutorials, I build a small end-to-end proof of concept to encounter real errors, inspect stack traces, and understand edge cases. Finally, I read production source code or GitHub repositories to adopt community best practices."
      },
      {
        question: "Why are you interested in joining our engineering team specifically?",
        category: "Company Alignment",
        guidance: "Reference the company's product domain, engineering culture, and how your skills can add value.",
        model_answer: "I admire your team's dedication to building high-performance, user-centric software. Your culture of code review, technical rigor, and developer empowerment strongly aligns with how I want to grow as an engineer. I am excited to bring my proactive attitude, strong foundational skills, and enthusiasm for problem solving to your product initiatives."
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
      },
      {
        question: "Describe a scenario where you received critical or constructive feedback on your code. How did you respond?",
        category: "Receptiveness & Growth",
        guidance: "Show humility, focusing on code quality over personal pride, and implementing actionable improvements.",
        model_answer: "During a pull request review, a senior engineer pointed out that my database queries were susceptible to N+1 performance bottlenecks. Rather than being defensive, I thanked them for the catch, read the recommended documentation on eager loading and joins, and refactored the logic. I also added unit tests verifying query counts, which reduced latency by 65%."
      },
      {
        question: "How do you ensure maintainability and readability when writing code that others will work on?",
        category: "Code Quality & Collaboration",
        guidance: "Discuss clean naming conventions, modular component design, typing, and self-documenting code.",
        model_answer: "I adhere to single-responsibility principles, write clear and descriptive variable and function names, and avoid premature abstraction. I write comprehensive docstrings and inline comments strictly where non-obvious business logic or algorithmic edge cases exist, and maintain consistent formatting with linters and automated tests."
      },
      {
        question: "Tell me about a time you had to deliver a feature under a tight deadline with incomplete requirements.",
        category: "Adaptability & Delivery",
        guidance: "Discuss identifying minimum viable scope, clarifying ambiguities proactively, and delivering incrementally.",
        model_answer: "When launching an analytics dashboard, client specifications for export formats were still unfinalized 48 hours before release. I proactively contacted the product owner with mockups, proposed delivering the core CSV and PDF formats first, and architected the export service modularly so additional formats could be plugged in later without refactoring. We delivered the launch on schedule with positive feedback."
      }
    ],
    Advanced: [
      {
        question: "Describe how you approach leading a team through a high-severity production outage or critical regression.",
        category: "Incident Management & Leadership",
        guidance: "Cover triage, blameless communication, fast rollback/mitigation before root-cause analysis, and post-mortems.",
        model_answer: "My priority during an incident is fast customer mitigation over finding fault. I establish a single communication channel, appoint roles for investigation and stakeholder updates, and roll back or apply feature flags to restore service immediately. Once stabilized, we conduct a blameless post-mortem with 5-Whys analysis and track action items to prevent recurrence."
      },
      {
        question: "How do you balance technical debt against the business demand for rapid feature velocity?",
        category: "Technical Governance",
        guidance: "Discuss quantifying tech debt, translating engineering risk to business impact, and reserving sprint capacity.",
        model_answer: "I translate technical debt into business metrics: customer latency, deploy frequency, and risk of downtime. Rather than asking for whole quarters to 'rewrite code', I advocate for dedicating a predictable 15-20% of every sprint towards refactoring and testing, and bundle architectural improvements into planned feature work."
      },
      {
        question: "How do you mentor junior developers and foster an inclusive, high-performing engineering culture?",
        category: "Mentorship & Culture",
        guidance: "Discuss pair programming, constructive PR feedback, psychological safety, and growth paths.",
        model_answer: "I focus on asking guiding questions rather than simply handing over solutions. In code reviews, I praise good design choices and explain the 'why' behind architectural recommendations. I encourage junior engineers to take ownership of end-to-end features, speak up in technical design discussions, and fail safely within a blameless environment."
      },
      {
        question: "Tell me about an architectural decision you made that did not work out as planned. What did you learn?",
        category: "Executive Ownership",
        guidance: "Show self-awareness, willingness to pivot based on metrics, and institutional learning.",
        model_answer: "We once adopted a micro-frontend architecture assuming it would allow three squads to deploy autonomously. In reality, the bundle size overhead and state synchronization complexity outweighed the team velocity benefits. After observing the metrics for two months, I led the pragmatic initiative to consolidate into a modular monorepo, which cut CI build times in half and simplified deployments."
      },
      {
        question: "How do you align cross-functional stakeholders (Product, Design, Sales, Security) around complex technical roadmaps?",
        category: "Stakeholder Alignment",
        guidance: "Discuss speaking their business language, demonstrating ROI, visualizing roadmaps, and managing trade-offs.",
        model_answer: "I adapt my communication to the audience: with product and sales, I highlight reliability, customer experience, and compliance velocity; with security, I provide risk matrices and threat models. By co-creating milestones and keeping trade-offs transparent, stakeholders feel heard and committed to shared engineering outcomes."
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
