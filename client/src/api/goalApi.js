import axiosInstance from './axiosInstance';

/**
 * Fetch goals with optional filters (goalType, status, category, search)
 */
export const getGoals = async (params = {}) => {
  const response = await axiosInstance.get('/goals', { params });
  return response.data;
};

/**
 * Fetch single goal details by ID
 */
export const getGoalById = async (id) => {
  const response = await axiosInstance.get(`/goals/${id}`);
  return response.data;
};

/**
 * Create a new goal
 */
export const createGoal = async (data) => {
  const response = await axiosInstance.post('/goals', data);
  return response.data;
};

/**
 * Update an existing goal
 */
export const updateGoal = async (id, data) => {
  const response = await axiosInstance.put(`/goals/${id}`, data);
  return response.data;
};

/**
 * Delete a goal
 */
export const deleteGoal = async (id) => {
  const response = await axiosInstance.delete(`/goals/${id}`);
  return response.data;
};

/**
 * Update progress percentage of a goal
 */
export const updateGoalProgress = async (id, progressPercentage) => {
  const response = await axiosInstance.patch(`/goals/${id}/progress`, { progressPercentage });
  return response.data;
};

/**
 * Toggle a milestone completion status inside a goal
 */
export const toggleMilestoneStatus = async (goalId, milestoneId) => {
  const response = await axiosInstance.patch(`/goals/${goalId}/milestones/${milestoneId}`);
  return response.data;
};

/**
 * Fetch goal statistics
 */
export const getGoalStats = async () => {
  const response = await axiosInstance.get('/goals/stats');
  return response.data;
};
