// src/features/contact/contactService.ts
import apiClient from "../../core/api/apiClient";
import type { CreateContactPayload, ContactPaginationResponse } from "./types";

const CONTACT_BASE = "/v1/contacts";

/**
 * POST /v1/contacts
 * Send contact message (Public)
 */
export async function sendContactMessage(
  payload: CreateContactPayload,
): Promise<void> {
  await apiClient.post(CONTACT_BASE, payload);
}

/**
 * GET /v1/contacts
 * Get all contact messages (Admin/Staff)
 */
export async function getContacts(
  page: number = 1,
  limit: number = 10,
): Promise<ContactPaginationResponse> {
  const { data } = await apiClient.get<any>(`${CONTACT_BASE}/admin`, {
    params: { page, limit },
  });
  // data is wrapped in { success: true, data: { contacts, pagination } }
  return data.data;
}
