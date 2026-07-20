import axiosInstance from './axiosInstance';

/**
 * Fetch planner tasks with optional filters (type, subject, priority, isCompleted, search, category)
 */
export const getTasks = async (params = {}) => {
  const response = await axiosInstance.get('/planner/tasks', { params });
  return response.data;
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  const response = await axiosInstance.get(`/planner/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task (Normal or Topic-Based)
 */
export const createTask = async (data) => {
  const response = await axiosInstance.post('/planner/tasks', data);
  return response.data;
};

/**
 * Update an existing task
 */
export const updateTask = async (id, data) => {
  const response = await axiosInstance.put(`/planner/tasks/${id}`, data);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/planner/tasks/${id}`);
  return response.data;
};

/**
 * Toggle overall task completion status
 */
export const toggleTaskStatus = async (id) => {
  const response = await axiosInstance.patch(`/planner/tasks/${id}/toggle`);
  return response.data;
};

/**
 * Toggle completion status of an individual subtopic
 */
export const toggleSubtopicStatus = async (taskId, subtopicId) => {
  const response = await axiosInstance.patch(`/planner/tasks/${taskId}/subtopic/${subtopicId}`);
  return response.data;
};

/**
 * Fetch LeetCode-style planner stats & subject progress breakdown
 */
export const getPlannerStats = async () => {
  const response = await axiosInstance.get('/planner/stats');
  return response.data;
};
