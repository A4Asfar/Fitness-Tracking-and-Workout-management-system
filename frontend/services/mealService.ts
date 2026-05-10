import api from './api';

export interface MealLog {
  id?: string;
  userId?: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  selectedMeal: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  selectedAt?: string;
}

export const MealService = {
  logMeal: async (meal: MealLog) => {
    const response = await api.post('/meals', meal);
    return response.data;
  },

  getMeals: async () => {
    const response = await api.get('/meals');
    return response.data;
  },

  deleteMeal: async (id: string) => {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  }
};
