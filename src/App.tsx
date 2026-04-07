import React, { useState } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Home } from './components/Home';
import { RegisterVaccination } from './components/RegisterVaccination';
import { CertificateLookup } from './components/CertificateLookup';
import { Dashboard } from './components/Dashboard';
import { RecordsTable } from './components/RecordsTable';
import { PredictionDashboard } from './components/PredictionDashboard';
import { Syringe, FileText, BarChart3, Plus, Table, LogOut, User, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/button';

type View = 'home' | 'register' | 'certificate' | 'dashboard' | 'records' | 'prediction';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  // Role-based access control
  const canAccessRegister = user?.role === 'admin' || user?.role === 'employee';
  const canAccessDashboard = user?.role === 'admin';
  const canAccessRecords = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Syringe className="w-8 h-8 text-slate-700" />
              <h1 className="text-xl font-bold text-slate-900">VaxTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1 overflow-x-auto">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentView === 'home'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Syringe className="w-4 h-4" />
                    Home
                  </span>
                </button>
                {canAccessRegister && (
                  <button
                    onClick={() => setCurrentView('register')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      currentView === 'register'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Register
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('certificate')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentView === 'certificate'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Certificate
                  </span>
                </button>
                {canAccessDashboard && (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      currentView === 'dashboard'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </span>
                  </button>
                )}
                {canAccessRecords && (
                  <button
                    onClick={() => setCurrentView('records')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      currentView === 'records'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      Records
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('prediction')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentView === 'prediction'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Prediction
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-600 capitalize">{user?.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="ml-2 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && <Home onNavigate={setCurrentView} />}
        {currentView === 'register' && canAccessRegister && <RegisterVaccination />}
        {currentView === 'certificate' && <CertificateLookup />}
        {currentView === 'dashboard' && canAccessDashboard && <Dashboard />}
        {currentView === 'records' && canAccessRecords && <RecordsTable />}
        {currentView === 'prediction' && <PredictionDashboard />}
        
        {/* Access Denied Messages */}
        {currentView === 'register' && !canAccessRegister && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        )}
        {currentView === 'dashboard' && !canAccessDashboard && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        )}
        {currentView === 'records' && !canAccessRecords && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}