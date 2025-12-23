'use client';
import { useState, useEffect } from 'react';
import { getDefaultersByCampusAPI } from "../../../Services/studentService";
import { getCampusesAPI } from "../../../Services/campusService";
import AppLayout from "../../../components/AppLayout";

export default function DefaultersPage() {
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDefaulters: 0,
    totalBalance: 0,
    partialPayments: 0,
    noPayments: 0
  });

  // Fetch campuses on component mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  // Fetch defaulters when campus is selected
  useEffect(() => {
    if (selectedCampus) {
      fetchDefaulters(selectedCampus);
    }
  }, [selectedCampus]);

  const fetchCampuses = async () => {
    try {
      const response = await getCampusesAPI();
      if (response && response.campuses) {
        setCampuses(response.campuses);
        if (response.campuses.length > 0) {
          setSelectedCampus(response.campuses[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching campuses:", error);
    }
  };

  const fetchDefaulters = async (campusId) => {
    setLoading(true);
    try {
      const response = await getDefaultersByCampusAPI(campusId);
      if (response && response.success) {
        setDefaulters(response.data || []);
        
        // Calculate statistics
        let totalBalance = 0;
        let partialPayments = 0;
        let noPayments = 0;
        
        response.data.forEach(defaulter => {
          totalBalance += defaulter.remainingBalance || 0;
          if (defaulter.status === 'partial') {
            partialPayments++;
          } else {
            noPayments++;
          }
        });
        
        setStats({
          totalDefaulters: response.totalDefaulters || 0,
          totalBalance,
          partialPayments,
          noPayments
        });
      }
    } catch (error) {
      console.error("Error fetching defaulters:", error);
      setDefaulters([]);
      setStats({
        totalDefaulters: 0,
        totalBalance: 0,
        partialPayments: 0,
        noPayments: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCampusName = (id) => {
    const campus = campuses.find(c => c._id === id);
    return campus ? campus.name : 'Unknown Campus';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Partial Payment</span>;
      case 'unpaid':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Unpaid</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status}</span>;
    }
  };

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Defaulter Students</h1>
           </div>

          {/* Campus Selection */}
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Campus</label>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name} - {campus.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Accountant</p>
                <p className="font-medium">
                  {campuses.find(c => c._id === selectedCampus)?.accountants[0]?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Defaulters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDefaulters}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pending Balance</p>
                  <p className="text-2xl font-bold text-gray-900">Rs.{(stats.totalBalance)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partial Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.partialPayments}</p>
                </div>
              </div>
            </div>

         
          </div>

          {/* Defaulters Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Defaulter List</h2>
                <span className="text-sm text-gray-500">
                  {loading ? 'Loading...' : `${defaulters.length} students found`}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : defaulters.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No defaulters found</h3>
                <p className="mt-1 text-sm text-gray-500">All students have paid their fees for the selected campus.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {defaulters.map((defaulter) => (
                      <tr key={defaulter._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {defaulter.studentId?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {defaulter.studentId?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {defaulter.studentId?.fatherName || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Class {defaulter.studentId?.className || defaulter.feeId?.className || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {defaulter.feeId?.feeMonth || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(defaulter.paidAmount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600">
                            {formatCurrency(defaulter.remainingBalance || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(defaulter.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {defaulter.invoiceId?.invoiceUrl ? (
                            <a
                              href={defaulter.invoiceId.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              View Invoice
                            </a>
                          ) : (
                            <span className="text-gray-400">No invoice</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

       
        </div>
      </div>
    </AppLayout>
  );
}