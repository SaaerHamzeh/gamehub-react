import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { getTodayRevenue, getRevenueTrend, getActiveCountByType, formatMoney } from './utils/helpers';

import LoginPage from './components/LoginPage';
import SetupPage from './components/SetupPage';
import StatCard from './components/StatCard';
import SessionForm from './components/SessionForm';
import CafePanel from './components/CafePanel';
import ActiveSessionCard from './components/ActiveSessionCard';
import SessionHistory from './components/SessionHistory';
import SettingsModal from './components/SettingsModal';
import FinalizeModal from './components/FinalizeModal';
import DailyReportModal from './components/DailyReportModal';

function Dashboard() {
  const { sessions, devices, analytics, darkMode, toggleDarkMode, logout, checkAutoEnd, resetSetup, currentUser, permissions, features } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [finalizeSessionId, setFinalizeSessionId] = useState(null);

  const canViewReport = permissions?.view_analytics;
  const canManageSettings = permissions?.manage_settings;
  const canViewNetProfit = permissions?.view_analytics; // We can add a specific flag if needed

  useEffect(() => {
    // Initial fetch of analytics and check
    checkAutoEnd();
    const interval = setInterval(() => { checkAutoEnd(); }, 5000); // Poll more frequently for a highly responsive POS
    return () => clearInterval(interval);
  }, [checkAutoEnd]);

  const activeSessions = sessions.filter(s => !s.endTime);
  const todayRevenue = analytics ? analytics.completedRevenue : 0;
  const netProfit = analytics ? analytics.netProfit : 0;
  const totalActive = analytics ? analytics.activeSessions : activeSessions.length;
  const revenueTrend = getRevenueTrend(sessions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <i className="fas fa-gamepad text-3xl text-rose-500 drop-shadow-lg"></i>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white text-gray-800">
            GameHub<span className="text-rose-500"> Manager</span>
          </h1>
          <span className="text-xs font-mono px-2 py-1 rounded-full dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700">AUTO-END</span>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl dark:bg-gray-800/50 bg-white shadow-sm border dark:border-gray-700 border-gray-200 mr-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-rose-500/20">
                {currentUser.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold dark:text-gray-200 text-gray-800 leading-none">
                  {currentUser.username}
                </span>
                <span className="text-[10px] font-bold text-rose-500 leading-none mt-1 uppercase tracking-widest">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}
          {canViewReport && (
            <button onClick={() => setReportOpen(true)} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md bg-emerald-500 text-white hover:bg-emerald-600 font-bold">
              <i className="fas fa-file-invoice"></i><span className="hidden sm:inline">Daily Report</span>
            </button>
          )}
          {canManageSettings && (
            <button onClick={() => setSettingsOpen(true)} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white dark:text-gray-300 text-gray-700 border dark:border-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <i className="fas fa-cog"></i><span className="hidden sm:inline">Settings</span>
            </button>
          )}
          <button onClick={toggleDarkMode} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white dark:text-yellow-300 text-gray-700 border dark:border-gray-600 border-gray-300">
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i><span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={logout} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white text-red-500 border dark:border-gray-600 border-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30">
            <i className="fas fa-sign-out-alt"></i><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-10 max-w-lg text-center shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/10 mb-6 animate-bounce-slow">
              <i className="fas fa-cogs text-5xl text-indigo-500 drop-shadow-lg"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3">System Not Configured</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Your GameHub Pro dashboard is ready, but we didn't find any gaming devices in your current database. Let's get you set up so you can start logging sessions!
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setSettingsOpen(true)} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg transition transform hover:-translate-y-1 active:scale-95">
                <i className="fas fa-magic"></i> Quick Configuration
              </button>
              <button onClick={resetSetup} className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <i className="fas fa-rotate-left mr-2"></i> Re-run Setup Wizard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard 
              title="Income Today" 
              value={formatMoney(todayRevenue)} 
              icon="fa-coins" 
              trend={revenueTrend.text} 
              trendUp={revenueTrend.up} 
              onClick={() => canViewReport && setReportOpen(true)}
            />
            {canViewNetProfit && (
              <StatCard 
                title="Net Profit" 
                value={formatMoney(netProfit)} 
                icon="fa-chart-line" 
                subText="After inventory costs" 
                onClick={() => setReportOpen(true)}
              />
            )}
            <StatCard 
              title="Live Gamers" 
              value={totalActive} 
              icon="fa-users" 
              subText="Currently active" 
              onClick={() => canViewReport && setReportOpen(true)}
            />
            <StatCard 
              title="Stations Active" 
              value={`${activeSessions.length} / ${devices.reduce((a,b) => a+b.count,0)}`} 
              icon="fa-gamepad" 
              subText="Total capacity" 
              onClick={() => canViewReport && setReportOpen(true)}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
              <div className="rounded-2xl shadow-xl p-5 dark:bg-gray-800/80 bg-white/90 border dark:border-gray-700 border-gray-200">
                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-gray-800">
                  <i className="fas fa-play-circle text-green-500"></i> START SESSION
                </h3>
                <SessionForm />
              </div>
              <CafePanel />
            </div>

            <div className="xl:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-tv text-rose-500 text-xl"></i>
                  <h2 className="text-xl font-bold dark:text-white text-gray-800">LIVE SESSION MONITOR</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeSessions.length ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {activeSessions.length} active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeSessions.map(session => (
                    <ActiveSessionCard key={session.id} session={session} />
                  ))}
                </div>
                {activeSessions.length === 0 && (
                  <div className="rounded-2xl p-8 text-center dark:bg-gray-800/40 bg-white/60 border dark:border-gray-700 border-gray-200">
                    <i className="fas fa-hourglass-half text-4xl text-gray-500 mb-2"></i>
                    <p className="dark:text-gray-400 text-gray-500">No active gaming sessions. Start a new session!</p>
                  </div>
                )}
              </div>
              <SessionHistory onViewReceipt={(id) => setFinalizeSessionId(id)} />
            </div>
          </div>
        </>
      )}

      <footer className="py-10 text-center opacity-70">
        <p className="text-sm dark:text-gray-400 text-gray-500 font-medium tracking-wide flex items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()} GameHub Pro</span>
          <span className="mx-2 opacity-30">|</span>
          <span className="bg-indigo-500/10 px-3 py-1 rounded-full text-indigo-500 text-xs font-bold">
            Designed by <span className="capitalize">Siraj Masoud</span>
          </span>
        </p>
      </footer>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DailyReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      {finalizeSessionId && (
        <FinalizeModal sessionId={finalizeSessionId} onClose={() => setFinalizeSessionId(null)} />
      )}
    </div>
  );
}

// ─── Root Router ──────────────────────────────────────────────────────────────
function App() {
  const { isAuthenticated, hasCompletedSetup } = useApp();

  // 1. Not logged in → Login
  if (!isAuthenticated) return <LoginPage />;

  // 2. Logged in but setup not done → Setup Wizard
  if (!hasCompletedSetup) return <SetupPage />;

  // 3. All good → Dashboard
  return <Dashboard />;
}

export default App;
