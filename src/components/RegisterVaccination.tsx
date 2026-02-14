import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { indianStatesDistricts, vaccineInfo } from '../utils/dummyData';

export function RegisterVaccination() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    vaccineType: '',
    dose: '',
    dateAdministered: '',
    administeringOfficer: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; certId?: string } | null>(null);

  const availableDistricts = formData.state ? indianStatesDistricts[formData.state]?.districts || [] : [];
  const availableDoses = formData.vaccineType ? vaccineInfo[formData.vaccineType]?.doses || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Find coordinates for the selected district
      const selectedDistrict = availableDistricts.find(d => d.name === formData.district);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...formData,
            age: formData.age ? parseInt(formData.age) : null,
            latitude: selectedDistrict?.lat || null,
            longitude: selectedDistrict?.lng || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register vaccination');
      }

      setMessage({ type: 'success', text: 'Vaccination record registered successfully!', certId: data.certId });
      
      // Store email for the success message before resetting
      const registeredEmail = formData.email;
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        age: '',
        gender: '',
        state: '',
        district: '',
        vaccineType: '',
        dose: '',
        dateAdministered: '',
        administeringOfficer: ''
      });
      
      // Show email in message using the stored email
      setTimeout(() => {
        if (registeredEmail) {
          setMessage(prev => prev ? { ...prev, text: `${prev.text} A confirmation email has been sent to ${registeredEmail}.` } : null);
        }
      }, 100);
    } catch (error) {
      console.error('Error registering vaccination:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to register vaccination' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      // Reset district when state changes
      ...(name === 'state' ? { district: '' } : {}),
      // Reset dose when vaccine type changes
      ...(name === 'vaccineType' ? { dose: '' } : {})
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Register Vaccination</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{message.text}</p>
                {message.certId && (
                  <div className="mt-3 bg-white rounded-md p-3 border-2 border-green-300">
                    <p className="text-sm text-gray-600 mb-1">Your Certificate ID:</p>
                    <p className="text-xl font-bold text-indigo-600">{message.certId}</p>
                    <p className="text-xs text-gray-500 mt-2">Save this ID to retrieve your certificate later.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="25"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select State</option>
                {Object.keys(indianStatesDistricts).sort().map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                id="district"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.state}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select District</option>
                {availableDistricts.map(district => (
                  <option key={district.name} value={district.name}>{district.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vaccine Type and Dose */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="vaccineType" className="block text-sm font-medium text-gray-700 mb-2">
                Vaccine Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vaccineType"
                name="vaccineType"
                required
                value={formData.vaccineType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Pfizer-BioNTech">Pfizer-BioNTech</option>
                <option value="Moderna">Moderna</option>
                <option value="AstraZeneca">AstraZeneca</option>
                <option value="Johnson & Johnson">Johnson & Johnson</option>
                <option value="Sinovac">Sinovac</option>
                <option value="Covaxin">Covaxin</option>
              </select>
            </div>

            <div>
              <label htmlFor="dose" className="block text-sm font-medium text-gray-700 mb-2">
                Dose <span className="text-red-500">*</span>
              </label>
              <select
                id="dose"
                name="dose"
                required
                value={formData.dose}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {availableDoses.map(dose => (
                  <option key={dose} value={dose}>
                    {dose === 'Booster' ? 'Booster' : `${dose}${dose === '1' ? 'st' : dose === '2' ? 'nd' : dose === '3' ? 'rd' : 'th'} Dose`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Administered */}
          <div>
            <label htmlFor="dateAdministered" className="block text-sm font-medium text-gray-700 mb-2">
              Date Administered <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateAdministered"
              name="dateAdministered"
              required
              value={formData.dateAdministered}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Administering Officer */}
          <div>
            <label htmlFor="administeringOfficer" className="block text-sm font-medium text-gray-700 mb-2">
              Administering Officer
            </label>
            <input
              type="text"
              id="administeringOfficer"
              name="administeringOfficer"
              value={formData.administeringOfficer}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Dr. Smith"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Vaccination'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}