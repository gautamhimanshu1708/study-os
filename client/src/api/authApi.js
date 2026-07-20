import axiosInstance from './axiosInstance';

/**
 * Authentication API Endpoints (Security Question Authentication)
 */

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const getSecurityQuestion = async (email) => {
  const response = await axiosInstance.post('/auth/get-security-question', { email });
  return response.data;
};

export const resetPasswordWithSecurityAnswer = async (resetData) => {
  const response = await axiosInstance.post('/auth/reset-password', resetData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/update-profile', profileData);
  return response.data;
};
