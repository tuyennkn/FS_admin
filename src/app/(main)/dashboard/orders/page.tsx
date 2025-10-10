'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Eye, 
  RefreshCw, 
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderListParams, UpdateOrderStatusRequest } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Đang xử lý', icon: RefreshCw, color: 'bg-purple-100 text-purple-800' },
  { value: 'shipping', label: 'Đang giao', icon: Truck, color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Đã giao', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Đã hủy', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderListParams>({
    page: 1,
    limit: 10,
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAllOrders(filters);
      setOrders(response.data);
      setPagination({
        currentPage: response.meta.pagination.currentPage,
        totalPages: response.meta.pagination.totalPages,
        totalItems: response.meta.pagination.totalItems,
      });
    } catch (error: any) {
      setError('Lỗi khi tải danh sách đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const request: UpdateOrderStatusRequest = { 
        status: newStatus as any 
      };
      await orderService.updateOrderStatus(orderId, request);
      setError(null);
      fetchOrders(); // Refresh the list
    } catch (error: any) {
      setError('Lỗi khi cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (!statusOption) return null;

    const Icon = statusOption.icon;
    return (
      <Badge className={`${statusOption.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusOption.label}
      </Badge>
    );
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? '' : status, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả đơn hàng trong hệ thống
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên người dùng, ID đơn hàng..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng ({pagination.totalItems})</CardTitle>
          <CardDescription>
            Hiển thị {orders.length} trên {pagination.totalItems} đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số lượng sản phẩm</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Phí ship</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.user_id?.fullname || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.user_id?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {order.items.length} sản phẩm
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total_price)}
                      </TableCell>
                      <TableCell>
                        {formatPrice(order.shipping_fee)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Xem
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Chi tiết đơn hàng #{order.id.slice(-8)}</DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết và quản lý đơn hàng
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Order Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <span className="font-medium">Tên:</span> {selectedOrder.user_id?.fullname}
                                        </div>
                                        <div>
                                          <span className="font-medium">Email:</span> {selectedOrder.user_id?.email}
                                        </div>
                                        <div>
                                          <span className="font-medium">SĐT:</span> {selectedOrder.shipping_phone_number}
                                        </div>
                                        <div>
                                          <span className="font-medium">Địa chỉ:</span> {selectedOrder.shipping_address}
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Thông tin đơn hàng</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <span className="font-medium">ID:</span> {selectedOrder.id}
                                        </div>
                                        <div>
                                          <span className="font-medium">Ngày tạo:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                        <div>
                                          <span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.payment_type}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Trạng thái:</span>
                                          <Select
                                            value={selectedOrder.status}
                                            onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                                          >
                                            <SelectTrigger className="w-[150px]">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                  {option.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Order Items */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Sản phẩm đã đặt</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Sản phẩm</TableHead>
                                            <TableHead>Số lượng</TableHead>
                                            <TableHead>Đơn giá</TableHead>
                                            <TableHead>Tổng</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedOrder.items.map((item, index) => (
                                            <TableRow key={index}>
                                              <TableCell>
                                                <div className="flex items-center gap-3">
                                                  {item.book?.image && (
                                                    <img
                                                      src={item.book.image}
                                                      alt={item.book.title}
                                                      className="w-12 h-12 object-cover rounded"
                                                    />
                                                  )}
                                                  <div>
                                                    <div className="font-medium">
                                                      {item.book?.title || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                      {item.book?.author || 'N/A'}
                                                    </div>
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell>{formatPrice(item.price)}</TableCell>
                                              <TableCell className="font-medium">
                                                {formatPrice(item.price * item.quantity)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      
                                      <div className="mt-4 space-y-2 border-t pt-4">
                                        <div className="flex justify-between">
                                          <span>Tạm tính:</span>
                                          <span>{formatPrice(selectedOrder.total_price - selectedOrder.shipping_fee)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Phí vận chuyển:</span>
                                          <span>{formatPrice(selectedOrder.shipping_fee)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                          <span>Tổng cộng:</span>
                                          <span>{formatPrice(selectedOrder.total_price)}</span>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}