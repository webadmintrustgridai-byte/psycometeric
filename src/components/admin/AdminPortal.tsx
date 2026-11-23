/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * AdminPortal.tsx - Unified Admin Management Console (All 6 Governance Modules)
 */

import React, { useState } from 'react';
import { Candidate } from '../../types';
import { RecruiterDashboard } from '../recruiter/RecruiterDashboard';
import { CandidateComparisonMatrix } from '../recruiter/CandidateComparisonMatrix';
import { CandidateDetailModal } from '../recruiter/CandidateDetailModal';
import { QuestionBankManager } from './QuestionBankManager';
import { AdminVideoReview } from './AdminVideoReview';
import { ReportViewerModal } from '../reports/ReportViewerModal';
import { ApiService } from '../../services/apiService';
import {
  Users,
  GitCompare,
  FileSpreadsheet,
  Sliders,
  BrainCircuit,
  Video,
  ShieldCheck,
  Activity,
  Download
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CANDIDATES' | 'QUESTIONS' | 'COMPARISON' | 'VIDEOS' | 'REPORTS' | 'AUDIT'>('CANDIDATES');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const auditLogs = ApiService.getAuditLogs();

  return (
    <div className="space-y-6">
      
      {/* Admin Subnav Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CANDIDATES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'CANDIDATES'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Candidates & Approvals</span>
          </button>

          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'QUESTIONS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Question Bank</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'COMPARISON'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>3. Candidate Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('VIDEOS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'VIDEOS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>4. Video Review Console</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'REPORTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>5. Reports & PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'AUDIT'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>6. System Audit Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CANDIDATES MANAGEMENT & LAB SCHEDULING */}
      {activeTab === 'CANDIDATES' && (
        <RecruiterDashboard
          onOpenCandidateDrawer={(c) => setSelectedCandidate(c)}
        />
      )}

      {/* TAB 2: QUESTION BANK MANAGEMENT */}
      {activeTab === 'QUESTIONS' && (
        <QuestionBankManager />
      )}

      {/* TAB 3: CANDIDATE COMPARISON */}
      {activeTab === 'COMPARISON' && (
        <CandidateComparisonMatrix />
      )}

      {/* TAB 4: CANDIDATE VIDEO REVIEW */}
      {activeTab === 'VIDEOS' && (
        <AdminVideoReview />
      )}

      {/* TAB 5: REPORTS & PDF EXPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Psychometric Assessment Reports & PDF Exports</h1>
              <p className="text-xs text-slate-500 mt-1">Export official validated psychometric assessment results and trait radar charts</p>
            </div>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open Report Viewer & PDF</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Standard Psychometric Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Includes candidate profile, 10th/12th/College transcripts, Big Five personality profile (normed STEN 1-10 scale), aptitude deduction percentiles, situational judgment performance, and behavioural strengths.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md inline-block hover:bg-blue-800"
            >
              Launch Interactive PDF Generator
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS (DB_14_Audit_Log) */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">System Audit Trail (DB_14_Audit_Log)</h2>
              <p className="text-xs text-slate-500">Immutable chronological record of logins, registration reviews, retakes, and assessment events</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-6">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.length > 0 ? (
                  auditLogs.map(l => (
                    <tr key={l.Log_ID} className="hover:bg-slate-50">
                      <td className="py-3 px-6 text-slate-500 whitespace-nowrap">
                        {new Date(l.Timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{l.User_ID}</span> ({l.User_Role})
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-semibold">
                          {l.Action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {l.Entity_Type}: {l.Entity_ID}
                      </td>
                      <td className="py-3 px-6 text-slate-700 font-sans text-xs">
                        {l.Details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* REPORT VIEWER MODAL */}
      {isReportModalOpen && (
        <ReportViewerModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

    </div>
  );
};
