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
  }, []); // Initial load (defaults to Today)

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);
  };

  // Helper to calculate fee categories from the payments array
  const calculateFeeCategory = (payments, type) => {
    if (!payments) return 0;
    // Specific Logic for Columns
    if (type === 'Tuition') return payments.filter(p => p.feeType === 'Tuition Fee').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Books') return payments.filter(p => p.feeType === 'Books Charges').reduce((acc, curr) => acc + curr.amount, 0);
    if (type === 'Exam') return payments.filter(p => p.feeType === 'Exam Fee').reduce((acc, curr) => acc + curr.amount, 0);
    
    // "Others" includes everything NOT in the above list
    const excluded = ['Tuition Fee', 'Books Charges', 'Exam Fee'];
    return payments.filter(p => !excluded.includes(p.feeType)).reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* --- New Filter UI --- */}
          <div className="bg-white p-6 rounded-lg shadow-md print-hide border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Generate Report
              </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. Filter Type Selector */}
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</label>
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
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

                {/* 2. Dynamic Inputs based on Filter Type */}
                <div className="col-span-1 md:col-span-2">
                  {/* Specific Date */}
                  {filterType === 'specific' && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Date</label>
                      <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                  )}

                  {/* Date Range */}
                  {filterType === 'dateRange' && (
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</label>
                        <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</label>
                        <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required />
                      </div>
                    </div>
                  )}

                  {/* Specific Month */}
                  {filterType === 'specificMonth' && (
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</label>
                        <select value={monthFilter.month} onChange={(e) => setMonthFilter({...monthFilter, month: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md outline-none">
                          {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</label>
                        <input type="number" value={monthFilter.year} onChange={(e) => setMonthFilter({...monthFilter, year: e.target.value})} className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md outline-none" />
                      </div>
                    </div>
                  )}

                  {/* Placeholder for preset filters */}
                  {['today', 'yesterday', 'thisMonth', 'lastMonth', 'thisYear'].includes(filterType) && (
                    <div className="flex items-center h-full pt-6 text-sm text-gray-400 italic">
                      Automated date selection for {filterType.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                    </div>
                  )}
                </div>

                {/* 3. Opening Balance */}
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opening Balance (B.F)</label>
                  <input
                    type="number"
                    value={bfAmount}
                    onChange={(e) => setBfAmount(e.target.value)}
                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Generate Report
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!reportData}
                  className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${reportData ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Report
                </button>
              </div>
            </form>
          </div>

          {/* --- Report Display Area --- */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && reportData && (
            <div ref={printRef} className="bg-white p-8 rounded shadow print-area">
              
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">Cash Report</h2>
                <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 font-medium">
                   {/* Uses filterInfo from new API response */}
                   <span>Period: {reportData.filterInfo?.dateRange?.humanReadable || filterType}</span>
                   <span>Report ID: #{reportData.campusId?.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Brought Forward</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(reportData.calculations.bfAmount)}</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-100 rounded">
                    <p className="text-xs text-green-600 uppercase">Total Income</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(reportData.income.totalIncome)}</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-100 rounded">
                    <p className="text-xs text-red-600 uppercase">Total Expense</p>
                    <p className="text-lg font-bold text-red-700">{formatCurrency(reportData.expenses.totalExpense)}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                    <p className="text-xs text-blue-600 uppercase">Cash In Hand</p>
                    <p className="text-xl font-bold text-blue-800">{formatCurrency(reportData.calculations.cashInHand)}</p>
                </div>
              </div>

              {/* Middle Section: Income Breakdown & Class Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Income Head-wise */}
                <div>
                    <h3 className="text-sm font-bold bg-gray-200 p-2 mb-2 border-l-4 border-gray-800">Income Breakdown (Head-wise)</h3>
                    <table className="w-full text-sm border-collapse">
                        <tbody>
                            {Object.entries(reportData.income.breakdown).map(([key, value]) => (
                                value > 0 && (
                                    <tr key={key} className="border-b border-gray-100">
                                        <td className="py-1 capitalize text-gray-600">{key}</td>
                                        <td className="py-1 text-right font-medium">{formatCurrency(value)}</td>
                                    </tr>
                                )
                            ))}
                            <tr className="bg-gray-50 font-bold">
                                <td className="py-2">Total Collected</td>
                                <td className="py-2 text-right">{formatCurrency(reportData.income.totalIncome)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Class Wise Summary */}
                <div>
                    <h3 className="text-sm font-bold bg-gray-200 p-2 mb-2 border-l-4 border-gray-800">Class Wise Collection</h3>
                    <table className="w-full text-sm border-collapse">
                        <thead className="text-left text-gray-500 border-b">
                            <tr>
                                <th className="pb-1 font-medium">Class Name</th>
                                <th className="pb-1 font-medium text-center">Students</th>
                                <th className="pb-1 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.classWiseSummary.map((cls, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-1 text-gray-800">{cls.className}</td>
                                    <td className="py-1 text-center">{cls.studentCount}</td>
                                    <td className="py-1 text-right font-medium">{formatCurrency(cls.totalAmount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>

              {/* Detailed Student List */}
              <div className="mb-8">
                <h3 className="text-sm font-bold bg-gray-800 text-white p-2 mb-0">Detailed Student Collection</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-3 py-2 border-b">Rec #</th>
                                <th className="px-3 py-2 border-b">Student Info</th>
                                <th className="px-3 py-2 border-b">Class</th>
                                <th className="px-3 py-2 border-b text-right">Tuition</th>
                                <th className="px-3 py-2 border-b text-right">Books</th>
                                <th className="px-3 py-2 border-b text-right">Exam</th>
                                <th className="px-3 py-2 border-b text-right">Others</th>
                                <th className="px-3 py-2 border-b text-right bg-gray-50">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.studentWiseCollection.map((student, index) => {
                                // Calculate columns dynamically based on payments array
                                const tuitionAmt = calculateFeeCategory(student.payments, 'Tuition');
                                const booksAmt = calculateFeeCategory(student.payments, 'Books');
                                const examAmt = calculateFeeCategory(student.payments, 'Exam');
                                const otherAmt = calculateFeeCategory(student.payments, 'Others');

                                // Get Record ID (using first payment's record ID as reference or generating one)
                                const recId = student.payments?.[0]?.recordId?.slice(-4).toUpperCase() || index + 1;

                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-500">...{recId}</td>
                                        <td className="px-3 py-2">
                                            <p className="font-bold text-gray-800">{student.studentName}</p>
                                            <p className="text-[10px] text-gray-500">F: {student.fatherName}</p>
                                        </td>
                                        <td className="px-3 py-2">{student.className}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{tuitionAmt > 0 ? tuitionAmt : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{booksAmt > 0 ? booksAmt : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{examAmt > 0 ? examAmt : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{otherAmt > 0 ? otherAmt : '-'}</td>
                                        <td className="px-3 py-2 text-right font-bold text-gray-900 bg-gray-50">{formatCurrency(student.totalPaid)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                            <tr>
                                <td colSpan="7" className="px-3 py-2 text-right">Total Collection:</td>
                                <td className="px-3 py-2 text-right text-green-700">{formatCurrency(reportData.income.totalIncome)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold bg-gray-800 text-white p-2 mb-0">Expenses</h3>
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left border-b">Expense Title</th>
                            <th className="px-4 py-2 text-left border-b">Time/Date</th>
                            <th className="px-4 py-2 text-right border-b">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {reportData.expenses.details.length > 0 ? (
                            reportData.expenses.details.map((exp, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                      {exp.title}
                                      {exp.description && <span className="text-gray-500 text-xs ml-2">({exp.description})</span>}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500 text-xs">
                                        {new Date(exp.time).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center py-2 text-gray-500">No expenses recorded for this period.</td></tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                        <tr>
                           <td colSpan="2" className="px-4 py-2 text-right">Total Expense:</td>
                           <td className="px-4 py-2 text-right text-red-700">{formatCurrency(reportData.expenses.totalExpense)}</td> 
                        </tr>
                    </tfoot>
                </table>
              </div>

              {/* Final Footer Calculation */}
              <div className="mt-8 border-t-2 border-gray-800 pt-4 flex justify-end">
                <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Brought Forward:</span>
                        <span>{formatCurrency(reportData.calculations.bfAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>+ Total Income:</span>
                        <span>{formatCurrency(reportData.income.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-300 pb-2">
                        <span>- Total Expense:</span>
                        <span>{formatCurrency(reportData.expenses.totalExpense)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-1">
                        <span>Net Cash In Hand:</span>
                        <span className={reportData.calculations.cashInHand < 0 ? 'text-red-600' : 'text-gray-900'}>
                          {formatCurrency(reportData.calculations.cashInHand)}
                        </span>
                    </div>
                </div>
              </div>

              {/* Signatures Area for Print */}
              <div className="hidden print:flex justify-between mt-16 pt-8">
                 <div className="border-t border-gray-400 w-1/4 text-center text-sm text-gray-600">Accountant Signature</div>
                 <div className="border-t border-gray-400 w-1/4 text-center text-sm text-gray-600">Principal Signature</div>
              </div>

            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { -webkit-print-color-adjust: exact; }
          .print-hide { display: none !important; }
          .print-area { 
            box-shadow: none; 
            padding: 0; 
            width: 100%;
          }
        }
      `}</style>

    </AppLayout>
  );
}