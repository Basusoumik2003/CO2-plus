import { assetApiClient } from './apiClient';

export const treeService = {
  getAllTrees: async (userId) => {
    const response = await assetApiClient.get(`/tree/${userId}`);
    return response.data;
  },

  getTree: async (userId, treeId) => {
    const response = await assetApiClient.get(`/tree/${userId}/${treeId}`);
    return response.data;
  },

  createTree: async (treeData) => {
    const response = await assetApiClient.post('/tree', treeData);
    return response.data;
  },

  updateTree: async (userId, treeId, treeData) => {
    const response = await assetApiClient.put(`/tree/${userId}/${treeId}`, treeData);
    return response.data;
  },

  deleteTree: async (userId, treeId) => {
    const response = await assetApiClient.delete(`/tree/${userId}/${treeId}`);
    return response.data;
  },

  uploadTreeImage: async (userId, treeId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await assetApiClient.post(`/tree/${userId}/${treeId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default treeService;
