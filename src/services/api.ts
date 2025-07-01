import axios from 'axios';

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