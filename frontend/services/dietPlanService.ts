import api from './api';

export interface DietPlanMeal {
  _id?: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  servingSize: string;
  quantity: number;
  notes?: string;
}

export interface DietPlan {
  _id?: string;
  planName: string;
  goal: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  waterTargetLiters: number;
  meals: DietPlanMeal[];
  status: 'Active' | 'Archived' | 'Draft';
  createdAt?: string;
  trainerId?: string;
  assignedUsers?: string[];
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
