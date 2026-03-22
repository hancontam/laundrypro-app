// ─── API service layer for Users (Admin only) ────────────────────
// No 410 handling — apiClient interceptor handles token refresh.
import apiClient from "../../core/api/apiClient";
/** GET /v1/users/users — All users (Admin, paginated) */
export async function getUsers(params = {}) {
    const { data } = await apiClient.get("/v1/users/users", {
        params,
    });
    return data;
}
/** GET /v1/users/users/:id — User detail (Admin) */
export async function getUserById(id) {
    const { data } = await apiClient.get(`/v1/users/users/${id}`);
    return data;
}
/** POST /v1/users/users/staff — Create staff (Admin) */
export async function createStaff(payload) {
    const { data } = await apiClient.post("/v1/users/users/staff", payload);
    return data;
}
/** PUT /v1/users/users/:id — Update staff (Admin) */
export async function updateStaff(id, payload) {
    const { data } = await apiClient.put(`/v1/users/users/${id}`, payload);
    return data;
}
/** PATCH /v1/users/users/:id/status — Update user status (Admin) */
export async function updateUserStatus(id, status) {
    const { data } = await apiClient.patch(`/v1/users/users/${id}/status`, { status });
    return data;
}
