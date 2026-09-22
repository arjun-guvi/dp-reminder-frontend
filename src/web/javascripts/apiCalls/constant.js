export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api/v1';
export const WEB_SOCKET_URL = process.env.WEB_SOCKET_URL || 'ws://localhost:9001';
export const TIMEOUT = 30000; // 30 seconds
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
