import axiosInstance from './axiosInstance';

/**
 * Fetch consistency logs (default: past 365 days)
 */
export const getConsistencyLogs = async (startDate, endDate) => {
  const params = {};
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  const response = await axiosInstance.get('/consistency', { params });
  return response.data;
};

/**
 * Log or update activity for a date
 */
export const logDailyActivity = async (data) => {
  const response = await axiosInstance.post('/consistency', data);
  return response.data;
};

/**
 * Fetch streak and consistency statistics
 */
export const getConsistencyStats = async () => {
  const response = await axiosInstance.get('/consistency/stats');
  return response.data;
};

/**
 * Auto sync tasks & sessions completion for a date
 */
export const autoSyncDailyActivity = async (date) => {
  const response = await axiosInstance.post('/consistency/sync', { date });
  return response.data;
};
