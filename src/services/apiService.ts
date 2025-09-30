import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from '../utils/tokenUtils';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  User,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  ApiResponse,
  DashboardStats,
  PaginatedResponse
} from '../types';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
});

api.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken }, {
          baseURL: API_ENDPOINTS.BASE_URL
        });
        const data: any = res.data;
        setAccessToken(data.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // handle logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        console.error('Refresh token failed', err);
      }
    }
    return Promise.reject(error);
  }
);

// Auth methods
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data as LoginResponse;
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await api.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data as ApiResponse<User>;
  },
};

// User methods
export const userAPI = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get(
      API_ENDPOINTS.USER.ALL
    );
    return response.data as ApiResponse<User[]>;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.post(
      API_ENDPOINTS.USER.GET_BY_ID,
      { id }
    );
    return response.data as ApiResponse<User>;
  },

  update: async (userData: Partial<User> & { id: string }): Promise<ApiResponse<User>> => {
    const response = await api.put(
      API_ENDPOINTS.USER.UPDATE,
      userData
    );
    return response.data as ApiResponse<User>;
  },

  toggleDisable: async (id: string, isDisable: boolean): Promise<ApiResponse<User>> => {
    const response = await api.put(
      API_ENDPOINTS.USER.TOGGLE_DISABLE,
      { id, isDisable }
    );
    return response.data as ApiResponse<User>;
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(
      `${API_ENDPOINTS.USER.DELETE}/${id}`
    );
    return response.data as ApiResponse<any>;
  },
};

// Category methods
export const categoryAPI = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get(
      API_ENDPOINTS.CATEGORY.ALL
    );
    return response.data as ApiResponse<Category[]>;
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await api.post(
      API_ENDPOINTS.CATEGORY.GET_BY_ID,
      { id }
    );
    return response.data as ApiResponse<Category>;
  },

  create: async (categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.post(
      API_ENDPOINTS.CATEGORY.CREATE,
      categoryData
    );
    return response.data as ApiResponse<Category>;
  },

  update: async (categoryData: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
    const response = await api.put(
      API_ENDPOINTS.CATEGORY.UPDATE,
      categoryData
    );
    return response.data as ApiResponse<Category>;
  },

  toggleDisable: async (id: string, isDisable: boolean): Promise<ApiResponse<Category>> => {
    const response = await api.put(
      API_ENDPOINTS.CATEGORY.TOGGLE_DISABLE,
      { id, isDisable }
    );
    return response.data as ApiResponse<Category>;
  },
};

// Book methods
export const bookAPI = {
  getAll: async (): Promise<ApiResponse<Book[]>> => {
    const response = await api.get(
      API_ENDPOINTS.BOOK.ALL
    );
    return response.data as ApiResponse<Book[]>;
  },

  getPaginated: async (page: number, limit: number): Promise<PaginatedResponse<Book>> => {
    const response = await api.get(
      API_ENDPOINTS.BOOK.PAGINATED(page, limit)
    );
    return response.data as PaginatedResponse<Book>;
  },

  getById: async (id: string): Promise<ApiResponse<Book>> => {
    const response = await api.get(
      `${API_ENDPOINTS.BOOK.GET_BY_ID}/${id}`
    );
    return response.data as ApiResponse<Book>;
  },

  create: async (bookData: CreateBookRequest): Promise<ApiResponse<Book>> => {
    const response = await api.post(
      API_ENDPOINTS.BOOK.CREATE,
      bookData
    );
    return response.data as ApiResponse<Book>;
  },

  update: async (bookData: UpdateBookRequest): Promise<ApiResponse<Book>> => {
    const response = await api.put(
      API_ENDPOINTS.BOOK.UPDATE,
      bookData
    );
    return response.data as ApiResponse<Book>;
  },

  toggleDisable: async (id: string, isDisable: boolean): Promise<ApiResponse<Book>> => {
    const response = await api.put(
      API_ENDPOINTS.BOOK.TOGGLE_DISABLE,
      { id, isDisable }
    );
    return response.data as ApiResponse<Book>;
  },

  updateSummary: async (id: string, summaryvector: string): Promise<ApiResponse<Book>> => {
    const response = await api.put(
      API_ENDPOINTS.BOOK.UPDATE_SUMMARY,
      { id, summaryvector }
    );
    return response.data as ApiResponse<Book>;
  },
};

// Comment methods
export const commentAPI = {
  getAll: async (): Promise<ApiResponse<Comment[]>> => {
    const response = await api.get(
      API_ENDPOINTS.COMMENT.ALL
    );
    return response.data as ApiResponse<Comment[]>;
  },

  getByBook: async (bookId: string): Promise<ApiResponse<Comment[]>> => {
    const response = await api.get(
      `${API_ENDPOINTS.COMMENT.GET_BY_BOOK}/${bookId}`
    );
    return response.data as ApiResponse<Comment[]>;
  },

  create: async (commentData: CreateCommentRequest): Promise<ApiResponse<Comment>> => {
    const response = await api.post(
      API_ENDPOINTS.COMMENT.CREATE,
      commentData
    );
    return response.data as ApiResponse<Comment>;
  },

  update: async (id: string, commentData: UpdateCommentRequest): Promise<ApiResponse<Comment>> => {
    const response = await api.put(
      `${API_ENDPOINTS.COMMENT.UPDATE}/${id}`,
      commentData
    );
    return response.data as ApiResponse<Comment>;
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(
      `${API_ENDPOINTS.COMMENT.DELETE}/${id}`
    );
    return response.data as ApiResponse<any>;
  },
};

// Dashboard methods
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // This would need to be implemented in your backend
    // For now, we'll calculate it from existing data
    const [users, books, categories, comments] = await Promise.all([
      userAPI.getAll(),
      bookAPI.getAll(),
      categoryAPI.getAll(),
      commentAPI.getAll()
    ]);

    const stats: DashboardStats = {
      totalUsers: users.data.length,
      totalBooks: books.data.length,
      totalCategories: categories.data.length,
      totalComments: comments.data.length,
      activeUsers: users.data.filter(u => !u.isDisable).length,
      activeBooks: books.data.filter(b => !b.isDisable).length,
      revenue: books.data.reduce((sum, book) => sum + (book.price * book.sold), 0),
      recentActivity: []
    };

    return {
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
      statusCode: 200
    };
  },
};

// Legacy apiService for backward compatibility
export const apiService = {
  get: <T = any>(url: string, config?: any) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => api.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => api.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => api.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: any) => api.patch<T>(url, data, config),
  request: <T = any>(config: any) => api.request<T>(config),
  
  // Add services
  categories: {
    getAll: async () => {
      const response = await api.get('/category/allCategories');
      return response.data;
    }
  },
  
  pendingCategories: {
    getAll: async (params: any) => {
      const response = await api.get('/pending-categories', { params });
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await api.get(`/pending-categories/${id}`);
      return response.data;
    },
    
    getStats: async () => {
      const response = await api.get('/pending-categories/stats');
      return response.data;
    },
    
    approve: async (id: string, data: any) => {
      const response = await api.put(`/pending-categories/${id}/approve`, data);
      return response.data;
    },
    
    reject: async (id: string, data: any) => {
      const response = await api.put(`/pending-categories/${id}/reject`, data);
      return response.data;
    },
    
    assignToExisting: async (id: string, data: any) => {
      const response = await api.put(`/pending-categories/${id}/assign`, data);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await api.delete(`/pending-categories/${id}`);
      return response.data;
    }
  }
};
