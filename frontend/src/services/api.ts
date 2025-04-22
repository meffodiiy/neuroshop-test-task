import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error);
      // You could show a toast notification here
    }

    return Promise.reject(error);
  }
);

export const register = (email: string, password: string): Promise<AxiosResponse<any>> => {
  return api.post('/register', { email, password });
};

export const login = (email: string, password: string): Promise<AxiosResponse<{ access_token: string }>> => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  return axios.post(`${API_URL}/token`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const getCurrentUser = (): Promise<AxiosResponse<any>> => {
  return api.get('/users/me');
};

export type TelegramAccountData = {
  phone_number: string;
  [key: string]: any;
}

export type TelegramAuthData = {
  account_id: number;
  code?: string;
  password?: string;
  [key: string]: any;
}

export const createTelegramAccount = (accountData: TelegramAccountData): Promise<AxiosResponse<any>> => {
  return api.post('/telegram-accounts', accountData);
};

export const authenticateTelegramAccount = (authData: TelegramAuthData): Promise<AxiosResponse<any>> => {
  return api.post(`/telegram-accounts/${authData.account_id}/auth`, authData);
};

export const getTelegramAccounts = (): Promise<AxiosResponse<any>> => {
  return api.get('/telegram-accounts');
};

export const deleteTelegramAccount = (accountId: number): Promise<AxiosResponse<any>> => {
  return api.delete(`/telegram-accounts/${accountId}`);
};

export const logoutTelegramAccount = (accountId: number): Promise<AxiosResponse<any>> => {
  return api.post(`/telegram-accounts/${accountId}/logout`);
};

export const getTelegramChats = (accountId: number): Promise<AxiosResponse<any>> => {
  return api.get(`/telegram-accounts/${accountId}/chats`);
};

export const getTelegramMessages = (accountId: number, chatId: number): Promise<AxiosResponse<any>> => {
  return api.get(`/telegram-accounts/${accountId}/chats/${chatId}/messages`);
};

export default api;
