'use client';

import { useEffect, useState, useRef } from "react";
import AppLayout from "../../../components/AppLayout";
import { dailyExpenseReport, dailyFeeReport } from "../../../services/reportServices";

export default function ReportPage() {
  const [expense, setExpense] = useState(null);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expense"); // expense | fee
  
  // ریفرینس بنائیں پرنٹ کرنے والے عنصر کے لیے
  const contentRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const expenseRes = await dailyExpenseReport();
      const feeRes = await dailyFeeReport();
      setExpense(expenseRes);
      setFee(feeRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!contentRef.current) return;
    
    // اصلی صفحے کی HTML محفوظ کریں
    const originalContents = document.body.innerHTML;
    
    // صرف مطلوبہ حصے کی HTML لیں
    const printContents = contentRef.current.innerHTML;
    
    // پرنٹ لیے نئے HTML ڈاکیومنٹ بنائیں
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .no-print { display: none !important; }
              .print-header { margin-bottom: 20px; text-align: center; }
              .print-header h1 { margin: 0 0 10px 0; font-size: 24px; }
              .print-header p { margin: 0; color: #666; }
              .summary-grid { display: flex; justify-content: space-between; margin: 20px 0; }
              .summary-item { text-align: center; }
              .total-amount { color: red; font-weight: bold; }
              .paid-amount { color: green; font-weight: bold; }
            }
            @media screen {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${activeTab === 'expense' ? 'Daily Expense Report' : 'Daily Fee Report'}</h1>
            <p>Report Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="print-content">
            ${printContents}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="p-6">Loading daily report...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* TOP BUTTONS */}
        <div className="flex justify-between items-center print:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("expense")}
              className={`px-4 py-2 rounded ${
                activeTab === "expense"
                  ? "bg-black text-white"
                  : "bg-gray-200"
              }`}
            >
              Daily Expenses
            </button>

            <button
              onClick={() => setActiveTab("fee")}
              className={`px-4 py-2 rounded ${
                activeTab === "fee"
                  ? "bg-black text-white"
                  : "bg-gray-200"
              }`}
            >
              Daily Fee Report
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Print
            </button>
          </div>
        </div>

        {/* CONTENT - یہی حصہ پرنٹ ہوگا */}
        <div 
          ref={contentRef} 
          className="bg-white p-6 rounded-lg shadow space-y-6"
        >
          {/* EXPENSE TAB */}
          {activeTab === "expense" && expense && (
            <>
              <h2 className="text-xl font-semibold print:hidden">
                Daily Expense Summary
              </h2>

              <div className="grid grid-cols-3 gap-4 text-sm print:flex print:justify-between">
                <div className="summary-item">
                  <p className="text-gray-500">Total Expense</p>
                  <p className="text-lg font-bold text-red-600 total-amount">
                    Rs {expense.totalAmount}
                  </p>
                </div>
                <div className="summary-item">
                  <p className="text-gray-500">Total Entries</p>
                  <p className="text-lg font-bold">{expense.count}</p>
                </div>
                <div className="summary-item">
                  <p className="text-gray-500">Report Date</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <table className="w-full border text-sm mt-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Title</th>
                    <th className="border p-2 text-right">Amount</th>
                    <th className="border p-2 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.data.map(item => (
                    <tr key={item._id}>
                      <td className="border p-2">{item.title}</td>
                      <td className="border p-2 text-right">
                        Rs {item.amount}
                      </td>
                      <td className="border p-2 text-right">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* FEE TAB */}
          {activeTab === "fee" && fee && (
            <>
              <h2 className="text-xl font-semibold print:hidden">
                Daily Fee Report
              </h2>

              <div className="grid grid-cols-4 gap-4 text-sm print:flex print:justify-between">
                <div className="summary-item">
                  <p className="text-gray-500">Paid Invoices</p>
                  <p className="text-lg font-bold">
                    {fee.count.paidInvoices}
                  </p>
                </div>
                <div className="summary-item">
                  <p className="text-gray-500">Defaulters</p>
                  <p className="text-lg font-bold">
                    {fee.count.defaulters}
                  </p>
                </div>
                <div className="summary-item">
                  <p className="text-gray-500">Total Paid</p>
                  <p className="text-lg font-bold text-green-600 paid-amount">
                    Rs {fee.totals.paidInvoicesAmount}
                  </p>
                </div>
                <div className="summary-item">
                  <p className="text-gray-500">Report Date</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <table className="w-full border text-sm mt-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Invoice</th>
                    <th className="border p-2">Student</th>
                    <th className="border p-2">Class</th>
                    <th className="border p-2">Month</th>
                    <th className="border p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fee.data.paidInvoices.map(item => (
                    <tr key={item._id}>
                      <td className="border p-2">
                        {item.invoiceNumber.slice(-6)}
                      </td>
                      <td className="border p-2">{item.studentName}</td>
                      <td className="border p-2">{item.className}</td>
                      <td className="border p-2">{item.feeMonth}</td>
                      <td className="border p-2 text-right">
                        Rs {item.feeId.allTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}