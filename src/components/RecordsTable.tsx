import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Trash2, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, Filter, X } from 'lucide-react';

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

type SortField = 'certId' | 'name' | 'state' | 'vaccineType' | 'dateAdministered';
type SortDirection = 'asc' | 'desc';

export function RecordsTable() {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('dateAdministered');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filtering
  const [filters, setFilters] = useState({
    state: '',
    vaccineType: '',
    dose: '',
    gender: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    // Apply search, filter, and sort
    let filtered = [...records];

    // Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        (record.certId?.toLowerCase() || '').includes(term) ||
        (record.name?.toLowerCase() || '').includes(term) ||
        (record.state?.toLowerCase() || '').includes(term) ||
        (record.district?.toLowerCase() || '').includes(term) ||
        (record.vaccineType?.toLowerCase() || '').includes(term)
      );
    }

    // Filters
    if (filters.state) {
      filtered = filtered.filter(r => r.state === filters.state);
    }
    if (filters.vaccineType) {
      filtered = filtered.filter(r => r.vaccineType === filters.vaccineType);
    }
    if (filters.dose) {
      filtered = filtered.filter(r => r.dose === filters.dose);
    }
    if (filters.gender) {
      filtered = filtered.filter(r => r.gender === filters.gender);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle null values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, filters, sortField, sortDirection, records]);

  const fetchRecords = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch records');
      }

      setRecords(data.records || []);
      setFilteredRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load records';
      setError(`Unable to connect to the server. ${errorMessage}. Please make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm(`Are you sure you want to delete vaccination record ${certId}?`)) {
      return;
    }

    setDeleteLoading(certId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations/${certId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete record');
      }

      // Remove from local state
      setRecords(prev => prev.filter(r => r.certId !== certId));
      setFilteredRecords(prev => prev.filter(r => r.certId !== certId));
      setSelectedRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(certId);
        return newSet;
      });
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedRecords.size} selected records?`)) {
      return;
    }

    const certIds = Array.from(selectedRecords);
    let successCount = 0;
    let errorCount = 0;

    for (const certId of certIds) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b92bafb3/vaccinations/${certId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }
    }

    alert(`Deleted ${successCount} records. ${errorCount} errors.`);
    setSelectedRecords(new Set());
    fetchRecords();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === paginatedRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(paginatedRecords.map(r => r.certId)));
    }
  };

  const toggleSelectRecord = (certId: string) => {
    const newSet = new Set(selectedRecords);
    if (newSet.has(certId)) {
      newSet.delete(certId);
    } else {
      newSet.add(certId);
    }
    setSelectedRecords(newSet);
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      vaccineType: '',
      dose: '',
      gender: ''
    });
    setSearchTerm('');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueStates = [...new Set(records.map(r => r.state))].filter(Boolean).sort();
  const uniqueVaccineTypes = [...new Set(records.map(r => r.vaccineType))].filter(Boolean).sort();
  const uniqueDoses = [...new Set(records.map(r => r.dose))].filter(Boolean).sort();
  const uniqueGenders = [...new Set(records.map(r => r.gender))].filter(Boolean).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading records</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchRecords}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, location, or vaccine..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
            showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={fetchRecords}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
        {selectedRecords.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedRecords.size})
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Type</label>
              <select
                value={filters.vaccineType}
                onChange={(e) => setFilters({ ...filters, vaccineType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Vaccines</option>
                {uniqueVaccineTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dose</label>
              <select
                value={filters.dose}
                onChange={(e) => setFilters({ ...filters, dose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Doses</option>
                {uniqueDoses.map(dose => (
                  <option key={dose} value={dose}>
                    {dose === 'Booster' ? 'Booster' : `Dose ${dose}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Genders</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
          {filteredRecords.length !== records.length && ` (filtered from ${records.length} total)`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedRecords.length > 0 && selectedRecords.size === paginatedRecords.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th
                onClick={() => handleSort('certId')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Cert ID
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th
                onClick={() => handleSort('state')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Location
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('vaccineType')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Vaccine
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dose
              </th>
              <th
                onClick={() => handleSort('dateAdministered')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-10 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.certId} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.certId)}
                      onChange={() => toggleSelectRecord(record.certId)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {record.certId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.age || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.gender || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.district}, {record.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.vaccineType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.dose === 'Booster' ? 'Booster' : `Dose ${record.dose}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.dateAdministered).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDelete(record.certId)}
                      disabled={deleteLoading === record.certId}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete record"
                    >
                      {deleteLoading === record.certId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}