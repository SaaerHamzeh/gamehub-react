import { useState } from 'react';
import { useApp } from '../context/AppContext';

const STEP_DEVICE = 0;
const STEP_CAFE = 1;
const STEP_DONE = 2;

const defaultDevices = [
  { id: 'PC', name: '🖥️ Gaming PC', prefix: 'PC-', count: 4 },
  { id: 'PS', name: '🎮 PlayStation', prefix: 'PS-', count: 2 },
];
const defaultCafe = [
  { name: '☕ Coffee', price: 1.50 },
  { name: '🥤 Soda', price: 1.00 },
  { name: '🍕 Pizza Slice', price: 2.50 },
];

// ─── Reusable small components ───────────────────────────────────────────────

const StepIndicator = ({ current }) => {
  const steps = ['Devices', 'Services', 'Done'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
              ${i < current ? 'bg-emerald-500 text-white' :
                i === current ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/30' :
                'dark:bg-gray-700 bg-gray-200 dark:text-gray-400 text-gray-400'}`}>
              {i < current ? <i className="fas fa-check text-xs" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium
              ${i === current ? 'text-indigo-500' : 'dark:text-gray-500 text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-4 mx-1 transition-all duration-500
              ${i < current ? 'bg-emerald-500' : 'dark:bg-gray-700 bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Step 0: Devices ─────────────────────────────────────────────────────────

const DeviceStep = ({ devices, setDevices, onNext }) => {
  const addDevice = () => {
    let newId = 'NEW';
    let c = 1;
    while (devices.some(d => d.id === newId)) { newId = `NEW${c}`; c++; }
    setDevices(prev => [...prev, { id: newId, name: '🎮 New Device', prefix: 'ND-', count: 1 }]);
  };

  const update = (index, field, value) =>
    setDevices(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));

  const remove = (index) =>
    setDevices(prev => prev.filter((_, i) => i !== index));

  const validate = () => {
    if (devices.length === 0) { alert('Add at least one device to continue.'); return; }
    const ids = new Set();
    for (let d of devices) {
      if (!d.id.trim() || !d.name.trim() || !d.prefix.trim()) { alert('Fill all device fields.'); return; }
      if (ids.has(d.id.toLowerCase())) { alert(`Duplicate ID: "${d.id}"`); return; }
      ids.add(d.id.toLowerCase());
    }
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4">
          <i className="fas fa-gamepad text-3xl text-indigo-500"></i>
        </div>
        <h2 className="text-2xl font-extrabold dark:text-white text-gray-800">What devices do you have?</h2>
        <p className="dark:text-gray-400 text-gray-500 mt-2 text-sm">Add all your gaming stations — PCs, PlayStations, billiard tables, etc.</p>
      </div>

      <div className="space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
        {devices.map((d, i) => (
          <div key={i} className="rounded-xl border dark:border-gray-600 border-gray-200 dark:bg-gray-700/40 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Display Name</label>
                <input value={d.name} onChange={e => update(i, 'name', e.target.value)}
                  placeholder="e.g. 🎮 PlayStation"
                  className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Short ID</label>
                <input value={d.id} onChange={e => update(i, 'id', e.target.value.toUpperCase())}
                  placeholder="e.g. PS"
                  className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Station Prefix</label>
                <input value={d.prefix} onChange={e => update(i, 'prefix', e.target.value)}
                  placeholder="e.g. PS-"
                  className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold dark:text-gray-400 text-gray-500 mb-1">Count</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={d.count}
                    onChange={e => update(i, 'count', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  <button onClick={() => remove(i)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addDevice}
        className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed dark:border-gray-600 border-gray-300 dark:text-gray-400 text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition text-sm font-medium">
        <i className="fas fa-plus mr-2"></i> Add Device
      </button>

      <button onClick={validate}
        className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition active:scale-95">
        Next: Services <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};

// ─── Step 1: Cafe / Services ─────────────────────────────────────────────────

const CafeStep = ({ cafeItems, setCafeItems, onNext, onBack }) => {
  const add = () => setCafeItems(prev => [...prev, { name: '', price: 1.00 }]);
  const update = (i, field, val) =>
    setCafeItems(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const remove = (i) => setCafeItems(prev => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    for (let c of cafeItems) {
      if (!c.name.trim()) { alert('All items need a name.'); return; }
      if (c.price < 0) { alert('Prices must be 0 or more.'); return; }
    }
    onNext();
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4">
          <i className="fas fa-coffee text-3xl text-amber-500"></i>
        </div>
        <h2 className="text-2xl font-extrabold dark:text-white text-gray-800">Cafe & Services</h2>
        <p className="dark:text-gray-400 text-gray-500 mt-2 text-sm">Add drinks, snacks, or any extras you sell. You can skip this if you don't have a cafe.</p>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {cafeItems.map((c, i) => (
          <div key={i} className="flex gap-3 items-center rounded-xl border dark:border-gray-600 border-gray-200 dark:bg-gray-700/40 bg-gray-50 p-3">
            <input value={c.name} onChange={e => update(i, 'name', e.target.value)}
              placeholder="Item name (e.g. ☕ Coffee)"
              className="flex-1 px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm dark:text-gray-400 text-gray-500">$</span>
              <input type="number" step="0.25" min="0" value={c.price}
                onChange={e => update(i, 'price', parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-lg border text-sm dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <button onClick={() => remove(i)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition">
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        ))}
        {cafeItems.length === 0 && (
          <div className="text-center py-6 dark:text-gray-500 text-gray-400 text-sm">
            No items yet. Add some or skip to continue.
          </div>
        )}
      </div>

      <button onClick={add}
        className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed dark:border-gray-600 border-gray-300 dark:text-gray-400 text-gray-500 hover:border-amber-500 hover:text-amber-500 transition text-sm font-medium">
        <i className="fas fa-plus mr-2"></i> Add Item
      </button>

      <div className="mt-6 flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 rounded-xl dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700 font-bold transition hover:opacity-80">
          <i className="fas fa-arrow-left mr-2"></i> Back
        </button>
        <button onClick={validate}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition active:scale-95">
          Finish Setup <i className="fas fa-check"></i>
        </button>
      </div>
    </div>
  );
};

// ─── Step 2: Done ─────────────────────────────────────────────────────────────

const DoneStep = ({ devicesCount, cafeCount, onGo }) => (
  <div className="text-center py-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
      <i className="fas fa-check-circle text-5xl text-emerald-500"></i>
    </div>
    <h2 className="text-2xl font-extrabold dark:text-white text-gray-800 mb-2">You're all set!</h2>
    <p className="dark:text-gray-400 text-gray-500 text-sm mb-8">
      Your hall is configured with <span className="font-bold text-indigo-400">{devicesCount} device type{devicesCount !== 1 ? 's' : ''}</span> and{' '}
      <span className="font-bold text-amber-400">{cafeCount} cafe item{cafeCount !== 1 ? 's' : ''}</span>.
      You can always change these from Settings.
    </p>
    <button onClick={onGo}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition active:scale-95">
      <i className="fas fa-rocket"></i> Go to Dashboard
    </button>
  </div>
);

// ─── Main SetupPage ───────────────────────────────────────────────────────────

const SetupPage = () => {
  const { saveSettings, completeSetup } = useApp();
  const [step, setStep] = useState(STEP_DEVICE);
  const [devices, setDevices] = useState(defaultDevices);
  const [cafeItems, setCafeItems] = useState(defaultCafe);

  const handleFinish = () => {
    saveSettings(devices, cafeItems);
    setStep(STEP_DONE);
  };

  const handleGo = () => {
    completeSetup();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <i className="fas fa-gamepad text-3xl text-rose-500"></i>
              <h1 className="text-3xl font-extrabold dark:text-white text-gray-800">
                GameHub<span className="text-rose-500"> Pro</span>
              </h1>
            </div>
            <p className="text-sm dark:text-gray-500 text-gray-400 font-medium">Initial Setup — takes less than a minute</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl shadow-2xl p-8 dark:bg-gray-800/90 bg-white/95 border dark:border-gray-700 border-gray-200">
            <StepIndicator current={step} />

            {step === STEP_DEVICE && (
              <DeviceStep
                devices={devices}
                setDevices={setDevices}
                onNext={() => setStep(STEP_CAFE)}
              />
            )}
            {step === STEP_CAFE && (
              <CafeStep
                cafeItems={cafeItems}
                setCafeItems={setCafeItems}
                onNext={handleFinish}
                onBack={() => setStep(STEP_DEVICE)}
              />
            )}
            {step === STEP_DONE && (
              <DoneStep
                devicesCount={devices.length}
                cafeCount={cafeItems.length}
                onGo={handleGo}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 text-center opacity-60">
        <p className="text-sm dark:text-gray-400 text-gray-500">
          &copy; {new Date().getFullYear()} GameHub Pro &nbsp;|&nbsp;
          <span className="text-indigo-500 font-semibold">Designed by Siraj Masoud</span>
        </p>
      </footer>
    </div>
  );
};

export default SetupPage;
