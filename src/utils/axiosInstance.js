import axios from 'axios';
import { setupAxiosInterceptors } from './auth';

const backendApi = import.meta.env.VITE_BACKEND_API  || 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: backendApi,
});


setupAxiosInterceptors(axiosInstance);

export default axiosInstance;