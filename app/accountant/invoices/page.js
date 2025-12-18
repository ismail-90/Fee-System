'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  DollarSign,
  Download
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI } from "@/Services/invoiceService";
import AppLayout from "../../../components/AppLayout";

export default function Invoices() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("unpaid"); // unpaid or paid
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }
    fetchInvoices();
  }, [user, loading, activeTab]);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const status = activeTab === "unpaid" ? "unPaid" : "paid";
      const res = await getInvoicesByStatusAPI(status);
      setInvoices(res.data || []);
      setFilteredInvoices(res.data || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Apply search filter
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

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.feeId?.allTotal?.toString() || "");
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (!selectedInvoice) return;

    setProcessingPayment(true);
    try {
      const paymentData = {
        invoiceId: selectedInvoice.invoiceId,
        amount: parseFloat(paymentAmount)
      };

      const response = await payInvoiceAPI(paymentData);
      
      if (response.success) {
        alert("✅ Payment successful!");
        setShowPaymentModal(false);
        fetchInvoices();
      } else {
        alert("Payment failed: " + (response.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Payment failed"));
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const downloadInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      window.open(invoiceUrl, '_blank');
    }
  };

  // 🔄 Loader while auth loads
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoices</h1>
          <p className="text-gray-600">Manage and process student invoices</p>
        </div>

        {/* Tabs for Paid/Unpaid */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("unpaid")}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${activeTab === "unpaid"
                  ? "bg-white border-t border-l border-r border-gray-200 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <XCircle size={16} />
                Unpaid Invoices
                {invoices.filter(inv => inv.paymentStatus === "unPaid").length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                    {invoices.filter(inv => inv.paymentStatus === "unPaid").length}
                  </span> 
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all ${activeTab === "paid"
                  ? "bg-white border-t border-l border-r border-gray-200 text-green-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                Paid Invoices
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoices by student or invoice number..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loadingInvoices ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {activeTab} invoices found</p>
              <p className="text-gray-400 mt-1">
                {activeTab === "unpaid" 
                  ? "All invoices are paid" 
                  : "No paid invoices available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fee</th>
                   
                 {activeTab === "paid" && (
      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
        Paid Amount
      </th>
    )}

    {activeTab === "paid" && (
      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">
        Remaining Balance
      </th>
    )}
                    {activeTab === "unpaid" && (
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    )}
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    {activeTab === "unpaid" && (
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

                      {/* Student Info */}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            Rs. {invoice.totalFee?.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Paid Amount */}
                      {activeTab === "paid" && (
                       <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-500">
                            Rs. {invoice.paidAmount?.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      )}
                      {/* Remaining Balance */}
                      {activeTab === "paid" && (
                       
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-500">
                            Rs. {invoice.remainingBalance?.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      )}
                    

                      {/* Date */}
                      {activeTab === "unpaid" && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-400" size={16} />
                          <span className="text-sm text-gray-600">{formatDate(invoice.createdAt)}</span>
                        </div>
                      </td>
                      )}

                      {/* Status */}
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.paymentStatus === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {invoice.paymentStatus === "paid" ? (

                            <>
                              {invoice.paymentType}
                            </>

                          ) : (
                            <>
                              <XCircle className="mr-1" size={12} />
                              Unpaid
                            </>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      {activeTab === "unpaid" && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">

                          <button
                            onClick={() => downloadInvoice(invoice.invoiceUrl)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {invoice.paymentStatus === "unPaid" && (
                            <button
                              onClick={() => handlePayInvoice(invoice)}
                              className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium px-3 py-2"
                            >
                              <CreditCard size={14} />
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Simple Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-sm">
              {/* Modal Header */}
              <div className="border-b border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Pay Invoice</h3>
                      <p className="text-sm text-gray-500">Complete payment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={processingPayment}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                <div className="space-y-4">
                  {/* Invoice Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice:</span>
                        <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Student:</span>
                        <span className="font-medium">{selectedInvoice.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Due:</span>
                        <span className="font-bold text-gray-900">
                          Rs. {selectedInvoice.totalFee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                      <input
                        type="text"
                        value={selectedInvoice.invoiceId}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max={selectedInvoice.feeId?.allTotal}
                      />
                      <p className="text-xs text-gray-500 mt-1">Max: Rs. {selectedInvoice.feeId?.allTotal?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPayment}
                  disabled={processingPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Pay Now
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