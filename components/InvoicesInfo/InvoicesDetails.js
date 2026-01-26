'use client';
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, CreditCard, CheckCircle, XCircle, Trash2,
  Loader2, FileText, User, Users, AlertCircle, Filter
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI, deleteInvoiceAPI } from "../../Services/invoiceService";
import AppLayout from "../AppLayout";
import { getBalanceAmountAPI } from "../../Services/feeService";

export default function InvoicesDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState("unpaid");
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- FILTERS STATE ---
  const [filterClass, setFilterClass] = useState(""); 
  const [filterSection, setFilterSection] = useState(""); // New Filter
  const [filterMonth, setFilterMonth] = useState("");     // New Filter

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // --- Lists for Dropdowns ---
  const availableClasses = [
    "Play Group", "Nursery", "prep", "1", "2", "3", "4", "5", 
    "6", "7", "8", "9", "10", "11", "12"
  ];

  const availableSections = ["A", "B", "C", "D", "E"]; // Add your sections here

  const availableMonths = [
    "january", "february", "march", "april", "may", "june", 
    "july", "august", "september", "october", "november", "december"
  ];

  // --- 1. Main Invoices Query ---
  // Note: Class filter API ke through handle ho rha hai (Server Side)
  const {
    data: invoices = [],
    isLoading: loadingInvoices,
    isError,
    refetch
  } = useQuery({
    queryKey: ['invoices', activeTab, filterClass],
    queryFn: async () => {
      const status = activeTab === "unpaid" ? "unPaid" : activeTab === "paid" ? "paid" : "partial";
      // Agar backend section/month support karta hai to wahan pass karein, 
      // filhal hum Class API se aur Section/Month client-side filter karenge.
      const res = await getInvoicesByStatusAPI(status, filterClass);
      return res.data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // --- 2. Balance/Fee Breakdown Query ---
  const { 
    data: balanceData, 
    isLoading: loadingBalance 
  } = useQuery({
    queryKey: ['invoiceBalance', selectedInvoice?.invoiceId],
    queryFn: () => getBalanceAmountAPI(selectedInvoice?.invoiceId),
    enabled: !!selectedInvoice && showPaymentModal,
  });

  const feeBreakdown = useMemo(() => {
    return balanceData?.data?.feeBreakdown || {};
  }, [balanceData]);

  const totalDueFromAPI = useMemo(() => {
    if (!feeBreakdown) return 0;
    return Object.values(feeBreakdown).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [feeBreakdown]);


  // --- UPDATED FILTER LOGIC (Client Side for Section & Month) ---
  const filteredInvoices = useMemo(() => {
    // Start with the raw list
    let tempInvoices = invoices;

    // 1. Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      tempInvoices = tempInvoices.filter(invoice => 
        invoice.studentName?.toLowerCase().includes(lowerTerm) ||
        invoice.invoiceNumber?.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Filter by Section (Client Side)
    if (filterSection) {
      tempInvoices = tempInvoices.filter(invoice => 
        invoice.section === filterSection
      );
    }

    // 3. Filter by Fee Month (Client Side)
    if (filterMonth) {
      tempInvoices = tempInvoices.filter(invoice => 
        invoice.feeMonth?.toLowerCase() === filterMonth.toLowerCase()
      );
    }

    return tempInvoices;
  }, [searchTerm, invoices, filterSection, filterMonth]);


  /* ================= AUTH GUARD ================= */
  if (!authLoading && !user) {
    router.push("/");
    return null;
  }

  /* ================= LOGIC FUNCTIONS ================= */
  
  const calculateTotal = (amounts) => {
    return Object.keys(amounts).reduce((sum, key) => {
      if (key !== 'total' && amounts[key] !== undefined) return sum + (Number(amounts[key]) || 0);
      return sum;
    }, 0);
  };

  const handleFeeChange = (key, value) => {
    let numValue = Number(value) || 0;
    if (numValue < 0) numValue = 0;

    setPaymentAmount(prev => {
      const updated = { ...prev, [key]: numValue };
      updated.total = calculateTotal(updated);
      return updated;
    });
  };

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    const initialAmounts = {
       tutionFee: "", booksCharges: "", registrationFee: "", examFee: "",
       labFee: "", artCraftFee: "", karateFee: "", lateFeeFine: "",
       others: "", admissionFee: "", annualCharges: "", absentFine: "",
       miscellaneousFee: "", arrears: ""
    };
    setPaymentAmount({ ...initialAmounts, total: 0 });
    setShowPaymentModal(true);
  };

  const handlePayNow = async () => {
    if (!selectedInvoice) return;
    const totalAmount = Number(paymentAmount.total || 0);
    if (totalAmount <= 0) return alert("Please enter an amount greater than 0");

    setProcessingPayment(true);
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
        setPaymentAmount({});
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during payment.");
    } finally {
      setProcessingPayment(false);
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
        alert("✅ Invoice deleted successfully!");
        queryClient.invalidateQueries(['invoices']);
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
      } else {
        alert("Failed to delete invoice. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the invoice.");
    } finally {
      setDeletingInvoiceId(null);
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
    { key: "examFee", label: "Exam Fee" },
    { key: "labFee", label: "Labs Fee" },
    { key: "artCraftFee", label: "Art & Craft" },
    { key: "karateFee", label: "Karate Fee" },
    { key: "admissionFee", label: "Admission Fee" },
    { key: "lateFeeFine", label: "Late Fee / Fine" },
    { key: "annualCharges", label: "Annual Charges" },
    { key: "others", label: "Other Charges" },
    { key: "miscellaneousFee", label: "miscellaneous Fee" },
    { key: "Arrears", label: "Arrears" },
    { key: "absentFine", label: "Absent Fine" },
  ];

  const apiKeyMapping = {
    tutionFee: "tutionFee", booksCharges: "booksCharges", registrationFee: "registrationFee",
    examFee: "examFee", labsFee: "labFee", artCraftFee: "artCraftFee",
    karateFee: "karateFee", admissionFee: "admissionFee", lateFeeFine: "lateFeeFine",
    annualCharges: "annualCharges", otherCharges: "miscellaneousFee", miscellaneousFee: "miscellaneousFee",
  };

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
          </div>
        </div>

        {/* SEARCH & FILTER AREA */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col gap-4">
          
          {/* Top Row: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name or invoice number..."
              className="w-[300px] pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Bottom Row: Filters (Class, Section, Month) */}
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="flex items-center gap-2 flex-1">
                <Filter size={18} className="text-gray-400 shrink-0" />
                
                {/* Class Filter */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full py-2.5 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="">All Classes</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
             </div>

             {/* Section Filter */}
             <div className="flex-1">
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="w-full py-2.5 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  <option value="">All Sections</option>
                  {availableSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
             </div>

             {/* Fee Month Filter */}
             <div className="flex-1">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full py-2.5 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm capitalize"
                >
                  <option value="">All Months</option>
                  {availableMonths.map(month => (
                    <option key={month} value={month} className="capitalize">{month}</option>
                  ))}
                </select>
             </div>

             {/* Reset Filters Button (Optional but helpful) */}
             {(filterClass || filterSection || filterMonth) && (
                <button 
                  onClick={() => { setFilterClass(""); setFilterSection(""); setFilterMonth(""); }}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  Reset
                </button>
             )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          {loadingInvoices ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500"><AlertCircle className="mx-auto mb-2" /><p>Error loading data. <button onClick={() => refetch()} className="underline">Retry</button></p></div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="mx-auto mb-3 text-gray-400" size={32} />
              <p>No invoices found matching criteria</p>
            </div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  {activeTab === "unpaid" && <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>}
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice, index) => {
                  return (
                    <tr key={invoice.invoiceId || index} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FileText size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500 capitalize">{invoice.feeMonth}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{invoice.studentName}</div>
                            <div className="text-xs text-gray-500">
                              Class {invoice.className} {invoice.section ? `(${invoice.section})` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {activeTab === "unpaid" && (
                        <td className="p-4 text-sm text-gray-600">{formatDate(invoice.date)}</td>
                      )}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${invoice.status === "paid" ? "bg-green-100 text-green-800 border-green-200" :
                            invoice.status === "partial" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => window.open(invoice.urlinvoice || "", "_blank")} 
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View Invoice"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {(activeTab === "unpaid" || activeTab === "partial") && (
                            <button
                              onClick={() => handlePayInvoice(invoice)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-medium shadow-sm"
                              title="Pay Invoice"
                            >
                              <CreditCard size={14} /> Pay
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteInvoice(invoice)}
                            disabled={deletingInvoiceId === invoice.invoiceId}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Invoice"
                          >
                            {deletingInvoiceId === invoice.invoiceId ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAYMENT MODAL (Keep existing implementation) */}
        {showPaymentModal && selectedInvoice && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                 <div>
                   <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <CreditCard size={20} className="text-green-600" /> Collect Fee
                   </h3>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-xs text-gray-500">
                       Invoice: <span className="font-mono text-gray-700">{selectedInvoice.invoiceNumber}</span>
                     </p>
                     <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                       {selectedInvoice.className} {selectedInvoice.section ? `(${selectedInvoice.section})` : ''}
                     </span>
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     setShowPaymentModal(false);
                     setSelectedInvoice(null);
                     setPaymentAmount({});
                   }}
                   className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
                   disabled={processingPayment}
                 >
                   <XCircle size={24} />
                 </button>
               </div>

               {/* Body */}
               <div className="flex-1 overflow-y-auto p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                   {/* Left Column */}
                   <div className="flex flex-col h-full">
                     <div className="flex justify-between items-center mb-4">
                       <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b-2 border-gray-200 pb-1">Fee Info</h4>
                       <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                         {loadingBalance ? <Loader2 className="animate-spin h-3 w-3 inline mr-1" /> : null}
                         Total Due: Rs. {loadingBalance ? "..." : totalDueFromAPI.toLocaleString()}
                       </span>
                     </div>
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto flex-1 relative">
                        {loadingBalance ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {feeInputFields.map(({ key, label }) => {
                              const apiResponseKey = apiKeyMapping[key] || key;
                              const amount = feeBreakdown[apiResponseKey] || 0;
                              return (
                                <div key={key} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1 last:border-0">
                                  <span className="text-gray-600 font-medium">{label}</span>
                                  <span className="text-gray-900 font-mono font-bold">Rs. {Number(amount).toLocaleString()}</span>
                                </div>
                              );
                            })}
                            {feeBreakdown.arrears > 0 && (
                              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1 text-red-600">
                                <span className="font-medium">Arrears</span>
                                <span className="font-mono font-bold">Rs. {Number(feeBreakdown.arrears).toLocaleString()}</span>
                              </div>
                            )}
                            {feeBreakdown.absentFine > 0 && (
                               <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                                 <span className="text-gray-600 font-medium">Absent Fine</span>
                                 <span className="text-gray-900 font-mono font-bold">Rs. {Number(feeBreakdown.absentFine).toLocaleString()}</span>
                               </div>
                            )}
                          </div>
                        )}
                     </div>
                   </div>

                   {/* Right Column */}
                   <div className="flex flex-col h-full">
                     <div className="flex justify-between items-center mb-4">
                       <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide border-b-2 border-blue-200 pb-1">Payment Entry</h4>
                       <span className="text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded-full font-medium">
                         Paying: Rs. {paymentAmount.total?.toLocaleString() || "0"}
                       </span>
                     </div>
                     <div className="bg-white border border-blue-200 rounded-lg p-4 overflow-y-auto flex-1 shadow-sm">
                       <div className="space-y-3">
                         {feeInputFields.map(({ key, label }) => (
                           <div key={key} className="flex items-center gap-3">
                             <div className="w-1/3 text-sm text-gray-600 font-medium">{label}</div>
                             <div className="w-2/3 relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rs.</span>
                               <input
                                 type="number"
                                 min="0"
                                 value={paymentAmount[key] || ""}
                                 onChange={(e) => handleFeeChange(key, e.target.value)}
                                 className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                               />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Footer */}
               <div className="p-4 border-t bg-gray-50 rounded-b-2xl shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      Student: <span className="font-medium">{selectedInvoice.studentName}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      Grand Total: <span className="text-green-600 text-lg">Rs. {paymentAmount.total?.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); setPaymentAmount({}); }}
                      className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
                      disabled={processingPayment}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayNow}
                      disabled={processingPayment || (paymentAmount.total || 0) <= 0}
                      className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {processingPayment ? <><Loader2 className="animate-spin" size={16} /> Processing...</> : <><CreditCard size={16} /> Pay Now</>}
                    </button>
                  </div>
               </div>
             </div>
           </div>
        )}

        {/* DELETE MODAL (Keep existing implementation) */}
        {showDeleteModal && invoiceToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg"><Trash2 className="text-red-600" size={24} /></div>
                  <div><h3 className="text-lg font-bold text-gray-800">Delete Invoice</h3><p className="text-sm text-gray-600">This action cannot be undone</p></div>
                </div>
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium mb-1">Invoice: <span className="font-mono text-red-600">{invoiceToDelete.invoiceNumber}</span></p>
                  <p className="text-sm text-gray-600">Student: <span className="font-medium">{invoiceToDelete.studentName}</span></p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setInvoiceToDelete(null); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition border">Cancel</button>
                  <button onClick={confirmDeleteInvoice} disabled={deletingInvoiceId} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-md flex items-center justify-center gap-2">
                    {deletingInvoiceId ? <><Loader2 className="animate-spin" size={16} /> Deleting...</> : <><Trash2 size={16} /> Delete Invoice</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}