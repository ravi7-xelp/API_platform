import axios from 'axios';
import { Folder, TestCase } from '../types';

// Configure axios base URL - using HTTPS to match frontend protocol
axios.defaults.baseURL = 'http://192.168.2.69:9000';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post('/apis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getApis = async () => {
  const response = await axios.get('/apis');
  return response.data.apis || [];
};

export const runApiTest = async (apiId: string) => {
  const response = await axios.post(`/apis/${apiId}/run`);
  return response.data;
};

export const runAllApis = async () => {
  const response = await axios.post('/apis/run-all');
  return response.data;
};

export const runPerformanceTest = async (apiId: string, numRequests: number = 10) => {
  const response = await axios.post(`/apis/${apiId}/performance`, null, {
    params: { num_requests: numRequests }
  });
  return response.data;
};

export const getTestReport = async () => {
  const response = await axios.get('/apis/report');
  return response.data;
};

export const uploadCurlCommand = async (curl: string) => {
  const response = await axios.post('/apis/upload-curl', { curl });
  return response.data;
};

export const deleteApi = async (apiId: string) => {
  const response = await axios.delete(`/apis/${apiId}`);
  return response.data;
};

export const deleteAllApis = async () => {
  const response = await axios.delete('/apis/delete-all');
  return response.data;
};

// Folders
export const createFolder = async (name: string) => {
  const response = await axios.post('/api/folders', { name });
  return response.data as Folder;
};

export const getFolders = async () => {
  const response = await axios.get('/api/folders');
  return response.data as Folder[];
};

export const deleteFolder = async (id: number) => {
  const response = await axios.delete(`/api/folders/${id}`);
  return response.data;
};

// Test Cases
export const generateTestCase = async (name: string, folder_id: number, url?: string) => {
  const response = await axios.post('/api/testcases/generate', { name, folder_id, url });
  return response.data as TestCase;
};

export const getTestCases = async () => {
  const response = await axios.get('/api/testcases');
  return response.data as TestCase[];
};

export const deleteTestCase = async (id: number) => {
  const response = await axios.delete(`/api/testcases/${id}`);
  return response.data;
};

export const runTestCases = async (testcase_ids: number[]) => {
  const response = await axios.post('/api/testcases/run', testcase_ids);
  return response.data;
};

export const recordTestCase = async (url?: string) => {
  const response = await axios.post('/api/testcases/record', url ? { url } : {});
  return response.data;
};

export const saveTestCase = async (name: string, folder_id: number) => {
  const response = await axios.post('/api/testcases/save', { name, folder_id });
  return response.data;
};