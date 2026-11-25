/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * AuthScreen.tsx - Candidate Portal (Sign In & Comprehensive Sign Up)
 * Admin Portal is accessed ONLY via direct link (/admin or #admin) and hidden from the public UI.
 */

import React, { useState, useEffect } from 'react';
import { AuthSession } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Building,
  UserPlus,
  LogIn
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
}

const checkIsAdminPath = (): boolean => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/admin' || p.startsWith('/admin/') || p.includes('/admin') || h.includes('admin');
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // Admin is strictly accessed by URL link (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminPath());
  const [candidateMode, setCandidateMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [signUpStep, setSignUpStep] = useState<number>(1);

  // Master Admin credentials
  const [adminEmail, setAdminEmail] = useState('poojasri@trustgrid.ai');
  const [adminPassword, setAdminPassword] = useState('Pooj@2004*');

  // Candidate Sign In state
  const [candEmail, setCandEmail] = useState('');
  const [candPassword, setCandPassword] = useState('');

  // Candidate Comprehensive Sign Up state
  const [signUpData, setSignUpData] = useState({
    // Step 1: Personal & Account
    fullName: '',
    email: '',
    mobile: '',
    dob: '2004-01-01',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
    password: '',

    // Step 2: College Enrollment & CGPA
    collegeName: '',
    department: 'Computer Science and Engineering',
    degree: 'B.Tech',
    academicYear: '4th Year',
    currentSemester: 'Semester 7',
    collegeIdNumber: '',
    overallCGPA: 8.5,

    // Step 3: 10th Marks (M / S / E)
    school10th: '',
    board10th: 'CBSE',
    maths10th: 92,
    science10th: 90,
    english10th: 88,
    total10th: 460,
    percentage10th: 92.0,
    passingYear10th: '2020',

    // Step 4: 12th Marks (M / P / C / E)
    college12th: '',
    board12th: 'State Board',
    maths12th: 94,
    physics12th: 92,
    chemistry12th: 88,
    english12th: 85,
    total12th: 465,
    percentage12th: 93.0,
    passingYear12th: '2022',

    // Step 5: Entrance Exams (BITSAT, IIT-JEE, GATE, GMAT, CAT - All Optional)
    gateScore: '',
    gatePercentile: '',
    gateRank: '',
    gateYear: '',
    jeePercentile: '',
    jeeRank: '',
    jeeYear: '',
    bitsatScore: '',
    bitsatYear: '',
    catPercentile: '',
    catScore: '',
    catYear: '',
    gmatScore: '',
    gmatPercentile: '',
    gmatYear: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Listen to browser URL changes (e.g. typing /admin in URL bar or back/forward)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdminPath());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Master Admin Login (Only on /admin)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = ApiService.login(adminEmail, 'ADMIN', adminPassword);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message || 'Invalid administrator credentials. Access restricted to poojasri@trustgrid.ai.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Candidate Sign In
  const handleCandidateSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candEmail.trim()) {
      setErrorMsg('Please enter your registered email address or roll number.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = ApiService.login(candEmail.trim(), 'CANDIDATE', candPassword);
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message || 'Candidate account not found. Please click Sign Up to register your profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Candidate Step Navigation & Final Sign Up
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (signUpStep === 1) {
      if (!signUpData.fullName.trim()) {
        setErrorMsg('Full Name is required.');
        return;
      }
      if (!signUpData.email.trim() || !signUpData.email.includes('@')) {
        setErrorMsg('A valid email address is required.');
        return;
      }
      if (!signUpData.mobile.trim()) {
        setErrorMsg('Mobile / WhatsApp number is required.');
        return;
      }
      setSignUpStep(2);
      return;
    }

    if (signUpStep === 2) {
      if (!signUpData.collegeName.trim()) {
        setErrorMsg('College Name is required.');
        return;
      }
      if (!signUpData.collegeIdNumber.trim()) {
        setErrorMsg('College Roll Number / ID is required.');
        return;
      }
      setSignUpStep(3);
      return;
    }

    if (signUpStep === 3) {
      setSignUpStep(4);
      return;
    }

    if (signUpStep === 4) {
      setSignUpStep(5);
      return;
    }

    if (signUpStep === 5) {
      // Final Registration Submit
      setLoading(true);
      try {
        const res = ApiService.registerFullCandidate({
          fullName: signUpData.fullName,
          email: signUpData.email,
          mobile: signUpData.mobile,
          dob: signUpData.dob,
          gender: signUpData.gender,
          password: signUpData.password,
          collegeName: signUpData.collegeName,
          department: signUpData.department,
          degree: signUpData.degree,
          academicYear: signUpData.academicYear,
          currentSemester: signUpData.currentSemester,
          collegeIdNumber: signUpData.collegeIdNumber,
          overallCGPA: Number(signUpData.overallCGPA) || 8.5,
          school10th: signUpData.school10th,
          board10th: signUpData.board10th,
          maths10th: Number(signUpData.maths10th) || 90,
          science10th: Number(signUpData.science10th) || 88,
          english10th: Number(signUpData.english10th) || 85,
          total10th: Number(signUpData.total10th) || 460,
          percentage10th: Number(signUpData.percentage10th) || 92.0,
          passingYear10th: signUpData.passingYear10th,
          college12th: signUpData.college12th,
          board12th: signUpData.board12th,
          maths12th: Number(signUpData.maths12th) || 92,
          physics12th: Number(signUpData.physics12th) || 90,
          chemistry12th: Number(signUpData.chemistry12th) || 88,
          english12th: Number(signUpData.english12th) || 85,
          total12th: Number(signUpData.total12th) || 465,
          percentage12th: Number(signUpData.percentage12th) || 93.0,
          passingYear12th: signUpData.passingYear12th,
          gateScore: signUpData.gateScore ? Number(signUpData.gateScore) : undefined,
          gatePercentile: signUpData.gatePercentile ? Number(signUpData.gatePercentile) : undefined,
          gateRank: signUpData.gateRank ? Number(signUpData.gateRank) : undefined,
          gateYear: signUpData.gateYear,
          jeePercentile: signUpData.jeePercentile ? Number(signUpData.jeePercentile) : undefined,
          jeeRank: signUpData.jeeRank ? Number(signUpData.jeeRank) : undefined,
          jeeYear: signUpData.jeeYear,
          bitsatScore: signUpData.bitsatScore ? Number(signUpData.bitsatScore) : undefined,
          bitsatYear: signUpData.bitsatYear || undefined,
          catPercentile: signUpData.catPercentile ? Number(signUpData.catPercentile) : undefined,
          catScore: signUpData.catScore ? Number(signUpData.catScore) : undefined,
          catYear: signUpData.catYear || undefined,
          gmatScore: signUpData.gmatScore ? Number(signUpData.gmatScore) : undefined,
          gmatPercentile: signUpData.gmatPercentile ? Number(signUpData.gmatPercentile) : undefined,
          gmatYear: signUpData.gmatYear || undefined
        });

        if (res.success && res.session) {
          onLoginSuccess(res.session);
        } else {
          setErrorMsg(res.message || 'Registration failed. Please check your inputs.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit registration.');
      } finally {
        setLoading(false);
      }
    }
  };

  // =========================================================================
  // CASE 1: ADMIN PORTAL ACCESSED EXCLUSIVELY VIA LINK (/admin or #admin)
  // =========================================================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-3">
            <img
              src="/trustgrid-logo.png"
              alt="TRUSTGRID.AI Logo"
              className="h-12 w-auto object-contain drop-shadow-md brightness-110"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            TRUSTGRID<span className="text-blue-400">.AI</span>
          </h2>
          <p className="text-xs font-bold text-blue-200/80 uppercase tracking-widest mt-1">
            Master Administrator Portal
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-slate-200 sm:px-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-center">
              <span className="text-xs font-extrabold text-blue-950 block">Administrator Authentication</span>
              <span className="text-[11px] text-blue-700 font-mono">poojasri@trustgrid.ai</span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Master Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="poojasri@trustgrid.ai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Master Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Link Administrator Gateway • Encrypted Database Connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE 2: PUBLIC CANDIDATE PORTAL (NO ADMIN IN UI - PURE CANDIDATE PORTAL)
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="flex justify-center mb-3">
          <img
            src="/trustgrid-logo.png"
            alt="TRUSTGRID.AI Logo"
            className="h-12 w-auto object-contain drop-shadow-sm"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          TRUSTGRID<span className="text-blue-700">.AI</span>
        </h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
          Online Psychometric & Reasoning Assessment Platform
        </p>
      </div>

      <div className={`mt-6 sm:mx-auto sm:w-full transition-all ${
        candidateMode === 'SIGN_UP' ? 'sm:max-w-2xl' : 'sm:max-w-md'
      }`}>
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-8 space-y-6">
          
          {/* Candidate Primary Switcher: Sign In vs Sign Up (NO ADMIN IN UI) */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setCandidateMode('SIGN_IN');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                candidateMode === 'SIGN_IN'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Candidate Sign In</span>
            </button>

            <button
              onClick={() => {
                setCandidateMode('SIGN_UP');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                candidateMode === 'SIGN_UP'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Candidate Sign Up (Full Profile)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: CANDIDATE SIGN IN                                */}
          {/* ======================================================== */}
          {candidateMode === 'SIGN_IN' && (
            <form onSubmit={handleCandidateSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or College Roll Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={candEmail}
                    onChange={e => setCandEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter email or college roll number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (Optional for Candidate Access)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="password"
                    value={candPassword}
                    onChange={e => setCandPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter password or leave blank"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Entering Portal...' : 'Sign In & Enter Assessment Station'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  New candidate?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateMode('SIGN_UP');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-blue-900 hover:underline"
                  >
                    Click here to Sign Up with full details
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CANDIDATE SIGN UP WITH COMPLETE DETAILS           */}
          {/* ======================================================== */}
          {candidateMode === 'SIGN_UP' && (
            <div className="space-y-6">
              
              {/* Step Wizard Indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 overflow-x-auto gap-2">
                {[
                  { num: 1, title: 'Personal' },
                  { num: 2, title: 'College' },
                  { num: 3, title: '10th (M/S/E)' },
                  { num: 4, title: '12th (MPCE)' },
                  { num: 5, title: 'Exams & GATE' }
                ].map(s => (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setSignUpStep(s.num)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      signUpStep === s.num
                        ? 'bg-blue-900 text-white shadow-sm'
                        : signUpStep > s.num
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-slate-400 bg-slate-50'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black border border-current">
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleNextStep} className="space-y-4">
                
                {/* STEP 1: PERSONAL DETAILS */}
                {signUpStep === 1 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-900" />
                        <span>Step 1: Personal & Account Identification</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Provide your official candidate details</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={signUpData.fullName}
                          onChange={e => handleFieldChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="e.g. Aarav Sharma"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={signUpData.email}
                          onChange={e => handleFieldChange('email', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="e.g. aarav.sharma@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          value={signUpData.mobile}
                          onChange={e => handleFieldChange('mobile', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={signUpData.dob}
                          onChange={e => handleFieldChange('dob', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                        <select
                          value={signUpData.gender}
                          onChange={e => handleFieldChange('gender', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Account Password (Optional)</label>
                        <input
                          type="password"
                          value={signUpData.password}
                          onChange={e => handleFieldChange('password', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Create password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: COLLEGE ENROLLMENT & CGPA */}
                {signUpStep === 2 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-900" />
                        <span>Step 2: College Enrollment & Academic Ledger</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Degree, department, roll number, and overall CGPA</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">College / Institute Name *</label>
                        <input
                          type="text"
                          required
                          value={signUpData.collegeName}
                          onChange={e => handleFieldChange('collegeName', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="e.g. National Institute of Technology"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">College ID / Roll Number *</label>
                        <input
                          type="text"
                          required
                          value={signUpData.collegeIdNumber}
                          onChange={e => handleFieldChange('collegeIdNumber', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="e.g. NIT-2022-CS-041"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                        <input
                          type="text"
                          required
                          value={signUpData.department}
                          onChange={e => handleFieldChange('department', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Computer Science and Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={signUpData.degree}
                          onChange={e => handleFieldChange('degree', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="B.Tech"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                        <select
                          value={signUpData.academicYear}
                          onChange={e => handleFieldChange('academicYear', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year (Final Year)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Current Semester</label>
                        <select
                          value={signUpData.currentSemester}
                          onChange={e => handleFieldChange('currentSemester', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative CGPA (Scale 10.0)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={signUpData.overallCGPA}
                          onChange={e => handleFieldChange('overallCGPA', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="8.50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: 10TH STANDARD (M / S / E) */}
                {signUpStep === 3 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-900" />
                        <span>Step 3: 10th Standard / SSLC (M / S / E Marks)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Mathematics, Science, and English specific subject scores</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Mathematics (Marks) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.maths10th}
                          onChange={e => handleFieldChange('maths10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="95"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Science (Marks) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.science10th}
                          onChange={e => handleFieldChange('science10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="92"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">English (Marks) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.english10th}
                          onChange={e => handleFieldChange('english10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="90"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">10th Total Marks</label>
                        <input
                          type="number"
                          value={signUpData.total10th}
                          onChange={e => handleFieldChange('total10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="465"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">10th Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={signUpData.percentage10th}
                          onChange={e => handleFieldChange('percentage10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="93.0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Year</label>
                        <input
                          type="text"
                          value={signUpData.passingYear10th}
                          onChange={e => handleFieldChange('passingYear10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="2020"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">10th School Name</label>
                        <input
                          type="text"
                          value={signUpData.school10th}
                          onChange={e => handleFieldChange('school10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="National Public School"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Board</label>
                        <input
                          type="text"
                          value={signUpData.board10th}
                          onChange={e => handleFieldChange('board10th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="CBSE"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: 12TH STANDARD (M / P / C / E) */}
                {signUpStep === 4 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-900" />
                        <span>Step 4: 12th Standard / HSC (M / P / C / E Marks)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Mathematics, Physics, Chemistry, and English scores</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Maths (M) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.maths12th}
                          onChange={e => handleFieldChange('maths12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="96"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Physics (P) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.physics12th}
                          onChange={e => handleFieldChange('physics12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="94"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Chemistry (C) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.chemistry12th}
                          onChange={e => handleFieldChange('chemistry12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="90"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">English (E) *</label>
                        <input
                          type="number"
                          required
                          value={signUpData.english12th}
                          onChange={e => handleFieldChange('english12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="88"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">12th Total Marks</label>
                        <input
                          type="number"
                          value={signUpData.total12th}
                          onChange={e => handleFieldChange('total12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="468"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">12th Percentage (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={signUpData.percentage12th}
                          onChange={e => handleFieldChange('percentage12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="93.6"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Junior College Name</label>
                        <input
                          type="text"
                          value={signUpData.college12th}
                          onChange={e => handleFieldChange('college12th', e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="National Junior College"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: NATIONAL & GLOBAL COMPETITIVE EXAMS (BITSAT, IIT-JEE, GATE, GMAT, CAT - ALL 100% OPTIONAL) */}
                {signUpStep === 5 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="border-b border-slate-100 pb-2 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Step 5: Competitive Examinations (BITSAT, IIT-JEE, GATE, GMAT, CAT)</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          All exam entries are <strong className="text-emerald-700">100% Optional</strong>. Leave blank if you have not appeared.
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                        Optional Section
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {/* 1. GATE Section */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">1. GATE (Graduate Aptitude Test in Engineering)</span>
                          <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Score (out of 1000)</label>
                            <input
                              type="number"
                              value={signUpData.gateScore}
                              onChange={e => handleFieldChange('gateScore', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                              placeholder="e.g. 785"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">All India Rank (AIR)</label>
                            <input
                              type="number"
                              value={signUpData.gateRank}
                              onChange={e => handleFieldChange('gateRank', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                              placeholder="e.g. 342"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Exam Year</label>
                            <input
                              type="text"
                              value={signUpData.gateYear}
                              onChange={e => handleFieldChange('gateYear', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                              placeholder="e.g. 2026"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. IIT-JEE & 3. BITSAT Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">2. IIT - JEE (Main / Adv)</span>
                            <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Percentile</label>
                              <input
                                type="number"
                                step="0.01"
                                value={signUpData.jeePercentile}
                                onChange={e => handleFieldChange('jeePercentile', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 99.2"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">AIR Rank</label>
                              <input
                                type="number"
                                value={signUpData.jeeRank}
                                onChange={e => handleFieldChange('jeeRank', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 1850"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">3. BITSAT Score</span>
                            <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Score (out of 390)</label>
                              <input
                                type="number"
                                value={signUpData.bitsatScore}
                                onChange={e => handleFieldChange('bitsatScore', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 325"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Year</label>
                              <input
                                type="text"
                                value={signUpData.bitsatYear}
                                onChange={e => handleFieldChange('bitsatYear', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 2022"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. CAT & 5. GMAT Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">4. CAT (Common Admission Test)</span>
                            <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Percentile (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={signUpData.catPercentile}
                                onChange={e => handleFieldChange('catPercentile', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 98.75"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Raw / Scaled Score</label>
                              <input
                                type="number"
                                value={signUpData.catScore}
                                onChange={e => handleFieldChange('catScore', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 96"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">5. GMAT Score</span>
                            <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Total Score (out of 800)</label>
                              <input
                                type="number"
                                value={signUpData.gmatScore}
                                onChange={e => handleFieldChange('gmatScore', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 730"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-0.5">Percentile (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={signUpData.gmatPercentile}
                                onChange={e => handleFieldChange('gmatPercentile', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300"
                                placeholder="e.g. 96.0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  {signUpStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setSignUpStep(s => s - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <span>
                      {signUpStep === 5
                        ? loading ? 'Creating Profile...' : 'Complete Registration & Launch Portal'
                        : `Next: Step ${signUpStep + 1}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setCandidateMode('SIGN_IN');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-blue-900 hover:underline"
                  >
                    Sign In to your account
                  </button>
                </span>
              </div>
            </div>
          )}

          {/* Google Sheets Sync Indicator */}
          <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Cloud Transmission • Synchronized with Google Sheets & Apps Script</span>
          </div>

        </div>
      </div>

    </div>
  );
};
