'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { retrieveUser } from '@/features/user/userSlice';
import { getAccessToken } from '@/utils/tokenUtils';

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.user);

    useEffect(() => {
        if (!user) {
            if(getAccessToken()) {
                const fetchUser = async () => {
                try {
                    const userData = await dispatch(retrieveUser()).unwrap();
                    console.log('Fetched user:', userData);
                    if (userData?.role !== 'admin') {
                        router.push('/login');
                    }
                } catch (error) {
                    router.push('/login');
                }
            }
            fetchUser();
            } else {
                if(pathname !== '/login') {
                    router.push('/login');
                }
            }
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
}
