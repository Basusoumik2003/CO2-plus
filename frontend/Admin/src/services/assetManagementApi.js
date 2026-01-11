import apiClient from '../api/apiClient';

const BASE = '/api/assets';

/**
 * Fetch all pending assets for review (for workflow)
 */
export const fetchPendingAssets = (filters = {}) =>
  apiClient
    .get(`${BASE}/pending`, { params: filters })
    .then(res => res.data?.data || [])
    .catch(err => {
      console.error('Error fetching pending assets:', err);
      return [];
    });

/**
 * Fetch approved assets (for asset management section)
 */
export const fetchApprovedAssets = (filters = {}) =>
  apiClient
    .get(`${BASE}/approved`, { params: filters })
    .then(res => res.data?.data || [])
    .catch(err => {
      console.error('Error fetching approved assets:', err);
      return [];
    });

/**
 * Get asset details by ID (for modal review)
 */
export const fetchAssetDetails = (assetId, assetType) =>
  apiClient
    .get(`${BASE}/${assetType}/${assetId}`)
    .then(res => res.data?.data)
    .catch(err => {
      console.error(`Error fetching asset ${assetId}:`, err);
      throw err;
    });

/**
 * Approve an asset
 * @param {number} assetId - Asset ID
 * @param {string} assetType - Type: "EV" | "Tree" | "Solar"
 * @param {string} notes - Optional review notes
 */
export const approveAsset = (assetId, assetType, notes = '') =>
  apiClient
    .patch(`${BASE}/${assetType}/${assetId}/status`, {
      status: 'approved',
      notes,
      reviewed_at: new Date().toISOString()
    })
    .then(res => res.data?.data)
    .catch(err => {
      console.error(`Error approving asset:`, err);
      throw err;
    });

/**
 * Reject an asset
 * @param {number} assetId - Asset ID
 * @param {string} assetType - Type: "EV" | "Tree" | "Solar"
 * @param {string} reason - Rejection reason (required)
 */
export const rejectAsset = (assetId, assetType, reason = '') =>
  apiClient
    .patch(`${BASE}/${assetType}/${assetId}/status`, {
      status: 'rejected',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString()
    })
    .then(res => res.data?.data)
    .catch(err => {
      console.error(`Error rejecting asset:`, err);
      throw err;
    });

/**
 * Get asset management metrics/dashboard stats
 */
export const fetchAssetMetrics = () =>
  apiClient
    .get(`${BASE}/stats/metrics`)
    .then(res => res.data?.data)
    .catch(err => {
      console.error('Error fetching asset metrics:', err);
      return null;
    });

/**
 * Search/Filter assets
 */
export const searchAssets = (query, filters = {}) =>
  apiClient
    .get(`${BASE}/search`, { 
      params: { q: query, ...filters } 
    })
    .then(res => res.data?.data || [])
    .catch(err => {
      console.error('Error searching assets:', err);
      return [];
    });
