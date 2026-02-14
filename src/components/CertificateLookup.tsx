import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Search, Download, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

interface VaccinationRecord {
  certId: string;
  name: string;
  age: number | null;
  gender: string | null;
  state: string;
  district: string;
  vaccineType: string;
  dose: string;
  dateAdministered: string;
  administeringOfficer: string | null;
  createdAt: string;
}

export function CertificateLookup() {
  const [certId, setCertId] = useState('');
  const [record, setRecord] = useState<VaccinationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecord(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations/${certId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Certificate not found');
      }

      setRecord(data.record);
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve certificate');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Generate Vaccination Certificate</h2>

        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g., VAX-2024-001234)"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Certificate Display */}
      {record && (
        <div className="bg-white rounded-lg shadow-lg print:shadow-none" id="certificate-container">
          {/* Certificate Header */}
          <div className="border-8 border-indigo-600 rounded-lg p-8 print:border-4" id="certificate-content">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <Shield className="w-16 h-16 text-indigo-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Vaccination Certificate
              </h1>
              <p className="text-gray-600">Official Record of Vaccination</p>
              <div className="flex justify-center mt-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Certificate Body */}
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Certificate ID */}
              <div className="text-center py-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Certificate ID</p>
                <p className="text-xl font-bold text-indigo-600">{record.certId}</p>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{record.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{record.state}, {record.district}</p>
                </div>
                {record.age && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="text-lg font-semibold text-gray-900">{record.age} years</p>
                  </div>
                )}
                {record.gender && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gender</p>
                    <p className="text-lg font-semibold text-gray-900">{record.gender}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Vaccination Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vaccine Type</p>
                    <p className="text-lg font-semibold text-gray-900">{record.vaccineType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dose</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {record.dose === 'Booster' ? 'Booster' : `Dose ${record.dose}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date Administered</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(record.dateAdministered).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {record.administeringOfficer && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Administered By</p>
                      <p className="text-lg font-semibold text-gray-900">{record.administeringOfficer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center text-sm text-gray-500">
                <p>This certificate was issued on {new Date(record.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="mt-2">VaxTrack Digital Platform - Official Record</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50 rounded-b-lg print:hidden">
            <button
              onClick={handlePrint}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Print / Download Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}