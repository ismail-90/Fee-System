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
      invoice.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.accountant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.students?.some(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const viewInvoice = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadInvoice = (pdfUrl) => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `bulk-invoice-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
              placeholder="Search by campus, accountant, or student name..."
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

                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student 1</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student 2</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student 3</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {/* Serial Number */}
                      <td className="p-4 text-sm text-gray-600">{index + 1}</td>

                      {/* Student 1 */}
                      <td className="p-4">
                        {invoice.students && invoice.students[0] ? (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 text-sm">{invoice.students[0].name}</div>
                            <div className="text-xs text-gray-500">
                              Father: {invoice.students[0].fatherName}
                            </div>
                            <div className="text-xs">
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Class {invoice.students[0].className}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm italic">-</div>
                        )}
                      </td>

                      {/* Student 2 */}
                      <td className="p-4">
                        {invoice.students && invoice.students[1] ? (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 text-sm">{invoice.students[1].name}</div>
                            <div className="text-xs text-gray-500">
                              Father: {invoice.students[1].fatherName}
                            </div>
                            <div className="text-xs">
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Class {invoice.students[1].className}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm italic">-</div>
                        )}
                      </td>

                      {/* Student 3 */}
                      <td className="p-4">
                        {invoice.students && invoice.students[2] ? (
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 text-sm">{invoice.students[2].name}</div>
                            <div className="text-xs text-gray-500">
                              Father: {invoice.students[2].fatherName}
                            </div>
                            <div className="text-xs">
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                Class {invoice.students[2].className}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm italic">-</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">{formatDate(invoice.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${invoice.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {invoice.paymentStatus || "unPaid"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewInvoice(invoice.pdfUrl)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs font-medium"
                            title="View Invoice PDF"
                          >
                            <Eye size={12} />
                            View
                          </button>

                          <button
                            onClick={() => downloadInvoice(invoice.pdfUrl)}
                            className="p-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>

                          {/* Extra Students Button (اگر 3 سے زیادہ ہوں) */}
                          {invoice.totalStudents > 3 && (
                            <button
                              onClick={() => {
                                const extraStudents = invoice.students.slice(3);
                                const studentList = extraStudents.map((s, i) =>
                                  `${i + 4}. ${s.name} (Class ${s.className})`
                                ).join("\n");
                                alert(`Additional Students:\n\n${studentList}\n\nTotal: ${invoice.totalStudents} students`);
                              }}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                              title={`${invoice.totalStudents - 3} more students`}
                            >
                              +{invoice.totalStudents - 3}
                            </button>
                          )}
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