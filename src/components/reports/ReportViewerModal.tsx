/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * ReportViewerModal.tsx - Official Psychometric PDF Candidate Report
 */

import React from 'react';
import { ApiService } from '../../services/apiService';
import { ReportGenerator } from '../../services/reportGenerator';
import { RadarChart } from '../common/RadarChart';
import {
  FileSpreadsheet,
  Download,
  Printer,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  candidateId = 'CAN_000001'
}) => {
  if (!isOpen) return null;

  const candidate = ApiService.getCandidateById(candidateId) || ApiService.getCandidates()[0];

  if (!candidate) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900">No Assessment Reports Yet</h3>
          <p className="text-xs text-slate-500">
            Candidate reports and PDF downloads will be available here once candidates sign up and complete their psychometric testing.
          </p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md">
            Close
          </button>
        </div>
      </div>
    );
  }

  const scores = ApiService.getScores(candidate.Candidate_ID);
  const reports = ApiService.getReports(candidate.Candidate_ID);

  const currentReport = reports[0] || {
    Report_ID: 'RPT_000001',
    Candidate_ID: candidate.Candidate_ID,
    Report_Type: 'PSYCHOMETRIC',
    Composite_Score: 92,
    Aptitude_Score: 100,
    Strengths: [
      'Top-decile analytical and mathematical reasoning',
      'Disciplined conscientiousness with high fidelity to architectural quality',
      'Composed analytical demeanor during complex troubleshooting'
    ],
    Development_Areas: [
      'Expand comfort with high-level conceptual ambiguity',
      'Prioritize asynchronous documentation for remote engineering squads'
    ],
    Created_At: new Date().toISOString()
  };

  const personalityScores = scores.filter(s => s.Category === 'PERSONALITY');
  const radarData = personalityScores.map(p => ({
    label: p.Trait_Name.replace(/_/g, ' '),
    value: p.Sten_Score,
    maxValue: 10
  }));

  const handleExportPdf = () => {
    ReportGenerator.generatePsychometricPdf(candidate, scores, currentReport);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">

        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Psychometric Assessment Report</h2>
              <p className="text-[11px] text-slate-500">{candidate.Full_Name} ({candidate.Candidate_ID})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Viewport */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-0">

          {/* Printable Brand Header */}
          <div className="border-b-2 border-blue-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-blue-900 tracking-tight">
                TRUSTGRID<span className="text-slate-900">.AI</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold pl-2 border-l border-slate-200">
                Online Psychometric Assessment Platform
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              OFFICIAL TALENT REPORT
            </span>
          </div>

          {/* Candidate Profile Header Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{candidate.Full_Name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {candidate.Current_Designation} • {candidate.Current_Organization} • {candidate.Location}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Candidate ID: {candidate.Candidate_ID} | Email: {candidate.Email}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Composite Score</span>
              <span className="text-2xl font-extrabold text-blue-900">{currentReport.Composite_Score}%</span>
            </div>
          </div>

          {/* Psychometric Content */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col items-center">
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Big Five Personality Radar</h4>
                <RadarChart data={radarData} size={260} />
              </div>
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Assessment Domains</h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <span>Aptitude (Numerical & Logical):</span>
                  <strong className="text-blue-900">100% (Superior)</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <span>Situational Judgement (SJT):</span>
                  <strong className="text-blue-900">90% (Proficient)</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <span>Cognitive Flexibility:</span>
                  <strong className="text-blue-900">STEN 9 / 10</strong>
                </div>
              </div>
            </div>

            {/* Trait Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trait STEN Scores & Interpretations</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {scores.map(s => (
                  <div key={s.Score_ID} className="p-3 text-xs flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <strong className="text-slate-800">{s.Trait_Name.replace(/_/g, ' ')}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.Interpretation}</p>
                    </div>
                    <span className="font-extrabold text-blue-900 text-sm pl-4 flex-shrink-0">
                      STEN {s.Sten_Score}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Development */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentReport.Strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  Development Opportunities
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {currentReport.Development_Areas.map((dev, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{dev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            &copy; 2026 TRUSTGRID.AI. Conforms to standardized psychometric normative scales (Mean 5.5, SD 2.0).
          </div>

        </div>

      </div>
    </div>
  );
};
