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
  dispatch(resetCommonData());
};
