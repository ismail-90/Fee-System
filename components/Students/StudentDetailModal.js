'use client';
import { Edit } from "lucide-react";

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  onEdit,
  studentRecord
}) {
  if (!isOpen || !student) return null;

  const studentInfo = studentRecord?.data?.studentInfo || {};
  const monthlySummary = studentRecord?.data?.monthlySummary || [];
  const totals = studentRecord?.data?.totals || {};

  const getMonthName = (month) => {
    const map = {
      jan: 'January', feb: 'February', mar: 'March', apr: 'April',
      may: 'May', jun: 'June', jul: 'July', aug: 'August',
      sep: 'September', oct: 'October', nov: 'November', dec: 'December'
    };
    return map[month] || month;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Student Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Student Info Table */}
        <div className="p-6">
          <h3 className="font-medium mb-3">Basic Information</h3>
          <table className="w-full border text-sm">
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">Student ID</td>
                <td className="p-2">{studentInfo.studentId || student.studentId}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Name</td>
                <td className="p-2">{studentInfo.studentName || student.studentName}</td>
              </tr>
              <tr className="border-b">
                <td className="p-2 font-medium">Class</td>
                <td className="p-2">{studentInfo.className || student.className}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Status</td>
                <td className="p-2">
                  {totals.totalRemaining > 0 ? 'Defaulter' : 'Clear'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Fee Summary */}
          <h3 className="font-medium mt-6 mb-3">Fee Summary</h3>
          <table className="w-full border text-sm">
            <tbody>
              <tr className="border-b">
                <td className="p-2 font-medium">Total Paid</td>
                <td className="p-2">Rs. {totals.totalPaid || 0}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Total Remaining</td>
                <td className="p-2">Rs. {totals.totalRemaining || 0}</td>
              </tr>
            </tbody>
          </table>

          {/* Monthly Table */}
          <h3 className="font-medium mt-6 mb-3">Monthly Breakdown</h3>

          {monthlySummary.length === 0 ? (
            <p className="text-sm text-gray-500">No monthly record found.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Invoices</th>
                  <th className="p-2 border">Paid</th>
                  <th className="p-2 border">Remaining</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 border">{getMonthName(m.month)}</td>
                    <td className="p-2 border">{m.invoices || 0}</td>
                    <td className="p-2 border">Rs. {m.paidThisMonth || 0}</td>
                    <td className="p-2 border">Rs. {m.remainingThisMonth || 0}</td>
                    <td className="p-2 border">
                      Rs. {(m.paidThisMonth || 0) + (m.remainingThisMonth || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(student);
              onClose();
            }}
            className="px-4 py-2 bg-black text-white rounded text-sm flex items-center gap-2"
          >
            <Edit size={14} />
            Edit
          </button>
        </div>

      </div>
    </div>
  );
}
