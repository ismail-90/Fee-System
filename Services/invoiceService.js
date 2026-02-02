import api from "./api";

// get invoice by status
export const getInvoicesByStatusAPI = async (status, className) => {
  const response = await api.get(`/global/invoices?status=${status}&cn=${className}`);
  return response.data;
}

// Pay Invoice
export const payInvoiceAPI = async (paymentData) => {
  const response = await api.post(`/global/pay-invoice`, paymentData);
  return response.data;
}

// get All Invoices by campus id
export const getInvoicesByCampusAPI = async (campusId, className) => {
  const response = await api.get(`/global/${campusId}/class?className=${className}`);
  return response.data;
}

// generate bulk invoices
export const generateBulkInvoicesAPI = async (bulkData) => {
  const response = await api.post(`/global/generate-bulk-fee-slip`, bulkData);
  return response.data;
}

// get bulk invoices
export const getBulkInvoicesAPI = async (className) => {
  const response = await api.get(`/global/bulk-invoices?className=${className}`);
  return response.data;
}

//pay old balance.
export const payOldBalanceAPI = async (paymentData) => {
  const response = await api.post(`/global/pay-balanced-amount`, paymentData);
  return response.data;
}

// delete invoice
export const deleteInvoiceAPI = async (invoiceId) => {
  const response = await api.delete(`/global/remove/${invoiceId}`);
  return response.data;
}

// get invoice details
export const getInvoiceDetailsAPI = async (invoiceId) => {
  const response = await api.get(`/global/invoice-details/${invoiceId}`);
  return response.data;
}
