import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo, usually we'd use process.env.EXPO_PUBLIC_API_URL
const BASE_URL = 'https://women-safety-5lls.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // We can handle 401 Unauthorized here (e.g., logout user)
    if (error.response?.status === 401) {
      console.log('Unauthorized - possible token expiration. Clearing token.');
      await AsyncStorage.removeItem('userToken');
      // The app will likely redirect to login on the next protected action
      // or via AuthContext state change if we had a dedicated listener
    }
    return Promise.reject(error);
  }
);
