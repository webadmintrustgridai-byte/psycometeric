/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * CandidateComparisonMatrix.tsx - Side-by-Side Academic & 3-Assessment Comparative Matrix
 */

import React, { useState } from 'react';
import { Candidate, AssessmentAttempt, AcademicProfileRecord } from '../../types';
import { ApiService } from '../../services/apiService';
import { RadarChart, RadarDataPoint } from '../common/RadarChart';
import {
  GitCompare,
  CheckCircle2,
  BrainCircuit,
  Award,
  Download,
  GraduationCap,
  BookOpen,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

export const CandidateComparisonMatrix: React.FC = () => {
  const candidates = ApiService.getCandidates();
  const attempts = ApiService.getAttempts();

  if (candidates.length < 2) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <GitCompare className="w-6 h-6" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">
          Candidate Comparative Assessment Matrix
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          At least two registered candidates are required to generate comparative academic matrices and cross-sectional benchmarks.
        </p>
      </div>
    );
  }

  const [selectedIdA, setSelectedIdA] = useState<string>(candidates[0]?.Candidate_ID || '');
  const [selectedIdB, setSelectedIdB] = useState<string>(candidates[1]?.Candidate_ID || '');

  const candA = candidates.find(c => c.Candidate_ID === selectedIdA) || candidates[0];
  const candB = candidates.find(c => c.Candidate_ID === selectedIdB) || candidates[1];

  // Load Academic records
  const acadA = ApiService.getAcademicProfiles(candA.Candidate_ID);
  const acadB = ApiService.getAcademicProfiles(candB.Candidate_ID);

  const sslc10A = acadA.find(a => a.Education_Level === '10TH');
  const sslc10B = acadB.find(a => a.Education_Level === '10TH');

  const hsc12A = acadA.find(a => a.Education_Level === '12TH');
  const hsc12B = acadB.find(a => a.Education_Level === '12TH');

  const colA = acadA.find(a => a.Education_Level === 'COLLEGE_SEMESTER');
  const colB = acadB.find(a => a.Education_Level === 'COLLEGE_SEMESTER');

  // Load Attempts & Scores
  const attAptA = attempts.find(a => a.Candidate_ID === candA.Candidate_ID && a.Assessment_ID === 'ASM_APTITUDE');
  const attAptB = attempts.find(a => a.Candidate_ID === candB.Candidate_ID && a.Assessment_ID === 'ASM_APTITUDE');

  const attCmpA = attempts.find(a => a.Candidate_ID === candA.Candidate_ID && a.Assessment_ID === 'ASM_COMPREHENSION');
  const attCmpB = attempts.find(a => a.Candidate_ID === candB.Candidate_ID && a.Assessment_ID === 'ASM_COMPREHENSION');

  const attEiA = attempts.find(a => a.Candidate_ID === candA.Candidate_ID && a.Assessment_ID === 'ASM_EI_SITUATIONAL');
  const attEiB = attempts.find(a => a.Candidate_ID === candB.Candidate_ID && a.Assessment_ID === 'ASM_EI_SITUATIONAL');

  const totalScoreA = (attAptA?.Score || 0) + (attCmpA?.Score || 0) + (attEiA?.Score || 0);
  const totalScoreB = (attBptB => (attAptB?.Score || 0) + (attCmpB?.Score || 0) + (attEiB?.Score || 0))();

  // Radar points
  const radarDataA: RadarDataPoint[] = [
    { label: 'Aptitude', value: attAptA ? Math.round((attAptA.Score / 30) * 10) : 8, maxValue: 10 },
    { label: 'Comprehension', value: attCmpA ? Math.round((attCmpA.Score / 30) * 10) : 8, maxValue: 10 },
    { label: 'EI & SJT', value: attEiA ? Math.round((attEiA.Score / 30) * 10) : 9, maxValue: 10 },
    { label: 'Acad: 10th %', value: sslc10A ? Math.round(sslc10A.Percentage! / 10) : 9, maxValue: 10 },
    { label: 'Acad: 12th %', value: hsc12A ? Math.round(hsc12A.Percentage! / 10) : 9, maxValue: 10 },
    { label: 'College CGPA', value: colA ? Math.round(colA.Overall_CGPA!) : 9, maxValue: 10 }
  ];

  const radarDataB: RadarDataPoint[] = [
    { label: 'Aptitude', value: attAptB ? Math.round((attAptB.Score / 30) * 10) : 9, maxValue: 10 },
    { label: 'Comprehension', value: attCmpB ? Math.round((attCmpB.Score / 30) * 10) : 9, maxValue: 10 },
    { label: 'EI & SJT', value: attEiB ? Math.round((attEiB.Score / 30) * 10) : 8, maxValue: 10 },
    { label: 'Acad: 10th %', value: sslc10B ? Math.round(sslc10B.Percentage! / 10) : 9, maxValue: 10 },
    { label: 'Acad: 12th %', value: hsc12B ? Math.round(hsc12B.Percentage! / 10) : 9, maxValue: 10 },
    { label: 'College CGPA', value: colB ? Math.round(colB.Overall_CGPA!) : 9, maxValue: 10 }
  ];

  const handleExportComparison = () => {
    const csvContent = [
      'Metric,Candidate A (' + candA.Full_Name + '),Candidate B (' + candB.Full_Name + ')',
      'Candidate ID,' + candA.Candidate_ID + ',' + candB.Candidate_ID,
      'College,' + candA.College_Name + ',' + candB.College_Name,
      'Department,' + candA.Department + ',' + candB.Department,
      '10th Mathematics,' + (sslc10A?.Mathematics_Marks || 'N/A') + ',' + (sslc10B?.Mathematics_Marks || 'N/A'),
      '10th Science,' + (sslc10A?.Science_Marks || 'N/A') + ',' + (sslc10B?.Science_Marks || 'N/A'),
      '10th Percentage,' + (sslc10A?.Percentage || 'N/A') + '%,' + (sslc10B?.Percentage || 'N/A') + '%',
      '12th Physics,' + (hsc12A?.Physics_Marks || 'N/A') + ',' + (hsc12B?.Physics_Marks || 'N/A'),
      '12th Chemistry,' + (hsc12A?.Chemistry_Marks || 'N/A') + ',' + (hsc12B?.Chemistry_Marks || 'N/A'),
      '12th Mathematics,' + (hsc12A?.Mathematics_Marks || 'N/A') + ',' + (hsc12B?.Mathematics_Marks || 'N/A'),
      '12th Percentage,' + (hsc12A?.Percentage || 'N/A') + '%,' + (hsc12B?.Percentage || 'N/A') + '%',
      'Overall CGPA,' + (colA?.Overall_CGPA || 'N/A') + ',' + (colB?.Overall_CGPA || 'N/A'),
      'Aptitude Score (out of 30),' + (attAptA?.Score || 'N/A') + ',' + (attAptB?.Score || 'N/A'),
      'Comprehension Score (out of 30),' + (attCmpA?.Score || 'N/A') + ',' + (attCmpB?.Score || 'N/A'),
      'EI & Situational Score (out of 30),' + (attEiA?.Score || 'N/A') + ',' + (attEiB?.Score || 'N/A'),
      'Total Score (out of 90),' + totalScoreA + ',' + totalScoreB
    ].join('\n');

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comparison_${candA.Candidate_ID}_vs_${candB.Candidate_ID}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-900" />
            <h1 className="text-xl font-bold text-slate-900">Campus Candidate Comparative Matrix</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side evaluation of academic transcripts (10th, 12th, CGPA) and 3 standardized assessments
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={selectedIdA}
            onChange={e => setSelectedIdA(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-blue-900 text-blue-950 bg-blue-50/50"
          >
            {candidates.map(c => (
              <option key={c.Candidate_ID} value={c.Candidate_ID}>Candidate A: {c.Full_Name}</option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-400">vs</span>

          <select
            value={selectedIdB}
            onChange={e => setSelectedIdB(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-950 bg-emerald-50/50"
          >
            {candidates.map(c => (
              <option key={c.Candidate_ID} value={c.Candidate_ID}>Candidate B: {c.Full_Name}</option>
            ))}
          </select>

          <button
            onClick={handleExportComparison}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Head-to-Head Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Candidate A Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-900 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={candA.Photograph_URL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={candA.Full_Name}
              className="w-12 h-12 rounded-xl object-cover border border-blue-200"
            />
            <div>
              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                Candidate A
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{candA.Full_Name}</h3>
              <span className="text-xs text-slate-400">{candA.College_Name}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
              <span className="text-sm font-extrabold text-slate-900">{colA?.Overall_CGPA || 'N/A'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">12th %</span>
              <span className="text-sm font-extrabold text-slate-900">{hsc12A?.Percentage ? `${hsc12A.Percentage}%` : 'N/A'}</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl">
              <span className="text-[10px] text-blue-900 block uppercase">Total Score</span>
              <span className="text-sm font-black text-blue-950">{totalScoreA} / 90</span>
            </div>
          </div>
        </div>

        {/* Candidate B Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-600 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={candB.Photograph_URL || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'}
              alt={candB.Full_Name}
              className="w-12 h-12 rounded-xl object-cover border border-emerald-200"
            />
            <div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                Candidate B
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{candB.Full_Name}</h3>
              <span className="text-xs text-slate-400">{candB.College_Name}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
              <span className="text-sm font-extrabold text-slate-900">{colB?.Overall_CGPA || 'N/A'}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">12th %</span>
              <span className="text-sm font-extrabold text-slate-900">{hsc12B?.Percentage ? `${hsc12B.Percentage}%` : 'N/A'}</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <span className="text-[10px] text-emerald-800 block uppercase">Total Score</span>
              <span className="text-sm font-black text-emerald-950">{totalScoreB} / 90</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL COMPARISON TABLE (PART 15 ACADEMIC + ASSESSMENT FIELDS) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Side-by-Side Detailed Metrics Breakdown</h2>
          <span className="text-xs text-slate-400 font-semibold">Decisional Support for Campus Interviews</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Evaluation Dimension</th>
                <th className="py-3 px-6 text-blue-900">Candidate A: {candA.Full_Name}</th>
                <th className="py-3 px-6 text-emerald-700">Candidate B: {candB.Full_Name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* 1. Academic: 10th Standard */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">1. 10th Standard Credentials</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Mathematics Marks</td>
                <td className="py-3 px-6 font-bold">{sslc10A?.Mathematics_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{sslc10B?.Mathematics_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Science Marks</td>
                <td className="py-3 px-6 font-bold">{sslc10A?.Science_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{sslc10B?.Science_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">English Marks</td>
                <td className="py-3 px-6 font-bold">{sslc10A?.English_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{sslc10B?.English_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Overall 10th Percentage</td>
                <td className="py-3 px-6 font-extrabold text-blue-900">{sslc10A?.Percentage ? `${sslc10A.Percentage}%` : 'N/A'}</td>
                <td className="py-3 px-6 font-extrabold text-emerald-700">{sslc10B?.Percentage ? `${sslc10B.Percentage}%` : 'N/A'}</td>
              </tr>

              {/* 2. Academic: 12th Standard */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">2. 12th Standard (MPC Stream)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Mathematics Marks</td>
                <td className="py-3 px-6 font-bold">{hsc12A?.Mathematics_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{hsc12B?.Mathematics_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Physics Marks</td>
                <td className="py-3 px-6 font-bold">{hsc12A?.Physics_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{hsc12B?.Physics_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Chemistry Marks</td>
                <td className="py-3 px-6 font-bold">{hsc12A?.Chemistry_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{hsc12B?.Chemistry_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">English Marks</td>
                <td className="py-3 px-6 font-bold">{hsc12A?.English_Marks || 'N/A'}</td>
                <td className="py-3 px-6 font-bold">{hsc12B?.English_Marks || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Overall 12th Percentage</td>
                <td className="py-3 px-6 font-extrabold text-blue-900">{hsc12A?.Percentage ? `${hsc12A.Percentage}%` : 'N/A'}</td>
                <td className="py-3 px-6 font-extrabold text-emerald-700">{hsc12B?.Percentage ? `${hsc12B.Percentage}%` : 'N/A'}</td>
              </tr>

              {/* 3. College Academic Profile */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">3. College Undergraduate Ledger</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Overall Cumulative CGPA (10-Scale)</td>
                <td className="py-3 px-6 font-extrabold text-blue-900">{colA?.Overall_CGPA || 'N/A'}</td>
                <td className="py-3 px-6 font-extrabold text-emerald-700">{colB?.Overall_CGPA || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Active Backlogs / Arrears</td>
                <td className="py-3 px-6 font-bold">{colA?.Backlogs ?? 0}</td>
                <td className="py-3 px-6 font-bold">{colB?.Backlogs ?? 0}</td>
              </tr>

              {/* 4. Assessment 1: Aptitude */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">4. Assessment 1: Aptitude (30 Qs / 30 Marks)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Total Aptitude Score</td>
                <td className="py-3 px-6 font-black text-blue-900">{attAptA ? `${attAptA.Score} / 30` : 'Not Attempted'}</td>
                <td className="py-3 px-6 font-black text-emerald-700">{attAptB ? `${attAptB.Score} / 30` : 'Not Attempted'}</td>
              </tr>

              {/* 5. Assessment 2: Comprehension */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">5. Assessment 2: Test of Comprehension (30 Qs / 30 Marks)</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Total Comprehension Score</td>
                <td className="py-3 px-6 font-black text-blue-900">{attCmpA ? `${attCmpA.Score} / 30` : 'Not Attempted'}</td>
                <td className="py-3 px-6 font-black text-emerald-700">{attCmpB ? `${attCmpB.Score} / 30` : 'Not Attempted'}</td>
              </tr>

              {/* 6. Assessment 3: EI & SJT */}
              <tr className="bg-slate-50/50 font-bold text-slate-500 text-[11px] uppercase">
                <td colSpan={3} className="py-2.5 px-6">6. Assessment 3: Emotional Intelligence & Situational Reaction</td>
              </tr>
              <tr>
                <td className="py-3 px-6 text-slate-600">Total Behavioral / SJT Score</td>
                <td className="py-3 px-6 font-black text-blue-900">{attEiA ? `${attEiA.Score} / 30` : 'Not Attempted'}</td>
                <td className="py-3 px-6 font-black text-emerald-700">{attEiB ? `${attEiB.Score} / 30` : 'Not Attempted'}</td>
              </tr>

              {/* 7. Total Composite */}
              <tr className="bg-blue-50/30 font-black text-slate-900 text-xs">
                <td className="py-4 px-6 uppercase tracking-wider">Total Campus Composite Score</td>
                <td className="py-4 px-6 text-base text-blue-900">{totalScoreA} / 90 ({Math.round((totalScoreA / 90) * 100)}%)</td>
                <td className="py-4 px-6 text-base text-emerald-700">{totalScoreB} / 90 ({Math.round((totalScoreB / 90) * 100)}%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
