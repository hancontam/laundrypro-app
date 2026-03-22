// ─── API service layer — uses shared apiClient ───────────────────
// No direct axios import. No 410/refresh logic here (interceptor handles it).
import apiClient from "../../core/api/apiClient";
// ─── Customer endpoints ──────────────────────────────────────────
/** GET /v1/orders/my-orders — Customer's own orders (paginated) */
export async function getMyOrders(params = {}) {
    const { data } = await apiClient.get("/v1/orders/my-orders", { params });
    return data;
}
/** GET /v1/orders/my-orders/:id — Customer's single order detail */
export async function getMyOrderById(id) {
    const { data } = await apiClient.get(`/v1/orders/my-orders/${id}`);
    return data;
}
// ─── Staff / Admin endpoints ─────────────────────────────────────
/** GET /v1/orders — All orders (paginated, filterable) */
export async function getAllOrders(params = {}) {
    const { data } = await apiClient.get("/v1/orders", {
        params,
    });
    return data;
}
/** GET /v1/orders/:id — Single order detail (Staff/Admin) */
export async function getOrderById(id) {
    const { data } = await apiClient.get(`/v1/orders/${id}`);
    return data;
}
/** POST /v1/orders — Create order (Staff/Admin), auto-creates customer */
export async function createOrder(payload) {
    const { data } = await apiClient.post("/v1/orders", payload);
    return data;
}
/** PATCH /v1/orders/:id/status — Update order status (Staff/Admin) */
export async function updateOrderStatus(id, status) {
    const { data } = await apiClient.patch(`/v1/orders/${id}/status`, { status });
    return data;
}
