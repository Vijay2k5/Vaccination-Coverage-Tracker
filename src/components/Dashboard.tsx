import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Syringe, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { IndiaMap } from './IndiaMap';

interface DashboardStats {
  totalVaccinations: number;
  vaccineTypes: Record<string, number>;
  doseDistribution: Record<string, number>;
  monthlyData: Record<string, number>;
  stateHeatmapData: Array<{ state: string; count: number }>;
  districtHeatmapData: Array<{ state: string; district: string; count: number }>;
}

interface VaccinationRecord {
  certId: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  vaccineType: string;
  dose: string;
  dateAdministered: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/dashboard`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }

      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(`Unable to connect to the server. ${errorMessage}. Please make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error || 'No data available'}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const vaccineTypeData = Object.entries(stats.vaccineTypes).map(([name, value]) => ({
    name,
    count: value
  }));

  const doseData = Object.entries(stats.doseDistribution).map(([dose, count]) => ({
    name: dose === 'Booster' ? 'Booster' : `Dose ${dose}`,
    count
  }));

  const monthlyChartData = Object.entries(stats.monthlyData)
    .sort()
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      vaccinations: count
    }));

  // Sort heatmap data by count
  const sortedStateHeatmapData = [...stats.stateHeatmapData].sort((a, b) => b.count - a.count);
  const sortedDistrictHeatmapData = [...stats.districtHeatmapData].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Vaccinations</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalVaccinations}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Syringe className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vaccine Types</p>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.vaccineTypes).length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Locations</p>
              <p className="text-3xl font-bold text-green-600">{stats.stateHeatmapData.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Coverage</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.stateHeatmapData.length > 0 ? 'Active' : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vaccine Types Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Vaccine Types Distribution</h3>
          {vaccineTypeData.length > 0 ? (
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
                  dataKey="count"
                >
                  {vaccineTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>

        {/* Dose Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Dose Distribution</h3>
          {doseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={doseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-20">No data available</p>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Vaccination Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="vaccinations" fill="#8b5cf6" name="Vaccinations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* India Map with Heatmap */}
      <div>
        <IndiaMap data={stats.stateHeatmapData} />
      </div>
    </div>
  );
}