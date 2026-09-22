import apiClient from './apiClient';

const PAYMENT_PATH = '/payments';

const unwrap = (response) => response.data?.data ?? response.data;

const getErrorMessage = (error) => (
  error.response?.data?.error
  || error.response?.data?.message
  || error.message
  || 'Something went wrong. Please try again.'
);

export const paymentApi = {
  listPending: async () => {
    const response = await apiClient.get(PAYMENT_PATH, { params: { status: 'pending' } });
    const data = unwrap(response);
    return Array.isArray(data) ? data : data?.payments || [];
  },

  create: async (payment) => {
    const response = await apiClient.post(PAYMENT_PATH, payment);
    return unwrap(response);
  },

  updateStatus: async (paymentId, status) => {
    const response = await apiClient.patch(`${PAYMENT_PATH}/${paymentId}/status`, { status });
    return unwrap(response);
  },

  remove: async (paymentId) => {
    await apiClient.delete(`${PAYMENT_PATH}/${paymentId}`);
  },

  getErrorMessage,
};

export default paymentApi;
