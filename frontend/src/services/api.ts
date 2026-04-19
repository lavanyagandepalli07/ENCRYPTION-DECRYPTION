import axios from 'axios';
import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const textService = {
  encryptText: async (text: string, passphrase: string) => {
    const response = await api.post('/text/encrypt', { text, passphrase });
    return response.data;
  },
  decryptText: async (encryptedTextBase64: string, passphrase: string) => {
    const response = await api.post('/text/decrypt', { encryptedTextBase64, passphrase });
    return response.data;
  },
};

export default api;
