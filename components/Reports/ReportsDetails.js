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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Filters */}
          <div className="bg-white p-6 rounded shadow print-hide">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Brought Forward</label>
                <input
                  type="number"
                  name="bfAmount"
                  value={formData.bfAmount}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="w-full bg-gray-800 text-white py-2 rounded"
                >
                  Load Report
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  Print
                </button>
              </div>
            </form>
          </div>

          {/* Report */}
          {loading && <p className="text-center">Loading...</p>}

          {!loading && reportData && (
            <div
              ref={printRef}
              className="bg-white p-8 rounded shadow space-y-4 print-area"
            >
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold">Daily Cash Report</h2>
                <p className="text-sm text-gray-600">
                  Date: {reportData.reportDate}
                </p>
              </div>

              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span>Brought Forward</span>
                  <span>Rs. {reportData.bfAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Income</span>
                  <span>Rs. {reportData.income.totalIncome}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Expense</span>
                  <span>Rs. {reportData.expenses.totalExpense}</span>
                </div>

                <div className="flex justify-between">
                  <span>Remaining Amount</span>
                  <span>Rs. {reportData.remainingAmount}</span>
                </div>

                <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3">
                  <span>Cash In Hand</span>
                  <span>Rs. {reportData.cashInHand}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
  @media print {
    body * {
      visibility: hidden;
    }

    .print-area,
    .print-area * {
      visibility: visible;
    }

    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px;
      box-shadow: none;
    }

    .print-hide {
      display: none !important;
    }
  }
`}</style>

    </AppLayout>
  );
}
