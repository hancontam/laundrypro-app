// src/features/customerPayments/customerPaymentsService.ts
import apiClient from "../../core/api/apiClient";
import type { Payment, OrderWithPayment, PaymentStatus } from "./types";
import type { Order, OrdersListResponse } from "../orders/types";

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

  const payments = data.data.orders
    .map((order) => normalizePaymentFromOrder(order))
    .filter((payment): payment is Payment => payment !== null);

  // Sort payments by creation date DESC
  return payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function fetchAllPaymentHistory(): Promise<Payment[]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const payments: Payment[] = [];

  do {
    const { data } = await apiClient.get<OrdersListResponse>("/v1/orders", {
      params: { page, limit },
    });

    const orders = data?.data?.orders ?? [];
    payments.push(
      ...orders
        .map((order) => normalizePaymentFromOrder(order))
        .filter((payment): payment is Payment => payment !== null),
    );

    totalPages = data?.data?.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

interface UpdatePaymentStatusResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
): Promise<Payment> {
  const { data } = await apiClient.patch<UpdatePaymentStatusResponse>(
    `/v1/payments/${paymentId}/status`,
    { status },
  );

  return data.data;
}

function normalizePaymentFromOrder(order: OrderWithPayment | Order): Payment | null {
  if (!order.payment) {
    return null;
  }

  const customer =
    "customerId" in order && typeof order.customerId === "object"
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
