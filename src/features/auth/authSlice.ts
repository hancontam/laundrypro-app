// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from './authService';
import type {
  AuthState,
  LoginPasswordPayload,
  SetPasswordPayload,
} from './types';

// ─── Initial state ──────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginMethod: null,
  phone: null,
};

// ─── Async thunks ───────────────────────────────────────────────

// Step 1: Check how a phone number should login
export const checkLoginThunk = createAsyncThunk(
  'auth/checkLogin',
  async (phone: string, { rejectWithValue }) => {
    try {
      const result = await authService.checkLogin(phone);
      return { ...result, phone };
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to check login';
      return rejectWithValue(msg);
    }
  },
);

// Step 2a: Login with Firebase OTP idToken (sets cookies)
export const loginWithOtpThunk = createAsyncThunk(
  'auth/loginWithOtp',
  async (idToken: string, { rejectWithValue }) => {
    try {
      await authService.loginWithOtp(idToken);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'OTP login failed';
      return rejectWithValue(msg);
    }
  },
);

// Step 2b: Login with phone + password (sets cookies)
export const loginWithPasswordThunk = createAsyncThunk(
  'auth/loginWithPassword',
  async (payload: LoginPasswordPayload, { rejectWithValue }) => {
    try {
      await authService.loginWithPassword(payload);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(msg);
    }
  },
);

// Step 3: Load profile after login
export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to get profile';
      return rejectWithValue(msg);
    }
  },
);

export const setPasswordThunk = createAsyncThunk(
  'auth/setPassword',
  async (payload: SetPasswordPayload, { rejectWithValue }) => {
    try {
      await authService.setPassword(payload);
    } catch (error: any) {
      const msg =
        error.response?.data?.message || error.message || 'Failed to set password';
      return rejectWithValue(msg);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      // Still reset state even if server logout fails
      const msg =
        error.response?.data?.message || error.message || 'Logout failed';
      return rejectWithValue(msg);
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    resetAuth() {
      return initialState;
    },
    setPhone(state, action: PayloadAction<string>) {
      state.phone = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── checkLogin ──
    builder
      .addCase(checkLoginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkLoginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loginMethod = action.payload.loginMethod;
        state.phone = action.payload.phone;
      })
      .addCase(checkLoginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── loginWithOtp (sets cookies, no body) ──
    builder
      .addCase(loginWithOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithOtpThunk.fulfilled, (state) => {
        state.isLoading = false;
        // Cookies set → profile will be loaded next
      })
      .addCase(loginWithOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── loginWithPassword (sets cookies, no body) ──
    builder
      .addCase(loginWithPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        // Cookies set → profile will be loaded next
      })
      .addCase(loginWithPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── getProfile (after login → marks authenticated) ──
    builder
      .addCase(getProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── setPassword ──
    builder
      .addCase(setPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(setPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── logout ──
    builder
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, () => {
        return initialState;
      })
      .addCase(logoutThunk.rejected, () => {
        return initialState;
      });
  },
});

export const { clearError, resetAuth, setPhone } = authSlice.actions;
export default authSlice.reducer;
