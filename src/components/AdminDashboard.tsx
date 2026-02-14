import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Syringe, MapPin, TrendingUp, Plus, FileText } from 'lucide-react';

interface AdminDashboardProps {
  projectId: string;
  publicAnonKey: string;
  onAddNew: () => void;
}

interface Stats {
  totalVaccinations: number;
  vaccineTypeCounts: Record<string, number>;
  doseCounts: Record<string, number>;
  genderCounts: Record<string, number>;
}

interface HeatmapData {
  location: string;
  count: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function AdminDashboard({ projectId, publicAnonKey, onAddNew }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load statistics
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!statsResponse.ok) {
        const errorData = await statsResponse.json();
        throw new Error(errorData.error || 'Failed to load statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Load heatmap data
      const heatmapResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/admin/heatmap`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!heatmapResponse.ok) {
        const errorData = await heatmapResponse.json();
        throw new Error(errorData.error || 'Failed to load heatmap data');
      }

      const heatmapResult = await heatmapResponse.json();
      setHeatmapData(heatmapResult.data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/admin/init-sample-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize sample data');
      }

      alert('Sample data initialized successfully!');
      loadDashboardData();
    } catch (err: any) {
      console.error('Error initializing sample data:', err);
      alert(`Failed to initialize sample data: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats || stats.totalVaccinations === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-6">
          There are no vaccination records in the system yet. Initialize sample data or add new records to get started.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={initializeSampleData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Initialize Sample Data
          </button>
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Record
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const vaccineTypeData = Object.entries(stats.vaccineTypeCounts).map(([name, value]) => ({
    name,
    value
  }));

  const doseData = Object.entries(stats.doseCounts).map(([name, value]) => ({
    name: `Dose ${name}`,
    value
  }));

  const genderData = Object.entries(stats.genderCounts).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Data
          </button>
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-blue-100 text-sm">Total Vaccinations</p>
          <p className="text-3xl font-bold mt-1">{stats.totalVaccinations}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Syringe className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-purple-100 text-sm">Vaccine Types</p>
          <p className="text-3xl font-bold mt-1">{Object.keys(stats.vaccineTypeCounts).length}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-pink-100 text-sm">Locations</p>
          <p className="text-3xl font-bold mt-1">{heatmapData.length}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-orange-100 text-sm">Certificates Issued</p>
          <p className="text-3xl font-bold mt-1">{stats.totalVaccinations}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccine Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaccine Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vaccineTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vaccineTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Dose Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dose Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Vaccination Coverage by Location
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={heatmapData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="location" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
