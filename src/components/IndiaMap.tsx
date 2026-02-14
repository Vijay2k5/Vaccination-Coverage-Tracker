import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Loader2 } from 'lucide-react';

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

interface StateData {
  state: string;
  count: number;
}

interface IndiaMapProps {
  data: StateData[];
}

export function IndiaMap({ data }: IndiaMapProps) {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setRecords(responseData.records || []);
      }
    } catch (err) {
      console.error('Error fetching records for map:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Group records by state
  const stateData = new Map<string, number>();
  records.forEach(record => {
    const current = stateData.get(record.state) || 0;
    stateData.set(record.state, current + 1);
  });

  // Group records by district for detailed view
  const districtData = new Map<string, { state: string; district: string; count: number; lat: number; lng: number }>();
  records.forEach(record => {
    if (record.latitude && record.longitude) {
      const key = `${record.state}-${record.district}`;
      const existing = districtData.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        districtData.set(key, {
          state: record.state,
          district: record.district,
          count: 1,
          lat: record.latitude,
          lng: record.longitude
        });
      }
    }
  });

  const districts = Array.from(districtData.values());
  const maxCount = Math.max(...districts.map(d => d.count), 1);

  // Convert lat/lng to SVG coordinates (simplified projection)
  const latToY = (lat: number) => {
    const minLat = 8.0;
    const maxLat = 37.0;
    return ((maxLat - lat) / (maxLat - minLat)) * 600;
  };

  const lngToX = (lng: number) => {
    const minLng = 68.0;
    const maxLng = 97.0;
    return ((lng - minLng) / (maxLng - minLng)) * 800;
  };

  // Calculate color based on count
  const getColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return '#b91c1c'; // Red
    if (intensity > 0.6) return '#ea580c'; // Orange
    if (intensity > 0.4) return '#f59e0b'; // Amber
    if (intensity > 0.2) return '#84cc16'; // Lime
    return '#22c55e'; // Green
  };

  const getRadius = (count: number) => {
    const minRadius = 4;
    const maxRadius = 20;
    return minRadius + (count / maxCount) * (maxRadius - minRadius);
  };

  if (districts.length === 0) {
    return (
      <div className="text-gray-500 text-center py-20 bg-white rounded-lg">
        No location data available for map visualization. Load dummy data to see the map.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-full bg-white rounded-lg overflow-hidden border-2 border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">India Vaccination Coverage Map</h3>
        
        {/* SVG Map */}
        <div className="relative">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            {/* Background with India image */}
            <defs>
              <pattern id="india-bg" patternUnits="objectBoundingBox" width="1" height="1">
                <image 
                  href="https://images.unsplash.com/photo-1733094151451-4222a842cfd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYSUyMG1hcCUyMG91dGxpbmUlMjBzaWxob3VldHRlfGVufDF8fHx8MTc3MDg3NzIwMXww&ixlib=rb-4.1.0&q=80&w=1080"
                  x="0" 
                  y="0" 
                  width="800" 
                  height="600" 
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.15"
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="800" height="600" fill="url(#india-bg)" />
            
            {/* India land outline (simplified but more accurate shape) */}
            <path
              d="M 220,100 L 240,90 L 270,85 L 300,90 L 330,100 L 360,115 L 390,130 L 420,145 L 450,155 L 480,160 L 510,165 L 540,170 L 560,180 L 575,195 L 585,215 L 590,240 L 595,270 L 595,300 L 590,330 L 580,360 L 565,385 L 545,405 L 520,420 L 490,430 L 460,435 L 430,440 L 400,440 L 370,435 L 340,425 L 310,410 L 285,395 L 265,375 L 250,350 L 240,325 L 235,300 L 235,275 L 235,250 L 230,225 L 225,200 L 220,175 L 215,150 L 215,125 Z
                 M 175,460 L 185,440 L 200,425 L 220,415 L 245,410 L 270,410 L 295,415 L 315,425 L 330,440 L 340,460 L 345,485 L 345,510 L 335,530 L 315,540 L 290,545 L 265,545 L 240,540 L 220,530 L 205,515 L 190,495 L 180,475 Z"
              fill="#dcfce7"
              stroke="#22c55e"
              strokeWidth="2"
            />
            
            {/* Additional northern regions */}
            <path
              d="M 330,100 L 360,85 L 390,75 L 420,70 L 450,75 L 475,85 L 495,100 L 510,120 L 515,145 L 510,165"
              fill="#dcfce7"
              stroke="#22c55e"
              strokeWidth="2"
            />
            
            {/* Grid lines for reference */}
            {[...Array(10)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="150"
                y1={50 + i * 50}
                x2="650"
                y2={50 + i * 50}
                stroke="#d1d5db"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={150 + i * 50}
                y1="50"
                x2={150 + i * 50}
                y2="550"
                stroke="#d1d5db"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}
            
            {/* Vaccination points */}
            {districts.map((district, index) => {
              const x = lngToX(district.lng);
              const y = latToY(district.lat);
              const radius = getRadius(district.count);
              const color = getColor(district.count);
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={color}
                    stroke="#000"
                    strokeWidth="0.5"
                    opacity="0.7"
                    onMouseEnter={() => setHoveredState(`${district.district}, ${district.state}: ${district.count} vaccinations`)}
                    onMouseLeave={() => setHoveredState(null)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
            
            {/* Labels for major regions */}
            <text x="350" y="200" fontSize="12" fill="#374151" fontWeight="bold" textAnchor="middle">INDIA</text>
          </svg>
          
          {/* Hover tooltip */}
          {hoveredState && (
            <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-10">
              {hoveredState}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Heatmap Legend</p>
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#22c55e] border border-gray-300"></div>
            <span>Low (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#84cc16] border border-gray-300"></div>
            <span>Medium-Low (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] border border-gray-300"></div>
            <span>Medium (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#ea580c] border border-gray-300"></div>
            <span>Medium-High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#b91c1c] border border-gray-300"></div>
            <span>High (80-100%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Circle size and color intensity represent vaccination count in each district
        </p>
      </div>

      {/* Statistics by State */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">Top States by Vaccination Count</p>
        <div className="space-y-2">
          {Array.from(stateData.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([state, count], index) => {
              const percentage = (count / records.length) * 100;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-700 truncate">{state}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 flex items-center px-2"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{count}</span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}