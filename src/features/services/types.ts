// src/features/services/types.ts
// ─── Services types — Extracted from Swagger schema ──────────────

// ─── Entity ──────────────────────────────────────────────────────

export interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadImageFile {
  uri: string;
  type?: string;
  name?: string;
}

// ─── API params ──────────────────────────────────────────────────

export interface FetchServicesParams {
  active?: 'true' | 'false';
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** POST /v1/services — multipart/form-data, required: name, category, price, unit */
export interface CreateServicePayload {
  name: string;
  category: string;
  price: number;
  unit: string;
  active?: boolean;
  image?: UploadImageFile;
  imageUrl?: string;
}

/** PUT /v1/services/:id — multipart/form-data, all optional */
export interface UpdateServicePayload {
  name?: string;
  category?: string;
  price?: number;
  unit?: string;
  active?: boolean;
  image?: UploadImageFile;
  imageUrl?: string;
  removeImage?: boolean;
}

// ─── API response shapes ─────────────────────────────────────────

export interface ServicesListResponse {
  success: boolean;
  data: Service[];
}

export interface ServiceDetailResponse {
  success: boolean;
  data: Service;
}

export interface ServiceMutationResponse {
  success: boolean;
  message: string;
  data: Service;
}

export interface CategoriesResponse {
  success: boolean;
  data: string[];
}

// ─── Redux state ─────────────────────────────────────────────────

export interface ServicesState {
  list: Service[];
  categories: string[];
  selectedService: Service | null;
  isLoading: boolean;
  error: string | null;
}
