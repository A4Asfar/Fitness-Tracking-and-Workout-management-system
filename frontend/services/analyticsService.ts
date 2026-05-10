import api from './api';

export const getDashboardAnalytics = async () => {
  const response = await api.get('/profile/analytics');
  return response.data;
};
