/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * App.tsx - Streamlined Dual-Portal Orchestrator with Role Authentication
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { AdminPortal } from './components/admin/AdminPortal';
import { UserPortal } from './components/candidate/UserPortal';
import { AuthScreen } from './components/auth/AuthScreen';
import { ApiService } from './services/apiService';
import { AuthSession, Candidate } from './types';

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => ApiService.getCurrentSession());
  const [portalMode, setPortalMode] = useState<'ADMIN' | 'USER'>(() => {
    const cur = ApiService.getCurrentSession();
    return cur?.user.Role === 'ADMIN' ? 'ADMIN' : 'USER';
  });

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    if (newSession.user.Role === 'ADMIN') {
      setPortalMode('ADMIN');
    } else {
      setPortalMode('USER');
    }
  };

  const handleLogout = () => {
    ApiService.logout();
    setSession(null);
  };

  // If not authenticated, display the unified Auth Portal
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Find candidate profile for candidate session
  const candidateUser: Candidate | undefined = session.candidateId
    ? ApiService.getCandidateById(session.candidateId)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Header with Role Awareness & Logout */}
      <Header
        portalMode={portalMode}
        onPortalModeChange={setPortalMode}
        currentSession={session}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {portalMode === 'ADMIN' ? (
          <AdminPortal />
        ) : (
          <UserPortal initialCandidate={candidateUser} />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-400">
        &copy; 2026 TRUSTGRID.AI • Online Psychometric Assessment Platform • Standard Normative STEN Scale (Mean 5.5, SD 2.0)
      </footer>

    </div>
  );
};

export default App;
