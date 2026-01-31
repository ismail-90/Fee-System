'use client';

import { useState, useEffect } from "react";
import AppLayout from "../../../components/AppLayout";
import { postPermissionRequestAPI, getPermissionRequestsAPI } from "../../../Services/permissions";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  History, 
  Hourglass, 
  Send,
  Calendar,
  XCircle,
  Loader2
} from "lucide-react";

export default function RequestsPage() {
  // State Management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    durationValue: 2,
    durationUnit: "hours",
    reason: ""
  });

  // Initial Fetch
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getPermissionRequestsAPI();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "durationValue" ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason) return alert("Please provide a reason.");

    setSubmitting(true);
    try {
      const res = await postPermissionRequestAPI(formData);
      if (res.success) {
        // Reset form and refresh data
        setFormData({ durationValue: 2, durationUnit: "hours", reason: "" });
        await fetchStatus();
        alert("Request submitted successfully!");
      } else {
        alert(res.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Helper: Get Status Badge Styles
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> Approved</span>;
      case 'pending':
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Hourglass size={12} /> Pending</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Center</h1>
          <p className="text-gray-500">Manage editing permissions for restricted actions.</p>
        </div>

        {/* Top Section: Active Status Banner */}
        {data?.hasActivePermission ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-900">Permission Active</h2>
                <p className="text-green-700 text-sm">You have editing rights enabled.</p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-center sm:text-right">
              <div className="text-sm text-green-600 font-medium uppercase tracking-wider">Time Remaining</div>
              <div className="text-3xl font-bold text-green-800 tabular-nums">
                {data?.activePermission?.remainingTime || `${data?.timeRemainingMinutes} mins`}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Expires at: {formatDate(data?.activePermission?.expiresAt)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-gray-600">
            <AlertCircle size={20} />
            <span>You currently do not have active editing permissions.</span>
          </div>
        )}

        {/* Main Grid: Request Form (Left) & History (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Request Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Clock className="text-blue-600" size={18} />
                <h3 className="font-semibold text-gray-800">Request New Permission</h3>
              </div>
              
              <div className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Duration Inputs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration Required</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        name="durationValue"
                        value={formData.durationValue}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <select
                        name="durationUnit"
                        value={formData.durationUnit}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Reason Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Access</label>
                    <textarea
                      name="reason"
                      rows="4"
                      placeholder="e.g. Need to update fee structure for Class 10..."
                      value={formData.reason}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Request History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="text-gray-600" size={18} />
                  <h3 className="font-semibold text-gray-800">Recent Requests</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {data?.recentRequests?.length || 0} Total
                </span>
              </div>

              <div className="flex-1 overflow-auto max-h-[600px] p-0">
                {data?.recentRequests && data.recentRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {data.recentRequests.map((req) => (
                      <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(req.status)}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={10} /> {formatDate(req.createdAt)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
                            {req.requestedDuration}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-800 mb-2 font-medium">
                          "{req.reason}"
                        </p>

                        {req.status === 'approved' && (
                          <div className="text-xs bg-green-50 text-green-700 p-2 rounded border border-green-100 flex gap-2">
                            <span className="font-bold">Approved by:</span> {req.approvedBy || "Admin"}
                            <span className="text-green-400">|</span>
                            <span>Approved at: {formatDate(req.approvedAt)}</span>
                          </div>
                        )}
                         
                         {/* If API returns rejection reason in the string or separate field, display it */}
                         {req.reason && req.reason.includes("Rejected by:") && (
                            <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100 whitespace-pre-line">
                                {req.reason.split("Rejected by:")[1] ? `Rejected by: ${req.reason.split("Rejected by:")[1]}` : "Request Rejected"}
                            </div>
                         )}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <History size={48} className="mb-3 opacity-20" />
                    <p>No request history found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}