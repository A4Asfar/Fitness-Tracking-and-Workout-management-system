import api from './api';

export interface FoodItem {
  name: string;
  serving: string;
  quantity: number;
  _id?: string;
}

export interface DietPlanMeal {
  _id?: string;
  mealName: string;
  foods: FoodItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

export interface DietPlanDay {
  _id?: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast?: DietPlanMeal;
  snack1?: DietPlanMeal;
  lunch?: DietPlanMeal;
  snack2?: DietPlanMeal;
  dinner?: DietPlanMeal;
}

export interface DietPlan {
  _id?: string;
  title: string;
  goal: string;
  durationWeeks: number;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterTarget: number;
  notes?: string;
  days: DietPlanDay[];
  status: 'Active' | 'Archived' | 'Draft';
  createdAt?: string;
  trainerId?: string;
  assignedUserId?: string;
}

export const DietPlanService = {
  getMyDietPlan: async (): Promise<DietPlan | null> => {
    const res = await api.get('/diet-plans/my-plan');
    return res.data;
  },

  getAllDietPlans: async (): Promise<DietPlan[]> => {
    const res = await api.get('/diet-plans');
    return res.data;
  },

  createDietPlan: async (plan: DietPlan): Promise<DietPlan> => {
    const res = await api.post('/diet-plans', plan);
    return res.data;
  },

  updateDietPlan: async (id: string, plan: Partial<DietPlan>): Promise<DietPlan> => {
    const res = await api.put(`/diet-plans/${id}`, plan);
    return res.data;
  },

  deleteDietPlan: async (id: string): Promise<void> => {
    await api.delete(`/diet-plans/${id}`);
  },

  assignPlan: async (planId: string, userId: string): Promise<any> => {
    const res = await api.post(`/diet-plans/${planId}/assign`, { userId });
    return res.data;
  }
};
