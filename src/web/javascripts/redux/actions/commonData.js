import {
  SET_AUTH_TOKEN,
  CLEAR_AUTH_TOKEN,
  SET_USER,
  CLEAR_USER,
  SET_ROLE,
  SET_PERMISSIONS,
  SET_SCREEN_LOADING,
  SET_SELECTED_ORGANIZATION,
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
  CLEAR_NOTIFICATIONS,
  RESET_COMMON_DATA,
} from '../constants';

// Set authentication token
export const setAuthToken = (token) => ({
  type: SET_AUTH_TOKEN,
  payload: token,
});

// Clear authentication token
export const clearAuthToken = () => ({
  type: CLEAR_AUTH_TOKEN,
});

// Set user
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

// Clear user
export const clearUser = () => ({
  type: CLEAR_USER,
});

// Set role
export const setRole = (role) => ({
  type: SET_ROLE,
  payload: role,
});

// Set permissions
export const setPermissions = (permissions) => ({
  type: SET_PERMISSIONS,
  payload: permissions,
});

// Set screen loading state
export const setScreenLoading = (isLoading) => ({
  type: SET_SCREEN_LOADING,
  payload: isLoading,
});

// Set selected organization
export const setSelectedOrganization = (organization) => ({
  type: SET_SELECTED_ORGANIZATION,
  payload: organization,
});

// Add notification
export const addNotification = (notification) => ({
  type: ADD_NOTIFICATION,
  payload: notification,
});

// Remove notification
export const removeNotification = (id) => ({
  type: REMOVE_NOTIFICATION,
  payload: id,
});

// Clear all notifications
export const clearNotifications = () => ({
  type: CLEAR_NOTIFICATIONS,
});

// Reset common data
export const resetCommonData = () => ({
  type: RESET_COMMON_DATA,
});

// Logout action - clears auth data
export const logout = () => (dispatch) => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('savedEmail');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('user');
  dispatch(resetCommonData());
};

// Async logout action with API call and toast notification
export const performLogoutAction = (navigate, showNotification) => async (dispatch, getState) => {
  try {
    // Get token from state or localStorage
    const state = getState();
    const token = state?.commonData?.authToken || localStorage.getItem('authToken');
    
    if (token) {
      // Import userApi to call logout endpoint
      const { userApi } = require('../../apiCalls');
      
      // Call POST /auth/logout with Bearer token
      await userApi.logout();
    }
    
    // Clear all auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    
    // Clear Redux state
    dispatch(resetCommonData());
    
    // Show success notification
    if (showNotification) {
      showNotification('Successfully logged out', 'success');
    }
    
    // Redirect to login page
    if (navigate) {
      navigate('/login');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API fails, clear local data
    localStorage.removeItem('authToken');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    dispatch(resetCommonData());
    
    // Show error notification but still redirect
    if (showNotification) {
      showNotification('Logged out (server notification failed)', 'warning');
    }
    
    if (navigate) {
      navigate('/login');
    }
    
    return { success: true };
  }
};
