// src/features/auth/types.ts

export type UserRole = 'customer' | 'staff' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type LoginMethod = 'otp' | 'password';

export interface User {
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

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  /** Login method returned from check-login: 'otp' | 'password' */
  loginMethod: LoginMethod | null;
  /** Phone number entered on LoginScreen, carried through the auth flow */
  phone: string | null;
}

// ─── API response shapes ────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CheckLoginData {
  loginMethod: LoginMethod;
  hasPassword: boolean;
  isVerified: boolean;
  role: UserRole;
}

export interface LoginData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface SetPasswordPayload {
  password: string;
  confirmPassword: string;
}

export interface LoginPasswordPayload {
  phone: string;
  password: string;
}
