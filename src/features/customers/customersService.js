import apiClient from "../../core/api/apiClient";
export const customersService = {
    async getCustomers(params) {
        const response = await apiClient.get("/v1/users/customers", {
            params,
        });
        return response.data;
    },
    async getCustomerById(id) {
        const response = await apiClient.get(`/v1/users/customers/${id}`);
        return response.data;
    },
    async createCustomer(payload) {
        const response = await apiClient.post("/v1/users/customers", payload);
        return response.data;
    },
    async updateCustomer(payload) {
        const { id, ...body } = payload;
        const response = await apiClient.put(`/v1/users/customers/${id}`, body);
        return response.data;
    },
    // Reuse the staff account deactivation endpoint since customers are also users
    async updateCustomerStatus(id, status) {
        const response = await apiClient.patch(`/v1/users/users/${id}/status`, {
            status,
        });
        return response.data;
    },
    /**
     * Search customers by phone or name (Staff/Admin)
     * Used for auto-suggest in CreateOrderScreen
     */
    async searchCustomers(query) {
        const response = await apiClient.get("/v1/users/customers", { params: { search: query, limit: 5 } });
        return response.data;
    },
};
