'use client';
import { AlertTriangle, X, Loader2, Trash2, CheckCircle } from "lucide-react";

export default function BulkDeleteModal({ 
  isOpen, 
  onClose, 
  selectedCount,
  onConfirm,
  deleting,
  actionType // 👈 NEW
}) {
  if (!isOpen) return null;

  const isActivate = actionType === "activate";

  return (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isActivate ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {isActivate ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <AlertTriangle className="text-red-600" size={24} />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Confirm {isActivate ? "Active" : "InActive"}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={deleting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to{" "}
              <span
                className={`font-bold ${
                  isActivate ? "text-green-600" : "text-red-600"
                }`}
              >
                {isActivate ? "Active" : "InActive"}
              </span>{" "}
              <span className="font-bold">{selectedCount}</span> student(s)?
            </p>

            <div
              className={`p-4 rounded-lg border ${
                isActivate
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <p className="text-sm">
                <span className="font-semibold">Note:</span>{" "}
                {isActivate
                  ? "Students will be re-activated and visible again."
                  : "Students will be marked as inactive."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={deleting}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={deleting}
              className={`px-6 py-2.5 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isActivate
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                }`}
            >
              {deleting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {isActivate ? "Activating..." : "InActivating..."}
                </>
              ) : (
                <>
                  {isActivate ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {isActivate ? "Active Student" : "InActive Student"}
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
