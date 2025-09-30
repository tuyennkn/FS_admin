'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { retrieveUser } from '@/features/user/userSlice';
import { setUser } from '@/features/auth/authSlice';

export default function Home() {

  const router = useRouter();

  router.push('/dashboard');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}
