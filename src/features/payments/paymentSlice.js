import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as paymentService from "./paymentService";
import { fetchOrderByIdThunk } from "../orders/ordersSlice";
const initialState = {
    isCreating: false,
    error: null,
};
export const createPaymentRequestThunk = createAsyncThunk("payments/createPaymentRequest", async (payload, { dispatch, rejectWithValue }) => {
    try {
        const response = await paymentService.createPaymentRequest(payload);
        // After successfully creating a payment, refresh the order details
        // so the new payment shows up in OrderDetailScreen.
        dispatch(fetchOrderByIdThunk(payload.orderId));
        return response.data;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || "Không thể tạo yêu cầu thanh toán");
    }
});
const paymentSlice = createSlice({
    name: "payments",
    initialState,
    reducers: {
        clearPaymentError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentRequestThunk.pending, (state) => {
            state.isCreating = true;
            state.error = null;
        })
            .addCase(createPaymentRequestThunk.fulfilled, (state) => {
            state.isCreating = false;
        })
            .addCase(createPaymentRequestThunk.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload;
        });
    },
});
export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
