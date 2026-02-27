// src/features/profile/profileSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from './profileService';
import { updateUser } from '@/features/auth/authSlice';
import type { UpdateProfilePayload, ChangePasswordPayload } from './types';

interface ProfileState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  isLoading: false,
  error: null,
};

export const updateProfileThunk = createAsyncThunk(
  'profile/update',
  async (payload: UpdateProfilePayload, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(payload);
      // Sync auth state
      if (response.data) {
        dispatch(updateUser(response.data));
      }
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Cập nhật thất bại';
      return rejectWithValue(msg);
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'profile/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      const response = await profileService.changePassword(payload);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại';
      return rejectWithValue(msg);
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // updateProfile
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // changePassword
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
