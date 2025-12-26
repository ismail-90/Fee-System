import { User, Loader2, Eye, FileText, ChevronDown } from "lucide-react";
import Pagination from "./Pagination";
import { useState } from "react";

export default function StudentTable({
  pageLoading,
  paginatedStudents,
  filteredStudents,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  handleViewDetails,
  handleGenerateFeeSlip,
  selectedStudents = [],
  onSelectStudent,
  onSelectAll,
  onItemsPerPageChange // نیا prop شامل کریں
}) {
  const calculateTotalPaid = (student) => student.feePaid || 0;
  const calculateTotalDue = (student) => student.curBalance || 0;

  // Fix 1: Check if ALL students on current page are selected
  const isAllSelected = paginatedStudents.length > 0 && 
    paginatedStudents.every(student => selectedStudents.includes(student.studentId));

  // Fix 2: Check if SOME students are selected (for indeterminate state)
  const isIndeterminate = paginatedStudents.length > 0 &&
    paginatedStudents.some(student => selectedStudents.includes(student.studentId)) &&
    !isAllSelected;

  // Dropdown state
  const [showItemsDropdown, setShowItemsDropdown] = useState(false);

  const itemsPerPageOptions = [10, 25, 50, 100];

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
      {/* Items Per Page Filter - NEW SECTION */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total students: <span className="font-semibold text-gray-800">{filteredStudents.length}</span>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <button
              onClick={() => setShowItemsDropdown(!showItemsDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              {itemsPerPage} per page
              <ChevronDown size={16} className={`transition-transform ${showItemsDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {showItemsDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowItemsDropdown(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {itemsPerPageOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onItemsPerPageChange(option);
                      setShowItemsDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${option === itemsPerPage ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  >
                    {option} per page
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              {/* Selection Checkbox Column */}
              <th className="p-4 w-12">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isIndeterminate;
                      }
                    }}
                    onChange={() => onSelectAll(paginatedStudents.map(s => s.studentId))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </th>
              
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Father Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Total Fee</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <User className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No students found</p>
                    <p className="text-gray-400 mt-2">Try changing your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr 
                  key={student._id} 
                  className={`hover:bg-gray-50 transition-colors ${selectedStudents.includes(student.studentId) ? 'bg-blue-50' : ''}`}
                >
                  {/* Checkbox Cell */}
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.studentId)}
                        onChange={() => onSelectStudent(student.studentId)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  
                  {/* ID Column */}
                  <td className="p-4">
                    <div className="font-mono font-bold text-gray-800 text-sm">
                      {student.studentId?.slice(-4).toUpperCase()}
                    </div>
                  </td>
                  
                  {/* Student Name Column */}
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
                  
                  {/* Father Name Column */}
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{student.fatherName}</div>
                  </td>
                  
                  {/* Total Fee Column */}
                  <td className="p-4">
                    <div className="font-bold text-gray-900">
                      Rs. {student.allTotal?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Annual</div>
                  </td>
                  
                  {/* Paid Column */}
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
                  
                  {/* Balance Column */}
                  <td className="p-4">
                    <div className={`font-bold ${student.curBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rs. {calculateTotalDue(student)?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {student.curBalance > 0 ? 'Payment due' : 'Cleared'}
                    </div>
                  </td>
                  
                  {/* Actions Column */}
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

      {/* Bulk Selection Status Bar */}
      {selectedStudents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-t border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <p className="text-sm font-medium text-blue-800">
              {selectedStudents.length} student(s) selected
            </p>
          </div>
          <button
            onClick={() => onSelectAll([])}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

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