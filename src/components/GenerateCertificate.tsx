import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Search, Loader2, AlertCircle, Download, Share2, Printer } from 'lucide-react';

interface VaccinationRecord {
  certId: string;
  name: string;
  email: string;
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

export function GenerateCertificate() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<VaccinationRecord | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecord(null);

    try {
      if (!certId.trim()) {
        throw new Error('Please enter a certificate ID');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations/${certId.trim()}`,
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

  const handleDownload = () => {
    // For a simple implementation, just trigger print which allows PDF save
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && record) {
      try {
        await navigator.share({
          title: 'Vaccination Certificate',
          text: `My vaccination certificate - ID: ${record.certId}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy cert ID to clipboard
      if (record) {
        navigator.clipboard.writeText(record.certId);
        alert('Certificate ID copied to clipboard!');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Vaccination Certificate</h2>
        <p className="text-gray-600 mb-6">
          Enter your certificate ID to view and download your vaccination certificate.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="certId" className="block text-sm font-medium text-gray-700 mb-2">
              Certificate ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="certId"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g., VAX-20260212-123456"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Certificate Display */}
      {record && (
        <>
          {/* Action Buttons (hide on print) */}
          <div className="flex gap-3 justify-end print:hidden">
            <button
              onClick={handleShare}
              className="bg-gray-600 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Certificate */}
          <div className="bg-white rounded-lg shadow-lg print:shadow-none" id="certificate-container">
            <div className="border-8 border-indigo-600 rounded-lg p-8 print:border-4" id="certificate-content">
              {/* Header */}
              <div className="text-center mb-8 border-b-4 border-indigo-600 pb-6">
                <div className="text-indigo-600 text-5xl font-bold mb-2">
                  COVID-19
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  VACCINATION CERTIFICATE
                </div>
                <div className="text-gray-600 text-lg">
                  Government of India
                </div>
              </div>

              {/* Certificate ID Badge */}
              <div className="bg-indigo-50 border-2 border-indigo-600 rounded-lg p-4 mb-8 text-center">
                <div className="text-sm text-gray-600 mb-1">Certificate ID</div>
                <div className="text-2xl font-bold text-indigo-600 tracking-wide">
                  {record.certId}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6 mb-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 uppercase tracking-wide mb-2">
                    This is to certify that
                  </div>
                  <div className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 inline-block px-8">
                    {record.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-center">
                  {record.age && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Age</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {record.age} years
                      </div>
                    </div>
                  )}
                  {record.gender && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Gender</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {record.gender}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vaccination Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                  Vaccination Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Vaccine Type:</span>
                    <span className="font-semibold text-gray-900">{record.vaccineType}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Dose:</span>
                    <span className="font-semibold text-gray-900">
                      {record.dose === 'Booster' ? 'Booster' : `Dose ${record.dose}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(record.dateAdministered).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">
                      {record.district}, {record.state}
                    </span>
                  </div>
                  {record.administeringOfficer && (
                    <div className="flex justify-between border-b border-gray-300 pb-2 md:col-span-2">
                      <span className="text-gray-600">Administering Officer:</span>
                      <span className="font-semibold text-gray-900">
                        {record.administeringOfficer}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t-2 border-gray-300 pt-6">
                <div className="text-sm text-gray-600 mb-2">
                  Certificate Issued On
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-4">
                  {new Date(record.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-xs text-gray-500 italic">
                  This is a digitally generated certificate. Verify authenticity using the Certificate ID.
                </div>
              </div>

              {/* Digital Signature Placeholder */}
              <div className="mt-8 flex justify-end">
                <div className="text-center">
                  <div className="w-48 border-t-2 border-gray-900 pt-2">
                    <div className="text-sm font-semibold text-gray-900">
                      Authorized Signatory
                    </div>
                    <div className="text-xs text-gray-600">
                      Ministry of Health & Family Welfare
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Keep this certificate safe. You may need it for travel, 
              work, or other official purposes. To download as PDF, click the "Download PDF" button 
              or use your browser's print function and select "Save as PDF".
            </p>
          </div>
        </>
      )}

      {/* No Results Message */}
      {!loading && !error && !record && certId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            Enter your certificate ID above to view your vaccination certificate.
          </p>
        </div>
      )}
    </div>
  );
}
