/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * AuthScreen.tsx - Unified Admin & Candidate Authentication (Sign In & Sign Up) with Google Sheets Sync
 */

import React, { useState, useEffect } from 'react';
import { AuthSession, Role } from '../../types';
import { ApiService } from '../../services/apiService';
import {
  ShieldCheck,
  User,
  LayoutDashboard,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Phone,
  FileCheck2,
  LogIn,
  UserPlus
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
  const [roleMode, setRoleMode] = useState<Role>('ADMIN');

  // Admin state pre-populated with master administrator credentials
  const [adminEmail, setAdminEmail] = useState('poojasri@trustgrid.ai');
  const [adminPassword, setAdminPassword] = useState('Pooj@2004*');

  // Candidate Sign In state
  const [candEmail, setCandEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync roleMode when browser URL changes (e.g. user enters /admin or navigates back)
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminPath()) {
        setRoleMode('ADMIN');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleRoleSwitch = (newRole: Role) => {
    setRoleMode(newRole);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (typeof window !== 'undefined') {
      if (newRole === 'ADMIN') {
        if (!window.location.pathname.includes('/admin')) {
          window.history.pushState({ role: 'ADMIN' }, '', '/admin');
        }
      } else {
        if (window.location.pathname.includes('/admin')) {
          window.history.pushState({ role: 'CANDIDATE' }, '', '/');
        }
      }
    }
  };

  // Handle Admin Login
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
      setErrorMsg(err.message || 'Login failed.');
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
      const res = ApiService.login(candEmail.trim(), 'CANDIDATE');
      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMsg(res.message || 'Candidate record not found. Please contact Administrator (poojasri@trustgrid.ai) to be enrolled.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
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

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-8 space-y-6">
          
          {/* Top Primary Switcher: Admin vs Candidate */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleMode === 'ADMIN'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('CANDIDATE')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                roleMode === 'CANDIDATE'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidate Access</span>
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
          {/* ADMIN PORTAL: SIGN IN (PRIMARY / DEFAULT)                */}
          {/* ======================================================== */}
          {roleMode === 'ADMIN' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-blue-950 block">Master Administrator Authentication</span>
                <span className="text-[10px] text-blue-700 font-mono">poojasri@trustgrid.ai</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Email
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
                  Admin Security Password
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
                <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* CANDIDATE PORTAL: SIGN IN WITH ENROLLED EMAIL OR ROLL NO */}
          {/* ======================================================== */}
          {roleMode === 'CANDIDATE' && (
            <form onSubmit={handleCandidateSignIn} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-slate-800 block">Candidate Assessment Portal</span>
                <span className="text-[10px] text-slate-500">Sign in with the email address or roll number registered by admin</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolled Email Address or Candidate Roll Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={candEmail}
                    onChange={e => setCandEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g. candidate@example.com or Roll Number"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Entering Test Portal...' : 'Enter Assessment Station'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 block leading-relaxed">
                  Candidate records are enrolled by Administrator (poojasri@trustgrid.ai). Once the admin activates an assessment, it unlocks for all registered candidates automatically.
                </span>
              </div>
            </form>
          )}

          {/* Google Sheets Sync Indicator */}
          <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected to Master Google Sheets & Apps Script Backend</span>
          </div>

        </div>
      </div>

    </div>
  );
};
