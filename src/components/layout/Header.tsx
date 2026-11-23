/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * Header.tsx - Role-Aware Navigation Bar with User Badge & Sign Out
 */

import React from 'react';
import { User as UserIcon, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { AuthSession } from '../../types';

interface HeaderProps {
  portalMode: 'ADMIN' | 'USER';
  onPortalModeChange: (mode: 'ADMIN' | 'USER') => void;
  currentSession: AuthSession | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portalMode,
  onPortalModeChange,
  currentSession,
  onLogout
}) => {
  const isAdmin = currentSession?.user.Role === 'ADMIN' || currentSession?.user.Role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <img 
              src="/trustgrid-logo.png" 
              alt="TRUSTGRID.AI Logo" 
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={() => {
                if (isAdmin) onPortalModeChange('ADMIN');
                else onPortalModeChange('USER');
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                TRUSTGRID<span className="text-blue-700">.AI</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Online Psychometric Assessment Platform
              </span>
            </div>
          </div>

          {/* Dual Portal Switcher (Only visible to Admin) */}
          {isAdmin ? (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onPortalModeChange('ADMIN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  portalMode === 'ADMIN'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>

              <button
                onClick={() => onPortalModeChange('USER')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  portalMode === 'USER'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Candidate Test Portal</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-200">
              <UserIcon className="w-3.5 h-3.5 text-blue-800" />
              <span>Candidate Testing Workspace</span>
            </div>
          )}

          {/* User Profile Badge & Logout */}
          <div className="flex items-center gap-3">
            {currentSession && (
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {currentSession.user.Full_Name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {currentSession.user.Role === 'ADMIN' || currentSession.user.Role === 'SUPER_ADMIN' ? (
                      <span className="text-blue-700 font-bold">{currentSession.user.Role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
                    ) : (
                      <span>Candidate ({currentSession.candidateId || 'Verified'})</span>
                    )}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                  {currentSession.user.Full_Name.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
