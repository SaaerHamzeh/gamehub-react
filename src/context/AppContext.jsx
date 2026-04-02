import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getActiveDurationMs, playAlertSound } from '../utils/helpers';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [sessions, setSessions] = useState(() => {
    const s = localStorage.getItem('gamehub_sessions');
    return s ? JSON.parse(s) : [];
  });
  const [devices, setDevices] = useState(() => {
    const s = localStorage.getItem('gamehub_devices');
    return s ? JSON.parse(s) : [];
  });
  const [cafeItems, setCafeItems] = useState(() => {
    const s = localStorage.getItem('gamehub_cafe_items');
    return s ? JSON.parse(s) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem('darkMode');
    return s !== null ? JSON.parse(s) : true;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('gamehub_auth') === 'true'
  );
  const [hasCompletedSetup, setHasCompletedSetup] = useState(
    localStorage.getItem('gamehub_setup_complete') === 'true'
  );

  // Persist
  useEffect(() => {
    localStorage.setItem('gamehub_sessions', JSON.stringify(sessions));
    localStorage.setItem('gamehub_devices', JSON.stringify(devices));
    localStorage.setItem('gamehub_cafe_items', JSON.stringify(cafeItems));
  }, [sessions, devices, cafeItems]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = (pin) => {
    if (pin === 'admin' || pin === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gamehub_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('gamehub_auth');
  };

  const resetSetup = () => {
    localStorage.removeItem('gamehub_setup_complete');
    setHasCompletedSetup(false);
  };

  const completeSetup = () => {
    localStorage.setItem('gamehub_setup_complete', 'true');
    setHasCompletedSetup(true);
  };

  const isStationActive = useCallback((stationId) => {
    return sessions.some(s => !s.endTime && s.stationId === stationId);
  }, [sessions]);

  const addSession = (sessionData) => {
    const startTime = new Date();
    let plannedEndTime = null;
    if (sessionData.sessionType === 'PRE' && sessionData.durationHours > 0) {
      plannedEndTime = new Date(startTime.getTime() + sessionData.durationHours * 3600000);
    }
    const newSession = {
      id: Date.now() + Math.random() * 1000,
      ...sessionData,
      startTime: startTime.toISOString(),
      plannedEndTime: plannedEndTime ? plannedEndTime.toISOString() : null,
      endTime: null,
      durationMinutes: null,
      totalCost: null,
      orders: [],
      ordersCost: 0,
      isPaused: false,
      lastPauseTime: null,
      totalPausedMs: 0,
      alerted10min: false,
    };
    setSessions(prev => [...prev, newSession]);
  };

  const endSession = (sessionId, discount = 0) => {
    const now = new Date();
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId || session.endTime) return session;
      const activeMs = getActiveDurationMs(session, now);
      const durationHours = activeMs / (1000 * 3600);
      const rawCost = (durationHours * session.pricePerHour) + (session.ordersCost || 0);
      let updated = { ...session };
      if (updated.isPaused) {
        updated.isPaused = false;
        updated.totalPausedMs = (updated.totalPausedMs || 0) + (now - new Date(updated.lastPauseTime));
      }
      return {
        ...updated,
        endTime: now.toISOString(),
        durationMinutes: Math.round((activeMs / 60000) * 100) / 100,
        totalCost: Math.max(0, parseFloat((rawCost - discount).toFixed(2))),
        discount,
      };
    }));
  };

  const deleteSession = (sessionId) => {
    if (window.confirm("Delete this session permanently?")) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const togglePauseSession = (sessionId) => {
    const now = new Date();
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId || session.endTime) return session;
      if (session.isPaused) {
        const delta = now - new Date(session.lastPauseTime);
        return {
          ...session,
          isPaused: false,
          totalPausedMs: (session.totalPausedMs || 0) + delta,
          plannedEndTime: session.plannedEndTime
            ? new Date(new Date(session.plannedEndTime).getTime() + delta).toISOString()
            : null,
        };
      }
      return { ...session, isPaused: true, lastPauseTime: now.toISOString() };
    }));
  };

  const addOrderToSession = (sessionId, itemName, itemPrice) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId || session.endTime) return session;
      const orders = [...(session.orders || []), { name: itemName, price: itemPrice, time: new Date().toISOString() }];
      return { ...session, orders, ordersCost: (session.ordersCost || 0) + itemPrice };
    }));
  };

  const checkAutoEnd = useCallback(() => {
    const now = new Date();
    setSessions(prev => {
      let changed = false;
      const updated = prev.map(session => {
        if (!session.endTime && session.plannedEndTime && !session.isPaused) {
          const plannedEnd = new Date(session.plannedEndTime);
          if (now >= plannedEnd) {
            const activeMs = getActiveDurationMs(session, now);
            const rawCost = ((activeMs / (1000 * 3600)) * session.pricePerHour) + (session.ordersCost || 0);
            changed = true;
            return {
              ...session,
              endTime: now.toISOString(),
              durationMinutes: Math.round((activeMs / 60000) * 100) / 100,
              totalCost: parseFloat(rawCost.toFixed(2)),
            };
          }
          const remainingMs = plannedEnd - now;
          if (remainingMs > 0 && remainingMs <= 600000 && !session.alerted10min) {
            playAlertSound();
            changed = true;
            return { ...session, alerted10min: true };
          }
        }
        return session;
      });
      return changed ? updated : prev;
    });
  }, []);

  const saveSettings = (newDevices, newCafeItems) => {
    setDevices(newDevices);
    setCafeItems(newCafeItems);
  };

  const exportDailyReport = () => {
    const todayStr = new Date().toDateString();
    const todaysCompleted = sessions.filter(s => s.endTime && new Date(s.endTime).toDateString() === todayStr);
    if (todaysCompleted.length === 0) { alert("No completed sessions today."); return; }
    const headers = ["Session ID", "Customer", "Device", "Station", "Start", "End", "Duration", "Earnings"];
    const rows = todaysCompleted.map(s => [
      s.id, s.name, s.deviceType, s.stationId,
      new Date(s.startTime).toLocaleTimeString(),
      new Date(s.endTime).toLocaleTimeString(),
      `${Math.floor(s.durationMinutes / 60)}h ${Math.floor(s.durationMinutes % 60)}m`,
      `$${s.totalCost}`,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gamehub_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AppContext.Provider value={{
      sessions, devices, cafeItems, darkMode, isAuthenticated, hasCompletedSetup,
      toggleDarkMode, login, logout, completeSetup, resetSetup,
      addSession, endSession, deleteSession, togglePauseSession,
      addOrderToSession, checkAutoEnd, saveSettings, exportDailyReport,
      isStationActive,
    }}>
      {children}
    </AppContext.Provider>
  );
};
