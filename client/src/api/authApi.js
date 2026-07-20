import axiosInstance from './axiosInstance';

/**
 * Authentication API Endpoints
 */

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const verifyEmailOtp = async (data) => {
  const response = await axiosInstance.post('/auth/verify-email', data);
  return response.data;
};

export const resendOtp = async (data) => {
  const response = await axiosInstance.post('/auth/resend-otp', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data, token) => {
  if (token) {
    const response = await axiosInstance.put(`/auth/reset-password/${token}`, data);
    return response.data;
  }
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axiosInstance.put('/auth/update-profile', profileData);
  return response.data;
};
