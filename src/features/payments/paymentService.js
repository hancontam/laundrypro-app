import apiClient from "../../core/api/apiClient";
// ─── Payment endpoints ──────────────────────────────────────────
/** POST /v1/payments — Create payment (Staff/Admin) */
export async function createPaymentRequest(payload) {
    const { data } = await apiClient.post("/v1/payments", payload);
    return data;
}
// NOTE: Updating order status is already handled in src/features/orders/ordersService.js
