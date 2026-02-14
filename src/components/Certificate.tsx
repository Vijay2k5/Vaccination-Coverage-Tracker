import { Award, FileText, Users, MapPin } from 'lucide-react';

interface CertificateProps {
  record: {
    certId: string;
    name: string;
    age?: number;
    gender?: string;
    vaccineType: string;
    doseNumber: number;
    dateAdministered: string;
    location: string;
    healthcareProvider?: string;
    batchNumber?: string;
  };
  onClose: () => void;
}

export function Certificate({ record, onClose }: CertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:shadow-none">
        {/* Certificate Content */}
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              VACCINATION CERTIFICATE
            </h1>
            <p className="text-gray-600">Official Immunization Record</p>
          </div>

          {/* Certificate ID */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
            <p className="text-2xl font-bold text-blue-600">{record.certId}</p>
          </div>

          {/* Patient Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{record.name}</p>
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
            <div>
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900">{record.location}</p>
            </div>
          </div>

          {/* Vaccination Details */}
          <div className="border-t-2 border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Vaccination Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vaccine Type</p>
                <p className="text-lg font-semibold text-gray-900">{record.vaccineType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Dose Number</p>
                <p className="text-lg font-semibold text-gray-900">Dose {record.doseNumber}</p>
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
              {record.batchNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Batch Number</p>
                  <p className="text-lg font-semibold text-gray-900">{record.batchNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Healthcare Provider */}
          {record.healthcareProvider && (
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <p className="text-sm text-gray-600 mb-1">Healthcare Provider</p>
              <p className="text-lg font-semibold text-gray-900">{record.healthcareProvider}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">
              This is an official vaccination certificate. Keep it for your records.
            </p>
            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              <FileText className="w-4 h-4 mr-2" />
              <span>Generated on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="bg-gray-50 px-8 py-4 flex justify-end gap-3 print:hidden border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
