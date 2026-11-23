/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * TypeScript Type Definitions for 14-Table Standardized Database & 3 Consolidated Assessments
 */

// ==========================================
// USER ROLES & AUTHENTICATION
// ==========================================
export type Role = 'CANDIDATE' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  User_ID: string;
  Organization_ID: string;
  Full_Name: string;
  Email: string;
  Role: Role;
  Status: 'ACTIVE' | 'INACTIVE';
  Created_At: string;
}

export interface AuthSession {
  user: User;
  candidateId?: string;
  token: string;
  loginTime: string;
}

export interface AuthLog {
  Session_ID: string;
  User_ID: string;
  Email: string;
  Full_Name: string;
  Role: Role;
  Action: 'LOGIN' | 'REGISTER' | 'LOGOUT';
  Timestamp: string;
}

// ==========================================
// DB_1_Candidates: CANDIDATE PERSONAL & REGISTRATION
// ==========================================
export type RegistrationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type ProfileStatus = 'INCOMPLETE' | 'PROFILE_COMPLETED';

export interface Candidate {
  Candidate_ID: string;
  Organization_ID?: string;
  Registration_Date: string;
  Full_Name: string;
  Primary_Email: string;
  Secondary_Email?: string;
  Email: string; // compatibility alias with Primary_Email
  Mobile_Number: string;
  WhatsApp_Number: string;
  Date_of_Birth: string;
  Gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  College_Name: string;
  Department: string;
  Degree: string;
  Academic_Year: string;
  Current_Semester: string;
  College_ID_Number: string;
  Photograph_URL?: string;
  Registration_Status: RegistrationStatus;
  Profile_Status: ProfileStatus;
  Approval_Date?: string;
  Approved_By?: string;
  
  // Backward compatibility fields
  Phone_Number?: string;
  Location?: string;
  Qualification?: string;
  University?: string;
  Graduation_Year?: string;
  Total_Experience?: string;
  Current_Organization?: string;
  Current_Designation?: string;
  Skills?: string;
  Resume_URL?: string;
  Profile_Photo?: string;
  Verification_Status?: 'VERIFIED' | 'PENDING';
  Consent_Status?: 'GRANTED' | 'DECLINED';
  Record_Status?: 'ACTIVE' | 'ARCHIVED';
  Created_At?: string;
  Updated_At?: string;
}

// ==========================================
// DB_2_Academic_Profile: 10TH, 12TH & COLLEGE SEMESTERS
// ==========================================
export interface AcademicProfileRecord {
  Academic_Record_ID: string;
  Candidate_ID: string;
  Education_Level: '10TH' | '12TH' | 'COLLEGE_SEMESTER';
  School_or_College: string;
  Board_or_University: string;
  Passing_Year: string;
  Mathematics_Marks?: number;
  Science_Marks?: number;
  Physics_Marks?: number;
  Chemistry_Marks?: number;
  English_Marks?: number;
  Total_Marks?: number;
  Percentage?: number;
  Semester_Number?: number;
  Semester_Marks?: number;
  Semester_CGPA?: number;
  Overall_CGPA?: number;
  Backlogs?: number;
  Arrears_History?: string;
  Created_At?: string;
}

// Composite Academic Profile Structure for Candidate
export interface CandidateFullAcademicProfile {
  sslc10: {
    schoolName: string;
    board: string;
    passingYear: string;
    mathsMarks: number;
    scienceMarks: number;
    englishMarks: number;
    totalMarks: number;
    percentage: number;
  };
  hsc12: {
    schoolName: string;
    board: string;
    passingYear: string;
    mathsMarks: number;
    physicsMarks: number;
    chemistryMarks: number;
    mpcGroupMarks: number;
    englishMarks: number;
    totalMarks: number;
    percentage: number;
  };
  college: {
    collegeName: string;
    degree: string;
    department: string;
    academicYear: string;
    currentSemester: string;
    semesters: {
      semesterNumber: number;
      marks: number;
      maxMarks: number;
      cgpa: number;
    }[];
    overallCGPA: number;
    backlogs: number;
    arrearsHistory: string;
  };
}

// ==========================================
// DB_3_Candidate_Activities: EXTRACURRICULAR & DOCUMENTS
// ==========================================
export interface CandidateActivitiesRecord {
  Activity_ID: string;
  Candidate_ID: string;
  NCC_Participation: string; // e.g., 'C Certificate - Alpha Grade' or 'No'
  Sports_Activities: string;
  Extracurricular_Activities: string;
  Leadership_Activities?: string;
  Achievements: string;
  Resume_URL?: string;
  College_ID_URL?: string;
  Certificates_URL?: string;
  Created_At?: string;
}

// ==========================================
// DB_4_Entrance_Exams: JEE, BITSAT & OTHERS
// ==========================================
export interface EntranceExamRecord {
  Exam_Record_ID: string;
  Candidate_ID: string;
  Examination_Name: 'JEE_MAIN' | 'JEE_ADVANCED' | 'BITSAT' | 'STATE_CET' | 'GATE' | 'OTHER';
  Examination_Year: string;
  Score?: number;
  Percentile?: number;
  Rank?: number;
  Scorecard_URL?: string;
  Created_At?: string;
}

// ==========================================
// DB_5_Assessment_Master: THE 3 CONSOLIDATED ASSESSMENTS
// ==========================================
export type AssessmentType = 'APTITUDE' | 'COMPREHENSION' | 'EI_SITUATIONAL';

export interface AssessmentMaster {
  Assessment_ID: string; // 'ASM_APTITUDE' | 'ASM_COMPREHENSION' | 'ASM_EI_SITUATIONAL'
  Assessment_Name: string;
  Assessment_Type: AssessmentType;
  Duration_Minutes: number; // 30 mins (Aptitude & EI default), 30 or 60 for Comprehension
  Total_Questions: number; // exactly 30
  Total_Marks: number;     // exactly 30
  Negative_Marking: boolean; // false default
  Assessment_Status: 'ACTIVE' | 'ARCHIVED';
  Created_Date: string;
  Created_By: string;
}

// ==========================================
// DB_6_Question_Bank: 30 QUESTIONS PER ASSESSMENT
// ==========================================
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'DIFFICULT';

export interface QuestionBankItem {
  Question_ID: string;
  Assessment_ID: string; // 'ASM_APTITUDE' | 'ASM_COMPREHENSION' | 'ASM_EI_SITUATIONAL'
  Section_Name: string;
  Passage_ID?: string;       // For Assessment 2: Comprehension passage grouping (P1, P2, P3)
  Passage_Text?: string;     // The reading passage text
  Situation_ID?: string;     // For Assessment 3: Situation grouping (S1..S6)
  Situation_Text?: string;   // The workplace scenario text
  Question_Text: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D: string;
  Correct_Answer: 'A' | 'B' | 'C' | 'D'; // Server-authoritative; not revealed to candidate
  Option_Weights?: { A: number; B: number; C: number; D: number }; // For EI / Situational scoring
  Marks: number; // default 1
  Difficulty_Level: DifficultyLevel;
  Explanation: string; // For Admin review
  Question_Status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

// Backward compatibility alias for UI components
export interface Question {
  Question_ID: string;
  Organization_ID?: string;
  Category?: any;
  Subcategory?: string;
  Question_Type?: 'MCQ' | 'LIKERT_5' | 'SCENARIO_JUDGEMENT';
  Difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  Question_Text: string;
  Points?: number;
  Reverse_Scored?: boolean;
  Options?: QuestionOption[];
  // Extended fields from QuestionBankItem
  Assessment_ID?: string;
  Section_Name?: string;
  Passage_ID?: string;
  Passage_Text?: string;
  Situation_ID?: string;
  Situation_Text?: string;
  Correct_Answer?: 'A' | 'B' | 'C' | 'D';
  Explanation?: string;
}

export interface QuestionOption {
  Option_ID: string;
  Question_ID: string;
  Option_Text: string;
  Trait_Weight?: number;
  Is_Correct?: boolean;
  Order_Index: number;
}

// ==========================================
// DB_7_Assessment_Assignments: LAB-BASED SCHEDULING
// ==========================================
export type AssignmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface AssessmentAssignment {
  Assignment_ID: string;
  Candidate_ID: string;
  Assessment_ID: string;
  Scheduled_Date: string; // 'YYYY-MM-DD'
  Scheduled_Start_Time: string; // 'HH:MM'
  Duration_Minutes: number;
  Assignment_Status: AssignmentStatus;
  Approved_By: string;
  Attempt_Allowed: number; // default 1
  Retake_Approved: boolean; // default false
  Retake_Reason?: string;
}

// ==========================================
// DB_8_Assessment_Attempts: SERVER-AUTHORITATIVE TIMER & LIFECYCLE
// ==========================================
export type AttemptStatus = 
  | 'SCHEDULED' 
  | 'AVAILABLE' 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'COMPLETED' 
  | 'LOCKED' 
  | 'EXPIRED' 
  | 'TIME_EXPIRED' 
  | 'RETAKE_AUTHORIZED' 
  | 'CANCELLED';

export interface AssessmentAttempt {
  Attempt_ID: string;
  Candidate_ID: string;
  Assessment_ID: string;
  Start_Timestamp: string;
  End_Timestamp?: string;
  End_Timestamp_Deadline: string; // Server deadline for countdown and auto-submission
  Duration_Seconds: number;
  Attempt_Status: AttemptStatus;
  Total_Questions: number; // 30
  Answered_Questions: number;
  Score: number;
  Total_Marks: number; // 30
  Submission_Type: 'MANUAL' | 'AUTO_TIME_EXPIRED' | 'ADMIN_FORCE';
  Retake_Number: number;
}

// ==========================================
// DB_9_Assessment_Responses: AUTOSAVE & ANSWER AUDIT
// ==========================================
export interface AssessmentResponse {
  Response_ID: string;
  Attempt_ID: string;
  Candidate_ID: string;
  Assessment_ID: string;
  Question_ID: string;
  Selected_Answer: 'A' | 'B' | 'C' | 'D' | '';
  Marks_Awarded: number;
  Answer_Timestamp: string;
}

// ==========================================
// DB_10_Assessment_Results: SECTION SCORES & FINAL BENCHMARK
// ==========================================
export interface AssessmentResult {
  Result_ID: string;
  Candidate_ID: string;
  Assessment_ID: string;
  Attempt_ID: string;
  Section_Name: string;
  Total_Questions: number;
  Correct_Answers: number;
  Score: number;
  Total_Marks: number;
  Percentage: number;
  Result_Status: 'PROVISIONAL' | 'VERIFIED' | 'PUBLISHED';
}

// ==========================================
// DB_11_Video_Profiles: CANDIDATE VIDEO METADATA & REVIEW
// ==========================================
export type VideoReviewStatus = 'PENDING' | 'REVIEWED' | 'REJECTED';

export interface CandidateVideoProfile {
  Video_ID: string;
  Candidate_ID: string;
  Video_URL: string;
  Drive_File_ID?: string;
  Submission_Date: string;
  Review_Status: VideoReviewStatus;
  Reviewed_By?: string;
  Review_Comments?: string;
  Duration_Seconds?: number;
  Video_Title?: string;
}

// ==========================================
// DB_12_Admin_Users: RBAC & ADMIN ACCOUNTS
// ==========================================
export interface AdminUser {
  Admin_ID: string;
  Admin_Name: string;
  Email: string;
  Role: 'ADMIN' | 'SUPER_ADMIN';
  Password_Hash: string;
  Account_Status: 'ACTIVE' | 'SUSPENDED';
  Created_Date: string;
  Last_Login?: string;
}

// ==========================================
// DB_13_System_Configuration: SYSTEM & ASSESSMENT SETTINGS
// ==========================================
export interface SystemConfiguration {
  Config_ID: string;
  Config_Name: string;
  Config_Value: string;
  Updated_By: string;
  Updated_Date: string;
}

// ==========================================
// DB_14_Audit_Log: SECURITY & RETAKE AUDIT
// ==========================================
export interface SystemAuditLog {
  Log_ID: string;
  User_ID: string;
  User_Role: Role;
  Action: string;
  Entity_Type: string;
  Entity_ID: string;
  Timestamp: string;
  IP_Address: string;
  Details: string;
}

// ==========================================
// COMPATIBILITY & UI REPORT TYPES
// ==========================================
export interface ScoreRecord {
  Score_ID: string;
  Attempt_ID: string;
  Candidate_ID: string;
  Category: any;
  Trait_Name: string;
  Raw_Score: number;
  Normalized_Score: number;
  Sten_Score: number;
  Interpretation: string;
  Percentile: number;
  Created_At: string;
}

export interface FinalReport {
  Report_ID: string;
  Candidate_ID: string;
  Report_Type: 'PSYCHOMETRIC';
  Composite_Score: number;
  Aptitude_Score: number;
  Strengths: string[];
  Development_Areas: string[];
  Created_At: string;
}

export interface VoluntaryDisclosureConsent {
  Consent_ID: string;
  Candidate_ID: string;
  Candidate_Name: string;
  Candidate_Email: string;
  Consent_Status: 'GRANTED' | 'DECLINED';
  Consent_Version: string;
  Disclosures_Accepted: {
    voluntary_participation: boolean;
    psychometric_scoring: boolean;
    data_retention_storage?: boolean;
    independent_integrity_pledge: boolean;
  };
  Digital_Signature: string;
  Timestamp: string;
}

export interface AssessmentTemplate {
  Template_ID: string;
  Organization_ID?: string;
  Title: string;
  Categories: any[];
  Time_Limit_Minutes: number;
  Passing_Score: number;
  Total_Marks: number;
  Adaptive_Enabled: boolean;
  Negative_Marking?: boolean;
  Status: 'ACTIVE' | 'DRAFT';
  Created_At: string;
}

export interface Organization {
  Organization_ID: string;
  Org_Name: string;
  Domain: string;
  Created_At: string;
}

export type AssessmentCategory = 
  | 'APTITUDE'
  | 'LOGICAL_REASONING'
  | 'VERBAL_REASONING'
  | 'PERSONALITY'
  | 'EMOTIONAL_INTELLIGENCE'
  | 'SITUATIONAL_JUDGEMENT'
  | 'COMMUNICATION_SKILLS'
  | 'LEARNING_AGILITY'
  | 'THEMATIC_APPERCEPTION';

export interface TestModuleInfo {
  category: AssessmentType;
  name: string;
  shortName: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  badgeColor: string;
}

export const CONSOLIDATED_ASSESSMENTS: TestModuleInfo[] = [
  {
    category: 'APTITUDE',
    name: 'Assessment 1: Aptitude Assessment',
    shortName: 'Aptitude Assessment',
    description: '30 CAT-style questions across Quantitative, Logical, Verbal, Abstract, Problem-Solving, Critical Thinking, DI & Analytical Reasoning.',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    category: 'COMPREHENSION',
    name: 'Assessment 2: Test of Comprehension',
    shortName: 'Test of Comprehension',
    description: '3 extensive reading passages with 10 questions each (30 questions) evaluating vocabulary, main ideas, inference & analytical analysis.',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    category: 'EI_SITUATIONAL',
    name: 'Assessment 3: Emotional Intelligence & Situational Reaction',
    shortName: 'Emotional Intelligence & SJT',
    description: '6 realistic professional situations with 5 questions each (30 questions) evaluating empathy, conflict management, teamwork & decision-making.',
    totalQuestions: 30,
    totalMarks: 30,
    durationMinutes: 30,
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  }
];

// Compatibility for existing imports
export const TEST_MODULES_LIST = CONSOLIDATED_ASSESSMENTS;
