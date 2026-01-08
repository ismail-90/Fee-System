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
  RefreshCw
} from "lucide-react";
import { getBulkInvoicesAPI } from "../../../Services/invoiceService";
import AppLayout from "../../../components/AppLayout";

export default function BulkInvoicesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bulkInvoices, setBulkInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }
    fetchBulkInvoices();
  }, [user, loading]);

  const fetchBulkInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await getBulkInvoicesAPI();
      console.log("Bulk Invoices API Response:", res);

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

  // Apply search filter
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
      'jan': 'January',
      'feb': 'February',
      'mar': 'March',
      'apr': 'April',
      'may': 'May',
      'jun': 'June',
      'jul': 'July',
      'aug': 'August',
      'sep': 'September',
      'oct': 'October',
      'nov': 'November',
      'dec': 'December'
    };
    return monthNames[monthString.toLowerCase()] || monthString;
  };

  const generateInvoiceHTML = (invoice) => {
    if (!invoice || !invoice.students) return '';
    
    const students = invoice.students;
    const totalStudents = students.length;
    const pages = Math.ceil(totalStudents / 3);
    let html = '';
    
    for (let page = 0; page < pages; page++) {
      const startIndex = page * 3;
      const endIndex = Math.min(startIndex + 3, totalStudents);
      const pageStudents = students.slice(startIndex, endIndex);
      
      html += `
        <div class="voucher-main-section clearfix" style="page-break-after: ${page < pages - 1 ? 'always' : 'auto'};">
      `;
      
      pageStudents.forEach((student, idx) => {
        const studentIndex = startIndex + idx;
        const studentInfo = student.studentInfo || {};
        const latestInvoice = student.latestInvoice || {};
        const currentPayment = student.currentPaymentBreakdown || {};
        const paymentHistory = student.lastSixMonthsHistory || {};
        
        // Format numbers
        const formatCurrency = (amount) => {
          return amount ? amount.toLocaleString('en-US') : '0';
        };
        
        // Calculate totals
        const totalCurrentCharges = 
          (currentPayment.tutionFee || 0) +
          (currentPayment.booksCharges || 0) +
          (currentPayment.registrationFee || 0) +
          (currentPayment.examFee || 0) +
          (currentPayment.labFee || 0) +
          (currentPayment.artCraftFee || 0) +
          (currentPayment.karateFee || 0) +
          (currentPayment.lateFeeFine || 0);

        // Get previous months history
        const previousMonths = paymentHistory.payments || [];
        // Sort payments by date to get most recent 11 months
        const sortedPayments = [...previousMonths].sort((a, b) => 
          new Date(b.paymentDate) - new Date(a.paymentDate)
        ).slice(0, 11);

        // Generate previous fee summary rows
        let previousFeeRows = '';
        const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        // Show last 11 months from most recent
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

        // Fill remaining rows if less than 11 months
        for (let i = sortedPayments.length; i < 11; i++) {
          const monthIndex = (11 - i - 1) % 12;
          const currentYear = new Date().getFullYear();
          const year = currentYear - Math.floor((11 - i - 1) / 12);
          previousFeeRows += `
            <tr>
              <td>${allMonths[monthIndex]}-${year}</td>
              <td class="align-right-bold">0</td>
              <td class="align-right-bold">0</td>
            </tr>
          `;
        }
        
        html += `
          <div class="voucher">
            <!-- Header -->
            <div class="header">
              <div class="logo"> 
                <div style="width: 40px; height: 40px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ccc;">
                <img src="/logo.png" alt="School Logo" class="logo-img" />
                </div>
              </div>
              <div class="school-info">
                <h3>School Management System</h3>
                <p>123 Main Street, City, Country</p>
              </div>
            </div>

            <div class="student-grid">
              <div>
                <span class="label">Challan No.</span>
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

            <!-- Due Date Section -->
            <div class="due-date-section">
              <div>FP: <strong>01-${formatMonthName(latestInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</strong></div>
              <div>Fee Month <strong>${formatMonthName(latestInvoice.feeMonth).toUpperCase() || 'JANUARY'} - 2025</strong></div>
              <div class="date-box">
                <p>DUE DATE</p>
                <p>15-${formatMonthName(latestInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</p>
              </div>
            </div>

            <!-- FEE SUMMARY CONTAINER -->
            <div class="fee-summary-container">
              <div class="fee-tables-wrapper">
                <!-- LEFT TABLE: Previous Fee Summary -->
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

                <!-- RIGHT TABLE: Current Charges -->
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
                      <tr><td>Admission Fee</td><td class="align-right-bold red-text">0</td></tr>
                      <tr><td>Registration Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.registrationFee || 0)}</td></tr>
                      <tr><td>Exam Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.examFee || 0)}</td></tr>
                      <tr><td>2nd Term Exam Fee</td><td class="align-right-bold red-text">0</td></tr>
                      <tr><td>Labs Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.labFee || 0)}</td></tr>
                      <tr><td>Art & craft Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.artCraftFee || 0)}</td></tr>
                      <tr><td>Karate Fee</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.karateFee || 0)}</td></tr>
                      <tr><td>Annual Expense ETC</td><td class="align-right-bold red-text">0</td></tr>
                      <tr><td>Arrears</td><td class="align-right-bold red-text">0</td></tr>
                      <tr><td>Late Fee Fine</td><td class="align-right-bold red-text">${formatCurrency(currentPayment.lateFeeFine || 0)}</td></tr>
                      <tr><td>Absent Fine</td><td class="align-right-bold red-text">0</td></tr>
                      
                      <tr class="highlight-row">
                        <td><span style="font-size: 8px;">Total With in Due Date</span></td>
                        <td class="align-right-bold">${formatCurrency(totalCurrentCharges - (currentPayment.lateFeeFine || 0))}</td>
                      </tr>
                      <tr>
                        <td>Late Fee Fine</td>
                        <td class="align-right-bold">${formatCurrency(currentPayment.lateFeeFine || 0)}</td>
                      </tr>
                      <tr class="highlight-row">
                        <td><span style="font-size: 8px;">Total After Due Date</span></td>
                        <td class="align-right-bold">${formatCurrency(totalCurrentCharges)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="note">
              Rs.${currentPayment.lateFeeFine || 0}/- will be compulsory to pay in case of the late fee submission
            </div>

            <div class="instructions">
              <ol>
                <li>The Challan must be deposited within due date to avoid late payment Fine.</li>
                <li>You are requested to submit the fees at the school office, please after due date a fine of RS 25/. per day will be charged</li>
              </ol>
            </div>

            <div class="footer">
              <span>Print Date: ${new Date().toLocaleDateString()}</span>
              <span>STUDENT COPY</span>
              <span>Page ${page + 1}</span>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    return html;
  };

  const getInvoiceStyles = () => {
    return `
      <style>
        /* Same CSS styles from your template */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            body {
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
            }
            
            .voucher:empty {
                display: none !important;
            }
            
            .page-break {
                page-break-before: always;
                height: 0;
                margin: 0;
                padding: 0;
            }
        }
        
        .voucher-container {
            width: 100%;
            display: block;
            page-break-inside: avoid;
        }

        .voucher-main-section {
            width: 100%;
            background-color: #fff;
            padding: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
            font-size: 9px;
            line-height: 1.2;
            padding: 6px;
            min-height: 500px;
            box-sizing: border-box;
            position: relative;
            page-break-inside: avoid;
        }
        
        .voucher:last-child {
            margin-right: 0;
        }

        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }

        .header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #000;
            padding: 5px 4px;
            margin-bottom: 4px;
            overflow: hidden;
        }
        
        .logo {
            width: 40px;
            height: 40px;
            margin-left: 5px;
            flex-shrink: 0;
        }
        
        .logo-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .school-info h3 { 
            margin: 0; 
            margin-left: 6px; 
            font-size: 12px; 
            font-weight: 900; 
            line-height: 1.6; 
            color: #1E2B4B; 
        }
        
        .school-info p { 
            margin: 0; 
            margin-left: 6px; 
            font-size: 9px; 
        }

        .student-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        
        .student-grid > div {
            display: table-row;
        }
        
        .student-grid > div > span {
            display: table-cell;
            padding: 2px 4px;
            vertical-align: middle;
            min-height: 14px;
            white-space: nowrap;
        }
        
        .label { 
            font-weight: bold; 
            width: 35%;
            font-size: 9px;
        }
        
        .data-value { 
            font-weight: bold; 
            border-bottom: 1px dashed #ccc; 
            padding-left: 3px; 
            width: 65%;
            white-space: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 9px;
        }

        .due-date-section {
            display: table;
            width: 100%;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            margin: 6px 0;
            padding: 3px 0;
        }
        
        .due-date-section > div {
            display: table-cell;
            padding: 0 4px;
            font-size: 9px;
            vertical-align: middle;
            width: 33.33%;
        }
        
        .date-box { 
            background-color: #ddd; 
            padding: 3px 4px; 
            font-weight: bold; 
            font-size: 8px; 
            text-align: center; 
            border-left: 1px solid #000;
            display: table-cell;
            vertical-align: middle;
        }
        
        .date-box p { 
            margin: 0; 
            line-height: 1.1; 
        }

        .fee-summary-container { 
            display: table;
            width: 100%;
            border: 1px solid #000;
            border-bottom: none;
            margin-bottom: 4px;
        }
        
        .fee-tables-wrapper {
            display: table-row;
        }
        
        .prev-fee-table-container,
        .charges-table-container {
            display: table-cell;
            vertical-align: top;
        }
        
        .prev-fee-table {
            border-collapse: collapse;
            width: 100%;
            margin: 0;
            height: 100%;
            border-right: 1px solid #000;
        }
        
        .charges-table {
            border-collapse: collapse;
            width: 100%;
            margin: 0;
            height: 100%;
        }
        
        .fee-table th, .fee-table td { 
            padding: 1px 3px; 
            text-align: left; 
            border-right: 1px solid #000; 
            border-bottom: 1px solid #000; 
            font-size: 8.5px;
            height: 14px;
        }
        
        .prev-fee-table th:last-child, .prev-fee-table td:last-child,
        .charges-table th:last-child, .charges-table td:last-child { 
            border-right: none; 
        }
        
        .fee-table thead th { 
            font-weight: bold; 
            text-align: center; 
            background-color: #f0f0f0; 
        }

        .prev-fee-table th { 
            background-color: #e0e0e0; 
        }
        
        .prev-fee-table td:nth-child(2),
        .prev-fee-table td:nth-child(3) { 
            text-align: right; 
        }

        .charges-table td:nth-child(2) { 
            text-align: right; 
            font-weight: bold; 
        }

        .fee-header-row { 
            background-color: #fff !important; 
        }
        
        .fee-header-row th { 
            text-align: left; 
            font-weight: normal !important; 
            padding-top: 2px; 
        }
        
        .red-text { 
            color: #d00; 
            font-weight: bold; 
        }
        
        .align-right-bold { 
            text-align: right; 
            font-weight: bold; 
        }
        
        .highlight-row td { 
            background-color: #ddd !important; 
            font-weight: bold; 
        }

        .note { 
            padding: 3px; 
            margin: 0;
            font-size: 8.5px; 
            font-weight: bold; 
            border: 1px solid #000; 
            border-top: none; 
            color: #d00;
        }
        
        .instructions ol { 
            padding-left: 13px; 
            margin: 2px 0; 
            list-style: decimal; 
            font-size: 8px; 
        }
        
        .instructions li { 
            margin-bottom: 1px; 
        }

        .footer { 
            padding: 3px; 
            display: table;
            width: 100%;
            font-size: 8px; 
            font-weight: bold; 
            margin-top: 4px;
        }
        
        .footer span {
            display: table-cell;
            width: 33.33%;
            vertical-align: middle;
        }
        
        .footer span:first-child {
            text-align: left;
        }
        
        .footer span:nth-child(2) {
            text-align: center;
        }
        
        .footer span:last-child {
            text-align: right;
        }

        @media print {
            @page {
                size: A4 landscape;
                margin: 5mm;
            }

            body {
                transform: none;
                background-color: white !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
            }
            
            .voucher-container,
            .voucher-main-section {
                box-shadow: none !important;
                padding: 3px !important;
                page-break-inside: avoid !important;
            }
            
            .voucher {
                border: 1px solid #000 !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
            }
        }
      </style>
    `;
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoiceData(invoice);
    setViewInvoiceModal(true);
    
    // Open print window after a short delay
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to view invoice');
        return;
      }
      
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fee Challan Slip</title>
            <style>
                ${getInvoiceStyles()}
            </style>
        </head>
        <body>
            ${generateInvoiceHTML(invoice)}
            <script>
                // Auto print after loading
                window.onload = function() {
                    setTimeout(() => {
                        window.print();
                    }, 500);
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
    if (!printWindow) {
      alert('Please allow popups to download invoice');
      return;
    }
    
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fee Challan Slip - Download</title>
          <style>
              ${getInvoiceStyles()}
          </style>
      </head>
      <body>
          ${generateInvoiceHTML(invoice)}
          <script>
              window.onload = function() {
                  setTimeout(() => {
                      window.print();
                  }, 500);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Bulk Invoices</h1>
              <p className="text-gray-600">View and manage bulk student invoices</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/invoices')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                ← Back to Invoices
              </button>
              <button
                onClick={fetchBulkInvoices}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PDF URL, student name, or father name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loadingInvoices ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading bulk invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bulk invoices found</p>
              <p className="text-gray-400 mt-1">Create bulk invoices to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sr#</th>
                    {/* <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PDF URL</th> */}
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