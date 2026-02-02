import api from "./api";

// post permission Request
export const postPermissionRequestAPI = async (requestData) => {
  const response = await api.post("/permissions/accountant/request", requestData);
  return response.data;
};

// get permission Requests
export const getPermissionRequestsAPI = async () => {
  const response = await api.get("/permissions/status");
  return response.data;
}

// For Admin : Get Pending Permission Requests
export const getPendingPermissionRequestsAPI = async () => {
  const response = await api.get("/permissions/admin/pending");
  return response.data;
}

// For Admin : Approve Permission Request Status
export const approvePermissionRequestAPI = async (requestId) => {
  const response = await api.put(`/permissions/admin-approve/${requestId}`);
  return response.data;
}

// For Admin : Reject Permission Requests
export const rejectPermissionRequestAPI = async (requestId, rejectionReason) => {
  const response = await api.put(`/permissions/admin/reject/${requestId}`, { rejectionReason });
  return response.data;
}

// For Admin : Get Active Permission Requests
export const getActivePermissionRequestsAPI = async () => {
  const response = await api.get("/permissions/admin/active");
  return response.data;
}

 