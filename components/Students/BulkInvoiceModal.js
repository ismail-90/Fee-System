'use client';
import { useState, useEffect } from "react";
import {
  FileText,
  X,
  Loader2,
  Download,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { generateBulkInvoicesAPI } from "../../Services/invoiceService";

export default function BulkInvoiceModal({
  isOpen,
  onClose,
  selectedStudents = [],
  students = []
}) {
  // State declarations
  const [feeMonth, setFeeMonth] = useState("");
  const [feeMonthType, setFeeMonthType] = useState("single");
  const [secondMonth, setSecondMonth] = useState("");
  const [generating, setGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDoubleMonthSelector, setShowDoubleMonthSelector] = useState(false);

  // Dynamic months array
  const [feeMonths, setFeeMonths] = useState([]);

  // Fee breakdown state (Mirrors FeeSlipModal structure)
 const [feeBreakdown, setFeeBreakdown] = useState({
    booksCharges: 0,
    registrationFee: 0,
    examFee: 0,
    labFee: 0,
    artCraftFee: 0,
    karateFee: 0,
    lateFeeFine: 0,
    others: {}, 
    admissionFee: 0,
    annualCharges: 0,
    absentFine: 0,
    miscellaneousFee: 0,
    arrears: 0
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Get selected student objects
  const selectedStudentObjects = students.filter(student =>
    selectedStudents.includes(student.studentId)
  );

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

  // Initialize months
  useEffect(() => {
    const currentYear = getCurrentYear();
    const months = generateMonthsForYear(currentYear);
    setFeeMonths(months);

    // Set default month
    const currentMonthIndex = new Date().getMonth();
    if (months[currentMonthIndex]) {
      setFeeMonth(months[currentMonthIndex]);
    } else if (months.length > 0) {
      setFeeMonth(months[0]);
    }
  }, []);

  // Initialize fee breakdown with average values
  useEffect(() => {
    if (selectedStudentObjects.length > 0 && !isInitialized) {
      const avgExamFee = Math.round(selectedStudentObjects.reduce((sum, s) => sum + (s.examFeeTotal || 0), 0) / selectedStudentObjects.length);
      const avgLabFee = Math.round(selectedStudentObjects.reduce((sum, s) => sum + (s.labsFee || 0), 0) / selectedStudentObjects.length);
      const avgkarateFee = Math.round(selectedStudentObjects.reduce((sum, s) => sum + (s.karateFeeTotal || 0), 0) / selectedStudentObjects.length);
      const avgLateFine = Math.round(selectedStudentObjects.reduce((sum, s) => sum + (s.lateFeeFine || 0), 0) / selectedStudentObjects.length);

      setFeeBreakdown(prev => ({
        ...prev,
        examFeeTotal: avgExamFee || "",
        labFee: avgLabFee || "",
        karateFeeTotal: avgkarateFee || "",
        lateFeeFine: avgLateFine || ""
      }));

      setIsInitialized(true);
    }
  }, [selectedStudentObjects, isInitialized]);
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

  // Helper: Format month string for API
  const formatMonthString = (monthWithYear) => {
    const monthName = monthWithYear.split('-')[0];
    return monthName.toLowerCase();
  };

  // Helper: Get API month string
  const getApiMonthString = () => {
    if (feeMonthType === "single") {
      return formatMonthString(feeMonth);
    } else {
      return `${formatMonthString(feeMonth)},${formatMonthString(secondMonth)}`;
    }
  };

  // Helper: Get month name only
  const getMonthName = (monthWithYear) => {
    if (!monthWithYear) return "";
    return monthWithYear.split('-')[0];
  };

  // Helper: Get display text
  const getMonthDisplayText = () => {
    if (feeMonthType === "single") {
      return feeMonth || "Select Month";
    } else {
      return secondMonth ? `${feeMonth} & ${secondMonth}` : `${feeMonth} & Select Second Month`;
    }
  };

  // Handle double month selection logic
  const handleDoubleMonthSelect = () => {
    setFeeMonthType("double");
    setShowDoubleMonthSelector(true);
    const currentIndex = feeMonths.indexOf(feeMonth);
    if (currentIndex < feeMonths.length - 1) {
      setSecondMonth(feeMonths[currentIndex + 1]);
    } else if (feeMonths.length > 0) {
      setSecondMonth(feeMonths[0]);
    }
  };

  // Get available months for second selection
  const getAvailableSecondMonths = () => {
    if (!feeMonth || feeMonths.length === 0) return [];
    const currentIndex = feeMonths.indexOf(feeMonth);
    return feeMonths.slice(currentIndex + 1);
  };

  // Calculate total
  const calculateTotal = () => {
    return Object.values(feeBreakdown).reduce((sum, value) => {
      const numValue = parseFloat(value) || 0;
      return sum + numValue;
    }, 0);
  };

  // Calculate bulk total
  const calculateBulkTotal = () => {
    return calculateTotal() * selectedStudentObjects.length;
  };

  // Handle inputs
  const handleBreakdownChange = (field, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFeeBreakdown(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Reset function
  const resetBreakdown = () => {
    setFeeBreakdown({
       
        booksCharges: "",
        registrationFee: "",
        examFee: "",
        labFee: "",
        artCraftFee: "",
        karateFee: "",
        lateFeeFine: "",
        others: "",
        admissionFee: "",
        annualCharges: "",
        absentFine: "",
        miscellaneousFee: "",
        arrears: ""
      });
    setIsInitialized(false); // Will trigger the useEffect to re-calculate averages if needed
  };

  // Generate Action
  const handleGenerateBulkInvoices = async () => {
    if (!feeMonth) {
      setError("Please select a month");
      return;
    }
    if (feeMonthType === "double" && !secondMonth) {
      setError("Please select second month for double month fee slip");
      return;
    }

    const total = calculateTotal();
    if (total <= 0) {
      setError("Please enter at least one fee amount greater than 0");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      // Process Breakdown: Convert empty strings to 0
      const processedFeeBreakdown = {};
      Object.entries(feeBreakdown).forEach(([key, value]) => {
        processedFeeBreakdown[key] = parseFloat(value) || 0;
      });

      const bulkData = {
        students: selectedStudentObjects.map(student => ({
          studentId: student.studentId,
          feeMonth: getApiMonthString()
        })),
        feeBreakdown: processedFeeBreakdown,
        monthType: feeMonthType, // Add month type support
        year: getCurrentYear()
      };

      const response = await generateBulkInvoicesAPI(bulkData);
      setInvoiceData(response);

    } catch (err) {
      console.error("Error generating bulk invoices:", err);
      setError(err.response?.data?.message || "Failed to generate invoices.");
    } finally {
      setGenerating(false);
    }
  };

  // Reset Modal
  const handleReset = () => {
    setInvoiceData(null);
    setError("");
    setFeeMonthType("single");
    setSecondMonth("");
    resetBreakdown();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Generate Bulk Invoices</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Students: {selectedStudentObjects.length}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Year: {getCurrentYear()}
              </span>
            </div>
          </div>
          <button onClick={() => { handleReset(); onClose(); }} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Summary Section */}
          <div className="mb-8 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Selected Students</p>
                <p className="font-medium font-mono">{selectedStudentObjects.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Fee Per Student</p>
                <p className="font-medium text-green-600">Rs. {calculateTotal().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Bulk Amount</p>
                <p className="font-medium text-blue-600">Rs. {calculateBulkTotal().toLocaleString()}</p>
              </div>
            </div>
            {/* Student Preview List */}
            <div className="mt-4 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-500 mb-2">Preview (First 5 students):</p>
              <div className="flex flex-wrap gap-2">
                {selectedStudentObjects.slice(0, 5).map(s => (
                  <span key={s.studentId} className="px-2 py-1 bg-white rounded text-xs border border-blue-100">
                    {s.studentName}
                  </span>
                ))}
                {selectedStudentObjects.length > 5 && <span className="text-xs text-gray-500 self-center">+{selectedStudentObjects.length - 5} more</span>}
              </div>
            </div>
          </div>

          {/* Month Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Fee Period Type</label>
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
                <FileText size={18} /> Single Month
              </button>
              <button
                onClick={handleDoubleMonthSelect}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${feeMonthType === "double"
                    ? 'bg-linear-to-r from-purple-50 to-pink-50 border-purple-500 text-purple-700 shadow-sm'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                  }`}
              >
                <FileText size={18} /><FileText size={18} /> Double Month
              </button>
            </div>

            {/* Single Month Selector */}
            <div className={`mb-4 ${feeMonthType === "single" ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {feeMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => { setFeeMonth(month); if (feeMonthType === "double") setFeeMonthType("single"); }}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Month</label>
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {feeMonths.slice(0, feeMonths.length - 1).map((month) => (
                      <button
                        key={month}
                        onClick={() => setFeeMonth(month)}
                        className={`px-2 py-2 rounded-lg border text-sm ${feeMonth === month ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}
                      >
                        {getMonthName(month)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Second Month</label>
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {getAvailableSecondMonths().map((month) => (
                      <button
                        key={month}
                        onClick={() => setSecondMonth(month)}
                        className={`px-2 py-2 rounded-lg border text-sm ${secondMonth === month ? 'bg-purple-600 text-white' : 'bg-gray-50'}`}
                      >
                        {getMonthName(month)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fee Breakdown Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Fee Breakdown (Common for All)</h3>
              <button onClick={resetBreakdown} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1">
                <Trash2 size={14} /> Reset
              </button>
            </div>

         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Column 1 - Tuition and Books */}
              <div className="space-y-4">
              

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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {/* Generated Invoices Preview */}
          {invoiceData && (
            <div className="mb-8 p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} /> Bulk Invoices Generated Successfully
              </h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between"><span className="text-gray-700">Generated:</span><span className="font-bold">{invoiceData.generatedCount || selectedStudentObjects.length} Invoices</span></div>
                <div className="flex justify-between"><span className="text-gray-700">Period:</span><span className="font-medium">{getMonthDisplayText()}</span></div>
                <div className="flex justify-between"><span className="text-gray-700">Total Bulk Value:</span><span className="font-bold text-green-700">Rs. {calculateBulkTotal().toLocaleString()}</span></div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {invoiceData.zipUrl ? (
                  <button onClick={() => window.open(invoiceData.zipUrl, '_blank')} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Download size={16} /> Download ZIP
                  </button>
                ) : invoiceData.downloadUrls?.length > 0 && (
                  <>
                    <button onClick={async () => { for (const url of invoiceData.downloadUrls) { window.open(url, '_blank'); await new Promise(r => setTimeout(r, 500)); } }} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
                      <Download size={16} /> Download All
                    </button>
                    <button onClick={() => window.open(invoiceData.downloadUrls[0], '_blank')} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2">
                      <FileText size={16} /> Preview First
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${generating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <p className="text-sm text-gray-600">Selected: <span className="font-medium">{getMonthDisplayText()}</span> {invoiceData && <span className="text-green-600 font-bold ml-2">✓ Generated</span>}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { handleReset(); onClose(); }} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50" disabled={generating}>
              {invoiceData ? 'Close' : 'Cancel'}
            </button>

            {!invoiceData ? (
              <button onClick={handleGenerateBulkInvoices} disabled={generating || (feeMonthType === "double" && !secondMonth)} className="px-8 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 transition-all flex items-center gap-2 shadow-md">
                {generating ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><FileText size={16} /> {feeMonthType === "double" ? "Generate Double Month" : "Generate Bulk Invoices"}</>}
              </button>
            ) : (
              <button onClick={() => { handleReset(); onClose(); }} className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md">
                <CheckCircle size={16} /> Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}