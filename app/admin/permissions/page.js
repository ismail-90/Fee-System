'use client';

import { useState, useEffect, useCallback } from "react";
import AppLayout from "../../../components/AppLayout";
import { 
  getPendingPermissionRequestsAPI, 
  approvePermissionRequestAPI, 
  rejectPermissionRequestAPI, 
  getActivePermissionRequestsAPI 
} from "../../../Services/permissions";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  ShieldAlert, 
  Calendar,
  Loader2,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";

export default function PermissionsPage() {
  // State for Data
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activePermissions, setActivePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores ID of item being processed

  // State for Reject Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, activeRes] = await Promise.all([
        getPendingPermissionRequestsAPI(),
        getActivePermissionRequestsAPI()
      ]);

      if (pendingRes.success) setPendingRequests(pendingRes.data.requests || []);
      if (activeRes.success) setActivePermissions(activeRes.data.activePermissions || []);
      
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Handlers ---

  const handleApprove = async (id) => {
    if (!confirm("Are you sure you want to approve this request?")) return;
    
    setActionLoading(id);
    try {
      const res = await approvePermissionRequestAPI(id);
      if (res.success) {
        // Remove from pending locally and refresh active
        setPendingRequests(prev => prev.filter(req => req.id !== id));
        // Silently refresh active list to show the new permission
        const activeRes = await getActivePermissionRequestsAPI();
        if (activeRes.success) setActivePermissions(activeRes.data.activePermissions);
        alert("Permission granted successfully.");
      } else {
        alert(res.message || "Failed to approve.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (id) => {
    setSelectedRequestId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return alert("Rejection reason is required");

    setActionLoading(selectedRequestId);
    try {
      const res = await rejectPermissionRequestAPI(selectedRequestId, rejectReason);
      if (res.success) {
        setPendingRequests(prev => prev.filter(req => req.id !== selectedRequestId));
        setIsRejectModalOpen(false);
        alert("Request rejected.");
      } else {
        alert(res.message || "Failed to reject.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
      setIsRejectModalOpen(false);
    }
  };

  // --- Helper Components ---

  const formatDate = (dateStr) => {
    if(!dateStr) return "-";
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      {/* Reject Modal Overlay */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700">
              <AlertTriangle size={20} />
              <h3 className="font-bold">Reject Request</h3>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={4}
                placeholder="e.g. Needs more specific details..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 mt-6 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                   {actionLoading === selectedRequestId ? <Loader2 className="animate-spin" size={16}/> : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-500">Approve requests or monitor active accountant sessions.</p>
          </div>
          <button 
            onClick={fetchAllData} 
            className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-fit"
          >
            <RefreshCcw size={16} /> Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-6 text-sm font-medium transition-colors relative ${
              activeTab === 'pending' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Requests 
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-6 text-sm font-medium transition-colors relative ${
              activeTab === 'active' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Sessions
            {activePermissions.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                {activePermissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* --- TAB: PENDING REQUESTS --- */}
            {activeTab === 'pending' && (
              <>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500">There are no pending permission requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          
                          {/* User Info & Reason */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <User size={20} />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{req.accountant?.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                  <span className="flex items-center gap-1"><MapPin size={12}/> {req.accountant?.campus}</span>
                                  <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(req.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-900">Reason:</span> "{req.reason}"
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
                                <Clock size={16} /> Requested Duration: {req.requestedDuration}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col justify-end gap-2 lg:min-w-[140px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-4">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === req.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16} />}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(req.id)}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* --- TAB: ACTIVE PERMISSIONS --- */}
            {activeTab === 'active' && (
              <>
                 {activePermissions.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <ShieldAlert className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No active permissions at the moment.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Accountant</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Time Remaining</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Expires At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {activePermissions.map((perm) => (
                            <tr key={perm.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{perm.accountant?.name}</div>
                                <div className="text-xs text-gray-400">{perm.accountant?.campus}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                                  Active
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                  {perm.timeRemaining}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {formatDate(perm.expiresAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}