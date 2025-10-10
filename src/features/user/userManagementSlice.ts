import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userAPI } from '../../services/apiService';
import { User, PaginatedResponse } from '../../types';

export interface UserManagementState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

// Async thunks
interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const fetchUsers = createAsyncThunk<
  PaginatedResponse<User>,
  FetchUsersParams,
  { rejectValue: string }
>(
  'userManagement/fetchAll',
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params;
      const response = await userAPI.getAllPaginated(page, limit, search);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/update',
  async (userData: Partial<User> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await userAPI.update(userData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const toggleUserDisable = createAsyncThunk(
  'userManagement/toggleDisable',
  async ({ id, isDisable }: { id: string; isDisable: boolean }, { rejectWithValue }) => {
    try {
      const response = await userAPI.toggleDisable(id, isDisable);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.delete(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.meta.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle disable
      .addCase(toggleUserDisable.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export const { clearError, setSelectedUser } = userManagementSlice.actions;
export default userManagementSlice.reducer;
