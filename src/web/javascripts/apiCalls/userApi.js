import apiClient from './apiClient';
import API_URLS from './api-urls';

// User API methods
export const userApi = {
  signup: async (details) => {
    const response = await apiClient.post(API_URLS.SIGNUP, details);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post(API_URLS.LOGIN, credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post(API_URLS.LOGOUT);
      return response.data;
    } catch (error) {
      // Even if the server logout fails, we still want to clear local data
      console.warn('Server logout failed:', error);
      return { success: true };
    }
  },

  // Forgot password - placeholder implementation
  forgotPassword: async (email) => {
    const response = await apiClient.post(API_URLS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  // Reset password - placeholder implementation
  resetPassword: async (token, password) => {
    const response = await apiClient.post(API_URLS.RESET_PASSWORD, { token, password });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get(API_URLS.USER_PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await apiClient.put(API_URLS.USER_UPDATE, data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await apiClient.post(API_URLS.USER_CHANGE_PASSWORD, data);
    return response.data;
  },
};

export default userApi;
