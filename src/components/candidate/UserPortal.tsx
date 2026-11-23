/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * UserPortal.tsx - Complete Candidate Dashboard, Dynamic Academic Profile & 3 Assessment Modules
 */

import React, { useState, useEffect } from 'react';
import {
  Candidate,
  AssessmentMaster,
  AcademicProfileRecord,
  CandidateFullAcademicProfile,
  EntranceExamRecord,
  CandidateActivitiesRecord,
  AssessmentAssignment,
  AssessmentAttempt,
  CONSOLIDATED_ASSESSMENTS,
  AssessmentType
} from '../../types';
import { ApiService } from '../../services/apiService';
import { PsychometricTestStation } from './PsychometricTestStation';
import { ReportGenerator } from '../../services/reportGenerator';
import { RadarChart } from '../common/RadarChart';
import {
  User,
  GraduationCap,
  BrainCircuit,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  BookOpen,
  FileText,
  Video,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Info,
  Calendar,
  Lock,
  PlayCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface UserPortalProps {
  initialCandidate?: Candidate;
}

export const UserPortal: React.FC<UserPortalProps> = ({ initialCandidate }) => {
  const [candidate, setCandidate] = useState<Candidate>(() => {
    if (initialCandidate) return initialCandidate;
    const session = ApiService.getCurrentSession();
    if (session && session.candidateId) {
      const found = ApiService.getCandidateById(session.candidateId);
      if (found) return found;
    }
    const list = ApiService.getCandidates();
    return list[0];
  });

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ACADEMIC_PROFILE' | 'ACTIVITIES_DOCS' | 'VIDEO_PROFILE' | 'TEST_STATION' | 'RESULTS'>('DASHBOARD');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('ASM_APTITUDE');
  const [showInstructionsModal, setShowInstructionsModal] = useState<AssessmentMaster | null>(null);
  const [isSavedInDb, setIsSavedInDb] = useState(false);

  // Load candidate academic profile
  const academicRecords = ApiService.getAcademicProfiles(candidate?.Candidate_ID || '');
  const rec10 = academicRecords.find(a => a.Education_Level === '10TH');
  const rec12 = academicRecords.find(a => a.Education_Level === '12TH');
  const recCol = academicRecords.find(a => a.Education_Level === 'COLLEGE_SEMESTER');

  // Academic Profile Form State
  const [sslc10, setSslc10] = useState({
    schoolName: rec10?.School_or_College || 'National Public School',
    board: rec10?.Board_or_University || 'CBSE',
    passingYear: rec10?.Passing_Year || '2020',
    mathsMarks: rec10?.Mathematics_Marks || 95,
    scienceMarks: rec10?.Science_Marks || 92,
    englishMarks: rec10?.English_Marks || 90,
    totalMarks: rec10?.Total_Marks || 465,
    percentage: rec10?.Percentage || 93.0
  });

  const [hsc12, setHsc12] = useState({
    schoolName: rec12?.School_or_College || 'National Junior College',
    board: rec12?.Board_or_University || 'State Board',
    passingYear: rec12?.Passing_Year || '2022',
    mathsMarks: rec12?.Mathematics_Marks || 96,
    physicsMarks: rec12?.Physics_Marks || 94,
    chemistryMarks: rec12?.Chemistry_Marks || 90,
    mpcGroupMarks: 280,
    englishMarks: rec12?.English_Marks || 88,
    totalMarks: rec12?.Total_Marks || 468,
    percentage: rec12?.Percentage || 93.6
  });

  const [collegeSemesters, setCollegeSemesters] = useState<{
    semesterNumber: number;
    marks: number;
    maxMarks: number;
    cgpa: number;
  }[]>([
    { semesterNumber: 1, marks: 820, maxMarks: 1000, cgpa: 8.5 },
    { semesterNumber: 2, marks: 840, maxMarks: 1000, cgpa: 8.7 },
    { semesterNumber: 3, marks: 860, maxMarks: 1000, cgpa: 8.9 },
    { semesterNumber: 4, marks: 880, maxMarks: 1000, cgpa: 9.1 },
    { semesterNumber: 5, marks: 890, maxMarks: 1000, cgpa: 9.2 },
    { semesterNumber: 6, marks: 910, maxMarks: 1000, cgpa: 9.4 }
  ]);

  const [overallCGPA, setOverallCGPA] = useState<number>(recCol?.Overall_CGPA || 8.97);
  const [backlogs, setBacklogs] = useState<number>(recCol?.Backlogs || 0);
  const [arrearsHistory, setArrearsHistory] = useState<string>(recCol?.Arrears_History || 'Nil');

  // Entrance Exams & Activities
  const [entranceExams] = useState<EntranceExamRecord[]>(() => ApiService.getEntranceExams(candidate?.Candidate_ID || ''));
  const [activities] = useState<CandidateActivitiesRecord | undefined>(() => ApiService.getCandidateActivities(candidate?.Candidate_ID || ''));

  // Video Profile state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('Campus Technical Presentation');
  const [videoSubmissions, setVideoSubmissions] = useState(() => ApiService.getVideoProfiles(candidate?.Candidate_ID || ''));

  // Assignments & Attempts
  const assignments = ApiService.getAssignmentsForCandidate(candidate?.Candidate_ID || '');
  const attempts = ApiService.getAttempts().filter(a => a.Candidate_ID === candidate?.Candidate_ID);
  const assessmentMaster = ApiService.getAssessmentMaster();

  // Profile completion calculation
  const isPersonalComplete = Boolean(candidate?.Full_Name && candidate?.Primary_Email && candidate?.College_ID_Number);
  const isAcademicComplete = Boolean(rec10 && rec12);
  const isDocumentComplete = Boolean(candidate?.Resume_URL || activities?.Resume_URL);
  const isVideoComplete = videoSubmissions.length > 0;

  const completionPercent = Math.round(
    (Number(isPersonalComplete) * 25) +
    (Number(isAcademicComplete) * 25) +
    (Number(isDocumentComplete) * 25) +
    (Number(isVideoComplete) * 25)
  );

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    // Recalculate average CGPA
    const avgCgpa = collegeSemesters.length > 0
      ? Math.round((collegeSemesters.reduce((acc, s) => acc + s.cgpa, 0) / collegeSemesters.length) * 100) / 100
      : overallCGPA;

    setOverallCGPA(avgCgpa);

    const fullProfile: CandidateFullAcademicProfile = {
      sslc10: {
        schoolName: sslc10.schoolName,
        board: sslc10.board,
        passingYear: sslc10.passingYear,
        mathsMarks: Number(sslc10.mathsMarks),
        scienceMarks: Number(sslc10.scienceMarks),
        englishMarks: Number(sslc10.englishMarks),
        totalMarks: Number(sslc10.totalMarks),
        percentage: Number(sslc10.percentage)
      },
      hsc12: {
        schoolName: hsc12.schoolName,
        board: hsc12.board,
        passingYear: hsc12.passingYear,
        mathsMarks: Number(hsc12.mathsMarks),
        physicsMarks: Number(hsc12.physicsMarks),
        chemistryMarks: Number(hsc12.chemistryMarks),
        mpcGroupMarks: Number(hsc12.mpcGroupMarks),
        englishMarks: Number(hsc12.englishMarks),
        totalMarks: Number(hsc12.totalMarks),
        percentage: Number(hsc12.percentage)
      },
      college: {
        collegeName: candidate.College_Name,
        degree: candidate.Degree,
        department: candidate.Department,
        academicYear: candidate.Academic_Year,
        currentSemester: candidate.Current_Semester,
        semesters: collegeSemesters,
        overallCGPA: avgCgpa,
        backlogs: Number(backlogs),
        arrearsHistory
      }
    };

    ApiService.saveFullAcademicProfile(candidate.Candidate_ID, fullProfile);
    setIsSavedInDb(true);
    setTimeout(() => setIsSavedInDb(false), 2500);
  };

  const handleAddSemester = () => {
    const nextNum = collegeSemesters.length + 1;
    setCollegeSemesters([...collegeSemesters, { semesterNumber: nextNum, marks: 850, maxMarks: 1000, cgpa: 8.5 }]);
  };

  const handleRemoveSemester = (idx: number) => {
    if (collegeSemesters.length <= 1) return;
    setCollegeSemesters(collegeSemesters.filter((_, i) => i !== idx));
  };

  const handleStartAssessmentClick = (asm: AssessmentMaster) => {
    if (candidate.Registration_Status !== 'APPROVED') {
      alert('Your candidate registration is currently Pending Approval. Assessment scheduling unlocks upon administrator approval.');
      return;
    }
    setShowInstructionsModal(asm);
  };

  const handleConfirmStartAssessment = () => {
    if (!showInstructionsModal) return;
    setSelectedAssessmentId(showInstructionsModal.Assessment_ID);
    setShowInstructionsModal(null);
    setActiveTab('TEST_STATION');
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim() || !candidate) return;
    const submitted = ApiService.submitVideoProfile({
      candidateId: candidate.Candidate_ID,
      videoUrl: videoUrl.trim(),
      videoTitle: videoTitle.trim()
    });
    setVideoSubmissions([submitted, ...videoSubmissions]);
    setVideoUrl('');
    alert('Video profile submitted for technical review!');
  };

  // If candidate is actively taking an assessment
  if (activeTab === 'TEST_STATION') {
    return (
      <PsychometricTestStation
        candidate={candidate}
        assessmentId={selectedAssessmentId}
        onFinish={() => setActiveTab('DASHBOARD')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Brand & Candidate Profile Hero Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={candidate?.Photograph_URL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={candidate?.Full_Name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-900 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
              }}
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              candidate?.Registration_Status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{candidate?.Full_Name}</h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {candidate?.Candidate_ID}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {candidate?.Degree} in {candidate?.Department} • {candidate?.College_Name}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Registration Status Badge */}
              <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                candidate?.Registration_Status === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : candidate?.Registration_Status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {candidate?.Registration_Status === 'APPROVED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>Registration: {candidate?.Registration_Status.replace(/_/g, ' ')}</span>
              </span>

              {/* College ID */}
              <span className="text-[11px] text-slate-500 font-medium">
                Roll No: <span className="font-semibold text-slate-700">{candidate?.College_ID_Number}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full md:w-56 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600">Profile Readiness</span>
            <span className="text-blue-900">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Academic: {isAcademicComplete ? '✓' : 'Pending'}</span>
            <span>Docs: {isDocumentComplete ? '✓' : 'Pending'}</span>
            <span>Video: {isVideoComplete ? '✓' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* Candidate Subnav Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DASHBOARD'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Assessment Station</span>
          </button>

          <button
            onClick={() => setActiveTab('ACADEMIC_PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ACADEMIC_PROFILE'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITIES_DOCS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ACTIVITIES_DOCS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Exams & Activities</span>
          </button>

          <button
            onClick={() => setActiveTab('VIDEO_PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'VIDEO_PROFILE'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>AI Video Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESULTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MAIN DASHBOARD & THE 3 STANDARDIZED ASSESSMENTS
          ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          
          {/* Registration Status Notice Banner */}
          {candidate?.Registration_Status === 'PENDING_APPROVAL' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-start gap-3.5">
              <Clock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">Registration Under Institutional Review</h3>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Your campus candidate registration is currently being verified by the placement coordinator. Once approved, the assessment station will activate for supervised lab administration.
                </p>
              </div>
            </div>
          )}

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Standardized Campus Assessments</h2>
              <p className="text-xs text-slate-500">Three mandatory modules • 30 Questions • 30 Marks each • Single attempt</p>
            </div>
          </div>

          {/* EXACTLY THREE CONSOLIDATED ASSESSMENT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {assessmentMaster.map((asm) => {
              const assign = assignments.find(a => a.Assessment_ID === asm.Assessment_ID);
              const attempt = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'COMPLETED');
              const inProgress = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'IN_PROGRESS');

              // Determine Card Status Color
              // Green: Completed | Orange: Pending / In Progress | Blue: Scheduled / Available | Grey: Locked
              let statusColor = 'border-slate-200 bg-white';
              let badgeColor = 'bg-slate-100 text-slate-600';
              let statusText = 'Locked';
              let isClickable = false;

              if (attempt) {
                statusColor = 'border-emerald-300 bg-emerald-50/20';
                badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                statusText = `Completed (${attempt.Score}/30)`;
              } else if (inProgress) {
                statusColor = 'border-amber-300 bg-amber-50/20';
                badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                statusText = 'In Progress';
                isClickable = true;
              } else if (candidate.Registration_Status === 'APPROVED') {
                statusColor = 'border-blue-300 bg-blue-50/20';
                badgeColor = 'bg-blue-100 text-blue-900 border border-blue-300';
                statusText = assign?.Retake_Approved ? 'Retake Authorized' : 'Scheduled / Available';
                isClickable = true;
              }

              return (
                <div
                  key={asm.Assessment_ID}
                  className={`rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md ${statusColor}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                        {statusText}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-900">
                        {asm.Assessment_Type === 'APTITUDE' ? (
                          <BrainCircuit className="w-4 h-4" />
                        ) : asm.Assessment_Type === 'COMPREHENSION' ? (
                          <BookOpen className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {asm.Assessment_Name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {asm.Assessment_Type === 'APTITUDE'
                          ? 'CAT-style aptitude covering Quantitative, Logical, Verbal, and Analytical reasoning.'
                          : asm.Assessment_Type === 'COMPREHENSION'
                          ? '3 reading passages with 10 questions each evaluating textual inference and analysis.'
                          : '6 realistic workplace situations with 5 questions each assessing EQ and situational judgment.'}
                      </p>
                    </div>

                    {/* Meta Specs */}
                    <div className="bg-white/80 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date:</span>
                        <span className="font-semibold text-slate-800">{assign?.Scheduled_Date || 'Campus Lab Day'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration:</span>
                        <span className="font-semibold text-slate-800">{asm.Duration_Minutes} Minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Marks:</span>
                        <span className="font-semibold text-slate-800">{asm.Total_Questions} Qs • {asm.Total_Marks} Marks</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-5 border-t border-slate-100 mt-4">
                    {attempt ? (
                      <button
                        onClick={() => setActiveTab('RESULTS')}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Results</span>
                      </button>
                    ) : isClickable ? (
                      <button
                        onClick={() => handleStartAssessmentClick(asm)}
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{inProgress ? 'Resume Assessment' : 'Start Assessment'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Approval Required</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: DYNAMIC ACADEMIC PROFILE (10TH, 12TH, DYNAMIC SEMESTERS)
          ========================================================================= */}
      {activeTab === 'ACADEMIC_PROFILE' && (
        <form onSubmit={handleSaveAcademic} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Academic Credentials & Semester Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">Mandatory academic profile for campus placement and comparative evaluation</p>
            </div>
            {isSavedInDb && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Academic Profile Synchronized</span>
              </span>
            )}
          </div>

          {/* Section 1: 10th Standard / SSLC */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
              1. 10th Standard / SSLC Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={sslc10.schoolName}
                  onChange={e => setSslc10({ ...sslc10, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                <input
                  type="text"
                  value={sslc10.board}
                  onChange={e => setSslc10({ ...sslc10, board: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="text"
                  value={sslc10.passingYear}
                  onChange={e => setSslc10({ ...sslc10, passingYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mathematics Marks</label>
                <input
                  type="number"
                  value={sslc10.mathsMarks}
                  onChange={e => setSslc10({ ...sslc10, mathsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Science Marks</label>
                <input
                  type="number"
                  value={sslc10.scienceMarks}
                  onChange={e => setSslc10({ ...sslc10, scienceMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Marks</label>
                <input
                  type="number"
                  value={sslc10.englishMarks}
                  onChange={e => setSslc10({ ...sslc10, englishMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall 10th Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sslc10.percentage}
                  onChange={e => setSslc10({ ...sslc10, percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 12th Standard / HSC */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
              2. 12th Standard / HSC (MPC / Technical Stream)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Junior College / School Name</label>
                <input
                  type="text"
                  value={hsc12.schoolName}
                  onChange={e => setHsc12({ ...hsc12, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board</label>
                <input
                  type="text"
                  value={hsc12.board}
                  onChange={e => setHsc12({ ...hsc12, board: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="text"
                  value={hsc12.passingYear}
                  onChange={e => setHsc12({ ...hsc12, passingYear: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mathematics Marks</label>
                <input
                  type="number"
                  value={hsc12.mathsMarks}
                  onChange={e => setHsc12({ ...hsc12, mathsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physics Marks</label>
                <input
                  type="number"
                  value={hsc12.physicsMarks}
                  onChange={e => setHsc12({ ...hsc12, physicsMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chemistry Marks</label>
                <input
                  type="number"
                  value={hsc12.chemistryMarks}
                  onChange={e => setHsc12({ ...hsc12, chemistryMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">English Marks</label>
                <input
                  type="number"
                  value={hsc12.englishMarks}
                  onChange={e => setHsc12({ ...hsc12, englishMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Overall 12th Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hsc12.percentage}
                  onChange={e => setHsc12({ ...hsc12, percentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: College Dynamic Semesters */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-xl inline-block">
                  3. College Degree Semester-wise Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-1">Add all completed semesters according to your degree duration</p>
              </div>

              <button
                type="button"
                onClick={handleAddSemester}
                className="px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Semester</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collegeSemesters.map((sem, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                      S{sem.semesterNumber}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800">Semester {sem.semesterNumber}</span>
                      <span className="text-[11px] text-slate-400 block">Marks: {sem.marks} / {sem.maxMarks}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        max="10.0"
                        min="0"
                        value={sem.cgpa}
                        onChange={e => {
                          const updated = [...collegeSemesters];
                          updated[idx].cgpa = Number(e.target.value);
                          setCollegeSemesters(updated);
                        }}
                        className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 text-center"
                      />
                    </div>
                    {collegeSemesters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSemester(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall CGPA and Backlogs summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
                <span className="text-xs font-bold text-slate-600 block">Overall Cumulative CGPA (10-Point Scale)</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {collegeSemesters.length > 0
                    ? (collegeSemesters.reduce((acc, s) => acc + s.cgpa, 0) / collegeSemesters.length).toFixed(2)
                    : overallCGPA.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Active Backlogs / Arrears</label>
                <input
                  type="number"
                  min="0"
                  value={backlogs}
                  onChange={e => setBacklogs(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Arrears History (Cleared)</label>
                <input
                  type="text"
                  value={arrearsHistory}
                  onChange={e => setArrearsHistory(e.target.value)}
                  placeholder="Nil or Cleared in 2nd attempt"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Academic Credentials</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: ENTRANCE EXAMS & ACTIVITIES
          ========================================================================= */}
      {activeTab === 'ACTIVITIES_DOCS' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">National Entrance Examinations & Activities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Competitive entrance benchmarks, NCC certifications, and extracurricular achievements</p>
          </div>

          {/* Entrance Exams Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Competitive Entrance Examinations</h3>
            {entranceExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entranceExams.map(ex => (
                  <div key={ex.Exam_Record_ID} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">{ex.Examination_Name.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] font-mono text-slate-500">Year: {ex.Examination_Year}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                        <span className="font-bold text-slate-800">{ex.Score || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Percentile</span>
                        <span className="font-bold text-blue-900">{ex.Percentile ? `${ex.Percentile}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Rank</span>
                        <span className="font-bold text-slate-800">{ex.Rank ? `#${ex.Rank}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No entrance examinations logged. Details can be updated in candidate registration settings.
              </div>
            )}
          </div>

          {/* Activities Summary */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activities & Institutional Engagement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">NCC Participation</span>
                <p className="text-slate-600">{activities?.NCC_Participation || 'No participation recorded'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Sports Activities</span>
                <p className="text-slate-600">{activities?.Sports_Activities || 'None recorded'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="font-bold text-slate-700 block mb-1">Honors & Achievements</span>
                <p className="text-slate-600">{activities?.Achievements || 'None recorded'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AI VIDEO PROFILE SUBMISSION
          ========================================================================= */}
      {activeTab === 'VIDEO_PROFILE' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">AI Video Profile & Technical Introduction</h2>
            <p className="text-xs text-slate-500 mt-0.5">Record or submit a 2-minute video pitch highlighting your technical projects and leadership skills</p>
          </div>

          <form onSubmit={handleVideoSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Submit New Video Pitch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video Presentation Title</label>
                <input
                  type="text"
                  required
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture Overview"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Video URL (Google Drive, Loom, YouTube or Cloud URL)</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or https://loom.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Videos are archived in Google Drive and evaluated for communication and structural articulation.
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-800 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Submit Video</span>
              </button>
            </div>
          </form>

          {/* Submissions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived Submissions</h3>
            {videoSubmissions.length > 0 ? (
              <div className="space-y-3">
                {videoSubmissions.map(v => (
                  <div key={v.Video_ID} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{v.Video_Title}</h4>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Submitted on {new Date(v.Submission_Date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        v.Review_Status === 'REVIEWED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {v.Review_Status}
                      </span>
                      <a
                        href={v.Video_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No video submission recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: OFFICIAL RESULTS & STEN RADAR
          ========================================================================= */}
      {activeTab === 'RESULTS' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Official Psychometric Assessment Summary</h2>
              <p className="text-xs text-slate-500 mt-0.5">Standardized STEN Normative Scale (Mean 5.5, SD 2.0)</p>
            </div>
            <button
              onClick={() => {
                const report = ApiService.getReports(candidate.Candidate_ID)[0] || {
                  Report_ID: `RPT_${candidate.Candidate_ID}`,
                  Candidate_ID: candidate.Candidate_ID,
                  Report_Type: 'PSYCHOMETRIC',
                  Composite_Score: 92,
                  Aptitude_Score: 94,
                  Strengths: ['High analytical and quantitative deduction', 'Strong empathy and de-escalation'],
                  Development_Areas: ['Further refine speed on non-linear data matrices'],
                  Created_At: new Date().toISOString()
                };
                ReportGenerator.generatePsychometricPdf(candidate, ApiService.getScores(candidate.Candidate_ID), report);
              }}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-blue-800"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assessmentMaster.map(asm => {
              const att = attempts.find(a => a.Assessment_ID === asm.Assessment_ID && a.Attempt_Status === 'COMPLETED');
              return (
                <div key={asm.Assessment_ID} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{asm.Assessment_Type}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      {att ? `${att.Score} / 30` : 'Not Taken'}
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      {att ? `${Math.round((att.Score / 30) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Status: {att ? 'Validated & Stored in Google Sheets' : 'Pending Attempt'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          INSTRUCTIONS & CONFIRMATION MODAL BEFORE STARTING ASSESSMENT
          ========================================================================= */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{showInstructionsModal.Assessment_Name}</h3>
                <p className="text-xs text-slate-500">Supervised Campus Assessment Protocol</p>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-900">Mandatory Assessment Guidelines:</div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Total Questions: <span className="font-semibold text-slate-900">30 Questions</span> (1 mark per question, Total: 30 marks).</li>
                <li>Duration: <span className="font-semibold text-slate-900">{showInstructionsModal.Duration_Minutes} Minutes</span>. The server timer starts immediately upon confirmation.</li>
                <li>Single Attempt Rule: Once initiated, retakes are strictly locked and can only be authorized by an administrator.</li>
                <li>Autosave Active: Responses synchronize automatically per question selection.</li>
                <li>Anti-Cheating Policy: Fullscreen is monitored, right-click/copying is disabled, and tab visibility changes will trigger audit warnings.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartAssessment}
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Start Timer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
