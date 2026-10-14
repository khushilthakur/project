# CareerPilot: AI Career Assistant

> An all-in-one career preparation platform for students, freshers, and job seekers to build ATS-compliant resumes, practice AI mock interviews, match job descriptions, track applications, and manage learning roadmaps.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Project Overview & Features

**CareerPilot** eliminates fragmented spreadsheets, disconnected resume builders, and guesswork by centralizing the complete technical career search lifecycle:

1. **ATS Resume Builder & PDF Exporter**
   - Live side-by-side editing across 3 ATS-compliant templates (`Modern Professional`, `Minimal Classic`, and `Tech/Terminal`).
   - STAR Method bullet optimizer: transforms passive duties into quantifiable achievement bullets.
   - AI Professional Summary generator grounded strictly in user-supplied experience.
   - High-resolution, multi-page vector PDF download via `jspdf` & `html2canvas`.
2. **AI Mock Interview Coach**
   - Practice Technical & HR/Behavioral questions tailored across Beginner, Intermediate, and Advanced difficulties.
   - Real-time scoring out of 100 with criteria breakdown (clarity, relevance, technical correctness, structure).
   - Exemplary model answers and constructive feedback saved to database session history.
3. **Job Description & Skill Gap Matcher**
   - Algorithmic requirement analysis comparing job descriptions against resumes.
   - Percentage match score with categorized breakdown: Matching Skills vs. Missing Keywords.
   - Actionable recommendations and saved history.
4. **Application Tracker & Pipeline**
   - Dual interface: interactive Kanban Board (drag/drop & quick status dropdowns) and Data Table view.
   - Tracks 7 standard hiring stages: `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
   - Automatic status transition history tracking and follow-up deadline reminders.
5. **Skill Roadmaps & Milestone Checklists**
   - Presets for Frontend, Full Stack, Backend Cloud, and AI roles.
   - Status tracking (`Not Started`, `In Progress`, `Completed`), personal notes, and verified documentation links.
6. **Career Analytics & KPIs**
   - Application status distribution (Recharts Pie & Bar charts).
   - Interview and offer conversion rates with zero-division protection.
   - Submission timeline and targeted role frequencies.
7. **In-App Notifications & Reminders**
   - Automated alerts for upcoming interviews within 48 hours and approaching follow-ups.
   - Custom reminder creation with read/unread tracking.
8. **Admin Operations & Moderation Panel**
   - Role-based operational telemetry (user counts, listing health).
   - Job moderation queue to review and dismiss or remove flagged opportunities.
   - Immutable security audit logs.

---

## 2. Technology Stack

- **Frontend**: React 19, JavaScript (ES Modules), Vite 8.
- **Routing**: React Router v7.
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, smooth transitions, glassmorphism tokens, and persistent Light/Dark mode.
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) policies, foreign keys, triggers, and Supabase Auth.
- **Server-Side AI**: Supabase Edge Functions (`Deno`) integrating Google Gemini or OpenAI with server-side validation and fallback heuristics.
- **Visualization**: Recharts for responsive analytics charts.
- **Icons**: Lucide React.
- **PDF Generation**: jsPDF + html2canvas.
- **Testing**: Vitest + React Testing Library + jsdom.

---

## 3. Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended).
- **npm**: v9.0.0 or later.

### Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/careerpilot.git
cd careerpilot
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and configure your public Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-id.supabase.co/functions/v1
```

> **Note on Local Storage Mode:** If Supabase credentials are not yet configured, CareerPilot automatically starts in **Local Storage Mode**. All features (authentication, resume builder, PDF export, job tracker, interviews, roadmaps, and admin panel) will function smoothly using browser local storage with pre-seeded demo records!

### Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Automated Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
```

---

## 4. Supabase Database & Security Setup

### 1. Database Schema Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Open `supabase/migrations/20261014000000_careerpilot_schema.sql` from this repository.
4. Paste the entire SQL content and click **Run**.

This migration configures:
- Tables: `profiles`, `resumes`, `job_listings`, `saved_jobs`, `job_applications`, `application_status_history`, `job_analyses`, `interview_sessions`, `interview_questions`, `learning_roadmaps`, `roadmap_items`, `notifications`, `admin_audit_logs`.
- Row Level Security (RLS) policies isolating user records (`auth.uid() = user_id`).
- Automated triggers: auto-creates `profiles` row on user signup and logs application status transitions.
- Seed data: high-integrity curated opportunities for students and freshers.

### 2. Admin Role Provisioning
Administrator access is enforced via database claims, not client storage. To grant a user administrative privileges, execute this SQL in the Supabase SQL editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@yourcompany.com';
```

---

## 5. Supabase Edge Function (AI Integration)

The AI assistant runs securely on the server via Supabase Edge Functions:
Location: `supabase/functions/ai-career-assistant/index.ts`

### Deploying the Edge Function
1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
2. Link your project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
3. Set your AI secret key on the server (never exposed to client):
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Deploy the function:
   ```bash
   supabase functions deploy ai-career-assistant
   ```

---

## 6. Vercel Deployment Instructions

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `careerpilot` repository.
4. Set Framework Preset to **Vite**.
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key.
   - `VITE_SUPABASE_FUNCTIONS_URL`: `${VITE_SUPABASE_URL}/functions/v1`.
6. Click **Deploy**. Vercel will run `npm run build` and deploy the application globally.

---

## 7. Fast Evaluator Access (Credentials)

For testing and reviewing the application:
- **Verified Platform Administrator**:
  - Email: `khushilthakur28@gmail.com`
  - Password: `280106`
  - Quick action: Click **"Sign In as Admin (khushilthakur28@gmail.com)"** on `/login` to access the full operational telemetry, moderation queue, audit logs, and management controls.
- **Student / Candidate Access**:
  - Students register with their own email and password via **"Create one free"** on `/register`.
  - All student accounts start completely clean without dummy student data, allowing authentic resume creation, job tracking, and interview coaching.

---

## 8. License

This portfolio project is open-source under the [MIT License](LICENSE).
