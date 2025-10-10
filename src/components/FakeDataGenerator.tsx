/**
 * Fake Data Generator Component
 * Admin panel component for generating test data
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Users, 
  ShoppingCart, 
  Trash2, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fakeDataService } from '@/services/fakeDataService';

interface FakeDataStats {
  users: {
    total: number;
    active: number;
  };
  orders: {
    byStatus: Array<{ _id: string; count: number }>;
    byPaymentType: Array<{ _id: string; count: number }>;
    totalRevenue: number;
    averageValue: number;
  };
}

interface FakeDataGeneratorProps {
  onDataGenerated?: () => void;
}

export function FakeDataGenerator({ onDataGenerated }: FakeDataGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<FakeDataStats | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const handleGenerateFakeData = async () => {
    setIsGenerating(true);
    setMessage({ type: null, text: '' });
    try {
      const response = await fakeDataService.generateFakeData();
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Generated ${response.data.usersGenerated} users and ${response.data.ordersGenerated} orders successfully!` 
        });
        
        // Update stats
        setStats(response.data.statistics);
        
        // Notify parent component
        onDataGenerated?.();
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to generate fake data: ${response.message}` 
        });
      }
    } catch (error: any) {
      console.error('Generate fake data error:', error);
      setMessage({ 
        type: 'error', 
        text: `Error generating fake data: ${error.message || 'An unexpected error occurred'}` 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCleanupFakeData = async () => {
    if (!window.confirm('Are you sure you want to cleanup fake data? This will delete test users and all orders.')) {
      return;
    }

    setIsCleaningUp(true);
    setMessage({ type: null, text: '' });
    try {
      const response = await fakeDataService.cleanupFakeData();
      
      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: `Deleted ${response.data.usersDeleted} users and ${response.data.ordersDeleted} orders successfully!` 
        });
        
        // Clear stats
        setStats(null);
        
        // Notify parent component
        onDataGenerated?.();
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to cleanup fake data: ${response.message}` 
        });
      }
    } catch (error: any) {
      console.error('Cleanup fake data error:', error);
      setMessage({ 
        type: 'error', 
        text: `Error cleaning up fake data: ${error.message || 'An unexpected error occurred'}` 
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleLoadStats = async () => {
    setIsLoadingStats(true);
    setMessage({ type: null, text: '' });
    try {
      const response = await fakeDataService.getFakeDataStats();
      
      if (response.success) {
        setStats(response.data);
        setMessage({ type: 'success', text: 'Statistics loaded successfully!' });
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to load statistics: ${response.message}` 
        });
      }
    } catch (error: any) {
      console.error('Load stats error:', error);
      setMessage({ 
        type: 'error', 
        text: `Error loading statistics: ${error.message || 'An unexpected error occurred'}` 
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Fake Data Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate test data for statistics and testing purposes. All fake users have password: <Badge>123456</Badge>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        {message.type && (
          <Alert variant={message.type === 'error' ? 'destructive' : undefined}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleGenerateFakeData}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Data'}
          </Button>

          <Button 
            variant="outline"
            onClick={handleLoadStats}
            disabled={isLoadingStats}
            className="flex items-center gap-2"
          >
            {isLoadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isLoadingStats ? 'Loading...' : 'Load Stats'}
          </Button>

          <Button 
            variant="destructive"
            onClick={handleCleanupFakeData}
            disabled={isCleaningUp}
            className="flex items-center gap-2"
          >
            {isCleaningUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Data'}
          </Button>
        </div>

        {/* Generation Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm">50 fake users will be generated</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-green-500" />
            <span className="text-sm">150 fake orders will be generated</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-sm">Vietnamese addresses & phone numbers</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Realistic order status distribution</span>
          </div>
        </div>

        {/* Statistics Display */}
        {stats && (
          <div className="space-y-4">
            <h4 className="font-medium">Current Database Statistics</h4>
            
            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.users.total}</div>
                <div className="text-sm text-blue-600">Total Users</div>
                <div className="text-xs text-blue-500">{stats.users.active} active</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {stats.orders.totalRevenue.toLocaleString('vi-VN')}
                </div>
                <div className="text-sm text-green-600">Total Revenue (VND)</div>
                <div className="text-xs text-green-500">
                  Avg: {stats.orders.averageValue.toLocaleString('vi-VN')} VND
                </div>
              </div>
            </div>

            {/* Order Status Distribution */}
            {stats.orders.byStatus.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Orders by Status</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {stats.orders.byStatus.map((status) => (
                    <div key={status._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{status._id}</span>
                      <Badge>{status.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Type Distribution */}
            {stats.orders.byPaymentType.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Orders by Payment Type</h5>
                <div className="flex gap-2 flex-wrap">
                  {stats.orders.byPaymentType.map((payment) => (
                    <Badge key={payment._id}>
                      {payment._id}: {payment.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}