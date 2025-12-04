'use client';
import { useState } from 'react';
import { FileText, Search, Filter, Plus, Download, Eye, Edit, Calendar, DollarSign, Hash } from 'lucide-react';
import Sidebar from '../../../components/Sidebar';

// Dummy data for invoices
const dummyInvoices = [
  { 
    id: 'INV-001', 
    student: "Ali Ahmed", 
    campus: "Main Campus", 
    grade: "10th",
    amount: 15000, 
    dueDate: "2024-02-15", 
    status: "Paid",
    issueDate: "2024-01-15",
    paidDate: "2024-01-20",
    pendingAmount: 0
  },
  { 
    id: 'INV-002', 
    student: "Sara Khan", 
    campus: "North Campus", 
    grade: "9th",
    amount: 15000, 
    dueDate: "2024-02-10", 
    status: "Overdue",
    issueDate: "2024-01-10",
    paidDate: null,
    pendingAmount: 15000
  },
  { 
    id: 'INV-003', 
    student: "Ahmed Raza", 
    campus: "South Campus", 
    grade: "11th",
    amount: 15000, 
    dueDate: "2024-02-20", 
    status: "Pending",
    issueDate: "2024-01-20",
    paidDate: null,
    pendingAmount: 15000
  },
  { 
    id: 'INV-004', 
    student: "Fatima Noor", 
    campus: "Main Campus", 
    grade: "10th",
    amount: 15000, 
    dueDate: "2024-01-30", 
    status: "Overdue",
    issueDate: "2024-01-01",
    paidDate: null,
    pendingAmount: 15000
  },
  { 
    id: 'INV-005', 
    student: "Bilal Khan", 
    campus: "East Campus", 
    grade: "12th",
    amount: 15000, 
    dueDate: "2024-02-25", 
    status: "Paid",
    issueDate: "2024-01-25",
    paidDate: "2024-02-01",
    pendingAmount: 0
  },
];


export default function Invoices() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);

  // Filter invoices based on active tab and search
  const filteredInvoices = dummyInvoices.filter(invoice => {
    const matchesSearch = invoice.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.campus.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'overdue') {
      return matchesSearch && invoice.status === 'Overdue';
    } else if (activeTab === 'pending') {
      return matchesSearch && invoice.status === 'Pending';
    } else if (activeTab === 'paid') {
      return matchesSearch && invoice.status === 'Paid';
    }
    return matchesSearch;
  });
 

  const getStatusBadge = (status) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    return `inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`;
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <>
    <Sidebar />
    <div className="p-8 ml-64">
  
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices Management</h1>
        <p className="text-gray-600">Manage student invoices and fee collections</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setActiveTab('all')}
          className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer ${
            activeTab === 'all' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Invoices</h3>
              <p className="text-gray-600 text-sm mt-1">View all generated invoices</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600"/>
            </div>

          </div>
        </div>

        <div 
          onClick={() => document.getElementById('search-input').focus()}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Specific Invoice</h3>
              <p className="text-gray-600 text-sm mt-1">Search by ID or student</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Search className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setShowGenerateInvoice(true)}
          className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generate Invoice</h3>
              <p className="text-gray-600 text-sm mt-1">Create new invoice</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by invoice ID, student name, or campus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Export</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Showing:</span>
                <span className="font-semibold">{filteredInvoices.length} invoices</span>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'all' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'paid' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'pending' 
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === 'overdue' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Issued: {formatDate(invoice.issueDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.student}</div>
                      <div className="text-xs text-gray-500">{invoice.campus} • {invoice.grade}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{invoice.amount.toLocaleString()}
                      </div>
                      {invoice.pendingAmount > 0 && (
                        <div className="text-xs text-red-600">
                          Pending: ₹{invoice.pendingAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        Due: {formatDate(invoice.dueDate)}
                      </div>
                      {isOverdue(invoice.dueDate) && invoice.status !== 'Paid' && (
                        <div className="text-xs text-red-600 font-medium">
                          Overdue
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadge(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => viewInvoiceDetails(invoice)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        title="Edit Invoice"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or generate a new invoice.</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invoice Details</h3>
              <button 
                onClick={() => setShowInvoiceDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{selectedInvoice.id}</h4>
                  <p className="text-gray-600">Fee Invoice</p>
                </div>
                <span className={getStatusBadge(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </span>
              </div>

              {/* Student and Campus Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Student Information</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {selectedInvoice.student}</p>
                    <p><span className="text-gray-600">Grade:</span> {selectedInvoice.grade}</p>
                    <p><span className="text-gray-600">Campus:</span> {selectedInvoice.campus}</p>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Invoice Dates</h5>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Issue Date:</span> {formatDate(selectedInvoice.issueDate)}</p>
                    <p><span className="text-gray-600">Due Date:</span> {formatDate(selectedInvoice.dueDate)}</p>
                    {selectedInvoice.paidDate && (
                      <p><span className="text-gray-600">Paid Date:</span> {formatDate(selectedInvoice.paidDate)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-3">Amount Details</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Amount:</span>
                    <span className="font-medium text-red-600">₹{selectedInvoice.pendingAmount.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.status === 'Paid' && (
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-gray-600 font-semibold">Paid Amount:</span>
                      <span className="font-semibold text-green-600">₹{selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowInvoiceDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showGenerateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Generate New Invoice</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Select Student</option>
                  {dummyInvoices.map(inv => (
                    <option key={inv.id} value={inv.student}>{inv.student} - {inv.grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateInvoice(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}