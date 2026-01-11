import careerClient from '../api/careerClient';

const JOBS_BASE = '/api/jobs';
const APPS_BASE = '/api/applications';

// Job Methods
export const fetchJobs = (params = {}) =>
  careerClient.get(JOBS_BASE, { params }).then(res => res.data);

export const fetchJobById = (id) =>
  careerClient.get(`${JOBS_BASE}/${id}`).then(res => res.data);

export const createJob = (data) =>
  careerClient.post(JOBS_BASE, data).then(res => res.data);

export const updateJob = (id, data) =>
  careerClient.put(`${JOBS_BASE}/${id}`, data).then(res => res.data);

export const deleteJob = (id) =>
  careerClient.delete(`${JOBS_BASE}/${id}`).then(res => res.data);

// Application Methods
export const fetchApplications = () =>
  careerClient.get(APPS_BASE).then(res => res.data);

export const updateApplicationStatus = (id, status) =>
  careerClient.put(`${APPS_BASE}/${id}/status`, { status }).then(res => res.data);
