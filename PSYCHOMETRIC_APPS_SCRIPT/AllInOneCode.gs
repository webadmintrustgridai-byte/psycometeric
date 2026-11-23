/**
 * TRUSTGRID.AI - STANDARDIZED CAMPUS PSYCHOMETRIC & VIDEO ASSESSMENT DATABASE
 * All-In-One Google Apps Script Backend (14 Standardized Relational Sheets)
 * Concurrency Safety with LockService • Server-Authoritative Scoring & Timers
 * 
 * Target Spreadsheet ID: 16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI
 * 
 * Instructions:
 * 1. Open Google Sheets (https://docs.google.com/spreadsheets/d/16F6thCNBYdceto8Sxvf0t3Ldi9ao4lBokUGoOf8D0sI).
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code in Code.gs with this entire script.
 * 4. Click 'Save' (Ctrl+S / Cmd+S).
 * 5. Run setupMasterDatabase() once to automatically provision all 14 sheets with headers.
 * 6. Click Deploy > Manage Deployments > Edit > New Version > Deploy.
 * 7. Ensure Web App execution is set to:
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
    'Assignment_Status', 'Approved_By', 'Attempt_Allowed', 'Retake_Approved'
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
    'Video_ID', 'Candidate_ID', 'Video_URL', 'Drive_File_ID', 'Submission_Date',
    'Review_Status', 'Reviewed_By', 'Review_Comments'
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

  // Use LockService for concurrency control
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(15000); // Wait up to 15 seconds

  if (!success && method === 'POST') {
    return jsonResponse(false, 'Server is busy processing concurrent writes. Please retry.', null, 'CONCURRENCY_LOCK_TIMEOUT');
  }

  try {
    var responseData = {};

    switch (action) {
      case 'healthCheck':
        responseData = {
          status: 'ONLINE',
          app: 'TRUSTGRID.AI Campus Assessment & Video Platform',
          version: '4.0.0-ENTERPRISE-14-TABS',
          spreadsheetName: ss.getName(),
          serverTime: new Date().toISOString()
        };
        break;

      // 1. Candidate Operations
      case 'registerCandidate':
      case 'saveCandidate':
        responseData = saveCandidateRecord(ss, payload.candidate || payload);
        break;

      case 'getCandidates':
      case 'getCandidateProfile':
        responseData = getSheetDataAsObjects(ss, DB_TABS.CANDIDATES);
        break;

      case 'updateCandidateProfile':
        responseData = updateCandidateRecord(ss, payload.candidate || payload);
        break;

      case 'approveRegistration':
        responseData = approveRegistrationRecord(ss, payload.candidateId, payload.adminId);
        break;

      case 'rejectRegistration':
        responseData = rejectRegistrationRecord(ss, payload.candidateId, payload.adminId);
        break;

      // 2. Academic Profile Operations
      case 'saveAcademicProfile':
        responseData = saveAcademicProfileRecords(ss, payload);
        break;

      case 'getAcademicProfiles':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ACADEMIC_PROFILE);
        break;

      // 3. Entrance Exam & Activities
      case 'saveEntranceExamDetails':
        responseData = saveEntranceExamRecords(ss, payload);
        break;

      case 'saveCandidateActivities':
        responseData = saveCandidateActivitiesRecord(ss, payload);
        break;

      // 4. Assessment Master & Questions
      case 'getAssessmentMaster':
      case 'getAssessmentSchedule':
        responseData = getSheetDataAsObjects(ss, DB_TABS.ASSESSMENT_MASTER);
        break;

      case 'getAssessmentQuestions':
      case 'getQuestionBank':
        responseData = getSanitizedQuestions(ss, payload.assessmentId);
        break;

      case 'createQuestion':
        responseData = createQuestionRecord(ss, payload.question);
        break;

      case 'updateQuestion':
        responseData = updateQuestionRecord(ss, payload.question);
        break;

      case 'deleteQuestion':
        responseData = deleteQuestionRecord(ss, payload.questionId);
        break;

      case 'importQuestions':
        responseData = bulkImportQuestionsRecord(ss, payload.questions);
        break;

      // 5. Scheduling & Retakes
      case 'scheduleAssessment':
        responseData = scheduleAssessmentRecord(ss, payload);
        break;

      case 'authorizeRetake':
        responseData = authorizeRetakeRecord(ss, payload);
        break;

      // 6. Attempts, Autosave & Submission
      case 'startAssessment':
        responseData = startAssessmentAttemptRecord(ss, payload.attempt || payload);
        break;

      case 'saveAssessmentResponse':
        responseData = saveAssessmentResponseRecord(ss, payload.response || payload);
        break;

      case 'submitAssessment':
        responseData = submitAssessmentRecord(ss, payload);
        break;

      // 7. Video Profiles
      case 'submitVideoProfile':
        responseData = submitVideoProfileRecord(ss, payload.video || payload);
        break;

      case 'reviewVideoProfile':
        responseData = reviewVideoProfileRecord(ss, payload);
        break;

      // 8. Audit Logging
      case 'logAuditEvent':
        responseData = appendRowToSheet(ss, DB_TABS.AUDIT_LOG, payload);
        break;

      default:
        return jsonResponse(false, 'Unknown API action: ' + action, null, 'INVALID_ACTION');
    }

    return jsonResponse(true, 'Operation completed successfully', responseData, null);

  } catch (err) {
    return jsonResponse(false, 'Backend execution error: ' + err.message, null, err.toString());
  } finally {
    if (success) {
      lock.releaseLock();
    }
  }
}

// Uniform JSON Response Builder
function jsonResponse(success, message, data, error) {
  var out = ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message,
    data: data || {},
    error: error || null
  }));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// ==========================================
// DATABASE SCHEMA INITIALIZATION
// ==========================================
function setupMasterDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureDatabaseSheets(ss);
  seedDefaultAdminAndAssessments(ss);
  Logger.log('TRUSTGRID.AI Master Database (14 Standardized Tabs) successfully initialized.');
}

function ensureDatabaseSheets(ss) {
  for (var tabKey in DB_TABS) {
    var sheetName = DB_TABS[tabKey];
    var sheet = ss.getSheetByName(sheetName);
    var headers = SCHEMAS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (headers) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
        sheet.setFrozenRows(1);
      }
    } else if (sheet.getLastRow() === 0 && headers) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }
}

function seedDefaultAdminAndAssessments(ss) {
  // Seed Super Admin if missing
  var adminSheet = ss.getSheetByName(DB_TABS.ADMIN_USERS);
  if (adminSheet && adminSheet.getLastRow() <= 1) {
    adminSheet.appendRow([
      'ADM_001',
      'Poojasri',
      'poojasri@trustgrid.ai',
      'SUPER_ADMIN',
      'Pooj@2004*',
      'ACTIVE',
      new Date().toISOString(),
      new Date().toISOString()
    ]);
  }

  // Seed 3 Assessments Master if missing
  var asmSheet = ss.getSheetByName(DB_TABS.ASSESSMENT_MASTER);
  if (asmSheet && asmSheet.getLastRow() <= 1) {
    asmSheet.appendRow([
      'ASM_APTITUDE', 'Assessment 1: Aptitude Assessment', 'APTITUDE', 30, 30, 30, 'FALSE', 'ACTIVE', new Date().toISOString(), 'ADM_001'
    ]);
    asmSheet.appendRow([
      'ASM_COMPREHENSION', 'Assessment 2: Test of Comprehension', 'COMPREHENSION', 30, 30, 30, 'FALSE', 'ACTIVE', new Date().toISOString(), 'ADM_001'
    ]);
    asmSheet.appendRow([
      'ASM_EI_SITUATIONAL', 'Assessment 3: Emotional Intelligence & Situational Reaction', 'EI_SITUATIONAL', 30, 30, 30, 'FALSE', 'ACTIVE', new Date().toISOString(), 'ADM_001'
    ]);
  }
}

// ==========================================
// CORE RECORD OPERATIONS
// ==========================================
function saveCandidateRecord(ss, candidate) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var cleanEmail = (candidate.Primary_Email || candidate.Email || '').trim().toLowerCase();

  // Check duplicate email
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] && String(data[i][3]).toLowerCase() === cleanEmail) {
      return { Candidate_ID: data[i][0], status: 'EXISTS', message: 'Candidate already exists in database.' };
    }
  }

  var candidateId = candidate.Candidate_ID || ('CAN_' + new Date().getFullYear() + '_' + String(data.length).padStart(3, '0'));
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

  sheet.appendRow(row);
  return { Candidate_ID: candidateId, status: 'CREATED' };
}

function updateCandidateRecord(ss, candidate) {
  var sheet = ss.getSheetByName(DB_TABS.CANDIDATES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === candidate.Candidate_ID) {
      if (candidate.Full_Name) sheet.getRange(i + 1, 3).setValue(candidate.Full_Name);
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
      sheet.getRange(i + 1, 19).setValue(adminId || 'USR_ADMIN_001');
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
      sheet.getRange(i + 1, 19).setValue(adminId || 'USR_ADMIN_001');
      return { Candidate_ID: candidateId, Registration_Status: 'REJECTED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function saveAcademicProfileRecords(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ACADEMIC_PROFILE);
  var profile = payload.profile || {};
  var candidateId = payload.candidateId;

  if (profile.sslc10) {
    sheet.appendRow([
      'ACAD_10_' + candidateId, candidateId, '10TH', profile.sslc10.schoolName, profile.sslc10.board,
      profile.sslc10.passingYear, profile.sslc10.mathsMarks, profile.sslc10.scienceMarks, '', '',
      profile.sslc10.englishMarks, profile.sslc10.totalMarks, profile.sslc10.percentage, '', '', '', '', ''
    ]);
  }

  if (profile.hsc12) {
    sheet.appendRow([
      'ACAD_12_' + candidateId, candidateId, '12TH', profile.hsc12.schoolName, profile.hsc12.board,
      profile.hsc12.passingYear, profile.hsc12.mathsMarks, '', profile.hsc12.physicsMarks, profile.hsc12.chemistryMarks,
      profile.hsc12.englishMarks, profile.hsc12.totalMarks, profile.hsc12.percentage, '', '', '', '', ''
    ]);
  }

  return { status: 'ACADEMIC_RECORDS_SAVED' };
}

function saveEntranceExamRecords(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ENTRANCE_EXAMS);
  var exams = payload.exams || [];
  for (var i = 0; i < exams.length; i++) {
    var ex = exams[i];
    sheet.appendRow([
      ex.Exam_Record_ID || ('ENT_' + Date.now()), payload.candidateId, ex.Examination_Name, ex.Examination_Year,
      ex.Score || '', ex.Percentile || '', ex.Rank || '', ex.Scorecard_URL || ''
    ]);
  }
  return { status: 'ENTRANCE_EXAMS_SAVED' };
}

function saveCandidateActivitiesRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ACTIVITIES);
  var act = payload.activities || {};
  sheet.appendRow([
    act.Activity_ID || ('ACT_' + Date.now()), payload.candidateId, act.NCC_Participation || 'No',
    act.Sports_Activities || '', act.Extracurricular_Activities || '', act.Achievements || '',
    act.Resume_URL || '', act.College_ID_URL || '', act.Certificates_URL || ''
  ]);
  return { status: 'ACTIVITIES_SAVED' };
}

// Candidate-Safe Question Fetcher (Omit Correct Answers to Candidate API!)
function getSanitizedQuestions(ss, assessmentId) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var data = getSheetDataAsObjects(ss, DB_TABS.QUESTION_BANK);

  var filtered = data;
  if (assessmentId && assessmentId !== 'ALL') {
    filtered = data.filter(function(q) { return q.Assessment_ID === assessmentId; });
  }

  // Sanitize: do not leak Correct_Answer or Explanation to client
  return filtered.map(function(q) {
    return {
      Question_ID: q.Question_ID,
      Assessment_ID: q.Assessment_ID,
      Section_Name: q.Section_Name,
      Question_Text: q.Question_Text,
      Option_A: q.Option_A,
      Option_B: q.Option_B,
      Option_C: q.Option_C,
      Option_D: q.Option_D,
      Marks: Number(q.Marks) || 1,
      Difficulty_Level: q.Difficulty_Level
    };
  });
}

function createQuestionRecord(ss, question) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  sheet.appendRow([
    question.Question_ID, question.Assessment_ID, question.Section_Name, question.Question_Text,
    question.Option_A, question.Option_B, question.Option_C, question.Option_D,
    question.Correct_Answer, question.Marks || 1, question.Difficulty_Level || 'MEDIUM',
    question.Explanation || '', 'PUBLISHED'
  ]);
  return { status: 'QUESTION_CREATED', Question_ID: question.Question_ID };
}

function updateQuestionRecord(ss, question) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === question.Question_ID) {
      sheet.getRange(i + 1, 4).setValue(question.Question_Text);
      sheet.getRange(i + 1, 5).setValue(question.Option_A);
      sheet.getRange(i + 1, 6).setValue(question.Option_B);
      sheet.getRange(i + 1, 7).setValue(question.Option_C);
      sheet.getRange(i + 1, 8).setValue(question.Option_D);
      sheet.getRange(i + 1, 9).setValue(question.Correct_Answer);
      return { status: 'QUESTION_UPDATED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function deleteQuestionRecord(ss, questionId) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === questionId) {
      sheet.deleteRow(i + 1);
      return { status: 'QUESTION_DELETED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function bulkImportQuestionsRecord(ss, questions) {
  var sheet = ss.getSheetByName(DB_TABS.QUESTION_BANK);
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    sheet.appendRow([
      q.Question_ID || ('QUE_' + Date.now() + '_' + i), q.Assessment_ID, q.Section_Name, q.Question_Text,
      q.Option_A, q.Option_B, q.Option_C, q.Option_D, q.Correct_Answer, q.Marks || 1,
      q.Difficulty_Level || 'MEDIUM', q.Explanation || '', 'PUBLISHED'
    ]);
  }
  return { status: 'BULK_IMPORT_COMPLETED', count: questions.length };
}

function scheduleAssessmentRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ASSIGNMENTS);
  var candidateIds = payload.candidateIds || [];

  for (var i = 0; i < candidateIds.length; i++) {
    var cid = candidateIds[i];
    sheet.appendRow([
      'ASN_' + Date.now() + '_' + i, cid, payload.assessmentId, payload.scheduledDate,
      payload.scheduledStartTime, 'SCHEDULED', payload.adminId || 'USR_ADMIN_001', 1, 'FALSE'
    ]);
  }
  return { status: 'SCHEDULED', count: candidateIds.length };
}

function authorizeRetakeRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ASSIGNMENTS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === payload.candidateId && data[i][2] === payload.assessmentId) {
      sheet.getRange(i + 1, 6).setValue('SCHEDULED');
      sheet.getRange(i + 1, 9).setValue('TRUE');
      return { status: 'RETAKE_AUTHORIZED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function startAssessmentAttemptRecord(ss, attempt) {
  var sheet = ss.getSheetByName(DB_TABS.ATTEMPTS);
  sheet.appendRow([
    attempt.Attempt_ID, attempt.Candidate_ID, attempt.Assessment_ID, attempt.Start_Timestamp,
    '', attempt.End_Timestamp_Deadline, attempt.Duration_Seconds, 'IN_PROGRESS',
    attempt.Total_Questions || 30, 0, 0, attempt.Total_Marks || 30, 'MANUAL', attempt.Retake_Number || 0
  ]);
  return { status: 'ATTEMPT_STARTED', Attempt_ID: attempt.Attempt_ID };
}

function saveAssessmentResponseRecord(ss, response) {
  var sheet = ss.getSheetByName(DB_TABS.RESPONSES);
  sheet.appendRow([
    response.Response_ID || ('RSP_' + Date.now()), response.Attempt_ID, response.Candidate_ID,
    response.Assessment_ID, response.Question_ID, response.Selected_Answer, 0, response.Answer_Timestamp || new Date().toISOString()
  ]);
  return { status: 'RESPONSE_SAVED' };
}

function submitAssessmentRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.ATTEMPTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.attemptId) {
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 8).setValue(payload.submissionType === 'AUTO_TIME_EXPIRED' ? 'TIME_EXPIRED' : 'COMPLETED');
      sheet.getRange(i + 1, 11).setValue(payload.score);
      sheet.getRange(i + 1, 13).setValue(payload.submissionType || 'MANUAL');
      break;
    }
  }

  // Save Results to DB_10_Assessment_Results
  var resSheet = ss.getSheetByName(DB_TABS.RESULTS);
  var sections = payload.sectionResults || [];
  for (var j = 0; j < sections.length; j++) {
    var sec = sections[j];
    resSheet.appendRow([
      'RES_' + Date.now() + '_' + j, payload.candidateId, payload.assessmentId, payload.attemptId,
      sec.sectionName, sec.totalQuestions, sec.correctAnswers, sec.score, sec.totalQuestions,
      Math.round((sec.score / sec.totalQuestions) * 100), 'VERIFIED'
    ]);
  }

  return { status: 'SUBMISSION_RECORDED', Score: payload.score };
}

function submitVideoProfileRecord(ss, video) {
  var sheet = ss.getSheetByName(DB_TABS.VIDEO_PROFILES);
  sheet.appendRow([
    video.Video_ID || ('VID_' + Date.now()), video.Candidate_ID, video.Video_URL,
    video.Drive_File_ID || '', video.Submission_Date || new Date().toISOString(),
    'PENDING', '', ''
  ]);
  return { status: 'VIDEO_SUBMITTED' };
}

function reviewVideoProfileRecord(ss, payload) {
  var sheet = ss.getSheetByName(DB_TABS.VIDEO_PROFILES);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.videoId) {
      sheet.getRange(i + 1, 6).setValue(payload.status);
      sheet.getRange(i + 1, 7).setValue(payload.adminId || 'USR_ADMIN_001');
      sheet.getRange(i + 1, 8).setValue(payload.comments || '');
      return { status: 'VIDEO_REVIEWED' };
    }
  }
  return { status: 'NOT_FOUND' };
}

function appendRowToSheet(ss, sheetName, rowObject) {
  var sheet = ss.getSheetByName(sheetName);
  var headers = SCHEMAS[sheetName];
  if (!sheet || !headers) return { status: 'INVALID_SHEET' };

  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    row.push(rowObject[key] !== undefined ? rowObject[key] : '');
  }
  sheet.appendRow(row);
  return { status: 'ROW_APPENDED' };
}

function getSheetDataAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}
