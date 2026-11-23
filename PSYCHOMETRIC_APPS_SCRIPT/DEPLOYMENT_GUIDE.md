# TRUSTGRID.AI - Google Apps Script Master Database Deployment Guide
### Online MCQ Psychometric Assessment Platform with User Authentication & Voluntary Data Disclosure

This guide provides simple instructions to connect Google Sheets and Google Apps Script as your live master database for **TRUSTGRID.AI**.

---

## 1-Minute Setup (Single Script File)

We have provided a single self-contained script file that automatically sets up all database sheets, headers, authentication logging, voluntary data disclosure records, and 9-test scoring in one click:
👉 [`PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs`](file:///c:/Users/srimp/Downloads/Psychometric/PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs)

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the spreadsheet: **`TRUSTGRID_AI_PSYCHOMETRIC_DB`**.

### Step 2: Open Apps Script
1. In the top menu of your Google Sheet, click **Extensions > Apps Script**.
2. Delete any boilerplate code inside `Code.gs`.
3. Open [`PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs`](file:///c:/Users/srimp/Downloads/Psychometric/PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs), copy all contents, and paste them into the Apps Script editor.
4. Click the **Save** disk icon (or press `Ctrl + S`).

### Step 3: Deploy as a Web App
1. Click the blue **Deploy** button at top right > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the options:
   - **Description**: `TRUSTGRID.AI Psychometric, Auth & Consent API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` (Required for browser client submissions without OAuth challenges)
4. Click **Deploy**.
5. When prompted, click **Authorize access**, select your Google account, and click **Allow**.
6. Copy the generated **Web App URL** (`https://script.google.com/macros/s/.../exec`).

### Step 4: Connect to the TRUSTGRID.AI Frontend
Paste your copied Web App URL into:
👉 [`src/config.ts`](file:///c:/Users/srimp/Downloads/Psychometric/src/config.ts):
```typescript
export const GOOGLE_APPS_SCRIPT_URL: string = 'https://script.google.com/macros/s/.../exec';
```

---

## Automatically Created Google Sheets Database Tables

When your first request arrives, the script automatically provisions 7 relational sheets with `#001A9C` royal blue headers and white bold text:

1. **`DB_Users`**:
   `User_ID`, `Full_Name`, `Email`, `Role`, `Status`, `Last_Login`, `Created_At`

2. **`DB_Auth_Sessions`**:
   `Session_ID`, `User_ID`, `Email`, `Full_Name`, `Role`, `Action` (LOGIN / REGISTER / LOGOUT), `Timestamp`

3. **`DB_Candidates`**:
   `Candidate_ID`, `Full_Name`, `Email`, `Phone_Number`, `Current_Designation`, `Current_Organization`, `Total_Experience`, `Location`, `Skills`, `Resume_URL`, `Verification_Status`, `Consent_Status`, `Created_At`

4. **`DB_Consent_Submissions`** *(Voluntary Data Disclosure & Submission)*:
   `Consent_ID`, `Candidate_ID`, `Candidate_Name`, `Candidate_Email`, `Consent_Status`, `Consent_Version`, `Disclosures_Accepted`, `Digital_Signature`, `Timestamp`

5. **`DB_Assessment_Results`** *(All 9 Assessment Modules with STEN Norms 1–10)*:
   `Result_ID`, `Candidate_ID`, `Assessment_Title`, `Composite_Score_Pct`, `Aptitude_STEN`, `Logical_Reasoning_STEN`, `Verbal_Reasoning_STEN`, `Openness_STEN`, `Conscientiousness_STEN`, `Extraversion_STEN`, `Agreeableness_STEN`, `Emotional_Stability_STEN`, `Emotional_Intelligence_STEN`, `Situational_Judgement_STEN`, `Communication_Skills_STEN`, `Learning_Agility_STEN`, `Thematic_Apperception_STEN`, `Completed_At`

6. **`DB_Item_Responses`**:
   `Response_ID`, `Candidate_ID`, `Question_ID`, `Selected_Option`, `Points_Earned`, `Time_Taken_Seconds`, `Submitted_At`

7. **`DB_Logs`**:
   `Log_ID`, `Action`, `Payload_Snippet`, `Timestamp`
