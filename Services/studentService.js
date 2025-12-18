import api from "./api";

// Defaulter Students
export const getDefaulterStudentsAPI = async () => {
  const response = await api.get("/global/defaulters/");
  return response.data;
};
