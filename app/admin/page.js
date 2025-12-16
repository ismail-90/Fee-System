'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import DashboardCards from '@/components/DashboardCards';
import { getDashboardStatsAPI } from '@/Services/dashboardService';
import { Loader2, RefreshCw, Calendar } from 'lucide-react';
import AppLayout from '../../components/AppLayout';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (!token || !savedUser) {
      router.push('/');
      return;
    }
    
    fetchDashboardData();
    fetchRecentActivity();
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStatsAPI();
      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If token is invalid, redirect to login
      if (error.response?.status === 401) {
        localStorage.clear();
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // You can create a separate API for this
      const mockActivity = [
        { message: 'New student registration - Ali Ahmed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { message: 'Fee payment received - Rs.15,000', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
        { message: 'CSV fee data uploaded for Class 1', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        { message: 'New campus created - North Campus', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleCSVUpload = () => {
    fetchDashboardData(); // Refresh data after CSV upload
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppLayout >
   <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
  {/* Sidebar can be added here if needed */}
  <div className="flex-1 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap items-center space-x-0 sm:space-x-3 gap-2">
        <div className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>

    {loading ? (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
      </div>
    ) : (
      <>
        <DashboardCards data={dashboardData} onCSVUpload={handleCSVUpload} />

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button onClick={fetchRecentActivity} className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center mb-1 sm:mb-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-700">{activity.message}</span>
                </div>
                <span className="text-xs text-blue-600">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
</div>

    </AppLayout>
  );
}