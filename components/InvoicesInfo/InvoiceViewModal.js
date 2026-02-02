import React, { useState, useEffect } from "react";
import { FileText, XCircle, Loader2 } from "lucide-react";
import { getInvoiceDetailsAPI } from "../../Services/invoiceService";
import InvoicePrintView from "./InvoicePrintView";

const InvoiceViewModal = ({ isOpen, onClose, invoiceId, user }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      setLoading(true);
      getInvoiceDetailsAPI(invoiceId)
        .then((res) => {
          if (res.success) {
            setData(res.data);
          } else {
            alert("Failed to fetch invoice details");
            onClose();
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Error fetching details");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, invoiceId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
           <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               <FileText size={22} className="text-blue-600"/> View Invoice Details
           </h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
              <XCircle size={26} className="text-gray-500"/>
           </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center">
               <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-3" />
               <span className="text-gray-500">Loading Invoice Data...</span>
             </div>
          ) : data ? (
             <InvoicePrintView apiData={data} user={user} />
          ) : (
             <div className="text-red-500">Error loading data</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InvoiceViewModal;