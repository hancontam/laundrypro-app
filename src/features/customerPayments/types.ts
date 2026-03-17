// src/features/customerPayments/types.ts

export type PaymentMethod = "cash" | "momo" | "vnpay" | "bank";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  _id: string;
  orderId: string;
  orderCode?: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string | null;
  paidAt?: string | null;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// We derive Payment history from the Orders endpoint
export interface OrderWithPayment {
  _id: string;
  totalPrice: number;
  createdAt: string;
  status: string;
  payment: Payment | null;
}

export interface CustomerPaymentsState {
  paymentHistory: Payment[];
  selectedPayment: Payment | null;
  loading: boolean;
  updatingPaymentId: string | null;
  error: string | null;
}

export type PaymentHistoryScope = "my" | "all";
