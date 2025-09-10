# Backend Image Upload Setup Guide

This guide explains how to set up Cloudinary for backend image uploads in the book management system.

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Complete the registration process

## 2. Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Go to **Dashboard** → **API Keys**
3. Copy the following credentials:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

## 3. Configure Backend Environment Variables

1. Open `FS_API/.env`
2. Add your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Backend Configuration

The backend is already configured with:

### ✅ **Multer + Cloudinary Integration**
- Automatic file upload to Cloudinary
- Image optimization (400x600, auto quality)
- File validation (size, type)
- Unique filename generation

### ✅ **Security Features**
- Admin-only upload routes
- File type validation (images only)
- File size limit (5MB)
- JWT authentication required

### ✅ **API Endpoints**
- `POST /router/upload/image` - Upload image
- `DELETE /router/upload/image` - Delete image

## 5. Frontend Features

### ✅ **Drag & Drop Upload**
- Users can drag images directly into the upload area
- Or click to open file browser

### ✅ **File Validation**
- Maximum file size: 5MB
- Supported formats: JPEG, JPG, PNG, WEBP, GIF
- Real-time validation with error messages

### ✅ **Image Preview**
- Immediate preview of uploaded images
- Remove option with X button
- Proper aspect ratio for book covers

### ✅ **Loading States**
- Upload progress indication
- Disabled state during upload
- Error handling with user feedback

## 6. Security Advantages

### Backend Upload Benefits:
- **Secure API Keys** - Credentials never exposed to frontend
- **Server-side Validation** - Additional security layer
- **Rate Limiting** - Can implement upload limits per user
- **File Scanning** - Can add virus/malware scanning
- **Audit Trail** - Log all upload activities

## 7. Testing

1. Install backend dependencies: `cd FS_API && npm install`
2. Start backend server: `npm run dev`
3. Start frontend: `cd FS_admin && npm run dev`
4. Go to Books Management page
5. Click "Add Book" or edit an existing book
6. Test the image upload area:
   - Drag an image file into the upload area
   - Or click the upload area to select a file
   - Verify the image uploads and URL is saved

## 8. API Response Format

### Upload Success Response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/books/book-1234567890-filename.jpg",
    "publicId": "books/book-1234567890-filename",
    "originalName": "book-cover.jpg",
    "size": 1048576,
    "mimetype": "image/jpeg"
  }
}
```

## 9. Troubleshooting

### Common Issues:

**"Image upload failed" error:**
- Check your Cloudinary credentials in backend `.env`
- Verify backend server is running
- Check backend console for detailed error messages

**"Unauthorized" error:**
- Make sure you're logged in as admin
- Check JWT token is valid

**"File too large" error:**
- Reduce image file size to under 5MB
- Consider compressing images before upload

### Production Considerations:

1. **Environment Variables**: Use proper production credentials
2. **Rate Limiting**: Implement upload rate limits
3. **Image Moderation**: Enable Cloudinary's auto-moderation
4. **Backup**: Regularly backup your media library
5. **CDN**: Cloudinary provides global CDN automatically

## 10. Cost Management

Free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations/month

Monitor usage in Cloudinary dashboard and upgrade plan as needed.

## 11. Advanced Features

You can enhance the system with:
- Multiple image upload for book galleries
- Image cropping/editing tools
- Automatic thumbnail generation
- Advanced image transformations
- Image compression options