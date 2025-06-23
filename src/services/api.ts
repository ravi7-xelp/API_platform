import axios from 'axios';
import { Api } from '../types';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

export const getApis = () => axios.get('/apis');

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/apis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const runAllApis = () => axios.post('/apis/run-all');

export const runApiTest = (apiId: string) => axios.post(`/apis/${apiId}/run`);

export const runPerformanceTest = (apiId: string, numRequests: number = 10) => 
  axios.post(`/apis/${apiId}/performance`, { num_requests: numRequests });

export const getTestReport = () => axios.get('/apis/report');