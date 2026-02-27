// src/features/profile/types.ts

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  address?: string;
  avatar?: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: any; // Mapped to UserProfile in authSlice
}
