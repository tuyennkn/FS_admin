'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MessageSquare, Star, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { 
  fetchComments, 
  deleteComment 
} from '@/features/comment/commentSlice';
import { fetchBooks } from '@/features/book/bookSlice';
import { fetchUsers } from '@/features/user/userManagementSlice';
import { Comment, Book, User } from '@/types';

export default function CommentsPage() {
  const dispatch = useAppDispatch();
  const { comments, loading, error } = useAppSelector((state) => state.comments);
  const { books } = useAppSelector((state) => state.books);
  const { users } = useAppSelector((state) => state.userManagement);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

  useEffect(() => {
    dispatch(fetchComments());
    dispatch(fetchBooks());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    let filtered = comments.filter((comment) =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (ratingFilter && ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((comment) => comment.rating === rating);
    }

    setFilteredComments(filtered);
  }, [comments, searchTerm, ratingFilter]);

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(commentId));
    }
  };

  const getUserName = (userId: string | User) => {
    if (typeof userId === 'object') {
      return userId.fullname;
    }
    const user = users.find(u => u.id === userId);
    return user ? user.fullname : 'Unknown User';
  };

  const getBookTitle = (bookId: string | Book) => {
    if (typeof bookId === 'object') {
      return bookId.title;
    }
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'Unknown Book';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'default';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Comments Management</h1>
            <p className="text-gray-600">Manage user comments and reviews</p>
          </div>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search comments by content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Comments table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({filteredComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium">
                        {getUserName(comment.user_id)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {getBookTitle(comment.book_id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {renderStars(comment.rating)}
                          <Badge variant={getRatingBadgeVariant(comment.rating)}>
                            {comment.rating}/5
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="truncate" title={comment.content}>
                          {comment.content}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(comment.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredComments.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No comments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Comment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comments.length > 0 
                  ? (comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length).toFixed(1)
                  : '0'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comments.filter(comment => comment.rating === 5).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Ratings (≤2)</CardTitle>
              <Star className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comments.filter(comment => comment.rating <= 2).length}
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
