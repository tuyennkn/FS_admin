export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8080/router',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: '/auth/me',
  },
  
  // User endpoints
  USER: {
    ME: '/user/me',
    ALL: '/user/all',
    GET_BY_ID: '/user/getUser',
    UPDATE: '/user/update',
    DELETE: '/user/delete',
    TOGGLE_DISABLE: '/user/toggle-disable',
  },
  
  // Category endpoints
  CATEGORY: {
    ALL: '/category/allCategories',
    CREATE: '/category/createCategory',
    GET_BY_ID: '/category/getCategory',
    UPDATE: '/category/updateCategory',
    TOGGLE_DISABLE: '/category/toggle-disable',
  },
  
  // Book endpoints
  BOOK: {
    ALL: '/book/all',
    CREATE: '/book/create',
    GET_BY_ID: '/book/getBook',
    UPDATE: '/book/update',
    TOGGLE_DISABLE: '/book/toggle-disable',
    UPDATE_SUMMARY: '/book/summaryvector',
  },
  
  // Comment endpoints
  COMMENT: {
    ALL: '/comment/all',
    CREATE: '/comment/create',
    GET_BY_BOOK: '/comment/book',
    UPDATE: '/comment/update',
    DELETE: '/comment/delete',
  },
};
