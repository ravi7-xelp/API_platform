import axios from 'axios';

export const startLoadTest = (params: any) => axios.post('/loadtest/start', params);
export const stopLoadTest = () => axios.post('/loadtest/stop');
export const getLoadTestStatus = () => axios.get('/loadtest/status');
export const downloadLoadTestReport = (format = 'json') =>
  axios.get(`/loadtest/report?format=${format}`, { responseType: format === 'csv' ? 'blob' : 'json' });
