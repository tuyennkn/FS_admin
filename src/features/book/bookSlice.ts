import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookAPI } from '../../services/apiService';
import { Book, CreateBookRequest, UpdateBookRequest, PaginatedResponse } from '../../types';

export interface BookState {
  books: Book[];
  selectedBook: Book | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const initialState: BookState = {
  books: [],
  selectedBook: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  },
};

// Async thunks
export const fetchBooks = createAsyncThunk(
  'books/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookAPI.getAll();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
    }
  }
);

// fetch paginated books
export const fetchPaginatedBooks = createAsyncThunk(
  'books/fetchPaginated',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await bookAPI.getPaginated(page, limit);
      if (response.success) {
        return response as PaginatedResponse<Book>;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch paginated books');
    }
  }
);

export const createBook = createAsyncThunk(
  'books/create',
  async (bookData: CreateBookRequest, { rejectWithValue }) => {
    try {
      const response = await bookAPI.create(bookData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create book');
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/update',
  async (bookData: UpdateBookRequest, { rejectWithValue }) => {
    try {
      const response = await bookAPI.update(bookData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update book');
    }
  }
);

export const toggleBookDisable = createAsyncThunk(
  'books/toggleDisable',
  async ({ id, isDisable }: { id: string; isDisable: boolean }, { rejectWithValue }) => {
    try {
      const response = await bookAPI.toggleDisable(id, isDisable);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle book status');
    }
  }
);

export const updateBookSummary = createAsyncThunk(
  'books/updateSummary',
  async ({ id, summaryvector }: { id: string; summaryvector: string }, { rejectWithValue }) => {
    try {
      const response = await bookAPI.updateSummary(id, summaryvector);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update book summary');
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBook: (state, action: PayloadAction<Book | null>) => {
      state.selectedBook = action.payload;
    },
    setPagination: (state, action: PayloadAction<BookState['pagination']>) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
        state.error = null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch paginated books
      .addCase(fetchPaginatedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.data;
        console.log(action.payload);
        state.pagination = action.payload.meta.pagination;
        state.error = null;
      })
      .addCase(fetchPaginatedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create book
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
        state.error = null;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.books.findIndex(book => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle disable
      .addCase(toggleBookDisable.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      // Update summary
      .addCase(updateBookSummary.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      });
  },
});

export const { clearError, setSelectedBook, setPagination } = bookSlice.actions;
export default bookSlice.reducer;
