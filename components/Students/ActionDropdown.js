import { useState, useRef, useEffect } from "react";
import { Eye, Edit, Download, MoreVertical, FileText } from "lucide-react";

export default function ActionDropdown({ 
  student, 
  onViewDetails, 
  onGenerateFeeSlip, 
  onEditStudent, 
  onExportData 
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
        
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
          <button
            onClick={() => {
              onViewDetails(student);
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 flex items-center gap-3 transition-colors"
          >
            <Eye size={16} />
            <div>
              <div className="font-medium">View Details</div>
              <div className="text-xs text-gray-500">Complete Student Information</div>
            </div>
          </button>

          <button
            onClick={() => {
              onGenerateFeeSlip(student);
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-orange-50 text-orange-700 flex items-center gap-3 transition-colors"
          >
            <FileText size={16} />
            <div>
              <div className="font-medium">Generate Fee Slip</div>
              <div className="text-xs text-gray-500">Create fee challan</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              onEditStudent(student);
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-700 flex items-center gap-3 transition-colors"
          >
            <Edit size={16} />
            <div>
              <div className="font-medium">Edit Student</div>
              <div className="text-xs text-gray-500">Update student details</div>
            </div>
          </button>
          
          <div className="h-px bg-gray-200 my-1"></div>
          
          <button
            onClick={() => {
              onExportData(student);
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-purple-50 text-purple-700 flex items-center gap-3 transition-colors"
          >
            <Download size={16} />
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-xs text-gray-500">Download student data</div>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}