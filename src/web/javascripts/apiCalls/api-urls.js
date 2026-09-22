// API endpoint paths
export const API_URLS = {
  // Authentication
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // User
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',
  USER_CHANGE_PASSWORD: '/user/change-password',
  
  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_USERS_CREATE: '/admin/users/create',
  ADMIN_USERS_UPDATE: '/admin/users/update',
  
  // Student routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  
  // Settings
  SETTINGS_GET: '/settings',
  SETTINGS_UPDATE: '/settings/update',
};

export default API_URLS;
