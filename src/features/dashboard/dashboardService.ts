import apiClient from "@/core/api/apiClient";
import { DashboardStats } from "./types";

const fetchDashboardStats = async (
  startDate?: string,
  endDate?: string
): Promise<any> => {
  const response = await apiClient.get<any>("/v1/orders/stats", {
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
