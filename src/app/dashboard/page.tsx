
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FolderOpen, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchUsers } from '@/features/user/userManagementSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import { fetchBooks } from '@/features/book/bookSlice';
import { fetchComments } from '@/features/comment/commentSlice';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {change}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Book "React Guide" was updated</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">New comment on "JavaScript Basics"</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Category "Programming" was created</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.userManagement);
  const { categories } = useAppSelector((state) => state.categories);
  const { books } = useAppSelector((state) => state.books);
  const { comments } = useAppSelector((state) => state.comments);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCategories());
    dispatch(fetchBooks());
    dispatch(fetchComments());
  }, [dispatch]);

  // Calculate stats
  const activeUsers = users.filter(user => !user.isDisable).length;
  const activeBooks = books.filter(book => !book.isDisable).length;
  const totalRevenue = books.reduce((sum, book) => sum + (book.price * book.sold), 0);

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Books',
      value: activeBooks,
      change: '+5%',
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Categories',
      value: categories.length,
      change: '+2%',
      icon: FolderOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Comments',
      value: comments.length,
      change: '+23%',
      icon: MessageSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+18%',
      icon: DollarSign,
      color: 'bg-red-500',
    },
    {
      title: 'Active Users',
      value: activeUsers,
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your bookstore.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Users Status</span>
                  <span className="text-sm text-gray-500">
                    {activeUsers} active / {users.length} total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${users.length > 0 ? (activeUsers / users.length) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Books Status</span>
                  <span className="text-sm text-gray-500">
                    {activeBooks} active / {books.length} total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${books.length > 0 ? (activeBooks / books.length) * 100 : 0}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Categories</span>
                  <span className="text-sm text-gray-500">{categories.length} total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Recent activity */}
        <RecentActivity />
      </div>
    </div>
  );
}