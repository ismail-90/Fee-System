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
