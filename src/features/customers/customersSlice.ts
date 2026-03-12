// src/features/customers/customersSlice.ts
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import { customersService } from './customersService';
import { logoutThunk } from '@/features/auth/authSlice';
import type {
  Customer,
  FetchCustomersParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  PaginationData,
} from './types';
import type { RootState } from '@/app/store';

// ─── Entity Adapter ─────────────────────────────────────────────
// @ts-expect-error RTK generic constraint strictness with missing 'id' field
const customersAdapter = createEntityAdapter<Customer>({
  selectId: (customer) => customer._id,
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

// ─── Initial State ──────────────────────────────────────────────
interface AdditionalCustomersState {
  selectedId: string | null;
  pagination: PaginationData;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  // Search state for auto-suggest
  searchResults: Customer[];
  isSearching: boolean;
}

const initialState = customersAdapter.getInitialState<AdditionalCustomersState>({
  selectedId: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  isLoading: false,
  isLoadingMore: false,
  error: null,
  // Search initial state
  searchResults: [],
  isSearching: false,
});

// ─── Thunks ─────────────────────────────────────────────────────

export const fetchCustomersThunk = createAsyncThunk(
  'customers/fetchList',
  async (params: FetchCustomersParams | undefined, { rejectWithValue }) => {
    try {
      return await customersService.getCustomers({ page: 1, limit: 10, ...params });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Lỗi tải danh sách khách hàng'
      );
    }
  }
);

export const loadMoreCustomersThunk = createAsyncThunk(
  'customers/loadMore',
  async (params: FetchCustomersParams | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { page } = state.customers.pagination;
      return await customersService.getCustomers({ page: page + 1, limit: 10, ...params });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Lỗi tải thêm khách hàng'
      );
    }
  }
);

export const fetchCustomerByIdThunk = createAsyncThunk(
  'customers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customersService.getCustomerById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Lỗi tải chi tiết khách hàng'
      );
    }
  }
);

export const createCustomerThunk = createAsyncThunk(
  'customers/create',
  async (payload: CreateCustomerPayload, { rejectWithValue }) => {
    try {
      const response = await customersService.createCustomer(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Thêm khách hàng thất bại'
      );
    }
  }
);

export const updateCustomerThunk = createAsyncThunk(
  'customers/update',
  async (payload: UpdateCustomerPayload, { rejectWithValue }) => {
    try {
      const response = await customersService.updateCustomer(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Cập nhật thất bại'
      );
    }
  }
);

export const updateCustomerStatusThunk = createAsyncThunk(
  'customers/updateStatus',
  async (
    { id, status }: { id: string; status: 'active' | 'suspended' },
    { rejectWithValue }
  ) => {
    try {
      const result = await customersService.updateCustomerStatus(id, status);
      return { id, status, data: result.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại'
      );
    }
  }
);

// Search customers for auto-suggest in CreateOrderScreen
export const searchCustomersThunk = createAsyncThunk(
  'customers/search',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await customersService.searchCustomers(query);
      return response.data.customers;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Tìm kiếm khách hàng thất bại'
      );
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────────
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomersError(state) {
      state.error = null;
    },
    clearSelectedCustomer(state) {
      state.selectedId = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.isSearching = false;
    },
  },
  extraReducers: (builder) => {
    // fetchCustomersThunk
    builder
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        customersAdapter.setAll(state, action.payload.data.customers);
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // loadMoreCustomersThunk
    builder
      .addCase(loadMoreCustomersThunk.pending, (state) => {
        state.isLoadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreCustomersThunk.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        customersAdapter.addMany(state, action.payload.data.customers);
        state.pagination = action.payload.data.pagination;
      })
      .addCase(loadMoreCustomersThunk.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });

    // fetchCustomerByIdThunk
    builder
      .addCase(fetchCustomerByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedId = action.payload._id;
        customersAdapter.upsertOne(state, action.payload);
      })
      .addCase(fetchCustomerByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createCustomerThunk
    builder
      .addCase(createCustomerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        customersAdapter.addOne(state, action.payload);
      })
      .addCase(createCustomerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateCustomerThunk
    builder
      .addCase(updateCustomerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        customersAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateCustomerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateCustomerStatusThunk
    builder
      .addCase(updateCustomerStatusThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomerStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        customersAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { status: action.payload.status },
        });
      })
      .addCase(updateCustomerStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // searchCustomersThunk
    builder
      .addCase(searchCustomersThunk.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchCustomersThunk.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCustomersThunk.rejected, (state) => {
        state.isSearching = false;
        state.searchResults = [];
      });

    // Reset on logout
    builder.addCase(logoutThunk.fulfilled, () => {
      return initialState;
    });
  },
});

export const { clearCustomersError, clearSelectedCustomer, clearSearchResults } = customersSlice.actions;

// Export adapter selectors
export const {
  selectAll: selectAllCustomers,
  selectById: selectCustomerById,
  selectIds: selectCustomerIds,
} = customersAdapter.getSelectors((state: RootState) => state.customers);

export default customersSlice.reducer;
