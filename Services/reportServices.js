import api from "./api";

// Daily Report
export const getDailyReportAPI = async (reportData) => {
  const response = await api.post(`/global/daily-cash-report`, reportData);
  return response.data;
}

// get report for campuses
export const getCampusReportAPI = async (reportData) => {
  const response = await api.post(`/global/adminCash-flow-report`, reportData);
  return response.data;
}

