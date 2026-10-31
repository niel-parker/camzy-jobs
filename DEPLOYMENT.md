# Camzy Jobs Enterprise Platform - Production Deployment Guide

## 1. Overview
Camzy Jobs is an enterprise-grade multi-tenant job portal built specifically for direct companies and hiring teams. This document outlines the step-by-step procedures for deploying the entire platform to a production environment.

## 2. Architecture & Components
- **SDK**: `@job-portal/sdk` shared TypeScript package containing API wrappers, types, and theme injector.
- **Backend API**: NestJS REST API with TypeORM + MySQL 8.0, Redis + BullMQ, and Swagger documentation at `/api/docs`.
- **Frontend App**: Next.js 14 App Router with Tailwind CSS, dynamic light/dark theme customizer, and SearchableSelect comboboxes.

## 3. Environment Variables

### Backend (`website/backend/.env`)
```env
PORT=4000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_username
DB_PASS=your_db_password
DB_NAME=job_portal_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@yourdomain.com
MAIL_PASSWORD=your_mail_password
MAIL_FROM="Camzy Jobs Security" <postmaster@yourdomain.com>
```

### Frontend (`website/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 4. Docker Deployment Instructions

To run the complete production stack using Docker Compose:

```bash
cd website
docker-compose up -d --build
```

This will launch:
- **MySQL 8.0 Container**: Port 3306
- **Redis Container**: Port 6379
- **NestJS Backend Container**: Port 4000
- **Next.js Frontend Container**: Port 3000

## 5. Manual Build & Deployment Steps

### Step A: Build Shared SDK
```bash
cd website/sdk
npm install
npm run build
```

### Step B: Build & Start Backend API
```bash
# 1. Restore Database Dump (If using clean MySQL instance)
mysql -u job_user -pjob_password job_portal_db < website/job_portal_db_dump.sql

# 2. Build & Start NestJS Server
cd website/backend
npm install
npm run build
npm run start:prod
```

### Step C: Build & Start Frontend App
```bash
cd website/frontend
npm install
npm run build
npm run start
```

## 6. Verification Checklist
1. Access http://localhost:4000/api/docs for Swagger API specifications.
2. Log in as Super Admin (`admin@jobportal.com`) to access Theme Customizer and Governance Panel.
3. Test dynamic theme switches between Light Mode (minimalist slate) and Dark Mode.
4. Verify employer job posting and active job quota limits.
5. Conduct test checkout flow with Stripe webhooks.



# Docker Stack Launch
cd website
docker-compose up -d --build

# OR Manual Local Dev:
# 1. Start Backend API (Port 4000)
cd website/backend && npm run start:dev


# 2. Start Frontend App (Port 3000)
cd website/frontend && npm run dev
