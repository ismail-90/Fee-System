'use client';
import { useState } from "react";
import { 
  FileText, 
  X, 
  Loader2, 
  Download, 
  CheckCircle, 
  Calendar,
  AlertCircle,
  Users
} from "lucide-react";
import { generateBulkInvoicesAPI } from "@/Services/invoiceService";

export default function BulkInvoiceModal({ 
  isOpen, 
  onClose, 
  selectedStudents = [],
  students = [] 
}) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [generating, setGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [error, setError] = useState("");

  // Available months
  const feeMonths = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];

  // Get selected student objects
  const selectedStudentObjects = students.filter(student => 
    selectedStudents.includes(student.studentId)
  );

  // Handle bulk invoice generation
  const handleGenerateBulkInvoices = async () => {
    if (!selectedMonth) {
      setError("Please select a fee month");
      return;
    }

    if (selectedStudentObjects.length === 0) {
      setError("No students selected");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      // Prepare bulk data
      const bulkData = {
        students: selectedStudentObjects.map(student => ({
          studentId: student.studentId,
          feeMonth: selectedMonth
        }))
      };

      console.log("Sending bulk data:", bulkData);

      const response = await generateBulkInvoicesAPI(bulkData);
      
      setInvoiceData(response);
      
      // If there are download URLs, create a zip or handle multiple files
      if (response.downloadUrls && response.downloadUrls.length > 0) {
        alert(`${response.downloadUrls.length} invoices generated successfully!`);
      } else if (response.message) {
        alert(response.message);
      }
      
    } catch (err) {
      console.error("Error generating bulk invoices:", err);
      setError(err.response?.data?.message || "Failed to generate invoices. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (!invoiceData?.downloadUrls || invoiceData.downloadUrls.length === 0) {
      alert("No invoices available for download");
      return;
    }

    // If there's a zip file URL, download it directly
    if (invoiceData.zipUrl) {
      window.open(invoiceData.zipUrl, '_blank');
      return;
    }

    // Otherwise, download each invoice individually
    try {
      for (const url of invoiceData.downloadUrls) {
        window.open(url, '_blank');
        // Small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error("Error downloading invoices:", err);
      alert("Error downloading some invoices");
    }
  };

  // Reset modal
  const handleReset = () => {
    setSelectedMonth("");
    setInvoiceData(null);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Bulk Invoices</h2>
              <p className="text-gray-600 text-sm mt-1">
                Create fee slips for {selectedStudentObjects.length} selected students
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={generating}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Selected Students Summary */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} />
                Selected Students
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {selectedStudentObjects.length} students
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className="text-sm">
                <span className="text-gray-600">Total Fee Amount:</span>
                <span className="font-bold ml-2">
                  Rs. {selectedStudentObjects.reduce((sum, s) => sum + (s.allTotal || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Total Balance:</span>
                <span className="font-bold ml-2">
                  Rs. {selectedStudentObjects.reduce((sum, s) => sum + (s.curBalance || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Student List Preview */}
            <div className="max-h-40 overflow-y-auto mt-3">
              {selectedStudentObjects.slice(0, 5).map((student, index) => (
                <div 
                  key={student._id} 
                  className="flex items-center justify-between py-2 border-b border-blue-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {student.studentName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{student.studentName}</div>
                      <div className="text-xs text-gray-500">Class {student.className} • {student.section || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono">{student.studentId?.slice(-4)}</div>
                </div>
              ))}
              
              {selectedStudentObjects.length > 5 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  + {selectedStudentObjects.length - 5} more students
                </div>
              )}
            </div>
          </div>

          {/* Month Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Select Fee Month for All Selected Students
            </label>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {feeMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month);
                    setError("");
                  }}
                  className={`px-3 py-2.5 rounded-lg border transition-all ${selectedMonth === month
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                >
                  <div className="font-medium">{month.toUpperCase()}</div>
                  <div className="text-xs opacity-75">{month}</div>
                </button>
              ))}
            </div>
            
            {selectedMonth && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                <CheckCircle size={16} />
                <span>Selected month: <span className="font-bold capitalize">{selectedMonth}</span></span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Generated Invoices Preview */}
          {invoiceData && (
            <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Bulk Invoices Generated Successfully
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Generated Invoices:</span>
                  <span className="font-bold">{invoiceData.generatedCount || selectedStudentObjects.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Fee Month:</span>
                  <span className="font-medium capitalize">{selectedMonth}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Generated At:</span>
                  <span className="font-medium">
                    {new Date().toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                
                {invoiceData.totalAmount && (
                  <div className="pt-3 mt-3 border-t border-green-200">
                    <div className="flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-blue-700">Rs. {invoiceData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {invoiceData.zipUrl ? (
                  <button
                    onClick={() => window.open(invoiceData.zipUrl, '_blank')}
                    className="flex-1 min-w-[120px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download All (ZIP)
                  </button>
                ) : invoiceData.downloadUrls?.length > 0 ? (
                  <>
                    <button
                      onClick={handleBulkDownload}
                      className="flex-1 min-w-[120px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download All
                    </button>
                    
                    {invoiceData.downloadUrls.length > 1 && (
                      <button
                        onClick={() => {
                          // Open first invoice for preview
                          window.open(invoiceData.downloadUrls[0], '_blank');
                        }}
                        className="flex-1 min-w-[120px] px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        Preview First
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Fee Summary */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">Bulk Fee Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Students:</span>
                <span className="font-medium">{selectedStudentObjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Fee per Student:</span>
                <span className="font-medium">
                  Rs. {Math.round(selectedStudentObjects.reduce((sum, s) => sum + (s.allTotal || 0), 0) / selectedStudentObjects.length).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Batch Fee:</span>
                <span className="font-medium text-blue-600">
                  Rs. {selectedStudentObjects.reduce((sum, s) => sum + (s.allTotal || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gray-300 my-2"></div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount for Selected Month:</span>
                <span className="text-green-700">
                  Rs. {selectedStudentObjects.reduce((sum, s) => sum + (s.allTotal || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${generating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <p className="text-sm text-gray-600">
              Ready to generate invoices for <span className="font-medium">{selectedStudentObjects.length}</span> students
            </p>
            {invoiceData && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Generated
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={generating}
            >
              {invoiceData ? 'Close' : 'Cancel'}
            </button>
            
            {!invoiceData ? (
              <button
                onClick={handleGenerateBulkInvoices}
                disabled={generating || !selectedMonth}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Generate Bulk Invoices
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
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