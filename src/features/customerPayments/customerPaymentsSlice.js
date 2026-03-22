import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as customerPaymentsService from "./customerPaymentsService";
const initialState = {
    paymentHistory: [],
    selectedPayment: null,
    loading: false,
    updatingPaymentId: null,
    error: null,
};
export const fetchPaymentHistoryThunk = createAsyncThunk("customerPayments/fetchPaymentHistory", async (scope = "my", { rejectWithValue }) => {
    try {
        const data = scope === "all"
            ? await customerPaymentsService.fetchAllPaymentHistory()
            : await customerPaymentsService.fetchPaymentHistory();
        return data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || "Không thể tải lịch sử thanh toán");
    }
});
export const updatePaymentStatusThunk = createAsyncThunk("customerPayments/updatePaymentStatus", async (payload, { rejectWithValue }) => {
    try {
        const data = await customerPaymentsService.updatePaymentStatus(payload.paymentId, payload.status);
        return { ...payload, data };
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || "Không thể cập nhật trạng thái thanh toán");
    }
});
const customerPaymentsSlice = createSlice({
    name: "customerPayments",
    initialState,
    reducers: {
        clearPaymentError(state) {
            state.error = null;
        },
        setSelectedPayment(state, action) {
            state.selectedPayment = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch History
            .addCase(fetchPaymentHistoryThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchPaymentHistoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.paymentHistory = action.payload;
        })
            .addCase(fetchPaymentHistoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(updatePaymentStatusThunk.pending, (state, action) => {
            state.updatingPaymentId = action.meta.arg.paymentId;
            state.error = null;
        })
            .addCase(updatePaymentStatusThunk.fulfilled, (state, action) => {
            state.updatingPaymentId = null;
            const mergePayment = (current) => ({
                ...current,
                ...action.payload.data,
            });
            state.paymentHistory = state.paymentHistory.map((payment) => payment._id === action.payload.paymentId ? mergePayment(payment) : payment);
            if (state.selectedPayment?._id === action.payload.paymentId) {
                state.selectedPayment = mergePayment(state.selectedPayment);
            }
        })
            .addCase(updatePaymentStatusThunk.rejected, (state, action) => {
            state.updatingPaymentId = null;
            state.error = action.payload;
        });
    },
});
export const { clearPaymentError, setSelectedPayment } = customerPaymentsSlice.actions;
export default customerPaymentsSlice.reducer;
