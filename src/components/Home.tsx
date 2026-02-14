import React from 'react';
import { Syringe, FileText, BarChart3, Plus, Shield } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: 'register' | 'certificate' | 'dashboard' | 'records') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-indigo-100 rounded-full">
            <Shield className="w-16 h-16 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Digital Vaccination Coverage Platform
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track, manage, and analyze vaccination data with ease. Generate certificates, 
          monitor coverage, and maintain comprehensive vaccination records.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('register')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="p-3 bg-green-100 rounded-lg w-fit mb-4 group-hover:bg-green-200 transition-colors">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Register Vaccination</h2>
          <p className="text-gray-600">
            Add new vaccination records to the system with complete patient and vaccine details.
          </p>
        </button>

        <button
          onClick={() => onNavigate('certificate')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generate Certificate</h2>
          <p className="text-gray-600">
            Enter a certification ID to retrieve and generate official vaccination certificates.
          </p>
        </button>

        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4 group-hover:bg-purple-200 transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">
            View comprehensive statistics, coverage maps, and analytics for vaccination data.
          </p>
        </button>
      </div>

      {/* Stats Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Secure Storage</p>
            <p className="text-2xl font-bold text-indigo-600">Database</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Quick Access</p>
            <p className="text-2xl font-bold text-green-600">Certificates</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Visual Analytics</p>
            <p className="text-2xl font-bold text-blue-600">Heatmaps</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Real-time</p>
            <p className="text-2xl font-bold text-purple-600">Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}