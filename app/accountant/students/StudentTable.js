import { User, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2, Eye, FileText } from "lucide-react";
import Pagination from "./Pagination";

export default function StudentTable({
  pageLoading,
  paginatedStudents,
  filteredStudents,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  handleViewDetails,
  handleEditStudent,
  handleExportData,
  handleGenerateFeeSlip
}) {
  const calculateTotalPaid = (student) => student.feePaid || 0;
  const calculateTotalDue = (student) => student.curBalance || 0;

  if (pageLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading students data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Father Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Total Fee</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <User className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No students found</p>
                    <p className="text-gray-400 mt-2">Try changing your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-gray-800 text-sm">
                      {student.studentId?.slice(-4).toUpperCase()}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {student.studentName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-xs text-gray-500">Class {student.className}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{student.fatherName}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="font-bold text-gray-900">
                      Rs. {student.allTotal?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Annual</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="font-bold text-green-600">
                      Rs. {calculateTotalPaid(student)?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {student.allTotal ? 
                        `${Math.round((calculateTotalPaid(student) / student.allTotal) * 100)}% paid` : 
                        '0% paid'
                      }
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className={`font-bold ${student.curBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rs. {calculateTotalDue(student)?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {student.curBalance > 0 ? 'Payment due' : 'Cleared'}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${student.curBalance > 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                      {student.curBalance > 0 ? (
                        <>
                          <XCircle className="mr-1.5" size={12} />
                          Defaulter
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1.5" size={12} />
                          Paid
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {student.feeMonth || 'N/A'}
                    </div>
                  </td>
                  
                  {/* Direct Action Icons */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* View Details Icon */}
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {/* Generate Fee Slip Icon */}
                      <button
                        onClick={() => handleGenerateFeeSlip(student)}
                        className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                        title="Generate Fee Slip"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginatedStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          filteredStudents={filteredStudents}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}