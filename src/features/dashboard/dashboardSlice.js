import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardService } from "./dashboardService";
const initialState = {
    stats: null,
    isLoading: false,
    error: null,
};
export const fetchDashboardStatsThunk = createAsyncThunk("dashboard/fetchStats", async (params, { rejectWithValue }) => {
    try {
        const data = await dashboardService.fetchDashboardStats(params?.startDate, params?.endDate);
        return data;
    }
    catch (error) {
        if (error.response?.data?.message) {
            return rejectWithValue(error.response.data.message);
        }
        if (error.message) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("An unknown error occurred while fetching stats");
    }
});
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
            state.error = action.payload;
        });
    },
});
export default dashboardSlice.reducer;
