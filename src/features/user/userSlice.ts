import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { apiService } from '@/services/apiService';

export interface UserState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  user: null,
  status: 'idle',
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (_: void, thunkAPI: any) => {
  const response = await apiService.get('/user/me');
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchUser.pending, (state: UserState) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state: UserState, action: any) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state: UserState) => {
        state.status = 'failed';
      });
  },
});

export default userSlice.reducer;
