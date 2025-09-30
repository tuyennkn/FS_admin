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
import { Search, Plus, Edit, Eye, EyeOff, BookOpen, Image as ImageIcon, Loader2, Upload, Wand2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadService } from '@/services/cloudinaryService';
import { Pagination } from '@/components/ui/pagination';
import { googleBooksService } from '@/services/googleBooksService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  fetchBooks, 
  createBook, 
  updateBook,
  toggleBookDisable, 
  fetchPaginatedBooks
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
    category: '',
    author: '',
    description: '', // Changed from summary
    publisher: '',
    genre: '', // Add genre field
    price: 0,
    rating: 0,
    quantity: 0,
    image: [] as string[], // Changed from imageUrl to image array
    isbn: '', // Add ISBN field
    // Add attributes fields
    firstPublishDate: '',
    publishDate: '',
    pages: 0,
    language: '',
    edition: '',
    bookFormat: '',
    characters: [] as string[],
    awards: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState('');
  const [isbnSuccess, setIsbnSuccess] = useState('');

  useEffect(() => {
    if (book) {
      // Handle category properly - check for populated category vs string ID vs null
      let categoryId = '';
      if (book.category === null) {
        categoryId = '';
      } else if (typeof book.category === 'string') {
        categoryId = book.category;
      } else if (book.category && typeof book.category === 'object') {
        categoryId = book.category.id || '';
      }
      
      setFormData({
        title: book.title,
        category: categoryId,
        author: book.author,
        description: book.description || '', // Handle both old and new field names
        publisher: book.publisher || book.attributes?.publisher || '',
        genre: book.genre || '', // Add genre field
        price: book.price,
        rating: book.rating,
        quantity: book.quantity,
        image: book.image || [], // Use new image array field
        isbn: book.attributes?.isbn || '', // Extract ISBN from attributes
        // Add attributes fields
        firstPublishDate: book.attributes?.firstPublishDate ? new Date(book.attributes.firstPublishDate).toISOString().split('T')[0] : '',
        publishDate: book.attributes?.publishDate ? new Date(book.attributes.publishDate).toISOString().split('T')[0] : '',
        pages: book.attributes?.pages || 0,
        language: book.attributes?.language || '',
        edition: book.attributes?.edition || '',
        bookFormat: book.attributes?.bookFormat || '',
        characters: book.attributes?.characters || [],
        awards: book.attributes?.awards || [],
      });
    } else {
      setFormData({
        title: '',
        category: '',
        author: '',
        description: '',
        publisher: '',
        genre: '', // Add genre field
        price: 0,
        rating: 0,
        quantity: 0,
        image: [], // Initialize as empty array
        isbn: '', // Initialize ISBN field
        // Add attributes fields
        firstPublishDate: '',
        publishDate: '',
        pages: 0,
        language: '',
        edition: '',
        bookFormat: '',
        characters: [],
        awards: [],
      });
    }
  }, [book]);

  // Auto-fill function when ISBN is entered
  const handleISBNAutoFill = async () => {
    if (!formData.isbn.trim()) {
      setIsbnError('Please enter an ISBN');
      return;
    }

    setIsbnLoading(true);
    setIsbnError('');
    setIsbnSuccess('');

    try {
      const bookInfo = await googleBooksService.searchByISBN(formData.isbn);
      
      if (bookInfo) {
        // Auto-fill form fields with data from Google Books
        setFormData(prev => ({
          ...prev,
          title: bookInfo.title || prev.title,
          author: googleBooksService.formatAuthors(bookInfo.authors) || prev.author,
          description: bookInfo.description || prev.description,
          publisher: bookInfo.publisher || prev.publisher,
          genre: bookInfo.categories && bookInfo.categories.length > 0 ? bookInfo.categories[0] : prev.genre, // Auto-fill genre
          image: bookInfo.imageLinks ? 
            [googleBooksService.getBestCoverImage(bookInfo.imageLinks)] : prev.image,
          // Auto-fill additional attributes from Google Books
          publishDate: bookInfo.publishedDate || prev.publishDate,
          pages: bookInfo.pageCount || prev.pages,
          language: bookInfo.language || prev.language,
        }));

        // Try to match category from Google Books categories
        if (bookInfo.categories && bookInfo.categories.length > 0) {
          const bookCategory = bookInfo.categories[0];
          const matchedCategory = categories.find(cat => 
            cat.name.toLowerCase().includes(bookCategory.toLowerCase()) ||
            bookCategory.toLowerCase().includes(cat.name.toLowerCase())
          );
          
          if (matchedCategory) {
            setFormData(prev => ({ ...prev, category: matchedCategory.id }));
          }
        }

        setIsbnSuccess('Book information loaded from Google Books!');
      } else {
        setIsbnError('Book not found. Please fill the information manually.');
      }
    } catch (error) {
      console.error('Error fetching book info:', error);
      setIsbnError('Failed to fetch book information. Please try again.');
    } finally {
      setIsbnLoading(false);
    }
  };

  // Clear messages when ISBN changes
  useEffect(() => {
    setIsbnError('');
    setIsbnSuccess('');
  }, [formData.isbn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create the final form data
      const submitData = {
        title: formData.title,
        author: formData.author,
        description: formData.description, // Use description field
        publisher: formData.publisher,
        genre: formData.genre, // Add genre to submit data
        price: formData.price,
        rating: formData.rating,
        quantity: formData.quantity,
        category: formData.category,
        image: formData.image, // Use image array
        attributes: {
          isbn: formData.isbn,
          publisher: formData.publisher, // Also store in attributes for new schema
          firstPublishDate: formData.firstPublishDate || undefined,
          publishDate: formData.publishDate || undefined,
          pages: formData.pages || undefined,
          language: formData.language || undefined,
          edition: formData.edition || undefined,
          bookFormat: formData.bookFormat || undefined,
          characters: formData.characters.length > 0 ? formData.characters : undefined,
          awards: formData.awards.length > 0 ? formData.awards : undefined,
        }
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
          {/* ISBN Auto-fill Section */}
          {!book && (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <Wand2 className="h-5 w-5 text-blue-500" />
                <Label className="text-sm font-medium text-gray-700">
                  Auto-fill from ISBN (Optional)
                </Label>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    value={formData.isbn}
                    onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                    placeholder="Enter ISBN (e.g. 9780123456789)"
                    className="w-full"
                  />
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleISBNAutoFill}
                  disabled={isbnLoading || !formData.isbn.trim()}
                  className="flex items-center space-x-2"
                >
                  {isbnLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  <span>{isbnLoading ? 'Loading...' : 'Auto-fill'}</span>
                </Button>
              </div>
              
              {/* Success/Error Messages */}
              {isbnSuccess && (
                <Alert className="mt-2 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {isbnSuccess}
                  </AlertDescription>
                </Alert>
              )}
              {isbnError && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {isbnError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                placeholder="Enter book genre"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                placeholder="Enter ISBN (optional)"
              />
            </div>
            <div>
              {/* Empty div for grid layout */}
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
            {/* <div>
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
            </div> */}
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
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter book description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">Book Cover Images</Label>
            {/* Simplified image input - you may want to implement a proper image upload component */}
            <Input
              id="image"
              value={formData.image[0] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value ? [e.target.value] : [] }))}
              placeholder="Enter image URL"
              className="mt-2"
            />
          </div>

          {/* Additional Book Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Book Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstPublishDate">First Publish Date</Label>
                <Input
                  id="firstPublishDate"
                  type="date"
                  value={formData.firstPublishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstPublishDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="publishDate">Current Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pages">Number of Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  value={formData.pages || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter page count"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="e.g. English, Vietnamese"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  value={formData.edition}
                  onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value }))}
                  placeholder="e.g. 1st Edition, Revised Edition"
                />
              </div>
              <div>
                <Label htmlFor="bookFormat">Book Format</Label>
                <select
                  id="bookFormat"
                  value={formData.bookFormat}
                  onChange={(e) => setFormData(prev => ({ ...prev, bookFormat: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select format</option>
                  <option value="hardcover">Hardcover</option>
                  <option value="paperback">Paperback</option>
                  <option value="ebook">E-book</option>
                  <option value="audiobook">Audiobook</option>
                  <option value="kindle">Kindle</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="characters">Main Characters (comma-separated)</Label>
              <Input
                id="characters"
                value={formData.characters.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  characters: e.target.value.split(',').map(char => char.trim()).filter(char => char.length > 0)
                }))}
                placeholder="e.g. Harry Potter, Hermione Granger, Ron Weasley"
              />
            </div>

            <div>
              <Label htmlFor="awards">Awards (comma-separated)</Label>
              <Input
                id="awards"
                value={formData.awards.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  awards: e.target.value.split(',').map(award => award.trim()).filter(award => award.length > 0)
                }))}
                placeholder="e.g. Hugo Award, Nebula Award, Pulitzer Prize"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const limit = 10; // Number of books per page
  const { books, loading, error, pagination } = useAppSelector((state) => state.books);
  const { categories } = useAppSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPaginatedBooks({ page, limit }));
  }, [dispatch, page, limit]);

  useEffect(() => {
    // When search or category filter changes, reset to page 1
    if (searchTerm || categoryFilter !== 'all') {
      setPage(1);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    // For now, we'll keep client-side filtering for the current page
    // TODO: Implement server-side filtering for better performance
    let filtered = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase()) // Changed from summary
    );

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter((book) => {
        if (!book.category) {
          return categoryFilter === 'no-category';
        }
        const categoryId = typeof book.category === 'string' ? book.category : book.category.id;
        return categoryId === categoryFilter;
      });
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, categoryFilter]);

  const handleCreateBook = (data: CreateBookRequest) => {
    console.log('handleCreateBook called with:', data); // Debug log
    dispatch(createBook(data)).then(() => {
      // Refresh current page after creating
      dispatch(fetchPaginatedBooks({ page, limit }));
    });
  };

  const handleUpdateBook = (data: CreateBookRequest) => {
    console.log('handleUpdateBook called with:', data); // Debug log
    if (editingBook) {
      dispatch(updateBook({ id: editingBook.id, ...data })).then(() => {
        // Refresh current page after updating
        dispatch(fetchPaginatedBooks({ page, limit }));
      });
      setEditingBook(null);
    }
  };

  const handleToggleStatus = (bookId: string, currentStatus: boolean) => {
    dispatch(toggleBookDisable({ id: bookId, isDisable: !currentStatus })).then(() => {
      // Refresh current page after toggling status
      dispatch(fetchPaginatedBooks({ page, limit }));
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/books/import')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Books
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Books ({pagination.totalItems} total)
                {(searchTerm || categoryFilter !== 'all') && (
                  <span className="ml-2 text-sm text-blue-600">
                    ({filteredBooks.length} filtered)
                  </span>
                )}
              </div>
              {!loading && pagination.totalPages > 1 && (
                <div className="text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              )}
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
                  {(searchTerm || categoryFilter !== 'all' ? filteredBooks : books).map((book, index) => {
                    // Ensure unique key by combining id with index as fallback
                    const uniqueKey = book.id ? `book-${book.id}` : `book-index-${index}`;
                    return (
                      <TableRow key={uniqueKey}>
                        <TableCell className="w-16">
                          {book.image?.[0] ? (
                            <img 
                              src={book.image[0]} 
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded border shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          {!book.image?.[0] && (
                            <div className="w-12 h-16 bg-gray-100 rounded border flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          {book.image?.[0] && (
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
                        {book.category ? (
                          getCategoryName(book.category)
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

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-0">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </CardContent>
          </Card>
        )}

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
