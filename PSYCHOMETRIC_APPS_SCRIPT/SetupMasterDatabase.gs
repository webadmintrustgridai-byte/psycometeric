/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * SetupMasterDatabase.gs - One-Click Database Initialization & Schema Provisioning
 */

function setupMasterDatabase() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // If running as standalone script, create a new master spreadsheet
    ss = SpreadsheetApp.create('PSYCHOMETRIC_ASSESSMENT_MASTER_DB');
  }

  Logger.log('Initializing Master Database: ' + ss.getName() + ' (' + ss.getId() + ')');

  // Schema definitions for all 24 sheets
  var SCHEMAS = {
    'DB_01_Organizations': [
      'Organization_ID', 'Org_Name', 'Domain', 'Subscription_Tier', 'Max_Users', 'Status', 'Created_At', 'Updated_At'
    ],
    'DB_02_Users': [
      'User_ID', 'Organization_ID', 'Full_Name', 'Email', 'Password_Hash', 'Role', 'Status', 'Last_Login', 'Created_At'
    ],
    'DB_03_Candidates': [
      'Candidate_ID', 'Organization_ID', 'Full_Name', 'Email', 'Phone_Number', 'Location', 'Qualification',
      'University', 'Graduation_Year', 'Total_Experience', 'Current_Organization', 'Current_Designation',
      'Industry', 'Skills', 'LinkedIn_URL', 'Portfolio_URL', 'Resume_File_ID', 'Resume_URL',
      'Profile_Photo', 'Registration_Date', 'Verification_Status', 'Consent_Status', 'Record_Status', 'Created_At', 'Updated_At'
    ],
    'DB_04_Jobs': [
      'Job_ID', 'Organization_ID', 'Job_Title', 'Department', 'Location', 'Employment_Type', 'Experience_Required', 'Key_Competencies', 'Status', 'Created_At'
    ],
    'DB_05_Assessment_Templates': [
      'Template_ID', 'Organization_ID', 'Title', 'Assessment_Type', 'Categories_JSON', 'Time_Limit_Minutes', 'Passing_Score', 'Total_Marks', 'Adaptive_Enabled', 'Negative_Marking', 'Status', 'Created_At'
    ],
    'DB_06_Question_Bank': [
      'Question_ID', 'Organization_ID', 'Category', 'Subcategory', 'Question_Type', 'Difficulty', 'Question_Text', 'Points', 'Reverse_Scored', 'Rubric_JSON', 'Status', 'Created_At'
    ],
    'DB_07_Question_Options': [
      'Option_ID', 'Question_ID', 'Option_Text', 'Trait_Weight', 'Is_Correct', 'Order_Index', 'Created_At'
    ],
    'DB_08_Assessment_Invitations': [
      'Invitation_ID', 'Candidate_ID', 'Template_ID', 'Job_ID', 'Invitation_Token', 'Expiry_Date', 'Status', 'Attempts_Allowed', 'Created_At'
    ],
    'DB_09_Assessment_Attempts': [
      'Attempt_ID', 'Invitation_ID', 'Candidate_ID', 'Template_ID', 'Start_Time', 'End_Time', 'Time_Spent_Seconds', 'Status', 'Total_Score', 'Percentage_Score', 'Created_At'
    ],
    'DB_10_Responses': [
      'Response_ID', 'Attempt_ID', 'Candidate_ID', 'Question_ID', 'Selected_Option_ID', 'Response_Value', 'Time_Taken_Seconds', 'Is_Correct', 'Points_Earned', 'Created_At'
    ],
    'DB_11_Scores': [
      'Score_ID', 'Attempt_ID', 'Candidate_ID', 'Category', 'Trait_Name', 'Raw_Score', 'Normalized_Score', 'Sten_Score', 'Interpretation', 'Percentile', 'Created_At'
    ],
    'DB_12_Video_Questions': [
      'Video_Question_ID', 'Organization_ID', 'Job_Role', 'Competency', 'Question_Text', 'Prep_Time_Seconds', 'Answer_Time_Seconds', 'Max_Retakes', 'Order_Index', 'Status', 'Created_At'
    ],
    'DB_13_Video_Interviews': [
      'Interview_ID', 'Candidate_ID', 'Job_ID', 'Organization_ID', 'Title', 'Questions_List_JSON', 'Status', 'Invitation_Token', 'Expires_At', 'Created_At'
    ],
    'DB_14_Video_Responses': [
      'Video_Response_ID', 'Interview_ID', 'Candidate_ID', 'Video_Question_ID', 'Video_Source_Type', 'Video_File_ID', 'Video_URL', 'Thumbnail_URL', 'Duration_Seconds', 'Retake_Count', 'Status', 'Created_At'
    ],
    'DB_15_Transcripts': [
      'Transcript_ID', 'Video_Response_ID', 'Candidate_ID', 'Full_Text', 'Timestamped_JSON', 'Language', 'Confidence_Score', 'Processing_Status', 'Created_At'
    ],
    'DB_16_AI_Evaluations': [
      'AI_Eval_ID', 'Video_Response_ID', 'Candidate_ID', 'Competency', 'Score_1_to_5', 'Confidence', 'Positive_Evidence', 'Missing_Evidence', 'Explanation', 'Safety_Audit_Passed', 'Created_At'
    ],
    'DB_17_Human_Evaluations': [
      'Human_Eval_ID', 'Interview_ID', 'Candidate_ID', 'Evaluator_ID', 'Competency', 'Score_1_to_5', 'Feedback', 'Strengths', 'Areas_For_Improvement', 'Recommendation', 'Created_At'
    ],
    'DB_18_Final_Reports': [
      'Report_ID', 'Candidate_ID', 'Job_ID', 'Report_Type', 'Psychometric_Score', 'Video_Score', 'Consolidated_Score', 'Strengths_JSON', 'Development_Areas_JSON', 'Report_PDF_URL', 'Status', 'Created_At'
    ],
    'DB_19_Notifications': [
      'Notification_ID', 'Recipient_Email', 'Recipient_Type', 'Subject', 'Message_Body', 'Channel', 'Delivery_Status', 'Sent_At', 'Created_At'
    ],
    'DB_20_Audit_Logs': [
      'Log_ID', 'Organization_ID', 'User_ID', 'Action', 'Entity_Type', 'Entity_ID', 'Details_JSON', 'IP_Address', 'Created_At'
    ],
    'DB_21_Configuration': [
      'Config_Key', 'Organization_ID', 'Config_Value', 'Description', 'Updated_At'
    ],
    'DB_22_API_Logs': [
      'API_Log_ID', 'Endpoint', 'Method', 'Status_Code', 'Execution_Time_Ms', 'Request_Snippet', 'Response_Snippet', 'Created_At'
    ],
    'DB_23_Candidate_Video_Profiles': [
      'Video_Profile_ID', 'Candidate_ID', 'Organization_ID', 'Video_Title', 'Category', 'Source_Type', 'Video_URL', 'Thumbnail_URL', 'Duration_Seconds', 'Visibility', 'Processing_Status', 'Consent_Granted', 'Created_At'
    ],
    'DB_24_Video_Access_Logs': [
      'Access_Log_ID', 'Video_Profile_ID', 'Video_Response_ID', 'Accessed_By_User_ID', 'Candidate_ID', 'Access_Type', 'Access_Timestamp', 'IP_Address'
    ]
  };

  var headerBgColor = '#001A9C'; // TRUSTGRID Royal Blue
  var headerFontColor = '#FFFFFF';

  for (var sheetName in SCHEMAS) {
    var headers = SCHEMAS[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Set headers if first row is empty
    if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground(headerBgColor)
                 .setFontColor(headerFontColor)
                 .setFontWeight('bold')
                 .setFontFamily('Inter');
      sheet.setFrozenRows(1);
    }
  }

  // Remove default 'Sheet1' if exists and has other sheets
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Ignore
    }
  }

  // Save SPREADSHEET_ID in ScriptProperties
  PropertiesService.getScriptProperties().setProperty(
    CONFIG.PROPERTY_KEYS.SPREADSHEET_ID,
    ss.getId()
  );

  // Seed default Super Admin & Organizations if empty
  seedInitialData(ss);

  Logger.log('Setup completed successfully! Master Spreadsheet ID: ' + ss.getId());
  return {
    success: true,
    spreadsheetId: ss.getId(),
    url: ss.getUrl()
  };
}

/**
 * Inserts foundational seed data into the newly created sheets
 */
function seedInitialData(ss) {
  var orgSheet = ss.getSheetByName(CONFIG.SHEETS.ORGANIZATIONS);
  if (orgSheet.getLastRow() <= 1) {
    orgSheet.appendRow([
      'ORG_000001', 'TRUSTGRID Global Systems', 'trustgrid.ai', 'ENTERPRISE', 100, 'ACTIVE',
      new Date().toISOString(), new Date().toISOString()
    ]);
    orgSheet.appendRow([
      'ORG_000002', 'Apex Technologies Corp', 'apextech.com', 'PRO', 25, 'ACTIVE',
      new Date().toISOString(), new Date().toISOString()
    ]);
  }

  var userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow([
      'USR_000001', 'ORG_000001', 'Super Administrator', 'admin@trustgrid.ai',
      Utils.hashPassword('Admin@12345'), 'SUPER_ADMIN', 'ACTIVE', '', new Date().toISOString()
    ]);
    userSheet.appendRow([
      'USR_000002', 'ORG_000002', 'Sarah Jenkins', 'sarah.j@apextech.com',
      Utils.hashPassword('Recruiter@123'), 'RECRUITER', 'ACTIVE', '', new Date().toISOString()
    ]);
    userSheet.appendRow([
      'USR_000003', 'ORG_000002', 'David Miller', 'david.m@apextech.com',
      Utils.hashPassword('Evaluator@123'), 'EVALUATOR', 'ACTIVE', '', new Date().toISOString()
    ]);
  }

  var jobSheet = ss.getSheetByName(CONFIG.SHEETS.JOBS);
  if (jobSheet.getLastRow() <= 1) {
    jobSheet.appendRow([
      'JOB_000001', 'ORG_000002', 'Senior AI & Full Stack Engineer', 'Engineering', 'Remote / Bengaluru',
      'FULL_TIME', '5+ Years', 'System Design, React, Node.js, Leadership, Problem Solving', 'OPEN', new Date().toISOString()
    ]);
  }
}
