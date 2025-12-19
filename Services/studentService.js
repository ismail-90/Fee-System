import api from "./api";

// Defaulter Students
export const getDefaulterStudentsAPI = async () => {
  const response = await api.get("/global/defaulters/");
  return response.data;
};

// craete Student
export const createStudentAPI = async (studentData) => {
  const response = await api.post("/global/create-and-generate-slip", studentData);
  return response.data;
};

// get Students According to campus
export const getStudentsByCampusAPI = async (campusId) => {
  const response = await api.get(`/campus/${campusId}/students`);
  return response.data;
}
