import { useState } from 'react';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const { login } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(pin);
    if (!success) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 dark:bg-gray-800/90 bg-white/95 border dark:border-gray-700 border-gray-200 glass-card">
          <div className="text-center mb-8">
            <i className="fas fa-user-shield text-5xl text-indigo-500 drop-shadow-lg mb-4"></i>
            <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-gray-800">
              Admin<span className="text-indigo-500"> Access</span>
            </h2>
            <p className="text-sm dark:text-gray-400 text-gray-500 mt-2">Enter PIN to access the POS manager</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className={`w-full px-5 py-4 rounded-xl border-2 focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition text-center text-2xl tracking-[0.5em] dark:bg-gray-700 bg-gray-50 dark:text-white text-gray-900 ${error ? 'border-red-500 animate-pulse' : 'dark:border-gray-600 border-gray-300'}`}
                placeholder="••••"
              />
              {error && <p className="text-red-400 text-sm text-center mt-2">Invalid PIN. Try "admin" or "1234"</p>}
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition transform active:scale-95"
            >
              <i className="fas fa-unlock-alt"></i> UNLOCK SYSTEM
            </button>
          </form>
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
    </div>
  );
};

export default LoginPage;
