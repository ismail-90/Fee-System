import api from "./api";

export const getDashboardStatsAPI = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getRecentActivityAPI = async () => {
  const response = await api.get("/dashboard/activity");
  return response.data;
};