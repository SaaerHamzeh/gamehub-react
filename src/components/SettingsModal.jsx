import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UserManagement from './UserManagement';
import AuditLogsView from './AuditLogsView';

const SettingsModal = ({ isOpen, onClose }) => {
  const { devices, cafeItems, saveSettings, resetSetup, currentUser, permissions } = useApp();
  const [tempDevices, setTempDevices] = useState([]);
  const [tempCafe, setTempCafe] = useState([]);
  const [activeTab, setActiveTab] = useState('system');

  const canManageUsers = permissions?.manage_users;
  const canViewLogs = permissions?.view_audit_logs;
  const canFullConfig = permissions?.manage_settings; // To add/remove devices

  useEffect(() => {
    if (isOpen) {
      setTempDevices(JSON.parse(JSON.stringify(devices)));
      setTempCafe(JSON.parse(JSON.stringify(cafeItems)));
    }
  }, [isOpen, devices, cafeItems]);

  const updateDevice = (index, field, value) => {
    setTempDevices(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  };

  const removeDevice = (index) => {
    setTempDevices(prev => prev.filter((_, i) => i !== index));
  };

  const addDevice = () => {
    let newId = 'NEW';
    let counter = 1;
    while (tempDevices.some(d => d.id === newId)) { newId = `NEW${counter}`; counter++; }
    setTempDevices(prev => [...prev, { id: newId, name: '🎮 NEW DEVICE', prefix: 'ND-', count: 1, pricing_strategy: 'HOURLY', base_price: 5.00 }]);
  };

  const updateCafe = (index, field, value) => {
    setTempCafe(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const removeCafe = (index) => {
    setTempCafe(prev => prev.filter((_, i) => i !== index));
  };

  const addCafe = () => {
    setTempCafe(prev => [...prev, { name: '🥤 New Item', price: 2.00, cost_price: 1.00, stock: 50 }]);
  };

  const handleSave = () => {
    const deviceIds = new Set();
    for (let d of tempDevices) {
      if (!d.id || !d.name || !d.prefix) { alert("All fields must be filled out for devices."); return; }
      d.id = d.id.trim();
      if (deviceIds.has(d.id.toLowerCase())) { alert(`Device ID "${d.id}" is duplicated.`); return; }
      deviceIds.add(d.id.toLowerCase());
      if (d.count <= 0 || isNaN(d.count)) d.count = 1;
    }
    for (let c of tempCafe) {
      if (!c.name) { alert("All cafe items must have a name."); return; }
      if (c.price < 0 || isNaN(c.price)) c.price = 0;
    }
    saveSettings(tempDevices, tempCafe);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white text-gray-800">
            <i className="fas fa-cog text-indigo-500 mr-2"></i>System Settings
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 flex bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === 'system' ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            System & POS
          </button>
          {canManageUsers && (
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all
                ${activeTab === 'users' ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              Manage Staff
            </button>
          )}
          {canViewLogs && (
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all
                ${activeTab === 'logs' ? 'border-b-4 border-indigo-500 text-indigo-500' : 'text-gray-400 hover:text-gray-600'}
              `}
            >
              Audit Logs
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto w-full">
          {activeTab === 'system' && (
            <>
              {/* First-time welcome banner */}
              {tempDevices.length === 0 && tempCafe.length === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-sm flex gap-3 items-start">
                  <i className="fas fa-hand-wave text-xl mt-0.5"></i>
                  <div>
                    <p className="font-bold">مرحباً! أول مرة تستخدم التطبيق؟</p>
                    <p className="opacity-80 mt-1">أضف أجهزتك (PC، PS5...) وعناصر الكافيه أدناه، ثم احفظ للبدء.</p>
                  </div>
                </div>
              )}

              {/* Devices */}
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fas fa-gamepad mr-2"></i> Gaming Devices
              </h3>
              <div className="mb-4">
                {tempDevices.map((d, index) => (
                  <div key={index} className="mb-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-12 gap-3 mb-3">
                      <div className="col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">ID</label>
                        <input type="text" value={d.id} onChange={e => updateDevice(index, 'id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm" />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                        <input type="text" value={d.name} onChange={e => updateDevice(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Prefix</label>
                        <input type="text" value={d.prefix} onChange={e => updateDevice(index, 'prefix', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Count</label>
                        <input type="number" min="1" value={d.count} onChange={e => updateDevice(index, 'count', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Pricing Strategy</label>
                        <select value={d.pricing_strategy} onChange={e => updateDevice(index, 'pricing_strategy', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white">
                          <option value="HOURLY">Hourly Rate</option>
                          <option value="FIXED">Fixed Price</option>
                          <option value="PER_GAME">Per Game</option>
                        </select>
                      </div>
                      <div className="col-span-6">
                        <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Base Price ($)</label>
                        <input type="number" step="0.5" min="0" value={d.base_price} onChange={e => updateDevice(index, 'base_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white" />
                      </div>
                      <div className="col-span-1 flex items-end">
                        {canFullConfig && (
                          <button onClick={() => removeDevice(index)} className="w-full py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition border border-red-500/0 hover:border-red-500/30">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {canFullConfig && (
                <button onClick={addDevice} className="mb-8 px-4 py-2 text-sm bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl font-medium transition border border-indigo-500/30">
                  <i className="fas fa-plus mr-1"></i> Add Device
                </button>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 mb-6 w-full"></div>

              {/* Cafe Items */}
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fas fa-coffee mr-2"></i> Cafe POS Items
              </h3>
              <div className="mb-4">
                {tempCafe.map((c, index) => (
                  <div key={index} className="flex gap-3 mb-3 items-end bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600 flex-wrap sm:flex-nowrap">
                    <div className="w-full sm:w-2/5">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Item Name</label>
                      <input type="text" value={c.name} onChange={e => updateCafe(index, 'name', e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white" />
                    </div>
                    <div className="w-full sm:w-1/5">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Price (Sale)</label>
                      <input type="number" step="0.5" min="0" value={c.price} onChange={e => updateCafe(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 text-amber-600 font-bold rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white" />
                    </div>
                    <div className="w-full sm:w-1/5">
                      <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Cost Price</label>
                      <input type="number" step="0.5" min="0" value={c.cost_price} onChange={e => updateCafe(index, 'cost_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white" />
                    </div>
                    <div className="w-full sm:w-1/5 flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Stock</label>
                        <input type="number" step="1" min="0" value={c.stock} onChange={e => updateCafe(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-2 font-mono rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white" />
                      </div>
                      {canFullConfig && (
                        <button onClick={() => removeCafe(index)} className="mb-[1px] px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition border border-red-500/0 hover:border-red-500/30">
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {canFullConfig && (
                <button onClick={addCafe} className="px-4 py-2 text-sm bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl font-medium transition border border-amber-500/30">
                  <i className="fas fa-plus mr-1"></i> Add Cafe Item
                </button>
              )}
            </>
          )}

          {activeTab === 'users' && isOwner && <UserManagement />}
          {activeTab === 'logs' && isOwner && <AuditLogsView />}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          {canFullConfig && (
            <button
              onClick={() => {
                if (window.confirm('This will take you back to the Setup Wizard. Continue?')) {
                  resetSetup();
                }
              }}
              className="px-4 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:hover:bg-red-900/20 rounded-xl transition font-medium flex items-center gap-2"
            >
              <i className="fas fa-rotate-left"></i> Re-run Setup
            </button>
          )}
          <button 
            onClick={handleSave} 
            className={`px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition shadow-lg
              ${activeTab !== 'system' && 'hidden'}
            `}
          >
            <i className="fas fa-save mr-1"></i> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
