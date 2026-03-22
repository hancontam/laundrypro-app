import apiClient from "../../core/api/apiClient";
export async function fetchPaymentHistory() {
    // Fetch orders specifically to extract history of payments
    const { data } = await apiClient.get("/v1/orders/my-orders");
    if (!data?.success || !data?.data?.orders) {
        return [];
    }
    const payments = data.data.orders
        .map((order) => normalizePaymentFromOrder(order))
        .filter((payment) => payment !== null);
    // Sort payments by creation date DESC
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function fetchAllPaymentHistory() {
    const limit = 100;
    let page = 1;
    let totalPages = 1;
    const payments = [];
    do {
        const { data } = await apiClient.get("/v1/orders", {
            params: { page, limit },
        });
        const orders = data?.data?.orders ?? [];
        payments.push(...orders
            .map((order) => normalizePaymentFromOrder(order))
            .filter((payment) => payment !== null));
        totalPages = data?.data?.pagination?.totalPages ?? 1;
        page += 1;
    } while (page <= totalPages);
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function updatePaymentStatus(paymentId, status) {
    const { data } = await apiClient.patch(`/v1/payments/${paymentId}/status`, { status });
    return data.data;
}
function normalizePaymentFromOrder(order) {
    if (!order.payment) {
        return null;
    }
    const customer = "customerId" in order && typeof order.customerId === "object"
        ? order.customerId
        : null;
    return {
        ...order.payment,
        orderId: order._id,
        orderCode: order._id.slice(-8).toUpperCase(),
        customerId: customer?._id,
        customerName: customer?.name,
        customerPhone: customer?.phone,
    };
}
