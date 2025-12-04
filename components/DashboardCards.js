'use client';
import { 
  School, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Download,
  Upload
} from 'lucide-react';
import { useState, useRef } from 'react';
import { uploadFeeCSVAPI } from '@/Services/feeService';

const Card = ({ title, value, icon: Icon, color, onClick, isUploadCard = false }) => {
  const cardContent = (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
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
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const handleCSVUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setUploadMessage({ type: 'error', text: 'Please upload a CSV file' });
      setTimeout(() => setUploadMessage(null), 3000);
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    try {
      const response = await uploadFeeCSVAPI(file);
      
      setUploadMessage({ 
        type: 'success', 
        text: `CSV uploaded successfully! ${response?.message || ''}` 
      });

      // Clear file input
      event.target.value = '';
      
      // Refresh data if callback provided
      if (onCSVUpload) {
        onCSVUpload();
      }

      setTimeout(() => setUploadMessage(null), 5000);
    } catch (error) {
      console.error('CSV upload error:', error);
      setUploadMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload CSV file' 
      });
      setTimeout(() => setUploadMessage(null), 5000);
    } finally {
      setUploading(false);
    }
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
      value: `₹${(data?.totalFee || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Expenses',
      value: `₹${(data?.expenses || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Received',
      value: `₹${(data?.totalReceived || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-teal-500'
    },
    {
      title: 'Total Pending',
      value: `₹${(data?.totalPending || 0).toLocaleString()}`,
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
      icon: uploading ? Download : Upload,
      color: 'bg-indigo-500',
      onClick: handleCSVUploadClick,
      isUploadCard: true
    }
  ];

  return (
    <>
      {/* Upload Message */}
      {uploadMessage && (
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
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />
    </>
  );
}