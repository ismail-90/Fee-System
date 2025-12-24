'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Download, 
  Building, 
  Users, 
  Filter, 
  Search, 
  ChevronDown, 
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  Trash2,
  AlertTriangle,
  X
} from "lucide-react";
import AppLayout from "../../../components/AppLayout";
import { getStudentsByCampusAPI } from "../../../Services/studentService";
import { getCampusesAPI } from "../../../Services/campusService";
import StudentTable from "../../../components/Students/StudentTable";
import StudentDetailModal from "../../../components/students/StudentDetailModal";
import FeeSlipModal from "../../../components/Students/FeeSlipModal";
import { deleteMultipleStudentsAPI } from "../../../Services/studentService";


export default function AdminStudents() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // States
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const itemsPerPage = 10;

  // Fee Slip State
  const [isFeeSlipModalOpen, setIsFeeSlipModalOpen] = useState(false);
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState(null);

  // Bulk Actions State
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Campus Info
  const [campusInfo, setCampusInfo] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
      return;
    }
    fetchCampuses();
  }, [user, loading]);

  // Fetch Campuses
  const fetchCampuses = async () => {
    try {
      const res = await getCampusesAPI();
      setCampuses(res.campuses || []);
      if (res.campuses?.length > 0) {
        setSelectedCampus(res.campuses[0]._id);
      }
    } catch (err) {
      console.error("Error fetching campuses:", err);
    }
  };

  // Fetch Students by Campus
  useEffect(() => {
    if (!selectedCampus) return;

    const fetchStudents = async () => {
      setPageLoading(true);
      setSelectedStudents([]); // Clear selection on campus change
      try {
        const res = await getStudentsByCampusAPI(selectedCampus);
        const studentsData = res.data || [];
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setCampusInfo(res.campus);
        
        // Extract unique classes
        const classes = [...new Set(studentsData.map(s => s.className).filter(Boolean))].sort();
        setAvailableClasses(classes);
        
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCampus]);

  // Apply filters
  useEffect(() => {
    let result = students;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student =>
        student.studentName?.toLowerCase().includes(term) ||
        student.studentId?.toLowerCase().includes(term) ||
        student.fatherName?.toLowerCase().includes(term) ||
        student.className?.toLowerCase().includes(term)
      );
    }

    // Apply fee status filter
    if (feeStatusFilter === "paid") {
      result = result.filter(student => student.curBalance <= 0);
    } else if (feeStatusFilter === "defaulter") {
      result = result.filter(student => student.curBalance > 0);
    }

    // Apply class filter
    if (selectedClassFilter !== "all") {
      result = result.filter(student => student.className === selectedClassFilter);
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [students, searchTerm, feeStatusFilter, selectedClassFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate Statistics
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.curBalance <= 0).length;
  const defaulters = students.filter(s => s.curBalance > 0).length;
  const totalRevenue = students.reduce((sum, s) => sum + (s.allTotal || 0), 0);
  const totalBalance = students.reduce((sum, s) => sum + (s.curBalance || 0), 0);

  // Handlers
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleEditStudent = (student) => {
    alert(`Edit student: ${student.studentName} - Feature coming soon!`);
  };

  const handleExportData = () => {
    const data = {
      campus: campusInfo?.name,
      exportDate: new Date().toISOString(),
      students: filteredStudents
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${campusInfo?.name || 'campus'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateFeeSlip = (student) => {
    setSelectedStudentForSlip(student);
    setIsFeeSlipModalOpen(true);
  };

  // Bulk Actions
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = (studentIds = []) => {
    if (studentIds.length === 0) {
      setSelectedStudents([]);
      return;
    }

    const allSelected = studentIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)));
    } else {
      setSelectedStudents(prev => {
        const newSet = new Set([...prev, ...studentIds]);
        return Array.from(newSet);
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    // Optimistic update
    const previousStudents = [...students];
    const previousFiltered = [...filteredStudents];
    const studentsToDelete = selectedStudents;
    
    // Remove from UI immediately
    setStudents(prev => prev.filter(s => !studentsToDelete.includes(s._id)));
    setFilteredStudents(prev => prev.filter(s => !studentsToDelete.includes(s._id)));
    setSelectedStudents([]);
    setIsDeleteModalOpen(false);
    
    setDeleting(true);
    
    try {
      await deleteMultipleStudentsAPI(studentsToDelete);
      alert(`${studentsToDelete.length} student(s) deleted successfully!`);
    } catch (error) {
      console.error("Delete failed, rolling back:", error);
      
      // Rollback on error
      setStudents(previousStudents);
      setFilteredStudents(previousFiltered);
      setSelectedStudents(studentsToDelete);
      
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleting(false);
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
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Students Management</h1>
              <p className="text-gray-600 mt-2">Manage all students across campuses</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bulk Delete Button */}
              {selectedStudents.length > 0 && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Trash2 size={18} />
                  Delete ({selectedStudents.length})
                </button>
              )}
              
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>

          {/* Campus Info & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Stats Cards */}
            
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 ">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalStudents}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Paid Students</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{paidStudents}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      Rs. {totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <DollarSign className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Campus Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Building size={14} />
                  Select Campus
                </span>
              </label>
              <div className="relative">
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name} ({campus.city})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <ChevronDown className="text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Class
              </label>
              <div className="relative">
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="all">All Classes</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <Filter className="text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Fee Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Status
              </label>
              <div className="relative">
                <select
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="all">All Students</option>
                  <option value="paid">Paid Only</option>
                  <option value="defaulter">Defaulters Only</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <Filter className="text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, class..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

      
        </div>

        {/* Students Table */}
        <StudentTable
          pageLoading={pageLoading}
          paginatedStudents={paginatedStudents}
          filteredStudents={filteredStudents}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          setCurrentPage={setCurrentPage}
          handleViewDetails={handleViewDetails}
          handleEditStudent={handleEditStudent}
          handleExportData={handleExportData}
          handleGenerateFeeSlip={handleGenerateFeeSlip}
          selectedStudents={selectedStudents}
          onSelectStudent={handleSelectStudent}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        onEdit={handleEditStudent}
      />

      {/* Fee Slip Modal */}
      <FeeSlipModal
        isOpen={isFeeSlipModalOpen}
        onClose={() => setIsFeeSlipModalOpen(false)}
        student={selectedStudentForSlip}
      />

      {/* Bulk Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Confirm Delete</h2>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  disabled={deleting}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Are you sure you want to delete <span className="font-bold text-red-600">{selectedStudents.length}</span> student(s)?
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Warning:</span> This action cannot be undone. All student data will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add missing imports for icons */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </AppLayout>
  );
}