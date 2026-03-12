// src/features/payments/types.ts
// ─── Payment types — Extracted from Swagger API docs ──────────────

export type PaymentMethod = "cash" | "momo" | "vnpay" | "bank";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  _id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequestPayload {
  orderId: string;
  method: PaymentMethod;
  amount: number;
  transactionRef?: string;
  markAsPaid?: boolean;
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface PaymentState {
  isCreating: boolean;
  error: string | null;
}
