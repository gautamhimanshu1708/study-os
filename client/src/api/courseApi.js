import axiosInstance from './axiosInstance';

/**
 * Fetch enrolled courses with optional filters (platform, status, search)
 */
export const getCourses = async (params = {}) => {
  const response = await axiosInstance.get('/courses', { params });
  return response.data;
};

/**
 * Fetch single course details by ID
 */
export const getCourseById = async (id) => {
  const response = await axiosInstance.get(`/courses/${id}`);
  return response.data;
};

/**
 * Create a new course
 */
export const createCourse = async (data) => {
  const response = await axiosInstance.post('/courses', data);
  return response.data;
};

/**
 * Update an existing course
 */
export const updateCourse = async (id, data) => {
  const response = await axiosInstance.put(`/courses/${id}`, data);
  return response.data;
};

/**
 * Delete a course
 */
export const deleteCourse = async (id) => {
  const response = await axiosInstance.delete(`/courses/${id}`);
  return response.data;
};

/**
 * Quick update course progress percentage
 */
export const updateCourseProgress = async (id, progressPercentage) => {
  const response = await axiosInstance.patch(`/courses/${id}/progress`, { progressPercentage });
  return response.data;
};

/**
 * Fetch course statistics (Total, Completed, In Progress, Not Started, Avg %)
 */
export const getCourseStats = async () => {
  const response = await axiosInstance.get('/courses/stats');
  return response.data;
};
