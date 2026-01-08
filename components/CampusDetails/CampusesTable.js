'use client';
import { Building, Edit, Trash2, Eye } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const CampusesTable = ({ 
  filteredCampuses, 
  loading, 
  searchTerm,
  onViewClick,
  onEditClick,
  onDeleteClick 
}) => {
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCampuses.map(campus => (
              <tr key={campus._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 flex items-center">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{campus.name}</div>
                    <div className="text-xs text-gray-500">{campus.accountants?.length || 0} accountants</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{campus.city}</td>
                <td className="px-4 py-2 text-sm text-gray-900 hidden sm:table-cell">{campus.phone_no}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${campus.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {campus.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => onViewClick(campus)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditClick(campus)}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(campus._id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredCampuses.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campuses found</h3>
            <p className="text-gray-600 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating a campus'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusesTable;