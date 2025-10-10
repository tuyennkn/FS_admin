import { apiService } from './apiService';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import { 
  Order, 
  OrderListParams, 
  UpdateOrderStatusRequest,
  PaginatedResponse 
} from '../types';

export const orderService = {
  // Get all orders with pagination and filtering
  async getAllOrders(params: OrderListParams): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, status, search } = params;
    const response = await apiService.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDER.ALL(page, limit, status, search)
    );
    return response.data as PaginatedResponse<Order>;
  },

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<Order>(
      API_ENDPOINTS.ORDER.GET_BY_ID(id)
    );
    return response.data as Order;
  },

  // Update order status
  async updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiService.put<Order>(
      API_ENDPOINTS.ORDER.UPDATE_STATUS(id),
      request
    );
    return response.data as Order;
  },

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.ORDER.DELETE(id));
  },
};