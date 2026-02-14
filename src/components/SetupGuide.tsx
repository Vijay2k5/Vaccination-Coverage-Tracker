import React from 'react';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export function SetupGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Setup Guide</h2>

        {/* System Status */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Backend Server: Running</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Database: Connected</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">Email Service: Requires API Key</span>
            </div>
          </div>
        </div>

        {/* Email Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Email Setup Required
          </h3>
          
          <div className="space-y-4 text-blue-900">
            <p className="font-medium">To enable email notifications for vaccination confirmations:</p>
            
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                <strong>Create a Resend Account</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Go to <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">resend.com <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Sign up for a free account (no credit card required)</li>
                  <li>Verify your email address</li>
                </ul>
              </li>
              
              <li>
                <strong>Get Your API Key</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>After logging in, navigate to "API Keys" in the sidebar</li>
                  <li>Click "Create API Key"</li>
                  <li>Give it a name (e.g., "VaxTrack")</li>
                  <li>Copy the API key (starts with "re_...")</li>
                  <li>⚠️ Save it immediately - you can only see it once!</li>
                </ul>
              </li>
              
              <li>
                <strong>Add API Key to Environment</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Click on the environment variables icon in your project</li>
                  <li>Add a new secret named <code className="bg-blue-100 px-2 py-1 rounded">RESEND_API_KEY</code></li>
                  <li>Paste your Resend API key</li>
                  <li>Save the changes</li>
                </ul>
              </li>
            </ol>

            <div className="bg-white border border-blue-300 rounded-md p-4 mt-4">
              <p className="font-medium text-sm mb-2">Free Tier Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>100 emails per day (perfect for testing)</li>
                <li>Sends from onboarding@resend.dev domain</li>
                <li>Full API access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Registration System</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-generated certificate IDs</li>
                <li>• Email confirmations</li>
                <li>• Indian states and districts</li>
                <li>• GPS coordinates tracking</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Certificate Generation</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• QR code with verification</li>
                <li>• Print/download functionality</li>
                <li>• Professional design</li>
                <li>• Instant retrieval</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time statistics</li>
                <li>• Interactive charts</li>
                <li>• India heatmap visualization</li>
                <li>• Monthly trend analysis</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Records Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View all records</li>
                <li>• Search and filter</li>
                <li>• Sorting capabilities</li>
                <li>• Delete functionality</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900">❌ "Failed to fetch" errors</p>
              <p className="text-sm text-gray-600 ml-6">
                Make sure the backend server is running. The app uses Supabase Edge Functions.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900">❌ "API key is invalid" error</p>
              <p className="text-sm text-gray-600 ml-6">
                Your Resend API key is not properly configured. Follow the setup steps above.
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900">❌ Emails not arriving</p>
              <ul className="text-sm text-gray-600 ml-6 list-disc list-inside">
                <li>Check your spam/junk folder</li>
                <li>Verify API key is correct</li>
                <li>Check Resend dashboard logs</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-900">❌ No data in dashboard</p>
              <p className="text-sm text-gray-600 ml-6">
                Go to "Load Data" section to populate 500 dummy records for testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
