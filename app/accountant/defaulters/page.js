'use client';
import { useState, useEffect } from 'react';
import { getDefaulterStudentsAPI } from '../../../Services/studentService';
import AppLayout from '../../../components/AppLayout';

export default function DefaultersPage() {
  const [defaulterStudents, setDefaulterStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchDefaulterStudents = async () => {
      try {
        setLoading(true);
        const response = await getDefaulterStudentsAPI();

        if (response.success) {
          setDefaulterStudents(response.data);
          setFilteredStudents(response.data);
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

  // Extract unique classes and sections from data
  const uniqueClasses = [...new Set(defaulterStudents.map(student => 
    student.student?.className || ''
  ))].filter(Boolean);

  const uniqueSections = [...new Set(defaulterStudents.map(student => 
    student.student?.section || ''
  ))].filter(Boolean);

  // Status options
  const statusOptions = ['partial', 'paid', 'unpaid'];

  // Apply filters
  useEffect(() => {
    let filtered = [...defaulterStudents];

    if (selectedClass) {
      filtered = filtered.filter(student => 
        student.student?.className === selectedClass
      );
    }

    if (selectedSection) {
      filtered = filtered.filter(student => 
        student.student?.section === selectedSection
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(student => 
        student.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredStudents(filtered);
  }, [selectedClass, selectedSection, selectedStatus, defaulterStudents]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Print function
  const handlePrint = () => {
    const printContent = document.getElementById('printable-table').innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Defaulter Students Report</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #000;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
              }
              .print-header h1 {
                margin: 0;
                font-size: 24px;
              }
              .print-header .subtitle {
                margin-top: 5px;
                color: #666;
              }
              .print-summary {
                background: #f5f5f5;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 5px;
                border: 1px solid #ddd;
              }
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              .print-table th {
                background-color: #f8f9fa;
                color: #000;
                font-weight: bold;
                padding: 12px 8px;
                border: 1px solid #dee2e6;
                text-align: left;
                font-size: 14px;
              }
              .print-table td {
                padding: 10px 8px;
                border: 1px solid #dee2e6;
                font-size: 13px;
              }
              .print-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .status-badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                display: inline-block;
              }
              .status-partial { background-color: #fff3cd; color: #856404; }
              .status-unpaid { background-color: #f8d7da; color: #721c24; }
              .status-paid { background-color: #d4edda; color: #155724; }
              .amount-paid { color: #28a745; font-weight: 500; }
              .amount-remaining { color: #dc3545; font-weight: 500; }
              .print-footer {
                margin-top: 30px;
                text-align: right;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              .no-print {
                display: none !important;
              }
            }
            @page {
              size: A4 landscape;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Defaulter Students Report</h1>
            <div class="subtitle">Students with pending or partial fee payments</div>
            <div class="print-summary">
              Total Defaulters: ${filteredStudents.length} | 
              Total Outstanding: Rs. ${filteredStudents.reduce((sum, student) => sum + student.remainingBalance, 0).toLocaleString()}
            </div>
          </div>
          ${printContent}
          <div class="print-footer">
            Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after content loads
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Defaulter Students</h1>
            <p className="text-gray-600">
              Students with pending or partial fee payments
            </p>
          </div>
          
          {/* Print Button */}
          {filteredStudents.length > 0 && (
            <button
              onClick={handlePrint}
              className="no-print bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          )}
        </div>

        {/* Filter Section */}
        <div className="no-print mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              {defaulterStudents.length === 0 
                ? "No defaulter students found" 
                : "No students match the selected filters"}
            </p>
          </div>
        ) : (
          <>
            <div className="no-print mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 font-semibold">
                    Total Defaulters: {filteredStudents.length}
                  </p>
                  <p className="text-blue-600 text-sm">
                    Total Outstanding: Rs. {filteredStudents.reduce((sum, student) => sum + student.remainingBalance, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Printable Table */}
            <div id="printable-table" className="print-only">
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Father&apos;s Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Paid Amount</th>
                    <th>Remaining Balance</th>
                    <th>Status</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((defaulter) => (
                    <tr key={defaulter.defaulterId}>
                      <td>{defaulter.student?.name || 'N/A'}</td>
                      <td>{defaulter.student?.fatherName || 'N/A'}</td>
                      <td>{defaulter.student?.className || 'N/A'}</td>
                      <td>{defaulter.student?.section || 'N/A'}</td>
                      <td className="amount-paid">Rs. {defaulter.paidAmount}</td>
                      <td className="amount-remaining">Rs. {defaulter.remainingBalance}</td>
                      <td>
                        <span className={`status-badge status-${defaulter.status.toLowerCase()}`}>
                          {defaulter.status}
                        </span>
                      </td>
                      <td>{formatDate(defaulter.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Original Table (for screen view) */}
            <div className="no-print bg-white rounded-lg shadow overflow-hidden">
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
                        Section
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
                    {filteredStudents.map((defaulter) => (
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
                          <div className="text-sm text-gray-900">
                            {defaulter.student?.section || 'N/A'}
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

      {/* Add print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-table,
          #printable-table * {
            visibility: visible;
          }
          #printable-table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </AppLayout>
  );
}