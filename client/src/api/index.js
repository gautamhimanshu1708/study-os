/**
 * Centralized API Configuration & Export Layer for StudyOS
 * 
 * Configures the base API URL dynamically for Development & Production environments.
 * Ensures all requests are prefixed with `/api`.
 */

export { default as axiosInstance, API_BASE_URL } from './axiosInstance';
export * from './authApi';
export * from './plannerApi';
export * from './courseApi';
export * from './goalApi';
export * from './consistencyApi';
export * from './analyticsApi';
export * from './studySessionApi';
export * from './deadlineApi';
