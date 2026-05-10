import api from './api';

export const ContentService = {
  getTrainers: async () => {
    const response = await api.get('/content/trainers');
    return response.data;
  },
  
  getTrainerById: async (id: string) => {
    const response = await api.get(`/content/trainers/${id}`);
    return response.data;
  },

  getDailyPlan: async (params: { goal?: string, level?: string, focus?: string }) => {
    const response = await api.get('/content/daily-plan', { params });
    return response.data;
  },

  getNutritionSuggestions: async (goal?: string) => {
    const response = await api.get('/content/nutrition-suggestions', { params: { goal } });
    return response.data;
  },

  getMealByName: async (name: string) => {
    const response = await api.get('/content/meal', { params: { name } });
    return response.data;
  },

  getWorkoutSuggestions: async (params: { level?: string, focus?: string }) => {
    const response = await api.get('/content/workout-suggestions', { params });
    return response.data;
  }
};
