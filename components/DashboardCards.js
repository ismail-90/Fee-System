'use client';
import { 
  School, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Upload,
  X,
  ChevronDown,
  Building,
  FileText,
  UserCheck
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { uploadFeeCSVAPI } from '@/Services/feeService';
import { getCampusesAPI } from '@/Services/campusService';
import { getProfileAPI } from '@/Services/authService'; // Add this import
import { useAuth } from '@/context/AuthContext'; // Add this import

const Card = ({ title, value, icon: Icon, color, onClick, isUploadCard = false }) => {
  const cardContent = (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${isUploadCard ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`mt-1 ${isUploadCard ? 'text-lg font-semibold text-blue-600' : 'text-2xl font-bold text-gray-900'}`}>
            {value}
          </p>
          {isUploadCard && (
            <p className="text-xs text-gray-500 mt-1">Click to upload CSV file</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
};

export default function DashboardCards({ data, onCSVUpload }) {
  const { user } = useAuth(); // Get user from context
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState('');
  const [loadingCampuses, setLoadingCampuses] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [accountantCampus, setAccountantCampus] = useState(null); // For accountant's campus
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch campuses when popup opens based on role
  useEffect(() => {
    if (showPopup) {
      if (user?.role === 'admin') {
        fetchAllCampuses();
      } else if (user?.role === 'accountant') {
        fetchAccountantProfile();
      }
    }
  }, [showPopup, user]);
  

  const fetchAllCampuses = async () => {
    setLoadingCampuses(true);
    try {
      const response = await getCampusesAPI();
      setCampuses(response.campuses || []);
      if (response.campuses?.length > 0) {
        setSelectedCampus(response.campuses[0]._id);
      }
    } catch (error) {
      console.error('Error fetching campuses:', error);
      setUploadMessage({ 
        type: 'error', 
        text: 'Failed to load campuses' 
      });
    } finally {
      setLoadingCampuses(false);
    }
  };

  const fetchAccountantProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await getProfileAPI();
      if (response.campus) {
        setAccountantCampus(response.campus);
        setSelectedCampus(response.campus._id); // Set accountant's campus as selected
      }
    } catch (error) {
      console.error('Error fetching accountant profile:', error);
      setUploadMessage({ 
        type: 'error', 
        text: 'Failed to load your campus information' 
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCSVUploadClick = () => {
    setShowPopup(true);
    setSelectedFile(null);
    setFileName('');
    setUploadMessage(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedCampus('');
    setSelectedFile(null);
    setFileName('');
    setUploadMessage(null);
    setAccountantCampus(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setUploadMessage({ type: 'error', text: 'Please upload a CSV file (.csv extension required)' });
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setUploadMessage(null); // Clear any previous messages
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadMessage({ type: 'error', text: 'Please select a CSV file first' });
      return;
    }

    if (!selectedCampus) {
      setUploadMessage({ type: 'error', text: 'Please select a campus' });
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("campusId", selectedCampus);

      console.log('Uploading CSV for campus:', selectedCampus);
      console.log('File:', selectedFile.name);

      const response = await uploadFeeCSVAPI(formData);
      
      const campusName = user?.role === 'admin' 
        ? getCampusName(selectedCampus) 
        : accountantCampus?.name;
      
      setUploadMessage({ 
        type: 'success', 
        text: `CSV uploaded successfully for ${campusName}! ${response?.message || 'File has been processed.'}` 
      });

      // Clear selections
      setSelectedFile(null);
      setFileName('');
      
      // Refresh data if callback provided
      if (onCSVUpload) {
        onCSVUpload();
      }

      // Close popup after successful upload
      setTimeout(() => {
        setShowPopup(false);
        setUploadMessage(null);
      }, 3000);

    } catch (error) {
      console.error('CSV upload error:', error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to upload CSV file. Please try again.';
      
      setUploadMessage({ 
        type: 'error', 
        text: errorMsg 
      });
    } finally {
      setUploading(false);
    }
  };

  const getCampusName = (campusId) => {
    const campus = campuses.find(c => c._id === campusId);
    return campus ? campus.name : 'Selected Campus';
  };

  const cards = [
    {
      title: 'Total Campuses',
      value: data?.totalCampuses || 0,
      icon: School,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Total Fee',
      value: `Rs.${(data?.totalFee || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Expenses',
      value: `Rs.${(data?.expenses || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Received',
      value: `Rs.${(data?.totalReceived || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-teal-500'
    },
    {
      title: 'Total Pending',
      value: `Rs.${(data?.totalPending || 0).toLocaleString()}`,
      icon: AlertCircle,
      color: 'bg-red-500'
    },
    {
      title: 'Total Defaulters',
      value: data?.totalDefaulters || 0,
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Import CSV',
      value: uploading ? 'Uploading...' : 'Upload CSV',
      icon: uploading ? Upload : Upload,
      color: 'bg-indigo-500',
      onClick: handleCSVUploadClick,
      isUploadCard: true
    }
  ];

  return (
    <>
      {/* Upload Message */}
      {uploadMessage && !showPopup && (
        <div className={`mb-4 p-3 rounded-lg ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <div className="flex items-center">
            {uploadMessage.type === 'success' ? (
              <span className="mr-2">✅</span>
            ) : (
              <span className="mr-2">❌</span>
            )}
            <span>{uploadMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            onClick={card.onClick}
            isUploadCard={card.isUploadCard}
          />
        ))}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* CSV Upload Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Light backdrop with minimal blur */}
          <div 
            className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
            onClick={handleClosePopup}
          />
          
          {/* Popup Container */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                {user?.role === 'admin' ? (
                  <Building className="w-5 h-5 text-blue-600 mr-2" />
                ) : (
                  <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.role === 'admin' ? 'Upload CSV File' : 'Upload CSV - Your Campus'}
                </h3>
              </div>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Campus Information - Different for Admin vs Accountant */}
              {user?.role === 'admin' ? (
                // Admin: Show campus dropdown
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Campus
                  </label>
                  {loadingCampuses ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading campuses...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedCampus}
                        onChange={(e) => {
                          setSelectedCampus(e.target.value);
                          setUploadMessage(null);
                        }}
                        disabled={uploading}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a campus</option>
                        {campuses.map(campus => (
                          <option key={campus._id} value={campus._id}>
                            {campus.name} - {campus.city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Select the campus for which you are uploading the CSV file
                  </p>
                </div>
              ) : (
                // Accountant: Show assigned campus (read-only)
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Assigned Campus
                  </label>
                  {loadingProfile ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-gray-600">Loading campus information...</span>
                    </div>
                  ) : accountantCampus ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Building className="w-5 h-5 text-green-600 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{accountantCampus.name}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {accountantCampus.city} • {accountantCampus.phone_no}
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            ✓ You can only upload CSV for this campus
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        No campus assigned to your account. Please contact admin.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-gray-700">Choose File</span>
                  </button>
                  {fileName && (
                    <div className="flex-1">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-700 truncate">
                          {fileName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {!fileName && (
                  <p className="text-xs text-gray-500 mt-2">
                    No file selected. Click Choose File to select a CSV file.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only .csv files are allowed
                </p>
              </div>

              {/* Current Selection Display */}
              {(selectedCampus && user?.role === 'admin') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-blue-800">
                      Selected Campus: <span className="font-medium">{getCampusName(selectedCampus)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Message inside popup */}
              {uploadMessage && (
                <div className={`p-3 rounded-lg ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  <div className="flex items-center">
                    {uploadMessage.type === 'success' ? (
                      <span className="mr-2">✅</span>
                    ) : (
                      <span className="mr-2">❌</span>
                    )}
                    <span className="text-sm">{uploadMessage.text}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Submit Button */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={
                  !selectedFile || 
                  !selectedCampus || 
                  uploading || 
                  (user?.role === 'accountant' && !accountantCampus)
                }
                className={`px-6 py-2 rounded-lg transition-all ${
                  !selectedFile || 
                  !selectedCampus || 
                  uploading || 
                  (user?.role === 'accountant' && !accountantCampus)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : user?.role === 'admin' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                      : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {uploading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload CSV'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-bottom 0.3s ease-out;
        }
      `}</style>
    </>
  );
}