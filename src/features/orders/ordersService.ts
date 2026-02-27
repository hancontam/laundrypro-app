// src/features/orders/ordersService.ts
// ─── API service layer — uses shared apiClient ───────────────────
// No direct axios import. No 410/refresh logic here (interceptor handles it).

import apiClient from '@/services/apiClient';
import type {
  FetchOrdersParams,
  OrdersListResponse,
  OrderDetailResponse,
  OrderMutationResponse,
  OrderStatus,
  CreateOrderPayload,
} from './types';

// ─── Customer endpoints ──────────────────────────────────────────

/** GET /v1/orders/my-orders — Customer's own orders (paginated) */
export async function getMyOrders(
  params: FetchOrdersParams = {},
): Promise<OrdersListResponse> {
  const { data } = await apiClient.get<OrdersListResponse>(
    '/v1/orders/my-orders',
    { params },
  );
  return data;
}

/** GET /v1/orders/my-orders/:id — Customer's single order detail */
export async function getMyOrderById(id: string): Promise<OrderDetailResponse> {
  const { data } = await apiClient.get<OrderDetailResponse>(
    `/v1/orders/my-orders/${id}`,
  );
  return data;
}

// ─── Staff / Admin endpoints ─────────────────────────────────────

/** GET /v1/orders — All orders (paginated, filterable) */
export async function getAllOrders(
  params: FetchOrdersParams = {},
): Promise<OrdersListResponse> {
  const { data } = await apiClient.get<OrdersListResponse>('/v1/orders', {
    params,
  });
  return data;
}

/** GET /v1/orders/:id — Single order detail (Staff/Admin) */
export async function getOrderById(id: string): Promise<OrderDetailResponse> {
  const { data } = await apiClient.get<OrderDetailResponse>(
    `/v1/orders/${id}`,
  );
  return data;
}

/** POST /v1/orders — Create order (Staff/Admin), auto-creates customer */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderMutationResponse> {
  const { data } = await apiClient.post<OrderMutationResponse>(
    '/v1/orders',
    payload,
  );
  return data;
}

/** PATCH /v1/orders/:id/status — Update order status (Staff/Admin) */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderMutationResponse> {
  const { data } = await apiClient.patch<OrderMutationResponse>(
    `/v1/orders/${id}/status`,
    { status },
  );
  return data;
}
