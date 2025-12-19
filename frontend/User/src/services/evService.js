import apiClient from './api';

const evService = {
  /**
   * Get all EVs for a specific user
   * @param {string} userId - User ID
   * @returns {Promise} API response with EV list
   */
  getAllEVs: async (userId) => {
    try {
      const response = await apiClient.get(`/evmasterdata/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch EVs:', error);
      throw error.response?.data || { 
        status: 'error', 
        message: error.message || 'Failed to fetch EVs' 
      };
    }
  },

  /**
   * Get a specific EV by ID
   * @param {string} userId - User ID
   * @param {string} evId - EV ID
   * @returns {Promise} API response with EV details
   */
  getEV: async (userId, evId) => {
    try {
      const response = await apiClient.get(`/evmasterdata/${userId}/${evId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch EV:', error);
      throw error.response?.data || { 
        status: 'error', 
        message: error.message || 'Failed to fetch EV details' 
      };
    }
  },

  /**
   * Create a new EV
   * @param {Object} evData - EV data object
   * @returns {Promise} API response with created EV
   */
  createEV: async (evData) => {
    try {
      console.log('📝 Creating EV with data:', evData);
      const response = await apiClient.post('/evmasterdata', evData);
      console.log('✅ EV created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create EV:', error);
      
      // Extract error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create EV';
      
      throw error.response?.data || { 
        status: 'error', 
        message: errorMessage 
      };
    }
  },

  /**
   * Update an existing EV
   * @param {string} userId - User ID
   * @param {string} evId - EV ID
   * @param {Object} evData - Updated EV data
   * @returns {Promise} API response with updated EV
   */
  updateEV: async (userId, evId, evData) => {
    try {
      console.log('📝 Updating EV:', evId, 'with data:', evData);
      const response = await apiClient.put(`/evmasterdata/${userId}/${evId}`, evData);
      console.log('✅ EV updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update EV:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update EV';
      
      throw error.response?.data || { 
        status: 'error', 
        message: errorMessage 
      };
    }
  },

  /**
   * Delete an EV
   * @param {string} userId - User ID
   * @param {string} evId - EV ID
   * @returns {Promise} API response
   */
  deleteEV: async (userId, evId) => {
    try {
      console.log('🗑️ Deleting EV:', evId);
      const response = await apiClient.delete(`/evmasterdata/${userId}/${evId}`);
      console.log('✅ EV deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete EV:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete EV';
      
      throw error.response?.data || { 
        status: 'error', 
        message: errorMessage 
      };
    }
  },

  /**
   * Get EV approval status
   * @param {string} userId - User ID
   * @param {string} evId - EV ID
   * @returns {Promise} API response with status
   */
  getEVStatus: async (userId, evId) => {
    try {
      const response = await apiClient.get(`/evmasterdata/${userId}/${evId}/status`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch EV status:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch EV status';
      
      throw error.response?.data || { 
        status: 'error', 
        message: errorMessage 
      };
    }
  },

  /**
   * Get EV statistics for dashboard
   * @param {string} userId - User ID
   * @returns {Promise} API response with statistics
   */
  getEVStats: async (userId) => {
    try {
      const response = await apiClient.get(`/evmasterdata/${userId}`);
      const evs = response.data.data || [];
      
      return {
        status: 'success',
        stats: {
          total: evs.length,
          approved: evs.filter(ev => ev.status === 'approved').length,
          pending: evs.filter(ev => ev.status === 'pending').length,
          rejected: evs.filter(ev => ev.status === 'rejected').length,
        },
        evs
      };
    } catch (error) {
      console.error('❌ Failed to fetch EV stats:', error);
      throw error.response?.data || { 
        status: 'error', 
        message: 'Failed to fetch EV statistics' 
      };
    }
  },
};

export default evService;
