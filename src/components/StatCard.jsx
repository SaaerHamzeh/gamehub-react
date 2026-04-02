const StatCard = ({ title, value, icon, trend, trendUp, subText }) => (
  <div className="rounded-2xl p-5 shadow-lg transition-all hover:scale-[1.02] dark:bg-gray-800/80 bg-white/90 border dark:border-gray-700 border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium dark:text-gray-400 text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1 dark:text-white text-gray-800">{value}</p>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
        {trend && (
          <p className={`text-xs mt-2 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>{trend}</p>
        )}
      </div>
      <div className="p-3 rounded-xl dark:bg-gray-700 bg-indigo-50">
        <i className={`fas ${icon} text-2xl dark:text-rose-400 text-indigo-500`}></i>
      </div>
    </div>
  </div>
);

export default StatCard;
