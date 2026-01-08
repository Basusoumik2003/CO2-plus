import { assetApiClient } from './apiClient';

export const transactionService = {
  getAllTransactions: async (userId) => {
    const response = await assetApiClient.get(`/transaction/${userId}`);
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await assetApiClient.post('/transaction', transactionData);
    return response.data;
  },

  deleteTransaction: async (userId, transactionId) => {
    const response = await assetApiClient.delete(`/transaction/${userId}/${transactionId}`);
    return response.data;
  },
};

export default transactionService;
