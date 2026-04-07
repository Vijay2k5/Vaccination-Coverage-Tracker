// Simple prediction model for vaccine demand forecasting
// Uses moving average with trend analysis

export interface VaccinationRecord {
  id: string;
  name: string;
  age: number;
  state: string;
  district: string;
  vaccineName: string;
  doseNumber: number;
  vaccinationDate: string;
  certificateId: string;
}

export interface PredictionData {
  date: string;
  predicted: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export interface RegionPrediction {
  region: string;
  currentDemand: number;
  predictions: PredictionData[];
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}

/**
 * Calculate moving average for smoothing
 */
function movingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    result.push(avg);
  }
  return result;
}

/**
 * Calculate linear trend
 */
function calculateTrend(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Group vaccination records by date and region
 */
function groupByDateAndRegion(records: VaccinationRecord[], region: string): Map<string, number> {
  const grouped = new Map<string, number>();
  
  records
    .filter(r => r.state === region)
    .forEach(record => {
      const date = record.vaccinationDate.split('T')[0]; // Get date part only
      grouped.set(date, (grouped.get(date) || 0) + 1);
    });

  return grouped;
}

/**
 * Generate date range for predictions
 */
function generateDateRange(startDate: Date, days: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Predict vaccine demand for a specific region
 */
export function predictVaccineDemand(
  records: VaccinationRecord[],
  region: string,
  forecastDays: number = 30
): RegionPrediction {
  // Group data by date
  const dailyData = groupByDateAndRegion(records, region);
  
  // Convert to sorted array
  const dates = Array.from(dailyData.keys()).sort();
  const counts = dates.map(date => dailyData.get(date) || 0);

  if (counts.length === 0) {
    // No data available, return zero predictions
    const today = new Date();
    const futureDates = generateDateRange(today, forecastDays);
    
    return {
      region,
      currentDemand: 0,
      predictions: futureDates.map(date => ({
        date,
        predicted: 0,
        confidence: { lower: 0, upper: 0 }
      })),
      trend: 'stable',
      trendPercentage: 0
    };
  }

  // Calculate moving average (7-day window)
  const smoothed = movingAverage(counts, 7);
  
  // Calculate trend
  const { slope, intercept } = calculateTrend(smoothed);
  
  // Calculate current demand (average of last 7 days)
  const recentCounts = counts.slice(-7);
  const currentDemand = Math.round(
    recentCounts.reduce((a, b) => a + b, 0) / recentCounts.length
  );

  // Determine trend direction
  const trendPercentage = ((slope * 7) / currentDemand) * 100; // Weekly trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (trendPercentage > 5) trend = 'increasing';
  else if (trendPercentage < -5) trend = 'decreasing';

  // Generate predictions
  const lastIndex = counts.length - 1;
  const today = new Date();
  const futureDates = generateDateRange(today, forecastDays);
  
  const predictions: PredictionData[] = futureDates.map((date, i) => {
    // Linear extrapolation with some randomness
    const baseValue = slope * (lastIndex + i + 1) + intercept;
    
    // Add seasonal variation (weekly pattern)
    const dayOfWeek = (new Date(date).getDay() + 1) % 7;
    const seasonalFactor = 1 + 0.1 * Math.sin((dayOfWeek / 7) * 2 * Math.PI);
    
    const predicted = Math.max(0, Math.round(baseValue * seasonalFactor));
    
    // Calculate confidence interval (±20%)
    const stdDev = Math.sqrt(
      counts.reduce((sum, val) => sum + Math.pow(val - currentDemand, 2), 0) / counts.length
    );
    
    const confidenceRange = stdDev * 1.5;
    
    return {
      date,
      predicted,
      confidence: {
        lower: Math.max(0, Math.round(predicted - confidenceRange)),
        upper: Math.round(predicted + confidenceRange)
      }
    };
  });

  return {
    region,
    currentDemand,
    predictions,
    trend,
    trendPercentage: Math.round(trendPercentage * 10) / 10
  };
}

/**
 * Get top regions by vaccination count
 */
export function getTopRegions(records: VaccinationRecord[], limit: number = 10): string[] {
  const regionCounts = new Map<string, number>();
  
  records.forEach(record => {
    regionCounts.set(record.state, (regionCounts.get(record.state) || 0) + 1);
  });

  return Array.from(regionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([region]) => region);
}

/**
 * Calculate overall statistics
 */
export function calculateStatistics(records: VaccinationRecord[]) {
  const total = records.length;
  const states = new Set(records.map(r => r.state)).size;
  
  // Group by date
  const dailyData = new Map<string, number>();
  records.forEach(record => {
    const date = record.vaccinationDate.split('T')[0];
    dailyData.set(date, (dailyData.get(date) || 0) + 1);
  });
  
  const dailyCounts = Array.from(dailyData.values());
  const avgDaily = Math.round(dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length);
  
  return {
    totalVaccinations: total,
    totalStates: states,
    avgDailyVaccinations: avgDaily,
    dataPoints: dailyCounts.length
  };
}
