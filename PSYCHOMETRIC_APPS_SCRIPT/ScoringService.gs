/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * ScoringService.gs - Psychometric Trait, Aptitude & SJT Rubric Calculation Engine
 */

var ScoringService = {
  /**
   * Calculate all subcategory scores, trait percentiles, and STEN scores for an attempt
   */
  calculateAttemptScores: function(attemptId) {
    var attempt = DatabaseService.findOne(CONFIG.SHEETS.ASSESSMENT_ATTEMPTS, 'Attempt_ID', attemptId);
    if (!attempt) throw new Error('Attempt not found.');

    var candidate = DatabaseService.findOne(CONFIG.SHEETS.CANDIDATES, 'Candidate_ID', attempt.Candidate_ID);
    var responses = DatabaseService.findBy(CONFIG.SHEETS.RESPONSES, 'Attempt_ID', attemptId);

    var categoryScores = {
      PERSONALITY: { raw: 0, max: 0, traits: {} },
      APTITUDE: { raw: 0, max: 0, subcategories: {} },
      COGNITIVE: { raw: 0, max: 0 },
      SITUATIONAL_JUDGEMENT: { raw: 0, max: 0, competencies: {} }
    };

    var totalEarned = 0;
    var totalPossible = 0;

    for (var i = 0; i < responses.length; i++) {
      var resp = responses[i];
      var question = DatabaseService.findOne(CONFIG.SHEETS.QUESTION_BANK, 'Question_ID', resp.Question_ID);
      if (!question) continue;

      var category = question.Category || 'GENERAL';
      var subcat = question.Subcategory || 'GENERAL';
      var pts = parseFloat(resp.Points_Earned || 0);

      if (category === 'PERSONALITY') {
        if (!categoryScores.PERSONALITY.traits[subcat]) {
          categoryScores.PERSONALITY.traits[subcat] = { raw: 0, count: 0 };
        }
        categoryScores.PERSONALITY.traits[subcat].raw += pts;
        categoryScores.PERSONALITY.traits[subcat].count += 1;
        categoryScores.PERSONALITY.raw += pts;
        categoryScores.PERSONALITY.max += 5; // standard 5-point Likert
      } else if (category === 'APTITUDE') {
        if (!categoryScores.APTITUDE.subcategories[subcat]) {
          categoryScores.APTITUDE.subcategories[subcat] = { correct: 0, total: 0, points: 0 };
        }
        var maxPts = parseFloat(question.Points || 1);
        categoryScores.APTITUDE.subcategories[subcat].total += 1;
        categoryScores.APTITUDE.max += maxPts;
        totalPossible += maxPts;

        if (resp.Is_Correct === 'TRUE' || resp.Is_Correct === true) {
          categoryScores.APTITUDE.subcategories[subcat].correct += 1;
          categoryScores.APTITUDE.subcategories[subcat].points += pts;
          categoryScores.APTITUDE.raw += pts;
          totalEarned += pts;
        }
      } else if (category === 'SITUATIONAL_JUDGEMENT') {
        if (!categoryScores.SITUATIONAL_JUDGEMENT.competencies[subcat]) {
          categoryScores.SITUATIONAL_JUDGEMENT.competencies[subcat] = { raw: 0, max: 0 };
        }
        categoryScores.SITUATIONAL_JUDGEMENT.competencies[subcat].raw += pts;
        categoryScores.SITUATIONAL_JUDGEMENT.competencies[subcat].max += 5;
        categoryScores.SITUATIONAL_JUDGEMENT.raw += pts;
        categoryScores.SITUATIONAL_JUDGEMENT.max += 5;
        totalEarned += pts;
        totalPossible += 5;
      }
    }

    // Save individual trait scores to DB_11_Scores
    var scoreRecords = [];

    // Personality Traits (Big Five)
    for (var trait in categoryScores.PERSONALITY.traits) {
      var tData = categoryScores.PERSONALITY.traits[trait];
      var avgLikert = tData.count > 0 ? (tData.raw / tData.count) : 3;
      var sten = Math.min(10, Math.max(1, Math.round(avgLikert * 2))); // 1-10 STEN scale
      var percentile = Math.min(99, Math.max(1, Math.round((avgLikert / 5) * 100)));

      var interpretation = this.getTraitInterpretation(trait, sten);

      var sRecord = {
        Score_ID: Utils.generateId(CONFIG.PREFIXES.SCORE),
        Attempt_ID: attemptId,
        Candidate_ID: attempt.Candidate_ID,
        Category: 'PERSONALITY',
        Trait_Name: trait,
        Raw_Score: tData.raw,
        Normalized_Score: Math.round(avgLikert * 20), // 0-100%
        Sten_Score: sten,
        Interpretation: interpretation,
        Percentile: percentile,
        Created_At: Utils.getIsoTimestamp()
      };
      scoreRecords.push(sRecord);
    }

    // Aptitude Subcategories
    for (var sub in categoryScores.APTITUDE.subcategories) {
      var aData = categoryScores.APTITUDE.subcategories[sub];
      var pct = aData.total > 0 ? Math.round((aData.points / aData.total) * 100) : 0;
      var aptSten = Math.min(10, Math.max(1, Math.round((pct / 100) * 9 + 1)));

      scoreRecords.push({
        Score_ID: Utils.generateId(CONFIG.PREFIXES.SCORE),
        Attempt_ID: attemptId,
        Candidate_ID: attempt.Candidate_ID,
        Category: 'APTITUDE',
        Trait_Name: sub,
        Raw_Score: aData.points,
        Normalized_Score: pct,
        Sten_Score: aptSten,
        Interpretation: pct >= 70 ? 'High Proficiency' : (pct >= 40 ? 'Moderate Proficiency' : 'Requires Development'),
        Percentile: pct,
        Created_At: Utils.getIsoTimestamp()
      });
    }

    // Batch insert scores
    DatabaseService.batchInsert(CONFIG.SHEETS.SCORES, scoreRecords);

    var overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 75;

    return {
      attemptId: attemptId,
      candidate: candidate,
      totalScore: totalEarned,
      totalPossible: totalPossible,
      percentageScore: overallPercentage,
      categoryScores: categoryScores,
      traitScores: scoreRecords
    };
  },

  /**
   * Behavioural interpretation based on trait STEN scores
   */
  getTraitInterpretation: function(trait, sten) {
    var high = sten >= 7;
    var low = sten <= 4;

    switch (trait.toUpperCase()) {
      case 'OPENNESS':
        return high ? 'Highly creative, intellectually curious, thrives on innovation and change.' :
               low ? 'Pragmatic, conventional, prefers tested methods and established processes.' :
               'Balanced between innovation and pragmatic execution.';
      case 'CONSCIENTIOUSNESS':
        return high ? 'Exceptional attention to detail, highly disciplined, reliable, and goal-oriented.' :
               low ? 'Flexible, spontaneous, may benefit from structured workflows and milestones.' :
               'Dependable with practical flexibility in task execution.';
      case 'EXTRAVERSION':
        return high ? 'Outgoing, energetic, communicative, highly collaborative in cross-functional teams.' :
               low ? 'Reflective, independent, excels in focused deep work and measured communication.' :
               'Adaptable communication style balancing group and individual tasks.';
      case 'AGREEABLENESS':
        return high ? 'Empathetic, highly cooperative, excels at building trust and resolving team conflict.' :
               low ? 'Competitive, skeptical, prioritizes objective metrics over subjective consensus.' :
               'Constructive collaborator who balances empathy with critical evaluation.';
      case 'EMOTIONAL_STABILITY':
        return high ? 'Resilient under high pressure, calm during crisis, steady decision-maker.' :
               low ? 'Passionate, highly responsive to stress, thrives with proactive support.' :
               'Maintains composure in standard workplace high-pressure situations.';
      default:
        return 'Demonstrates steady workplace alignment with solid development potential.';
    }
  }
};
