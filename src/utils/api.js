import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: `${API_URL}/api`, headers: { 'Content-Type': 'application/json' } });

// Request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear stale token and redirect to login
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Analytics
export const fetchDashboardData = (period = '7d') => api.get(`/analytics/dashboard?period=${period}`);
export const fetchRealtimeVisitors = () => api.get('/analytics/realtime');

// Posts
export const fetchAdminPosts = (params) => api.get('/posts/admin/all', { params });
export const fetchPostStatus = (id) => api.get(`/posts/admin/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Media Upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Menus
export const fetchAdminMenus = () => api.get('/menus/admin/all');
export const createMenu = (data) => api.post('/menus', data);
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/menus/${id}`);
export const reorderMenus = (items) => api.put('/menus/reorder/bulk', { items });

// Ads
export const fetchAdminAds = () => api.get('/ads/admin/all');
export const createAd = (data) => api.post('/ads', data);
export const updateAd = (id, data) => api.put(`/ads/${id}`, data);
export const deleteAd = (id) => api.delete(`/ads/${id}`);

// Settings & Payments
export const fetchAdminSettings = () => api.get('/settings/admin/all');
export const updateSettings = (data) => api.put('/settings/admin/update', data);

// Downloads
export const fetchAdminDownloads = () => api.get('/downloads/admin/all');
export const createDownload = (data) => api.post('/downloads', data);
export const updateDownload = (id, data) => api.put(`/downloads/${id}`, data);
export const deleteDownload = (id) => api.delete(`/downloads/${id}`);

export default api;
