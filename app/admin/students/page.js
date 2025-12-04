'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Users, 
  AlertCircle, 
  Search, 
  Eye, 
  Edit, 
  Filter,
  Download,
  ChevronDown,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  X
} from 'lucide-react';
import { getStudentsByClassAPI, getAllClassesAPI } from '@/Services/feeService';

export default function Students() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    defaulters: 0,
    totalFee: 0
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchClasses();
  }, [user, router]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    } else {
      setStudents([]);
      setStats({ totalStudents: 0, defaulters: 0, totalFee: 0 });
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      // This would be your API call
      const mockClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      setClasses(mockClasses);
      setSelectedClass('1'); // Default to class 1
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentsByClass = async (className) => {
    setLoading(true);
    try {
      const response = await getStudentsByClassAPI(className);
      setStudents(response.students || []);
      
      // Calculate stats
      const totalStudents = response.totalStudents || 0;
      const totalFee = response.students?.reduce((sum, student) => sum + (student.allTotal || 0), 0) || 0;
      const defaulters = response.students?.filter(s => (s.curBalance || 0) > 0).length || 0;
      
      setStats({
        totalStudents,
        defaulters,
        totalFee
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on active tab and search
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toString().includes(searchTerm);
    
    if (activeTab === 'defaulter') {
      return matchesSearch && (student.curBalance || 0) > 0;
    }
    return matchesSearch;
  });

  const Card = ({ title, description, count, icon: Icon, onClick, bgColor = 'bg-white', value }) => (
    <div 
      onClick={onClick}
      className={`${bgColor} p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
          {count !== undefined && (
            <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
          )}
          {value && (
            <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (balance) => {
    const status = balance > 0 ? 'Defaulter' : 'Paid';
    const styles = {
      'Paid': 'bg-green-100 text-green-800',
      'Defaulter': 'bg-red-100 text-red-800'
    };
    return `inline-flex px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`;
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const exportToCSV = () => {
    // Implement CSV export logic here
    alert('Export functionality will be implemented');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage student records and fee status</p>
        </div>

        {/* Class Selection */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Class</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {selectedClass && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Class {selectedClass}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            title="Total Students"
            description={`In Class ${selectedClass}`}
            count={stats.totalStudents}
            icon={Users}
            onClick={() => setActiveTab('all')}
            bgColor={activeTab === 'all' ? 'bg-blue-50' : 'bg-white'}
          />
          <Card
            title="Defaulters"
            description="Students with pending fees"
            count={stats.defaulters}
            icon={AlertCircle}
            onClick={() => setActiveTab('defaulter')}
            bgColor={activeTab === 'defaulter' ? 'bg-blue-50' : 'bg-white'}
          />
          <Card
            title="Total Fee"
            description="Current class total"
            value={`₹${stats.totalFee.toLocaleString()}`}
            icon={DollarSign}
          />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Showing:</span>
                  <span className="font-semibold">{filteredStudents.length} students</span>
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="mt-2 text-gray-600">Loading students...</p>
                </div>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.studentName?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                              <div className="text-sm text-gray-500">Class {student.className}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.fatherName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{student.feeMonth}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{student.allTotal?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{student.curBalance?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(student.curBalance || 0)}>
                            {student.curBalance > 0 ? 'Defaulter' : 'Paid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => viewStudentDetails(student)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                              title="Fee Receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty State */}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600">
                      {selectedClass 
                        ? searchTerm 
                          ? 'Try adjusting your search criteria.' 
                          : 'No students enrolled in this class.'
                        : 'Please select a class to view students.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Student Fee Details</h3>
                <button 
                  onClick={() => setShowStudentDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Student Info Header */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-semibold text-blue-600">
                        {selectedStudent.studentName?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{selectedStudent.studentName}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-600">ID: {selectedStudent.studentId}</span>
                        <span className="text-gray-600">Class: {selectedStudent.className}</span>
                        <span className="text-gray-600">Father: {selectedStudent.fatherName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getStatusBadge(selectedStudent.curBalance || 0)}>
                      {selectedStudent.curBalance > 0 ? 'Defaulter' : 'Paid'}
                    </span>
                    <div className="mt-2">
                      <span className="text-gray-600">Fee Month: </span>
                      <span className="font-semibold capitalize">{selectedStudent.feeMonth}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column - Basic Fees */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Fees</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Tuition Fee</span>
                      <p className="font-medium">₹{selectedStudent.tutionFee?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Labs Fee</span>
                      <p className="font-medium">₹{selectedStudent.labsFee?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Late Fee Fine</span>
                      <p className="font-medium">₹{selectedStudent.lateFeeFine?.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">Extra Fee</span>
                      <p className="font-medium">₹{selectedStudent.extraFee?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Special Fees */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Special Fees</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Exam Fee</span>
                        <div className="text-right">
                          <p className="font-medium">₹{selectedStudent.examFeeTotal?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Paid: ₹{selectedStudent.examFeeCurrentPaid?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Karate Fee</span>
                        <div className="text-right">
                          <p className="font-medium">₹{selectedStudent.karateFeeTotal?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Paid: ₹{selectedStudent.karateFeeCurrentPaid?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Admission Fee</span>
                        <div className="text-right">
                          <p className="font-medium">₹{selectedStudent.admissionFeeTotal?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Paid: ₹{selectedStudent.admissionFeeCurrentPaid?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm opacity-90">Total Amount</span>
                    <p className="text-2xl font-bold">₹{selectedStudent.allTotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm opacity-90">Amount Paid</span>
                    <p className="text-2xl font-bold">₹{selectedStudent.feePaid?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm opacity-90">Current Balance</span>
                    <p className={`text-2xl font-bold ${selectedStudent.curBalance > 0 ? 'text-red-200' : 'text-green-200'}`}>
                      ₹{selectedStudent.curBalance?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Print Receipt
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Receive Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}