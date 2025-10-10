// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseApiResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode?: number;
}

// User types
export interface User extends BaseEntity {
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  birthday?: string;
  avatar?: string;
  persona?: string;
  address?: string;
  role: "admin" | "user";
  isDisable: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  birthday?: string;
  avatar?: string;
  persona?: string;
  address?: string;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  description: string;
  isDisable: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  isDisable?: boolean;
}

// PendingCategory types
export interface PendingCategoryBookData {
  title: string;
  author: string;
  genre: string;
  image: string[];
}

export interface PendingCategoryReviewer {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface PendingCategory extends BaseEntity {
  ai_recommended_name: string;
  ai_recommended_description?: string;
  book_id: string;
  book_data: PendingCategoryBookData;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | PendingCategoryReviewer;
  review_notes?: string;
  isDisable: boolean;
}

export interface CreatePendingCategoryRequest {
  book_id: string;
  genre: string;
}

export interface ApprovePendingCategoryRequest {
  category_name: string;
  category_description?: string;
  review_notes?: string;
}

export interface RejectPendingCategoryRequest {
  review_notes: string;
}

export interface AssignPendingCategoryRequest {
  existing_category_id: string;
  review_notes?: string;
}

export interface PendingCategoryStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  recent_activity?: any[];
}

export interface PendingCategoryFilters {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PendingCategoryListResponse extends BaseApiResponse {
  results: PendingCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  total: number;
  stats?: PendingCategoryStats;
}

// Book types
export interface BookAttributes {
  isbn?: string;
  publisher?: string;
  firstPublishDate?: string;
  publishDate?: string;
  pages?: number;
  language?: string;
  edition?: string;
  bookFormat?: string;
  characters?: string[];
  awards?: string[];
}

export interface Book extends BaseEntity {
  title: string;
  author: string;
  description: string; // Changed from summary
  slug: string; // New required field
  publisher?: string; // Keep for backward compatibility
  price: number;
  rating: number;
  category: Category | string | null;
  genre: string;
  embedding?: number[]; // Changed from summaryvector to embedding array
  quantity: number;
  sold: number;
  isDisable: boolean;
  image?: string[]; // Changed from imageUrl to image array
  attributes?: BookAttributes; // New attributes object
}

export interface CreateBookRequest {
  title: string;
  author: string;
  description: string; // Changed from summary
  slug?: string; // Auto-generated if not provided
  publisher?: string; // Keep for backward compatibility
  price: number;
  rating: number;
  category: string;
  genre?: string;
  embedding?: number[]; // Changed from summaryvector
  quantity: number;
  sold?: number;
  image?: string[]; // Changed from imageUrl
  attributes?: BookAttributes; // New attributes object
}

export interface UpdateBookRequest {
  id: string;
  title?: string;
  author?: string;
  description?: string; // Changed from summary
  slug?: string;
  publisher?: string;
  price?: number;
  rating?: number;
  category?: string;
  genre?: string;
  embedding?: number[]; // Changed from summaryvector
  quantity?: number;
  sold?: number;
  image?: string[]; // Changed from imageUrl
  isDisable?: boolean;
  attributes?: BookAttributes; // New attributes object
}

// Comment types
export interface Comment extends BaseEntity {
  user_id: User | string;
  book_id: Book | string;
  rating: number;
  content: string;
}

export interface CreateCommentRequest {
  book_id: string;
  rating: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  timestamp: string;
  success: boolean;
  message: string;
  meta: {
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  }
}

// Table and UI types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalCategories: number;
  totalComments: number;
  totalOrders: number;
  activeUsers: number;
  activeBooks: number;
  revenue: number;
  recentActivity: any[];
}

// Order types
export interface OrderItem {
  book_id: string;
  book?: {
    id: string;
    title: string;
    author: string;
    image?: string;
    slug: string;
  };
  quantity: number;
  price: number;
}

export interface Order extends BaseEntity {
  id: string;
  user_id?: {
    id: string;
    username: string;
    fullname: string;
    email: string;
  };
  items: OrderItem[];
  total_price: number;
  shipping_fee: number;
  shipping_address: string;
  shipping_phone_number: string;
  payment_type: 'cash' | 'card' | 'online';
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
}

export interface OrderListParams extends PaginationParams {
  status?: string;
  user_id?: string;
  search?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
}
