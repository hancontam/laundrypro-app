// src/features/customerPayments/customerPaymentsService.ts
import apiClient from "../../core/api/apiClient";
import type { Payment, OrderWithPayment } from "./types";

// ─── Fetch Payment History ────────────────────────────────────────

interface MyOrdersResponse {
  success: boolean;
  data: {
    orders: OrderWithPayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function fetchPaymentHistory(): Promise<Payment[]> {
  // Fetch orders specifically to extract history of payments
  const { data } = await apiClient.get<MyOrdersResponse>(
    "/v1/orders/my-orders",
  );

  if (!data?.success || !data?.data?.orders) {
    return [];
  }

  // Extract non-null payments from the user's orders, sorting newest first
  const payments = data.data.orders
    .map((order) => order.payment)
    .filter((payment): payment is Payment => payment !== null);

  // Sort payments by creation date DESC
  return payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
