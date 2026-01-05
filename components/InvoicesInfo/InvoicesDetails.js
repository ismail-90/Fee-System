 
'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Calendar,
  User,
  Users
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI } from "../../Services/invoiceService";
import AppLayout from "../AppLayout";

export default function InvoicesDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("unpaid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);

  const calculateTotal = (amounts) => {
    const total = Object.keys(amounts).reduce((sum, key) => {
      if (key !== 'total' && amounts[key]) {
        return sum + (Number(amounts[key]) || 0);
      }
      return sum;
    }, 0);
    return total;
  };

  /* ================= AUTH GUARD (SEPARATED FOR SPEED) ================= */
  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/");
  }, [user, loading]);

  /* ================= FETCH INVOICES ================= */
  useEffect(() => {
    if (!user) return;
    fetchInvoices();
  }, [activeTab]);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const status =
        activeTab === "unpaid"
          ? "unPaid"
          : activeTab === "paid"
          ? "paid"
          : "partial";

      const res = await getInvoicesByStatusAPI(status);
      setInvoices(res.data || []);
      setFilteredInvoices(res.data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(invoice =>
      invoice.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredInvoices(filtered);
  }, [searchTerm, invoices]);

  /* ================= PAYMENT ================= */
  const handleFeeChange = (key, value) => {
    const numValue = Number(value) || 0;
    setPaymentAmount(prev => {
      const updated = { ...prev, [key]: numValue };
      updated.total = calculateTotal(updated);
      return updated;
    });
  };

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);

    const initialAmounts = {
      tutionFee: invoice.feeId?.tutionFee || 0,
      examFee: invoice.feeId?.examFee || 0,
      labFee: invoice.feeId?.labFee || 0,
      karateFee: invoice.feeId?.karateFee || 0,
      lateFeeFine: invoice.feeId?.lateFeeFine || 0,
      total: 0
    };

    initialAmounts.total = calculateTotal(initialAmounts);
    setPaymentAmount(initialAmounts);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice) return;

    const totalAmount = Number(paymentAmount.total || 0);
    if (totalAmount <= 0) {
      alert("Please enter payment amount");
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await payInvoiceAPI({
        invoiceId: selectedInvoice.invoiceId,
        amount: totalAmount,
        paymentBreakdown: { ...paymentAmount }
      });

      if (response.success) {
        alert("✅ Payment successful!");
        setShowPaymentModal(false);
        setPaymentAmount({});
        setSelectedInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      alert("Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const downloadInvoice = (url) => {
    if (url) window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-600">Manage and process student invoices</p>
        </div>

        {/* TABS */}
        <div className="mb-6">
          <div className="flex gap-2 border-b overflow-x-auto">
            {[
              { key: "unpaid", label: "Unpaid", icon: XCircle },
              { key: "partial", label: "Partial", icon: CheckCircle },
              { key: "paid", label: "Paid", icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`cursor-pointer px-6 py-3 text-sm font-medium rounded-t-lg transition
                ${activeTab === key
                    ? "bg-white border text-blue-600"
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} /> {label} Invoices
                </div>
              </button>
            ))}

            <button
              onClick={() => router.push("/accountant/bulk-invoices")}
              className="cursor-pointer px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <Users size={16} className="inline mr-1" /> Bulk Invoices
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {loadingInvoices ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
          ) : (
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fee</th>
                    {activeTab === "paid" && (
                      <>
                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Paid Amount</th>
                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Remaining Balance</th>
                      </>
                    )}
                    {activeTab === "unpaid" && (
                      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    )}
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    {(activeTab === "unpaid" || activeTab === "partial") && (
                      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      {/* Invoice Number */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-blue-500" size={16} />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500">Month: {invoice.feeMonth}</div>
                          </div>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400" size={16} />
                          <div>
                            <div className="font-medium text-gray-900">{invoice.studentName}</div>
                            <div className="text-xs text-gray-500">Class {invoice.className}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900">Rs. {invoice.totalFee?.toLocaleString()}</div>
                      </td>

                      {/* Paid Amount & Remaining */}
                      {activeTab === "paid" && (
                        <>
                          <td className="p-4 text-green-500 font-bold">Rs. {invoice.paidAmount?.toLocaleString()}</td>
                          <td className="p-4 text-red-500 font-bold">Rs. {invoice.remainingBalance?.toLocaleString()}</td>
                        </>
                      )}

                      {/* Date */}
                      {activeTab === "unpaid" && (
                        <td className="p-4 flex items-center gap-2">
                          <Calendar className="text-gray-400" size={16} />
                          <span className="text-sm text-gray-600">{formatDate(invoice.createdAt)}</span>
                        </td>
                      )}

                      {/* Status */}
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${invoice.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {invoice.paymentStatus}
                        </div>
                      </td>

                      {/* Actions */}
                     {(activeTab === "unpaid" || activeTab === "partial") && (
  <td className="p-4 flex items-center gap-2">
    <button
      onClick={() => downloadInvoice(invoice.invoiceUrl)}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="View Invoice"
    >
      <Eye size={16} />
    </button>

    {(invoice.paymentStatus === "unPaid" || invoice.paymentStatus === "partial") && (
      <button
        onClick={() => handlePayInvoice(invoice)}
        className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium px-3 py-2"
      >
        <CreditCard size={14} /> Pay
      </button>
    )}
  </td>
)}

                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>

        {/* 🔔 PAYMENT MODAL (100% SAME – ONLY cursor-pointer ADDED) */}
        {/* YOUR MODAL CODE CONTINUES EXACTLY AS YOU SENT */}
               {showPaymentModal && selectedInvoice && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
      
      {/* Header - unchanged */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-xl">
            <CreditCard className="text-green-600" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Invoice Payment</h3>
            <p className="text-xs text-gray-500">Enter payment details - Total will auto-calculate</p>
          </div>
        </div>
        <button
          onClick={() => setShowPaymentModal(false)}
          className="p-2 rounded-lg hover:bg-gray-100"
          disabled={processingPayment}
        >✕</button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Invoice ID - unchanged */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Invoice ID</label>
          <input
            value={selectedInvoice.invoiceId}
            readOnly
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600"
          />
        </div>

        {/* Total Amount (auto-calculated, read-only) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Total Amount to Pay</div>
              <div className="text-xs text-gray-500">This amount is auto-calculated from the fields below</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">Rs. {paymentAmount.total?.toLocaleString() || "0"}</div>
              <div className="text-xs text-gray-500">Auto-calculated</div>
            </div>
          </div>
        </div>

        {/* Individual Fees */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-700">Enter individual fee amounts:</div>
            <div className="text-xs text-gray-500">Total fee: Rs. {selectedInvoice.totalFee?.toLocaleString()}</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "tutionFee", label: "Tuition Fee" },
              { key: "examFee", label: "Exam Fee" },
              { key: "labFee", label: "Lab Fee" },
              { key: "karateFee", label: "Karate Fee" },
              { key: "lateFeeFine", label: "Late Fee Fine" },
            ].map(({ key, label }) => (
              <div key={key} className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
                  <input
                    type="number"
                    min="0"
                    max={selectedInvoice.feeId?.[key] || 0}
                    value={paymentAmount[key] || ""}
                    onChange={(e) => handleFeeChange(key, e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter amount"
                  />
                </div>
                {selectedInvoice.feeId?.[key] > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Due: Rs. {selectedInvoice.feeId?.[key]?.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - unchanged */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t">
        <button
          onClick={() => setShowPaymentModal(false)}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          disabled={processingPayment}
        >
          Cancel
        </button>

        <button
          onClick={handleSubmitPayment}
          disabled={processingPayment || paymentAmount.total <= 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {processingPayment ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} /> Pay Rs. {paymentAmount.total?.toLocaleString()}
            </>
          )}
        </button>
      </div>

    </div>
  </div>
)}
      </div>
    </AppLayout>
  );
}
