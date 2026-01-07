import api from "./api";

// 1) Create Campus
export const createCampusAPI = async (data) => {
  const response = await api.post("/campus/create", data);
  return response.data;
};

// 2) Get All Campuses
export const getCampusesAPI = async () => {
  const response = await api.get("/campus/list");
  return response.data;
};

// 3) Create Accountant
export const createAccountantAPI = async (data) => {
  const response = await api.post("/accountant/create", data);
  return response.data;
};

// 4) Get Accountants
export const getAllAccountantsAPI = async () => {
  const response = await api.get("/accountant/all");
  return response.data;
}

// 5) Update Campus
export const updateCampusAPI = async (campusId, data) => {
  const response = await api.put(`/campus/update/${campusId}`, data);
  return response.data;
};

// 6) Delete Campus
export const deleteCampusAPI = async (campusId) => {
  const response = await api.delete(`/campus/delete/${campusId}`);
  return response.data;
};

// update accountant
export const updateAccountantAPI = async (accountantId, data) => {
  const response = await api.put(`/accountant/update/${accountantId}`, data);
  return response.data;
};

// delete accountant
export const deleteAccountantAPI = async (accountantId) => {
  const response = await api.delete(`/accountant/delete/${accountantId}`);
  return response.data;
};

//get single campus details
export const getCampusDetailsAPI = async (campusId) => {
  const response = await api.get(`/global/dashboardSummary/${campusId}`);
  return response.data;
}

