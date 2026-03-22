import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService } from './profileService';
import { updateUser } from '@/features/auth/authSlice';
const initialState = {
    isLoading: false,
    error: null,
};
export const updateProfileThunk = createAsyncThunk('profile/update', async (payload, { dispatch, rejectWithValue }) => {
    try {
        const response = await profileService.updateProfile(payload);
        // Sync auth state
        if (response.data) {
            dispatch(updateUser(response.data));
        }
        return response.data;
    }
    catch (error) {
        const msg = error.response?.data?.message || error.message || 'Cập nhật thất bại';
        return rejectWithValue(msg);
    }
});
export const changePasswordThunk = createAsyncThunk('profile/changePassword', async (payload, { rejectWithValue }) => {
    try {
        const response = await profileService.changePassword(payload);
        return response.data;
    }
    catch (error) {
        const msg = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại';
        return rejectWithValue(msg);
    }
});
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
            state.error = action.payload;
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
            state.error = action.payload;
        });
    },
});
export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
