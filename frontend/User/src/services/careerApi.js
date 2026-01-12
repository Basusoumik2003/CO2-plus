import careerClient from '../api/careerClient';

const JOBS_BASE = '/api/jobs';
const APPS_BASE = '/api/applications';

export const fetchActiveJobs = () =>
  careerClient.get(JOBS_BASE, { params: { status: 'Active' } }).then(res => res.data);

export const submitApplication = (data) =>
  careerClient.post(APPS_BASE, data).then(res => res.data);
