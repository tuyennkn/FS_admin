'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string | File;
  onChange: (file: File | string) => void;
  disabled?: boolean;
  className?: string;
  preview?: boolean;
}

export function ImageUpload({ value, onChange, disabled, className, preview = true }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }
    
    setUploadError(null);
    
    if (preview) {
      // Create local preview URL for immediate display
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file); // Pass the File object to parent
    } else {
      // Legacy mode: upload immediately (kept for backward compatibility)
      setUploading(true);
      try {
        // This would be for immediate upload - not used in current implementation
        onChange(file);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  }, [onChange, preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    disabled: disabled || uploading
  });

  const removeImage = () => {
    onChange('');
    setUploadError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Get display URL - either preview URL for File objects or direct URL for strings
  const getDisplayUrl = () => {
    if (previewUrl) return previewUrl;
    if (typeof value === 'string' && value) return value;
    return null;
  };

  const displayUrl = getDisplayUrl();

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={className}>
      {displayUrl ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={displayUrl}
              alt="Book cover preview"
              className="w-32 h-40 object-cover rounded-lg border border-gray-200"
            />
            <Button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              variant="destructive"
              size="sm"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {preview ? 'Image selected for upload' : 'Click the X to remove the image'}
          </p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${uploadError ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Uploading image...</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="h-8 w-8 text-blue-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
                
                <div className="text-sm text-gray-600">
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {uploadError && (
            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
          )}
        </div>
      )}
    </div>
  );
}