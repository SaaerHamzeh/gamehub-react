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

function Dashboard() {
  const { sessions, devices, darkMode, toggleDarkMode, logout, checkAutoEnd, exportDailyReport } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [finalizeSessionId, setFinalizeSessionId] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => { checkAutoEnd(); }, 1000);
    return () => clearInterval(interval);
  }, [checkAutoEnd]);

  const activeSessions = sessions.filter(s => !s.endTime);
  const todayRevenue = getTodayRevenue(sessions);
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
          <button onClick={exportDailyReport} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white dark:text-gray-300 text-gray-700 border dark:border-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <i className="fas fa-file-csv text-green-500"></i><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setSettingsOpen(true)} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white dark:text-gray-300 text-gray-700 border dark:border-gray-600 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <i className="fas fa-cog"></i><span className="hidden sm:inline">Settings</span>
          </button>
          <button onClick={toggleDarkMode} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white dark:text-yellow-300 text-gray-700 border dark:border-gray-600 border-gray-300">
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i><span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={logout} className="px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md dark:bg-gray-800 bg-white text-red-500 border dark:border-gray-600 border-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30">
            <i className="fas fa-sign-out-alt"></i><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Today's Revenue" value={formatMoney(todayRevenue)} icon="fa-coins" trend={revenueTrend.text} trendUp={revenueTrend.up} />
        <StatCard title="Active Sessions" value={activeSessions.length} icon="fa-users" subText="Currently gaming" />
        {devices.map(d => (
          <StatCard key={d.id} title={`${d.id} Slots Active`}
            value={`${getActiveCountByType(sessions, d.id)} / ${d.count}`}
            icon={d.id === 'PC' ? 'fa-desktop' : d.id === 'PS' ? 'fa-playstation' : 'fa-gamepad'}
            subText={`Total ${d.count} stations`} />
        ))}
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
