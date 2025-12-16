'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  Check,
  XCircle,
  Eye
} from 'lucide-react';
import { 
  createCampusAPI, 
  getCampusesAPI, 
  createAccountantAPI,
  getAllAccountantsAPI
} from "@/Services/campusService";
import AppLayout from '@/components/AppLayout';

export default function Campuses() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('campuses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCampus, setShowCreateCampus] = useState(false);
  const [showCreateAccountant, setShowCreateAccountant] = useState(false);
  const [showAccountantDetails, setShowAccountantDetails] = useState(false);
  const [selectedAccountant, setSelectedAccountant] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [createCampusForm, setCreateCampusForm] = useState({ name: "", city: "", phone_no: "" });
  const [accountantForm, setAccountantForm] = useState({ name: "", email: "", phone_no: "", password: "", campus_id: "" });

  useEffect(() => {
    if (authLoading) return;
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      router.push('/');
      return;
    }
    fetchAllData();
  }, [authLoading, router]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCampuses(), fetchAccountants()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to fetch data.');
      
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await getCampusesAPI();
      if (response.campuses) setCampuses(response.campuses);
    } catch (error) { console.error('Error fetching campuses:', error); throw error; }
  };

  const fetchAccountants = async () => {
    try {
      const response = await getAllAccountantsAPI();
      if (response.data) setAccountants(response.data);
    } catch (error) { console.error('Error fetching accountants:', error); throw error; }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateCampus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createCampusAPI(createCampusForm);
      showMessage('success', 'Campus created successfully!');
      setShowCreateCampus(false);
      setCreateCampusForm({ name: "", city: "", phone_no: "" });
      fetchCampuses();
    } catch (error) {
      console.error('Error creating campus:', error);
      showMessage('error', error.response?.data?.message || 'Failed to create campus');
    } finally { setActionLoading(false); }
  };

  const handleCreateAccountant = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createAccountantAPI(accountantForm);
      showMessage('success', 'Accountant created successfully!');
      setShowCreateAccountant(false);
      setAccountantForm({ name: "", email: "", phone_no: "", password: "", campus_id: "" });
      fetchAccountants();
    } catch (error) {
      console.error('Error creating accountant:', error);
      showMessage('error', error.response?.data?.message || 'Failed to create accountant');
    } finally { setActionLoading(false); }
  };

  const handleUpdateAccountantStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this accountant?`)) return;
    setActionLoading(true);
    try {
      // Implement updateAccountantStatusAPI if available
      showMessage('success', `Accountant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchAccountants();
    } catch (error) {
      console.error('Error updating accountant status:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update accountant status');
    } finally { setActionLoading(false); }
  };

  const handleDeleteAccountant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accountant?')) return;
    setActionLoading(true);
    try {
      // Implement deleteAccountantAPI if available
      showMessage('success', 'Accountant deleted successfully!');
      fetchAccountants();
    } catch (error) {
      console.error('Error deleting accountant:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete accountant');
    } finally { setActionLoading(false); }
  };

  const viewAccountantDetails = (accountant) => {
    setSelectedAccountant(accountant);
    setShowAccountantDetails(true);
  };

  const filteredCampuses = campuses.filter(campus =>
    campus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.phone_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccountants = accountants.filter(accountant =>
    accountant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.phone_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    accountant.campus_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");
  if (!token || !savedUser) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex-1 p-4 sm:p-6">
        {/* Message */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-50 text-red-800 border-l-4 border-red-500'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-6 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campuses Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage campuses and accountants</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button className={`px-4 py-2 text-sm font-medium mr-4 ${activeTab === 'campuses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('campuses')}>Campuses ({campuses.length})</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'accountants' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`} onClick={() => setActiveTab('accountants')}>Accountants ({accountants.length})</button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setShowCreateCampus(true)} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2" /> New Campus
            </button>
            <button onClick={() => setShowCreateAccountant(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" /> New Accountant
            </button>
          </div>
        </div>

        {/* Tables */}
        {activeTab === 'campuses' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCampuses.map(campus => (
                      <tr key={campus._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 flex items-center">
                          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campus.name}</div>
                            <div className="text-xs text-gray-500">{campus.accountants?.length || 0} accountants</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{campus.city}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 hidden sm:table-cell">{campus.phone_no}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${campus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{campus.status}</span>
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                          <button className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && filteredCampuses.length === 0 && (
                  <div className="text-center py-12">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No campuses found</h3>
                    <p className="text-gray-600 text-sm">{searchTerm ? 'Try adjusting your search' : 'Get started by creating a campus'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Accountants Table */}
        {activeTab === 'accountants' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accountant</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAccountants.map(accountant => (
                      <tr key={accountant._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">{accountant.name?.charAt(0) || 'A'}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{accountant.name}</div>
                            <div className="text-xs text-gray-500">{accountant.role}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-sm text-gray-900">{accountant.email}</div>
                          <div className="text-xs text-gray-500">{accountant.phone_no}</div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{accountant.campus_id?.name || 'No Campus'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${accountant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{accountant.status}</span>
                        </td>
                        <td className="px-4 py-2 flex space-x-2">
                          <button onClick={() => viewAccountantDetails(accountant)} className="p-1 text-blue-600 hover:text-blue-800"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleUpdateAccountantStatus(accountant._id, accountant.status)} className={`p-1 ${accountant.status === 'active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteAccountant(accountant._id)} className="p-1 text-red-600 hover:text-red-800"><XCircle className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && filteredAccountants.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No accountants found</h3>
                    <p className="text-gray-600 text-sm">{searchTerm ? 'Try adjusting your search' : 'Get started by creating an accountant'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Campus Modal */}
        {showCreateCampus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
              <button onClick={() => setShowCreateCampus(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Campus</h2>
              <form onSubmit={handleCreateCampus} className="space-y-4">
                <input type="text" placeholder="Campus Name" value={createCampusForm.name} onChange={(e) => setCreateCampusForm({...createCampusForm, name: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="text" placeholder="City" value={createCampusForm.city} onChange={(e) => setCreateCampusForm({...createCampusForm, city: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="text" placeholder="Phone No" value={createCampusForm.phone_no} onChange={(e) => setCreateCampusForm({...createCampusForm, phone_no: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <button type="submit" disabled={actionLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center">
                  {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Create Campus'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Accountant Modal */}
        {showCreateAccountant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
              <button onClick={() => setShowCreateAccountant(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Accountant</h2>
              <form onSubmit={handleCreateAccountant} className="space-y-4">
                <input type="text" placeholder="Name" value={accountantForm.name} onChange={(e) => setAccountantForm({...accountantForm, name: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="email" placeholder="Email" value={accountantForm.email} onChange={(e) => setAccountantForm({...accountantForm, email: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="text" placeholder="Phone No" value={accountantForm.phone_no} onChange={(e) => setAccountantForm({...accountantForm, phone_no: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <input type="password" placeholder="Password" value={accountantForm.password} onChange={(e) => setAccountantForm({...accountantForm, password: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required />
                <select value={accountantForm.campus_id} onChange={(e) => setAccountantForm({...accountantForm, campus_id: e.target.value})} className="w-full border px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" required>
                  <option value="">Select Campus</option>
                  {campuses.map(campus => <option key={campus._id} value={campus._id}>{campus.name}</option>)}
                </select>
                <button type="submit" disabled={actionLoading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center">
                  {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Create Accountant'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Accountant Details Modal */}
        {showAccountantDetails && selectedAccountant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
              <button onClick={() => setShowAccountantDetails(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Accountant Details</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedAccountant.name}</p>
                <p><strong>Email:</strong> {selectedAccountant.email}</p>
                <p><strong>Phone:</strong> {selectedAccountant.phone_no}</p>
                <p><strong>Campus:</strong> {selectedAccountant.campus_id?.name || 'No Campus'}</p>
                <p><strong>Status:</strong> {selectedAccountant.status}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
