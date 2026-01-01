'use client';

import { useState, useEffect, useRef } from 'react';
import AppLayout from "../../components/AppLayout";
import { getDailyReportAPI } from "../../Services/reportServices";

export default function ReportsDetails() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bfAmount: "",
  });

  const printRef = useRef();

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Simulating API call with your provided JSON for testing if needed
      // const response = mockResponse; 
      const response = await getDailyReportAPI(formData);
      setReportData(response);
    } catch (error) {
      console.error(error);
      alert("Report load nahi ho saka");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'bfAmount' ? Number(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Filters - Hidden on Print */}
          <div className="bg-white p-6 rounded shadow print-hide">
            <h1 className="text-xl font-bold mb-4 text-gray-800">Generate Daily Report</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Select Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Brought Forward (Opening Balance)</label>
                <input
                  type="number"
                  name="bfAmount"
                  value={formData.bfAmount}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded transition-colors"
                >
                  Load Data
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                >
                  Print Report
                </button>
              </div>
            </form>
          </div>

          {/* Report Display Area */}
          {loading && <div className="text-center py-10 text-gray-500">Generating Report...</div>}

          {!loading && reportData && (
            <div ref={printRef} className="bg-white p-8 rounded shadow print-area">
              
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">Daily Cash Report</h2>
                <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600 font-medium">
                   <span>Date: {reportData.reportDate}</span>
                   <span>Report ID: #{reportData.campusId.slice(-6).toUpperCase()}</span>
                </div>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                <div className="p-3 bg-gray-50 border rounded">
                    <p className="text-xs text-gray-500 uppercase">Brought Forward</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(reportData.bfAmount)}</p>
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
                    <p className="text-xl font-bold text-blue-800">{formatCurrency(reportData.cashInHand)}</p>
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
                                        <td className="py-1 capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
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
                                <th className="px-3 py-2 border-b">Inv #</th>
                                <th className="px-3 py-2 border-b">Student Info</th>
                                <th className="px-3 py-2 border-b">Class</th>
                                <th className="px-3 py-2 border-b text-right">Tuition</th>
                                <th className="px-3 py-2 border-b text-right">Books</th>
                                <th className="px-3 py-2 border-b text-right">Exam</th>
                                <th className="px-3 py-2 border-b text-right">Others</th>
                                <th className="px-3 py-2 border-b text-right bg-gray-50">Total Paid</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reportData.studentWiseCollection.map((student, index) => {
                                // Calculate "Others" by subtracting main fees from total or summing minor keys
                                const details = student.feeDetails;
                                const otherFees = (details.registrationFee || 0) + (details.labFee || 0) + (details.artCraftFee || 0) + (details.karateFee || 0) + (details.lateFeeFine || 0);

                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-500">{student.invoiceNumber.split('-').pop()}</td>
                                        <td className="px-3 py-2">
                                            <p className="font-bold text-gray-800">{student.studentName}</p>
                                            <p className="text-[10px] text-gray-500">F: {student.fatherName}</p>
                                        </td>
                                        <td className="px-3 py-2">{student.className}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{details.tutionFee > 0 ? details.tutionFee : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{details.booksCharges > 0 ? details.booksCharges : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{details.examFee > 0 ? details.examFee : '-'}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{otherFees > 0 ? otherFees : '-'}</td>
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
                <h3 className="text-sm font-bold bg-gray-800 text-white p-2 mb-0">Daily Expenses</h3>
                <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left border-b">Expense Title</th>
                            <th className="px-4 py-2 text-left border-b">Time</th>
                            <th className="px-4 py-2 text-right border-b">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {reportData.expenses.details.length > 0 ? (
                            reportData.expenses.details.map((exp, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 font-medium text-gray-800">{exp.title}</td>
                                    <td className="px-4 py-2 text-gray-500 text-xs">
                                        {new Date(exp.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold text-red-600">{formatCurrency(exp.amount)}</td>
                                </tr>
                            ))
                            
                        ) : (
                            <tr><td colSpan="3" className="text-center py-2 text-gray-500">No expenses recorded today.</td></tr>
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
                        <span>{formatCurrency(reportData.bfAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>+ Today&apos;s Income:</span>
                        <span>{formatCurrency(reportData.income.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-300 pb-2">
                        <span>- Today&apos;s Expense:</span>
                        <span>{formatCurrency(reportData.expenses.totalExpense)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-1">
                        <span>Net Cash In Hand:</span>
                        <span>{formatCurrency(reportData.cashInHand)}</span>
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