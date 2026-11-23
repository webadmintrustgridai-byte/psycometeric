/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * RecruiterDashboard.tsx - Candidate Management, Lab Scheduling & 10 Metric Analytics
 */

import React, { useState } from 'react';
import {
  Candidate,
  AssessmentMaster,
  AssessmentAssignment,
  AssessmentAttempt
} from '../../types';
import { ApiService } from '../../services/apiService';
import { CandidateRegistrationModal } from '../candidate/CandidateRegistrationModal';
import { CandidateDetailModal } from './CandidateDetailModal';
import {
  Users,
  BrainCircuit,
  Search,
  UserPlus,
  Eye,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  RotateCcw,
  Download,
  Filter,
  Check,
  X,
  ShieldCheck,
  Building,
  GraduationCap,
  PlayCircle,
  Sliders,
  Trash2
} from 'lucide-react';

interface RecruiterDashboardProps {
  onOpenCandidateDrawer: (candidate: Candidate) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  onOpenCandidateDrawer
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>(() => ApiService.getCandidates());
  const [assignments, setAssignments] = useState<AssessmentAssignment[]>(() => ApiService.getAssignments());
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>(() => ApiService.getAttempts());
  const assessmentMaster = ApiService.getAssessmentMaster();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'PSYCHOMETRICS' | 'ACADEMIC_EXAMS' | 'ADMIN_CONTROLS'>('PSYCHOMETRICS');
  const [scheduleModalCandidate, setScheduleModalCandidate] = useState<Candidate | null>(null);
  const [retakeModalCandidate, setRetakeModalCandidate] = useState<Candidate | null>(null);

  // Scheduling Form
  const [schedAssessmentId, setSchedAssessmentId] = useState('ASM_APTITUDE');
  const [schedDate, setSchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedTime, setSchedTime] = useState('10:00');
  const [schedDuration, setSchedDuration] = useState(30);

  // Retake Form
  const [retakeAssessmentId, setRetakeAssessmentId] = useState('ASM_APTITUDE');
  const [retakeReason, setRetakeReason] = useState('Supervised campus network reconnection authorized by coordinator.');

  // Live Assessment Controller State
  const [liveStates, setLiveStates] = useState<Record<string, boolean>>(() => ApiService.getAssessmentLiveState());

  const handleToggleAssessmentLive = (asmId: string) => {
    const isCurrentlyLive = liveStates[asmId] === true;
    const nextState = !isCurrentlyLive;
    const updated = ApiService.setAssessmentLiveState(asmId, nextState);
    setLiveStates({ ...updated });
  };

  const handleToggleAllAssessments = (enable: boolean) => {
    const updated = ApiService.setAllAssessmentsLive(enable);
    setLiveStates({ ...updated });
  };

  // ==========================================
  // 10 METRIC ANALYTICS (PART 13 REQUIREMENT)
  // ==========================================
  const totalCandidates = candidates.length;
  const pendingRegistrations = candidates.filter(c => c.Registration_Status === 'PENDING_APPROVAL').length;
  const approvedCandidates = candidates.filter(c => c.Registration_Status === 'APPROVED').length;
  const profileCompleted = candidates.filter(c => c.Profile_Status === 'PROFILE_COMPLETED').length;

  const scheduledAssignments = assignments.filter(a => a.Assignment_Status === 'SCHEDULED').length;
  const inProgressAttempts = attempts.filter(a => a.Attempt_Status === 'IN_PROGRESS').length;
  const completedAttempts = attempts.filter(a => a.Attempt_Status === 'COMPLETED');
  const assessmentsCompletedCount = completedAttempts.length;

  // Candidates yet to complete all 3 assessments
  const candidatesYetToComplete = candidates.filter(c => {
    const cCompleted = completedAttempts.filter(a => a.Candidate_ID === c.Candidate_ID).length;
    return cCompleted < 3;
  }).length;

  const totalScoreSum = completedAttempts.reduce((acc, curr) => acc + curr.Score, 0);
  const averageScore = completedAttempts.length > 0 ? (totalScoreSum / completedAttempts.length).toFixed(1) : 'N/A';
  const highestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.Score)) : 'N/A';

  // Available unique filters
  const uniqueColleges = Array.from(new Set(candidates.map(c => c.College_Name).filter(Boolean)));
  const uniqueDepts = Array.from(new Set(candidates.map(c => c.Department).filter(Boolean)));
  const uniqueYears = Array.from(new Set(candidates.map(c => c.Academic_Year).filter(Boolean)));

  // Filtered Candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.Full_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.Primary_Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.Candidate_ID && c.Candidate_ID.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.College_ID_Number && c.College_ID_Number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.College_Name && c.College_Name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCollege = collegeFilter === 'ALL' || c.College_Name === collegeFilter;
    const matchesDept = deptFilter === 'ALL' || c.Department === deptFilter;
    const matchesYear = yearFilter === 'ALL' || c.Academic_Year === yearFilter;
    const matchesStatus = statusFilter === 'ALL' || c.Registration_Status === statusFilter;

    return matchesSearch && matchesCollege && matchesDept && matchesYear && matchesStatus;
  });

  const handleApprove = (c: Candidate) => {
    const updated = ApiService.approveRegistration(c.Candidate_ID, 'USR_ADMIN_001');
    setCandidates(candidates.map(cand => cand.Candidate_ID === c.Candidate_ID ? updated : cand));
  };

  const handleReject = (c: Candidate) => {
    const updated = ApiService.rejectRegistration(c.Candidate_ID, 'USR_ADMIN_001');
    setCandidates(candidates.map(cand => cand.Candidate_ID === c.Candidate_ID ? updated : cand));
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalCandidate) return;

    ApiService.scheduleAssessment({
      candidateIds: [scheduleModalCandidate.Candidate_ID],
      assessmentId: schedAssessmentId,
      scheduledDate: schedDate,
      scheduledStartTime: schedTime,
      durationMinutes: schedDuration,
      adminId: 'USR_ADMIN_001'
    });

    setAssignments(ApiService.getAssignments());
    setScheduleModalCandidate(null);
    alert(`Assessment scheduled for ${scheduleModalCandidate.Full_Name} on ${schedDate} at ${schedTime}.`);
  };

  const handleRetakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retakeModalCandidate) return;

    ApiService.authorizeRetake(
      retakeModalCandidate.Candidate_ID,
      retakeAssessmentId,
      'USR_ADMIN_001',
      retakeReason
    );

    setAssignments(ApiService.getAssignments());
    setRetakeModalCandidate(null);
    alert(`Retake authorized for ${retakeModalCandidate.Full_Name}. Reason recorded in audit log.`);
  };

  const handleClearAllRecords = () => {
    if (window.confirm('Are you sure you want to purge all candidate records, test attempts, and responses? Assessment templates and Question Banks will remain completely intact.')) {
      ApiService.clearAllCandidateRecords('ADM_001');
      setCandidates([]);
      alert('All candidate records have been cleared. Ready for fresh candidate onboarding.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Candidate_ID', 'Full_Name', 'Email', 'College', 'Department', 'Semester', 'Status', 'Aptitude_Score', 'Comprehension_Score', 'EI_Score'];
    const rows = candidates.map(c => {
      const apt = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_APTITUDE')?.Score ?? 'N/A';
      const cmp = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_COMPREHENSION')?.Score ?? 'N/A';
      const ei = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_EI_SITUATIONAL')?.Score ?? 'N/A';
      return [
        c.Candidate_ID,
        `"${c.Full_Name}"`,
        c.Primary_Email,
        `"${c.College_Name}"`,
        `"${c.Department}"`,
        c.Current_Semester,
        c.Registration_Status,
        apt,
        cmp,
        ei
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trustgrid_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* 10 DASHBOARD STATISTIC CARDS (PART 13 REQUIREMENT) */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">Campus Assessment Telemetry</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Candidates</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCandidates}</span>
            <span className="text-[10px] text-slate-400">Enrolled in system</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase block">Pending Review</span>
            <span className="text-2xl font-black text-amber-700 mt-1 block">{pendingRegistrations}</span>
            <span className="text-[10px] text-amber-600">Awaiting approval</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase block">Approved</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{approvedCandidates}</span>
            <span className="text-[10px] text-emerald-600">Ready for testing</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-900 uppercase block">Profile Completed</span>
            <span className="text-2xl font-black text-blue-900 mt-1 block">{profileCompleted}</span>
            <span className="text-[10px] text-slate-400">10th, 12th & College</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Scheduled</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{scheduledAssignments}</span>
            <span className="text-[10px] text-slate-400">Lab dates set</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-600 uppercase block">In Progress</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{inProgressAttempts}</span>
            <span className="text-[10px] text-purple-600">Live active sessions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase block">Completed Tests</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">{assessmentsCompletedCount}</span>
            <span className="text-[10px] text-emerald-600">30 Qs / 30 M scored</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Yet to Complete</span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">{candidatesYetToComplete}</span>
            <span className="text-[10px] text-slate-400">Missing 1+ assessments</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-900 uppercase block">Average Score</span>
            <span className="text-2xl font-black text-blue-950 mt-1 block">{averageScore} / 30</span>
            <span className="text-[10px] text-slate-400">Across completed tests</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Highest Score</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{highestScore} / 30</span>
            <span className="text-[10px] text-emerald-600">Top candidate benchmark</span>
          </div>
        </div>
      </div>

      {/* CAMPUS ASSESSMENT LIVE CONTROLLER (ADMIN MASTER ACTIVATION) */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-900/40 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Campus Assessment Live Controller</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Admin Master Switch
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Start or stop assessments here. Once started, all candidates can immediately access and attend the assessment without individual approvals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleToggleAllAssessments(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 border border-emerald-400/40"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start All 3 Assessments for Everyone</span>
            </button>

            <button
              onClick={() => handleToggleAllAssessments(false)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
            >
              <span>Stop / Close All</span>
            </button>
          </div>
        </div>

        {/* The 3 Assessment Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assessmentMaster.map(asm => {
            const isLive = liveStates[asm.Assessment_ID] === true;
            return (
              <div
                key={asm.Assessment_ID}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLive
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      isLive
                        ? 'bg-emerald-500 text-emerald-950 font-black'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-950 animate-ping' : 'bg-slate-500'}`} />
                      <span>{isLive ? 'LIVE • OPEN TO ALL' : 'STOPPED / CLOSED'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {asm.Duration_Minutes} Mins • 30 Qs
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white leading-snug">
                    {asm.Assessment_Name}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {asm.Assessment_Type === 'APTITUDE'
                      ? 'CAT-standard quantitative, logical & verbal reasoning'
                      : asm.Assessment_Type === 'COMPREHENSION'
                      ? '3 reading passages with 1500–3000 words & 10 questions each'
                      : 'Emotional intelligence & situational workplace judgment'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {isLive ? 'Candidates can start now' : 'Candidates see: Waiting for Admin'}
                  </span>
                  <button
                    onClick={() => handleToggleAssessmentLive(asm.Assessment_ID)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                      isLive
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black'
                    }`}
                  >
                    <span>{isLive ? 'Stop Assessment' : 'Start Assessment'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CANDIDATES TABLE & MANAGEMENT TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">

        {/* Toolbar Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Candidate Records & Assessment Lifecycle</h2>
            <p className="text-xs text-slate-500">Supervise registration approvals, campus lab scheduling, retakes & scored results</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleClearAllRecords}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-rose-200"
              title="Purge all candidate records to start with a clean slate"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Candidate Records</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Candidate</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search name, email, roll..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
          >
            <option value="ALL">All Colleges</option>
            {uniqueColleges.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
          >
            <option value="ALL">All Academic Years</option>
            {uniqueYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium text-slate-700"
          >
            <option value="ALL">All Registration Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Candidate Details</th>
                <th className="py-3 px-4">College & Department</th>
                <th className="py-3 px-4">Reg Status</th>
                <th className="py-3 px-4">Assessments Status (Score / 30)</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(c => {
                  const apt = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_APTITUDE' && a.Attempt_Status === 'COMPLETED');
                  const cmp = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_COMPREHENSION' && a.Attempt_Status === 'COMPLETED');
                  const ei = attempts.find(a => a.Candidate_ID === c.Candidate_ID && a.Assessment_ID === 'ASM_EI_SITUATIONAL' && a.Attempt_Status === 'COMPLETED');

                  return (
                    <tr key={c.Candidate_ID} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.Photograph_URL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt={c.Full_Name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
                            }}
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block">{c.Full_Name}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">{c.Candidate_ID} • {c.Primary_Email}</span>
                          </div>
                        </div>
                      </td>

                      {/* College & Department */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">{c.College_Name}</span>
                        <span className="text-[11px] text-slate-500 block">{c.Department} ({c.Academic_Year})</span>
                      </td>

                      {/* Registration Status & Inline Approval */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${c.Registration_Status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : c.Registration_Status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                            {c.Registration_Status.replace(/_/g, ' ')}
                          </span>

                          {c.Registration_Status === 'PENDING_APPROVAL' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleApprove(c)}
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Approve Registration"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleReject(c)}
                                className="p-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                title="Reject Registration"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3 Assessments Status / Score Badges */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${apt ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-slate-100 text-slate-500'
                            }`} title="Assessment 1: Aptitude">
                            Apt: {apt ? `${apt.Score}/30` : 'Pending'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cmp ? 'bg-indigo-50 text-indigo-900 border border-indigo-200' : 'bg-slate-100 text-slate-500'
                            }`} title="Assessment 2: Comprehension">
                            Cmp: {cmp ? `${cmp.Score}/30` : 'Pending'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${ei ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'bg-slate-100 text-slate-500'
                            }`} title="Assessment 3: Emotional Intelligence & SJT">
                            EI: {ei ? `${ei.Score}/30` : 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCandidate(c);
                              setDetailModalTab('ADMIN_CONTROLS');
                            }}
                            className="p-1.5 rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                            title="Admin Master Controls: Edit Details, Increase Duration & Retakes"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCandidate(c);
                              setDetailModalTab('PSYCHOMETRICS');
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                            title="View Full Profile Drawer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setScheduleModalCandidate(c)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                            title="Schedule Lab Assessment"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setRetakeModalCandidate(c)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-purple-900 hover:bg-purple-50 transition-colors"
                            title="Authorize Retake"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                    No candidates match the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL 1: REGISTRATION MODAL */}
      <CandidateRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newCandidate) => {
          setCandidates([newCandidate, ...candidates]);
        }}
      />

      {/* MODAL 2: CANDIDATE DETAIL DRAWER & ADMIN MASTER CONTROLS */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={Boolean(selectedCandidate)}
          initialTab={detailModalTab}
          onClose={() => setSelectedCandidate(null)}
          onCandidateUpdated={() => {
            setCandidates(ApiService.getCandidates());
          }}
        />
      )}

      {/* MODAL 3: SCHEDULE LAB ASSESSMENT */}
      {scheduleModalCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Schedule Lab Assessment</h3>
                <p className="text-xs text-slate-500">Candidate: {scheduleModalCandidate.Full_Name}</p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Assessment</label>
                <select
                  value={schedAssessmentId}
                  onChange={e => setSchedAssessmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                >
                  {assessmentMaster.map(a => (
                    <option key={a.Assessment_ID} value={a.Assessment_ID}>{a.Assessment_Name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={schedDate}
                  onChange={e => setSchedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    value={schedDuration}
                    onChange={e => setSchedDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalCandidate(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: AUTHORIZE RETAKE */}
      {retakeModalCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Authorize Assessment Retake</h3>
                <p className="text-xs text-slate-500">Candidate: {retakeModalCandidate.Full_Name}</p>
              </div>
            </div>

            <form onSubmit={handleRetakeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assessment to Unlock</label>
                <select
                  value={retakeAssessmentId}
                  onChange={e => setRetakeAssessmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold"
                >
                  {assessmentMaster.map(a => (
                    <option key={a.Assessment_ID} value={a.Assessment_ID}>{a.Assessment_Name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Justification (Logged to Audit)</label>
                <textarea
                  rows={3}
                  required
                  value={retakeReason}
                  onChange={e => setRetakeReason(e.target.value)}
                  placeholder="e.g. Lab workstation power outage during question 14; authorized by coordinator."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRetakeModalCandidate(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Authorize Retake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
