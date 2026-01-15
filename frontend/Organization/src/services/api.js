import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// API service for fetching assets
export const assetAPI = {
  // Fetch all EVs for a user
  getEVs: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/evmasterdata/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching EVs:', error);
      throw error;
    }
  },

  // Fetch all Solar Panels for a user
  getSolarPanels: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/solarpanel/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Solar Panels:', error);
      throw error;
    }
  },

  // Fetch all Trees for a user
  getTrees: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tree/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Trees:', error);
      throw error;
    }
  },

  // Fetch all assets for a user (combined)
  getAllAssets: async (userId) => {
    try {
      const [evsResponse, solarResponse, treesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/evmasterdata/${userId}`),
        axios.get(`${API_BASE_URL}/solarpanel/${userId}`),
        axios.get(`${API_BASE_URL}/tree/${userId}`)
      ]);

      // Transform data to match AssetCard format
      const assets = [];

      console.log('EV Response:', evsResponse.data);
      console.log('Solar Response:', solarResponse.data);
      console.log('Tree Response:', treesResponse.data);

      // Transform EVs
      if (evsResponse.data.status === 'success' && evsResponse.data.data) {
        evsResponse.data.data.forEach(ev => {
          // Calculate efficiency (Range / Energy Consumed)
          const efficiencyVal = (ev.range && ev.energy_consumed) 
            ? (ev.range / ev.energy_consumed).toFixed(2) + ' km/kWh' 
            : 'N/A';
            
          // Calculate mock credits based on energy * magic factor (since backend doesn't give credits yet)
          const credits = ev.energy_consumed ? Math.floor(ev.energy_consumed * 2) : 0;

          assets.push({
            id: ev.vuid || `EV-${ev.ev_id}`,
            name: `${ev.manufacturers || ''} ${ev.model || 'Unknown EV'}`,
            type: 'EV',
            location: 'Mobile Asset', 
            creditsGenerated: credits, 
            verified: ev.status === 'approved',
            lastUpdated: new Date(ev.created_at || Date.now()).toLocaleDateString(),
            status: ev.status || 'Pending',
            efficiency: efficiencyVal,
            region: 'Global', // Default as EV moves
            originalData: ev
          });
        });
      }

      // Transform Solar Panels
      if (solarResponse.data.status === 'success' && solarResponse.data.data) {
        solarResponse.data.data.forEach(solar => {
           // Calculate efficiency (Generation / Capacity)
           const efficiencyVal = (solar.energy_generation_value && solar.installed_capacity)
            ? (solar.energy_generation_value / solar.installed_capacity).toFixed(2) + ' kWh/kW'
            : 'N/A';
            
           // Calculate mock credits
           const credits = solar.energy_generation_value ? Math.floor(solar.energy_generation_value * 10) : 0;

          assets.push({
            id: solar.suid || `SOLAR-${solar.solar_id}`,
            name: `Solar Panel (${solar.installed_capacity || 0}kW)`, 
            type: 'Solar',
            location: 'Fixed Installation',
            creditsGenerated: credits,
            verified: solar.status === 'approved',
            lastUpdated: new Date(solar.created_at || Date.now()).toLocaleDateString(),
            status: solar.status || 'Pending',
            efficiency: efficiencyVal,
            region: 'Local',
            originalData: solar
          });
        });
      }

      // Transform Trees
      if (treesResponse.data.status === 'success' && treesResponse.data.data) {
        treesResponse.data.data.forEach(tree => {
          // Credits based on height or age
          const credits = tree.height ? Math.floor(tree.height * 5) : 10;

          assets.push({
            id: tree.tid || `TREE-${tree.tree_id}`,
            name: tree.treename || 'Tree',
            type: 'Trees',
            location: tree.location || 'Location not specified',
            creditsGenerated: credits,
            verified: tree.status === 'approved', 
            lastUpdated: new Date(tree.plantingdate || Date.now()).toLocaleDateString(),
            status: tree.status || 'Pending',
            region: 'Local',
            originalData: tree
          });
        });
      }

      return assets;
    } catch (error) {
      console.error('Error fetching all assets:', error);
      throw error;
    }
  },

  // Delete EV
  deleteEV: async (evId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/evmasterdata/${evId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting EV:', error);
      throw error;
    }
  },

  // Delete Solar Panel
  deleteSolar: async (solarId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/solarpanel/${solarId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting Solar Panel:', error);
      throw error;
    }
  },

  // Delete Tree
  deleteTree: async (treeId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/tree/${treeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting Tree:', error);
      throw error;
    }
  },

  // Update EV
  updateEV: async (evId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/evmasterdata/${evId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating EV:', error);
      throw error;
    }
  },

  // Update Solar Panel
  updateSolar: async (solarId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/solarpanel/${solarId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating Solar Panel:', error);
      throw error;
    }
  },

  // Update Tree
  updateTree: async (treeId, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tree/${treeId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating Tree:', error);
      throw error;
    }
  },

  // Create EV
  createEV: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/evmasterdata`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating EV:', error);
      throw error;
    }
  },

  // Create Solar Panel
  createSolar: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/solarpanel`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating Solar Panel:', error);
      throw error;
    }
  },

  // Create Tree
  createTree: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tree`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating Tree:', error);
      throw error;
    }
  },

  // Upload Image
  uploadImage: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
};

export default assetAPI; 