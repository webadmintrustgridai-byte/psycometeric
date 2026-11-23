/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * Seed Data for 9 Integrated Psychometric & Aptitude Assessments
 */

import {
  Organization,
  User,
  Candidate,
  AssessmentTemplate,
  Question,
  ScoreRecord,
  FinalReport
} from '../types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    Organization_ID: 'ORG_000001',
    Org_Name: 'TRUSTGRID Systems',
    Domain: 'trustgrid.ai',
    Created_At: '2026-01-10T09:00:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    User_ID: 'USR_ADMIN_001',
    Organization_ID: 'ORG_000001',
    Full_Name: 'Poojasri',
    Email: 'poojasri@trustgrid.ai',
    Role: 'ADMIN',
    Status: 'ACTIVE',
    Created_At: '2026-01-10T09:05:00Z'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [];

export const INITIAL_ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  {
    Template_ID: 'TMP_000001',
    Organization_ID: 'ORG_000001',
    Title: 'Comprehensive 9-Domain Psychometric & Aptitude Battery',
    Categories: [
      'APTITUDE',
      'LOGICAL_REASONING',
      'VERBAL_REASONING',
      'PERSONALITY',
      'EMOTIONAL_INTELLIGENCE',
      'SITUATIONAL_JUDGEMENT',
      'COMMUNICATION_SKILLS',
      'LEARNING_AGILITY',
      'THEMATIC_APPERCEPTION'
    ],
    Time_Limit_Minutes: 30,
    Passing_Score: 65,
    Total_Marks: 100,
    Adaptive_Enabled: true,
    Status: 'ACTIVE',
    Created_At: '2026-02-10T10:00:00Z'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. APTITUDE TEST (Numerical & Quantitative MCQ)
  {
    Question_ID: 'QUE_APT_001',
    Organization_ID: 'ORG_000001',
    Category: 'APTITUDE',
    Subcategory: 'Quantitative Reasoning',
    Question_Type: 'MCQ',
    Difficulty: 'MEDIUM',
    Question_Text: 'A cloud infrastructure cluster reduced query latency by 25% following index optimization. If the original average response time was 360ms, what is the new average response time?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_APT_01', Question_ID: 'QUE_APT_001', Option_Text: '270 ms', Is_Correct: true, Order_Index: 1 },
      { Option_ID: 'OPT_APT_02', Question_ID: 'QUE_APT_001', Option_Text: '280 ms', Is_Correct: false, Order_Index: 2 },
      { Option_ID: 'OPT_APT_03', Question_ID: 'QUE_APT_001', Option_Text: '290 ms', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_APT_04', Question_ID: 'QUE_APT_001', Option_Text: '300 ms', Is_Correct: false, Order_Index: 4 }
    ]
  },
  {
    Question_ID: 'QUE_APT_002',
    Organization_ID: 'ORG_000001',
    Category: 'APTITUDE',
    Subcategory: 'Data Interpretation & Ratios',
    Question_Type: 'MCQ',
    Difficulty: 'HARD',
    Question_Text: 'Server A handles 4,800 requests/sec with an error rate of 0.25%, while Server B handles 7,200 requests/sec with an error rate of 0.50%. Across both servers combined, what is the blended error percentage?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_APT_05', Question_ID: 'QUE_APT_002', Option_Text: '0.375%', Is_Correct: false, Order_Index: 1 },
      { Option_ID: 'OPT_APT_06', Question_ID: 'QUE_APT_002', Option_Text: '0.400%', Is_Correct: true, Order_Index: 2 },
      { Option_ID: 'OPT_APT_07', Question_ID: 'QUE_APT_002', Option_Text: '0.425%', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_APT_08', Question_ID: 'QUE_APT_002', Option_Text: '0.450%', Is_Correct: false, Order_Index: 4 }
    ]
  },

  // 2. LOGICAL REASONING TEST (MCQ)
  {
    Question_ID: 'QUE_LOG_001',
    Organization_ID: 'ORG_000001',
    Category: 'LOGICAL_REASONING',
    Subcategory: 'Sequence & Pattern Deduction',
    Question_Type: 'MCQ',
    Difficulty: 'MEDIUM',
    Question_Text: 'What number logically completes the series: 3, 7, 15, 31, 63, __?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_LOG_01', Question_ID: 'QUE_LOG_001', Option_Text: '95', Is_Correct: false, Order_Index: 1 },
      { Option_ID: 'OPT_LOG_02', Question_ID: 'QUE_LOG_001', Option_Text: '127', Is_Correct: true, Order_Index: 2 },
      { Option_ID: 'OPT_LOG_03', Question_ID: 'QUE_LOG_001', Option_Text: '128', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_LOG_04', Question_ID: 'QUE_LOG_001', Option_Text: '131', Is_Correct: false, Order_Index: 4 }
    ]
  },
  {
    Question_ID: 'QUE_LOG_002',
    Organization_ID: 'ORG_000001',
    Category: 'LOGICAL_REASONING',
    Subcategory: 'Syllogistic Logic',
    Question_Type: 'MCQ',
    Difficulty: 'HARD',
    Question_Text: 'Statement 1: All high-availability nodes replicate data synchronously.\nStatement 2: Some secure nodes replicate data synchronously.\nWhich conclusion is logically guaranteed?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_LOG_05', Question_ID: 'QUE_LOG_002', Option_Text: 'All secure nodes are high-availability nodes.', Is_Correct: false, Order_Index: 1 },
      { Option_ID: 'OPT_LOG_06', Question_ID: 'QUE_LOG_002', Option_Text: 'Some nodes that replicate synchronously are secure.', Is_Correct: true, Order_Index: 2 },
      { Option_ID: 'OPT_LOG_07', Question_ID: 'QUE_LOG_002', Option_Text: 'No high-availability nodes are secure.', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_LOG_08', Question_ID: 'QUE_LOG_002', Option_Text: 'All synchronous nodes are high-availability.', Is_Correct: false, Order_Index: 4 }
    ]
  },

  // 3. VERBAL REASONING TEST (MCQ)
  {
    Question_ID: 'QUE_VRB_001',
    Organization_ID: 'ORG_000001',
    Category: 'VERBAL_REASONING',
    Subcategory: 'Critical Textual Deduction',
    Question_Type: 'MCQ',
    Difficulty: 'MEDIUM',
    Question_Text: 'Passage: "Although premature optimization often obfuscates codebase maintainability, ignoring asymptotic time complexity during initial system design inevitably guarantees severe architectural redesign when concurrency surges."\nWhich deduction is most strongly supported?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_VRB_01', Question_ID: 'QUE_VRB_001', Option_Text: 'Code readability should always be sacrificed for performance.', Is_Correct: false, Order_Index: 1 },
      { Option_ID: 'OPT_VRB_02', Question_ID: 'QUE_VRB_001', Option_Text: 'Fundamental algorithmic scaling must be planned early without resorting to premature micromanagement.', Is_Correct: true, Order_Index: 2 },
      { Option_ID: 'OPT_VRB_03', Question_ID: 'QUE_VRB_001', Option_Text: 'Optimization is only relevant after production load fails.', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_VRB_04', Question_ID: 'QUE_VRB_001', Option_Text: 'High concurrency systems never require refactoring.', Is_Correct: false, Order_Index: 4 }
    ]
  },
  {
    Question_ID: 'QUE_VRB_002',
    Organization_ID: 'ORG_000001',
    Category: 'VERBAL_REASONING',
    Subcategory: 'Verbal Analogy',
    Question_Type: 'MCQ',
    Difficulty: 'EASY',
    Question_Text: 'EPHEMERAL is to PERMANENT as LATENT is to:',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_VRB_05', Question_ID: 'QUE_VRB_002', Option_Text: 'CONCEALED', Is_Correct: false, Order_Index: 1 },
      { Option_ID: 'OPT_VRB_06', Question_ID: 'QUE_VRB_002', Option_Text: 'MANIFEST', Is_Correct: true, Order_Index: 2 },
      { Option_ID: 'OPT_VRB_07', Question_ID: 'QUE_VRB_002', Option_Text: 'DORMANT', Is_Correct: false, Order_Index: 3 },
      { Option_ID: 'OPT_VRB_08', Question_ID: 'QUE_VRB_002', Option_Text: 'PASSIVE', Is_Correct: false, Order_Index: 4 }
    ]
  },

  // 4. PERSONALITY TEST (Likert 1-5 Big Five items)
  {
    Question_ID: 'QUE_PER_001',
    Organization_ID: 'ORG_000001',
    Category: 'PERSONALITY',
    Subcategory: 'Openness to Experience',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'I actively seek out novel methodologies, unconventional architectural paradigms, and experimental technologies to solve challenging problems.',
    Points: 5,
    Reverse_Scored: false
  },
  {
    Question_ID: 'QUE_PER_002',
    Organization_ID: 'ORG_000001',
    Category: 'PERSONALITY',
    Subcategory: 'Conscientiousness',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'I systematically organize project deliverables, double-check boundary test cases, and adhere strictly to agreed architectural commitments.',
    Points: 5,
    Reverse_Scored: false
  },
  {
    Question_ID: 'QUE_PER_003',
    Organization_ID: 'ORG_000001',
    Category: 'PERSONALITY',
    Subcategory: 'Emotional Stability',
    Question_Type: 'LIKERT_5',
    Difficulty: 'HARD',
    Question_Text: 'I maintain emotional composure and analytical clarity when unannounced production outages or conflicting executive mandates arise.',
    Points: 5,
    Reverse_Scored: false
  },

  // 5. EMOTIONAL INTELLIGENCE (EQ) TEST (Likert / Scenario EQ)
  {
    Question_ID: 'QUE_EQ_001',
    Organization_ID: 'ORG_000001',
    Category: 'EMOTIONAL_INTELLIGENCE',
    Subcategory: 'Empathy & Active Listening',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'When a teammate shows signs of stress or defensiveness in a design review, I accurately read their non-verbal cues and adjust my tone before pressing a point.',
    Points: 5,
    Reverse_Scored: false
  },
  {
    Question_ID: 'QUE_EQ_002',
    Organization_ID: 'ORG_000001',
    Category: 'EMOTIONAL_INTELLIGENCE',
    Subcategory: 'Self-Regulation & Composure',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'When my technical proposal is publicly critiqued or rejected by stakeholders, I process my initial frustration privately without reacting defensively.',
    Points: 5,
    Reverse_Scored: false
  },

  // 6. SITUATIONAL JUDGMENT TEST (SJT)
  {
    Question_ID: 'QUE_SJT_001',
    Organization_ID: 'ORG_000001',
    Category: 'SITUATIONAL_JUDGEMENT',
    Subcategory: 'Crisis Triage & Architectural Ethics',
    Question_Type: 'SCENARIO_JUDGEMENT',
    Difficulty: 'HARD',
    Question_Text: 'Two days before a major enterprise client launch, you detect a race condition in the payment pipeline under heavy concurrency. What is the most responsible action?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_SJT_01', Question_ID: 'QUE_SJT_001', Option_Text: 'Quantify failure probability with metrics, brief leadership with an isolated circuit-breaker proposal, and recommend gated rollout.', Trait_Weight: 5, Order_Index: 1 },
      { Option_ID: 'OPT_SJT_02', Question_ID: 'QUE_SJT_001', Option_Text: 'Deploy as scheduled and silently patch the bug if customers report discrepancies.', Trait_Weight: 1, Order_Index: 2 },
      { Option_ID: 'OPT_SJT_03', Question_ID: 'QUE_SJT_001', Option_Text: 'Halt the entire product release unilaterally without consulting business stakeholders.', Trait_Weight: 2, Order_Index: 3 },
      { Option_ID: 'OPT_SJT_04', Question_ID: 'QUE_SJT_001', Option_Text: 'Delegate the triage to junior on-call engineers without formal incident logging.', Trait_Weight: 1, Order_Index: 4 }
    ]
  },

  // 7. COMMUNICATION SKILLS ASSESSMENT
  {
    Question_ID: 'QUE_COM_001',
    Organization_ID: 'ORG_000001',
    Category: 'COMMUNICATION_SKILLS',
    Subcategory: 'Conflict De-escalation & Feedback',
    Question_Type: 'SCENARIO_JUDGEMENT',
    Difficulty: 'MEDIUM',
    Question_Text: 'A senior engineer submits a code pull request that violates core architectural security guidelines. How do you articulate the feedback?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_COM_01', Question_ID: 'QUE_COM_001', Option_Text: 'Highlight positive progress, explicitly reference specific security standard doc links, explain the blast radius objectively, and offer a 10-minute sync to co-design the fix.', Trait_Weight: 5, Order_Index: 1 },
      { Option_ID: 'OPT_COM_02', Question_ID: 'QUE_COM_001', Option_Text: 'Reject the PR with comment: "This code is insecure and fails basic guidelines."', Trait_Weight: 1, Order_Index: 2 },
      { Option_ID: 'OPT_COM_03', Question_ID: 'QUE_COM_001', Option_Text: 'Approve the PR to maintain peer harmony and fix it yourself on the weekend.', Trait_Weight: 2, Order_Index: 3 },
      { Option_ID: 'OPT_COM_04', Question_ID: 'QUE_COM_001', Option_Text: 'Complain to the Engineering VP before discussing it with the engineer directly.', Trait_Weight: 1, Order_Index: 4 }
    ]
  },

  // 8. LEARNING AGILITY ASSESSMENT (Likert scale)
  {
    Question_ID: 'QUE_LA_001',
    Organization_ID: 'ORG_000001',
    Category: 'LEARNING_AGILITY',
    Subcategory: 'Mental & Change Agility',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'When forced to discard an architecture I worked on for months due to sudden business pivots, I rapidly unlearn old assumptions and enthusiastically master new tech stacks.',
    Points: 5,
    Reverse_Scored: false
  },
  {
    Question_ID: 'QUE_LA_002',
    Organization_ID: 'ORG_000001',
    Category: 'LEARNING_AGILITY',
    Subcategory: 'Experimentation & Feedback Agility',
    Question_Type: 'LIKERT_5',
    Difficulty: 'MEDIUM',
    Question_Text: 'I actively invite candid feedback on my blind spots and systematically test new problem-solving heuristics rather than relying solely on past habits.',
    Points: 5,
    Reverse_Scored: false
  },

  // 9. THEMATIC APPERCEPTION TEST (TAT - Workplace Projective Scenarios)
  {
    Question_ID: 'QUE_TAT_001',
    Organization_ID: 'ORG_000001',
    Category: 'THEMATIC_APPERCEPTION',
    Subcategory: 'Achievement vs Affiliation Motivation',
    Question_Type: 'SCENARIO_JUDGEMENT',
    Difficulty: 'HARD',
    Question_Text: 'Scenario / TAT Card: "A team lead stands alone late at night looking at an architecture diagram whiteboard where half of the blocks are erased." What narrative best describes what this scene signifies to you?',
    Points: 10,
    Options: [
      { Option_ID: 'OPT_TAT_01', Question_ID: 'QUE_TAT_001', Option_Text: 'High Achievement (nAch): The lead is distilling a complex system down to an elegant, high-throughput MVP to pioneer an industry standard benchmark.', Trait_Weight: 5, Order_Index: 1 },
      { Option_ID: 'OPT_TAT_02', Question_ID: 'QUE_TAT_001', Option_Text: 'Affiliation & Inclusion (nAff): The lead is redesigning the scope to alleviate team burnout and ensure junior engineers can safely contribute without stress.', Trait_Weight: 4, Order_Index: 2 },
      { Option_ID: 'OPT_TAT_03', Question_ID: 'QUE_TAT_001', Option_Text: 'External Blame: The company executives have unrealistic targets and the project is doomed to fail regardless of effort.', Trait_Weight: 1, Order_Index: 3 },
      { Option_ID: 'OPT_TAT_04', Question_ID: 'QUE_TAT_001', Option_Text: 'Passive Defeat: The system was poorly designed by previous engineers and cannot be saved.', Trait_Weight: 1, Order_Index: 4 }
    ]
  }
];

export const INITIAL_SCORES: ScoreRecord[] = [];

export const INITIAL_FINAL_REPORTS: FinalReport[] = [];
