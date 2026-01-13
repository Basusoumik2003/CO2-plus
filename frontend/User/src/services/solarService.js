import { assetApiClient } from './apiClient';

export const solarService = {
  createSolarPanel: async (panelData) => {
    const response = await assetApiClient.post('/solarpanel', panelData);
    return response.data;
  },
  getAllSolarPanels: async (userId) => {
    const response = await assetApiClient.get(`/solarpanel/${userId}`);
    return response.data;
  },
  getSolarPanel: async (userId, suid) => {
    const response = await assetApiClient.get(`/solarpanel/single/${suid}`);
    return response.data;
  },
  updateSolarPanel: async (suid, panelData) => {
    const response = await assetApiClient.put(`/solarpanel/${suid}`, panelData);
    return response.data;
  },
  deleteSolarPanel: async (suid) => {
    const response = await assetApiClient.delete(`/solarpanel/${suid}`);
    return response.data;
  },
  updateSolarStatus: async (suid, statusData) => {
    const response = await assetApiClient.patch(`/solarpanel/${suid}/status`, statusData);
    return response.data;
  },
};

export default solarService;
