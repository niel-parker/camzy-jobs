# Job Portal Enterprise Platform - Phase 1 & 2 Implementation

Welcome to the **Enterprise Multi-Tenant Job Portal Platform**.

## Architecture Overview

```
website/
├── sdk/          # Shared TypeScript SDK, Types, API Client & Theme Presets
├── backend/      # NestJS 10 REST API Server with Swagger OpenAPI & TypeORM Schema
└── frontend/     # Next.js 14 (App Router) + Tailwind CSS + Live UI Theme Engine + Employer Dashboard
```

---

## Quick Start Instructions

### 1. Build and Run the SDK
```bash
cd website/sdk
npm install
npm run build
```

### 2. Start NestJS Backend Server
```bash
cd website/backend
npm install
npm run start:dev
```
- API Base URL: `http://localhost:4000/api/v1`
- Swagger OpenAPI Specs: `http://localhost:4000/api/docs`

### 3. Start Next.js Frontend Web App
```bash
cd website/frontend
npm install
npm run dev
```
- Web Application URL: `http://localhost:3000`

---

## Implemented Features Overview

### Phase 1: Core Architecture & Super Admin Theme Engine
1. **Super Admin Dynamic UI Theme Configuration**:
   - Live theme customizer panel in Next.js UI (Navbar "Theme Engine" button).
   - Presets: *Modern Slate & Indigo (Dark)*, *Pure Minimalist (Light)*, *Emerald Mint (Light)*, *Executive Navy (Light)*, *Cyber Neon Purple (Dark)*.
   - Dynamic CSS variable injection (`--color-primary`, `--color-bg`, `--radius`, `--font-main`).
   - Persisted theme sync with NestJS API endpoints (`GET/PUT /api/v1/theme/active`).

2. **Super Admin Job Portal App Config**:
   - Platform title, tagline, support contact email, default currency (`USD $`, `EUR €`, `GBP £`, `INR ₹`).
   - Feature toggles for free job posting, resume database access, company tax verification, and maintenance mode.

3. **Searchable Combobox Component (`SearchableSelect`)**:
   - Type-to-search dropdown component used for category and currency selection across Light & Dark themes.

---

### Phase 2: Multi-Tenant Engine & Company Hiring System (In Progress - 53% Completed)
1. **TypeORM MySQL Schema & Entities** ([`website/backend/src/entities/`](file:///Users/nilesh/Downloads/job-portal/website/backend/src/entities/)):
   - `Tenant` (Company / Employer accounts)
   - `User` (Super Admin, Recruiter, Candidate roles)
   - `SubscriptionPlan` (Free Starter, Growth, Pro, Enterprise tiers)
   - `TenantSubscription` (Quota usage meters: `activeJobsUsed`, `resumeDownloadsUsed`, `featuredJobsUsed`)
   - `JobPosting` (Company job postings schema with location, salary, experience level, featured flag)

2. **Active Job Posting Quota Guard** ([`website/backend/src/guards/job-quota.guard.ts`](file:///Users/nilesh/Downloads/job-portal/website/backend/src/guards/job-quota.guard.ts)):
   - Guard checking `ActiveJobsCount < PlanMaxActiveJobs` before creating new company job postings via `POST /api/v1/jobs`.

3. **Employer Workspace Dashboard** ([`website/frontend/src/app/employer/dashboard/page.tsx`](file:///Users/nilesh/Downloads/job-portal/website/frontend/src/app/employer/dashboard/page.tsx)):
   - Real-time visual progress meters for Active Job Quota, Resume DB Downloads, and Recruiter Seats.
   - List of company active postings with applicant count badges.

4. **Job Creation Wizard** ([`website/frontend/src/app/employer/jobs/create/page.tsx`](file:///Users/nilesh/Downloads/job-portal/website/frontend/src/app/employer/jobs/create/page.tsx)):
   - Multi-step job posting wizard form with category/employment type SearchableSelect comboboxes and Featured Boost burning option.

5. **Public Job Detail Page** ([`website/frontend/src/app/jobs/[id]/page.tsx`](file:///Users/nilesh/Downloads/job-portal/website/frontend/src/app/jobs/%5Bid%5D/page.tsx)):
   - SEO-optimized job details page displaying company profile, location, salary range, responsibilities, and 1-Click Apply button.
