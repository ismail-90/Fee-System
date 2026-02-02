'use client';

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, CreditCard, CheckCircle, XCircle, Trash2,
  Loader2, FileText, User, Pencil, Save, Lock, Printer, Download
} from "lucide-react";

import { getInvoicesByStatusAPI, payInvoiceAPI, deleteInvoiceAPI, getInvoiceDetailsAPI } from "../../Services/invoiceService";
import { getBalanceAmountAPI, updateFeePaymentAPI } from "../../Services/feeService";
import { getPermissionRequestsAPI } from "../../Services/permissions";
import AppLayout from "../AppLayout";

// ============================================================
// COMPONENT 1: InvoicePrintView (HTML Generation Logic)
// ============================================================
// Is component mein hum API data ko HTML string mein convert karte hain
const InvoicePrintView = ({ apiData, user }) => {
  if (!apiData) return null;

  const { studentInfo, currentInvoice, sixMonthsHistory, feeDetails } = apiData;
  
  // Data mapping jo print template ko chahye
  const studentData = {
    studentInfo: studentInfo,
    latestInvoice: currentInvoice,
    currentPaymentBreakdown: currentInvoice.feeBreakdown,
    lastSixMonthsHistory: { payments: sixMonthsHistory.invoices } // Mapping history
  };

  const formatCurrency = (amount) => amount ? Number(amount).toLocaleString('en-US') : '0';
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatMonthName = (monthString) => {
    if (!monthString) return '';
    const monthNames = {
      'january': 'January', 'february': 'February', 'march': 'March', 'april': 'April',
      'may': 'May', 'june': 'June', 'july': 'July', 'august': 'August',
      'september': 'September', 'october': 'October', 'november': 'November', 'december': 'December'
    };
    return monthNames[monthString.toLowerCase()] || monthString;
  };

  // --- Previous Fee Table Logic ---
  // Hum sixMonthsHistory invoices se previous payments nikalte hain
  const previousInvoices = sixMonthsHistory.invoices || [];
  // Sort by date descending
  const sortedHistory = [...previousInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  let previousFeeRows = '';
  const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Take top 11 payments for history
  const paymentsToShow = sortedHistory.slice(0, 11);

  paymentsToShow.forEach(inv => {
    const monthName = formatMonthName(inv.feeMonth).toUpperCase().substring(0, 3);
    const year = new Date(inv.createdAt).getFullYear();
    
    // Agar paid hai to amountPaid dikhao warna 0
    const paidAmt = inv.paymentStatus === 'paid' ? (inv.paymentHistory[0]?.amountPaid || inv.amountPaid) : 0;
    // Agar unpaid hai to wo arrear consider hoga, agar paid hai to balance 0
 
    previousFeeRows += `
      <tr>
        <td>${monthName}-${year}</td>
        <td class="align-right-bold">${formatCurrency(paidAmt)}</td>
       </tr>
    `;
  });

  // Fill remaining rows if less than 11
  for (let i = paymentsToShow.length; i < 11; i++) {
    const monthIndex = (11 - i - 1) % 12;
    const currentYear = new Date().getFullYear();
    const year = currentYear - Math.floor((11 - i - 1) / 12);
    previousFeeRows += `
      <tr>
        <td>${allMonths[monthIndex]}-${year}</td>
        <td class="align-right-bold">0</td>
       </tr>
    `;
  }

  // --- Single Voucher HTML Function ---
  const getSingleVoucherHTML = (data, copyType = 'STUDENT COPY', pageCount) => {
    const sInfo = data.studentInfo || {};
    const lInvoice = data.latestInvoice || {};
    const cPayment = data.currentPaymentBreakdown || {};

    const totalCurrentCharges = 
      (cPayment.tutionFee || 0) + (cPayment.booksCharges || 0) +
      (cPayment.registrationFee || 0) + (cPayment.examFee || 0) +
      (cPayment.labFee || 0) + (cPayment.artCraftFee || 0) +
      (cPayment.karateFee || 0) + (cPayment.lateFeeFine || 0) +
      (cPayment.absentFine || 0) + (cPayment.arrears || 0) +
      (cPayment.admissionFee || 0) + (cPayment.miscellaneousFee || 0) + (cPayment.others || 0);

    const displayCopyType = copyType.toUpperCase();

    return `
      <div class="voucher">
        <div class="header">
          <div class="logo"> 
             <div style="width: 50px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc;">
              <img src="/logo.png" alt="School Logo" class="logo-img" />
            </div>
          </div>
          <div class="school-info">
            <h3 class="school-name">Royal Edward Montessori School & College,<span class="campus-name"> ${user?.campus?.name || 'Main Campus'} </span></h3>
            <p>${user?.campus?.city || 'Abbottabad'}, Pakistan,  ${user?.campus?.phone_no || ''}</p>
          </div>
        </div>

        <div class="student-grid">
          <div>
            <span class="label">Challan No.:</span>
            <span class="data-value">${lInvoice.invoiceNumber || 'N/A'}</span>
          </div>
          <div>
            <span class="label">Name:</span>
            <span class="data-value">${sInfo.name || 'N/A'}</span>
          </div>
          <div>
            <span class="label">Father Name:</span>
            <span class="data-value">${sInfo.fatherName || 'N/A'}</span>
            <span class="label">Class:</span>
            <span class="data-value">${sInfo.className || 'N/A'}-${sInfo.section || ''}</span>
          </div>
          <div>
            <span class="label">Last Fee Dep.:</span>
            <span class="data-value">${formatDate(lInvoice.createdAt)}</span>
          </div>
        </div>

        <div class="due-date-section">
          <div>FP: <strong>01-${formatMonthName(lInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</strong></div>
          <div>Fee Month <strong>${formatMonthName(lInvoice.feeMonth).toUpperCase() || 'JANUARY'} - 2025</strong></div>
          <div class="date-box">
            <p>DUE DATE</p>
            <p>15-${formatMonthName(lInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</p>
          </div>
        </div>

        <div class="fee-summary-container">
          <div class="fee-tables-wrapper">
            <div class="prev-fee-table-container">
              <table class="fee-table prev-fee-table">
                <thead>
                  <tr class="fee-header-row">
                    <th colspan="3">Status: ${sInfo.status === 'active' ? 'Day Scholar' : 'Inactive'}</th>
                  </tr>
                  <tr>
                    <th colspan="3">PREVIOUS FEE SUMMARY</th>
                  </tr>
                  <tr>
                    <th style="width: 45%;">Month</th>
                    <th style="width: 20%;">Paid</th>
                   </tr>
                </thead>
                <tbody>
                  ${previousFeeRows}
                </tbody>
              </table>
            </div>

            <div class="charges-table-container">
              <table class="fee-table charges-table">
                <thead>
                  <tr class="fee-header-row">
                    <th colspan="2">Tuition Fee <span class="red-text">${formatCurrency(cPayment.tutionFee || 0)}</span></th>
                  </tr>
                  <tr class="fee-header-row">
                    <th colspan="2">Books+St. Ch. <span class="red-text">${formatCurrency(cPayment.booksCharges || 0)}</span></th>
                  </tr>
                  <tr>
                    <th colspan="2">CURRENT CHARGES</th>
                  </tr>
                  <tr>
                    <th>Particulars</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Admission Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.admissionFee || 0)}</td></tr>
                  <tr><td>Registration Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.registrationFee || 0)}</td></tr>
                  <tr><td>Exam Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.examFee || 0)}</td></tr>
                  <tr><td>2nd Term Exam Fee</td><td class="align-right-bold red-text">0</td></tr>
                  <tr><td>Labs Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.labFee || 0)}</td></tr>
                  <tr><td>Art & craft Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.artCraftFee || 0)}</td></tr>
                  <tr><td>Karate Fee</td><td class="align-right-bold red-text">${formatCurrency(cPayment.karateFee || 0)}</td></tr>
                  <tr><td>Annual Expense ETC</td><td class="align-right-bold red-text">0</td></tr>
                  <tr><td>Arrears</td><td class="align-right-bold red-text">${formatCurrency(cPayment.arrears || 0)}</td></tr>
                  <tr><td>Absent Fine</td><td class="align-right-bold red-text">${formatCurrency(cPayment.absentFine || 0)}</td></tr>
                  <tr><td>Misc/Others</td><td class="align-right-bold red-text">${formatCurrency((cPayment.miscellaneousFee || 0) + (cPayment.others || 0))}</td></tr>
                  <tr class="highlight-row">
                    <td>Total With in Due Date</td>
                    <td class="align-right-bold">${formatCurrency(totalCurrentCharges - (cPayment.lateFeeFine || 0))}</td>
                  </tr>
                  <tr>
                    <td>Late Fee Fine</td>
                    <td class="align-right-bold red-text">${formatCurrency(cPayment.lateFeeFine || 0)}</td>
                  </tr>
                  <tr class="highlight-row">
                    <td>Total After Due Date</td>
                    <td class="align-right-bold">${formatCurrency(totalCurrentCharges)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="instructions">
          <ol>
            <li>The Challan must be deposited within due date to avoid late payment Fine.</li>
            <li>You are requested to submit the fees at the school office, please after due date a fine of RS 25/. per day will be charged</li>
          </ol>
        </div>

        <div class="footer">
          <span>Print Date: ${new Date().toLocaleDateString()}</span>
          <span>${displayCopyType}</span>
          <span>Page ${pageCount}</span>
        </div>
      </div>
    `;
  };

  // --- Main Generator Function ---
  // Yahan hum 3 copies generate karenge (Student, Office, Bank)
  const generateInvoiceHTML = () => {
    let html = '';
    
    // Logic: 1 student ke liye 3 copies fix
    const copies = [
      { type: 'STUDENT COPY' },
      { type: 'SCHOOL COPY' }, // Renamed from Office for generic use
      { type: 'BANK COPY' }
    ];

    html += `<div class="voucher-main-section clearfix">`;

    copies.forEach((item, index) => {
       html += getSingleVoucherHTML(studentData, item.type, 1);
    });

    html += '</div>';
    return html;
  };

  // --- CSS ---
  const getInvoiceStyles = () => {
    return `
      <style>
        @media print {
            @page { size: A4 landscape; margin: 5mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { margin: 0 !important; padding: 0 !important; height: auto !important; }
            .no-print { display: none !important; }
        }
        
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12px;
            color: #000;
            background-color: white;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        .voucher-container { width: 100%; display: block; page-break-inside: avoid; }

        .voucher-main-section {
            width: 100%;
            background-color: #fff;
            padding: 5px;
            overflow: hidden;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            page-break-inside: avoid;
        }

        .voucher {
            width: 32%; 
            float: left;
            margin-right: 1%;
            border: 1px solid #000;
            background-color: #fff;
            font-size: 11px; 
            line-height: 1.3;
            padding: 8px;
            min-height: 550px; 
            box-sizing: border-box;
            position: relative;
            page-break-inside: avoid;
        }
        
        .voucher:last-child { margin-right: 0; }
        .clearfix::after { content: ""; display: table; clear: both; }

        /* Header */
        .header { display: flex; align-items: center; border-bottom: 2px solid #000; padding: 5px 4px; margin-bottom: 8px; overflow: hidden; }
        .logo { width: 50px; height: 50px; margin-left: 5px; flex-shrink: 0; }
        .logo-img { width: 100%; height: 100%; object-fit: contain; }
        .school-info h3 { margin: 0; margin-left: 8px; font-family: 'Arial', sans-serif; font-size: 14px; font-weight: 800; line-height: 1.2; color: #000; text-transform: uppercase; }
        .campus-name { font-size: 12px; font-weight: normal; text-transform: none; }
        .school-info p { margin: 2px 0 0 8px; font-size: 11px; font-style: italic; }

        /* Student Grid */
        .student-grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .student-grid > div { display: table-row; }
        .student-grid > div > span { display: table-cell; padding: 3px 4px; vertical-align: middle; border-bottom: 1px dotted #ccc; }
        .label { font-weight: bold; width: 35%; font-size: 11px; color: #333; }
        .data-value { font-weight: normal; padding-left: 5px; width: 65%; color: #000; }
 
        /* Due Date */
        .due-date-section { display: table; width: 100%; border: 1px solid #000; margin: 8px 0; padding: 4px 0; background: #f9f9f9; }
        .due-date-section > div { display: table-cell; padding: 0 4px; font-size: 11px; vertical-align: middle; width: 33.33%; font-weight: bold; }
        .date-box { background-color: #000; color: #fff; padding: 4px; text-align: center; display: table-cell; vertical-align: middle; }
        .date-box p { margin: 0; line-height: 1.2; font-size: 11px; }

        /* Fee Tables */
        .fee-summary-container { display: table; width: 100%; border: 1px solid #000; border-bottom: none; margin-bottom: 4px; }
        .fee-tables-wrapper { display: table-row; }
        .prev-fee-table-container, .charges-table-container { display: table-cell; vertical-align: top; }
        .prev-fee-table { border-collapse: collapse; width: 100%; margin: 0; height: 100%; border-right: 1px solid #000; }
        .charges-table { border-collapse: collapse; width: 100%; margin: 0; height: 100%; }
        
        .fee-table th, .fee-table td { padding: 3px 4px; text-align: left; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 10px; height: auto; line-height: 1.2; }
        .prev-fee-table th:last-child, .prev-fee-table td:last-child, .charges-table th:last-child, .charges-table td:last-child { border-right: none; }
        .fee-table thead th { font-weight: bold; text-align: center; background-color: #e0e0e0; font-family: 'Arial', sans-serif; font-size: 10px; }
        .prev-fee-table th { background-color: #dcdcdc; }
        .prev-fee-table td:nth-child(2), .prev-fee-table td:nth-child(3) { text-align: right; }
        .charges-table td:nth-child(2) { text-align: right; font-weight: bold; }
        .fee-header-row { background-color: #fff !important; }
        .fee-header-row th { text-align: left; font-weight: bold !important; padding-top: 4px; font-family: 'Times New Roman', serif; }
        .red-text { color: #d00; font-weight: bold; }
        .align-right-bold { text-align: right; font-weight: bold; }
        .highlight-row td { background-color: #eee !important; font-weight: bold; border-top: 1px double #000; }

        /* Footer */
        .instructions ol { padding-left: 18px; margin: 4px 0; list-style: decimal; font-size: 9px; line-height: 1.3; }
        .instructions li { margin-bottom: 2px; }
        .footer { padding: 4px; display: table; width: 100%; font-size: 9px; font-weight: bold; margin-top: 6px; border-top: 1px solid #eee; }
        .footer span { display: table-cell; width: 33.33%; vertical-align: middle; }
        .footer span:first-child { text-align: left; }
        .footer span:nth-child(2) { text-align: center; text-decoration: underline; }
        .footer span:last-child { text-align: right; }
      </style>
    `;
  };

  // Print/Download Handler
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow popups to view invoice'); return; }
    
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Fee Challan Slip</title>
          <style>${getInvoiceStyles()}</style>
      </head>
      <body>
          ${generateInvoiceHTML()}
          <script>
              window.onload = function() {
                  setTimeout(() => { window.print(); }, 500);
              };
          </script>
      </body>
      </html>
    `;
    printWindow.document.write(fullHTML);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 h-full">
      <div className="text-center mb-6">
        <Printer className="mx-auto h-12 w-12 text-blue-600 mb-2" />
        <h3 className="text-lg font-bold text-gray-800">Invoice Ready to Print</h3>
        <p className="text-sm text-gray-500">Student Copy, School Copy & Bank Copy</p>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition font-medium"
        >
          <Printer size={20} />
          Print / Download PDF
        </button>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT 2: InvoiceViewModal (Modal Wrapper)
// ============================================================
const InvoiceViewModal = ({ isOpen, onClose, invoiceId, user }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      setLoading(true);
      getInvoiceDetailsAPI(invoiceId)
        .then((res) => {
          if (res.success) {
            setData(res.data);
          } else {
            alert("Failed to fetch invoice details");
            onClose();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Error fetching details");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, invoiceId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
           <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <FileText size={22} className="text-blue-600"/> View Invoice Details
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
              <XCircle size={26} className="text-gray-500"/>
           </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center">
               <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
               <span className="text-gray-500">Loading Invoice Data...</span>
             </div>
          ) : data ? (
             <InvoicePrintView apiData={data} user={user} />
          ) : (
             <div className="text-red-500">Error loading data</div>
          )}
        </div>

      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT 3: InvoicesDetails
// ============================================================
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
  const [showViewModal, setShowViewModal] = useState(false); // New View Modal
  const [viewInvoiceId, setViewInvoiceId] = useState(null);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState({}); 
  const [editFormData, setEditFormData] = useState({});   
  
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

  // --- 2. Balance/Fee Breakdown Query (For Edit/Pay Modals) ---
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

  // --- View Handler (New) ---
  const handleViewClick = (invoice) => {
    setViewInvoiceId(invoice.invoiceId);
    setShowViewModal(true);
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
                        {/* UPDATED VIEW BUTTON HANDLER */}
                        <button onClick={() => handleViewClick(invoice)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Invoice">
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

        {/* VIEW MODAL COMPONENT INTEGRATION */}
        <InvoiceViewModal 
          isOpen={showViewModal} 
          onClose={() => { setShowViewModal(false); setViewInvoiceId(null); }} 
          invoiceId={viewInvoiceId}
          user={user}
        />

        {/* PAYMENT MODAL */}
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

               {/* Body */}
               <div className="flex-1 overflow-y-auto p-6 bg-white">
                 {loadingDetails ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {/* Table Header Row */}
                        <div className="flex items-center pb-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <div className="w-1/3">Fee Head</div>
                            <div className="w-1/3 text-center">Outstanding Due</div>
                            <div className="w-1/3">Payment Amount</div>
                        </div>

                        {/* Fee Rows */}
                        {feeInputFields.map(field => {
                           const apiKey = apiKeyMapping[field.key] || field.key;
                           const dueAmount = feeBreakdown[apiKey] || 0;
                           return (
                               <div key={field.key} className="flex items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg">
                                   <div className="w-1/3 text-sm font-medium text-gray-700">{field.label}</div>
                                   <div className="w-1/3 text-center">
                                       <span className={`text-sm font-mono font-semibold ${dueAmount > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded' : 'text-gray-400'}`}>
                                            Rs. {Number(dueAmount).toLocaleString()}
                                       </span>
                                   </div>
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

        {/* EDIT MODAL */}
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