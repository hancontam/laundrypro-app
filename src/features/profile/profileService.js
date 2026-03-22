import apiClient from "../../core/api/apiClient";
import { Platform } from "react-native";
export const profileService = {
    async updateProfile(payload) {
        const formData = new FormData();
        if (payload.name)
            formData.append("name", payload.name);
        if (payload.email)
            formData.append("email", payload.email);
        if (payload.address !== undefined)
            formData.append("address", payload.address);
        if (payload.avatar) {
            // Need to format correctly for React Native
            formData.append("avatar", {
                uri: Platform.OS === "android"
                    ? payload.avatar.uri
                    : payload.avatar.uri.replace("file://", ""),
                type: payload.avatar.type || "image/jpeg",
                name: payload.avatar.name || "avatar.jpg",
            });
        }
        const response = await apiClient.put("/v1/users/profile", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            transformRequest: (data) => data, // Prevent axios from stringifying FormData
        });
        return response.data;
    },
    async changePassword(payload) {
        const response = await apiClient.put("/v1/users/password", payload);
        return response.data;
    },
};
