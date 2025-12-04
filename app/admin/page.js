'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import DashboardCards from '@/components/DashboardCards';
import { getDashboardStatsAPI } from '@/Services/dashboardService';
import { Loader2, RefreshCw, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchDashboardData();
    fetchRecentActivity();
  }, [user, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStatsAPI();
      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // You can create a separate API for this
      const mockActivity = [
        { message: 'New student registration - Ali Ahmed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { message: 'Fee payment received - ₹15,000', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            <DashboardCards data={dashboardData} onCSVUpload={handleCSVUpload} />

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                <button 
                  onClick={fetchRecentActivity}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-blue-700">{activity.message}</span>
                    </div>
                    <span className="text-xs text-blue-600">
                      {new Date(activity.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                <ul className="space-y-2">
                  <li>
                    <button className="text-left hover:text-blue-100">
                      📋 Generate Fee Reports
                    </button>
                  </li>
                  <li>
                    <button className="text-left hover:text-blue-100">
                      👥 Add New Student
                    </button>
                  </li>
                  <li>
                    <button className="text-left hover:text-blue-100">
                      🏫 Create New Campus
                    </button>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Fee Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Collected:</span>
                    <span className="font-bold">₹{dashboardData?.totalReceived?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Amount:</span>
                    <span className="font-bold">₹{dashboardData?.totalPending?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Defaulters:</span>
                    <span className="font-bold">{dashboardData?.totalDefaulters || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>All Systems Operational</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>API Connection Active</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>Database Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}