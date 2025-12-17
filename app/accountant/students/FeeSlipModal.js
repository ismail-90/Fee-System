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
  Mail as MailIcon
} from "lucide-react";
import { generateFeeReceiptAPI } from "@/Services/feeService";

export default function FeeSlipModal({ isOpen, onClose, student }) {
  // State declarations must come BEFORE any conditional returns
  const [feeMonth, setFeeMonth] = useState("");
  const [generatingSlip, setGeneratingSlip] = useState(false);
  const [slipData, setSlipData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [feeMonths, setFeeMonths] = useState([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]);

  // Initialize with student's fee month or first month
  useEffect(() => {
    if (student?.feeMonth) {
      // Try to match the month from student's feeMonth
      const month = feeMonths.find(m => 
        m.toLowerCase().includes(student.feeMonth.toLowerCase())
      );
      setFeeMonth(month || feeMonths[0]);
    } else {
      setFeeMonth(feeMonths[0]);
    }
  }, [student]);

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

  // API Functions
  const generateFeeSlip = async () => {
    if (!student || !feeMonth) {
      alert("Please select a month");
      return;
    }

    setGeneratingSlip(true);
    try {
      const feeData = {
        studentId: student.studentId,
        feeMonth: feeMonth.substring(0, 3).toLowerCase()
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
        a.download = `Fee-Slip-${student?.studentName || 'student'}-${slipData.feeMonth || feeMonth}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to direct URL
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
          text: `Fee slip for ${student?.studentName || 'Student'}, ${slipData.feeMonth || feeMonth}`,
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
    const subject = `Fee Slip - ${student?.studentName || 'Student'} - ${slipData.feeMonth || feeMonth}`;
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
    onClose();
  };

  // Early return AFTER all hooks are called
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Generate Fee Slip</h2>
            <p className="text-gray-600 mt-1">
              For: {student.studentName} (Class {student.className})
            </p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium font-mono">{student.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Father&apos;s Name</p>
                <p className="font-medium">{student.fatherName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Fee</p>
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

          {/* Month Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Fee Month
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {feeMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => setFeeMonth(month)}
                  className={`px-3 py-2.5 rounded-lg border transition-all ${feeMonth === month
                      ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                >
                  <div className="font-medium">{month.substring(0, 3)}</div>
                  <div className="text-xs opacity-75">{month.substring(3)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generated Slip Preview */}
          {slipData && (
            <div className="mb-8 p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Fee Slip Generated Successfully
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
                  <span className="text-gray-700">Fee Month:</span>
                  <span className="font-medium">{slipData.feeMonth || feeMonth}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Generated At:</span>
                  <span className="font-medium">{formatDate(slipData.generatedAt)}</span>
                </div>
                
                {slipData.amounts && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-blue-700">Rs. {slipData.amounts.total || student.allTotal}</span>
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

          {/* Fee Details Preview */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">Fee Details Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tuition Fee:</span>
                <span className="font-medium">Rs. {student.tutionFee?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lab Fee:</span>
                <span className="font-medium">Rs. {student.labsFee?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exam Fee:</span>
                <span className="font-medium">Rs. {student.examFeeTotal?.toLocaleString() || '0'}</span>
              </div>
              <div className="h-px bg-gray-300 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">Rs. {student.allTotal?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

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
              Selected: <span className="font-medium capitalize">{feeMonth}</span>
            </p>
            {slipData && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Generated
              </span>
            )}
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
                disabled={generatingSlip}
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
                    Generate Fee Slip
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