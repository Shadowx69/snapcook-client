import { api } from './client';

export const snapApi = {
  detect:        (formData)  => api.upload('/snap/detect', formData),
  analyze:       (formData)  => api.upload('/snap', formData),
  analyzeManual: (data)      => api.post('/snap/manual', data),
  getHistory:    ()          => api.get('/snap/history'),
};
