'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Building, 
  Plus, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  X,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { 
  createCampusAPI, 
  getCampusesAPI, 
  createAccountantAPI
} from "@/Services/campusService";

export default function Campuses() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCampus, setShowCreateCampus] = useState(false);
  const [showCreateAccountant, setShowCreateAccountant] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [createCampusForm, setCreateCampusForm] = useState({
    name: "",
    city: "",
    phone_no: "",
  });

  const [accountantForm, setAccountantForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    campus_id: "",
  });

  // Fetch campuses on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchCampuses();
  }, [isAuthenticated, router]);

  // Fetch campuses function
  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const response = await getCampusesAPI();
      if (response.campuses) {
        setCampuses(response.campuses);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
      showMessage('error', 'Failed to fetch campuses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle create campus
  const handleCreateCampus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      const response = await createCampusAPI(createCampusForm);
      showMessage('success', 'Campus created successfully!');
      setShowCreateCampus(false);
      setCreateCampusForm({ name: "", city: "", phone_no: "" });
      fetchCampuses(); // Refresh the list
    } catch (error) {
      console.error('Error creating campus:', error);
      showMessage('error', error.response?.data?.message || 'Failed to create campus');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create accountant
  const handleCreateAccountant = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      const response = await createAccountantAPI(accountantForm);
      showMessage('success', 'Accountant created successfully!');
      setShowCreateAccountant(false);
      setAccountantForm({ 
        name: "", 
        email: "", 
        phone_no: "", 
        password: "",
        campus_id: "" 
      });
      fetchCampuses(); // Refresh the list
    } catch (error) {
      console.error('Error creating accountant:', error);
      showMessage('error', error.response?.data?.message || 'Failed to create accountant');
    } finally {
      setActionLoading(false);
    }
  };

  // // Handle update campus
  // const handleUpdateCampus = async (id, data) => {
  //   setActionLoading(true);
  //   try {
  //     await updateCampusAPI(id, data);
  //     showMessage('success', 'Campus updated successfully!');
  //     setEditingCampus(null);
  //     fetchCampuses();
  //   } catch (error) {
  //     console.error('Error updating campus:', error);
  //     showMessage('error', error.response?.data?.message || 'Failed to update campus');
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // Handle delete campus
  // const handleDeleteCampus = async (id) => {
  //   if (!window.confirm('Are you sure you want to delete this campus?')) return;
    
  //   setActionLoading(true);
  //   try {
  //     await deleteCampusAPI(id);
  //     showMessage('success', 'Campus deleted successfully!');
  //     fetchCampuses();
  //   } catch (error) {
  //     console.error('Error deleting campus:', error);
  //     showMessage('error', error.response?.data?.message || 'Failed to delete campus');
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // Filter campuses based on search
  const filteredCampuses = campuses.filter(campus =>
    campus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.phone_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Card = ({ title, description, icon: Icon, onClick, bgColor = 'bg-white' }) => (
    <div 
      onClick={onClick}
      className={`${bgColor} p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated || user === null) {
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
        {/* Message Alert */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })} 
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Campuses Management</h1>
          <p className="text-gray-600">Manage campuses and assign accountants</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            title="All Campuses"
            description="View and manage all campuses"
            icon={Building}
            onClick={() => setActiveTab('all')}
            bgColor={activeTab === 'all' ? 'bg-blue-50' : 'bg-white'}
          />
          <Card
            title="Create Campus"
            description="Add new campus to system"
            icon={Plus}
            onClick={() => setShowCreateCampus(true)}
          />
          <Card
            title="Create Accountant"
            description="Assign accountant to campus"
            icon={UserPlus}
            onClick={() => setShowCreateAccountant(true)}
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
                  placeholder="Search campuses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">{filteredCampuses.length} campuses</span>
              </div>
            </div>
          </div>

          {/* Campuses Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="mt-2 text-gray-600">Loading campuses...</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campus Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accountants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampuses.map((campus) => (
                    <tr key={campus._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campus.name}</div>
                            {editingCampus === campus._id ? (
                              <input
                                type="text"
                                defaultValue={campus.name}
                                className="mt-1 px-2 py-1 text-sm border rounded"
                                onBlur={(e) => handleUpdateCampus(campus._id, { name: e.target.value })}
                              />
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingCampus === campus._id ? (
                          <input
                            type="text"
                            defaultValue={campus.city}
                            className="px-2 py-1 text-sm border rounded"
                            onBlur={(e) => handleUpdateCampus(campus._id, { city: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm text-gray-900">{campus.city}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingCampus === campus._id ? (
                          <input
                            type="text"
                            defaultValue={campus.phone_no}
                            className="px-2 py-1 text-sm border rounded"
                            onBlur={(e) => handleUpdateCampus(campus._id, { phone_no: e.target.value })}
                          />
                        ) : (
                          campus.phone_no
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {campus.accountants?.length || 0} accountant(s)
                        </div>
                        {campus.accountants?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {campus.accountants.map(acc => acc.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          campus.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {campus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(campus.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setEditingCampus(editingCampus === campus._id ? null : campus._id)}
                            className={`p-1 rounded ${
                              editingCampus === campus._id 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            disabled={actionLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCampus(campus._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Empty State */}
            {!loading && filteredCampuses.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campuses found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search or ' : ''}
                  <button 
                    onClick={() => setShowCreateCampus(true)} 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    create a new campus
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Campus Modal */}
        {showCreateCampus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create New Campus</h3>
                <button
                  onClick={() => setShowCreateCampus(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCampus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Name *
                  </label>
                  <input 
                    type="text" 
                    value={createCampusForm.name}
                    onChange={(e) => setCreateCampusForm({...createCampusForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input 
                    type="text" 
                    value={createCampusForm.city}
                    onChange={(e) => setCreateCampusForm({...createCampusForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input 
                    type="text" 
                    value={createCampusForm.phone_no}
                    onChange={(e) => setCreateCampusForm({...createCampusForm, phone_no: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateCampus(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {actionLoading ? 'Creating...' : 'Create Campus'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Accountant Modal */}
        {showCreateAccountant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create Accountant</h3>
                <button
                  onClick={() => setShowCreateAccountant(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={actionLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAccountant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={accountantForm.name}
                    onChange={(e) => setAccountantForm({...accountantForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input 
                    type="email" 
                    value={accountantForm.email}
                    onChange={(e) => setAccountantForm({...accountantForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input 
                    type="text" 
                    value={accountantForm.phone_no}
                    onChange={(e) => setAccountantForm({...accountantForm, phone_no: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input 
                    type="password" 
                    value={accountantForm.password}
                    onChange={(e) => setAccountantForm({...accountantForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus *
                  </label>
                  <select 
                    value={accountantForm.campus_id}
                    onChange={(e) => setAccountantForm({...accountantForm, campus_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={actionLoading}
                  >
                    <option value="">Select Campus</option>
                    {campuses.map(campus => (
                      <option key={campus._id} value={campus._id}>
                        {campus.name} - {campus.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccountant(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {actionLoading ? 'Creating...' : 'Create Accountant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}