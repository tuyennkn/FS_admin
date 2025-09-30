import { apiService } from './apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import {
  PendingCategory,
  PendingCategoryListResponse,
  PendingCategoryStats,
  CreatePendingCategoryRequest,
  ApprovePendingCategoryRequest,
  RejectPendingCategoryRequest,
  AssignPendingCategoryRequest,
  PendingCategoryFilters,
} from '@/types';

export const pendingCategoryService = {
  // Get all pending categories with filters
  getAll: async (filters?: PendingCategoryFilters): Promise<PendingCategoryListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    
    const queryString = params.toString();
    const baseUrl = typeof API_ENDPOINTS.CATEGORY.PENDING.ALL === 'function' 
      ? API_ENDPOINTS.CATEGORY.PENDING.ALL(1, 10) 
      : API_ENDPOINTS.CATEGORY.PENDING.ALL;
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    const response = await apiService.get<PendingCategoryListResponse>(url);
    return response.data;
  },

  // Get pending category stats
  getStats: async (): Promise<PendingCategoryStats> => {
    const response = await apiService.get<PendingCategoryStats>(API_ENDPOINTS.CATEGORY.PENDING.STATS);
    return response.data;
  },

  // Get single pending category by ID
  getById: async (id: string): Promise<PendingCategory> => {
    const response = await apiService.get<PendingCategory>(API_ENDPOINTS.CATEGORY.PENDING.GET_BY_ID(id));
    return response.data;
  },

  // Create new pending category (system internal use)
  create: async (data: CreatePendingCategoryRequest): Promise<PendingCategory> => {
    const response = await apiService.post<PendingCategory>(API_ENDPOINTS.CATEGORY.PENDING.CREATE, data);
    return response.data;
  },

  // Approve pending category
  approve: async (id: string, data: ApprovePendingCategoryRequest): Promise<{
    pending_category: PendingCategory;
    category_id: string;
    message: string;
  }> => {
    const response = await apiService.put(API_ENDPOINTS.CATEGORY.PENDING.APPROVE(id), data);
    return response.data;
  },

  // Reject pending category
  reject: async (id: string, data: RejectPendingCategoryRequest): Promise<PendingCategory> => {
    const response = await apiService.put<PendingCategory>(API_ENDPOINTS.CATEGORY.PENDING.REJECT(id), data);
    return response.data;
  },

  // Assign to existing category
  assign: async (id: string, data: AssignPendingCategoryRequest): Promise<{
    pending_category: PendingCategory;
    category: any;
  }> => {
    const response = await apiService.put(API_ENDPOINTS.CATEGORY.PENDING.ASSIGN(id), data);
    return response.data;
  },

  // Delete pending category
  delete: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.CATEGORY.PENDING.DELETE(id));
  },

  // Bulk operations
  bulkApprove: async (ids: string[], data: Omit<ApprovePendingCategoryRequest, 'category_name'> & { 
    category_name?: string 
  }): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> => {
    const results = await Promise.allSettled(
      ids.map(id => 
        pendingCategoryService.approve(id, {
          category_name: data.category_name || `Auto Category ${Date.now()}`,
          category_description: data.category_description,
          review_notes: data.review_notes
        })
      )
    );

    const successful: string[] = [];
    const failed: { id: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(ids[index]);
      } else {
        failed.push({
          id: ids[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  },

  bulkReject: async (ids: string[], review_notes: string): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> => {
    const results = await Promise.allSettled(
      ids.map(id => pendingCategoryService.reject(id, { review_notes }))
    );

    const successful: string[] = [];
    const failed: { id: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(ids[index]);
      } else {
        failed.push({
          id: ids[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  },

  bulkDelete: async (ids: string[]): Promise<{
    successful: string[];
    failed: { id: string; error: string }[];
  }> => {
    const results = await Promise.allSettled(
      ids.map(id => pendingCategoryService.delete(id))
    );

    const successful: string[] = [];
    const failed: { id: string; error: string }[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(ids[index]);
      } else {
        failed.push({
          id: ids[index],
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    return { successful, failed };
  }
};

export default pendingCategoryService;