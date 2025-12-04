import api from "./api";

// Upload Fee CSV
export const uploadFeeCSVAPI = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post("/global/upload-fee-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Get Students by Class
export const getStudentsByClassAPI = async (className) => {
  const response = await api.get(`/global/students/${className}`);
  return response.data;
};

// Get All Classes
// export const getAllClassesAPI = async () => {
//   const response = await api.get("/global/classes");
//   return response.data;
// };