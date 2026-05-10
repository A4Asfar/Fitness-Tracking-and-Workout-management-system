import api from './api';

export interface WorkoutLog {
  id?: string;
  userId?: string;
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  type?: string;
  duration?: number;
  date?: string;
}

export const WorkoutService = {
  logWorkout: async (workout: WorkoutLog) => {
    const response = await api.post('/workouts', workout);
    return response.data;
  },

  getWorkouts: async () => {
    const response = await api.get('/workouts');
    return response.data;
  },

  deleteWorkout: async (id: string) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  }
};
