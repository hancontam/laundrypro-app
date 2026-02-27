// src/features/users/usersSlice.ts
// ─── Redux slice for Users (Admin feature) ───────────────────────
// - Paginated staff list with load-more
// - Create staff, update status
// - Reset on logout
// - NO 410 handling — apiClient interceptor

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutThunk } from '@/features/auth/authSlice';
import * as usersService from './usersService';
import type {
  UsersState,
  FetchUsersParams,
  CreateStaffPayload,
  UserStatus,
} from './types';

// ─── Initial state ───────────────────────────────────────────────

const initialState: UsersState = {
  list: [],
  selectedUser: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────

/** Fetch staff list (page 1) — filter role=staff */
export const fetchStaffThunk = createAsyncThunk(
  'users/fetchStaff',
  async (params: FetchUsersParams | undefined, { rejectWithValue }) => {
    try {
      const response = await usersService.getUsers({
        role: 'staff',
        page: 1,
        limit: 10,
        ...params,
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách nhân viên',
      );
    }
  },
);

/** Load more staff */
export const loadMoreStaffThunk = createAsyncThunk(
  'users/loadMoreStaff',
  async (params: FetchUsersParams | undefined, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as any).users as UsersState;
      const { page, totalPages } = state.pagination;

      if (page >= totalPages) return null;

      const response = await usersService.getUsers({
        role: 'staff',
        page: page + 1,
        limit: 10,
        ...params,
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải thêm nhân viên',
      );
    }
  },
);

/** Fetch user by ID */
export const fetchUserByIdThunk = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersService.getUserById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải thông tin nhân viên',
      );
    }
  },
);

/** Create staff (Admin) */
export const createStaffThunk = createAsyncThunk(
  'users/createStaff',
  async (payload: CreateStaffPayload, { rejectWithValue }) => {
    try {
      const response = await usersService.createStaff(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tạo nhân viên',
      );
    }
  },
);

/** Update user status (Admin) — syncs selectedUser + list */
export const updateUserStatusThunk = createAsyncThunk(
  'users/updateUserStatus',
  async (
    { id, status }: { id: string; status: UserStatus },
    { rejectWithValue },
  ) => {
    try {
      const response = await usersService.updateUserStatus(id, status);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật trạng thái',
      );
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchStaff (page 1 — replace list) ──
    builder
      .addCase(fetchStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── loadMore ──
    builder
      .addCase(loadMoreStaffThunk.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreStaffThunk.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        if (action.payload) {
          state.list = [...state.list, ...action.payload.users];
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(loadMoreStaffThunk.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });

    // ── fetchUserById ──
    builder
      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── createStaff (add to list) ──
    builder
      .addCase(createStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── updateUserStatus (sync selectedUser + list) ──
    builder
      .addCase(updateUserStatusThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.selectedUser = updated;
        const idx = state.list.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
      })
      .addCase(updateUserStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Reset on logout ──
    builder
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearUserError, clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
