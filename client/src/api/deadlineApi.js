import axiosInstance from './axiosInstance';

export const getDeadlines = async (params = {}) => {
  const response = await axiosInstance.get('/deadlines', { params });
  return response.data;
};

export const createDeadline = async (data) => {
  const response = await axiosInstance.post('/deadlines', data);
  return response.data;
};

export const updateDeadline = async (id, data) => {
  const response = await axiosInstance.put(`/deadlines/${id}`, data);
  return response.data;
};

export const deleteDeadline = async (id) => {
  const response = await axiosInstance.delete(`/deadlines/${id}`);
  return response.data;
};

export const toggleDeadline = async (id) => {
  const response = await axiosInstance.patch(`/deadlines/${id}/toggle`);
  return response.data;
};
