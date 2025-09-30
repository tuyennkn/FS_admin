import * as yup from 'yup';

// Auth validation schemas
export const loginSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  fullname: yup.string().required('Full name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  phone: yup.string().matches(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender'),
  birthday: yup.date(),
  address: yup.string(),
});

// Category validation schemas
export const categorySchema = yup.object({
  name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
});

// Book validation schemas
export const bookSchema = yup.object({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  author: yup.string().required('Author is required').min(2, 'Author must be at least 2 characters'),
  summary: yup.string().required('Summary is required').min(10, 'Summary must be at least 10 characters'),
  publisher: yup.string().required('Publisher is required'),
  price: yup.number().required('Price is required').min(0, 'Price must be positive'),
  rating: yup.number().required('Rating is required').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  category: yup.string().required('Category is required'),
  quantity: yup.number().required('Quantity is required').min(0, 'Quantity must be positive'),
  sold: yup.number().min(0, 'Sold must be positive'),
});

// Comment validation schemas
export const commentSchema = yup.object({
  book_id: yup.string().required('Book is required'),
  rating: yup.number().required('Rating is required').min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  content: yup.string().required('Content is required').min(5, 'Content must be at least 5 characters'),
});

// User update validation schema
export const userUpdateSchema = yup.object({
  fullname: yup.string().required('Full name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  phone: yup.string().matches(/^[0-9]{10,11}$/, 'Phone number must be 10-11 digits'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Invalid gender'),
  birthday: yup.date(),
  address: yup.string(),
  role: yup.string().oneOf(['admin', 'user'], 'Invalid role'),
});
