// ─── Redux slice for Orders ──────────────────────────────────────
// - Role-aware: customer → my-orders, staff/admin → all orders
// - Pagination: supports load-more (append to list)
// - After status update: syncs both selectedOrder AND list
// - NO 410 handling here — apiClient interceptor handles token refresh
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logoutThunk } from '@/features/auth/authSlice';
import * as ordersService from './ordersService';
// ─── Initial state ───────────────────────────────────────────────
const initialState = {
    list: [],
    selectedOrder: null,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading: false,
    isLoadingMore: false,
    error: null,
};
function dedupeOrders(orders = []) {
    const seen = new Set();
    return orders.filter((order) => {
        if (!order?._id || seen.has(order._id)) {
            return false;
        }
        seen.add(order._id);
        return true;
    });
}
function upsertOrderAtTop(orders = [], incomingOrder) {
    if (!incomingOrder?._id) {
        return orders;
    }
    const nextOrders = orders.filter((order) => order?._id !== incomingOrder._id);
    return [incomingOrder, ...nextOrders];
}
function normalizeCreatedOrder(order, requestPayload) {
    if (!order?._id) {
        return order;
    }
    const hasPopulatedCustomer = order.customerId && typeof order.customerId === 'object';
    if (hasPopulatedCustomer) {
        return order;
    }
    const fallbackName = requestPayload?.customerName?.trim();
    const fallbackPhone = requestPayload?.customerPhone?.trim();
    if (!fallbackName && !fallbackPhone) {
        return order;
    }
    return {
        ...order,
        customerId: {
            _id: typeof order.customerId === 'string' ? order.customerId : undefined,
            name: fallbackName,
            phone: fallbackPhone,
        },
    };
}
function preserveCustomerDisplayData(incomingOrder, fallbackOrder) {
    if (!incomingOrder?._id || !fallbackOrder) {
        return incomingOrder;
    }
    const hasPopulatedCustomer = incomingOrder.customerId && typeof incomingOrder.customerId === 'object';
    if (hasPopulatedCustomer) {
        return incomingOrder;
    }
    const fallbackCustomer = fallbackOrder.customerId && typeof fallbackOrder.customerId === 'object'
        ? fallbackOrder.customerId
        : null;
    const fallbackName = incomingOrder.customerName || fallbackOrder.customerName || fallbackCustomer?.name;
    const fallbackPhone = incomingOrder.customerPhone || fallbackOrder.customerPhone || fallbackCustomer?.phone;
    if (!fallbackName && !fallbackPhone) {
        return incomingOrder;
    }
    return {
        ...incomingOrder,
        customerName: fallbackName || incomingOrder.customerName,
        customerPhone: fallbackPhone || incomingOrder.customerPhone,
        customerId: fallbackCustomer
            ? {
                ...fallbackCustomer,
                _id: typeof incomingOrder.customerId === 'string'
                    ? incomingOrder.customerId
                    : fallbackCustomer._id,
            }
            : incomingOrder.customerId,
    };
}
// ─── Thunks ──────────────────────────────────────────────────────
/** Fetch orders — role-aware, replaces list (page 1) */
export const fetchOrdersThunk = createAsyncThunk('orders/fetchOrders', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const role = state.auth.user?.role;
        const queryParams = { page: 1, limit: 10, ...params };
        const response = role === 'customer'
            ? await ordersService.getMyOrders(queryParams)
            : await ordersService.getAllOrders(queryParams);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    }
});
/** Load more orders — appends to existing list */
export const loadMoreOrdersThunk = createAsyncThunk('orders/loadMoreOrders', async (params, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const role = state.auth.user?.role;
        const { page, totalPages } = state.orders.pagination;
        if (page >= totalPages) {
            return null; // No more pages
        }
        const queryParams = { page: page + 1, limit: 10, ...params };
        const response = role === 'customer'
            ? await ordersService.getMyOrders(queryParams)
            : await ordersService.getAllOrders(queryParams);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Không thể tải thêm đơn hàng');
    }
});
/** Fetch single order by ID — role-aware */
export const fetchOrderByIdThunk = createAsyncThunk('orders/fetchOrderById', async (id, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const role = state.auth.user?.role;
        const response = role === 'customer'
            ? await ordersService.getMyOrderById(id)
            : await ordersService.getOrderById(id);
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    }
});
/** Update order status (Staff/Admin only) — syncs selectedOrder + list */
export const updateOrderStatusThunk = createAsyncThunk('orders/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const response = await ordersService.updateOrderStatus(id, status);
        return response.data; // Updated Order
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
});
/** Create order (Staff/Admin) — auto-creates customer if not exists */
export const createOrderThunk = createAsyncThunk('orders/createOrder', async (payload, { rejectWithValue }) => {
    try {
        const response = await ordersService.createOrder(payload);
        return response;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Không thể tạo đơn hàng');
    }
});
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
            state.list = dedupeOrders(action.payload.orders);
            state.pagination = action.payload.pagination;
        })
            .addCase(fetchOrdersThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
        // ── loadMore (append to list) ──
        builder
            .addCase(loadMoreOrdersThunk.pending, (state) => {
            state.isLoadingMore = true;
        })
            .addCase(loadMoreOrdersThunk.fulfilled, (state, action) => {
            state.isLoadingMore = false;
            if (action.payload) {
                state.list = dedupeOrders([...state.list, ...action.payload.orders]);
                state.pagination = action.payload.pagination;
            }
        })
            .addCase(loadMoreOrdersThunk.rejected, (state, action) => {
            state.isLoadingMore = false;
            state.error = action.payload;
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
            state.error = action.payload;
        });
        // ── updateOrderStatus — sync both selectedOrder AND list ──
        builder
            .addCase(updateOrderStatusThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            const existingOrder = state.list.find((o) => o._id === action.payload._id) || state.selectedOrder;
            const updatedOrder = preserveCustomerDisplayData(action.payload, existingOrder);
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
            state.error = action.payload;
        });
        // ── createOrder (prepend to list) ──
        builder
            .addCase(createOrderThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(createOrderThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.list = upsertOrderAtTop(state.list, normalizeCreatedOrder(action.payload.data, action.meta.arg));
        })
            .addCase(createOrderThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
        // ── Reset on logout ──
        builder
            .addCase(logoutThunk.fulfilled, () => initialState)
            .addCase(logoutThunk.rejected, () => initialState);
    },
});
export const { clearOrderError, clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
