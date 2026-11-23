/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * HumanEvaluationService.gs - Evaluator Scorecard, Reviewer Overrides & Feedback
 */

var HumanEvaluationService = {
  /**
   * Submit Human Evaluator Rating & Feedback
   */
  submitEvaluation: function(interviewId, candidateId, evaluatorId, evaluationsList) {
    if (!evaluationsList || evaluationsList.length === 0) {
      throw new Error('At least one competency rating is required.');
    }

    var records = [];
    for (var i = 0; i < evaluationsList.length; i++) {
      var ev = evaluationsList[i];
      var evalRecord = {
        Human_Eval_ID: Utils.generateId(CONFIG.PREFIXES.HUMAN_EVAL),
        Interview_ID: interviewId,
        Candidate_ID: candidateId,
        Evaluator_ID: evaluatorId,
        Competency: ev.Competency,
        Score_1_to_5: ev.Score_1_to_5 || 3,
        Feedback: ev.Feedback || '',
        Strengths: ev.Strengths || '',
        Areas_For_Improvement: ev.Areas_For_Improvement || '',
        Recommendation: ev.Recommendation || 'SHORTLIST', // SHORTLIST, HOLD, REJECT
        Created_At: Utils.getIsoTimestamp()
      };
      records.push(evalRecord);
    }

    DatabaseService.batchInsert(CONFIG.SHEETS.HUMAN_EVALUATIONS, records);

    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId);
    AuditService.logEvent(
      candidate ? candidate.Organization_ID : '',
      evaluatorId,
      'HUMAN_EVALUATION_SUBMITTED',
      'INTERVIEW',
      interviewId,
      { candidateId: candidateId, ratingsCount: records.length }
    );

    return records;
  },

  /**
   * Get all human evaluations for a candidate
   */
  getEvaluationsByCandidate: function(candidateId) {
    return DatabaseService.findBy(CONFIG.SHEETS.HUMAN_EVALUATIONS, 'Candidate_ID', candidateId);
  }
};
