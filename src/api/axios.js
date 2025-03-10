import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - token ekleme
api.interceptors.request.use(
    (config) => {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Yanıt interceptor'ı
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    console.error('API Error:', error.response); // Debug için
    return Promise.reject(error);
});

export default api; 