/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * Config.gs - Centralized Configuration and Environment Management
 */

var CONFIG = {
  APP_NAME: 'TRUSTGRID.AI Psychometric & Video Assessment Platform',
  VERSION: '1.0.0',
  
  // Properties service keys
  PROPERTY_KEYS: {
    SPREADSHEET_ID: 'SPREADSHEET_ID',
    ROOT_DRIVE_FOLDER_ID: 'ROOT_DRIVE_FOLDER_ID',
    GEMINI_API_KEY: 'GEMINI_API_KEY',
    JWT_SECRET: 'JWT_SECRET',
    ENABLE_AUDIT_LOGGING: 'ENABLE_AUDIT_LOGGING'
  },

  // Fallbacks if script properties are not set yet
  DEFAULT_SPREADSHEET_ID: '', // Set your Google Spreadsheet ID here or in Script Properties
  DEFAULT_DRIVE_FOLDER_NAME: 'TRUSTGRID_AI_STORAGE',

  // 24 Master Database Sheet Names
  SHEETS: {
    ORGANIZATIONS: 'DB_01_Organizations',
    USERS: 'DB_02_Users',
    CANDIDATES: 'DB_03_Candidates',
    JOBS: 'DB_04_Jobs',
    ASSESSMENT_TEMPLATES: 'DB_05_Assessment_Templates',
    QUESTION_BANK: 'DB_06_Question_Bank',
    QUESTION_OPTIONS: 'DB_07_Question_Options',
    ASSESSMENT_INVITATIONS: 'DB_08_Assessment_Invitations',
    ASSESSMENT_ATTEMPTS: 'DB_09_Assessment_Attempts',
    RESPONSES: 'DB_10_Responses',
    SCORES: 'DB_11_Scores',
    VIDEO_QUESTIONS: 'DB_12_Video_Questions',
    VIDEO_INTERVIEWS: 'DB_13_Video_Interviews',
    VIDEO_RESPONSES: 'DB_14_Video_Responses',
    TRANSCRIPTS: 'DB_15_Transcripts',
    AI_EVALUATIONS: 'DB_16_AI_Evaluations',
    HUMAN_EVALUATIONS: 'DB_17_Human_Evaluations',
    FINAL_REPORTS: 'DB_18_Final_Reports',
    NOTIFICATIONS: 'DB_19_Notifications',
    AUDIT_LOGS: 'DB_20_Audit_Logs',
    CONFIGURATION: 'DB_21_Configuration',
    API_LOGS: 'DB_22_API_Logs',
    CANDIDATE_VIDEO_PROFILES: 'DB_23_Candidate_Video_Profiles',
    VIDEO_ACCESS_LOGS: 'DB_24_Video_Access_Logs'
  },

  // ID Prefixes
  PREFIXES: {
    ORG: 'ORG_',
    USER: 'USR_',
    CAN: 'CAN_',
    JOB: 'JOB_',
    TEMPLATE: 'TMP_',
    QUESTION: 'QUE_',
    OPTION: 'OPT_',
    INVITATION: 'INV_',
    ATTEMPT: 'ATT_',
    RESPONSE: 'RES_',
    SCORE: 'SCR_',
    VID_QUESTION: 'VQ_',
    VID_INTERVIEW: 'VINT_',
    VID_RESPONSE: 'VRSP_',
    TRANSCRIPT: 'TRN_',
    AI_EVAL: 'AIE_',
    HUMAN_EVAL: 'HEV_',
    REPORT: 'RPT_',
    NOTIFICATION: 'NTF_',
    AUDIT: 'AUD_',
    VID_PROFILE: 'VPR_',
    ACCESS_LOG: 'VAL_'
  },

  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ORG_ADMIN: 'ORG_ADMIN',
    RECRUITER: 'RECRUITER',
    EVALUATOR: 'EVALUATOR',
    CANDIDATE: 'CANDIDATE'
  },

  MAX_EXECUTION_TIME_MS: 28000,
  BATCH_SIZE: 50,
  DEFAULT_PAGE_SIZE: 20
};

/**
 * Retrieve configuration value from ScriptProperties or fallback
 */
function getConfigValue(key, fallback) {
  try {
    var props = PropertiesService.getScriptProperties();
    var val = props.getProperty(key);
    if (val !== null && val !== undefined && val !== '') {
      return val;
    }
  } catch (e) {
    Logger.log('Error reading ScriptProperties: ' + e.message);
  }
  return fallback !== undefined ? fallback : '';
}

/**
 * Store configuration value in ScriptProperties
 */
function setConfigValue(key, value) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(key, value);
}

/**
 * Get active spreadsheet instance
 */
function getMasterSpreadsheet() {
  var ssId = getConfigValue(CONFIG.PROPERTY_KEYS.SPREADSHEET_ID, CONFIG.DEFAULT_SPREADSHEET_ID);
  if (ssId) {
    return SpreadsheetApp.openById(ssId);
  }
  // Fallback to active spreadsheet if bound script
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    throw new Error('Spreadsheet ID not configured. Please set SPREADSHEET_ID in Script Properties or run setupMasterDatabase().');
  }
}
