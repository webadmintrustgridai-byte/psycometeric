/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * scoringEngine.ts - Server-Authoritative Scoring Engine for 3 Consolidated Assessments
 * - Assessment 1: Aptitude Assessment (30 Questions, 30 Marks)
 * - Assessment 2: Test of Comprehension (30 Questions, 30 Marks)
 * - Assessment 3: Emotional Intelligence & Situational Reaction (30 Questions, 30 Marks)
 */

import { QuestionBankItem, ScoreRecord, AssessmentResult } from '../types';

export interface AssessmentCalculationResult {
  totalScore: number;
  totalPossible: number;
  percentageScore: number;
  sectionResults: {
    sectionName: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
  }[];
  traitScores: ScoreRecord[];
  strengths: string[];
  developmentAreas: string[];
}

export const ScoringEngine = {
  /**
   * Authoritatively score an assessment attempt
   */
  calculateAssessmentScore(
    attemptId: string,
    candidateId: string,
    assessmentId: string,
    questions: QuestionBankItem[],
    responses: Record<string, { selectedAnswer?: 'A' | 'B' | 'C' | 'D' | ''; timeTakenSeconds?: number }>
  ): AssessmentCalculationResult {
    let totalScore = 0;
    const totalPossible = questions.length; // 30 questions = 30 marks

    const sectionMap: Record<string, { total: number; correct: number; score: number }> = {};

    for (const q of questions) {
      const section = q.Section_Name || 'General';
      if (!sectionMap[section]) {
        sectionMap[section] = { total: 0, correct: 0, score: 0 };
      }
      sectionMap[section].total += 1;

      const resp = responses[q.Question_ID];
      const selected = resp?.selectedAnswer;

      if (assessmentId === 'ASM_EI_SITUATIONAL') {
        // Assessment 3: Emotional Intelligence & Situational Judgment
        // Weights: A:5, B:2, C:1, D:1 -> scaled to 1 mark per question (weight / 5)
        if (selected && q.Option_Weights) {
          const weight = q.Option_Weights[selected] || 1;
          const markAwarded = weight >= 4 ? 1 : weight >= 3 ? 0.75 : weight >= 2 ? 0.5 : 0.25;
          sectionMap[section].score += markAwarded;
          totalScore += markAwarded;
          if (weight >= 4) {
            sectionMap[section].correct += 1;
          }
        } else if (selected === q.Correct_Answer) {
          sectionMap[section].score += 1;
          sectionMap[section].correct += 1;
          totalScore += 1;
        }
      } else {
        // Assessment 1 (Aptitude) & Assessment 2 (Comprehension)
        // 1 mark per correct answer, 0 for incorrect/unanswered (negative marking disabled)
        if (selected && selected === q.Correct_Answer) {
          sectionMap[section].score += (q.Marks || 1);
          sectionMap[section].correct += 1;
          totalScore += (q.Marks || 1);
        }
      }
    }

    const roundedTotalScore = Math.round(totalScore * 10) / 10;
    const percentageScore = totalPossible > 0 ? Math.round((roundedTotalScore / totalPossible) * 100) : 0;

    const sectionResults = Object.entries(sectionMap).map(([sectionName, stats]) => ({
      sectionName,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      score: Math.round(stats.score * 10) / 10
    }));

    // Generate behavioral trait scores / STEN for campus decision support
    const traitScores: ScoreRecord[] = sectionResults.map(s => {
      const pct = s.totalQuestions > 0 ? Math.round((s.score / s.totalQuestions) * 100) : 50;
      const sten = Math.min(10, Math.max(1, Math.round((pct / 100) * 9 + 1)));
      return {
        Score_ID: `SCR_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        Attempt_ID: attemptId,
        Candidate_ID: candidateId,
        Category: assessmentId as any,
        Trait_Name: s.sectionName,
        Raw_Score: s.score,
        Normalized_Score: pct,
        Sten_Score: sten,
        Interpretation: this.getSectionInterpretation(assessmentId, s.sectionName, pct),
        Percentile: Math.min(99, Math.max(1, pct)),
        Created_At: new Date().toISOString()
      };
    });

    const strengths = this.getStrengths(assessmentId, percentageScore);
    const developmentAreas = this.getDevelopmentAreas(assessmentId, percentageScore);

    return {
      totalScore: roundedTotalScore,
      totalPossible,
      percentageScore,
      sectionResults,
      traitScores,
      strengths,
      developmentAreas
    };
  },

  getSectionInterpretation(assessmentId: string, section: string, pct: number): string {
    if (pct >= 80) {
      return `Exemplary performance (${pct}%) demonstrating mastery and high analytical precision.`;
    } else if (pct >= 60) {
      return `Solid operational competency (${pct}%) meeting campus engineering benchmark standards.`;
    } else {
      return `Developing foundational capability (${pct}%) with opportunities for targeted mentorship.`;
    }
  },

  getStrengths(assessmentId: string, pct: number): string[] {
    if (assessmentId === 'ASM_APTITUDE') {
      return [
        'Robust quantitative reasoning and systematic problem decomposition',
        'Strong inductive and deductive logical deduction under timed constraints',
        'High analytical precision in abstract and critical thinking exercises'
      ];
    } else if (assessmentId === 'ASM_COMPREHENSION') {
      return [
        'High textual synthesis and nuanced technical documentation comprehension',
        'Accurate extraction of foundational concepts and authorial tone',
        'Strong vocabulary inference and critical contextual deduction'
      ];
    } else {
      return [
        'High emotional self-regulation and de-escalation in high-pressure war rooms',
        'Collaborative cross-functional communication and constructive dissent management',
        'Ethical decision-making and commitment to systemic quality guardrails'
      ];
    }
  },

  getDevelopmentAreas(assessmentId: string, pct: number): string[] {
    if (assessmentId === 'ASM_APTITUDE') {
      return [
        'Accelerate speed on complex non-linear algebra and multi-tier data interpretations',
        'Maintain consistent validation checkpoints during high-speed calculations'
      ];
    } else if (assessmentId === 'ASM_COMPREHENSION') {
      return [
        'Enhance speed on dense multidisciplinary sociotechnical texts',
        'Distinguish nuanced counterfactual implications from direct empirical statements'
      ];
    } else {
      return [
        'Further expand comfort with ambiguous stakeholder requirements',
        'Continuously document trade-offs asynchronously for distributed engineering squads'
      ];
    }
  },

  // Backward compatibility wrapper for old components
  calculateScores(
    attemptId: string,
    candidateId: string,
    questions: any[],
    responses: Record<string, { selectedOptionId?: string; selectedAnswer?: any; value?: any; timeTaken?: number }>
  ) {
    const formattedResponses: Record<string, { selectedAnswer?: 'A' | 'B' | 'C' | 'D' | ''; timeTakenSeconds?: number }> = {};
    for (const [qid, r] of Object.entries(responses)) {
      let ans: any = r.selectedAnswer;
      if (!ans && r.selectedOptionId) {
        if (r.selectedOptionId.endsWith('_A')) ans = 'A';
        else if (r.selectedOptionId.endsWith('_B')) ans = 'B';
        else if (r.selectedOptionId.endsWith('_C')) ans = 'C';
        else if (r.selectedOptionId.endsWith('_D')) ans = 'D';
      }
      formattedResponses[qid] = {
        selectedAnswer: ans || '',
        timeTakenSeconds: r.timeTaken || 0
      };
    }
    const assessmentId = questions[0]?.Assessment_ID || 'ASM_APTITUDE';
    return this.calculateAssessmentScore(attemptId, candidateId, assessmentId, questions, formattedResponses);
  }
};
