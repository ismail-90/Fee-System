'use client';
import { useState, useEffect } from 'react';
import { X, Building, Loader2 } from 'lucide-react';
import { getCampusDetailsAPI } from '../../Services/campusService';

const CampusDetailsModal = ({ 
  campus, 
  isOpen, 
  onClose,
  showMessage 
}) => {
  const [campusDetails, setCampusDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && campus) {
      fetchCampusDetails();
    }
  }, [isOpen, campus]);

  const fetchCampusDetails = async () => {
    setLoadingDetails(true);
    try {
      const response = await getCampusDetailsAPI(campus._id);
      setCampusDetails(response.data);
    } catch (error) {
      console.error('Error fetching campus details:', error);
      showMessage('error', 'Failed to fetch campus details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!isOpen || !campus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        {loadingDetails ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : campusDetails ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{campus.name} - Financial Summary</h2>
                <p className="text-gray-600 text-sm">As of {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Campus Dashboard</span>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Students</div>
                <div className="text-2xl font-bold text-gray-900">{campusDetails.totalStudents}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-green-600 font-medium mb-1">Total Received</div>
                <div className="text-2xl font-bold text-gray-900">Rs.{campusDetails.totalReceived?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="text-sm text-yellow-600 font-medium mb-1">Total Pending</div>
                <div className="text-2xl font-bold text-gray-900">Rs.{campusDetails.totalPending?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="text-sm text-red-600 font-medium mb-1">Defaulters</div>
                <div className="text-2xl font-bold text-gray-900">{campusDetails.totalDefaulters || 0}</div>
              </div>
            </div>

            {/* Overall Summary */}
            {campusDetails.summaryStats && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">Total Fee</div>
                    <div className="text-xl font-bold text-gray-900">
                      Rs.{campusDetails.summaryStats.overallTotal?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">Total Paid</div>
                    <div className="text-xl font-bold text-green-600">
                      Rs.{campusDetails.summaryStats.overallPaid?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">Balance Pending</div>
                    <div className="text-xl font-bold text-red-600">
                      Rs.{campusDetails.summaryStats.overallPending?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fee Breakdown */}
            {campusDetails.separateCollections?.breakdown && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(campusDetails.separateCollections.breakdown).map(([feeType, data]) => (
                        <tr key={feeType} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                            {feeType.replace(/([A-Z])/g, ' $1').trim()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            Rs.{data.total?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600">
                            Rs.{data.paid?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            Rs.{data.pending?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Collection Details */}
            {campusDetails.totalReceivedBreakdown && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Collection Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(campusDetails.totalReceivedBreakdown).map(([category, amount]) => (
                    amount > 0 && (
                      <div key={category} className="flex justify-between items-center p-3 bg-white border rounded">
                        <span className="text-sm text-gray-600 capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          Rs.{amount.toLocaleString()}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {campusDetails.separateCollectionsTotal && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h4 className="font-medium text-blue-700">Collection Summary</h4>
                    <p className="text-sm text-blue-600">
                      Total Collections: Rs.{campusDetails.separateCollectionsTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <div className="text-lg font-bold text-gray-900">
                      Collection Rate: {((campusDetails.separateCollectionsPaid / campusDetails.separateCollectionsTotal) * 100 || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No details available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusDetailsModal;