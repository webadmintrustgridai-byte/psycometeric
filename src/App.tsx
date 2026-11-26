/**
 * TRUSTGRID.AI - ONLINE PSYCHOMETRIC ASSESSMENT PLATFORM
 * App.tsx - Streamlined Dual-Portal Orchestrator with Role Authentication
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { AdminPortal } from './components/admin/AdminPortal';
import { UserPortal } from './components/candidate/UserPortal';
import { AuthScreen } from './components/auth/AuthScreen';
import { ApiService } from './services/apiService';
import { AuthSession, Candidate } from './types';

// Helper to determine if current browser URL corresponds to /admin
const isAdminPath = (): boolean => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.toLowerCase();
  const h = window.location.hash.toLowerCase();
  return p === '/admin' || p.startsWith('/admin/') || p.includes('/admin') || h.includes('admin');
};

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => ApiService.getCurrentSession());
  const [portalMode, setPortalMode] = useState<'ADMIN' | 'USER'>(() => {
    const cur = ApiService.getCurrentSession();
    if (cur?.user.Role === 'ADMIN' || cur?.user.Role === 'SUPER_ADMIN') {
      return 'ADMIN';
    }
    if (isAdminPath()) {
      return 'ADMIN';
    }
    return 'USER';
  });

  // Synchronize browser URL bar with portalMode without full page reloads
  const updateBrowserRoute = useCallback((mode: 'ADMIN' | 'USER') => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    if (mode === 'ADMIN') {
      if (!currentPath.includes('/admin')) {
        window.history.pushState({ mode: 'ADMIN' }, '', '/admin');
      }
    } else {
      if (currentPath.includes('/admin')) {
        window.history.pushState({ mode: 'USER' }, '', '/');
      }
    }
  }, []);

  const handlePortalModeChange = (mode: 'ADMIN' | 'USER') => {
    setPortalMode(mode);
    updateBrowserRoute(mode);
  };

  // Sync state on popstate and hashchange (browser forward/back or URL typing)
  useEffect(() => {
    const handleUrlChange = () => {
      const onAdmin = isAdminPath();
      if (onAdmin) {
        setPortalMode('ADMIN');
      } else {
        if (!session || (session.user.Role !== 'ADMIN' && session.user.Role !== 'SUPER_ADMIN')) {
          setPortalMode('USER');
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Initial sync
    if (isAdminPath() && portalMode !== 'ADMIN') {
      setPortalMode('ADMIN');
    }

    // Background sync candidate database from Google Sheets
    ApiService.pullAllFromGas().catch(() => {});

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [session, portalMode]);

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    if (newSession.user.Role === 'ADMIN' || newSession.user.Role === 'SUPER_ADMIN') {
      setPortalMode('ADMIN');
      updateBrowserRoute('ADMIN');
    } else {
      setPortalMode('USER');
      updateBrowserRoute('USER');
    }
  };

  const handleLogout = () => {
    ApiService.logout();
    setSession(null);
    if (!isAdminPath()) {
      updateBrowserRoute('USER');
    }
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
        onPortalModeChange={handlePortalModeChange}
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
