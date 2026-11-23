/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * TypeScript Type Definitions for MCQ Psychometric Testing
 */

export type Role = 'ADMIN' | 'CANDIDATE';

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

export interface Organization {
  Organization_ID: string;
  Org_Name: string;
  Domain: string;
  Created_At: string;
}

export interface Candidate {
  Candidate_ID: string;
  Organization_ID: string;
  Full_Name: string;
  Email: string;
  Phone_Number: string;
  Location: string;
  Qualification: string;
  University: string;
  Graduation_Year: string;
  Total_Experience: string;
  Current_Organization: string;
  Current_Designation: string;
  Skills: string;
  Resume_URL?: string;
  Profile_Photo?: string;
  Registration_Date: string;
  Verification_Status: 'VERIFIED' | 'PENDING';
  Consent_Status: 'GRANTED' | 'DECLINED';
  Record_Status: 'ACTIVE' | 'ARCHIVED';
  Created_At: string;
  Updated_At: string;
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
  | 'THEMATIC_APPERCEPTION'
  | 'COGNITIVE'
  | 'TECHNICAL';

export interface TestModuleInfo {
  category: AssessmentCategory;
  name: string;
  shortName: string;
  description: string;
  domain: 'COGNITIVE' | 'PSYCHOLOGICAL' | 'BEHAVIORAL';
  timeLimitMinutes: number;
  questionType: 'MCQ' | 'LIKERT_5' | 'SCENARIO_JUDGEMENT';
  badgeColor: string;
}

export const TEST_MODULES_LIST: TestModuleInfo[] = [
  {
    category: 'APTITUDE',
    name: 'Aptitude Test',
    shortName: 'Aptitude',
    description: 'Quantitative problem solving, percentage variations, ratios, numerical series & data estimation.',
    domain: 'COGNITIVE',
    timeLimitMinutes: 15,
    questionType: 'MCQ',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    category: 'LOGICAL_REASONING',
    name: 'Logical Reasoning Test',
    shortName: 'Logical Reasoning',
    description: 'Deductive reasoning, pattern recognition, syllogisms, and algorithmic rule induction.',
    domain: 'COGNITIVE',
    timeLimitMinutes: 15,
    questionType: 'MCQ',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    category: 'VERBAL_REASONING',
    name: 'Verbal Reasoning Test',
    shortName: 'Verbal Reasoning',
    description: 'Critical textual comprehension, vocabulary inference, grammar analysis & logical conclusions.',
    domain: 'COGNITIVE',
    timeLimitMinutes: 12,
    questionType: 'MCQ',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  {
    category: 'PERSONALITY',
    name: 'Personality Test',
    shortName: 'Personality (Big Five)',
    description: 'Standard Big Five / Five-Factor Model (Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability).',
    domain: 'PSYCHOLOGICAL',
    timeLimitMinutes: 15,
    questionType: 'LIKERT_5',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    category: 'EMOTIONAL_INTELLIGENCE',
    name: 'Emotional Intelligence (EQ) Test',
    shortName: 'Emotional Intelligence (EQ)',
    description: 'Goleman EQ framework: Self-Awareness, Self-Regulation, Empathy & Interpersonal Relationship Management.',
    domain: 'PSYCHOLOGICAL',
    timeLimitMinutes: 15,
    questionType: 'LIKERT_5',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    category: 'SITUATIONAL_JUDGEMENT',
    name: 'Situational Judgment Test (SJT)',
    shortName: 'Situational Judgment (SJT)',
    description: 'Realistic workplace crisis scenarios, ethical trade-offs, architectural escalation & risk prioritization.',
    domain: 'BEHAVIORAL',
    timeLimitMinutes: 15,
    questionType: 'SCENARIO_JUDGEMENT',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    category: 'COMMUNICATION_SKILLS',
    name: 'Communication Skills Assessment',
    shortName: 'Communication Skills',
    description: 'Professional tone calibration, conflict de-escalation, executive briefings & constructive feedback.',
    domain: 'BEHAVIORAL',
    timeLimitMinutes: 12,
    questionType: 'SCENARIO_JUDGEMENT',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    category: 'LEARNING_AGILITY',
    name: 'Learning Agility Assessment',
    shortName: 'Learning Agility',
    description: 'Mental agility, people agility, change adaptability & results agility in ambiguous first-time problems.',
    domain: 'BEHAVIORAL',
    timeLimitMinutes: 12,
    questionType: 'LIKERT_5',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    category: 'THEMATIC_APPERCEPTION',
    name: 'Thematic Apperception Test (TAT)',
    shortName: 'Thematic Apperception (TAT)',
    description: 'Workplace projective scenario interpretations assessing Need for Achievement (nAch), Affiliation (nAff) & Power/Influence.',
    domain: 'BEHAVIORAL',
    timeLimitMinutes: 15,
    questionType: 'SCENARIO_JUDGEMENT',
    badgeColor: 'bg-violet-50 text-violet-800 border-violet-200'
  }
];

export interface AssessmentTemplate {
  Template_ID: string;
  Organization_ID: string;
  Title: string;
  Categories: AssessmentCategory[];
  Time_Limit_Minutes: number;
  Passing_Score: number;
  Total_Marks: number;
  Adaptive_Enabled: boolean;
  Negative_Marking?: boolean;
  Status: 'ACTIVE' | 'DRAFT';
  Created_At: string;
}

export interface Question {
  Question_ID: string;
  Organization_ID: string;
  Category: AssessmentCategory;
  Subcategory: string; // 'Openness', 'Conscientiousness', 'Numerical', etc.
  Question_Type: 'LIKERT_5' | 'MCQ' | 'SCENARIO_JUDGEMENT';
  Difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  Question_Text: string;
  Points: number;
  Reverse_Scored?: boolean;
  Options?: QuestionOption[];
}

export interface QuestionOption {
  Option_ID: string;
  Question_ID: string;
  Option_Text: string;
  Trait_Weight?: number; // 1-5 for Likert
  Is_Correct?: boolean;  // for Aptitude
  Order_Index: number;
}

export interface CandidateResponse {
  Response_ID: string;
  Attempt_ID: string;
  Candidate_ID: string;
  Question_ID: string;
  Selected_Option_ID?: string;
  Response_Value?: any;
  Time_Taken_Seconds: number;
  Is_Correct: boolean;
  Points_Earned: number;
}

export interface ScoreRecord {
  Score_ID: string;
  Attempt_ID: string;
  Candidate_ID: string;
  Category: AssessmentCategory;
  Trait_Name: string;
  Raw_Score: number;
  Normalized_Score: number;
  Sten_Score: number; // 1-10 STEN
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

export interface AuditLog {
  Log_ID: string;
  Action: string;
  Entity_Type: string;
  Entity_ID: string;
  Details_JSON: string;
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
