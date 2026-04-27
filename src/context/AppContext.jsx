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
  const [analytics, setAnalytics] = useState(null);
  const [branchId, setBranchId] = useState(1);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [features, setFeatures] = useState({});
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
      let currentBranchId = 1;
      try {
        const branchRes = await axios.get('/branches/');
        if (branchRes.data && branchRes.data.length > 0) {
          currentBranchId = branchRes.data[0].id;
          setBranchId(currentBranchId);
        }
      } catch (e) {
        console.warn("Could not fetch branches", e);
      }

      const fetchCurrentUserProfile = async () => {
        try {
          const res = await axios.get('/auth/me/');
          setCurrentUser({
            id: res.data.id,
            username: res.data.username,
            email: res.data.email,
            role: res.data.role,
            is_superuser: res.data.is_superuser,
          });
          setPermissions(res.data.permissions || {});
          setFeatures(res.data.features || {});
        } catch (e) {
          console.error("Failed to fetch current user profile", e);
        }
      };

      await fetchCurrentUserProfile();
      
      const [typeRes, unitRes, itemRes, sessRes] = await Promise.all([
        axios.get('/resource-types/'),
        axios.get('/resource-units/'),
        axios.get('/inventory-items/'),
        axios.get('/sessions/')
      ]);

      const types = typeRes.data;
      const units = unitRes.data;

      const mappedDevices = types.map(t => {
        const typeUnits = units.filter(u => u.resource_type === t.id);
        return {
          id: t.code,
          name: t.name,
          prefix: t.prefix,
          count: typeUnits.length,
          pricing_strategy: t.pricing_strategy,
          base_price: parseFloat(t.base_price) || 0
        };
      });
      setDevices(mappedDevices);

      try {
        const usersRes = await axios.get('/users/');
        setUsers(usersRes.data);
      } catch (e) { }

      try {
        const logsRes = await axios.get('/audit-logs/');
        setAuditLogs(logsRes.data);
      } catch (e) { }

      const mappedCafe = itemRes.data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category_name,
        price: parseFloat(item.sale_price),
        cost_price: parseFloat(item.cost_price) || 0,
        stock: item.quantity_in_stock || 0
      }));
      setCafeItems(mappedCafe);
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
      setCurrentUser({
        id: res.data.user_id,
        username: res.data.username,
        role: res.data.role,
        is_superuser: res.data.is_superuser
      });
      await fetchData();
      return true;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  const makeDirectSale = async (items) => {
    try {
      // items: [{ id, quantity }]
      await axios.post('/sales/', { items, branchId });
      await fetchData();
      return true;
    } catch (e) {
      alert("Error processing sale: " + JSON.stringify(e.response?.data));
      return false;
    }
  };

  const closeDayReport = async () => {
    try {
      const res = await axios.post('/daily-reports/close_day/', { branchId });
      await fetchData(); // refresh analytics + inventory stock
      return { success: true, data: res.data };
    } catch (e) {
      const msg = e.response?.data?.error || JSON.stringify(e.response?.data) || 'Unknown error';
      return { success: false, error: msg };
    }
  };

  const addUser = async (userData) => {
    try {
      await axios.post('/users/', userData);
      await fetchData();
    } catch (e) { alert("Error adding user"); }
  };

  const updateUser = async (id, userData) => {
    try {
      await axios.patch(`/users/${id}/`, userData);
      await fetchData();
    } catch (e) { alert("Error updating user"); }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Delete user?")) {
      try {
        await axios.delete(`/users/${id}/`);
        await fetchData();
      } catch (e) { alert("Error deleting user"); }
    }
  };

  const clearAuditLogs = async () => {
    if (window.confirm("Clear all logs permanently?")) {
      try {
        await axios.post('/audit-logs/clear_logs/');
        setAuditLogs([]);
      } catch (e) { alert("Error clearing logs"); }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gamehub_token');
    delete axios.defaults.headers.common['Authorization'];
    setSessions([]);
    setCurrentUser(null);
    setPermissions({});
    setFeatures({});
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
      // sessionData from UI: { name, sessionType, durationHours, stationId, deviceType, pricePerHour, fixedPrice }
      const dataToSend = {
        ...sessionData,
        branchId: branchId
      };
      const res = await axios.post('/sessions/', dataToSend);
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

  const addOrderToSession = async (sessionId, inventoryItemId, name, price, quantity = 1) => {
    try {
      const res = await axios.post(`/sessions/${sessionId}/add_order/`, {
        inventoryItemId,
        name,
        price,
        quantity,
      });
      setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
      // Refresh inventory items to reflect stock change
      const itemRes = await axios.get('/inventory-items/');
      const mappedCafe = itemRes.data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category_code,
        price: parseFloat(item.sale_price),
        cost_price: parseFloat(item.cost_price) || 0,
        stock: item.quantity_in_stock || 0
      }));
      setCafeItems(mappedCafe);
    } catch (e) {
      alert("Error adding order: " + (e.response?.data?.error || ""));
    }
  };

  const removeOrderFromSession = async (sessionId, orderId) => {
    try {
      const res = await axios.post(`/sessions/${sessionId}/remove_order/`, { orderId });
      setSessions(prev => prev.map(s => s.id === sessionId ? res.data : s));
      // Refresh inventory items to reflect stock change
      const itemRes = await axios.get('/inventory-items/');
      const mappedCafe = itemRes.data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category_code,
        price: parseFloat(item.sale_price),
        cost_price: parseFloat(item.cost_price) || 0,
        stock: item.quantity_in_stock || 0
      }));
      setCafeItems(mappedCafe);
    } catch (e) {
      alert("Error removing order: " + (e.response?.data?.error || ""));
    }
  };


  const checkAutoEnd = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const res = await axios.get('/sessions/');
        setSessions(res.data);
        try {
          const anRes = await axios.get('/analytics/');
          setAnalytics(anRes.data);
        } catch (e) { }
      }
    } catch (e) { }
  }, [isAuthenticated]);

  // Optionally set interval to check auto end
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(checkAutoEnd, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, checkAutoEnd]);

  const saveSettings = async (newDevices, newCafeItems) => {
    try {
      const resource_types = newDevices.map(d => ({
        code: d.id,
        name: d.name,
        prefix: d.prefix,
        pricing_strategy: d.pricing_strategy || 'HOURLY',
        base_price: d.base_price || 0,
      }));

      const resource_units = [];
      newDevices.forEach(d => {
        for (let i = 1; i <= d.count; i++) {
          resource_units.push({
            code: `${d.prefix}${i.toString().padStart(2, '0')}`,
            resource_type_code: d.id,
            display_name: `${d.name} ${i}`
          });
        }
      });

      const inventory_categories = [{ name: 'Cafe', code: 'CAFE' }];
      const inventory_items = newCafeItems.map((c) => ({
        name: c.name,
        sale_price: c.price,
        cost_price: c.cost_price || 0,
        category_code: 'CAFE',
        quantity_in_stock: c.stock !== undefined ? c.stock : 0,
      }));

      await axios.post('/setup/bulk/', {
        branch: { name: 'Main Branch', code: 'MAIN' },
        resource_types,
        resource_units,
        inventory_categories,
        inventory_items
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
      sessions, devices, cafeItems, analytics, darkMode, isAuthenticated, hasCompletedSetup,
      users, auditLogs, branchId, currentUser, permissions, features,
      toggleDarkMode, login, logout, completeSetup, resetSetup,
      addSession, endSession, deleteSession, togglePauseSession,
      addOrderToSession, removeOrderFromSession, checkAutoEnd, saveSettings, exportDailyReport,
      isStationActive, makeDirectSale, closeDayReport, addUser, updateUser, deleteUser, clearAuditLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};
