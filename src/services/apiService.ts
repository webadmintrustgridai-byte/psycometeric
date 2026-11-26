/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * apiService.ts - Comprehensive 14-Table Data Access Layer & Google Apps Script Sync
 */

import {
  Candidate,
  AssessmentMaster,
  QuestionBankItem,
  Question,
  ScoreRecord,
  FinalReport,
  User,
  AuthSession,
  AuthLog,
  Role,
  VoluntaryDisclosureConsent,
  AcademicProfileRecord,
  CandidateFullAcademicProfile,
  EntranceExamRecord,
  CandidateActivitiesRecord,
  AssessmentAssignment,
  AssessmentAttempt,
  AssessmentResponse,
  AssessmentResult,
  CandidateVideoProfile,
  AdminUser,
  SystemConfiguration,
  SystemAuditLog,
  QuestionSetCode
} from '../types';
import {
  INITIAL_CANDIDATES,
  INITIAL_USERS,
  INITIAL_ADMIN_USERS,
  INITIAL_ASSESSMENT_MASTER,
  INITIAL_QUESTION_BANK,
  INITIAL_ACADEMIC_PROFILES,
  INITIAL_ENTRANCE_EXAMS,
  INITIAL_CANDIDATE_ACTIVITIES,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTEMPTS,
  INITIAL_QUESTIONS
} from '../data/initialSeedData';
import { GOOGLE_APPS_SCRIPT_URL, GOOGLE_SPREADSHEET_ID } from '../config';
import { ScoringEngine } from './scoringEngine';

const STORAGE_KEYS = {
  CANDIDATES: 'tg_db_1_candidates_v5',
  ACADEMIC_PROFILES: 'tg_db_2_academic_profiles_v5',
  ACTIVITIES: 'tg_db_3_activities_v5',
  ENTRANCE_EXAMS: 'tg_db_4_entrance_exams_v5',
  ASSESSMENTS: 'tg_db_5_assessments_v5',
  QUESTIONS: 'tg_db_6_questions_v7',
  ASSIGNMENTS: 'tg_db_7_assignments_v5',
  ATTEMPTS: 'tg_db_8_attempts_v5',
  RESPONSES: 'tg_db_9_responses_v5',
  RESULTS: 'tg_db_10_results_v5',
  VIDEOS: 'tg_db_11_videos_v5',
  ADMIN_USERS: 'tg_db_12_admin_users_v5',
  CONFIG: 'tg_db_13_config_v5',
  AUDIT_LOGS: 'tg_db_14_audit_logs_v5',
  ACTIVE_SESSION: 'tg_active_session_v5',
  CONSENTS: 'tg_consents_v5',
  GAS_CONFIG: 'tg_gas_config_v5',
  ASSESSMENT_LIVE_STATE: 'tg_assessment_live_state_v5'
};

// Automatic cleanup of legacy cached seed data
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('tg_') && !k.endsWith('_v5')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving storage for key: ' + key, e);
  }
}

export interface GasConfig {
  webAppUrl: string;
  spreadsheetId: string;
  autoSync: boolean;
  isConnected: boolean;
  lastSync?: string;
}

export const ApiService = {
  // ==========================================
  // GOOGLE APPS SCRIPT SETTINGS & SYNC
  // ==========================================
  getGasConfig(): GasConfig {
    const config = loadStorage<GasConfig>(STORAGE_KEYS.GAS_CONFIG, {
      webAppUrl: GOOGLE_APPS_SCRIPT_URL || '',
      spreadsheetId: GOOGLE_SPREADSHEET_ID || '',
      autoSync: Boolean(GOOGLE_APPS_SCRIPT_URL),
      isConnected: Boolean(GOOGLE_APPS_SCRIPT_URL)
    });
    if (GOOGLE_APPS_SCRIPT_URL) {
      config.webAppUrl = GOOGLE_APPS_SCRIPT_URL;
      config.isConnected = true;
      config.autoSync = true;
    }
    if (GOOGLE_SPREADSHEET_ID) {
      config.spreadsheetId = GOOGLE_SPREADSHEET_ID;
    }
    return config;
  },

  saveGasConfig(config: GasConfig): void {
    saveStorage(STORAGE_KEYS.GAS_CONFIG, config);
  },

  async syncToGas(action: string, payload: any): Promise<void> {
    const targetUrl = GOOGLE_APPS_SCRIPT_URL || this.getGasConfig().webAppUrl;
    if (!targetUrl) return;

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      console.log(`[GAS Sync] Dispatched ${action} to Google Apps Script`);
    } catch (err) {
      console.warn(`[GAS Sync] Failed dispatching ${action}:`, err);
    }
  },

  async pingGasBackend(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=healthCheck');
      const data = await resp.json();
      if (data && data.success) {
        return { success: true, message: 'Connected to TRUSTGRID.AI Apps Script backend v' + (data.data?.version || '4.0.0') };
      }
      return { success: false, message: data.error || 'Server responded with an error.' };
    } catch (err: any) {
      return { success: false, message: 'Network request failed: ' + (err.message || 'Check deployment URL.') };
    }
  },

  async pullAllFromGas(): Promise<{ success: boolean; count: number }> {
    const targetUrl = GOOGLE_APPS_SCRIPT_URL || this.getGasConfig().webAppUrl;
    if (!targetUrl || typeof window === 'undefined') return { success: false, count: 0 };

    try {
      const sep = targetUrl.includes('?') ? '&' : '?';
      const resp = await fetch(`${targetUrl}${sep}action=getCandidates`);
      if (!resp.ok) return { success: false, count: 0 };
      const json = await resp.json();
      if (json && json.success && Array.isArray(json.data)) {
        const local = loadStorage<Candidate[]>(STORAGE_KEYS.CANDIDATES, []);
        const map = new Map<string, Candidate>();
        local.forEach(c => {
          if (c.Candidate_ID) map.set(c.Candidate_ID, c);
        });
        json.data.forEach((remote: any) => {
          if (remote.Candidate_ID) {
            map.set(remote.Candidate_ID, {
              ...map.get(remote.Candidate_ID),
              ...remote
            });
          }
        });
        const merged = Array.from(map.values());
        saveStorage(STORAGE_KEYS.CANDIDATES, merged);
        console.log(`[GAS Pull] Synced ${json.data.length} candidates from Google Sheets`);
        return { success: true, count: json.data.length };
      }
      return { success: false, count: 0 };
    } catch (err) {
      console.warn('[GAS Pull] Failed to pull candidates:', err);
      return { success: false, count: 0 };
    }
  },

  // ==========================================
  // AUDIT LOGGING (DB_14_Audit_Log)
  // ==========================================
  logAudit(userId: string, userRole: Role, action: string, entityType: string, entityId: string, details: string): void {
    const logs = loadStorage<SystemAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const logItem: SystemAuditLog = {
      Log_ID: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      User_ID: userId,
      User_Role: userRole,
      Action: action,
      Entity_Type: entityType,
      Entity_ID: entityId,
      Timestamp: new Date().toISOString(),
      IP_Address: '127.0.0.1 (Campus Lab)',
      Details: details
    };
    logs.unshift(logItem);
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
    this.syncToGas('logAuditEvent', logItem);
  },

  getAuditLogs(): SystemAuditLog[] {
    return loadStorage<SystemAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  // ==========================================
  // AUTHENTICATION & SESSIONS
  // ==========================================
  getUsers(): User[] {
    return loadStorage<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS).map(a => ({
      User_ID: a.Admin_ID,
      Organization_ID: 'ORG_000001',
      Full_Name: a.Admin_Name,
      Email: a.Email,
      Role: a.Role,
      Status: a.Account_Status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      Created_At: a.Created_Date
    }));
  },

  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  async login(email: string, role: Role, password?: string): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const ADMIN_EMAIL = 'poojasri@trustgrid.ai';
      const ADMIN_PASSWORD = 'Pooj@2004*';

      if (cleanEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return {
          success: false,
          message: 'Invalid administrator email or password. Access denied.'
        };
      }

      const adminUser: User = {
        User_ID: 'USR_ADMIN_001',
        Organization_ID: 'ORG_000001',
        Full_Name: 'Poojasri',
        Email: ADMIN_EMAIL,
        Role: 'SUPER_ADMIN',
        Status: 'ACTIVE',
        Created_At: new Date().toISOString()
      };

      const session: AuthSession = {
        user: adminUser,
        token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);
      this.logAudit(adminUser.User_ID, adminUser.Role, 'ADMIN_LOGIN', 'ADMIN', adminUser.User_ID, 'Administrator authenticated successfully');

      return { success: true, session };
    } else {
      // Candidate Login (Lookup candidates registered via Sign Up or created by Administrator)
      let candidates = this.getCandidates();
      let matched = candidates.find(c => 
        (c.Primary_Email && c.Primary_Email.toLowerCase() === cleanEmail) || 
        (c.Email && c.Email.toLowerCase() === cleanEmail) ||
        (c.Candidate_ID && c.Candidate_ID.toLowerCase() === cleanEmail) ||
        (c.College_ID_Number && c.College_ID_Number.toLowerCase() === cleanEmail) ||
        (c.Full_Name && c.Full_Name.toLowerCase() === cleanEmail)
      );

      // If candidate is not found in local browser storage, pull directly from Google Sheets
      if (!matched) {
        try {
          await this.pullAllFromGas();
          candidates = this.getCandidates();
          matched = candidates.find(c => 
            (c.Primary_Email && c.Primary_Email.toLowerCase() === cleanEmail) || 
            (c.Email && c.Email.toLowerCase() === cleanEmail) ||
            (c.Candidate_ID && c.Candidate_ID.toLowerCase() === cleanEmail) ||
            (c.College_ID_Number && c.College_ID_Number.toLowerCase() === cleanEmail) ||
            (c.Full_Name && c.Full_Name.toLowerCase() === cleanEmail)
          );
        } catch (_) {}
      }

      if (!matched) {
        return {
          success: false,
          message: 'Candidate account not found. Please click the "Sign Up" tab above to register your profile.'
        };
      }

      const candidateUser: User = {
        User_ID: matched.Candidate_ID,
        Organization_ID: 'ORG_000001',
        Full_Name: matched.Full_Name,
        Email: matched.Primary_Email || matched.Email,
        Role: 'CANDIDATE',
        Status: 'ACTIVE',
        Created_At: matched.Registration_Date
      };

      const session: AuthSession = {
        user: candidateUser,
        candidateId: matched.Candidate_ID,
        token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);
      this.logAudit(candidateUser.User_ID, 'CANDIDATE', 'CANDIDATE_LOGIN', 'CANDIDATE', matched.Candidate_ID, 'Candidate logged in');

      return { success: true, session };
    }
  },

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.logAudit(session.user.User_ID, session.user.Role, 'LOGOUT', 'USER', session.user.User_ID, 'User session terminated');
    }
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // ==========================================
  // DB_1_Candidates: CANDIDATE MANAGEMENT
  // ==========================================
  getCandidates(): Candidate[] {
    return loadStorage<Candidate[]>(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES);
  },

  getCandidateById(id: string): Candidate | undefined {
    return this.getCandidates().find(c => c.Candidate_ID === id);
  },

  createCandidate(data: Partial<Candidate>): Candidate {
    const candidates = this.getCandidates();
    const candidateId = `CAN_${new Date().getFullYear()}_${String(candidates.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newCandidate: Candidate = {
      Candidate_ID: candidateId,
      Organization_ID: 'ORG_000001',
      Registration_Date: now,
      Full_Name: data.Full_Name?.trim() || 'New Candidate',
      Primary_Email: (data.Primary_Email || data.Email || '').trim().toLowerCase(),
      Secondary_Email: data.Secondary_Email?.trim().toLowerCase() || '',
      Email: (data.Primary_Email || data.Email || '').trim().toLowerCase(),
      Mobile_Number: data.Mobile_Number?.trim() || '',
      WhatsApp_Number: data.WhatsApp_Number?.trim() || data.Mobile_Number?.trim() || '',
      Date_of_Birth: data.Date_of_Birth || '2004-01-01',
      Gender: data.Gender || 'PREFER_NOT_TO_SAY',
      College_Name: data.College_Name?.trim() || 'Campus Engineering Institute',
      Department: data.Department?.trim() || 'Computer Science & Engineering',
      Degree: data.Degree?.trim() || 'B.Tech',
      Academic_Year: data.Academic_Year || '4th Year',
      Current_Semester: data.Current_Semester || 'Semester 7',
      College_ID_Number: data.College_ID_Number?.trim() || `ID-${Math.floor(Math.random() * 89999 + 10000)}`,
      Photograph_URL: data.Photograph_URL || '',
      Registration_Status: data.Registration_Status || 'APPROVED',
      Profile_Status: data.Profile_Status || 'PROFILE_COMPLETED',
      Approval_Date: data.Approval_Date || now,
      Approved_By: data.Approved_By || 'ADM_001',
      Qualification: data.Qualification || `${data.Degree || 'B.Tech'} in ${data.Department || 'CSE'}`,
      University: data.University || data.College_Name || 'Campus University',
      Graduation_Year: data.Graduation_Year || '2026',
      Total_Experience: data.Total_Experience || 'Fresher (Campus)',
      Current_Organization: data.Current_Organization || data.College_Name || 'College',
      Current_Designation: data.Current_Designation || 'Engineering Student',
      Skills: data.Skills || 'Problem Solving, Analytical Thinking, Algorithms',
      Resume_URL: data.Resume_URL || '',
      Verification_Status: 'VERIFIED',
      Consent_Status: 'GRANTED',
      Record_Status: 'ACTIVE',
      Created_At: now,
      Updated_At: now
    };

    candidates.unshift(newCandidate);
    saveStorage(STORAGE_KEYS.CANDIDATES, candidates);

    // Auto-create initial assignments for the 3 consolidated assessments
    this.autoAssignAssessments(newCandidate.Candidate_ID);

    this.syncToGas('registerCandidate', { candidate: newCandidate });
    this.logAudit(candidateId, 'CANDIDATE', 'CANDIDATE_REGISTERED', 'CANDIDATE', candidateId, `Candidate ${newCandidate.Full_Name} registered.`);

    return newCandidate;
  },

  registerCandidate(data: {
    name: string;
    email: string;
    phone?: string;
    designation?: string;
    experience?: string;
    resumeUrl?: string;
  }): { success: boolean; session?: AuthSession; candidate?: Candidate; message?: string } {
    const newCand = this.createCandidate({
      Full_Name: data.name.trim(),
      Primary_Email: data.email.trim().toLowerCase(),
      Email: data.email.trim().toLowerCase(),
      Mobile_Number: data.phone?.trim() || '',
      WhatsApp_Number: data.phone?.trim() || '',
      Current_Designation: data.designation?.trim() || 'Engineering Student',
      Total_Experience: data.experience?.trim() || 'Fresher (Campus)',
      Resume_URL: data.resumeUrl?.trim() || ''
    });

    const candidateUser: User = {
      User_ID: newCand.Candidate_ID,
      Organization_ID: 'ORG_000001',
      Full_Name: newCand.Full_Name,
      Email: newCand.Primary_Email,
      Role: 'CANDIDATE',
      Status: 'ACTIVE',
      Created_At: newCand.Registration_Date
    };

    const session: AuthSession = {
      user: candidateUser,
      candidateId: newCand.Candidate_ID,
      token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      loginTime: new Date().toISOString()
    };

    return { success: true, session, candidate: newCand };
  },

  registerFullCandidate(data: {
    // Personal
    fullName: string;
    email: string;
    mobile: string;
    dob?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    password?: string;
    // College
    collegeName: string;
    department: string;
    degree: string;
    academicYear: string;
    currentSemester: string;
    collegeIdNumber: string;
    overallCGPA: number;
    // 10th Standard (M/S/E)
    school10th?: string;
    board10th?: string;
    maths10th?: number;
    science10th?: number;
    english10th?: number;
    total10th?: number;
    percentage10th?: number;
    passingYear10th?: string;
    // 12th Standard (M/P/C/E)
    college12th?: string;
    board12th?: string;
    maths12th?: number;
    physics12th?: number;
    chemistry12th?: number;
    english12th?: number;
    total12th?: number;
    percentage12th?: number;
    passingYear12th?: string;
    // Entrance Exams (JEE, BITSAT, GATE, CAT, GMAT - ALL OPTIONAL)
    gateScore?: number;
    gatePercentile?: number;
    gateRank?: number;
    gateYear?: string;
    jeePercentile?: number;
    jeeRank?: number;
    jeeYear?: string;
    bitsatScore?: number;
    bitsatYear?: string;
    catPercentile?: number;
    catScore?: number;
    catYear?: string;
    gmatScore?: number;
    gmatPercentile?: number;
    gmatYear?: string;
  }): { success: boolean; session?: AuthSession; candidate?: Candidate; message?: string } {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.getCandidates().find(c => 
      (c.Primary_Email && c.Primary_Email.toLowerCase() === cleanEmail) ||
      (c.Email && c.Email.toLowerCase() === cleanEmail)
    );

    if (existing) {
      return {
        success: false,
        message: 'A candidate account with this email already exists. Please Sign In.'
      };
    }

    // 1. Create Candidate Master Record
    const newCand = this.createCandidate({
      Full_Name: data.fullName.trim(),
      Primary_Email: cleanEmail,
      Email: cleanEmail,
      Mobile_Number: data.mobile.trim(),
      WhatsApp_Number: data.mobile.trim(),
      Date_of_Birth: data.dob || '2004-01-01',
      Gender: data.gender || 'PREFER_NOT_TO_SAY',
      College_Name: data.collegeName.trim(),
      Department: data.department.trim(),
      Degree: data.degree.trim(),
      Academic_Year: data.academicYear || '4th Year',
      Current_Semester: data.currentSemester || 'Semester 7',
      College_ID_Number: data.collegeIdNumber.trim(),
      Registration_Status: 'APPROVED',
      Profile_Status: 'PROFILE_COMPLETED',
      Verification_Status: 'VERIFIED'
    });

    // 2. Save Academic Profile (10th M/S/E, 12th MPCE, College CGPA)
    const p10Maths = Number(data.maths10th) || 90;
    const p10Sci = Number(data.science10th) || 88;
    const p10Eng = Number(data.english10th) || 85;
    const p10Total = Number(data.total10th) || (p10Maths + p10Sci + p10Eng + 180);
    const p10Perc = Number(data.percentage10th) || Math.round((p10Total / 500) * 100);

    const p12Maths = Number(data.maths12th) || 92;
    const p12Phy = Number(data.physics12th) || 90;
    const p12Chem = Number(data.chemistry12th) || 88;
    const p12Eng = Number(data.english12th) || 85;
    const p12Total = Number(data.total12th) || (p12Maths + p12Phy + p12Chem + p12Eng + 90);
    const p12Perc = Number(data.percentage12th) || Math.round((p12Total / 500) * 100);

    this.saveAcademicProfiles(newCand.Candidate_ID, {
      sslc10: {
        schoolName: data.school10th?.trim() || 'Secondary High School',
        board: data.board10th?.trim() || 'CBSE',
        passingYear: data.passingYear10th || '2020',
        mathsMarks: p10Maths,
        scienceMarks: p10Sci,
        englishMarks: p10Eng,
        totalMarks: p10Total,
        percentage: p10Perc
      },
      hsc12: {
        schoolName: data.college12th?.trim() || 'Junior College',
        board: data.board12th?.trim() || 'State Board',
        passingYear: data.passingYear12th || '2022',
        mathsMarks: p12Maths,
        physicsMarks: p12Phy,
        chemistryMarks: p12Chem,
        englishMarks: p12Eng,
        totalMarks: p12Total,
        percentage: p12Perc
      },
      college: {
        collegeName: data.collegeName.trim(),
        degree: data.degree.trim(),
        department: data.department.trim(),
        currentSemester: data.currentSemester || 'Semester 7',
        overallCGPA: Number(data.overallCGPA) || 8.5,
        backlogs: 0,
        arrearsHistory: 'NIL',
        semesters: [
          { semester: 1, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' },
          { semester: 2, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' },
          { semester: 3, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' },
          { semester: 4, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' },
          { semester: 5, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' },
          { semester: 6, gpa: Number(data.overallCGPA) || 8.5, credits: 24, status: 'CLEARED' }
        ]
      }
    });

    // 3. Save Entrance Exams (GATE, JEE, BITSAT, CAT, GMAT - All Optional)
    const entranceExams: EntranceExamRecord[] = [];
    if (data.gateScore || data.gatePercentile || data.gateRank) {
      entranceExams.push({
        Exam_Record_ID: `ENT_GATE_${newCand.Candidate_ID}`,
        Candidate_ID: newCand.Candidate_ID,
        Examination_Name: 'GATE',
        Examination_Year: data.gateYear || '2026',
        Score: Number(data.gateScore) || undefined,
        Percentile: Number(data.gatePercentile) || undefined,
        Rank: Number(data.gateRank) || undefined
      });
    }
    if (data.jeePercentile || data.jeeRank) {
      entranceExams.push({
        Exam_Record_ID: `ENT_JEE_${newCand.Candidate_ID}`,
        Candidate_ID: newCand.Candidate_ID,
        Examination_Name: 'JEE_MAIN',
        Examination_Year: data.jeeYear || '2022',
        Percentile: Number(data.jeePercentile) || undefined,
        Rank: Number(data.jeeRank) || undefined
      });
    }
    if (data.bitsatScore) {
      entranceExams.push({
        Exam_Record_ID: `ENT_BITSAT_${newCand.Candidate_ID}`,
        Candidate_ID: newCand.Candidate_ID,
        Examination_Name: 'BITSAT',
        Examination_Year: data.bitsatYear || '2022',
        Score: Number(data.bitsatScore) || undefined
      });
    }
    if (data.catPercentile || data.catScore) {
      entranceExams.push({
        Exam_Record_ID: `ENT_CAT_${newCand.Candidate_ID}`,
        Candidate_ID: newCand.Candidate_ID,
        Examination_Name: 'CAT',
        Examination_Year: data.catYear || '2023',
        Percentile: Number(data.catPercentile) || undefined,
        Score: Number(data.catScore) || undefined
      });
    }
    if (data.gmatScore || data.gmatPercentile) {
      entranceExams.push({
        Exam_Record_ID: `ENT_GMAT_${newCand.Candidate_ID}`,
        Candidate_ID: newCand.Candidate_ID,
        Examination_Name: 'GMAT',
        Examination_Year: data.gmatYear || '2023',
        Score: Number(data.gmatScore) || undefined,
        Percentile: Number(data.gmatPercentile) || undefined
      });
    }
    if (entranceExams.length > 0) {
      this.saveEntranceExams(newCand.Candidate_ID, entranceExams);
    }

    // 4. Create Active Session
    const candidateUser: User = {
      User_ID: newCand.Candidate_ID,
      Organization_ID: 'ORG_000001',
      Full_Name: newCand.Full_Name,
      Email: newCand.Primary_Email,
      Role: 'CANDIDATE',
      Status: 'ACTIVE',
      Created_At: newCand.Registration_Date
    };

    const session: AuthSession = {
      user: candidateUser,
      candidateId: newCand.Candidate_ID,
      token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      loginTime: new Date().toISOString()
    };

    saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);
    this.logAudit(candidateUser.User_ID, 'CANDIDATE', 'CANDIDATE_FULL_REGISTRATION', 'CANDIDATE', newCand.Candidate_ID, `Candidate ${newCand.Full_Name} registered with full academic credentials`);

    return { success: true, session, candidate: newCand };
  },

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate {
    const candidates = this.getCandidates();
    const index = candidates.findIndex(c => c.Candidate_ID === id);
    if (index === -1) throw new Error('Candidate not found.');

    const updated = {
      ...candidates[index],
      ...updates,
      Updated_At: new Date().toISOString()
    };
    candidates[index] = updated;
    saveStorage(STORAGE_KEYS.CANDIDATES, candidates);

    this.syncToGas('updateCandidateProfile', { candidate: updated });
    return updated;
  },

  approveRegistration(candidateId: string, adminId: string): Candidate {
    const updated = this.updateCandidate(candidateId, {
      Registration_Status: 'APPROVED',
      Verification_Status: 'VERIFIED',
      Approval_Date: new Date().toISOString(),
      Approved_By: adminId
    });

    // Make assignments available
    const assignments = this.getAssignmentsForCandidate(candidateId);
    assignments.forEach(a => {
      this.updateAssignment(a.Assignment_ID, { Assignment_Status: 'SCHEDULED' });
    });

    this.logAudit(adminId, 'ADMIN', 'REGISTRATION_APPROVED', 'CANDIDATE', candidateId, `Candidate registration approved by ${adminId}`);
    return updated;
  },

  rejectRegistration(candidateId: string, adminId: string): Candidate {
    const updated = this.updateCandidate(candidateId, {
      Registration_Status: 'REJECTED',
      Verification_Status: 'PENDING',
      Approval_Date: new Date().toISOString(),
      Approved_By: adminId
    });

    this.logAudit(adminId, 'ADMIN', 'REGISTRATION_REJECTED', 'CANDIDATE', candidateId, `Candidate registration rejected by ${adminId}`);
    return updated;
  },

  // ==========================================
  // DB_2_Academic_Profile: ACADEMIC PROFILE RECORDS
  // ==========================================
  getAcademicProfiles(candidateId: string): AcademicProfileRecord[] {
    const all = loadStorage<AcademicProfileRecord[]>(STORAGE_KEYS.ACADEMIC_PROFILES, INITIAL_ACADEMIC_PROFILES);
    return all.filter(a => a.Candidate_ID === candidateId);
  },

  saveAcademicProfiles(candidateId: string, profile: CandidateFullAcademicProfile): void {
    return this.saveFullAcademicProfile(candidateId, profile);
  },

  saveFullAcademicProfile(candidateId: string, profile: CandidateFullAcademicProfile): void {
    const all = loadStorage<AcademicProfileRecord[]>(STORAGE_KEYS.ACADEMIC_PROFILES, INITIAL_ACADEMIC_PROFILES);
    const filtered = all.filter(a => a.Candidate_ID !== candidateId);
    const now = new Date().toISOString();

    // 10th Standard Record
    const rec10: AcademicProfileRecord = {
      Academic_Record_ID: `ACAD_10_${candidateId}`,
      Candidate_ID: candidateId,
      Education_Level: '10TH',
      School_or_College: profile.sslc10.schoolName,
      Board_or_University: profile.sslc10.board,
      Passing_Year: profile.sslc10.passingYear,
      Mathematics_Marks: profile.sslc10.mathsMarks,
      Science_Marks: profile.sslc10.scienceMarks,
      English_Marks: profile.sslc10.englishMarks,
      Total_Marks: profile.sslc10.totalMarks,
      Percentage: profile.sslc10.percentage,
      Created_At: now
    };
    filtered.push(rec10);

    // 12th Standard Record
    const rec12: AcademicProfileRecord = {
      Academic_Record_ID: `ACAD_12_${candidateId}`,
      Candidate_ID: candidateId,
      Education_Level: '12TH',
      School_or_College: profile.hsc12.schoolName,
      Board_or_University: profile.hsc12.board,
      Passing_Year: profile.hsc12.passingYear,
      Mathematics_Marks: profile.hsc12.mathsMarks,
      Physics_Marks: profile.hsc12.physicsMarks,
      Chemistry_Marks: profile.hsc12.chemistryMarks,
      English_Marks: profile.hsc12.englishMarks,
      Total_Marks: profile.hsc12.totalMarks,
      Percentage: profile.hsc12.percentage,
      Created_At: now
    };
    filtered.push(rec12);

    // College Semesters Record
    const recCollege: AcademicProfileRecord = {
      Academic_Record_ID: `ACAD_COL_${candidateId}`,
      Candidate_ID: candidateId,
      Education_Level: 'COLLEGE_SEMESTER',
      School_or_College: profile.college.collegeName,
      Board_or_University: 'Campus Affiliated University',
      Passing_Year: '2026',
      Overall_CGPA: profile.college.overallCGPA,
      Backlogs: profile.college.backlogs,
      Arrears_History: profile.college.arrearsHistory,
      Semester_Number: profile.college.semesters.length,
      Semester_CGPA: profile.college.semesters.length > 0 ? profile.college.semesters[profile.college.semesters.length - 1].cgpa : 0,
      Created_At: now
    };
    filtered.push(recCollege);

    saveStorage(STORAGE_KEYS.ACADEMIC_PROFILES, filtered);
    this.updateCandidate(candidateId, { Profile_Status: 'PROFILE_COMPLETED' });

    this.syncToGas('saveAcademicProfile', { candidateId, profile });
    this.logAudit(candidateId, 'CANDIDATE', 'ACADEMIC_PROFILE_SAVED', 'ACADEMIC_PROFILE', candidateId, 'Saved 10th, 12th, and college academic data');
  },

  // ==========================================
  // DB_3_Candidate_Activities & DB_4_Entrance_Exams
  // ==========================================
  getCandidateActivities(candidateId: string): CandidateActivitiesRecord | undefined {
    const list = loadStorage<CandidateActivitiesRecord[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_CANDIDATE_ACTIVITIES);
    return list.find(a => a.Candidate_ID === candidateId);
  },

  saveCandidateActivities(candidateId: string, activities: Partial<CandidateActivitiesRecord>): void {
    const list = loadStorage<CandidateActivitiesRecord[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_CANDIDATE_ACTIVITIES);
    const index = list.findIndex(a => a.Candidate_ID === candidateId);
    const updated: CandidateActivitiesRecord = {
      Activity_ID: index !== -1 ? list[index].Activity_ID : `ACT_${Date.now()}`,
      Candidate_ID: candidateId,
      NCC_Participation: activities.NCC_Participation || 'No',
      Sports_Activities: activities.Sports_Activities || 'None',
      Extracurricular_Activities: activities.Extracurricular_Activities || 'None',
      Leadership_Activities: activities.Leadership_Activities || 'None',
      Achievements: activities.Achievements || 'None',
      Resume_URL: activities.Resume_URL || '',
      College_ID_URL: activities.College_ID_URL || '',
      Certificates_URL: activities.Certificates_URL || '',
      Created_At: new Date().toISOString()
    };

    if (index !== -1) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    saveStorage(STORAGE_KEYS.ACTIVITIES, list);
    this.syncToGas('saveCandidateActivities', { candidateId, activities: updated });
  },

  getEntranceExams(candidateId: string): EntranceExamRecord[] {
    const list = loadStorage<EntranceExamRecord[]>(STORAGE_KEYS.ENTRANCE_EXAMS, INITIAL_ENTRANCE_EXAMS);
    return list.filter(e => e.Candidate_ID === candidateId);
  },

  saveEntranceExams(candidateId: string, exams: EntranceExamRecord[]): void {
    const list = loadStorage<EntranceExamRecord[]>(STORAGE_KEYS.ENTRANCE_EXAMS, INITIAL_ENTRANCE_EXAMS);
    const filtered = list.filter(e => e.Candidate_ID !== candidateId);
    filtered.push(...exams);
    saveStorage(STORAGE_KEYS.ENTRANCE_EXAMS, filtered);
    this.syncToGas('saveEntranceExamDetails', { candidateId, exams });
  },

  // ==========================================
  // DB_5_Assessment_Master & DB_6_Question_Bank
  // ==========================================
  getAssessmentMaster(): AssessmentMaster[] {
    return loadStorage<AssessmentMaster[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENT_MASTER);
  },

  // ==========================================
  // CAMPUS ASSESSMENT LIVE CONTROLLER (ADMIN MASTER SWITCH)
  // ==========================================
  getAssessmentLiveState(): Record<string, boolean> {
    return loadStorage<Record<string, boolean>>(STORAGE_KEYS.ASSESSMENT_LIVE_STATE, {
      'ASM_APTITUDE': true,
      'ASM_COMPREHENSION': true,
      'ASM_EI_SITUATIONAL': true
    });
  },

  setAssessmentLiveState(assessmentId: string, isLive: boolean): Record<string, boolean> {
    const state = this.getAssessmentLiveState();
    state[assessmentId] = isLive;
    saveStorage(STORAGE_KEYS.ASSESSMENT_LIVE_STATE, state);

    // Synchronize assessment master status
    const masters = this.getAssessmentMaster();
    const idx = masters.findIndex(m => m.Assessment_ID === assessmentId);
    if (idx !== -1) {
      masters[idx].Assessment_Status = isLive ? 'ACTIVE' : 'ARCHIVED';
      saveStorage(STORAGE_KEYS.ASSESSMENTS, masters);
    }

    this.syncToGas('updateAssessmentLiveState', { assessmentId, isLive, state });
    this.logAudit(
      'ADM_001',
      'ADMIN',
      isLive ? 'START_CAMPUS_ASSESSMENT' : 'STOP_CAMPUS_ASSESSMENT',
      'ASSESSMENT',
      assessmentId,
      `Assessment ${assessmentId} ${isLive ? 'STARTED & ENABLED FOR ALL CANDIDATES' : 'PAUSED/STOPPED'}`
    );
    return state;
  },

  setAllAssessmentsLive(isLive: boolean): Record<string, boolean> {
    const state = {
      'ASM_APTITUDE': isLive,
      'ASM_COMPREHENSION': isLive,
      'ASM_EI_SITUATIONAL': isLive
    };
    saveStorage(STORAGE_KEYS.ASSESSMENT_LIVE_STATE, state);

    const masters = this.getAssessmentMaster();
    masters.forEach(m => {
      m.Assessment_Status = isLive ? 'ACTIVE' : 'ARCHIVED';
    });
    saveStorage(STORAGE_KEYS.ASSESSMENTS, masters);

    this.syncToGas('updateAllAssessmentsLive', { isLive, state });
    this.logAudit(
      'ADM_001',
      'ADMIN',
      isLive ? 'START_ALL_ASSESSMENTS' : 'STOP_ALL_ASSESSMENTS',
      'ASSESSMENT',
      'ALL_ASSESSMENTS',
      `All 3 assessments ${isLive ? 'STARTED & ENABLED FOR ALL CANDIDATES' : 'PAUSED/STOPPED'}`
    );
    return state;
  },

  isAssessmentLive(assessmentId: string): boolean {
    const state = this.getAssessmentLiveState();
    return state[assessmentId] === true;
  },

  getQuestionBank(assessmentId?: string, setCode?: QuestionSetCode): QuestionBankItem[] {
    let all = loadStorage<QuestionBankItem[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTION_BANK);
    // Ensure all 270 questions across SET_A, SET_B, and SET_C are always loaded
    if (!all || all.length < INITIAL_QUESTION_BANK.length || !all.some(q => q.Set_Code === 'SET_B') || !all.some(q => q.Set_Code === 'SET_C')) {
      all = INITIAL_QUESTION_BANK;
      saveStorage(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTION_BANK);
    }
    const targetSet = setCode || 'SET_A';
    if (!assessmentId || assessmentId === 'ALL') {
      if (setCode) return all.filter(q => (q.Set_Code || 'SET_A') === setCode);
      return all;
    }
    const filtered = all.filter(q => {
      const matchAsm = q.Assessment_ID === assessmentId;
      if (!matchAsm) return false;
      return (q.Set_Code || 'SET_A') === targetSet;
    });

    // Fallback safeguard: if filtered is empty, return all questions for this assessment so user is never blocked
    if (filtered.length === 0) {
      return all.filter(q => q.Assessment_ID === assessmentId);
    }
    return filtered;
  },

  createQuestion(question: QuestionBankItem): QuestionBankItem {
    const questions = this.getQuestionBank();
    questions.push(question);
    saveStorage(STORAGE_KEYS.QUESTIONS, questions);
    this.syncToGas('createQuestion', { question });
    return question;
  },

  updateQuestion(id: string, updates: Partial<QuestionBankItem>): QuestionBankItem {
    const questions = this.getQuestionBank();
    const index = questions.findIndex(q => q.Question_ID === id);
    if (index === -1) throw new Error('Question not found');
    questions[index] = { ...questions[index], ...updates };
    saveStorage(STORAGE_KEYS.QUESTIONS, questions);
    this.syncToGas('updateQuestion', { question: questions[index] });
    return questions[index];
  },

  deleteQuestion(id: string): void {
    const questions = this.getQuestionBank().filter(q => q.Question_ID !== id);
    saveStorage(STORAGE_KEYS.QUESTIONS, questions);
    this.syncToGas('deleteQuestion', { questionId: id });
  },

  bulkImportQuestions(items: QuestionBankItem[]): { imported: number; errors: string[] } {
    const errors: string[] = [];
    const valid: QuestionBankItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      if (!q.Question_Text || !q.Option_A || !q.Option_B || !q.Correct_Answer) {
        errors.push(`Row ${i + 1}: Missing mandatory question text or options.`);
      } else {
        valid.push(q);
      }
    }

    if (valid.length > 0) {
      const existing = this.getQuestionBank();
      const combined = [...existing, ...valid];
      saveStorage(STORAGE_KEYS.QUESTIONS, combined);
      this.syncToGas('importQuestions', { questions: valid });
    }

    return { imported: valid.length, errors };
  },

  // ==========================================
  // DB_7_Assessment_Assignments: LAB SCHEDULING
  // ==========================================
  getAssignments(): AssessmentAssignment[] {
    return loadStorage<AssessmentAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  getAssignmentsForCandidate(candidateId: string): AssessmentAssignment[] {
    return this.getAssignments().filter(a => a.Candidate_ID === candidateId);
  },

  autoAssignAssessments(candidateId: string): void {
    const existing = this.getAssignmentsForCandidate(candidateId);
    if (existing.length > 0) return;

    const all = this.getAssignments();
    const today = new Date().toISOString().split('T')[0];

    const newAssignments: AssessmentAssignment[] = [
      {
        Assignment_ID: `ASN_${Date.now()}_1`,
        Candidate_ID: candidateId,
        Assessment_ID: 'ASM_APTITUDE',
        Scheduled_Date: today,
        Scheduled_Start_Time: '10:00',
        Duration_Minutes: 30,
        Assignment_Status: 'SCHEDULED',
        Approved_By: 'ADM_001',
        Attempt_Allowed: 1,
        Retake_Approved: false
      },
      {
        Assignment_ID: `ASN_${Date.now()}_2`,
        Candidate_ID: candidateId,
        Assessment_ID: 'ASM_COMPREHENSION',
        Scheduled_Date: today,
        Scheduled_Start_Time: '11:00',
        Duration_Minutes: 30,
        Assignment_Status: 'SCHEDULED',
        Approved_By: 'ADM_001',
        Attempt_Allowed: 1,
        Retake_Approved: false
      },
      {
        Assignment_ID: `ASN_${Date.now()}_3`,
        Candidate_ID: candidateId,
        Assessment_ID: 'ASM_EI_SITUATIONAL',
        Scheduled_Date: today,
        Scheduled_Start_Time: '12:00',
        Duration_Minutes: 30,
        Assignment_Status: 'SCHEDULED',
        Approved_By: 'ADM_001',
        Attempt_Allowed: 1,
        Retake_Approved: false
      }
    ];

    all.push(...newAssignments);
    saveStorage(STORAGE_KEYS.ASSIGNMENTS, all);
  },

  scheduleAssessment(data: {
    candidateIds: string[];
    assessmentId: string;
    scheduledDate: string;
    scheduledStartTime: string;
    durationMinutes: number;
    adminId: string;
  }): void {
    const all = this.getAssignments();

    for (const cid of data.candidateIds) {
      const existingIdx = all.findIndex(a => a.Candidate_ID === cid && a.Assessment_ID === data.assessmentId);
      const assignment: AssessmentAssignment = {
        Assignment_ID: existingIdx !== -1 ? all[existingIdx].Assignment_ID : `ASN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        Candidate_ID: cid,
        Assessment_ID: data.assessmentId,
        Scheduled_Date: data.scheduledDate,
        Scheduled_Start_Time: data.scheduledStartTime,
        Duration_Minutes: data.durationMinutes,
        Assignment_Status: 'SCHEDULED',
        Approved_By: data.adminId,
        Attempt_Allowed: 1,
        Retake_Approved: false
      };

      if (existingIdx !== -1) {
        all[existingIdx] = assignment;
      } else {
        all.push(assignment);
      }
    }

    saveStorage(STORAGE_KEYS.ASSIGNMENTS, all);
    this.syncToGas('scheduleAssessment', data);
    this.logAudit(data.adminId, 'ADMIN', 'SCHEDULE_ASSESSMENT', 'ASSESSMENT', data.assessmentId, `Scheduled ${data.assessmentId} for ${data.candidateIds.length} candidate(s) on ${data.scheduledDate}`);
  },

  updateAssignment(assignmentId: string, updates: Partial<AssessmentAssignment>): void {
    const all = this.getAssignments();
    const index = all.findIndex(a => a.Assignment_ID === assignmentId);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      saveStorage(STORAGE_KEYS.ASSIGNMENTS, all);
    }
  },

  authorizeRetake(candidateId: string, assessmentId: string, adminId: string, reason: string): void {
    const all = this.getAssignments();
    const index = all.findIndex(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId);
    if (index !== -1) {
      all[index].Retake_Approved = true;
      all[index].Attempt_Allowed += 1;
      all[index].Assignment_Status = 'SCHEDULED';
      all[index].Retake_Reason = reason;
      saveStorage(STORAGE_KEYS.ASSIGNMENTS, all);
    }

    this.syncToGas('authorizeRetake', { candidateId, assessmentId, adminId, reason });
    this.logAudit(adminId, 'ADMIN', 'RETAKE_AUTHORIZED', 'ASSESSMENT', assessmentId, `Retake authorized for ${candidateId}. Reason: ${reason}`);
  },

  /**
   * Omnipotent Admin Master Controls:
   * Increase assessment duration, increase attempt counts, unlock/reset attempts for any candidate
   */
  adminOverrideAssessment(
    candidateId: string,
    assessmentId: string,
    adminId: string,
    options: {
      durationMinutes?: number;
      attemptsAllowed?: number;
      unlockRetake?: boolean;
      resetAttempt?: boolean;
      reason?: string;
    }
  ): void {
    const assignments = this.getAssignments();
    const assignIdx = assignments.findIndex(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId);
    if (assignIdx !== -1) {
      if (typeof options.durationMinutes === 'number' && options.durationMinutes > 0) {
        assignments[assignIdx].Duration_Minutes = options.durationMinutes;
      }
      if (typeof options.attemptsAllowed === 'number' && options.attemptsAllowed > 0) {
        assignments[assignIdx].Attempt_Allowed = options.attemptsAllowed;
      }
      if (options.unlockRetake) {
        assignments[assignIdx].Retake_Approved = true;
        assignments[assignIdx].Assignment_Status = 'SCHEDULED';
        if (options.reason) assignments[assignIdx].Retake_Reason = options.reason;
      }
      saveStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    // If resetAttempt requested, unlock completed attempt so candidate can retake
    if (options.resetAttempt) {
      const attempts = this.getAttempts();
      const attIdx = attempts.findIndex(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId);
      if (attIdx !== -1) {
        attempts[attIdx].Attempt_Status = 'SCHEDULED' as any;
        attempts[attIdx].Score = 0;
        saveStorage(STORAGE_KEYS.ATTEMPTS, attempts);
      }
    }

    // If an attempt is currently IN_PROGRESS and duration was increased, extend End_Timestamp_Deadline
    if (typeof options.durationMinutes === 'number') {
      const attempts = this.getAttempts();
      const activeAtt = attempts.find(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId && a.Attempt_Status === 'IN_PROGRESS');
      if (activeAtt) {
        const startTime = new Date(activeAtt.Start_Timestamp).getTime();
        activeAtt.End_Timestamp_Deadline = new Date(startTime + options.durationMinutes * 60 * 1000).toISOString();
        saveStorage(STORAGE_KEYS.ATTEMPTS, attempts);
      }
    }

    this.syncToGas('adminOverrideAssessment', { candidateId, assessmentId, adminId, options });
    this.logAudit(
      adminId,
      'ADMIN',
      'ADMIN_OVERRIDE_ASSESSMENT',
      'ASSESSMENT',
      assessmentId,
      `Admin master override for ${candidateId}: Duration=${options.durationMinutes}m, AttemptsAllowed=${options.attemptsAllowed}, Unlock=${options.unlockRetake}, Reset=${options.resetAttempt}. Reason: ${options.reason || 'Admin master adjustment'}`
    );
  },

  /**
   * Omnipotent Admin Master Update:
   * Update candidate core details, 10th (M/S/E), 12th (MPCE), Semesters, and Entrance Exams (JEE, BITSAT, GATE)
   */
  adminUpdateCandidateMaster(
    adminId: string,
    candidateId: string,
    updates: {
      candidate: Partial<Candidate>;
      academicProfile?: CandidateFullAcademicProfile;
      entranceExams?: EntranceExamRecord[];
      activities?: Partial<CandidateActivitiesRecord>;
    }
  ): Candidate {
    const updated = this.updateCandidate(candidateId, updates.candidate);
    if (updates.academicProfile) {
      this.saveFullAcademicProfile(candidateId, updates.academicProfile);
    }
    if (updates.entranceExams) {
      this.saveEntranceExams(candidateId, updates.entranceExams);
    }
    if (updates.activities) {
      this.saveCandidateActivities(candidateId, updates.activities);
    }

    this.syncToGas('adminUpdateCandidateMaster', { adminId, candidateId, updates });
    this.logAudit(
      adminId,
      'ADMIN',
      'UPDATE_CANDIDATE_MASTER',
      'CANDIDATE',
      candidateId,
      `Admin master updated complete profile (Academic M/S/E, MPCE, Semesters, Entrance Exams) for ${candidateId}`
    );
    return updated;
  },

  /**
   * Master Admin Reset: Purge all candidate records, test attempts & responses
   * (Assessment Master and Question Banks remain 100% intact)
   */
  clearAllCandidateRecords(adminId: string): void {
    saveStorage(STORAGE_KEYS.CANDIDATES, []);
    saveStorage(STORAGE_KEYS.ACADEMIC_PROFILES, []);
    saveStorage(STORAGE_KEYS.ACTIVITIES, []);
    saveStorage(STORAGE_KEYS.ENTRANCE_EXAMS, []);
    saveStorage(STORAGE_KEYS.ASSIGNMENTS, []);
    saveStorage(STORAGE_KEYS.ATTEMPTS, []);
    saveStorage(STORAGE_KEYS.RESPONSES, []);
    saveStorage(STORAGE_KEYS.RESULTS, []);
    saveStorage(STORAGE_KEYS.VIDEOS, []);
    saveStorage(STORAGE_KEYS.CONSENTS, []);

    this.syncToGas('clearCandidateRecords', { adminId });
    this.logAudit(
      adminId,
      'ADMIN',
      'PURGE_CANDIDATE_RECORDS',
      'SYSTEM',
      'DATABASE',
      'All candidate profiles, academic records, attempts, and responses purged for clean assessment intake.'
    );
  },

  // ==========================================
  // DB_8_Assessment_Attempts: SERVER TIMER & LIFECYCLE
  // ==========================================
  getAttempts(): AssessmentAttempt[] {
    return loadStorage<AssessmentAttempt[]>(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
  },

  getAttemptForCandidate(candidateId: string, assessmentId: string): AssessmentAttempt | undefined {
    return this.getAttempts().find(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId);
  },

  /**
   * Server-authoritative start attempt
   */
  startAssessmentAttempt(
    candidateId: string,
    assessmentId: string,
    durationMinutes: number = 30,
    setCode?: QuestionSetCode
  ): AssessmentAttempt {
    // 1. Verify administrator has enabled/started this assessment
    if (!this.isAssessmentLive(assessmentId)) {
      throw new Error('This assessment has not been started by the administrator yet. Access is unlocked once enabled by admin.');
    }

    const attempts = this.getAttempts();
    const existing = attempts.find(a => a.Candidate_ID === candidateId && a.Assessment_ID === assessmentId);

    // Enforce One-Attempt Rule unless retake authorized
    const assignments = this.getAssignmentsForCandidate(candidateId);
    let assign = assignments.find(a => a.Assessment_ID === assessmentId);

    if (existing && existing.Attempt_Status === 'COMPLETED' && !assign?.Retake_Approved) {
      throw new Error('This assessment has already been completed. Retakes require administrator authorization.');
    }

    if (existing && existing.Attempt_Status === 'IN_PROGRESS') {
      // Return existing attempt to preserve countdown deadline across refreshes
      return existing;
    }

    // Auto-provision assignment if not yet created so candidate is never blocked
    if (!assign) {
      assign = {
        Assignment_ID: `ASN_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        Candidate_ID: candidateId,
        Assessment_ID: assessmentId,
        Set_Code: setCode || 'SET_A',
        Scheduled_Date: new Date().toISOString().split('T')[0],
        Scheduled_Start_Time: '10:00',
        Duration_Minutes: durationMinutes,
        Assignment_Status: 'IN_PROGRESS',
        Approved_By: 'ADM_001',
        Attempt_Allowed: 1,
        Retake_Approved: false
      };
      assignments.push(assign);
      saveStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const attemptId = `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const newAttempt: AssessmentAttempt = {
      Attempt_ID: attemptId,
      Candidate_ID: candidateId,
      Assessment_ID: assessmentId,
      Set_Code: setCode || assign.Set_Code || 'SET_A',
      Start_Timestamp: now.toISOString(),
      End_Timestamp_Deadline: deadline.toISOString(),
      Duration_Seconds: durationMinutes * 60,
      Attempt_Status: 'IN_PROGRESS',
      Total_Questions: 30,
      Answered_Questions: 0,
      Score: 0,
      Total_Marks: 30,
      Submission_Type: 'MANUAL',
      Retake_Number: existing ? existing.Retake_Number + 1 : 0
    };

    attempts.push(newAttempt);
    saveStorage(STORAGE_KEYS.ATTEMPTS, attempts);

    // Mark assignment in progress
    if (assign) {
      this.updateAssignment(assign.Assignment_ID, { Assignment_Status: 'IN_PROGRESS', Retake_Approved: false });
    }

    this.syncToGas('startAssessment', { attempt: newAttempt });
    this.logAudit(candidateId, 'CANDIDATE', 'ASSESSMENT_STARTED', 'ATTEMPT', attemptId, `Candidate started ${assessmentId}`);

    return newAttempt;
  },

  // ==========================================
  // DB_9_Assessment_Responses: AUTOSAVE & PERSISTENCE
  // ==========================================
  getResponsesForAttempt(attemptId: string): AssessmentResponse[] {
    const all = loadStorage<AssessmentResponse[]>(STORAGE_KEYS.RESPONSES, []);
    return all.filter(r => r.Attempt_ID === attemptId);
  },

  saveResponse(data: {
    attemptId: string;
    candidateId: string;
    assessmentId: string;
    questionId: string;
    selectedAnswer: 'A' | 'B' | 'C' | 'D' | '';
  }): void {
    const responses = loadStorage<AssessmentResponse[]>(STORAGE_KEYS.RESPONSES, []);
    const existingIdx = responses.findIndex(r => r.Attempt_ID === data.attemptId && r.Question_ID === data.questionId);

    const record: AssessmentResponse = {
      Response_ID: existingIdx !== -1 ? responses[existingIdx].Response_ID : `RSP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      Attempt_ID: data.attemptId,
      Candidate_ID: data.candidateId,
      Assessment_ID: data.assessmentId,
      Question_ID: data.questionId,
      Selected_Answer: data.selectedAnswer,
      Marks_Awarded: 0,
      Answer_Timestamp: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      responses[existingIdx] = record;
    } else {
      responses.push(record);
    }

    saveStorage(STORAGE_KEYS.RESPONSES, responses);
    this.syncToGas('saveAssessmentResponse', { response: record });
  },

  // ==========================================
  // DB_10_Assessment_Results: SUBMISSION & SERVER SCORING
  // ==========================================
  submitAssessmentAttempt(
    attemptId: string,
    submissionType: 'MANUAL' | 'AUTO_TIME_EXPIRED' | 'ADMIN_FORCE' = 'MANUAL'
  ): { attempt: AssessmentAttempt; calculation: any } {
    const attempts = this.getAttempts();
    const index = attempts.findIndex(a => a.Attempt_ID === attemptId);
    if (index === -1) throw new Error('Attempt record not found');

    const attempt = attempts[index];
    const candidateId = attempt.Candidate_ID;
    const assessmentId = attempt.Assessment_ID;

    // Load responses
    const responsesList = this.getResponsesForAttempt(attemptId);
    const respMap: Record<string, { selectedAnswer: 'A' | 'B' | 'C' | 'D' | '' }> = {};
    responsesList.forEach(r => {
      respMap[r.Question_ID] = { selectedAnswer: r.Selected_Answer };
    });

    // Load official questions
    const questions = this.getQuestionBank(assessmentId);

    // Run authoritative scoring engine
    const calculation = ScoringEngine.calculateAssessmentScore(
      attemptId,
      candidateId,
      assessmentId,
      questions,
      respMap
    );

    // Update attempt
    attempt.End_Timestamp = new Date().toISOString();
    attempt.Attempt_Status = submissionType === 'AUTO_TIME_EXPIRED' ? 'TIME_EXPIRED' : 'COMPLETED';
    attempt.Answered_Questions = Object.keys(respMap).filter(k => respMap[k].selectedAnswer).length;
    attempt.Score = calculation.totalScore;
    attempt.Submission_Type = submissionType;
    attempts[index] = attempt;
    saveStorage(STORAGE_KEYS.ATTEMPTS, attempts);

    // Save Section Results to DB_10_Assessment_Results
    const allResults = loadStorage<AssessmentResult[]>(STORAGE_KEYS.RESULTS, []);
    calculation.sectionResults.forEach(s => {
      const resItem: AssessmentResult = {
        Result_ID: `RES_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        Candidate_ID: candidateId,
        Assessment_ID: assessmentId,
        Attempt_ID: attemptId,
        Section_Name: s.sectionName,
        Total_Questions: s.totalQuestions,
        Correct_Answers: s.correctAnswers,
        Score: s.score,
        Total_Marks: s.totalQuestions,
        Percentage: s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 0,
        Result_Status: 'VERIFIED'
      };
      allResults.push(resItem);
    });
    saveStorage(STORAGE_KEYS.RESULTS, allResults);

    // Update Assignment Status to COMPLETED
    const assignments = this.getAssignmentsForCandidate(candidateId);
    const assign = assignments.find(a => a.Assessment_ID === assessmentId);
    if (assign) {
      this.updateAssignment(assign.Assignment_ID, { Assignment_Status: 'COMPLETED' });
    }

    this.syncToGas('submitAssessment', {
      attemptId,
      candidateId,
      assessmentId,
      submissionType,
      score: calculation.totalScore,
      percentageScore: calculation.percentageScore,
      sectionResults: calculation.sectionResults
    });

    this.logAudit(candidateId, 'CANDIDATE', 'ASSESSMENT_SUBMITTED', 'ATTEMPT', attemptId, `Submitted ${assessmentId}. Score: ${calculation.totalScore}/30 (${calculation.percentageScore}%)`);

    return { attempt, calculation };
  },

  getAssessmentResults(candidateId: string): AssessmentResult[] {
    const list = loadStorage<AssessmentResult[]>(STORAGE_KEYS.RESULTS, []);
    return list.filter(r => r.Candidate_ID === candidateId);
  },

  // ==========================================
  // DB_11_Video_Profiles: VIDEO PROFILES & REVIEW
  // ==========================================
  getVideoProfiles(candidateId?: string): CandidateVideoProfile[] {
    const list = loadStorage<CandidateVideoProfile[]>(STORAGE_KEYS.VIDEOS, []);
    if (!candidateId) return list;
    return list.filter(v => v.Candidate_ID === candidateId);
  },

  submitVideoProfile(data: {
    candidateId: string;
    videoUrl: string;
    videoTitle?: string;
    durationSeconds?: number;
    driveFileId?: string;
  }): CandidateVideoProfile {
    const list = loadStorage<CandidateVideoProfile[]>(STORAGE_KEYS.VIDEOS, []);
    const video: CandidateVideoProfile = {
      Video_ID: `VID_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      Candidate_ID: data.candidateId,
      Video_URL: data.videoUrl,
      Drive_File_ID: data.driveFileId || '',
      Submission_Date: new Date().toISOString(),
      Review_Status: 'PENDING',
      Duration_Seconds: data.durationSeconds || 120,
      Video_Title: data.videoTitle || 'Candidate Technical Profile Video'
    };

    list.unshift(video);
    saveStorage(STORAGE_KEYS.VIDEOS, list);
    this.syncToGas('submitVideoProfile', { video });
    this.logAudit(data.candidateId, 'CANDIDATE', 'VIDEO_PROFILE_SUBMITTED', 'VIDEO', video.Video_ID, `Submitted profile video`);

    return video;
  },

  reviewVideoProfile(videoId: string, status: 'REVIEWED' | 'REJECTED', comments: string, adminId: string): void {
    const list = loadStorage<CandidateVideoProfile[]>(STORAGE_KEYS.VIDEOS, []);
    const index = list.findIndex(v => v.Video_ID === videoId);
    if (index !== -1) {
      list[index].Review_Status = status;
      list[index].Reviewed_By = adminId;
      list[index].Review_Comments = comments;
      saveStorage(STORAGE_KEYS.VIDEOS, list);
      this.syncToGas('reviewVideoProfile', { videoId, status, comments, adminId });
      this.logAudit(adminId, 'ADMIN', 'VIDEO_PROFILE_REVIEWED', 'VIDEO', videoId, `Video marked as ${status} with comments: ${comments}`);
    }
  },

  // ==========================================
  // COMPATIBILITY HELPERS FOR UI & REPORTS
  // ==========================================
  getTemplates(): any[] {
    return this.getAssessmentMaster().map(a => ({
      Template_ID: a.Assessment_ID,
      Organization_ID: 'ORG_000001',
      Title: a.Assessment_Name,
      Categories: [a.Assessment_Type],
      Time_Limit_Minutes: a.Duration_Minutes,
      Passing_Score: 18,
      Total_Marks: a.Total_Marks,
      Adaptive_Enabled: false,
      Status: 'ACTIVE',
      Created_At: a.Created_Date
    }));
  },

  getQuestions(): Question[] {
    return INITIAL_QUESTIONS;
  },

  getScores(candidateId: string): ScoreRecord[] {
    const attempts = this.getAttempts().filter(a => a.Candidate_ID === candidateId && a.Attempt_Status === 'COMPLETED');
    const records: ScoreRecord[] = [];
    attempts.forEach(att => {
      const results = this.getAssessmentResults(candidateId).filter(r => r.Attempt_ID === att.Attempt_ID);
      results.forEach(r => {
        records.push({
          Score_ID: r.Result_ID,
          Attempt_ID: r.Attempt_ID,
          Candidate_ID: candidateId,
          Category: att.Assessment_ID as any,
          Trait_Name: r.Section_Name,
          Raw_Score: r.Score,
          Normalized_Score: r.Percentage,
          Sten_Score: Math.min(10, Math.max(1, Math.round((r.Percentage / 100) * 9 + 1))),
          Interpretation: `Scored ${r.Score}/${r.Total_Questions} (${r.Percentage}%)`,
          Percentile: Math.min(99, Math.max(1, r.Percentage)),
          Created_At: att.End_Timestamp || new Date().toISOString()
        });
      });
    });
    return records;
  },

  getReports(candidateId: string): FinalReport[] {
    const attempts = this.getAttempts().filter(a => a.Candidate_ID === candidateId && a.Attempt_Status === 'COMPLETED');
    if (attempts.length === 0) return [];

    const totalEarned = attempts.reduce((acc, curr) => acc + curr.Score, 0);
    const totalPossible = attempts.length * 30;
    const compositePct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    return [
      {
        Report_ID: `RPT_${candidateId}`,
        Candidate_ID: candidateId,
        Report_Type: 'PSYCHOMETRIC',
        Composite_Score: compositePct,
        Aptitude_Score: Math.round(((attempts.find(a => a.Assessment_ID === 'ASM_APTITUDE')?.Score || 0) / 30) * 100),
        Strengths: [
          'High quantitative precision and logical induction',
          'Sound reading comprehension and critical inference under timed conditions',
          'Collaborative conflict de-escalation and ethical responsibility'
        ],
        Development_Areas: [
          'Further refine speed on non-linear data interpretation matrices',
          'Continue expanding asynchronous documentation practices'
        ],
        Created_At: new Date().toISOString()
      }
    ];
  },

  saveConsent(consent: VoluntaryDisclosureConsent): void {
    const consents = loadStorage<VoluntaryDisclosureConsent[]>(STORAGE_KEYS.CONSENTS, []);
    consents.push(consent);
    saveStorage(STORAGE_KEYS.CONSENTS, consents);
    this.syncToGas('saveConsent', consent);
  }
};
