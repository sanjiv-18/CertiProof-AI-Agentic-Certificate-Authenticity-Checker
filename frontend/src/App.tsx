import { useState, useEffect } from 'react';
import { Sidebar, type ScreenId } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { NewVerificationPage } from './pages/NewVerificationPage';
import { ApprovalQueuePage } from './pages/ApprovalQueuePage';
import { VerificationResultPage } from './pages/VerificationResultPage';
import { EvidenceViewerPage } from './pages/EvidenceViewerPage';
import { HistoryPage } from './pages/HistoryPage';
import { TestRunnerPage } from './pages/TestRunnerPage';
import { SettingsPage } from './pages/SettingsPage';
import { apiClient } from './api/client';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | undefined>(undefined);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Poll pending count periodically
  const refreshPendingCount = async () => {
    try {
      const stats = await apiClient.getStats();
      setPendingCount(stats.pending_approvals);
    } catch {
      // ignore in background
    }
  };

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (screen: ScreenId, verificationId?: string) => {
    if (verificationId) {
      setSelectedVerificationId(verificationId);
    }
    setCurrentScreen(screen);
    refreshPendingCount();
  };

  const screenTitles: Record<ScreenId, string> = {
    overview: 'Overview Dashboard',
    'new-verification': 'New Certificate Verification',
    'approval-queue': 'Human Approval Queue',
    'verification-result': 'Verification Results & Audit Trail',
    'evidence-viewer': 'Source Evidence Viewer',
    history: 'Verification History',
    'test-runner': 'Official Test-Case Runner',
    settings: 'Settings & Issuer Sources',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 relative font-sans">
      {/* Ambient background glow orbs for spatial depth */}
      <div className="ambient-glow-blue top-[-100px] left-[200px]" />
      <div className="ambient-glow-cyan bottom-[-100px] right-[100px]" />

      {/* Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => handleNavigate(screen)}
        pendingApprovalsCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        {/* Navbar */}
        <Navbar
          currentScreenName={screenTitles[currentScreen]}
          pendingApprovalsCount={pendingCount}
          onOpenApprovalQueue={() => handleNavigate('approval-queue')}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentScreen === 'overview' && (
              <DashboardPage onNavigate={handleNavigate} />
            )}
            {currentScreen === 'new-verification' && (
              <NewVerificationPage onNavigate={handleNavigate} />
            )}
            {currentScreen === 'approval-queue' && (
              <ApprovalQueuePage onNavigate={handleNavigate} />
            )}
            {currentScreen === 'verification-result' && (
              <VerificationResultPage
                verificationId={selectedVerificationId}
                onNavigate={handleNavigate}
              />
            )}
            {currentScreen === 'evidence-viewer' && (
              <EvidenceViewerPage
                verificationId={selectedVerificationId}
                onNavigate={handleNavigate}
              />
            )}
            {currentScreen === 'history' && (
              <HistoryPage onNavigate={handleNavigate} />
            )}
            {currentScreen === 'test-runner' && (
              <TestRunnerPage onNavigate={handleNavigate} />
            )}
            {currentScreen === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
