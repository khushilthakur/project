-- CareerPilot: AI Career Assistant - Comprehensive PostgreSQL Schema & RLS Policies
-- Compatible with Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with career-focused profile attributes
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    education TEXT,
    graduation_year TEXT,
    experience_level TEXT DEFAULT 'Fresher / Entry Level' CHECK (experience_level IN ('Fresher / Entry Level', 'Junior (1-2 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)')),
    skills TEXT[] DEFAULT '{}',
    preferred_roles TEXT[] DEFAULT '{}',
    preferred_locations TEXT[] DEFAULT '{}',
    remote_preference TEXT DEFAULT 'Any' CHECK (remote_preference IN ('Remote', 'Hybrid', 'Onsite', 'Any')),
    career_interests TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile upon auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current user is admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Professional Resume',
    template TEXT NOT NULL DEFAULT 'modern' CHECK (template IN ('modern', 'minimal', 'executive', 'tech')),
    personal_info JSONB DEFAULT '{
        "fullName": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "portfolio": "",
        "summary": ""
    }'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '{
        "technical": [],
        "soft": [],
        "tools": [],
        "languages": []
    }'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);

-- 3. JOB LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    work_mode TEXT DEFAULT 'Remote' CHECK (work_mode IN ('Remote', 'Hybrid', 'Onsite')),
    type TEXT DEFAULT 'Full-time' CHECK (type IN ('Internship', 'Full-time', 'Part-time', 'Contract')),
    experience_level TEXT DEFAULT 'Fresher' CHECK (experience_level IN ('Fresher', 'Junior', 'Mid', 'Senior')),
    salary_range TEXT,
    skills_required TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    eligibility TEXT,
    application_url TEXT,
    source TEXT DEFAULT 'CareerPilot Curated',
    is_verified BOOLEAN DEFAULT true,
    is_reported BOOLEAN DEFAULT false,
    report_reason TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_listings_skills ON public.job_listings USING GIN (skills_required);
CREATE INDEX IF NOT EXISTS idx_job_listings_type ON public.job_listings(type);
CREATE INDEX IF NOT EXISTS idx_job_listings_exp ON public.job_listings(experience_level);

-- 4. SAVED JOBS TABLE
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON public.saved_jobs(user_id);

-- 5. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    job_url TEXT,
    salary TEXT,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn')),
    applied_date DATE DEFAULT CURRENT_DATE,
    interview_date TIMESTAMPTZ,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(user_id, status);

-- 6. APPLICATION STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON public.application_status_history(application_id);

-- Trigger to record application status history automatically
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
        INSERT INTO public.application_status_history (application_id, user_id, previous_status, new_status, notes)
        VALUES (NEW.id, NEW.user_id, OLD.status, NEW.status, 'Status updated');
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.application_status_history (application_id, user_id, previous_status, new_status, notes)
        VALUES (NEW.id, NEW.user_id, NULL, NEW.status, 'Application created');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_status_change ON public.job_applications;
CREATE TRIGGER on_application_status_change
    AFTER INSERT OR UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();

-- 7. JOB ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.job_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    company TEXT,
    job_description TEXT NOT NULL,
    match_score NUMERIC(5, 2) NOT NULL,
    matching_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    recommendations JSONB DEFAULT '[]'::jsonb,
    keywords_analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_analyses_user ON public.job_analyses(user_id);

-- 8. INTERVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('Technical', 'HR / Behavioral')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    job_description TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    overall_score NUMERIC(5, 2),
    overall_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON public.interview_sessions(user_id);

-- 9. INTERVIEW QUESTIONS & ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT,
    user_answer TEXT,
    feedback TEXT,
    model_answer TEXT,
    score NUMERIC(5, 2),
    evaluation_criteria JSONB DEFAULT '{}'::jsonb,
    answered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_session ON public.interview_questions(session_id);

-- 10. LEARNING ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON public.learning_roadmaps(user_id);

-- 11. ROADMAP ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES public.learning_roadmaps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT DEFAULT 'Core Concept' CHECK (category IN ('Core Concept', 'Tool / Framework', 'Hands-on Project', 'Certification')),
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    milestone TEXT,
    resources JSONB DEFAULT '[]'::jsonb,
    personal_notes TEXT,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap ON public.roadmap_items(roadmap_id);

-- 12. NOTIFICATIONS & REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('interview_reminder', 'follow_up', 'job_alert', 'achievement', 'system')),
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- 13. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs(admin_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user data isolation and role-based administrative access
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile (role cannot be changed by user)"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    );

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RESUMES POLICIES
CREATE POLICY "Users manage own resumes"
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- JOB LISTINGS POLICIES
-- Authenticated users can view verified listings
CREATE POLICY "Anyone authenticated can view non-reported listings"
    ON public.job_listings FOR SELECT
    USING (auth.role() = 'authenticated' AND (NOT is_reported OR public.is_admin() OR auth.uid() = created_by));

CREATE POLICY "Users can insert job listings"
    ON public.job_listings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators or admins can update job listings"
    ON public.job_listings FOR UPDATE
    USING (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Creators or admins can delete job listings"
    ON public.job_listings FOR DELETE
    USING (auth.uid() = created_by OR public.is_admin());

-- SAVED JOBS POLICIES
CREATE POLICY "Users manage own saved jobs"
    ON public.saved_jobs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- JOB APPLICATIONS POLICIES
CREATE POLICY "Users manage own applications"
    ON public.job_applications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- APPLICATION STATUS HISTORY POLICIES
CREATE POLICY "Users view own application history"
    ON public.application_status_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own application history"
    ON public.application_status_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- JOB ANALYSES POLICIES
CREATE POLICY "Users manage own job analyses"
    ON public.job_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INTERVIEW SESSIONS POLICIES
CREATE POLICY "Users manage own interview sessions"
    ON public.interview_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INTERVIEW QUESTIONS POLICIES
CREATE POLICY "Users manage interview questions via session ownership"
    ON public.interview_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.interview_sessions
        WHERE id = session_id AND user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.interview_sessions
        WHERE id = session_id AND user_id = auth.uid()
    ));

-- LEARNING ROADMAPS POLICIES
CREATE POLICY "Users manage own roadmaps"
    ON public.learning_roadmaps FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ROADMAP ITEMS POLICIES
CREATE POLICY "Users manage own roadmap items"
    ON public.roadmap_items FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users manage own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ADMIN AUDIT LOGS POLICIES
CREATE POLICY "Admins can view and insert audit logs"
    ON public.admin_audit_logs FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =========================================================================
-- SEED DATA: Curated high-quality jobs for Students, Freshers & Career Starters
-- =========================================================================

INSERT INTO public.job_listings (title, company, location, work_mode, type, experience_level, salary_range, skills_required, description, eligibility, application_url, source)
VALUES
(
    'Junior Frontend Developer (React / JavaScript)',
    'Nexus Labs Inc.',
    'San Francisco, CA / Remote',
    'Remote',
    'Full-time',
    'Fresher',
    '$70,000 - $85,000 / yr',
    ARRAY['JavaScript', 'React', 'HTML5', 'CSS3', 'Git', 'REST APIs'],
    'Join our fast-growing UI engineering team building next-generation SaaS tools. You will implement responsive interfaces, collaborate with UX designers, and write clean, maintainable modular React code.',
    'Recent graduates or self-taught developers with strong JavaScript & React portfolio projects.',
    'https://example.com/careers/nexus-frontend',
    'CareerPilot Verified Partner'
),
(
    'Software Engineer Intern (Summer 2026)',
    'CloudScale Systems',
    'Austin, TX',
    'Hybrid',
    'Internship',
    'Fresher',
    '$35 - $45 / hr',
    ARRAY['Python', 'PostgreSQL', 'Docker', 'Linux', 'Data Structures', 'Algorithms'],
    'Work alongside senior backend engineers building scalable cloud microservices, database optimizations, and telemetry pipelines. Real hands-on production code from day one.',
    'Currently enrolled in Bachelor''s or Master''s in Computer Science or related degree graduating 2026/2027.',
    'https://example.com/careers/cloudscale-intern',
    'University Campus Portal'
),
(
    'Associate Full Stack Engineer',
    'FinTech Pulse',
    'New York, NY',
    'Hybrid',
    'Full-time',
    'Junior',
    '$80,000 - $95,000 / yr',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'TailwindCSS', 'Jest'],
    'Develop high-throughput customer dashboards and payment processing integrations. Emphasis on code testability, security, and responsive financial charts.',
    '0-2 years of experience with web applications and modern relational databases.',
    'https://example.com/careers/fintech-pulse-assoc',
    'CareerPilot Curated'
),
(
    'AI / ML Engineering Intern',
    'CognitiveWorks AI',
    'Seattle, WA / Remote',
    'Remote',
    'Internship',
    'Fresher',
    '$40 - $52 / hr',
    ARRAY['Python', 'PyTorch', 'FastAPI', 'LLM Prompting', 'Vector Databases', 'Hugging Face'],
    'Assist in evaluating large language model responses, fine-tuning retrieval augmented generation (RAG) pipelines, and deploying model inference endpoints.',
    'Strong mathematical foundation, proficiency in Python, and demonstrated passion for generative AI applications.',
    'https://example.com/careers/cognitiveworks-ai-intern',
    'AI Fellowship Network'
),
(
    'Junior Product Designer (UI/UX)',
    'Aura Studio',
    'Chicago, IL / Remote',
    'Remote',
    'Full-time',
    'Fresher',
    '$65,000 - $78,000 / yr',
    ARRAY['Figma', 'UI/UX Design', 'Wireframing', 'User Research', 'Design Systems', 'Prototyping'],
    'Craft intuitive user experiences, design accessible component libraries in Figma, conduct user interviews, and hand off specifications to frontend teams.',
    'Strong portfolio demonstrating end-to-end design process, usability testing, and visual design craft.',
    'https://example.com/careers/aura-studio-junior-designer',
    'Dribbble Talent'
),
(
    'Graduate QA Automation Engineer',
    'Veritas Tech',
    'Boston, MA',
    'Onsite',
    'Full-time',
    'Fresher',
    '$68,000 - $82,000 / yr',
    ARRAY['Selenium', 'Cypress', 'JavaScript', 'Python', 'CI/CD', 'API Testing'],
    'Build and maintain automated test suites for enterprise web applications, perform regression testing, and integrate end-to-end test suites into GitHub Actions pipelines.',
    'Degree in Computer Science, IT, or certified QA bootcamp graduate with strong programming fundamentals.',
    'https://example.com/careers/veritas-qa-engineer',
    'CareerPilot Curated'
);
