import { useState } from 'react';
import { useApp } from '../context/AppContext';

const CafePanel = () => {
  const { sessions, cafeItems, addOrderToSession } = useApp();
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const activeSessions = sessions.filter(s => !s.endTime);

  const handleItemClick = (item) => {
    if (!selectedSessionId) {
      alert("Please select an active session first to add this order.");
      return;
    }
    addOrderToSession(parseFloat(selectedSessionId), item.name, item.price);
  };

  return (
    <div className="mt-6 rounded-2xl shadow-xl p-5 dark:bg-gray-800/80 bg-white/90 border dark:border-gray-700 border-gray-200">
      <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white text-gray-800">
        <i className="fas fa-coffee text-amber-500"></i> CAFE & SNACKS
      </h3>
      <div className="mt-4">
        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">Add order to session:</label>
        <select
          value={selectedSessionId}
          onChange={e => setSelectedSessionId(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-xl border focus:ring-amber-500 dark:bg-gray-700 bg-white dark:border-gray-600 border-gray-300 dark:text-white"
        >
          <option value="">-- Select Active Session --</option>
          {activeSessions.map(s => (
            <option key={s.id} value={s.id}>{s.stationId} - {s.name}</option>
          ))}
        </select>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {cafeItems.length === 0 ? (
          <div className="col-span-2 text-center text-sm text-gray-500 py-4">
            No cafe items configured. Add them in Settings.
          </div>
        ) : (
          cafeItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleItemClick(item)}
              className="py-2 rounded-xl bg-gradient-to-r dark:from-gray-700 dark:to-gray-600 from-gray-100 to-gray-200 border border-gray-300 dark:border-gray-500 hover:shadow-md transition text-sm font-bold dark:text-white text-gray-800"
            >
              {item.name} (${item.price.toFixed(2)})
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CafePanel;
