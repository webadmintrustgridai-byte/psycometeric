# TRUSTGRID.AI - Google Apps Script Master Database Deployment Guide
### Controlled Campus-Based Psychometric & AI Video Assessment Platform (14 Standardized Relational Tabs)

This guide provides instructions to connect Google Sheets and Google Apps Script as your live master database for **TRUSTGRID.AI**.

---

## Google Spreadsheet & Deployment Details
- **Spreadsheet ID**: `16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI`
- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI](https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI)
- **Deployment URL**: `https://script.google.com/macros/s/AKfycby09Y3Ym1I5jwIU3dqQCMwFdijG3QhKfCmQ-De8vvcEDaYqvhRIrhmIDxvejc5Za0Ni/exec`

---

## 1-Minute Setup (Single Script File)

We have provided a single self-contained script file that automatically sets up all 14 database sheets, headers, authentication, academic profile ledgers, questions, server timers, and scoring in one click:
👉 [`PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs`](file:///c:/Users/srimp/Downloads/Psychometric/PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs)

### Step 1: Open Google Sheets & Apps Script
1. Open your master sheet: [https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI](https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI).
2. Click **Extensions > Apps Script**.
3. Open [`PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs`](file:///c:/Users/srimp/Downloads/Psychometric/PSYCHOMETRIC_APPS_SCRIPT/AllInOneCode.gs), copy all contents, and paste them into the Apps Script editor.
4. Click **Save** (`Ctrl + S`).

### Step 2: Initialize Database Sheets
1. In the Apps Script toolbar function dropdown, select **`setupMasterDatabase`**.
2. Click **Run**. Grant permissions when prompted.
3. This creates all 14 relational database sheets with headers and sets up default Super Admin (`poojasri@trustgrid.ai`).

### Step 3: Deploy as a Web App
1. Click **Deploy > Manage Deployments > Edit** (or New deployment).
2. Version: **New Version**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Click **Deploy** and verify the Web App URL matches [`src/config.ts`](file:///c:/Users/srimp/Downloads/Psychometric/src/config.ts).

---

## The 14 Standardized Database Sheets

1. **`DB_1_Candidates`**:
   `Candidate_ID`, `Registration_Date`, `Full_Name`, `Primary_Email`, `Secondary_Email`, `Mobile_Number`, `WhatsApp_Number`, `Date_of_Birth`, `College_Name`, `Department`, `Degree`, `Academic_Year`, `Current_Semester`, `College_ID_Number`, `Photograph_URL`, `Registration_Status`, `Profile_Status`, `Approval_Date`, `Approved_By`

2. **`DB_2_Academic_Profile`**:
   `Academic_Record_ID`, `Candidate_ID`, `Education_Level`, `School_or_College`, `Board_or_University`, `Passing_Year`, `Mathematics_Marks`, `Science_Marks`, `Physics_Marks`, `Chemistry_Marks`, `English_Marks`, `Total_Marks`, `Percentage`, `Semester_Number`, `Semester_Marks`, `Semester_CGPA`, `Overall_CGPA`, `Backlogs`

3. **`DB_3_Candidate_Activities`**:
   `Activity_ID`, `Candidate_ID`, `NCC_Participation`, `Sports_Activities`, `Extracurricular_Activities`, `Achievements`, `Resume_URL`, `College_ID_URL`, `Certificates_URL`

4. **`DB_4_Entrance_Exams`**:
   `Exam_Record_ID`, `Candidate_ID`, `Examination_Name`, `Examination_Year`, `Score`, `Percentile`, `Rank`, `Scorecard_URL`

5. **`DB_5_Assessment_Master`**:
   `Assessment_ID`, `Assessment_Name`, `Assessment_Type`, `Duration_Minutes`, `Total_Questions`, `Total_Marks`, `Negative_Marking`, `Assessment_Status`, `Created_Date`, `Created_By`

6. **`DB_6_Question_Bank`**:
   `Question_ID`, `Assessment_ID`, `Section_Name`, `Question_Text`, `Option_A`, `Option_B`, `Option_C`, `Option_D`, `Correct_Answer`, `Marks`, `Difficulty_Level`, `Explanation`, `Question_Status`

7. **`DB_7_Assessment_Assignments`**:
   `Assignment_ID`, `Candidate_ID`, `Assessment_ID`, `Scheduled_Date`, `Scheduled_Start_Time`, `Assignment_Status`, `Approved_By`, `Attempt_Allowed`, `Retake_Approved`

8. **`DB_8_Assessment_Attempts`**:
   `Attempt_ID`, `Candidate_ID`, `Assessment_ID`, `Start_Timestamp`, `End_Timestamp`, `End_Timestamp_Deadline`, `Duration_Seconds`, `Attempt_Status`, `Total_Questions`, `Answered_Questions`, `Score`, `Total_Marks`, `Submission_Type`, `Retake_Number`

9. **`DB_9_Assessment_Responses`**:
   `Response_ID`, `Attempt_ID`, `Candidate_ID`, `Assessment_ID`, `Question_ID`, `Selected_Answer`, `Marks_Awarded`, `Answer_Timestamp`

10. **`DB_10_Assessment_Results`**:
    `Result_ID`, `Candidate_ID`, `Assessment_ID`, `Attempt_ID`, `Section_Name`, `Total_Questions`, `Correct_Answers`, `Score`, `Total_Marks`, `Percentage`, `Result_Status`

11. **`DB_11_Video_Profiles`**:
    `Video_ID`, `Candidate_ID`, `Video_URL`, `Drive_File_ID`, `Submission_Date`, `Review_Status`, `Reviewed_By`, `Review_Comments`

12. **`DB_12_Admin_Users`**:
    `Admin_ID`, `Admin_Name`, `Email`, `Role`, `Password_Hash`, `Account_Status`, `Created_Date`, `Last_Login`

13. **`DB_13_System_Configuration`**:
    `Config_ID`, `Config_Name`, `Config_Value`, `Updated_By`, `Updated_Date`

14. **`DB_14_Audit_Log`**:
    `Log_ID`, `User_ID`, `User_Role`, `Action`, `Entity_Type`, `Entity_ID`, `Timestamp`, `IP_Address`, `Details`
