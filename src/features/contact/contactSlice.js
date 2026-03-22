import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { logoutThunk } from "@/features/auth/authSlice";
import * as contactService from "./contactService";
const initialState = {
    list: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    },
    isLoading: false,
    isLoadingMore: false,
    updatingContactId: null,
    error: null,
};
export const fetchContactsThunk = createAsyncThunk("contact/fetchContacts", async (params, { rejectWithValue }) => {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const response = await contactService.getContacts(page, limit);
        return response;
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || "Không thể tải danh sách liên hệ");
    }
});
export const loadMoreContactsThunk = createAsyncThunk("contact/loadMoreContacts", async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const { page, totalPages } = state.contact.pagination;
        if (page >= totalPages) {
            return rejectWithValue("No more pages");
        }
        const nextPage = page + 1;
        const limit = state.contact.pagination.limit;
        const response = await contactService.getContacts(nextPage, limit);
        return response;
    }
    catch (err) {
        if (err === "No more pages")
            return rejectWithValue(err);
        return rejectWithValue(err.response?.data?.message || "Không thể tải thêm liên hệ");
    }
});
export const updateContactStatusThunk = createAsyncThunk("contact/updateStatus", async ({ contactId, status }, { rejectWithValue }) => {
    try {
        const data = await contactService.updateContactStatus(contactId, status);
        return { contactId, data };
    }
    catch (err) {
        return rejectWithValue(err.response?.data?.message || "Không thể cập nhật trạng thái liên hệ");
    }
});
const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        clearContactError(state) {
            state.error = null;
        },
        resetContactState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchContacts
            .addCase(fetchContactsThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(fetchContactsThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.list = action.payload.contacts;
            const total = action.payload.pagination.total;
            const limit = action.payload.pagination.limit;
            state.pagination = {
                page: action.payload.pagination.page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            };
        })
            .addCase(fetchContactsThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // loadMoreContacts
            .addCase(loadMoreContactsThunk.pending, (state) => {
            state.isLoadingMore = true;
            state.error = null;
        })
            .addCase(loadMoreContactsThunk.fulfilled, (state, action) => {
            state.isLoadingMore = false;
            // Append new items
            const newContacts = action.payload.contacts.filter((c) => !state.list.find((existing) => existing._id === c._id));
            state.list = [...state.list, ...newContacts];
            const total = action.payload.pagination.total;
            const limit = action.payload.pagination.limit;
            state.pagination = {
                page: action.payload.pagination.page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            };
        })
            .addCase(loadMoreContactsThunk.rejected, (state, action) => {
            state.isLoadingMore = false;
            if (action.payload !== "No more pages") {
                state.error = action.payload;
            }
        })
            .addCase(updateContactStatusThunk.pending, (state, action) => {
            state.updatingContactId = action.meta.arg.contactId;
            state.error = null;
        })
            .addCase(updateContactStatusThunk.fulfilled, (state, action) => {
            state.updatingContactId = null;
            state.list = state.list.map((contact) => contact._id === action.payload.contactId
                ? {
                    ...contact,
                    ...action.payload.data,
                }
                : contact);
        })
            .addCase(updateContactStatusThunk.rejected, (state, action) => {
            state.updatingContactId = null;
            state.error = action.payload;
        })
            // Reset on logout
            .addCase(logoutThunk.fulfilled, () => initialState)
            .addCase(logoutThunk.rejected, () => initialState);
    },
});
export const { clearContactError, resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
