import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getActiveDurationMs, getLiveCost, formatRemaining, formatOrderSummary } from '../utils/helpers';

const ActiveSessionCard = ({ session }) => {
  const { darkMode, togglePauseSession, endSession } = useApp();
  const [display, setDisplay] = useState({ timer: '00:00:00', cost: 0, pulsing: false });
  const intervalRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const activeMs = getActiveDurationMs(session, now);
      const liveCost = getLiveCost(session, now);
      let timerText = '00:00:00';
      let pulsing = false;

      if (session.sessionType === 'PRE' && session.plannedEndTime) {
        const plannedEnd = new Date(session.plannedEndTime);
        let remainingMs = plannedEnd - now;
        if (session.isPaused) remainingMs += (now - new Date(session.lastPauseTime));
        timerText = remainingMs > 0 ? formatRemaining(remainingMs) : '00:00:00';
        pulsing = remainingMs > 0 && remainingMs <= 600000 && !session.isPaused;
      } else {
        timerText = formatRemaining(activeMs);
      }

      setDisplay({ timer: timerText, cost: liveCost, pulsing });
    };

    update();
    intervalRef.current = setInterval(update, 1000);
    return () => clearInterval(intervalRef.current);
  }, [session]);

  const now = new Date();
  const activeMs = getActiveDurationMs(session, now);
  let remainingMs = null;
  let isExpired = false;
  if (session.sessionType === 'PRE' && session.plannedEndTime) {
    const plannedEnd = new Date(session.plannedEndTime);
    remainingMs = plannedEnd - now;
    if (session.isPaused) remainingMs += (now - new Date(session.lastPauseTime));
    isExpired = remainingMs <= 0 && !session.isPaused;
  }

  const borderColor = session.isPaused
    ? 'border-l-yellow-400 opacity-75'
    : isExpired
    ? 'border-l-red-500'
    : 'border-l-green-500';

  const timerColor = session.isPaused
    ? 'text-yellow-500'
    : isExpired
    ? 'text-red-400'
    : darkMode
    ? 'text-green-400'
    : 'text-green-600';

  const handleEnd = () => {
    if (window.confirm("End this session now?")) {
      endSession(session.id);
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden shadow-lg border-l-8 ${borderColor} dark:bg-gray-800/90 bg-white border dark:border-gray-700 border-gray-200 transition-all`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-lg dark:text-white text-gray-800">{session.name}</p>
              {session.isPaused && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 animate-pulse">PAUSED</span>
              )}
              {session.sessionType === 'POST' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">OPEN TIME</span>
              )}
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full ${session.deviceType === 'PC' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {session.deviceType}
              </span>
              <span className="text-xs font-mono dark:text-gray-400 text-gray-600">
                <i className="fas fa-tower-cell"></i> {session.stationId}
              </span>
            </div>
            {session.orders && session.orders.length > 0 && (
              <div className="mt-2 text-[10px] leading-tight dark:text-gray-400 text-gray-500">
                <i className="fas fa-coffee mr-1 text-amber-500/70"></i>
                {formatOrderSummary(session.orders)}{' '}
                <span className="text-amber-500 font-bold whitespace-nowrap">(${session.ordersCost.toFixed(2)})</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs dark:text-gray-400 text-gray-500">Est. Total</p>
            <p className="text-xl font-bold text-amber-400">{display.cost.toFixed(2)} USD</p>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-end">
          <p className={`text-2xl font-mono font-bold tracking-wider timer-mono ${timerColor} ${display.pulsing ? 'pulse-ending' : ''}`}>
            {display.timer}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePauseSession(session.id)}
              className={`w-10 h-10 rounded-lg ${session.isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white transition flex items-center justify-center shadow-md`}
              title={session.isPaused ? 'Resume' : 'Pause'}
            >
              <i className={`fas ${session.isPaused ? 'fa-play' : 'fa-pause'}`}></i>
            </button>
            <button
              onClick={handleEnd}
              className="px-4 py-2 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition flex items-center justify-center gap-2 shadow-md"
            >
              <i className="fas fa-power-off"></i> End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionCard;
