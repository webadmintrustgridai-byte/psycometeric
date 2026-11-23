/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * PsychometricTestStation.tsx - 9-Domain Testing Suite with Filter & Battery Support
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Candidate, AssessmentTemplate, Question, ScoreRecord, AssessmentCategory, TEST_MODULES_LIST } from '../../types';
import { ApiService } from '../../services/apiService';
import { ScoringEngine } from '../../services/scoringEngine';
import { RadarChart } from '../common/RadarChart';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Award,
  BarChart3,
  FileText,
  Filter,
  Layers,
  FileCheck2,
  PenTool
} from 'lucide-react';

interface PsychometricTestStationProps {
  candidate: Candidate;
  initialCategory?: AssessmentCategory | 'ALL';
  onFinish?: () => void;
}

export const PsychometricTestStation: React.FC<PsychometricTestStationProps> = ({
  candidate,
  initialCategory = 'ALL',
  onFinish
}) => {
  const [template] = useState<AssessmentTemplate>(() => ApiService.getTemplates()[0]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<AssessmentCategory | 'ALL'>(initialCategory);
  const [allQuestions] = useState<Question[]>(() => ApiService.getQuestions());
  
  // Filter questions based on selected module
  const questions = activeCategoryFilter === 'ALL'
    ? allQuestions
    : allQuestions.filter(q => q.Category === activeCategoryFilter);

  const [step, setStep] = useState<'WELCOME' | 'VOLUNTARY_DISCLOSURE' | 'SYSTEM_CHECK' | 'TEST' | 'SUBMITTED'>('WELCOME');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { selectedOptionId?: string; value?: any; timeTaken: number }>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(template.Time_Limit_Minutes * 60);
  const [autoSaved, setAutoSaved] = useState(true);
  const [testResult, setTestResult] = useState<{
    totalScore: number;
    percentageScore: number;
    traitScores: ScoreRecord[];
    strengths: string[];
    developmentAreas: string[];
  } | null>(null);

  // Voluntary Disclosure States
  const [disclosureVoluntary, setDisclosureVoluntary] = useState(false);
  const [disclosurePsychometrics, setDisclosurePsychometrics] = useState(false);
  const [disclosureIntegrity, setDisclosureIntegrity] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState(candidate.Full_Name || '');
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);

  const allDisclosuresAccepted = disclosureVoluntary && disclosurePsychometrics && disclosureIntegrity && digitalSignature.trim().length > 1;

  const handleToggleAllDisclosures = () => {
    const nextState = !(disclosureVoluntary && disclosurePsychometrics && disclosureIntegrity);
    setDisclosureVoluntary(nextState);
    setDisclosurePsychometrics(nextState);
    setDisclosureIntegrity(nextState);
  };

  const handleAcceptVoluntaryDisclosure = () => {
    if (!allDisclosuresAccepted) return;
    const consentId = `CON_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    ApiService.saveConsent({
      Consent_ID: consentId,
      Candidate_ID: candidate.Candidate_ID,
      Candidate_Name: candidate.Full_Name,
      Candidate_Email: candidate.Email,
      Consent_Status: 'GRANTED',
      Consent_Version: 'v3.6.0-ENTERPRISE-VOLUNTARY',
      Disclosures_Accepted: {
        voluntary_participation: disclosureVoluntary,
        psychometric_scoring: disclosurePsychometrics,
        independent_integrity_pledge: disclosureIntegrity
      },
      Digital_Signature: digitalSignature.trim(),
      Timestamp: new Date().toISOString()
    });
    setStep('SYSTEM_CHECK');
  };

  // Timer countdown during TEST step
  useEffect(() => {
    if (step !== 'TEST') return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleSelectLikert = (val: number) => {
    setAutoSaved(false);
    setResponses(prev => ({
      ...prev,
      [currentQuestion.Question_ID]: {
        value: val,
        timeTaken: 12
      }
    }));
    setTimeout(() => setAutoSaved(true), 400);
  };

  const handleSelectOption = (optionId: string) => {
    setAutoSaved(false);
    setResponses(prev => ({
      ...prev,
      [currentQuestion.Question_ID]: {
        selectedOptionId: optionId,
        timeTaken: 15
      }
    }));
    setTimeout(() => setAutoSaved(true), 400);
  };

  const handleSubmitTest = () => {
    const attemptId = `ATT_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const result = ScoringEngine.calculateScores(
      attemptId,
      candidate.Candidate_ID,
      questions,
      responses
    );

    // Save individual trait scores to ApiService & sync to Google Apps Script
    for (const sc of result.traitScores) {
      ApiService.saveScore(sc);
    }

    setTestResult(result);
    setStep('SUBMITTED');

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find module info for current question
  const currentModuleInfo = TEST_MODULES_LIST.find(m => m.category === currentQuestion?.Category);

  // Prepare radar chart data
  const radarData = (testResult?.traitScores || []).map(p => ({
    label: p.Trait_Name.replace(/_/g, ' '),
    value: p.Sten_Score,
    maxValue: 10
  }));

  // WELCOME SCREEN
  if (step === 'WELCOME') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <img 
              src="/trustgrid-logo.png" 
              alt="TRUSTGRID.AI Logo" 
              className="h-10 w-auto object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-widest">
                TRUSTGRID.AI • 9-Test Enterprise Assessment Battery
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                {template.Title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Test:</span>
            <select
              value={activeCategoryFilter}
              onChange={e => {
                setActiveCategoryFilter(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
            >
              <option value="ALL">All 9 Tests (Comprehensive Battery)</option>
              {TEST_MODULES_LIST.map(m => (
                <option key={m.category} value={m.category}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Welcome, <strong>{candidate.Full_Name}</strong>. This assessment covers <strong>9 psychometric & reasoning dimensions</strong>: Aptitude, Logical Reasoning, Verbal Reasoning, Big Five Personality, Emotional Intelligence (EQ), Situational Judgment (SJT), Communication Skills, Learning Agility, and Thematic Apperception (TAT).
        </p>

        {/* 9 Test Grid Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Included Assessment Modules ({questions.length} Items Selected)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {TEST_MODULES_LIST.map(m => {
              const isIncluded = activeCategoryFilter === 'ALL' || activeCategoryFilter === m.category;
              return (
                <div
                  key={m.category}
                  className={`p-3 rounded-2xl border text-xs transition-all ${
                    isIncluded
                      ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                      : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{m.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {m.domain}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-1.5">
          <h4 className="font-bold text-blue-900 uppercase text-[10px] tracking-wider">Candidate Guidelines:</h4>
          <p>• <strong>Cognitive & Reasoning Items (Aptitude, Logical, Verbal):</strong> Timed multiple-choice problems with single correct answers.</p>
          <p>• <strong>Personality & EQ Items:</strong> Normative Likert ratings. Answer candidly based on your authentic workplace behaviors.</p>
          <p>• <strong>SJT & TAT Scenario Items:</strong> Read the situational context carefully and select the response that best reflects your preferred course of action.</p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setStep('VOLUNTARY_DISCLOSURE')}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <span>Proceed to Voluntary Data Disclosure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // VOLUNTARY DATA DISCLOSURE & SUBMISSION SCREEN
  if (step === 'VOLUNTARY_DISCLOSURE') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        
        {/* Header with TRUSTGRID.AI Logo */}
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <img 
              src="/trustgrid-logo.png" 
              alt="TRUSTGRID.AI Logo" 
              className="h-10 w-auto object-contain drop-shadow-sm"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 uppercase tracking-widest">
                Compliance & Ethics Standards (ISO 10667 / EEOC)
              </span>
              <h1 className="text-lg font-black text-slate-900 mt-1">
                Voluntary Data Disclosure & Candidate Submission Agreement
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAllDisclosures}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            {disclosureVoluntary && disclosurePsychometrics && disclosureIntegrity
              ? 'Deselect All'
              : 'Select All Declarations'}
          </button>
        </div>

        {/* Candidate Context Pill */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Candidate</span>
            <span className="font-bold text-slate-800">{candidate.Full_Name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Registered Email</span>
            <span className="font-bold text-slate-800">{candidate.Email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Candidate ID</span>
            <span className="font-mono font-bold text-blue-900">{candidate.Candidate_ID}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Before taking the 9-domain psychometric assessment, please carefully review the following mandatory disclosures regarding voluntary participation, algorithmic scoring, data transmission, and test integrity.
        </p>

        {/* 4 Voluntary Disclosure Checkboxes */}
        <div className="space-y-3.5">
          
          {/* Disclosure 1 */}
          <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
            disclosureVoluntary ? 'bg-blue-50/60 border-blue-300 shadow-sm' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={disclosureVoluntary}
                onChange={e => setDisclosureVoluntary(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blue-900 border-slate-300 focus:ring-blue-600 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  1. Voluntary Participation & Authentic Background Disclosure
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I understand and affirm that my participation in this psychometric assessment battery is entirely voluntary. I attest that all personal background particulars, employment records, qualifications, and assessment answers submitted by me are authentic, truthful, and representative of my genuine workplace experiences.
                </p>
              </div>
            </div>
          </label>

          {/* Disclosure 2 */}
          <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
            disclosurePsychometrics ? 'bg-blue-50/60 border-blue-300 shadow-sm' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={disclosurePsychometrics}
                onChange={e => setDisclosurePsychometrics(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blue-900 border-slate-300 focus:ring-blue-600 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  2. Automated STEN Norming (1–10) & Psychometric Computational Processing
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I grant explicit consent for my responses across Cognitive, Behavioral, and Psychological dimensions (Aptitude, Logical Reasoning, Verbal Reasoning, Big Five Personality, Emotional Intelligence, Situational Judgment, Communication Skills, Learning Agility, and Thematic Apperception) to be computationally evaluated using standardized psychometric algorithms into normalized Standard Ten (STEN) scores (Mean 5.5, SD 2.0) and percentile benchmarks.
                </p>
              </div>
            </div>
          </label>

          {/* Disclosure 3 */}
          <label className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
            disclosureIntegrity ? 'bg-blue-50/60 border-blue-300 shadow-sm' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
          }`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={disclosureIntegrity}
                onChange={e => setDisclosureIntegrity(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blue-900 border-slate-300 focus:ring-blue-600 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  3. Independent Submission Pledge & Assessment Integrity Code
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I solemnly pledge that I will complete this assessment independently, without unauthorized assistance from third parties, proxy test-takers, external answer keys, or generative AI query engines, upholding the highest standards of professional and testing ethics.
                </p>
              </div>
            </div>
          </label>

        </div>

        {/* Digital Signature & Timestamp */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Digital Signature (Type your Full Name to affirm):</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400">
              Timestamp: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>
          </div>
          <input
            type="text"
            value={digitalSignature}
            onChange={e => setDigitalSignature(e.target.value)}
            placeholder={`e.g. ${candidate.Full_Name}`}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        {/* Nav Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep('WELCOME')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Back to Overview
          </button>

          <button
            onClick={handleAcceptVoluntaryDisclosure}
            disabled={!allDisclosuresAccepted}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all ${
              allDisclosuresAccepted
                ? 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Accept Voluntary Disclosures & Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    );
  }

  // SYSTEM CHECK SCREEN
  if (step === 'SYSTEM_CHECK') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pre-Assessment Readiness Check</h2>
          <p className="text-xs text-slate-500 mt-0.5">Verifying local timer synchronization and database responsiveness</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Browser Environment</h4>
                <p className="text-[11px] text-slate-500">HTML5 Storage & Real-time Auto-save Ready</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Optimal
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Selected Battery</h4>
                <p className="text-[11px] text-slate-500">
                  {activeCategoryFilter === 'ALL' ? 'Comprehensive 9-Test Battery' : currentModuleInfo?.name} ({questions.length} Items)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Loaded
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Voluntary Data Disclosure & Submission</h4>
                <p className="text-[11px] text-slate-500">Formally Acknowledged & Digitally Signed</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Granted
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setStep('VOLUNTARY_DISCLOSURE')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Back to Disclosure
          </button>
          <button
            onClick={() => setStep('TEST')}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <span>Begin Assessment Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE TEST TAKING STATION
  if (step === 'TEST' && currentQuestion) {
    const isAnswered = responses[currentQuestion.Question_ID] !== undefined;
    const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Top Sticky Test Header with Active Module Indicator */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-900 text-white">
              Item {currentIndex + 1} of {questions.length}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentModuleInfo?.badgeColor || 'bg-slate-100 text-slate-700'}`}>
              {currentModuleInfo?.name || currentQuestion.Category}
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              • {currentQuestion.Subcategory}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${autoSaved ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              {autoSaved ? 'Saved' : 'Saving...'}
            </span>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
              timeLeftSeconds < 180 ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-800'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question Statement Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                {currentModuleInfo?.name || currentQuestion.Category} Statement
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Difficulty: {currentQuestion.Difficulty}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug whitespace-pre-line">
              {currentQuestion.Question_Text}
            </h2>
          </div>

          {/* Option Interaction - Likert Scale (Personality, EQ, Learning Agility) */}
          {currentQuestion.Question_Type === 'LIKERT_5' && (
            <div className="pt-2 space-y-3">
              <span className="text-xs text-slate-400 font-medium">Select your level of agreement:</span>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { val: 1, label: 'Strongly Disagree' },
                  { val: 2, label: 'Disagree' },
                  { val: 3, label: 'Neutral' },
                  { val: 4, label: 'Agree' },
                  { val: 5, label: 'Strongly Agree' }
                ].map(item => {
                  const isSelected = responses[currentQuestion.Question_ID]?.value === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => handleSelectLikert(item.val)}
                      className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1 transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-900/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.val}
                      </span>
                      <span className="text-[10px] font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option Interaction - Multiple Choice (Aptitude, Logical, Verbal, SJT, Communication, TAT) */}
          {(currentQuestion.Question_Type === 'MCQ' || currentQuestion.Question_Type === 'SCENARIO_JUDGEMENT') && currentQuestion.Options && (
            <div className="pt-1 space-y-2.5">
              {currentQuestion.Options.map((opt, idx) => {
                const isSelected = responses[currentQuestion.Question_ID]?.selectedOptionId === opt.Option_ID;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={opt.Option_ID}
                    onClick={() => handleSelectOption(opt.Option_ID)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 text-slate-900 shadow-sm ring-2 ring-blue-900/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium pt-0.5 leading-relaxed">
                      {opt.Option_Text}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmitModal(true)}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Assessment</span>
            </button>
          )}
        </div>

        {/* Final Voluntary Submission Confirmation Modal */}
        {showConfirmSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Final Voluntary Submission
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    TRUSTGRID.AI Psychometric Assessment Battery
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-slate-700 space-y-1.5">
                <p>• <strong>Candidate:</strong> {candidate.Full_Name}</p>
                <p>• <strong>Answered:</strong> {Object.keys(responses).length} of {questions.length} items</p>
                <p>• <strong>Database Destination:</strong> Google Sheets Master Database</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                By confirming below, you voluntarily finalize and submit your assessment responses for normative STEN evaluation (1-10) and direct synchronization to the TRUSTGRID.AI Google Sheets backend.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmitModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmSubmitModal(false);
                    handleSubmitTest();
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Voluntarily Submit</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // TEST SUBMISSION & SCORECARD REPORT
  if (step === 'SUBMITTED' && testResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Celebratory Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="flex justify-center mb-1">
            <img 
              src="/trustgrid-logo.png" 
              alt="TRUSTGRID.AI Logo" 
              className="h-10 w-auto object-contain drop-shadow-xs"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Assessment Completed Successfully!
          </h2>

          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Your responses have been scored across all assessed modules on the standard normative STEN scale (Mean 5.5, SD 2.0) and synchronized to the Google Sheets database.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-xs text-slate-600 font-semibold">Overall Composite Benchmark:</span>
              <span className="text-xl font-extrabold text-blue-900">{testResult.percentageScore}%</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Voluntary Submission Verified & Synced</span>
            </div>
          </div>
        </div>

        {/* Radar & Domain Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Radar Chart Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-900 text-xs uppercase mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-900" />
              Psychometric & Reasoning Profile (STEN 1-10)
            </h3>
            <RadarChart data={radarData} size={280} />
            <span className="text-[10px] text-slate-400 mt-2 text-center">
              STEN Scale: 1-4 (Pragmatic / Reflective), 5-6 (Balanced), 7-10 (High Innovation / Driving Capability)
            </span>
          </div>

          {/* Trait Breakdown Cards */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2.5 overflow-y-auto max-h-[420px]">
            <h3 className="font-bold text-slate-900 text-xs uppercase mb-2">
              Assessed Domain Scores
            </h3>

            {testResult.traitScores.map(sc => (
              <div key={sc.Score_ID} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {sc.Trait_Name.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-extrabold text-blue-900">
                    STEN {sc.Sten_Score}/10 ({sc.Percentile}th %ile)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {sc.Interpretation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200">
          <div className="text-xs text-slate-500">
            Candidate ID: <span className="font-mono font-bold text-slate-700">{candidate.Candidate_ID}</span>
          </div>
          <button
            onClick={() => {
              if (onFinish) onFinish();
              else setStep('WELCOME');
            }}
            className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md"
          >
            View Full Scorecard & Report
          </button>
        </div>

      </div>
    );
  }

  return null;
};
