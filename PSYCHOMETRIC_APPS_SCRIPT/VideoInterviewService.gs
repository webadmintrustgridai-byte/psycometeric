/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * VideoInterviewService.gs - One-Way & Structured Video Interview Lifecycle
 */

var VideoInterviewService = {
  /**
   * Create or Assign a Structured Video Interview
   */
  assignInterview: function(candidateId, jobId, orgId, questionIds, title, creatorUserId) {
    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId);
    if (!candidate) throw new Error('Candidate not found.');

    var all = DatabaseService.findAll(CONFIG.SHEETS.VIDEO_INTERVIEWS);
    var interviewId = Utils.generateId(CONFIG.PREFIXES.VID_INTERVIEW, all.length + 1);
    var token = Utils.generateSecureToken(32);

    var expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    var interview = {
      Interview_ID: interviewId,
      Candidate_ID: candidateId,
      Job_ID: jobId || '',
      Organization_ID: orgId || candidate.Organization_ID,
      Title: title || 'Structured Competency Video Interview',
      Questions_List_JSON: JSON.stringify(questionIds || []),
      Status: 'PENDING',
      Invitation_Token: token,
      Expires_At: expiresAt.toISOString(),
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.VIDEO_INTERVIEWS, interview);

    AuditService.logEvent(candidate.Organization_ID, creatorUserId, 'VIDEO_INTERVIEW_ASSIGNED', 'INTERVIEW', interviewId, {
      candidateId: candidateId,
      questionCount: (questionIds || []).length
    });

    return interview;
  },

  /**
   * Get Interview Details and Questions for Candidate Session
   */
  getInterviewSession: function(token) {
    var interview = DatabaseService.findOne(CONFIG.SHEETS.VIDEO_INTERVIEWS, 'Invitation_Token', token);
    if (!interview) {
      throw new Error('Invalid video interview invitation token.');
    }
    if (interview.Status === 'COMPLETED') {
      throw new Error('This video interview has already been submitted.');
    }

    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', interview.Candidate_ID);
    var questionIds = Utils.safeJsonParse(interview.Questions_List_JSON, []);

    var questions = [];
    if (questionIds.length > 0) {
      questions = DatabaseService.findAll(CONFIG.SHEETS.VIDEO_QUESTIONS, function(q) {
        return questionIds.indexOf(q.Video_Question_ID) !== -1;
      });
    } else {
      // Default standard competency questions if none explicitly attached
      questions = DatabaseService.findAll(CONFIG.SHEETS.VIDEO_QUESTIONS).slice(0, 5);
    }

    var existingResponses = DatabaseService.findBy(CONFIG.SHEETS.VIDEO_RESPONSES, 'Interview_ID', interview.Interview_ID);

    return {
      interview: interview,
      candidate: candidate,
      questions: questions,
      completedResponses: existingResponses
    };
  },

  /**
   * Save Candidate Video Response for a specific question
   */
  saveVideoResponse: function(interviewId, candidateId, questionId, videoData) {
    var all = DatabaseService.findAll(CONFIG.SHEETS.VIDEO_RESPONSES);
    var responseId = Utils.generateId(CONFIG.PREFIXES.VID_RESPONSE, all.length + 1);

    var record = {
      Video_Response_ID: responseId,
      Interview_ID: interviewId,
      Candidate_ID: candidateId,
      Video_Question_ID: questionId,
      Video_Source_Type: videoData.Source_Type || 'RECORD',
      Video_File_ID: videoData.File_ID || '',
      Video_URL: videoData.Video_URL || '',
      Thumbnail_URL: videoData.Thumbnail_URL || '',
      Duration_Seconds: videoData.Duration_Seconds || 0,
      Retake_Count: videoData.Retake_Count || 0,
      Status: 'SUBMITTED',
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.VIDEO_RESPONSES, record);

    // Trigger AI transcription asynchronously or synchronously
    try {
      AIEvaluationService.processVideoResponse(responseId, record);
    } catch (e) {
      Logger.log('AI processing queued or deferred: ' + e.message);
    }

    return record;
  },

  /**
   * Complete entire interview
   */
  completeInterview: function(interviewId, candidateId) {
    var updated = DatabaseService.update(CONFIG.SHEETS.VIDEO_INTERVIEWS, 'Interview_ID', interviewId, {
      Status: 'COMPLETED'
    });
    AuditService.logEvent(updated.Organization_ID, candidateId, 'VIDEO_INTERVIEW_COMPLETED', 'INTERVIEW', interviewId, {});
    return updated;
  }
};
