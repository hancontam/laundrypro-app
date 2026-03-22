import apiClient from "@/core/api/apiClient";
const fetchDashboardStats = async (startDate, endDate) => {
    const response = await apiClient.get("/v1/orders/stats", {
        params: { startDate, endDate },
    });
    // If the backend wraps the response in a `data` object, unwrap it
    if (response.data && response.data.data) {
        return response.data.data;
    }
    return response.data;
};
export const dashboardService = {
    fetchDashboardStats,
};
