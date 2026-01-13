import { assetApiClient } from './apiClient';

export const assetService = {
  getAllAssetStatuses: async (userId) => {
    const response = await assetApiClient.get(`/assets/user/${userId}/status`);
    return response.data;
  },

  healthCheck: async () => {
    const response = await assetApiClient.get('/health');
    return response.data;
  },
};

export default assetService;
