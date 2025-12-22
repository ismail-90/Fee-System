'use client';
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Download, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { getStudentsByClassAPI } from "@/Services/feeService";
import AppLayout from "../../components/AppLayout";
import StatsCards from "./StatsCards";
import FiltersSection from "./FiltersSection";
import StudentTable from "./StudentTable";
import StudentDetailModal from "./StudentDetailModal";
import FeeSlipModal from "./FeeSlipModal";
import CreateStudentModal from "./CreateStudentModal";
import { createStudentAPI, deleteMultipleStudentsAPI } from "@/Services/studentService";
import BulkDeleteModal from "./BulkDeleteModal";


export default function StudentsPage() {
  const [selectedStudents, setSelectedStudents] = useState([]);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 8;
  const [isFeeSlipModalOpen, setIsFeeSlipModalOpen] = useState(false);
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState(null);

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
    const mockClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    setClasses(mockClasses);
  };

  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setPageLoading(true);
      try {
        const res = await getStudentsByClassAPI(selectedClass);

        // Check if API returned an error message
        if (res.message === "No students found for this class") {
          // Empty array for no students
          setStudents([]);
          setFilteredStudents([]);
          // Optional: show a toast notification
          console.log("No students found for class:", selectedClass);
        } else if (res.data && Array.isArray(res.data)) {
          // Normal case: students found
          setStudents(res.data);
          setFilteredStudents(res.data);
        } else {
          // Handle other response structures
          console.warn("Unexpected API response:", res);
          setStudents([]);
          setFilteredStudents([]);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

const handleCreateStudent = async (studentData) => {
  try {
    console.log("Creating student with data:", studentData);
    
    // API call to create student
    const response = await createStudentAPI(studentData);
    
    if (response.success) {
      alert("Student created successfully!");
      
      // Refresh students list
      const res = await getStudentsByClassAPI(selectedClass);
      if (res.data && Array.isArray(res.data)) {
        setStudents(res.data);
        setFilteredStudents(res.data);
      }
    } else {
      alert("Failed to create student: " + (response.message || "Unknown error"));
    }
  } catch (error) {
    console.error("Error creating student:", error);
    alert("Failed to create student. Please try again.");
  }
};

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
    setCurrentPage(1);
  }, [students, searchTerm, feeStatusFilter]);

const handleBulkDelete = async () => {
  if (selectedStudents.length === 0) {
    alert("Please select students to delete");
    return;
  }

  setDeleting(true);
  try {
    // Step 1: Delete students via API
    const response = await deleteMultipleStudentsAPI(selectedStudents);
    console.log("Delete API Response:", response);
    
    // Step 2: Update local state WITHOUT calling API again
    setStudents(prevStudents => 
      prevStudents.filter(student => !selectedStudents.includes(student._id))
    );
    
    setFilteredStudents(prevFiltered => 
      prevFiltered.filter(student => !selectedStudents.includes(student._id))
    );
    
    // Step 3: Clear selection and close modal
    setSelectedStudents([]);
    setIsDeleteModalOpen(false);
    
    // Step 4: Show success message
    alert(`${selectedStudents.length} student(s) deleted successfully!`);
    
  } catch (error) {
    console.error("Error deleting students:", error);
    
    // Better error handling
    if (error.response?.data?.message) {
      alert(`Failed: ${error.response.data.message}`);
    } else if (error.message.includes("Network Error")) {
      alert("Network error. Please check your connection.");
    } else {
      alert("Failed to delete students. Please try again.");
    }
    
  } finally {
    setDeleting(false);
  }
};

// Fix the handleSelectAll function
const handleSelectAll = (studentIds = []) => {
  if (studentIds.length === 0) {
    // Clear all selection
    setSelectedStudents([]);
    return;
  }

  // Get all student IDs from current page
  const currentPageIds = paginatedStudents.map(student => student.studentId);
  
  // Check if all are already selected
  const allSelected = currentPageIds.every(id => 
    selectedStudents.includes(id)
  );
  
  if (allSelected) {
    // Deselect all from current page
    setSelectedStudents(prev => 
      prev.filter(id => !currentPageIds.includes(id))
    );
  } else {
    // Select all from current page (add only missing ones)
    const newSelection = [...new Set([...selectedStudents, ...currentPageIds])];
    setSelectedStudents(newSelection);
  }
};

 

// Fix handleSelectStudent to use studentId
const handleSelectStudent = (studentId) => {
  setSelectedStudents(prev => {
    if (prev.includes(studentId)) {
      return prev.filter(id => id !== studentId);
    } else {
      return [...prev, studentId];
    }
  });
};

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

  const handleEditStudent = (student) => {
    alert(`Edit student: ${student.studentName}`);
  };

  const handleExportData = () => {
    alert("Export functionality to be implemented");
  };

  const handleGenerateFeeSlip = (student) => {
    setSelectedStudentForSlip(student);
    setIsFeeSlipModalOpen(true);
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
              <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
              <p className="text-gray-600 mt-2">Manage and monitor student information and fee status</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <PlusCircle size={18} />
                  Create Student
                </button>
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
          </div>

          <StatsCards students={students} />
        </div>

        <FiltersSection
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          feeStatusFilter={feeStatusFilter}
          setFeeStatusFilter={setFeeStatusFilter}
        />
<BulkDeleteModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  selectedCount={selectedStudents.length}
  onConfirm={handleBulkDelete}
  deleting={deleting}
/>
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

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        onEdit={handleEditStudent}
      />
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStudent={handleCreateStudent}
      />
      <FeeSlipModal
        isOpen={isFeeSlipModalOpen}
        onClose={() => setIsFeeSlipModalOpen(false)}
        student={selectedStudentForSlip}
      />
    </AppLayout>
  );
}