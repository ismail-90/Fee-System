'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Edit,
  Download,
  Filter,
  MoreVertical,
  User,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { getStudentsByClassAPI } from "@/Services/feeService";
import AppLayout from "../../../components/AppLayout";

export default function Students() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [feeStatusFilter, setFeeStatusFilter] = useState("all"); // all, paid, defaulter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    fetchClasses();
  }, [user, loading]);

  const fetchClasses = async () => {
    const mockClasses = ["1", "2", "3", "4", "5"];
    setClasses(mockClasses);
    setSelectedClass("1");
  };

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setPageLoading(true);
      try {
        const res = await getStudentsByClassAPI(selectedClass);
        setStudents(res.students || []);
        setFilteredStudents(res.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // Apply filters
  useEffect(() => {
    let result = students;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(student =>
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply fee status filter
    if (feeStatusFilter === "paid") {
      result = result.filter(student => student.curBalance <= 0);
    } else if (feeStatusFilter === "defaulter") {
      result = result.filter(student => student.curBalance > 0);
    }

    setFilteredStudents(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, searchTerm, feeStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleExportData = () => {
    // Export functionality would go here
    alert("Export functionality to be implemented");
  };

  const handleEditStudent = (student) => {
    // Edit functionality would go here
    alert(`Edit student: ${student.studentName}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalPaid = (student) => {
    return student.feePaid || 0;
  };

  const calculateTotalDue = (student) => {
    return student.curBalance || 0;
  };

  // 🔄 Loader while auth loads
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
              <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
              <p className="text-gray-600 mt-2">Manage and monitor student information and fee status</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{students.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Paid Students</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {students.filter(s => s.curBalance <= 0).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Defaulters</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {students.filter(s => s.curBalance > 0).length}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    Rs. {students.reduce((sum, s) => sum + (s.allTotal || 0), 0).toLocaleString()}
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
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Class Selector */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <ChevronDown className="text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or father's name..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee Status</label>
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
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {pageLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading students data...</p>
            </div>
          ) : (
            <>
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
            {/* ID Column */}
            <td className="p-4">
              <div className="font-mono font-bold text-gray-800 text-sm">
                {student.studentId}
              </div>
            </td>
            
            {/* Student Name Column */}
            <td className="p-4">
              <div className="flex items-center gap-3">
                 
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
            
            {/* Status Column */}
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
            
            {/* Actions Column */}
            <td className="p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(student)}
                  className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEditStudent(student)}
                  className="p-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  title="Edit Student"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleExportData(student)}
                  className="p-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

              {/* Pagination */}
              {paginatedStudents.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredStudents.length}</span> students
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 rounded-lg font-medium ${currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-800">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Header Info */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedStudent.studentName}</h3>
                  <p className="text-gray-600">Student ID: {selectedStudent.studentId}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1 text-sm bg-gray-100 px-3 py-1 rounded-full">
                      <BookOpen size={14} />
                      Class {selectedStudent.className}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${selectedStudent.curBalance > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                      {selectedStudent.curBalance > 0 ? 'Defaulter' : 'Fee Paid'}
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
                      <span className="text-gray-600">Father's Name</span>
                      <span className="font-medium">{selectedStudent.fatherName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Class</span>
                      <span className="font-medium">Class {selectedStudent.className}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Fee Month</span>
                      <span className="font-medium capitalize">{selectedStudent.feeMonth}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Created On</span>
                      <span className="font-medium">{formatDate(selectedStudent.createdAt)}</span>
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
                      <span className="font-medium">Rs. {selectedStudent.tutionFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lab Fee</span>
                      <span className="font-medium">Rs. {selectedStudent.labsFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late Fee Fine</span>
                      <span className="font-medium">Rs. {selectedStudent.lateFeeFine?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exam Fee</span>
                      <span className="font-medium">Rs. {selectedStudent.examFeeTotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Karate Fee</span>
                      <span className="font-medium">Rs. {selectedStudent.karateFeeTotal?.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Fee</span>
                        <span className="text-blue-600">Rs. {selectedStudent.allTotal?.toLocaleString()}</span>
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
                        Rs. {calculateTotalPaid(selectedStudent)?.toLocaleString()}
                      </div>
                    </div>
                    <div className={`p-5 rounded-xl border ${selectedStudent.curBalance > 0
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                      }`}>
                      <div className={`text-sm ${selectedStudent.curBalance > 0 ? 'text-red-700' : 'text-blue-700'} mb-1`}>
                        Current Balance
                      </div>
                      <div className={`text-2xl font-bold ${selectedStudent.curBalance > 0 ? 'text-red-800' : 'text-blue-800'}`}>
                        Rs. {calculateTotalDue(selectedStudent)?.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                      <div className="text-sm text-purple-700 mb-1">Total Fee</div>
                      <div className="text-2xl font-bold text-purple-800">
                        Rs. {selectedStudent.allTotal?.toLocaleString()}
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
                      <div className="font-medium">Rs. {selectedStudent.admissionFeeTotal?.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Registration Fee</div>
                      <div className="font-medium">Rs. {selectedStudent.registrationFee?.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">Annual Charges</div>
                      <div className="font-medium">Rs. {selectedStudent.annualChargesTotal?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditStudent(selectedStudent);
                  setIsDetailModalOpen(false);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Student
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}