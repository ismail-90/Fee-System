'use client';
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";

export default function BulkDeleteModal({ 
  isOpen, 
  onClose, 
  selectedCount,
  onConfirm,
  deleting
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Confirm InActive</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={deleting}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to InActive <span className="font-bold text-red-600">{selectedCount}</span> student(s)?
            </p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Warning:</span> This action cannot be undone. Student will be marked as inactive.
              </p>
            </div>
          </div>

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
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  InActivating...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  InActive Student
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}