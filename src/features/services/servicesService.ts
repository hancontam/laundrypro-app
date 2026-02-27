// src/features/services/servicesService.ts
// ─── API service layer — uses shared apiClient ───────────────────
// POST/PUT use multipart/form-data (supports image upload).
// No 410 handling — apiClient interceptor handles token refresh.

import apiClient from '@/services/apiClient';
import type {
  FetchServicesParams,
  ServicesListResponse,
  ServiceDetailResponse,
  ServiceMutationResponse,
  CategoriesResponse,
  CreateServicePayload,
  UpdateServicePayload,
} from './types';

// ─── Public endpoints ────────────────────────────────────────────

/** GET /v1/services — Public, filterable (no pagination) */
export async function getServices(
  params: FetchServicesParams = {},
): Promise<ServicesListResponse> {
  const { data } = await apiClient.get<ServicesListResponse>('/v1/services', {
    params,
  });
  return data;
}

/** GET /v1/services/categories — Public */
export async function getCategories(): Promise<CategoriesResponse> {
  const { data } = await apiClient.get<CategoriesResponse>(
    '/v1/services/categories',
  );
  return data;
}

/** GET /v1/services/:id — Public */
export async function getServiceById(
  id: string,
): Promise<ServiceDetailResponse> {
  const { data } = await apiClient.get<ServiceDetailResponse>(
    `/v1/services/${id}`,
  );
  return data;
}

// ─── Admin endpoints ─────────────────────────────────────────────

/** POST /v1/services — Admin, multipart/form-data */
export async function createService(
  payload: CreateServicePayload,
): Promise<ServiceMutationResponse> {
  const formData = buildFormData(payload);
  const { data } = await apiClient.post<ServiceMutationResponse>(
    '/v1/services',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/** PUT /v1/services/:id — Admin, multipart/form-data */
export async function updateService(
  id: string,
  payload: UpdateServicePayload,
): Promise<ServiceMutationResponse> {
  const formData = buildFormData(payload);
  const { data } = await apiClient.put<ServiceMutationResponse>(
    `/v1/services/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/** DELETE /v1/services/:id — Admin */
export async function deleteService(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(`/v1/services/${id}`);
  return data;
}

// ─── Helper ──────────────────────────────────────────────────────

function buildFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (key === 'image' && typeof value === 'object' && value.uri) {
      // React Native file object: { uri, type, name }
      fd.append('image', value as any);
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}
