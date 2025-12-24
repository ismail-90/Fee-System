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

// get All Invoices by campus id
export const getInvoicesByCampusAPI = async (campusId) => {
  const response = await api.get(`/global/${campusId}/invoices`);
  return response.data;
}

// generate bulk invoices
export const generateBulkInvoicesAPI = async (bulkData) => {
  const response = await api.post(`/global/generate-bulk-fee-slip`, bulkData);
  return response.data;
}