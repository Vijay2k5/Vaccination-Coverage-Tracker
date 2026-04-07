import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, Calendar, MapPin } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  predictVaccineDemand,
  getTopRegions,
  calculateStatistics,
  type VaccinationRecord,
  type RegionPrediction
} from '../utils/predictionModel';

export function PredictionDashboard() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [prediction, setPrediction] = useState<RegionPrediction | null>(null);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchVaccinationData();
  }, []);

  useEffect(() => {
    if (selectedRegion && records.length > 0) {
      generatePrediction();
    }
  }, [selectedRegion, forecastDays, records]);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecords(data.vaccinations || []);
        
        // Get top regions
        const regions = getTopRegions(data.vaccinations || [], 15);
        setAvailableRegions(regions);
        
        // Set default region
        if (regions.length > 0 && !selectedRegion) {
          setSelectedRegion(regions[0]);
        }

        // Calculate statistics
        const stats = calculateStatistics(data.vaccinations || []);
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = () => {
    if (!selectedRegion || records.length === 0) return;
    
    const predictionData = predictVaccineDemand(records, selectedRegion, forecastDays);
    setPrediction(predictionData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600">Loading vaccination data...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = prediction?.predictions.slice(0, 30).map(p => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: p.predicted,
    lower: p.confidence.lower,
    upper: p.confidence.upper
  })) || [];

  // Prepare comparison data (showing predictions for 30, 60, 90 days)
  const comparisonData = [
    {
      period: '30 Days',
      predicted: prediction?.predictions.slice(0, 30).reduce((sum, p) => sum + p.predicted, 0) || 0
    },
    {
      period: '60 Days',
      predicted: prediction?.predictions.slice(0, 60).reduce((sum, p) => sum + p.predicted, 0) || 0
    },
    {
      period: '90 Days',
      predicted: prediction?.predictions.slice(0, 90).reduce((sum, p) => sum + p.predicted, 0) || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Vaccine Demand Prediction</h1>
        <p className="text-slate-600">
          AI-powered forecasting for regional vaccine requirements using historical data analysis
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Vaccinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{statistics.totalVaccinations.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">States Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{statistics.totalStates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg. Daily Vaccinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{statistics.avgDailyVaccinations.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{statistics.dataPoints}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Prediction Controls
          </CardTitle>
          <CardDescription>Select region and forecast period to generate predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select State</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Forecast Period</label>
              <Select value={forecastDays.toString()} onValueChange={(v) => setForecastDays(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generatePrediction} className="w-full bg-slate-700 hover:bg-slate-800">
                Generate Prediction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <>
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Selected Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{prediction.region}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Current Daily Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{prediction.currentDemand.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Average of last 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {prediction.trend === 'increasing' && (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  )}
                  {prediction.trend === 'decreasing' && (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                  {prediction.trend === 'stable' && (
                    <Minus className="w-6 h-6 text-slate-600" />
                  )}
                  <div>
                    <div className="text-2xl font-bold text-slate-900 capitalize">{prediction.trend}</div>
                    <p className="text-xs text-slate-500">{Math.abs(prediction.trendPercentage)}% weekly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Demand Forecast - Next {forecastDays} Days</CardTitle>
              <CardDescription>Predicted daily vaccine requirements with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stackId="1"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.3}
                    name="Upper Confidence"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stackId="2"
                    stroke="#475569"
                    fill="#64748b"
                    fillOpacity={0.8}
                    name="Predicted Demand"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="3"
                    stroke="#94a3b8"
                    fill="#cbd5e1"
                    fillOpacity={0.3}
                    name="Lower Confidence"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Total Predicted Demand */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Demand Forecast</CardTitle>
              <CardDescription>Total predicted vaccine requirements by period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="predicted" fill="#475569" name="Total Predicted Vaccines" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Information */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p><strong>Algorithm:</strong> Time Series Forecasting with Linear Trend Analysis</p>
              <p><strong>Features:</strong> Moving Average (7-day window), Seasonal Patterns, Historical Trends</p>
              <p><strong>Data Points:</strong> {statistics?.dataPoints} days of historical data</p>
              <p><strong>Confidence Interval:</strong> ±20% based on historical variance</p>
              <p><strong>Update Frequency:</strong> Real-time based on latest vaccination records</p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This is a demonstration model. Production systems would use advanced ML algorithms 
                  (LSTM, Prophet, or XGBoost) with additional features like demographics, weather, and disease outbreak data 
                  for improved accuracy.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
