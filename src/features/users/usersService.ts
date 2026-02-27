// src/features/users/usersService.ts
// ─── API service layer for Users (Admin only) ────────────────────
// No 410 handling — apiClient interceptor handles token refresh.

import apiClient from '@/services/apiClient';
import type {
  FetchUsersParams,
  UsersListResponse,
  UserDetailResponse,
  UserMutationResponse,
  CreateStaffPayload,
  UserStatus,
} from './types';

/** GET /v1/users/users — All users (Admin, paginated) */
export async function getUsers(
  params: FetchUsersParams = {},
): Promise<UsersListResponse> {
  const { data } = await apiClient.get<UsersListResponse>(
    '/v1/users/users',
    { params },
  );
  return data;
}

/** GET /v1/users/users/:id — User detail (Admin) */
export async function getUserById(
  id: string,
): Promise<UserDetailResponse> {
  const { data } = await apiClient.get<UserDetailResponse>(
    `/v1/users/users/${id}`,
  );
  return data;
}

/** POST /v1/users/users/staff — Create staff (Admin) */
export async function createStaff(
  payload: CreateStaffPayload,
): Promise<UserMutationResponse> {
  const { data } = await apiClient.post<UserMutationResponse>(
    '/v1/users/users/staff',
    payload,
  );
  return data;
}

/** PATCH /v1/users/users/:id/status — Update user status (Admin) */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<UserMutationResponse> {
  const { data } = await apiClient.patch<UserMutationResponse>(
    `/v1/users/users/${id}/status`,
    { status },
  );
  return data;
}
