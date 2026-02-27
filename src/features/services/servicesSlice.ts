// src/features/services/servicesSlice.ts
// ─── Redux slice for Services ────────────────────────────────────
// - No pagination (Swagger returns all services)
// - Admin CRUD: create, update, delete
// - Reset on logout
// - NO 410 handling — apiClient interceptor handles token refresh

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutThunk } from '@/features/auth/authSlice';
import * as servicesService from './servicesService';
import type {
  ServicesState,
  FetchServicesParams,
  CreateServicePayload,
  UpdateServicePayload,
} from './types';

// ─── Initial state ───────────────────────────────────────────────

const initialState: ServicesState = {
  list: [],
  categories: [],
  selectedService: null,
  isLoading: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────

/** Fetch all services (public, filterable) */
export const fetchServicesThunk = createAsyncThunk(
  'services/fetchServices',
  async (params: FetchServicesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServices(params || {});
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách dịch vụ',
      );
    }
  },
);

/** Fetch categories (public) */
export const fetchCategoriesThunk = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await servicesService.getCategories();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh mục',
      );
    }
  },
);

/** Fetch single service by ID */
export const fetchServiceByIdThunk = createAsyncThunk(
  'services/fetchServiceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServiceById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải dịch vụ',
      );
    }
  },
);

/** Create service (Admin) */
export const createServiceThunk = createAsyncThunk(
  'services/createService',
  async (payload: CreateServicePayload, { rejectWithValue }) => {
    try {
      const response = await servicesService.createService(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tạo dịch vụ',
      );
    }
  },
);

/** Update service (Admin) */
export const updateServiceThunk = createAsyncThunk(
  'services/updateService',
  async (
    { id, payload }: { id: string; payload: UpdateServicePayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await servicesService.updateService(id, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật dịch vụ',
      );
    }
  },
);

/** Delete service (Admin) */
export const deleteServiceThunk = createAsyncThunk(
  'services/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      await servicesService.deleteService(id);
      return id; // Return ID to remove from list
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xoá dịch vụ',
      );
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearServiceError(state) {
      state.error = null;
    },
    clearSelectedService(state) {
      state.selectedService = null;
    },
    resetServicesState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ── fetchServices ──
    builder
      .addCase(fetchServicesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServicesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchServicesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── fetchCategories ──
    builder
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload;
      });

    // ── fetchServiceById ──
    builder
      .addCase(fetchServiceByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── createService (add to list) ──
    builder
      .addCase(createServiceThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createServiceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createServiceThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── updateService (sync list + selectedService) ──
    builder
      .addCase(updateServiceThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateServiceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.selectedService = updated;
        const idx = state.list.findIndex((s) => s._id === updated._id);
        if (idx !== -1) state.list[idx] = updated;
      })
      .addCase(updateServiceThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── deleteService (remove from list) ──
    builder
      .addCase(deleteServiceThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteServiceThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((s) => s._id !== action.payload);
        if (state.selectedService?._id === action.payload) {
          state.selectedService = null;
        }
      })
      .addCase(deleteServiceThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Reset on logout ──
    builder
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearServiceError, clearSelectedService, resetServicesState } =
  servicesSlice.actions;
export default servicesSlice.reducer;
