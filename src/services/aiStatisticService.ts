import { getAccessToken } from '../utils/tokenUtils';
import { apiService } from './apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

// Types cho AI Statistics
export interface AiStatistic {
  _id: string;
  title: string;
  summary: string;
  richSummary?: string; // Formatted summary từ backend
  status: 'generating' | 'completed' | 'failed';
  bookAnalysis: BookAnalysis[];
  chartData: ChartData;
  aiInsights?: AiInsights; // Thêm AI insights
  conclusion: string;
  recommendations: string[];
  totalBooksAnalyzed: number;
  start: string;
  end: string;
  user_id: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookAnalysis {
  book: string;
  reason: string;
  salesCount: number;
  rating: number;
}

export interface AiInsights {
  customerInsights?: string;
  marketTrends?: string;
  businessOpportunities?: string;
  pricingStrategy?: string;
  predictions?: string;
}

export interface ChartData {
  topBooks: TopBook[];
  reasonDistribution: ReasonDistribution[];
  trends: Trend[];
  correlations: Correlation[];
}

export interface TopBook {
  title: string;
  sales: number;
}

export interface ReasonDistribution {
  reason: string;
  count: number;
}

export interface Trend {
  period: string;
  totalSales: number;
  growth: string;
}

export interface Correlation {
  factor: string;
  correlation: number;
}

export interface ReportStatus {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  message: string;
  title: string;
}

export interface GenerateReportRequest {
  // Không cần user_id vì server sẽ lấy từ token
}

export interface GenerateReportResponse {
  id: string;
  status: string;
  estimatedTime: string;
  period: string;
}

export interface PaginatedStatistics {
  data: AiStatistic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AiStatisticService {
  // Tạo báo cáo thống kê mới
  async generateStatistic(request: GenerateReportRequest = {}): Promise<GenerateReportResponse> {
    try {
      const token = getAccessToken();
      console.log('🚀 Sending generate statistic request:', {
        endpoint: API_ENDPOINTS.AI_STATISTICS.GENERATE,
        request,
        hasToken: !!token
      });
      
      const response = await apiService.post<{ success: boolean; data: GenerateReportResponse }>(
        API_ENDPOINTS.AI_STATISTICS.GENERATE,
        request,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Generate statistic response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Generate statistic error:', error);
      throw error;
    }
  }

  // Lấy báo cáo theo ID
  async getStatistic(id: string): Promise<AiStatistic> {
    try {
      const response = await apiService.get<{ success: boolean; data: AiStatistic }>(API_ENDPOINTS.AI_STATISTICS.GET_BY_ID(id));
      return response.data.data;
    } catch (error) {
      console.error('Get statistic error:', error);
      throw error;
    }
  }

  // Lấy danh sách báo cáo
  async getStatistics(
    page: number = 1, 
    limit: number = 10, 
    userId?: string
  ): Promise<PaginatedStatistics> {
    try {
      let endpoint = API_ENDPOINTS.AI_STATISTICS.ALL(page, limit);
      if (userId) {
        endpoint += `&user_id=${userId}`;
      }

      const response = await apiService.get<PaginatedStatistics>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái báo cáo
  async checkReportStatus(id: string): Promise<ReportStatus> {
    try {
      const response = await apiService.get<{ success: boolean; data: ReportStatus }>(API_ENDPOINTS.AI_STATISTICS.STATUS(id));
      return response.data.data;
    } catch (error) {
      console.error('Check status error:', error);
      throw error;
    }
  }

  // Xóa báo cáo
  async deleteStatistic(id: string): Promise<void> {
    try {
      const token = getAccessToken();
      await apiService.delete(API_ENDPOINTS.AI_STATISTICS.DELETE(id), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Delete statistic error:', error);
      throw error;
    }
  }

  // Polling để theo dõi tiến trình tạo báo cáo
  async pollReportStatus(
    id: string, 
    onProgress: (status: ReportStatus) => void,
    onComplete: (report: AiStatistic) => void,
    onError: (error: any) => void,
    interval: number = 3000
  ): Promise<void> {
    const poll = async () => {
      try {
        const status = await this.checkReportStatus(id);
        onProgress(status);

        if (status.status === 'completed') {
          const report = await this.getStatistic(id);
          onComplete(report);
          return;
        }

        if (status.status === 'failed') {
          onError(new Error('Báo cáo tạo thất bại'));
          return;
        }

        // Tiếp tục polling nếu vẫn đang generating
        if (status.status === 'generating') {
          setTimeout(poll, interval);
        }
      } catch (error) {
        onError(error);
      }
    };

    poll();
  }
}

export const aiStatisticService = new AiStatisticService();
export default aiStatisticService;