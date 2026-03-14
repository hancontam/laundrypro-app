import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "./dashboardService";
import { DashboardStats } from "./types";

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStatsThunk = createAsyncThunk(
  "dashboard/fetchStats",
  async (
    params: { startDate?: string; endDate?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const data = await dashboardService.fetchDashboardStats(
        params?.startDate,
        params?.endDate
      );
      return data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      if (error.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred while fetching stats");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
