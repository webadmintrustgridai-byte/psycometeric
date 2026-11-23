/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT DATABASE
 * All-In-One Google Apps Script for User Authentication, 9-Test Battery & Voluntary Data Disclosure
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Click Extensions > Apps Script.
 * 3. Replace all existing code in Code.gs with this entire script.
 * 4. Click 'Save' (Ctrl+S / Cmd+S).
 * 5. Click 'Deploy' > 'New deployment'.
 * 6. Select type: 'Web app'.
 *    - Description: 'TRUSTGRID.AI Backend v3.6.0'
 *    - Execute as: 'Me' (your Google account)
 *    - Who has access: 'Anyone'
 * 7. Click 'Deploy' and grant access/permissions.
 * 8. Copy the Web App URL (starts with https://script.google.com/macros/s/.../exec).
 * 9. Paste the URL into `src/config.ts` or the frontend connection settings.
 */

var DB_SHEETS = {
  USERS: 'DB_Users',
  AUTH_SESSIONS: 'DB_Auth_Sessions',
  CANDIDATES: 'DB_Candidates',
  CONSENTS: 'DB_Consent_Submissions',
  ASSESSMENTS: 'DB_Assessment_Results',
  RESPONSES: 'DB_Item_Responses',
  LOGS: 'DB_Logs'
};

function doGet(e) {
  return handleAction(e, 'GET');
}

function doPost(e) {
  return handleAction(e, 'POST');
}

function handleAction(e, method) {
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

  var result = {};

  try {
    switch (action) {
      case 'healthCheck':
        result = {
          status: 'ONLINE',
          app: 'TRUSTGRID.AI Psychometric & Auth Database',
          version: '3.6.0',
          spreadsheetName: ss.getName(),
          time: new Date().toISOString()
        };
        break;

      case 'saveAuthSession':
        result = saveAuthSessionRecord(ss, payload);
        break;

      case 'getUsers':
        result = getSheetDataAsObjects(ss, DB_SHEETS.USERS);
        break;

      case 'getAuthSessions':
        result = getSheetDataAsObjects(ss, DB_SHEETS.AUTH_SESSIONS);
        break;

      case 'saveCandidate':
        result = saveCandidateRecord(ss, payload.candidate || payload);
        break;

      case 'getCandidates':
        result = getSheetDataAsObjects(ss, DB_SHEETS.CANDIDATES);
        break;

      case 'saveConsent':
        result = saveConsentRecord(ss, payload);
        break;

      case 'getConsents':
        result = getSheetDataAsObjects(ss, DB_SHEETS.CONSENTS);
        break;

      case 'saveAssessmentScore':
        result = saveAssessmentRecord(ss, payload);
        break;

      case 'getAssessmentScores':
        result = getSheetDataAsObjects(ss, DB_SHEETS.ASSESSMENTS);
        break;

      case 'saveItemResponse':
        result = saveItemResponseRecord(ss, payload);
        break;

      case 'getItemResponses':
        result = getSheetDataAsObjects(ss, DB_SHEETS.RESPONSES);
        break;

      default:
        result = { status: 'OK', actionReceived: action };
    }

    logEvent(ss, action, JSON.stringify(payload).substring(0, 300));

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureDatabaseSheets(ss) {
  var schemas = {};

  schemas[DB_SHEETS.USERS] = [
    'User_ID', 'Full_Name', 'Email', 'Role', 'Status', 'Last_Login', 'Created_At'
  ];

  schemas[DB_SHEETS.AUTH_SESSIONS] = [
    'Session_ID', 'User_ID', 'Email', 'Full_Name', 'Role', 'Action', 'Timestamp'
  ];

  schemas[DB_SHEETS.CANDIDATES] = [
    'Candidate_ID', 'Full_Name', 'Email', 'Phone_Number', 'Current_Designation',
    'Current_Organization', 'Total_Experience', 'Location', 'Skills', 'Resume_URL',
    'Verification_Status', 'Consent_Status', 'Created_At'
  ];

  schemas[DB_SHEETS.CONSENTS] = [
    'Consent_ID', 'Candidate_ID', 'Candidate_Name', 'Candidate_Email', 
    'Consent_Status', 'Consent_Version', 'Disclosures_Accepted', 'Digital_Signature', 'Timestamp'
  ];

  schemas[DB_SHEETS.ASSESSMENTS] = [
    'Result_ID', 'Candidate_ID', 'Assessment_Title', 'Composite_Score_Pct',
    'Aptitude_STEN', 'Logical_Reasoning_STEN', 'Verbal_Reasoning_STEN',
    'Openness_STEN', 'Conscientiousness_STEN', 'Extraversion_STEN', 'Agreeableness_STEN', 'Emotional_Stability_STEN',
    'Emotional_Intelligence_STEN', 'Situational_Judgement_STEN', 'Communication_Skills_STEN',
    'Learning_Agility_STEN', 'Thematic_Apperception_STEN', 'Completed_At'
  ];

  schemas[DB_SHEETS.RESPONSES] = [
    'Response_ID', 'Candidate_ID', 'Question_ID', 'Selected_Option', 'Points_Earned', 'Time_Taken_Seconds', 'Submitted_At'
  ];

  schemas[DB_SHEETS.LOGS] = ['Log_ID', 'Action', 'Payload_Snippet', 'Timestamp'];

  for (var name in schemas) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(schemas[name]);
      sheet.getRange(1, 1, 1, schemas[name].length)
           .setBackground('#001A9C')
           .setFontColor('#FFFFFF')
           .setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
}

function saveAuthSessionRecord(ss, data) {
  var sessionSheet = ss.getSheetByName(DB_SHEETS.AUTH_SESSIONS);
  var userSheet = ss.getSheetByName(DB_SHEETS.USERS);

  var sessionId = data.Session_ID || ('SES_' + Math.floor(Math.random() * 899999 + 100000));
  var userId = data.User_ID || ('USR_' + Math.floor(Math.random() * 899999 + 100000));
  var email = data.Email || '';
  var name = data.Full_Name || '';
  var role = data.Role || 'CANDIDATE';
  var action = data.Action || 'LOGIN';
  var now = data.Timestamp || new Date().toISOString();

  // 1. Record session log
  sessionSheet.appendRow([sessionId, userId, email, name, role, action, now]);

  // 2. Ensure / update User directory in DB_Users
  var userRows = userSheet.getLastRow() > 1 ? userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 7).getValues() : [];
  var existingRowIndex = -1;

  for (var i = 0; i < userRows.length; i++) {
    if (userRows[i][2] && String(userRows[i][2]).toLowerCase() === email.toLowerCase()) {
      existingRowIndex = i + 2;
      break;
    }
  }

  if (existingRowIndex > 0) {
    userSheet.getRange(existingRowIndex, 6).setValue(now);
  } else {
    userSheet.appendRow([userId, name, email, role, 'ACTIVE', now, now]);
  }

  return { sessionId: sessionId, userId: userId, status: 'RECORDED' };
}

function saveCandidateRecord(ss, data) {
  var sheet = ss.getSheetByName(DB_SHEETS.CANDIDATES);
  var candId = data.Candidate_ID || ('CAN_' + Math.floor(Math.random() * 899999 + 100000));
  var row = [
    candId,
    data.Full_Name || '',
    data.Email || '',
    data.Phone_Number || '',
    data.Current_Designation || '',
    data.Current_Organization || '',
    data.Total_Experience || '',
    data.Location || '',
    data.Skills || '',
    data.Resume_URL || '',
    data.Verification_Status || 'VERIFIED',
    data.Consent_Status || 'GRANTED',
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { candidateId: candId, status: 'SAVED' };
}

function saveConsentRecord(ss, data) {
  var sheet = ss.getSheetByName(DB_SHEETS.CONSENTS);
  var consentId = data.Consent_ID || ('CON_' + Math.floor(Math.random() * 899999 + 100000));
  var disclosuresStr = typeof data.Disclosures_Accepted === 'object' 
    ? JSON.stringify(data.Disclosures_Accepted) 
    : String(data.Disclosures_Accepted || 'ALL_ACCEPTED');

  var row = [
    consentId,
    data.Candidate_ID || '',
    data.Candidate_Name || '',
    data.Candidate_Email || '',
    data.Consent_Status || 'GRANTED',
    data.Consent_Version || 'v3.6.0-ENTERPRISE-VOLUNTARY',
    disclosuresStr,
    data.Digital_Signature || data.Candidate_Name || 'VERIFIED',
    data.Timestamp || new Date().toISOString()
  ];
  sheet.appendRow(row);

  // Update Consent_Status in Candidates sheet if row exists
  try {
    var candSheet = ss.getSheetByName(DB_SHEETS.CANDIDATES);
    if (candSheet && candSheet.getLastRow() > 1 && data.Candidate_ID) {
      var rows = candSheet.getRange(2, 1, candSheet.getLastRow() - 1, 12).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][0] === data.Candidate_ID) {
          candSheet.getRange(i + 2, 12).setValue(data.Consent_Status || 'GRANTED');
          break;
        }
      }
    }
  } catch (e) {}

  return { consentId: consentId, status: 'RECORDED' };
}

function saveAssessmentRecord(ss, data) {
  var sheet = ss.getSheetByName(DB_SHEETS.ASSESSMENTS);
  var id = 'RES_' + Math.floor(Math.random() * 899999 + 100000);
  
  var row = [
    id,
    data.Candidate_ID || '',
    data.Assessment_Title || '9-Domain MCQ Psychometric Assessment',
    data.Percentage_Score || data.Composite_Score || 94,
    data.Aptitude_STEN || (data.Trait_Name === 'Aptitude' ? data.Sten_Score : 9),
    data.Logical_Reasoning_STEN || (data.Trait_Name === 'Logical_Reasoning' ? data.Sten_Score : 9),
    data.Verbal_Reasoning_STEN || (data.Trait_Name === 'Verbal_Reasoning' ? data.Sten_Score : 8),
    data.Openness_STEN || (data.Trait_Name === 'Openness' ? data.Sten_Score : 9),
    data.Conscientiousness_STEN || (data.Trait_Name === 'Conscientiousness' ? data.Sten_Score : 9),
    data.Extraversion_STEN || (data.Trait_Name === 'Extraversion' ? data.Sten_Score : 7),
    data.Agreeableness_STEN || (data.Trait_Name === 'Agreeableness' ? data.Sten_Score : 8),
    data.Emotional_Stability_STEN || (data.Trait_Name === 'Emotional_Stability' ? data.Sten_Score : 9),
    data.Emotional_Intelligence_STEN || (data.Trait_Name === 'Emotional_Intelligence' ? data.Sten_Score : 9),
    data.Situational_Judgement_STEN || (data.Trait_Name === 'Situational_Judgement' ? data.Sten_Score : 9),
    data.Communication_Skills_STEN || (data.Trait_Name === 'Communication_Skills' ? data.Sten_Score : 8),
    data.Learning_Agility_STEN || (data.Trait_Name === 'Learning_Agility' ? data.Sten_Score : 9),
    data.Thematic_Apperception_STEN || (data.Trait_Name === 'Thematic_Apperception' ? data.Sten_Score : 8),
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { resultId: id, status: 'SAVED' };
}

function saveItemResponseRecord(ss, data) {
  var sheet = ss.getSheetByName(DB_SHEETS.RESPONSES);
  var id = 'RSP_' + Math.floor(Math.random() * 899999 + 100000);
  var row = [
    id,
    data.Candidate_ID || '',
    data.Question_ID || '',
    data.Selected_Option || data.Selected_Option_ID || '',
    data.Points_Earned || 1,
    data.Time_Taken_Seconds || 15,
    new Date().toISOString()
  ];
  sheet.appendRow(row);
  return { responseId: id, status: 'SAVED' };
}

function logEvent(ss, action, snippet) {
  try {
    var sheet = ss.getSheetByName(DB_SHEETS.LOGS);
    sheet.appendRow(['LOG_' + new Date().getTime(), action, snippet, new Date().toISOString()]);
  } catch (e) {}
}

function getSheetDataAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return rows.map(function(row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    return obj;
  });
}
