export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "0h 0m";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hrs}h ${mins}m`;
};

export const formatRemaining = (ms) => {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatMoney = (value) => `$${value.toFixed(2)} USD`;

export const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
};

export const formatOrderSummary = (orders) => {
  if (!orders || !orders.length) return "";
  const counts = {};
  orders.forEach(o => counts[o.name] = (counts[o.name] || 0) + 1);
  return Object.entries(counts).map(([name, qty]) => qty > 1 ? `${qty}x ${name}` : name).join(', ');
};

export const getActiveDurationMs = (session, refDate = new Date()) => {
  const start = new Date(session.startTime);
  let paused = session.totalPausedMs || 0;
  if (session.isPaused && session.lastPauseTime && !session.endTime) {
    paused += (refDate - new Date(session.lastPauseTime));
  }
  return Math.max(0, refDate - start - paused);
};

export const getLiveCost = (session, refDate = new Date()) => {
  const activeMs = getActiveDurationMs(session, refDate);
  return ((activeMs / (1000 * 3600)) * session.pricePerHour) + (session.ordersCost || 0);
};

export const getTodayRevenue = (sessions) => {
  const today = new Date().toDateString();
  return sessions
    .filter(s => s.endTime && new Date(s.endTime).toDateString() === today)
    .reduce((sum, s) => sum + (s.totalCost || 0), 0);
};

export const getYesterdayRevenue = (sessions) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  return sessions
    .filter(s => s.endTime && new Date(s.endTime).toDateString() === yesterdayStr)
    .reduce((sum, s) => sum + (s.totalCost || 0), 0);
};

export const getRevenueTrend = (sessions) => {
  const todayRev = getTodayRevenue(sessions);
  const yesterdayRev = getYesterdayRevenue(sessions);
  if (yesterdayRev === 0) {
    if (todayRev > 0) return { text: "+100% vs yesterday", up: true };
    return { text: "0% vs yesterday", up: true };
  }
  const percent = Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100);
  const sign = percent >= 0 ? '+' : '';
  return { text: `${sign}${percent}% vs yesterday`, up: percent >= 0 };
};

export const getActiveCountByType = (sessions, deviceType) => {
  return sessions.filter(s => !s.endTime && s.deviceType === deviceType).length;
};

export const playAlertSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio Context not allowed or supported", e);
  }
};
