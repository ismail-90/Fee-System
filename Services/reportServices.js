import api from "./api";

// Daily Report
export const dailyExpenseReport = async () => {
  const response = await api.post(`/global/expense-daily-report`);
  return response.data;
}

// Daily Fee Report
export const dailyFeeReport = async (date) => {
  const response = await api.post(`/global/daily-fee-report`, date );
  return response.data;
}