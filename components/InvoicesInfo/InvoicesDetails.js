'use client';
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Added these
import {
  Search, Eye, CreditCard, CheckCircle, XCircle,
  Loader2, FileText, User, Users, AlertCircle
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI } from "../../Services/invoiceService";
import AppLayout from "../AppLayout";

export default function InvoicesDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("unpaid");
  const [searchTerm, setSearchTerm] = useState("");

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});
  const [maxFeeLimits, setMaxFeeLimits] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);

   
  const { 
    data: invoices = [], 
    isLoading: loadingInvoices, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['invoices', activeTab],  
    queryFn: async () => {
      const status = activeTab === "unpaid" ? "unPaid" : activeTab === "paid" ? "paid" : "partial";
      const res = await getInvoicesByStatusAPI(status);
      return res.data || [];
    },
    enabled: !!user, 
    staleTime: 5 * 60 * 1000,  
  });

  /* ================= SEARCH FILTERING (Optimized) ================= */
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const lowerTerm = searchTerm.toLowerCase();
    return invoices.filter(invoice =>
      invoice.studentDetails?.name?.toLowerCase().includes(lowerTerm) ||
      invoice.invoiceInfo?.invoiceNumber?.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm, invoices]);

  /* ================= AUTH GUARD ================= */
  if (!authLoading && !user) {
    router.push("/");
    return null;
  }

  /* ================= LOGIC FUNCTIONS ================= */
  const calculateTotal = (amounts) => {
    return Object.keys(amounts).reduce((sum, key) => {
      if (key !== 'total' && amounts[key]) return sum + (Number(amounts[key]) || 0);
      return sum;
    }, 0);
  };

  const handleFeeChange = (key, value) => {
    let numValue = Number(value) || 0;
    const maxAllowed = maxFeeLimits[key] || 0;
    if (numValue > maxAllowed) numValue = maxAllowed;

    setPaymentAmount(prev => {
      const updated = { ...prev, [key]: numValue };
      updated.total = calculateTotal(updated);
      return updated;
    });
  };

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    const breakdown = invoice.paymentDetails?.breakdown || {};
    const limits = {
      tutionFee: breakdown.tutionFee || 0,
      labsFee: breakdown.labFee || 0,
      lateFeeFine: breakdown.lateFeeFine || 0,
      booksCharges: breakdown.booksCharges || 0,
      artCraftFee: breakdown.artCraftFee || 0,
      examFeeCurrentPaid: breakdown.examFee || 0,
      karateFeeCurrentPaid: breakdown.karateFee || 0,
      admissionFeeCurrentPaid: breakdown.admissionFee || 0,
      registrationFee: breakdown.registrationFee || 0,
      preBalance: invoice.paymentDetails?.remainingBalance 
    };
    setMaxFeeLimits(limits);
    setPaymentAmount({ ...limits, total: calculateTotal(limits) });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice) return;
    const totalAmount = Number(paymentAmount.total || 0);
    if (totalAmount <= 0) return alert("Please enter payment amount");

    setProcessingPayment(true);
    try {
      const response = await payInvoiceAPI({
        invoiceId: selectedInvoice.invoiceInfo?.id,
        amount: totalAmount,
        paymentBreakdown: { ...paymentAmount }
      });

      if (response.success) {
        alert("✅ Payment successful!");
        setShowPaymentModal(false);
        setPaymentAmount({});
        setSelectedInvoice(null);
        queryClient.invalidateQueries(['invoices']); 
      }
    } catch (err) {
      alert("Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const feeInputFields = [
    { key: "tutionFee", label: "Tuition Fee" },
    { key: "booksCharges", label: "Books Charges" },
    { key: "registrationFee", label: "Registration Fee" },
    { key: "examFeeCurrentPaid", label: "Exam Fee" },
    { key: "labsFee", label: "Labs Fee" },
    { key: "artCraftFee", label: "Art & Craft" },
    { key: "karateFeeCurrentPaid", label: "Karate Fee" },
    { key: "lateFeeFine", label: "Late Fee/Fine" },
    { key: "admissionFeeCurrentPaid", label: "Admission Fee" },
    {key: "preBalance", label: "Remaining Balance" }
  ];

  if (authLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

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
                className={`cursor-pointer px-6 py-3 text-sm font-medium rounded-t-lg transition whitespace-nowrap
                ${activeTab === key ? "bg-white border-t border-l border-r text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} /> {label} Invoices
                </div>
              </button>
            ))}
            <button onClick={() => router.push("/accountant/bulk-invoices")} className="cursor-pointer px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">
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
              placeholder="Search by name or invoice #..."
              className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {loadingInvoices ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500"><AlertCircle className="mx-auto mb-2" /><p>Error loading data. <button onClick={() => refetch()} className="underline">Retry</button></p></div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fee</th>
                  {activeTab === "paid" && (
                    <>
                      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Paid</th>
                      <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                    </>
                  )}
                  {activeTab === "unpaid" && <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>}
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  {(activeTab === "unpaid" || activeTab === "partial") && <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice, index) => {
                  const info = invoice.invoiceInfo || {};
                  const student = invoice.studentDetails || {};
                  const fees = invoice.feeDetails || {};
                  const payment = invoice.paymentDetails || {};
                  return (
                    <tr key={info.id || index} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={16} /></div>
                          <div><div className="font-medium text-gray-900 text-sm">{info.invoiceNumber}</div><div className="text-xs text-gray-500 capitalize">{info.feeMonth}</div></div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={14} /></div>
                          <div><div className="font-medium text-gray-900 text-sm">{student.name}</div><div className="text-xs text-gray-500">Class {student.className}</div></div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">Rs. {fees.allTotal?.toLocaleString()}</td>
                      {activeTab === "paid" && (
                        <>
                          <td className="p-4 text-green-600 font-bold text-sm">Rs. {payment.totalAmountPaid?.toLocaleString()}</td>
                          <td className="p-4 text-red-500 font-bold text-sm">Rs. {payment.remainingBalance?.toLocaleString()}</td>
                        </>
                      )}
                      {activeTab === "unpaid" && <td className="p-4 text-sm text-gray-600">{formatDate(info.createdAt)}</td>}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${info.paymentStatus === "paid" ? "bg-green-100 text-green-800 border-green-200" : 
                            info.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                          {info.paymentStatus}
                        </span>
                      </td>
                      {(activeTab === "unpaid" || activeTab === "partial") && (
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => window.open(info.invoiceUrl, "_blank")} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Eye size={18} /></button>
                            <button onClick={() => handlePayInvoice(invoice)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-medium shadow-sm"><CreditCard size={14} /> Pay</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <div><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><CreditCard size={20} className="text-green-600" /> Collect Fee</h3><p className="text-xs text-gray-500 mt-1">Invoice: <span className="font-mono text-gray-700">{selectedInvoice.invoiceInfo?.invoiceNumber}</span></p></div>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" disabled={processingPayment}><XCircle size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-6 flex justify-between items-center shadow-sm">
                   <div><p className="text-xs text-gray-500 uppercase font-semibold">Total Payable</p><h2 className="text-2xl font-bold text-green-600 mt-1">Rs. {paymentAmount.total?.toLocaleString() || "0"}</h2></div>
                   <div className="text-right"><p className="text-xs text-gray-500">Total Due</p><p className="text-sm font-semibold text-gray-700">Rs. {(
  (selectedInvoice.paymentDetails?.remainingBalance || 0) +
  (selectedInvoice.paymentDetails?.totalAmountPaid ||  0)
).toLocaleString()}
</p></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                  {feeInputFields.map(({ key, label }) => {
                    const maxAmount = maxFeeLimits[key] || 0;
                    if (maxAmount === 0) return null; 
                    return (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">Rs.</span>
                          <input type="number" min="0" max={maxAmount} value={paymentAmount[key] === 0 ? "" : paymentAmount[key]} onChange={(e) => handleFeeChange(key, e.target.value)} 
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none" placeholder="0" />
                        </div>
                        <div className="flex justify-end mt-1"><span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Due: {maxAmount.toLocaleString()}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition" disabled={processingPayment}>Cancel</button>
                <button onClick={handleSubmitPayment} disabled={processingPayment || paymentAmount.total <= 0} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50">
                  {processingPayment ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}