import api from "./api";

export const getDashboardStatsAPI = async () => {
  const response = await api.get("/global/dashboard-counts");
  return response.data;
};

export const getRecentActivityAPI = async () => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};

// Get Monthly Fee Collection Data
export const getMonthlyFeeCollectionAPI = async () => {
  const response = await api.get("/global/paid");
  return response.data;
}