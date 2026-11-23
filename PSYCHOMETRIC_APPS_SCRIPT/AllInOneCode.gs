/**
 * TRUSTGRID.AI - STANDARDIZED CAMPUS PSYCHOMETRIC & VIDEO ASSESSMENT DATABASE
 * Fresh Deduplication-Safe Google Apps Script Backend (14 Standardized Relational Sheets)
 * Concurrency Safety with LockService • Atomic Upserts • Server-Authoritative Timers & Scoring
 * 
 * Target Spreadsheet ID: 16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI
 * 
 * Instructions:
 * 1. Open Google Sheets (https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI).
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code in Code.gs with this entire script.
 * 4. Click 'Save' (Ctrl+S / Cmd+S).
 * 5. Run setupMasterDatabase() once to automatically provision all 14 sheets with headers (idempotent, no duplicates).
 * 6. (Optional) Run deduplicateDatabase() if there are existing duplicated rows to cleanly purge them.
 * 7. Click Deploy > Manage Deployments > Edit > New Version > Deploy.
 * 8. Ensure Web App execution is set to:
 *    - Execute as: 'Me'
 *    - Who has access: 'Anyone'
 */

var DB_TABS = {
  CANDIDATES: 'DB_1_Candidates',
  ACADEMIC_PROFILE: 'DB_2_Academic_Profile',
  ACTIVITIES: 'DB_3_Candidate_Activities',
  ENTRANCE_EXAMS: 'DB_4_Entrance_Exams',
  ASSESSMENT_MASTER: 'DB_5_Assessment_Master',
  QUESTION_BANK: 'DB_6_Question_Bank',
  ASSIGNMENTS: 'DB_7_Assessment_Assignments',
  ATTEMPTS: 'DB_8_Assessment_Attempts',
  RESPONSES: 'DB_9_Assessment_Responses',
  RESULTS: 'DB_10_Assessment_Results',
  VIDEO_PROFILES: 'DB_11_Video_Profiles',
  ADMIN_USERS: 'DB_12_Admin_Users',
  CONFIG: 'DB_13_System_Configuration',
  AUDIT_LOG: 'DB_14_Audit_Log'
};

var SCHEMAS = {
  DB_1_Candidates: [
    'Candidate_ID', 'Registration_Date', 'Full_Name', 'Primary_Email', 'Secondary_Email',
    'Mobile_Number', 'WhatsApp_Number', 'Date_of_Birth', 'College_Name', 'Department',
    'Degree', 'Academic_Year', 'Current_Semester', 'College_ID_Number', 'Photograph_URL',
    'Registration_Status', 'Profile_Status', 'Approval_Date', 'Approved_By'
  ],
  DB_2_Academic_Profile: [
    'Academic_Record_ID', 'Candidate_ID', 'Education_Level', 'School_or_College', 'Board_or_University',
    'Passing_Year', 'Mathematics_Marks', 'Science_Marks', 'Physics_Marks', 'Chemistry_Marks',
    'English_Marks', 'Total_Marks', 'Percentage', 'Semester_Number', 'Semester_Marks',
    'Semester_CGPA', 'Overall_CGPA', 'Backlogs'
  ],
  DB_3_Candidate_Activities: [
    'Activity_ID', 'Candidate_ID', 'NCC_Participation', 'Sports_Activities', 'Extracurricular_Activities',
    'Achievements', 'Resume_URL', 'College_ID_URL', 'Certificates_URL'
  ],
  DB_4_Entrance_Exams: [
    'Exam_Record_ID', 'Candidate_ID', 'Examination_Name', 'Examination_Year', 'Score',
    'Percentile', 'Rank', 'Scorecard_URL'
  ],
  DB_5_Assessment_Master: [
    'Assessment_ID', 'Assessment_Name', 'Assessment_Type', 'Duration_Minutes', 'Total_Questions',
    'Total_Marks', 'Negative_Marking', 'Assessment_Status', 'Created_Date', 'Created_By'
  ],
  DB_6_Question_Bank: [
    'Question_ID', 'Assessment_ID', 'Section_Name', 'Question_Text', 'Option_A',
    'Option_B', 'Option_C', 'Option_D', 'Correct_Answer', 'Marks',
    'Difficulty_Level', 'Explanation', 'Question_Status'
  ],
  DB_7_Assessment_Assignments: [
    'Assignment_ID', 'Candidate_ID', 'Assessment_ID', 'Scheduled_Date', 'Scheduled_Start_Time',
    'Assignment_Status', 'Approved_By', 'Attempt_Allowed', 'Retake_Approved', 'Duration_Minutes', 'Retake_Reason'
  ],
  DB_8_Assessment_Attempts: [
    'Attempt_ID', 'Candidate_ID', 'Assessment_ID', 'Start_Timestamp', 'End_Timestamp',
    'End_Timestamp_Deadline', 'Duration_Seconds', 'Attempt_Status', 'Total_Questions', 'Answered_Questions',
    'Score', 'Total_Marks', 'Submission_Type', 'Retake_Number'
  ],
  DB_9_Assessment_Responses: [
    'Response_ID', 'Attempt_ID', 'Candidate_ID', 'Assessment_ID', 'Question_ID',
    'Selected_Answer', 'Marks_Awarded', 'Answer_Timestamp'
  ],
  DB_10_Assessment_Results: [
    'Result_ID', 'Candidate_ID', 'Assessment_ID', 'Attempt_ID', 'Section_Name',
    'Total_Questions', 'Correct_Answers', 'Score', 'Total_Marks', 'Percentage',
    'Result_Status'
  ],
  DB_11_Video_Profiles: [
    'Video_ID', 'Candidate_ID', 'Video_Title', 'Video_URL', 'Drive_File_ID', 'Duration_Seconds',
    'Submission_Date', 'Review_Status', 'Reviewed_By', 'Review_Comments'
  ],
  DB_12_Admin_Users: [
    'Admin_ID', 'Admin_Name', 'Email', 'Role', 'Password_Hash',
    'Account_Status', 'Created_Date', 'Last_Login'
  ],
  DB_13_System_Configuration: [
    'Config_ID', 'Config_Name', 'Config_Value', 'Updated_By', 'Updated_Date'
  ],
  DB_14_Audit_Log: [
    'Log_ID', 'User_ID', 'User_Role', 'Action', 'Entity_Type',
    'Entity_ID', 'Timestamp', 'IP_Address', 'Details'
  ]
};

// ==========================================
// HTTP REQUEST ROUTING & CORS
// ==========================================
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  var params = (e && e.parameter) ? e.parameter : {};
  var postData = {};

  if (method === 'POST' && e && e.postData && e.postData.contents) {
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (err) {}
  }

  var action = params.action || postData.action || 'healthCheck';
  var payload = Object.assign({}, params, postData);
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureDatabaseSheets(ss);

  // Acquire exclusive ScriptLock to enforce serial write isolation & prevent race condition duplicates
  var lock = LockService.getScriptLock();
  var hasLock = false;

  try {
    hasLock = lock.tryLock(30000);
    if (!hasLock) {
      return jsonResponse(false, 'Database busy. Concurrency lock acquisition timeout.', null, 'LOCK_TIMEOUT');
    }

    var responseData = null;

    switch (action) {
      case 'healthCheck':
        responseData = {
          status: 'HEALTHY',
          database: 'TRUSTGRID.AI Psychometric & Video Platform',
          spreadsheetId: ss.getId(),
          timestamp: new Date().toISOString()
        };
        break;

      case 'setupDatabase':
        responseData = setupMasterDatabase();
        break;

      case 'deduplicateDatabase':
        responseData = deduplicateDatabase(ss);
        break;

      case 'clearCandidateRecords':
      case 'clearAllCandidateRecords':
        responseData = clearAllCandidateRecords(ss);
        break;

      // --- CANDIDATE OPERATIONS (DEDUPLICATION-SAFE) ---
      case 'createCandidate':
      case 'saveCandidate':
        responseData = saveCandidateRecord(ss, payload.candidate || payload);
        break;

      case 'updateCandidate':
        responseData = updateCandidateRecord(ss, payload.candidate || payload);
        break;

      case 'approveRegistration':
        responseData = approveRegistrationRecord(ss, payload.candidateId, payload.adminId);
        break;

      case 'rejectRegistration':
        responseData = rejectRegistrationRecord(ss, payload.candidateId, payload.adminId);
        break;

      case 'saveAcademicProfiles':
        responseData = saveAcademicProfileRecords(ss, payload);
        break;

      case 'saveEntranceExams':
        responseData = saveEntranceExamRecords(ss, payload);
        break;

      case 'saveCandidateActivities':
        responseData = saveCandidateActivitiesRecord(ss, payload);
        break;

      // --- ADMIN OMNIPOTENT MASTER CONTROL OPERATIONS ---
      case 'adminUpdateCandidateMaster':
        responseData = adminUpdateCandidateMasterRecord(ss, payload);
        break;

      case 'adminOverrideAssessment':
        responseData = adminOverrideAssessmentRecord(ss, payload);
        break;

      // --- QUESTION BANK OPERATIONS ---
      case 'getQuestions':
        responseData = getSanitizedQuestions(ss, payload.assessmentId);
        break;

      case 'createQuestion':
        responseData = createQuestionRecord(ss, payload.question || payload);
        break;

      case 'updateQuestion':
        responseData = updateQuestionRecord(ss, payload.question || payload);
        break;

      case 'deleteQuestion':
        responseData = deleteQuestionRecord(ss, payload.questionId);
        break;

      case 'bulkImportQuestions':
        responseData = bulkImportQuestionsRecord(ss, payload.questions || []);
        break;

      // --- ASSIGNMENTS & ATTEMPTS (DEDUPLICATION-SAFE) ---
      case 'scheduleAssessment':
        responseData = scheduleAssessmentRecord(ss, payload);
        break;

      case 'authorizeRetake':
        responseData = authorizeRetakeRecord(ss, payload);
        break;

      case 'startAssessmentAttempt':
        responseData = startAssessmentAttemptRecord(ss, payload.attempt || payload);
        break;

      case 'saveResponse':
        responseData = saveAssessmentResponseRecord(ss, payload.response || payload);
        break;

      case 'submitAssessment':
        responseData = submitAssessmentRecord(ss, payload);
        break;

      // --- VIDEO PROFILES ---
      case 'submitVideoProfile':
        responseData = submitVideoProfileRecord(ss, payload.video || payload);
        break;

      case 'reviewVideoProfile':
        responseData = reviewVideoProfileRecord(ss, payload);
        break;

      // --- DATA RETRIEVAL (GETTERS) ---
      case 'getCandidates':
        responseData = getSheetDataAsObjects(ss, DB_TABS.CANDIDATES);
        break;

      case 'getAssignments':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ASSIGNMENTS);
        break;

      case 'getAttempts':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ATTEMPTS);
        break;

      case 'getResults':
        responseData = getSheetDataAsObjects(ss, DB_TABS.RESULTS);
        break;

      case 'getVideoProfiles':
        responseData = getSheetDataAsObjects(ss, DB_TABS.VIDEO_PROFILES);
        break;

      case 'getAcademicProfiles':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ACADEMIC_PROFILE);
        break;

      case 'getEntranceExams':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ENTRANCE_EXAMS);
        break;

      case 'getAuditLogs':
        responseData = getSheetDataAsObjects(ss, DB_TABS.AUDIT_LOG);
        break;

      case 'logAudit':
        responseData = appendRowToSheet(ss, DB_TABS.AUDIT_LOG, payload);
        break;

      default:
        return jsonResponse(false, 'Unsupported API action: ' + action, null, 'INVALID_ACTION');
    }

    return jsonResponse(true, 'Operation executed successfully.', responseData);

  } catch (err) {
    return jsonResponse(false, 'Error executing Apps Script backend: ' + err.message, null, err.stack);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function jsonResponse(success, message, data, error) {
  var output = {
    success: success,
    message: message,
    data: data || null,
    error: error || null,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// DATABASE PROVISIONING & SCHEMAS
// ==========================================
function setupMasterDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureDatabaseSheets(ss);
  seedDefaultAdminAndAssessments(ss);
  return { status: 'DATABASE_SETUP_COMPLETE', sheetsCreated: Object.keys(DB_TABS).length };
}

function ensureDatabaseSheets(ss) {
  for (var key in DB_TABS) {
    var tabName = DB_TABS[key];
    var sheet = ss.getSheetByName(tabName);
    var headers = SCHEMAS[tabName] || [];

    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      if (headers.length > 0) {
        sheet.appendRow(headers);
        formatHeaderRow(sheet, headers.length);
      }
    } else {
      if (sheet.getLastRow() === 0 && headers.length > 0) {
        sheet.appendRow(headers);
        formatHeaderRow(sheet, headers.length);
      }
    }
  }
}

function formatHeaderRow(sheet, numCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1e293b');
  headerRange.setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function seedDefaultAdminAndAssessments(ss) {
  // 1. Seed Master Admin if not exists
  var adminSheet = ss.getSheetByName(DB_TABS.ADMIN_USERS);
  var adminData = adminSheet.getDataRange().getValues();
  var adminExists = false;
  for (var i = 1; i < adminData.length; i++) {
    if (adminData[i][2] && String(adminData[i][2]).toLowerCase() === 'poojasri@trustgrid.ai') {
      adminExists = true;
      break;
    }
  }

  if (!adminExists) {
    adminSheet.appendRow([
      'ADM_001', 'Poojasri (System Master Admin)', 'poojasri@trustgrid.ai', 'SUPER_ADMIN',
      'sha256_pooj@2004*', 'ACTIVE', new Date().toISOString(), ''
    ]);
  }

  // 2. Seed Default 3 Assessments if not exists
  var asmSheet = ss.getSheetByName(DB_TABS.ASSESSMENT_MASTER);
  var asmData = asmSheet.getDataRange().getValues();
  var existingAsms = {};
  for (var j = 1; j < asmData.length; j++) {
    if (asmData[j][0]) existingAsms[asmData[j][0]] = true;
  }

  if (!existingAsms['ASM_APTITUDE']) {
    asmSheet.appendRow([
      'ASM_APTITUDE', 'Quantitative Aptitude Assessment', 'APTITUDE', 30, 30, 30, false, 'ACTIVE',
      new Date().toISOString(), 'ADM_001'
    ]);
  }
  if (!existingAsms['ASM_COMPREHENSION']) {
    asmSheet.appendRow([
      'ASM_COMPREHENSION', 'English Comprehension Assessment (1500–3000 Words)', 'COMPREHENSION', 45, 30, 30, false, 'ACTIVE',
      new Date().toISOString(), 'ADM_001'
    ]);
  }
  if (!existingAsms['ASM_EI_SITUATIONAL']) {
    asmSheet.appendRow([
      'ASM_EI_SITUATIONAL', 'Emotional Intelligence & Situational Judgment (SJT)', 'EI_SITUATIONAL', 30, 30, 30, false, 'ACTIVE',
      new Date().toISOString(), 'ADM_001'
    ]);
  }
}

// ==========================================
// DEDUPLICATION CORE HELPERS (ATOMIC UPSERTS)
// ==========================================

/**
 * Upsert a row in a sheet based on a single key column index (0-indexed).
 * If a row with keyValue exists, update that row in place!
 * If not found, append row.
 */
function upsertRowByKey(sheet, keyColIndex, keyValue, rowArray) {
  var data = sheet.getDataRange().getValues();
  var matchStr = String(keyValue || '').trim().toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var cellStr = String(data[i][keyColIndex] || '').trim().toLowerCase();
    if (cellStr === matchStr) {
      sheet.getRange(i + 1, 1, 1, rowArray.length).setValues([rowArray]);
      return { action: 'UPDATED', rowIndex: i + 1 };
    }
  }

  sheet.appendRow(rowArray);
  return { action: 'INSERTED', rowIndex: sheet.getLastRow() };
}

/**
 * Upsert a row in a sheet based on composite key column indices (0-indexed).
 * If a row matching all composite key values exists, update that row in place!
 * If not found, append row.
 */
function upsertRowByCompositeKeys(sheet, keyColIndices, keyValues, rowArray) {
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var allMatched = true;
    for (var k = 0; k < keyColIndices.length; k++) {
      var colIdx = keyColIndices[k];
      var expectedVal = String(keyValues[k] || '').trim().toLowerCase();
      var cellVal = String(data[i][colIdx] || '').trim().toLowerCase();
      if (cellVal !== expectedVal) {
        allMatched = false;
        break;
      }
    }

    if (allMatched) {
      sheet.getRange(i + 1, 1, 1, rowArray.length).setValues([rowArray]);
      return { action: 'UPDATED', rowIndex: i + 1 };
    }
  }

  sheet.appendRow(rowArray);
  return { action: 'INSERTED', rowIndex: sheet.getLastRow() };
}

// ==========================================
// CORE RECORD OPERATIONS (ZERO DUPLICATES)
// ==========================================

function saveCandidateRecord(ss, candidate) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var cleanEmail = (candidate.Primary_Email || candidate.Email || '').trim().toLowerCase();
  var candidateId = candidate.Candidate_ID;

  var data = sheet.getDataRange().getValues();
  var targetRow = -1;

  for (var i = 1; i < data.length; i++) {
    var existingId = String(data[i][0] || '').trim();
    var existingEmail = String(data[i][3] || '').trim().toLowerCase();

    if ((candidateId && existingId === candidateId) || (cleanEmail && existingEmail === cleanEmail)) {
      targetRow = i + 1;
      candidateId = existingId;
      break;
    }
  }

  if (!candidateId) {
    candidateId = 'CAN_' + new Date().getFullYear() + '_' + String(data.length).padStart(3, '0');
  }

  var row = [
    candidateId,
    candidate.Registration_Date || new Date().toISOString(),
    candidate.Full_Name || '',
    cleanEmail,
    candidate.Secondary_Email || '',
    candidate.Mobile_Number || '',
    candidate.WhatsApp_Number || candidate.Mobile_Number || '',
    candidate.Date_of_Birth || '2004-01-01',
    candidate.College_Name || '',
    candidate.Department || '',
    candidate.Degree || 'B.Tech',
    candidate.Academic_Year || '4th Year',
    candidate.Current_Semester || 'Semester 7',
    candidate.College_ID_Number || '',
    candidate.Photograph_URL || '',
    candidate.Registration_Status || 'PENDING_APPROVAL',
    candidate.Profile_Status || 'INCOMPLETE',
    candidate.Approval_Date || '',
    candidate.Approved_By || ''
  ];

  if (targetRow !== -1) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    return { Candidate_ID: candidateId, status: 'UPDATED' };
  } else {
    sheet.appendRow(row);
    return { Candidate_ID: candidateId, status: 'CREATED' };
  }
}

function updateCandidateRecord(ss, candidate) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === candidate.Candidate_ID) {
      if (candidate.Full_Name) sheet.getRange(i + 1, 3).setValue(candidate.Full_Name);
      if (candidate.Primary_Email) sheet.getRange(i + 1, 4).setValue(candidate.Primary_Email);
      if (candidate.Mobile_Number) sheet.getRange(i + 1, 6).setValue(candidate.Mobile_Number);
      if (candidate.WhatsApp_Number) sheet.getRange(i + 1, 7).setValue(candidate.WhatsApp_Number);
      if (candidate.College_Name) sheet.getRange(i + 1, 9).setValue(candidate.College_Name);
      if (candidate.Department) sheet.getRange(i + 1, 10).setValue(candidate.Department);
      if (candidate.Degree) sheet.getRange(i + 1, 11).setValue(candidate.Degree);
      if (candidate.Academic_Year) sheet.getRange(i + 1, 12).setValue(candidate.Academic_Year);
      if (candidate.Current_Semester) sheet.getRange(i + 1, 13).setValue(candidate.Current_Semester);
      if (candidate.College_ID_Number) sheet.getRange(i + 1, 14).setValue(candidate.College_ID_Number);
      if (candidate.Registration_Status) sheet.getRange(i + 1, 16).setValue(candidate.Registration_Status);
      if (candidate.Profile_Status) sheet.getRange(i + 1, 17).setValue(candidate.Profile_Status);
      return { Candidate_ID: candidate.Candidate_ID, status: 'UPDATED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function approveRegistrationRecord(ss, candidateId, adminId) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === candidateId) {
      sheet.getRange(i + 1, 16).setValue('APPROVED');
      sheet.getRange(i + 1, 18).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 19).setValue(adminId || 'ADM_001');
      return { Candidate_ID: candidateId, Registration_Status: 'APPROVED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function rejectRegistrationRecord(ss, candidateId, adminId) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === candidateId) {
      sheet.getRange(i + 1, 16).setValue('REJECTED');
      sheet.getRange(i + 1, 18).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 19).setValue(adminId || 'ADM_001');
      return { Candidate_ID: candidateId, Registration_Status: 'REJECTED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function saveAcademicProfileRecords(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ACADEMIC_PROFILE);
  var profile = payload.profile || {};
  var candidateId = payload.candidateId;

  // 1. 10th Standard Records
  if (profile.sslc10) {
    var row10 = [
      'ACAD_10_' + candidateId, candidateId, '10TH', profile.sslc10.schoolName || '', profile.sslc10.board || '',
      profile.sslc10.passingYear || '', profile.sslc10.mathsMarks || 0, profile.sslc10.scienceMarks || 0, '', '',
      profile.sslc10.englishMarks || 0, profile.sslc10.totalMarks || 0, profile.sslc10.percentage || 0, '', '', '', '', ''
    ];
    upsertRowByCompositeKeys(sheet, [1, 2], [candidateId, '10TH'], row10);
  }

  // 2. 12th Standard Records
  if (profile.hsc12) {
    var row12 = [
      'ACAD_12_' + candidateId, candidateId, '12TH', profile.hsc12.schoolName || '', profile.hsc12.board || '',
      profile.hsc12.passingYear || '', profile.hsc12.mathsMarks || 0, '', profile.hsc12.physicsMarks || 0, profile.hsc12.chemistryMarks || 0,
      profile.hsc12.englishMarks || 0, profile.hsc12.totalMarks || 0, profile.hsc12.percentage || 0, '', '', '', '', ''
    ];
    upsertRowByCompositeKeys(sheet, [1, 2], [candidateId, '12TH'], row12);
  }

  // 3. College Semesters & CGPA
  if (profile.college) {
    var rowCol = [
      'ACAD_COL_' + candidateId, candidateId, 'COLLEGE_SEMESTER', profile.college.collegeName || '', profile.college.department || '',
      profile.college.academicYear || '', '', '', '', '', '', '', '', '', '',
      profile.college.overallCGPA || 0, profile.college.overallCGPA || 0, profile.college.backlogs || 0
    ];
    upsertRowByCompositeKeys(sheet, [1, 2], [candidateId, 'COLLEGE_SEMESTER'], rowCol);
  }

  return { status: 'ACADEMIC_RECORDS_SAVED' };
}

function saveEntranceExamRecords(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ENTRANCE_EXAMS);
  var exams = payload.exams || [];
  var candidateId = payload.candidateId;

  for (var i = 0; i < exams.length; i++) {
    var ex = exams[i];
    var row = [
      ex.Exam_Record_ID || ('ENT_' + ex.Examination_Name + '_' + candidateId),
      candidateId,
      ex.Examination_Name,
      ex.Examination_Year || '',
      ex.Score || '',
      ex.Percentile || '',
      ex.Rank || '',
      ex.Scorecard_URL || ''
    ];
    // Composite key: Candidate_ID (col 1) + Examination_Name (col 2)
    upsertRowByCompositeKeys(sheet, [1, 2], [candidateId, ex.Examination_Name], row);
  }
  return { status: 'ENTRANCE_EXAMS_SAVED' };
}

function saveCandidateActivitiesRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ACTIVITIES);
  var act = payload.activities || {};
  var candidateId = payload.candidateId;

  var row = [
    act.Activity_ID || ('ACT_' + candidateId),
    candidateId,
    act.NCC_Participation || 'No',
    act.Sports_Activities || '',
    act.Extracurricular_Activities || '',
    act.Achievements || '',
    act.Resume_URL || '',
    act.College_ID_URL || '',
    act.Certificates_URL || ''
  ];
  // Upsert by Candidate_ID (col 1)
  upsertRowByKey(sheet, 1, candidateId, row);
  return { status: 'ACTIVITIES_SAVED' };
}

// --- ADMIN OMNIPOTENT MASTER CONTROL HANDLERS ---
function adminUpdateCandidateMasterRecord(ss, payload) {
  var candidateId = payload.candidateId;
  var updates = payload.updates || {};

  if (updates.candidate) {
    saveCandidateRecord(ss, Object.assign({ Candidate_ID: candidateId }, updates.candidate));
  }
  if (updates.academicProfile) {
    saveAcademicProfileRecords(ss, { candidateId: candidateId, profile: updates.academicProfile });
  }
  if (updates.entranceExams) {
    saveEntranceExamRecords(ss, { candidateId: candidateId, exams: updates.entranceExams });
  }
  if (updates.activities) {
    saveCandidateActivitiesRecord(ss, { candidateId: candidateId, activities: updates.activities });
  }

  return { status: 'ADMIN_MASTER_UPDATED', candidateId: candidateId };
}

function adminOverrideAssessmentRecord(ss, payload) {
  var candidateId = payload.candidateId;
  var assessmentId = payload.assessmentId;
  var options = payload.options || {};

  // Update DB_7_Assessment_Assignments
  var assignSheet = ss.getSheetByName(DB_TABS.ASSIGNMENTS);
  var assignData = assignSheet.getDataRange().getValues();

  var foundAssign = false;
  for (var i = 1; i < assignData.length; i++) {
    if (String(assignData[i][1]) === candidateId && String(assignData[i][2]) === assessmentId) {
      if (typeof options.durationMinutes === 'number') assignSheet.getRange(i + 1, 10).setValue(options.durationMinutes);
      if (typeof options.attemptsAllowed === 'number') assignSheet.getRange(i + 1, 8).setValue(options.attemptsAllowed);
      if (options.unlockRetake) {
        assignSheet.getRange(i + 1, 6).setValue('SCHEDULED');
        assignSheet.getRange(i + 1, 9).setValue(true);
        if (options.reason) assignSheet.getRange(i + 1, 11).setValue(options.reason);
      }
      foundAssign = true;
      break;
    }
  }

  if (!foundAssign) {
    assignSheet.appendRow([
      'ASN_' + candidateId + '_' + assessmentId, candidateId, assessmentId,
      new Date().toISOString().split('T')[0], '10:00', 'SCHEDULED', 'ADM_001',
      options.attemptsAllowed || 1, Boolean(options.unlockRetake), options.durationMinutes || 30, options.reason || ''
    ]);
  }

  // Update active attempts in DB_8_Assessment_Attempts
  if (options.resetAttempt || options.durationMinutes) {
    var attSheet = ss.getSheetByName(DB_TABS.ATTEMPTS);
    var attData = attSheet.getDataRange().getValues();

    for (var j = 1; j < attData.length; j++) {
      if (String(attData[j][1]) === candidateId && String(attData[j][2]) === assessmentId) {
        if (options.resetAttempt) {
          attSheet.getRange(j + 1, 8).setValue('SCHEDULED');
          attSheet.getRange(j + 1, 11).setValue(0);
        }
        if (typeof options.durationMinutes === 'number' && String(attData[j][7]) === 'IN_PROGRESS') {
          var start = new Date(attData[j][3]).getTime();
          var newDeadline = new Date(start + options.durationMinutes * 60 * 1000).toISOString();
          attSheet.getRange(j + 1, 6).setValue(newDeadline);
        }
      }
    }
  }

  return { status: 'ADMIN_OVERRIDE_SAVED', candidateId: candidateId, assessmentId: assessmentId };
}

// --- QUESTIONS ---
function getSanitizedQuestions(ss, assessmentId) {
  var all = getSheetDataAsObjects(ss, DB_TABS.QUESTION_BANK);
  if (!assessmentId || assessmentId === 'ALL') return all;
  return all.filter(function(q) {
    return q.Assessment_ID === assessmentId && q.Question_Status === 'PUBLISHED';
  });
}

function createQuestionRecord(ss, question) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var row = [
    question.Question_ID, question.Assessment_ID, question.Section_Name || '', question.Question_Text || '',
    question.Option_A || '', question.Option_B || '', question.Option_C || '', question.Option_D || '',
    question.Correct_Answer || 'A', question.Marks || 1, question.Difficulty_Level || 'MEDIUM',
    question.Explanation || '', question.Question_Status || 'PUBLISHED'
  ];
  // Upsert by Question_ID (col 0)
  upsertRowByKey(sheet, 0, question.Question_ID, row);
  return { Question_ID: question.Question_ID, status: 'UPSERTED' };
}

function updateQuestionRecord(ss, question) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var row = [
    question.Question_ID, question.Assessment_ID, question.Section_Name || '', question.Question_Text || '',
    question.Option_A || '', question.Option_B || '', question.Option_C || '', question.Option_D || '',
    question.Correct_Answer || 'A', question.Marks || 1, question.Difficulty_Level || 'MEDIUM',
    question.Explanation || '', question.Question_Status || 'PUBLISHED'
  ];
  return upsertRowByKey(sheet, 0, question.Question_ID, row);
}

function deleteQuestionRecord(ss, questionId) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === questionId) {
      sheet.deleteRow(i + 1);
      return { status: 'DELETED', Question_ID: questionId };
    }
  }
  return { status: 'NOT_FOUND' };
}

function bulkImportQuestionsRecord(ss, questions) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var count = 0;
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    if (q.Question_ID && q.Question_Text && q.Option_A && q.Option_B && q.Correct_Answer) {
      var row = [
        q.Question_ID, q.Assessment_ID, q.Section_Name || '', q.Question_Text,
        q.Option_A, q.Option_B, q.Option_C || '', q.Option_D || '',
        q.Correct_Answer, q.Marks || 1, q.Difficulty_Level || 'MEDIUM',
        q.Explanation || '', q.Question_Status || 'PUBLISHED'
      ];
      upsertRowByKey(sheet, 0, q.Question_ID, row);
      count++;
    }
  }
  return { status: 'BULK_IMPORT_SUCCESS', importedCount: count };
}

// --- ATTEMPTS & RESPONSES (CRITICAL ANTI-DUPLICATION) ---
function scheduleAssessmentRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ASSIGNMENTS);
  var candidateIds = payload.candidateIds || [payload.candidateId];

  for (var i = 0; i < candidateIds.length; i++) {
    var cid = candidateIds[i];
    var row = [
      'ASN_' + cid + '_' + payload.assessmentId,
      cid,
      payload.assessmentId,
      payload.scheduledDate || new Date().toISOString().split('T')[0],
      payload.scheduledTime || '10:00',
      'SCHEDULED',
      payload.adminId || 'ADM_001',
      1,
      false,
      payload.durationMinutes || 30,
      ''
    ];
    // Composite key: Candidate_ID (col 1) + Assessment_ID (col 2)
    upsertRowByCompositeKeys(sheet, [1, 2], [cid, payload.assessmentId], row);
  }
  return { status: 'ASSESSMENTS_SCHEDULED' };
}

function authorizeRetakeRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ASSIGNMENTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === payload.candidateId && data[i][2] === payload.assessmentId) {
      sheet.getRange(i + 1, 6).setValue('SCHEDULED');
      sheet.getRange(i + 1, 8).setValue((Number(data[i][7]) || 1) + 1);
      sheet.getRange(i + 1, 9).setValue(true);
      sheet.getRange(i + 1, 11).setValue(payload.reason || 'Admin authorized retake');
      return { status: 'RETAKE_AUTHORIZED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function startAssessmentAttemptRecord(ss, attempt) {
  var sheet = ss.getSheetByName(DB_TABS.ATTEMPTS);
  var row = [
    attempt.Attempt_ID, attempt.Candidate_ID, attempt.Assessment_ID, attempt.Start_Timestamp,
    attempt.End_Timestamp || '', attempt.End_Timestamp_Deadline, attempt.Duration_Seconds || 1800,
    'IN_PROGRESS', attempt.Total_Questions || 30, 0, 0, attempt.Total_Marks || 30, 'MANUAL', attempt.Retake_Number || 0
  ];
  // Upsert by Attempt_ID (col 0)
  upsertRowByKey(sheet, 0, attempt.Attempt_ID, row);
  return { status: 'ATTEMPT_STARTED', Attempt_ID: attempt.Attempt_ID };
}

/**
 * CRITICAL: Save question response without duplicates!
 * During an assessment, answers autosave repeatedly.
 * We MUST match Attempt_ID + Question_ID and update the row in place!
 */
function saveAssessmentResponseRecord(ss, response) {
  var sheet = ss.getSheetByName(DB_TABS.RESPONSES);
  var responseId = response.Response_ID || ('RSP_' + response.Attempt_ID + '_' + response.Question_ID);

  var row = [
    responseId,
    response.Attempt_ID,
    response.Candidate_ID,
    response.Assessment_ID,
    response.Question_ID,
    response.Selected_Answer,
    response.Marks_Awarded || 0,
    response.Answer_Timestamp || new Date().toISOString()
  ];

  // Composite key: Attempt_ID (col 1) + Question_ID (col 4)
  var res = upsertRowByCompositeKeys(sheet, [1, 4], [response.Attempt_ID, response.Question_ID], row);
  return { status: 'RESPONSE_SAVED', action: res.action };
}

function submitAssessmentRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ATTEMPTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.attemptId) {
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 8).setValue(payload.submissionType === 'AUTO_TIME_EXPIRED' ? 'TIME_EXPIRED' : 'COMPLETED');
      sheet.getRange(i + 1, 10).setValue(payload.answeredQuestions || 30);
      sheet.getRange(i + 1, 11).setValue(payload.score);
      break;
    }
  }

  // Record summary result in DB_10_Assessment_Results (Upsert by Attempt_ID)
  var resSheet = ss.getSheetByName(DB_TABS.RESULTS);
  var resRow = [
    'RES_' + payload.attemptId, payload.candidateId, payload.assessmentId, payload.attemptId,
    'Overall Composite', payload.totalQuestions || 30, payload.score, payload.score,
    payload.totalMarks || 30, Math.round(((payload.score) / (payload.totalMarks || 30)) * 100), 'RECORDED'
  ];
  upsertRowByKey(resSheet, 3, payload.attemptId, resRow);

  return { status: 'ASSESSMENT_SUBMITTED', score: payload.score };
}

function submitVideoProfileRecord(ss, video) {
  var sheet = ss.getSheetByName(DB_TABS.VIDEO_PROFILES);
  var videoId = video.Video_ID || ('VID_' + video.Candidate_ID + '_' + Date.now());

  var row = [
    videoId,
    video.Candidate_ID,
    video.Video_Title || 'Technical Presentation',
    video.Video_URL || '',
    video.Drive_File_ID || '',
    video.Duration_Seconds || 120,
    video.Submission_Date || new Date().toISOString(),
    'SUBMITTED',
    '',
    ''
  ];

  // Upsert by Candidate_ID (col 1) + Video_Title (col 2)
  upsertRowByCompositeKeys(sheet, [1, 2], [video.Candidate_ID, video.Video_Title || 'Technical Presentation'], row);
  return { status: 'VIDEO_SUBMITTED', Video_ID: videoId };
}

function reviewVideoProfileRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.VIDEO_PROFILES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.videoId) {
      sheet.getRange(i + 1, 8).setValue(payload.status);
      sheet.getRange(i + 1, 9).setValue(payload.reviewedBy || 'ADM_001');
      sheet.getRange(i + 1, 10).setValue(payload.comments || '');
      return { status: 'VIDEO_REVIEW_SAVED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function appendRowToSheet(ss, sheetName, rowObject) {
  var sheet = ss.getSheetByName(sheetName);
  var headers = SCHEMAS[sheetName] || [];
  var row = [];

  for (var i = 0; i < headers.length; i++) {
    row.push(rowObject[headers[i]] !== undefined ? rowObject[headers[i]] : '');
  }

  sheet.appendRow(row);
  return { status: 'ROW_APPENDED', sheet: sheetName };
}

function getSheetDataAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }

  return result;
}

// ==========================================
// DEDUPLICATION MAINTENANCE PURGE UTILITY
// ==========================================
/**
 * Run this function once from the Apps Script editor to clean up any past duplicates
 * that were accumulated across all 14 sheets!
 */
function deduplicateDatabase(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();

  var report = {};

  // Primary key mapping for each table
  var keyRules = {
    DB_1_Candidates: [0], // Candidate_ID
    DB_2_Academic_Profile: [1, 2], // Candidate_ID + Education_Level
    DB_3_Candidate_Activities: [1], // Candidate_ID
    DB_4_Entrance_Exams: [1, 2], // Candidate_ID + Examination_Name
    DB_5_Assessment_Master: [0], // Assessment_ID
    DB_6_Question_Bank: [0], // Question_ID
    DB_7_Assessment_Assignments: [1, 2], // Candidate_ID + Assessment_ID
    DB_8_Assessment_Attempts: [0], // Attempt_ID
    DB_9_Assessment_Responses: [1, 4], // Attempt_ID + Question_ID
    DB_10_Assessment_Results: [3], // Attempt_ID
    DB_11_Video_Profiles: [0], // Video_ID
    DB_12_Admin_Users: [2] // Email
  };

  for (var tab in keyRules) {
    var sheet = ss.getSheetByName(tab);
    if (!sheet) continue;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 2) continue;

    var keyCols = keyRules[tab];
    var seen = {};
    var rowsToKeep = [data[0]]; // keep header
    var purgedCount = 0;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var keyParts = [];
      for (var k = 0; k < keyCols.length; k++) {
        keyParts.push(String(row[keyCols[k]] || '').trim().toLowerCase());
      }
      var compositeKey = keyParts.join('___');

      if (!seen[compositeKey]) {
        seen[compositeKey] = true;
        rowsToKeep.push(row);
      } else {
        purgedCount++;
      }
    }

    if (purgedCount > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);
      formatHeaderRow(sheet, rowsToKeep[0].length);
    }

    report[tab] = { totalRows: data.length - 1, purgedDuplicates: purgedCount, remainingRows: rowsToKeep.length - 1 };
  }

  return { status: 'DEDUPLICATION_COMPLETE', report: report };
}

// ==========================================
// PURGE CANDIDATE RECORDS (CLEAN SLATE UTILITY)
// ==========================================
/**
 * Run this function from the Apps Script editor to clear all dummy/test candidate
 * rows from Google Sheets, leaving table headers and Assessment/Question banks intact!
 */
function clearAllCandidateRecords(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();

  var candidateTabs = [
    DB_TABS.CANDIDATES,
    DB_TABS.ACADEMIC_PROFILE,
    DB_TABS.ACTIVITIES,
    DB_TABS.ENTRANCE_EXAMS,
    DB_TABS.ASSIGNMENTS,
    DB_TABS.ATTEMPTS,
    DB_TABS.RESPONSES,
    DB_TABS.RESULTS,
    DB_TABS.VIDEO_PROFILES
  ];

  var cleared = {};

  for (var i = 0; i < candidateTabs.length; i++) {
    var tabName = candidateTabs[i];
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) continue;

    var numRows = sheet.getLastRow();
    if (numRows > 1) {
      sheet.deleteRows(2, numRows - 1);
      cleared[tabName] = (numRows - 1) + ' rows purged';
    } else {
      cleared[tabName] = '0 rows (already clean)';
    }
  }

  return { status: 'CANDIDATE_RECORDS_PURGED', details: cleared };
}
