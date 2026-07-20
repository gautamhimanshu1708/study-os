import axiosInstance from './axiosInstance';

export const logStudySession = async (data) => {
  const response = await axiosInstance.post('/study-sessions', data);
  return response.data;
};

export const getStudySessions = async () => {
  const response = await axiosInstance.get('/study-sessions');
  return response.data;
};

export const getStudySessionStats = async () => {
  const response = await axiosInstance.get('/study-sessions/stats');
  return response.data;
};
