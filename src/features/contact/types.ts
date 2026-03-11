// src/features/contact/types.ts

export interface CreateContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
  updatedAt: string;
}

export interface ContactPaginationResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
