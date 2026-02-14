import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { generateDummyRecords } from '../utils/dummyData';
import { Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';

export function DummyDataLoader() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recordCount, setRecordCount] = useState(500);

  const handleLoadData = async () => {
    if (!confirm(`This will generate and load ${recordCount} dummy vaccination records. Continue?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Generate dummy records
      const records = generateDummyRecords(recordCount);

      // Send bulk insert request
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ records })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dummy data');
      }

      setMessage({ 
        type: 'success', 
        text: data.message || `Successfully loaded dummy data!` 
      });
    } catch (error) {
      console.error('Error loading dummy data:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load dummy data' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-900">Load Dummy Data</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> This tool generates realistic dummy vaccination records 
            with random Indian names, locations (states and districts), vaccine types, and dates. 
            Each record includes precise geographic coordinates for accurate map visualization.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="recordCount" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Records to Generate
            </label>
            <input
              type="number"
              id="recordCount"
              value={recordCount}
              onChange={(e) => setRecordCount(parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended: 500 records (Max: 1000)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Loading a large number of records may take some time. 
              Duplicate certificate IDs will be skipped automatically.
            </p>
          </div>

          <button
            onClick={handleLoadData}
            disabled={loading || recordCount < 1}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Load {recordCount} Records
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Coverage</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>States:</strong> All 28 Indian states and 8 Union Territories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Districts:</strong> Major districts in each state with precise coordinates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Vaccines:</strong> Pfizer, Moderna, AstraZeneca, Covishield, Covaxin, Sputnik V</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span><strong>Date Range:</strong> January 2023 to December 2024</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
