import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { commentAPI } from '../../services/apiService';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '../../types';

export interface CommentState {
  comments: Comment[];
  selectedComment: Comment | null;
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  selectedComment: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await commentAPI.getAll();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const fetchCommentsByBook = createAsyncThunk(
  'comments/fetchByBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      const response = await commentAPI.getByBook(bookId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async (commentData: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await commentAPI.create(commentData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, commentData }: { id: string; commentData: UpdateCommentRequest }, { rejectWithValue }) => {
    try {
      const response = await commentAPI.update(id, commentData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await commentAPI.delete(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedComment: (state, action: PayloadAction<Comment | null>) => {
      state.selectedComment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch comments by book
      .addCase(fetchCommentsByBook.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.comments.findIndex(comment => comment.id === action.payload.id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      });
  },
});

export const { clearError, setSelectedComment } = commentSlice.actions;
export default commentSlice.reducer;
