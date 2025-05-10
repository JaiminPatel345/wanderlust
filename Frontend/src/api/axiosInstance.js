import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors
        if (error.response?.status === 401) {
            // Special handling for change-password endpoint
            if (originalRequest.url === '/change-password') {
                return Promise.reject(error);
            }

            // For other endpoints, redirect to login
            // localStorage.removeItem('token');
            // window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 