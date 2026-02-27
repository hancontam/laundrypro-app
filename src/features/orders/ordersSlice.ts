// src/features/orders/ordersSlice.ts
// ─── Redux slice for Orders ──────────────────────────────────────
// - Role-aware: customer → my-orders, staff/admin → all orders
// - Pagination: supports load-more (append to list)
// - After status update: syncs both selectedOrder AND list
// - NO 410 handling here — apiClient interceptor handles token refresh

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutThunk } from '@/features/auth/authSlice';
import type { RootState } from '@/app/store';
import * as ordersService from './ordersService';
import type {
  OrdersState,
  FetchOrdersParams,
  Order,
  OrderStatus,
  Pagination,
  CreateOrderPayload,
} from './types';

// ─── Initial state ───────────────────────────────────────────────

const initialState: OrdersState = {
  list: [],
  selectedOrder: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────

/** Fetch orders — role-aware, replaces list (page 1) */
export const fetchOrdersThunk = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersParams | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const role = state.auth.user?.role;
      const queryParams = { page: 1, limit: 10, ...params };

      const response =
        role === 'customer'
          ? await ordersService.getMyOrders(queryParams)
          : await ordersService.getAllOrders(queryParams);

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách đơn hàng',
      );
    }
  },
);

/** Load more orders — appends to existing list */
export const loadMoreOrdersThunk = createAsyncThunk(
  'orders/loadMoreOrders',
  async (params: FetchOrdersParams | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const role = state.auth.user?.role;
      const { page, totalPages } = state.orders.pagination;

      if (page >= totalPages) {
        return null; // No more pages
      }

      const queryParams = { page: page + 1, limit: 10, ...params };

      const response =
        role === 'customer'
          ? await ordersService.getMyOrders(queryParams)
          : await ordersService.getAllOrders(queryParams);

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải thêm đơn hàng',
      );
    }
  },
);

/** Fetch single order by ID — role-aware */
export const fetchOrderByIdThunk = createAsyncThunk(
  'orders/fetchOrderById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const role = state.auth.user?.role;

      const response =
        role === 'customer'
          ? await ordersService.getMyOrderById(id)
          : await ordersService.getOrderById(id);

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải chi tiết đơn hàng',
      );
    }
  },
);

/** Update order status (Staff/Admin only) — syncs selectedOrder + list */
export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateOrderStatus',
  async (
    { id, status }: { id: string; status: OrderStatus },
    { rejectWithValue },
  ) => {
    try {
      const response = await ordersService.updateOrderStatus(id, status);
      return response.data; // Updated Order
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật trạng thái',
      );
    }
  },
);

/** Create order (Staff/Admin) — auto-creates customer if not exists */
export const createOrderThunk = createAsyncThunk(
  'orders/createOrder',
  async (payload: CreateOrderPayload, { rejectWithValue }) => {
    try {
      const response = await ordersService.createOrder(payload);
      return response;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tạo đơn hàng',
      );
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError(state) {
      state.error = null;
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchOrders (page 1 — replace list) ──
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── loadMore (append to list) ──
    builder
      .addCase(loadMoreOrdersThunk.pending, (state) => {
        state.isLoadingMore = true;
      })
      .addCase(loadMoreOrdersThunk.fulfilled, (state, action) => {
        state.isLoadingMore = false;
        if (action.payload) {
          state.list = [...state.list, ...action.payload.orders];
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(loadMoreOrdersThunk.rejected, (state, action) => {
        state.isLoadingMore = false;
        state.error = action.payload as string;
      });

    // ── fetchOrderById ──
    builder
      .addCase(fetchOrderByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── updateOrderStatus — sync both selectedOrder AND list ──
    builder
      .addCase(updateOrderStatusThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;

        // Sync selectedOrder
        state.selectedOrder = updatedOrder;

        // Sync in list
        const index = state.list.findIndex((o) => o._id === updatedOrder._id);
        if (index !== -1) {
          state.list[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── createOrder (prepend to list) ──
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.unshift(action.payload.data);
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ── Reset on logout ──
    builder
      .addCase(logoutThunk.fulfilled, () => initialState)
      .addCase(logoutThunk.rejected, () => initialState);
  },
});

export const { clearOrderError, clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
