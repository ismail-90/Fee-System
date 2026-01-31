'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from "../../components/AppLayout";
import { getDailyReportAPI } from "../../Services/reportServices";

export default function ReportsDetails() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [filterType, setFilterType] = useState('today');
  const [bfAmount, setBfAmount] = useState(0);
  
  // Dynamic Date States
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [monthFilter, setMonthFilter] = useState({ 
    month: new Date().toLocaleString('default', { month: 'long' }), 
    year: new Date().getFullYear() 
  });

  const printRef = useRef();

  // Construct Payload based on Filter Type
  const getPayload = () => {
    const base = { bfAmount: Number(bfAmount), filterType };

    switch (filterType) {
      case 'specific':
        return { ...base, date: specificDate };
      case 'dateRange':
        return { ...base, startDate: dateRange.startDate, endDate: dateRange.endDate };
      case 'specificMonth':
        return { ...base, month: monthFilter.month, year: Number(monthFilter.year) };
      default:
        // For today, yesterday, thisMonth, lastMonth, thisYear
        return base;
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const payload = getPayload();
      
      // Validation for Date Range
      if (filterType === 'dateRange' && (!payload.startDate || !payload.endDate)) {
        alert("Please select both Start and End dates.");
        setLoading(false);
        return;
      }

      const response = await getDailyReportAPI(payload);
      setReportData(response);
      // Update bfAmount with response value
      if (response && response.calculations) {
        setBfAmount(response.calculations.bfAmount || 0);
      }
    } catch (error) {
      console.error(error);
      alert("Report generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Report - Print</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 0;
            width: 210mm;
            max-width: 100%;
          }
          
          .print-container {
            width: 100%;
            padding: 0;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          
          .print-header h1 {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .print-header .info {
            display: flex;
            justify-content: center;
            gap: 20px;
            font-size: 11px;
            font-weight: 500;
          }
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 15px;
          }
          
          .card {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
          }
          
          .card-title {
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 4px;
            font-weight: 600;
          }
          
          .card-value {
            font-size: 16px;
            font-weight: bold;
          }
          
          .section-title {
            font-size: 12px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 6px 8px;
            margin-bottom: 8px;
            border-left: 4px solid #000;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          
          th {
            background: #f8f8f8;
            font-weight: 600;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }
          
          td {
            padding: 5px 8px;
            border: 1px solid #ddd;
            font-size: 11px;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .total-row {
            background: #f8f8f8;
            font-weight: bold;
          }
          
          .breakdown-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .final-calculation {
            border-top: 2px solid #000;
            padding-top: 15px;
            margin-top: 20px;
          }
          
          .calculation-box {
            max-width: 300px;
            margin-left: auto;
            background: #f8f8f8;
            padding: 12px;
            border: 1px solid #ddd;
          }
          
          .calc-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 11px;
          }
          
          .calc-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 8px;
            margin-top: 8px;
          }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
          }
          
          .signature-box {
            width: 200px;
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 30px;
            padding-top: 5px;
            font-size: 10px;
          }
          
          @media print {
            body {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            
            .print-container {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${printRef.current.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 100);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  // Helper to calculate fee categories from the payments array
  const calculateFeeCategory = (payments, type) => {
    if (!payments) return 0;
    if (type === 'Tuition') return payments.filter(p => p.feeType === 'Tuition Fee').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Karate') return payments.filter(p => p.feeType === 'Karate Fee').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Exam') return payments.filter(p => p.feeType === 'Exam Fee').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Admission') return payments.filter(p => p.feeType === 'Admission Fee').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Annual') return payments.filter(p => p.feeType === 'Annual Charges').reduce((acc, curr) => acc + curr.amount, 0);

    const excluded = ['Tuition Fee', 'Karate Fee', 'Exam Fee', 'Admission Fee', 'Annual Charges'];
    return payments.filter(p => !excluded.includes(p.feeType)).reduce((acc, curr) => acc + curr.amount, 0);
  };

  // Helper to format date for display
  const formatDateDisplay = () => {
    if (!reportData?.filterInfo) return filterType;
    
    if (reportData.filterInfo.dateRange?.humanReadable) {
      return reportData.filterInfo.dateRange.humanReadable;
    }
    
    return filterType.charAt(0).toUpperCase() + filterType.slice(1);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-4 print:p-0">
        <div className="max-w-7xl mx-auto space-y-4 print:max-w-none print:mx-0">
          {/* --- Filter UI --- */}
          <div className="bg-white p-4 rounded-lg shadow print:hidden border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Generate Report
              </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                
                {/* Filter Type Selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Report Type</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="thisYear">This Year</option>
                    <option value="specific">Specific Date</option>
                    <option value="dateRange">Date Range</option>
                    <option value="specificMonth">Specific Month</option>
                  </select>
                </div>

                {/* Dynamic Inputs */}
                <div className="md:col-span-2">
                  {filterType === 'specific' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Select Date</label>
                      <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm" required />
                    </div>
                  )}

                  {filterType === 'dateRange' && (
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
                        <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm" required />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
                        <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm" required />
                      </div>
                    </div>
                  )}

                  {filterType === 'specificMonth' && (
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                        <select value={monthFilter.month} onChange={(e) => setMonthFilter({...monthFilter, month: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm">
                          {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
                        <input type="number" value={monthFilter.year} onChange={(e) => setMonthFilter({...monthFilter, year: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm" />
                      </div>
                    </div>
                  )}

                  {['today', 'yesterday', 'thisMonth', 'lastMonth', 'thisYear'].includes(filterType) && (
                    <div className="flex items-center h-full pt-6 text-sm text-gray-500">
                      Automated date selection for {filterType.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                    </div>
                  )}
                </div>

                {/* Opening Balance */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Opening Balance (B.F)</label>
                  <input
                    type="number"
                    value={bfAmount}
                    onChange={(e) => setBfAmount(e.target.value)}
                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                      Generate Report
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!reportData || loading}
                  className={`px-4 py-2 rounded text-sm flex items-center gap-2 ${reportData && !loading ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Report
                </button>
              </div>
            </form>
          </div>

          {/* --- Loading Spinner --- */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Generating report...</p>
              </div>
            </div>
          )}

          {/* --- Report Display Area --- */}
          {!loading && reportData && (
            <div ref={printRef} className="bg-white p-4 print:p-0 rounded print:shadow-none print:border-0">
              
              {/* Header - Print Optimized */}
              <div className="text-center border-b-2 border-gray-800 pb-3 mb-4 print:pb-2 print:mb-3">
                <h1 className="text-xl print:text-2xl font-bold text-gray-900 uppercase tracking-tight">Cash Report</h1>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-6 mt-1 print:mt-2 text-xs print:text-sm text-gray-600">
                  <span className="font-medium">Period: {formatDateDisplay()}</span>
                  <span className="font-medium">Generated: {new Date().toLocaleDateString()}</span>
                  <span className="font-medium">Report ID: {reportData.campusId?.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              {/* Top Summary Cards - Print Optimized */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 print:mb-3">
                <div className="p-2 border border-gray-300 rounded print:p-2">
                  <p className="text-xs print:text-xs text-gray-500 uppercase font-semibold">Brought Forward</p>
                  <p className="text-base print:text-lg font-bold text-gray-800">{formatCurrency(reportData.calculations.bfAmount)}</p>
                </div>
                <div className="p-2 bg-green-50 border border-green-200 rounded print:p-2">
                  <p className="text-xs print:text-xs text-green-600 uppercase font-semibold">Total Income</p>
                  <p className="text-base print:text-lg font-bold text-green-700">{formatCurrency(reportData.income.totalIncome)}</p>
                </div>
                <div className="p-2 bg-red-50 border border-red-200 rounded print:p-2">
                  <p className="text-xs print:text-xs text-red-600 uppercase font-semibold">Total Expense</p>
                  <p className="text-base print:text-lg font-bold text-red-700">{formatCurrency(reportData.expenses.totalExpense)}</p>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded print:p-2">
                  <p className="text-xs print:text-xs text-blue-600 uppercase font-semibold">Cash In Hand</p>
                  <p className="text-lg print:text-xl font-bold text-blue-800">{formatCurrency(reportData.calculations.cashInHand)}</p>
                </div>
              </div>

              {/* Middle Section - Print Optimized */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:mb-3">
                
                {/* Income Head-wise */}
                <div className="break-inside-avoid">
                  <h3 className="text-xs print:text-sm font-bold bg-gray-100 p-2 mb-1 border-l-4 border-gray-800">Income Breakdown (Head-wise)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs print:text-xs">
                      <tbody>
                        {Object.entries(reportData.income.breakdown).map(([key, value]) => (
                          value > 0 && (
                            <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-1 px-2 capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                              <td className="py-1 px-2 text-right font-medium">{formatCurrency(value)}</td>
                            </tr>
                          )
                        ))}
                        <tr className="bg-gray-100 font-bold">
                          <td className="py-2 px-2 text-gray-900">Total Collected</td>
                          <td className="py-2 px-2 text-right text-gray-900">{formatCurrency(reportData.income.totalIncome)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Class Wise Summary */}
                <div className="break-inside-avoid">
                  <h3 className="text-xs print:text-sm font-bold bg-gray-100 p-2 mb-1 border-l-4 border-gray-800">Class Wise Collection</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs print:text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-2 py-1 text-left font-medium text-gray-700">Class Name</th>
                          <th className="px-2 py-1 text-center font-medium text-gray-700">Students</th>
                          <th className="px-2 py-1 text-right font-medium text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.classWiseSummary.map((cls, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-2 py-1 font-medium text-gray-800">{cls.className}</td>
                            <td className="px-2 py-1 text-center">{cls.studentCount}</td>
                            <td className="px-2 py-1 text-right font-medium">{formatCurrency(cls.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Detailed Student List - Print Optimized */}
              <div className="mb-4 print:mb-3 break-inside-avoid">
                <h3 className="text-xs print:text-sm font-bold bg-gray-800 text-white p-2">Detailed Student Collection</h3>
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full min-w-full text-xs print:text-xs border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 border font-medium">#</th>
                        <th className="px-2 py-1 border font-medium">Student Info</th>
                        <th className="px-2 py-1 border font-medium text-center">Class</th>
                        <th className="px-2 py-1 border font-medium text-right">Tuition</th>
                        <th className="px-2 py-1 border font-medium text-right">Karate</th>
                        <th className="px-2 py-1 border font-medium text-right">Annual</th>
                        <th className="px-2 py-1 border font-medium text-right">Admission</th>
                        <th className="px-2 py-1 border font-medium text-right">Exam</th>
                        <th className="px-2 py-1 border font-medium text-right">Others</th>
                        <th className="px-2 py-1 border font-medium text-right bg-gray-100">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.studentWiseCollection.map((student, index) => {
                        const tuitionAmt = calculateFeeCategory(student.payments, 'Tuition');
                        const karateAmt = calculateFeeCategory(student.payments, 'Karate');
                        const annualAmt = calculateFeeCategory(student.payments, 'Annual');
                        const admissionAmt = calculateFeeCategory(student.payments, 'Admission');
                        const examAmt = calculateFeeCategory(student.payments, 'Exam');
                        
                        const otherAmt = calculateFeeCategory(student.payments, 'Others');
                        const recId = student.payments?.[0]?.recordId?.slice(-4).toUpperCase() || (index + 1).toString().padStart(3, '0');

                        return (
                          <tr key={index} className="hover:bg-gray-50 print:hover:bg-white">
                            <td className="px-2 py-1 border text-gray-600 font-mono">{recId}</td>
                            <td className="px-2 py-1 border">
                              <div>
                                <p className="font-medium text-gray-800">{student.studentName}</p>
                                <p className="text-[10px] print:text-[9px] text-gray-500">Father: {student.fatherName}</p>
                              </div>
                            </td>
                            <td className="px-2 py-1 border text-center">{student.className}</td>
                            <td className="px-2 py-1 border text-right">{tuitionAmt > 0 ? formatCurrency(tuitionAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right">{karateAmt > 0 ? formatCurrency(karateAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right">{annualAmt > 0 ? formatCurrency(annualAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right">{examAmt > 0 ? formatCurrency(examAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right">{admissionAmt > 0 ? formatCurrency(admissionAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right">{otherAmt > 0 ? formatCurrency(otherAmt) : '-'}</td>
                            <td className="px-2 py-1 border text-right font-bold bg-gray-50">{formatCurrency(student.totalPaid)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan="7" className="px-2 py-1 border text-right font-bold">Total Collection:</td>
                        <td className="px-2 py-1 border text-right font-bold text-green-700">{formatCurrency(reportData.income.totalIncome)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Expenses Section - Print Optimized */}
              <div className="mb-4 print:mb-3 break-inside-avoid">
                <h3 className="text-xs print:text-sm font-bold bg-gray-800 text-white p-2">Expenses Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs print:text-xs border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 border font-medium">Expense Title</th>
                        <th className="px-2 py-1 border font-medium">Description</th>
                        <th className="px-2 py-1 border font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.expenses.details.length > 0 ? (
                        reportData.expenses.details.map((exp, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-red-50">
                            <td className="px-2 py-1 border font-medium text-gray-800">{exp.title}</td>
                            <td className="px-2 py-1 border text-gray-600 text-xs">{exp.description || '-'}</td>
                            <td className="px-2 py-1 border text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-2 py-2 border text-center text-gray-500">No expenses recorded for this period.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan="2" className="px-2 py-1 border text-right font-bold">Total Expense:</td>
                        <td className="px-2 py-1 border text-right font-bold text-red-700">{formatCurrency(reportData.expenses.totalExpense)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Final Calculation - Print Optimized */}
              <div className="mt-4 print:mt-6 pt-3 print:pt-4 border-t-2 border-gray-800">
                <div className="max-w-md ml-auto">
                  <div className="bg-gray-50 p-3 print:p-4 border border-gray-200 rounded">
                    <div className="space-y-1 print:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs print:text-sm text-gray-600">Brought Forward:</span>
                        <span className="text-xs print:text-sm font-medium">{formatCurrency(reportData.calculations.bfAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs print:text-sm text-gray-600">+ Total Income:</span>
                        <span className="text-xs print:text-sm font-medium text-green-600">{formatCurrency(reportData.income.totalIncome)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs print:text-sm text-gray-600">- Total Expense:</span>
                        <span className="text-xs print:text-sm font-medium text-red-600">{formatCurrency(reportData.expenses.totalExpense)}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 print:pt-3 mt-2 print:mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm print:text-base font-bold text-gray-900">Net Cash In Hand:</span>
                          <span className={`text-base print:text-lg font-bold ${reportData.calculations.cashInHand < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(reportData.calculations.cashInHand)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Section - Print Optimized */}
              {reportData.statistics && (
                <div className="mt-4 print:mt-6 pt-3 print:pt-4 border-t border-gray-300">
                  <h3 className="text-xs print:text-sm font-bold mb-2">Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs print:text-xs">
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-medium text-gray-600 mb-1">Highest Paying Student</p>
                      <p className="font-bold text-gray-900">{reportData.statistics.highestPayingStudent?.studentName}</p>
                      <p className="text-gray-500">Class: {reportData.statistics.highestPayingStudent?.className}</p>
                      <p className="text-green-600 font-medium">Amount: {formatCurrency(reportData.statistics.highestPayingStudent?.totalPaid)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border">
                      <p className="font-medium text-gray-600 mb-1">Highest Collection Class</p>
                      <p className="font-bold text-gray-900 text-xl">{reportData.statistics.highestCollectionClass}</p>
                      <p className="text-gray-500">Total Students: {reportData.summary?.totalStudentsPaid}</p>
                      <p className="text-blue-600 font-medium">Total Payments: {reportData.summary?.totalPayments}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Signatures - Only for Print */}
              <div className="hidden print:block mt-8 print:mt-12 pt-4 print:pt-6 border-t border-gray-300">
                <div className="flex justify-between">
                  <div className="text-center" style={{width: '200px'}}>
                    <div className="border-t border-gray-400 mt-8 pt-2">
                      <p className="text-xs font-medium">Accountant Signature</p>
                    </div>
                  </div>
                  <div className="text-center" style={{width: '200px'}}>
                    <div className="border-t border-gray-400 mt-8 pt-2">
                      <p className="text-xs font-medium">Principal Signature</p>
                    </div>
                  </div>
                  <div className="text-center" style={{width: '200px'}}>
                    <div className="border-t border-gray-400 mt-8 pt-2">
                      <p className="text-xs font-medium">School Stamp</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          table {
            page-break-inside: auto !important;
          }
          
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          thead {
            display: table-header-group !important;
          }
          
          tfoot {
            display: table-footer-group !important;
          }
          
          .break-inside-avoid {
            page-break-inside: avoid !important;
          }
        }
        
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

    </AppLayout>
  );
}