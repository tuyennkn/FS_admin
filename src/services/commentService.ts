import { apiService } from './apiService'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export interface Comment {
  _id: string
  book_id: {
    _id: string
    title: string
    author: string
  }
  user_id: {
    _id: string
    username: string
    fullname?: string
    avatar?: string
  }
  rating: number
  comment: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

const commentService = {
  // Admin: Lấy tất cả comments
  getAllComments: async (): Promise<Comment[]> => {
    const response = await apiService.get(API_ENDPOINTS.COMMENT.ALL)
    return response.data.data || []
  },

  // Admin: Toggle disable comment
  toggleDisableComment: async (id: string, isDisabled: boolean): Promise<Comment> => {
    const response = await apiService.put(`${API_ENDPOINTS.COMMENT.UPDATE}/${id}`, {
      isDisabled
    })
    return response.data.data
  },

  // Admin: Xóa comment
  deleteComment: async (id: string): Promise<void> => {
    await apiService.delete(`${API_ENDPOINTS.COMMENT.DELETE}/${id}`)
  },

  // Get comments by book
  getBookComments: async (bookId: string): Promise<Comment[]> => {
    const response = await apiService.get(`${API_ENDPOINTS.COMMENT.GET_BY_BOOK}/${bookId}`)
    return response.data.data || []
  }
}

export default commentService
