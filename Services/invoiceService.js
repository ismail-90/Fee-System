import api from "./api";

// get invoice by status
export const getInvoicesByStatusAPI = async (status) => {
  const response = await api.get(`/global/invoices?status=${status}`);
  return response.data;
}

// Pay Invoice
export const payInvoiceAPI = async (paymentData) => {
  const response = await api.post(`/global/pay-invoice`, paymentData);
  return response.data;
}