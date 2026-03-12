// src/features/customerPayments/customerPaymentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as customerPaymentsService from "./customerPaymentsService";
import type { CustomerPaymentsState } from "./types";

const initialState: CustomerPaymentsState = {
  paymentHistory: [],
  selectedPayment: null,
  loading: false,
  error: null,
};

export const fetchPaymentHistoryThunk = createAsyncThunk(
  "customerPayments/fetchPaymentHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerPaymentsService.fetchPaymentHistory();
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải lịch sử thanh toán",
      );
    }
  },
);

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
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentError, setSelectedPayment } =
  customerPaymentsSlice.actions;
export default customerPaymentsSlice.reducer;
