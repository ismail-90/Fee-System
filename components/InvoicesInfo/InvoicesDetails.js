'use client';
import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, CreditCard, CheckCircle, XCircle,
  Loader2, FileText, User, Users, AlertCircle,
  ChevronDown, ChevronUp, Clock, History
} from "lucide-react";
import { getInvoicesByStatusAPI, payInvoiceAPI, payOldBalanceAPI } from "../../Services/invoiceService";
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
  const [processingInvoicePayment, setProcessingInvoicePayment] = useState(false);
  const [processingOldBalancePayment, setProcessingOldBalancePayment] = useState(false);
  
  const [oldBalanceAmounts, setOldBalanceAmounts] = useState({});
  const [showOldBalances, setShowOldBalances] = useState(false);

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

  const handleOldBalanceChange = (recordId, value) => {
    const numValue = Number(value) || 0;
    setOldBalanceAmounts(prev => ({
      ...prev,
      [recordId]: numValue
    }));
  };

  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    
    // Current invoice fees
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
    };
    
    setMaxFeeLimits(limits);
    setPaymentAmount({ ...limits, total: calculateTotal(limits) });
    
    // Initialize old balances
    const initialOldBalances = {};
    if (invoice.balancedPayments) {
      const allOldBalances = [
        ...(invoice.balancedPayments.examFee || []),
        ...(invoice.balancedPayments.karateFee || []),
        ...(invoice.balancedPayments.admissionFee || []),
        ...(invoice.balancedPayments.annualCharges || []),
        ...(invoice.balancedPayments.registrationFee || [])
      ];
      
      allOldBalances.forEach(record => {
        if (record.balanced_amount > 0) {
          initialOldBalances[record.recordId] = record.balanced_amount;
        }
      });
    }
    
    setOldBalanceAmounts(initialOldBalances);
    setShowPaymentModal(true);
  };

  const capitalizeFirstLetter = (value = "") => {
    if (!value) return "N/A";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Function to pay current invoice only
  const handlePayCurrentInvoice = async () => {
    if (!selectedInvoice) return;
    
    const totalCurrentAmount = Number(paymentAmount.total || 0);
    if (totalCurrentAmount <= 0) {
      return alert("Please enter payment amount for current invoice");
    }

    setProcessingInvoicePayment(true);
    try {
      const invoiceResponse = await payInvoiceAPI({
        invoiceId: selectedInvoice.invoiceInfo?.id,
        amount: totalCurrentAmount,
        paymentBreakdown: { ...paymentAmount }
      });

      if (invoiceResponse.success) {
        alert("✅ Current invoice payment successful!");
        queryClient.invalidateQueries(['invoices']);
        
        // Reset only invoice payment amounts, keep old balances
        setPaymentAmount({ total: 0 });
        Object.keys(maxFeeLimits).forEach(key => {
          maxFeeLimits[key] = 0;
        });
      } else {
        throw new Error("Invoice payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Current invoice payment failed");
    } finally {
      setProcessingInvoicePayment(false);
    }
  };

  // Function to pay old balances only
  const handlePayOldBalances = async () => {
    if (!selectedInvoice) return;
    
    const totalOldBalanceAmount = Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0);
    if (totalOldBalanceAmount <= 0) {
      return alert("Please select old balances to pay");
    }

    setProcessingOldBalancePayment(true);
    try {
      // Prepare old balance payments
      const oldBalancePayments = [];
      if (selectedInvoice.balancedPayments) {
        const allOldBalances = [
          ...(selectedInvoice.balancedPayments.examFee || []),
          ...(selectedInvoice.balancedPayments.karateFee || []),
          ...(selectedInvoice.balancedPayments.admissionFee || []),
          ...(selectedInvoice.balancedPayments.annualCharges || []),
          ...(selectedInvoice.balancedPayments.registrationFee || [])
        ];
        
        allOldBalances.forEach(record => {
          const amount = oldBalanceAmounts[record.recordId] || 0;
          if (amount > 0) {
            let feeType = "";
            if (record.feeType) {
              feeType = record.feeType;
            } else if (record.month) {
              if (selectedInvoice.balancedPayments.examFee?.includes(record)) feeType = "exam fee";
              else if (selectedInvoice.balancedPayments.karateFee?.includes(record)) feeType = "karate fee";
              else if (selectedInvoice.balancedPayments.admissionFee?.includes(record)) feeType = "admission fee";
              else if (selectedInvoice.balancedPayments.annualCharges?.includes(record)) feeType = "annual charges";
              else if (selectedInvoice.balancedPayments.registrationFee?.includes(record)) feeType = "registration fee";
            }
            
            if (feeType) {
              oldBalancePayments.push({
                feeType: feeType.toLowerCase(),
                amount: amount
              });
            }
          }
        });
      }

      const oldBalanceResponse = await payOldBalanceAPI({
        studentId: selectedInvoice.studentDetails?.id,
        month: capitalizeFirstLetter(selectedInvoice.invoiceInfo?.feeMonth),
        payments: oldBalancePayments
      });

      if (oldBalanceResponse.success) {
        alert("✅ Old balances payment successful!");
        queryClient.invalidateQueries(['invoices']);
        
        // Reset old balance amounts
        setOldBalanceAmounts({});
        
        // Close modal if both payments are done
        if (paymentAmount.total <= 0) {
          setShowPaymentModal(false);
          setSelectedInvoice(null);
        }
      } else {
        throw new Error("Old balance payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Old balances payment failed");
    } finally {
      setProcessingOldBalancePayment(false);
    }
  };

  // Function to pay both (for backward compatibility)
  const handlePayBoth = async () => {
    const totalCurrentAmount = Number(paymentAmount.total || 0);
    const totalOldBalanceAmount = Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0);
    
    if (totalCurrentAmount <= 0 && totalOldBalanceAmount <= 0) {
      return alert("Please enter payment amount");
    }

    if (totalCurrentAmount > 0) {
      setProcessingInvoicePayment(true);
    }
    if (totalOldBalanceAmount > 0) {
      setProcessingOldBalancePayment(true);
    }

    try {
      let invoiceSuccess = true;
      let oldBalanceSuccess = true;

      // Pay current invoice if amount > 0
      if (totalCurrentAmount > 0) {
        const invoiceResponse = await payInvoiceAPI({
          invoiceId: selectedInvoice.invoiceInfo?.id,
          amount: totalCurrentAmount,
          paymentBreakdown: { ...paymentAmount }
        });
        invoiceSuccess = invoiceResponse.success;
      }

      // Pay old balances if amount > 0
      if (totalOldBalanceAmount > 0) {
        const oldBalancePayments = [];
        if (selectedInvoice.balancedPayments) {
          const allOldBalances = [
            ...(selectedInvoice.balancedPayments.examFee || []),
            ...(selectedInvoice.balancedPayments.karateFee || []),
            ...(selectedInvoice.balancedPayments.admissionFee || []),
            ...(selectedInvoice.balancedPayments.annualCharges || []),
            ...(selectedInvoice.balancedPayments.registrationFee || [])
          ];
          
          allOldBalances.forEach(record => {
            const amount = oldBalanceAmounts[record.recordId] || 0;
            if (amount > 0) {
              let feeType = "";
              if (record.feeType) {
                feeType = record.feeType;
              } else if (record.month) {
                if (selectedInvoice.balancedPayments.examFee?.includes(record)) feeType = "exam fee";
                else if (selectedInvoice.balancedPayments.karateFee?.includes(record)) feeType = "karate fee";
                else if (selectedInvoice.balancedPayments.admissionFee?.includes(record)) feeType = "admission fee";
                else if (selectedInvoice.balancedPayments.annualCharges?.includes(record)) feeType = "annual charges";
                else if (selectedInvoice.balancedPayments.registrationFee?.includes(record)) feeType = "registration fee";
              }
              
              if (feeType) {
                oldBalancePayments.push({
                  feeType: feeType.toLowerCase(),
                  amount: amount
                });
              }
            }
          });
        }

        const oldBalanceResponse = await payOldBalanceAPI({
          studentId: selectedInvoice.studentDetails?.id,
          month: capitalizeFirstLetter(selectedInvoice.invoiceInfo?.feeMonth),
          payments: oldBalancePayments
        });
        oldBalanceSuccess = oldBalanceResponse.success;
      }

      if (invoiceSuccess && oldBalanceSuccess) {
        alert("✅ Both payments successful!");
        setShowPaymentModal(false);
        setPaymentAmount({});
        setOldBalanceAmounts({});
        setSelectedInvoice(null);
        queryClient.invalidateQueries(['invoices']);
      } else {
        throw new Error("Some payments failed");
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setProcessingInvoicePayment(false);
      setProcessingOldBalancePayment(false);
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
                  const balancedPayments = invoice.balancedPayments || {};
                  
                  const hasOldBalances = balancedPayments.summary?.totalBalancedAmount > 0;
                  
                  return (
                    <tr key={info.id || index} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FileText size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{info.invoiceNumber}</div>
                            <div className="text-xs text-gray-500 capitalize">{info.feeMonth}</div>
                            {hasOldBalances && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={10} className="text-amber-500" />
                                <span className="text-xs text-amber-600 font-medium">
                                  Old Balance: Rs. {balancedPayments.summary?.totalBalancedAmount?.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                            <div className="text-xs text-gray-500">Class {student.className}</div>
                          </div>
                        </div>
                      </td>
                      
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
                            <button onClick={() => window.open(info.invoiceUrl || "", "_blank")} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handlePayInvoice(invoice)} 
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-medium shadow-sm"
                            >
                              <CreditCard size={14} /> Pay
                              {hasOldBalances && (
                                <span className="ml-1 px-1 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded">
                                  +Old
                                </span>
                              )}
                            </button>
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

        {/* PAYMENT MODAL */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard size={20} className="text-green-600" /> Collect Fee
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      Invoice: <span className="font-mono text-gray-700">{selectedInvoice.invoiceInfo?.invoiceNumber}</span>
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      {selectedInvoice.studentDetails?.className}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPaymentAmount({});
                    setOldBalanceAmounts({});
                  }} 
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition" 
                  disabled={processingInvoicePayment || processingOldBalancePayment}
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {/* Current Invoice Amount */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Current Invoice Amount</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Due: Rs. {selectedInvoice.feeDetails?.allTotal?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    {feeInputFields.map(({ key, label }) => {
                      const maxAmount = maxFeeLimits[key] || 0;
                      if (maxAmount === 0) return null; 
                      
                      return (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {label}
                            <span className="text-[10px] text-gray-400 ml-1">(Max: {maxAmount.toLocaleString()})</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">Rs.</span>
                            <input 
                              type="number" 
                              min="0" 
                              max={maxAmount} 
                              value={paymentAmount[key] || ""} 
                              onChange={(e) => handleFeeChange(key, e.target.value)} 
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none" 
                              placeholder="0" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Old Balances Section */}
                {selectedInvoice.balancedPayments?.summary?.totalBalancedAmount > 0 && (
                  <div className="mb-6 border-t pt-6">
                    <button
                      onClick={() => setShowOldBalances(!showOldBalances)}
                      className="flex items-center justify-between w-full mb-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <History size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700">Old Balances</h4>
                          <p className="text-xs text-amber-600">
                            Total Old Balance: Rs. {selectedInvoice.balancedPayments.summary.totalBalancedAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {showOldBalances ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showOldBalances && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="grid gap-3">
                          {/* Exam Fee Old Balances */}
                          {selectedInvoice.balancedPayments.examFee?.map((record, idx) => (
                            record.balanced_amount > 0 && (
                              <div key={`exam-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Exam Fee ({record.month} {record.year})</p>
                                  <p className="text-xs text-gray-500">Total: Rs. {record.total_amount} • Paid: Rs. {record.paid_amount}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-amber-600 font-medium">
                                    Due: Rs. {record.balanced_amount}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={record.balanced_amount}
                                    value={oldBalanceAmounts[record.recordId] || ""}
                                    onChange={(e) => handleOldBalanceChange(record.recordId, e.target.value)}
                                    className="w-32 pl-2 pr-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            )
                          ))}

                          {/* Karate Fee Old Balances */}
                          {selectedInvoice.balancedPayments.karateFee?.map((record, idx) => (
                            record.balanced_amount > 0 && (
                              <div key={`karate-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Karate Fee ({record.month} {record.year})</p>
                                  <p className="text-xs text-gray-500">Total: Rs. {record.total_amount} • Paid: Rs. {record.paid_amount}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-amber-600 font-medium">
                                    Due: Rs. {record.balanced_amount}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={record.balanced_amount}
                                    value={oldBalanceAmounts[record.recordId] || ""}
                                    onChange={(e) => handleOldBalanceChange(record.recordId, e.target.value)}
                                    className="w-32 pl-2 pr-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            )
                          ))}

                          {/* Admission Fee Old Balances */}
                          {selectedInvoice.balancedPayments.admissionFee?.map((record, idx) => (
                            record.balanced_amount > 0 && (
                              <div key={`admission-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Admission Fee ({record.month} {record.year})</p>
                                  <p className="text-xs text-gray-500">Total: Rs. {record.total_amount} • Paid: Rs. {record.paid_amount}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-amber-600 font-medium">
                                    Due: Rs. {record.balanced_amount}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={record.balanced_amount}
                                    value={oldBalanceAmounts[record.recordId] || ""}
                                    onChange={(e) => handleOldBalanceChange(record.recordId, e.target.value)}
                                    className="w-32 pl-2 pr-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            )
                          ))}

                          {/* Annual Charges Old Balances */}
                          {selectedInvoice.balancedPayments.annualCharges?.map((record, idx) => (
                            record.balanced_amount > 0 && (
                              <div key={`annual-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Annual Charges ({record.month} {record.year})</p>
                                  <p className="text-xs text-gray-500">Total: Rs. {record.total_amount} • Paid: Rs. {record.paid_amount}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-amber-600 font-medium">
                                    Due: Rs. {record.balanced_amount}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={record.balanced_amount}
                                    value={oldBalanceAmounts[record.recordId] || ""}
                                    onChange={(e) => handleOldBalanceChange(record.recordId, e.target.value)}
                                    className="w-32 pl-2 pr-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            )
                          ))}

                          {/* Registration Fee Old Balances */}
                          {selectedInvoice.balancedPayments.registrationFee?.map((record, idx) => (
                            record.balanced_amount > 0 && (
                              <div key={`registration-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">Registration Fee</p>
                                  <p className="text-xs text-gray-500">
                                    Paid: {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-amber-600 font-medium">
                                    Due: Rs. {record.balanced_amount}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={record.balanced_amount}
                                    value={oldBalanceAmounts[record.recordId] || ""}
                                    onChange={(e) => handleOldBalanceChange(record.recordId, e.target.value)}
                                    className="w-32 pl-2 pr-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Amount"
                                  />
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary Cards */}
                
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Student: <span className="font-medium">{selectedInvoice.studentDetails?.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Class {selectedInvoice.studentDetails?.className})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Invoice: <span className="font-mono">{selectedInvoice.invoiceInfo?.invoiceNumber}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedInvoice(null);
                      setPaymentAmount({});
                      setOldBalanceAmounts({});
                    }} 
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition" 
                    disabled={processingInvoicePayment || processingOldBalancePayment}
                  >
                    Cancel
                  </button>
                  
                  {/* Separate Payment Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-1">
                    {/* Pay Current Invoice Button */}
                    <button 
                      onClick={handlePayCurrentInvoice} 
                      disabled={processingInvoicePayment || processingOldBalancePayment || (paymentAmount.total || 0) <= 0}
                      className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingInvoicePayment ? (
                        <>
                          <Loader2 className="animate-spin" size={16} /> Processing Invoice...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} /> Pay Invoice Only
                          <span className="text-xs bg-green-700 px-2 py-0.5 rounded-full">
                            Rs. {paymentAmount.total?.toLocaleString() || "0"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Pay Old Balances Button */}
                    {selectedInvoice.balancedPayments?.summary?.totalBalancedAmount > 0 && (
                      <button 
                        onClick={handlePayOldBalances} 
                        disabled={processingOldBalancePayment || processingInvoicePayment || Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0) <= 0}
                        className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingOldBalancePayment ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Processing Balances...
                          </>
                        ) : (
                          <>
                            <History size={16} /> Pay Old Balances Only
                            <span className="text-xs bg-amber-600 px-2 py-0.5 rounded-full">
                              Rs. {Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString()}
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Pay Both Button (Optional) */}
                    {(paymentAmount.total > 0 && Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0) > 0) && (
                      <button 
                        onClick={handlePayBoth} 
                        disabled={processingInvoicePayment || processingOldBalancePayment}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingInvoicePayment || processingOldBalancePayment ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Processing All...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} /> Pay Both
                            <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">
                              Rs. {((paymentAmount.total || 0) + Object.values(oldBalanceAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0)).toLocaleString()}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}