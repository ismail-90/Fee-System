'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Users, AlertCircle, Search, Eye, Edit, Filter } from 'lucide-react';

// Dummy data for students
const dummyStudents = [
  { id: 1, name: "Ali Ahmed", campus: "Main Campus", grade: "10th", feeStatus: "Paid", pendingAmount: 0, phone: "123-456-7890" },
  { id: 2, name: "Sara Khan", campus: "North Campus", grade: "9th", feeStatus: "Pending", pendingAmount: 5000, phone: "123-456-7891" },
  { id: 3, name: "Ahmed Raza", campus: "South Campus", grade: "11th", feeStatus: "Paid", pendingAmount: 0, phone: "123-456-7892" },
  { id: 4, name: "Fatima Noor", campus: "Main Campus", grade: "10th", feeStatus: "Defaulter", pendingAmount: 15000, phone: "123-456-7893" },
  { id: 5, name: "Bilal Khan", campus: "East Campus", grade: "12th", feeStatus: "Defaulter", pendingAmount: 20000, phone: "123-456-7894" },
];

export default function Students() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Filter students based on active tab and search
  const filteredStudents = dummyStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.campus.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'defaulter') {
      return matchesSearch && student.feeStatus === 'Defaulter';
    }
    return matchesSearch;
  });

  const Card = ({ title, description, count, icon: Icon, onClick, bgColor = 'bg-white' }) => (
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
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Defaulter': 'bg-red-100 text-red-800'
    };
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`;
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage student records and fee status</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            title="All Students"
            description="View and manage all students"
            count={dummyStudents.length}
            icon={Users}
            onClick={() => setActiveTab('all')}
            bgColor={activeTab === 'all' ? 'bg-blue-50' : 'bg-white'}
          />
          <Card
            title="Defaulters"
            description="Students with pending fees"
            count={dummyStudents.filter(s => s.feeStatus === 'Defaulter').length}
            icon={AlertCircle}
            onClick={() => setActiveTab('defaulter')}
            bgColor={activeTab === 'defaulter' ? 'bg-blue-50' : 'bg-white'}
          />
          <Card
            title="Specific Student"
            description="Search and view specific student"
            icon={Search}
            onClick={() => document.getElementById('search-input').focus()}
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
                  id="search-input"
                  type="text"
                  placeholder="Search students by name or campus..."
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
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.campus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.grade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(student.feeStatus)}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{student.pendingAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => viewStudentDetails(student)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Student Details</h3>
                <button 
                  onClick={() => setShowStudentDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h4>
                    <p className="text-gray-600">{selectedStudent.grade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Campus:</span>
                    <p className="font-medium">{selectedStudent.campus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fee Status:</span>
                    <span className={getStatusBadge(selectedStudent.feeStatus)}>
                      {selectedStudent.feeStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending Amount:</span>
                    <p className="font-medium">₹{selectedStudent.pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowStudentDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}