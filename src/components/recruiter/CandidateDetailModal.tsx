/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * CandidateDetailModal.tsx - Candidate Psychometric Results, Academic Profile & Admin Master Control
 */

import React, { useState, useEffect } from 'react';
import {
  Candidate,
  AssessmentAssignment,
  AcademicProfileRecord,
  EntranceExamRecord,
  CandidateFullAcademicProfile
} from '../../types';
import { ApiService } from '../../services/apiService';
import { ReportGenerator } from '../../services/reportGenerator';
import { RadarChart } from '../common/RadarChart';
import {
  X,
  User,
  BrainCircuit,
  Download,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Clock,
  RotateCcw,
  Save,
  GraduationCap,
  Video,
  Award,
  AlertCircle
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'PSYCHOMETRICS' | 'ACADEMIC_EXAMS' | 'ADMIN_CONTROLS';
  onCandidateUpdated?: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  initialTab = 'PSYCHOMETRICS',
  onCandidateUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'PSYCHOMETRICS' | 'ACADEMIC_EXAMS' | 'ADMIN_CONTROLS'>(initialTab);

  // Sync tab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Data fetching
  const scores = ApiService.getScores(candidate.Candidate_ID);
  const reports = ApiService.getReports(candidate.Candidate_ID);
  const academicRecords = ApiService.getAcademicProfiles(candidate.Candidate_ID);
  const existingEntranceExams = ApiService.getEntranceExams(candidate.Candidate_ID);
  const videoProfiles = ApiService.getVideoProfiles(candidate.Candidate_ID);
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>(() =>
    ApiService.getAssignmentsForCandidate(candidate.Candidate_ID)
  );

  // Editable Candidate State
  const [editName, setEditName] = useState(candidate.Full_Name || '');
  const [editEmail, setEditEmail] = useState(candidate.Primary_Email || candidate.Email || '');
  const [editMobile, setEditMobile] = useState(candidate.Mobile_Number || candidate.Phone_Number || '');
  const [editWhatsApp, setEditWhatsApp] = useState(candidate.WhatsApp_Number || candidate.Phone_Number || '');
  const [editCollege, setEditCollege] = useState(candidate.College_Name || candidate.University || '');
  const [editDept, setEditDept] = useState(candidate.Department || 'Computer Science & Engineering');
  const [editDegree, setEditDegree] = useState(candidate.Degree || candidate.Qualification || 'B.Tech');
  const [editYear, setEditYear] = useState(candidate.Academic_Year || '4th Year');
  const [editSemester, setEditSemester] = useState(candidate.Current_Semester || 'Semester 7');
  const [editCollegeId, setEditCollegeId] = useState(candidate.College_ID_Number || '');

  // Academic Records State
  const rec10 = academicRecords.find(a => a.Education_Level === '10TH');
  const rec12 = academicRecords.find(a => a.Education_Level === '12TH');
  const recCol = academicRecords.find(a => a.Education_Level === 'COLLEGE_SEMESTER');

  const [math10, setMath10] = useState<number>(rec10?.Mathematics_Marks || 95);
  const [sci10, setSci10] = useState<number>(rec10?.Science_Marks || 92);
  const [eng10, setEng10] = useState<number>(rec10?.English_Marks || 90);
  const [perc10, setPerc10] = useState<number>(rec10?.Percentage || 93.5);

  const [math12, setMath12] = useState<number>(rec12?.Mathematics_Marks || 96);
  const [phy12, setPhy12] = useState<number>(rec12?.Physics_Marks || 94);
  const [chem12, setChem12] = useState<number>(rec12?.Chemistry_Marks || 91);
  const [eng12, setEng12] = useState<number>(rec12?.English_Marks || 89);
  const [perc12, setPerc12] = useState<number>(rec12?.Percentage || 93.8);

  const [overallCGPA, setOverallCGPA] = useState<number>(recCol?.Overall_CGPA || 8.95);

  // Entrance Exams State
  const jeeRecord = existingEntranceExams.find(e => e.Examination_Name === 'JEE_MAIN' || e.Examination_Name === 'JEE_ADVANCED');
  const bitsatRecord = existingEntranceExams.find(e => e.Examination_Name === 'BITSAT');
  const gateRecord = existingEntranceExams.find(e => e.Examination_Name === 'GATE');

  const [jeeScore, setJeeScore] = useState<string>(jeeRecord?.Score ? String(jeeRecord.Score) : '260');
  const [jeePercentile, setJeePercentile] = useState<string>(jeeRecord?.Percentile ? String(jeeRecord.Percentile) : '99.12');
  const [jeeRank, setJeeRank] = useState<string>(jeeRecord?.Rank ? String(jeeRecord.Rank) : '8420');

  const [bitsatScore, setBitsatScore] = useState<string>(bitsatRecord?.Score ? String(bitsatRecord.Score) : '342');
  const [bitsatPercentile, setBitsatPercentile] = useState<string>(bitsatRecord?.Percentile ? String(bitsatRecord.Percentile) : '98.8');
  const [bitsatRank, setBitsatRank] = useState<string>(bitsatRecord?.Rank ? String(bitsatRecord.Rank) : '2150');

  const [gateScore, setGateScore] = useState<string>(gateRecord?.Score ? String(gateRecord.Score) : '785');
  const [gatePercentile, setGatePercentile] = useState<string>(gateRecord?.Percentile ? String(gateRecord.Percentile) : '99.42');
  const [gateRank, setGateRank] = useState<string>(gateRecord?.Rank ? String(gateRecord.Rank) : '312');

  // Assessment Override State (Duration & Attempts for 3 assessments)
  const [asmDurations, setAsmDurations] = useState<{ [id: string]: number }>({
    ASM_APTITUDE: 30,
    ASM_COMPREHENSION: 45,
    ASM_EI_SITUATIONAL: 30
  });

  const [asmAttemptsAllowed, setAsmAttemptsAllowed] = useState<{ [id: string]: number }>({
    ASM_APTITUDE: 1,
    ASM_COMPREHENSION: 1,
    ASM_EI_SITUATIONAL: 1
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Initialize duration and attempt limits from existing assignments
  useEffect(() => {
    const userAssignments = ApiService.getAssignmentsForCandidate(candidate.Candidate_ID);
    setAssignments(userAssignments);
    const durs: { [id: string]: number } = { ASM_APTITUDE: 30, ASM_COMPREHENSION: 45, ASM_EI_SITUATIONAL: 30 };
    const atts: { [id: string]: number } = { ASM_APTITUDE: 1, ASM_COMPREHENSION: 1, ASM_EI_SITUATIONAL: 1 };
    userAssignments.forEach(a => {
      if (a.Duration_Minutes) durs[a.Assessment_ID] = a.Duration_Minutes;
      if (a.Attempt_Allowed) atts[a.Assessment_ID] = a.Attempt_Allowed;
    });
    setAsmDurations(durs);
    setAsmAttemptsAllowed(atts);
  }, [candidate.Candidate_ID]);

  if (!isOpen) return null;

  const personalityScores = scores.filter(s => s.Category === 'PERSONALITY');
  const radarData = personalityScores.map(p => ({
    label: p.Trait_Name.replace(/_/g, ' '),
    value: p.Sten_Score,
    maxValue: 10
  }));

  const handleDownloadPdf = () => {
    const report = reports[0] || {
      Report_ID: 'RPT_TEMP',
      Candidate_ID: candidate.Candidate_ID,
      Report_Type: 'PSYCHOMETRIC',
      Composite_Score: 92,
      Aptitude_Score: 100,
      Strengths: ['High analytical reasoning', 'Meticulous conscientiousness'],
      Development_Areas: ['Asynchronous documentation'],
      Created_At: new Date().toISOString()
    };
    ReportGenerator.generatePsychometricPdf(candidate, scores, report);
  };

  // Admin Master Save
  const handleSaveAdminMaster = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);

    // 1. Update Candidate Master
    const fullProfile: CandidateFullAcademicProfile = {
      sslc10: {
        schoolName: rec10?.School_or_College || 'Secondary School',
        board: rec10?.Board_or_University || 'CBSE',
        passingYear: rec10?.Passing_Year || '2020',
        mathsMarks: Number(math10),
        scienceMarks: Number(sci10),
        englishMarks: Number(eng10),
        totalMarks: Number(math10) + Number(sci10) + Number(eng10) + 180,
        percentage: Number(perc10)
      },
      hsc12: {
        schoolName: rec12?.School_or_College || 'Higher Secondary College',
        board: rec12?.Board_or_University || 'State Board',
        passingYear: rec12?.Passing_Year || '2022',
        mathsMarks: Number(math12),
        physicsMarks: Number(phy12),
        chemistryMarks: Number(chem12),
        mpcGroupMarks: Number(math12) + Number(phy12) + Number(chem12),
        englishMarks: Number(eng12),
        totalMarks: Number(math12) + Number(phy12) + Number(chem12) + Number(eng12) + 90,
        percentage: Number(perc12)
      },
      college: {
        collegeName: editCollege,
        degree: editDegree,
        department: editDept,
        academicYear: editYear,
        currentSemester: editSemester,
        semesters: [
          { semesterNumber: 1, marks: 820, maxMarks: 1000, cgpa: 8.5 },
          { semesterNumber: 2, marks: 840, maxMarks: 1000, cgpa: 8.7 },
          { semesterNumber: 3, marks: 860, maxMarks: 1000, cgpa: 8.9 },
          { semesterNumber: 4, marks: 880, maxMarks: 1000, cgpa: 9.1 },
          { semesterNumber: 5, marks: 890, maxMarks: 1000, cgpa: 9.2 },
          { semesterNumber: 6, marks: 910, maxMarks: 1000, cgpa: 9.4 }
        ],
        overallCGPA: Number(overallCGPA),
        backlogs: 0,
        arrearsHistory: 'Nil'
      }
    };

    const updatedExams: EntranceExamRecord[] = [];
    if (jeeScore) {
      updatedExams.push({
        Exam_Record_ID: jeeRecord?.Exam_Record_ID || `ENT_JEE_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'JEE_MAIN',
        Examination_Year: '2022',
        Score: Number(jeeScore),
        Percentile: Number(jeePercentile),
        Rank: Number(jeeRank),
        Scorecard_URL: jeeRecord?.Scorecard_URL,
        Created_At: new Date().toISOString()
      });
    }
    if (bitsatScore) {
      updatedExams.push({
        Exam_Record_ID: bitsatRecord?.Exam_Record_ID || `ENT_BIT_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'BITSAT',
        Examination_Year: '2022',
        Score: Number(bitsatScore),
        Percentile: Number(bitsatPercentile),
        Rank: Number(bitsatRank),
        Created_At: new Date().toISOString()
      });
    }
    if (gateScore) {
      updatedExams.push({
        Exam_Record_ID: gateRecord?.Exam_Record_ID || `ENT_GATE_${Date.now()}`,
        Candidate_ID: candidate.Candidate_ID,
        Examination_Name: 'GATE',
        Examination_Year: '2025',
        Score: Number(gateScore),
        Percentile: Number(gatePercentile),
        Rank: Number(gateRank),
        Scorecard_URL: gateRecord?.Scorecard_URL,
        Created_At: new Date().toISOString()
      });
    }

    ApiService.adminUpdateCandidateMaster('ADM_001', candidate.Candidate_ID, {
      candidate: {
        Full_Name: editName,
        Primary_Email: editEmail,
        Email: editEmail,
        Mobile_Number: editMobile,
        WhatsApp_Number: editWhatsApp,
        College_Name: editCollege,
        Department: editDept,
        Degree: editDegree,
        Academic_Year: editYear,
        Current_Semester: editSemester,
        College_ID_Number: editCollegeId
      },
      academicProfile: fullProfile,
      entranceExams: updatedExams
    });

    // 2. Apply Assessment Duration & Attempt Overrides
    ['ASM_APTITUDE', 'ASM_COMPREHENSION', 'ASM_EI_SITUATIONAL'].forEach(asmId => {
      ApiService.adminOverrideAssessment(candidate.Candidate_ID, asmId, 'ADM_001', {
        durationMinutes: asmDurations[asmId],
        attemptsAllowed: asmAttemptsAllowed[asmId],
        reason: 'Admin Master Controls adjustment'
      });
    });

    setSaveSuccessMsg('All candidate details, marks, GATE/JEE scores, and assessment duration limits saved successfully!');
    if (onCandidateUpdated) {
      onCandidateUpdated();
    }
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // 1-Click Reset / Unlock Assessment for retake
  const handleUnlockAssessment = (assessmentId: string) => {
    ApiService.adminOverrideAssessment(candidate.Candidate_ID, assessmentId, 'ADM_001', {
      unlockRetake: true,
      resetAttempt: true,
      attemptsAllowed: (asmAttemptsAllowed[assessmentId] || 1) + 1,
      reason: 'Admin 1-click retake authorization and attempt reset'
    });
    setAsmAttemptsAllowed(prev => ({ ...prev, [assessmentId]: (prev[assessmentId] || 1) + 1 }));
    setSaveSuccessMsg(`Assessment ${assessmentId} successfully unlocked for retake!`);
    if (onCandidateUpdated) onCandidateUpdated();
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {candidate.Full_Name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{candidate.Full_Name}</h3>
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {candidate.Candidate_ID}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  candidate.Registration_Status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {candidate.Registration_Status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {candidate.College_Name} • {candidate.Department} • {candidate.College_ID_Number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
              title="Download PDF Psychometric Dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2">
          <button
            onClick={() => setActiveTab('PSYCHOMETRICS')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'PSYCHOMETRICS'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Psychometric & STEN Results</span>
          </button>

          <button
            onClick={() => setActiveTab('ACADEMIC_EXAMS')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'ACADEMIC_EXAMS'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Profile (M/S/E, MPCE, GATE)</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN_CONTROLS')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'ADMIN_CONTROLS'
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span className="font-extrabold">Admin Master Controls & Time Overrides</span>
          </button>
        </div>

        {/* SUCCESS NOTIFICATION */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* =========================================================================
              TAB 1: PSYCHOMETRICS
              ========================================================================= */}
          {activeTab === 'PSYCHOMETRICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                    Candidate STEN Profile Radar (Normative Mean 5.5)
                  </h4>
                  <RadarChart data={radarData} size={280} />
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-blue-800 font-bold block uppercase">Overall Composite Benchmark</span>
                      <p className="text-xs text-slate-500 mt-0.5">Weighted Assessment Performance</p>
                    </div>
                    <span className="text-2xl font-extrabold text-blue-900">92%</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block uppercase">Quantitative Aptitude (Assessment 1)</span>
                      <p className="text-xs text-slate-500 mt-0.5">CAT / Arithmetic / Algebra / DI</p>
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-700">100%</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-800 font-bold block uppercase">Reading Comprehension (Assessment 2)</span>
                      <p className="text-xs text-slate-500 mt-0.5">1500–3000 Words CAT / GMAT Passages</p>
                    </div>
                    <span className="text-2xl font-extrabold text-purple-900">90%</span>
                  </div>
                </div>
              </div>

              {/* Trait Interpretations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Normative STEN Trait Interpretations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scores.map(sc => (
                    <div key={sc.Score_ID} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{sc.Trait_Name.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          STEN {sc.Sten_Score}/10 ({sc.Percentile}th %ile)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{sc.Interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: ACADEMIC PROFILE (M/S/E, MPCE, SEMESTERS & GATE SCORES)
              ========================================================================= */}
          {activeTab === 'ACADEMIC_EXAMS' && (
            <div className="space-y-6">
              
              {/* 10TH & 12TH MARKS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 10TH MARKS (M / S / E) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-700" />
                      <span>10th Standard Marks (M / S / E)</span>
                    </h4>
                    <span className="text-xs font-extrabold text-blue-900">{perc10}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Mathematics</span>
                      <span className="text-sm font-extrabold text-slate-900">{math10}/100</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Science</span>
                      <span className="text-sm font-extrabold text-slate-900">{sci10}/100</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">English</span>
                      <span className="text-sm font-extrabold text-slate-900">{eng10}/100</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    School: {rec10?.School_or_College || 'National High School'} • Board: {rec10?.Board_or_University || 'CBSE'}
                  </p>
                </div>

                {/* 12TH MARKS (M / P / C / E) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-700" />
                      <span>12th Standard Marks (M / P / C / E)</span>
                    </h4>
                    <span className="text-xs font-extrabold text-blue-900">{perc12}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Maths</span>
                      <span className="text-sm font-extrabold text-slate-900">{math12}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Physics</span>
                      <span className="text-sm font-extrabold text-slate-900">{phy12}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Chemistry</span>
                      <span className="text-sm font-extrabold text-slate-900">{chem12}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">English</span>
                      <span className="text-sm font-extrabold text-slate-900">{eng12}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    College: {rec12?.School_or_College || 'State Junior College'} • Board: {rec12?.Board_or_University || 'State Board'}
                  </p>
                </div>

              </div>

              {/* COLLEGE CGPA & SEMESTERS LEDGER */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    College Academic Standing & Semesters Ledger
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Overall Cumulative CGPA:</span>
                    <span className="text-base font-black text-blue-900 bg-blue-100 px-3 py-0.5 rounded-xl">
                      {overallCGPA.toFixed(2)} / 10.0
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  {[
                    { sem: 'Sem 1', cgpa: 8.5 },
                    { sem: 'Sem 2', cgpa: 8.7 },
                    { sem: 'Sem 3', cgpa: 8.9 },
                    { sem: 'Sem 4', cgpa: 9.1 },
                    { sem: 'Sem 5', cgpa: 9.2 },
                    { sem: 'Sem 6', cgpa: 9.4 }
                  ].map(s => (
                    <div key={s.sem} className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{s.sem}</span>
                      <span className="text-xs font-extrabold text-slate-900">{s.cgpa} CGPA</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENTRANCE EXAMINATIONS (JEE, BITSAT & GATE SCORE) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>National Competitive Entrance Examinations</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* JEE Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-900 text-xs">JEE Main & Advanced</span>
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md">National</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                        <span className="font-bold text-slate-800">{jeeScore || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">%ile</span>
                        <span className="font-bold text-blue-900">{jeePercentile ? `${jeePercentile}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                        <span className="font-bold text-slate-800">{jeeRank ? `#${jeeRank}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* BITSAT Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-900 text-xs">BITSAT</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-md">Institute</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                        <span className="font-bold text-slate-800">{bitsatScore || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">%ile</span>
                        <span className="font-bold text-indigo-900">{bitsatPercentile ? `${bitsatPercentile}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                        <span className="font-bold text-slate-800">{bitsatRank ? `#${bitsatRank}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* GATE SCORE CARD */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                      <span className="font-extrabold text-purple-950 text-xs">GATE Score</span>
                      <span className="text-[10px] bg-purple-200/70 text-purple-900 font-black px-2 py-0.5 rounded-md">
                        Graduate Aptitude
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <span className="text-[10px] text-purple-700 block uppercase font-bold">Score (1000)</span>
                        <span className="font-black text-purple-950 text-sm">{gateScore || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-700 block uppercase font-bold">Percentile</span>
                        <span className="font-black text-purple-900">{gatePercentile ? `${gatePercentile}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-purple-700 block uppercase font-bold">AIR Rank</span>
                        <span className="font-black text-purple-950">{gateRank ? `#${gateRank}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* AI VIDEO PROFILE STATUS */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-700" />
                    <span>Candidate AI Video Submissions</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">{videoProfiles.length} Recorded</span>
                </div>
                {videoProfiles.length > 0 ? (
                  <div className="space-y-2">
                    {videoProfiles.map(v => (
                      <div key={v.Video_ID} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{v.Video_Title}</p>
                          <p className="text-[10px] text-slate-400">Duration: {v.Duration_Seconds}s • Status: {v.Review_Status}</p>
                        </div>
                        <a
                          href={v.Video_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-blue-50 text-blue-900 rounded-lg font-bold text-xs hover:bg-blue-100 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Watch</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No video submission uploaded yet.</p>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 3: ADMIN MASTER CONTROLS & TIME / ATTEMPT OVERRIDES
              ========================================================================= */}
          {activeTab === 'ADMIN_CONTROLS' && (
            <form onSubmit={handleSaveAdminMaster} className="space-y-6">

              {/* SECTION A: ASSESSMENT DURATION & ATTEMPT COUNT MASTER CONTROLS */}
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-700" />
                    <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                      Assessment Duration & Attempt Count Overrides
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded-full">
                    Direct Omnipotent Admin Control
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Assessment 1: Aptitude */}
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">1. Aptitude Reasoning</span>
                      <span className="text-[10px] font-mono text-slate-400">ASM_APTITUDE</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={asmDurations.ASM_APTITUDE || 30}
                        onChange={e => setAsmDurations({ ...asmDurations, ASM_APTITUDE: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Attempts Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={asmAttemptsAllowed.ASM_APTITUDE || 1}
                        onChange={e => setAsmAttemptsAllowed({ ...asmAttemptsAllowed, ASM_APTITUDE: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlockAssessment('ASM_APTITUDE')}
                      className="w-full py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unlock / Reset Retake</span>
                    </button>
                  </div>

                  {/* Assessment 2: Comprehension */}
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">2. English Comprehension</span>
                      <span className="text-[10px] font-mono text-slate-400">ASM_COMPREHENSION</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={asmDurations.ASM_COMPREHENSION || 45}
                        onChange={e => setAsmDurations({ ...asmDurations, ASM_COMPREHENSION: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Attempts Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={asmAttemptsAllowed.ASM_COMPREHENSION || 1}
                        onChange={e => setAsmAttemptsAllowed({ ...asmAttemptsAllowed, ASM_COMPREHENSION: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlockAssessment('ASM_COMPREHENSION')}
                      className="w-full py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unlock / Reset Retake</span>
                    </button>
                  </div>

                  {/* Assessment 3: Situational / EI */}
                  <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">3. EI & Situational (SJT)</span>
                      <span className="text-[10px] font-mono text-slate-400">ASM_EI_SITUATIONAL</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={asmDurations.ASM_EI_SITUATIONAL || 30}
                        onChange={e => setAsmDurations({ ...asmDurations, ASM_EI_SITUATIONAL: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Attempts Allowed</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={asmAttemptsAllowed.ASM_EI_SITUATIONAL || 1}
                        onChange={e => setAsmAttemptsAllowed({ ...asmAttemptsAllowed, ASM_EI_SITUATIONAL: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlockAssessment('ASM_EI_SITUATIONAL')}
                      className="w-full py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Unlock / Reset Retake</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* SECTION B: EDIT CANDIDATE PERSONAL & COLLEGE DATA */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Edit Candidate Identity & Institutional Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                    <input
                      type="text"
                      value={editMobile}
                      onChange={e => setEditMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      value={editCollege}
                      onChange={e => setEditCollege(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={e => setEditDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College ID Number</label>
                    <input
                      type="text"
                      value={editCollegeId}
                      onChange={e => setEditCollegeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: EDIT 10TH (M/S/E), 12TH (MPCE) & CGPA */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Edit Academic Scores: 10th (M/S/E), 12th (MPCE) & CGPA
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10th Maths</label>
                    <input
                      type="number"
                      value={math10}
                      onChange={e => setMath10(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10th Science</label>
                    <input
                      type="number"
                      value={sci10}
                      onChange={e => setSci10(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10th English</label>
                    <input
                      type="number"
                      value={eng10}
                      onChange={e => setEng10(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10th Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={perc10}
                      onChange={e => setPerc10(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-black text-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th Maths</label>
                    <input
                      type="number"
                      value={math12}
                      onChange={e => setMath12(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th Physics</label>
                    <input
                      type="number"
                      value={phy12}
                      onChange={e => setPhy12(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th Chemistry</label>
                    <input
                      type="number"
                      value={chem12}
                      onChange={e => setChem12(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th English</label>
                    <input
                      type="number"
                      value={eng12}
                      onChange={e => setEng12(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12th Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={perc12}
                      onChange={e => setPerc12(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-black text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Overall Cumulative CGPA (10-Point)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={overallCGPA}
                      onChange={e => setOverallCGPA(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-black text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: EDIT ENTRANCE EXAM SCORES (JEE, BITSAT & GATE) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Edit Entrance Exam Scores: JEE, BITSAT & GATE Score
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* JEE Edit */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-800 block">JEE Main / Advanced</span>
                    <input
                      type="number"
                      placeholder="JEE Score"
                      value={jeeScore}
                      onChange={e => setJeeScore(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="JEE Percentile"
                      value={jeePercentile}
                      onChange={e => setJeePercentile(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                    <input
                      type="number"
                      placeholder="JEE AIR Rank"
                      value={jeeRank}
                      onChange={e => setJeeRank(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                  </div>

                  {/* BITSAT Edit */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="font-extrabold text-slate-800 block">BITSAT</span>
                    <input
                      type="number"
                      placeholder="BITSAT Score"
                      value={bitsatScore}
                      onChange={e => setBitsatScore(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="BITSAT Percentile"
                      value={bitsatPercentile}
                      onChange={e => setBitsatPercentile(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                    <input
                      type="number"
                      placeholder="BITSAT Rank"
                      value={bitsatRank}
                      onChange={e => setBitsatRank(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300"
                    />
                  </div>

                  {/* GATE SCORE EDIT */}
                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                    <span className="font-extrabold text-purple-950 block">GATE Score</span>
                    <input
                      type="number"
                      placeholder="GATE Score (out of 1000)"
                      value={gateScore}
                      onChange={e => setGateScore(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-purple-300 font-bold"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="GATE Percentile"
                      value={gatePercentile}
                      onChange={e => setGatePercentile(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-purple-300 font-bold"
                    />
                    <input
                      type="number"
                      placeholder="GATE All India Rank"
                      value={gateRank}
                      onChange={e => setGateRank(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-purple-300 font-bold"
                    />
                  </div>

                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Master Changes & Duration Overrides</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
