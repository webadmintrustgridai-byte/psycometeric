/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * apiService.ts - MCQ Psychometric Data Access Layer & Google Apps Script Sync
 */

import {
  Candidate,
  AssessmentTemplate,
  Question,
  ScoreRecord,
  FinalReport,
  User,
  AuthSession,
  AuthLog,
  Role,
  VoluntaryDisclosureConsent
} from '../types';
import {
  INITIAL_CANDIDATES,
  INITIAL_USERS,
  INITIAL_ASSESSMENT_TEMPLATES,
  INITIAL_QUESTIONS,
  INITIAL_SCORES,
  INITIAL_FINAL_REPORTS
} from '../data/initialSeedData';
import { GOOGLE_APPS_SCRIPT_URL, GOOGLE_SPREADSHEET_ID } from '../config';

const STORAGE_KEYS = {
  CANDIDATES: 'tg_mcq_candidates_v3',
  USERS: 'tg_mcq_users_v3',
  ACTIVE_SESSION: 'tg_mcq_active_session_v3',
  AUTH_LOGS: 'tg_mcq_auth_logs_v3',
  TEMPLATES: 'tg_mcq_templates_v3',
  QUESTIONS: 'tg_mcq_questions_v3',
  SCORES: 'tg_mcq_scores_v3',
  REPORTS: 'tg_mcq_reports_v3',
  CONSENTS: 'tg_mcq_consents_v3',
  GAS_CONFIG: 'tg_mcq_gas_config_v3'
};

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
  // Gas Settings
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

  /**
   * Asynchronously sync to Google Apps Script Web App if configured
   */
  async syncToGas(action: string, payload: any): Promise<void> {
    const targetUrl = GOOGLE_APPS_SCRIPT_URL || this.getGasConfig().webAppUrl;
    if (!targetUrl) return;

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({ action, ...payload })
      });
      console.log(`[GAS Sync] Dispatched ${action} to Google Apps Script (${targetUrl})`);
    } catch (err) {
      console.warn(`[GAS Sync] Failed dispatching ${action}:`, err);
    }
  },

  async pingGasBackend(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const resp = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=healthCheck');
      const data = await resp.json();
      if (data && data.success) {
        return { success: true, message: 'Connected to TRUSTGRID Apps Script backend v' + (data.data?.version || '3.0.0') };
      }
      return { success: false, message: data.error || 'Server responded with an error.' };
    } catch (err: any) {
      return { success: false, message: 'Network request failed: ' + (err.message || 'Check deployment URL.') };
    }
  },

  // Authentication & Session Management
  getUsers(): User[] {
    return loadStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
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

  login(email: string, role: Role, password?: string): { success: boolean; session?: AuthSession; message?: string } {
    const cleanEmail = email.trim().toLowerCase();

    if (role === 'ADMIN') {
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
        Role: 'ADMIN',
        Status: 'ACTIVE',
        Created_At: new Date().toISOString()
      };

      const session: AuthSession = {
        user: adminUser,
        token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);

      // Log & sync auth session to Google Sheets
      this.syncToGas('saveAuthSession', {
        Session_ID: `SES_${Math.floor(Math.random() * 899999 + 100000)}`,
        User_ID: adminUser.User_ID,
        Email: adminUser.Email,
        Full_Name: adminUser.Full_Name,
        Role: 'ADMIN',
        Action: 'LOGIN',
        Timestamp: session.loginTime
      });

      return { success: true, session };
    } else {
      // Candidate Login
      const candidates = this.getCandidates();
      let matched = candidates.find(c => 
        c.Email.toLowerCase() === cleanEmail || 
        c.Candidate_ID.toLowerCase() === cleanEmail
      );

      if (!matched) {
        // If candidate doesn't exist, auto-create candidate record
        matched = this.createCandidate({
          Full_Name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          Email: cleanEmail,
          Current_Designation: 'Candidate'
        });
      }

      const candidateUser: User = {
        User_ID: matched.Candidate_ID,
        Organization_ID: matched.Organization_ID,
        Full_Name: matched.Full_Name,
        Email: matched.Email,
        Role: 'CANDIDATE',
        Status: 'ACTIVE',
        Created_At: matched.Created_At
      };

      const session: AuthSession = {
        user: candidateUser,
        candidateId: matched.Candidate_ID,
        token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        loginTime: new Date().toISOString()
      };

      saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);

      // Log & sync auth session to Google Sheets
      this.syncToGas('saveAuthSession', {
        Session_ID: `SES_${Math.floor(Math.random() * 899999 + 100000)}`,
        User_ID: candidateUser.User_ID,
        Email: candidateUser.Email,
        Full_Name: candidateUser.Full_Name,
        Role: 'CANDIDATE',
        Action: 'LOGIN',
        Timestamp: session.loginTime
      });

      return { success: true, session };
    }
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
      Email: data.email.trim().toLowerCase(),
      Phone_Number: data.phone?.trim() || '',
      Current_Designation: data.designation?.trim() || 'Software Engineer',
      Total_Experience: data.experience?.trim() || '3 Years',
      Resume_URL: data.resumeUrl?.trim() || ''
    });

    const candidateUser: User = {
      User_ID: newCand.Candidate_ID,
      Organization_ID: newCand.Organization_ID,
      Full_Name: newCand.Full_Name,
      Email: newCand.Email,
      Role: 'CANDIDATE',
      Status: 'ACTIVE',
      Created_At: newCand.Created_At
    };

    const session: AuthSession = {
      user: candidateUser,
      candidateId: newCand.Candidate_ID,
      token: `TOK_${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      loginTime: new Date().toISOString()
    };

    saveStorage(STORAGE_KEYS.ACTIVE_SESSION, session);

    // Sync auth session to Google Sheets
    this.syncToGas('saveAuthSession', {
      Session_ID: `SES_${Math.floor(Math.random() * 899999 + 100000)}`,
      User_ID: newCand.Candidate_ID,
      Email: newCand.Email,
      Full_Name: newCand.Full_Name,
      Role: 'CANDIDATE',
      Action: 'REGISTER',
      Timestamp: session.loginTime
    });

    return { success: true, session, candidate: newCand };
  },

  logout(): void {
    const session = this.getCurrentSession();
    if (session) {
      this.syncToGas('saveAuthSession', {
        Session_ID: `SES_${Math.floor(Math.random() * 899999 + 100000)}`,
        User_ID: session.user.User_ID,
        Email: session.user.Email,
        Full_Name: session.user.Full_Name,
        Role: session.user.Role,
        Action: 'LOGOUT',
        Timestamp: new Date().toISOString()
      });
    }
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // Candidates
  getCandidates(): Candidate[] {
    return loadStorage<Candidate[]>(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES);
  },

  getCandidateById(id: string): Candidate | undefined {
    return this.getCandidates().find(c => c.Candidate_ID === id);
  },

  createCandidate(candidateData: Partial<Candidate>): Candidate {
    const list = this.getCandidates();
    const nextSeq = list.length + 1;
    const seqStr = String(nextSeq).padStart(6, '0');
    const newCandidate: Candidate = {
      Candidate_ID: `CAN_${seqStr}`,
      Organization_ID: candidateData.Organization_ID || 'ORG_000001',
      Full_Name: candidateData.Full_Name || 'Anonymous Candidate',
      Email: candidateData.Email || '',
      Phone_Number: candidateData.Phone_Number || '',
      Location: candidateData.Location || 'Bengaluru, India',
      Qualification: candidateData.Qualification || 'B.Tech / M.Tech',
      University: candidateData.University || 'University',
      Graduation_Year: candidateData.Graduation_Year || '2022',
      Total_Experience: candidateData.Total_Experience || '4 Years',
      Current_Organization: candidateData.Current_Organization || 'Tech Corp',
      Current_Designation: candidateData.Current_Designation || 'Engineer',
      Skills: candidateData.Skills || 'Problem Solving, Analytical Thinking',
      Resume_URL: candidateData.Resume_URL || '',
      Profile_Photo: candidateData.Profile_Photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidateData.Full_Name || 'C')}`,
      Registration_Date: new Date().toISOString(),
      Verification_Status: 'VERIFIED',
      Consent_Status: 'GRANTED',
      Record_Status: 'ACTIVE',
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString()
    };
    list.unshift(newCandidate);
    saveStorage(STORAGE_KEYS.CANDIDATES, list);
    this.syncToGas('saveCandidate', { candidate: newCandidate });
    return newCandidate;
  },

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate {
    const list = this.getCandidates();
    const idx = list.findIndex(c => c.Candidate_ID === id);
    if (idx === -1) throw new Error('Candidate not found');
    const updated = { ...list[idx], ...updates, Updated_At: new Date().toISOString() };
    list[idx] = updated;
    saveStorage(STORAGE_KEYS.CANDIDATES, list);
    this.syncToGas('saveCandidate', { candidate: updated });
    return updated;
  },

  // Assessment Templates & Questions
  getTemplates(): AssessmentTemplate[] {
    return loadStorage<AssessmentTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_ASSESSMENT_TEMPLATES);
  },

  getQuestions(): Question[] {
    return loadStorage<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  saveQuestion(question: Question): void {
    const list = this.getQuestions();
    const idx = list.findIndex(q => q.Question_ID === question.Question_ID);
    if (idx >= 0) list[idx] = question;
    else list.push(question);
    saveStorage(STORAGE_KEYS.QUESTIONS, list);
  },

  // Scores & Final Reports
  getScores(candidateId?: string): ScoreRecord[] {
    const all = loadStorage<ScoreRecord[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    if (candidateId) return all.filter(s => s.Candidate_ID === candidateId);
    return all;
  },

  getReports(candidateId?: string): FinalReport[] {
    const all = loadStorage<FinalReport[]>(STORAGE_KEYS.REPORTS, INITIAL_FINAL_REPORTS);
    if (candidateId) return all.filter(r => r.Candidate_ID === candidateId);
    return all;
  },

  saveScore(score: ScoreRecord): void {
    const all = this.getScores();
    all.push(score);
    saveStorage(STORAGE_KEYS.SCORES, all);
    this.syncToGas('saveAssessmentScore', score);
  },

  // Voluntary Disclosure & Consent Records
  getConsents(candidateId?: string): VoluntaryDisclosureConsent[] {
    const all = loadStorage<VoluntaryDisclosureConsent[]>(STORAGE_KEYS.CONSENTS, []);
    if (candidateId) return all.filter(c => c.Candidate_ID === candidateId);
    return all;
  },

  saveConsent(consent: VoluntaryDisclosureConsent): void {
    const all = this.getConsents();
    const idx = all.findIndex(c => c.Consent_ID === consent.Consent_ID);
    if (idx >= 0) all[idx] = consent;
    else all.unshift(consent);
    saveStorage(STORAGE_KEYS.CONSENTS, all);

    // Update candidate record's Consent_Status
    try {
      this.updateCandidate(consent.Candidate_ID, {
        Consent_Status: consent.Consent_Status
      });
    } catch (e) {}

    // Sync to Google Apps Script
    this.syncToGas('saveConsent', {
      Consent_ID: consent.Consent_ID,
      Candidate_ID: consent.Candidate_ID,
      Candidate_Name: consent.Candidate_Name,
      Candidate_Email: consent.Candidate_Email,
      Consent_Status: consent.Consent_Status,
      Consent_Version: consent.Consent_Version,
      Disclosures_Accepted: JSON.stringify(consent.Disclosures_Accepted),
      Digital_Signature: consent.Digital_Signature,
      Timestamp: consent.Timestamp
    });
  }
};
