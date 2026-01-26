'use client';
import { useState, useEffect } from 'react';
import { getDefaulterStudentsAPI } from '../../../Services/studentService';
import AppLayout from '../../../components/AppLayout';

export default function DefaultersPage() {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalDefaulters: 0,
    fullDefaulters: 0,
    partialDefaulters: 0,
    currentMonth: '',
    previousMonth: ''
  });
  const [defaulterStudents, setDefaulterStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDefaulterType, setSelectedDefaulterType] = useState('');

  useEffect(() => {
    const fetchDefaulterStudents = async () => {
      try {
        setLoading(true);
        const response = await getDefaulterStudentsAPI();

        if (response.success) {
          setSummary(response.summary || {});
          setDefaulterStudents(response.data || []);
          setFilteredStudents(response.data || []);
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

  // Defaulter type options based on API response
  const defaulterTypeOptions = [
    { value: 'partial_defaulter', label: 'Partial Defaulter' },
    { value: 'full_defaulter', label: 'Full Defaulter' }
  ];

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

    if (selectedDefaulterType) {
      filtered = filtered.filter(student => 
        student.defaulterType === selectedDefaulterType
      );
    }

    setFilteredStudents(filtered);
  }, [selectedClass, selectedSection, selectedDefaulterType, defaulterStudents]);

  const getDefaulterTypeDisplay = (type) => {
    switch (type) {
      case 'partial_defaulter':
        return 'Partial Defaulter';
      case 'full_defaulter':
        return 'Full Defaulter';
      default:
        return type || 'N/A';
    }
  };

  const getDefaulterTypeBadgeColor = (type) => {
    switch (type) {
      case 'partial_defaulter':
        return 'bg-yellow-100 text-yellow-800';
      case 'full_defaulter':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total unpaid amount
  const calculateTotalUnpaid = () => {
    return filteredStudents.reduce((total, student) => total + (student.totalUnpaid || 0), 0);
  };

  // Format months unpaid array to string
  const formatMonthsUnpaid = (months) => {
    if (!months || !Array.isArray(months)) return 'N/A';
    return months.map(month => 
      month.charAt(0).toUpperCase() + month.slice(1)
    ).join(', ');
  };

  // Print function
  const handlePrint = () => {
    const printContent = document.getElementById('printable-table').innerHTML;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
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
                font-size: 14px;
              }
              .print-summary {
                background: #f5f5f5;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 5px;
                border: 1px solid #ddd;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
              }
              .summary-item {
                text-align: center;
              }
              .summary-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
              }
              .summary-value {
                font-size: 18px;
                font-weight: bold;
                color: #000;
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
              .status-partial_defaulter { 
                background-color: #fff3cd; 
                color: #856404; 
              }
              .status-full_defaulter { 
                background-color: #f8d7da; 
                color: #721c24; 
              }
              .amount-unpaid { 
                color: #dc3545; 
                font-weight: 500; 
              }
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
            <div class="subtitle">Generated on: ${currentDate}</div>
            <div class="print-summary">
              <div class="summary-item">
                <div class="summary-label">Total Students</div>
                <div class="summary-value">${summary.totalStudents || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Defaulters</div>
                <div class="summary-value">${filteredStudents.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Full Defaulters</div>
                <div class="summary-value">${summary.fullDefaulters || 0}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Partial Defaulters</div>
                <div class="summary-value">${summary.partialDefaulters || 0}</div>
              </div>
            </div>
          </div>
          ${printContent}
          <div class="print-footer">
            Current Month: ${summary.currentMonth ? summary.currentMonth.charAt(0).toUpperCase() + summary.currentMonth.slice(1) : 'N/A'} | 
            Total Outstanding: Rs. ${calculateTotalUnpaid().toLocaleString()}
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
      <AppLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Defaulter Students</h1>
            <p className="text-gray-600">
              Students with pending fee payments for {summary.currentMonth ? summary.currentMonth.charAt(0).toUpperCase() + summary.currentMonth.slice(1) : 'current month'}
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

        {/* Summary Cards */}
        <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Total Students</div>
            <div className="text-2xl font-bold text-gray-800">{summary.totalStudents || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Total Defaulters</div>
            <div className="text-2xl font-bold text-red-600">{summary.totalDefaulters || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Full Defaulters</div>
            <div className="text-2xl font-bold text-red-700">{summary.fullDefaulters || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Partial Defaulters</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.partialDefaulters || 0}</div>
          </div>
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
                    Class {className}
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
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Defaulter Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Defaulter Type
              </label>
              <select
                value={selectedDefaulterType}
                onChange={(e) => setSelectedDefaulterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {defaulterTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
                    Showing {filteredStudents.length} of {defaulterStudents.length} defaulter students
                  </p>
                  <p className="text-blue-600 text-sm">
                    Total Unpaid Amount: Rs. {calculateTotalUnpaid().toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-blue-600">
                  Current Month: <span className="font-semibold">
                    {summary.currentMonth ? summary.currentMonth.charAt(0).toUpperCase() + summary.currentMonth.slice(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Printable Table */}
            <div id="printable-table" className="print-only">
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Father's Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Total Unpaid</th>
                    <th>Defaulter Type</th>
                    <th>Months Unpaid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.studentId}>
                      <td>{student.student?.name || 'N/A'}</td>
                      <td>{student.student?.fatherName || 'N/A'}</td>
                      <td>{student.student?.className || 'N/A'}</td>
                      <td>{student.student?.section || 'N/A'}</td>
                      <td className="amount-unpaid">Rs. {student.totalUnpaid?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`status-badge status-${student.defaulterType}`}>
                          {getDefaulterTypeDisplay(student.defaulterType)}
                        </span>
                      </td>
                      <td>{formatMonthsUnpaid(student.monthsUnpaid)}</td>
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
                        Father's Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Unpaid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defaulter Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Months Unpaid
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.student?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.student?.fatherName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.student?.className || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.student?.section || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-red-600 font-medium">
                            Rs. {student.totalUnpaid?.toLocaleString() || '0'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDefaulterTypeBadgeColor(student.defaulterType)}`}>
                            {getDefaulterTypeDisplay(student.defaulterType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatMonthsUnpaid(student.monthsUnpaid)}
                          </div>
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