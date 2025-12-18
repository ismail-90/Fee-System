'use client';
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { getStudentsByClassAPI } from "@/Services/feeService";
import AppLayout from "../../components/AppLayout";
import StatsCards from "./StatsCards";
import FiltersSection from "./FiltersSection";
import StudentTable from "./StudentTable";
import StudentDetailModal from "./StudentDetailModal";
import FeeSlipModal from "./FeeSlipModal";

export default function StudentsPage() {
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
  const itemsPerPage = 8;

  // Fee Slip State
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
    const mockClasses = ["1", "2", "3", "4", "5"];
    setClasses(mockClasses);
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
    setCurrentPage(1);
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
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={18} />
                Export Data
              </button>
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
        />
      </div>

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        onEdit={handleEditStudent}
      />

      <FeeSlipModal
        isOpen={isFeeSlipModalOpen}
        onClose={() => setIsFeeSlipModalOpen(false)}
        student={selectedStudentForSlip}
      />
    </AppLayout>
  );
}