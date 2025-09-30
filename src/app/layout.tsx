'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthProvider from '@/components/auth/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
