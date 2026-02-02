'use client';
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, CreditCard, CheckCircle, XCircle, Trash2,
  Loader2, FileText, User, Filter, AlertCircle, Pencil, Save, Lock
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI, deleteInvoiceAPI } from "../../Services/invoiceService";
import { getBalanceAmountAPI, updateFeePaymentAPI } from "../../Services/feeService";
import { getPermissionRequestsAPI } from "../../Services/permissions"; 
import AppLayout from "../AppLayout";

export default function InvoicesDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState("unpaid");
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- FILTERS STATE ---
  const [filterClass, setFilterClass] = useState(""); 
  const [filterSection, setFilterSection] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // --- MODAL STATES ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({}); // For Payment
  const [editFormData, setEditFormData] = useState({});   // For Editing
  
  const [processingAction, setProcessingAction] = useState(false);
  
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // --- Lists ---
  const availableClasses = ["Play Group", "Nursery", "prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const availableSections = ["A", "B", "C", "D", "E"];
  const availableMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  // --- 0. Permission Query ---
  const { data: permissionData } = useQuery({
    queryKey: ['permissionStatus'],
    queryFn: getPermissionRequestsAPI,
    staleTime: 30 * 1000, 
    refetchOnWindowFocus: true
  });

  const hasActivePermission = permissionData?.data?.hasActivePermission || false;

  // --- 1. Main Invoices Query ---
  const {
    data: invoices = [],
    isLoading: loadingInvoices,
    isError,
    refetch
  } = useQuery({
    queryKey: ['invoices', activeTab, filterClass],
    queryFn: async () => {
      const status = activeTab === "unpaid" ? "unPaid" : activeTab === "paid" ? "paid" : "partial";
      const res = await getInvoicesByStatusAPI(status, filterClass);
      return res.data || [];
    },
    enabled: !!user,
  });

  // --- 2. Balance/Fee Breakdown Query ---
  const { 
    data: balanceData, 
    isLoading: loadingDetails 
  } = useQuery({
    queryKey: ['invoiceDetails', selectedInvoice?.invoiceId],
    queryFn: () => getBalanceAmountAPI(selectedInvoice?.invoiceId),
    enabled: !!selectedInvoice && (showPaymentModal || showEditModal),
  });

  const feeBreakdown = useMemo(() => {
    return balanceData?.data?.feeBreakdown || {};
  }, [balanceData]);

  // --- Effect: Pre-fill Edit Form ---
  useEffect(() => {
    if (showEditModal && feeBreakdown) {
      const initialData = {};
      feeInputFields.forEach(field => {
        const apiKey = apiKeyMapping[field.key] || field.key;
        initialData[field.key] = feeBreakdown[apiKey] || 0;
      });
      setEditFormData(initialData);
    }
  }, [feeBreakdown, showEditModal]);


  // --- Filter Logic ---
  const filteredInvoices = useMemo(() => {
    let tempInvoices = invoices;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      tempInvoices = tempInvoices.filter(invoice => 
        invoice.studentName?.toLowerCase().includes(lowerTerm) ||
        invoice.invoiceNumber?.toLowerCase().includes(lowerTerm)
      );
    }
    if (filterSection) tempInvoices = tempInvoices.filter(invoice => invoice.section === filterSection);
    if (filterMonth) tempInvoices = tempInvoices.filter(invoice => invoice.feeMonth?.toLowerCase() === filterMonth.toLowerCase());
    return tempInvoices;
  }, [searchTerm, invoices, filterSection, filterMonth]);

  /* ================= HANDLERS ================= */

  const handleFeeChange = (key, value, isEditMode = false) => {
    let numValue = Number(value) || 0;
    if (numValue < 0) numValue = 0;

    if (isEditMode) {
      setEditFormData(prev => ({ ...prev, [key]: numValue }));
    } else {
      setPaymentAmount(prev => {
        const updated = { ...prev, [key]: numValue };
        const total = Object.keys(updated).reduce((sum, k) => k !== 'total' ? sum + (Number(updated[k])||0) : sum, 0);
        updated.total = total;
        return updated;
      });
    }
  };

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount({ total: 0 });
    setShowPaymentModal(true);
  };

  const handlePayNow = async () => {
    if (!selectedInvoice) return;
    const totalAmount = Number(paymentAmount.total || 0);
    if (totalAmount <= 0) return alert("Please enter an amount greater than 0");

    setProcessingAction(true);
    try {
      const response = await payInvoiceAPI({
        invoiceId: selectedInvoice.invoiceId,
        amount: totalAmount,
        paymentBreakdown: { ...paymentAmount }
      });

      if (response.success) {
        alert("✅ Payment successful!");
        queryClient.invalidateQueries(['invoices']);
        setShowPaymentModal(false);
        setSelectedInvoice(null);
      } else {
        alert("Payment failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error during payment.");
    } finally {
      setProcessingAction(false);
    }
  };

  // --- Edit/Update Handlers ---
  const handleEditClick = (invoice) => {
    if (!hasActivePermission) {
      alert("You do not have active permission to edit invoices.");
      return;
    }
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;
    setProcessingAction(true);
    try {
      const response = await updateFeePaymentAPI(selectedInvoice.invoiceId, editFormData);
      if (response.success) {
        alert("✅ Invoice updated successfully!");
        queryClient.invalidateQueries(['invoices']); 
        queryClient.invalidateQueries(['invoiceDetails']);
        setShowEditModal(false);
        setSelectedInvoice(null);
      } else {
        alert(response.message || "Failed to update invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating.");
    } finally {
      setProcessingAction(false);
    }
  };


  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    setDeletingInvoiceId(invoiceToDelete.invoiceId);
    try {
      const response = await deleteInvoiceAPI(invoiceToDelete.invoiceId);
      if (response.success) {
        alert("✅ Invoice deleted!");
        queryClient.invalidateQueries(['invoices']);
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      alert("Error deleting invoice.");
    } finally {
      setDeletingInvoiceId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Mapping
  const feeInputFields = [
    { key: "tutionFee", label: "Tuition Fee" },
    { key: "booksCharges", label: "Books Charges" },
    { key: "registrationFee", label: "Registration Fee" },
    { key: "examFee", label: "Exam Fee" },
    { key: "labFee", label: "Labs Fee" },
    { key: "artCraftFee", label: "Art & Craft" },
    { key: "karateFee", label: "Karate Fee" },
    { key: "admissionFee", label: "Admission Fee" },
    { key: "lateFeeFine", label: "Late Fee / Fine" },
    { key: "annualCharges", label: "Annual Charges" },
    { key: "miscellaneousFee", label: "Miscellaneous Fee" },
    { key: "arrears", label: "Arrears" },
  ];

  const apiKeyMapping = {
    tutionFee: "tutionFee", booksCharges: "booksCharges", registrationFee: "registrationFee",
    examFee: "examFee", labFee: "labFee", artCraftFee: "artCraftFee",
    karateFee: "karateFee", admissionFee: "admissionFee", lateFeeFine: "lateFeeFine",
    annualCharges: "annualCharges", miscellaneousFee: "miscellaneousFee", arrears: "arrears"
  };

  if (authLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!user) { router.push("/"); return null; }

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* Permission Banner */}
        {hasActivePermission && (
          <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle size={16} />
            <span>Editing Permission Active: You can now update Partial and Paid invoices.</span>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-600">Manage, process, and edit student invoices</p>
        </div>

        {/* TABS */}
        <div className="mb-6">
          <div className="flex gap-2 border-b overflow-x-auto">
            {[{ key: "unpaid", label: "Unpaid" }, { key: "partial", label: "Partial" }, { key: "paid", label: "Paid" }]
              .map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${activeTab === key ? "bg-white border-t border-l border-r text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {label} Invoices
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col gap-4">
           <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search student/invoice..." className="w-[300px] pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
           </div>
           <div className="flex flex-col sm:flex-row gap-3">
              <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="flex-1 py-2.5 px-3 border rounded-lg bg-white text-sm">
                <option value="">All Classes</option>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="flex-1 py-2.5 px-3 border rounded-lg bg-white text-sm">
                <option value="">All Sections</option>
                {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="flex-1 py-2.5 px-3 border rounded-lg bg-white text-sm capitalize">
                <option value="">All Months</option>
                {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {(filterClass || filterSection || filterMonth) && <button onClick={() => {setFilterClass(""); setFilterSection(""); setFilterMonth("");}} className="text-red-600 text-sm px-3">Reset</button>}
           </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {loadingInvoices ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div> : 
           isError ? <div className="p-12 text-center text-red-500">Error loading data. <button onClick={() => refetch()} className="underline">Retry</button></div> :
           filteredInvoices.length === 0 ? <div className="p-12 text-center text-gray-500">No invoices found</div> : 
          (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  {activeTab === "unpaid" && <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>}
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.invoiceId || index} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={16} /></div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-gray-500 capitalize">{invoice.feeMonth}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={14} /></div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{invoice.studentName}</div>
                          <div className="text-xs text-gray-500">Class {invoice.className} {invoice.section}</div>
                        </div>
                      </div>
                    </td>
                    {activeTab === "unpaid" && <td className="p-4 text-sm text-gray-600">{formatDate(invoice.date)}</td>}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${invoice.status === "paid" ? "bg-green-100 text-green-800" : invoice.status === "partial" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => window.open(invoice.urlinvoice || "", "_blank")} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <Eye size={18} />
                        </button>

                        {(activeTab === "unpaid" || activeTab === "partial") && (
                          <button onClick={() => handlePayInvoice(invoice)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium">
                            <CreditCard size={14} /> Pay
                          </button>
                        )}

                        {(activeTab === "partial" || activeTab === "paid") && (
                          <div className="relative group">
                            <button
                              onClick={() => handleEditClick(invoice)}
                              disabled={!hasActivePermission}
                              className={`p-1.5 rounded transition ${hasActivePermission ? "text-blue-600 hover:bg-blue-50" : "text-gray-300 cursor-not-allowed"}`}
                            >
                               {hasActivePermission ? <Pencil size={18} /> : <Lock size={18} />}
                            </button>
                          </div>
                        )}

                        <button onClick={() => handleDeleteInvoice(invoice)} disabled={deletingInvoiceId === invoice.invoiceId} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50">
                          {deletingInvoiceId === invoice.invoiceId ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= UPDATED PAYMENT MODAL ================= */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
                 <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard size={22} className="text-green-600"/> Collect Fee
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Paying for: <span className="font-semibold text-gray-700">{selectedInvoice.studentName}</span>
                    </p>
                 </div>
                 <button onClick={() => {setShowPaymentModal(false); setSelectedInvoice(null);}} className="p-2 hover:bg-gray-200 rounded-full transition">
                    <XCircle size={26} className="text-gray-500"/>
                 </button>
               </div>

               {/* Body: Fee Rows (Label - Due - Input) */}
               <div className="flex-1 overflow-y-auto p-6 bg-white">
                 {loadingDetails ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {/* Table Header Row (Visual Guide) */}
                        <div className="flex items-center pb-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <div className="w-1/3">Fee Head</div>
                            <div className="w-1/3 text-center">Outstanding Due</div>
                            <div className="w-1/3">Payment Amount</div>
                        </div>

                        {/* Fee Rows */}
                        {feeInputFields.map(field => {
                           const apiKey = apiKeyMapping[field.key] || field.key;
                           const dueAmount = feeBreakdown[apiKey] || 0;
                           
                           // Optional: Hide rows with 0 due if you want to declutter, 
                           // but usually keeping them is better for clarity.
                           
                           return (
                               <div key={field.key} className="flex items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg">
                                   {/* 1. Label */}
                                   <div className="w-1/3 text-sm font-medium text-gray-700">
                                       {field.label}
                                   </div>

                                   {/* 2. Due Amount (Center) */}
                                   <div className="w-1/3 text-center">
                                       <span className={`text-sm font-mono font-semibold ${dueAmount > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-gray-400'}`}>
                                            Rs. {Number(dueAmount).toLocaleString()}
                                       </span>
                                   </div>

                                   {/* 3. Input Field (Right/Samne) */}
                                   <div className="w-1/3 relative">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rs.</span>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="0"
                                                value={paymentAmount[field.key] || ""} 
                                                onChange={(e) => handleFeeChange(field.key, e.target.value, false)}
                                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition shadow-sm"
                                            />
                                        </div>
                                   </div>
                               </div>
                           );
                        })}
                    </div>
                 )}
               </div>

               {/* Footer */}
               <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex items-center justify-between">
                 <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Payment</p>
                    <p className="text-2xl font-bold text-green-700">Rs. {Number(paymentAmount.total || 0).toLocaleString()}</p>
                 </div>

                 <div className="flex gap-3">
                     <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition">
                        Cancel
                     </button>
                     <button onClick={handlePayNow} disabled={processingAction || (paymentAmount.total || 0) <= 0} className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        {processingAction ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                        Confirm Payment
                     </button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* ================= EDIT MODAL (Permission Based) ================= */}
        {showEditModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-amber-50 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2"><Pencil size={20} /> Update Invoice</h3>
                  <p className="text-xs text-amber-700">Modifying: {selectedInvoice.invoiceNumber}</p>
                </div>
                <button onClick={() => { setShowEditModal(false); setSelectedInvoice(null); }} className="p-2 rounded-full hover:bg-amber-100 text-amber-800 transition"><XCircle size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingDetails ? <div className="flex justify-center h-40 items-center"><Loader2 className="animate-spin text-amber-600"/></div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feeInputFields.map(({ key, label }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rs.</span>
                          <input type="number" min="0" value={editFormData[key] !== undefined ? editFormData[key] : ""} onChange={(e) => handleFeeChange(key, e.target.value, true)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <button onClick={() => setShowEditModal(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={handleUpdateInvoice} disabled={processingAction} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2">
                  {processingAction ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {showDeleteModal && invoiceToDelete && (
           <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
             <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
               <h3 className="text-lg font-bold mb-2">Delete Invoice?</h3>
               <p className="mb-4 text-gray-600">Are you sure you want to delete {invoiceToDelete.invoiceNumber}?</p>
               <div className="flex gap-2 justify-end">
                 <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                 <button onClick={confirmDeleteInvoice} disabled={!!deletingInvoiceId} className="px-4 py-2 bg-red-600 text-white rounded">
                   {deletingInvoiceId ? "Deleting..." : "Delete"}
                 </button>
               </div>
             </div>
           </div>
        )}
      </div>
    </AppLayout>
  );
}