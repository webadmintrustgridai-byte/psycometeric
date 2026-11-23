/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * AdminPortal.tsx - Unified Admin Management Console
 */

import React, { useState } from 'react';
import { Candidate } from '../../types';
import { RecruiterDashboard } from '../recruiter/RecruiterDashboard';
import { CandidateComparisonMatrix } from '../recruiter/CandidateComparisonMatrix';
import { CandidateDetailModal } from '../recruiter/CandidateDetailModal';
import { AssessmentTemplateBuilder } from './AssessmentTemplateBuilder';
import { ReportViewerModal } from '../reports/ReportViewerModal';
import {
  Users,
  GitCompare,
  FileSpreadsheet,
  Sliders,
  BrainCircuit,
  Sparkles
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CANDIDATES' | 'COMPARISON' | 'REPORTS' | 'QUESTIONS'>('CANDIDATES');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Admin Subnav Tabs */}
      <div className="bg-white rounded-3xl p-2 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CANDIDATES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'CANDIDATES'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidates & Test Results</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'COMPARISON'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>Candidate Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'REPORTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Reports & PDF Export</span>
          </button>

          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'QUESTIONS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Assessment Settings</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CANDIDATES MANAGEMENT */}
      {activeTab === 'CANDIDATES' && (
        <RecruiterDashboard
          onOpenCandidateDrawer={(c) => setSelectedCandidate(c)}
        />
      )}

      {/* TAB 2: CANDIDATE COMPARISON */}
      {activeTab === 'COMPARISON' && (
        <CandidateComparisonMatrix />
      )}

      {/* TAB 3: REPORTS */}
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
              Open Report Viewer & PDF
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Standard Psychometric Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Includes candidate profile, Big Five personality profile (normed STEN 1-10 scale), aptitude deduction percentiles, situational judgment performance, and behavioural strengths.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs font-bold text-blue-900 hover:underline pt-2 block"
            >
              View Report & Download PDF →
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: ASSESSMENT SETTINGS */}
      {activeTab === 'QUESTIONS' && (
        <AssessmentTemplateBuilder />
      )}

      {/* Candidate 360 Detail Drawer */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          isOpen={true}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Report Viewer Modal */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>
  );
};
