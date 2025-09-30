'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { setUser } from '@/features/auth/authSlice';
import { getAccessToken, getUserInfo } from '@/utils/tokenUtils';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Khôi phục authentication state từ localStorage khi app khởi động
    const restoreAuth = async () => {
      try {
        const token = getAccessToken();
        const userInfo = getUserInfo();
        
        if (token && userInfo) {
          // Khôi phục user info vào Redux state
          dispatch(setUser(userInfo));
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        // Xóa invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); 
        localStorage.removeItem('userInfo');
      }
    };

    restoreAuth();
  }, [dispatch]);

  return <>{children}</>;
}