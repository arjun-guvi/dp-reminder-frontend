// Authentication Utilities
import { userApi } from '../apiCalls';
import { clearAuthToken, clearUser, resetCommonData } from '../redux/actions';

/**
 * Perform logout operation with API call
 * - Calls POST /auth/logout with Bearer token
 * - Clears local storage
 * - Dispatches Redux actions to clear state
 * - Shows toast notification
 * - Redirects to login
 */
export const performLogout = async (dispatch, navigate, showNotification = null) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Call logout API with Bearer token
      await userApi.logout();
    }
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    // Always clear local data regardless of API result
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Dispatch Redux actions to clear state
    dispatch(clearAuthToken());
    dispatch(clearUser());
    dispatch(resetCommonData());
    
    // Show success notification
    if (showNotification) {
      showNotification('Successfully logged out', 'success');
    }
    
    // Redirect to login page
    if (navigate) {
      navigate('/login');
    }
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Get authentication token
 * @returns {string|null} Auth token or null
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('authToken') || null;
  } catch (error) {
    return null;
  }
};

export default {
  performLogout,
  isAuthenticated,
  getAuthToken,
};