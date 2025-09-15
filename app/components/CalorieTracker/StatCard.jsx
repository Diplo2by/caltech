export const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="text-xs text-gray-400 font-medium mb-1">{title}</div>
    <div className="text-lg font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-500">{subtitle}</div>
  </div>
);
