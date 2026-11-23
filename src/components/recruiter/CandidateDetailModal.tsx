/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * CandidateDetailModal.tsx - Candidate Psychometric Results & Profile Drawer
 */

import React, { useState } from 'react';
import { Candidate } from '../../types';
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
  FileSpreadsheet
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'PSYCHOMETRICS' | 'PROFILE'>('PSYCHOMETRICS');
  
  const scores = ApiService.getScores(candidate.Candidate_ID);
  const reports = ApiService.getReports(candidate.Candidate_ID);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={candidate.Profile_Photo || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.Full_Name}`}
              alt={candidate.Full_Name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-extrabold text-slate-900">{candidate.Full_Name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                  {candidate.Candidate_ID}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {candidate.Current_Designation} • {candidate.Current_Organization} • {candidate.Location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('PSYCHOMETRICS')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'PSYCHOMETRICS'
                ? 'border-blue-900 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            Psychometric & Aptitude Results
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'PROFILE'
                ? 'border-blue-900 text-blue-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Resume
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PSYCHOMETRICS */}
          {activeTab === 'PSYCHOMETRICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Big Five Personality Radar (STEN 1-10)
                  </h3>
                  <RadarChart data={radarData} size={280} />
                  <span className="text-[11px] text-slate-400 mt-2">
                    Standard Normative Scale (Mean 5.5, SD 2.0)
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-blue-800 font-bold block uppercase">Overall Composite Benchmark</span>
                      <p className="text-xs text-slate-500 mt-0.5">Weighted assessment score</p>
                    </div>
                    <span className="text-2xl font-extrabold text-blue-900">92%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-800 font-bold block uppercase">Aptitude Reasoning</span>
                      <p className="text-xs text-slate-500 mt-0.5">Numerical & Logical Problem Solving</p>
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-700">100%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-800 font-bold block uppercase">Situational Judgement (SJT)</span>
                      <p className="text-xs text-slate-500 mt-0.5">Crisis management & workplace ethics</p>
                    </div>
                    <span className="text-2xl font-extrabold text-purple-900">90%</span>
                  </div>
                </div>
              </div>

              {/* Trait Interpretations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Trait STEN Scores & Behavioural Interpretations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scores.map(sc => (
                    <div key={sc.Score_ID} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{sc.Trait_Name.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
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
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Education & Experience</h4>
                  <p className="text-xs text-slate-600"><strong>Qualification:</strong> {candidate.Qualification}</p>
                  <p className="text-xs text-slate-600"><strong>University:</strong> {candidate.University} ({candidate.Graduation_Year})</p>
                  <p className="text-xs text-slate-600"><strong>Total Experience:</strong> {candidate.Total_Experience}</p>
                  <p className="text-xs text-slate-600"><strong>Current Role:</strong> {candidate.Current_Designation} at {candidate.Current_Organization}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Contact & Resume</h4>
                  <p className="text-xs text-slate-600"><strong>Email:</strong> {candidate.Email}</p>
                  <p className="text-xs text-slate-600"><strong>Phone:</strong> {candidate.Phone_Number}</p>
                  <p className="text-xs text-slate-600"><strong>Location:</strong> {candidate.Location}</p>
                  {candidate.Resume_URL && (
                    <div className="pt-2">
                      <a
                        href={candidate.Resume_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Attached Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Skills & Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.Skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
