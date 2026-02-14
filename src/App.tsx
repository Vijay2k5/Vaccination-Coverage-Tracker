import React, { useState } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Home } from './components/Home';
import { RegisterVaccination } from './components/RegisterVaccination';
import { CertificateLookup } from './components/CertificateLookup';
import { Dashboard } from './components/Dashboard';
import { RecordsTable } from './components/RecordsTable';
import { Syringe, FileText, BarChart3, Plus, Table } from 'lucide-react';

type View = 'home' | 'register' | 'certificate' | 'dashboard' | 'records';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Syringe className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">VaxTrack</h1>
            </div>
            <div className="flex space-x-1 overflow-x-auto">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === 'home'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Syringe className="w-4 h-4" />
                  Home
                </span>
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === 'register'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Register
                </span>
              </button>
              <button
                onClick={() => setCurrentView('certificate')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === 'certificate'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Certificate
                </span>
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => setCurrentView('records')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === 'records'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  Records
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <Home onNavigate={setCurrentView} />}
        {currentView === 'register' && <RegisterVaccination />}
        {currentView === 'certificate' && <CertificateLookup />}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'records' && <RecordsTable />}
      </main>
    </div>
  );
}