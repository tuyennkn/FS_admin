'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Search, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { Category, PendingCategory, PendingCategoryListResponse } from '@/types';

// interface PendingCategory {
//   _id: string;
//   ai_recommended_name: string;
//   ai_recommended_description: string;
//   book_id: string;
//   book_data: {
//     title: string;
//     author: string;
//     genre: string;
//     image: string[];
//   };
//   status: 'pending' | 'approved' | 'rejected';
//   reviewed_by?: {
//     username: string;
//     email: string;
//   };
//   review_notes?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Category {
//   _id: string;
//   name: string;
//   description: string;
// }

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function PendingCategoriesPage() {
  const [pendingCategories, setPendingCategories] = useState<PendingCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [selectedPending, setSelectedPending] = useState<PendingCategory | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'assign' | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Alerts
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Show alert with auto dismiss
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: null, message: '' }), 5000);
  };

  useEffect(() => {
    fetchPendingCategories();
    fetchCategories();
    fetchStats();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchPendingCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<PendingCategoryListResponse>(API_ENDPOINTS.CATEGORY.PENDING.ALL(currentPage, 10, statusFilter, searchQuery));
      
      if (response.data.success) {
        setPendingCategories(response.data.data.results);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching pending categories:', error);
      showAlert('error', 'Failed to fetch pending categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response: any = await apiService.categories.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response: any = await apiService.pendingCategories.getStats();
      console.log(response);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReview = (pending: PendingCategory, actionType: 'approve' | 'reject' | 'assign') => {
    setSelectedPending(pending);
    setAction(actionType);
    setReviewDialog(true);
    
    // Pre-fill form based on action
    if (actionType === 'approve') {
      setCategoryName(pending.ai_recommended_name);
      setCategoryDescription(pending.ai_recommended_description || '');
    } else {
      setCategoryName('');
      setCategoryDescription('');
    }
    setReviewNotes('');
    setSelectedCategoryId('');
  };

  const handleSubmitReview = async () => {
    if (!selectedPending || !action) return;

    setProcessing(true);
    try {
      let response: any;
      
      switch (action) {
        case 'approve':
          if (!categoryName.trim()) {
            showAlert('error', 'Category name is required');
            return;
          }
          response = await apiService.pendingCategories.approve(selectedPending.id, {
            category_name: categoryName,
            category_description: categoryDescription,
            review_notes: reviewNotes
          });
          break;
          
        case 'reject':
          if (!reviewNotes.trim()) {
            showAlert('error', 'Review notes are required for rejection');
            return;
          }
          console.log('SelectedCategory', selectedPending);
          response = await apiService.pendingCategories.reject(selectedPending.id, {
            review_notes: reviewNotes
          });
          break;
          
        case 'assign':
          if (!selectedCategoryId) {
            showAlert('error', 'Please select a category');
            return;
          }
          response = await apiService.pendingCategories.assignToExisting(selectedPending.id, {
            category_id: selectedCategoryId,
            review_notes: reviewNotes
          });
          break;
      }

      if (response?.success) {
        showAlert('success', `Pending category ${action}d successfully`);
        setReviewDialog(false);
        fetchPendingCategories();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error processing review:', error);
      showAlert('error', error.response?.data?.message || 'Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setStatusFilter('pending');
    setSearchQuery('');
  };

  return (
    <div className="w-full mx-auto p-6">
      {/* Alert */}
      {alert.type && (
        <div className={`mb-4 p-4 rounded-lg ${
          alert.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {alert.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Categories</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage AI-suggested categories for imported books
          </p>
        </div>
        <Button onClick={fetchPendingCategories} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by category name, book title, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Categories List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCategories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No pending categories found</p>
              </CardContent>
            </Card>
          ) : (
            pendingCategories.map((pending) => (
              <Card key={pending.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Book Image */}
                    <div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0">
                      {pending.book_data.image?.[0] ? (
                        <img
                          src={pending.book_data.image[0]}
                          alt={pending.book_data.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{pending.book_data.title}</h3>
                          <p className="text-muted-foreground">by {pending.book_data.author}</p>
                          <p className="text-sm text-muted-foreground">
                            Genre: <span className="font-medium">{pending.book_data.genre}</span>
                          </p>
                        </div>
                        {getStatusBadge(pending.status)}
                      </div>

                      <div className="border-t pt-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">AI SUGGESTED CATEGORY</Label>
                            <p className="font-medium">{pending.ai_recommended_name}</p>
                            {pending.ai_recommended_description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {pending.ai_recommended_description}
                              </p>
                            )}
                          </div>
                          
                          {pending.status !== 'pending' && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">REVIEW NOTES</Label>
                              <p className="text-sm">{pending.review_notes || 'No notes provided'}</p>
                              {/* {pending.reviewed_by && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reviewed by: {pending.reviewed_by.username} ({pending.reviewed_by.email})
                                </p>
                              )} */}
                            </div>
                          )}
                        </div>
                      </div>

                      {pending.status === 'pending' && (
                        <div className="flex gap-2 pt-3">
                          <Button
                            size="sm"
                            onClick={() => handleReview(pending, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(pending, 'assign')}
                          >
                            Assign to Existing
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(pending, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={!pagination.has_prev}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            disabled={!pagination.has_next}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' && 'Approve Category'}
              {action === 'reject' && 'Reject Category'}
              {action === 'assign' && 'Assign to Existing Category'}
            </DialogTitle>
            <DialogDescription>
              {selectedPending && (
                <>
                  Book: <strong>{selectedPending.book_data.title}</strong> by {selectedPending.book_data.author}
                  <br />
                  Genre: <strong>{selectedPending.book_data.genre}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {action === 'approve' && (
              <>
                <div>
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Category Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
              </>
            )}

            {action === 'assign' && (
              <div>
                <Label htmlFor="existingCategory">Select Existing Category *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="reviewNotes">
                Review Notes {action === 'reject' ? '*' : '(Optional)'}
              </Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter review notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={processing}>
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}