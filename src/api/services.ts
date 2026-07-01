import { apiClient } from './client';

export const authApi = {
  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};

export const alertApi = {
  triggerAlert: async (data: any) => {
    const response = await apiClient.post('/alert/trigger', data);
    return response.data;
  },
  resolveAlert: async (alertId: string) => {
    const response = await apiClient.post(`/alert/resolve/${alertId}`);
    return response.data;
  },
  getAlerts: async () => {
    const response = await apiClient.get('/alert/all');
    return response.data;
  },
};

export const locationApi = {
  updateLocation: async (data: any) => {
    const response = await apiClient.post('/location/update', data);
    return response.data;
  },
  getLocations: async (alertId: string) => {
    const response = await apiClient.get(`/location/${alertId}`);
    return response.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/user/me');
    return response.data;
  },
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/user/update', data);
    return response.data;
  },
  addContact: async (data: any) => {
    const response = await apiClient.post('/user/add-contact', data);
    return response.data;
  },
  deleteContact: async (contactId: string) => {
    const response = await apiClient.delete(`/user/contact/${contactId}`);
    return response.data;
  },
  pairDevice: async (data: { device_id: string }) => {
    const response = await apiClient.post('/user/pair-device', data);
    return response.data;
  },
};

