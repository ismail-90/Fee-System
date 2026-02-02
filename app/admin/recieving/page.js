'use client';
import { useState, useEffect } from 'react';
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation"; // Router import zaruuri hai
import AppLayout from "../../../components/AppLayout";
import { getInvoicesByCampusAPI } from "../../../Services/invoiceService";
import { getCampusesAPI } from "../../../Services/campusService";
import InvoiceViewModal from "../../../components/InvoicesInfo/InvoiceViewModal"; // Link established
import { Eye, Loader, FileText } from 'lucide-react'; // Added FileText icon


// Define class array
const Classes = [
  "Play Group", "Nursery", "prep", "1", "2", "3", "4", "5", 
  "6", "7", "8", "9", "10", "11", "12"
];

export default function Invoices() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter(); // Router instance

  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  
  // Modal State
  const [showViewModal, setShowViewModal] = useState(false); 
  const [viewInvoiceId, setViewInvoiceId] = useState(null);

  // --- LINK LOGIC: Yeh function Modal ko kholega ---
  const handleViewClick = (invoice) => {
    if (invoice._id || invoice.invoiceId) {
        setViewInvoiceId(invoice._id || invoice.invoiceId); // ID ko set karo
        setShowViewModal(true); // Modal ko show karo
    } else {
        alert("Invoice ID not found");
    }
  };

  const [summary, setSummary] = useState({
    count: 0,
    paid: 0,
    unpaid: 0,
    partial: 0,
    totalAmount: 0,
    totalPaid: 0,
    pendingAmount: 0
  });

  // Fetch campuses on component mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  // Fetch invoices when campus or class is selected
  useEffect(() => {
    if (selectedCampus) {
      fetchInvoices(selectedCampus, selectedClass);
    }
  }, [selectedCampus, selectedClass]);

  const fetchCampuses = async () => {
    try {
      const response = await getCampusesAPI();
      if (response && response.campuses) {
        setCampuses(response.campuses);
        if (response.campuses.length > 0) {
          setSelectedCampus(response.campuses[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching campuses:", error);
    }
  };

  const fetchInvoices = async (campusId, className) => {
    setLoading(true);
    try {
      // Pass class filter to API (send 'all' for no filter)
      const classParam = className === 'all' ? '' : className;
      const response = await getInvoicesByCampusAPI(campusId, classParam);
      if (response && response.success) {
        setInvoices(response.data || []);
        setSummary(response.summary || {
          count: 0,
          paid: 0,
          unpaid: 0,
          partial: 0,
          totalAmount: 0,
          totalPaid: 0,
          pendingAmount: 0
        });
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      setSummary({
        count: 0,
        paid: 0,
        unpaid: 0,
        partial: 0,
        totalAmount: 0,
        totalPaid: 0,
        pendingAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    switch(statusLower) {
      case 'paid':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>;
      case 'unpaid':
      case 'unpa':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unpaid</span>;
      case 'partial':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Partial</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'Unknown'}</span>;
    }
  };

  // Extract unique months for filter
  const uniqueMonths = [...new Set(invoices.map(invoice => invoice.feeMonth).filter(Boolean))];

  // Filter invoices based on search and filters (CLIENT-SIDE FILTERING)
  const filteredInvoices = invoices.filter(invoice => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      invoice.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter - Note: API returns "unPaid" (with capital P)
    const invoiceStatus = invoice.paymentStatus?.toLowerCase();
    const filterStatus = statusFilter.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (filterStatus === 'unpaid') {
        matchesStatus = invoiceStatus === 'unpaid' || invoiceStatus === 'unpa';
      } else {
        matchesStatus = invoiceStatus === filterStatus;
      }
    }
    
    // Month filter
    const matchesMonth = monthFilter === 'all' || 
      invoice.feeMonth?.toLowerCase() === monthFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Calculate filtered summary
  const filteredSummary = {
    count: filteredInvoices.length,
    paid: filteredInvoices.filter(inv => inv.paymentStatus?.toLowerCase() === 'paid').length,
    unpaid: filteredInvoices.filter(inv => 
      inv.paymentStatus?.toLowerCase() === 'unpaid' || 
      inv.paymentStatus?.toLowerCase() === 'unpa'
    ).length,
    partial: filteredInvoices.filter(inv => inv.paymentStatus?.toLowerCase() === 'partial').length,
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    totalPaid: filteredInvoices.reduce((sum, inv) => {
      if (inv.paymentStatus?.toLowerCase() === 'paid') {
        return sum + (inv.totalAmount || 0);
      }
      return sum;
    }, 0),
    pendingAmount: filteredInvoices.reduce((sum, inv) => {
      const status = inv.paymentStatus?.toLowerCase();
      if (status === 'unpaid' || status === 'unpa') {
        return sum + (inv.totalAmount || 0);
      } else if (status === 'partial') {
        return sum + (inv.totalAmount || 0);
      }
      return sum;
    }, 0)
  };

  const getCampusName = (id) => {
    const campus = campuses.find(c => c._id === id);
    return campus ? campus.name : 'Unknown Campus';
  };

  if (authLoading) return <div className="min-h-screen flex justify-center items-center"><Loader className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!user) { router.push("/"); return null; }

  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
            <p className="text-gray-600">View and manage all student invoices</p>
          </div>

          {/* Campus and Class Selection Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Campus</label>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name} - {campus.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Classes</option>
                  {Classes.map((className) => (
                    <option key={className} value={className}>
                      {className === "prep" ? "Prep" : 
                       className === "Play Group" ? "Play Group" : 
                       `Class ${className}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.paid}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Unpaid Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.unpaid}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h1m0 0h-1m1 0v4m0 0l3 3m-3-3l3-3M4 7v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Partial Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.partial}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Invoices</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or invoice #"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-2.5">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Month</label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Months</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setMonthFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Invoice List</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    <span className="font-medium">Filtered:</span> {filteredSummary.count} invoices
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Campus:</span> {getCampusName(selectedCampus)}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Class:</span> {selectedClass === 'all' ? 'All' : selectedClass}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter !== 'all' || monthFilter !== 'all' || searchTerm !== ''
                    ? `Try changing your filters or search term.` 
                    : `No invoices available for the selected filters.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">ID: {invoice._id?.slice(-6) || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {invoice.studentName?.charAt(0) || invoice.student?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.studentName || invoice.student?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.student?.fatherName || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {invoice.className || invoice.student?.className || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {invoice.feeMonth || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice.paymentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.createdAt ? formatDate(invoice.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* EYE BUTTON: Linked to handleViewClick */}
                            <button 
                                onClick={() => handleViewClick(invoice)} 
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" 
                                title="View Invoice"
                            >
                              <Eye size={18} />
                            </button>
                            
                            {/* DETAILS BUTTON: Also linked to handleViewClick for easy access */}
                            <button 
                                onClick={() => handleViewClick(invoice)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            >
                              <FileText size={14} className="mr-1.5" />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- VIEW MODAL COMPONENT (LINKED HERE) --- */}
            <InvoiceViewModal 
                isOpen={showViewModal} 
                onClose={() => { setShowViewModal(false); setViewInvoiceId(null); }} 
                invoiceId={viewInvoiceId}
                user={user}
            />

            {/* Summary Footer */}
            {filteredInvoices.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="text-sm text-gray-600">
                    Showing {filteredInvoices.length} of {invoices.length} invoices
                    {selectedClass !== 'all' && ` for Class ${selectedClass}`}
                    {statusFilter !== 'all' && ` (${statusFilter} only)`}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Previous
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      Next
                    </button> 
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}