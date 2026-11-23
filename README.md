# TRUSTGRID.AI - Enterprise Psychometric Testing & AI Video Assessment Platform
### Talent2Value-Inspired Integrated Talent Assessment, Video CV & Recruitment Intelligence Platform

![TRUSTGRID.AI Logo](/public/trustgrid-logo.png)

## Overview

**TRUSTGRID.AI** is a dual-application enterprise talent assessment platform:
1. **Application 1: Online Psychometric Testing Application**: Evaluates Big Five personality traits (normed on a 1-10 STEN scale), numerical & logical aptitude reasoning, cognitive flexibility, and situational judgment (SJT) with calibrated rubrics.
2. **Application 2: Psychometric Video Assessment Application**: Candidate professional video identity, Video CV, video portfolio presentations, and structured one-way competency video interviews with browser recording (MediaRecorder API), live audio level visualization, automated speech-to-text transcription, and bias-free AI competency evaluation.

Both applications share a single **Google Sheets Master Database (`PSYCHOMETRIC_ASSESSMENT_MASTER_DB`)** with **24 relational tables** and a **Google Apps Script RESTful backend (`PSYCHOMETRIC_APPS_SCRIPT/`)**.

---

## Key Modules & Capabilities

### 1. Candidate Management (Module A)
- Unique candidate identification (`CAN_000001` sequential scheme).
- Email & phone deduplication protection.
- Indian DPDP Act compliant consent collection & privacy preferences.
- Profile completeness tracking across personal details, resume, video CV, and assessments.

### 2. Online Psychometric Testing (Module B - Application 1)
- **Big Five Personality Assessment**: Likert scale items with reverse scoring, STEN scores (1-10), percentile ranks, and behavioural workplace recommendations.
- **Aptitude Reasoning**: Timed numerical and logical deduction items with section-wise scoring and answer review.
- **Situational Judgement Test (SJT)**: Workplace escalation, technical crisis, and architectural ethics scenarios scored against rubrics.
- **Candidate Assessment Station**: Welcome instructions, device readiness checks, live countdown timer with auto-save, question navigation, celebratory completion, and interactive SVG Radar Chart.

### 3. Candidate Video Profile & Video CV (Module C - Application 2)
- Categories: Professional Introduction, Video CV, Experience, Skills Demo, Project Walkthrough, Portfolio Presentation.
- 3 Submission Methods:
  1. **Upload File**: MP4, WebM, MOV with client-side validation, size bounds, and canvas thumbnail capture.
  2. **Paste Video URL**: YouTube & Vimeo regex parser with verified provider allowlist and embed generator.
  3. **Record Live Webcam**: Browser MediaRecorder API, live audio visualizer, countdown timer, retake controls, and direct preview.
- Granular Privacy: Private, Assigned Recruiters, Organization Users.

### 4. Structured Video Interviews & AI Transcription (Module D & E)
- Preparation timer (30-45s) and response timer (120-180s) with retake constraints.
- Timestamped speech-to-text transcript synthesis.
- **Ethical AI Competency Rubric**: Analyzes STAR methodology (Situation, Task, Action, Result) and evidence quotation. Strictly excludes facial symmetry, facial emotion, voice attractiveness, and accent bias.
- **Human Evaluator Workbench**: 1-to-5 star scorecards, qualitative feedback notes, and hiring recommendations (Shortlist / Hold / Reject).

### 5. Multi-Tier Reporting & PDF Synthesis (Module H & 12)
- **Report 1**: Psychometric Assessment Report (Radar chart, STEN scores, aptitude domains, behavioural recommendations).
- **Report 2**: Video Assessment Report (Responses, transcripts, AI rubric evidence, human reviewer feedback).
- **Report 3**: Consolidated 360 Talent Report (Composite score, hiring guidance, printable layout, and one-click PDF export via `jsPDF`).

---

## 24 Relational Database Sheets (`PSYCHOMETRIC_ASSESSMENT_MASTER_DB`)

| # | Sheet Name | Description |
|---|------------|-------------|
| 1 | `DB_01_Organizations` | Multi-tenant organization records, tiers, and limits |
| 2 | `DB_02_Users` | Role-based accounts (Super Admin, Recruiter, Evaluator) |
| 3 | `DB_03_Candidates` | Candidate profiles, contact, education, resume URLs |
| 4 | `DB_04_Jobs` | Job openings and required competency matrices |
| 5 | `DB_05_Assessment_Templates` | Psychometric assessment blueprints and timer rules |
| 6 | `DB_06_Question_Bank` | Big 5, Aptitude, SJT, Cognitive question items |
| 7 | `DB_07_Question_Options` | Likert weights, MCQ choices, correctness flags |
| 8 | `DB_08_Assessment_Invitations` | Tokenized invitations with expiry controls |
| 9 | `DB_09_Assessment_Attempts` | Candidate test sessions, timer, and scores |
| 10 | `DB_10_Responses` | Item-level responses, time taken, points earned |
| 11 | `DB_11_Scores` | Trait STEN scores, percentiles, interpretations |
| 12 | `DB_12_Video_Questions` | Structured interview questions and prep timers |
| 13 | `DB_13_Video_Interviews` | Assigned video interview sessions |
| 14 | `DB_14_Video_Responses` | Video recordings metadata and storage references |
| 15 | `DB_15_Transcripts` | Automated speech-to-text transcripts with timestamps |
| 16 | `DB_16_AI_Evaluations` | Transparent competency rubric scoring |
| 17 | `DB_17_Human_Evaluations` | Evaluator feedback, ratings, and scorecards |
| 18 | `DB_18_Final_Reports` | Consolidated 360 executive candidate reports |
| 19 | `DB_19_Notifications` | Dispatched email notifications and delivery logs |
| 20 | `DB_20_Audit_Logs` | Immutable security and regulatory audit trails |
| 21 | `DB_21_Configuration` | Multi-tenant platform preferences |
| 22 | `DB_22_API_Logs` | Telemetry, execution latency, and endpoint logs |
| 23 | `DB_23_Candidate_Video_Profiles` | Video CVs, intros, portfolios, and visibility tags |
| 24 | `DB_24_Video_Access_Logs` | Access auditing for candidate media privacy |

---

## Google Apps Script Backend (`PSYCHOMETRIC_APPS_SCRIPT/`)

Complete source code provided in `PSYCHOMETRIC_APPS_SCRIPT/`:
- `Code.gs`: Master RESTful dispatcher handling `doGet` and `doPost`.
- `SetupMasterDatabase.gs`: One-click script to create and format all 24 sheets in TRUSTGRID royal blue (`#001A9C`) with pre-seeded data.
- `DatabaseService.gs`: Relational sheet operations with `LockService` concurrency protection and batch I/O.
- `AuthService.gs`: Role hierarchy verification and token management.
- `ScoringService.gs`: Validated STEN and psychometric calculations.
- `VideoStorageService.gs`: Google Drive multi-tenant folder organization.
- `AIEvaluationService.gs`: Ethical competency rubric evaluator.
- `EmailService.gs`: Transactional candidate invitation and completion emails.
- `AuditService.gs`: Compliance and video access logging.

See [DEPLOYMENT_GUIDE.md](file:///c:/Users/srimp/Downloads/Psychometric/PSYCHOMETRIC_APPS_SCRIPT/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

---

## Running the Platform Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

---

## Persona Quick Switcher

In the top bar, click the persona switcher to test each user role:
- **HR / Recruiter**: Manage candidates, review video profiles, inspect AI transcripts, compare candidates side-by-side, export 360 PDF reports.
- **Candidate Portal**: Take the online psychometric assessment, upload/record Video CVs, record one-way video interview answers.
- **Human Evaluator**: Review candidate answers, assign 1-5 star ratings, submit rubric feedback and recommendations.
- **Organization Admin**: Configure assessment blueprints, job roles, and team settings.
- **Super Admin**: View global multi-tenant analytics, provisioned clients, and security audit logs.
