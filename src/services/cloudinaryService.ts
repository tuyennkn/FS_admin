import { apiService } from './apiService';

export interface ImageUploadResponse {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export class ImageUploadService {
  static async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await apiService.post<ApiResponse<ImageUploadResponse>>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data; // Extract data from the API response wrapper
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await apiService.delete('/upload/image', {
        data: { publicId }
      });
    } catch (error) {
      console.error('Image delete error:', error);
      throw new Error('Failed to delete image');
    }
  }
}