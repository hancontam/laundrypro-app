import apiClient from "../../core/api/apiClient";
const AUTH_BASE = "/v1/users";
/**
 * POST /v1/users/check-login
 * Check login method for a phone number.
 * Returns { loginMethod: 'otp' | 'password' }
 */
export async function checkLogin(phone) {
    const { data } = await apiClient.post(`${AUTH_BASE}/check-login`, { phone });
    return data.data;
}
/**
 * POST /v1/users/login/otp
 * Login with Firebase OTP — send the Firebase idToken.
 * Sets auth cookies on the response.
 */
export async function loginWithOtp(idToken) {
    await apiClient.post(`${AUTH_BASE}/login/otp`, { idToken });
}
/**
 * POST /v1/users/login/password
 * Login with phone + password.
 * Sets auth cookies on the response.
 */
export async function loginWithPassword(payload) {
    await apiClient.post(`${AUTH_BASE}/login/password`, payload);
}
/**
 * POST /v1/users/password
 * Set password for the first time (requires auth).
 */
export async function setPassword(payload) {
    await apiClient.post(`${AUTH_BASE}/password`, payload);
}
/**
 * POST /v1/users/reset-password-otp
 * Reset password after Firebase OTP verification.
 */
export async function resetPasswordWithOtp(payload) {
    await apiClient.post(`${AUTH_BASE}/reset-password-otp`, payload);
}
/**
 * POST /v1/users/refresh-token
 */
export async function refreshToken() {
    await apiClient.post(`${AUTH_BASE}/refresh-token`);
}
/**
 * POST /v1/users/logout
 */
export async function logout() {
    await apiClient.post(`${AUTH_BASE}/logout`);
}
/**
 * GET /v1/users/profile
 */
export async function getProfile() {
    const { data } = await apiClient.get(`${AUTH_BASE}/profile`);
    return data.data;
}
