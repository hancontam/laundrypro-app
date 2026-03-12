// src/features/payments/paymentService.ts
import apiClient from "../../core/api/apiClient";
import type { PaymentRequestPayload, CreatePaymentResponse } from "./types";

// ─── Payment endpoints ──────────────────────────────────────────

/** POST /v1/payments — Create payment (Staff/Admin) */
export async function createPaymentRequest(
  payload: PaymentRequestPayload,
): Promise<CreatePaymentResponse> {
  const { data } = await apiClient.post<CreatePaymentResponse>(
    "/v1/payments",
    payload,
  );
  return data;
}

// NOTE: Updating order status is already handled in src/features/orders/ordersService.ts
