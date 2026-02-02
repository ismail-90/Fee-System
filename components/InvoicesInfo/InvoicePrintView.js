import { Printer } from "lucide-react";

const InvoicePrintView = ({ apiData, user }) => {
  if (!apiData) return null;

  const { studentInfo, currentInvoice, sixMonthsHistory, feeDetails } = apiData;
  
  // Data mapping jo print template ko chahye
  const studentData = {
    studentInfo: studentInfo,
    latestInvoice: currentInvoice,
    currentPaymentBreakdown: currentInvoice.feeBreakdown,
    lastSixMonthsHistory: { payments: sixMonthsHistory.invoices } 
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
  const previousInvoices = sixMonthsHistory.invoices || [];
  const sortedHistory = [...previousInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  let previousFeeRows = '';
  const allMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const paymentsToShow = sortedHistory.slice(0, 11);

  paymentsToShow.forEach(inv => {
    const monthName = formatMonthName(inv.feeMonth).toUpperCase().substring(0, 3);
    const year = new Date(inv.createdAt).getFullYear();
    const paidAmt = inv.paymentStatus === 'paid' ? (inv.paymentHistory[0]?.amountPaid || inv.amountPaid) : 0;
 
    previousFeeRows += `
      <tr>
        <td>${monthName}-${year}</td>
        <td class="align-right-bold">${formatCurrency(paidAmt)}</td>
       </tr>
    `;
  });

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
          <h3 class="school-name">Royal Edward Montessori School & College</h3>
            <p>${user?.campus?.name || 'Main Campus'} </p>
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
          </div>
          <div>
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
            <p>08-${formatMonthName(lInvoice.feeMonth).substring(0, 3).toUpperCase() || 'JAN'}-2025</p>
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
  const generateInvoiceHTML = () => {
    let html = '';
    const copies = [
      { type: 'STUDENT COPY' },
      { type: 'SCHOOL COPY' },
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

export default InvoicePrintView;