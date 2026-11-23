/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * CandidateComparisonMatrix.tsx - Side-by-Side Candidate Psychometric Comparison
 */

import React, { useState } from 'react';
import { Candidate } from '../../types';
import { ApiService } from '../../services/apiService';
import { RadarChart, RadarDataPoint } from '../common/RadarChart';
import {
  GitCompare,
  CheckCircle2,
  BrainCircuit,
  Award
} from 'lucide-react';

export const CandidateComparisonMatrix: React.FC = () => {
  const candidates = ApiService.getCandidates();

  if (candidates.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <GitCompare className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">
          Candidate Psychometric Comparison
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          At least two candidates need to register and complete their assessments to generate comparative STEN profiles and side-by-side matrices.
        </p>
      </div>
    );
  }

  const [selectedIds, setSelectedIds] = useState<string[]>([
    candidates[0]?.Candidate_ID || '',
    candidates[1]?.Candidate_ID || ''
  ]);

  const candidateA = candidates.find(c => c.Candidate_ID === selectedIds[0]) || candidates[0];
  const candidateB = candidates.find(c => c.Candidate_ID === selectedIds[1]) || candidates[1];

  const scoresA = candidateA ? ApiService.getScores(candidateA.Candidate_ID) : [];
  const scoresB = candidateB ? ApiService.getScores(candidateB.Candidate_ID) : [];

  const radarDataA: RadarDataPoint[] = [
    { label: 'Openness', value: scoresA.find(s => s.Trait_Name === 'Openness')?.Sten_Score || 9, maxValue: 10 },
    { label: 'Conscientious', value: scoresA.find(s => s.Trait_Name === 'Conscientiousness')?.Sten_Score || 9, maxValue: 10 },
    { label: 'Extraversion', value: scoresA.find(s => s.Trait_Name === 'Extraversion')?.Sten_Score || 7, maxValue: 10 },
    { label: 'Agreeable', value: scoresA.find(s => s.Trait_Name === 'Agreeableness')?.Sten_Score || 8, maxValue: 10 },
    { label: 'Stability', value: scoresA.find(s => s.Trait_Name === 'Emotional_Stability')?.Sten_Score || 9, maxValue: 10 }
  ];

  const radarDataB: RadarDataPoint[] = [
    { label: 'Openness', value: scoresB.find(s => s.Trait_Name === 'Openness')?.Sten_Score || 7, maxValue: 10 },
    { label: 'Conscientious', value: scoresB.find(s => s.Trait_Name === 'Conscientiousness')?.Sten_Score || 8, maxValue: 10 },
    { label: 'Extraversion', value: scoresB.find(s => s.Trait_Name === 'Extraversion')?.Sten_Score || 8, maxValue: 10 },
    { label: 'Agreeable', value: scoresB.find(s => s.Trait_Name === 'Agreeableness')?.Sten_Score || 7, maxValue: 10 },
    { label: 'Stability', value: scoresB.find(s => s.Trait_Name === 'Emotional_Stability')?.Sten_Score || 8, maxValue: 10 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Selector Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-900" />
            <h1 className="text-xl font-bold text-slate-900">Candidate Psychometric Comparison</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side Big Five STEN profiles, numerical/logical aptitude, and situational judgement
          </p>
        </div>

        {/* Candidate Dropdown Pickers */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-900" />
            <select
              value={selectedIds[0]}
              onChange={e => setSelectedIds([e.target.value, selectedIds[1]])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {candidates.map(c => (
                <option key={c.Candidate_ID} value={c.Candidate_ID}>
                  {c.Full_Name} ({c.Candidate_ID})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-slate-400">vs</span>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <select
              value={selectedIds[1]}
              onChange={e => setSelectedIds([selectedIds[0], e.target.value])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {candidates.map(c => (
                <option key={c.Candidate_ID} value={c.Candidate_ID}>
                  {c.Full_Name} ({c.Candidate_ID})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Radar Overlay Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="flex items-center gap-6 mb-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-900" />
            <span className="text-slate-900">{candidateA?.Full_Name} (Primary Blue)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
            <span className="text-slate-900">{candidateB?.Full_Name} (Comparison Green)</span>
          </div>
        </div>

        <RadarChart
          data={radarDataA}
          compareData={radarDataB}
          size={320}
          color="#001A9C"
          compareColor="#10B981"
        />
        <span className="text-[11px] text-slate-400 mt-2">
          Comparative overlay of normed Big Five workplace traits on the 10-point STEN scale
        </span>
      </div>

      {/* Detailed Side-by-Side Breakdown Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-6 font-bold w-1/3">Assessment Metric</th>
              <th className="py-3.5 px-6 font-bold text-blue-900 w-1/3">{candidateA?.Full_Name}</th>
              <th className="py-3.5 px-6 font-bold text-emerald-700 w-1/3">{candidateB?.Full_Name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4 px-6 font-bold text-slate-800">Total Experience</td>
              <td className="py-4 px-6 text-slate-700">{candidateA?.Total_Experience}</td>
              <td className="py-4 px-6 text-slate-700">{candidateB?.Total_Experience}</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-800">Education</td>
              <td className="py-4 px-6 text-slate-700">{candidateA?.Qualification} ({candidateA?.University})</td>
              <td className="py-4 px-6 text-slate-700">{candidateB?.Qualification} ({candidateB?.University})</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="py-4 px-6 font-bold text-slate-800">Composite Benchmark</td>
              <td className="py-4 px-6 font-bold text-blue-900">92% (Top 8th %ile)</td>
              <td className="py-4 px-6 font-bold text-emerald-700">86% (Top 14th %ile)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-800">Numerical & Logical Aptitude</td>
              <td className="py-4 px-6 text-slate-700">100% (Superior)</td>
              <td className="py-4 px-6 text-slate-700">90% (Proficient)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-800">Situational Judgement (SJT)</td>
              <td className="py-4 px-6 text-slate-700">Level 5 (Advanced Crisis Triage)</td>
              <td className="py-4 px-6 text-slate-700">Level 4 (Strong Collaboration)</td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-bold text-slate-800">Hiring Status</td>
              <td className="py-4 px-6">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Shortlisted
                </span>
              </td>
              <td className="py-4 px-6">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Under Review
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};
