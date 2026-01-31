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

// Delete Multiple Students

// ✅ Correct way to send data
export const deleteMultipleStudentsAPI = async (studentIds) => {
  const response = await api.post("/global/students-delete", { 
    studentIds 
  });
  return response.data;
};

// get All Defaulters by campus id
export const getDefaultersByCampusAPI = async (campusId) => {
  const response = await api.get(`/global/defaulter/${campusId}`);
  return response.data;
}

// get student record by student id
export const getStudentRecordByIdAPI = async (studentId) => {
  const response = await api.get(`/global/paid-defaulter/${studentId}`);
  return response.data;
}

// get Student Record by Student Id
export const getStudentRecord = async (studentId) => {
  const response = await api.get(`/global/student-fees?studentId=${studentId}`);
  return response.data;
}