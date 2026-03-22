import apiClient from "../../core/api/apiClient";
const CONTACT_BASE = "/v1/contacts";
/**
 * POST /v1/contacts
 * Send contact message (Public)
 */
export async function sendContactMessage(payload) {
    await apiClient.post(CONTACT_BASE, payload);
}
/**
 * GET /v1/contacts
 * Get all contact messages (Admin/Staff)
 */
export async function getContacts(page = 1, limit = 10) {
    const { data } = await apiClient.get(`${CONTACT_BASE}/admin`, {
        params: { page, limit },
    });
    // data is wrapped in { success: true, data: { contacts, pagination } }
    return data.data;
}
/**
 * PATCH /v1/contacts/admin/:id/status
 * Update contact status (Admin)
 */
export async function updateContactStatus(contactId, status) {
    const { data } = await apiClient.patch(`${CONTACT_BASE}/admin/${contactId}/status`, {
        status,
    });
    return data.data;
}
