'use client';
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle, FileText, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { getStudentsByClassAPI } from "../../Services/studentService";
import AppLayout from "../../components/AppLayout";
import StatsCards from "./StatsCards";
import FiltersSection from "./FiltersSection";
import StudentTable from "./StudentTable";
import StudentDetailModal from "./StudentDetailModal";
import FeeSlipModal from "./FeeSlipModal";
import CreateStudentModal from "./CreateStudentModal";
import { createStudentAPI, deleteMultipleStudentsAPI } from "../../Services/studentService";
import BulkDeleteModal from "./BulkDeleteModal";
import BulkInvoiceModal from "./BulkInvoiceModal";

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
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [feeMonths, setFeeMonths] = useState([]);
  const [selectedFeeMonth, setSelectedFeeMonth] = useState("all");
  const [isBulkInvoiceModalOpen, setIsBulkInvoiceModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentSessionFilter, setStudentSessionFilter] = useState("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 8;
  const [isFeeSlipModalOpen, setIsFeeSlipModalOpen] = useState(false);
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState(null);
  const selectedStudentObjects = students.filter(student =>
    selectedStudents.includes(student.studentId)
  );

  const allInactive =
    selectedStudentObjects.length > 0 &&
    selectedStudentObjects.every(student => student.status === "inactive");
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
          setStudents([]);
          setFilteredStudents([]);
          setSections([]); // Clear sections if no students
          setFeeMonths([]); // Clear months if no students
        } else if (res.data && Array.isArray(res.data)) {
          setStudents(res.data);
          setFilteredStudents(res.data);

          // Extract unique sections from students
          const uniqueSections = [...new Set(res.data
            .map(student => student.section)
            .filter(section => section && section.trim() !== '')
          )];
          setSections(uniqueSections);

          // Extract unique fee months from students
          const uniqueFeeMonths = [...new Set(res.data
            .map(student => student.feeMonth)
            .filter(month => month && month.trim() !== '')
          )];
          setFeeMonths(uniqueFeeMonths);

        } else {
          console.warn("Unexpected API response:", res);
          setStudents([]);
          setFilteredStudents([]);
          setSections([]);
          setFeeMonths([]);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
        setFilteredStudents([]);
        setSections([]);
        setFeeMonths([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleCreateStudent = async (studentData) => {
    try {
      console.log("Creating student with data:", studentData);

      const response = await createStudentAPI(studentData);

      if (response.success) {
        alert("Student created successfully!");

        // Refresh students list
        const res = await getStudentsByClassAPI(selectedClass);
        if (res.data && Array.isArray(res.data)) {
          setStudents(res.data);
          setFilteredStudents(res.data);

          // Update sections and months
          const uniqueSections = [...new Set(res.data
            .map(student => student.section)
            .filter(section => section && section.trim() !== '')
          )];
          setSections(uniqueSections);

          const uniqueFeeMonths = [...new Set(res.data
            .map(student => student.feeMonth)
            .filter(month => month && month.trim() !== '')
          )];
          setFeeMonths(uniqueFeeMonths);
        }
      } else {
        alert("Failed to create student: " + (response.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Failed to create student. Please try again.");
    }
  };

  // Apply filters - اب sections aur fee month bhi include karein
  useEffect(() => {
    let result = students;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(student =>
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply section filter
    if (selectedSection !== "all") {
      result = result.filter(student => student.section === selectedSection);
    }

    // Apply fee month filter
    if (selectedFeeMonth !== "all") {
      result = result.filter(student => student.feeMonth === selectedFeeMonth);
    }

    // Apply student session filter
    if (studentSessionFilter !== "all") {
      result = result.filter(student => student.session === studentSessionFilter);
    }

    // Apply student status filter

    if (studentStatusFilter === "active") {
      result = result.filter(student => student.status === "active");
    } else if (studentStatusFilter === "inactive") {
      result = result.filter(student => student.status === "inactive");
    }

    setFilteredStudents(result);
    setCurrentPage(1);
  }, [students, searchTerm, selectedSection, selectedFeeMonth, studentStatusFilter, studentSessionFilter]);

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select students to delete");
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteMultipleStudentsAPI(selectedStudents);
      console.log("Delete API Response:", response);

      setStudents(prevStudents =>
        prevStudents.filter(student => !selectedStudents.includes(student._id))
      );

      setFilteredStudents(prevFiltered =>
        prevFiltered.filter(student => !selectedStudents.includes(student._id))
      );

      // Update sections after deletion
      const updatedStudents = students.filter(student => !selectedStudents.includes(student._id));
      const uniqueSections = [...new Set(updatedStudents
        .map(student => student.section)
        .filter(section => section && section.trim() !== '')
      )];
      setSections(uniqueSections);

      setSelectedStudents([]);
      setIsDeleteModalOpen(false);
      alert(`${selectedStudents.length} student(s) InActive successfully!`);

    } catch (error) {
      console.error("Error deleting students:", error);

      if (error.response?.data?.message) {
        alert(`Failed: ${error.response.data.message}`);
      } else if (error.message.includes("Network Error")) {
        alert("Network error. Please check your connection.");
      } else {
        alert("Failed to InActive students. Please try again.");
      }

    } finally {
      setDeleting(false);
    }
  };

  const handleSelectAll = (studentIds = []) => {
    if (studentIds.length === 0) {
      setSelectedStudents([]);
      return;
    }

    const currentPageIds = paginatedStudents.map(student => student.studentId);
    const allSelected = currentPageIds.every(id =>
      selectedStudents.includes(id)
    );

    if (allSelected) {
      setSelectedStudents(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      const newSelection = [...new Set([...selectedStudents, ...currentPageIds])];
      setSelectedStudents(newSelection);
    }
  };

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
                {/* Create Student Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <PlusCircle size={18} />
                  Create Student
                </button>

                {/* Bulk Invoice Button (Only show when students are selected) */}
                {selectedStudents.length > 0 && (
                  <button
                    onClick={() => setIsBulkInvoiceModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <FileText size={18} />
                    Bulk Invoice ({selectedStudents.length})
                  </button>
                )}

                {/* Delete/Active-Inactive Button */}
                {selectedStudents.length > 0 && (() => {
                  const selectedStudentObjects = students.filter(student =>
                    selectedStudents.includes(student.studentId)
                  );
                  const allInactive = selectedStudentObjects.every(
                    student => student.status === "inactive"
                  );

                  return (
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg
          ${allInactive
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        }`}
                    >
                      {allInactive ? <CheckCircle size={18} /> : <Trash2 size={18} />}
                      {allInactive
                        ? `Active (${selectedStudents.length})`
                        : `InActive (${selectedStudents.length})`}
                    </button>
                  );
                })()}

              
              </div>

            </div>
          </div>

          <StatsCards students={students} />
        </div>

        {/* FiltersSection ko ab saare props pass karein */}
        <FiltersSection
          classes={classes}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          studentStatusFilter={studentStatusFilter}
          setStudentStatusFilter={setStudentStatusFilter}
          studentSessionFilter={studentSessionFilter}
          setStudentSessionFilter={setStudentSessionFilter}
          sections={sections}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          feeMonths={feeMonths}
          selectedFeeMonth={selectedFeeMonth}
          setSelectedFeeMonth={setSelectedFeeMonth}
        />

        <BulkDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          selectedCount={selectedStudents.length}
          onConfirm={handleBulkDelete}
          deleting={deleting}
          actionType={allInactive ? "activate" : "inactivate"} // ✅ ALWAYS CORRECT
        />

        <BulkInvoiceModal
          isOpen={isBulkInvoiceModalOpen}
          onClose={() => setIsBulkInvoiceModalOpen(false)}
          selectedStudents={selectedStudents}
          students={students}
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