import { useState, useEffect } from 'react';
import { Users, FileText, Eye, Clock, Monitor, Smartphone, Globe } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { fetchDashboardData, fetchRealtimeVisitors } from '../utils/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    }
  },
  scales: {
    x: { grid: { display: false, drawBorder: false }, ticks: { color: '#64748b' } },
    y: { grid: { color: '#334155', drawBorder: false }, ticks: { color: '#64748b' }, beginAtZero: true }
  },
  interaction: { intersect: false, mode: 'index' },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [realtime, setRealtime] = useState(0);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData(period)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      });
  }, [period]);

  useEffect(() => {
    const fetchRealtime = () => {
      fetchRealtimeVisitors().then(res => setRealtime(res.data.activeVisitors)).catch(() => {});
    };
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading || !data) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const viewsChartData = {
    labels: data.dailyViews.map(d => d.date),
    datasets: [
      {
        label: 'Page Views',
        data: data.dailyViews.map(d => d.views),
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-dark-400 text-sm mt-1">Platform analytics and traffic performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {realtime} Online
          </div>
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="bg-dark-800 border border-dark-700 text-white text-sm rounded-lg px-3 py-2 pr-8 outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium mb-1">Total Views</p>
              <h3 className="text-3xl font-bold text-white">{data.totalViews.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium mb-1">Unique Visitors</p>
              <h3 className="text-3xl font-bold text-white">{data.uniqueVisitors.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium mb-1">Avg Session</p>
              <h3 className="text-3xl font-bold text-white">{formatDuration(data.avgDuration)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium mb-1">Mobile Users</p>
              <h3 className="text-3xl font-bold text-white">
                {Math.round(((data.devices.find(d => d.device === 'mobile')?.count || 0) / (data.uniqueVisitors || 1)) * 100)}%
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="admin-card p-5">
        <h3 className="text-lg font-bold text-white mb-6">Traffic Overview</h3>
        <div className="h-72 w-full">
          <Line data={viewsChartData} options={chartOptions} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card flex flex-col">
          <div className="p-5 border-b border-dark-700">
            <h3 className="text-lg font-bold text-white">Top Pages</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-300 whitespace-nowrap">
              <thead className="bg-dark-800 text-dark-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Page Path</th>
                  <th className="px-5 py-3 font-semibold text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {data.topPages.slice(0, 5).map((page) => (
                  <tr key={page.path} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-5 py-3 truncate max-w-[200px]">{page.path}</td>
                    <td className="px-5 py-3 text-right font-medium text-white">{page.views.toLocaleString()}</td>
                  </tr>
                ))}
                {data.topPages.length === 0 && (
                  <tr><td colSpan="2" className="px-5 py-8 text-center text-dark-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card flex flex-col">
          <div className="p-5 border-b border-dark-700">
            <h3 className="text-lg font-bold text-white">Top Sources</h3>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-dark-300 whitespace-nowrap">
              <thead className="bg-dark-800 text-dark-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Source (Referrer)</th>
                  <th className="px-5 py-3 font-semibold text-right">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {data.sources.slice(0, 5).map((source) => (
                  <tr key={source.source} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-5 py-3 truncate max-w-[200px] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-dark-500" />
                      {source.source}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-white">{source.count.toLocaleString()}</td>
                  </tr>
                ))}
                {data.sources.length === 0 && (
                  <tr><td colSpan="2" className="px-5 py-8 text-center text-dark-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
