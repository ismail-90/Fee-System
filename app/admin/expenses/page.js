"use client";

import React, { useState, useEffect } from "react";
import { addExpenseAPI } from "../../../Services/feeService";
import api from "../../../Services/api";
import AppLayout from "../../../components/AppLayout";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return setError("Title is required");
    if (!amount || amount <= 0) return setError("Enter valid amount");

    setSubmitting(true);
    try {
      await addExpenseAPI({ title, amount: Number(amount) });
      setTitle("");
      setAmount("");
      fetchExpenses();
      setOpen(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
    <div className="flex min-h-screen bg-gray-100 relative">


      {/* Dim Background Blur */}
      {open && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40"></div>
      )}

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>

          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
          >
            + Create Expense
          </button>
        </div>

        {/* Modern Floating Popup */}
        {open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn scale-95 opacity-0 animate-popup relative">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create Expense</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-gray-700">Title</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                    placeholder="e.g. Stationery"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-gray-700">Amount</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                    type="number"
                    placeholder="5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">All Expenses</h2>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((exp) => (
              <div
                key={exp._id}
                className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition border-l-4 border-indigo-600"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">{exp.title}</h3>
                <p className="text-gray-700 font-medium">Amount: PKR {exp.amount}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(exp.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes popup {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-popup {
          animation: popup 0.2s ease-out forwards;
        }
      `}</style>
    </div>
    </AppLayout>
  );
}
