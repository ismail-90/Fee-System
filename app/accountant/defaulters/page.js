'use client';
import { useState, useEffect } from 'react';
import { getDefaulterStudentsAPI } from '@/Services/studentService';
import AppLayout from '@/components/AppLayout';

export default function DefaultersPage() {
  const [defaulterStudents, setDefaulterStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefaulterStudents = async () => {
      try {
        setLoading(true);
        const response = await getDefaulterStudentsAPI();
        
        if (response.success) {
          setDefaulterStudents(response.data);
        } else {
          setError('Failed to fetch defaulter students');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error('Error fetching defaulter students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaulterStudents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AppLayout>
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Defaulter Students</h1>
        <p className="text-gray-600">
          Students with pending or partial fee payments
        </p>
      </div>

      {defaulterStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No defaulter students found</p>
        </div>
      ) : (
        <>
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-semibold">
                  Total Defaulters: {defaulterStudents.length}
                </p>
                <p className="text-blue-600 text-sm">
                  Total Outstanding: Rs. {(
                    defaulterStudents.reduce((sum, student) => sum + student.remainingBalance, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father&apos;s Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                     
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                 {defaulterStudents.map((defaulter) => (
  <tr key={defaulter.defaulterId} className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">
        {defaulter.student?.name || 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {defaulter.student?.fatherName || 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {defaulter.student?.className || 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-green-600 font-medium">
        Rs. {(defaulter.paidAmount)}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-red-600 font-medium">
        Rs. {(defaulter.remainingBalance)}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeColor(defaulter.status)}`}>
        {defaulter.status}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {formatDate(defaulter.createdAt)}
    </td>
  </tr>
))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
    </AppLayout>
  );
}