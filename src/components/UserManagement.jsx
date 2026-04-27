import { useState } from 'react';
import { useApp } from '../context/AppContext';

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'STAFF' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);
    setFormData({ username: '', password: '', role: 'STAFF' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold dark:text-white text-gray-800">User accounts & Roles</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition"
        >
          {isAdding ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-indigo-500/30 space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Username</label>
              <input
                type="text" required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
              <input
                type="password" required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 bg-white dark:border-gray-600 border-gray-300 dark:text-white text-sm"
              >
                <option value="STAFF">STAFF</option>
                <option value="CASHIER">CASHIER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">Create User</button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-[10px] font-black">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="dark:text-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <td className="px-4 py-3 font-bold">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'OWNER' ? 'bg-purple-500/20 text-purple-500' :
                    u.role === 'MANAGER' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-600 p-1">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
