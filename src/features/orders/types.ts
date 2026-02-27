// src/features/orders/types.ts
// ─── Orders types — Extracted from Swagger schema ────────────────

// ─── Enums (from Swagger) ────────────────────────────────────────

export type OrderStatus = 'pending' | 'completed';

export type PaymentMethod = 'cash' | 'momo' | 'vnpay' | 'bank';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// ─── Entities ────────────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  orderId: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  servicePrice: number;
  serviceUnit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface OrderCustomer {
  _id: string;
  phone: string;
  name?: string;
  address?: string;
  email?: string;
  isVerified?: boolean;
  hasPassword?: boolean;
}

export interface OrderCreatedBy {
  _id: string;
  phone: string;
  name?: string;
}

export interface Order {
  _id: string;
  customerId: OrderCustomer;
  createdBy: OrderCreatedBy;
  status: OrderStatus;
  completedAt?: string | null;
  totalPrice: number;
  payment: Payment | null;
  orderItems: OrderItem[];
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Pagination ──────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── API params ──────────────────────────────────────────────────

export interface FetchOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  // Staff/Admin filters
  customerId?: string;
  createdBy?: string;
  customerPhone?: string;
  startDate?: string;
  endDate?: string;
}

/** POST /v1/orders — Staff/Admin, creates customer if not exists */
export interface CreateOrderItemPayload {
  serviceId: string;
  quantity: number;
  unitPrice?: number;
  note?: string;
}

export interface CreateOrderPayload {
  customerPhone: string;
  customerName: string;
  customerAddress?: string;
  items: CreateOrderItemPayload[];
  note?: string;
}

// ─── API response shapes ─────────────────────────────────────────

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: Pagination;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

export interface OrderMutationResponse {
  success: boolean;
  message: string;
  data: Order;
}

// ─── Redux state ─────────────────────────────────────────────────

export interface OrdersState {
  list: Order[];
  selectedOrder: Order | null;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}
