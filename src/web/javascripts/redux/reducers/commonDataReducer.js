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

const initialState = {
  authToken: '',
  user: null,
  role: '',
  permissions: {},
  isScreenLoading: false,
  selectedOrganization: null,
  notifications: [],
};

const commonDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      return {
        ...state,
        authToken: action.payload,
      };
    case CLEAR_AUTH_TOKEN:
      return {
        ...state,
        authToken: '',
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case CLEAR_USER:
      return {
        ...state,
        user: null,
      };
    case SET_ROLE:
      return {
        ...state,
        role: action.payload,
      };
    case SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      };
    case SET_SCREEN_LOADING:
      return {
        ...state,
        isScreenLoading: action.payload,
      };
    case SET_SELECTED_ORGANIZATION:
      return {
        ...state,
        selectedOrganization: action.payload,
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
    case RESET_COMMON_DATA:
      return initialState;
    default:
      return state;
  }
};

export default commonDataReducer;
