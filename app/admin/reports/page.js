'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from "../../../components/AppLayout";
import { getCampusesAPI } from "../../../Services/campusService";
import { getCampusReportAPI } from "../../../Services/reportServices";

// Helper for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount || 0);
};

export default function ReportPage() {
  // --- State Management ---
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Filter States
  const [selectedCampus, setSelectedCampus] = useState('');
  const [filterType, setFilterType] = useState('today');
  
  // Date Inputs
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('january');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // --- Fetch Campuses on Load ---
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await getCampusesAPI();
        // Assuming response structure based on your JSON
        if (res?.campuses) {
          setCampuses(res.campuses);
        }
      } catch (error) {
        console.error("Failed to fetch campuses", error);
      }
    };
    fetchCampuses();
  }, []);

  // --- Generate Report Function ---
  const handleGenerateReport = async () => {
    if (!selectedCampus) {
      alert("Please select a campus first.");
      return;
    }

    setLoading(true);
    setReportData(null);

    let payload = {
      campusId: selectedCampus,
      filterType: filterType
    };

    // Construct payload based on filter type
    switch (filterType) {
      case 'specific':
        payload.date = specificDate;
        break;
      case 'dateRange':
        payload.startDate = startDate;
        payload.endDate = endDate;
        break;
      case 'specificMonth':
        payload.month = selectedMonth;
        payload.year = selectedYear;
        break;
      case 'today':
      case 'yesterday':
      case 'thisMonth':
        // No extra params needed besides filterType
        break;
      default:
        break;
    }

    try {
      const data = await getCampusReportAPI(payload);
      if (data.success) {
        setReportData(data);
      } else {
        alert("No data found or error occurred.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  // --- Auto-fetch when Campus Changes (Optional, but user requested default today flow) ---
  useEffect(() => {
    if (selectedCampus && filterType === 'today') {
      handleGenerateReport();
    }
  }, [selectedCampus]);

  // --- Print Handler ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* --- CONTROLS SECTION (Hidden during Print) --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Financial Reports</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Campus Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Campus</label>
              <select 
                className="w-full border p-2 rounded"
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
              >
                <option value="">-- Select Campus --</option>
                {campuses.map(campus => (
                  <option key={campus._id} value={campus._id}>{campus.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
              <select 
                className="w-full border p-2 rounded"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisMonth">This Month</option>
                <option value="specific">Specific Date</option>
                <option value="dateRange">Date Range</option>
                <option value="specificMonth">Specific Month</option>
              </select>
            </div>

            {/* Dynamic Inputs based on Filter */}
            {filterType === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full border p-2 rounded"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                />
              </div>
            )}

            {filterType === 'dateRange' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full border p-2 rounded"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full border p-2 rounded"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {filterType === 'specificMonth' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select 
                    className="w-full border p-2 rounded"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'].map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input 
                    type="number" 
                    className="w-full border p-2 rounded"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex-1"
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
              
              {reportData && (
                <button 
                  onClick={handlePrint}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
                >
                  Print / PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- REPORT DISPLAY SECTION (Visible in Print) --- */}
        {reportData && (
          <div className="bg-white p-8 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0" id="printable-report">
            
            {/* Report Header */}
            <div className="text-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold uppercase tracking-wide">Cash Flow Report</h2>
              <p className="text-gray-600 mt-1">
                Generated By: {reportData.generatedBy?.name} ({reportData.generatedBy?.role})
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Period: {reportData.filterInfo?.filterType} | 
                Generated on: {new Date(reportData.timestamp).toLocaleString()}
              </p>
            </div>

            {/* 1. Main Financial Summary (Calculations) */}
            <div className="mb-8">
              <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard label="B/F Amount" value={reportData.calculations?.bfAmount} color="bg-gray-100" />
                <SummaryCard label="Total Collection (+)" value={reportData.calculations?.totalCollection} color="bg-green-50" textColor="text-green-700" />
                <SummaryCard label="Total Expenses (-)" value={reportData.calculations?.totalExpenses} color="bg-red-50" textColor="text-red-700" />
                <SummaryCard label="Cash In Hand (=)" value={reportData.calculations?.cashInHand} color="bg-blue-100" textColor="text-blue-800" bold />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
              
              {/* 2. Income Breakdown */}
              <div>
                <h3 className="text-lg font-bold border-l-4 border-green-600 pl-3 mb-4">Income Breakdown</h3>
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Fee Type</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.income?.breakdown || {}).map(([key, val]) => (
                      val > 0 && (
                        <tr key={key}>
                          <td className="border p-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="border p-2 text-right">{formatCurrency(val)}</td>
                        </tr>
                      )
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="border p-2">Total Income</td>
                      <td className="border p-2 text-right">{formatCurrency(reportData.income?.totalIncome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. Class Wise Summary */}
              <div>
                <h3 className="text-lg font-bold border-l-4 border-purple-600 pl-3 mb-4">Class Wise Collection</h3>
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Class</th>
                      <th className="border p-2 text-center">Students</th>
                      <th className="border p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.classWiseSummary?.map((cls, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">{cls.className}</td>
                        <td className="border p-2 text-center">{cls.studentCount}</td>
                        <td className="border p-2 text-right">{formatCurrency(cls.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Student Details Table */}
            <div className="mt-8">
              <h3 className="text-lg font-bold border-l-4 border-orange-600 pl-3 mb-4">Student Collection Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-800 text-white print:bg-gray-300 print:text-black">
                    <tr>
                      <th className="border p-2 text-left">Student Name</th>
                      <th className="border p-2 text-left">Father Name</th>
                      <th className="border p-2 text-left">Class</th>
                      <th className="border p-2 text-left">Fee Details</th>
                      <th className="border p-2 text-right">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.studentWiseCollection?.map((student, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border p-2 font-medium">{student.studentName}</td>
                        <td className="border p-2">{student.fatherName}</td>
                        <td className="border p-2">{student.className}</td>
                        <td className="border p-2 text-xs text-gray-600">
                          {student.payments.map((p, i) => (
                            <span key={i} className="block">
                              {p.feeType} ({p.month}): {p.amount}
                            </span>
                          ))}
                        </td>
                        <td className="border p-2 text-right font-bold">{formatCurrency(student.totalPaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Footer / Signatures for Print */}
            <div className="mt-16 pt-8 border-t flex justify-between print:flex hidden">
               <div className="text-center">
                  <div className="w-40 border-b border-black mb-2"></div>
                  <p className="font-bold">Accountant Signature</p>
               </div>
               <div className="text-center">
                  <div className="w-40 border-b border-black mb-2"></div>
                  <p className="font-bold">Principal Signature</p>
               </div>
            </div>

          </div>
        )}
      </div>

      {/* Styles for Printing - Hides sidebar/nav and formats paper */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          /* Hide AppLayout sidebar/header if they are separate dom elements */
          nav, header, aside, footer { display: none !important; }
        }
      `}</style>
    </AppLayout>
  );
}

// Simple Component for the calculation cards
function SummaryCard({ label, value, color, textColor = "text-gray-800", bold = false }) {
  return (
    <div className={`${color} p-4 rounded border text-center`}>
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className={`text-xl ${textColor} ${bold ? 'font-extrabold' : 'font-semibold'}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}