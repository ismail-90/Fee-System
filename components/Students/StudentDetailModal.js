'use client';
import { User, BookOpen, DollarSign, Edit } from "lucide-react";

export default function StudentDetailModal({ isOpen, onClose, student, onEdit }) {
  if (!isOpen || !student) return null;

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

  const calculateTotalPaid = (student) => {
    return student.feePaid || 0;
  };

  const calculateTotalDue = (student) => {
    return student.curBalance || 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Header Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {student.studentName?.charAt(0) || '?'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{student.studentName}</h3>
              <p className="text-gray-600">Student ID: {student.studentId?.slice(-4).toUpperCase() || 'N/A'}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
                  <BookOpen size={14} />
                  Class {student.className || 'N/A'}
                </span>
                <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${student.curBalance > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                  }`}>
                  {student.curBalance > 0 ? 'Defaulter' : 'Fee Paid'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Personal Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Father Name</span>
                  <span className="font-medium">{student.fatherName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Class</span>
                  <span className="font-medium">Class {student.className || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fee Month</span>
                  <span className="font-medium capitalize">{student.feeMonth || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Created On</span>
                  <span className="font-medium">{formatDate(student.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Fee Breakdown
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuition Fee</span>
                  <span className="font-medium">Rs. {student.tutionFee?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lab Fee</span>
                  <span className="font-medium">Rs. {student.labsFee?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Late Fee Fine</span>
                  <span className="font-medium">Rs. {student.lateFeeFine?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exam Fee</span>
                  <span className="font-medium">Rs. {student.examFeeTotal?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Karate Fee</span>
                  <span className="font-medium">Rs. {student.karateFeeTotal?.toLocaleString() || '0'}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Fee</span>
                    <span className="text-blue-600">Rs. {student.allTotal?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                  <div className="text-sm text-green-700 mb-1">Total Paid</div>
                  <div className="text-2xl font-bold text-green-800">
                    Rs. {calculateTotalPaid(student)?.toLocaleString()}
                  </div>
                </div>
                <div className={`p-5 rounded-xl border ${student.curBalance > 0
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                  }`}>
                  <div className={`text-sm ${student.curBalance > 0 ? 'text-red-700' : 'text-blue-700'} mb-1`}>
                    Current Balance
                  </div>
                  <div className={`text-2xl font-bold ${student.curBalance > 0 ? 'text-red-800' : 'text-blue-800'}`}>
                    Rs. {calculateTotalDue(student)?.toLocaleString()}
                  </div>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                  <div className="text-sm text-purple-700 mb-1">Total Fee</div>
                  <div className="text-2xl font-bold text-purple-800">
                    Rs. {student.allTotal?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Admission Fee</div>
                  <div className="font-medium">Rs. {student.admissionFeeTotal?.toLocaleString() || '0'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Registration Fee</div>
                  <div className="font-medium">Rs. {student.registrationFee?.toLocaleString() || '0'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Annual Charges</div>
                  <div className="font-medium">Rs. {student.annualChargesTotal?.toLocaleString() || '0'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(student);
              onClose();
            }}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Student
          </button>
        </div>
      </div>
    </div>
  );
}