// ─── API service layer — uses shared apiClient ───────────────────
// POST/PUT use multipart/form-data (supports image upload).
// No 410 handling — apiClient interceptor handles token refresh.
import apiClient from "../../core/api/apiClient";
import { Platform } from "react-native";
// ─── Public endpoints ────────────────────────────────────────────
/** GET /v1/services — Public, filterable (no pagination) */
export async function getServices(params = {}) {
    const { data } = await apiClient.get("/v1/services", {
        params,
    });
    return data;
}
/** GET /v1/services/categories — Public */
export async function getCategories() {
    const { data } = await apiClient.get("/v1/services/categories");
    return data;
}
/** GET /v1/services/:id — Public */
export async function getServiceById(id) {
    const { data } = await apiClient.get(`/v1/services/${id}`);
    return data;
}
// ─── Admin endpoints ─────────────────────────────────────────────
/** POST /v1/services — Admin, multipart/form-data */
export async function createService(payload) {
    const formData = await buildFormData(payload);
    const { data } = await apiClient.post("/v1/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
    });
    return data;
}
/** PUT /v1/services/:id — Admin, multipart/form-data */
export async function updateService(id, payload) {
    const formData = await buildFormData(payload);
    const { data } = await apiClient.put(`/v1/services/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
    });
    return data;
}
/** DELETE /v1/services/:id — Admin */
export async function deleteService(id) {
    const { data } = await apiClient.delete(`/v1/services/${id}`);
    return data;
}
// ─── Helper ──────────────────────────────────────────────────────
async function buildFormData(payload) {
    const fd = new FormData();
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null)
            continue;
        if (key === "image" && typeof value === "object" && value.uri) {
            fd.append("image", {
                uri: Platform.OS === "android" ? value.uri : value.uri.replace("file://", ""),
                type: value.type || "image/jpeg",
                name: value.name || "service-image.jpg",
            });
        }
        else if (key === "imageUrl" && typeof value === "string" && value.trim()) {
            const response = await fetch(value.trim());
            if (!response.ok) {
                throw new Error("Không thể tải ảnh từ URL đã nhập");
            }
            const blob = await response.blob();
            const filenameFromUrl = value.split("/").pop()?.split("?")[0];
            const extensionFromType = blob.type?.split("/")[1] || "jpg";
            const filename = filenameFromUrl || `service-image.${extensionFromType}`;
            fd.append("image", blob, filename);
        }
        else {
            fd.append(key, String(value));
        }
    }
    return fd;
}
