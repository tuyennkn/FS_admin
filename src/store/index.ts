import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import userManagementReducer from '../features/user/userManagementSlice';
import categoryReducer from '../features/category/categorySlice';
import bookReducer from '../features/book/bookSlice';
import commentReducer from '../features/comment/commentSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    userManagement: userManagementReducer,
    categories: categoryReducer,
    books: bookReducer,
    comments: commentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
