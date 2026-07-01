import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi } from '../api/services';

type User = {
  id: string;
  name?: string;
  email: string;
  [key: string]: any;
};

type AuthContextType = {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (e) {
      console.log('Failed to fetch user', e);
    }
  };

  const login = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        const token = response.data.access_token || response.data.token;
        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);
        await fetchUser();
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const token = response.data.access_token || response.data.token;
        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);
        await fetchUser();
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      setUser(null);
      await AsyncStorage.removeItem('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      if (token) {
        await fetchUser();
      }
    } catch (e) {
      console.log('isLoggedIn error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
