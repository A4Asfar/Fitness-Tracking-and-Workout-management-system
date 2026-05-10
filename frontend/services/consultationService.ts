import api from './api';

export interface ConsultationLog {
  id?: string;
  trainerName: string;
  trainerSpecialization: string;
  consultedAt?: string;
}

export const ConsultationService = {
  logConsultation: async (log: ConsultationLog) => {
    const response = await api.post('/consultations', log);
    return response.data;
  },

  getConsultations: async () => {
    const response = await api.get('/consultations');
    return response.data;
  }
};
