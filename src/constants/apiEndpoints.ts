export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8080/router',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    ME: (userId: string) => `/auth/me?userId=${userId}`,
  },
  
  // User endpoints
  USER: {
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
    PENDING: {
      ALL: (page: number, limit: number, status?: string, search?: string) => {
        let url = `/pending-categories?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return url;
      },
      CREATE: '/pending-categories/create',
      APPROVE: (id: string) => `/pending-categories/${id}/approve`,
      REJECT: (id: string) => `/pending-categories/${id}/reject`,
      ASSIGN: (id: string) => `/pending-categories/${id}/assign`,
      DELETE: (id: string) => `/pending-categories/${id}`,
      GET_BY_ID: (id: string) => `/pending-categories/${id}`,
      STATS: '/pending-categories/stats',
    }
  },
  
  // Book endpoints
  BOOK: {
    ALL: '/book/all',
    PAGINATED: (page: number, limit: number) => `/book/paginated?page=${page}&limit=${limit}`,
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
