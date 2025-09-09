import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email().required('Email is required'),
  password: yup.string().min(6).required('Password is required'),
});
