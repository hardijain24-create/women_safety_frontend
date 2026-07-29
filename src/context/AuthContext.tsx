import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi } from '../api/services';
import { authEmitter } from '../api/client';


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
    console.log('[AuthContext] Fetching user profile...');
    try {
      const response = await userApi.getProfile();
      console.log('[AuthContext] Fetch profile response:', response);
      if (response.success && response.data) {
        setUser(response.data);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        console.log('[AuthContext] User state successfully set:', response.data);
      }
    } catch (e) {
      console.error('[AuthContext] Failed to fetch user profile:', e);
    }
  };

  const login = async (data: any) => {
    console.log('[AuthContext] login() invoked with email:', data.email);
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      console.log('[AuthContext] login API response:', response);
      if (response.success && response.data) {
        const token = response.data.access_token || response.data.token;
        console.log('[AuthContext] Login success, token extracted. Setting state and AsyncStorage...');
        setUserToken(token);
        setUser(response.data.user);
        await AsyncStorage.setItem('userToken', token);
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        await fetchUser();
      } else {
        console.error('[AuthContext] Login API returned success=false:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('[AuthContext] Login request exception caught:', error);
      let msg = error.response?.data?.message;
      if (!msg && error.response?.data?.detail) {
        const detail = error.response.data.detail;
        msg = Array.isArray(detail) ? detail[0]?.msg : detail;
      }
      throw new Error(msg || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const { guardian, ...regData } = data;
      const response = await authApi.register(regData);
      if (response.success && response.data) {
        const token = response.data.access_token || response.data.token;
        await AsyncStorage.setItem('userToken', token);
        if (response.data.user) {
          setUser(response.data.user);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        
        if (guardian && guardian.name && guardian.phone) {
          try {
            await userApi.addContact({
              contact: {
                name: guardian.name,
                phone: guardian.phone.replace(/\D/g, ''),
                relation: 'Guardian',
                isPrimary: true
              }
            });
          } catch (contactErr) {
            console.warn('Failed to add primary guardian during onboarding:', contactErr);
          }
        }

        setUserToken(token);
        await fetchUser();
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      let msg = error.response?.data?.message;
      if (!msg && error.response?.data?.detail) {
        const detail = error.response.data.detail;
        msg = Array.isArray(detail) ? detail[0]?.msg : detail;
      }
      throw new Error(msg || error.message || 'Registration failed');
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
      await AsyncStorage.removeItem('userData');
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
      let savedUser = await AsyncStorage.getItem('userData');
      
      setUserToken(token);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse saved user data", e);
        }
      }
      
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

    const unsubscribe = authEmitter.subscribe(() => {
      console.log('[AuthContext] Session expired (401). Routing back to login.');
      logout();
    });

    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
