import axios from "axios";
import type {
  Event,
  CustomerOrder,
  AdminOrder,
  AdminEvent,
  AdminTicket,
  PaginatedResponse,
  AuthResponse,
  User,
} from "../types";

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  startDate?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceRange?: [number, number];
  location?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 Unauthorized and 403 Forbidden
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Không tự động logout nếu đang ở trang profile và endpoint là change-password
      const isChangePasswordRequest = error.config?.url?.includes(
        "/auth/change-password",
      );

      // Chỉ tự động logout nếu không phải là change-password hoặc không ở profile page
      if (!isChangePasswordRequest && window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      // Điều hướng đến trang 403 Forbidden
      window.location.href = "/forbidden";
    }

    return Promise.reject(error);
  },
);

export const authService = {
  login: async (
    identifier: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", { identifier, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // Lấy thông tin profile hiện tại
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Cập nhật thông tin (Tên, SDT,...)
  updateProfile: async (id: number, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    console.log("API changePassword called with:", data);
    const response = await api.patch(`/auth/change-password`, data);
    console.log("API changePassword response:", response);
    return response.data;
  },
  // Upload avatar
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  // Xóa tài khoản
  deleteAccount: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export const eventService = {
  // Public
  getAll: async (
    params: GetEventsParams = {},
  ): Promise<PaginatedResponse<Event>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page?.toString() || "1");
    queryParams.append("limit", params.limit?.toString() || "9");
    if (params.search) queryParams.append("search", params.search);
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.status) queryParams.append("status", params.status);
    if (params.dateFrom) queryParams.append("startDate", params.dateFrom);
    if (params.dateTo) queryParams.append("endDate", params.dateTo);
    if (params?.priceRange) {
      queryParams.append("minPrice", params.priceRange[0].toString());
      queryParams.append("maxPrice", params.priceRange[1].toString());
    }
    if (params?.location) {
      queryParams.append("location", params.location);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append("sortOrder", params.sortOrder);
    }

    console.log(params.priceRange?.[0], params.priceRange?.[1]);
    const response = await api.get(`/events?${queryParams.toString()}`);
    return response.data;
  },

  getOne: (id: number) => api.get(`/events/${id}`),

  getById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Organizer Only
  getMyEvents: async (
    params: GetEventsParams = {},
  ): Promise<PaginatedResponse<Event>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.categoryId)
      query.append("categoryId", params.categoryId.toString());
    if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params?.dateTo) query.append("dateTo", params.dateTo);
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/events/my-events${suffix}`);
    return response.data;
  },
  create: (data: FormData) => api.post("/events", data),
  update: (id: number, data: FormData) => api.patch(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  submit: (id: number) => api.put(`/events/${id}/submit`),
  cancel: (id: number) => api.put(`/events/${id}/cancel`),

  // Admin Only
  getAllForAdmin: async (
    params: GetEventsParams = {},
  ): Promise<PaginatedResponse<AdminEvent>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page?.toString() || "1");
    queryParams.append("limit", params.limit?.toString() || "9");
    if (params.search) queryParams.append("search", params.search);
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.status) queryParams.append("status", params.status);
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);
    const response = await api.get(`/events/admin?${queryParams.toString()}`);
    return response.data;
  },

  getPendingCount: async () => {
    const response = await api.get("/events/admin?status=Pending&limit=1");
    return response.data.meta.itemCount;
  },

  approve: (id: number, note: string) =>
    api.put(`/events/${id}/approve`, { note }),
  reject: (id: number, reason: string) =>
    api.put(`/events/${id}/reject`, { reason }),

  // Nếu có API thống kê riêng cho Admin
  getAdminStats: () => api.get("/stats/admin"),
};

export const orderService = {
  createOrder: async (
    eventId: number,
    items: { ticketTypeId: number; quantity: number }[],
  ) => {
    const response = await api.post("/orders", { eventId, items });
    return response.data;
  },
  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<PaginatedResponse<CustomerOrder>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/orders${suffix}`);
    return response.data;
  },
  getOrderById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  confirmPayment: (
    orderId: number,
    purchaserInfo?: {
      purchaserName?: string;
      purchaserEmail?: string;
      purchaserPhone?: string;
    },
  ) => {
    return api.post(`/orders/${orderId}/confirm`, purchaserInfo);
  },

  cancelOrder: (orderId: number) => {
    return api.post(`/orders/${orderId}/cancel`);
  },

  // Admin - Lấy tất cả orders
  getAllForAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<AdminOrder>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params?.dateTo) query.append("dateTo", params.dateTo);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/orders/admin/all${suffix}`);
    return response.data;
  },
};

export const paymentService = {
  createVNPayPayment: (
    orderId: number,
    amount: number,
    purchaserInfo?: {
      fullName?: string;
      email?: string;
      phone?: string;
    },
    returnUrl?: string,
  ) => {
    return api.post("/payment/vnpay/create", {
      orderId,
      amount,
      purchaserName: purchaserInfo?.fullName,
      purchaserEmail: purchaserInfo?.email,
      purchaserPhone: purchaserInfo?.phone,
      returnUrl,
    });
  },
};

export const organizerBankService = {
  create: (data: any) => api.post("/organizer-banks", data),
  update: (id: number, data: any) => api.patch(`/organizer-banks/${id}`, data),
  getAll: () => api.get("/organizer-banks"),
};

export const categoryService = {
  getAll: () => api.get("/event-categories"),
};

export const statsService = {
  getOrganizerStats: async () => {
    const response = await api.get("/stats/organizer");
    return response.data;
  },
  getOrganizerRevenueChart: async () => {
    const response = await api.get("/stats/organizer/revenue-chart");
    return response.data;
  },
  getAdminStats: async () => {
    const response = await api.get("/stats/admin");
    return response.data;
  },
  getAdminRevenueChart: async (dateFrom?: Date, dateTo?: Date) => {
    let query = "";
    if (dateFrom && dateTo) {
      // Convert Date object sang ISO string (YYYY-MM-DD)
      const fromStr = dateFrom.toISOString().split("T")[0];
      const toStr = dateTo.toISOString().split("T")[0];
      query = `?dateFrom=${fromStr}&dateTo=${toStr}`;
    }
    const response = await api.get(`/stats/admin/revenue-chart${query}`);
    return response.data;
  },
  getAdminOrderStatusStats: async () => {
    const response = await api.get("/stats/admin/order-status");
    return response.data;
  },
  getRecentTransactions: async (limit = 5) => {
    const response = await api.get(
      `/stats/admin/recent-transactions?limit=${limit}`,
    );
    return response.data;
  },
  getOrganizerTopEvents: async (limit = 5) => {
    const response = await api.get(
      `/stats/organizer/top-events?limit=${limit}`,
    );
    return response.data;
  },
  getOrganizerNextEvent: async () => {
    const response = await api.get("/stats/organizer/next-event");
    return response.data;
  },
  getOrganizerEventPerformance: async () => {
    const response = await api.get("/stats/organizer/event-performance");
    return response.data;
  },
  getOrganizerEventComparison: async () => {
    const response = await api.get("/stats/organizer/event-comparison");
    return response.data;
  },
  getOrganizerLoyalCustomers: async (limit = 5) => {
    const response = await api.get(
      `/stats/organizer/loyal-customers?limit=${limit}`,
    );
    return response.data;
  },
  getTopEvents: async (limit = 5) => {
    const response = await api.get(`/stats/admin/top-events?limit=${limit}`);
    return response.data;
  },
  getLoyalCustomers: async (limit = 5) => {
    const response = await api.get(
      `/stats/admin/loyal-customers?limit=${limit}`,
    );
    return response.data;
  },
};

export const userService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<PaginatedResponse<User>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.role) query.append("role", params.role);
    if (params?.status) query.append("status", params.status);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/users${suffix}`);
    return response.data;
  },
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  softDeleteUser: (id: number) => api.delete(`/users/${id}/soft`),
  blockUser: (id: number) => api.patch(`/users/${id}/block`),
  unblockUser: (id: number) => api.patch(`/users/${id}/unblock`),
  updateUserStatus: (id: number, status: string) =>
    api.patch(`/users/${id}/status`, { status }),
  createUser: (userData: any) => api.post("/users", userData),
};

export const ticketService = {
  // Organizer Check-in
  checkIn: (code: string) => api.post("/tickets/check-in", { code }),

  // Customer - Lấy QR code cho ticket
  getQRCode: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}/qrcode`);
    return response.data;
  },

  // Customer - Lấy tất cả tickets đã thanh toán của user (có phân trang/lọc/tìm kiếm/sắp xếp)
  getMyTickets: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<PaginatedResponse<any>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.sortBy) query.append("sortBy", params.sortBy);
    if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/tickets/my-tickets${suffix}`);
    return response.data;
  },

  // Admin - Lấy tất cả tickets
  getAllForAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    eventId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<AdminTicket>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);
    if (params?.eventId) query.append("eventId", params.eventId);
    if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
    if (params?.dateTo) query.append("dateTo", params.dateTo);

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/tickets/admin/all${suffix}`);
    return response.data;
  },
};

export const ticketTypeService = {
  // Hàm tạo loại vé cho một sự kiện cụ thể
  create: (data: any) => api.post("/ticket-types", data),

  // Hàm cập nhật loại vé (nếu cần sau này)
  update: (id: number, data: any) => api.patch(`/ticket-types/${id}`, data),

  // Xóa loại vé
  delete: (id: number) => api.delete(`/ticket-types/${id}`),
};

export const fileService = {
  // Nếu backend tách riêng upload ảnh
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData);
  },
};

export default api;
