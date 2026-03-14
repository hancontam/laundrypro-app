export interface TopCustomer {
  _id: string; // customerId
  totalOrders: number;
  totalSpent: number;
  customer?: {
    _id: string;
    phone: string;
    name: string;
    address?: string;
  };
}

export interface DashboardStats {
  byStatus: {
    _id: string; // status
    count: number;
    totalRevenue: number;
  }[];
  revenue: {
    _id: null;
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
  };
  daily: {
    _id: string; // date 'YYYY-MM-DD'
    count: number;
    revenue: number;
  }[];
  topCustomers: TopCustomer[];
}

