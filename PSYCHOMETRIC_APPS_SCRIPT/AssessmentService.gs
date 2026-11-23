/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * AssessmentService.gs - Psychometric Test Life-Cycle & Attempt Management
 */

var AssessmentService = {
  /**
   * Create or update Assessment Template
   */
  createTemplate: function(data, creatorUserId) {
    var all = DatabaseService.findAll(CONFIG.SHEETS.ASSESSMENT_TEMPLATES);
    var templateId = Utils.generateId(CONFIG.PREFIXES.TEMPLATE, all.length + 1);

    var template = {
      Template_ID: templateId,
      Organization_ID: data.Organization_ID,
      Title: data.Title,
      Assessment_Type: data.Assessment_Type || 'COMPREHENSIVE_PSYCHOMETRIC',
      Categories_JSON: JSON.stringify(data.Categories || []),
      Time_Limit_Minutes: data.Time_Limit_Minutes || 45,
      Passing_Score: data.Passing_Score || 60,
      Total_Marks: data.Total_Marks || 100,
      Adaptive_Enabled: data.Adaptive_Enabled ? 'TRUE' : 'FALSE',
      Negative_Marking: data.Negative_Marking ? 'TRUE' : 'FALSE',
      Status: 'ACTIVE',
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.ASSESSMENT_TEMPLATES, template);
    AuditService.logEvent(data.Organization_ID, creatorUserId, 'ASSESSMENT_TEMPLATE_CREATED', 'TEMPLATE', templateId, { title: data.Title });
    return template;
  },

  /**
   * Assign Assessment to Candidate
   */
  assignAssessment: function(candidateId, templateId, jobId, expiryDays, creatorUserId) {
    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId);
    if (!candidate) throw new Error('Candidate not found.');

    var template = DatabaseService.findOne(CONFIG.SHEETS.ASSESSMENT_TEMPLATES, 'Template_ID', templateId);
    if (!template) throw new Error('Assessment template not found.');

    var all = DatabaseService.findAll(CONFIG.SHEETS.ASSESSMENT_INVITATIONS);
    var invitationId = Utils.generateId(CONFIG.PREFIXES.INVITATION, all.length + 1);
    var token = Utils.generateSecureToken(32);

    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 7));

    var invitation = {
      Invitation_ID: invitationId,
      Candidate_ID: candidateId,
      Template_ID: templateId,
      Job_ID: jobId || '',
      Invitation_Token: token,
      Expiry_Date: expiryDate.toISOString(),
      Status: 'PENDING',
      Attempts_Allowed: 1,
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.ASSESSMENT_INVITATIONS, invitation);

    // Send invitation email if configured
    EmailService.sendAssessmentInvitation(candidate, template, token, invitationId);

    AuditService.logEvent(candidate.Organization_ID, creatorUserId, 'ASSESSMENT_ASSIGNED', 'INVITATION', invitationId, {
      candidateId: candidateId,
      templateId: templateId
    });

    return invitation;
  },

  /**
   * Start an assessment attempt
   */
  startAttempt: function(invitationToken) {
    var verification = AuthService.verifyInvitationToken(invitationToken);
    var inv = verification.invitation;

    // Check if attempt already exists
    var existingAttempts = DatabaseService.findBy(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Invitation_ID', inv.Invitation_ID);
    if (existingAttempts.length > 0) {
      var latest = existingAttempts[existingAttempts.length - 1];
      if (latest.Status === 'IN_PROGRESS') {
        return {
          attempt: latest,
          template: verification.template,
          candidate: verification.candidate,
          isResume: true
        };
      }
      if (latest.Status === 'COMPLETED') {
        throw new Error('This assessment has already been completed.');
      }
    }

    var allAttempts = DatabaseService.findAll(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS);
    var attemptId = Utils.generateId(CONFIG.PREFIXES.ATTEMPT, allAttempts.length + 1);

    var newAttempt = {
      Attempt_ID: attemptId,
      Invitation_ID: inv.Invitation_ID,
      Candidate_ID: inv.Candidate_ID,
      Template_ID: inv.Template_ID,
      Start_Time: Utils.getIsoTimestamp(),
      End_Time: '',
      Time_Spent_Seconds: 0,
      Status: 'IN_PROGRESS',
      Total_Score: 0,
      Percentage_Score: 0,
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, newAttempt);

    // Update invitation status
    DatabaseService.update(CONFIG.SHEETS.ASSESSMENT_INVITATIONS, 'Invitation_ID', inv.Invitation_ID, {
      Status: 'IN_PROGRESS'
    });

    return {
      attempt: newAttempt,
      template: verification.template,
      candidate: verification.candidate,
      isResume: false
    };
  },

  /**
   * Save individual question response (Auto-save)
   */
  saveResponse: function(attemptId, candidateId, questionId, selectedOptionId, responseValue, timeTakenSeconds) {
    var existing = DatabaseService.findAll(CONFIG.SHEETS.RESPONSES, function(r) {
      return r.Attempt_ID === attemptId && r.Question_ID === questionId;
    });

    // Check question and option for correctness / trait weight
    var question = DatabaseService.findOne(CONFIG.SHEETS.QUESTION_BANK, 'Question_ID', questionId);
    var option = selectedOptionId ? DatabaseService.findOne(CONFIG.SHEETS.QUESTION_OPTIONS, 'Option_ID', selectedOptionId) : null;

    var isCorrect = false;
    var pointsEarned = 0;

    if (question && question.Category === 'APTITUDE') {
      if (option && (option.Is_Correct === true || option.Is_Correct === 'TRUE' || option.Is_Correct === 1)) {
        isCorrect = true;
        pointsEarned = parseFloat(question.Points || 1);
      }
    } else if (option && option.Trait_Weight) {
      pointsEarned = parseFloat(option.Trait_Weight);
    } else if (responseValue !== undefined) {
      pointsEarned = parseFloat(responseValue);
    }

    if (existing.length > 0) {
      // Update existing response
      return DatabaseService.update(CONFIG.SHEETS.RESPONSES, 'Response_ID', existing[0].Response_ID, {
        Selected_Option_ID: selectedOptionId || '',
        Response_Value: responseValue !== undefined ? responseValue : '',
        Time_Taken_Seconds: timeTakenSeconds || 0,
        Is_Correct: isCorrect ? 'TRUE' : 'FALSE',
        Points_Earned: pointsEarned,
        Updated_At: Utils.getIsoTimestamp()
      });
    }

    var all = DatabaseService.findAll(CONFIG.SHEETS.RESPONSES);
    var responseId = Utils.generateId(CONFIG.PREFIXES.RESPONSE, all.length + 1);

    var record = {
      Response_ID: responseId,
      Attempt_ID: attemptId,
      Candidate_ID: candidateId,
      Question_ID: questionId,
      Selected_Option_ID: selectedOptionId || '',
      Response_Value: responseValue !== undefined ? responseValue : '',
      Time_Taken_Seconds: timeTakenSeconds || 0,
      Is_Correct: isCorrect ? 'TRUE' : 'FALSE',
      Points_Earned: pointsEarned,
      Created_At: Utils.getIsoTimestamp()
    };

    return DatabaseService.insert(CONFIG.SHEETS.RESPONSES, record);
  },

  /**
   * Finalize and submit assessment
   */
  submitAssessment: function(attemptId, timeSpentSeconds) {
    var attempt = DatabaseService.findOne(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Attempt_ID', attemptId);
    if (!attempt) throw new Error('Attempt not found.');

    var now = Utils.getIsoTimestamp();

    // Calculate score using ScoringService
    var scoreResult = ScoringService.calculateAttemptScores(attemptId);

    // Update Attempt record
    DatabaseService.update(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Attempt_ID', attemptId, {
      End_Time: now,
      Time_Spent_Seconds: timeSpentSeconds || attempt.Time_Spent_Seconds,
      Status: 'COMPLETED',
      Total_Score: scoreResult.totalScore,
      Percentage_Score: scoreResult.percentageScore,
      Updated_At: now
    });

    // Update invitation status
    if (attempt.Invitation_ID) {
      DatabaseService.update(CONFIG.SHEETS.ASSESSMENT_INVITATIONS, 'Invitation_ID', attempt.Invitation_ID, {
        Status: 'COMPLETED'
      });
    }

    AuditService.logEvent(
      scoreResult.candidate ? scoreResult.candidate.Organization_ID : '',
      attempt.Candidate_ID,
      'ASSESSMENT_COMPLETED',
      'ATTEMPT',
      attemptId,
      { totalScore: scoreResult.totalScore, percentage: scoreResult.percentageScore }
    );

    return {
      attemptId: attemptId,
      status: 'COMPLETED',
      scores: scoreResult
    };
  }
};
