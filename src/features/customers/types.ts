// src/features/customers/types.ts

export type CustomerStatus = 'active' | 'suspended';

export interface Customer {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  address?: string;
  note?: string;
  isVerified?: boolean;
  hasPassword?: boolean;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: PaginationData;
  };
}

export interface CustomerDetailResponse {
  success: boolean;
  data: Customer;
}

export interface CreateCustomerPayload {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  note?: string;
}

export interface UpdateCustomerPayload {
  id: string; // Used for URL, omitted from body
  name?: string;
  email?: string;
  address?: string;
  note?: string;
}

// Emulating normalized state shape for Redux Toolkit's createEntityAdapter
export interface CustomersState {
  // Provided by entityAdapter: ids: string[], entities: Record<string, Customer>
  selectedId: string | null;
  pagination: PaginationData;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}
