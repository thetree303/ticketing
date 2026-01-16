import api from "./api";
import type { Event, PaginatedResponse, AdminEvent } from "../types";

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  startDate?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export const eventService = {
  getAll: async (
    params: GetEventsParams = {},
  ): Promise<PaginatedResponse<Event>> => {
    const { page = 1, limit = 9, search, categoryId, startDate } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (categoryId) queryParams.append("categoryId", categoryId.toString());
    if (startDate) queryParams.append("startDate", startDate);

    const response = await api.get(`/events?${queryParams.toString()}`);
    return response.data;
  },

  getById: async (id: string | number): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  getMyEvents: async (
    params?: GetEventsParams,
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

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/events/my-events${suffix}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Event> => {
    const response = await api.post("/events", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: number, data: FormData): Promise<Event> => {
    const response = await api.patch(`/events/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  submit: async (id: number): Promise<Event> => {
    const response = await api.put(`/events/${id}/submit`);
    return response.data;
  },

  cancel: async (id: number): Promise<Event> => {
    const response = await api.put(`/events/${id}/cancel`);
    return response.data;
  },

  // Admin endpoints
  getAllForAdmin: async (
    params: GetEventsParams = {},
  ): Promise<PaginatedResponse<AdminEvent>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
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

  getPendingCount: async (): Promise<number> => {
    const response = await api.get("/events/admin?status=Pending&limit=1");
    return response.data.meta.itemCount;
  },

  approve: async (id: number, note: string): Promise<Event> => {
    const response = await api.put(`/events/${id}/approve`, { note });
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<Event> => {
    const response = await api.put(`/events/${id}/reject`, { reason });
    return response.data;
  },
};
