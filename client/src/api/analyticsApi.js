import axiosInstance from './axiosInstance';

/**
 * Fetch aggregated analytics data
 */
export const getAnalyticsSummary = async () => {
  const response = await axiosInstance.get('/analytics');
  return response.data;
};
