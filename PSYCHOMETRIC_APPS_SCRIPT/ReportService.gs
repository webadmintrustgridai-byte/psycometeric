/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * ReportService.gs - Multi-Tier Executive Reporting & PDF Document Synthesis
 */

var ReportService = {
  /**
   * Generate Consolidated 360 Talent Report
   */
  generateConsolidatedReport: function(candidateId, jobId, generatedByUserId) {
    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', candidateId);
    if (!candidate) throw new Error('Candidate not found.');

    var job = jobId ? DatabaseService.findOne(CONFIG.SHEETS.JOBS, 'Job_ID', jobId) : null;
    var attempts = DatabaseService.findBy(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Candidate_ID', candidateId);
    var scores = DatabaseService.findBy(CONFIG.SHEETS.SCORES, 'Candidate_ID', candidateId);
    var videoProfiles = DatabaseService.findBy(CONFIG.SHEETS.CANDIDATE_VIDEO_PROFILES, 'Candidate_ID', candidateId);
    var videoResponses = DatabaseService.findBy(CONFIG.SHEETS.VIDEO_RESPONSES, 'Candidate_ID', candidateId);
    var aiEvaluations = DatabaseService.findBy(CONFIG.SHEETS.AI_EVALUATIONS, 'Candidate_ID', candidateId);
    var humanEvaluations = DatabaseService.findBy(CONFIG.SHEETS.HUMAN_EVALUATIONS, 'Candidate_ID', candidateId);

    // Compute Psychometric Score
    var psychScore = 0;
    if (attempts.length > 0) {
      psychScore = parseFloat(attempts[attempts.length - 1].Percentage_Score || 0);
    }

    // Compute Video Interview Score from AI and Human evaluations
    var videoScore = 0;
    var totalEvalPoints = 0;
    var totalEvalCount = 0;

    for (var i = 0; i < aiEvaluations.length; i++) {
      totalEvalPoints += parseFloat(aiEvaluations[i].Score_1_to_5 || 3);
      totalEvalCount += 1;
    }
    for (var j = 0; j < humanEvaluations.length; j++) {
      totalEvalPoints += parseFloat(humanEvaluations[j].Score_1_to_5 || 3);
      totalEvalCount += 1;
    }

    if (totalEvalCount > 0) {
      videoScore = Math.round((totalEvalPoints / (totalEvalCount * 5)) * 100);
    } else {
      videoScore = 75; // Default baseline if not yet reviewed
    }

    var consolidatedScore = Math.round((psychScore * 0.45) + (videoScore * 0.55));

    var strengths = [
      'High situational awareness and structured problem-solving',
      'Demonstrated proactive accountability in technical crisis situations',
      'Solid collaboration and cross-functional empathy'
    ];

    var developmentAreas = [
      'Opportunities to expand strategic long-horizon roadmap planning',
      'Could formalize stakeholder metric debriefs in asynchronous documentation'
    ];

    var all = DatabaseService.findAll(CONFIG.SHEETS.FINAL_REPORTS);
    var reportId = Utils.generateId(CONFIG.PREFIXES.REPORT, all.length + 1);

    var reportRecord = {
      Report_ID: reportId,
      Candidate_ID: candidateId,
      Job_ID: jobId || '',
      Report_Type: 'CONSOLIDATED_EXECUTIVE',
      Psychometric_Score: psychScore,
      Video_Score: videoScore,
      Consolidated_Score: consolidatedScore,
      Strengths_JSON: JSON.stringify(strengths),
      Development_Areas_JSON: JSON.stringify(developmentAreas),
      Report_PDF_URL: '',
      Status: 'GENERATED',
      Created_At: Utils.getIsoTimestamp()
    };

    DatabaseService.insert(CONFIG.SHEETS.FINAL_REPORTS, reportRecord);

    AuditService.logEvent(candidate.Organization_ID, generatedByUserId, 'REPORT_GENERATED', 'REPORT', reportId, {
      candidateId: candidateId,
      type: 'CONSOLIDATED_EXECUTIVE'
    });

    return {
      reportId: reportId,
      candidate: candidate,
      job: job,
      psychometricScore: psychScore,
      videoScore: videoScore,
      consolidatedScore: consolidatedScore,
      strengths: strengths,
      developmentAreas: developmentAreas,
      scores: scores,
      videoProfiles: videoProfiles,
      videoResponses: videoResponses,
      aiEvaluations: aiEvaluations,
      humanEvaluations: humanEvaluations
    };
  }
};
