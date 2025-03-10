import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.10.190:8080',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// İstek interceptor'ı
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Yanıt interceptor'ı
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    console.error('API Error:', error.response); // Debug için
    return Promise.reject(error);
});

export default api; 