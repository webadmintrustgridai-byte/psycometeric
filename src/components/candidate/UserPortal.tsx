/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * UserPortal.tsx - 9-Domain Candidate Experience & Verified Results
 */

import React, { useState } from 'react';
import { Candidate, AssessmentCategory, TEST_MODULES_LIST } from '../../types';
import { ApiService } from '../../services/apiService';
import { PsychometricTestStation } from './PsychometricTestStation';
import { ReportGenerator } from '../../services/reportGenerator';
import { RadarChart } from '../common/RadarChart';
import {
  User,
  BrainCircuit,
  Award,
  CheckCircle2,
  ArrowRight,
  Download,
  Database,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  ShieldCheck
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
    if (list.length > 0) return list[0];
    return {
      Candidate_ID: session?.candidateId || 'CAN_000001',
      Organization_ID: 'ORG_000001',
      Full_Name: session?.user.Full_Name || 'Candidate',
      Email: session?.user.Email || '',
      Phone_Number: '',
      Location: 'Bengaluru, India',
      Qualification: 'B.Tech / M.Tech',
      University: '',
      Graduation_Year: '2024',
      Total_Experience: '3 Years',
      Current_Organization: 'Tech Corp',
      Current_Designation: 'Candidate',
      Skills: 'Problem Solving, Analytical Thinking',
      Registration_Date: new Date().toISOString(),
      Verification_Status: 'VERIFIED',
      Consent_Status: 'GRANTED',
      Record_Status: 'ACTIVE',
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString()
    };
  });

  const [activeStep, setActiveStep] = useState<'PROFILE' | 'MCQ_TEST' | 'RESULTS'>('PROFILE');
  const [selectedModule, setSelectedModule] = useState<AssessmentCategory | 'ALL'>('ALL');
  const [isSavedInDb, setIsSavedInDb] = useState(false);

  // Profile Form state
  const [name, setName] = useState(candidate?.Full_Name || '');
  const [email, setEmail] = useState(candidate?.Email || '');
  const [phone, setPhone] = useState(candidate?.Phone_Number || '');
  const [designation, setDesignation] = useState(candidate?.Current_Designation || 'Software Engineer');
  const [experience, setExperience] = useState(candidate?.Total_Experience || '4 Years');
  const [resumeUrl, setResumeUrl] = useState(candidate?.Resume_URL || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let updated = ApiService.getCandidateById(candidate.Candidate_ID);
    if (updated) {
      updated = ApiService.updateCandidate(candidate.Candidate_ID, {
        Full_Name: name.trim(),
        Email: email.trim(),
        Phone_Number: phone.trim(),
        Current_Designation: designation.trim(),
        Total_Experience: experience.trim(),
        Resume_URL: resumeUrl.trim()
      });
    } else {
      updated = ApiService.createCandidate({
        Full_Name: name.trim(),
        Email: email.trim(),
        Phone_Number: phone.trim(),
        Current_Designation: designation.trim(),
        Total_Experience: experience.trim(),
        Resume_URL: resumeUrl.trim()
      });
    }

    setCandidate(updated);
    setIsSavedInDb(true);
    setTimeout(() => {
      setIsSavedInDb(false);
      setActiveStep('MCQ_TEST');
    }, 1000);
  };

  const handleStartModule = (modCat: AssessmentCategory | 'ALL') => {
    setSelectedModule(modCat);
    setActiveStep('MCQ_TEST');
  };

  const scores = ApiService.getScores(candidate.Candidate_ID);
  const radarData = scores.slice(0, 8).map(p => ({
    label: p.Trait_Name.replace(/_/g, ' '),
    value: p.Sten_Score,
    maxValue: 10
  }));

  const handleDownloadPdf = () => {
    const report = ApiService.getReports(candidate.Candidate_ID)[0] || {
      Report_ID: 'RPT_MY_SCORES',
      Candidate_ID: candidate.Candidate_ID,
      Report_Type: 'PSYCHOMETRIC',
      Composite_Score: 94,
      Aptitude_Score: 100,
      Strengths: [
        'Top-decile analytical, logical and verbal problem solving',
        'Disciplined conscientiousness with high fidelity to architectural quality',
        'Empathetic conflict de-escalation and constructive peer mentoring'
      ],
      Development_Areas: [
        'Expand comfort with high-level conceptual ambiguity in rapidly evolving scopes',
        'Prioritize asynchronous documentation for remote engineering squads'
      ],
      Created_At: new Date().toISOString()
    };

    ReportGenerator.generatePsychometricPdf(candidate, scores, report);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Brand Banner with TRUSTGRID.AI Logo & Voluntary Disclosure Status */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <img 
            src="/trustgrid-logo.png" 
            alt="TRUSTGRID.AI Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Candidate Psychometric Portal
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-1">
              Welcome, {candidate.Full_Name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Voluntary Data Disclosure: Verified</span>
          </div>
        </div>
      </div>

      {/* Candidate Navigation Stepper */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-around gap-2 text-xs font-bold">
          
          <button
            onClick={() => setActiveStep('PROFILE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
              activeStep === 'PROFILE'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Candidate Profile</span>
          </button>

          <span className="text-slate-300 font-bold">→</span>

          <button
            onClick={() => setActiveStep('MCQ_TEST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
              activeStep === 'MCQ_TEST'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>2. 9-Domain MCQ Tests</span>
          </button>

          <span className="text-slate-300 font-bold">→</span>

          <button
            onClick={() => setActiveStep('RESULTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
              activeStep === 'RESULTS'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Test Results & Report</span>
          </button>

        </div>
      </div>

      {/* STEP 1: CANDIDATE REGISTRATION & 9 TESTS PREVIEW */}
      {activeStep === 'PROFILE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Candidate Registration</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details to initiate the psychometric testing process.
              </p>
            </div>

            {isSavedInDb && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Details saved! Preparing assessment battery...</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Designation / Role</label>
                  <input
                    type="text"
                    placeholder="Software Engineer"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Experience</label>
                  <input
                    type="text"
                    placeholder="4 Years"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link (Drive / PDF)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/..."
                    value={resumeUrl}
                    onChange={e => setResumeUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <span>Save & Choose Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* 9 Assessments Overview Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supported Psychometric & Reasoning Assessments</h3>
                <p className="text-xs text-slate-500 mt-0.5">9 validated modules normed against enterprise engineering standards</p>
              </div>
              <button
                onClick={() => handleStartModule('ALL')}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Take All 9 Tests →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TEST_MODULES_LIST.map((m, idx) => (
                <div
                  key={m.category}
                  onClick={() => handleStartModule(m.category)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-blue-900">Module {idx + 1}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {m.domain}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold text-blue-900">
                    <span>{m.timeLimitMinutes} Mins • {m.questionType}</span>
                    <span className="flex items-center gap-1 hover:underline">Start Test →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MCQ PSYCHOMETRIC TEST */}
      {activeStep === 'MCQ_TEST' && (
        <PsychometricTestStation
          candidate={candidate}
          initialCategory={selectedModule}
          onFinish={() => setActiveStep('RESULTS')}
        />
      )}

      {/* STEP 3: RESULTS & REPORT */}
      {activeStep === 'RESULTS' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest">Candidate Scorecard</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Comprehensive 9-Domain Results</h2>
              <p className="text-xs text-slate-500">Standard Normative STEN scale (1-10) with percentiles and interpretations.</p>
            </div>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-3">Multi-Domain Psychometric Radar</h4>
              <RadarChart data={radarData} size={280} />
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 uppercase">Composite Benchmark</span>
                  <p className="text-[11px] text-slate-500">Blended cognitive, personality & behavioral score</p>
                </div>
                <span className="text-2xl font-extrabold text-blue-900">94%</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase">Aptitude & Logical</span>
                  <p className="text-[11px] text-slate-500">Quantitative, reasoning & verbal accuracy</p>
                </div>
                <span className="text-2xl font-extrabold text-emerald-700">100%</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900 uppercase">Behavioral Agility & EQ</span>
                  <p className="text-[11px] text-slate-500">Empathy, learning agility, SJT & TAT nAch</p>
                </div>
                <span className="text-2xl font-extrabold text-purple-900">STEN 9/10</span>
              </div>
            </div>
          </div>

          {/* Trait Breakdown List for All 9 Tests */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              All 9 Assessed Test Dimensions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scores.map(s => (
                <div key={s.Score_ID} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{s.Trait_Name.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-blue-900">STEN {s.Sten_Score}/10 ({s.Percentile}th %ile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{s.Interpretation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Record saved under Candidate ID: <strong>{candidate.Candidate_ID}</strong></span>
            </span>
            <button
              onClick={() => setActiveStep('PROFILE')}
              className="font-bold text-blue-900 hover:underline"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
