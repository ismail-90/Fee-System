import api from "./api";

// Upload Fee CSV File
export const uploadFeeCSVAPI = async (formData) => {
  try { 
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, key === 'file' ? `${value.name} (${value.type})` : value);
    }
    const response = await api.post("/global/upload-fee-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API upload error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
};

// Get Students by Class Api
export const getStudentsByClassAPI = async (className) => {
  const response = await api.get(`/global/students/${className}`);
  return response.data;
};

export const generateFeeReceiptAPI = async (feeData) => {
  try {
    const response = await api.post("/global/generate-fee-slip", feeData);
    return response.data;
  } catch (error) {
    console.error("Fee slip generation error:", error);
    throw error;
  }
};

export const getFeeMonthsAPI = async () => {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
};

// Add Expense
export const addExpenseAPI = async (data) => {
  const response = await api.post("/expenses/create", data);
  return response.data;
};
