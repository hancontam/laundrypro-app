// src/features/users/types.ts
// ─── Users types — Extracted from Swagger schema ─────────────────

export type UserRole = 'customer' | 'staff' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  _id: string;
  phone: string;
  firebaseUid?: string;
  email?: string;
  name?: string;
  role: UserRole;
  address?: string;
  avatar?: string;
  isVerified: boolean;
  hasPassword: boolean;
  status: UserStatus;
  note?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API params ──────────────────────────────────────────────────

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

/** POST /v1/users/users/staff — required: phone, name */
export interface CreateStaffPayload {
  phone: string;
  name: string;
  email?: string;
}

// ─── Pagination ──────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── API response shapes ─────────────────────────────────────────

export interface UsersListResponse {
  success: boolean;
  data: {
    users: UserProfile[];
    pagination: Pagination;
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: UserProfile;
}

export interface UserMutationResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

// ─── Redux state ─────────────────────────────────────────────────

export interface UsersState {
  list: UserProfile[];
  selectedUser: UserProfile | null;
  pagination: Pagination;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}
