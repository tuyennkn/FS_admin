/**
 * Admin Fake Data Service
 * Handles fake data generation API calls
 */

import { api } from './apiService';
import { ApiResponse } from '../types';

interface FakeDataStats {
  users: {
    total: number;
    active: number;
  };
  orders: {
    byStatus: Array<{ _id: string; count: number }>;
    byPaymentType: Array<{ _id: string; count: number }>;
    totalRevenue: number;
    averageValue: number;
  };
}

interface FakeDataGenerationResult {
  usersGenerated: number;
  ordersGenerated: number;
  statistics: FakeDataStats;
}

interface FakeDataCleanupResult {
  usersDeleted: number;
  ordersDeleted: number;
}

export const fakeDataService = {
  // Generate fake users and orders
  generateFakeData: async (): Promise<ApiResponse<FakeDataGenerationResult>> => {
    try {
      const response = await api.post('/admin/generate-fake-data');
      return response.data as ApiResponse<FakeDataGenerationResult>;
    } catch (error: any) {
      console.error('Generate fake data error:', error);
      throw error.response?.data || error;
    }
  },

  // Get fake data statistics
  getFakeDataStats: async (): Promise<ApiResponse<FakeDataStats>> => {
    try {
      const response = await api.get('/admin/fake-data-stats');
      return response.data as ApiResponse<FakeDataStats>;
    } catch (error: any) {
      console.error('Get fake data stats error:', error);
      throw error.response?.data || error;
    }
  },

  // Cleanup fake data
  cleanupFakeData: async (): Promise<ApiResponse<FakeDataCleanupResult>> => {
    try {
      const response = await api.delete('/admin/cleanup-fake-data');
      return response.data as ApiResponse<FakeDataCleanupResult>;
    } catch (error: any) {
      console.error('Cleanup fake data error:', error);
      throw error.response?.data || error;
    }
  }
};