'use client';
import { useState, useEffect } from "react";
import {
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  Share2,
  Mail as MailIcon,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { generateFeeReceiptAPI } from "../../Services/feeService";

export default function FeeSlipModal({ isOpen, onClose, student }) {
  // State declarations
  const [feeMonth, setFeeMonth] = useState("");
  const [feeMonthType, setFeeMonthType] = useState("single");
  const [secondMonth, setSecondMonth] = useState("");
  const [generatingSlip, setGeneratingSlip] = useState(false);
  const [slipData, setSlipData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDoubleMonthSelector, setShowDoubleMonthSelector] = useState(false);

  // Fee breakdown state

  const [feeBreakdown, setFeeBreakdown] = useState({
    tutionFee: "",
    booksCharges: 0,
    registrationFee: 0,
    examFee: 0,
    labFee: 0,
    artCraftFee: 0,
    karateFee: 0,
    lateFeeFine: 0,
    others: { },
    admissionFee: 0,
    annualCharges: 0,
    absentFine: 0,
    miscellaneousFee: 0,
    arrears: 0
  });

  // Dynamic months array based on current year
  const [feeMonths, setFeeMonths] = useState([]);

  // Get current year
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  // Generate months array for current year
  const generateMonthsForYear = (year) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return months.map(month => `${month}-${year}`);
  };

  // Initialize months when component mounts
  useEffect(() => {
    const currentYear = getCurrentYear();
    const months = generateMonthsForYear(currentYear);
    setFeeMonths(months);

    // Set default month to current month if available
    const currentMonthIndex = new Date().getMonth();
    if (months[currentMonthIndex]) {
      setFeeMonth(months[currentMonthIndex]);
    } else if (months.length > 0) {
      setFeeMonth(months[0]);
    }
  }, []);

  // Initialize with student's fee data
  useEffect(() => {
    if (student && feeMonths.length > 0) {
      // Set fee month from student or current month
      if (student?.feeMonth) {
        // Check if student's fee month exists in current year months
        const studentMonthExists = feeMonths.some(month =>
          month.toLowerCase().includes(student.feeMonth.toLowerCase())
        );

        if (studentMonthExists) {
          // Find the matching month
          const matchingMonth = feeMonths.find(month =>
            month.toLowerCase().includes(student.feeMonth.toLowerCase())
          );
          setFeeMonth(matchingMonth || feeMonths[0]);
        } else {
          setFeeMonth(feeMonths[0]);
        }
      } else {
        // Default to current month
        const currentMonthIndex = new Date().getMonth();
        setFeeMonth(feeMonths[currentMonthIndex] || feeMonths[0]);
      }

      // Initialize fee breakdown from student data
      setFeeBreakdown(prev => ({
        ...prev,
        prevBal: student.curBalance || 0,
        feePaid: student.feePaid || 0,
      }));

    }
  }, [student, feeMonths]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total from breakdown
  const calculateTotal = () => {
    return Object.values(feeBreakdown).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
  };

  // Handle fee breakdown input change
  const handleBreakdownChange = (field, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFeeBreakdown(prev => ({
        ...prev,
        [field]: numValue
      }));
    }
  };
  const addOtherField = () => {
    setFeeBreakdown(prev => ({
      ...prev,
      others: {
        ...prev.others,
        "": 0
      }
    }));
  };

  const updateOtherKey = (oldKey, newKey) => {
    setFeeBreakdown(prev => {
      const updated = { ...prev.others };
      updated[newKey] = updated[oldKey];
      delete updated[oldKey];
      return { ...prev, others: updated };
    });
  };

  const updateOtherValue = (key, value) => {
    const num = value === "" ? 0 : parseFloat(value);
    if (isNaN(num)) return;

    setFeeBreakdown(prev => ({
      ...prev,
      others: {
        ...prev.others,
        [key]: num
      }
    }));
  };

  const removeOtherField = (key) => {
    setFeeBreakdown(prev => {
      const updated = { ...prev.others };
      delete updated[key];
      return { ...prev, others: updated };
    });
  };

  // Reset breakdown to student's original values
  const resetBreakdown = () => {
    if (student) {
      setFeeBreakdown({
        tutionFee: student.tutionFee || 0,
        booksCharges: student.booksCharges || 0,
        registrationFee: student.registrationFee || 0,
        examFee: student.examFee || 0,
        labFee: student.labFee || 0,
        artCraftFee: student.artCraftFee || 0,
        karateFee: student.karateFee || 0,
        lateFeeFine: student.lateFeeFine || 0,
        others: student.others || {},
        admissionFee: student.admissionFee || 0,
        annualCharges: student.annualCharges || 0,
        absentFine: student.absentFine || 0,
        miscellaneousFee: student.miscellaneousFee || 0,
        arrears: student.arrears || 0
      });
    }
  };

  // Format month string for API (remove year for API)
  const formatMonthString = (monthWithYear) => {
    // Extract month name only (remove year)
    const monthName = monthWithYear.split('-')[0];
    return monthName.toLowerCase();
  };

  // Get available months for second selection
  const getAvailableSecondMonths = () => {
    if (!feeMonth || feeMonths.length === 0) return [];
    const currentIndex = feeMonths.indexOf(feeMonth);
    return feeMonths.slice(currentIndex + 1);
  };

  // Handle single month selection
  const handleSingleMonthSelect = (month) => {
    setFeeMonth(month);
    if (feeMonthType === "double") {
      setFeeMonthType("single");
      setSecondMonth("");
    }
  };

  // Handle double month selection
  const handleDoubleMonthSelect = () => {
    setFeeMonthType("double");
    setShowDoubleMonthSelector(true);
    // Auto-select next month as second month
    const currentIndex = feeMonths.indexOf(feeMonth);
    if (currentIndex < feeMonths.length - 1) {
      setSecondMonth(feeMonths[currentIndex + 1]);
    } else if (feeMonths.length > 0) {
      setSecondMonth(feeMonths[0]);
    }
  };

  // Get display month text
  const getMonthDisplayText = () => {
    if (feeMonthType === "single") {
      return feeMonth || "Select Month";
    } else {
      return secondMonth ? `${feeMonth} & ${secondMonth}` : `${feeMonth} & Select Second Month`;
    }
  };

  // Get API month string
  const getApiMonthString = () => {
    if (feeMonthType === "single") {
      return formatMonthString(feeMonth);
    } else {
      return `${formatMonthString(feeMonth)},${formatMonthString(secondMonth)}`;
    }
  };

  // Get month name only (without year) for display
  const getMonthName = (monthWithYear) => {
    if (!monthWithYear) return "";
    return monthWithYear.split('-')[0];
  };

  // API Functions
  const generateFeeSlip = async () => {
    if (!student || !feeMonth) {
      alert("Please select a month");
      return;
    }

    // Validate double month
    if (feeMonthType === "double" && !secondMonth) {
      alert("Please select second month for double month fee slip");
      return;
    }

    // Validate at least one fee is greater than 0
    const total = calculateTotal();
    if (total <= 0) {
      alert("Please enter at least one fee amount greater than 0");
      return;
    }

    setGeneratingSlip(true);
    try {
      const feeData = {
        studentId: student.studentId,
        feeMonth: getApiMonthString(),
        feeBreakdown: feeBreakdown,
        monthType: feeMonthType,
        year: getCurrentYear() // Send current year to API
      };

      const response = await generateFeeReceiptAPI(feeData);
      setSlipData(response.data);

      // Auto open in new tab
      if (response.data.invoiceUrl) {
        window.open(response.data.invoiceUrl, '_blank');
      }

    } catch (error) {
      console.error("Error generating fee slip:", error);
      alert("Failed to generate fee slip. Please try again.");
    } finally {
      setGeneratingSlip(false);
    }
  };

  const handleDownloadSlip = async () => {
    if (!slipData) return;

    try {
      const response = await fetch(slipData.downloadUrl || slipData.invoiceUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const monthText = feeMonthType === "single" ?
          feeMonth :
          `${getMonthName(feeMonth)}-${getMonthName(secondMonth)}-${getCurrentYear()}`;
        a.download = `Fee-Slip-${student?.studentName || 'student'}-${monthText}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      window.open(slipData.downloadUrl || slipData.invoiceUrl, '_blank');
    }
  };

  const handlePrintSlip = () => {
    if (!slipData?.previewUrl && !slipData?.invoiceUrl) return;
    const printWindow = window.open(slipData.previewUrl || slipData.invoiceUrl, '_blank');
    printWindow?.print();
  };

  const handleShareSlip = async () => {
    if (!slipData) return;

    const shareUrl = slipData.previewUrl || slipData.invoiceUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fee Slip - ${student?.studentName || 'Student'}`,
          text: `Fee slip for ${student?.studentName || 'Student'}, ${getMonthDisplayText()}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Sharing cancelled:', error);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const handleEmailSlip = () => {
    if (!slipData) return;

    const shareUrl = slipData.previewUrl || slipData.invoiceUrl;
    const subject = `Fee Slip - ${student?.studentName || 'Student'} - ${getMonthDisplayText()}`;
    const body = `Dear Parent,\n\nPlease find attached the fee slip for ${student?.studentName || 'Student'}.\n\nFee Slip: ${shareUrl}\n\nRegards,\nSchool Administration`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    setSlipData(null);
    setShowBreakdown(false);
    setShowDoubleMonthSelector(false);
    setFeeMonthType("single");
    setSecondMonth("");
    resetBreakdown();
    onClose();
  };

  // Early return
  if (!isOpen || !student) return null;

  // Show loading if months not initialized
  if (feeMonths.length === 0) {
    return (
      <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-3">Loading months...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Generate Fee Slip</h2>
            <div className="flex items-center gap-2">
              <p className="text-gray-600 mt-1">
                For: {student.studentName} (Class {student.className})
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Year: {getCurrentYear()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Student Info Summary */}
          <div className="mb-8 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium font-mono">{student.studentId?.slice(-6) || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Father&apos;s Name</p>
                <p className="font-medium">{student.fatherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tuition Fee</p>
                <p className="font-medium text-green-600">
                  Rs. {student.allTotal?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`font-medium ${student.curBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rs. {student.curBalance?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* Month Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Fee Period Type
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setFeeMonthType("single");
                  setShowDoubleMonthSelector(false);
                  setSecondMonth("");
                }}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${feeMonthType === "single"
                    ? 'bg-linear-to-r from-blue-50 to-indigo-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }`}
              >
                <FileText size={18} />
                Single Month
              </button>
              <button
                onClick={handleDoubleMonthSelect}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${feeMonthType === "double"
                    ? 'bg-linear-to-r from-purple-50 to-pink-50 border-purple-500 text-purple-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }`}
              >
                <FileText size={18} />
                <FileText size={18} />
                Double Month
              </button>
            </div>

            {/* Single Month Selector */}
            <div className={`mb-4 ${feeMonthType === "single" ? 'block' : 'hidden'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Month
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {feeMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => handleSingleMonthSelect(month)}
                    className={`px-3 py-2.5 rounded-lg border transition-all ${feeMonth === month
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-medium">{getMonthName(month)}</div>
                    <div className="text-xs opacity-75">{month.split('-')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Double Month Selector */}
            {feeMonthType === "double" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      First Month
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {feeMonths.slice(0, feeMonths.length - 1).map((month) => (
                        <button
                          key={month}
                          onClick={() => setFeeMonth(month)}
                          className={`px-3 py-2.5 rounded-lg border transition-all ${feeMonth === month
                              ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                              : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                        >
                          <div className="font-medium">{getMonthName(month)}</div>
                          <div className="text-xs opacity-75">{month.split('-')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Second Month
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {getAvailableSecondMonths().map((month) => (
                        <button
                          key={month}
                          onClick={() => setSecondMonth(month)}
                          className={`px-3 py-2.5 rounded-lg border transition-all ${secondMonth === month
                              ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-md'
                              : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                        >
                          <div className="font-medium">{getMonthName(month)}</div>
                          <div className="text-xs opacity-75">{month.split('-')[1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rest of your component remains the same... */}
          {/* Fee Breakdown Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Fee Breakdown</h3>
              <div className="flex gap-2">
                <button
                  onClick={resetBreakdown}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Column 1 - Tuition and Books */}
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tuition Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.tutionFee || ''}
                      onChange={(e) => handleBreakdownChange('tutionFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Books Charges
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.booksCharges || ''}
                      onChange={(e) => handleBreakdownChange('booksCharges', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lab Fee {feeMonthType === "double" && "(for 2 months)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.labFee || ''}
                      onChange={(e) => handleBreakdownChange('labFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Column 2 - Registration and Exams */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.registrationFee || ''}
                      onChange={(e) => handleBreakdownChange('registrationFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.examFee || ''}
                      onChange={(e) => handleBreakdownChange('examFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>


              </div>

              {/* Column 3 - Art, Craft, Karate */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Art & Craft Fee {feeMonthType === "double" && "(for 2 months)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.artCraftFee || ''}
                      onChange={(e) => handleBreakdownChange('artCraftFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Karate Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.karateFee || ''}
                      onChange={(e) => handleBreakdownChange('karateFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>


              </div>

              {/* Column 4 - Late Fee and Others */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Late Fee Fine
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.lateFeeFine || ''}
                      onChange={(e) => handleBreakdownChange('lateFeeFine', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miscellaneous Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                    <input
                      type="number"
                      value={feeBreakdown.miscellaneousFee || ''}
                      onChange={(e) => handleBreakdownChange('miscellaneousFee', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Fee Section - Collapsible */}
            <div className="mt-6">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
              >
                {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Additional Fees (Admission, Annual, Balances)
              </button>

              {showBreakdown && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                      <input
                        type="number"
                        value={feeBreakdown.admissionFee || ''}
                        onChange={(e) => handleBreakdownChange('admissionFee', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Charges
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                      <input
                        type="number"
                        value={feeBreakdown.annualCharges || ''}
                        onChange={(e) => handleBreakdownChange('annualCharges', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      absent Fine
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                      <input
                        type="number"
                        value={feeBreakdown.absentFine || ''}
                        onChange={(e) => handleBreakdownChange('absentFine', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>


                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Others (Custom Fees)
                      </label>

                      <button
                        type="button"
                        onClick={addOtherField}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        + Add
                      </button>
                    </div>

                    {Object.entries(feeBreakdown.others || {}).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">

                        {/* Key */}
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => updateOtherKey(key, e.target.value)}
                          placeholder="Fee name (e.g. Lab Fee)"
                          className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Value */}
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateOtherValue(key, e.target.value)}
                          placeholder="Amount"
                          min="0"
                          className="col-span-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeOtherField(key)}
                          className="col-span-2 text-red-600 hover:bg-red-100 rounded-lg p-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Arrears
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                      <input
                        type="number"
                        value={feeBreakdown.arrears || ''}
                        onChange={(e) => handleBreakdownChange('arrears', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated Slip Preview */}
          {slipData && (
            <div className="mb-8 p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                {feeMonthType === "double" ? "Double Month " : ""}Fee Slip Generated Successfully
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Invoice Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">{slipData.invoiceNumber || 'N/A'}</span>
                    <button
                      onClick={() => copyToClipboard(slipData.invoiceNumber)}
                      className="p-1 hover:bg-green-100 rounded"
                      title="Copy"
                    >
                      <Copy size={14} className="text-green-600" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Fee Period:</span>
                  <span className="font-medium">{getMonthDisplayText()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Generated At:</span>
                  <span className="font-medium">{formatDate(slipData.generatedAt)}</span>
                </div>

                {slipData.amounts && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-blue-700">Rs. {slipData.amounts.total || calculateTotal()}</span>
                    </div>
                    {slipData.amounts.lateFine > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-red-600">Late Fine:</span>
                        <span className="text-red-600">+ Rs. {slipData.amounts.lateFine}</span>
                      </div>
                    )}
                    {slipData.amounts.totalWithFine && (
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-green-200">
                        <span>Total Payable:</span>
                        <span className="text-green-700">Rs. {slipData.amounts.totalWithFine}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => window.open(slipData.previewUrl || slipData.invoiceUrl, '_blank')}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  Preview
                </button>
                <button
                  onClick={handleDownloadSlip}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handlePrintSlip}
                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          )}

          {/* Copy URL Section */}
          {slipData?.previewUrl && (
            <div className="mb-8 p-4 bg-linear-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <label className="block text-sm font-medium text-indigo-700 mb-2">
                Share Fee Slip Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={slipData.previewUrl}
                  className="flex-1 px-4 py-2 bg-white border border-indigo-300 rounded-lg text-sm font-mono truncate"
                />
                <button
                  onClick={() => copyToClipboard(slipData.previewUrl)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${copied
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleShareSlip}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={handleEmailSlip}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <MailIcon size={16} />
                  Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${generatingSlip ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <p className="text-sm text-gray-600">
              Selected: <span className="font-medium">{getMonthDisplayText()}</span>
              {feeMonthType === "double" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                  Double Month
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                Year: {getCurrentYear()}
              </span>
              {slipData && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                  ✓ Generated
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={generatingSlip}
            >
              {slipData ? 'Close' : 'Cancel'}
            </button>

            {!slipData ? (
              <button
                onClick={generateFeeSlip}
                disabled={generatingSlip || (feeMonthType === "double" && !secondMonth)}
                className="px-8 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {generatingSlip ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    {feeMonthType === "double" ? "Generate Double Month Slip" : "Generate Fee Slip"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDone}
                className="px-8 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <CheckCircle size={16} />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}