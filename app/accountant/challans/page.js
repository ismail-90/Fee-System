'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Download,
  Calendar,
  FileText,
  Loader2,
  Settings,
  Filter // Added Filter icon
} from "lucide-react";
import { getBulkInvoicesAPI } from "../../../Services/invoiceService";
import AppLayout from "../../../components/AppLayout";

const classList = [
  "Play Group", "Nursery", "prep", "1", "2", "3", "4", "5", 
  "6", "7", "8", "9", "10", "11", "12"
];

export default function BulkInvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bulkInvoices, setBulkInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

  // State for layout selection (1, 2, or 3 per page)
  const [studentsPerPage, setStudentsPerPage] = useState(3);
  
  // NEW: State for Class Selection (Default: Play Group)
  const [selectedClass, setSelectedClass] = useState("Play Group");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }
    // Now fetch happens whenever user, loading, OR selectedClass changes
    fetchBulkInvoices();
  }, [user, loading, selectedClass]);

  const fetchBulkInvoices = async () => {
    setLoadingInvoices(true);
    try {
      // Pass the selectedClass to the API
      const res = await getBulkInvoicesAPI(selectedClass);
      
      if (res.success && res.data) {
        setBulkInvoices(res.data);
        setFilteredInvoices(res.data);
      } else {
        setBulkInvoices([]);
        setFilteredInvoices([]);
      }
    } catch (err) {
      console.error("Error fetching bulk invoices:", err);
      setBulkInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredInvoices(bulkInvoices);
      return;
    }
    const filtered = bulkInvoices.filter(invoice =>
      invoice.bulkInvoiceInfo?.pdfUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.students?.some(student =>
        student.studentInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentInfo?.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredInvoices(filtered);
  }, [searchTerm, bulkInvoices]);

  // ... [Keep all your helper functions like formatDate, formatMonthName, getSingleVoucherHTML, generateInvoiceHTML, getInvoiceStyles here exactly as they were] ...
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonthName = (monthString) => {
    if (!monthString) return '';
    const monthNames = {
      'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
      'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
      'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    };
    return monthNames[monthString.toLowerCase()] || monthString;
  };

  // Helper function to generate a single voucher HTML
    const getSingleVoucherHTML = (student, studentIndex, copyType = 'STUDENT COPY', pageCount) => {
    const studentInfo = student.studentInfo || {};
    const latestInvoice = student.latestInvoice || {};
    const currentPayment = student.currentPaymentBreakdown || {};
    const paymentHistory = student.lastSixMonthsHistory || {};
    
    const formatCurrency = (amount) => amount ? amount.toLocaleString('en-US') : '0';
    
    const totalCurrentCharges = 
      (currentPayment.tutionFee || 0) + (currentPayment.booksCharges || 0) +
      (currentPayment.registrationFee || 0) + (currentPayment.examFee || 0) +
      (currentPayment.labFee || 0) + (currentPayment.artCraftFee || 0) +
      (currentPayment.karateFee || 0) + (currentPayment.lateFeeFine || 0) +
      (currentPayment.absentFine || 0) + (currentPayment.arrears || 0) +
      (currentPayment.admissionFee || 0);

    const previousMonths = paymentHistory.payments || [];
    const sortedPayments = [...previousMonths].sort((a, b) => 
      new Date(b.paymentDate) - new Date(a.paymentDate)
    ).slice(0, 11);

    let previousFeeRows = '';
    const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    sortedPayments.forEach(payment => {
      const monthName = formatMonthName(payment.feeMonth).toUpperCase().substring(0, 3);
      previousFeeRows += `
        <tr>
          <td>${monthName}-${new Date(payment.paymentDate).getFullYear()}</td>
          <td class="align-right-bold">${formatCurrency(payment.totalAmountPaid)}</td>
          <td class="align-right-bold">0</td>
        </tr>
      `;
    });

    for (let i = sortedPayments.length; i < 11; i++) {
      const monthIndex = (11 - i - 1) % 12;
      const currentYear = new Date().getFullYear();
      const year = currentYear - Math.floor((11 - i - 1) / 12);
      previousFeeRows += `
        <tr>
          <td>${allMonths[monthIndex]}-${year}</td>
          <td class="align-right-bold">${formatCurrency(paymentHistory.payments.arrears || 0)}</td>
          <td class="align-right-bold">0</td>
        </tr>
      `;
    }

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
            <h3 class="school-name">Royal Edward Montessori School & College,<span class="campus-name"> {${user?.campus?.name || ''}} </span></h3>
            <p>${user?.campus?.city || 'Abbottabad'}, Pakistan,  ${user?.campus?.phone_no || ''}</p>
          </div>
        </div>

        <div class="student-grid">
          <div>
            <span class="label">Challan No.:</span>
            <span class="data-value">${latestInvoice.invoiceNumber || `INV-${Date.now()}-${studentIndex}`}</span>
          </div>
          <div>
            <span class="label">Name:</span>
            <span class="data-value">${studentInfo.name || 'N/A'}</span>
          </div>
          <div>
            <span class="label">Father Name:</span>
            <span class="data-value">${studentInfo.fatherName || 'N/A'}</span>
            <span class="label">Class:</span>
            <span class="data-value">${studentInfo.className || 'N/A'}</span>
          </div>
          <div>
            <span class="label">Last Fee Dep.:</span>
            <span class="data-value">${formatDate(latestInvoice.createdAt || new Date())}</span>
          </div>
        </div>

        <div class="due-date-section">
          <div>FP: <strong>01-${formatMonthName(latestInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</strong></div>
          <div>Fee Month <strong>${formatMonthName(latestInvoice.feeMonth).toUpperCase() || 'JANUARY'} - 2025</strong></div>
          <div class="date-box">
            <p>DUE DATE</p>
            <p>15-${formatMonthName(latestInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</p>
          </div>
        </div>

        <div class="fee-summary-container">
          <div class="fee-tables-wrapper">
            <div class="prev-fee-table-container">
              <table class="fee-table prev-fee-table">
                <thead>
                  <tr class="fee-header-row">
                    <th colspan="3">Status: ${studentInfo.status === 'active' ? 'Day Scholar' : 'Inactive'}</th>
                  </tr>
                  <tr>
                    <th colspan="3">PREVIOUS FEE SUMMARY</th>
                  </tr>
                  <tr>
                    <th style="width: 45%;">Month</th>
                    <th style="width: 20%;">Paid</th>
                    <th style="width: 25%;">Arrear</th>
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
                    <th colspan="2">Tuition Fee <span class="red-text">${formatCurrency(currentPayment.tutionFee || 0)}</span></th>
                  </tr>
                  <tr class="fee-header-row">
                    <th colspan="2">Books+St. Ch. <span class="red-text">${formatCurrency(currentPayment.booksCharges || 0)}</span></th>
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
                  <tr><td>Admission Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.admissionFee || 0)}</td></tr>
                  <tr><td>Registration Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.registrationFee || 0)}</td></tr>
                  <tr><td>Exam Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.examFee || 0)}</td></tr>
                  <tr><td>2nd Term Exam Fee</td><td class="align-right-bold red-text">0</td></tr>
                  <tr><td>Labs Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.labFee || 0)}</td></tr>
                  <tr><td>Art & craft Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.artCraftFee || 0)}</td></tr>
                  <tr><td>Karate Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.karateFee || 0)}</td></tr>
                  <tr><td>Annual Expense ETC</td><td class="align-right-bold red-text">0</td></tr>
                  <tr><td>Arrears</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.arrears || 0)}</td></tr>
                   <tr><td>Absent Fine</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.absentFine || 0)}</td></tr>
                  <tr class="highlight-row">
                    <td>Total With in Due Date</td>
                    <td class="align-right-bold">${formatCurrency(totalCurrentCharges - (currentPayment.lateFeeFine || 0))}</td>
                  </tr>
                  <tr>
                    <td>Late Fee Fine</td>
                    <td class="align-right-bold red-text">${formatCurrency(currentPayment.lateFeeFine || 0)}</td>
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

  const generateInvoiceHTML = (invoice) => {
    if (!invoice || !invoice.students) return '';
    
    const students = invoice.students;
    const totalStudents = students.length;
    
    let html = '';
    
    let itemsToRender = [];

    if (studentsPerPage === 1) {
      students.forEach(student => {
        itemsToRender.push({ data: student, type: 'STUDENT COPY', originalIndex: student.id });
        itemsToRender.push({ data: student, type: 'OFFICE COPY', originalIndex: student.id });
        itemsToRender.push({ data: student, type: 'BANK COPY', originalIndex: student.id });
      });
    } else {
      itemsToRender = students.map((s, i) => ({ data: s, type: 'STUDENT COPY', originalIndex: i }));
    }

    const totalPages = Math.ceil(itemsToRender.length / 3);

    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * 3;
      const endIndex = Math.min(startIndex + 3, itemsToRender.length);
      const pageItems = itemsToRender.slice(startIndex, endIndex);
      
      html += `
        <div class="voucher-main-section clearfix" style="page-break-after: ${page < totalPages - 1 ? 'always' : 'auto'};">
      `;

      pageItems.forEach((item) => {
        const copyType = (item.type === 'STUDENT COPY' && studentsPerPage !== 1) ? 'STUDENT COPY' : item.type;
        
        html += getSingleVoucherHTML(item.data, item.originalIndex, copyType, page + 1);
      });

      // 5. Handle Empty Slots
      // We want exactly 3 slots visually per page to maintain structure
      const itemsOnPage = pageItems.length;
      if (itemsOnPage < 3) {
        const emptySlotsNeeded = 3 - itemsOnPage;
        for (let i = 0; i < emptySlotsNeeded; i++) {
          html += `<div class="voucher empty-voucher"></div>`;
        }
      }
      
      html += '</div>';
    }
    
    return html;
  };

  const getInvoiceStyles = () => {
    return `
      <style>
        @media print {
            @page { size: A4 landscape; margin: 5mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            body { margin: 0 !important; padding: 0 !important; height: auto !important; }
            .voucher:empty { display: none !important; }
            .no-print { display: none !important; }
        }
        
        /* Global Font Settings for Official Look */
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
            font-size: 11px; /* Increased from 9px for readability */
            line-height: 1.3;
            padding: 8px;
            min-height: 550px; /* Increased height to fit larger text */
            box-sizing: border-box;
            position: relative;
            page-break-inside: avoid;
        }
        
        .voucher:last-child { margin-right: 0; }

        .empty-voucher {
            border: 1px dashed #ccc; 
            background-color: #fff;
        }

        .clearfix::after { content: ""; display: table; clear: both; }

        /* Header Styling */
        .header { display: flex; align-items: center; border-bottom: 2px solid #000; padding: 5px 4px; margin-bottom: 8px; overflow: hidden; }
        .logo { width: 50px; height: 50px; margin-left: 5px; flex-shrink: 0; }
        .logo-img { width: 100%; height: 100%; object-fit: contain; }
        
        /* School Info - Mix of Serif and Sans for headers */
        .school-info h3 { 
            margin: 0; 
            margin-left: 8px; 
            font-family: 'Arial', sans-serif; 
            font-size: 14px; 
            font-weight: 800; 
            line-height: 1.2; 
            color: #000; 
            text-transform: uppercase;
        }
            .campus-name { font-size: 12px; font-weight: normal; text-transform: none; }
        .school-info p { margin: 2px 0 0 8px; font-size: 11px; font-style: italic; }

        /* Student Grid */
        .student-grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        .student-grid > div { display: table-row; }
        .student-grid > div > span { display: table-cell; padding: 3px 4px; vertical-align: middle; border-bottom: 1px dotted #ccc; }
        .label { font-weight: bold; width: 35%; font-size: 11px; color: #333; }
        .data-value { font-weight: normal; padding-left: 5px; width: 65%; color: #000; }
 
        /* Due Date Section */
        .due-date-section { display: table; width: 100%; border: 1px solid #000; margin: 8px 0; padding: 4px 0; background: #f9f9f9; }
        .due-date-section > div { display: table-cell; padding: 0 4px; font-size: 11px; vertical-align: middle; width: 33.33%; font-weight: bold; }
        .date-box { background-color: #000; color: #fff; padding: 4px; text-align: center; display: table-cell; vertical-align: middle; }
        .date-box p { margin: 0; line-height: 1.2; font-size: 11px; }

        /* Fee Summary & Tables */
        .fee-summary-container { display: table; width: 100%; border: 1px solid #000; border-bottom: none; margin-bottom: 4px; }
        .fee-tables-wrapper { display: table-row; }
        .prev-fee-table-container, .charges-table-container { display: table-cell; vertical-align: top; }
        
        .prev-fee-table { border-collapse: collapse; width: 100%; margin: 0; height: 100%; border-right: 1px solid #000; }
        .charges-table { border-collapse: collapse; width: 100%; margin: 0; height: 100%; }
        
        .fee-table th, .fee-table td { 
            padding: 3px 4px; 
            text-align: left; 
            border-right: 1px solid #000; 
            border-bottom: 1px solid #000; 
            font-size: 10px; /* Increased from 8.5px */
            height: auto; 
            line-height: 1.2;
        }
        .prev-fee-table th:last-child, .prev-fee-table td:last-child, .charges-table th:last-child, .charges-table td:last-child { border-right: none; }
        
        /* Table Headers */
        .fee-table thead th { 
            font-weight: bold; 
            text-align: center; 
            background-color: #e0e0e0; 
            font-family: 'Arial', sans-serif;
            font-size: 10px;
        }
        .prev-fee-table th { background-color: #dcdcdc; }
        .prev-fee-table td:nth-child(2), .prev-fee-table td:nth-child(3) { text-align: right; }
        .charges-table td:nth-child(2) { text-align: right; font-weight: bold; }
        
        .fee-header-row { background-color: #fff !important; }
        .fee-header-row th { text-align: left; font-weight: bold !important; padding-top: 4px; font-family: 'Times New Roman', serif; }
        
        /* Colors & Highlights */
        .red-text { color: #d00; font-weight: bold; }
        .align-right-bold { text-align: right; font-weight: bold; }
        .highlight-row td { background-color: #eee !important; font-weight: bold; border-top: 1px double #000; }

        /* Footer & Notes */
        .note { padding: 4px; margin: 0; font-size: 10px; font-weight: bold; border: 1px solid #000; border-top: none; color: #d00; text-align: center; }
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
  
  const viewInvoice = (invoice) => {
    setSelectedInvoiceData(invoice);
    setViewInvoiceModal(true);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) { alert('Please allow popups to view invoice'); return; }
      
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fee Challan Slip</title>
            <style>${getInvoiceStyles()}</style>
        </head>
        <body>
            ${generateInvoiceHTML(invoice)}
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
    }, 100);
  };

  const downloadInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow popups to download invoice'); return; }
    
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fee Challan Slip - Download</title>
          <style>${getInvoiceStyles()}</style>
      </head>
      <body>
          ${generateInvoiceHTML(invoice)}
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

        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Bulk Challans</h1>
              <p className="text-gray-600">View and manage bulk student Challans for <span className="font-bold text-blue-600">{selectedClass}</span></p>
            </div>
            
            <div className="flex items-center gap-4">
                {/* NEW: Class Selection Dropdown */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Class:</label>
                    </div>
                    <select 
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
                    >
                        {classList.map((cls, idx) => (
                            <option key={idx} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>

                {/* Layout Selection Dropdown */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Settings size={18} className="text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Page Layout:</label>
                    </div>
                    <select 
                        value={studentsPerPage}
                        onChange={(e) => setStudentsPerPage(Number(e.target.value))}
                        className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5"
                    >
                        <option value={1}>1 Student (3 Copies)</option>
                        <option value={3}>3 Students</option>
                    </select>
                </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search within ${selectedClass}...`}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loadingInvoices ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading bulk Challans for {selectedClass}...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bulk Challans found for {selectedClass}</p>
              <p className="text-gray-400 mt-1">Try selecting a different class</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sr#</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.bulkInvoiceInfo?.id || index} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {invoice.bulkInvoiceInfo?.totalStudents || 0} students
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">{formatDate(invoice.bulkInvoiceInfo?.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${invoice.bulkInvoiceInfo?.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.bulkInvoiceInfo?.paymentStatus === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {invoice.bulkInvoiceInfo?.paymentStatus || "unPaid"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewInvoice(invoice)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs font-medium"
                            title="View and Print Invoice"
                          >
                            <Eye size={12} />
                            View/Print
                          </button>

                          <button
                            onClick={() => downloadInvoice(invoice)}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-1 text-xs font-medium"
                            title="Download Invoice"
                          >
                            <Download size={12} />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          
      </div>
    </AppLayout>
  );
}