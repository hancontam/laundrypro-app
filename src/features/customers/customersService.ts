// src/features/customers/customersService.ts
import apiClient from '@/services/apiClient';
import type {
  FetchCustomersParams,
  CustomerListResponse,
  CustomerDetailResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from './types';

export const customersService = {
  async getCustomers(params?: FetchCustomersParams): Promise<CustomerListResponse> {
    const response = await apiClient.get<CustomerListResponse>('/v1/users/customers', {
      params,
    });
    return response.data;
  },

  async getCustomerById(id: string): Promise<CustomerDetailResponse> {
    const response = await apiClient.get<CustomerDetailResponse>(`/v1/users/customers/${id}`);
    return response.data;
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<CustomerDetailResponse> {
    const response = await apiClient.post<CustomerDetailResponse>('/v1/users/customers', payload);
    return response.data;
  },

  async updateCustomer(payload: UpdateCustomerPayload): Promise<CustomerDetailResponse> {
    const { id, ...body } = payload;
    const response = await apiClient.put<CustomerDetailResponse>(`/v1/users/customers/${id}`, body);
    return response.data;
  },

  // Reuse the staff account deactivation endpoint since customers are also users
  async updateCustomerStatus(id: string, status: 'active' | 'suspended') {
    const response = await apiClient.patch(`/v1/users/users/${id}/status`, { status });
    return response.data;
  },
};
