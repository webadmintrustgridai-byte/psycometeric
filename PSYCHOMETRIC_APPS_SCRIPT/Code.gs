/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * Code.gs - Master Web App Entrypoint & RESTful Dispatcher
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Unified Request Handler for doGet and doPost
 */
function handleRequest(e, method) {
  var startTime = new Date().getTime();
  var params = (e && e.parameter) ? e.parameter : {};
  var postData = {};

  if (method === 'POST' && e && e.postData && e.postData.contents) {
    postData = Utils.safeJsonParse(e.postData.contents, {});
  }

  // Merge parameters
  var action = params.action || postData.action || 'healthCheck';
  var payload = Object.assign({}, params, postData);

  var result;
  var statusCode = 200;

  try {
    switch (action) {
      // SYSTEM & HEALTH
      case 'healthCheck':
        result = {
          status: 'ONLINE',
          app: CONFIG.APP_NAME,
          version: CONFIG.VERSION,
          serverTime: new Date().toISOString()
        };
        break;

      case 'getDashboardMetrics':
        result = getDashboardMetrics(payload.orgId);
        break;

      case 'setupDatabase':
        result = setupMasterDatabase();
        break;

      // AUTH
      case 'login':
        result = AuthService.login(payload.email, payload.password, payload.ipAddress);
        break;

      case 'verifyToken':
        result = AuthService.verifyInvitationToken(payload.token);
        break;

      // CANDIDATES
      case 'createCandidate':
        result = CandidateService.createCandidate(payload.candidate, payload.userId);
        break;

      case 'getCandidate':
        result = CandidateService.getCandidateById(payload.candidateId);
        break;

      case 'searchCandidates':
        result = CandidateService.searchCandidates(payload.orgId, payload.query, payload.status);
        break;

      case 'updateCandidate':
        result = CandidateService.updateCandidate(payload.candidateId, payload.updates, payload.userId);
        break;

      case 'checkDuplicate':
        result = CandidateService.checkDuplicate(payload.email, payload.phone);
        break;

      // ASSESSMENTS & TESTING
      case 'getTemplates':
        result = DatabaseService.findAll(CONFIG.SHEETS.ASSESSMENT_TEMPLATES);
        break;

      case 'createTemplate':
        result = AssessmentService.createTemplate(payload.template, payload.userId);
        break;

      case 'assignAssessment':
        result = AssessmentService.assignAssessment(
          payload.candidateId, payload.templateId, payload.jobId, payload.expiryDays, payload.userId
        );
        break;

      case 'startAttempt':
        result = AssessmentService.startAttempt(payload.invitationToken);
        break;

      case 'saveResponse':
        result = AssessmentService.saveResponse(
          payload.attemptId, payload.candidateId, payload.questionId,
          payload.selectedOptionId, payload.responseValue, payload.timeTakenSeconds
        );
        break;

      case 'submitAssessment':
        result = AssessmentService.submitAssessment(payload.attemptId, payload.timeSpentSeconds);
        break;

      // QUESTION BANK
      case 'getQuestionBank':
        result = DatabaseService.findAll(CONFIG.SHEETS.QUESTION_BANK);
        break;

      case 'getQuestionOptions':
        result = DatabaseService.findAll(CONFIG.SHEETS.QUESTION_OPTIONS);
        break;

      // VIDEO PROFILES
      case 'createVideoProfile':
        result = VideoProfileService.createVideoProfile(payload.video, payload.candidateId, payload.orgId);
        break;

      case 'getCandidateVideos':
        result = VideoProfileService.getCandidateVideos(payload.candidateId, payload.userId);
        break;

      case 'updateVideoVisibility':
        result = VideoProfileService.updateVisibility(payload.profileId, payload.visibility, payload.userId);
        break;

      case 'deleteVideoProfile':
        result = VideoProfileService.deleteVideo(payload.profileId, payload.userId);
        break;

      // VIDEO INTERVIEWS
      case 'assignInterview':
        result = VideoInterviewService.assignInterview(
          payload.candidateId, payload.jobId, payload.orgId, payload.questionIds, payload.title, payload.userId
        );
        break;

      case 'getInterviewSession':
        result = VideoInterviewService.getInterviewSession(payload.token);
        break;

      case 'saveVideoResponse':
        result = VideoInterviewService.saveVideoResponse(
          payload.interviewId, payload.candidateId, payload.questionId, payload.videoData
        );
        break;

      case 'completeInterview':
        result = VideoInterviewService.completeInterview(payload.interviewId, payload.candidateId);
        break;

      // EVALUATIONS & REPORTS
      case 'submitHumanEvaluation':
        result = HumanEvaluationService.submitEvaluation(
          payload.interviewId, payload.candidateId, payload.evaluatorId, payload.evaluations
        );
        break;

      case 'generateReport':
        result = ReportService.generateConsolidatedReport(payload.candidateId, payload.jobId, payload.userId);
        break;

      // JOBS
      case 'getJobs':
        result = DatabaseService.findAll(CONFIG.SHEETS.JOBS);
        break;

      case 'getAuditLogs':
        result = DatabaseService.findAll(CONFIG.SHEETS.AUDIT_LOGS).slice(-100);
        break;

      default:
        throw new Error('Unrecognized action: ' + action);
    }

    var executionTime = new Date().getTime() - startTime;
    AuditService.logApiCall(action, method, 200, executionTime, JSON.stringify(payload), JSON.stringify(result));

    return Utils.successResponse(result);
  } catch (err) {
    var executionTimeFail = new Date().getTime() - startTime;
    AuditService.logApiCall(action, method, 500, executionTimeFail, JSON.stringify(payload), err.message);
    return Utils.errorResponse(err.message, 500, err.stack);
  }
}

/**
 * Aggregate high-level platform and organization metrics
 */
function getDashboardMetrics(orgId) {
  var candidates = DatabaseService.findAll(CONFIG.SHEETS.CANDIDATES);
  var attempts = DatabaseService.findAll(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS);
  var videoProfiles = DatabaseService.findAll(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES);
  var videoInterviews = DatabaseService.findAll(CONFIG.SHEETS.VIDEO_INTERVIEWS);
  var reports = DatabaseService.findAll(CONFIG.SHEETS.FINAL_REPORTS);
  var jobs = DatabaseService.findAll(CONFIG.SHEETS.JOBS);

  if (orgId) {
    candidates = candidates.filter(function(c) { return c.Organization_ID === orgId; });
    jobs = jobs.filter(function(j) { return j.Organization_ID === orgId; });
  }

  var completedAssessments = attempts.filter(function(a) { return a.Status === 'COMPLETED'; }).length;
  var completedInterviews = videoInterviews.filter(function(v) { return v.Status === 'COMPLETED'; }).length;

  return {
    totalCandidates: candidates.length,
    totalJobs: jobs.length,
    totalAssessments: attempts.length,
    completedAssessments: completedAssessments,
    totalVideoProfiles: videoProfiles.length,
    totalVideoInterviews: videoInterviews.length,
    completedInterviews: completedInterviews,
    totalReports: reports.length
  };
}
