// Application Constants

export const APP_CONSTANTS = {
  APP_NAME: 'React App',
  APP_VERSION: '1.0.0',
  
  // Route paths
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    ADMIN: '/admin',
    STUDENT: '/student',
    SETTINGS: '/settings',
  },
  
  // User roles
  ROLES: {
    ADMIN: 'admin',
    STUDENT: 'student',
    USER: 'user',
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    THEME: 'theme',
    LANGUAGE: 'language',
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  },
  
  // File upload
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Validation patterns
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s-]{10,}$/,
    PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  },
  
  // Status
  STATUS: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    LOADING: 'loading',
  },
};

export default APP_CONSTANTS;
