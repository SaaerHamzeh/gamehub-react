import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const SessionForm = () => {
  const { devices, addSession, isStationActive, permissions } = useApp();
  const [name, setName] = useState('');

  const canEditPricing = permissions?.manage_settings;
  const [deviceType, setDeviceType] = useState('');
  const [stationId, setStationId] = useState('');
  const [sessionType, setSessionType] = useState('PRE');
  const [pricePerHour, setPricePerHour] = useState(5.00);
  const [fixedPrice, setFixedPrice] = useState(5.00);
  const [durationHours, setDurationHours] = useState(1);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (devices.length > 0 && !deviceType) {
      setDeviceType(devices[0].id);
    }
  }, [devices]);

  const activeDevice = devices.find(d => d.id === deviceType);
  const strategy = activeDevice ? (activeDevice.pricing_strategy || 'HOURLY') : 'HOURLY';

  useEffect(() => {
    if (!deviceType) return;
    const deviceConfig = devices.find(d => d.id === deviceType);
    if (!deviceConfig) return;
    
    setPricePerHour(deviceConfig.base_price || 0);
    setFixedPrice(deviceConfig.base_price || 0);

    const opts = [];
    for (let i = 1; i <= deviceConfig.count; i++) {
      opts.push(`${deviceConfig.prefix}${i.toString().padStart(2, '0')}`);
    }
    setStations(opts);
    setStationId(opts[0] || '');
  }, [deviceType, devices]);

  if (devices.length === 0) {
    return (
      <div className="mt-4 text-center text-sm text-gray-500 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
        No gaming devices configured.<br />Add some in Settings to start a session.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deviceType || !stationId) { alert("Please select a device type and station."); return; }
    
    if (strategy === 'HOURLY' && pricePerHour < 0) { alert("Price per hour must be >= 0"); return; }
    if (strategy !== 'HOURLY' && fixedPrice < 0) { alert("Fixed Price must be >= 0"); return; }
    if (strategy === 'HOURLY' && sessionType === 'PRE' && durationHours <= 0) { alert("Duration must be > 0 for prepaid sessions"); return; }
    if (isStationActive(stationId)) { alert(`Station ${stationId} is already occupied!`); return; }

    addSession({
      name: name.trim(),
      deviceType,
      stationId,
      sessionType: strategy === 'HOURLY' ? sessionType : 'POST',
      pricePerHour: strategy === 'HOURLY' ? parseFloat(pricePerHour) : null,
      fixedPrice: strategy !== 'HOURLY' ? parseFloat(fixedPrice) : null,
      durationHours: (strategy === 'HOURLY' && sessionType === 'PRE') ? parseFloat(durationHours) : null,
    });
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Customer Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 outline-none transition dark:bg-gray-700 bg-gray-50 dark:border-gray-600 border-gray-300 dark:text-white text-gray-900"
          placeholder="اتركه فارغاً لترقيم تلقائي (زبون #رقم)"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Device Type</label>
          <select
            value={deviceType}
            onChange={e => setDeviceType(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-white dark:border-gray-600 border-gray-300 dark:text-white"
          >
            {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Station</label>
          <select
            value={stationId}
            onChange={e => setStationId(e.target.value)}
            className={`mt-1 w-full px-3 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-white dark:border-gray-600 dark:text-white ${isStationActive(stationId) ? 'border-red-500' : 'border-gray-300'}`}
          >
            {stations.map(st => (
              <option key={st} value={st}>{st} {isStationActive(st) ? "🔴 ACTIVE" : ""}</option>
            ))}
          </select>
        </div>
      </div>
      
      {strategy === 'HOURLY' ? (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Type</label>
            <select
              value={sessionType}
              onChange={e => setSessionType(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-white dark:border-gray-600 border-gray-300 dark:text-white"
            >
              <option value="PRE">Prepaid</option>
              <option value="POST">Postpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Price/Hr ($)</label>
            <input
              type="number"
              step="0.5"
              value={pricePerHour}
              onChange={e => setPricePerHour(e.target.value)}
              disabled={!canEditPricing}
              className={`mt-1 w-full px-4 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-gray-50 dark:border-gray-600 border-gray-300 dark:text-white ${!canEditPricing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Hrs</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={durationHours}
              onChange={e => setDurationHours(e.target.value)}
              disabled={sessionType === 'POST' || !canEditPricing}
              className={`mt-1 w-full px-4 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-gray-50 dark:border-gray-600 border-gray-300 dark:text-white transition-opacity ${sessionType === 'POST' || !canEditPricing ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
           <div>
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
               {strategy === 'PER_GAME' ? 'Price Per Game ($)' : 'Fixed Cost ($)'}
            </label>
            <input
              type="number"
              step="0.5"
              value={fixedPrice}
              onChange={e => setFixedPrice(e.target.value)}
              disabled={!canEditPricing}
              className={`mt-1 w-full px-4 py-2 rounded-xl border focus:ring-rose-500 dark:bg-gray-700 bg-gray-50 dark:border-gray-600 border-gray-300 dark:text-white ${!canEditPricing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition transform active:scale-95"
      >
        <i className="fas fa-bolt"></i> START SESSION
      </button>
      <div className="mt-4 pt-3 text-xs flex justify-between dark:text-gray-400 text-gray-500">
        <span><i className="fas fa-info-circle"></i> Strategy: {strategy}</span>
      </div>
    </form>
  );
};

export default SessionForm;
