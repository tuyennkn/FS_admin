'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Edit, Eye, EyeOff, BookOpen, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadService } from '@/services/cloudinaryService';
import { 
  fetchBooks, 
  createBook, 
  updateBook,
  toggleBookDisable 
} from '@/features/book/bookSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import { Book, CreateBookRequest, Category } from '@/types';

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
  categories: Category[];
  onSubmit: (data: CreateBookRequest) => void;
}

function BookDialog({ open, onOpenChange, book, categories, onSubmit }: BookDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    author: '',
    summary: '',
    publisher: '',
    price: 0,
    rating: 0,
    quantity: 0,
    imageUrl: '' as string | File,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (book) {
      // Handle category_id properly - check for populated category vs string ID vs null
      let categoryId = '';
      if (book.category_id === null) {
        categoryId = '';
      } else if (typeof book.category_id === 'string') {
        categoryId = book.category_id;
      } else if (book.category_id && typeof book.category_id === 'object') {
        categoryId = book.category_id.id || '';
      }
      
      setFormData({
        title: book.title,
        category_id: categoryId,
        author: book.author,
        summary: book.summary,
        publisher: book.publisher,
        price: book.price,
        rating: book.rating,
        quantity: book.quantity,
        imageUrl: book.imageUrl || '',
      });
    } else {
      setFormData({
        title: '',
        category_id: '',
        author: '',
        summary: '',
        publisher: '',
        price: 0,
        rating: 0,
        quantity: 0,
        imageUrl: '',
      });
    }
  }, [book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = '';

      console.log('Form imageUrl type:', typeof formData.imageUrl); // Debug log
      console.log('Form imageUrl value:', formData.imageUrl); // Debug log

      // If imageUrl is a File object, upload it first
      if (formData.imageUrl instanceof File) {
        console.log('Uploading file to backend...'); // Debug log
        const uploadResponse = await ImageUploadService.uploadImage(formData.imageUrl);
        console.log('Upload response:', uploadResponse); // Debug log
        finalImageUrl = uploadResponse.url; // Now this should work correctly
      } else if (typeof formData.imageUrl === 'string') {
        console.log('Using existing string URL'); // Debug log
        finalImageUrl = formData.imageUrl;
      }

      console.log('Final image URL:', finalImageUrl); // Debug log

      // Create the final form data with the uploaded image URL
      const submitData = {
        title: formData.title,
        author: formData.author,
        summary: formData.summary,
        publisher: formData.publisher,
        price: formData.price,
        rating: formData.rating,
        quantity: formData.quantity,
        category_id: formData.category_id,
        imageUrl: finalImageUrl || undefined
      } as CreateBookRequest;

      console.log('Submitting book data:', submitData); // Debug log
      onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      // Handle error - you might want to show an error message to the user
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {book ? 'Edit Book' : 'Create New Book'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter book title"
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Enter author name"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => !cat.isDisable).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData(prev => ({ ...prev, publisher: e.target.value }))}
                placeholder="Enter publisher name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter rating"
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary</Label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Enter book summary"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Book Cover Image</Label>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(fileOrUrl) => setFormData(prev => ({ ...prev, imageUrl: fileOrUrl }))}
              className="mt-2"
              disabled={uploading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {formData.imageUrl instanceof File ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                book ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BooksPage() {
  const dispatch = useAppDispatch();
  const { books, loading, error } = useAppSelector((state) => state.books);
  const { categories } = useAppSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    let filtered = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((book) => {
        if (!book.category_id) {
          return categoryFilter === 'no-category';
        }
        const categoryId = typeof book.category_id === 'string' ? book.category_id : book.category_id.id;
        return categoryId === categoryFilter;
      });
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, categoryFilter]);

  const handleCreateBook = (data: CreateBookRequest) => {
    console.log('handleCreateBook called with:', data); // Debug log
    dispatch(createBook(data));
  };

  const handleUpdateBook = (data: CreateBookRequest) => {
    console.log('handleUpdateBook called with:', data); // Debug log
    if (editingBook) {
      dispatch(updateBook({ id: editingBook.id, ...data }));
      setEditingBook(null);
    }
  };

  const handleToggleStatus = (bookId: string, currentStatus: boolean) => {
    dispatch(toggleBookDisable({ id: bookId, isDisable: !currentStatus }));
  };

  const openCreateDialog = () => {
    setEditingBook(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setIsDialogOpen(true);
  };

  const getCategoryName = (categoryId: string | Category | null) => {
    if (!categoryId) {
      return 'No Category';
    }
    if (typeof categoryId === 'object') {
      return categoryId.name;
    }
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Books Management</h1>
            <p className="text-gray-600">Manage book inventory and details</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books by title, author, or summary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="no-category">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Books table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Books ({filteredBooks.length})
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
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book, index) => {
                    // Ensure unique key by combining id with index as fallback
                    const uniqueKey = book.id ? `book-${book.id}` : `book-index-${index}`;
                    return (
                      <TableRow key={uniqueKey}>
                        <TableCell className="w-16">
                          {book.imageUrl ? (
                            <img 
                              src={book.imageUrl} 
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded border shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {!book.imageUrl && (
                            <div className="w-12 h-16 bg-gray-100 rounded border flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          {book.imageUrl && (
                            <div className="w-12 h-16 bg-gray-100 rounded border items-center justify-center hidden">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {book.title}
                        </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        {book.category_id ? (
                          getCategoryName(book.category_id)
                        ) : (
                          <Badge variant="destructive" className="text-gray-500">
                            No Category
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(book.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{book.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={book.quantity > 0 ? 'success' : 'destructive'}>
                          {book.quantity} in stock
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={book.isDisable ? 'destructive' : 'success'}>
                          {book.isDisable ? 'Disabled' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(book.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(book.id, book.isDisable)}
                          >
                            {book.isDisable ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Book Dialog */}
        <BookDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          book={editingBook}
          categories={categories}
          onSubmit={editingBook ? handleUpdateBook : handleCreateBook}
        />
    </div>
  );
}
