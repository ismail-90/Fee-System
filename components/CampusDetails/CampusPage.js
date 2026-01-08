'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Plus,
  UserPlus,
  Search,
  Loader2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  createCampusAPI,
  getCampusesAPI,
  createAccountantAPI,
  getAllAccountantsAPI,
  updateCampusAPI,
  deleteCampusAPI,
  updateAccountantAPI,
  deleteAccountantAPI
} from "../../Services/campusService";
import AppLayout from '../AppLayout';
import CampusesTable from './CampusesTable';
import CampusDetailsModal from './CampusDetailsModal';
import CreateCampusModal from './CreateCampusModal';
import EditCampusModal from './EditCampusModal';
import CreateAccountantModal from './CreateAccountantModal';
import EditAccountantModal from './EditAccountantModal';
import AccountantsTable from './AccountantsTable';

export default function Campuses() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('campuses');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showCreateCampus, setShowCreateCampus] = useState(false);
  const [showCreateAccountant, setShowCreateAccountant] = useState(false);
  const [showAccountantDetails, setShowAccountantDetails] = useState(false);
  const [showEditCampus, setShowEditCampus] = useState(false);
  const [showEditAccountant, setShowEditAccountant] = useState(false);
  const [showCampusDetails, setShowCampusDetails] = useState(false);

  // Data states
  const [selectedAccountant, setSelectedAccountant] = useState(null);
  const [editingCampus, setEditingCampus] = useState(null);
  const [editingAccountant, setEditingAccountant] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [accountants, setAccountants] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Message state
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [createCampusForm, setCreateCampusForm] = useState({
    name: "",
    city: "",
    phone_no: ""
  });

  const [editCampusForm, setEditCampusForm] = useState({
    name: "",
    city: "",
    phone_no: "",
    status: ""
  });

  const [accountantForm, setAccountantForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    campus_id: ""
  });

  const [editAccountantForm, setEditAccountantForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    campus_id: "",
    status: ""
  });

  // Authentication and data fetching
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
    } catch (error) {
      console.error('Error fetching campuses:', error);
      throw error;
    }
  };

  const fetchAccountants = async () => {
    try {
      const response = await getAllAccountantsAPI();
      if (response.data) setAccountants(response.data);
    } catch (error) {
      console.error('Error fetching accountants:', error);
      throw error;
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Campus CRUD Operations
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCampus = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateCampusAPI(editingCampus._id, editCampusForm);
      showMessage('success', 'Campus updated successfully!');
      setShowEditCampus(false);
      setEditingCampus(null);
      setEditCampusForm({ name: "", city: "", phone_no: "", status: "" });
      fetchCampuses();
    } catch (error) {
      console.error('Error updating campus:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update campus');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus?')) return;
    setActionLoading(true);
    try {
      await deleteCampusAPI(id);
      showMessage('success', 'Campus deleted successfully!');
      fetchCampuses();
    } catch (error) {
      console.error('Error deleting campus:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete campus');
    } finally {
      setActionLoading(false);
    }
  };

  // Accountant CRUD Operations
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAccountant = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateAccountantAPI(editingAccountant._id, editAccountantForm);
      showMessage('success', 'Accountant updated successfully!');
      setShowEditAccountant(false);
      setEditingAccountant(null);
      setEditAccountantForm({ name: "", email: "", phone_no: "", campus_id: "", status: "" });
      fetchAccountants();
    } catch (error) {
      console.error('Error updating accountant:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update accountant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccountant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accountant?')) return;
    setActionLoading(true);
    try {
      await deleteAccountantAPI(id);
      showMessage('success', 'Accountant deleted successfully!');
      fetchAccountants();
    } catch (error) {
      console.error('Error deleting accountant:', error);
      showMessage('error', error.response?.data?.message || 'Failed to delete accountant');
    } finally {
      setActionLoading(false);
    }
  };

  // Event Handlers
  const handleViewCampus = (campus) => {
    setSelectedCampus(campus);
    setShowCampusDetails(true);
  };

  const handleEditCampusClick = (campus) => {
    setEditingCampus(campus);
    setEditCampusForm({
      name: campus.name,
      city: campus.city,
      phone_no: campus.phone_no,
      status: campus.status
    });
    setShowEditCampus(true);
  };

  const handleEditAccountantClick = (accountant) => {
    setEditingAccountant(accountant);
    setEditAccountantForm({
      name: accountant.name,
      email: accountant.email,
      phone_no: accountant.phone_no,
      campus_id: accountant.campus_id?._id || "",
      status: accountant.status
    });
    setShowEditAccountant(true);
  };

  // Filter Data
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

  // Loading and Authentication States
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
        {/* Message Notification */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
              : 'bg-red-50 text-red-800 border-l-4 border-red-500'
            }`}>
            {message.type === 'success' ?
              <CheckCircle className="w-5 h-5 mr-3" /> :
              <AlertCircle className="w-5 h-5 mr-3" />
            }
            <span className="text-sm">{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campuses Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage campuses and accountants</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium mr-4 ${activeTab === 'campuses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            onClick={() => setActiveTab('campuses')}
          >
            Campuses ({campuses.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'accountants'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }`}
            onClick={() => setActiveTab('accountants')}
          >
            Accountants ({accountants.length})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowCreateCampus(true)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" /> New Campus
            </button>
            <button
              onClick={() => setShowCreateAccountant(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" /> New Accountant
            </button>
          </div>
        </div>

        {/* Campuses Table */}
        {activeTab === 'campuses' && (
          <CampusesTable
            campuses={campuses}
            filteredCampuses={filteredCampuses}
            loading={loading}
            searchTerm={searchTerm}
            onViewClick={handleViewCampus}
            onEditClick={handleEditCampusClick}
            onDeleteClick={handleDeleteCampus}
          />
        )}

        {/* Accountants Table */}
        {activeTab === 'accountants' && (
          <AccountantsTable
            accountants={accountants}
            filteredAccountants={filteredAccountants}
            loading={loading}
            searchTerm={searchTerm}
            onViewClick={(accountant) => {
              setSelectedAccountant(accountant);
              setShowAccountantDetails(true);
            }}
            onEditClick={handleEditAccountantClick}
            onDeleteClick={handleDeleteAccountant}
          />
        )}

        {/* Modals */}
        <CampusDetailsModal
          campus={selectedCampus}
          isOpen={showCampusDetails}
          onClose={() => {
            setShowCampusDetails(false);
            setSelectedCampus(null);
          }}
          showMessage={showMessage}
        />

        <CreateCampusModal
          isOpen={showCreateCampus}
          onClose={() => setShowCreateCampus(false)}
          form={createCampusForm}
          setForm={setCreateCampusForm}
          onSubmit={handleCreateCampus}
          loading={actionLoading}
        />

        <EditCampusModal
          isOpen={showEditCampus}
          onClose={() => {
            setShowEditCampus(false);
            setEditingCampus(null);
            setEditCampusForm({ name: "", city: "", phone_no: "", status: "" });
          }}
          form={editCampusForm}
          setForm={setEditCampusForm}
          onSubmit={handleEditCampus}
          loading={actionLoading}
        />

        <CreateAccountantModal
          isOpen={showCreateAccountant}
          onClose={() => setShowCreateAccountant(false)}
          form={accountantForm}
          setForm={setAccountantForm}
          campuses={campuses}
          onSubmit={handleCreateAccountant}
          loading={actionLoading}
        />

        <EditAccountantModal
          isOpen={showEditAccountant}
          onClose={() => {
            setShowEditAccountant(false);
            setEditingAccountant(null);
            setEditAccountantForm({ name: "", email: "", phone_no: "", campus_id: "", status: "" });
          }}
          form={editAccountantForm}
          setForm={setEditAccountantForm}
          campuses={campuses}
          onSubmit={handleEditAccountant}
          loading={actionLoading}
        />

        {/* Accountant Details Modal */}
        {showAccountantDetails && selectedAccountant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
              <button
                onClick={() => setShowAccountantDetails(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
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