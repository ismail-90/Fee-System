'use client';
import { Edit, Loader2 } from "lucide-react";

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  onEdit,
  studentRecord,
  loading = false
}) {
  if (!isOpen || !student) return null;

  const studentInfo = studentRecord?.data?.studentInfo || {};
  const monthlySummary = studentRecord?.data?.monthlySummary || [];
  const invoicePaymentHistory = studentRecord?.data?.invoicePaymentHistory || [];
  const totals = studentRecord?.data?.totals || {};

  const getMonthName = (month) => {
    const map = {
      jan: 'January', feb: 'February', mar: 'March', apr: 'April',
      may: 'May', jun: 'June', jul: 'July', aug: 'August',
      sep: 'September', oct: 'October', nov: 'November', dec: 'December'
    };
    return map[month] || month;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {student.studentName} • {student.className}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black text-2xl p-1 hover:bg-gray-100 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 mt-4">Loading student details...</p>
            </div>
          </div>
        ) : studentRecord ? (
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-medium">{studentInfo.studentId || student.studentId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{studentInfo.studentName || student.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium">{studentInfo.className || student.className}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${totals.totalRemaining > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {totals.totalRemaining > 0 ? '⚠️ Defaulter' : '✅ Clear'}
                  </span>
                </div>
              </div>
            </div>

            {/* Totals Summary */}
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-green-600 rounded"></span>
                Fee Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 text-center">
                  <div className="text-3xl font-bold text-green-700">Rs. {totals.totalPaid || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Paid</div>
                </div>
                <div className={`border rounded-xl p-5 text-center ${totals.totalRemaining > 0 ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
                  <div className={`text-3xl font-bold ${totals.totalRemaining > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    Rs. {totals.totalRemaining || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Remaining</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5 text-center">
                  <div className="text-3xl font-bold text-blue-700">{totals.totalInvoices || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Invoices</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl p-5 text-center">
                  <div className="text-3xl font-bold text-purple-700">{totals.totalPaymentAttempts || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Payment Attempts</div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            {monthlySummary.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-600 rounded"></span>
                  Monthly Breakdown
                </h3>
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left font-medium text-gray-700">Month</th>
                        <th className="p-3 text-left font-medium text-gray-700">Tuition Fee</th>
                        <th className="p-3 text-left font-medium text-gray-700">Exam Fee</th>
                        <th className="p-3 text-left font-medium text-gray-700">Lab Fee</th>
                        <th className="p-3 text-left font-medium text-gray-700">Paid</th>
                        <th className="p-3 text-left font-medium text-gray-700">Remaining</th>
                        <th className="p-3 text-left font-medium text-gray-700">Total</th>
                        <th className="p-3 text-left font-medium text-gray-700">Invoices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummary.map((m, i) => {
                        const fees = m.feesBreakdown || {};
                        const total = (m.paidThisMonth || 0) + (m.remainingThisMonth || 0);
                        
                        return (
                          <tr key={i} className="border-t hover:bg-gray-50 transition">
                            <td className="p-3 font-medium">{getMonthName(m.month)}</td>
                            <td className="p-3">Rs. {fees.tutionFee || 0}</td>
                            <td className="p-3">Rs. {fees.examFee || 0}</td>
                            <td className="p-3">Rs. {fees.labFee || 0}</td>
                            <td className="p-3 font-medium text-green-600">Rs. {m.paidThisMonth || 0}</td>
                            <td className="p-3 font-medium text-red-600">Rs. {m.remainingThisMonth || 0}</td>
                            <td className="p-3 font-bold">Rs. {total}</td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {m.invoices || 0}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invoice Payment History */}
            {invoicePaymentHistory.length > 0 && (
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-600 rounded"></span>
                  Invoice Payment History
                </h3>
                <div className="space-y-4">
                  {invoicePaymentHistory.map((invoice, index) => (
                    <div key={index} className="border rounded-xl overflow-hidden hover:shadow-md transition">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-medium text-gray-800">{invoice.invoiceNumber}</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {getMonthName(invoice.feeMonth)}
                            </span>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${invoice.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {invoice.paymentStatus}
                            </span>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${invoice.defaulterStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {invoice.defaulterStatus}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Generated: {formatDate(invoice.invoiceGenerated)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <p className="text-sm text-gray-600">Class</p>
                            <p className="font-medium text-lg">{invoice.className}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Paid</p>
                            <p className="font-medium text-lg text-green-600">Rs. {invoice.totalPaid}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Last Payment</p>
                            <p className="font-medium">{formatDate(invoice.lastPayment)}</p>
                          </div>
                        </div>
                        
                        {invoice.paymentAttempts?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">Payment Attempts ({invoice.paymentAttempts.length})</h4>
                            <div className="space-y-3">
                              {invoice.paymentAttempts.map((attempt, idx) => (
                                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/50 rounded-r">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                      <span className="font-medium">Attempt #{attempt.attemptNumber}</span>
                                      <span className="ml-4 text-sm text-gray-600">
                                        {formatDate(attempt.date)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-green-600 font-medium">Rs. {attempt.amount}</span>
                                      <span className={`text-sm px-2 py-1 rounded ${attempt.remainingBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        Balance: Rs. {attempt.remainingBalance}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!studentRecord && (
              <div className="text-center py-10">
                <p className="text-gray-500">No detailed record found for this student.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No detailed record available</p>
            <p className="text-sm text-gray-500">This student doesn&apos;t have detailed fee records yet.</p>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
          >
            Close
          </button>
     
        </div>
      </div>
    </div>
  );
}