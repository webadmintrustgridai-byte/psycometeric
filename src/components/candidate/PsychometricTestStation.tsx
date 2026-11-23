/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * PsychometricTestStation.tsx - Server-Authoritative 3-Assessment Engine & Anti-Cheating Suite
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Candidate,
  AssessmentMaster,
  QuestionBankItem,
  AssessmentAttempt
} from '../../types';
import { ApiService } from '../../services/apiService';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  BookOpen,
  Send,
  HelpCircle,
  FileText,
  RotateCcw
} from 'lucide-react';

interface PsychometricTestStationProps {
  candidate: Candidate;
  assessmentId: string;
  onFinish: () => void;
}

export const PsychometricTestStation: React.FC<PsychometricTestStationProps> = ({
  candidate,
  assessmentId,
  onFinish
}) => {
  // Load Assessment Master and Questions
  const assessmentMaster = ApiService.getAssessmentMaster().find(a => a.Assessment_ID === assessmentId) || {
    Assessment_ID: assessmentId,
    Assessment_Name: 'Standard Assessment',
    Assessment_Type: 'APTITUDE' as const,
    Duration_Minutes: 30,
    Total_Questions: 30,
    Total_Marks: 30,
    Negative_Marking: false,
    Assessment_Status: 'ACTIVE' as const,
    Created_Date: new Date().toISOString(),
    Created_By: 'ADM_001'
  };

  const questions: QuestionBankItem[] = ApiService.getQuestionBank(assessmentId);

  // Server-Authoritative Attempt Record
  const [attempt, setAttempt] = useState<AssessmentAttempt>(() => {
    return ApiService.startAssessmentAttempt(
      candidate.Candidate_ID,
      assessmentId,
      assessmentMaster.Duration_Minutes
    );
  });

  // Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { selectedAnswer: 'A' | 'B' | 'C' | 'D' | ''; timeTakenSeconds: number }>>(() => {
    const existing = ApiService.getResponsesForAttempt(attempt.Attempt_ID);
    const map: Record<string, { selectedAnswer: 'A' | 'B' | 'C' | 'D' | ''; timeTakenSeconds: number }> = {};
    existing.forEach(r => {
      map[r.Question_ID] = { selectedAnswer: r.Selected_Answer, timeTakenSeconds: 0 };
    });
    return map;
  });

  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(attempt.Attempt_Status === 'COMPLETED' || attempt.Attempt_Status === 'TIME_EXPIRED');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Anti-Cheating & Audit State
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [showSecurityWarning, setShowSecurityWarning] = useState<string | null>(null);

  // Server-Derived Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const deadline = new Date(attempt.End_Timestamp_Deadline).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.floor((deadline - now) / 1000));
  });

  const currentQuestion = questions[currentIndex] || questions[0];

  // ==========================================
  // SERVER COUNTDOWN TIMER & AUTO-SUBMIT
  // ==========================================
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      const deadline = new Date(attempt.End_Timestamp_Deadline).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));

      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(timer);
        handleFinalSubmit('AUTO_TIME_EXPIRED');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt.End_Timestamp_Deadline, isSubmitted]);

  // ==========================================
  // ANTI-CHEATING SECURITY MONITORS
  // ==========================================
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings(prev => {
          const newCount = prev + 1;
          ApiService.logAudit(
            candidate.Candidate_ID,
            'CANDIDATE',
            'TAB_VISIBILITY_LOSS',
            'ATTEMPT',
            attempt.Attempt_ID,
            `Tab switch detected. Warning count: ${newCount}`
          );
          setShowSecurityWarning(`Warning: Navigation away from the assessment tab is strictly monitored. Incident logged (${newCount}).`);
          setTimeout(() => setShowSecurityWarning(null), 5000);
          return newCount;
        });
      }
    };

    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        setShowSecurityWarning('Assessment policy requires full-screen mode during campus supervision.');
        setTimeout(() => setShowSecurityWarning(null), 4000);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+X, Ctrl+U, PrintScreen
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's')) {
        e.preventDefault();
        setShowSecurityWarning('Copying, cutting, or inspecting assessment content is disabled.');
        setTimeout(() => setShowSecurityWarning(null), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [attempt.Attempt_ID, candidate.Candidate_ID, isSubmitted]);

  // Request Fullscreen helper
  const handleRequestFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      }
    } catch (e) {}
  };

  // ==========================================
  // RESPONSE SELECTION & AUTOSAVE
  // ==========================================
  const handleSelectOption = (optKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return;

    const updated = {
      ...responses,
      [currentQuestion.Question_ID]: {
        selectedAnswer: optKey,
        timeTakenSeconds: (responses[currentQuestion.Question_ID]?.timeTakenSeconds || 0) + 1
      }
    };
    setResponses(updated);

    // Synchronize response to Google Apps Script / local database immediately
    ApiService.saveResponse({
      attemptId: attempt.Attempt_ID,
      candidateId: candidate.Candidate_ID,
      assessmentId,
      questionId: currentQuestion.Question_ID,
      selectedAnswer: optKey
    });
  };

  const handleToggleMarkReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion.Question_ID]: !prev[currentQuestion.Question_ID]
    }));
  };

  // ==========================================
  // SUBMISSION LOGIC
  // ==========================================
  const handleFinalSubmit = (submissionType: 'MANUAL' | 'AUTO_TIME_EXPIRED' = 'MANUAL') => {
    setShowConfirmModal(false);
    setIsSubmitted(true);

    try {
      const res = ApiService.submitAssessmentAttempt(attempt.Attempt_ID, submissionType);
      setSubmissionResult(res.calculation);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err: any) {
      console.error('Submission error:', err);
    }
  };

  // Format Timer String MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const answeredCount = Object.values(responses).filter(r => r.selectedAnswer).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // ==========================================
  // VIEW: SUBMITTED SUMMARY SCREEN
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Assessment Finalized
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              {assessmentMaster.Assessment_Name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Candidate: <span className="font-semibold text-slate-800">{candidate.Full_Name}</span> ({candidate.Candidate_ID})
            </p>
          </div>

          {/* Score Snapshot */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block">Score Achieved</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {submissionResult?.totalScore ?? attempt.Score} / 30
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block">Percentage</span>
              <span className="text-3xl font-black text-blue-900 mt-1 block">
                {submissionResult?.percentageScore ?? Math.round((attempt.Score / 30) * 100)}%
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
            <span className="font-bold text-blue-950">Campus Assessment Record Archived:</span> Your responses and STEN benchmarks have been verified and permanently written to the institutional Google Sheets database. Duplicate attempts are locked under single-attempt governance.
          </div>

          <div className="pt-2">
            <button
              onClick={onFinish}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Return to Assessment Station</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: ACTIVE ASSESSMENT STATION
  // ==========================================
  return (
    <div
      onContextMenu={e => e.preventDefault()}
      className="max-w-6xl mx-auto space-y-4 select-none"
    >
      {/* Top Banner: Candidate Info, Assessment Name & Countdown Timer */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-sm">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">{assessmentMaster.Assessment_Name}</h2>
            <p className="text-[11px] text-slate-500">
              {candidate.Full_Name} • Roll: <span className="font-mono font-semibold">{candidate.College_ID_Number}</span>
            </p>
          </div>
        </div>

        {/* Security Alert if Active */}
        {showSecurityWarning && (
          <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{showSecurityWarning}</span>
          </div>
        )}

        {/* Timer & Fullscreen Controls */}
        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <button
              onClick={handleRequestFullscreen}
              className="p-2 text-slate-500 hover:text-blue-900 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              title="Enter Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <div className={`px-4 py-2 rounded-2xl font-mono text-sm font-extrabold flex items-center gap-2 border shadow-sm ${
            secondsRemaining < 300
              ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
              : 'bg-slate-900 text-white border-slate-900'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT / CENTER: QUESTION CONTAINER & CONTEXTUAL PASSAGE / SITUATION */}
        <div className={`space-y-4 ${
          currentQuestion?.Passage_Text || currentQuestion?.Situation_Text ? 'lg:col-span-8' : 'lg:col-span-8'
        }`}>
          
          {/* CONTEXTUAL READING PASSAGE (ASSESSMENT 2) OR WORKPLACE SCENARIO (ASSESSMENT 3) */}
          {(currentQuestion?.Passage_Text || currentQuestion?.Situation_Text) && (
            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200 shadow-sm max-h-72 overflow-y-auto space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>
                  {currentQuestion.Passage_Text ? 'Contextual Reading Passage (Keep in View)' : 'Workplace Professional Scenario'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                {currentQuestion.Passage_Text || currentQuestion.Situation_Text}
              </p>
            </div>
          )}

          {/* QUESTION CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length} • {currentQuestion?.Section_Name}
              </span>
              <button
                onClick={handleToggleMarkReview}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  markedForReview[currentQuestion?.Question_ID]
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestion?.Question_ID] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {currentQuestion?.Question_Text}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {[
                { key: 'A', text: currentQuestion?.Option_A },
                { key: 'B', text: currentQuestion?.Option_B },
                { key: 'C', text: currentQuestion?.Option_C },
                { key: 'D', text: currentQuestion?.Option_D }
              ].map(opt => {
                const isSelected = responses[currentQuestion?.Question_ID]?.selectedAnswer === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key as any)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs font-medium transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/50 text-blue-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {opt.key}
                    </span>
                    <span className="mt-0.5 leading-normal">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons Row */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentIndex === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autosaved</span>
              </span>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: QUESTION NAVIGATOR & SUBMISSION STATUS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Question Navigator</h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500" /> Answered ({answeredCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-slate-200" /> Unanswered ({unansweredCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-purple-500" /> Marked ({reviewCount})</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md border-2 border-blue-900" /> Current</span>
            </div>

            {/* Question Grid (30 Questions) */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAns = Boolean(responses[q.Question_ID]?.selectedAnswer);
                const isMarked = Boolean(markedForReview[q.Question_ID]);
                const isCurr = idx === currentIndex;

                let btnBg = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isMarked) {
                  btnBg = 'bg-purple-600 text-white';
                } else if (isAns) {
                  btnBg = 'bg-emerald-600 text-white';
                }

                return (
                  <button
                    key={q.Question_ID}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all relative ${btnBg} ${
                      isCurr ? 'ring-2 ring-blue-900 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Finish & Submit</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIRMATION MODAL BEFORE FINAL SUBMISSION */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Confirm Final Submission</h3>
                <p className="text-xs text-slate-500">Single attempt rule applies. Answers cannot be modified after submission.</p>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Answered</span>
                <span className="text-lg font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Unanswered</span>
                <span className="text-lg font-bold text-rose-600">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Marked</span>
                <span className="text-lg font-bold text-purple-600">{reviewCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit('MANUAL')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
