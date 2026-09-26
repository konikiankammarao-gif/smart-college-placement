# Smart College Placement Management System (ERP)

A production-grade, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** campus recruitment and placement lifecycle ERP platform designed for universities, students, placement cells, and multinational corporate recruiters.

---

## 🌟 Executive Summary

The **Smart College Placement Management System** digitizes, automates, and orchestrates the entire campus recruitment lifecycle. It replaces fragmented spreadsheets and disconnected communication with a unified, role-based platform that enforces automated eligibility calculation, authoritative multi-stage interview tracking, real-time cross-module event notifications, placement audits, and accreditation analytics.

---

## 🏗️ System Architecture & Workflow

```
                                  +-----------------------------+
                                  |         SUPER ADMIN         |
                                  | Governance, Roles, Auditing |
                                  +--------------+--------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                                                           |
     +-------------v-------------+                               +-------------v-------------+
     |     PLACEMENT OFFICER     |                               |     COMPANY RECRUITER     |
     | Drives, Approvals, Stats  |<----------------------------->| Job Postings, Rounds, CTC |
     +-------------+-------------+      Direct Cross-Module      +-------------+-------------+
                   |                     Messaging & Audits                    |
                   +-----------------------------+-----------------------------+
                                                 |
                                  +--------------v--------------+
                                  |       STUDENT CANDIDATE     |
                                  | 1-Click Apply, Rounds, Offer|
                                  +-----------------------------+
```

### Authoritative End-to-End Workflow (Section 3.N Verified)

1. **Super Admin** provisions and activates Placement Officers and department scopes.
2. **Company Recruiter** registers company profile (`PENDING` approval).
3. **Placement Officer** reviews and **APPROVES** the company registration.
4. **Recruiter** publishes a Placement Drive (defining CGPA, branch, backlogs, and CTC).
5. **Automatic Eligibility Engine** computationally evaluates student criteria and notifies qualified candidates.
6. **Student** logs in, inspects verified criteria, and submits a 1-click application.
7. **Recruiter & Officer** review candidate applications in real time.
8. **Recruiter** shortlists candidate (`APPLIED` → `SHORTLISTED`).
9. **Recruiter** schedules sequential interview rounds (Aptitude, Coding, Technical, HR) with virtual links.
10. **Student** receives in-app alerts and attends interview rounds.
11. **Recruiter** records interview score and result (`PASSED`).
12. **Recruiter** issues final selection (`SELECTED`).
13. **Backend Service** marks student as `PLACED`, generates an immutable `Placement` record, increments drive counters, and dispatches congratulations alerts.
14. **Placement Officer & Super Admin** dashboards reflect updated placement percentage, department statistics, and average CTC immediately.
15. **System Audit Logs** permanently record every status transition with timestamps and user IDs.

---

## 👥 User Roles & Permissions

| Role | Access Scope | Key Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | System-Wide | User management, officer provisioning, security audit logs, department configuration, and institutional analytics. |
| **Placement Officer** | Institution-Wide | Company approvals, drive verification, student record audit, interview coordination, notice broadcasts, and CSV export. |
| **Company Recruiter** | Drive & Candidate Scope | Company profile management, drive postings, applicant pipeline review, interview scheduling, scoring, and selection. |
| **Student** | Personal Portfolio | Profile completion, resume uploads, eligible drive exploration, 1-click applications, round tracking, and internal messaging. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Vanilla CSS Glassmorphism Design System.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ORM), JWT Authentication, Bcrypt.js, Helmet, CORS, Express-Rate-Limit, Multer.
- **Security & Reliability**: Centralized Error Handling, Role-Based Access Control (RBAC), Server-Side Input Validation, Audit Trails.
- **Reporting**: Dynamic CSV Export Engine for NAAC / NIRF accreditation data.

---

## 📁 Repository Directory Structure

```
d:/fsdproject/
├── backend/
│   ├── config/             # Database connection (MongoDB Atlas)
│   ├── controllers/        # Business logic controllers
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── announcementController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── companyController.js
│   │   ├── driveController.js
│   │   ├── interviewController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   └── supportTicketController.js
│   ├── middleware/         # Auth, Role, Upload, and Error middleware
│   ├── models/             # Mongoose Schemas (User, Student, Company, PlacementDrive, Application, Interview, Notification, Announcement, SupportTicket, Conversation, Message, Placement, AuditLog, Department)
│   ├── routes/             # RESTful API route declarations
│   ├── services/           # Eligibility Engine, Notifications, and Auditing services
│   ├── tests/              # Automated End-to-End Section 3.N Workflow Test
│   ├── utils/              # Seeder, JWT generators
│   ├── app.js              # Express app configuration & middleware
│   ├── server.js           # Server bootstrap
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Sidebar, Modal, MetricCard, StatusBadge, Icons, ProtectedRoute)
│   │   ├── context/        # AuthContext (JWT State & User Profile)
│   │   ├── pages/          # Landing, Dashboards, Feature Pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Drives.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── Interviews.jsx
│   │   │   ├── Announcements.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── SupportTickets.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── StudentsDirectory.jsx
│   │   │   ├── CompaniesDirectory.jsx
│   │   │   ├── Placements.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   ├── AuditLogs.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   └── CompanyProfile.jsx
│   │   ├── services/       # Axios API client wrapper
│   │   ├── App.jsx         # Client-side router
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Enterprise Theme & Utilities
│   └── package.json
│
├── package.json            # Root multi-package management scripts
└── README.md
```

---

## 🔑 Demo Credentials (Database Seeder)

The database includes pre-configured demo users across all roles:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@smartplacement.com` | `Admin@123` |
| **Placement Officer** | `officer@smartplacement.com` | `Officer@123` |
| **Company Recruiter** | `hr@techcorp.com` | `Company@123` |
| **Student 1 (CSE - 8.5 CGPA)** | `arjun@student.com` | `Student@123` |
| **Student 2 (CSE - 9.2 CGPA)** | `priya@student.com` | `Student@123` |

---

## 🏃 Getting Started & Running Locally

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 2. Environment Configuration
Verify your `backend/.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smart_placement
JWT_SECRET=super_secret_placement_erp_jwt_key_2025
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Install Dependencies
From the project root:
```bash
npm run install:all
```

### 4. Seed Database
Populate test accounts, departments, placement drives, applications, notices, and audit records:
```bash
npm run seed
```

### 5. Start Development Servers
Open two terminal windows:
- **Terminal 1: Start Backend API**
  ```bash
  npm run dev:backend
  # API live on port 5000: http://localhost:5000/api/health
  ```
- **Terminal 2: Start Frontend Application**
  ```bash
  npm run dev:frontend
  # Web App live on port 5173: http://localhost:5173
  ```

### 6. Production Unified Single-Server Mode
To build the frontend bundle and serve the entire application from Express:
```bash
npm run build
npm start
# Unified portal live at http://localhost:5000
```

---

## 🧪 Automated Section 3.N Integration Testing

To execute the automated end-to-end integration test validating the entire cross-module recruitment workflow (User Creation → Drive Posting → Eligibility Computation → Application → Shortlisting → Interview Scheduling → Evaluation → Offer Issuance → Placed Status Update → Audit Trail):

```bash
node backend/tests/integrationWorkflow.test.js
```

---

## 📡 REST API Documentation

### Authentication & Users
- `POST /api/auth/register` — Register student or recruiter
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `GET /api/admin/users` — Paginated list of users (Admin only)
- `POST /api/admin/users` — Create user (Admin only)
- `PUT /api/admin/users/:id/status` — Suspend or activate user

### Placement Drives & Eligibility
- `GET /api/drives` — Browse drives (with department, package, and status filters)
- `POST /api/drives` — Create placement drive (Recruiter / Officer)
- `GET /api/drives/:id` — Detailed drive specifications
- `GET /api/drives/:id/eligible-students` — Live eligibility engine evaluation

### Applications & Recruitment Pipeline
- `POST /api/applications` — Submit drive application (Student only, checks eligibility)
- `GET /api/applications` — Role-scoped application lists
- `GET /api/applications/:id` — Single application details
- `PUT /api/applications/:id/status` — Update status (`UNDER_REVIEW`, `SHORTLISTED`, `SELECTED`, `REJECTED`)
- `PUT /api/applications/:id/withdraw` — Withdraw application (Student only)

### Interviews & Evaluations
- `POST /api/interviews` — Schedule interview round with date, time, and link
- `GET /api/interviews` — Role-filtered interview rounds
- `PUT /api/interviews/:id` — Update interview result, feedback, and score

### Communication, Notices & Helpdesk
- `GET /api/conversations` — Direct user channels
- `POST /api/conversations` — Start direct chat channel
- `GET /api/conversations/:id/messages` — Fetch message thread
- `POST /api/messages` — Send message with receiver notification
- `GET /api/announcements` — Filtered campus placement notices
- `POST /api/announcements` — Broadcast notice (Officer / Admin)
- `GET /api/support-tickets` — Query tickets and grievance threads
- `POST /api/support-tickets` — Submit placement query
- `POST /api/support-tickets/:id/messages` — Post reply to ticket thread

### Reports, Analytics & Audits
- `GET /api/analytics/overview` — Institutional placement metrics
- `GET /api/reports/summary` — Department-wise breakdown & salary percentiles
- `GET /api/reports/export-csv` — Direct CSV download for college accreditation
- `GET /api/audit-logs` — Authoritative security and event audit log
