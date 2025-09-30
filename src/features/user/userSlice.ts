import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiResponse, BaseApiResponse, User } from '@/types';
import { apiService } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

export interface UserState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  user: null,
  status: 'idle',
};

export const retrieveUser = createAsyncThunk('user/fetchUser', async (_: void, thunkAPI: any) => {
  try {
    const localUserData = localStorage.getItem('userInfo');
    if (localUserData) {
      const parsedUserData = JSON.parse(localUserData);
      const response: any = await apiService.get(API_ENDPOINTS.AUTH.ME(parsedUserData?.id || ''));
      console.log('User data response:', response);
      if (response.data.success) {
        return response.data.data as User;
      } else {
        return thunkAPI.rejectWithValue(response.data.message);
      }
    }
    return thunkAPI.rejectWithValue('No user data found');
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(retrieveUser.pending, (state: UserState) => {
        state.status = 'loading';
      })
      .addCase(retrieveUser.fulfilled, (state: UserState, action: any) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(retrieveUser.rejected, (state: UserState) => {
        state.status = 'failed';
      });
  },
});

export default userSlice.reducer;
