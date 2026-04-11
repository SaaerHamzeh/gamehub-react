import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { playAlertSound } from '../utils/helpers';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Setup Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

export const AppProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [cafeItems, setCafeItems] = useState([]);
  
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem('darkMode');
    return s !== null ? JSON.parse(s) : true;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(
    localStorage.getItem('gamehub_setup_complete') === 'true'
  );

  // Initialize Auth from Token
  useEffect(() => {
    const token = localStorage.getItem('gamehub_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [devRes, cafeRes, sessRes] = await Promise.all([
        axios.get('/settings/devices/'),
        axios.get('/settings/cafe-items/'),
        axios.get('/sessions/')
      ]);
      // Normalize Devices: Backend uses id as primary key (db_id conceptually), map prefix+count? 
      // Wait, backend ResourceConfig has 'id', 'name', 'prefix', 'count'. Perfect match for frontend.
      setDevices(devRes.data);
      setCafeItems(cafeRes.data);
      setSessions(sessRes.data);
    } catch (e) {
      console.error("Failed to fetch data", e);
      if (e.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = async (username, password) => {
    try {
      const res = await axios.post('/auth/login/', { username, password });
      const token = res.data.token;
      localStorage.setItem('gamehub_token', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      setIsAuthenticated(true);
      await fetchData();
      return true;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gamehub_token');
    delete axios.defaults.headers.common['Authorization'];
    setSessions([]);
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

  const addSession = async (sessionData) => {
    try {
      // sessionData from UI: { name, sessionType, durationHours, stationId, deviceType, pricePerHour }
      const res = await axios.post('/sessions/', sessionData);
      setSessions(prev => [res.data, ...prev]);
    } catch (e) {
      alert("Error starting session: " + JSON.stringify(e.response?.data));
    }
  };

  const endSession = async (sessionId, discount = 0) => {
    try {
      const res = await axios.post(`/sessions/${sessionId}/end/`, { discount });
      // Update local state smoothly
      setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
    } catch (e) {
       alert("Error ending session");
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm("Delete this session permanently?")) {
      try {
        await axios.delete(`/sessions/${sessionId}/`);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } catch (e) {
        alert("Error deleting session");
      }
    }
  };

  const togglePauseSession = async (sessionId) => {
    try {
      const res = await axios.post(`/sessions/${sessionId}/pause/`);
      setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
    } catch (e) {
      alert("Error pausing/resuming session");
    }
  };

  const addOrderToSession = async (sessionId, itemName, itemPrice) => {
    try {
      const res = await axios.post(`/sessions/${sessionId}/add_order/`, { name: itemName, price: itemPrice });
      setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
    } catch (e) {
      alert("Error adding order");
    }
  };

  const checkAutoEnd = useCallback(async () => {
    // We can just rely on get_queryset to do auto_end, so polling GET /sessions/ forces verification
    try {
       if (isAuthenticated) {
          const res = await axios.get('/sessions/');
          // Replace locally
          setSessions(res.data);
       }
    } catch (e) {}
  }, [isAuthenticated]);

  // Optionally set interval to check auto end
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(checkAutoEnd, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, checkAutoEnd]);


  const saveSettings = async (newDevices, newCafeItems) => {
    try {
      await axios.post('/settings/bulk-sync/', {
        devices: newDevices,
        cafe_items: newCafeItems
      });
      await fetchData();
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const exportDailyReport = () => {
    const todayStr = new Date().toDateString();
    const todaysCompleted = sessions.filter(s => s.endTime && new Date(s.endTime).toDateString() === todayStr);
    if (todaysCompleted.length === 0) { alert("No completed sessions today."); return; }
    const headers = ["Session ID", "Customer", "Station", "Start", "End", "Duration", "Earnings"];
    const rows = todaysCompleted.map(s => [
      s.id, s.name, s.resourceId || s.stationId,
      new Date(s.startTime).toLocaleTimeString(),
      new Date(s.endTime).toLocaleTimeString(),
      `${Math.floor((s.durationMinutes || 0) / 60)}h ${Math.floor((s.durationMinutes || 0) % 60)}m`,
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
